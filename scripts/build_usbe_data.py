"""Build site figures from USBE Annual Financial Report (AFR) data.

Inputs (preserved originals under site/assets/data/usbe/):
  tableau_afr/afr_expenditures_4_districts_FY2012-FY2024.csv
  tableau_afr/afr_revenues_4_districts_FY2011-FY2024.csv
  tableau_afr/afr_balancesheet_4_districts_FY2011-FY2024.csv
  financial_reporting/reports/annualfinancialreport/2025fiscalyear/... (FY2025 Excel)
  financial_reporting/reports/annualfinancialreport/2024fiscalyear/... (FY2024 Excel, validation only)

Output: replaces the block between "// BEGIN USBE GENERATED" and "// END USBE GENERATED"
in site/assets/data.js, and writes site/assets/data/normalized/usbe_site_figures.json.

Definitions (governmental funds, actuals, nominal dollars):
  revenue      = Local + State + Federal (excludes 5000s other financing sources / special
                 and extraordinary items such as bond proceeds and transfers)
  property tax = revenue codes 1100-1199
  expenditures = all functions; categories by function code (see CATEGORY below)
  admin share  = functions 2300-2599 / current expenditures (excludes 4000s capital, 5000s debt)
  GF balance   = General Fund (10) total fund balance (9800-9899) at fiscal year end

Run: python3 scripts/build_usbe_data.py   (needs openpyxl)
"""
import csv, json, os, re, sys, warnings
from collections import defaultdict

import openpyxl

warnings.filterwarnings("ignore")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "assets", "data", "usbe")
TAB = os.path.join(DATA, "tableau_afr")
AFR = os.path.join(DATA, "financial_reporting", "reports", "annualfinancialreport")
DATA_JS = os.path.join(ROOT, "site", "assets", "data.js")

DISTRICTS = {"30": "tooele", "13": "iron", "04": "cache", "03": "boxelder"}
NAMES = {"Tooele District": "tooele", "Iron District": "iron", "Cache District": "cache", "Box Elder District": "boxelder"}
CATS = ["instruction", "support", "administration", "transportation", "operations", "capital", "debt", "other"]


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


def excel_prefix_code(header):
    """'21xx - Support Services - Students' -> 2100; '1xxx - Instruction' -> 1000."""
    m = re.match(r"\s*(\d)(\d?)x", str(header), re.I)
    if not m: return None
    return int(m.group(1)) * 1000 + (int(m.group(2)) * 100 if m.group(2) else 0)


def rows(path, sheet):
    return list(openpyxl.load_workbook(path, read_only=True, data_only=True)[sheet].iter_rows(values_only=True))


def tree():
    return defaultdict(lambda: defaultdict(float))


# ---------- Tableau extracts (FY2012-FY2024) ----------
spend = defaultdict(tree)          # spend[cat][district][year]
gf_exp = tree()                    # General Fund actual expenditures
bva = defaultdict(lambda: defaultdict(dict))  # bva[district][year][submission] (GF expenditures)
for r in csv.DictReader(open(os.path.join(TAB, "afr_expenditures_4_districts_FY2012-FY2024.csv"))):
    d = DISTRICTS.get(r["lea_number"]); y = int(r["fiscal_year"]); amt = float(r["amount"] or 0)
    if not d or r["fund_type"] != "Governmental": continue
    if r["fund_code"] == "10":
        bva[d][y][r["submission_type"]] = bva[d][y].get(r["submission_type"], 0.0) + amt
    if r["submission_type"] != "Actuals": continue
    spend[category(int(r["function_code"]))][d][y] += amt
    if r["fund_code"] == "10": gf_exp[d][y] += amt

revenue, proptax = tree(), tree()
for r in csv.DictReader(open(os.path.join(TAB, "afr_revenues_4_districts_FY2011-FY2024.csv"))):
    d = DISTRICTS.get(r["lea_number"]); y = int(r["fiscal_year"]); amt = float(r["amount"] or 0)
    if not d or r["submission_type"] != "Actuals" or r["fund_type"] != "Governmental": continue
    if r["revenue_source"] in ("Local", "State", "Federal"): revenue[d][y] += amt
    if r["revenue_code"][:2] == "11": proptax[d][y] += amt

BAL_KEYS = ["nonspendable", "restricted", "committed", "assigned", "unassigned"]
def bal_cat(code):
    c = int(code)
    if c == 9899: return "unassigned"
    return {986: "nonspendable", 987: "restricted", 988: "committed", 989: "assigned"}.get(c // 10)
gf_bal = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))  # [d][y][cat]
for r in csv.DictReader(open(os.path.join(TAB, "afr_balancesheet_4_districts_FY2011-FY2024.csv"))):
    d = DISTRICTS.get(r["lea_number"]); y = int(r["fiscal_year"])
    if not d or r["submission_type"] != "Actuals" or r["fund_code"] != "10" or r["bs_group_1"] != "Fund Balance": continue
    k = bal_cat(r["bs_code"])
    if k: gf_bal[d][y][k] += float(r["amount"] or 0)


