/* ------------------------------------------------------------------ *
 * Portfolio interactions: nav, project filtering, screenshot lightbox,
 * scroll reveal, scrollspy.
 * ------------------------------------------------------------------ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------- mobile nav */

(function mobileNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
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

/* ---------------------------------------------------- scroll reveal */

(function scrollReveal() {
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const targets = document.querySelectorAll(
    ".project-card, .research-grid article, .skill-card, .timeline-item, .achievement-card, .section-heading, .hero-stats > div"
  );

  // Gate the hidden state on JS being alive, so a script failure can never
  // leave the page blank.
  document.documentElement.classList.add("js");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

  targets.forEach((target, index) => {
    target.classList.add("reveal");
    target.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    observer.observe(target);
  });

  // Safety net: the animation is decoration, the content is not. If the
  // observer never fires — background tab, prerender, a throttled webview —
  // show everything anyway rather than leaving the page blank.
  window.setTimeout(() => {
    targets.forEach((target) => target.classList.add("is-visible"));
    observer.disconnect();
  }, 3000);
})();

/* ---------------------------------------------------- scrollspy */

(function scrollSpy() {
  const links = Array.from(document.querySelectorAll(".nav-links a"));
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("is-current", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  sections.forEach((section) => observer.observe(section));
})();

/* ---------------------------------------------------- footer year */

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
