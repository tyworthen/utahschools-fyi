"""Build site figures for every Utah school district from USBE Annual Financial Report (AFR) data.

Inputs (preserved originals under site/assets/data/usbe/):
  tableau_afr/afr_expenditures_all_leas_FY2012-FY2024.csv.gz
  tableau_afr/afr_revenues_all_leas_FY2011-FY2024.csv.gz
  tableau_afr/afr_balancesheet_all_leas_FY2011-FY2024.csv.gz
  financial_reporting/reports/annualfinancialreport/2025fiscalyear/... (FY2025 Excel)
  financial_reporting/reports/annualfinancialreport/2024fiscalyear/... (FY2024 Excel, validation only)

Outputs:
  site/assets/data.js                 block between "// BEGIN USBE GENERATED" and "// END USBE GENERATED"
                                      (Tooele and its three initial peers, keyed tooele/iron/cache/boxelder)
  site/assets/statewide.js            window.TSF_STATE: every district, keyed by USBE district number
  site/assets/data/normalized/        revenue.csv, expenditures.csv, budgets.csv, fund_balances.csv
                                      (long format, keyed by lea_number) and usbe_site_figures.json

Scope: school districts only. Charter LEAs are in the source files but are excluded until their
data can be presented with a clear district/charter distinction.

Definitions (governmental funds, actuals, nominal dollars):
  revenue      = Local + State + Federal (excludes 5000s other financing sources / special and
                 extraordinary items such as bond proceeds and transfers, and state code 3750
                 Capital Development Project Grants, which the Tableau extract omits in every year)
  property tax = revenue codes 1100-1199
  expenditures = all functions; categories by function code (see category())
  admin share  = functions 2300-2599 / current expenditures (excludes 4000s capital, 5000s debt)
  GF balance   = General Fund (10) total fund balance (9800-9899) at fiscal year end

Run: python3 scripts/build_usbe_data.py   (needs openpyxl)
"""
import csv, gzip, json, os, re, warnings
from collections import defaultdict

import openpyxl

warnings.filterwarnings("ignore")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "site", "assets")
DATA = os.path.join(ASSETS, "data", "usbe")
TAB = os.path.join(DATA, "tableau_afr")
AFR = os.path.join(DATA, "financial_reporting", "reports", "annualfinancialreport")
NORM = os.path.join(ASSETS, "data", "normalized")

PEERS = {"30": "tooele", "13": "iron", "04": "cache", "03": "boxelder"}
CATS = ["instruction", "support", "administration", "transportation", "operations", "capital", "debt", "other"]
CAT_LABELS = {"instruction": "Instruction", "support": "Student support", "administration": "Administration",
              "transportation": "Transportation", "operations": "Operations", "capital": "Capital",
              "debt": "Debt service", "other": "Other"}
YEARS = range(2012, 2026)
# Administration (functions 2300-2599) is also broken down by subgroup and by object (type of spending).
ADMIN_SUBS = {23: "admin_district", 24: "admin_school", 25: "admin_central"}
ADMIN_SUB_LABELS = {"admin_district": "District administration (board, superintendent, elections)",
                    "admin_school": "School administration (principals' offices)",
                    "admin_central": "Central business services (fiscal, personnel, communications, admin technology)"}
OBJECTS = {"1": "Salaries", "2": "Benefits", "3": "Purchased professional services", "4": "Purchased property services",
           "5": "Other purchased services", "6": "Supplies and materials", "7": "Property and equipment", "8": "Debt service and other"}
SRC = {"tableau": "USBE AFR Tableau Public extract", "excel": "USBE AFR Excel summary"}


def category(code):
    """Map a USBE function code (int) to a site spending category."""
    if 1000 <= code < 2000: return "instruction"
    if 2100 <= code < 2300: return "support"
    if 2300 <= code < 2600: return "administration"
    if 2600 <= code < 2700: return "operations"
    if 2700 <= code < 2800: return "transportation"
    if 3100 <= code < 3200: return "operations"          # food services
    if 4000 <= code < 5000: return "capital"
    if 5000 <= code < 6000: return "debt"
    return "other"                                       # 2900s, enterprise, community services


