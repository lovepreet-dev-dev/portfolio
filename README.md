# Portfolio — Lovepreet Sharma

Personal site: AI/ML work, research, and shipped software.

Static and dependency-free — three files plus images, no build step, no framework.
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 5173
```

## Design — "Solar Dawn"

A dawn sky the content is lit by: a sun medallion portrait, a light-swept name,
glass panels over a dawn gradient, and bento grids. Two themes ship in one build
and are toggled from the nav (persisted in `localStorage`, defaulting to the
visitor's `prefers-color-scheme`):

- **day** — warm dawn (terracotta / amber / moss on cream)
- **dusk** — deep night (amber on indigo, sun becomes a moon)

The only external request is the **Fraunces** display font from Google Fonts
(preconnect + `display=swap`, system serif fallback if it fails). Everything else
is hand-written CSS, vanilla JS and inline SVG — no libraries.

Motion is `transform`/`opacity` only and is fully disabled under
`prefers-reduced-motion`. Light screenshots keep a lit frame so they stay
readable in the dusk theme.

> The original paper/print design lives on `main`; this is the `solar-dawn-redesign`
> branch. `git diff main` is the whole redesign.

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
