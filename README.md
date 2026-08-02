# Portfolio — Lovepreet Sharma

Personal site: AI/ML work, research, and shipped software.

Static and dependency-free — three files plus images, no build step, no framework.
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 5173
```

## Structure

| File | What it holds |
|------|---------------|
| `index.html` | All content — hero, 14 projects, research, stack, about, contact |
| `styles.css` | Full stylesheet, dark theme, responsive down to 320px |
| `script.js` | Canvas background, mobile nav, project filtering, screenshot lightbox, scroll reveal, scrollspy |
| `assets/shots/` | Project screenshots (WebP, ~316 KB total) |

## Screenshots

Every image in `assets/shots/` is captured from the real thing — the running
application, or the actual evaluation output of a research pipeline. Nothing is a
mockup. To refresh one, run the project and capture it:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --window-size=1440,900 --screenshot=shot.png http://localhost:PORT/
```

Then convert to WebP to keep the page light:

```bash
cwebp -q 84 shot.png -o assets/shots/name.webp
```

Images carry explicit `width`/`height` so the layout does not shift while they load.

## Adding a project

Copy an existing `<article class="project-card">` in `index.html`. The `data-cat`
attribute drives the filter bar and accepts multiple space-separated values from
`research`, `systems`, `product`, `tools`. Add `is-wide` to make a card span both
columns, or `is-text` for a card with no screenshot.

## Notes

- The scroll-reveal animation is gated behind a `js` class on `<html>` and has a
  3-second fallback, so content is never left invisible if scripting fails or the
  IntersectionObserver never fires.
- Respects `prefers-reduced-motion`: the canvas animation and reveals are skipped.