# ---------- Excel AFR summaries (FY2025, and FY2024 for validation) ----------
def excel_expenditures(path, sheet):
    """Return {district: {cat: amount}} summing object columns (excludes TOTALS columns)."""
    R = rows(path, sheet)
    hrow = next(i for i, r in enumerate(R[:6]) if r and any(isinstance(c, str) and c.strip().upper() == "TOTALS" for c in r))
    groups, objs = R[hrow - 1], R[hrow]
    name_col = next(j for j, c in enumerate(objs) if c in ("Lea", "LEA Name", "Lea Name"))
    out = {}
    for r in R[hrow + 1:]:
        d = NAMES.get(str(r[name_col]).strip()) if len(r) > name_col else None
        if not d: continue
        acc = defaultdict(float)
        for j in range(name_col + 1, len(r)):
            o = str(objs[j] or "").strip().upper()
            code = excel_prefix_code(groups[j])
            # "2XXX Support Services" is a subtotal of the 21xx-27xx groups; skip it.
            if o in ("", "TOTALS") or code is None or str(groups[j]).strip().upper().startswith("2XXX"): continue
            acc[category(code)] += float(r[j] or 0)
        out[d] = acc
    return out


def excel_fund_total(path, sheet="10"):
    """Per-fund expenditure sheets: return {district: GRAND TOTAL} (header row 6, names in col 3)."""
    R = rows(path, sheet)
    col = list(R[6]).index("GRAND TOTAL")
    return {NAMES[str(r[3]).strip()]: float(r[col] or 0) for r in R[7:] if len(r) > col and str(r[3]).strip() in NAMES}


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
        d = NAMES.get(str(r[name_col]).strip())
        if not d: continue
        rev = sum(float(r[cols[k]] or 0) for k in ("TOTAL LOCAL", "TOTAL STATE", "TOTAL FEDERAL"))
        pt = sum(float(r[j] or 0) for h, j in cols.items() if h[:2] == "11" and h[:4].isdigit())
        out[d] = {"revenue": rev, "proptax": pt}
    return out


def excel_gf_balance(path):
    R = rows(path, "10")
    codes = R[6]; name_col = 3
    out = {}
    for r in R[8:]:
        d = NAMES.get(str(r[name_col]).strip()) if len(r) > name_col else None
        if not d: continue
        acc = defaultdict(float)
        for j, c in enumerate(codes):
            if isinstance(c, str) and c[:2] == "98" or c == "9899":
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
for d in DISTRICTS.values():
    for c, v in exp25[d].items(): spend[c][d][2025] += v
    gf_exp[d][2025] = gfexp25[d]
    revenue[d][2025] = rev25[d]["revenue"]; proptax[d][2025] = rev25[d]["proptax"]
    for k, v in bal25[d].items(): gf_bal[d][2025][k] = v

# Validation: FY2024 Excel vs. Tableau extract
print("FY2024 validation (Excel vs Tableau), $M:")
R24 = rows(os.path.join(F24, "AFR Summary Expenditure AF.xlsx"), "Gov Funds Total")
gt = list(R24[3]).index("Grand Total")
exp24 = {NAMES[str(r[2]).strip()]: {"total": float(r[gt] or 0)} for r in R24[5:] if len(r) > gt and str(r[2]).strip() in NAMES}
rev24 = excel_revenue(os.path.join(F24, "AFR Summary Revenue AF.xlsx"), "Gov Funds Totals")
bal24 = excel_gf_balance(os.path.join(F24, "AFR Summary BalSheet AF.xlsx"))
worst = 0.0
for d in DISTRICTS.values():
    e_x = sum(exp24[d].values()); e_t = sum(spend[c][d][2024] for c in CATS)
    b_x = sum(bal24[d].values()); b_t = sum(gf_bal[d][2024].values())
    for label, a, b in (("expenditures", e_x, e_t), ("revenue", rev24[d]["revenue"], revenue[d][2024]),
                        ("property tax", rev24[d]["proptax"], proptax[d][2024]), ("GF balance", b_x, b_t)):
        pct = 0 if b == 0 else 100 * (a - b) / b; worst = max(worst, abs(pct))
        print(f"  {d:9} {label:13} excel {a/1e6:9.2f}  tableau {b/1e6:9.2f}  diff {pct:+.2f}%")
print(f"largest total-level difference: {worst:.2f}%")


# ---------- Assemble ----------
YEARS = range(2012, 2026)
def series(t, d, digits=0):
    return {y: round(t[d][y], digits) for y in YEARS if y in t[d]}

total_exp = tree()
for c in CATS:
    for d in DISTRICTS.values():
        for y, v in spend[c][d].items(): total_exp[d][y] += v

