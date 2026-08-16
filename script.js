// ===================================================
// Sunoj Kumar Tomar — Portfolio
// Small, dependency-free interactions.
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  typeText("typedName", "Sunoj Kumar Tomar", 45, () => {
    typeText("typedRole", "Data Engineer", 40, () => {
      const tagline = document.querySelector(".hero-tagline");
      if (tagline) tagline.classList.add("show");
    });
  });

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
});

function typeText(id, text, speed, onDone) {
  const el = document.getElementById(id);
  if (!el) return;
  let i = 0;
  const timer = setInterval(() => {
    el.textContent = text.slice(0, i + 1);
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      if (onDone) onDone();
    }
  }, speed);
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
