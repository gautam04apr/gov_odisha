/* ═══════════════════════════════════════════════
   GOVERNMENT OF ODISHA — SCRIPT.JS
═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   PARTIAL LOADER
   Fetches header.html / footer.html and injects
   them into #site-header / #site-footer.
   After injection, initHeader() is called so all
   header interactions bind to the freshly-added DOM.
═══════════════════════════════════════════════ */
async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load " + url);
    el.innerHTML = await res.text();

    // ✅ Always init header AFTER HTML exists in the DOM
    if (selector === "#site-header") {
      initHeader();
      setActiveNavLink();
    }
  } catch (err) {
    console.error(err);
  }
}

/* ═══════════════════════════════════════════════
   SET ACTIVE NAV LINK
   Matches current page filename to nav href.
═══════════════════════════════════════════════ */
function setActiveNavLink() {
  const navLinks = document.querySelectorAll(".nav-item-link");
  const currentPath = window.location.pathname;
  // Get just the filename e.g. "registration.html"
  const currentFile =
    currentPath.substring(currentPath.lastIndexOf("/") + 1) || "index.html";

  navLinks.forEach(function (link) {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    let isActive = false;
    if (href === "index.html") {
      isActive = currentFile === "index.html" || currentFile === "";
    } else {
      isActive = currentFile === href;
    }
    link.classList.toggle("active", isActive);
  });
}

/* ═══════════════════════════════════════════════
   INIT HEADER
   Binds all header-specific interactions:
   font size, language switcher, search, nav clicks.
   Called AFTER header HTML is in the DOM —
   either via loadPartial() or directly on pages
   that have the header hard-coded.
═══════════════════════════════════════════════ */
function initHeader() {
  /* ─────────────────────────────────────────
     1. FONT SIZE ACCESSIBILITY
  ───────────────────────────────────────── */
  const BASE_SIZE = 16;
  const MIN_SIZE = 13;
  const MAX_SIZE = 20;
  const STEP = 1;
  let currentSize = BASE_SIZE;
  const htmlEl = document.documentElement;

  function applyFontSize(size) {
    currentSize = Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));
    htmlEl.style.fontSize = currentSize + "px";
  }

  document
    .getElementById("btn-increase")
    ?.addEventListener("click", function () {
      applyFontSize(currentSize + STEP);
    });
  document
    .getElementById("btn-decrease")
    ?.addEventListener("click", function () {
      applyFontSize(currentSize - STEP);
    });
  document.getElementById("btn-reset")?.addEventListener("click", function () {
    applyFontSize(BASE_SIZE);
  });

  /* ─────────────────────────────────────────
     2. LANGUAGE SWITCHER
  ───────────────────────────────────────── */
  const langOptions = document.querySelectorAll(".lang-option");
  const selectedLangEl = document.getElementById("selected-lang");

  langOptions.forEach(function (item) {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      const chosen = this.getAttribute("data-lang");
      if (selectedLangEl) selectedLangEl.textContent = chosen;

      langOptions.forEach(function (opt) {
        opt.classList.remove("active");
      });
      this.classList.add("active");

      // Close Bootstrap dropdown
      const ddEl = document.getElementById("langDropdown");
      const ddInst = ddEl ? bootstrap.Dropdown.getInstance(ddEl) : null;
      if (ddInst) ddInst.hide();
    });
  });

  /* ─────────────────────────────────────────
     3. SEARCH — EXPAND / COLLAPSE + AUTO-CLOSE
  ───────────────────────────────────────── */
  const searchToggle = document.getElementById("search-toggle");
  const searchInputWrap = document.getElementById("search-input-wrap");
  const searchInput = document.getElementById("search-input");

  // Guard — if elements don't exist, skip silently
  if (!searchToggle || !searchInputWrap) return;

  let searchOpen = false;
  let autoCloseTimer = null;

  function openSearch() {
    searchOpen = true;
    searchInputWrap.classList.add("open");
    searchToggle.classList.add("active");
    // Focus input after CSS transition starts
    setTimeout(function () {
      searchInput?.focus();
    }, 80);
    startAutoClose();
  }

  function closeSearch() {
    searchOpen = false;
    searchInputWrap.classList.remove("open");
    searchToggle.classList.remove("active");
    if (searchInput) searchInput.value = "";
    clearAutoClose();
  }

  function startAutoClose() {
    clearAutoClose();
    // Auto-close after 10 s if input is still empty
    autoCloseTimer = setTimeout(function () {
      if (!searchInput || searchInput.value.trim() === "") closeSearch();
    }, 10000);
  }

  function clearAutoClose() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = null;
    }
  }

  searchToggle.addEventListener("click", function () {
    searchOpen ? closeSearch() : openSearch();
  });

  searchInput?.addEventListener("input", function () {
    this.value.trim() !== "" ? clearAutoClose() : startAutoClose();
  });

  searchInput?.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
  });

  /* ─────────────────────────────────────────
     4. ACTIVE NAV — click handler
     (setActiveNavLink handles page-load state;
      this handles in-page clicks)
  ───────────────────────────────────────── */
  const navLinks = document.querySelectorAll(".nav-item-link");
  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (this.getAttribute("href") === "#") e.preventDefault();
      navLinks.forEach(function (l) {
        l.classList.remove("active");
      });
      this.classList.add("active");
    });
  });
}

