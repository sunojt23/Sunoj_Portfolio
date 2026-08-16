// ===================================================
// Sunoj Kumar Tomar — Portfolio
// Small, dependency-free interactions.
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  typeText("typedName", "Sunoj Kumar Tomar", 45, () => {
    typeText("typedRole", "> Data Engineer", 35);
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
  const fontSize = 15;
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
    ctx.fillStyle = "rgba(6, 10, 8, 0.06)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + "px monospace";
    ctx.fillStyle = "rgba(51, 209, 122, 0.28)";

    for (let i = 0; i < columns; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > h && Math.random() > 0.98) drops[i] = 0;
      drops[i]++;
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
}