def bal_cat(code):
    c = int(code)
    if c == 9899: return "unassigned"
    return {986: "nonspendable", 987: "restricted", 988: "committed", 989: "assigned"}.get(c // 10)


def excel_prefix_code(header):
    """'21xx - Support Services - Students' -> 2100; '1xxx - Instruction' -> 1000."""
    m = re.match(r"\s*(\d)(\d?)x", str(header), re.I)
    if not m: return None
    return int(m.group(1)) * 1000 + (int(m.group(2)) * 100 if m.group(2) else 0)


def rows(path, sheet):
    return list(openpyxl.load_workbook(path, read_only=True, data_only=True)[sheet].iter_rows(values_only=True))


def tree():
    return defaultdict(lambda: defaultdict(float))


def district_rows(name):
    with gzip.open(os.path.join(TAB, name), "rt", newline="") as fh:
        for r in csv.DictReader(fh):
            if r["lea_type"] == "District":
                yield r


# ---------- Tableau extracts (FY2012-FY2024), all districts ----------
names = {}                                     # lea_number -> name
spend = defaultdict(tree)                      # spend[cat][lea][year]
gf_exp = tree()
bva = defaultdict(lambda: defaultdict(dict))   # bva[lea][year][submission] (General Fund expenditures)
admin_sub = defaultdict(tree)                  # admin_sub[sub][lea][year]
admin_obj = defaultdict(tree)                  # admin_obj[lea][year][object digit]
admin_fn = defaultdict(dict)                   # admin_fn[lea][code] = {"name":..., "values": {year: amt}} (peers only)
for r in district_rows("afr_expenditures_all_leas_FY2012-FY2024.csv.gz"):
    d = r["lea_number"]; y = int(r["fiscal_year"]); amt = float(r["amount"] or 0)
    names[d] = r["lea_name"]
    if r["fund_type"] != "Governmental": continue
    if r["fund_code"] == "10":
        bva[d][y][r["submission_type"]] = bva[d][y].get(r["submission_type"], 0.0) + amt
    if r["submission_type"] != "Actuals": continue
    fc = int(r["function_code"])
    spend[category(fc)][d][y] += amt
    if r["fund_code"] == "10": gf_exp[d][y] += amt
    if 2300 <= fc < 2600:
        admin_sub[ADMIN_SUBS[fc // 100]][d][y] += amt
        admin_obj[d][y][r["object_code"][:1]] += amt
        if d in PEERS:
            f = admin_fn[d].setdefault(r["function_code"], {"name": r["function"].strip(), "values": defaultdict(float)})
            f["values"][y] += amt

revenue, proptax, local, state_rev, federal = tree(), tree(), tree(), tree(), tree()
for r in district_rows("afr_revenues_all_leas_FY2011-FY2024.csv.gz"):
    d = r["lea_number"]; y = int(r["fiscal_year"]); amt = float(r["amount"] or 0)
    names.setdefault(d, r["lea_name"])
    if r["submission_type"] != "Actuals" or r["fund_type"] != "Governmental": continue
    src = r["revenue_source"]
    if src in ("Local", "State", "Federal"):
        revenue[d][y] += amt
        {"Local": local, "State": state_rev, "Federal": federal}[src][d][y] += amt
    if r["revenue_code"][:2] == "11": proptax[d][y] += amt

BAL_KEYS = ["nonspendable", "restricted", "committed", "assigned", "unassigned"]
gf_bal = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
for r in district_rows("afr_balancesheet_all_leas_FY2011-FY2024.csv.gz"):
    d = r["lea_number"]; y = int(r["fiscal_year"])
    if r["submission_type"] != "Actuals" or r["fund_code"] != "10" or r["bs_group_1"] != "Fund Balance": continue
    k = bal_cat(r["bs_code"])
    if k: gf_bal[d][y][k] += float(r["amount"] or 0)

BY_NAME = {v: k for k, v in names.items()}


# ---------- Enrollment (October 1 counts; school year YYYY = fiscal year YYYY) ----------
# Fall Enrollment files (SY2019-SY2027) give LEA and school counts; Enrollment by LEA (2019 file)
# adds Oct 2014-Oct 2017 (SY2015-SY2018). Per-student figures divide by these counts.
ENR = os.path.join(DATA, "enrollment")
# District-run online schools, identified by name and enrollment pattern (see methodology), with the
# school years each is counted as online. Blue Peak High housed Tooele's online program through SY2021
# (2,817-9,476 students); from SY2022 the program is the Digital Education Center and Blue Peak has ~120.
ONLINE_SCHOOLS = {"30": [("Blue Peak High", 2019, 2021), ("Digital Education Center", 2019, 2100)],
                  "13": [("Southwest Educational Academy", 2019, 2100), ("Iron Online", 2019, 2100)]}
BY_SHORT = {}
for k, v in names.items():
    short = v.replace(" District", "")
    BY_SHORT[short] = k; BY_SHORT[short.replace(" City", "")] = k

enroll = tree()                       # enroll[lea][sy]
online = tree()                       # online[lea][sy] (peers with online schools)
for sy in range(2019, 2028):
    R = rows(os.path.join(ENR, f"{sy}FallEnrollmentGradeLevelDemographics.xlsx"), "By LEA")
    h = next(i for i, r in enumerate(R[:10]) if r and "Total K-12" in r); hdr = list(R[h])
    li, ti = hdr.index("LEA Name"), hdr.index("Total K-12")
    for r in R[h + 1:]:
        d = BY_NAME.get(str(r[li]).strip()) if r[li] else None
        if d and isinstance(r[ti], (int, float)): enroll[d][sy] = r[ti]
    R = rows(os.path.join(ENR, f"{sy}FallEnrollmentGradeLevelDemographics.xlsx"), "By School")
    h = next(i for i, r in enumerate(R[:10]) if r and "Total K-12" in r); hdr = list(R[h])
    li, si, ti = hdr.index("LEA Name"), hdr.index("School Name"), hdr.index("Total K-12")
    for r in R[h + 1:]:
        d = BY_NAME.get(str(r[li]).strip()) if r[li] else None
        if d in ONLINE_SCHOOLS and isinstance(r[ti], (int, float)) and any(
                str(r[si]).strip() == name and lo <= sy <= hi for name, lo, hi in ONLINE_SCHOOLS[d]):
            online[d][sy] += r[ti]
R = rows(os.path.join(ENR, "2019EnrollmentLEA.xlsx"), openpyxl.load_workbook(os.path.join(ENR, "2019EnrollmentLEA.xlsx"), read_only=True).sheetnames[0])
cols = {str(c).strip(): j for j, c in enumerate(R[1]) if c}
in_districts = False
for r in R:
    label = str(r[0]).strip() if r and r[0] else ""
    if label == "School District" and r[1] is None: in_districts = True; continue
    if label == "Charter School" and in_districts: break
    d = BY_SHORT.get(label) if in_districts else None
    if d:
        for y in range(2014, 2018):
            v = r[cols[f"Oct {y}"]]
            if isinstance(v, (int, float)) and (y + 1) not in enroll[d]: enroll[d][y + 1] = v
missing_enr = [names[d] for d in names if 2025 not in enroll[d]]
if missing_enr: print("No FY2025 enrollment for:", ", ".join(missing_enr))


# ---------- Excel AFR summaries (FY2025; FY2024 for validation) ----------
def lea_of(name):
    return BY_NAME.get(str(name).strip()) if name else None


EX_ADMIN = defaultdict(lambda: {"sub": defaultdict(float), "obj": defaultdict(float)})


def excel_expenditures(path, sheet):
    """Gov Funds Totals (FY2025 layout): {lea: {cat: amount}}, summing object columns, skipping TOTALS.
    Also fills EX_ADMIN[lea] with administration by subgroup and by object."""
    R = rows(path, sheet)
    hrow = next(i for i, r in enumerate(R[:6]) if r and any(isinstance(c, str) and c.strip().upper() == "TOTALS" for c in r))
    groups, objs = R[hrow - 1], R[hrow]
    name_col = list(objs).index("Lea")
    out = {}
    for r in R[hrow + 1:]:
        d = lea_of(r[name_col]) if len(r) > name_col else None
        if not d: continue
        acc = defaultdict(float)
        for j in range(name_col + 1, len(r)):
            o = str(objs[j] or "").strip().upper()
            code = excel_prefix_code(groups[j])
            # "2XXX Support Services" is a subtotal of the 21xx-27xx groups; skip it.
            if o in ("", "TOTALS") or code is None or str(groups[j]).strip().upper().startswith("2XXX"): continue
            v = float(r[j] or 0)
            acc[category(code)] += v
            if 2300 <= code < 2600:
                EX_ADMIN[d]["sub"][ADMIN_SUBS[code // 100]] += v
                EX_ADMIN[d]["obj"][o[:1]] += v
        out[d] = acc
    return out


def excel_fund_total(path, sheet="10"):
    """Per-fund expenditure sheets: {lea: GRAND TOTAL} (header row 6, names in column 3)."""
    R = rows(path, sheet)
    col = list(R[6]).index("GRAND TOTAL")
    return {lea_of(r[3]): float(r[col] or 0) for r in R[7:] if len(r) > col and lea_of(r[3])}


def excel_revenue(path, sheet):
    """FY2025 names totals 'TOTAL LOCAL' in the code row; FY2024 names them 'LOCAL TOTAL' a row above."""
    R = rows(path, sheet)
    hrow = next(i for i, r in enumerate(R[:8]) if r and ("Lea" in r or "LEA" in r))
    hdr = R[hrow]; name_col = list(hdr).index("Lea" if "Lea" in hdr else "LEA")
    cols = {h: j for j, h in enumerate(hdr) if isinstance(h, str)}
    for i in range(hrow):
        for j, h in enumerate(R[i]):
            if isinstance(h, str) and h.strip().upper().endswith(" TOTAL"):
                cols["TOTAL " + h.strip().upper().split()[0]] = j
    out = {}
    for r in R[hrow + 1:]:
        d = lea_of(r[name_col])
        if not d: continue
        parts = {k: float(r[cols["TOTAL " + k.upper()]] or 0) for k in ("Local", "State", "Federal")}
        # Code 3750 (state Capital Development Project Grants) is absent from USBE's Tableau extract
        # in every year; exclude it here so FY2025 is consistent with FY2012-FY2024.
        parts["State"] -= sum(float(r[j] or 0) for h, j in cols.items() if h.startswith("3750"))
        pt = sum(float(r[j] or 0) for h, j in cols.items() if h[:2] == "11" and h[:4].isdigit())
        out[d] = {"revenue": sum(parts.values()), "proptax": pt, **parts}
    return out


def excel_gf_balance(path):
    R = rows(path, "10")
    codes = R[6]
    out = {}
    for r in R[8:]:
        d = lea_of(r[3]) if len(r) > 3 else None
        if not d: continue
        acc = defaultdict(float)
        for j, c in enumerate(codes):
            if isinstance(c, str) and c[:2] == "98":
                k = bal_cat(c)
                if k: acc[k] += float(r[j] or 0)
        out[d] = acc
    return out


F25 = os.path.join(AFR, "2025fiscalyear")
F24 = os.path.join(AFR, "2024fiscalyear", "fy24annualfinancialreportafr")
exp25 = excel_expenditures(os.path.join(F25, "AFR Summary Expenditure GF AMD 1.xlsx"), "Gov Funds Totals")
gfexp25 = excel_fund_total(os.path.join(F25, "AFR Summary Expenditure GF AMD 1.xlsx"))
rev25 = excel_revenue(os.path.join(F25, "fy25annualfinancialreportafr", "AFR Summary Revenue GF.xlsx"), "Gov Funds Totals")
bal25 = excel_gf_balance(os.path.join(F25, "fy25annualfinancialreportafr", "AFR Summary BalSheet GF.xlsx"))
year_source = defaultdict(dict)
for d in names:
    if d in exp25:
        for c, v in exp25[d].items(): spend[c][d][2025] += v
        for k, v in EX_ADMIN[d]["sub"].items(): admin_sub[k][d][2025] += v
        for k, v in EX_ADMIN[d]["obj"].items(): admin_obj[d][2025][k] += v
    if d in gfexp25: gf_exp[d][2025] = gfexp25[d]
    if d in rev25:
        revenue[d][2025] = rev25[d]["revenue"]; proptax[d][2025] = rev25[d]["proptax"]
        local[d][2025], state_rev[d][2025], federal[d][2025] = rev25[d]["Local"], rev25[d]["State"], rev25[d]["Federal"]
    if d in bal25:
        for k, v in bal25[d].items(): gf_bal[d][2025][k] = v

# Validation: FY2024 Excel vs. Tableau extract, every district
R24 = rows(os.path.join(F24, "AFR Summary Expenditure AF.xlsx"), "Gov Funds Total")
gt = list(R24[3]).index("Grand Total")
exp24 = {lea_of(r[2]): float(r[gt] or 0) for r in R24[5:] if len(r) > gt and lea_of(r[2])}
rev24 = excel_revenue(os.path.join(F24, "AFR Summary Revenue AF.xlsx"), "Gov Funds Totals")
bal24 = excel_gf_balance(os.path.join(F24, "AFR Summary BalSheet AF.xlsx"))
checks, mismatches = 0, []
for d in sorted(names):
    pairs = (("expenditures", exp24.get(d), sum(spend[c][d][2024] for c in CATS)),
             ("revenue", rev24.get(d, {}).get("revenue"), revenue[d][2024]),
             ("property tax", rev24.get(d, {}).get("proptax"), proptax[d][2024]),
             ("GF balance", sum(bal24[d].values()) if d in bal24 else None, sum(gf_bal[d][2024].values())))
    for label, a, b in pairs:
        if a is None or not b: continue
        checks += 1; pct = 100 * (a - b) / b
        if abs(pct) > 0.5: mismatches.append((names[d], label, a, b, pct))
print(f"FY2024 validation: {checks} Excel-vs-Tableau totals across {len(names)} districts; "
      f"{len(mismatches)} differ by more than 0.5%")
for n, label, a, b, pct in mismatches:
    print(f"  {n:24} {label:13} excel {a:>15,.0f}  tableau {b:>15,.0f}  {pct:+.1f}%")
os.makedirs(NORM, exist_ok=True)
with open(os.path.join(NORM, "validation_FY2024.csv"), "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["check", "Excel and Tableau FY2024 totals (expenditures, revenue, property tax, GF balance) per district",
                "comparisons", checks, "threshold_pct", 0.5])
    w.writerow(["lea_name", "measure", "excel_value", "tableau_value", "difference_pct"])
    w.writerows((n, label, round(a, 2), round(b, 2), round(pct, 3)) for n, label, a, b, pct in mismatches)
missing25 = [names[d] for d in names if d not in rev25 or d not in exp25]
if missing25: print("No FY2025 Excel row for:", ", ".join(sorted(missing25)))


# ---------- Inflation (BLS CPI-U, fiscal-year averages) ----------
# Fiscal year Y runs July (Y-1) through June (Y). Each FY average uses the months BLS published;
# October 2025 was not published (2025 federal shutdown), so FY2026 averages 11 months.
CPI_BASE = 2026
BLS = os.path.join(ASSETS, "data", "bls")
cpi_month = {}
for f in sorted(os.listdir(BLS)):
    if f.endswith(".json"):
        for p in json.load(open(os.path.join(BLS, f)))["Results"]["series"][0]["data"]:
            if p["period"].startswith("M") and p["period"] != "M13":
                try: cpi_month[(int(p["year"]), int(p["period"][1:]))] = float(p["value"])
                except ValueError: pass          # "-" = not published
cpi_fy = {}
for fy in range(2012, CPI_BASE + 1):
    months = [cpi_month[(fy - 1, m)] for m in range(7, 13) if (fy - 1, m) in cpi_month] + \
             [cpi_month[(fy, m)] for m in range(1, 7) if (fy, m) in cpi_month]
    if len(months) >= 11:
        cpi_fy[fy] = (sum(months) / len(months), len(months))
cpi_factor = {fy: round(cpi_fy[CPI_BASE][0] / v, 6) for fy, (v, n) in cpi_fy.items()}
CPI_OUT = {"base": CPI_BASE, "series": "CUUR0000SA0", "source": "bls-cpi",
           "label": f"FY{CPI_BASE} dollars", "factor": cpi_factor,
           "note": f"Adjusted with BLS CPI-U (U.S. city average, all items), July–June fiscal-year averages, to FY{CPI_BASE} dollars. "
                   "October 2025 was not published by BLS, so FY2026 averages 11 months."}


# ---------- Assemble metrics (values keyed by lea_number) ----------
total_exp = tree()
for c in CATS:
    for d in names:
        for y, v in spend[c][d].items(): total_exp[d][y] += v

def series(t, d):
    return {y: round(t[d][y]) for y in YEARS if y in t[d]}

FY25_NOTE = "FY2012–FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries."
ADMIN_NOTE = ("Central business services (25xx) includes fiscal, personnel, public information, and administrative "
              "technology. Districts assign some costs differently — for example, not every district uses function 2580 "
              "(Administrative Technology Services) — so compare shares with care. ")
TOOELE_ADMIN = ("Coding caution: Tooele reported function 2580 for the first time in FY2024 ($4.8M), the same year its "
                "instruction spending fell $15.7M; part of Tooele's FY2024–FY2025 increase may reflect reclassification "
                "rather than new spending (not yet verified). Cache has used 2580 since FY2012; Iron and Box Elder do not use it. ")

metrics = {}
def metric(key, label, unit, basis, calc, fn, notes=FY25_NOTE, hidden=False, source="usbe-afr"):
    metrics[key] = {"label": label, "unit": unit, "basis": basis, "calc": calc, "source": source,
                    "ref": "assets/data/normalized/", "notes": notes, "hidden": hidden,
                    "values": {d: fn(d) for d in sorted(names)}}

metric("revenue_total", "Total revenue", "money", "Nominal dollars, governmental funds",
       "Local + state + federal revenue, actuals. Excludes other financing sources (bond proceeds, transfers, asset sales) and state Capital Development Project Grants (code 3750), which USBE's Tableau extract omits.",
       lambda d: series(revenue, d))
metric("expenditures_total", "Total expenditures", "money", "Nominal dollars, governmental funds",
       "All functions, actuals, including capital construction and debt service.", lambda d: series(total_exp, d))
metric("property_tax_total", "Property tax revenue", "money", "Nominal dollars, governmental funds",
       "Sum of revenue codes 1100–1199 (property taxes, including tax sales and redemptions and fee-in-lieu).",
       lambda d: series(proptax, d))
metric("local_share", "Local share of revenue", "percent", "Share of local + state + federal revenue",
       "Local revenue ÷ (local + state + federal revenue), governmental funds, actuals.",
       lambda d: {y: round(100 * local[d][y] / revenue[d][y], 2) for y in YEARS if revenue[d][y]})
metric("admin_share", "Administrative spending share", "percent", "Share of current expenditures",
       "(District administration 23xx + school administration 24xx + central business services 25xx) ÷ current "
       "expenditures (all functions except 4xxx capital and 5xxx debt service).",
       lambda d: {y: round(100 * spend["administration"][d][y] / (total_exp[d][y] - spend["capital"][d][y] - spend["debt"][d][y]), 2)
                  for y in YEARS if total_exp[d][y] - spend["capital"][d][y] - spend["debt"][d][y] > 0},
       ADMIN_NOTE + FY25_NOTE)
metric("instruction_share", "Instruction share of spending", "percent", "Share of current expenditures",
       "Instruction (1000s) ÷ current expenditures (all functions except 4xxx capital and 5xxx debt service).",
       lambda d: {y: round(100 * spend["instruction"][d][y] / (total_exp[d][y] - spend["capital"][d][y] - spend["debt"][d][y]), 2)
                  for y in YEARS if total_exp[d][y] - spend["capital"][d][y] - spend["debt"][d][y] > 0})
metric("gf_fund_balance", "General Fund balance", "money", "Nominal dollars, end of fiscal year",
       "Total General Fund (fund 10) fund balance: nonspendable + restricted + committed + assigned + unassigned.",
       lambda d: {y: round(sum(gf_bal[d][y].values())) for y in YEARS if y in gf_bal[d]})
metric("gf_fund_balance_pct", "General Fund balance as % of spending", "percent",
       "Year-end fund balance ÷ General Fund expenditures",
       "Total General Fund fund balance at fiscal year end ÷ General Fund actual expenditures for the same year.",
       lambda d: {y: round(100 * sum(gf_bal[d][y].values()) / gf_exp[d][y], 2) for y in YEARS if y in gf_bal[d] and gf_exp[d][y]})
metric("gf_budget_variance", "General Fund budget variance", "percent", "Actual vs. final budget, General Fund expenditures",
       "(Actual − final budget) ÷ final budget, General Fund expenditures. Negative = spent less than budgeted.",
       lambda d: {y: round(100 * (v["Actuals"] - v["Final Budget"]) / v["Final Budget"], 2)
                  for y, v in bva[d].items() if v.get("Final Budget") and v.get("Actuals") is not None and y in YEARS},
       "FY2013–FY2024 from the USBE AFR Tableau extracts. FY2025 budgets are not in USBE's FY2025 files.")
for c in CATS:
    metric("spend_" + c, CAT_LABELS[c] + " spending", "money", "Nominal dollars, governmental funds",
           "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
           lambda d, c=c: series(spend[c], d), hidden=True)

ENR_NOTE = ("October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, "
            "and online students generally cost less to serve, so per-student figures are not directly comparable across "
            "districts or years when online enrollment changes. FY2015–FY2018 counts come from USBE's Enrollment by LEA "
            "report; FY2019 onward from Fall Enrollment by Grade Level.")
TOOELE_ONLINE = ("Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education "
                 "Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in "
                 "October 2023. "
                 "Per-student figures before and after FY2024 therefore divide by very different student populations. ")
EYEARS = range(2015, 2028)
def per_student(t, d):
    return {y: round(t[d][y] / enroll[d][y]) for y in YEARS if y in t[d] and enroll[d].get(y)}
current_exp = tree()
for d in names:
    for y in YEARS:
        if total_exp[d][y]: current_exp[d][y] = total_exp[d][y] - spend["capital"][d][y] - spend["debt"][d][y]

metric("enrollment", "Enrollment", "count", "October 1 enrollment, K-12",
       "As reported by USBE; no calculation.", lambda d: {y: int(enroll[d][y]) for y in EYEARS if y in enroll[d]}, ENR_NOTE,
       source="usbe-enrollment")
metric("spend_per_student", "Spending per student", "dollars", "Current expenditures ÷ October 1 enrollment, nominal dollars",
       "Current expenditures (all functions except 4xxx capital and 5xxx debt service, governmental funds) ÷ October 1 enrollment for the same school year.",
       lambda d: per_student(current_exp, d), ENR_NOTE + " " + FY25_NOTE)
metric("revenue_per_student", "Revenue per student", "dollars", "Revenue ÷ October 1 enrollment, nominal dollars",
       "Local + state + federal revenue (excludes bond proceeds and transfers) ÷ October 1 enrollment.",
       lambda d: per_student(revenue, d), ENR_NOTE + " " + FY25_NOTE)
metric("proptax_per_student", "Property tax revenue per student", "dollars", "Property taxes ÷ October 1 enrollment, nominal dollars",
       "Revenue codes 1100–1199 ÷ October 1 enrollment.", lambda d: per_student(proptax, d), ENR_NOTE + " " + FY25_NOTE)
metric("instruction_per_student", "Instruction spending per student", "dollars", "Instruction ÷ October 1 enrollment, nominal dollars",
       "Function 1000s (instruction) ÷ October 1 enrollment.", lambda d: per_student(spend["instruction"], d), ENR_NOTE + " " + FY25_NOTE)
metric("admin_per_student", "Administration spending per student", "dollars", "Administration ÷ October 1 enrollment, nominal dollars",
       "Functions 2300–2599 ÷ October 1 enrollment.", lambda d: per_student(spend["administration"], d), ENR_NOTE + " " + FY25_NOTE)
metric("enrollment_growth", "Enrollment change since FY2016", "percent", "October 1 enrollment vs. FY2016",
       "(Enrollment ÷ FY2016 enrollment − 1) × 100.",
       lambda d: {y: round(100 * (enroll[d][y] / enroll[d][2016] - 1), 2) for y in EYEARS if y in enroll[d] and enroll[d].get(2016)}, ENR_NOTE,
       source="usbe-enrollment")

metric("spend_per_student_real_change", "Spending per student, inflation-adjusted change since FY2016", "percent",
       f"Change in spending per student since FY2016, in FY{CPI_BASE} dollars",
       f"(Spending per student × CPI factor) ÷ (FY2016 spending per student × FY2016 CPI factor) − 1, using BLS CPI-U fiscal-year averages (FY{CPI_BASE} dollars).",
       lambda d: (lambda sp: {y: round(100 * (sp[y] * cpi_factor[y] / (sp[2016] * cpi_factor[2016]) - 1), 2)
                              for y in sp if y in cpi_factor and 2016 in sp})(per_student(current_exp, d)),
       ENR_NOTE + " " + CPI_OUT["note"])

for k in ADMIN_SUBS.values():
    metric("spend_" + k, ADMIN_SUB_LABELS[k].split(" (")[0] + " spending", "money", "Nominal dollars, governmental funds",
           {"admin_district": "Functions 2300–2399: board of education, elections, superintendent's office.",
            "admin_school": "Functions 2400–2499: office of the principal and other school administration.",
            "admin_central": "Functions 2500–2599: fiscal, purchasing, public information, personnel, and administrative technology services."}[k],
           lambda d, k=k: series(admin_sub[k], d), hidden=True)

def admin_detail(d):
    fns = {c: {"name": f["name"], "values": {y: round(v) for y, v in sorted(f["values"].items())}}
           for c, f in sorted(admin_fn[d].items()) if any(abs(v) >= 500 for v in f["values"].values())}
    objs = {y: {k: round(v) for k, v in sorted(admin_obj[d][y].items()) if k in OBJECTS} for y in YEARS if y in admin_obj[d]}
    return {"functions": fns, "objects": objs}

def bva_for(d):
    return {y: {"original": round(v["Original Budget"]) if v.get("Original Budget") is not None else None,
                "final": round(v["Final Budget"]) if v.get("Final Budget") is not None else None,
                "actual": round(v["Actuals"]) if v.get("Actuals") is not None else None}
            for y, v in sorted(bva[d].items()) if y >= 2013}

def gfbal_for(d):
    return {y: {k: round(gf_bal[d][y][k]) for k in BAL_KEYS} for y in sorted(gf_bal[d]) if y >= 2012}


# ---------- Write: data.js block (Tooele + initial peers) ----------
def rekey(values):
    return {PEERS[d]: v for d, v in values.items() if d in PEERS}

peer_metrics = {}
for k, m in metrics.items():
    pm = dict(m); pm["values"] = rekey(m["values"])
    if k == "admin_share": pm["notes"] = TOOELE_ADMIN + m["notes"]
    if k == "enrollment" or "_per_student" in k or k == "enrollment_growth": pm["notes"] = TOOELE_ONLINE + m["notes"]
    peer_metrics[k] = pm
peer_out = {
    "metrics": peer_metrics,
    "spending2025": {c: round(spend[c]["30"][2025]) for c in CATS},
    "budgetVsActual": {PEERS[d]: bva_for(d) for d in PEERS},
    "gfBalance": {PEERS[d]: gfbal_for(d) for d in PEERS},
    "adminDetail": {PEERS[d]: admin_detail(d) for d in PEERS},
    "adminLabels": {"subs": ADMIN_SUB_LABELS, "objects": OBJECTS},
    "cpi": CPI_OUT,
    "onlineEnrollment": {PEERS[d]: {"schools": [n for n, _, _ in ONLINE_SCHOOLS.get(d, [])],
                                    "online": {y: int(online[d][y]) for y in sorted(online[d])},
                                    "total": {y: int(enroll[d][y]) for y in EYEARS if y in enroll[d]}} for d in PEERS},
}
data_js = os.path.join(ASSETS, "data.js")
block = ("// BEGIN USBE GENERATED — do not edit by hand; run scripts/build_usbe_data.py\n"
         "window.TSF_USBE = " + json.dumps(peer_out, indent=2) + ";\n// END USBE GENERATED")
src = open(data_js).read()
src = re.sub(r"// BEGIN USBE GENERATED.*?// END USBE GENERATED", lambda m: block, src, flags=re.S)
open(data_js, "w").write(src)

# ---------- Write: statewide.js (every district) ----------
state = {
    "generated": "scripts/build_usbe_data.py",
    "scope": "Utah school districts (charter LEAs excluded)",
    "years": list(YEARS),
    "peers": PEERS,
    "districts": {d: {"name": names[d], "short": names[d].replace(" District", "")} for d in sorted(names)},
    "cpi": CPI_OUT,
    "metrics": metrics,
    "categories": {d: {c: series(spend[c], d) for c in CATS} for d in sorted(names)},
    "budgetVsActual": {d: bva_for(d) for d in sorted(names)},
    "gfBalance": {d: gfbal_for(d) for d in sorted(names)},
}
with open(os.path.join(ASSETS, "statewide.js"), "w") as fh:
    fh.write("// Generated by scripts/build_usbe_data.py — do not edit by hand.\n")
    fh.write("window.TSF_STATE = " + json.dumps(state, separators=(",", ":")) + ";\n")

# ---------- Write: normalized long-format CSVs ----------
os.makedirs(NORM, exist_ok=True)
def src_for(y): return SRC["excel"] if y == 2025 else SRC["tableau"]
def write_long(name, header, it):
    with open(os.path.join(NORM, name), "w", newline="") as fh:
        w = csv.writer(fh); w.writerow(header); w.writerows(it)

write_long("revenue.csv", ["lea_number", "lea_name", "fiscal_year", "measure", "amount", "basis", "source"],
           ((d, names[d], y, m, round(t[d][y], 2), "actuals, governmental funds", src_for(y))
            for d in sorted(names) for y in YEARS
            for m, t in (("local", local), ("state", state_rev), ("federal", federal),
                         ("total_local_state_federal", revenue), ("property_taxes_11xx", proptax))
            if y in t[d]))
write_long("expenditures.csv", ["lea_number", "lea_name", "fiscal_year", "category", "amount", "basis", "source"],
           ((d, names[d], y, c, round(spend[c][d][y], 2), "actuals, governmental funds", src_for(y))
            for d in sorted(names) for y in YEARS for c in CATS if y in spend[c][d]))
write_long("budgets.csv", ["lea_number", "lea_name", "fiscal_year", "fund", "original_budget", "final_budget", "actual", "source"],
           ((d, names[d], y, "10 General Fund", v["original"], v["final"], v["actual"], SRC["tableau"])
            for d in sorted(names) for y, v in bva_for(d).items()))
write_long("enrollment.csv", ["lea_number", "lea_name", "school_year", "october_1_enrollment", "online_school_enrollment", "source"],
           ((d, names[d], y, int(enroll[d][y]), int(online[d][y]) if y in online[d] else "",
             "USBE Fall Enrollment by Grade Level" if y >= 2019 else "USBE Enrollment by LEA (2019 report)")
            for d in sorted(names) for y in EYEARS if y in enroll[d]))
write_long("inflation.csv", ["fiscal_year", "cpi_u_fiscal_year_average", "months_averaged", f"factor_to_fy{CPI_BASE}_dollars", "source"],
           ((fy, round(v, 3), n, cpi_factor[fy], "BLS CPI-U CUUR0000SA0") for fy, (v, n) in sorted(cpi_fy.items())))
write_long("fund_balances.csv", ["lea_number", "lea_name", "fiscal_year", "fund"] + BAL_KEYS + ["total", "source"],
           ((d, names[d], y, "10 General Fund") + tuple(v[k] for k in BAL_KEYS) + (sum(v.values()), src_for(y))
            for d in sorted(names) for y, v in gfbal_for(d).items()))
json.dump(peer_out, open(os.path.join(NORM, "usbe_site_figures.json"), "w"), indent=1)
print(f"wrote data.js (4 districts), statewide.js ({len(names)} districts), and normalized CSVs")
