# bilalxkhanjee-labs

AI-assisted web builds by Muhammad Bilal (Zynter Soft), deployed on Vercel. One site per route.

| Route | Site | Built with |
| --- | --- | --- |
| `/kairova-agency/` | Kairova — branding agency landing page (fictional brand) | plain HTML/CSS/JS |
| `/ice-cave/` | Nivra.Studio — scroll-driven WebGL journey through an ice cave (fictional brand) | Vite + React + TypeScript, source in `apps/ice-cave/` |
| `/vibe-keyboard/` | Vibestrike — real-time three.js keyboard that flies, splits and lights up as you scroll (fictional brand) | Vite + React + TypeScript + three.js, source in `apps/vibe-keyboard/` |

`/` currently redirects to `/kairova-agency/` until the index page of all demos is added.

## Building the React sites

The deployed files in `ice-cave/` and `vibe-keyboard/` are Vite build output and are committed, so Vercel serves the repo as static files with no build step. To change a site, edit `apps/<site>/src/`, then from `apps/<site>/`:

```bash
npm install
npx tsc -p tsconfig.app.json --noEmit
npx vite build
```

Each `vite.config.ts` writes the build to `../../<site>` with the base path `/<site>/`. On Windows, if the repo sits in a very deep folder, install and build from a shorter copy of `apps/<site>` and pass `--outDir` pointing back at the repo's `<site>/` folder (long `node_modules` paths can exceed the 260-character limit).

## Assets

Both React sites' prompts load their images from `assets.uberdesigner.ai`. Some networks reset Chrome's connections to that host (Encrypted Client Hello), which left the pages blank there, so the files are self-hosted instead: the ice-cave frames, depth maps and menu icon in `apps/ice-cave/public/frames/`, and the keyboard textures in `apps/vibe-keyboard/public/textures/`.

## Credits

- All three sites are inspired by MotionSites designs. Redesigned by Muhammad Bilal.
- Kairova: hero jacket image supplied by Muhammad Bilal; Selected Works photos from Unsplash (Chyntia Juls, Philipp Arlt, Levin Anton, mojtaba mosayebzadeh); card, portrait and avatar images load from the design's own CDN, as given in the source prompt.
- Nivra.Studio: the 120 cave frames, depth maps and menu icon come from the source prompt (originally hosted on `assets.uberdesigner.ai`). Fonts: Instrument Sans and Instrument Serif (Google Fonts, SIL Open Font License).
- Vibestrike: the keycap legend atlas, logic board, battery label, light pool, grain and smudge textures come from the source prompt (originally hosted on `assets.uberdesigner.ai`). Fonts: Instrument Sans and Newsreader (Google Fonts, SIL Open Font License). Libraries: three.js, postprocessing, n8ao, GSAP.

## Run locally

Any static server works, for example `npx serve .` from the repo root.

---
Built by [Zynter Soft](https://www.linkedin.com/company/zyntersoft) · zyntersoft@gmail.com
