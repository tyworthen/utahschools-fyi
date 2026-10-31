/*
 * Utah Schools FYI — site dataset
 *
 * Every figure the site displays comes from this file. A value of `null`
 * means the figure has not yet been collected and verified; the site shows
 * it as "Pending" rather than estimating it.
 *
 * When entering a value:
 *   1. Use the source listed for that figure (see `sources` below).
 *   2. Record the document and page/table/cell in `ref`.
 *   3. Update `updated` at the top of the file.
 * Dollar values are nominal unless the field says otherwise.
 */
window.TSF = {
  updated: "2026-10-30",
  currentFY: 2026,

  districts: {
    tooele:   { name: "Tooele",    full: "Tooele County School District",   role: "Subject", color: "#FACC15", dash: "" },
    iron:     { name: "Iron",      full: "Iron County School District",     role: "Peer",    color: "#2563EB", dash: "6 4" },
    cache:    { name: "Cache",     full: "Cache County School District",    role: "Peer",    color: "#0D9488", dash: "2 4" },
    boxelder: { name: "Box Elder", full: "Box Elder School District",       role: "Peer",    color: "#7C3AED", dash: "10 3 2 3" }
  },

  years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],

  // Homepage KPI strip. Tooele only, current fiscal year.
  kpis: [
    // `metric` KPIs take Tooele's FY2025 value from that metric (see bottom of file).
    { id: "revenue",      label: "Total Revenue",        metric: "revenue_total",      value: null, format: "money", note: "FY2025, excl. bond proceeds & transfers", source: "usbe-afr", href: "compare.html?metric=revenue_total" },
    { id: "expenditures", label: "Total Expenditures",   metric: "expenditures_total", value: null, format: "money", note: "FY2025, incl. construction & debt", source: "usbe-afr", href: "compare.html?metric=expenditures_total" },
    { id: "enrollment",   label: "Enrollment",           value: null, format: "count",   note: "Students, October count",  source: "usbe-gateway", ref: "", href: "compare.html?metric=enrollment" },
    { id: "perstudent",   label: "Spending / Student",   value: null, format: "dollars", note: "FY2026 dollars",           source: "transparent-utah", ref: "", href: "compare.html?metric=spend_per_student" },
    { id: "proptax",      label: "Property Tax Revenue", metric: "property_tax_total", value: null, format: "money", note: "FY2025, governmental funds", source: "usbe-afr", href: "compare.html?metric=property_tax_total" },
    { id: "debt",         label: "Outstanding Debt",     value: null, format: "money",   note: "General obligation bonds", source: "auditor-reports", ref: "", href: "finances.html#debt" }
  ],

  // "Where the money goes": share of a typical $100 of district spending.
  spending: {
    fy: 2025,
    basis: "Tooele actual expenditures by function, governmental funds",
    source: "usbe-afr",
    ref: "assets/data/normalized/usbe_site_figures.json",
    // amounts are filled from TSF_USBE.spending2025 at the bottom of this file
    categories: [
      { id: "instruction",    label: "Instruction",       amount: null, desc: "Teacher salaries and benefits, classroom aides, instructional supplies and materials." },
      { id: "support",        label: "Student support",   amount: null, desc: "Counselors, nurses, psychologists, speech pathologists, and instructional staff support such as libraries and curriculum." },
      { id: "administration", label: "Administration",    amount: null, desc: "School-level administration (principals, front offices) and district administration (board, superintendent, business office)." },
      { id: "transportation", label: "Transportation",    amount: null, desc: "Buses, drivers, fuel, maintenance, and route operations." },
      { id: "operations",     label: "Operations",        amount: null, desc: "Building operation and maintenance, utilities, custodial services, and food services." },
      { id: "capital",        label: "Capital",           amount: null, desc: "Land, construction, building improvements, and major equipment." },
      { id: "debt",           label: "Debt service",      amount: null, desc: "Principal and interest payments on bonds." },
      { id: "other",          label: "Other",             amount: null, desc: "Spending not classified elsewhere, including community services." }
    ]
  },

  // Comparison metrics. values[district][fiscalYear] = number | null
  // Metrics with data (revenue, expenditures, categories, admin share, fund balance) are
  // generated from USBE AFR data and merged in at the bottom of this file.
  metrics: {
    spend_per_student: {
      label: "Spending per student", unit: "dollars", basis: "Nominal dollars",
      calc: "Total current expenditures ÷ fall enrollment.",
      source: "transparent-utah", values: {}
    },
    revenue_per_student: {
      label: "Revenue per student", unit: "dollars", basis: "Nominal dollars",
      calc: "Total revenue, all sources ÷ fall enrollment.",
      source: "transparent-utah", values: {}
    },
    student_teacher: {
      label: "Students per teacher", unit: "ratio", basis: "Students per teacher FTE",
      calc: "Fall enrollment ÷ teacher FTE.",
      source: "usbe-gateway", values: {}
    },
    avg_teacher_comp: {
      label: "Average teacher compensation", unit: "dollars", basis: "Salary + benefits, nominal dollars",
      calc: "Total teacher compensation ÷ teacher headcount.",
      source: "transparent-teacher-pay", values: {}
    },
    debt_per_student: {
      label: "Debt per student", unit: "dollars", basis: "Outstanding GO bond principal, nominal dollars",
      calc: "Outstanding general obligation principal at fiscal year end ÷ fall enrollment.",
      source: "auditor-reports", values: {}
    },
    enrollment: {
      label: "Enrollment", unit: "count", basis: "Fall (October 1) enrollment",
      calc: "As reported; no calculation.",
      source: "usbe-gateway", values: {}
    },
    proptax_per_student: {
      label: "Property tax revenue per student", unit: "dollars", basis: "Nominal dollars",
      calc: "Local property tax revenue ÷ fall enrollment.",
      source: "transparent-revenue", values: {}
    }
  },

  // Annual CPI-U (U.S. city average, annual average) for inflation adjustment.
  // Fiscal-year adjustment method is described on the methodology page.
  cpi: { series: "CUUR0000SA0", values: {} },

  // TCSD property tax rates by levy, from the Utah State Tax Commission
  // "Tax Rates by Area" file for the given tax year.
  taxRates: {
    year: 2025,
    source: "tax-commission-rates",
    ref: "",
    levies: [
      { id: "basic",   label: "Basic school levy (state-set)",      kind: "operating", rate: null },
      { id: "voted",   label: "Voted local levy",                   kind: "operating", rate: null },
      { id: "board",   label: "Board local levy",                   kind: "operating", rate: null },
      { id: "capital", label: "Capital local levy",                 kind: "capital",   rate: null },
      { id: "debt",    label: "Debt service levy",                  kind: "debt",      rate: null },
      { id: "judgment",label: "Judgment recovery levy",             kind: "operating", rate: null }
    ],
    priorYear: null // same shape as `levies` rates, keyed by id, for year-over-year comparison
  },

  // Bond issuance history, for the debt timeline.
  bonds: [
    // { year: 2017, name: "General Obligation School Building Bonds, Series 2017",
    //   principal: null, voterApproved: null, finalMaturity: null,
    //   projects: [], source: "auditor-reports", ref: "" }
  ],

  sources: [
    { id: "usbe-afr", tier: 1, name: "Annual Financial Report (AFR) summaries — revenues, expenditures, balance sheet", publisher: "Utah State Board of Education",
      url: "https://schools.utah.gov/financialoperations/reporting", coverage: "FY2011–FY2025",
      use: "Primary source for district revenue, expenditures by function, budget vs. actual, and fund balances. FY2012–FY2024 from USBE's Tableau Public extracts; FY2025 from the Excel summaries." },
    { id: "tcsd-finance", tier: 1, name: "TCSD Finance Department — budgets and actuals", publisher: "Tooele County School District",
      url: "https://www.tooeleschools.org/departments/finance", coverage: "Budgets and actual results by fund",
      use: "Primary source for detailed TCSD analysis; budget versus actual comparisons." },
    { id: "tcsd-legaudit", tier: 1, name: "2025 Systemic Performance Audit of TCSD", publisher: "Office of the Legislative Auditor General (posted by TCSD)",
      url: "https://www.tooeleschools.org/about-us/legislative-audit-2025", coverage: "2025",
      use: "Independent review of governance, achievement, coordination, policy adherence, and operations; findings and recommendations." },
    { id: "tcsd-auditcommittee", tier: 1, name: "TCSD Audit Committee", publisher: "Tooele County School District",
      url: "https://www.tooeleschools.org/about-us/audit-committee", coverage: "Varies",
      use: "Purchase-card and vendor analysis reports, including the BDO review." },
    { id: "transparent-utah", tier: 1, name: "Transparent Utah — Public Education / K-12 Spending Map", publisher: "Office of the Utah State Auditor",
      url: "https://transparent.utah.gov/spending-map/", coverage: "FY2014–FY2025",
      use: "Standardized expenditures by function for district-to-district comparisons." },
    { id: "transparent-revenue", tier: 1, name: "Transparent Utah — Public School Funding Sources", publisher: "Office of the Utah State Auditor",
      url: "https://transparent.utah.gov/lea-revenue/", coverage: "FY2014–FY2025",
      use: "Local, state, and federal revenue by district." },
    { id: "transparent-teacher-pay", tier: 1, name: "Transparent Utah — Teacher Compensation", publisher: "Office of the Utah State Auditor",
      url: "https://transparent.utah.gov/teacher-pay/", coverage: "FY2014–FY2025",
      use: "Teacher wages and benefits by district, school, and experience." },
    { id: "transparent-lea-pay", tier: 1, name: "Transparent Utah — Administrator & Teacher Pay", publisher: "Office of the Utah State Auditor",
      url: "https://transparent.utah.gov/lea-pay/", coverage: "FY2014–FY2025",
      use: "Compensation by employee category and job title." },
    { id: "auditor-reports", tier: 1, name: "Audited financial statements", publisher: "Office of the Utah State Auditor",
      url: "https://auditor.utah.gov/audit-reports/", coverage: "10+ years",
      use: "Audited figures, debt schedules, audit findings." },
    { id: "usbe-finance", tier: 1, name: "USBE Financial Reporting and UPEFS API", publisher: "Utah State Board of Education",
      url: "https://schools.utah.gov/financialoperations/reporting", coverage: "Multiple years",
      use: "Program-level financial data; automated data retrieval." },
    { id: "usbe-proptax", tier: 1, name: "USBE Property Tax Information", publisher: "Utah State Board of Education",
      url: "https://schools.utah.gov/financialoperations/propertytax", coverage: "Reference",
      use: "How Utah school levies, certified rates, and Truth-in-Taxation work." },
    { id: "tax-commission-rates", tier: 1, name: "Tax Rates by Area", publisher: "Utah State Tax Commission",
      url: "https://files.tax.utah.gov/propertytax/tax-rates/area-rates/taxarearates2025.pdf", coverage: "Annual",
      use: "Adopted levy rates for TCSD by tax area." },
    { id: "usbe-gateway", tier: 1, name: "Utah Educational Data Gateway", publisher: "Utah State Board of Education",
      url: "https://datagateway.schools.utah.gov/", coverage: "Multiple years",
      use: "Enrollment, demographics, staffing, and absenteeism." },
    { id: "usbe-reports", tier: 1, name: "USBE Data & Statistics Reports", publisher: "Utah State Board of Education",
      url: "https://www.schools.utah.gov/datastatistics/reports", coverage: "Multiple years",
      use: "Graduation, assessment results, and enrollment projections." },
    { id: "nces-f33", tier: 2, name: "School District Finance Survey (F-33)", publisher: "National Center for Education Statistics",
      url: "https://nces.ed.gov/CCD/f33agency.asp", coverage: "1990s–present",
      use: "Standardized finance data for statewide and national comparison." },
    { id: "bls-cpi", tier: 2, name: "Consumer Price Index (CPI-U)", publisher: "U.S. Bureau of Labor Statistics",
      url: "https://www.bls.gov/data/", coverage: "Annual",
      use: "Inflation adjustment." },
    { id: "census-acs", tier: 2, name: "American Community Survey", publisher: "U.S. Census Bureau",
      url: "https://data.census.gov/", coverage: "Annual / 5-year",
      use: "County income, poverty, population, and housing context." }
  ]
};

