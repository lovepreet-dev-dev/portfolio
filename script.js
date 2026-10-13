/* ================================================================== *
 * SOLAR DAWN — interactions
 * theme controller · kinetic type · reveal · pointer light · tilt
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
  if (!toggle) return;

  const apply = (value) => {
    root.setAttribute("data-theme", value);
    if (meta) meta.setAttribute("content", value === "dusk" ? "#120f1c" : "#fbf5ea");
    const night = value === "dusk";
    toggle.setAttribute("aria-pressed", String(night));
    toggle.setAttribute("aria-label", night ? "Switch to day theme" : "Switch to night theme");
  };

  apply(root.getAttribute("data-theme") === "dusk" ? "dusk" : "day");

  toggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dusk" ? "day" : "dusk";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  });
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
