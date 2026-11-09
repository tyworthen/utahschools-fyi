"""Summarize all-employee compensation for Tooele and its peers into district-level figures for the site.

Inputs (private, never published; list employees by name):
  private_data/transparent_utah/employee_compensation/<entity_id>/<FY>.json.gz   scripts/fetch_employee_compensation.py
  private_data/district_directories/tooele/directory.csv                         scripts/fetch_district_directories.py
Public inputs:
  site/assets/data/normalized/enrollment.csv, inflation.csv
  site/assets/data/usbe/tableau_afr/afr_expenditures_4_districts_FY2012-FY2024.csv

Outputs (public, no personal information):
  site/assets/compensation.js                                                    window.TSF_COMP for the page
  site/assets/data/transparent_utah/compensation_summary/compensation_by_district.csv   long format

Method:
  Pay lines are grouped into people by (first given name, final surname word) within a district-year, because
  name formats change between years. A person's role is the state salary account (object code) carrying most of
  their salary. "Full-time" = salary of at least $40,000 in FY2026 dollars (CPI-deflated per year). Cache stopped
  reporting state account codes in FY2022, so its role figures stop at FY2021. Medians for groups of fewer than
  MIN_GROUP people are left blank so no individual's pay can be inferred; no figure for a single person is written.

Run: python3 scripts/build_compensation_data.py
"""
import collections, csv, datetime, gzip, json, os, re, statistics

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COMP = os.path.join(ROOT, "private_data", "transparent_utah", "employee_compensation")
DIRS = os.path.join(ROOT, "private_data", "district_directories")
NORM = os.path.join(ROOT, "site", "assets", "data", "normalized")
USBE = os.path.join(ROOT, "site", "assets", "data", "usbe", "tableau_afr", "afr_expenditures_4_districts_FY2012-FY2024.csv")
OUT_JS = os.path.join(ROOT, "site", "assets", "compensation.js")
OUT_CSV = os.path.join(ROOT, "site", "assets", "data", "transparent_utah", "compensation_summary", "compensation_by_district.csv")

YEARS = list(range(2019, 2027))
MIN_GROUP = 10
FT26 = 40000
HI = 100000
# site key -> (Transparent Utah entity id, USBE LEA number, last year with usable data)
DISTRICTS = {"tooele": (95, "30", 2026), "iron": (59, "13", 2026), "cache": (205, "04", 2025), "boxelder": (41, "03", 2026)}
CENTRAL = {
    "tooele": lambda x: not re.search(r"ELEMENTARY|HIGH|JR|JUNIOR|SCHOOL|DUGWAY|IBAPAH|VERNON|CENTER|PRESCHOOL", x["org2"] or ""),
    "iron": lambda x: "District Level" in (x["org1"] or ""),
    "boxelder": lambda x: "District Office" in (x["org2"] or ""),
    "cache": lambda x: (x["org1"] or "") == "CACHE COUNTY SCHOOL DISTRICT",
}
GROUP = {"11": "district admin", "12": "school admin", "131": "teachers", "132": "substitutes", "14": "other licensed",
         "15": "office", "16": "aides", "17": "transport", "18": "maintenance, custodial, technology", "19": "food service, coaches, other"}
ROLES = ["teachers", "school admin", "district admin", "other licensed", "aides", "office", "transport",
         "maintenance, custodial, technology", "food service, coaches, other"]

enroll = {}
for r in csv.DictReader(open(os.path.join(NORM, "enrollment.csv"))):
    enroll[(r["lea_number"], int(r["school_year"]))] = int(r["october_1_enrollment"]) - int(r["online_school_enrollment"] or 0)
cpi = {int(r["fiscal_year"]): float(r["factor_to_fy2026_dollars"]) for r in csv.DictReader(open(os.path.join(NORM, "inflation.csv")))}


def group(acct):
    return GROUP.get(acct[:3]) or GROUP.get(acct[:2]) or ("other" if acct else None)


def coded(k, y):
    return not (k == "cache" and y >= 2022)


