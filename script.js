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
  initReveal(".takes-list", ".take", 130);
  initReveal(".contact-list", ".contact-item", 90);
  initStatsCounter();
  initQuoteSlider();
  initBlogSlider();
  initSkillEvidence();
  initFlows();
  initCopyButtons();
  initPalette();
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
    ctx.fillStyle = "rgba(16, 13, 12, 0.045)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < columns; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      // Mostly neutral gray digits, with a rare, quiet terracotta glyph —
      // a single signal in the noise, matching the accent color.
      ctx.fillStyle = Math.random() > 0.985
        ? "rgba(217, 138, 95, 0.5)"
        : "rgba(168, 154, 140, 0.22)";
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


// ===================================================
// Interactive pieces
// ===================================================

// --- small shared helpers -------------------------------------------------

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  // restart the transition even if a toast is already showing
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(toast._hide);
  toast._hide = setTimeout(() => toast.classList.remove("show"), 1900);
}

// Clipboard API needs a secure context (https / localhost); fall back to the
// older execCommand route so "copy" still works anywhere it reasonably can.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { /* ignore */ }
    ta.remove();
    return ok;
  }
}

const SITE_EMAIL = "sunojtomar23@gmail.com";
const RESUME_PATH = "assets/Sunoj_Kumar_Tomar_Resume.pdf";

// --- Skills: click a skill, see where it was used --------------------------
// Only skills the CV actually shows in use are clickable; the rest stay plain,
// so nothing here claims more than the CV does.
const SKILL_EVIDENCE = {
  rag:       { where: "Project",    label: "ServiceNow AI Resolution Assistant", href: "projects.html#rag" },
  inventory: { where: "Project",    label: "Inventory Management & Demand Forecasting", href: "projects.html#inventory" },
  cognizant: { where: "Experience", label: "Cognizant — Data Engineer", href: "experience.html#cognizant" },
  eurekai:   { where: "Experience", label: "Eurekai — AI Researcher", href: "experience.html#eurekai" },
};

function initSkillEvidence() {
  const panel = document.getElementById("skillEvidence");
  if (!panel) return;

  const hint = panel.innerHTML;
  const buttons = Array.from(document.querySelectorAll(".skill-item.has-ev"));
  let current = null;

  function reset() {
    current = null;
    panel.innerHTML = hint;
    panel.classList.remove("active");
    buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
  }

  function show(btn) {
    current = btn;
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    panel.classList.add("active");
    panel.textContent = "";

    const name = document.createElement("span");
    name.className = "ev-skill";
    name.textContent = btn.textContent;
    panel.appendChild(name);

    btn.dataset.ev.split(/\s+/).filter((k) => SKILL_EVIDENCE[k]).forEach((key) => {
      const ev = SKILL_EVIDENCE[key];
      const link = document.createElement("a");
      link.href = ev.href;
      const where = document.createElement("span");
      where.className = "ev-where";
      where.textContent = ev.where;
      link.appendChild(where);
      link.appendChild(document.createTextNode(ev.label + " →"));
      panel.appendChild(link);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => (current === btn ? reset() : show(btn)));
  });
}

// --- Projects: a clickable (and playable) walkthrough of each pipeline -----
function initFlows() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-flow]").forEach((flow) => {
    const steps = Array.from(flow.querySelectorAll(".flow-step"));
    const detail = flow.querySelector(".flow-detail");
    const playBtn = flow.querySelector(".flow-play");
    if (!steps.length || !detail) return;

    let timer = null;
    let index = 0;

    function select(i) {
      index = i;
      steps.forEach((step, si) => {
        step.classList.toggle("active", si === i);
        step.setAttribute("aria-pressed", String(si === i));
        step.parentElement.classList.toggle("done", si < i);
      });
      detail.textContent = steps[i].dataset.detail || "";
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      if (playBtn) playBtn.textContent = "▸ Play";
    }

    function play() {
      if (timer) return stop();
      if (index >= steps.length - 1) select(0);
      if (playBtn) playBtn.textContent = "❚❚ Pause";
      timer = setInterval(() => {
        if (index >= steps.length - 1) return stop();
        select(index + 1);
      }, reduceMotion ? 2600 : 1700);
    }

    steps.forEach((step, i) => step.addEventListener("click", () => { stop(); select(i); }));
    if (playBtn) playBtn.addEventListener("click", play);

    // Left/Right arrows move between steps while one is focused.
    flow.addEventListener("keydown", (e) => {
      const at = steps.indexOf(document.activeElement);
      if (at === -1 || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      e.preventDefault();
      const next = Math.min(steps.length - 1, Math.max(0, at + (e.key === "ArrowRight" ? 1 : -1)));
      stop();
      select(next);
      steps[next].focus();
    });

    select(0);
  });
}

// --- Contact: one-click copy ------------------------------------------------
function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      const ok = await copyText(btn.dataset.copy);
      showToast(ok ? "Email copied" : "Couldn't copy — select it manually");
      if (!ok) return;
      btn.textContent = "Copied ✓";
      btn.classList.add("copied");
      setTimeout(() => { btn.textContent = label; btn.classList.remove("copied"); }, 1600);
    });
  });
}

