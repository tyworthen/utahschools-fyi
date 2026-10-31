# USBE enrollment — raw downloads

From https://www.schools.utah.gov/datastatistics/reports (Enrollment / Membership), retrieved 2026-10-31.
File names use the school year's ending year (2025 = school year 2024-25 = FY2025).

- `YYYYFallEnrollmentGradeLevelDemographics.xlsx` (2019-2027): October 1 counts by state, county,
  LEA, and school, with grade and demographic detail.
- `YYYYEnrollmentLEA.xlsx` (2019-2026): October 1 counts by LEA for five years plus a projection;
  the 2019 file supplies October 2014-October 2017 (FY2015-FY2018).
- `YYYYAverageDailyMembership.xlsx` (2018-2026): ADM by LEA and grade. Layout changes by year; the
  2022 file has no district rows in a parseable layout. Used only as a cross-check.

Author names were removed from file metadata by `scripts/strip_metadata.py`; `manifest.csv` lists
original and published checksums. Normalized output: `../../normalized/enrollment.csv`.
