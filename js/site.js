/* Poor Charlie's Almanack — 交互与动效
   · 语言开关（中文 / 双语 / EN），localStorage 记忆
   · 目录开合 / 阅读进度 / 滚动 reveal / 封面视差
   注：reveal 类一律由 JS 添加，禁用 JS 时内容也完全可见。 */
(function () {
  'use strict';
  // 注：anim 类只在 boot() 内添加，确保 JS 一旦解析失败也不会隐藏任何内容。

  var body = document.body;
  var root = document.documentElement;
  var btn = document.getElementById('menuBtn');
  var bar = document.getElementById('progress');
  var pct = document.getElementById('progNow');
  var sidebar = document.getElementById('sidebar');

  /* ---------- 1) 语言开关 ---------- */
  var KEY = 'pca-lang';
  var langBtns = document.querySelectorAll('[data-lang-set]');

  function applyLang(v) {
    if (v !== 'zh' && v !== 'bi' && v !== 'en') v = 'en';
    root.setAttribute('data-lang', v);
    Array.prototype.forEach.call(langBtns, function (b) {
      b.classList.toggle('on', b.getAttribute('data-lang-set') === v);
    });
    try { localStorage.setItem(KEY, v); } catch (e) {}
    document.dispatchEvent(new CustomEvent('pca:lang', { detail: v }));
  }

  var saved = 'en';
  try { saved = localStorage.getItem(KEY) || 'en'; } catch (e) {}
  // 支持 ?lang= 深链（优先于 localStorage，便于分享对照视图）
  try {
    var _p = new URLSearchParams(location.search);
    var _u = _p.get('lang');
    if (_u === 'zh' || _u === 'bi' || _u === 'en') saved = _u;
  } catch (e) {}
  applyLang(saved);

  Array.prototype.forEach.call(langBtns, function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      applyLang(b.getAttribute('data-lang-set'));
    });
  });

  /* ---------- 2) 目录开合 ---------- */
  if (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = body.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function (e) {
    if (!body.classList.contains('menu-open')) return;
    if (sidebar && sidebar.contains(e.target)) return;
    if (btn && btn.contains(e.target)) return;
    body.classList.remove('menu-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      body.classList.remove('menu-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------- 3) 阅读进度 + 顶栏投影 ---------- */
  function tick() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    p = Math.min(100, Math.max(0, p));
    if (bar) bar.style.width = p + '%';
    if (pct) pct.textContent = Math.round(p);
    body.classList.toggle('scrolled', (window.scrollY || 0) > 12);
  }
  window.addEventListener('scroll', tick, { passive: true });
  window.addEventListener('resize', tick);

  /* ---------- 4) 滚动 reveal ---------- */
  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -5% 0px' })
    : null;

  function observeAll() {
    var sel = '.body-col > *, .ascii-card, .ann-grid figure, .idx-grid a, '
            + '.ann-group, figure.full, .annots, .hero, .idx-book-cover, .idx-quote';
    var nodes = document.querySelectorAll(sel);
    Array.prototype.forEach.call(nodes, function (el) {
      if (el.classList.contains('in')) return;
      if (el.offsetParent === null) return;         // 当前语言下不可见，跳过
      el.classList.add('reveal');
      if (io) io.observe(el); else el.classList.add('in');
    });
  }

  /* ---------- 5) 封面视差 ---------- */
  function parallax() {
    var cover = document.querySelector('.cover-title');
    if (cover && window.innerWidth > 900) {
      var y = window.scrollY || 0;
      if (y < 900) cover.style.transform = 'translateY(' + (y * 0.16) + 'px)';
    }
  }

  function boot() {
    root.classList.add('anim');   // 开启入场动效（在此之前内容默认可见）
    observeAll();
    tick();
    parallax();
  }

  window.addEventListener('scroll', parallax, { passive: true });
  window.addEventListener('resize', function () { tick(); parallax(); });
  document.addEventListener('pca:lang', function () {
    setTimeout(function () { observeAll(); tick(); }, 40);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
