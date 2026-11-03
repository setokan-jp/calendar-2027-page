/* =========================================================
   ページを開くたびに、写真をランダムに配る
   - 4:5 の箱 … ファーストビュー → 全幅の山場 → スマートフォンの各シーン の順に配る
   - 16:9 の箱 … PC の各シーンに配る
   - 1 回の表示で、同じ箱から同じ写真を 2 回使わない（枚数が足りないときだけ繰り返す）
   - 前回と同じ写真がファーストビューに来ないようにする
   ========================================================= */
(function () {
  'use strict';

  var config = (window.LP_CONFIG && window.LP_CONFIG.images) || {};

  function safePath(v) {
    if (typeof v !== 'string') return null;
    if (/^(?:\.{0,2}\/)?[\w\-./]*\/$/.test(v) && v.indexOf('..') === -1 && v.indexOf(':') === -1) return v;
    try {
      var u = new URL(v);
      return u.protocol === 'https:' && /\/$/.test(u.pathname) ? u.href : null;
    } catch (e) { return null; }
  }
  function pool(def) {
    if (!def) return null;
    var path = safePath(def.path);
    var prefix = typeof def.prefix === 'string' && /^[\w\-]*$/.test(def.prefix) ? def.prefix : null;
    var ext = /^\.(webp|jpe?g|png|avif)$/i.test(def.ext || '') ? def.ext : null;
    var count = parseInt(def.count, 10);
    if (!path || prefix === null || !ext || !(count >= 1 && count <= 9999)) {
      if (window.console) console.warn('[LP] 写真の設定（images）を確認してください');
      return null;
    }
    return {
      count: count,
      url: function (n) {
        var num = String(n);
        while (num.length < 3) num = '0' + num;
        return path + prefix + num + ext;
      }
    };
  }

  // 偏りのないシャッフル（Fisher–Yates）
  function deck(count) {
    var a = [];
    for (var i = 1; i <= count; i++) a.push(i);
    for (var j = a.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var t = a[j]; a[j] = a[k]; a[k] = t;
    }
    return a;
  }
  function dealer(p) {
    var d = deck(p.count), i = 0;
    return function () {
      if (i >= d.length) { d = deck(p.count); i = 0; }   // 足りないときだけ、配り直して続ける
      return d[i++];
    };
  }

  var portrait = pool(config.portrait);
  var landscape = pool(config.landscape);

  // ---- 4:5 の写真 ----
  if (portrait) {
    var drawP = dealer(portrait);
    var slots = document.querySelectorAll('[data-pool-slot="portrait"]');
    var LAST = 'lp-last-hero';
    var last = null;
    try { last = localStorage.getItem(LAST); } catch (e) { /* 使えなくても動く */ }

    slots.forEach(function (slot, index) {
      var n = drawP();
      if (index === 0 && String(n) === last && portrait.count > 1) n = drawP();   // 前回と同じなら引き直す
      var url = portrait.url(n);
      slot.querySelectorAll('img').forEach(function (img) {
        if (img.closest('noscript')) return;
        img.src = url;
      });
      if (index === 0) {
        try { localStorage.setItem(LAST, String(n)); } catch (e) { /* 使えなくても動く */ }
        if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'lp_hero_image', image: n });
      }
    });

    // スマートフォン用（シーンの <source>）
    document.querySelectorAll('[data-pool-slot="scene"] source').forEach(function (source) {
      source.srcset = portrait.url(drawP());
    });
  }

  // ---- 16:9 の写真（PC のシーン） ----
  if (landscape) {
    var drawL = dealer(landscape);
    document.querySelectorAll('[data-pool-slot="scene"] img').forEach(function (img) {
      img.src = landscape.url(drawL());
    });
  }
})();