// --- Quick-jump palette: Cmd/Ctrl + K, from any page -------------------------
function initPalette() {
  const isMac = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent || "");
  const modKey = isMac ? "⌘" : "Ctrl";

  const commands = [
    { label: "Home",        tag: "Page", keys: "home intro start",        run: () => { location.href = "index.html"; } },
    { label: "About",       tag: "Page", keys: "about me bio education",  run: () => { location.href = "about.html"; } },
    { label: "Skills",      tag: "Page", keys: "skills stack tools tech", run: () => { location.href = "skills.html"; } },
    { label: "Experience",  tag: "Page", keys: "experience work jobs cognizant eurekai", run: () => { location.href = "experience.html"; } },
    { label: "Projects",    tag: "Page", keys: "projects rag forecasting inventory",     run: () => { location.href = "projects.html"; } },
    { label: "Blog",        tag: "Page", keys: "blog writing posts substack hashnode",   run: () => { location.href = "blog.html"; } },
    { label: "Takes",       tag: "Page", keys: "takes notes opinions",    run: () => { location.href = "takes.html"; } },
    { label: "Contact",     tag: "Page", keys: "contact hire email reach", run: () => { location.href = "contact.html"; } },
    { label: "Download résumé", tag: "Action", keys: "resume cv pdf download", run: () => {
        const a = document.createElement("a");
        a.href = RESUME_PATH; a.download = ""; document.body.appendChild(a); a.click(); a.remove();
      } },
    { label: "Copy email address", tag: "Action", keys: "copy email mail", run: async () => {
        showToast((await copyText(SITE_EMAIL)) ? "Email copied" : "Couldn't copy — select it manually");
      } },
    { label: "Open GitHub",   tag: "Link", keys: "github code repos", run: () => window.open("https://github.com/sunojt23", "_blank", "noopener") },
    { label: "Open LinkedIn", tag: "Link", keys: "linkedin profile",  run: () => window.open("https://linkedin.com/in/sunojkumartomar", "_blank", "noopener") },
    { label: "Open Substack", tag: "Link", keys: "substack newsletter writing", run: () => window.open("https://substack.com/@sunojtomar", "_blank", "noopener") },
  ];

  const overlay = document.createElement("div");
  overlay.className = "palette";
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="palette-panel" role="dialog" aria-modal="true" aria-label="Quick jump">' +
      '<input class="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="paletteList" ' +
        'aria-label="Search pages and actions" placeholder="Jump to a page or action…" autocomplete="off" spellcheck="false">' +
      '<ul class="palette-list" id="paletteList" role="listbox"></ul>' +
      '<p class="palette-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></p>' +
    '</div>';
  document.body.appendChild(overlay);

  const input = overlay.querySelector(".palette-input");
  const list = overlay.querySelector(".palette-list");
  let results = commands;
  let active = 0;
  let lastFocus = null;

  function render() {
    list.textContent = "";
    if (!results.length) {
      const empty = document.createElement("li");
      empty.className = "palette-empty";
      empty.textContent = "Nothing matches that.";
      list.appendChild(empty);
      input.removeAttribute("aria-activedescendant");
      return;
    }
    results.forEach((cmd, i) => {
      const li = document.createElement("li");
      li.className = "palette-item";
      li.id = "palette-opt-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", String(i === active));
      const name = document.createElement("span");
      name.textContent = cmd.label;
      const tag = document.createElement("span");
      tag.className = "palette-tag";
      tag.textContent = cmd.tag;
      li.append(name, tag);
      li.addEventListener("mousemove", () => { if (active !== i) { active = i; render(); } });
      li.addEventListener("click", () => choose(i));
      list.appendChild(li);
    });
    input.setAttribute("aria-activedescendant", "palette-opt-" + active);
    const el = list.children[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }

  function filter() {
    const tokens = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    results = commands.filter((c) => {
      const hay = (c.label + " " + c.keys + " " + c.tag).toLowerCase();
      return tokens.every((t) => hay.includes(t));
    });
    active = 0;
    render();
  }

  function open() {
    if (!overlay.hidden) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    input.value = "";
    filter();
    input.focus();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function choose(i) {
    const cmd = results[i];
    if (!cmd) return;
    close();
    cmd.run();
  }

  input.addEventListener("input", filter);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (results.length) { active = (active + 1) % results.length; render(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (results.length) { active = (active - 1 + results.length) % results.length; render(); } }
    else if (e.key === "Enter") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "Tab") { e.preventDefault(); } // keep focus inside the dialog
  });

  overlay.addEventListener("mousedown", (e) => { if (e.target === overlay) close(); });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      overlay.hidden ? open() : close();
    } else if (e.key === "Escape" && !overlay.hidden) {
      close();
    }
  });

  // A quiet footer hint — also the way in on touch devices, where there's no keyboard.
  const footer = document.querySelector(".footer");
  if (footer) {
    const wrap = document.createElement("div");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette-hint";
    btn.innerHTML = "Quick jump <kbd>" + modKey + " K</kbd>";
    btn.addEventListener("click", open);
    wrap.appendChild(btn);
    footer.appendChild(wrap);
  }
}
