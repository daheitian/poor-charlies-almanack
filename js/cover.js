/* Poor Charlie's Almanack — 封面页交互
   逐项对应英文原站首页的行为，UI 与英文原站逐像素一致：

   1. 语言开关（页脚右下 EN / 中文）—— 只切换界面文案，默认 EN
   2. 顶栏章节名 = 一个隐藏 <select>，换项即跳章（原站同款）
   3. 顶栏 hover 时跑 marquee；--chapterTitleWidth 按实际字宽测量
   4. 页脚有声书：[▶] 播放/暂停、[ 1.5X ] 变速；曲目接原站同一 CDN

   全部代码都在 try/catch 里，任何一步失败都不影响静态排版。
*/
(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * 1. 语言开关
   * ------------------------------------------------------------------ */
  (function lang() {
    try {
      var KEY = 'pca-lang';
      var root = document.documentElement;
      var btns = document.querySelectorAll('[data-lang-set]');
      if (!btns.length) return;

      function apply(v) {
        if (v !== 'zh' && v !== 'en') v = 'en';
        root.setAttribute('data-lang', v);
        for (var i = 0; i < btns.length; i++) {
          btns[i].classList.toggle('on', btns[i].getAttribute('data-lang-set') === v);
        }
        try { localStorage.setItem(KEY, v); } catch (e) {}
      }

      var saved = 'en';
      try { saved = localStorage.getItem(KEY) || 'en'; } catch (e) {}
      try {
        var _p = new URLSearchParams(location.search);
        var _u = _p.get('lang');
        if (_u === 'zh' || _u === 'en') saved = _u;
      } catch (e) {}
      apply(saved);

      for (var i = 0; i < btns.length; i++) {
        btns[i].addEventListener('click', function (e) {
          e.preventDefault();
          apply(this.getAttribute('data-lang-set'));
        });
      }
    } catch (e) {}
  })();

  /* ------------------------------------------------------------------ *
   * 2. 顶栏章节下拉 → 跳章
   * ------------------------------------------------------------------ */
  (function chapterSelect() {
    try {
      var sel = document.querySelector('.dAnygA');
      if (!sel) return;
      sel.addEventListener('change', function () {
        var v = sel.value;
        if (!v) return;
        location.href = v === 'cover' ? 'cover.html' : v + '.html';
      });
    } catch (e) {}
  })();

  /* ------------------------------------------------------------------ *
   * 3. 顶栏 marquee：用实际字宽校准 --chapterTitleWidth
   * ------------------------------------------------------------------ */
  (function marquee() {
    try {
      var box = document.querySelector('.lgPruj');
      var track = document.querySelector('.SQxxC');
      if (!box || !track) return;
      function measure() {
        var w = track.getBoundingClientRect().width;
        if (w > 0) box.style.setProperty('--chapterTitleWidth', w);
      }
      measure();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    } catch (e) {}
  })();

  /* ------------------------------------------------------------------ *
   * 4. 页脚有声书
   *    曲目直接流式取自原站同一 Contentful CDN（原站首页的 audio 也只放第一轨）
   * ------------------------------------------------------------------ */
  (function audiobook() {
    try {
      var audio = document.querySelector('footer audio');
      var btn = document.querySelector('footer .bgQBPx');
      var slot = document.querySelector('footer .bsOOoM');
      var speed = document.querySelector('footer .eqVYgn');
      if (!audio || !btn) return;

      var TRACKS = [
        'https://assets.ctfassets.net/fzn2n1nzq965/5ume8nWEohRqTICfJjOJNJ/a6d7c92be1ac1fc8e66e6d71d0d317f9/00.1_Poor-Charlies-Almanack_In-Credits.m4a',
        'https://assets.ctfassets.net/fzn2n1nzq965/15pK2bQ5j4k4r0EEgvsbFi/da1bd5c3413acffb73fe56c58857c4d0/00.2_Poor-Charlies-Almanack_Front-Matter.m4a',
        'https://assets.ctfassets.net/fzn2n1nzq965/6tYfOwUWkiG2S3Zs0Lqi0m/3a15662c8b81a57767131219b29597ea/00.3_Poor-Charlies-Almanack_Forward-Collison.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/7OTxxX44a421K0V7mPn6u/689b17465a90214a6fb3056c3694d7d3/01_Poor-Charlies-Almanack.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/4iZVqTW97uyxBLJBn9hCQV/db409be2fe70c6ba3c8fa0ffba9c66e3/02_Poor-Charlies-Almanack.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/43eM6DIFY2QRyD3VxnfRIb/c8573019b14a931566985e91da713ea7/03_Poor-Charlies-Almanack.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/22zZaszXjWarvSkw1w3UWn/5b44befeb6edafff129317ec9a755c3b/05_Poor-Charlies-Almanack_Talk-1.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/592yzdY0FCkMSd9zYKmVMK/6a0c26ff71fdb08acd08707c5f310c3d/06_Poor-Charlies-Almanack_Talk-2.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/2g2MtAD53ldxLKbgWiKpkC/6aa536d8344c02c53289581438ffa57e/07_Poor-Charlies-Almanack_Talk-3.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/2UOrzSCfLqoHDES3l0RqfW/637835bad0dfb9b28ee24c274a5c7845/08_Poor-Charlies-Almanack_Talk-4.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/2xgs7vDyMB5GlUgAwnv1mo/c32987c7b8a12d16174d7368d3d535db/09_Poor-Charlies-Almanack_Talk-5.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/6LIKc3I7BjfobmnxftRh9Q/917618577b88ac16487630f2a544407e/10_Poor-Charlies-Almanack_Talk-6.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/2TSnxi3xxdLFxMsYG2ZSOH/b86fa1b409b837fdc700a9bdee7d38a7/11_Poor-Charlies-Almanack_Talk-7.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/6U5fVB90ZWuKWaZbgnYzug/ebc004b12ee9e1740fa9124ac136036b/12_Poor-Charlies-Almanack_Talk-8.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/3ES1f0zb48QEjcKNfUF2bU/73b8f3db792eaad84f297510daaf853c/13_Poor-Charlies-Almanack_Talk-9.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/2a8O7iZQrYAF4fP9i7T7ue/5071cbf68432b9e0bfbd05ababa9d70c/14_Poor-Charlies-Almanack_Talk-10.m4a',
        'https://downloads.ctfassets.net/fzn2n1nzq965/4w2FpHbBRd4EhbfZJUdWin/b4b3ab5ff46a2ad947b988790b7f9ec4/15_Poor-Charlies-Almanack_Talk-11.m4a'
      ];

      // 站点数（相对本站根）：原站首页 audio 的 src 是第一轨，这里保持同源策略
      var PLAY = '<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3L0.5 0V6L5.5 3Z" fill="#141414"></path></svg>';
      var PAUSE = '<svg width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 0h1.4v6H1zM3.6 0H5v6H3.6z" fill="#141414"></path></svg>';

      var idx = 0;
      var armed = false;   // audio.src 是否已指向 TRACKS[idx]

      function arm(i) {
        idx = (i + TRACKS.length) % TRACKS.length;
        audio.src = TRACKS[idx];
        armed = true;
      }
      function setIcon(playing) {
        if (slot) slot.innerHTML = '[' + (playing ? PAUSE : PLAY) + ']';
      }
      function applyRate() {
        var r = speed && parseFloat(speed.value) || 1.5;
        try { audio.playbackRate = r; } catch (e) {}
      }

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (audio.paused) {
          if (!armed) { audio.src = TRACKS[0]; armed = true; }
          var p = audio.play();
          if (p && p.catch) p.catch(function () { setIcon(false); });
        } else {
          audio.pause();
        }
      });

      audio.addEventListener('play', function () { setIcon(true); applyRate(); });
      audio.addEventListener('pause', function () { setIcon(false); });
      audio.addEventListener('ended', function () { arm(idx + 1); audio.play(); });
      audio.addEventListener('error', function () { if (!audio.paused) setIcon(false); });

      if (speed) {
        speed.addEventListener('change', applyRate);
        applyRate();
      }

      // [ Listen ] —— 原站是不可点文本，这里让它直接开始播放
      var links = document.querySelectorAll('.ifHIWD .beYuRg');
      for (var i = 0; i < links.length; i++) {
        (function (el) {
          if (/Listen/i.test(el.textContent)) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function () {
              if (audio.paused) btn.click();
            });
          }
        })(links[i]);
      }

      setIcon(false);
    } catch (e) {}
  })();
})();