/* ═══════════════════════════════════════════════
   DOM CONTENT LOADED
   For pages using fetch partials:  loadPartial()
     calls initHeader() after HTML is injected.
   For pages with hard-coded header HTML:
     initHeader() is called directly here.
═══════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {
  // If #site-header placeholder exists → partial loading mode
  // loadPartial() is responsible for calling initHeader()
  const usesPartials = document.getElementById("site-header");

  if (!usesPartials) {
    // Hard-coded header on page → init immediately
    initHeader();
    setActiveNavLink();
  }
});

/* ═══════════════════════════════════════════════
   SECTION 2 — HERO CAROUSEL
═══════════════════════════════════════════════ */
(function () {
  const TOTAL = 6;
  const INTERVAL_MS = 5000;

  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prev = document.getElementById("heroPrev");
  const next = document.getElementById("heroNext");

  if (!slides.length) return;

  let current = 0;
  let timer = null;

  function goTo(n) {
    slides[current].classList.remove("active");
    dots[current].classList.remove("active");
    current = (n + TOTAL) % TOTAL;
    slides[current].classList.add("active");
    dots[current].classList.add("active");
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(function () {
      goTo(current + 1);
    }, INTERVAL_MS);
  }

  prev?.addEventListener("click", function () {
    goTo(current - 1);
    startTimer();
  });
  next?.addEventListener("click", function () {
    goTo(current + 1);
    startTimer();
  });

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      goTo(parseInt(this.getAttribute("data-dot"), 10));
      startTimer();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") {
      goTo(current - 1);
      startTimer();
    }
    if (e.key === "ArrowRight") {
      goTo(current + 1);
      startTimer();
    }
  });

  const carousel = document.getElementById("heroCarousel");
  carousel?.addEventListener("mouseenter", function () {
    clearInterval(timer);
  });
  carousel?.addEventListener("mouseleave", startTimer);

  startTimer();
})();

/* ═══════════════════════════════════════════════
   SECTION 3 — NOTIFICATION TICKER (seamless clone)
═══════════════════════════════════════════════ */
(function () {
  const track = document.getElementById("notifTrack");
  if (!track) return;
  // Duplicate items so the loop is seamless
  track.innerHTML += track.innerHTML;
})();

/* ═══════════════════════════════════════════════
   SECTION 4 — ABOUT US + VIDEO — VIDEO PLAYER
═══════════════════════════════════════════════ */
(function () {
  const featuredThumb = document.getElementById("featuredThumb");
  const featuredIframe = document.getElementById("featuredIframe");
  const featuredPlayBtn = document.getElementById("featuredPlayBtn");
  const featuredThumbImg = document.getElementById("featuredThumbImg");
  const featuredTitle = document.getElementById("featuredTitle");
  const thumbCards = document.querySelectorAll(".vthumb-card");
  let currentVid = "r80IU7cVn-s";

  function playFeatured(vid) {
    featuredIframe.src =
      "https://www.youtube.com/embed/" +
      vid +
      "?autoplay=1&rel=0&modestbranding=1";
    featuredIframe.classList.remove("d-none");
    featuredThumb.style.opacity = "0";
    featuredThumb.style.pointerEvents = "none";
  }

  function resetFeatured() {
    featuredIframe.src = "";
    featuredIframe.classList.add("d-none");
    featuredThumb.style.opacity = "1";
    featuredThumb.style.pointerEvents = "auto";
  }

  featuredPlayBtn?.addEventListener("click", function () {
    playFeatured(currentVid);
  });

  thumbCards.forEach(function (card) {
    card.addEventListener("click", function () {
      const vid = this.getAttribute("data-vid");
      const title = this.getAttribute("data-title");

      thumbCards.forEach(function (c) {
        c.classList.remove("active");
      });
      this.classList.add("active");

      resetFeatured();
      currentVid = vid;

      featuredThumbImg.src =
        "https://img.youtube.com/vi/" + vid + "/maxresdefault.jpg";
      featuredThumbImg.onerror = function () {
        this.src = "https://img.youtube.com/vi/" + vid + "/hqdefault.jpg";
      };
      if (featuredTitle) featuredTitle.textContent = title;

      setTimeout(function () {
        playFeatured(vid);
      }, 120);
    });
  });
})();

/* ═══════════════════════════════════════════════
   SECTION 4 — ABOUT US + VIDEO — STAT COUNT-UP (repeats every 10s)
═══════════════════════════════════════════════ */
(function () {
  const stats = document.querySelectorAll(".stat-num[data-target]");
  if (!stats.length) return;

  function countUp(el) {
    const target = +el.getAttribute("data-target");
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent =
        target >= 1000
          ? Math.floor(current / 1000) + "K+"
          : Math.floor(current) + "+";
    }, 16);
  }

  function runAll() {
    stats.forEach(countUp);
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runAll();
          setInterval(runAll, 10000);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 },
  );

  const section = document.getElementById("about-section");
  if (section) observer.observe(section);
})();