// BEGIN USBE GENERATED — do not edit by hand; run scripts/build_usbe_data.py
window.TSF_USBE = {
  "metrics": {
    "revenue_total": {
      "label": "Total revenue",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Local + state + federal revenue, actuals. Excludes other financing sources (bond proceeds, transfers, asset sales) and state Capital Development Project Grants (code 3750), which USBE's Tableau extract omits.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 90886509,
          "2013": 90692822,
          "2014": 93680758,
          "2015": 98620221,
          "2016": 104402775,
          "2017": 108509804,
          "2018": 111220140,
          "2019": 119460990,
          "2020": 124393585,
          "2021": 133728007,
          "2022": 142099562,
          "2023": 155888839,
          "2024": 175061827,
          "2025": 176028031
        },
        "cache": {
          "2012": 112639460,
          "2013": 114474075,
          "2014": 117321436,
          "2015": 125609387,
          "2016": 138735634,
          "2017": 151097239,
          "2018": 164861579,
          "2019": 175448003,
          "2020": 186397951,
          "2021": 194326409,
          "2022": 219553783,
          "2023": 240644408,
          "2024": 267637512,
          "2025": 274523525
        },
        "iron": {
          "2012": 64535417,
          "2013": 66847168,
          "2014": 72084615,
          "2015": 74101103,
          "2016": 79154752,
          "2017": 82096172,
          "2018": 88068602,
          "2019": 93839771,
          "2020": 98596068,
          "2021": 108817604,
          "2022": 122247214,
          "2023": 143061631,
          "2024": 178033530,
          "2025": 177817112
        },
        "tooele": {
          "2012": 99036403,
          "2013": 108263871,
          "2014": 110078151,
          "2015": 126609098,
          "2016": 130746246,
          "2017": 132897003,
          "2018": 140839589,
          "2019": 165026166,
          "2020": 178121098,
          "2021": 217243835,
          "2022": 239930263,
          "2023": 274640219,
          "2024": 263871305,
          "2025": 253445847
        }
      }
    },
    "expenditures_total": {
      "label": "Total expenditures",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "All functions, actuals, including capital construction and debt service.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 94295863,
          "2013": 90635802,
          "2014": 90866982,
          "2015": 123819199,
          "2016": 100130798,
          "2017": 109246484,
          "2018": 117942473,
          "2019": 116601907,
          "2020": 126304010,
          "2021": 142767837,
          "2022": 154969528,
          "2023": 156621724,
          "2024": 165967282,
          "2025": 164724235
        },
        "cache": {
          "2012": 112329612,
          "2013": 112918672,
          "2014": 122112144,
          "2015": 164672851,
          "2016": 186747534,
          "2017": 180251758,
          "2018": 179236914,
          "2019": 170884935,
          "2020": 188883003,
          "2021": 200450854,
          "2022": 216177011,
          "2023": 237068462,
          "2024": 259174479,
          "2025": 310121857
        },
        "iron": {
          "2012": 73019608,
          "2013": 72919736,
          "2014": 74260625,
          "2015": 71765157,
          "2016": 75862985,
          "2017": 91374735,
          "2018": 88303029,
          "2019": 92090826,
          "2020": 97275146,
          "2021": 104747662,
          "2022": 116183979,
          "2023": 141554991,
          "2024": 186966138,
          "2025": 189763135
        },
        "tooele": {
          "2012": 109616846,
          "2013": 109320552,
          "2014": 109806114,
          "2015": 125950301,
          "2016": 131749970,
          "2017": 151017902,
          "2018": 146546660,
          "2019": 164507998,
          "2020": 172098052,
          "2021": 206609158,
          "2022": 258562159,
          "2023": 307012612,
          "2024": 313160399,
          "2025": 298371758
        }
      }
    },
    "property_tax_total": {
      "label": "Property tax revenue",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Sum of revenue codes 1100\u20131199 (property taxes, including tax sales and redemptions and fee-in-lieu).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 28964150,
          "2013": 32904319,
          "2014": 31826390,
          "2015": 35459117,
          "2016": 38107496,
          "2017": 38419932,
          "2018": 37601477,
          "2019": 39237012,
          "2020": 40279998,
          "2021": 41721400,
          "2022": 44795311,
          "2023": 48075391,
          "2024": 53615956,
          "2025": 55751977
        },
        "cache": {
          "2012": 26390627,
          "2013": 27644206,
          "2014": 27376606,
          "2015": 32137752,
          "2016": 35090152,
          "2017": 37727662,
          "2018": 40571951,
          "2019": 43023965,
          "2020": 48423558,
          "2021": 48913667,
          "2022": 55534612,
          "2023": 59789711,
          "2024": 62142593,
          "2025": 62873147
        },
        "iron": {
          "2012": 19517812,
          "2013": 21239461,
          "2014": 23544557,
          "2015": 23780424,
          "2016": 27162249,
          "2017": 28095215,
          "2018": 30183748,
          "2019": 32209195,
          "2020": 33949345,
          "2021": 34158897,
          "2022": 33222564,
          "2023": 39184407,
          "2024": 43930291,
          "2025": 46641161
        },
        "tooele": {
          "2012": 23523405,
          "2013": 31409473,
          "2014": 31149436,
          "2015": 36784110,
          "2016": 39988147,
          "2017": 42333771,
          "2018": 39982515,
          "2019": 47165605,
          "2020": 51107119,
          "2021": 54058597,
          "2022": 61334414,
          "2023": 66461379,
          "2024": 66477376,
          "2025": 83379893
        }
      }
    },
    "local_share": {
      "label": "Local share of revenue",
      "unit": "percent",
      "basis": "Share of local + state + federal revenue",
      "calc": "Local revenue \u00f7 (local + state + federal revenue), governmental funds, actuals.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 39.68,
          "2013": 44.98,
          "2014": 41.93,
          "2015": 44.51,
          "2016": 44.41,
          "2017": 42.79,
          "2018": 41.51,
          "2019": 40.44,
          "2020": 39.28,
          "2021": 36.58,
          "2022": 37.93,
          "2023": 38.85,
          "2024": 39.21,
          "2025": 39.75
        },
        "cache": {
          "2012": 32.06,
          "2013": 32.04,
          "2014": 31.18,
          "2015": 33.23,
          "2016": 33.05,
          "2017": 33.37,
          "2018": 32.78,
          "2019": 32.67,
          "2020": 32.63,
          "2021": 31.39,
          "2022": 31.83,
          "2023": 33.69,
          "2024": 32.58,
          "2025": 32.64
        },
        "iron": {
          "2012": 36.01,
          "2013": 37.25,
          "2014": 38.08,
          "2015": 37.71,
          "2016": 40.15,
          "2017": 40.33,
          "2018": 40.83,
          "2019": 40.48,
          "2020": 39.29,
          "2021": 34.52,
          "2022": 30.6,
          "2023": 33.4,
          "2024": 31.32,
          "2025": 32.84
        },
        "tooele": {
          "2012": 30.39,
          "2013": 36.03,
          "2014": 34.9,
          "2015": 34.85,
          "2016": 36.34,
          "2017": 37.72,
          "2018": 34.49,
          "2019": 34.64,
          "2020": 33.15,
          "2021": 27.5,
          "2022": 28.4,
          "2023": 29.74,
          "2024": 32.63,
          "2025": 40.42
        }
      }
    },
    "admin_share": {
      "label": "Administrative spending share",
      "unit": "percent",
      "basis": "Share of current expenditures",
      "calc": "(District administration 23xx + school administration 24xx + central business services 25xx) \u00f7 current expenditures (all functions except 4xxx capital and 5xxx debt service).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Coding caution: Tooele reported function 2580 for the first time in FY2024 ($4.8M), the same year its instruction spending fell $15.7M; part of Tooele's FY2024\u2013FY2025 increase may reflect reclassification rather than new spending (not yet verified). Cache has used 2580 since FY2012; Iron and Box Elder do not use it. Central business services (25xx) includes fiscal, personnel, public information, and administrative technology. Districts assign some costs differently \u2014 for example, not every district uses function 2580 (Administrative Technology Services) \u2014 so compare shares with care. FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 8.86,
          "2013": 9.16,
          "2014": 9.14,
          "2015": 8.8,
          "2016": 8.44,
          "2017": 8.59,
          "2018": 7.38,
          "2019": 6.94,
          "2020": 6.94,
          "2021": 6.41,
          "2022": 6.77,
          "2023": 6.75,
          "2024": 6.5,
          "2025": 6.47
        },
        "cache": {
          "2012": 7.31,
          "2013": 7.55,
          "2014": 7.44,
          "2015": 8.07,
          "2016": 8.32,
          "2017": 8.39,
          "2018": 7.22,
          "2019": 8.0,
          "2020": 7.96,
          "2021": 7.46,
          "2022": 7.39,
          "2023": 7.41,
          "2024": 7.44,
          "2025": 7.85
        },
        "iron": {
          "2012": 7.89,
          "2013": 8.19,
          "2014": 8.51,
          "2015": 8.93,
          "2016": 8.95,
          "2017": 8.44,
          "2018": 8.36,
          "2019": 8.43,
          "2020": 8.11,
          "2021": 7.94,
          "2022": 8.38,
          "2023": 9.01,
          "2024": 8.75,
          "2025": 8.57
        },
        "tooele": {
          "2012": 8.21,
          "2013": 8.39,
          "2014": 8.19,
          "2015": 7.71,
          "2016": 7.48,
          "2017": 7.6,
          "2018": 7.57,
          "2019": 7.7,
          "2020": 7.92,
          "2021": 7.17,
          "2022": 7.09,
          "2023": 7.27,
          "2024": 10.87,
          "2025": 12.11
        }
      }
    },
    "instruction_share": {
      "label": "Instruction share of spending",
      "unit": "percent",
      "basis": "Share of current expenditures",
      "calc": "Instruction (1000s) \u00f7 current expenditures (all functions except 4xxx capital and 5xxx debt service).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 61.19,
          "2013": 61.55,
          "2014": 61.86,
          "2015": 58.62,
          "2016": 59.77,
          "2017": 60.9,
          "2018": 63.19,
          "2019": 63.12,
          "2020": 64.17,
          "2021": 65.25,
          "2022": 64.43,
          "2023": 63.26,
          "2024": 63.17,
          "2025": 60.24
        },
        "cache": {
          "2012": 63.46,
          "2013": 65.49,
          "2014": 65.29,
          "2015": 64.76,
          "2016": 64.05,
          "2017": 64.42,
          "2018": 59.72,
          "2019": 63.24,
          "2020": 62.17,
          "2021": 63.57,
          "2022": 61.48,
          "2023": 62.22,
          "2024": 63.13,
          "2025": 61.69
        },
        "iron": {
          "2012": 63.63,
          "2013": 60.6,
          "2014": 66.48,
          "2015": 67.03,
          "2016": 67.34,
          "2017": 66.52,
          "2018": 61.52,
          "2019": 61.14,
          "2020": 60.31,
          "2021": 63.7,
          "2022": 60.97,
          "2023": 61.81,
          "2024": 62.9,
          "2025": 62.76
        },
        "tooele": {
          "2012": 63.99,
          "2013": 62.9,
          "2014": 63.37,
          "2015": 60.19,
          "2016": 60.77,
          "2017": 60.68,
          "2018": 62.26,
          "2019": 61.42,
          "2020": 59.94,
          "2021": 61.41,
          "2022": 62.04,
          "2023": 61.48,
          "2024": 55.22,
          "2025": 56.04
        }
      }
    },
    "gf_fund_balance": {
      "label": "General Fund balance",
      "unit": "money",
      "basis": "Nominal dollars, end of fiscal year",
      "calc": "Total General Fund (fund 10) fund balance: nonspendable + restricted + committed + assigned + unassigned.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 8916620,
          "2015": 9484659,
          "2016": 16315699,
          "2017": 21448685,
          "2018": 24009469,
          "2019": 22806480,
          "2020": 21833148,
          "2021": 19326908,
          "2022": 17449428,
          "2023": 15422715,
          "2024": 20713864,
          "2025": 28940704
        },
        "cache": {
          "2012": 4048407,
          "2013": 5541945,
          "2014": 6316731,
          "2015": 6708102,
          "2016": 9520396,
          "2017": 11461829,
          "2018": 8749817,
          "2019": 10887195,
          "2020": 14629129,
          "2021": 14125852,
          "2022": 15025946,
          "2023": 17409134,
          "2024": 26470349,
          "2025": 33197491
        },
        "iron": {
          "2018": 15452251,
          "2019": 15452251,
          "2020": 20037407,
          "2021": 21777178,
          "2022": 26108223,
          "2023": 33035664,
          "2024": 45094561,
          "2025": 53462911
        },
        "tooele": {
          "2012": 8234201,
          "2013": 8338809,
          "2014": 9224438,
          "2015": 9347242,
          "2016": 11514340,
          "2017": 13875919,
          "2018": 14273369,
          "2019": 17683537,
          "2020": 17702026,
          "2021": 23783663,
          "2022": 28102637,
          "2023": 36731294,
          "2024": 36594667,
          "2025": 40194508
        }
      }
    },
    "gf_fund_balance_pct": {
      "label": "General Fund balance as % of spending",
      "unit": "percent",
      "basis": "Year-end fund balance \u00f7 General Fund expenditures",
      "calc": "Total General Fund fund balance at fiscal year end \u00f7 General Fund actual expenditures for the same year.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2012": 13.25,
          "2015": 13.57,
          "2016": 22.22,
          "2017": 28.53,
          "2018": 29.75,
          "2019": 25.05,
          "2020": 22.4,
          "2021": 17.93,
          "2022": 15.8,
          "2023": 12.43,
          "2024": 15.52,
          "2025": 21.68
        },
        "cache": {
          "2012": 4.54,
          "2013": 6.2,
          "2014": 6.69,
          "2015": 6.85,
          "2016": 9.02,
          "2017": 9.96,
          "2018": 6.64,
          "2019": 8.14,
          "2020": 10.27,
          "2021": 9.03,
          "2022": 8.86,
          "2023": 9.21,
          "2024": 12.88,
          "2025": 15.66
        },
        "iron": {
          "2018": 24.33,
          "2019": 22.81,
          "2020": 27.12,
          "2021": 26.45,
          "2022": 28.17,
          "2023": 31.16,
          "2024": 34.83,
          "2025": 39.33
        },
        "tooele": {
          "2012": 10.68,
          "2013": 10.37,
          "2014": 11.33,
          "2015": 11.01,
          "2016": 13.27,
          "2017": 14.73,
          "2018": 13.52,
          "2019": 14.55,
          "2020": 13.11,
          "2021": 14.37,
          "2022": 16.03,
          "2023": 18.7,
          "2024": 19.1,
          "2025": 21.3
        }
      }
    },
    "gf_budget_variance": {
      "label": "General Fund budget variance",
      "unit": "percent",
      "basis": "Actual vs. final budget, General Fund expenditures",
      "calc": "(Actual \u2212 final budget) \u00f7 final budget, General Fund expenditures. Negative = spent less than budgeted.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2013\u2013FY2024 from the USBE AFR Tableau extracts. FY2025 budgets are not in USBE's FY2025 files.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2013": -3.08,
          "2014": -2.88,
          "2015": -2.33,
          "2016": -8.82,
          "2017": -6.04,
          "2018": -6.93,
          "2019": -3.53,
          "2020": -2.13,
          "2021": 3.82,
          "2022": -8.91,
          "2023": -2.96,
          "2024": -5.48
        },
        "cache": {
          "2013": -9.46,
          "2014": -8.23,
          "2015": -9.55,
          "2016": -11.07,
          "2018": -8.28,
          "2019": -10.25,
          "2020": -12.87,
          "2021": -13.93,
          "2022": -17.24,
          "2023": -13.24,
          "2024": -14.39
        },
        "iron": {
          "2013": -0.72,
          "2014": -0.23,
          "2015": -1.03,
          "2016": -0.76,
          "2017": -1.23,
          "2018": -0.38,
          "2019": -0.74,
          "2020": -0.96,
          "2021": -2.5,
          "2022": -3.4,
          "2023": -5.84,
          "2024": -4.36
        },
        "tooele": {
          "2013": -1.24,
          "2014": -2.28,
          "2015": -1.18,
          "2016": -2.78,
          "2017": -2.31,
          "2018": -0.12,
          "2019": -1.52,
          "2020": -0.05,
          "2021": -4.45,
          "2022": -9.86,
          "2023": -7.25,
          "2024": -3.0
        }
      }
    },
    "spend_instruction": {
      "label": "Instruction spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 45518488,
          "2013": 46339940,
          "2014": 46550071,
          "2015": 48409385,
          "2016": 51132045,
          "2017": 53320035,
          "2018": 58875781,
          "2019": 65501473,
          "2020": 70568379,
          "2021": 79145319,
          "2022": 80565454,
          "2023": 87739339,
          "2024": 94654404,
          "2025": 95204341
        },
        "cache": {
          "2012": 64849877,
          "2013": 67073042,
          "2014": 69148091,
          "2015": 71606116,
          "2016": 76258649,
          "2017": 84114265,
          "2018": 89121328,
          "2019": 95739256,
          "2020": 99466935,
          "2021": 108550992,
          "2022": 117181550,
          "2023": 131858599,
          "2024": 144326318,
          "2025": 145640749
        },
        "iron": {
          "2012": 36760400,
          "2013": 35323953,
          "2014": 39301850,
          "2015": 40445040,
          "2016": 42926814,
          "2017": 46067583,
          "2018": 46234603,
          "2019": 50029109,
          "2020": 53905008,
          "2021": 62215653,
          "2022": 66066639,
          "2023": 74747858,
          "2024": 89978172,
          "2025": 96481346
        },
        "tooele": {
          "2012": 57691834,
          "2013": 58031546,
          "2014": 58942880,
          "2015": 60082308,
          "2016": 62160136,
          "2017": 66241532,
          "2018": 73985549,
          "2019": 84157940,
          "2020": 87200774,
          "2021": 110658766,
          "2022": 120149513,
          "2023": 132594789,
          "2024": 116864794,
          "2025": 117818868
        }
      }
    },
    "spend_support": {
      "label": "Student support spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 3675616,
          "2013": 3594096,
          "2014": 3600253,
          "2015": 3618208,
          "2016": 3743150,
          "2017": 3882374,
          "2018": 4769385,
          "2019": 5353898,
          "2020": 6505527,
          "2021": 7299610,
          "2022": 8204208,
          "2023": 9165018,
          "2024": 9882288,
          "2025": 11994877
        },
        "cache": {
          "2012": 9288087,
          "2013": 6986691,
          "2014": 7897825,
          "2015": 8487775,
          "2016": 9632875,
          "2017": 10439480,
          "2018": 13192242,
          "2019": 14289621,
          "2020": 16092100,
          "2021": 18883555,
          "2022": 23718409,
          "2023": 26739758,
          "2024": 27362931,
          "2025": 28779303
        },
        "iron": {
          "2012": 3099081,
          "2013": 2962885,
          "2014": 3119200,
          "2015": 3218274,
          "2016": 3387565,
          "2017": 4824912,
          "2018": 5575818,
          "2019": 6432616,
          "2020": 7714019,
          "2021": 7864820,
          "2022": 11485813,
          "2023": 12331170,
          "2024": 14480846,
          "2025": 14957522
        },
        "tooele": {
          "2012": 5301173,
          "2013": 5602744,
          "2014": 5586962,
          "2015": 6825073,
          "2016": 6922047,
          "2017": 7767444,
          "2018": 9881940,
          "2019": 13307384,
          "2020": 16392191,
          "2021": 19197415,
          "2022": 21342245,
          "2023": 24243387,
          "2024": 27539072,
          "2025": 24985014
        }
      }
    },
    "spend_administration": {
      "label": "Administration spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 6593240,
          "2013": 6899319,
          "2014": 6881804,
          "2015": 7267200,
          "2016": 7217622,
          "2017": 7522426,
          "2018": 6871780,
          "2019": 7205890,
          "2020": 7637075,
          "2021": 7780273,
          "2022": 8463428,
          "2023": 9358826,
          "2024": 9738440,
          "2025": 10225227
        },
        "cache": {
          "2012": 7467131,
          "2013": 7728871,
          "2014": 7880920,
          "2015": 8919404,
          "2016": 9909946,
          "2017": 10960644,
          "2018": 10771793,
          "2019": 12117070,
          "2020": 12735081,
          "2021": 12731571,
          "2022": 14092962,
          "2023": 15693597,
          "2024": 17010377,
          "2025": 18535671
        },
        "iron": {
          "2012": 4560817,
          "2013": 4775368,
          "2014": 5031912,
          "2015": 5388950,
          "2016": 5707438,
          "2017": 5848674,
          "2018": 6280245,
          "2019": 6902286,
          "2020": 7245521,
          "2021": 7751135,
          "2022": 9081592,
          "2023": 10897027,
          "2024": 12518019,
          "2025": 13167900
        },
        "tooele": {
          "2012": 7401178,
          "2013": 7740553,
          "2014": 7613923,
          "2015": 7698205,
          "2016": 7654535,
          "2017": 8295370,
          "2018": 9000940,
          "2019": 10556606,
          "2020": 11519364,
          "2021": 12914770,
          "2022": 13725969,
          "2023": 15686084,
          "2024": 23006296,
          "2025": 25468452
        }
      }
    },
    "spend_transportation": {
      "label": "Transportation spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 4664000,
          "2013": 4114659,
          "2014": 4082124,
          "2015": 4048228,
          "2016": 4011934,
          "2017": 4030696,
          "2018": 4278163,
          "2019": 5706049,
          "2020": 5488364,
          "2021": 5846512,
          "2022": 5565605,
          "2023": 6320573,
          "2024": 7159406,
          "2025": 7969696
        },
        "cache": {
          "2012": 6603138,
          "2013": 6699983,
          "2014": 6622403,
          "2015": 6467715,
          "2016": 6984579,
          "2017": 7516745,
          "2018": 9961342,
          "2019": 9525930,
          "2020": 10920491,
          "2021": 9929401,
          "2022": 12193856,
          "2023": 11889951,
          "2024": 13596344,
          "2025": 14186371
        },
        "iron": {
          "2012": 2311350,
          "2013": 2348625,
          "2014": 2271010,
          "2015": 2216663,
          "2016": 2302114,
          "2017": 2529531,
          "2018": 2706603,
          "2019": 3384437,
          "2020": 3196558,
          "2021": 3450323,
          "2022": 4003264,
          "2023": 4842775,
          "2024": 5193700,
          "2025": 5339736
        },
        "tooele": {
          "2012": 2975159,
          "2013": 3816834,
          "2014": 3679540,
          "2015": 3548043,
          "2016": 3529825,
          "2017": 3994865,
          "2018": 4232070,
          "2019": 5399850,
          "2020": 4295073,
          "2021": 5272579,
          "2022": 6374116,
          "2023": 6710161,
          "2024": 9331370,
          "2025": 8073632
        }
      }
    },
    "spend_operations": {
      "label": "Operations spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 10401085,
          "2013": 10773671,
          "2014": 10632941,
          "2015": 11118410,
          "2016": 11328962,
          "2017": 11780954,
          "2018": 13599688,
          "2019": 15659389,
          "2020": 15025450,
          "2021": 16344661,
          "2022": 17139800,
          "2023": 20965622,
          "2024": 22717191,
          "2025": 25813961
        },
        "cache": {
          "2012": 13981741,
          "2013": 13935906,
          "2014": 14361633,
          "2015": 14339455,
          "2016": 15345270,
          "2017": 16561703,
          "2018": 25127063,
          "2019": 18753036,
          "2020": 19307642,
          "2021": 19397271,
          "2022": 22021276,
          "2023": 24348022,
          "2024": 25265081,
          "2025": 27760750
        },
        "iron": {
          "2012": 8840595,
          "2013": 9550848,
          "2014": 9289378,
          "2015": 8978012,
          "2016": 9364913,
          "2017": 9752706,
          "2018": 10691366,
          "2019": 11308413,
          "2020": 12800911,
          "2021": 12706154,
          "2022": 13339043,
          "2023": 14432433,
          "2024": 16992621,
          "2025": 19953591
        },
        "tooele": {
          "2012": 15346221,
          "2013": 16231206,
          "2014": 16377372,
          "2015": 16633712,
          "2016": 16876736,
          "2017": 18442910,
          "2018": 18840543,
          "2019": 20157608,
          "2020": 22805335,
          "2021": 28489655,
          "2022": 28275755,
          "2023": 31497637,
          "2024": 29136608,
          "2025": 27299243
        }
      }
    },
    "spend_capital": {
      "label": "Capital spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 13778401,
          "2013": 3704434,
          "2014": 4481078,
          "2015": 4160240,
          "2016": 8371332,
          "2017": 15336637,
          "2018": 18104511,
          "2019": 8861806,
          "2020": 12752501,
          "2021": 17929344,
          "2022": 24724027,
          "2023": 12756162,
          "2024": 10966120,
          "2025": 1521989
        },
        "cache": {
          "2012": 1219585,
          "2013": 1570820,
          "2014": 7263062,
          "2015": 40178045,
          "2016": 53188739,
          "2017": 34547789,
          "2018": 14325746,
          "2019": 3196006,
          "2020": 12162645,
          "2021": 11477804,
          "2022": 6353503,
          "2023": 5190375,
          "2024": 8943967,
          "2025": 52123063
        },
        "iron": {
          "2012": 4987782,
          "2013": 4217933,
          "2014": 5989140,
          "2015": 3496007,
          "2016": 5463106,
          "2017": 15487647,
          "2018": 5668327,
          "2019": 2569163,
          "2020": 234199,
          "2021": 212916,
          "2022": 3443278,
          "2023": 12931711,
          "2024": 32961032,
          "2025": 28265103
        },
        "tooele": {
          "2012": 7562035,
          "2013": 4615053,
          "2014": 4452949,
          "2015": 13622458,
          "2016": 16985188,
          "2017": 27368589,
          "2018": 13130575,
          "2019": 12851810,
          "2020": 11836075,
          "2021": 11403407,
          "2022": 48778521,
          "2023": 73967507,
          "2024": 81609584,
          "2025": 64357596
        }
      }
    },
    "spend_debt": {
      "label": "Debt service spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 6132449,
          "2013": 11645699,
          "2014": 11131928,
          "2015": 37078444,
          "2016": 6217243,
          "2017": 6357150,
          "2018": 6666566,
          "2019": 3971016,
          "2020": 3580146,
          "2021": 3549120,
          "2022": 5199514,
          "2023": 5174230,
          "2024": 5160957,
          "2025": 5151894
        },
        "cache": {
          "2012": 8920052,
          "2013": 8923359,
          "2014": 8938210,
          "2015": 13916435,
          "2016": 14496643,
          "2017": 15141511,
          "2018": 15690934,
          "2019": 16300350,
          "2020": 16716944,
          "2021": 18212881,
          "2022": 19236702,
          "2023": 19968061,
          "2024": 21626621,
          "2025": 21914545
        },
        "iron": {
          "2012": 10262981,
          "2013": 10414092,
          "2014": 9155241,
          "2015": 7928821,
          "2016": 6651363,
          "2017": 6630860,
          "2018": 7476764,
          "2019": 7689104,
          "2020": 7667931,
          "2021": 6871956,
          "2022": 4378332,
          "2023": 7684418,
          "2024": 10954587,
          "2025": 7772749
        },
        "tooele": {
          "2012": 11902493,
          "2013": 12447480,
          "2014": 12336548,
          "2015": 12509086,
          "2016": 12471354,
          "2017": 14476846,
          "2018": 14575124,
          "2019": 14625042,
          "2020": 14771000,
          "2021": 15020032,
          "2022": 16106211,
          "2023": 17371034,
          "2024": 19920596,
          "2025": 23784711
        }
      }
    },
    "spend_other": {
      "label": "Other spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Actual expenditures in the USBE function codes mapped to this category (see the Spending page and methodology).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 3532583,
          "2013": 3563984,
          "2014": 3506784,
          "2015": 8119083,
          "2016": 8108510,
          "2017": 7016211,
          "2018": 4776598,
          "2019": 4342387,
          "2020": 4746566,
          "2021": 4872997,
          "2022": 5107492,
          "2023": 5141955,
          "2024": 5688476,
          "2025": 6842250
        },
        "cache": {
          "2012": 0,
          "2013": 0,
          "2015": 757906,
          "2016": 930832,
          "2017": 969621,
          "2018": 1046465,
          "2019": 963666,
          "2020": 1481166,
          "2021": 1267380,
          "2022": 1378752,
          "2023": 1380099,
          "2024": 1042840,
          "2025": 1181405
        },
        "iron": {
          "2012": 2196602,
          "2013": 3326032,
          "2014": 102894,
          "2015": 93390,
          "2016": 59671,
          "2017": 232822,
          "2018": 3669303,
          "2019": 3775700,
          "2020": 4510999,
          "2021": 3674706,
          "2022": 4386017,
          "2023": 3687600,
          "2024": 3887161,
          "2025": 3825189
        },
        "tooele": {
          "2012": 1436753,
          "2013": 835136,
          "2014": 815939,
          "2015": 5031416,
          "2016": 5150149,
          "2017": 4430347,
          "2018": 2899920,
          "2019": 3451758,
          "2020": 3278241,
          "2021": 3652535,
          "2022": 3809830,
          "2023": 4942014,
          "2024": 5752080,
          "2025": 6584242
        }
      }
    }
  },
  "spending2025": {
    "instruction": 117818868,
    "support": 24985014,
    "administration": 25468452,
    "transportation": 8073632,
    "operations": 27299243,
    "capital": 64357596,
    "debt": 23784711,
    "other": 6584242
  },
  "budgetVsActual": {
    "tooele": {
      "2013": {
        "original": null,
        "final": 81393522,
        "actual": 80381201
      },
      "2014": {
        "original": 81397708,
        "final": 83336980,
        "actual": 81435091
      },
      "2015": {
        "original": 84910842,
        "final": 85914789,
        "actual": 84896751
      },
      "2016": {
        "original": 88690754,
        "final": 89252856,
        "actual": 86767682
      },
      "2017": {
        "original": 92447702,
        "final": 96450190,
        "actual": 94224883
      },
      "2018": {
        "original": 101155641,
        "final": 105661928,
        "actual": 105537999
      },
      "2019": {
        "original": 122269346,
        "final": 123426543,
        "actual": 121554364
      },
      "2020": {
        "original": 131408674,
        "final": 135047257,
        "actual": 134984410
      },
      "2021": {
        "original": 144634549,
        "final": 173229938,
        "actual": 165521961
      },
      "2022": {
        "original": 174667013,
        "final": 194484020,
        "actual": 175307178
      },
      "2023": {
        "original": 199726472,
        "final": 211757620,
        "actual": 196407599
      },
      "2024": {
        "original": 197221220,
        "final": 197511392,
        "actual": 191587472
      }
    },
    "iron": {
      "2013": {
        "original": null,
        "final": 51493825,
        "actual": 51123806
      },
      "2014": {
        "original": 52614043,
        "final": 52217828,
        "actual": 52096151
      },
      "2015": {
        "original": 54539268,
        "final": 54202222,
        "actual": 53642916
      },
      "2016": {
        "original": 57518136,
        "final": 56695727,
        "actual": 56265132
      },
      "2017": {
        "original": 60337470,
        "final": 59693469,
        "actual": 58957932
      },
      "2018": {
        "original": 64362007,
        "final": 63745184,
        "actual": 63503207
      },
      "2019": {
        "original": 66588370,
        "final": 68263872,
        "actual": 67757432
      },
      "2020": {
        "original": 72324216,
        "final": 74609727,
        "actual": 73891695
      },
      "2021": {
        "original": 74318850,
        "final": 84448029,
        "actual": 82339295
      },
      "2022": {
        "original": 91213295,
        "final": 95936219,
        "actual": 92669763
      },
      "2023": {
        "original": 113817782,
        "final": 112605326,
        "actual": 106032346
      },
      "2024": {
        "original": 126235283,
        "final": 135370617,
        "actual": 129463042
      }
    },
    "cache": {
      "2013": {
        "original": null,
        "final": 98722056,
        "actual": 89378902
      },
      "2014": {
        "original": 96673980,
        "final": 102935091,
        "actual": 94463399
      },
      "2015": {
        "original": 100745859,
        "final": 108318305,
        "actual": 97974793
      },
      "2016": {
        "original": 109715524,
        "final": 118687537,
        "actual": 105544957
      },
      "2017": {
        "original": 119809595,
        "final": null,
        "actual": 115091214
      },
      "2018": {
        "original": 125506354,
        "final": 143625309,
        "actual": 131728431
      },
      "2019": {
        "original": 137955319,
        "final": 149059732,
        "actual": 133776892
      },
      "2020": {
        "original": 148495727,
        "final": 163546358,
        "actual": 142496588
      },
      "2021": {
        "original": 153925344,
        "final": 181740880,
        "actual": 156419215
      },
      "2022": {
        "original": 175579405,
        "final": 204873112,
        "actual": 169547685
      },
      "2023": {
        "original": 201761863,
        "final": 217852018,
        "actual": 189013775
      },
      "2024": {
        "original": 217089526,
        "final": 240117737,
        "actual": 205575163
      }
    },
    "boxelder": {
      "2013": {
        "original": null,
        "final": 69711786,
        "actual": 67567196
      },
      "2014": {
        "original": 69241895,
        "final": 69716540,
        "actual": 67712030
      },
      "2015": {
        "original": 70053875,
        "final": 71556889,
        "actual": 69889208
      },
      "2016": {
        "original": 75703607,
        "final": 80534502,
        "actual": 73427903
      },
      "2017": {
        "original": 79334968,
        "final": 80006203,
        "actual": 75176935
      },
      "2018": {
        "original": 82144703,
        "final": 86718383,
        "actual": 80711019
      },
      "2019": {
        "original": 91789159,
        "final": 94368957,
        "actual": 91037744
      },
      "2020": {
        "original": 99978277,
        "final": 99567103,
        "actual": 97449046
      },
      "2021": {
        "original": 100213377,
        "final": 103806986,
        "actual": 107770864
      },
      "2022": {
        "original": 112212367,
        "final": 121200835,
        "actual": 110404500
      },
      "2023": {
        "original": 133615495,
        "final": 127890311,
        "actual": 124100995
      },
      "2024": {
        "original": 138659478,
        "final": 141196388,
        "actual": 133460420
      }
    }
  },
  "gfBalance": {
    "tooele": {
      "2012": {
        "nonspendable": 104511,
        "restricted": 0,
        "committed": 4990125,
        "assigned": 0,
        "unassigned": 3139565
      },
      "2013": {
        "nonspendable": 159181,
        "restricted": 0,
        "committed": 4999934,
        "assigned": 0,
        "unassigned": 3179694
      },
      "2014": {
        "nonspendable": 99690,
        "restricted": 0,
        "committed": 4999934,
        "assigned": 0,
        "unassigned": 4124814
      },
      "2015": {
        "nonspendable": 89718,
        "restricted": 0,
        "committed": 4999934,
        "assigned": 0,
        "unassigned": 4257590
      },
      "2016": {
        "nonspendable": 94780,
        "restricted": 0,
        "committed": 7939497,
        "assigned": 0,
        "unassigned": 3480063
      },
      "2017": {
        "nonspendable": 237121,
        "restricted": 0,
        "committed": 7939497,
        "assigned": 0,
        "unassigned": 5699301
      },
      "2018": {
        "nonspendable": 144550,
        "restricted": 0,
        "committed": 7939497,
        "assigned": 0,
        "unassigned": 6189322
      },
      "2019": {
        "nonspendable": 131689,
        "restricted": 0,
        "committed": 11500000,
        "assigned": 0,
        "unassigned": 6051848
      },
      "2020": {
        "nonspendable": 1322901,
        "restricted": 0,
        "committed": 11500000,
        "assigned": 0,
        "unassigned": 4879125
      },
      "2021": {
        "nonspendable": 1499738,
        "restricted": 0,
        "committed": 13500000,
        "assigned": 0,
        "unassigned": 8783925
      },
      "2022": {
        "nonspendable": 1293992,
        "restricted": 0,
        "committed": 14300000,
        "assigned": 0,
        "unassigned": 12508645
      },
      "2023": {
        "nonspendable": 1005408,
        "restricted": 0,
        "committed": 15300000,
        "assigned": 0,
        "unassigned": 20425886
      },
      "2024": {
        "nonspendable": 751442,
        "restricted": 0,
        "committed": 15300000,
        "assigned": 0,
        "unassigned": 20543224
      },
      "2025": {
        "nonspendable": 448926,
        "restricted": 0,
        "committed": 15300000,
        "assigned": 0,
        "unassigned": 24445582
      }
    },
    "iron": {
      "2018": {
        "nonspendable": 289891,
        "restricted": 2840437,
        "committed": 2400000,
        "assigned": 9718594,
        "unassigned": 203329
      },
      "2019": {
        "nonspendable": 297967,
        "restricted": 3109841,
        "committed": 2400000,
        "assigned": 10384365,
        "unassigned": -739923
      },
      "2020": {
        "nonspendable": 367419,
        "restricted": 2323460,
        "committed": 2400000,
        "assigned": 11247675,
        "unassigned": 3698852
      },
      "2021": {
        "nonspendable": 407447,
        "restricted": 3314683,
        "committed": 2400000,
        "assigned": 10140000,
        "unassigned": 5515047
      },
      "2022": {
        "nonspendable": 379450,
        "restricted": 4446620,
        "committed": 2400000,
        "assigned": 9900000,
        "unassigned": 8982152
      },
      "2023": {
        "nonspendable": 559420,
        "restricted": 7088283,
        "committed": 2400000,
        "assigned": 11700000,
        "unassigned": 11287960
      },
      "2024": {
        "nonspendable": 391786,
        "restricted": 8546372,
        "committed": 2400000,
        "assigned": 12200000,
        "unassigned": 21556403
      },
      "2025": {
        "nonspendable": 359757,
        "restricted": 10389982,
        "committed": 2400000,
        "assigned": 16400000,
        "unassigned": 23913172
      }
    },
    "cache": {
      "2012": {
        "nonspendable": 160791,
        "restricted": 0,
        "committed": 1603222,
        "assigned": 1380790,
        "unassigned": 903604
      },
      "2013": {
        "nonspendable": 158659,
        "restricted": 0,
        "committed": 1845596,
        "assigned": 2578983,
        "unassigned": 958708
      },
      "2014": {
        "nonspendable": 158204,
        "restricted": 0,
        "committed": 1707543,
        "assigned": 3399003,
        "unassigned": 1051981
      },
      "2015": {
        "nonspendable": 227610,
        "restricted": 0,
        "committed": 1638543,
        "assigned": 2948711,
        "unassigned": 1893238
      },
      "2016": {
        "nonspendable": 169047,
        "restricted": 0,
        "committed": 2005420,
        "assigned": 4279188,
        "unassigned": 3066741
      },
      "2017": {
        "nonspendable": 142940,
        "restricted": 0,
        "committed": 2500000,
        "assigned": 4051004,
        "unassigned": 4767885
      },
      "2018": {
        "nonspendable": 160650,
        "restricted": 0,
        "committed": 2500000,
        "assigned": 2468163,
        "unassigned": 3621004
      },
      "2019": {
        "nonspendable": 130918,
        "restricted": 0,
        "committed": 4500000,
        "assigned": 1630626,
        "unassigned": 4625651
      },
      "2020": {
        "nonspendable": 154669,
        "restricted": 0,
        "committed": 5500000,
        "assigned": 2311039,
        "unassigned": 6663421
      },
      "2021": {
        "nonspendable": 156849,
        "restricted": 0,
        "committed": 5500000,
        "assigned": 3346691,
        "unassigned": 5122312
      },
      "2022": {
        "nonspendable": 141933,
        "restricted": 0,
        "committed": 5500000,
        "assigned": 3832117,
        "unassigned": 5551896
      },
      "2023": {
        "nonspendable": 209061,
        "restricted": 0,
        "committed": 5500000,
        "assigned": 3698778,
        "unassigned": 8001295
      },
      "2024": {
        "nonspendable": 154979,
        "restricted": 0,
        "committed": 7500000,
        "assigned": 4951273,
        "unassigned": 13864097
      },
      "2025": {
        "nonspendable": 146729,
        "restricted": 0,
        "committed": 7500000,
        "assigned": 5504599,
        "unassigned": 20046163
      }
    },
    "boxelder": {
      "2012": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 2320000,
        "assigned": 5851554,
        "unassigned": 745066
      },
      "2015": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 3563543,
        "assigned": 4502152,
        "unassigned": 1418963
      },
      "2016": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 4365125,
        "assigned": 10504528,
        "unassigned": 1446047
      },
      "2017": {
        "nonspendable": 0,
        "restricted": 13493849,
        "committed": 3900000,
        "assigned": 0,
        "unassigned": 4054837
      },
      "2018": {
        "nonspendable": 0,
        "restricted": 1042522,
        "committed": 3900000,
        "assigned": 16349600,
        "unassigned": 2717347
      },
      "2019": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 0,
        "assigned": 21380447,
        "unassigned": 1426033
      },
      "2020": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 0,
        "assigned": 20023967,
        "unassigned": 1809180
      },
      "2021": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 0,
        "assigned": 19153480,
        "unassigned": 173429
      },
      "2022": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 0,
        "assigned": 15807297,
        "unassigned": 1642130
      },
      "2023": {
        "nonspendable": 10000,
        "restricted": 0,
        "committed": 3900000,
        "assigned": 10204331,
        "unassigned": 1308384
      },
      "2024": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 7406706,
        "assigned": 13307158,
        "unassigned": 0
      },
      "2025": {
        "nonspendable": 0,
        "restricted": 0,
        "committed": 16614577,
        "assigned": 12326127,
        "unassigned": 0
      }
    }
  }
};
// END USBE GENERATED

// Merge generated USBE figures into the dataset.
(function (T, U) {
  if (!U) return;
  var ordered = {};
  ["revenue_total", "expenditures_total", "property_tax_total", "admin_share", "gf_fund_balance", "gf_fund_balance_pct"]
    .forEach(function (k) { ordered[k] = U.metrics[k]; });
  Object.keys(T.metrics).forEach(function (k) { ordered[k] = T.metrics[k]; });
  Object.keys(U.metrics).forEach(function (k) { if (!ordered[k]) { ordered[k] = U.metrics[k]; ordered[k].hidden = k.indexOf("spend_") === 0; } });
  T.metrics = ordered;
  T.kpis.forEach(function (k) {
    if (k.metric) { var v = (T.metrics[k.metric].values.tooele || {})[2025]; k.value = v == null ? null : v; }
  });
  T.spending.categories.forEach(function (c) { c.amount = U.spending2025[c.id]; });
  T.budgetVsActual = U.budgetVsActual;
  T.gfBalance = U.gfBalance;
})(window.TSF, window.TSF_USBE);
