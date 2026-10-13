/* ================================================================== *
 * SOLAR DAWN — interactions
 * theme controller · pendant lamp · local time · kinetic type · reveal · pointer light · tilt
 * marquee/nav state · scroll progress · filter · lightbox · scrollspy
 * Motion is transform/opacity only and disabled under reduce-motion.
 * ================================================================== */

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const motionOK = !reduceMotion && finePointer;

/* ---------------------------------------------------- theme */

(function theme() {
  const root = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const meta = document.querySelector('meta[name="theme-color"]');

  const current = () => (root.getAttribute("data-theme") === "dusk" ? "dusk" : "day");

  const apply = (value) => {
    root.setAttribute("data-theme", value);
    if (meta) meta.setAttribute("content", value === "dusk" ? "#120f1c" : "#fbf5ea");
    if (toggle) {
      const night = value === "dusk";
      toggle.setAttribute("aria-pressed", String(night));
      toggle.setAttribute("aria-label", night ? "Switch to day theme" : "Switch to night theme");
    }
  };

  /* one switch, two handles: the nav button and the lamp cord both call this */
  const set = (value, source) => {
    apply(value);
    try { localStorage.setItem("theme", value); } catch (e) { /* ignore */ }
    document.dispatchEvent(new CustomEvent("themechange", { detail: { theme: value, source } }));
  };

  window.siteTheme = {
    get: current,
    set,
    toggle: (source) => set(current() === "dusk" ? "day" : "dusk", source),
  };

  apply(current());
  if (toggle) toggle.addEventListener("click", () => window.siteTheme.toggle("nav"));
})();

/* ---------------------------------------------------- pendant lamp */
/* Pull the cord to switch day <-> dusk. The cord is a spring and the lamp a
   damped pendulum: drag to stretch and swing it, let go past the threshold to
   click the switch. Click / Enter / Space give the same pull for anyone not
   dragging. Under reduced motion it simply switches. */

(function lamp() {
  const lampEl = document.getElementById("lamp");
  const rig = document.getElementById("lampRig");
  const cord = document.getElementById("lampCord");
  if (!lampEl || !rig || !cord || !window.siteTheme) return;

  const MAX_PULL = 70;   // px the bead can travel
  const CLICK_AT = 34;   // px of pull that trips the switch
  const animate = !reduceMotion;

  let angle = 0, angVel = 0;        // degrees, degrees/s
  let pull = 0, pullVel = 0;        // px, px/s
  let raf = 0, last = 0;
  let drag = null;

  const render = () => {
    rig.style.transform = `rotate(${angle.toFixed(3)}deg)`;
    cord.style.setProperty("--cord-pull", `${pull.toFixed(2)}px`);
    cord.style.setProperty("--cord-stretch", (1 + pull / 62).toFixed(4));
  };

  const step = (now) => {
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    last = now;
    if (!drag) {
      angVel += (-26 * angle - 2.1 * angVel) * dt;       // pendulum
      angle += angVel * dt;
      pullVel += (-300 * pull - 17 * pullVel) * dt;      // cord spring
      pull += pullVel * dt;
    }
    render();
    const settled = !drag && Math.abs(angle) < 0.04 && Math.abs(angVel) < 0.04 &&
      Math.abs(pull) < 0.08 && Math.abs(pullVel) < 0.08;
    if (settled) { angle = angVel = pull = pullVel = 0; render(); raf = 0; return; }
    raf = requestAnimationFrame(step);
  };

  const kick = () => {
    if (!animate || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  };

  const sync = () => {
    const night = window.siteTheme.get() === "dusk";
    cord.setAttribute("aria-pressed", String(night));
    cord.setAttribute("aria-label", night
      ? "Pull the lamp cord to switch to the day theme"
      : "Pull the lamp cord to switch to the night theme");
  };

  const ignite = () => {
    if (!animate) return;
    lampEl.classList.remove("is-igniting");
    void lampEl.offsetWidth;
    lampEl.classList.add("is-igniting");
    window.setTimeout(() => lampEl.classList.remove("is-igniting"), 650);
  };

  const markUsed = () => {
    lampEl.classList.add("is-used");
    try { localStorage.setItem("lampUsed", "1"); } catch (e) { /* ignore */ }
  };

  /* a quick tug — for taps, clicks and the keyboard */
  const tug = () => {
    pullVel = 560;
    angVel += (Math.random() < 0.5 ? -1 : 1) * 36;
    kick();
    window.siteTheme.toggle("lamp");
    markUsed();
  };

  cord.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    cord.setPointerCapture(event.pointerId);
    drag = { x: event.clientX, y: event.clientY, t: performance.now(), lastX: event.clientX, moved: 0 };
    kick();
  });

  cord.addEventListener("pointermove", (event) => {
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.moved = Math.max(drag.moved, Math.hypot(dx, dy));
    const raw = Math.max(0, dy);
    pull = raw <= MAX_PULL ? raw : MAX_PULL + (raw - MAX_PULL) * 0.15;   // rubber-band past the stop
    const target = Math.max(-16, Math.min(16, dx * 0.16));
    angVel = (target - angle) * 12;
    angle = target;
    if (!animate) render();
  });

  const release = () => {
    if (!drag) return;
    const quick = drag.moved < 6 && performance.now() - drag.t < 350;
    const tripped = pull >= CLICK_AT;
    drag = null;
    if (quick) { tug(); return; }
    if (tripped) {
      pullVel = -120;
      window.siteTheme.toggle("lamp");
      markUsed();
    }
    if (animate) kick(); else { pull = angle = 0; render(); }
  };

  cord.addEventListener("pointerup", release);
  cord.addEventListener("pointercancel", release);

  /* keyboard (Enter/Space) arrives as a click with detail 0; pointer clicks are handled above */
  cord.addEventListener("click", (event) => { if (event.detail === 0) tug(); });

  /* switched from the nav button: give the lamp a nudge so it feels connected */
  document.addEventListener("themechange", (event) => {
    sync();
    if (event.detail.theme === "dusk") ignite();
    if (event.detail.source !== "lamp") { angVel += 42; kick(); }
  });

  try { if (localStorage.getItem("lampUsed")) lampEl.classList.add("is-used"); } catch (e) { /* ignore */ }
  sync();
  if (window.siteTheme.get() === "dusk") window.setTimeout(ignite, 350);
})();

