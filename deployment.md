# Deploying utahschools.fyi

The site is static HTML, CSS, and JavaScript hosted on **Cloudflare Pages**. Cloudflare builds it from
this Git repository: every push to `main` publishes the live site, and every other branch gets a
preview URL.

```text
site/  ──(scripts/build_pages.sh)──▶  dist/  ──(Cloudflare Pages)──▶  https://utahschools.fyi
```

The build step only copies `site/` to `dist/` and leaves out the unzipped Tableau folders
(`extracted_*`), whose files exceed Cloudflare's 25 MiB per-file limit. It needs no Node or
Python, and fails if any remaining file is over 25 MiB or there are more than 20,000 files.

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
   `utahschools`. Public or private both work with Cloudflare Pages.
2. From the project folder:

   ```sh
   git remote add origin https://github.com/<your-account>/utahschools.git
   git push -u origin main
   ```

   The repository is about 230 MB because the raw source data is committed for preservation.
   Every file is under GitHub's 100 MB limit, so no special setup is needed. The first push will
   take a few minutes.

### 1.3 Create the Cloudflare Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**.
2. Authorize GitHub and select the repository.
3. Build settings:

   | Setting | Value |
   |---|---|
   | Project name | `utahschools` (gives a `utahschools.pages.dev` address) |
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `bash scripts/build_pages.sh` |
   | Build output directory | `dist` |
   | Root directory | *(leave blank)* |
   | Environment variables | *(none)* |

4. **Save and Deploy.** The first build takes a minute or two. When it finishes, open
   `https://utahschools.pages.dev` and check that the site loads.

### 1.4 Connect the custom domain

1. Pages project → **Custom domains** → **Set up a custom domain** → `utahschools.fyi` →
   **Activate domain**. Cloudflare adds the DNS record and issues the certificate automatically.
2. Repeat for `www.utahschools.fyi`.
3. Redirect `www` to the main domain: **Rules → Redirect Rules → Create rule**
   (on the `utahschools.fyi` zone):
   - *If* hostname equals `www.utahschools.fyi`
   - *Then* dynamic redirect to `concat("https://utahschools.fyi", http.request.uri.path)`,
     status **301**, **preserve query string** on.
4. **SSL/TLS → Edge Certificates**: turn on **Always Use HTTPS**.

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
git push -u origin my-change     # Cloudflare builds a preview at <hash>.utahschools.pages.dev
```

Open the preview link from the Pages project's **Deployments** list, then merge into `main`
(on GitHub, or `git checkout main && git merge my-change && git push`). Pushing to `main`
publishes to utahschools.fyi.

### Data updates

The figures are generated locally; Cloudflare does not run the data scripts.

```sh
python3 -m pip install openpyxl
python3 scripts/build_usbe_data.py      # rewrites data.js, statewide.js, normalized CSVs
bash scripts/build_pages.sh             # optional local check of the output
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

Pages project → **Deployments** → find the last good deployment → **⋯** → **Rollback to this
deployment**. The live site switches immediately. Then fix the problem in Git so the next push
doesn't reintroduce it (for example `git revert <commit>` and push).

---

## 5. Deploying without GitHub (alternative)

If you'd rather not connect a repository, upload the built folder directly. Requires
[Node.js](https://nodejs.org) 18 or later.

```sh
bash scripts/build_pages.sh
npx wrangler login                      # first time only; opens a browser
npx wrangler pages deploy               # uses wrangler.toml: project "utahschools", folder "dist"
```

The first run creates the `utahschools` project. Connect the custom domain and set up email as in
sections 1.4 and 1.5. With direct upload there are no automatic builds or branch previews; run the
two commands each time you want to publish. A project created this way can't later be switched
to Git integration. To move to Git, create a new Pages project and move the custom domain to it.

---

## 6. Limits to keep in mind

| Limit (Cloudflare Pages, free plan) | This site |
|---|---|
| 25 MiB per file | Largest deployed file is about 22 MiB (`afr_expenditures_4_districts_…csv`) |
| 20,000 files per deployment | About 110 |
| 500 builds per month | One per push |

If a future data file approaches 25 MiB, publish it compressed (`.csv.gz`) or split it by year;
`build_pages.sh` will stop the deploy if any file exceeds the limit.

## 7. Files that control hosting

| File | Purpose |
|---|---|
| `scripts/build_pages.sh` | Builds `dist/` from `site/` and enforces the size limits |
| `wrangler.toml` | Project name and output folder for direct upload |
| `site/_headers` | Security headers, caching, and CORS for data files |
| `site/404.html` | Page shown for missing URLs |
| `site/robots.txt`, `site/sitemap.xml` | Search engine guidance |
| `site/site.webmanifest`, `site/favicon.ico`, `site/assets/brand/` | Icons and link-preview image |