def person_key(name, eid, y):
    n = re.sub(r"[^A-Z, -]", "", name.upper())
    if "," in n:
        last, first = n.split(",", 1)
    elif eid == 205 and y >= 2022:
        t = n.split(); first, last = t[0], (t[-1] if len(t) > 1 else "")
    else:
        t = n.split(); last, first = t[0], " ".join(t[1:])
    first, last = first.split(), last.split()
    return (last[-1] if last else "", first[0] if first else "")


def person_id(name):
    # Within one district-year, each distinct name as written is one person. (Grouping on person_key instead
    # merges different people who share a first name and surname, e.g. two "Johnson, Lisa" with different
    # middle initials.) person_key is used only to link people across years; see linked().
    return " ".join(re.sub(r"[^A-Z ]", " ", name.upper().replace(",", " ")).split())


def load(k, y):
    eid = DISTRICTS[k][0]
    p = collections.defaultdict(lambda: {"sal": 0.0, "ben": 0.0, "by": collections.Counter(), "loc": collections.Counter()})
    path = os.path.join(COMP, str(eid), f"{y}.json.gz")
    if not os.path.exists(path):                   # a year the source has not published
        return p
    for x in json.load(gzip.open(path)):
        c1 = (x["cat1"] or "").upper()
        q = p[person_id(x["employee_name"])]
        q["key"] = person_key(x["employee_name"], eid, y)
        if c1.startswith("1") or "SALAR" in c1 or "VACATION" in c1:
            q["sal"] += x["net_amount"]
            q["by"][(x["cat3"] or x["cat2"] or "")[:3]] += x["net_amount"]
            q["loc"][(CENTRAL[k](x), x["org2"] if k != "cache" else x["org1"])] += x["net_amount"]
        elif c1.startswith("2") or any(w in c1 for w in ("BENEFIT", "SOCIAL", "INSURANCE", "RETIRE")):
            q["ben"] += x["net_amount"]
    for q in p.values():
        q["acct"] = q["by"].most_common(1)[0][0] if q["by"] else ""
        q["role"] = group(q["acct"]) if coded(k, y) and q["acct"] else None
        (q["central"], q["location"]) = q["loc"].most_common(1)[0][0] if q["loc"] else (False, "")
        q["ft"] = q["sal"] * cpi[y] >= FT26
    return p


def linked(people):
    """People keyed by person_key for matching across years; keys shared by two people that year are dropped."""
    n = collections.Counter(q["key"] for q in people.values() if "key" in q)
    return {q["key"]: q for q in people.values() if "key" in q and n[q["key"]] == 1}


def med(values):
    return round(statistics.median(values)) if len(values) >= MIN_GROUP else None


def r1(v):
    return None if v is None else round(v, 1)


data = {(k, y): load(k, y) for k in DISTRICTS for y in YEARS}
out = {"years": YEARS, "minGroup": MIN_GROUP, "fullTimeThreshold": FT26, "highEarnerThreshold": HI, "districts": {}}
long_rows = []


def emit(k, y, metric, value):
    if value is not None:
        long_rows.append({"district": k, "fiscal_year": y, "metric": metric, "value": value})


