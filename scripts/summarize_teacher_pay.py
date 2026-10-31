"""Summarize Transparent Utah teacher-level pay into district-level statistics.

Input (private, never published; contains teacher names and license IDs):
  private_data/transparent_utah/teacher_pay/teacher_pay_FY<YYYY>.csv
  Downloaded from https://transparent.utah.gov/teacher-pay/ ("Teacher Data" table, one file per
  fiscal year, all LEAs, all filters). Rows are classroom teachers whose names the State Auditor
  matched to at least one course in USBE's CACTUS database.

Output (public, no personal information):
  site/assets/data/transparent_utah/teacher_pay_summary/teacher_pay_by_district.csv
  One row per school district and fiscal year: number of teachers and the 25th, 50th, and 75th
  percentiles and mean of instructional wages, total wages, and total compensation. Statistics
  for groups of fewer than MIN_GROUP teachers are left blank so no individual can be identified.

Run: python3 scripts/summarize_teacher_pay.py
"""
import csv, glob, json, os, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, "private_data", "transparent_utah", "teacher_pay")
OUT = os.path.join(ROOT, "site", "assets", "data", "transparent_utah", "teacher_pay_summary")
MIN_GROUP = 10
MEASURES = ["instructional_wages", "total_wages", "total_compensation"]

state_js = open(os.path.join(ROOT, "site", "assets", "statewide.js")).read()
districts = json.loads(state_js[state_js.index("=") + 1:].strip().rstrip(";"))["districts"]
by_name = {v["name"]: k for k, v in districts.items()}


def pct(values, q):
    v = sorted(values)
    i = (len(v) - 1) * q
    lo, hi = int(i), min(int(i) + 1, len(v) - 1)
    return v[lo] + (v[hi] - v[lo]) * (i - lo)


rows = []
for path in sorted(glob.glob(os.path.join(RAW, "teacher_pay_FY*.csv"))):
    groups = {}
    for r in csv.DictReader(open(path, encoding="utf-8-sig")):
        d = by_name.get(r["lea_name"])
        if not d:
            continue                      # charter LEAs are outside the current scope
        g = groups.setdefault((d, int(r["school_year"])), {m: [] for m in MEASURES})
        for m in MEASURES:
            try:
                g[m].append(float(r[m]))
            except (TypeError, ValueError):
                pass
    for (d, y), g in sorted(groups.items()):
        n = len(g["total_compensation"])
        out = {"lea_number": d, "lea_name": districts[d]["name"], "fiscal_year": y, "teachers": n}
        for m in MEASURES:
            v = g[m]
            ok = len(v) >= MIN_GROUP
            out[f"{m}_p25"] = round(pct(v, .25), 2) if ok else ""
            out[f"{m}_median"] = round(statistics.median(v), 2) if ok else ""
            out[f"{m}_p75"] = round(pct(v, .75), 2) if ok else ""
            out[f"{m}_mean"] = round(statistics.mean(v), 2) if ok else ""
        rows.append(out)

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, "teacher_pay_by_district.csv"), "w", newline="") as fh:
    w = csv.DictWriter(fh, list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)
suppressed = sum(1 for r in rows if r["total_compensation_median"] == "")
print(f"{len(rows)} district-years written; {suppressed} suppressed (fewer than {MIN_GROUP} teachers)")
