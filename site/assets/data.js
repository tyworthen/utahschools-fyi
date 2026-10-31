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
    { id: "enrollment",   label: "Enrollment",           metric: "enrollment",         value: null, format: "count", note: "October 1, 2024 (FY2025)", source: "usbe-gateway", href: "compare.html?metric=enrollment" },
    { id: "perstudent",   label: "Spending / Student",   metric: "spend_per_student",  value: null, format: "dollars", note: "FY2025, current spending, nominal", source: "usbe-afr", href: "compare.html?metric=spend_per_student" },
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
    }
  },

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
    { id: "usbe-enrollment", tier: 1, name: "Fall Enrollment by Grade Level and Demographics; Enrollment by LEA; Average Daily Membership", publisher: "Utah State Board of Education",
      url: "https://www.schools.utah.gov/datastatistics/reports", coverage: "October 2014–October 2026",
      use: "October 1 enrollment by district and school, used for per-student figures; ADM used as a cross-check." },
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
    },
    "enrollment": {
      "label": "Enrollment",
      "unit": "count",
      "basis": "October 1 enrollment, K-12",
      "calc": "As reported by USBE; no calculation.",
      "source": "usbe-enrollment",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": 11238,
          "2016": 11341,
          "2017": 11572,
          "2018": 11671,
          "2019": 11770,
          "2020": 11914,
          "2021": 11832,
          "2022": 12296,
          "2023": 12338,
          "2024": 12268,
          "2025": 12244,
          "2026": 12087,
          "2027": 11741
        },
        "cache": {
          "2015": 16457,
          "2016": 16976,
          "2017": 17536,
          "2018": 17895,
          "2019": 18270,
          "2020": 18802,
          "2021": 18833,
          "2022": 19554,
          "2023": 19731,
          "2024": 19794,
          "2025": 19847,
          "2026": 19720,
          "2027": 19560
        },
        "iron": {
          "2015": 8814,
          "2016": 8933,
          "2017": 9074,
          "2018": 9169,
          "2019": 9395,
          "2020": 9544,
          "2021": 10748,
          "2022": 11830,
          "2023": 12421,
          "2024": 14479,
          "2025": 13883,
          "2026": 13407,
          "2027": 12791
        },
        "tooele": {
          "2015": 13873,
          "2016": 13988,
          "2017": 14332,
          "2018": 16154,
          "2019": 16903,
          "2020": 17608,
          "2021": 22004,
          "2022": 22939,
          "2023": 23828,
          "2024": 15588,
          "2025": 15619,
          "2026": 15737,
          "2027": 15463
        }
      }
    },
    "spend_per_student": {
      "label": "Spending per student",
      "unit": "dollars",
      "basis": "Current expenditures \u00f7 October 1 enrollment, nominal dollars",
      "calc": "Current expenditures (all functions except 4xxx capital and 5xxx debt service, governmental funds) \u00f7 October 1 enrollment for the same school year.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level. FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": 7348,
          "2016": 7543,
          "2017": 7566,
          "2018": 7983,
          "2019": 8816,
          "2020": 9230,
          "2021": 10251,
          "2022": 10170,
          "2023": 11241,
          "2024": 12214,
          "2025": 12908
        },
        "cache": {
          "2015": 6719,
          "2016": 7014,
          "2017": 7445,
          "2018": 8339,
          "2019": 8286,
          "2020": 8510,
          "2021": 9067,
          "2022": 9747,
          "2023": 10740,
          "2024": 11549,
          "2025": 11895
        },
        "iron": {
          "2015": 6846,
          "2016": 7136,
          "2017": 7632,
          "2018": 8197,
          "2019": 8710,
          "2020": 9364,
          "2021": 9087,
          "2022": 9160,
          "2023": 9737,
          "2024": 9880,
          "2025": 11073
        },
        "tooele": {
          "2015": 7195,
          "2016": 7313,
          "2017": 7617,
          "2018": 7357,
          "2019": 8107,
          "2020": 8263,
          "2021": 8189,
          "2022": 8443,
          "2023": 9051,
          "2024": 13576,
          "2025": 13460
        }
      }
    },
    "revenue_per_student": {
      "label": "Revenue per student",
      "unit": "dollars",
      "basis": "Revenue \u00f7 October 1 enrollment, nominal dollars",
      "calc": "Local + state + federal revenue (excludes bond proceeds and transfers) \u00f7 October 1 enrollment.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level. FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": 8776,
          "2016": 9206,
          "2017": 9377,
          "2018": 9530,
          "2019": 10150,
          "2020": 10441,
          "2021": 11302,
          "2022": 11557,
          "2023": 12635,
          "2024": 14270,
          "2025": 14377
        },
        "cache": {
          "2015": 7633,
          "2016": 8172,
          "2017": 8616,
          "2018": 9213,
          "2019": 9603,
          "2020": 9914,
          "2021": 10318,
          "2022": 11228,
          "2023": 12196,
          "2024": 13521,
          "2025": 13832
        },
        "iron": {
          "2015": 8407,
          "2016": 8861,
          "2017": 9047,
          "2018": 9605,
          "2019": 9988,
          "2020": 10331,
          "2021": 10124,
          "2022": 10334,
          "2023": 11518,
          "2024": 12296,
          "2025": 12808
        },
        "tooele": {
          "2015": 9126,
          "2016": 9347,
          "2017": 9273,
          "2018": 8719,
          "2019": 9763,
          "2020": 10116,
          "2021": 9873,
          "2022": 10459,
          "2023": 11526,
          "2024": 16928,
          "2025": 16227
        }
      }
    },
    "proptax_per_student": {
      "label": "Property tax revenue per student",
      "unit": "dollars",
      "basis": "Property taxes \u00f7 October 1 enrollment, nominal dollars",
      "calc": "Revenue codes 1100\u20131199 \u00f7 October 1 enrollment.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level. FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": 3155,
          "2016": 3360,
          "2017": 3320,
          "2018": 3222,
          "2019": 3334,
          "2020": 3381,
          "2021": 3526,
          "2022": 3643,
          "2023": 3897,
          "2024": 4370,
          "2025": 4553
        },
        "cache": {
          "2015": 1953,
          "2016": 2067,
          "2017": 2151,
          "2018": 2267,
          "2019": 2355,
          "2020": 2575,
          "2021": 2597,
          "2022": 2840,
          "2023": 3030,
          "2024": 3139,
          "2025": 3168
        },
        "iron": {
          "2015": 2698,
          "2016": 3041,
          "2017": 3096,
          "2018": 3292,
          "2019": 3428,
          "2020": 3557,
          "2021": 3178,
          "2022": 2808,
          "2023": 3155,
          "2024": 3034,
          "2025": 3360
        },
        "tooele": {
          "2015": 2651,
          "2016": 2859,
          "2017": 2954,
          "2018": 2475,
          "2019": 2790,
          "2020": 2902,
          "2021": 2457,
          "2022": 2674,
          "2023": 2789,
          "2024": 4265,
          "2025": 5338
        }
      }
    },
    "instruction_per_student": {
      "label": "Instruction spending per student",
      "unit": "dollars",
      "basis": "Instruction \u00f7 October 1 enrollment, nominal dollars",
      "calc": "Function 1000s (instruction) \u00f7 October 1 enrollment.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level. FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": 4308,
          "2016": 4509,
          "2017": 4608,
          "2018": 5045,
          "2019": 5565,
          "2020": 5923,
          "2021": 6689,
          "2022": 6552,
          "2023": 7111,
          "2024": 7716,
          "2025": 7776
        },
        "cache": {
          "2015": 4351,
          "2016": 4492,
          "2017": 4797,
          "2018": 4980,
          "2019": 5240,
          "2020": 5290,
          "2021": 5764,
          "2022": 5993,
          "2023": 6683,
          "2024": 7291,
          "2025": 7338
        },
        "iron": {
          "2015": 4589,
          "2016": 4805,
          "2017": 5077,
          "2018": 5042,
          "2019": 5325,
          "2020": 5648,
          "2021": 5789,
          "2022": 5585,
          "2023": 6018,
          "2024": 6214,
          "2025": 6950
        },
        "tooele": {
          "2015": 4331,
          "2016": 4444,
          "2017": 4622,
          "2018": 4580,
          "2019": 4979,
          "2020": 4952,
          "2021": 5029,
          "2022": 5238,
          "2023": 5565,
          "2024": 7497,
          "2025": 7543
        }
      }
    },
    "admin_per_student": {
      "label": "Administration spending per student",
      "unit": "dollars",
      "basis": "Administration \u00f7 October 1 enrollment, nominal dollars",
      "calc": "Functions 2300\u20132599 \u00f7 October 1 enrollment.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level. FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": 647,
          "2016": 636,
          "2017": 650,
          "2018": 589,
          "2019": 612,
          "2020": 641,
          "2021": 658,
          "2022": 688,
          "2023": 759,
          "2024": 794,
          "2025": 835
        },
        "cache": {
          "2015": 542,
          "2016": 584,
          "2017": 625,
          "2018": 602,
          "2019": 663,
          "2020": 677,
          "2021": 676,
          "2022": 721,
          "2023": 795,
          "2024": 859,
          "2025": 934
        },
        "iron": {
          "2015": 611,
          "2016": 639,
          "2017": 645,
          "2018": 685,
          "2019": 735,
          "2020": 759,
          "2021": 721,
          "2022": 768,
          "2023": 877,
          "2024": 865,
          "2025": 948
        },
        "tooele": {
          "2015": 555,
          "2016": 547,
          "2017": 579,
          "2018": 557,
          "2019": 625,
          "2020": 654,
          "2021": 587,
          "2022": 598,
          "2023": 658,
          "2024": 1476,
          "2025": 1631
        }
      }
    },
    "enrollment_growth": {
      "label": "Enrollment change since FY2016",
      "unit": "percent",
      "basis": "October 1 enrollment vs. FY2016",
      "calc": "(Enrollment \u00f7 FY2016 enrollment \u2212 1) \u00d7 100.",
      "source": "usbe-enrollment",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": -0.91,
          "2016": 0.0,
          "2017": 2.04,
          "2018": 2.91,
          "2019": 3.78,
          "2020": 5.05,
          "2021": 4.33,
          "2022": 8.42,
          "2023": 8.79,
          "2024": 8.17,
          "2025": 7.96,
          "2026": 6.58,
          "2027": 3.53
        },
        "cache": {
          "2015": -3.06,
          "2016": 0.0,
          "2017": 3.3,
          "2018": 5.41,
          "2019": 7.62,
          "2020": 10.76,
          "2021": 10.94,
          "2022": 15.19,
          "2023": 16.23,
          "2024": 16.6,
          "2025": 16.91,
          "2026": 16.16,
          "2027": 15.22
        },
        "iron": {
          "2015": -1.33,
          "2016": 0.0,
          "2017": 1.58,
          "2018": 2.64,
          "2019": 5.17,
          "2020": 6.84,
          "2021": 20.32,
          "2022": 32.43,
          "2023": 39.05,
          "2024": 62.08,
          "2025": 55.41,
          "2026": 50.08,
          "2027": 43.19
        },
        "tooele": {
          "2015": -0.82,
          "2016": 0.0,
          "2017": 2.46,
          "2018": 15.48,
          "2019": 20.84,
          "2020": 25.88,
          "2021": 57.31,
          "2022": 63.99,
          "2023": 70.35,
          "2024": 11.44,
          "2025": 11.66,
          "2026": 12.5,
          "2027": 10.54
        }
      }
    },
    "spend_per_student_real_change": {
      "label": "Spending per student, inflation-adjusted change since FY2016",
      "unit": "percent",
      "basis": "Change in spending per student since FY2016, in FY2026 dollars",
      "calc": "(Spending per student \u00d7 CPI factor) \u00f7 (FY2016 spending per student \u00d7 FY2016 CPI factor) \u2212 1, using BLS CPI-U fiscal-year averages (FY2026 dollars).",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "Tooele: the district's online program (Blue Peak High through October 2020, then the Digital Education Center) had 2,817 students in October 2018, 9,476 in October 2020, and 8,882 in October 2022, then 263 in October 2023. Per-student figures before and after FY2024 therefore divide by very different student populations. October 1 enrollment (school year = fiscal year). Districts that run online schools count those students, and online students generally cost less to serve, so per-student figures are not directly comparable across districts or years when online enrollment changes. FY2015\u2013FY2018 counts come from USBE's Enrollment by LEA report; FY2019 onward from Fall Enrollment by Grade Level. Adjusted with BLS CPI-U (U.S. city average, all items), July\u2013June fiscal-year averages, to FY2026 dollars. October 2025 was not published by BLS, so FY2026 averages 11 months.",
      "hidden": false,
      "values": {
        "boxelder": {
          "2015": -1.93,
          "2016": 0.0,
          "2017": -1.51,
          "2018": 1.63,
          "2019": 9.96,
          "2020": 13.35,
          "2021": 23.05,
          "2022": 13.91,
          "2023": 18.49,
          "2024": 24.63,
          "2025": 28.33
        },
        "cache": {
          "2015": -3.56,
          "2016": 0.0,
          "2017": 4.23,
          "2018": 14.17,
          "2019": 11.14,
          "2020": 12.39,
          "2021": 17.05,
          "2022": 17.41,
          "2023": 21.74,
          "2024": 26.73,
          "2025": 27.18
        },
        "iron": {
          "2015": -3.42,
          "2016": 0.0,
          "2017": 5.02,
          "2018": 10.31,
          "2019": 14.83,
          "2020": 21.55,
          "2021": 15.3,
          "2022": 8.45,
          "2023": 8.49,
          "2024": 6.57,
          "2025": 16.37
        },
        "tooele": {
          "2015": -0.95,
          "2016": 0.0,
          "2017": 2.28,
          "2018": -3.39,
          "2019": 4.29,
          "2020": 4.66,
          "2021": 1.39,
          "2022": -2.46,
          "2023": -1.6,
          "2024": 42.89,
          "2025": 38.03
        }
      }
    },
    "spend_admin_district": {
      "label": "District administration spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Functions 2300\u20132399: board of education, elections, superintendent's office.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 600741,
          "2013": 581357,
          "2014": 600357,
          "2015": 691032,
          "2016": 753902,
          "2017": 838468,
          "2018": 819804,
          "2019": 787802,
          "2020": 919380,
          "2021": 882093,
          "2022": 1114160,
          "2023": 1045127,
          "2024": 1175875,
          "2025": 1308334
        },
        "cache": {
          "2012": 468791,
          "2013": 465602,
          "2014": 543411,
          "2015": 553962,
          "2016": 579727,
          "2017": 631409,
          "2018": 624829,
          "2019": 703920,
          "2020": 816662,
          "2021": 675018,
          "2022": 830590,
          "2023": 970564,
          "2024": 962954,
          "2025": 849373
        },
        "iron": {
          "2012": 424917,
          "2013": 413696,
          "2014": 385184,
          "2015": 444941,
          "2016": 483552,
          "2017": 692620,
          "2018": 723135,
          "2019": 854705,
          "2020": 811911,
          "2021": 791452,
          "2022": 1074417,
          "2023": 1240928,
          "2024": 1167968,
          "2025": 1315128
        },
        "tooele": {
          "2012": 732619,
          "2013": 749241,
          "2014": 629965,
          "2015": 669738,
          "2016": 764744,
          "2017": 806425,
          "2018": 914657,
          "2019": 959735,
          "2020": 954403,
          "2021": 1004328,
          "2022": 1214991,
          "2023": 1433900,
          "2024": 2161492,
          "2025": 1604624
        }
      }
    },
    "spend_admin_school": {
      "label": "School administration spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Functions 2400\u20132499: office of the principal and other school administration.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 4262246,
          "2013": 4200392,
          "2014": 4495652,
          "2015": 4544868,
          "2016": 4591675,
          "2017": 4699650,
          "2018": 5184691,
          "2019": 5541869,
          "2020": 5744381,
          "2021": 5853071,
          "2022": 6139192,
          "2023": 6994671,
          "2024": 7389834,
          "2025": 7570736
        },
        "cache": {
          "2012": 5236975,
          "2013": 5462285,
          "2014": 5527464,
          "2015": 5829763,
          "2016": 6251212,
          "2017": 6950529,
          "2018": 7624827,
          "2019": 7923105,
          "2020": 8267277,
          "2021": 8480700,
          "2022": 9140575,
          "2023": 9858285,
          "2024": 10509270,
          "2025": 11035036
        },
        "iron": {
          "2012": 3026514,
          "2013": 3230891,
          "2014": 3402800,
          "2015": 3588782,
          "2016": 3737313,
          "2017": 3802253,
          "2018": 4144191,
          "2019": 4368056,
          "2020": 4704447,
          "2021": 5176642,
          "2022": 5475117,
          "2023": 6189625,
          "2024": 7534073,
          "2025": 8550270
        },
        "tooele": {
          "2012": 5546605,
          "2013": 5837309,
          "2014": 5779097,
          "2015": 5911278,
          "2016": 5794994,
          "2017": 6177834,
          "2018": 6648827,
          "2019": 7799946,
          "2020": 8408057,
          "2021": 9482526,
          "2022": 9930104,
          "2023": 11253284,
          "2024": 12552364,
          "2025": 12543728
        }
      }
    },
    "spend_admin_central": {
      "label": "Central business services spending",
      "unit": "money",
      "basis": "Nominal dollars, governmental funds",
      "calc": "Functions 2500\u20132599: fiscal, purchasing, public information, personnel, and administrative technology services.",
      "source": "usbe-afr",
      "ref": "assets/data/normalized/",
      "notes": "FY2012\u2013FY2024 from the USBE AFR Tableau extracts; FY2025 from the USBE AFR Excel summaries.",
      "hidden": true,
      "values": {
        "boxelder": {
          "2012": 1730253,
          "2013": 2117570,
          "2014": 1785795,
          "2015": 2031300,
          "2016": 1872045,
          "2017": 1984309,
          "2018": 867286,
          "2019": 876218,
          "2020": 973314,
          "2021": 1045110,
          "2022": 1210075,
          "2023": 1319029,
          "2024": 1172731,
          "2025": 1346158
        },
        "cache": {
          "2012": 1761366,
          "2013": 1800984,
          "2014": 1810045,
          "2015": 2535679,
          "2016": 3079007,
          "2017": 3378706,
          "2018": 2522137,
          "2019": 3490045,
          "2020": 3651142,
          "2021": 3575853,
          "2022": 4121797,
          "2023": 4864748,
          "2024": 5538152,
          "2025": 6651262
        },
        "iron": {
          "2012": 1109387,
          "2013": 1130781,
          "2014": 1243928,
          "2015": 1355227,
          "2016": 1486573,
          "2017": 1353801,
          "2018": 1412920,
          "2019": 1679524,
          "2020": 1729163,
          "2021": 1783041,
          "2022": 2532059,
          "2023": 3466474,
          "2024": 3815978,
          "2025": 3302501
        },
        "tooele": {
          "2012": 1121953,
          "2013": 1154003,
          "2014": 1204861,
          "2015": 1117189,
          "2016": 1094797,
          "2017": 1311111,
          "2018": 1437456,
          "2019": 1796925,
          "2020": 2156904,
          "2021": 2427916,
          "2022": 2580874,
          "2023": 2998900,
          "2024": 8292441,
          "2025": 11320100
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
  },
  "adminDetail": {
    "tooele": {
      "functions": {
        "2300": {
          "name": "SUPPORT SERVICES - GENERAL DIST ADMIN",
          "values": {
            "2018": 1105
          }
        },
        "2311": {
          "name": "Supervision of Board of Education Services",
          "values": {
            "2012": 732619,
            "2013": 749241,
            "2014": 629965,
            "2015": 669738,
            "2016": 764744,
            "2017": 806425,
            "2018": 913552,
            "2019": 959735,
            "2020": 954403,
            "2021": 1004328,
            "2022": 1183870,
            "2023": 1199389,
            "2024": 1884279
          }
        },
        "2312": {
          "name": "Election Services",
          "values": {
            "2022": 31121,
            "2023": 234511,
            "2024": 277213
          }
        },
        "2410": {
          "name": "Office of the Principal",
          "values": {
            "2012": 5546605,
            "2013": 5837309,
            "2014": 5779097,
            "2015": 5911278,
            "2016": 5794994,
            "2017": 6177834,
            "2018": 6648827,
            "2019": 7799946,
            "2020": 8408057,
            "2021": 9482526,
            "2022": 9930104,
            "2023": 11253284,
            "2024": 12552364
          }
        },
        "2500": {
          "name": "SUPPORT SERVICES - Central Services",
          "values": {
            "2017": 4660,
            "2018": 8932,
            "2019": 1000,
            "2020": -25,
            "2021": 8467,
            "2022": 24143,
            "2023": 26361,
            "2024": 39097
          }
        },
        "2510": {
          "name": "Fiscal Services",
          "values": {
            "2012": 798985,
            "2013": 805243,
            "2014": 857342,
            "2015": 794411,
            "2016": 740848,
            "2017": 779584,
            "2018": 824840,
            "2019": 930012,
            "2020": 1354951,
            "2021": 1460304,
            "2022": 1571284,
            "2023": 1752224,
            "2024": 2015829
          }
        },
        "2560": {
          "name": "Public Information Services",
          "values": {
            "2017": 90794,
            "2018": 104533,
            "2019": 184653,
            "2020": 186383,
            "2021": 198747,
            "2022": 208110,
            "2023": 360949,
            "2024": 377417
          }
        },
        "2570": {
          "name": "Personnel Services",
          "values": {
            "2012": 322969,
            "2013": 348760,
            "2014": 347519,
            "2015": 322778,
            "2016": 353949,
            "2017": 436073,
            "2018": 499151,
            "2019": 681260,
            "2020": 615596,
            "2021": 760397,
            "2022": 777337,
            "2023": 859367,
            "2024": 1043594
          }
        },
        "2580": {
          "name": "Administrative Technology Services",
          "values": {
            "2024": 4816503
          }
        }
      },
      "objects": {
        "2012": {
          "1": 4681861,
          "2": 2092857,
          "3": 164729,
          "4": 30017,
          "5": 273656,
          "6": 116925,
          "7": 4395,
          "8": 36737
        },
        "2013": {
          "1": 4898146,
          "2": 2247252,
          "3": 201963,
          "4": 27264,
          "5": 200955,
          "6": 133137,
          "7": 3222,
          "8": 28614
        },
        "2014": {
          "1": 4697090,
          "2": 2335699,
          "3": 221262,
          "4": 20761,
          "5": 189438,
          "6": 120776,
          "7": 5999,
          "8": 22898
        },
        "2015": {
          "1": 4759434,
          "2": 2376077,
          "3": 210684,
          "4": 23041,
          "5": 202679,
          "6": 95163,
          "7": 7182,
          "8": 23945
        },
        "2016": {
          "1": 4710314,
          "2": 2368410,
          "3": 225841,
          "4": 16541,
          "5": 213176,
          "6": 90250,
          "7": 5275,
          "8": 24727
        },
        "2017": {
          "1": 5081278,
          "2": 2581082,
          "3": 180296,
          "4": 44622,
          "5": 245795,
          "6": 129430,
          "7": 1686,
          "8": 31180
        },
        "2018": {
          "1": 5393285,
          "2": 2860916,
          "3": 225044,
          "4": 58374,
          "5": 294798,
          "6": 136685,
          "8": 31838
        },
        "2019": {
          "1": 6302280,
          "2": 3413290,
          "3": 249281,
          "4": 56725,
          "5": 353426,
          "6": 140552,
          "7": 3151,
          "8": 37902
        },
        "2020": {
          "1": 6812966,
          "2": 3597978,
          "3": 301858,
          "4": 22291,
          "5": 352870,
          "6": 383144,
          "7": 10028,
          "8": 38228
        },
        "2021": {
          "1": 7789472,
          "2": 4010115,
          "3": 295870,
          "4": 60034,
          "5": 307557,
          "6": 409734,
          "8": 41988
        },
        "2022": {
          "1": 8345285,
          "2": 4155634,
          "3": 253817,
          "4": 70325,
          "5": 412511,
          "6": 398736,
          "7": 8068,
          "8": 81593
        },
        "2023": {
          "1": 9500065,
          "2": 4599434,
          "3": 344182,
          "4": 76103,
          "5": 499033,
          "6": 590404,
          "7": 1509,
          "8": 75355
        },
        "2024": {
          "1": 12609482,
          "2": 5903413,
          "3": 1245408,
          "4": 290836,
          "5": 483665,
          "6": 1212006,
          "7": 1178637,
          "8": 82848
        },
        "2025": {
          "1": 12950663,
          "2": 5702278,
          "3": 753255,
          "4": 388179,
          "5": 497047,
          "6": 4167787,
          "7": 920748,
          "8": 88495
        }
      }
    },
    "iron": {
      "functions": {
        "2300": {
          "name": "SUPPORT SERVICES - GENERAL DIST ADMIN",
          "values": {
            "2012": 424917,
            "2013": 413696,
            "2014": 385184,
            "2015": 444941,
            "2016": 483552,
            "2017": 692620,
            "2018": 723135,
            "2019": 854705,
            "2020": 811911,
            "2021": 791452,
            "2022": 1074417,
            "2023": 1240928,
            "2024": 1167968
          }
        },
        "2400": {
          "name": "SUPPORT SERVICES - SCHOOL ADMIN",
          "values": {
            "2012": 3026514,
            "2013": 3230891,
            "2014": 3402800,
            "2015": 3588782,
            "2016": 3737313,
            "2017": 3802253,
            "2018": 4144191,
            "2019": 4368056,
            "2020": 4704447,
            "2021": 5176642,
            "2022": 5475117,
            "2023": 6189625,
            "2024": 7534073
          }
        },
        "2500": {
          "name": "SUPPORT SERVICES - Central Services",
          "values": {
            "2012": 1109387,
            "2013": 1130781,
            "2014": 1243928,
            "2015": 1355227,
            "2016": 1486573,
            "2017": 1353801,
            "2018": 1412920,
            "2019": 1679524,
            "2020": 1729163,
            "2021": 1783041,
            "2022": 2532059,
            "2023": 3466474,
            "2024": 3815978
          }
        }
      },
      "objects": {
        "2012": {
          "1": 2926985,
          "2": 1417717,
          "3": 38749,
          "5": 145407,
          "6": 31960
        },
        "2013": {
          "1": 3045703,
          "2": 1535965,
          "3": 34246,
          "5": 142113,
          "6": 15475,
          "7": 1865
        },
        "2014": {
          "1": 3132363,
          "2": 1677720,
          "3": 66415,
          "5": 131649,
          "6": 23765
        },
        "2015": {
          "1": 3353412,
          "2": 1810491,
          "3": 69972,
          "5": 130365,
          "6": 24710
        },
        "2016": {
          "1": 3566383,
          "2": 1894569,
          "3": 71782,
          "5": 143231,
          "6": 31473
        },
        "2017": {
          "1": 3609992,
          "2": 1994220,
          "3": 60635,
          "5": 149948,
          "6": 33879
        },
        "2018": {
          "1": 3878797,
          "2": 2144232,
          "3": 43420,
          "5": 183666,
          "6": 30131
        },
        "2019": {
          "1": 4047036,
          "2": 2193521,
          "3": 71957,
          "4": 2253,
          "5": 237413,
          "6": 68456,
          "7": 281041,
          "8": 608
        },
        "2020": {
          "1": 4289383,
          "2": 2391992,
          "3": 74022,
          "4": 100,
          "5": 271548,
          "6": 116597,
          "7": 100931,
          "8": 947
        },
        "2021": {
          "1": 4669318,
          "2": 2546404,
          "3": 66627,
          "5": 250504,
          "6": 86539,
          "7": 131742
        },
        "2022": {
          "1": 5192911,
          "2": 2673860,
          "3": 178542,
          "5": 434720,
          "6": 330184,
          "7": 271374
        },
        "2023": {
          "1": 6044811,
          "2": 2952774,
          "3": 179555,
          "4": 2366,
          "5": 528738,
          "6": 396587,
          "7": 790516,
          "8": 1679
        },
        "2024": {
          "1": 7358767,
          "2": 3560232,
          "3": 214033,
          "4": 2158,
          "5": 353207,
          "6": 430679,
          "7": 593938,
          "8": 5004
        },
        "2025": {
          "1": 8221340,
          "2": 3921188,
          "3": 239747,
          "4": 0,
          "5": 395292,
          "6": 316372,
          "7": 71708,
          "8": 2254
        }
      }
    },
    "cache": {
      "functions": {
        "2310": {
          "name": "Board of Education Services",
          "values": {
            "2012": 117901,
            "2013": 100579,
            "2014": 177204,
            "2015": 161864,
            "2016": 188770,
            "2017": 199247,
            "2018": 194268,
            "2019": 182122,
            "2020": 256061,
            "2021": 171368,
            "2022": 222363,
            "2023": 290540,
            "2024": 219541
          }
        },
        "2320": {
          "name": "District Executive Administration Services",
          "values": {
            "2012": 350890,
            "2013": 365023,
            "2014": 366207,
            "2015": 392099,
            "2016": 390956,
            "2017": 432162,
            "2018": 430561,
            "2019": 521798,
            "2020": 560601,
            "2021": 503650,
            "2022": 608227,
            "2023": 680024,
            "2024": 743413
          }
        },
        "2410": {
          "name": "Office of the Principal",
          "values": {
            "2012": 5236975,
            "2013": 5462285,
            "2014": 5527464,
            "2015": 5829763,
            "2016": 6251212,
            "2017": 6950529,
            "2018": 7624827,
            "2019": 7923105,
            "2020": 8267277,
            "2021": 8480700,
            "2022": 9140575,
            "2023": 9858285,
            "2024": 10509270
          }
        },
        "2500": {
          "name": "SUPPORT SERVICES - Central Services",
          "values": {
            "2017": 0,
            "2018": -753883,
            "2019": -357356,
            "2020": -404269,
            "2021": -455283,
            "2022": -486105,
            "2023": -519144,
            "2024": -433924
          }
        },
        "2510": {
          "name": "Fiscal Services",
          "values": {
            "2012": 706246,
            "2013": 700996,
            "2014": 695020,
            "2015": 814912,
            "2016": 755339,
            "2017": 813926,
            "2018": 843537,
            "2019": 902455,
            "2020": 1072538,
            "2021": 1006166,
            "2022": 1373597,
            "2023": 1649518,
            "2024": 1666833
          }
        },
        "2560": {
          "name": "Public Information Services",
          "values": {
            "2017": 112100,
            "2018": 99467,
            "2019": 105638,
            "2020": 98810,
            "2021": 123092,
            "2022": 126682,
            "2023": 149758,
            "2024": 198515
          }
        },
        "2570": {
          "name": "Personnel Services",
          "values": {
            "2012": 301343,
            "2013": 342511,
            "2014": 328216,
            "2015": 330553,
            "2016": 441521,
            "2017": 386570,
            "2018": 441202,
            "2019": 450889,
            "2020": 464744,
            "2021": 494321,
            "2022": 558165,
            "2023": 596606,
            "2024": 730804
          }
        },
        "2580": {
          "name": "Administrative Technology Services",
          "values": {
            "2012": 753777,
            "2013": 757477,
            "2014": 786809,
            "2015": 1390214,
            "2016": 1882147,
            "2017": 2066110,
            "2018": 1891815,
            "2019": 2388419,
            "2020": 2419319,
            "2021": 2407557,
            "2022": 2549458,
            "2023": 2988009,
            "2024": 3375925
          }
        }
      },
      "objects": {
        "2012": {
          "1": 4983416,
          "2": 2129355,
          "3": 66138,
          "4": 89071,
          "5": 95191,
          "6": 42266,
          "7": 9149,
          "8": 52546
        },
        "2013": {
          "1": 5049191,
          "2": 2310677,
          "3": 59131,
          "4": 98858,
          "5": 104757,
          "6": 62964,
          "7": 1771,
          "8": 41523
        },
        "2014": {
          "1": 5097563,
          "2": 2339644,
          "3": 107395,
          "4": 110701,
          "5": 106715,
          "6": 73840,
          "7": 4556,
          "8": 40507
        },
        "2015": {
          "1": 5471145,
          "2": 2538925,
          "3": 73168,
          "4": 137030,
          "5": 129478,
          "6": 391699,
          "7": 131191,
          "8": 46768
        },
        "2016": {
          "1": 5945619,
          "2": 2869430,
          "3": 65308,
          "4": 134522,
          "5": 126477,
          "6": 495726,
          "7": 227013,
          "8": 45851
        },
        "2017": {
          "1": 6565478,
          "2": 3069508,
          "3": 79420,
          "4": 188710,
          "5": 129191,
          "6": 703415,
          "7": 182141,
          "8": 42781
        },
        "2018": {
          "1": 7193078,
          "2": 3303493,
          "3": 78685,
          "4": 101354,
          "5": 142493,
          "6": 567005,
          "7": 92215,
          "8": -706528
        },
        "2019": {
          "1": 7469912,
          "2": 3388427,
          "3": 77051,
          "4": 101796,
          "5": 152264,
          "6": 1069964,
          "7": 170050,
          "8": -312395
        },
        "2020": {
          "1": 7862918,
          "2": 3760450,
          "3": 145263,
          "4": 111812,
          "5": 181007,
          "6": 889715,
          "7": 149670,
          "8": -365754
        },
        "2021": {
          "1": 8393869,
          "2": 3811776,
          "3": 84081,
          "4": 140900,
          "5": 136712,
          "6": 410080,
          "7": 166227,
          "8": -412073
        },
        "2022": {
          "1": 8802327,
          "2": 4418192,
          "3": 77127,
          "4": 20950,
          "5": 236659,
          "6": 844805,
          "7": 103168,
          "8": -410266
        },
        "2023": {
          "1": 9368212,
          "2": 4819453,
          "3": 132878,
          "4": 10105,
          "5": 262083,
          "6": 1445705,
          "7": 144199,
          "8": -489040
        },
        "2024": {
          "1": 10326658,
          "2": 5107089,
          "3": 255229,
          "4": 8768,
          "5": 264943,
          "6": 1426774,
          "7": 71134,
          "8": -450220
        },
        "2025": {
          "1": 11159156,
          "2": 5431595,
          "3": 287507,
          "4": 5941,
          "5": 291429,
          "6": 1691852,
          "7": 159319,
          "8": -491128
        }
      }
    },
    "boxelder": {
      "functions": {
        "2300": {
          "name": "SUPPORT SERVICES - GENERAL DIST ADMIN",
          "values": {
            "2012": 600741,
            "2013": 581357,
            "2014": 600357,
            "2015": 691032,
            "2016": 753902,
            "2017": 838468,
            "2018": 819804,
            "2019": 787802,
            "2020": 919380,
            "2021": 882093,
            "2022": 1114160,
            "2023": 1045127,
            "2024": 1175875
          }
        },
        "2400": {
          "name": "SUPPORT SERVICES - SCHOOL ADMIN",
          "values": {
            "2012": 4262246,
            "2013": 4200392,
            "2014": 4495652,
            "2015": 4544868,
            "2016": 4591675,
            "2017": 4699650,
            "2018": 5184691,
            "2019": 5541869,
            "2020": 5744381,
            "2021": 5853071,
            "2022": 6139192,
            "2023": 6994671,
            "2024": 7389834
          }
        },
        "2500": {
          "name": "SUPPORT SERVICES - Central Services",
          "values": {
            "2012": 600205,
            "2013": 548905,
            "2014": 1785795,
            "2015": 2031300,
            "2016": 1872045,
            "2017": 1984309,
            "2018": 867286,
            "2019": 876218,
            "2020": 973314,
            "2021": 1045110,
            "2022": 1210075,
            "2023": 1319029,
            "2024": 1172731
          }
        },
        "2570": {
          "name": "Personnel Services",
          "values": {
            "2012": 205241,
            "2013": 229338
          }
        },
        "2580": {
          "name": "Administrative Technology Services",
          "values": {
            "2012": 924807,
            "2013": 1339326
          }
        }
      },
      "objects": {
        "2012": {
          "1": 4168430,
          "2": 1827078,
          "3": 113852,
          "4": 74616,
          "5": 241231,
          "6": 137255,
          "8": 30778
        },
        "2013": {
          "1": 4172743,
          "2": 1786162,
          "3": 85855,
          "4": 356164,
          "5": 255066,
          "6": 212641,
          "8": 30688
        },
        "2014": {
          "1": 4093722,
          "2": 1865094,
          "3": 116435,
          "4": 76296,
          "5": 293038,
          "6": 405214,
          "8": 32005
        },
        "2015": {
          "1": 4180668,
          "2": 1906821,
          "3": 139148,
          "4": 83132,
          "5": 308085,
          "6": 613915,
          "7": 992,
          "8": 34440
        },
        "2016": {
          "1": 4398506,
          "2": 1974511,
          "3": 207663,
          "4": 75115,
          "5": 307099,
          "6": 213840,
          "7": 465,
          "8": 40424
        },
        "2017": {
          "1": 4587405,
          "2": 2008695,
          "3": 343374,
          "5": 290708,
          "6": 256737,
          "7": 385,
          "8": 35123
        },
        "2018": {
          "1": 4187477,
          "2": 1798375,
          "3": 191887,
          "4": 262,
          "5": 301888,
          "6": 356407,
          "8": 35485
        },
        "2019": {
          "1": 4471296,
          "2": 1879541,
          "3": 209875,
          "5": 317191,
          "6": 290957,
          "8": 37031
        },
        "2020": {
          "1": 4788578,
          "2": 2058893,
          "3": 188270,
          "4": 20,
          "5": 352435,
          "6": 210766,
          "8": 38113
        },
        "2021": {
          "1": 5030060,
          "2": 2059000,
          "3": 210268,
          "4": 707,
          "5": 323248,
          "6": 119924,
          "8": 37066
        },
        "2022": {
          "1": 5363116,
          "2": 2150417,
          "3": 425899,
          "5": 344755,
          "6": 143445,
          "8": 35797
        },
        "2023": {
          "1": 5961672,
          "2": 2367528,
          "3": 363555,
          "4": 28,
          "5": 372742,
          "6": 229132,
          "8": 64169
        },
        "2024": {
          "1": 6316200,
          "2": 2438482,
          "3": 443689,
          "4": 30,
          "5": 324354,
          "6": 170418,
          "8": 45267
        },
        "2025": {
          "1": 6553154,
          "2": 2460706,
          "3": 522858,
          "4": 0,
          "5": 397962,
          "6": 243959,
          "7": 0,
          "8": 46588
        }
      }
    }
  },
  "adminLabels": {
    "subs": {
      "admin_district": "District administration (board, superintendent, elections)",
      "admin_school": "School administration (principals' offices)",
      "admin_central": "Central business services (fiscal, personnel, communications, admin technology)"
    },
    "objects": {
      "1": "Salaries",
      "2": "Benefits",
      "3": "Purchased professional services",
      "4": "Purchased property services",
      "5": "Other purchased services",
      "6": "Supplies and materials",
      "7": "Property and equipment",
      "8": "Debt service and other"
    }
  },
  "cpi": {
    "base": 2026,
    "series": "CUUR0000SA0",
    "source": "bls-cpi",
    "label": "FY2026 dollars",
    "factor": {
      "2012": 1.439888,
      "2013": 1.416315,
      "2014": 1.394533,
      "2015": 1.384454,
      "2016": 1.375175,
      "2017": 1.350338,
      "2018": 1.320569,
      "2019": 1.293757,
      "2020": 1.273832,
      "2021": 1.245172,
      "2022": 1.161838,
      "2023": 1.093374,
      "2024": 1.058461,
      "2025": 1.031274,
      "2026": 1.0
    },
    "note": "Adjusted with BLS CPI-U (U.S. city average, all items), July\u2013June fiscal-year averages, to FY2026 dollars. October 2025 was not published by BLS, so FY2026 averages 11 months."
  },
  "onlineEnrollment": {
    "tooele": {
      "schools": [
        "Blue Peak High",
        "Digital Education Center"
      ],
      "online": {
        "2019": 2817,
        "2020": 3432,
        "2021": 9476,
        "2022": 8332,
        "2023": 8882,
        "2024": 263,
        "2025": 235,
        "2026": 244,
        "2027": 288
      },
      "total": {
        "2015": 13873,
        "2016": 13988,
        "2017": 14332,
        "2018": 16154,
        "2019": 16903,
        "2020": 17608,
        "2021": 22004,
        "2022": 22939,
        "2023": 23828,
        "2024": 15588,
        "2025": 15619,
        "2026": 15737,
        "2027": 15463
      }
    },
    "iron": {
      "schools": [
        "Southwest Educational Academy",
        "Iron Online"
      ],
      "online": {
        "2019": 84,
        "2020": 107,
        "2021": 1584,
        "2022": 2167,
        "2023": 2597,
        "2024": 4789,
        "2025": 4282,
        "2026": 3706,
        "2027": 3198
      },
      "total": {
        "2015": 8814,
        "2016": 8933,
        "2017": 9074,
        "2018": 9169,
        "2019": 9395,
        "2020": 9544,
        "2021": 10748,
        "2022": 11830,
        "2023": 12421,
        "2024": 14479,
        "2025": 13883,
        "2026": 13407,
        "2027": 12791
      }
    },
    "cache": {
      "schools": [],
      "online": {},
      "total": {
        "2015": 16457,
        "2016": 16976,
        "2017": 17536,
        "2018": 17895,
        "2019": 18270,
        "2020": 18802,
        "2021": 18833,
        "2022": 19554,
        "2023": 19731,
        "2024": 19794,
        "2025": 19847,
        "2026": 19720,
        "2027": 19560
      }
    },
    "boxelder": {
      "schools": [],
      "online": {},
      "total": {
        "2015": 11238,
        "2016": 11341,
        "2017": 11572,
        "2018": 11671,
        "2019": 11770,
        "2020": 11914,
        "2021": 11832,
        "2022": 12296,
        "2023": 12338,
        "2024": 12268,
        "2025": 12244,
        "2026": 12087,
        "2027": 11741
      }
    }
  }
};
// END USBE GENERATED

// Merge generated USBE figures into the dataset.
(function (T, U) {
  if (!U) return;
  var ordered = {};
  ["spend_per_student", "revenue_per_student", "enrollment", "revenue_total", "expenditures_total", "property_tax_total",
   "proptax_per_student", "instruction_per_student", "admin_per_student", "admin_share", "gf_fund_balance", "gf_fund_balance_pct"]
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
  T.adminDetail = U.adminDetail;
  T.adminLabels = U.adminLabels;
  T.onlineEnrollment = U.onlineEnrollment;
  T.cpi = U.cpi;
})(window.TSF, window.TSF_USBE);
