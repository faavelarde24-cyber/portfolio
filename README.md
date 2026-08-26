# Franz Velarde — portfolio

A static, single-page portfolio. Vite + React + TypeScript, Tailwind for styling,
Framer Motion for entrance micro-motion, and plain three.js for the one 3D object
in the hero. No backend, no CMS, no analytics.

## Local development

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the built output locally
```

Node 18 or newer.

## Editing the content

All copy lives in `src/content/` as typed data — no component edits needed.

| File | What it holds |
| --- | --- |
| `profile.ts` | Name, role, intro paragraph, education, portrait + alt text |
| `projects.ts` | The three featured projects: title, summary, stack, status |
| `practice.ts` | The three "What I do" blocks |
| `tools.ts` | The Tools table **and** the eighteen hero keycaps |
| `contact.ts` | Email, phone, LinkedIn, GitHub, and the availability line |

Changing `keycaps` in `tools.ts` changes the 3D pad. Each entry is a `label` (the
accessible name and the hover caption) and a `src` pointing at a logo in
`public/logos/`. Keep the list at 18 entries to fill the 6 × 3 grid. Any square-ish
PNG or JPG works — the component crops white and transparent margin automatically,
so logos with padding are fine. SVG is not supported (it needs a raster to sample).

Replace the portrait at `public/franz.jpg` (4:5 crop works best). The keycap logos
live in `public/logos/`.

## The 3D hero

`src/components/HeroKeypad.tsx` builds a macro pad in three.js: a dark plate,
eighteen tapered keycaps carrying the stack's logos, one shadow-casting key light.
It is lazy-loaded 200 ms after mount so it never blocks first paint, pauses
rendering when scrolled out of view via `IntersectionObserver`, and disposes its
geometry, materials and textures on unmount.

Interaction: drag with pointer or touch to rotate, arrow keys when the canvas has
keyboard focus, `Home`/`Escape` to reset. Hovering a cap names it in the caption
below the pad; a left click (as opposed to a drag) presses that cap down and lets
it spring back. Under `prefers-reduced-motion` the idle drift is off — the object
sits still until the visitor moves it.

To remove the 3D entirely, delete the `HeroKeypad` import, the `Suspense` block in
`App.tsx`, and `three` from `package.json`; the layout holds without it.

## Accessibility and motion

- Semantic landmarks, a skip link, and one `h1`.
- Every interactive element clears a 44 px touch target; focus is a 2 px accent ring.
- `prefers-reduced-motion` disables entrance animation and scroll smoothing outright
  rather than shortening them.
- Colors come from `src/index.css`; the light and dark accents are set for AA body
  contrast against their grounds.

## Putting it on GitHub

The contents of this `app/` folder **are** the repository — push it so
`package.json` sits at the repo root, not nested one level down.

```bash
cd app
git init
git add .
git commit -m "Portfolio site"
git branch -M main
git remote add origin https://github.com/faavelarde24-cyber/portfolio.git
git push -u origin main
```

`node_modules/` and `dist/` are already gitignored — never commit them.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. Turn
it on once:

1. Repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main`. The Actions tab shows the build; the site goes live at
   `https://faavelarde24-cyber.github.io/portfolio/`.

### Your own domain

1. **Settings → Pages → Custom domain**, enter the domain, save. Tick
   **Enforce HTTPS** once the certificate is issued (a few minutes).
2. At your DNS provider, point the domain at GitHub:
   - apex domain (`franzvelarde.com`) — four `A` records to `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - subdomain (`www.franzvelarde.com`) — one `CNAME` to
     `faavelarde24-cyber.github.io`
3. GitHub commits a `CNAME` file for you. If you'd rather set it yourself, add
   `public/CNAME` containing just the domain.

With a custom domain (or a `<username>.github.io` repo) the site is served from
the root, so no extra config is needed. Only if you keep the default
`username.github.io/portfolio/` URL, add the repo name as a base path in
`vite.config.ts`:

```ts
export default defineConfig({ base: '/portfolio/', /* …rest unchanged… */ });
```

## Deploying to Vercel instead

The app builds to a static `dist/`, so any static host works. Import the
repository in Vercel, framework preset **Vite** (build `npm run build`, output
`dist`). `vercel.json` already rewrites all paths to `/index.html`. Netlify and
Cloudflare Pages work the same way.
