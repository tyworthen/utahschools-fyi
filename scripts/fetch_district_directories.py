"""Download public staff directories from district websites, to cross-check job roles in pay data.

Sources (Finalsite "constituent" directories; paging only works when the search fields are present):
  tooele  https://www.tooeleschools.org/about-us/district-directory   district-level staff only (~317)
  cache   https://www.ccsdut.org/directory                            all staff, incl. teachers (~4,250)
Iron (irondistrict.org) and Box Elder (besd.net) serve a bot challenge instead of pages, so they are
not downloaded.

Outputs (private_data/ is git-ignored; directories list employees by name):
  private_data/district_directories/<district>/pages/p<N>.html   pages as served
  private_data/district_directories/<district>/directory.csv     constituent_id, name, titles, locations, departments

Re-running skips pages already downloaded. Run: python3 scripts/fetch_district_directories.py [district ...]
"""
import csv, html, os, re, string, sys, time, urllib.request

SITES = {
    "tooele": "https://www.tooeleschools.org/about-us/district-directory",
    "cache": "https://www.ccsdut.org/directory",
}
QUERY = "const_search_group_ids=&const_search_role_ids=&const_search_keyword=&const_search_first_name=&const_search_last_name="
CAP = 2400
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "private_data", "district_directories")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; public records)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "ignore")


def text(fragment):
    t = html.unescape(re.sub(r"<[^>]+>", "\n", fragment))
    return [l.strip() for l in t.split("\n") if l.strip() and not l.strip().endswith(":")]


def parse(page):
    # Each entry is <div class="fsConstituentItem" data-constituent-id=N> holding an fsFullName heading and
    # optional fsTitles / fsLocations / fsDepartments blocks.
    people = []
    for m in re.finditer(r'<div class="fsConstituentItem[^"]*" data-constituent-id="(\d+)">(.*?)(?=<div class="fsConstituentItem|<div class="fsPagination|$)', page, flags=re.S):
        block, p = m.group(2), {"id": m.group(1)}
        name = re.search(r'class="fsFullName">(.*?)</h3>', block, flags=re.S)
        p["name"] = " ".join(text(name.group(1))) if name else ""
        for field, cls in (("titles", "fsTitles"), ("locations", "fsLocations"), ("departments", "fsDepartments")):
            f = re.search(rf'<div class="{cls}">(.*?)</div>', block, flags=re.S)
            p[field] = text(f.group(1)) if f else []
        people.append(p)
    return people


def fetch(url, path):
    if not os.path.exists(path):
        open(path, "w").write(get(url))
        time.sleep(1)
    return open(path).read()


def count(page):
    m = re.search(r"showing (\d+) - (\d+) of (\d+)", page)
    return (int(m.group(2)), int(m.group(3))) if m else (1, 0)


for name in sys.argv[1:] or SITES:
    base, d = SITES[name], os.path.join(OUT, name)
    per, total = count(get(f"{base}?const_page=1&{QUERY}"))
    # Finalsite stops paging after about 2,500 results ("Refine your search"), so large directories are
    # walked one last-name initial at a time.
    groups = [""] if total <= CAP else list(string.ascii_uppercase)
    rows = []
    for g in groups:
        os.makedirs(os.path.join(d, "pages", g), exist_ok=True)
        url = f"{base}?const_page={{}}&{QUERY}{g}"
        per_g, n_g = count(fetch(url.format(1), os.path.join(d, "pages", g, "p1.html")))
        for n in range(1, -(-n_g // per_g) + 1):
            rows += parse(fetch(url.format(n), os.path.join(d, "pages", g, f"p{n}.html")))
        print(f"{name}: {g or 'all'} {n_g} listed, {len(rows)} parsed so far", flush=True)
    seen, out = set(), []
    for p in rows:
        if p["id"] not in seen:
            seen.add(p["id"])
            out.append((p["id"], p["name"], "; ".join(p["titles"]), "; ".join(p["locations"]), "; ".join(p["departments"])))
    with open(os.path.join(d, "directory.csv"), "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["constituent_id", "name", "titles", "locations", "departments"])
        w.writerows(out)
    print(f"{name}: {len(out)} people (site reports {total})", flush=True)
