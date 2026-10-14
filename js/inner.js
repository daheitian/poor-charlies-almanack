/* 内页交互：语言切换 / 章节导航 / 阅读进度 / 注释弹卡 / 有声书
   结构对齐原站（Stripe Press 阅读版），仅补齐本站叠加功能。 */
(function () {
  "use strict";
  var doc = document.documentElement;

  /* ---------- 语言切换 ---------- */
  var LANG_KEY = "pca-lang";
  function setLang(lang) {
    if (lang !== "en" && lang !== "zh" && lang !== "bi") lang = "en";
    doc.setAttribute("data-lang", lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    document.querySelectorAll("[data-lang-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-set") === lang ? "true" : "false");
    });
  }
  try {
    var saved = localStorage.getItem(LANG_KEY);
    var _p = new URLSearchParams(location.search);
    var _u = _p.get('lang');
    if (_u === 'zh' || _u === 'bi' || _u === 'en') saved = _u;
    if (saved) setLang(saved);
  } catch (e) {}
  document.querySelectorAll("[data-lang-set]").forEach(function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang-set")); });
  });

  /* ---------- 章节下拉导航 ---------- */
  var sel = document.querySelector("select[data-nav]");
  if (sel) {
    sel.addEventListener("change", function () {
      if (sel.value) location.href = sel.value + ".html";
    });
  }

  /* ---------- 阅读进度（顶栏百分比 + 顶部进度条） ---------- */
  var progTxt = document.querySelector("[data-progress]");
  var bar = document.getElementById("readProgress");
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    var s = (p * 100).toFixed(2);
    if (progTxt) progTxt.textContent = ("0" + s).slice(-5) + "%";
    if (bar) bar.style.width = (p * 100) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 注释弹卡 ---------- */
  function closeAll(except) {
    document.querySelectorAll("a[data-ann].is-open").forEach(function (a) {
      if (a !== except) a.classList.remove("is-open");
    });
  }
  function place(a) {
    var pop = a.querySelector(".ann-pop");
    if (!pop) return;
    var r = a.getBoundingClientRect();
    pop.style.left = "0";
    pop.style.right = "auto";
    // 右溢则翻到左侧
    if (r.left + 320 > window.innerWidth) {
      pop.style.left = "auto";
      pop.style.right = "0";
    }
  }
  document.querySelectorAll("a[data-ann]").forEach(function (a) {
    a.addEventListener("click", function (ev) {
      ev.preventDefault();
      var open = a.classList.contains("is-open");
      closeAll(a);
      a.classList.toggle("is-open", !open);
      if (!open) place(a);
    });
    a.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        a.querySelector(".ann-pop") && a.click();
      }
    });
    a.addEventListener("mouseenter", function () { place(a); });
  });
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest("a[data-ann]")) closeAll(null);
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") closeAll(null);
  });

  /* ---------- Type A 画布图：页边随动插图 ---------- */
  (function () {
    var strip = document.getElementById("cvStrip");
    if (!strip) return;
    var img = strip.querySelector(".cv-strip-img");
    var cap = strip.querySelector(".cv-strip-cap");
    var marks = Array.prototype.slice.call(document.querySelectorAll("[data-cv]"));
    if (!marks.length) { strip.style.display = "none"; return; }
    function show(el) {
      var arr;
      try { arr = JSON.parse(el.getAttribute("data-cv")); } catch (e) { return; }
      if (!arr || !arr.length) return;
      var c = arr[arr.length - 1];
      if (!c || !c.src) return;
      img.src = c.src;
      cap.textContent = (c.fig ? "fig " + c.fig + " — " : "") + (c.label || "");
      strip.classList.add("is-on");
    }
    function clear() { strip.classList.remove("is-on"); }
    function pickBest(visSet) {
      var mid = window.innerHeight / 2, best = null, bestD = 1e9;
      visSet.forEach(function (m) {
        var r = m.getBoundingClientRect();
        var d = Math.abs((r.top + r.bottom) / 2 - mid);
        if (d < bestD) { bestD = d; best = m; }
      });
      if (best) show(best); else clear();
    }
    if ("IntersectionObserver" in window) {
      var visSet = new Set();
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) visSet.add(en.target);
          else visSet.delete(en.target);
        });
        pickBest(visSet);
      }, { rootMargin: "-30% 0px -30% 0px", threshold: 0 });
      marks.forEach(function (m) { io.observe(m); });
    } else {
      window.addEventListener("scroll", function () {
        var mid = window.innerHeight / 2, best = null, bestD = 1e9;
        marks.forEach(function (m) {
          var r = m.getBoundingClientRect();
          var d = Math.abs((r.top + r.bottom) / 2 - mid);
          if (d < bestD) { bestD = d; best = m; }
        });
        if (best) show(best);
      }, { passive: true });
    }
  })();

  /* ---------- 有声书 ---------- */
  var audio = document.querySelector("audio[data-ab-audio]");
  var playBtn = document.querySelector("[data-ab-play]");
  var rateSel = document.querySelector("select[data-ab-rate]");
  if (audio && playBtn) {
    playBtn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().catch(function () { playBtn.setAttribute("title", "音频无法播放（网络受限）"); });
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", function () { playBtn.classList.add("is-playing"); });
    audio.addEventListener("pause", function () { playBtn.classList.remove("is-playing"); });
    audio.addEventListener("error", function () { playBtn.setAttribute("title", "音频无法播放（网络受限）"); });
  }
  if (audio && rateSel) {
    rateSel.addEventListener("change", function () { audio.playbackRate = parseFloat(rateSel.value) || 1; });
  }
})();