metrics = {}
def metric(key, label, unit, basis, calc, values, notes=""):
    metrics[key] = {"label": label, "unit": unit, "basis": basis, "calc": calc, "source": "usbe-afr",
                    "ref": "assets/data/usbe/tableau_afr/README.md", "notes": notes, "values": values}

FY25_NOTE = "FY2012–FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries."
metric("revenue_total", "Total revenue", "money", "Nominal dollars, governmental funds",
       "Local + state + federal revenue, actuals. Excludes other financing sources (bond proceeds, transfers, asset sales).",
       {d: series(revenue, d) for d in DISTRICTS.values()}, FY25_NOTE)
metric("property_tax_total", "Property tax revenue", "money", "Nominal dollars, governmental funds",
       "Sum of revenue codes 1100–1199 (property taxes, including tax sales and redemptions and fee-in-lieu).",
       {d: series(proptax, d) for d in DISTRICTS.values()}, FY25_NOTE)
metric("expenditures_total", "Total expenditures", "money", "Nominal dollars, governmental funds",
       "All functions, actuals, including capital construction and debt service.",
       {d: series(total_exp, d) for d in DISTRICTS.values()}, FY25_NOTE)
metric("admin_share", "Administrative spending share", "percent", "Share of current expenditures",
       "(District administration 23xx + school administration 24xx + central business services 25xx) ÷ current expenditures (all functions except 4xxx capital and 5xxx debt service).",
       {d: {y: round(100 * spend["administration"][d][y] /
                     (total_exp[d][y] - spend["capital"][d][y] - spend["debt"][d][y]), 2)
            for y in YEARS if total_exp[d][y]} for d in DISTRICTS.values()},
       "Central business services (25xx) includes fiscal, personnel, public information, and administrative technology. "
       "Coding caution: Tooele reported function 2580 (Administrative Technology Services) for the first time in FY2024 ($4.8M), "
       "the same year its instruction spending fell $15.7M; part of Tooele's FY2024–FY2025 increase may reflect reclassification "
       "rather than new spending (not yet verified). Cache has used 2580 since FY2012; Iron and Box Elder do not use it. " + FY25_NOTE)
metric("gf_fund_balance", "General Fund balance", "money", "Nominal dollars, end of fiscal year",
       "Total General Fund (fund 10) fund balance: nonspendable + restricted + committed + assigned + unassigned.",
       {d: {y: round(sum(gf_bal[d][y].values())) for y in YEARS if y in gf_bal[d]} for d in DISTRICTS.values()}, FY25_NOTE)
metric("gf_fund_balance_pct", "General Fund balance as % of spending", "percent", "Year-end fund balance ÷ General Fund expenditures",
       "Total General Fund fund balance at fiscal year end ÷ General Fund actual expenditures for the same year.",
       {d: {y: round(100 * sum(gf_bal[d][y].values()) / gf_exp[d][y], 2) for y in YEARS if y in gf_bal[d] and gf_exp[d][y]}
        for d in DISTRICTS.values()}, FY25_NOTE)
CAT_LABELS = {"instruction": "Instruction", "support": "Student support", "administration": "Administration",
              "transportation": "Transportation", "operations": "Operations", "capital": "Capital",
              "debt": "Debt service", "other": "Other"}
for c in CATS:
    metric("spend_" + c, CAT_LABELS[c] + " spending", "money", "Nominal dollars, governmental funds",
           "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
           {d: series(spend[c], d) for d in DISTRICTS.values()}, FY25_NOTE)

out = {
    "metrics": metrics,
    "spending2025": {c: round(spend[c]["tooele"][2025]) for c in CATS},
    "budgetVsActual": {d: {y: {"original": round(v.get("Original Budget")) if v.get("Original Budget") is not None else None,
                                "final": round(v.get("Final Budget")) if v.get("Final Budget") is not None else None,
                                "actual": round(v.get("Actuals")) if v.get("Actuals") is not None else None}
                           for y, v in sorted(bva[d].items()) if y >= 2013}
                       for d in DISTRICTS.values()},
    "gfBalance": {d: {y: {k: round(gf_bal[d][y][k]) for k in BAL_KEYS} for y in sorted(gf_bal[d]) if y >= 2012}
                  for d in DISTRICTS.values()},
}

os.makedirs(os.path.join(ROOT, "site", "assets", "data", "normalized"), exist_ok=True)
json.dump(out, open(os.path.join(ROOT, "site", "assets", "data", "normalized", "usbe_site_figures.json"), "w"), indent=1)

js = json.dumps(out, indent=2)
block = ("// BEGIN USBE GENERATED — do not edit by hand; run scripts/build_usbe_data.py\n"
         "window.TSF_USBE = " + js + ";\n// END USBE GENERATED")
src = open(DATA_JS).read()
src = re.sub(r"// BEGIN USBE GENERATED.*?// END USBE GENERATED", lambda m: block, src, flags=re.S)
open(DATA_JS, "w").write(src)
print("updated", DATA_JS)