/* ---------------------------------------------------- local time */
/* "Jalandhar, India · 11:42 PM" — the time where I am, kept current. */

(function localTime() {
  const el = document.getElementById("localTime");
  if (!el || !window.Intl) return;
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
  } catch (e) { return; }
  const tick = () => {
    const now = new Date();
    el.textContent = `${fmt.format(now)} IST`;
    el.setAttribute("datetime", now.toISOString());
  };
  tick();
  window.setInterval(tick, 20000);
})();

/* ---------------------------------------------------- mobile nav */

(function mobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const header = document.getElementById("siteHeader");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  links.addEventListener("click", (event) => {
    if (event.target.tagName === "A") close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  /* header condenses + gains glass once scrolled */
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();

/* ---------------------------------------------------- scroll progress */

(function scrollProgress() {
  const bar = document.getElementById("scrollProgressBar");
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, ratio))})`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
})();

/* ---------------------------------------------------- pointer light */

(function pointerLight() {
  if (!motionOK) return;
  const light = document.getElementById("pointerLight");
  if (!light) return;

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 3;
  let targetX = x;
  let targetY = y;
  let raf = 0;

  const loop = () => {
    x += (targetX - x) * 0.14;
    y += (targetY - y) * 0.14;
    light.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    raf = requestAnimationFrame(loop);
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      light.style.opacity = "1";
      if (!raf) loop();
    },
    { passive: true }
  );

  document.addEventListener("mouseleave", () => {
    light.style.opacity = "0";
  });
})();

/* ---------------------------------------------------- kinetic type */

(function kineticType() {
  if (reduceMotion) return;

  const makeWord = (content, index, isNode) => {
    const w = document.createElement("span");
    w.className = "w";
    const wi = document.createElement("span");
    wi.className = "wi";
    wi.style.setProperty("--i", String(index));
    if (isNode) wi.appendChild(content);
    else wi.textContent = content;
    w.appendChild(wi);
    return w;
  };

  document.querySelectorAll('[data-split="words"]').forEach((el) => {
    const nodes = Array.from(el.childNodes);
    const frag = document.createDocumentFragment();
    let i = 0;

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          /* keep punctuation glued to the previous word so it doesn't animate alone */
          const prev = frag.lastChild;
          const prevWord = prev && prev.querySelector ? prev.querySelector(".wi") : null;
          if (prevWord && !/[\p{L}\p{N}]/u.test(part)) {
            prevWord.appendChild(document.createTextNode(part));
            return;
          }
          frag.appendChild(makeWord(part, i++, false));
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === "BR") frag.appendChild(document.createElement("br"));
        else frag.appendChild(makeWord(node.cloneNode(true), i++, true));
      }
    });

    el.textContent = "";
    el.appendChild(frag);
  });

  /* the hero name: sweep on load, and again on hover */
  const name = document.querySelector(".hero-name");
  if (name) {
    const sweep = () => {
      name.classList.remove("is-sweeping");
      void name.offsetWidth;
      name.classList.add("is-sweeping");
    };
    window.setTimeout(sweep, 520);
    if (finePointer) name.addEventListener("mouseenter", sweep);
  }
})();

/* ---------------------------------------------------- reveal on scroll */

(function reveal() {
  const targets = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!targets.length) return;

  /* stagger siblings within the same parent */
  const counts = new Map();
  targets.forEach((el) => {
    const parent = el.parentElement;
    const n = counts.get(parent) || 0;
    counts.set(parent, n + 1);
    el.style.setProperty("--reveal-delay", `${Math.min(n, 4) * 80}ms`);
  });

  const splitTargets = Array.from(document.querySelectorAll("[data-split]"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    splitTargets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  let fired = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        fired = true;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  targets.forEach((el) => observer.observe(el));
  splitTargets.forEach((el) => observer.observe(el));

  /* safety net: if the observer never fires (background tab, prerender,
     throttled webview) show everything rather than a blank page. When it
     does fire normally, scroll reveals keep working. */
  window.setTimeout(() => {
    if (fired) return;
    targets.forEach((el) => el.classList.add("is-visible"));
    splitTargets.forEach((el) => el.classList.add("is-visible"));
    observer.disconnect();
  }, 3000);
})();

/* ---------------------------------------------------- card tilt */

(function tilt() {
  if (!motionOK) return;

  document.querySelectorAll("[data-tilt]").forEach((card) => {
    const max = 5;

    const move = (event) => {
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.classList.add("is-tilting");
      card.style.transform = `translateY(-6px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
    };

    const reset = () => {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    };

    card.addEventListener("pointermove", move);
    card.addEventListener("pointerleave", reset);
    card.addEventListener("blur", reset);
  });
})();

