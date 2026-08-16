// ===================================================
// Sunoj Kumar Tomar — Portfolio
// Small, dependency-free interactions.
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  initHeroScramble();

  document.getElementById("year").textContent = new Date().getFullYear();

  const menuBtn = document.getElementById("menuBtn");
  const tabs = document.getElementById("tabs");
  if (menuBtn && tabs) {
    menuBtn.addEventListener("click", () => tabs.classList.toggle("open"));
    tabs.querySelectorAll(".tab").forEach((t) =>
      t.addEventListener("click", () => tabs.classList.remove("open"))
    );
  }

  setActiveTab();
  initRain();
  initSkillsReveal();
  initAboutReveal();
  initStatsCounter();
});

// Home page intro: the name decodes itself out of scrambled characters,
// then the designation and quote pull into focus in sequence.
function initHeroScramble() {
  const nameEl = document.getElementById("typedName");
  if (!nameEl) return; // only on the home page

  const finalName = nameEl.textContent.trim();
  const role = document.querySelector(".hero-role");
  const quote = document.querySelector(".hero-quote");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    nameEl.textContent = finalName;
    if (role) role.classList.add("show");
    if (quote) quote.classList.add("show");
    return;
  }

  scrambleText(nameEl, finalName, 1100, () => {
    if (role) role.classList.add("show");
    setTimeout(() => { if (quote) quote.classList.add("show"); }, 450);
  });
}

// Cycles each character through random glyphs before locking it to its
// final value, left to right with a little jitter — a decode/reveal effect.
function scrambleText(el, finalText, duration, onDone) {
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}=+*^?#";
  const frameRate = 32;
  const totalFrames = Math.ceil(duration / frameRate);
  const length = finalText.length;

  const revealFrame = finalText.split("").map((c, i) => {
    if (c === " ") return 0;
    return Math.floor((i / length) * totalFrames * 0.65 + Math.random() * totalFrames * 0.35);
  });

  let frame = 0;
  const timer = setInterval(() => {
    let out = "";
    for (let i = 0; i < length; i++) {
      const c = finalText[i];
      if (c === " " || frame >= revealFrame[i]) {
        out += c;
      } else {
        out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
    }
    el.textContent = out;
    frame++;
    if (frame > totalFrames) {
      clearInterval(timer);
      el.textContent = finalText;
      if (onDone) onDone();
    }
  }, frameRate);
}

// Highlight the nav tab matching the current page filename.
function setActiveTab() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".tab").forEach((tab) => {
    if (tab.getAttribute("href") === current) tab.classList.add("active");
  });
}

// Faint binary rain in the background — a texture, not a spectacle.
// Skipped entirely if the user prefers reduced motion.
function initRain() {
  const canvas = document.getElementById("rain");
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  const fontSize = 16;
  const chars = "01";
  let w, h, columns, drops;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    columns = Math.floor(w / fontSize);
    drops = new Array(columns).fill(0).map(() => Math.random() * -100);
  }
  resize();
  window.addEventListener("resize", resize);

  function draw() {
    // Short trail fade — visible motion without smearing into a solid haze.
    ctx.fillStyle = "rgba(10, 10, 11, 0.045)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < columns; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      // Mostly neutral gray digits, with an occasional amber "lead" glyph —
      // a single signal in the noise, matching the accent color.
      ctx.fillStyle = Math.random() > 0.97
        ? "rgba(240, 194, 116, 0.75)"
        : "rgba(161, 161, 170, 0.35)";
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}

// Skills fade + lift into place, staggered, the first time each group
// scrolls into view. Reduced-motion users just see them appear.
function initSkillsReveal() {
  const groups = document.querySelectorAll(".skill-group");
  if (!groups.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  groups.forEach((group) => {
    group.querySelectorAll(".skill-item").forEach((item, i) => {
      item.style.setProperty("--delay", `${i * 45}ms`);
    });
  });

  if (reduceMotion) {
    groups.forEach((group) => group.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
  );

  groups.forEach((group) => observer.observe(group));
}

// The About page's statement and facts pull into focus (blur + lift),
// staggered, the first time each block scrolls into view.
function initAboutReveal() {
  const blocks = document.querySelectorAll(".about-reveal");
  if (!blocks.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  blocks.forEach((block) => {
    const items = block.querySelectorAll(".reveal-line, .fact, .stat");
    items.forEach((item, i) => {
      item.style.setProperty("--delay", `${i * 110}ms`);
    });
  });

  if (reduceMotion) {
    blocks.forEach((block) => block.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  blocks.forEach((block) => observer.observe(block));
}

// Stat numbers count up from zero the first time they scroll into view.
function initStatsCounter() {
  const nums = document.querySelectorAll(".stat-num[data-count]");
  if (!nums.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // leave the final text as authored

  const format = (value, decimals, suffix) => `${value.toFixed(decimals)}${suffix}`;

  nums.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split(".")[1] || "").length;
    const suffix = el.dataset.suffix || "";
    el.textContent = format(0, decimals, suffix);
    el.dataset.animated = "false";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting && el.dataset.animated === "false") {
          el.dataset.animated = "true";
          const target = parseFloat(el.dataset.count);
          const decimals = (el.dataset.count.split(".")[1] || "").length;
          const suffix = el.dataset.suffix || "";
          const duration = 1200;
          const start = performance.now();

          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
            el.textContent = format(target * eased, decimals, suffix);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );

  nums.forEach((el) => observer.observe(el));
}
