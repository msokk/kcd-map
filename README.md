# Kingdom Come: Deliverance — Interactive Map

A modern rebuild of the original [kingdomcomemap.github.io](https://github.com/kingdomcomemap/kingdomcomemap.github.io)
interactive map. The UX and visuals are intentionally kept identical to the
original; only the technology stack has been modernized.

## Stack

| Concern        | Original                         | Rebuild                          |
| -------------- | -------------------------------- | -------------------------------- |
| Build/tooling  | none (static files)              | **Vite** + **TypeScript**        |
| UI             | jQuery + hand-written DOM        | **React 18**                     |
| Map engine     | Leaflet 1.x                      | **Leaflet 1.9** via react-leaflet |
| Styling        | hand-tuned CSS                   | ported CSS + Tailwind (available) |
| i18n           | i18next 1.6                      | **i18next** + react-i18next      |

Leaflet remains the map engine — it is the right tool for a custom-CRS tiled
image map. The original Leaflet plugins (smooth-wheel-zoom, hash, coordinates,
fullscreen) are preserved verbatim under `src/vendor/` and loaded as
side-effects so map behavior matches the original exactly.

## Project layout

```
public/
  map/            8192px map split into 256px JPG tiles (z_x_y.jpg)
  assets/         icons, fonts, flags, backgrounds
src/
  components/     React components (sidebar, map layers, popups)
  data/           marker data as JSON (generated from the legacy JS)
  lib/            CRS, icons, categories, storage, geo helpers
  styles/         ported legacy stylesheets
  vendor/         original Leaflet plugins (side-effect imports)
scripts/
  convert-data.mjs   regenerates src/data/*.json from legacy/js
legacy/           the original source, kept for reference
```

## Development

```bash
npm install
npm run dev        # http://localhost:5173/kcd-map/
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

### Regenerating marker data

Marker data lives in `src/data/*.json`, generated once from the original
`legacy/js/markers.js` and `legacy/js/usr_markers.js`:

```bash
npm run convert-data
```

## Deployment

Pushing to `main` builds the site and publishes `dist/` to GitHub Pages via
`.github/workflows/deploy.yml`. The site is served from `/kcd-map/` (see the
`base` option in `vite.config.ts`); the ported stylesheet references assets at
that base path, so keep them in sync if the repository name changes.

Enable **Settings → Pages → Source: GitHub Actions** on the repository.

## Credits

Original map created by **RogerHN**. The Kingdom Come: Deliverance logo, icons,
and map are copyright and property of [Warhorse Studios](https://warhorsestudios.cz/).
