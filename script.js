/* ------------------------------------------------------------------ *
 * Portfolio interactions: background canvas, nav, project filtering,
 * screenshot lightbox, scroll reveal, scrollspy.
 * ------------------------------------------------------------------ */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------- neural canvas */

(function neuralBackground() {
  const canvas = document.getElementById("neuralCanvas");
  if (!canvas || reduceMotion) return;

  const ctx = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];
  let pointer = { x: 0, y: 0, active: false };
  let running = true;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    // Fewer nodes on small screens — the O(n^2) link pass is the cost here.
    const density = width < 720 ? 30000 : 19000;
    const count = Math.min(78, Math.max(26, Math.floor((width * height) / density)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.7 + 0.8
    }));
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        if (Math.hypot(dx, dy) < 130) {
          p.x += dx / 240;
          p.y += dy / 240;
        }
      }
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 140) {
          ctx.strokeStyle = `rgba(114, 242, 200, ${(1 - distance / 140) * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
      glow.addColorStop(0, "rgba(122, 168, 255, 0.85)");
      glow.addColorStop(1, "rgba(122, 168, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "rgba(238, 245, 255, 0.85)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY, active: true };
  });
  window.addEventListener("pointerleave", () => { pointer.active = false; });

  // Stop burning frames when the tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      draw();
    }
  });

  resize();
  draw();
})();

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
