# Deploying maydan.om

This is a **Next.js (App Router) static-export** site. `npm run build` produces a
plain static site in **`out/`** — no Node needed on the server. The live host is
**Plesk** (nginx), canonical domain **https://www.maydan.om**.

## How publishing works

A GitHub Action (`.github/workflows/deploy.yml`) builds the site on every push to
`main` (and `nextjs-rewrite`) and force-pushes the built `out/` to a **`deploy`**
branch. The `deploy` branch therefore always contains the ready-to-serve files
(index.html, privacy/, terms/, support/, join/, .well-known/, assets/).

## Option A — Plesk Git deployment (recommended)

In Plesk for the maydan.om domain:

1. **Websites & Domains → Git**.
2. Add/point the repository at `https://github.com/Aboodroidi/maydan-website`.
3. Set the deployed branch to **`deploy`** (NOT `main` — `main` is the source).
4. Set the **deployment path** to the domain's document root (e.g. `httpdocs`).
5. Enable **automatic deployment** so each push to `deploy` republishes.

Because `deploy` holds prebuilt static files, Plesk just copies them — it does not
need to run `npm`.

## Option B — Manual upload

```bash
npm ci
npm run build
# then upload the CONTENTS of out/ to the domain document root (httpdocs)
```

## Keep these intact (already handled by the build)

- **`/.well-known/apple-app-site-association`** — Universal Links. Must be served
  as `application/json` (already is on www; `out/.well-known/.htaccess` forces it
  on Apache). Do not delete.
- **`/join/`** — the deep-link bridge for booking share codes.
- Keep the **apex → www** redirect (`maydan.om` → `www.maydan.om`).

## ⚠️ Migration order (do this once)

The current live site serves the old static files directly from `main`. Before you
merge `nextjs-rewrite → main`:

1. Let the Action publish the `deploy` branch (it runs on `nextjs-rewrite` too).
2. Repoint Plesk to deploy the **`deploy`** branch → `httpdocs` (Option A).
3. Verify www.maydan.om and www.maydan.om/.well-known/apple-app-site-association.
4. Only then merge `nextjs-rewrite → main`.

This way the live site is never served from the un-built Next.js source.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```
