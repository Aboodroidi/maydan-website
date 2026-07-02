# Deploying maydan.om

This is a **Vite + React single-page app**. `npm run build` produces a plain
static build in **`dist/`**, no Node needed on the server. The live host is
**Plesk** (Apache/nginx), canonical domain **https://www.maydan.om**.

## Branch model

- **`source`**: the Vite source you edit (this is the working branch).
- **`main`**: the **built site** (index.html, hashed assets, join/,
  .well-known/, .htaccess). **Plesk serves `main` directly**, so `main` is
  generated, not hand-edited.

A GitHub Action (`.github/workflows/deploy.yml`) runs on every push to **`source`**,
builds the app, and force-pushes the built `dist/` to **`main`**. So the flow is:

```
edit on source  →  push  →  CI builds  →  main = built site  →  Plesk serves it
```

Plesk needs **no change**, it already serves `main`. Just keep its Git deployment
(or auto-pull) pointed at `main` and enable automatic deployment.

## Editing the site

```bash
git checkout source
npm install
npm run dev            # http://localhost:5173
# make changes, then:
git add -A && git commit -m "..." && git push   # CI rebuilds main
```

`npm run preview` serves the production build locally after `npm run build`.

## Environment variables

Local dev: copy `.env.example` to `.env.local` and fill in the `VITE_*` values.

CI: the workflow maps the **existing** GitHub Action variables (still named
`NEXT_PUBLIC_*` from the old Next.js build) to the new `VITE_*` names, so
nothing needs reconfiguring in the repository settings.

Key restrictions (client-side keys are public by design, so restrict them):

- **Firebase API key**: restrict in Google Cloud Console to the site's HTTP
  referrers; Firebase security rules are the real gate.
- **Google Maps key**: restrict to the Maps JavaScript API and the site's
  HTTP referrers.
- **OpenAI key**: local dev only. It is intentionally NOT wired into CI and
  must not ship in a public build; proxy through a backend before production.

## SPA routing (.htaccess)

This is now a single-page app: routes like `/bookings` or `/pitch/abc` do not
exist as files on disk. `public/.htaccess` (copied into `dist/` by the build)
tells Apache to serve real files and directories as-is and rewrite everything
else to `/index.html`. It deliberately never rewrites:

- **`/.well-known/*`**: Universal Links (`apple-app-site-association` must be
  served as `application/json`; already so on www). Do not delete.
- **`/join/*`**: deep-link bridge for booking share codes.
- **`/assets/*`**: fonts, images and the hashed Vite bundles.

## Keep these intact (already in the build)

- **`/.well-known/apple-app-site-association`**: Universal Links.
- **`/join/`**: deep-link bridge for booking share codes.
- Keep the **apex → www** redirect (`maydan.om` → `www.maydan.om`).

## Manual build (if ever needed)

```bash
git checkout source && npm ci && npm run build   # → dist/
# upload the CONTENTS of dist/ to the domain document root (httpdocs),
# including the .htaccess file
```