/* ═══════════════════════════════════════════════
   SECTION 4 — ABOUT US + VIDEO — VIDEO THUMB SLIDER (arrow scroll)
═══════════════════════════════════════════════ */
(function () {
  const slider = document.getElementById("videoThumbSlider");
  const prev = document.getElementById("vSliderPrev");
  const next = document.getElementById("vSliderNext");
  if (!slider) return;

  const SCROLL = 200;

  next?.addEventListener("click", function () {
    const atEnd =
      slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5;
    if (atEnd) slider.scrollTo({ left: 0, behavior: "smooth" });
    else slider.scrollBy({ left: SCROLL, behavior: "smooth" });
  });

  prev?.addEventListener("click", function () {
    const atStart = slider.scrollLeft <= 5;
    if (atStart)
      slider.scrollTo({ left: slider.scrollWidth, behavior: "smooth" });
    else slider.scrollBy({ left: -SCROLL, behavior: "smooth" });
  });
})();

/* ═══════════════════════════════════════════════
   SECTION 4 — ABOUT US + VIDEO — HONEYCOMB CANVAS TRANSITION
   3D coin-flip with ember-wave effect
═══════════════════════════════════════════════ */
(function () {
  const card = document.getElementById("honeycombCard");
  const canvas = document.getElementById("honeycombCanvas");
  if (!card || !canvas) return;

  const ctx = canvas.getContext("2d");
  const images = [
    "assets/images/hero-1.png",
    "assets/images/hero-2.png",
    "assets/images/hero-3.png",
    "assets/images/hero-4.png",
  ];

  const HEX_SIZE = 52;
  const TRANSITION = 1400;
  const HOLD = 3200;

  let imgObjs = [];
  let current = 0;
  let hexCells = [];
  let W, H;

  // Load all images first
  let loaded = 0;
  images.forEach(function (src, i) {
    const img = new Image();
    img.src = src;
    img.onload = function () {
      imgObjs[i] = img;
      if (++loaded === images.length) init();
    };
    img.onerror = function () {
      if (++loaded === images.length) init();
    };
  });

  function init() {
    resize();
    window.addEventListener("resize", resize);
    drawFrame(imgObjs[current], 1);
    setTimeout(nextSlide, HOLD);
  }

  function resize() {
    W = canvas.width = card.offsetWidth;
    H = canvas.height = card.offsetHeight || 280;
    buildHexGrid();
  }

  function buildHexGrid() {
    hexCells = [];
    const colW = HEX_SIZE * Math.sqrt(3);
    const rowH = HEX_SIZE * 1.5;
    const cols = Math.ceil(W / colW) + 2;
    const rows = Math.ceil(H / rowH) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offset = (col % 2) * HEX_SIZE * 0.75;
        hexCells.push({
          cx: col * colW * 0.865,
          cy: row * rowH + offset,
          col,
          row,
        });
      }
    }
  }

  function drawFrame(img, alpha) {
    if (!img) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 180) * (60 * i - 30);
      i === 0
        ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
        : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    ctx.closePath();
  }

  function nextSlide() {
    const fromImg = imgObjs[current];
    const nextIdx = (current + 1) % imgObjs.length;
    const toImg = imgObjs[nextIdx];

    if (!fromImg || !toImg) {
      current = nextIdx;
      setTimeout(nextSlide, HOLD);
      return;
    }

    const startTime = performance.now();
    const maxDiag = Math.max(
      ...hexCells.map(function (h) {
        return h.col + h.row;
      }),
    );

    function animate(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, W, H);
      drawFrame(fromImg, 1);

      hexCells.forEach(function (hex) {
        const diagNorm = (hex.col + hex.row) / maxDiag;
        const waveStart = diagNorm * (TRANSITION * 0.5);
        const localT = Math.min(
          1,
          Math.max(0, (elapsed - waveStart) / (TRANSITION * 0.45)),
        );

        if (localT <= 0) return;

        const flip = Math.abs(Math.cos(localT * Math.PI)); // 1 → 0 → 1
        const isBack = localT > 0.5;

        ctx.save();
        ctx.translate(hex.cx, hex.cy);
        ctx.scale(flip, 1); // fake 3D perspective
        ctx.translate(-hex.cx, -hex.cy);

        hexPath(hex.cx, hex.cy, HEX_SIZE);
        ctx.clip();

        ctx.drawImage(isBack ? toImg : fromImg, 0, 0, W, H);

        // Ember flash at flip midpoint
        const emberAlpha = Math.max(0, 1 - flip * 6);
        if (emberAlpha > 0) {
          ctx.fillStyle = "rgba(222, 89, 46, " + emberAlpha * 0.92 + ")";
          ctx.fill();
          ctx.fillStyle = "rgba(255, 200, 120, " + emberAlpha * 0.6 + ")";
          hexPath(hex.cx, hex.cy, HEX_SIZE * 0.55);
          ctx.fill();
        }

        ctx.restore();
      });

      if (elapsed < TRANSITION + maxDiag * 18) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, W, H);
        drawFrame(toImg, 1);
        current = nextIdx;
        setTimeout(nextSlide, HOLD);
      }
    }

    requestAnimationFrame(animate);
  }
})();

