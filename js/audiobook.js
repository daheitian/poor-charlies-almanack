/* 首页有声书播放器
   · 曲目直连 Stripe Press 的 Contentful CDN（原站同源），流式播放，不占站点体积
   · 播放 / 暂停 / 上一首下一首 / 拖动进度 / 倍速（1.0X–2.5X） */
(function () {
  'use strict';
  var root = document.querySelector('.audiobook');
  if (!root) return;

  var audio = root.querySelector('[data-ab-audio]');
  var items = Array.prototype.slice.call(root.querySelectorAll('.ab-item'));
  if (!audio || !items.length) return;

  var playBtn = root.querySelector('[data-ab-play]');
  var prevBtn = root.querySelector('[data-ab-prev]');
  var nextBtn = root.querySelector('[data-ab-next]');
  var seek = root.querySelector('[data-ab-seek]');
  var timeEl = root.querySelector('[data-ab-time]');
  var titleEl = root.querySelector('[data-ab-title]');
  var rateBtns = Array.prototype.slice.call(root.querySelectorAll('[data-ab-rate]'));
  var idx = 0;
  var rate = 1;

  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    var m = Math.floor(s / 60), x = s % 60;
    return m + ':' + (x < 10 ? '0' : '') + x;
  }

  function setTitle(btn) {
    if (!titleEl) return;
    var n = btn.querySelector('.ab-num'), t = btn.querySelector('.ab-name');
    titleEl.textContent = (n ? n.textContent + ' · ' : '') + (t ? t.textContent : '');
  }

  function load(i, autoplay) {
    idx = (i + items.length) % items.length;
    var btn = items[idx];
    audio.src = btn.getAttribute('data-src');
    audio.playbackRate = rate;
    items.forEach(function (b, j) { b.classList.toggle('on', j === idx); });
    setTitle(btn);
    if (seek) { seek.value = 0; }
    if (timeEl) { timeEl.textContent = '0:00'; }
    if (autoplay) { play(); }
  }

  function play() {
    var p = audio.play();
    if (p && p.catch) {
      p.catch(function () {
        if (titleEl) titleEl.textContent = '音频无法播放（网络受限）· Audio unavailable';
      });
    }
  }

  function togglePlay() {
    if (audio.paused) play(); else audio.pause();
  }

  items.forEach(function (b, j) {
    b.addEventListener('click', function () { load(j, true); });
  });
  if (playBtn) playBtn.addEventListener('click', togglePlay);
  if (prevBtn) prevBtn.addEventListener('click', function () { load(idx - 1, true); });
  if (nextBtn) nextBtn.addEventListener('click', function () { load(idx + 1, true); });

  audio.addEventListener('play', function () { if (playBtn) playBtn.textContent = '❚❚'; });
  audio.addEventListener('pause', function () { if (playBtn) playBtn.textContent = '▶'; });
  audio.addEventListener('ended', function () { load(idx + 1, true); });
  audio.addEventListener('timeupdate', function () {
    if (audio.duration && isFinite(audio.duration)) {
      if (seek) seek.value = (audio.currentTime / audio.duration) * 100;
      if (timeEl) timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
    } else if (timeEl) {
      timeEl.textContent = fmt(audio.currentTime);
    }
  });
  audio.addEventListener('loadedmetadata', function () {
    if (timeEl) timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });
  audio.addEventListener('error', function () {
    if (titleEl) titleEl.textContent = '音频加载失败（网络受限）· Audio failed to load';
  });

  if (seek) seek.addEventListener('input', function () {
    if (audio.duration && isFinite(audio.duration)) {
      audio.currentTime = (seek.value / 100) * audio.duration;
    }
  });

  rateBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      rate = parseFloat(b.getAttribute('data-ab-rate')) || 1;
      audio.playbackRate = rate;
      rateBtns.forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  });

  // 初始：第一条曲目 + 1.0X
  load(0, false);
  if (rateBtns[0]) rateBtns[0].classList.add('on');
})();
