# Deploying utahschools.fyi

The site is static HTML, CSS, and JavaScript served by a **Cloudflare Worker with static assets**
(no Worker script, only files). The Worker is configured in `wrangler.toml`. Cloudflare's
**Workers Builds** can build and deploy it from this Git repository on every push to `main`, or
you can deploy from your computer with Wrangler.

```text
site/  ──(scripts/build_site.sh)──▶  dist/  ──(npx wrangler deploy)──▶  Worker "utahschools"  ──▶  https://utahschools.fyi
```

The build step only copies `site/` to `dist/` and leaves out the unzipped Tableau folders
(`extracted_*`), whose files exceed Cloudflare's 25 MiB per-asset limit. It needs no Node or
Python, and fails if any remaining file is over 25 MiB or there are more than 20,000 files.

`wrangler.toml` sets how the Worker serves files, matching how the site was built for Pages:

| Setting | Effect |
|---|---|
| `html_handling = "auto-trailing-slash"` | `/utah` serves `utah.html`; `/utah.html` redirects to `/utah` |
| `not_found_handling = "404-page"` | Missing URLs get `404.html` with a 404 status |
| `site/_headers`, `site/_redirects` | Security headers, caching, and old-URL redirects, read by Workers the same way as Pages |
| `routes` with `custom_domain = true` | Attaches `utahschools.fyi` and `www.utahschools.fyi` on deploy |

---

## 1. One-time setup

### 1.1 Put the domain on Cloudflare

Skip this if `utahschools.fyi` was registered through Cloudflare Registrar.

1. Cloudflare dashboard → **Add a domain** → enter `utahschools.fyi` → choose the Free plan.
2. Cloudflare shows two nameservers. At your registrar, replace the domain's nameservers with
   those two.
3. Wait until Cloudflare shows the domain as **Active** (usually minutes, up to 24 hours).

### 1.2 Push the repository to GitHub

1. On GitHub, create a new **empty** repository (no README, license, or .gitignore), for example
   `utahschools`. Public or private both work with Workers Builds.
2. From the project folder:

   ```sh
   git remote add origin https://github.com/<your-account>/utahschools.git
   git push -u origin main
   ```

   The repository is about 230 MB because the raw source data is committed for preservation.
   Every file is under GitHub's 100 MB limit, so no special setup is needed. The first push will
   take a few minutes.

### 1.3 Moving from Cloudflare Pages (skip if there is no Pages project)

A domain can be attached to only one project. If a Pages project already serves
`utahschools.fyi`:

1. Deploy the Worker first (1.4 or 1.5) **without** the `[[routes]]` blocks in `wrangler.toml`
   (comment them out), and check it on its `utahschools.<your-subdomain>.workers.dev` address.
2. Pages project → **Custom domains** → remove `utahschools.fyi` and `www.utahschools.fyi`.
3. Restore the `[[routes]]` blocks and deploy again. Wrangler attaches both domains to the Worker
   and Cloudflare issues the certificates. Expect a minute or two of errors while the domain moves.
4. Pages project → **Settings** → turn off automatic deployments. Once the Worker has run
   for a while, delete the Pages project (dashboard, or `npx wrangler pages project delete utahschools`).

### 1.4 Deploy from GitHub with Workers Builds (recommended)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Workers** → **Import a repository**.
2. Authorize GitHub and select `tyworthen/utahschools-fyi`.
3. Settings:

   | Setting | Value |
   |---|---|
   | Project name | `utahschools` (must match `name` in `wrangler.toml`) |
   | Production branch | `main` |
   | Build command | `bash scripts/build_site.sh` |
   | Deploy command | `npx wrangler deploy` |
   | Non-production branch deploy command | `npx wrangler versions upload` (gives each branch a preview URL) |
   | Root directory | *(leave blank)* |

4. **Deploy.** Every later push to `main` builds and publishes the site.

### 1.5 Deploy from your computer (alternative)

