#!/usr/bin/env bash
# Build the static assets (dist/) that the Cloudflare Worker serves, from site/.
# Workers Builds settings: build command "bash scripts/build_site.sh", deploy command "npx wrangler deploy".
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist
cp -R site dist

# Unzipped Tableau workbooks are working copies of the published .twbx files; the
# .hyper extracts inside exceed Cloudflare's 25 MiB per-asset limit.
find dist -type d -name 'extracted_*' -prune -exec rm -rf {} +
find dist -name '.DS_Store' -delete

big=$(find dist -type f -size +25M)
if [ -n "$big" ]; then
  echo "Files over Cloudflare's 25 MiB per-asset limit:" >&2
  echo "$big" >&2
  exit 1
fi
count=$(find dist -type f | wc -l | tr -d ' ')
if [ "$count" -gt 20000 ]; then
  echo "dist has $count files; Workers static assets allow 20,000 on the free plan." >&2
  exit 1
fi
echo "dist/ ready: $count files, $(du -sh dist | cut -f1)"
