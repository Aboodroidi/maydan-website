# Deploying maydan.om

This is a **Next.js (App Router) static-export** site. `npm run build` produces a
plain static site in **`out/`** — no Node needed on the server. The live host is
**Plesk** (nginx), canonical domain **https://www.maydan.om**.

## Branch model

- **`source`** — the Next.js source you edit (this is the working branch).
- **`main`** — the **built static site** (index.html, privacy/, terms/, support/,
  join/, .well-known/, assets/). **Plesk serves `main` directly**, so `main` is
  generated, not hand-edited.

A GitHub Action (`.github/workflows/deploy.yml`) runs on every push to **`source`**,
builds the site, and force-pushes the built `out/` to **`main`**. So the flow is:

```
edit on source  →  push  →  CI builds  →  main = built site  →  Plesk serves it
```

Plesk needs **no change** — it already serves `main`. Just keep its Git deployment
(or auto-pull) pointed at `main` and enable automatic deployment.

## Editing the site

```bash
git checkout source
npm install
npm run dev            # http://localhost:3000
# make changes, then:
git add -A && git commit -m "..." && git push   # CI rebuilds main
```

## Keep these intact (already in the build)

- **`/.well-known/apple-app-site-association`** — Universal Links; served as
  `application/json` (already so on www). Do not delete.
- **`/join/`** — deep-link bridge for booking share codes.
- Keep the **apex → www** redirect (`maydan.om` → `www.maydan.om`).

## Manual build (if ever needed)

```bash
git checkout source && npm ci && npm run build   # → out/
# upload the CONTENTS of out/ to the domain document root (httpdocs)
```
