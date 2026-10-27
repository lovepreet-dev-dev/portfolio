# AGENTS.md — Lovepreet Sharma's portfolio

Personal site for Lovepreet Sharma (AI/ML engineer and software developer, M.Tech at NIT
Jalandhar), aimed at recruiters for AI/ML, SDE and full-stack roles. Live at
https://lovepreet-dev-dev.github.io/portfolio/ (GitHub Pages, served from `main`).

## Run / build

Static site: `index.html`, `styles.css`, `script.js`. No framework, no build step.

```bash
python3 -m http.server 5190     # then open http://localhost:5190
```

`.claude/launch.json` has this as the `portfolio` preview config. Pages publishes about 40–80 s
after a push to `main`.

## Layout

| Path | What |
|---|---|
| `index.html` | All content: hero (pendant lamp), projects, stack, about, timeline, research, achievements, contact |
| `styles.css` | "Solar Dawn" design: `day` / `dusk` themes as tokens on `[data-theme]` |
| `script.js` | Theme controller (`window.siteTheme`), lamp physics, local time, reveal, filter, lightbox, scrollspy |
| `assets/shots/` | Project screenshots, WebP |
| `assets/media/` | Product videos (Learn Visually tour, DineDirect promo) |
| `resume.pdf` | Linked from the hero and contact |
| `planremind/`, `remindly/` | Privacy policy / terms pages for the Android apps |

## Key decisions

- **Products first, research later.** He wants product / SDE roles. The project order and the hero
  stats reflect this.
- **Only real screenshots.** Images come from the running app or the app's own store screenshots,
  never mockups. Retake and Shop Point have no usable screenshot, so their cards are text-only.
- **Every number is checked against the code or data**, not copied from a README.
- **Excluded on purpose:** DesVid / desvids, SecretSaver (RecVault), xforums, Calendar Vault
  (`lc_calender`). Forks (`opencode`, `vorssaint-utils`) are not his work.
- Images carry width/height equal to the real file; keep `height: auto` alongside `aspect-ratio`.
- The HCL Retail Operations Copilot is a **team of three** project; say so.
- Shop Point's client is described without naming them ("a jeans store in Bathinda") until he says
  the name may be public.

## Verification

Last session (2026-10-27) was static only, by request: no app or browser was run. Checked:
every local `src` / `href` / `poster` resolves, and the HTML parses with no mismatched tags.
The lamp interactions were last tested in a browser on 2026-10-14 (13/13 passing, live site).

## Status / next steps

- 21 projects on the site. New on 2026-10-27: Retake, Shop Point, Remindly, Retail Operations
  Copilot; Kundli card now includes the Android app (Kundli AI); DineDirect card has the promo video.
- Open: real screenshots of Retake (macOS app) and Shop Point would replace the text-only cards.
- Open: commit `bf7b9f6` (Remindly privacy policy, from another session) carries a
  `Co-Authored-By: Claude` line; removing it needs a force-push, so ask first.
- `assets/shots/mlstudio-algo.webp` is unused; ask before deleting.

## Working rules

- Commit and push straight to `main` (Pages deploys from it).
- **Never** add `Co-Authored-By: Claude` or any AI attribution to commits or PRs.
- Keep commits logical; verify the live URL after pushing.
