# Portfolio — Lovepreet Sharma

Personal site: AI/ML work, research, and shipped software.

Static and dependency-free — three files plus images, no build step, no framework.
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 5173
```

## Design — "Solar Dawn"

A dawn sky the content is lit by: a pendant lamp, a light-swept name, glass
panels over a dawn gradient, and bento grids. Two themes ship in one build,
persisted in `localStorage` and defaulting to the visitor's `prefers-color-scheme`.
They switch from the nav button or by **pulling the lamp cord** in the hero:

- **day** — warm dawn (terracotta / amber / moss on cream)
- **dusk** — deep night (amber on indigo); the lamp comes on and lights the name

The only external request is the **Fraunces** display font from Google Fonts
(preconnect + `display=swap`, system serif fallback if it fails). Everything else
is hand-written CSS, vanilla JS and inline SVG — no libraries.

The lamp cord is a real `<button>`: drag it down past the stop, tap it, or press
Enter/Space. The cord is a spring and the lamp a damped pendulum (`script.js`,
"pendant lamp"); both handles go through one `window.siteTheme` controller, so
they never disagree. The portrait lives at the end of the page, in Contact.

Motion is `transform`/`opacity` only and is fully disabled under
`prefers-reduced-motion`. Light screenshots keep a lit frame so they stay
readable in the dusk theme.

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
