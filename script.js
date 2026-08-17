// ===================================================
// Sunoj Kumar Tomar — Portfolio
// Small, dependency-free interactions.
// ===================================================

// Applies the hidden `.js-anim` state instantly, with no transition — so
// switching an already-visible element into "about to be revealed" never
// itself plays as a visible fade-out. The transition is restored right
// after, so removing the class later animates normally.
function hideForAnim(el) {
  el.style.transition = "none";
  el.classList.add("js-anim");
  el.offsetHeight; // force a reflow so the transition-less state actually paints
  el.style.transition = "";
}

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
  initReveal(".skill-group", ".skill-item", 45);
  initReveal(".about-reveal", ".reveal-line, .fact, .stat", 110);
  initReveal(".timeline", ".job", 150);
  initReveal(".blog-list", ".blog-post", 150);
  initReveal(".contact-list", ".contact-item", 90);
  initStatsCounter();
  initTelegram();
  initQuoteSlider();
  initBlogSlider();
});

// Home page intro: the name decodes itself out of scrambled characters,
// then the designation and quote pull into focus in sequence. Both start
// fully visible in the HTML — .js-anim (added here, right before the
// animation runs) is what makes them fade out to animate back in, so a
// script that fails to run never leaves real content hidden.
function initHeroScramble() {
  const nameEl = document.getElementById("typedName");
  if (!nameEl) return; // only on the home page

  const finalName = nameEl.textContent.trim();
  const role = document.querySelector(".hero-role");
  const quote = document.querySelector(".hero-quote");
  const social = document.querySelector(".social-row");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) return; // leave name, role, quote, and social row exactly as authored

  if (role) hideForAnim(role);
  if (quote) hideForAnim(quote);
  if (social) hideForAnim(social);

  scrambleText(nameEl, finalName, 1100, () => {
    if (role) role.classList.remove("js-anim");
    setTimeout(() => { if (quote) quote.classList.remove("js-anim"); }, 450);
    setTimeout(() => { if (social) social.classList.remove("js-anim"); }, 800);
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

// Generic scroll-reveal: every `itemSelector` inside each `containerSelector`
// fades/blurs/lifts into place, staggered, the first time its container
// scrolls into view. Used for skills, About's statement/facts/stats, the
// experience timeline, and the contact list — one mechanism, several pages.
//
// Items are fully visible by default in the HTML/CSS. This only *adds* the
// hidden `.js-anim` state right before observing, and removes it again on
// reveal — so if this script never runs (blocked, slow, an error upstream),
// every page still renders with normal, fully legible text.
function initReveal(containerSelector, itemSelector, staggerMs) {
  const containers = document.querySelectorAll(containerSelector);
  if (!containers.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // leave everything exactly as authored, no hiding at all

  containers.forEach((container) => {
    container.querySelectorAll(itemSelector).forEach((item, i) => {
      item.style.setProperty("--delay", `${i * staggerMs}ms`);
      hideForAnim(item);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          entry.target.querySelectorAll(itemSelector).forEach((item) => item.classList.remove("js-anim"));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  containers.forEach((container) => observer.observe(container));
}

// The telegram message types itself out, teletype-style, the first time it
// scrolls into view — a different animation identity from the home page's
// scramble, fitting the vintage voice of this one page. The full message
// stays in the HTML the whole time; only the observer callback below ever
// clears it, right as typing is about to start, so it's never blank while
// waiting on the scroll trigger.
function initTelegram() {
  const el = document.getElementById("telegramBody");
  if (!el) return;

  const finalText = el.textContent.trim();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // leave the authored text as-is

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);

        el.textContent = "";
        const cursor = document.createElement("span");
        cursor.className = "telegram-cursor";
        cursor.textContent = "▌";

        let i = 0;
        const speed = 26;
        const timer = setInterval(() => {
          el.textContent = finalText.slice(0, i + 1);
          el.appendChild(cursor);
          i++;
          if (i >= finalText.length) {
            clearInterval(timer);
            setTimeout(() => cursor.remove(), 1000);
          }
        }, speed);
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(el);
}

// Stat numbers count up from zero the first time they scroll into view.
// Each one keeps its real, final text until the moment it actually starts
// counting — never zeroed out while just waiting to scroll into view.
function initStatsCounter() {
  const nums = document.querySelectorAll(".stat-num[data-count]");
  if (!nums.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // leave the final text as authored

  const format = (value, decimals, suffix) => `${value.toFixed(decimals)}${suffix}`;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (!entry.isIntersecting) return;
        observer.unobserve(el);

        const target = parseFloat(el.dataset.count);
        const decimals = (el.dataset.count.split(".")[1] || "").length;
        const suffix = el.dataset.suffix || "";
        const duration = 1200;
        el.textContent = format(0, decimals, suffix);
        const start = performance.now();

        function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3); // ease-out-cubic
          el.textContent = format(target * eased, decimals, suffix);
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );

  nums.forEach((el) => observer.observe(el));
}

// One quote at a time, sliding via transform. Auto-advances on a timer,
// pauses while hovered or focused, and is always controllable via dots —
// so it never fights a reader who's actually trying to read one.
function initQuoteSlider() {
  const slider = document.getElementById("quoteSlider");
  const track = document.getElementById("quoteTrack");
  const dotsWrap = document.getElementById("quoteDots");
  if (!slider || !track || !dotsWrap) return;

  const slides = Array.from(track.children);
  if (slides.length < 2) return; // nothing to slide between

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "quote-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Show quote ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => d.classList.toggle("active", di === index));
  }

  function next() { goTo(index + 1); }

  function start() {
    if (reduceMotion || timer) return;
    timer = setInterval(next, 5500);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  slider.addEventListener("focusin", stop);
  slider.addEventListener("focusout", start);

  start();
}

// The blog strip scrolls natively (drag/swipe/wheel all just work via
// overflow-x); the arrow buttons are a discoverability aid on top, and
// hide themselves entirely when there's only one post to show.
function initBlogSlider() {
  const slider = document.getElementById("blogSlider");
  const prevBtn = document.getElementById("blogPrev");
  const nextBtn = document.getElementById("blogNext");
  if (!slider || !prevBtn || !nextBtn) return;

  const slides = Array.from(slider.children);
  if (slides.length < 2) {
    prevBtn.hidden = true;
    nextBtn.hidden = true;
    return;
  }

  function step() {
    const first = slides[0];
    return first.getBoundingClientRect().width + 28; // slide width + gap
  }

  prevBtn.addEventListener("click", () => slider.scrollBy({ left: -step(), behavior: "smooth" }));
  nextBtn.addEventListener("click", () => slider.scrollBy({ left: step(), behavior: "smooth" }));

  function updateArrows() {
    const max = slider.scrollWidth - slider.clientWidth - 4;
    prevBtn.style.opacity = slider.scrollLeft <= 4 ? "0.3" : "1";
    nextBtn.style.opacity = slider.scrollLeft >= max ? "0.3" : "1";
  }

  slider.addEventListener("scroll", updateArrows, { passive: true });
  updateArrows();
}
