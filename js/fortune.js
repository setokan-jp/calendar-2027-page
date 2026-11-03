/* =========================================================
   「試しに、あなたの星座を選んでみてください」の占い
   セトカン カレンダー2027 本体（script.js）と同じ計算で、今日の運勢を出しています。
   本体の計算方法や、ラッキーカラー・ナンバーの一覧を変えたときは、ここも同じように変えてください。
   ========================================================= */
(function () {
  'use strict';

  var SIGNS = ['牡羊座','牡牛座','双子座','蟹座','獅子座','乙女座','天秤座','蠍座','射手座','山羊座','水瓶座','魚座'];
  var LUCKY_COLORS = [
    'ゴールド ✨', 'ダークネイビー 🌌', 'ディープパープル 💜', 'クリムゾン 🔴',
    'シルバー 🌙', 'ミステリアスブラック 🖤', 'コバルトブルー 💙', 'エメラルド 💚',
    'パールホワイト 🤍', 'バーガンディ 🍷', 'インディゴ 🔵', 'ローズゴールド ✦'
  ];
  var LUCKY_NUMBERS = [3, 5, 7, 8, 11, 12, 15, 21, 24, 33, 7, 9];
  var MESSAGE_COUNT = 8; // 本体の MESSAGES 各カテゴリの数（乱数の進み方をそろえるため）
  var WEEK = ['日', '月', '火', '水', '木', '金', '土'];

  function seededRand(seed) {
    var s = seed;
    return function () {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }
  function getStarCount(rand) {
    var r = rand();
    if (r < 0.08) return 2;
    if (r < 0.25) return 3;
    if (r < 0.65) return 4;
    return 5;
  }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }

  function fortune(signIndex) {
    var d = new Date();
    var rand = seededRand(d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + signIndex * 997);
    var result = {};
    ['overall', 'love', 'work', 'money'].forEach(function (k) {
      result[k] = getStarCount(rand);
      Math.floor(rand() * MESSAGE_COUNT); // 本体ではここでメッセージを選んでいる
    });
    result.color = LUCKY_COLORS[Math.floor(rand() * LUCKY_COLORS.length)];
    result.number = LUCKY_NUMBERS[Math.floor(rand() * LUCKY_NUMBERS.length)];
    result.date = (d.getMonth() + 1) + '月' + d.getDate() + '日（' + WEEK[d.getDay()] + '）';
    return result;
  }

  var card = document.getElementById('fortune-card');
  var chips = document.querySelectorAll('.sign-chip');
  if (!card || !chips.length) return;

  function set(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var i = parseInt(chip.getAttribute('data-sign'), 10);
      if (!(i >= 0 && i < SIGNS.length)) return;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
      var f = fortune(i);
      set('fc-date', f.date);
      set('fc-sign', SIGNS[i]);
      set('fc-overall', stars(f.overall));
      set('fc-love', stars(f.love));
      set('fc-work', stars(f.work));
      set('fc-money', stars(f.money));
      set('fc-color', f.color);
      set('fc-number', String(f.number));
      card.hidden = false;
      card.classList.remove('is-new'); void card.offsetWidth; card.classList.add('is-new');
      if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: 'lp_sign_pick', sign: SIGNS[i] });
    });
  });
})();