Requires [Node.js](https://nodejs.org) 20 or later (`brew install node` on a Mac).

```sh
npx wrangler login                      # first time only; opens a browser
bash scripts/build_site.sh
npx wrangler deploy
```

The first deploy creates the `utahschools` Worker and attaches the custom domains in
`wrangler.toml`. If you also connect Workers Builds (1.4), either method can publish; the most
recent deploy wins.

### 1.6 Redirect www and require HTTPS

1. Redirect `www` to the main domain: **Rules → Redirect Rules → Create rule** (on the
   `utahschools.fyi` zone):
   - *If* hostname equals `www.utahschools.fyi`
   - *Then* dynamic redirect to `concat("https://utahschools.fyi", http.request.uri.path)`,
     status **301**, **preserve query string** on.
2. **SSL/TLS → Edge Certificates**: turn on **Always Use HTTPS**.

The site's `_headers` file already sends a one-year `Strict-Transport-Security` header. Once
HTTPS is confirmed working, leave it in place; removing HTTPS later would break the site for
visitors whose browsers have remembered it.

---

## 2. Check the live site

After the first deploy, and after any change to headers or structure:

- [ ] `https://utahschools.fyi` loads, with the logo in the header and the icon in the browser tab.
- [ ] Clean URLs work: `https://utahschools.fyi/utah` loads the Utah overview, and the
      **Utah** menu item is highlighted.
- [ ] `https://www.utahschools.fyi/districts` redirects to `https://utahschools.fyi/districts`.
- [ ] A district profile loads: `https://utahschools.fyi/district?id=30` (Tooele).
- [ ] Old addresses redirect: `https://utahschools.fyi/finances` goes to `/tooele-finances`.
- [ ] A missing page, for example `https://utahschools.fyi/nope/page`, shows the styled
      "We couldn't find that page" 404.
- [ ] Data downloads work: `/assets/data/normalized/revenue.csv` and
      `/assets/data/usbe/tableau_afr/afr_expenditures_all_leas_FY2012-FY2024.csv.gz`.
- [ ] Security headers are present:

  ```sh
  curl -sI https://utahschools.fyi | grep -iE "strict-transport|x-content-type|x-frame|referrer"
  ```

- [ ] `https://utahschools.fyi/sitemap.xml` and `/robots.txt` load.
- [ ] Link previews show the Utah Schools .FYI badge: paste the URL into
      <https://www.opengraph.xyz> or a message to yourself.
- [ ] info@utahschools.fyi forwards to your inbox.

### Search engines (optional)

- **Google Search Console** → add property `utahschools.fyi` (Domain property, verified by a
  DNS TXT record in Cloudflare) → **Sitemaps** → submit `https://utahschools.fyi/sitemap.xml`.
- **Bing Webmaster Tools** → import the site from Google Search Console.

---

## 3. Publishing updates

### Content or design changes

```sh
git checkout -b my-change        # optional: preview on a branch first
# ...edit files in site/...
git add -A && git commit -m "Describe the change"
git push -u origin my-change     # Workers Builds uploads a preview version
```

Open the preview URL from the Worker's **Deployments** (or the GitHub check on the branch),
then merge into `main`
(on GitHub, or `git checkout main && git merge my-change && git push`). Pushing to `main`
publishes to utahschools.fyi.

### Data updates

The figures are generated locally; Cloudflare does not run the data scripts.
Without Workers Builds, finish with `bash scripts/build_site.sh && npx wrangler deploy`.

```sh
python3 -m pip install openpyxl
python3 scripts/build_usbe_data.py      # rewrites data.js, statewide.js, normalized CSVs
bash scripts/build_site.sh              # optional local check of the output
git add -A && git commit -m "Update USBE data to FY2026" && git push
```

Review the validation summary the data script prints before committing. When adding new
source downloads, keep the originals in `site/assets/data/` and add them to
`site/assets/data/reference/source_registry.csv`.

### Logo or icon changes

```sh
python3 -m pip install pillow playwright && python3 -m playwright install chromium
python3 scripts/export_brand.py         # re-renders site/assets/brand/ and site/favicon.ico
```

### Sitemap

`site/sitemap.xml` lists every page and the 41 district profiles. Add an entry when you add a page,
and update the `<lastmod>` dates after significant content changes.

---

## 4. Rolling back

Worker → **Deployments** → find the last good version → **Rollback**, or from the command line:

```sh
npx wrangler deployments list
npx wrangler rollback <version-id>
```

The live site switches immediately. Then fix the problem in Git so the next push doesn't
reintroduce it (for example `git revert <commit>` and push).

---

## 5. Limits to keep in mind

| Limit (Workers static assets, free plan) | This site |
|---|---|
| 25 MiB per file | Largest deployed file is about 22 MiB (`afr_expenditures_4_districts_…csv`) |
| 20,000 files per version | About 190 |
| Requests for static assets | Free and unlimited; they don't count toward Worker request limits |

If a future data file approaches 25 MiB, publish it compressed (`.csv.gz`) or split it by year;
`build_site.sh` will stop the deploy if any file exceeds the limit.

## 6. Files that control hosting

| File | Purpose |
|---|---|
| `scripts/build_site.sh` | Builds `dist/` from `site/` and enforces the size limits |
| `wrangler.toml` | Worker name, assets folder, HTML and 404 handling, custom domains |
| `site/_headers` | Security headers, caching, and CORS for data files |
| `site/_redirects` | 301 redirects from old page addresses |
| `site/404.html` | Page shown for missing URLs |
| `site/robots.txt`, `site/sitemap.xml` | Search engine guidance |
| `site/site.webmanifest`, `site/favicon.ico`, `site/assets/brand/` | Icons and link-preview image |
