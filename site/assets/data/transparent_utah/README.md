# Transparent Utah — raw downloads

Raw files downloaded from the Office of the Utah State Auditor's Transparent Utah
dashboards. Do not edit files in `lea_revenue/`; they are the preserved originals.
`manifest.csv` records source URL, dashboard filters, retrieval date, row count, and
SHA-256 for each file. License: CC BY 4.0.

Publisher disclaimer: data is raw, unaudited, and unconsolidated and may not match
audited financial statements.

## lea_revenue/statewide_school_funding_FY2014.csv … FY2025.csv
Source: https://transparent.utah.gov/lea-revenue/ ("Utah Education Funding",
State Wide funding tab, one file per fiscal year, all LEAs, all school levels).
Columns: LEA Name, School, Year, Revenue Source 1, Revenue Source 2,
Charter or District, School Level, Urban or Rural, Total.

Notes:
- Rows with a blank `School` are district-level; rows with a school name are small
  school-level amounts (fees, activities). They are additive, not duplicates.
- Totals include non-revenue inflows: Issuance of Debt, Transfer Between Funds,
  Proceeds from Sale of Capital Assets, Proceeds from insurance settlements.
  Exclude these when measuring revenue.

## lea_revenue_summary_4_districts.csv (derived)
Tooele, Iron, Cache, Box Elder by fiscal year: total of all rows, debt proceeds,
transfers/other non-revenue, revenue excluding those, local/state/federal/other
(excluding non-revenue), and property taxes. Nominal dollars. `flag` marks values
that look anomalous and must be verified before publication.
