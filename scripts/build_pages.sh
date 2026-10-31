#!/usr/bin/env bash
# Build the Cloudflare Pages output (dist/) from site/.
# Cloudflare Pages build settings: build command "bash scripts/build_pages.sh", output directory "dist".
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
cp -R site dist

# Unzipped Tableau workbooks are working copies of the published .twbx files; the
# .hyper extracts inside exceed Cloudflare Pages' 25 MiB per-file limit.
find dist -type d -name 'extracted_*' -prune -exec rm -rf {} +
find dist -name '.DS_Store' -delete

big=$(find dist -type f -size +25M)
if [ -n "$big" ]; then
  echo "Files over Cloudflare Pages' 25 MiB limit:" >&2
  echo "$big" >&2
  exit 1
fi
count=$(find dist -type f | wc -l | tr -d ' ')
if [ "$count" -gt 20000 ]; then
  echo "dist has $count files; Cloudflare Pages allows 20,000." >&2
  exit 1
fi
echo "dist/ ready: $count files, $(du -sh dist | cut -f1)"
