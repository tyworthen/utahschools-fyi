# USBE AFR Expenditures — Tableau Public extract

Source page: https://schools.utah.gov/financialoperations/reporting/afrexpenditures.php
Embedded viz: https://public.tableau.com/views/AFRSummaryReport-Expenditures/AFRSummaryReport-ExpendituresHorizontal
Publisher: Utah State Board of Education, Data and Statistics (Tableau Public profile `data.and.statistics`)
Retrieved: 2026-10-31, using the viz's own Download → Tableau Workbook option (enabled by the author).

## Files
- `AFR Summary Report- Expenditures.twbx` — original workbook as downloaded. Do not edit.
- `extracted_expenditures/` — the .twbx unzipped; `Data/TableauTemp/*.hyper` is the data extract.
- `afr_expenditures_all_leas_FY2012-FY2024.csv.gz` — every row of the extract (1,417,122 rows,
  all districts and charter schools), key columns only.
- `afr_expenditures_4_districts_FY2012-FY2024.csv` — same, Tooele (30), Iron (13), Cache (04),
  Box Elder (03) only.
- `summary_actuals_by_function_4_districts.csv` — actual expenditures, governmental funds,
  by district, fiscal year, and function group.
- `summary_general_fund_budget_vs_actual_4_districts.csv` — General Fund (fund 10) original
  budget, final budget, actual, and actual minus final budget.

## Coverage
- Actuals: FY2012–FY2024. Original and final budgets: FY2013/14–FY2024 (one stray FY2010 budget set).
- Granularity: LEA × fund × function × program × object × submission type
  (Actuals / Original Budget / Final Budget). District-level, not school-level.
- The Tableau Year filter only shows 2015–2024; the extract contains more.

## Validation
Tooele FY2024 General Fund actuals: extract $191,587,472.12 vs. USBE Excel AFR summary
(`../financial_reporting/.../AFR Summary Expenditure AF.xlsx`, sheet 10) $191,337,472.00.
Difference $250,000.12 (0.13%), unexplained; likely a single line item (e.g. a transfer object
or post-publication amendment). Investigate before publishing General Fund totals to the dollar.

## Columns
fiscal_year, submission_type, lea_type, lea_number, lea_name, fund_code, fund, fund_type,
function_code, function_group, function, program_code, program, object_code, object_group,
object, amount (nominal dollars).

---

# Revenues and Balance Sheet (added 2026-10-31)

Same method: each viz's Download → Tableau Workbook option.
- Revenues: https://schools.utah.gov/financialoperations/reporting/afrrevenue.php
  (viz `AFRSummaryReport-Revenues/AFRSummaryReport-Revenues`)
- Balance sheet: https://schools.utah.gov/financialoperations/reporting/afrbalancesheet.php
  (viz `AFRSummaryReport-BalanceSheet/BalanceSheetAFR`)

## Files
- `AFR Summary Report- Revenues.twbx`, `AFR Summary Report- Balance Sheet.twbx` — originals.
- `extracted_revenues/`, `extracted_balancesheet/` — unzipped workbooks with .hyper extracts.
- `afr_revenues_all_leas_FY2011-FY2024.csv.gz` (301,214 rows) and
  `afr_revenues_4_districts_FY2011-FY2024.csv`.
  Columns: fiscal_year, submission_type, lea_type, lea_number, lea_name, fund_code, fund,
  fund_type, revenue_source (Local/State/Federal/Other), revenue_group_1, revenue_group_2,
  revenue_code, revenue, revenue_parent, program_code, program, amount.
- `afr_balancesheet_all_leas_FY2011-FY2024.csv.gz` (37,450 rows) and
  `afr_balancesheet_4_districts_FY2011-FY2024.csv`.
  Columns: fiscal_year, submission_type, lea_type, lea_number, lea_name, fund_code, fund,
  fund_type, bs_group_1 (Assets/Liabilities/Fund Balance), bs_group_2, bs_code, bs_item, amount.
- `summary_revenue_by_source_4_districts.csv` — actuals, all funds: local, state, federal,
  other financing sources (5000s, includes bond proceeds and transfers), revenue excluding
  other financing, and property taxes (revenue codes 1100–1199).
- `summary_general_fund_revenue_budget_vs_actual_4_districts.csv` — fund 10, excluding other
  financing sources.
- `summary_fund_balance_by_fund_4_districts.csv` — actual year-end fund balance by fund:
  nonspendable (986x), restricted (987x), committed (988x), assigned (989x except 9899),
  unassigned (9899), total.

## Coverage
Revenue actuals FY2012–FY2024; balance sheet actuals FY2011–FY2024; budgets FY2013/14–FY2024.

## Cross-check against Transparent Utah (../../transparent_utah/)
Revenue excluding other financing sources vs. Transparent Utah revenue excluding debt/transfers:
- Tooele: within 1.1% every year FY2016–FY2024; property taxes match to $0.1M.
- Box Elder: within 1% except FY2021 (Transparent Utah 11% higher).
- Iron: Transparent Utah FY2021 ($156.6M) and FY2022 ($56.1M) disagree with USBE
  ($108.8M, $122.2M); property taxes likewise. USBE values are consistent with adjacent years.
- Cache: diverges from FY2020 onward, growing to −20.7% in FY2024 (USBE higher). Unexplained.

## Personal information removed (2026-10-31)
The workbooks recorded a USBE staff member's Windows user folder in data-source paths and an
"Edited by <name>" note in the embedded SQL comment. Both were redacted by
`scripts/strip_metadata.py` in the `.twbx` files and the `extracted_*` copies. Data, queries,
and extracts are otherwise unchanged. Original and published checksums are in
`../../reference/metadata_redactions.csv`.
