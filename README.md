# Utah School Finance — utahschools.fyi

Independent, nonpartisan research and data on Utah public-school finances and outcomes,
starting with a case study of Tooele County School District. See `context.md` for scope and
standards and `design.md` for the visual identity.

## Layout

| Path | What it is |
|---|---|
| `site/` | The static website (HTML, CSS, JS) and the data it serves |
| `site/assets/data.js` | Site dataset; the `USBE GENERATED` block is written by the build script |
| `site/assets/statewide.js` | Generated figures for all 41 Utah school districts |
| `site/assets/data/` | Preserved source downloads, normalized CSVs, source registry, validation results |
| `scripts/build_usbe_data.py` | Rebuilds all figures from the USBE source files |
| `scripts/build_pages.sh` | Builds the Cloudflare Pages output in `dist/` |
| `brand/` | Logo options (`logo-options/index.html`) and the production export page |
| `scripts/export_brand.py` | Renders header/footer logos, badge, social image, and favicons into `site/assets/brand/` |

## Updating the data

```sh
python3 -m pip install openpyxl
python3 scripts/build_usbe_data.py
```

## Deploying (Cloudflare Pages)

Git integration — Cloudflare dashboard → Workers & Pages → Create → Pages → connect this repo:

- Production branch: `main`
- Framework preset: None
- Build command: `bash scripts/build_pages.sh`
- Build output directory: `dist`

Then Custom domains → add `utahschools.fyi` (and `www.utahschools.fyi`, redirected to the apex).

Direct upload instead of Git integration:

```sh
bash scripts/build_pages.sh
npx wrangler pages deploy
```

Notes:

- Cloudflare Pages limits each file to 25 MiB. The build skips the unzipped Tableau
  folders (`extracted_*`), whose `.hyper` files exceed it; the original `.twbx`
  workbooks and the CSV exports are still published. The build fails if any other
  file is too large.
- Pages serves clean URLs (`/utah` for `utah.html`); internal links keep `.html` so the
  site also works when opened from disk.
- `site/_headers` sets security and caching headers; `site/sitemap.xml` and
  `site/robots.txt` point at `https://utahschools.fyi`.
