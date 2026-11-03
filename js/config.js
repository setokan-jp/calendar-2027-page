/* =========================================================
   ここだけ編集すれば、行き先と写真を差し替えられます

   ■ 行き先
     ctaUrl : ボタンを押したときに開くページ（https:// で始まるもの）

   ■ 写真（ページを開くたびに、この中からランダムに選ばれます）
     portrait  … 4:5（縦長）  スマートフォンのすべての枠と、PC のファーストビュー・全幅の山場
     landscape … 16:9（横長） PC の左右交互のシーン

     写真を増やしたときは、ファイルを連番で追加して count の数字を変えるだけです。
     番号は 001 から抜けなく連番にしてください。
     path は images/ のような同じフォルダ内の場所、または https:// で始まる URL（最後に / を付ける）
   ========================================================= */
window.LP_CONFIG = {
  ctaUrl: 'https://setokan-jp.github.io/calendar-2027/',

  images: {
    portrait:  { path: 'images/portrait/',  prefix: 'setokan-portrait-',  count: 186, ext: '.webp' },
    landscape: { path: 'images/landscape/', prefix: 'setokan-landscape-', count: 79,  ext: '.webp' }
  }
};
