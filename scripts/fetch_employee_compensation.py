"""Download all-employee compensation for every Utah school district from Transparent Utah.

Source: the State Auditor's Compensation Downloader, https://transparent.utah.gov/entities/compensation-downloader
The page is a front end for two public endpoints, found in its JavaScript bundle:
  entity/year list   <API>/?function=getAvailableEntitiesByYearPY&parameter={}
  one entity-year    <API>/?function=getEntityCompensation&parameter={"entity_name":"<id>","fiscal_year":"<yyyy>"}
  large entities     https://storage.googleapis.com/tu-large-entity-data-response-bucket/entity_compensation/<id>/<yyyy>.json
                     (the page uses the bucket for entity IDs in LARGE; Alpine, Canyons, Davis, Granite,
                     Jordan, Nebo, and Washington among districts)
Each record is one pay line for one employee: entity_name, fiscal_year, fund1-4, org1-4 (school or
department), cat1-4 (salary/benefit account, e.g. 131 Salaries - Teachers), description, employee_name,
title, net_amount. Covers every employee, not only teachers.

Outputs (private_data/ is git-ignored; files list employees by name):
  private_data/transparent_utah/employee_compensation/entities.json   entity/year list as served
  private_data/transparent_utah/employee_compensation/<entity_id>/<yyyy>.json.gz   records as served
  private_data/transparent_utah/employee_compensation/manifest.csv    one row per file, with sha256

Re-running skips files already downloaded. Run: python3 scripts/fetch_employee_compensation.py
"""
import csv, datetime, gzip, hashlib, json, os, time, urllib.error, urllib.parse, urllib.request

API = "https://tu-query-handler-prod-778714388561.us-west3.run.app/"
BUCKET = "https://storage.googleapis.com/tu-large-entity-data-response-bucket/entity_compensation/"
LARGE = {259, 45, 207, 57, 35, 73, 17, 331, 1, 3, 5, 263}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "private_data", "transparent_utah", "employee_compensation")


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; public records)"})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if attempt == 3:
                raise
            time.sleep(5 * (attempt + 1))
        except Exception:
            if attempt == 3:
                raise
            time.sleep(5 * (attempt + 1))


os.makedirs(OUT, exist_ok=True)
raw = get(API + "?function=getAvailableEntitiesByYearPY&parameter=%7B%7D")
open(os.path.join(OUT, "entities.json"), "wb").write(raw)
pairs = sorted({(e["entity_id"], e["entity_name"], int(e["fiscal_year"])) for e in json.loads(raw)
                if "school district" in str(e.get("entity_name", "")).lower()})

manifest_path = os.path.join(OUT, "manifest.csv")
done, missing = {}, []
if os.path.exists(manifest_path):
    done = {r["file"]: r for r in csv.DictReader(open(manifest_path))}
for eid, name, fy in pairs:
    rel = f"{eid}/{fy}.json.gz"
    path = os.path.join(OUT, rel)
    if rel in done and os.path.exists(path):
        continue
    if eid in LARGE:
        url = f"{BUCKET}{eid}/{fy}.json"
    else:
        param = urllib.parse.quote(json.dumps({"entity_name": str(eid), "fiscal_year": str(fy)}))
        url = f"{API}?function=getEntityCompensation&parameter={param}"
    body = get(url)
    if body is None:                      # listed as available but not published (e.g. Jordan FY2014)
        missing.append(f"{name} FY{fy}")
        print(f"{name} FY{fy}: not found at {url}", flush=True)
        continue
    records = len(json.loads(body))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with gzip.open(path, "wb") as fh:
        fh.write(body)
    done[rel] = {"file": rel, "entity_id": eid, "entity_name": name, "fiscal_year": fy, "records": records,
                 "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(), "url": url,
                 "retrieved": datetime.date.today().isoformat()}
    print(f"{name} FY{fy}: {records} records", flush=True)
    with open(manifest_path, "w", newline="") as fh:
        w = csv.DictWriter(fh, list(next(iter(done.values())).keys()))
        w.writeheader()
        w.writerows(sorted(done.values(), key=lambda r: (r["entity_name"], int(r["fiscal_year"]))))
    time.sleep(0.5)
print(f"{len(done)} files in {OUT}; not published: {', '.join(missing) or 'none'}")
