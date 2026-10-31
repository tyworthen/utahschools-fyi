# Utah Schools FYI — utahschools.fyi

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

## Deploying

The site is hosted on Cloudflare Pages at https://utahschools.fyi. See
[`deployment.md`](deployment.md) for setup, publishing updates, email routing, rollbacks, and limits.

Build command `bash scripts/build_pages.sh`, output directory `dist`.
