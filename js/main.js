(function () {
  'use strict';

  var config = window.LP_CONFIG || {};

  /* ---------- 安全な URL だけを使う ---------- */
  function httpsUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      var u = new URL(value.trim(), window.location.href);
      return u.protocol === 'https:' ? u.href : null;
    } catch (e) { return null; }
  }

  /* ---------- CTA の行き先と計測 ---------- */
  var dest = httpsUrl(config.ctaUrl);
  if (!dest && window.console) console.warn('[LP] ctaUrl が未設定、または https ではありません。');
  document.querySelectorAll('[data-cta]').forEach(function (a) {
    if (dest) {
      a.href = dest;
      a.rel = 'noopener';
    } else {
      a.href = '#';
      a.addEventListener('click', function (e) { e.preventDefault(); });
    }
    a.addEventListener('click', function () {
      // Google タグマネージャーなどを入れたときに「どのボタンが押されたか」が分かる
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: 'lp_cta_click', cta_id: a.getAttribute('data-cta') });
      }
    });
  });

  /* ---------- 幕タイトルの登場 ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.act-card > *').forEach(function (el) {
      el.classList.add('js-reveal');
      revealIO.observe(el);
    });
  }

  /* ---------- 追従 CTA ---------- */
  var sticky = document.getElementById('sticky');
  var stickyText = sticky && sticky.querySelector('.sticky-text');
  var heroCta = document.querySelector('[data-cta="hero"]');
  if (!sticky || !heroCta || !('IntersectionObserver' in window)) return;

  sticky.hidden = false;
  sticky.inert = true;

  var passedHero = false;
  var visibleCtas = new Set();

  function render() {
    var on = passedHero && visibleCtas.size === 0;
    sticky.classList.toggle('is-on', on);
    sticky.inert = !on;   // 見えていないときはキーボードでも触れないようにする
  }

  // ファーストビューのボタンを通り過ぎたら出す
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      passedHero = !e.isIntersecting && e.boundingClientRect.top < 0;
    });
    render();
  }).observe(heroCta);

  // ページ内のボタンが見えている間は引っ込める（同じボタンが 2 つ並ばないように）
  var ctaIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visibleCtas.add(e.target); else visibleCtas.delete(e.target);
    });
    render();
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-cta]:not([data-cta="sticky"])').forEach(function (a) { ctaIO.observe(a); });

  // 幕が変わるたびに、ボタンの言葉も変える
  var labels = config.stickyLabels || {};
  var acts = document.querySelectorAll('.act[data-sticky]');
  var actIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var idx = Array.prototype.indexOf.call(acts, e.target);
      var next = (typeof labels[idx + 1] === 'string' && labels[idx + 1]) || e.target.getAttribute('data-sticky');
      if (!next || stickyText.textContent === next) return;
      stickyText.classList.add('is-swapping');
      window.setTimeout(function () {
        stickyText.textContent = next;   // textContent なので HTML は解釈されない
        stickyText.classList.remove('is-swapping');
      }, 200);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  acts.forEach(function (a) { actIO.observe(a); });
})();