/* ---------------------------------------------------- project filter */

(function projectFilter() {
  const buttons = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll("#projectGrid .project-card");
  const empty = document.getElementById("emptyState");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });

      let shown = 0;
      cards.forEach((card) => {
        const cats = (card.dataset.cat || "").split(/\s+/);
        const match = filter === "all" || cats.includes(filter);
        card.hidden = !match;
        if (match) shown += 1;
      });

      if (empty) empty.hidden = shown > 0;
    });
  });
})();

/* ---------------------------------------------------- lightbox */

(function lightbox() {
  const box = document.getElementById("lightbox");
  const img = document.getElementById("lightboxImg");
  const closeButton = document.getElementById("lightboxClose");
  if (!box || !img) return;

  let lastFocused = null;

  const open = (source) => {
    lastFocused = document.activeElement;
    img.src = source.currentSrc || source.src;
    img.alt = source.alt;
    box.hidden = false;
    document.body.style.overflow = "hidden";
    closeButton.focus();
  };

  const close = () => {
    box.hidden = true;
    img.src = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  document.querySelectorAll(".shot img").forEach((source) => {
    source.addEventListener("click", () => open(source));
  });

  closeButton.addEventListener("click", close);
  box.addEventListener("click", (event) => {
    if (event.target === box) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !box.hidden) close();
  });
})();

/* ---------------------------------------------------- scrollspy */

(function scrollSpy() {
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
})();

/* ---------------------------------------------------- footer year */

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