for k, (eid, lea, last) in DISTRICTS.items():
    d = {"lastYear": last, "lastCodedYear": max(y for y in YEARS if coded(k, y) and y <= last), "series": {}, "roles": {}}
    s = collections.defaultdict(list)
    for y in YEARS:
        P = data[(k, y)].values()
        sal = sum(q["sal"] for q in P)
        ft = [q for q in P if q["ft"]]
        teachers = [q["sal"] for q in ft if q["role"] == "teachers"]
        admins = [q for q in ft if q["role"] in ("district admin", "school admin")]
        vals = {
            "salaries": round(sal),
            "benefits": round(sum(q["ben"] for q in P)),
            "students": enroll[(lea, y)],
            "salariesPerStudent": round(sal / enroll[(lea, y)]),
            "earners100k": sum(1 for q in P if q["sal"] >= HI),
            "ftTeachers": len(teachers) if coded(k, y) else None,
            "ftAdmins": len(admins) if coded(k, y) else None,
            "teacherMedian": med(teachers) if coded(k, y) else None,
            "studentsPerAdmin": r1(enroll[(lea, y)] / len(admins)) if coded(k, y) and admins else None,
            "teachersPerAdmin": r1(len(teachers) / len(admins)) if coded(k, y) and admins else None,
            "studentsPerTeacher": r1(enroll[(lea, y)] / len(teachers)) if coded(k, y) and teachers else None,
        }
        if y > last:                                   # incomplete year: keep counts out of trend lines
            vals = {m: None for m in vals}
        for m, v in vals.items():
            s[m].append(v)
            emit(k, y, m, v)
    d["series"] = dict(s)

    y0, y1 = YEARS[0], d["lastCodedYear"]
    for role in ROLES:
        a = [q["sal"] for q in data[(k, y0)].values() if q["ft"] and q["role"] == role]
        b = [q["sal"] for q in data[(k, y1)].values() if q["ft"] and q["role"] == role]
        da = sum(v for q in data[(k, y0)].values() for c, v in q["by"].items() if group(c) == role)
        db = sum(v for q in data[(k, y1)].values() for c, v in q["by"].items() if group(c) == role)
        ma, mb = med(a), med(b)
        d["roles"][role] = {"ft": [len(a), len(b)], "median": [ma, mb], "dollars": [round(da), round(db)],
                            "medianRealChange": r1(100 * (mb * cpi[y1] / (ma * cpi[y0]) - 1)) if ma and mb else None}
        for yy, n, m_, dd in ((y0, len(a), ma, da), (y1, len(b), mb, db)):
            emit(k, yy, f"ft_{role}", n); emit(k, yy, f"median_{role}", m_); emit(k, yy, f"salary_dollars_{role}", round(dd))

    base = {n for n, q in linked(data[(k, y0)]).items() if q["ft"] and q["role"] == "teachers"}
    d["retention"] = [r1(100 * len(base & {n for n, q in linked(data[(k, y)]).items() if q["ft"]}) / len(base)) if y <= last else None for y in YEARS]
    a, b = linked(data[(k, y0)]), linked(data[(k, y1)])
    ch = [b[n]["sal"] / a[n]["sal"] - 1 for n in a if n in b and a[n]["role"] == b[n]["role"] == "teachers" and a[n]["ft"] and b[n]["ft"]]
    d["stayers"] = {"n": len(ch), "toYear": y1, "nominal": r1(100 * statistics.median(ch)),
                    "real": r1(100 * ((1 + statistics.median(ch)) * cpi[y1] / cpi[y0] - 1))}

    P = data[(k, last)].values()
    hi = [q for q in P if q["sal"] >= HI]
    d["highEarners"] = {"fy": last, "total": len(hi), "central": sum(q["central"] for q in hi),
                        "centralPer1000": r1(1000 * sum(q["central"] for q in hi) / enroll[(lea, last)]),
                        "centralStaff": sum(1 for q in P if q["central"] and q["sal"] > 0),
                        "centralPayroll": round(sum(q["sal"] for q in P if q["central"]))}
    out["districts"][k] = d

# Tooele detail, latest year: where $100k+ earners are paid, and central earners by account group.
T = data[("tooele", 2026)]
def place(loc, central):
    if "DISTRICT OFFICE" in loc: return "District office"
    if central: return "Other district departments"
    if "HIGH" in loc and "JR" not in loc: return "High schools"
    if "JR" in loc or "JUNIOR" in loc: return "Junior high schools"
    if "ELEMENTARY" in loc: return "Elementary schools"
    return "Other schools and programs"
places = collections.Counter(place(q["location"], q["central"]) for q in T.values() if q["sal"] >= HI)
ACCT = {"112": "Superintendent", "113": "Assistant superintendents", "114": "Business administrator",
        "115": "Supervisors and directors", "121": "Principals and assistants", "131": "Teachers (account 131)",
        "184": "Technology personnel (account 184)"}
