# Portfolio — Lovepreet Sharma

Personal site: AI/ML work, research, and shipped software.

Static and dependency-free — three files plus images, no build step, no framework.
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 5173
```





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
