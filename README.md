# bilalxkhanjee-labs

AI-assisted web builds by Muhammad Bilal (Zynter Soft), deployed on Vercel. One site per route.

| Route | Site | Built with |
| --- | --- | --- |
| `/kairova-agency/` | Kairova — branding agency landing page (fictional brand) | plain HTML/CSS/JS |
| `/ice-cave/` | Nivra.Studio — scroll-driven WebGL journey through an ice cave (fictional brand) | Vite + React + TypeScript, source in `apps/ice-cave/` |

`/` currently redirects to `/kairova-agency/` until the index page of all demos is added.

## Building `/ice-cave/`

The deployed files in `ice-cave/` are the Vite build output and are committed, so Vercel serves the repo as static files with no build step. To change the site, edit `apps/ice-cave/src/`, then from `apps/ice-cave/`:

```bash
npm install
npx vite build
```

`vite.config.ts` writes the build to `../../ice-cave` with the base path `/ice-cave/`. On Windows, if the repo sits in a very deep folder, install and build from a shorter copy of `apps/ice-cave` and pass `--outDir` pointing back at the repo's `ice-cave/` folder (long `node_modules` paths can exceed the 260-character limit).

## Credits

- Both sites are inspired by MotionSites designs. Redesigned by Muhammad Bilal.
- Kairova: hero jacket image supplied by Muhammad Bilal; Selected Works photos from Unsplash (Chyntia Juls, Philipp Arlt, Levin Anton, mojtaba mosayebzadeh); card, portrait and avatar images load from the design's own CDN, as given in the source prompt.
- Nivra.Studio: the 120 cave frames, depth maps and menu icon load from `assets.uberdesigner.ai`, as given in the source prompt. Fonts: Instrument Sans and Instrument Serif (Google Fonts, SIL Open Font License).

## Run locally

Any static server works, for example `npx serve .` from the repo root.

---
Built by [Zynter Soft](https://www.linkedin.com/company/zyntersoft) · zyntersoft@gmail.com