central_hi = [q for q in T.values() if q["sal"] >= HI and q["central"]]
by_acct = collections.Counter(ACCT.get(q["acct"], "Other accounts") for q in central_hi)

# Directory cross-checks (counts and dollars only).
# A directory entry ("First Last") matches a pay record when its first and last words both appear in the pay name,
# in any order (pay names are "Last First Middle" and may carry two-word surnames), and the match is one-to-one.
dirt = list(csv.DictReader(open(os.path.join(DIRS, "tooele", "directory.csv"))))
words = lambda n: set(re.sub(r"[^A-Z ]", " ", n.upper().replace("-", " ")).split())
cands = {}
for r in dirt:
    w = [t for t in re.sub(r"[^A-Z ]", " ", r["name"].upper().replace("-", " ")).split() if t not in ("JR", "SR", "II", "III")]
    if len(w) >= 2:
        cands[r["constituent_id"]] = [pid for pid in T if w[0] in words(pid) and w[-1] in words(pid)]
hits = collections.Counter(pid for c in cands.values() for pid in c)
dmatch = {c[0]: did for did, c in cands.items() if len(c) == 1 and hits[c[0]] == 1}
listed = [T[pid] for pid in dmatch]
teacher_acct = [q for q in listed if q["acct"] == "131"]
missing = [q for pid, q in T.items() if q in central_hi and pid not in dmatch]

usbe_184_om = sum(float(r["amount"]) for r in csv.DictReader(open(USBE))
                  if r["lea_number"] == "30" and r["fiscal_year"] == "2024" and r["submission_type"] == "Actuals"
                  and r["object_code"] == "184" and r["function_code"].startswith("26"))
usbe_benefits = collections.defaultdict(float)
for r in csv.DictReader(open(USBE)):
    if r["submission_type"] == "Actuals" and r["object_code"][:1] == "2" and len(r["object_code"]) == 3 and r["fiscal_year"] == "2024":
        usbe_benefits[r["lea_number"]] += float(r["amount"])

out["tooele"] = {
    "fy": 2026,
    "highEarnerPlaces": [{"place": p, "people": n} for p, n in places.most_common()],
    "centralHighByAccount": [{"account": a, "people": n} for a, n in by_acct.most_common()],
    "directory": {"listed": len(dirt), "matched": len(listed),
                  "teacherAccount": {"people": len(teacher_acct), "salaries": round(sum(q["sal"] for q in teacher_acct))},
                  "centralHighNotListed": len(missing), "centralHigh": len(central_hi)},
    "maintenanceOnTechnologyAccountFY2024": round(usbe_184_om),
    "substitutes": {"fy2019": round(sum(v for q in data[("tooele", 2019)].values() for c, v in q["by"].items() if c == "132")),
                    "fy2026": round(sum(v for q in T.values() for c, v in q["by"].items() if c == "132"))},
}
out["benefitsVsUsbeFY2024"] = {k: r1(100 * (out["districts"][k]["series"]["benefits"][YEARS.index(2024)] / usbe_benefits[DISTRICTS[k][1]] - 1)) for k in DISTRICTS}
out["generated"] = datetime.date.today().isoformat()

os.makedirs(os.path.dirname(OUT_CSV), exist_ok=True)
with open(OUT_CSV, "w", newline="") as fh:
    w = csv.DictWriter(fh, ["district", "fiscal_year", "metric", "value"])
    w.writeheader()
    w.writerows(long_rows)
with open(OUT_JS, "w") as fh:
    fh.write("// GENERATED by scripts/build_compensation_data.py — do not edit by hand.\n"
             "// District-level figures only; medians for groups under " + str(MIN_GROUP) + " people are left blank.\n"
             "window.TSF_COMP = " + json.dumps(out, indent=1) + ";\n")
print(f"wrote {OUT_JS} and {OUT_CSV} ({len(long_rows)} rows)")
