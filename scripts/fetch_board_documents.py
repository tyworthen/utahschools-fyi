"""Download financial attachments from Tooele County School District board meetings.

Source: the district's public Diligent Community (HighBond) portal,
https://tooele-schools.community.highbond.com/. Each meeting's agenda and minutes are served as
HTML by the portal's JSON service; attachments are links of the form /document/<uuid>. This
script walks every meeting ID, lists every attachment, keeps those whose file names look
financial (budgets, monthly revenue/expenditure/disbursement reports, financial statements,
audits, tax rates and Truth in Taxation, bonds, capital outlay, fees, salary schedules,
procurement awards), and downloads them.

Outputs (private_data/ is git-ignored; files have not been reviewed for personal information):
  private_data/board_documents/inventory.csv    every attachment on the portal
  private_data/board_documents/manifest.csv     the financial subset, with sha256 per file
  private_data/board_documents/files/<YYYY-MM-DD> <meeting>/<file name>

Re-running skips files already downloaded. Run: python3 scripts/fetch_board_documents.py
"""
import concurrent.futures, csv, datetime, hashlib, html, json, os, re, sys, urllib.request

BASE = "https://tooele-schools.community.highbond.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "private_data", "board_documents")
MAX_ID = 700  # meeting IDs are sequential; highest seen 2026-10-31 was 506

FINANCIAL = re.compile(r"(?i)budget|financ|expenditure|expense|revenue|disburs|\baudit|ACFR|CAFR|\btax|levy|"
                       r"\bbonds?\b|\bdebt|capital (outlay|project)|fund balance|salar|pay (scale|schedule)|"
                       r"compensation|negotiat|\bfees?\b|treasur|investment|PTIF|appropriat|fiscal|surplus|"
                       r"\bTNT\b|truth in taxation|\b[AP]FR\b|purchase card|fraud.risk|mid.?year|per pupil|"
                       r"\bcosts?\b|cost (estimate|analysis|avoidance|comparison|savings)|funding|allocation|"
                       r"estimate|price|quote|\bbids?\b|\bRFP|\bIFB|\bRFQ|award (recommendation|justification|"
                       r"statement|letter|bid)|bid award|score ?(card|sheet)|transparency|"
                       r"\bcontract|construction|land purchase|purchase contract|state aid|\bWPU|HB120|cash ?flow|"
                       r"business administrator|\bBA report|board update|capital improvements plan")
EXCLUDE = re.compile(r"(?i)\.(mp3|mp4|m4a|wav|jpe?g|png)$|\bpolic(y|ies)\b|template|personnel|"
                     r"trust ?lands?|land trust|\bSLT\b|TSSA|90.day plan|semester plans|improvement plans|"
                     r"construction photos|board report construction")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; public records)"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read(), r.headers
        except Exception:
            if attempt == 2: raise


def meeting(i):
    meta = json.loads(get(f"{BASE}/Services/MeetingsService.svc/meetings/{i}/meetingData")[0])
    if not meta.get("Name"): return []
    docs = json.loads(get(f"{BASE}/Services/MeetingsService.svc/meetings/{i}/meetingDocuments")[0])
    name = re.sub(r"\s+", " ", meta["Name"]).strip()
    m = re.search(r"(\w{3}) (\d{2}) (\d{4})$", name)
    date = datetime.datetime.strptime(" ".join(m.groups()), "%b %d %Y").date().isoformat() if m else ""
    found = {}
    for doc in docs.get("Documents", []):
        part = {1: "agenda", 2: "minutes"}.get(doc["Type"], str(doc["Type"]))
        for doc_id, text in re.findall(r'href="/document/([0-9a-f-]{36})"[^>]*>(.*?)</a>', doc.get("Html") or "", re.S):
            text = html.unescape(re.sub(r"<[^>]+>", "", text)).strip()
            sz = re.match(r"(.*?)\s*\(([\d,]+) KB\)$", text)
            fname, kb = (sz.group(1), sz.group(2).replace(",", "")) if sz else (text, "")
            row = found.setdefault(doc_id, {"meeting_id": i, "meeting_date": date, "meeting": name, "in": set(),
                                            "doc_id": doc_id, "file_name": fname, "listed_kb": kb})
            row["in"].add(part)
    for row in found.values(): row["in"] = "+".join(sorted(row["in"]))
    return list(found.values())


def safe(s):
    return re.sub(r'[\\/:*?"<>|\x00-\x1f]', "_", s).strip(" .")[:150]


def download(row):
    folder = os.path.join(OUT, "files", safe(f"{row['meeting_date']} {row['meeting']}"))
    path = os.path.join(folder, safe(row["file_name"]) or row["doc_id"])
    if os.path.exists(path + ".html"): path += ".html"
    if not os.path.exists(path):
        body, headers = get(f"{BASE}/document/{row['doc_id']}")
        # The portal serves Word/Excel attachments only as HTML renderings; name them so they open.
        if "text/html" in headers.get("Content-Type", "") and not path.lower().endswith((".html", ".htm")):
            path += ".html"
        os.makedirs(folder, exist_ok=True)
        with open(path + ".part", "wb") as f: f.write(body)
        os.replace(path + ".part", path)
    data = open(path, "rb").read()
    return {**row, "path": os.path.relpath(path, OUT), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}


def write_csv(path, rows):
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader(); w.writerows(rows)


def main():
    os.makedirs(OUT, exist_ok=True)
    with concurrent.futures.ThreadPoolExecutor(8) as ex:
        rows = [r for rs in ex.map(meeting, range(1, MAX_ID + 1)) for r in rs]
    rows.sort(key=lambda r: (r["meeting_date"], r["meeting_id"], r["file_name"]))
    write_csv(os.path.join(OUT, "inventory.csv"), rows)
    fin = [r for r in rows if FINANCIAL.search(r["file_name"]) and not EXCLUDE.search(r["file_name"])]
    print(f"{len(rows)} attachments in {len({r['meeting_id'] for r in rows})} meetings; {len(fin)} financial",
          file=sys.stderr)
    with concurrent.futures.ThreadPoolExecutor(6) as ex:
        done = list(ex.map(download, fin))
    today = datetime.date.today().isoformat()
    for r in done:
        r.update(url=f"{BASE}/document/{r['doc_id']}", retrieved=today)
    write_csv(os.path.join(OUT, "manifest.csv"), done)
    print(f"downloaded {len(done)} files, {sum(r['bytes'] for r in done) / 1e6:.0f} MB", file=sys.stderr)


if __name__ == "__main__":
    main()