/* ═══════════════════════════════════════════════
   SECTION 5 — GLOBAL PRESENCE MAP
═══════════════════════════════════════════════ */
(function () {
  /* ── Pin data ── */
  const PINS = [
    {
      id: "usa",
      country: "USA",
      pct: [13, 42],
      type: "both",
      nro: 12000,
      nri: 3200,
      label: "USA",
    },
    {
      id: "uk",
      country: "UK",
      pct: [44, 22],
      type: "assoc",
      nro: 7800,
      nri: 2100,
      label: "United Kingdom",
    },
    {
      id: "uae",
      country: "UAE",
      pct: [57, 38],
      type: "both",
      nro: 9800,
      nri: 2600,
      label: "UAE",
    },
    {
      id: "india",
      country: "India",
      pct: [63, 40],
      type: "temple",
      nro: 5500,
      nri: 1200,
      label: "India",
    },
    {
      id: "sg",
      country: "Singapore",
      pct: [72, 52],
      type: "assoc",
      nro: 3200,
      nri: 800,
      label: "Singapore",
    },
    {
      id: "aus",
      country: "Australia",
      pct: [76, 68],
      type: "temple",
      nro: 4400,
      nri: 1100,
      label: "Australia",
    },
    {
      id: "ca",
      country: "Canada",
      pct: [18, 28],
      type: "assoc",
      nro: 6200,
      nri: 1800,
      label: "Canada",
    },
  ];

  /* ── Connection pairs (index pairs from PINS array) ── */
  const CONNECTIONS = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [0, 6],
  ];

  /* ── D3 World Map ── */
  function buildMap() {
    const wrap = document.getElementById("mapWrap");
    if (!wrap) return;
    const W = wrap.offsetWidth || 700;
    const H = wrap.offsetHeight || 350;

    const svg = d3
      .select("#worldMapSvg")
      .attr("viewBox", `0 0 ${W} ${H}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const projection = d3
      .geoNaturalEarth1()
      .scale(W / 6.5)
      .translate([W / 2, H / 2]);

    const path = d3.geoPath().projection(projection);

    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(function (world) {
        const countries = topojson_feature(world, world.objects.countries);

        svg
          .selectAll(".map-land-path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("class", "map-land-path")
          .attr("d", path)
          .on("mouseover", function () {
            d3.select(this).style("fill", "#4a2a18");
          })
          .on("mouseout", function () {
            d3.select(this).style("fill", null);
          });

        buildConnections(W, H);
        buildPins(W, H);
      })
      .catch(function () {
        buildFallbackMap(svg, W, H);
        buildConnections(W, H);
        buildPins(W, H);
      });
  }

  /* Fallback simplified map if CDN fails */
  function buildFallbackMap(svg, W, H) {
    const lands = [
      "M120,80 L200,70 L240,90 L260,130 L250,170 L230,190 L200,210 L180,240 L160,260 L140,250 L110,230 L90,200 L80,170 L85,140 L100,110 Z",
      "M175,265 L215,255 L235,280 L240,320 L230,370 L210,410 L190,430 L170,410 L155,370 L150,320 L155,280 Z",
      "M430,60 L490,55 L510,70 L520,90 L505,110 L490,120 L470,115 L450,120 L435,110 L425,90 Z",
      "M440,130 L490,125 L520,140 L530,175 L525,220 L510,265 L490,300 L465,320 L440,300 L420,260 L415,220 L420,175 L425,145 Z",
      "M520,40 L780,30 L820,65 L800,90 L700,95 L600,85 L540,65 Z",
      "M530,130 L610,140 L615,165 L595,180 L565,175 L540,160 L525,145 Z",
      "M610,145 L670,160 L665,195 L645,220 L620,215 L605,190 L600,165 Z",
      "M650,90 L800,100 L800,130 L740,155 L665,140 L640,100 Z",
      "M710,290 L830,295 L830,370 L740,375 L700,310 Z",
    ];
    lands.forEach(function (d) {
      svg
        .append("path")
        .attr("class", "map-land-path")
        .attr(
          "d",
          d.replace(/(\d+)/g, function (n) {
            return Math.round((+n * W) / 1000);
          }),
        );
    });
  }

  /* ── Connection lines ── */
  function buildConnections(W, H) {
    const wrap = document.getElementById("mapWrap");
    let connSvg = wrap.querySelector(".connections-svg");
    if (!connSvg) {
      connSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      connSvg.setAttribute("class", "connections-svg");
      connSvg.setAttribute("viewBox", `0 0 100 100`);
      connSvg.setAttribute("preserveAspectRatio", "none");
      wrap.appendChild(connSvg);
    }
    CONNECTIONS.forEach(function (pair) {
      const a = PINS[pair[0]],
        b = PINS[pair[1]];
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("class", "conn-line");
      line.setAttribute("x1", a.pct[0]);
      line.setAttribute("y1", a.pct[1]);
      line.setAttribute("x2", b.pct[0]);
      line.setAttribute("y2", b.pct[1]);
      line.style.animationDelay = Math.random() * 2 + "s";
      connSvg.appendChild(line);
    });
  }

  /* ── Pins ── */
  function buildPins(W, H) {
    const layer = document.getElementById("pinLayer");
    if (!layer) return;

    PINS.forEach(function (pin, i) {
      const el = document.createElement("div");
      el.className = "map-pin pin-" + pin.type;
      el.style.left = pin.pct[0] + "%";
      el.style.top = pin.pct[1] + "%";
      el.style.animationDelay = i * 0.18 + 0.5 + "s";

      const iconMap = {
        assoc: "fa-people-group",
        temple: "fa-place-of-worship",
        both: "fa-star",
      };
      const dotColor = { assoc: "#DE592E", temple: "#d4a017", both: "#c83c8a" };

      el.innerHTML = `
        <div class="pin-pulse"></div>
        <div class="pin-marker">
          <div class="pin-head">
            <i class="fa-solid ${iconMap[pin.type] || "fa-location-dot"}"></i>
          </div>
          <div class="pin-tail"></div>
        </div>
        <div class="pin-tooltip">
          <strong>${pin.label}</strong>
          <div class="tt-row"><span class="tt-dot" style="background:#DE592E"></span>NRO: ${pin.nro.toLocaleString()}</div>
          <div class="tt-row"><span class="tt-dot" style="background:#9b59b6"></span>NRI: ${pin.nri.toLocaleString()}</div>
        </div>`;
      layer.appendChild(el);
    });
  }

  /* ── Floating particles ── */
  function buildParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W,
      H,
      particles = [];

    function resize() {
      const section = document.getElementById("global-section");
      W = canvas.width = section.offsetWidth;
      H = canvas.height = section.offsetHeight;
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < 55; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.4,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(Math.random() * 0.5 + 0.2),
          alpha: Math.random() * 0.5 + 0.1,
          hue: Math.random() > 0.7 ? 30 : 15, // warm amber or orange
        });
      }
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = H + 4;
          p.x = Math.random() * W;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 65%, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }

    resize();
    createParticles();
    tick();
    window.addEventListener("resize", function () {
      resize();
      createParticles();
    });
  }

  /* ── Stat card count-up + slide-in ── */
  function buildStats() {
    const cards = document.querySelectorAll(".gsc-card");
    const fills = document.querySelectorAll(".gsc-fill");
    let triggered = false;

    function runCount() {
      document
        .querySelectorAll(".legend-num[data-target]")
        .forEach(function (el) {
          const target = +el.getAttribute("data-target");
          const suffix = el.getAttribute("data-suffix") || "";
          const dur = 1800,
            step = target / (dur / 16);
          let cur = 0;
          const t = setInterval(function () {
            cur += step;
            if (cur >= target) {
              cur = target;
              clearInterval(t);
            }
            el.textContent =
              (target >= 1000
                ? Math.floor(cur / 1000) + "K"
                : Math.floor(cur)) + suffix;
          }, 16);
        });
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !triggered) {
            triggered = true;

            cards.forEach(function (card, i) {
              setTimeout(function () {
                card.classList.add("visible");
              }, i * 120);
            });

            setTimeout(function () {
              fills.forEach(function (fill) {
                fill.style.width = fill.style.getPropertyValue("--w") || "50%";
              });
            }, 300);

            runCount();
            setInterval(runCount, 10000);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    const section = document.getElementById("global-section");
    if (section) observer.observe(section);
  }

  /* ── topojson shim ── */
  function topojson_feature(topology, object) {
    if (typeof topojson !== "undefined")
      return topojson.feature(topology, object);
    // minimal inline mesh converter
    return { features: [] };
  }

  /* ── Init ── */
  window.addEventListener("load", function () {
    buildParticles();
    buildStats();

    /* Wait for D3 + topojson */
    function tryMap(attempts) {
      if (typeof d3 !== "undefined") {
        /* Load topojson too */
        if (typeof topojson === "undefined") {
          const s = document.createElement("script");
          s.src =
            "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js";
          s.onload = buildMap;
          document.head.appendChild(s);
        } else {
          buildMap();
        }
      } else if (attempts > 0) {
        setTimeout(function () {
          tryMap(attempts - 1);
        }, 300);
      }
    }
    tryMap(10);
  });
})();

/* ═══════════════════════════════════════════════
   SECTION 5 — GLOBAL PRESENCE MAP + Legend count-up, repeats every 10s
═══════════════════════════════════════════════ */
(function () {
  function countLegend() {
    document
      .querySelectorAll(".legend-num[data-target]")
      .forEach(function (el) {
        const target = +el.getAttribute("data-target");
        const suffix = el.getAttribute("data-suffix") || "";
        const dur = 1600,
          step = target / (dur / 16);
        let cur = 0;
        const t = setInterval(function () {
          cur += step;
          if (cur >= target) {
            cur = target;
            clearInterval(t);
          }
          el.textContent =
            (target >= 1000 ? Math.floor(cur / 1000) + "K" : Math.floor(cur)) +
            suffix;
        }, 16);
      });
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          countLegend();
          setInterval(countLegend, 10000);
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 },
  );

  const legend = document.querySelector(".map-legend");
  if (legend) observer.observe(legend);
})();

/* ═══════════════════════════════════════════════
   SECTION 6 — SOCIAL + NEWS 
═══════════════════════════════════════════════ */
(function () {
  const tabs = document.querySelectorAll(".stab");
  const feeds = document.querySelectorAll(".sfeed");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      feeds.forEach((f) => f.classList.remove("active"));
      this.classList.add("active");
      const id = "feed-" + this.getAttribute("data-tab");
      document.getElementById(id)?.classList.add("active");
    });
  });
})();

/* ═══════════════════════════════════════════════
   SECTION 6 — SOCIAL + NEWS + part2
═══════════════════════════════════════════════ */
(function () {
  const wrap = document.getElementById("newsScrollWrap");
  const track = document.getElementById("newsTrack");
  const pauseBtn = document.getElementById("newsPause");
  const pauseIcon = document.getElementById("newsPauseIcon");
  if (!wrap || !track) return;

  /* Clone for seamless loop */
  track.innerHTML += track.innerHTML;

  let paused = false;
  let pos = 0;
  const SPEED = 0.6; /* px per frame */
  let raf;

  function tick() {
    if (!paused) {
      pos += SPEED;
      const half = track.scrollHeight / 2;
      if (pos >= half) pos = 0;
      track.style.transform = `translateY(-${pos}px)`;
    }
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);

  /* Pause on hover */
  wrap.addEventListener("mouseenter", function () {
    paused = true;
  });
  wrap.addEventListener("mouseleave", function () {
    if (!manualPause) paused = false;
  });

  /* Pause button */
  let manualPause = false;
  pauseBtn?.addEventListener("click", function () {
    manualPause = !manualPause;
    paused = manualPause;
    pauseIcon.className = manualPause
      ? "fa-solid fa-play"
      : "fa-solid fa-pause";
  });

  /* Expand/collapse news items */
  document.querySelectorAll(".news-expand-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const item = this.closest(".news-item");
      const wasExpanded = item.classList.contains("expanded");
      document
        .querySelectorAll(".news-item")
        .forEach((i) => i.classList.remove("expanded"));
      if (!wasExpanded) {
        item.classList.add("expanded");
        paused = true;
        manualPause = true;
        pauseIcon.className = "fa-solid fa-play";
      } else {
        paused = false;
        manualPause = false;
        pauseIcon.className = "fa-solid fa-pause";
      }
    });
  });
})();

/* ═══════════════════════════════════════════════
   SECTION 8 — GOVERNMENT PARTNERS LOGO CAROUSEL
═══════════════════════════════════════════════ */
(function () {
  const carouselTrack = document.getElementById("partnersCarouselTrack");
  const carouselWrapper = document.querySelector(".partners-carousel-wrapper");
  if (!carouselTrack || !carouselWrapper) return;

  // Hover pause (CSS handles it too, but JS ensures cross-browser)
  carouselWrapper.addEventListener("mouseenter", function () {
    carouselTrack.style.animationPlayState = "paused";
  });
  carouselWrapper.addEventListener("mouseleave", function () {
    carouselTrack.style.animationPlayState = "running";
  });

  // Touch support
  let touchStartX = 0;
  carouselWrapper.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.changedTouches[0].screenX;
      carouselTrack.style.animationPlayState = "paused";
    },
    false,
  );
  carouselWrapper.addEventListener(
    "touchend",
    function () {
      carouselTrack.style.animationPlayState = "running";
    },
    false,
  );

  // Start animation when section enters viewport
  const section = document.getElementById("partners-carousel-section");
  if (section) {
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting)
            carouselTrack.style.animationPlayState = "running";
        });
      },
      { threshold: 0.1 },
    ).observe(section);
  }
})();

/* ═══════════════════════════════════════════════
   SECTION 9 — CURVED GALLERY
═══════════════════════════════════════════════ */
(function () {
  const ITEMS = [
    {
      img: "assets/images/1.png",
      title: "Jagannath Temple, Puri",
      cat: "Heritage",
    },
    {
      img: "assets/images/2.png",
      title: "Konark Sun Temple",
      cat: "Heritage",
    },
    {
      img: "assets/images/3.png",
      title: "Chilika Lake",
      cat: "Nature",
    },
    {
      img: "assets/images/4.png",
      title: "Odisha Dance",
      cat: "Culture",
    },
    {
      img: "assets/images/5.png",
      title: "Pattachitra Art",
      cat: "Art",
    },
    {
      img: "assets/images/6.png",
      title: "Lingaraj Temple",
      cat: "Heritage",
    },
    {
      img: "assets/images/7.png",
      title: "Rath Yatra Festival",
      cat: "Festival",
    },
    {
      img: "assets/images/8.png",
      title: "Hirakud Dam",
      cat: "Nature",
    },
  ];

  const TOTAL = ITEMS.length;
  let current = 0;
  let typeTimer = null;

  const bg = document.getElementById("galBg");
  const bgNext = document.getElementById("galBgNext");
  const galTitle = document.getElementById("galTitle");
  const galCat = document.getElementById("galCat");

  /* ── Build strip items dynamically for infinite loop ── */
  const stripEl = document.getElementById("galStrip");
  if (!stripEl) return;

  /* We render VISIBLE_COUNT items centered around current */
  const VISIBLE = 7; /* odd number so center is clear */

  function renderStrip() {
    stripEl.innerHTML = "";
    for (let v = 0; v < VISIBLE; v++) {
      const dataIdx =
        (((current - Math.floor(VISIBLE / 2) + v) % TOTAL) + TOTAL) % TOTAL;
      const d = ITEMS[dataIdx];
      const el = document.createElement("div");
      el.className =
        "gal-item" + (v === Math.floor(VISIBLE / 2) ? " active" : "");
      el.setAttribute("data-vindex", v);
      el.setAttribute("data-dataindex", dataIdx);
      el.innerHTML = `<img src="${d.img}" alt="${d.title}" loading="lazy"/><div class="gal-item-shine"></div>`;
      el.addEventListener("click", function () {
        const clicked = +this.getAttribute("data-dataindex");
        goTo(clicked);
      });
      stripEl.appendChild(el);
    }
    applyArc();
  }

  /* ── Arc curve geometry ── */
  function applyArc() {
    const items = stripEl.querySelectorAll(".gal-item");
    const RADIUS = 600;
    const ITEM_H = 92;
    const GAP = 5;
    const center = Math.floor(VISIBLE / 2);

    items.forEach(function (item, v) {
      const rel = v - center;
      const abs = Math.abs(rel);
      const angle = Math.asin(Math.min(0.98, (rel * (ITEM_H + GAP)) / RADIUS));
      const cosA = Math.cos(angle);
      const xOff = RADIUS * (1 - cosA) * -1;
      const yOff = rel * (ITEM_H + GAP);
      const rotY = ((angle * 180) / Math.PI) * 0.9;
      const widthScale = Math.max(0.48, cosA);
      const scale = abs === 0 ? 1.0 : Math.max(0.56, 1 - abs * 0.09);
      const opacity = abs > 3 ? 0 : Math.max(0.1, 1 - abs * 0.22);

      item.style.transform = [
        `translateX(${xOff}px)`,
        `translateY(${yOff}px)`,
        `rotateY(${rotY}deg)`,
        `scaleX(${widthScale})`,
        `scale(${scale})`,
      ].join(" ");
      item.style.opacity = String(opacity);
      item.style.zIndex = String(10 - abs);
    });
  }

  /* ── Crossfade background ── */
  function crossfadeBg(img) {
    bgNext.style.backgroundImage = `url('${img}')`;
    bgNext.style.opacity = "1";
    bgNext.style.animation = "none";
    setTimeout(function () {
      bg.style.backgroundImage = `url('${img}')`;
      bg.style.animation = "none";
      bgNext.style.opacity = "0";
      /* restart Ken Burns on bg */
      void bg.offsetWidth;
      bg.style.animation = "galKen 12s ease-in-out infinite alternate";
    }, 800);
  }

  /* ── Typewriter ── */
  function typewrite(el, text) {
    if (typeTimer) {
      clearInterval(typeTimer);
      typeTimer = null;
    }
    if (!el || !text) return;
    el.textContent = "";
    let i = 0;
    typeTimer = setInterval(function () {
      if (i < text.length) {
        el.textContent += text[i++];
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 40);
  }

  /* ── Go to data index ── */
  function goTo(idx) {
    current = ((idx % TOTAL) + TOTAL) % TOTAL;
    const d = ITEMS[current];
    renderStrip();
    console.log("goTo fired", d.title, document.getElementById("galTitle"));
    crossfadeBg(d.img);

    const titleEl = document.getElementById("galTitle");
    const catEl = document.getElementById("galCat");

    if (catEl) catEl.textContent = d.cat;
    typewrite(titleEl, d.title);
  }

  // /* ── Wheel scroll with debounce ── */
  // let wheelLock = false;
  // document.getElementById('gallery-section')?.addEventListener('wheel', function (e) {
  //   e.preventDefault();
  //   if (wheelLock) return;
  //   wheelLock = true;
  //   setTimeout(function () { wheelLock = false; }, 450);
  //   goTo(e.deltaY > 0 ? current + 1 : current - 1);
  // }, { passive: false });

  /* ── Auto-play every 5s ── */
  let autoTimer = setInterval(function () {
    goTo(current + 1);
  }, 3000);

  /* Pause on hover, resume on leave */
  const galSection = document.getElementById("gallery-section");
  galSection?.addEventListener("mouseenter", function () {
    clearInterval(autoTimer);
  });
  galSection?.addEventListener("mouseleave", function () {
    autoTimer = setInterval(function () {
      goTo(current + 1);
    }, 5000);
  });

  /* ── Drag ── */
  let dragY = null;
  stripEl.addEventListener("mousedown", function (e) {
    dragY = e.clientY;
    e.preventDefault();
  });
  window.addEventListener("mouseup", function () {
    dragY = null;
  });
  window.addEventListener("mousemove", function (e) {
    if (dragY === null) return;
    const diff = dragY - e.clientY;
    if (Math.abs(diff) > 38) {
      goTo(diff > 0 ? current + 1 : current - 1);
      dragY = e.clientY;
    }
  });

  /* ── Keyboard ── */
  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") goTo(current - 1);
    if (e.key === "ArrowDown") goTo(current + 1);
  });

  /* ── Mouse trail ── */
  (function () {
    const canvas = document.getElementById("galTrailCanvas");
    const section = document.getElementById("gallery-section");
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const dots = [];

    function resize() {
      W = canvas.width = section.offsetWidth;
      H = canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    section.addEventListener("mousemove", function (e) {
      const rect = section.getBoundingClientRect();
      dots.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        r: Math.random() * 3 + 1,
        alpha: 0.65,
      });
      if (dots.length > 55) dots.shift();
    });

    (function tick() {
      ctx.clearRect(0, 0, W, H);
      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i];
        d.alpha -= 0.02;
        d.r *= 0.96;
        if (d.alpha <= 0) {
          dots.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(222,89,46,${d.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(tick);
    })();
  })();

  /* ── Init ── */
  goTo(0);
})();

/* ═══════════════════════════════════════════════
   SECTION 10 - FLOATING SIDE NAV
═══════════════════════════════════════════════ */
(function () {
  const nav = document.getElementById("floatNav");
  const items = document.querySelectorAll(".fn-item");
  if (!nav || !items.length) return;

  /* ── Auto-close timers per item ── */
  const timers = new Map();

  items.forEach(function (item) {
    /* Hover open */
    item.addEventListener("mouseenter", function () {
      if (timers.has(item)) {
        clearTimeout(timers.get(item));
        timers.delete(item);
      }
      item.classList.add("fn-open");
    });

    /* Auto-close after 1.4s on leave */
    item.addEventListener("mouseleave", function () {
      const t = setTimeout(function () {
        item.classList.remove("fn-open");
        timers.delete(item);
      }, 1400);
      timers.set(item, t);
    });

    /* Click → smooth scroll */
    item.addEventListener("click", function () {
      const target = this.getAttribute("data-target");
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (target === "hero-section") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      /* Close after click */
      setTimeout(function () {
        item.classList.remove("fn-open");
      }, 600);
    });
  });

/* ── Active section detection + auto-expand ── */
const sectionMap = new Map();
items.forEach(function (item) {
  const id = item.getAttribute('data-target');
  const section = document.getElementById(id);
  if (section) sectionMap.set(section, item);
});

const autoCloseTimers = new Map();

function autoExpand(item) {
  /* Clear any existing auto-close for this item */
  if (autoCloseTimers.has(item)) {
    clearTimeout(autoCloseTimers.get(item));
    autoCloseTimers.delete(item);
  }

  /* Don't expand if user is already hovering it */
  if (item.matches(':hover')) return;

  /* Open it */
  item.classList.add('fn-open');

  /* Auto-close after 2s */
  const t = setTimeout(function () {
    if (!item.matches(':hover')) {
      item.classList.remove('fn-open');
    }
    autoCloseTimers.delete(item);
  }, 2000);

  autoCloseTimers.set(item, t);
}

const observer = new IntersectionObserver(function (entries) {
  entries.forEach(function (entry) {
    const item = sectionMap.get(entry.target);
    if (!item) return;
    if (entry.isIntersecting) {
      /* Update active state */
      items.forEach(i => i.classList.remove('fn-active'));
      item.classList.add('fn-active');

      /* Auto-expand */
      autoExpand(item);
    }
  });
}, {
  threshold: 0.3,
  rootMargin: '-10% 0px -10% 0px'
});

sectionMap.forEach(function (item, section) {
  observer.observe(section);
});

  /* ── Hide near top ── */
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY < 300) {
        nav.classList.add("fn-hidden");
      } else {
        nav.classList.remove("fn-hidden");
      }
    },
    { passive: true },
  );

  /* ── Init visibility ── */
  if (window.scrollY < 300) nav.classList.add("fn-hidden");
})();

/* ═══════════════════════════════════════════════
   SECTION 11 — FOOTER ANIMATIONS & NEWSLETTER
═══════════════════════════════════════════════ */

// Scroll-in animation
const footerElement = document.getElementById("main-footer");
if (footerElement) {
  new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.animation =
            "footer-fade-up 0.8s ease-out 0.2s both";
          this.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  ).observe(footerElement);
}

// Newsletter form
const newsletterForm = document.getElementById("footer-newsletter-form");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const input = this.querySelector(".footer-input");
    const btn = this.querySelector(".footer-btn");
    const email = input.value.trim();

    if (!email || !email.includes("@")) {
      input.style.borderColor = "#ff6b6b";
      setTimeout(function () {
        input.style.borderColor = "";
      }, 1500);
      return;
    }

    btn.style.background = "linear-gradient(135deg, #90ee90, #76d776)";
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';

    setTimeout(function () {
      btn.style.background = "linear-gradient(135deg, var(--btn), #c74a24)";
      btn.innerHTML = '<i class="fa-solid fa-arrow-right"></i>';
      input.value = "";
    }, 2000);
  });

  const footerInput = newsletterForm.querySelector(".footer-input");
  if (footerInput) {
    footerInput.addEventListener("focus", function () {
      this.parentElement.style.boxShadow =
        "0 0 20px rgba(222, 89, 46, 0.3), inset 0 0 15px rgba(222, 89, 46, 0.1)";
    });
    footerInput.addEventListener("blur", function () {
      this.parentElement.style.boxShadow = "";
    });
  }
}

// <!-- ═══════════════════════════════════════════
//      SECTION 12 - BACK TO TOP
// ════════════════════════════════════════════ -->
(function () {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  /* Show/hide + scroll progress ring */
  window.addEventListener(
    "scroll",
    function () {
      const scrolled = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(100, (scrolled / maxScroll) * 100);

      /* Update progress ring */
      btn.style.setProperty("--scroll-progress", progress + "%");

      /* Show after 400px */
      if (scrolled > 400) {
        btn.classList.add("btt-visible");
      } else {
        btn.classList.remove("btt-visible");
      }
    },
    { passive: true },
  );

  /* Smooth scroll to top */
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();
