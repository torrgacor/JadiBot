/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █    
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ]━━━━
┇
┇▫️Author  : Danz nano & Awang Ofc 
┇▫️Website  : awangofc.my.id
┇▫️WhatsApp : wa.me/556184127506
┇
┇ ▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭▬▭
┇
┇ ━━━[ ✍️ 𝗖𝗔𝗧𝗔𝗧𝗔𝗡 ]━━━━
┇
┇🔸Dilarang Menghapus Creadit SC
┇🔸Dilarang Menjual Script Nano Ai
┇🔸Dilarang Mengatas Namakan Script!!
⌬
*/

'use strict'

/* ==========================================================================
   Nano Ai · Plants vs. Zombies (Front Yard)
   Satu berkas HTML mandiri di dalam pesan rich (GenAIaeacdsnwHtmlPrimitive),
   sama seperti game lain di folder ini. 9 kolom x 5 baris rumput, 8 tanaman,
   5 zombie + Gargantuar, matahari, sekop, mesin pemotong rumput, gelombang.
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#5b3a1a">
<title>Nano Ai Plants vs. Zombies</title>
<style>
:root{--wood:#7b4a1e;--wood2:#955c26;--wood3:#5b3413;--kaki:#c9a75f;--khaki:#cdb887;--khaki2:#b6a06c;--line:#3d2a12;--ink:#241a08;--text:#fff8e6;--dim:#d9c49a;--sun:#ffd23f;--sun2:#ffa726;--leaf:#5fbb2c;--red:#d5342b;--bad:#8b1e14;--grass1:#79c33f;--grass2:#8ed14c}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(700px 420px at 50% -8%,#6b4520 0%,#33200c 55%,#1b1106 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#8a5524,#5d3614);border:1px solid #b08443;border-radius:20px;padding:9px;box-shadow:0 26px 66px #000b,inset 0 1px 0 #ffffff26;touch-action:manipulation}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:8px;min-width:0}
.logo{width:36px;height:36px;flex:none;display:grid;place-items:center;border-radius:10px;background:linear-gradient(150deg,#8ed14c,#316b16);border:1px solid #b7e37a;font-size:19px;box-shadow:0 3px 0 #2c4d12,inset 0 1px 0 #fff6}
.bt{min-width:0}
.title{font-family:Georgia,serif;font-size:15px;font-weight:900;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 #00000055}
.sub{margin-top:1px;color:#f0dcb4;font-size:8px;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px;flex:none}
.hb{width:34px;height:34px;border:1px solid #d0a761;border-radius:10px;background:linear-gradient(180deg,#b5793a,#7b4a1e);color:#fff4dc;font-size:15px;box-shadow:0 3px 0 #40260c;touch-action:manipulation}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #40260c}
.hb.on{border-color:#ffe793;box-shadow:0 0 0 2px #ffe79399,0 3px 0 #40260c;background:linear-gradient(180deg,#c98f3f,#8a5524)}
@keyframes popSun{0%{transform:scale(1)}45%{transform:scale(1.22)}100%{transform:scale(1)}}
.sunbox.pulse{animation:popSun .32s ease}
.sunbox b{font-variant-numeric:tabular-nums}
.bar{display:flex;align-items:center;gap:6px;background:linear-gradient(180deg,#6d4318,#4a2b0e);border:1px solid #b08443;border-radius:14px;padding:6px;margin-bottom:6px;box-shadow:inset 0 2px 6px #00000055}
.bseck{flex:1;min-width:0;font:900 8.5px system-ui;letter-spacing:.04em;color:#ffe9b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.92}
.sunbox{display:flex;align-items:center;gap:5px;flex:none;padding:4px 7px 4px 4px;border-radius:10px;background:linear-gradient(180deg,#f7e3a8,#d8bd75);border:1px solid #a98a45;box-shadow:inset 0 1px 0 #ffffffe0}
.sunbox canvas{width:24px;height:24px;display:block}
.sunbox b{font:900 15px system-ui;color:#5b3d0a;min-width:30px;text-align:right;letter-spacing:-.2px}
/* Bank benih: dipakai kisi supaya SEMUA kartu selalu muat (dulu baris yang bisa
   digeser, tapi geserannya termakan sentuhan kartu sehingga kartu terpotong). */
.bank{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;margin-bottom:7px}
.bank.b5{grid-template-columns:repeat(5,minmax(0,1fr))}   /* 9-10 kartu (ada Lily Pad) */
.bank.b6{grid-template-columns:repeat(6,minmax(0,1fr))}   /* 11-12 kartu (level malam) */
@media(max-width:340px){.bank.b6{grid-template-columns:repeat(5,minmax(0,1fr))}}
.seed{position:relative;width:auto;min-width:0;border:1px solid #6d4f22;border-radius:8px;background:linear-gradient(180deg,#d8c48f,#b09b64);padding:2px 2px 12px;box-shadow:0 2px 0 #4a3210,inset 0 1px 0 #fff8dc;touch-action:manipulation;overflow:hidden}
.seed canvas{width:100%;height:auto;display:block}
.seed .cost{position:absolute;left:0;right:0;bottom:1px;text-align:center;font:900 9.5px system-ui;color:#3b2c08;letter-spacing:-.2px;text-shadow:0 1px 0 #fff6}
.seed .cd{position:absolute;left:0;right:0;top:0;height:0;background:#241a08a8;pointer-events:none}
.seed.sel{border-color:#fff2b0;box-shadow:0 0 0 2px #ffe793,0 3px 0 #4a3210;transform:translateY(-1px)}
.seed.no{filter:saturate(.4) brightness(.82)}
.seed.no .cost{color:#8b1e14}
.seed:active{transform:translateY(1px)}
.shovel{flex:none;width:44px;height:50px;border:1px solid #6d4f22;border-radius:10px;background:linear-gradient(180deg,#d8c48f,#a89259);font-size:20px;box-shadow:0 2px 0 #4a3210,inset 0 1px 0 #fff8dc;touch-action:manipulation}
.shovel.on{border-color:#fff2b0;box-shadow:0 0 0 2px #ffe793}
/* Panggung mengisi sisa tinggi layar (min 520px), TIDAK lagi terpaku rasio —
   dulu di HP 390px tingginya cuma 266px sementara layar 844px, jadi 293px
   di bawahnya cuma ruang kosong. Kanvas 960x720 diregangkan mengikuti kotak
   (gambar tetap jernih, cuma rasio tampil yang menyesuaikan layar). */
.stage{position:relative;width:100%;height:max(520px,calc(100vh - 310px));border:2px solid #4d2d0d;border-radius:12px;overflow:hidden;background:#4a7a22;box-shadow:inset 0 6px 18px #00000066,0 6px 16px #00000055}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.wave{position:absolute;left:0;right:0;bottom:0;height:12px;background:#2a1a07dd;border-top:1px solid #00000066;display:flex;align-items:center;gap:6px;padding:0 6px}
.wave i{position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(180deg,#ffd75e,#e0392c);box-shadow:0 0 8px #ffd75e88;transition:width .25s ease}
.wave span{position:relative;font:900 7.5px system-ui;letter-spacing:.14em;color:#ffe9b8;text-shadow:0 1px 2px #000}
.banner{position:absolute;left:6%;right:6%;top:30%;text-align:center;pointer-events:none;opacity:0;transition:opacity .25s ease;font:950 16px Georgia,serif;color:#fff0c0;text-shadow:0 3px 0 #4a1a06,0 0 20px #ff8a3a99;line-height:1.25}
.banner.show{opacity:1}
.banner small{display:block;margin-top:5px;font:900 8px system-ui;letter-spacing:.18em;color:#ffe1a0}
.toast{position:absolute;left:50%;top:12px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#3d1e05e6;border:1px solid #ffce6b;color:#ffe9b8;font:900 8.5px system-ui;letter-spacing:.06em;opacity:0;transition:opacity .18s ease,transform .18s ease;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#180d03e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s ease}
.ov.hide{opacity:0;pointer-events:none}
/* Menu awal (pilih level) TIDAK lagi menumpuk di atas panggung yang pendek —
   ia jadi bagian halaman biasa, jadi kartunya utuh dan chat ikut memanjang.
   (Dulu kartu dipaksa muat di panggung ±210px, makanya terlihat terpotong.) */
#ovStart{position:relative;inset:auto;z-index:auto;display:block;background:none;backdrop-filter:none;padding:0}
#ovStart.hide{display:none}
#ovStart .card2{max-height:none;overflow:visible;width:100%}
body.menu .stage{display:none}
.card2{width:min(96%,390px);max-height:100%;overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:14px 12px;border:1px solid #c69a52;border-radius:16px;background:linear-gradient(180deg,#7b4a1e,#43260c);box-shadow:0 18px 40px #000a,inset 0 1px 0 #ffffff2e}
.card2 .big{font-family:Georgia,serif;font-size:23px;letter-spacing:.5px;color:#ffe9b8;text-shadow:0 3px 0 #2b1505}
.card2 .small{margin-top:5px;color:#e6d3ab;font-size:9px;line-height:1.55}
.lv{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:11px}
.lvb{position:relative;padding:9px 6px;border:1px solid #b98e49;border-radius:12px;background:linear-gradient(180deg,#95632c,#5e3a15);color:#fff3d6;text-align:left;box-shadow:0 4px 0 #2f1c07;touch-action:manipulation}
.lvb b{display:block;font:950 12px system-ui;letter-spacing:.2px}
.lvb span{display:block;margin-top:2px;font:800 7.5px system-ui;color:#f0dcb4;letter-spacing:.1em;text-transform:uppercase}
.lvb .st{margin-top:5px;font-size:11px;color:#ffd75e;letter-spacing:2px}
.lvb.lock{filter:saturate(.35) brightness(.75)}
.lvb.done{border-color:#ffe793;box-shadow:0 0 0 1px #ffe79380,0 4px 0 #2f1c07}
.lvb:active{transform:translateY(2px);box-shadow:0 2px 0 #2f1c07}
.gbtn{display:block;width:100%;margin-top:9px;min-height:44px;border:1px solid #ffe793;border-radius:12px;background:linear-gradient(180deg,#8ed14c,#3f7f18);color:#122b04;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #2c5310,inset 0 1px 0 #ffffff66;touch-action:manipulation}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #2c5310}
.gbtn.alt{background:linear-gradient(180deg,#c9a75f,#8a6628);color:#3b2c08;box-shadow:0 5px 0 #4a3210,inset 0 1px 0 #ffffff55}
.gbtn.danger{background:linear-gradient(180deg,#e2543f,#8b1e14);color:#fff3e8;box-shadow:0 5px 0 #56100a,inset 0 1px 0 #ffffff44}
.rowb{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
.stats div{padding:6px 4px;border:1px solid #b98e49;border-radius:10px;background:#2c1907b0}
.stats b{display:block;font:900 13px system-ui;color:#ffd75e}
.stats span{display:block;margin-top:2px;font:800 6.4px system-ui;letter-spacing:.12em;color:#e6d3ab;text-transform:uppercase}
.legend{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:9px}
.legend i{font-style:normal;font-size:8px;color:#f0dcb4;background:#2c1907a8;border:1px solid #8a6628;border-radius:999px;padding:3px 7px}
.foot{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-top:7px;color:#f0dcb4;font-size:7px}
.foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media(min-width:520px){.bank{grid-template-columns:repeat(8,minmax(0,1fr))}}
@media(max-width:380px){body{padding:6px}.cab{padding:7px;border-radius:17px}.title{font-size:13px}.sunbox b{font-size:13px}.shovel{width:38px;height:44px;font-size:17px}.hb{width:30px;height:30px;font-size:13px}.card2 .big{font-size:19px}}
@media(min-width:720px){body{padding-top:16px;padding-bottom:16px}.cab{padding:12px;border-radius:22px}}
</style>
</head>
<body class="menu">
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🌻</div>
        <div class="bt">
          <div class="title">Plants vs. Zombies</div>
          <div class="sub" id="sub">Nano Ai · Front Yard · siap bertahan</div>
        </div>
      </div>
      <div class="hbtns">
        <button class="hb on" id="bAuto" title="Kumpulkan matahari otomatis">🤚</button>
        <button class="hb" id="bMusic" title="Musik">🎵</button>
        <button class="hb" id="bSound" title="Efek suara">🔊</button>
        <button class="hb" id="bPause" title="Jeda">⏸</button>
      </div>
    </div>

    <div class="bar">
      <div class="sunbox"><canvas id="sunIco" width="48" height="48"></canvas><b id="sunVal">100</b></div>
      <div class="bseck" id="bseck">Pilih kartu tanaman, lalu ketuk rumput</div>
      <button class="shovel" id="bShovel" title="Sekop untuk mencabut tanaman">🥄</button>
    </div>
    <div class="bank" id="bank"></div>

    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="wave"><i id="waveFill"></i><span id="waveTxt">SIAP MENANAM</span></div>
      <div class="banner" id="banner"></div>
      <div class="toast" id="toast"></div>

      <div class="ov hide" id="ovPause">
        <div class="card2">
          <div class="big">⏸ JEDA</div>
          <div class="small">Zombienya berhenti dulu. Silakan atur napas.</div>
          <div class="stats" id="pauseStats"></div>
          <button class="gbtn" id="bResume">LANJUT</button>
          <button class="gbtn alt" id="bRestart">ULANG LEVEL</button>
          <button class="gbtn danger" id="bQuit">KEMBALI KE MENU</button>
        </div>
      </div>

      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">LEVEL SELESAI</div>
          <div class="small" id="endText"></div>
          <div class="stats" id="endStats"></div>
          <div class="rowb" style="margin-top:10px">
            <button class="gbtn" id="bNext">LANJUT</button>
            <button class="gbtn alt" id="bAgain">MAIN LAGI</button>
          </div>
          <button class="gbtn danger" id="bMenu">MENU</button>
        </div>
      </div>
    </div>

    <div class="ov" id="ovStart">
      <div class="card2">
        <div class="big">🌻 PLANTS vs. ZOMBIES 🧟</div>
        <div class="small">Pilih kartu tanaman di atas, lalu ketuk rumput untuk menanam.<br>Ketuk matahari yang jatuh untuk mengumpulkannya. Jangan sampai zombie masuk ke rumah!</div>
        <div class="lv" id="lvList"></div>
        <div class="legend">
          <i>🌻 Sunflower: 50 matahari → hasilkan 25 tiap 12 detik</i>
          <i>🪷 Lily Pad: 25 matahari, khusus di kolam</i>
          <i>🌙 Makin malam makin gelap, jendela rumah menyala</i>
          <i>☔ Cuaca berganti: angin menerbangkan daun, hujan & petir</i>
          <i>🍄 Level malam: Puff-shroom gratis + Sun-shroom menumbuhkan matahari</i>
          <i>🪦 Grave Buster (25) menghancurkan batu nisan</i>
          <i>🔫 Peashooter menembak otomatis</i>
          <i>🥜 Wall-nut jadi tameng</i>
          <i>🪏 Sekop mencabut tanaman</i>
          <i>🚜 Mesin potong untuk 1 baris</i>
          <i>🤚 Matahari dijemput otomatis (bisa dimatikan)</i>
        </div>
        <button class="gbtn" id="bPlay">MULAI MAIN</button>
        <div class="small" style="margin-top:7px">Progres & bintang tersimpan otomatis di HP ini.</div>
      </div>
    </div>

    <div class="foot">
      <span id="footL">9 kolom · 5 baris rumput</span>
      <span id="footR">Level 1</span>
    </div>
  </div>
</div>
<script>
'use strict';
/* ---------- dasar ---------- */
var D=document, TAU=Math.PI*2;
/* Kepadatan gambar 3x: karakter digambar 3 kali lebih detail lalu dikecilkan
   browser, jadi garis luar/daun/gigi tetap tegas di layar HP (dulu 2x terlihat
   agak kabur). Turun otomatis ke 2x kalau memorinya kecil supaya tetap lancar. */
var MEM=navigator.deviceMemory||0;
var SS=(MEM&&MEM<3)?2:3;
var cv=D.getElementById('cv'), cx=cv.getContext('2d');
var LW=960, LH=720, COLS=9, ROWS=5, CW=96, CH=144, GX=96;
cv.width=LW*SS; cv.height=LH*SS; cx.setTransform(SS,0,0,SS,0,0);
function $(i){return D.getElementById(i)}
function clamp(v,a,b){return v<a?a:(v>b?b:v)}
function rnd(a,b){return a+Math.random()*(b-a)}
function ri(a,b){return Math.floor(a+Math.random()*(b-a+1))}
function pk(a){return a[Math.floor(Math.random()*a.length)]}
function mk(t){return D.createElement(t)}
function bake(w,h,fn){var c=mk('canvas');c.width=Math.max(1,Math.round(w*SS));c.height=Math.max(1,Math.round(h*SS));var x=c.getContext('2d');x.save();x.scale(SS,SS);x.lineJoin='round';x.lineCap='round';fn(x,w,h);x.restore();return c}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function circ(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill()}
function ell(c,x,y,rx,ry,col,rot){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);c.fill()}
/* Mata jelas: sklera putih + garis luar gelap + pupil + kilau. */
function eyes(c,x,y,r,dx,dy){
  for(var s=-1;s<=1;s+=2){
    var ex=x+s*r*1.25, ey=y;
    circ(c,ex,ey,r*1.16,'#2b2412'); circ(c,ex,ey,r,'#ffffff');
    circ(c,ex+(dx||0)*0.5,ey+(dy||0)*0.5,r*0.52,'#20180a');
    circ(c,ex-r*0.34,ey-r*0.36,r*0.2,'#ffffff');
  }
}
/* Garis luar + bayangan: kunci supaya bentuk tanaman/zombie terlihat tegas. */
function ol(c,col,w){c.strokeStyle=col;c.lineWidth=w||3;c.stroke()}
function ball(c,x,y,r,colA,colB,line){var g=c.createRadialGradient(x-r*0.35,y-r*0.45,r*0.12,x,y,r*1.05);g.addColorStop(0,colA);g.addColorStop(1,colB);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();if(line){ol(c,line,r*0.13)}}
function pill(c,x,y,w,h,colA,colB,line,r){var g=c.createLinearGradient(x,y,x+w*0.25,y+h);g.addColorStop(0,colA);g.addColorStop(1,colB);c.fillStyle=g;rr(c,x,y,w,h,r||h/2);c.fill();if(line){ol(c,line,3)}}
function brow(c,x,y,w,dir,col){c.strokeStyle=col||'#2d3d10';c.lineWidth=3.4;c.beginPath();c.moveTo(x-w,y+dir*2.6);c.lineTo(x+w,y-dir*2.6);c.stroke()}

/* ---------- suara (WebAudio, tanpa berkas) ---------- */
var AC=null, master=null, sOn=true, mOn=true, mT=0, mStep=0;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=0.5;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  if(!sOn||!ensureAC())return;
  var t0=AC.currentTime+(delay||0);
  var o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'square'; o.frequency.setValueAtTime(f1,t0);
  if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);
  g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol||0.16,t0+0.012);
  g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);
  o.connect(g); g.connect(bus()); o.start(t0); o.stop(t0+dur+0.02);
}
function noise(dur,vol,f0,f1,delay){
  if(!sOn||!ensureAC())return;
  var t0=AC.currentTime+(delay||0), n=Math.max(1,Math.floor(AC.sampleRate*dur));
  var buf=AC.createBuffer(1,n,AC.sampleRate), ch=buf.getChannelData(0);
  for(var i=0;i<n;i++)ch[i]=(Math.random()*2-1)*(1-i/n);
  var s=AC.createBufferSource(); s.buffer=buf;
  var flt=AC.createBiquadFilter(); flt.type='lowpass'; flt.frequency.setValueAtTime(f0||900,t0);
  if(f1)flt.frequency.exponentialRampToValueAtTime(Math.max(80,f1),t0+dur);
  if(f1)flt.frequency.exponentialRampToValueAtTime(Math.max(80,f1),t0+dur);
  var g=AC.createGain(); g.gain.setValueAtTime(vol||0.2,t0); g.gain.exponentialRampToValueAtTime(0.001,t0+dur);
  s.connect(flt); flt.connect(g); g.connect(bus()); s.start(t0); s.stop(t0+dur+0.02);
}
/* Kunyahan zombie: dua gigitan pendek ("nyam nyam") seperti PVZ asli. */
function chomp(){
  for(var i=0;i<2;i++){var d=i*0.11;noise(0.07,0.20,900,300,d);tone(190,120,0.06,0.10,'square',d)}
}
/* Geraman zombie: dua gelombang suara berdetak (vibrato) + saringan bawah. */
function groan(dur,vol,delay){
  if(!sOn||!ensureAC())return;
  var t0=AC.currentTime+(delay||0);
  var dur2=dur||0.85;
  var o1=AC.createOscillator(),o2=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
  var lfo=AC.createOscillator(),lg=AC.createGain();
  o1.type='sawtooth'; o2.type='sawtooth';
  o1.frequency.setValueAtTime(96,t0); o2.frequency.setValueAtTime(99,t0);
  o1.frequency.linearRampToValueAtTime(72,t0+dur2); o2.frequency.linearRampToValueAtTime(75,t0+dur2);
  f.type='lowpass'; f.Q.value=6;
  f.frequency.setValueAtTime(720,t0); f.frequency.linearRampToValueAtTime(250,t0+dur2);
  lfo.frequency.setValueAtTime(6.5,t0); lg.gain.setValueAtTime(9,t0);
  lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
  g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol||0.15,t0+0.09); g.gain.exponentialRampToValueAtTime(0.0012,t0+dur2);
  o1.connect(f); o2.connect(f); f.connect(g); g.connect(bus());
  o1.start(t0); o2.start(t0); lfo.start(t0);
  o1.stop(t0+dur2+0.03); o2.stop(t0+dur2+0.03); lfo.stop(t0+dur2+0.03);
}
function sfx(n){
  /* nada-nada dibuat meniru PVZ: "thup" kacang, desis beku, tanah, kunyahan,
     geraman, dan robohnya zombie. */
  if(n==='shoot'){tone(430,175,0.09,0.11,'triangle');noise(0.05,0.10,1700,600)}
  else if(n==='hit')tone(320,130,0.05,0.09,'square');
  else if(n==='snow'){noise(0.17,0.12,5200,1700);tone(1150,720,0.12,0.07,'triangle')}
  else if(n==='plant'){noise(0.16,0.24,620,180);tone(150,88,0.16,0.16,'sine')}
  else if(n==='sun'){tone(1050,1050,0.09,0.13,'sine');tone(1570,1570,0.15,0.11,'sine',0.04);tone(2090,2090,0.2,0.05,'sine',0.08)}
  else if(n==='eat')chomp();
  else if(n==='groan')groan(0.85,0.15);
  else if(n==='die'){groan(0.65,0.14,0);noise(0.24,0.18,520,140,0.3);tone(120,58,0.3,0.13,'sine',0.32)}
  else if(n==='mow'){noise(1.1,0.24,1200,260);tone(90,70,0.9,0.12,'sawtooth')}
  else if(n==='boom'){noise(0.6,0.4,1800,120);tone(120,45,0.55,0.24,'sawtooth')}
  else if(n==='puff'){noise(0.13,0.15,1500,520);tone(320,170,0.1,0.07,'sine')}
  else if(n==='petir'){noise(1.6,0.30,1400,90);noise(0.5,0.22,700,160,0.12);tone(70,42,1.3,0.16,'sawtooth',0.05)}
  else if(n==='nope')tone(240,180,0.13,0.14,'square');
  else if(n==='click')tone(520,520,0.05,0.09,'square');
  else if(n==='dig')noise(0.2,0.24,600,180);
  else if(n==='wave'){tone(300,300,0.16,0.16,'square');tone(400,400,0.16,0.16,'square',0.16);tone(520,520,0.3,0.16,'square',0.32)}
  else if(n==='win'){var s=[523,659,784,1046,1318];for(var i=0;i<s.length;i++)tone(s[i],s[i],0.3,0.15,'triangle',i*0.13)}
  else if(n==='lose'){var d=[440,392,330,247,196];for(var j=0;j<d.length;j++)tone(d[j],d[j]*0.9,0.34,0.16,'sawtooth',j*0.17)}
}
/* Musik latar ringan: pola 16 langkah, dijalankan dari loop utama (bukan setInterval). */
var MELL=[523,0,659,523,784,0,659,0,587,0,698,587,880,0,698,0];
var BASS=[131,0,0,0,175,0,0,0,147,0,0,0,196,0,0,0];
function music(dt){
  if(!mOn||!AC||G.state!=='playing'){return}
  mT-=dt;
  if(mT>0)return;
  mT=0.235;
  var m=MELL[mStep%16], b=BASS[mStep%16];
  if(m)tone(m,m,0.2,0.035,'triangle');
  if(b)tone(b,b,0.42,0.05,'sine');
  if(mStep%4===0)noise(0.05,0.05,3000,1200);
  mStep++;
}

/* ---------- gambar (dibuat sekali, dipakai ulang) ---------- */
var ART={plants:{},zom:{}};
var warnaTerakhir='', gradWaktu=null;   /* simpan gradasi cahaya waktu (dibuat sekali per warna) */
function leaf(c,x,y,dir,col,sz,line){
  c.save(); c.translate(x,y); c.rotate(dir*0.6);
  c.fillStyle=col; c.beginPath(); c.ellipse(0,0,sz,sz*0.48,0,0,TAU); c.fill();
  if(line)ol(c,line,2.6);
  c.strokeStyle='#ffffff55'; c.lineWidth=2; c.beginPath(); c.moveTo(-sz*0.6,0); c.lineTo(sz*0.6,0); c.stroke();
  c.restore();
}
function stem(c,w,h,col,lw){c.strokeStyle=col;c.lineWidth=lw||7;c.beginPath();c.moveTo(w/2,h-8);c.quadraticCurveTo(w/2+3,h*0.7,w/2,h*0.5);c.stroke()}
/* Moncong penembak: tabung dengan garis luar + lubang gelap supaya jelas arah tembaknya. */
function snout(c,x,y,r,dir,col,dark){c.fillStyle=col;rr(c,x,y-r*0.55,r*1.25,r*1.1,r*0.55);c.fill();c.strokeStyle=dark||'#204a06';c.lineWidth=3;c.stroke();
  c.fillStyle='#14300a';c.beginPath();c.ellipse(x+r*1.08*dir,y,r*0.26,r*0.34,0,0,TAU);c.fill();
  c.fillStyle='#ffffff33';c.beginPath();c.ellipse(x+r*0.45,y-r*0.28,r*0.36,r*0.13,0,0,TAU);c.fill()}
/* Jamur: dipakai Puff-shroom dan Sun-shroom (beda warna & ukuran). */
function jamur(c,cx0,cy,r,capA,capB,capLine,spot,big){
  /* batang */
  var sg=c.createLinearGradient(cx0-r*0.34,0,cx0+r*0.34,0);
  sg.addColorStop(0,'#f4ead2'); sg.addColorStop(0.55,'#e2d3b4'); sg.addColorStop(1,'#bda887');
  c.fillStyle=sg; c.beginPath();
  c.moveTo(cx0-r*0.34,cy); c.quadraticCurveTo(cx0-r*0.28,cy-r*0.55,cx0-r*0.30,cy-r*0.72);
  c.lineTo(cx0+r*0.30,cy-r*0.72); c.quadraticCurveTo(cx0+r*0.28,cy-r*0.55,cx0+r*0.34,cy); c.closePath(); c.fill();
  ol(c,'#8a7554',2.6);
  c.strokeStyle='#ffffff40'; c.lineWidth=2; c.beginPath(); c.moveTo(cx0-r*0.14,cy-r*0.6); c.lineTo(cx0-r*0.14,cy-r*0.14); c.stroke();
  /* tudung */
  var cg=c.createRadialGradient(cx0-r*0.3,cy-r*1.5,r*0.1,cx0,cy-r*1.1,r*1.15);
  cg.addColorStop(0,capA); cg.addColorStop(1,capB);
  c.fillStyle=cg;
  c.beginPath(); c.ellipse(cx0,cy-r*0.78,r,big?r*0.86:r*0.78,0,Math.PI,TAU); c.fill();
  c.beginPath(); c.ellipse(cx0,cy-r*0.78,r,big?r*0.30:r*0.26,0,0,TAU); c.fill();
  ol(c,capLine,3);
  c.fillStyle='#ffffff33'; c.beginPath(); c.ellipse(cx0-r*0.42,cy-r*1.2,r*0.3,r*0.16,-0.5,0,TAU); c.fill();
  for(var s2=0;s2<5;s2++){
    var a3=-2.5+s2*0.62;
    circ(c,cx0+Math.cos(a3)*r*0.62,cy-r*0.86+Math.sin(a3)*r*0.34,r*0.13,spot);
  }
  /* mata */
  eyes(c,cx0,cy-r*0.44,r*0.17,0,0.3);
  c.strokeStyle='#5b4a30'; c.lineWidth=2.6; c.beginPath(); c.arc(cx0,cy-r*0.26,r*0.26,0.15*Math.PI,0.85*Math.PI); c.stroke();
}
function drawPlant(c,t,w,h,ph,zoom){
  var sway=Math.sin(ph)*0.13, cx0=w/2;
  /* Zoom: gambar diperbesar dari titik tanam (bawah-tengah) supaya karakternya
     benar-benar besar di layar, bukan cuma ruang kosong yang bertambah. */
  var Z=zoom||1; c.save();
  if(Z!==1){c.translate(cx0,h);c.scale(Z,Z);c.translate(-cx0,-h)}
  var bat={'sunflower':['#5cc02a','#2f6b0d'],'peashooter':['#57b526','#2b6209'],'snowpea':['#63c4de','#2b7392'],'repeater':['#4faf22','#265808'],'wallnut':['#dda05c','#8b5b23'],'potatomine':['#d9b478','#7a5522'],'cherrybomb':['#e0392c','#8b1a12'],'jalapeno':['#e0392c','#8b1a12']};
  var BA=bat[t]||bat.peashooter;
  if(t==='sunflower'){
    stem(c,w,h,BA[1],12); stem(c,w,h,BA[0],7);
    leaf(c,cx0-15,h*0.82,-1,'#57b526',20,'#2b6209'); leaf(c,cx0+15,h*0.70,1,'#4aa81f',18,'#2b6209');
    c.save(); c.translate(cx0,h*0.42); c.rotate(sway);
    /* 14 kelopak: gelap lebih lebar sebagai garis luar, terang di tengah */
    for(var i=0;i<14;i++){c.save();c.rotate(i/14*TAU);
      c.fillStyle='#c07f08';c.beginPath();c.ellipse(0,-31,11.5,20,0,0,TAU);c.fill();
      c.fillStyle='#f5b81d';c.beginPath();c.ellipse(0,-30,9,16.5,0,0,TAU);c.fill();
      c.fillStyle='#ffe07a';c.beginPath();c.ellipse(0,-30,5,11,0,0,TAU);c.fill();c.restore()}
    ball(c,0,0,23,'#cf8c2a','#6f4009','#43240a');
    ball(c,0,0,18,'#e5a94c','#8f5711');
    c.fillStyle='#6f4009';for(var q=0;q<9;q++){var an=q/9*TAU;circ(c,Math.cos(an)*12,Math.sin(an)*12,1.5,'#7d4a0b')}
    eyes(c,0,-4,6,0,0); brow(c,-12,-16,7,1,'#5c3608'); brow(c,12,-16,7,-1,'#5c3608');
    /* pipi merona + senyum terbuka */
    ell(c,-13,4,5.5,3.6,'#e2603f66'); ell(c,13,4,5.5,3.6,'#e2603f66');
    c.strokeStyle='#4d2c07';c.lineWidth=3.2;c.beginPath();c.arc(0,5,10,0.12*Math.PI,0.88*Math.PI);c.stroke();
    c.fillStyle='#8c4a12';c.beginPath();c.arc(0,7,6.4,0.12*Math.PI,0.88*Math.PI);c.fill();
    c.fillStyle='#f47b6a';c.beginPath();c.arc(0,8,3.6,0.1*Math.PI,0.9*Math.PI);c.fill();
    c.restore();
  } else if(t==='peashooter'||t==='snowpea'||t==='repeater'){
    var snow=t==='snowpea', rep=t==='repeater';
    var body=BA[0], dark=BA[1];
    stem(c,w,h,'#2b6209',12); stem(c,w,h,'#4aa81f',7);
    leaf(c,cx0-14,h*0.82,-1,'#57b526',18,'#2b6209'); leaf(c,cx0+14,h*0.72,1,'#4aa81f',16,'#2b6209');
    c.save(); c.translate(cx0,h*0.40); c.rotate(sway*1.3);
    /* polong kepala: agak lonjong seperti aslinya, dengan jahitan dan kilau */
    ell(c,-4,2,21.5,24.5,'#3b7d10');
    ball(c,-4,0,22,body,dark,BA[1]);
    c.strokeStyle='#ffffff2e';c.lineWidth=2.4;c.beginPath();c.moveTo(-6,-20);c.quadraticCurveTo(6,-4,-4,20);c.stroke();
    c.fillStyle='#00000022';c.beginPath();c.ellipse(-4,16,16,7,0,0,TAU);c.fill();
    ell(c,-14,-11,9.5,6.5,'#ffffff59',-0.5);
    /* mulut tersambung ke tabung */
    c.fillStyle=dark;c.beginPath();c.ellipse(6,4,6.5,5.6,0,0,TAU);c.fill();
    snout(c,10,-3,16.5,1,body,dark); if(rep)snout(c,10,17,14.5,1,dark,dark);
    eyes(c,-3,-6,5.6,1.4,-0.6); brow(c,-12,-18,7,1,dark); brow(c,6,-18,7,-1,dark);
    if(snow){circ(c,-23,-13,3.2,'#ffffffdd');circ(c,-27,7,2.6,'#ffffffbb');circ(c,-8,21,2.4,'#ffffff99');circ(c,4,-19,2.2,'#ffffffcc')}
    c.restore();
  } else if(t==='lilypad'){
    /* daun teratai mengapung: tidak boleh gepeng karena ini alas di atas air */
    var py=h*0.80;
    ell(c,cx0,py+5,w*0.46,w*0.15,'#0b355022');
    c.fillStyle='#2f6b16'; c.beginPath(); c.ellipse(cx0,py+1,w*0.45,w*0.205,0,0,TAU); c.fill();
    var pg=c.createRadialGradient(cx0-9,py-6,3,cx0,py,w*0.46);
    pg.addColorStop(0,'#a3e360'); pg.addColorStop(0.55,'#5cb02a'); pg.addColorStop(1,'#2b6512');
    c.fillStyle=pg; c.beginPath(); c.ellipse(cx0,py,w*0.425,w*0.185,0,0,TAU); c.fill();
    ol(c,'#245a12',2.4);
    /* urat daun */
    c.strokeStyle='#2b651244'; c.lineWidth=1.6;
    for(var vn=0;vn<7;vn++){var an=vn/7*TAU;
      c.beginPath(); c.moveTo(cx0,py); c.lineTo(cx0+Math.cos(an)*w*0.40,py+Math.sin(an)*w*0.17); c.stroke()}
    /* potongan mulut daun (dibuat tembus pandang, air terlihat di baliknya) */
    c.save(); c.globalCompositeOperation='destination-out';
    c.beginPath(); c.moveTo(cx0+1,py); c.lineTo(cx0+w*0.5,py-w*0.22); c.lineTo(cx0+w*0.5,py+w*0.22); c.closePath(); c.fill();
    c.restore();
    /* titik air & bunga kecil */
    ell(c,cx0-10,py-8,7,3,'#ffffff44',-0.35);
    circ(c,cx0+12,py+5,2.6,'#ffffff55');
    for(var fl=0;fl<5;fl++){var a2=fl/5*TAU;
      ell(c,cx0-15+Math.cos(a2)*4.5,py-13+Math.sin(a2)*4.5,3.4,2.4,'#f9c7dd');}
    circ(c,cx0-15,py-13,2.2,'#ffe07a');
  } else if(t==='puffshroom'){
    ell(c,cx0,h-14,w*0.26,w*0.075,'#00000022');
    jamur(c,cx0,h-8,26,'#f6e7c8','#b79a6d','#6d5940','#8a6a44',false);
  } else if(t==='sunshroom'){
    /* Sun-shroom tumbuh besar setelah dewasa (ph>=1 dari kode pemanggil) */
    var dewasa=(ph>=1), R=dewasa?30:19;
    ell(c,cx0,h-14,w*(dewasa?0.30:0.20),w*0.075,'#00000022');
    jamur(c,cx0,h-8,R,'#ffd35e','#d97b12','#8a4a06','#fff0b0',dewasa);
  } else if(t==='gravebuster'){
    /* mulut besar yang menggerogoti batu nisan */
    ell(c,cx0,h-16,w*0.36,w*0.10,'#00000022');
    leaf(c,cx0-20,h*0.70,-1,'#4aa81f',18,'#2b6209'); leaf(c,cx0+20,h*0.66,1,'#3f9a1a',16,'#2b6209');
    var gb=c.createRadialGradient(cx0-8,h*0.5,4,cx0,h*0.58,w*0.34);
    gb.addColorStop(0,'#8fd94a'); gb.addColorStop(0.6,'#4e9c22'); gb.addColorStop(1,'#2b6210');
    c.fillStyle=gb; c.beginPath(); c.ellipse(cx0,h*0.62,w*0.32,w*0.30,0,0,TAU); c.fill(); ol(c,'#245a12',3);
    /* mulut menganga */
    c.fillStyle='#3a1305'; c.beginPath(); c.ellipse(cx0,h*0.50,w*0.24,w*0.17,0,0,TAU); c.fill();
    ol(c,'#5e1d08',2.4);
    c.fillStyle='#f2efdd'; for(var tk=-2;tk<=2;tk++)c.fillRect(cx0+tk*8-2.6,h*0.40,4,7);
    c.fillStyle='#f2efdd'; for(var tk2=-1;tk2<=1;tk2++)c.fillRect(cx0+tk2*8-2.6,h*0.56,4,6);
    c.fillStyle='#ffffff33'; c.beginPath(); c.ellipse(cx0-14,h*0.44,7,4.5,-0.5,0,TAU); c.fill();
  } else if(t==='wallnut'){
    ell(c,cx0,h-12,w*0.42,h*0.10,'#00000022');
    c.fillStyle='#c07f3c';c.beginPath();c.ellipse(cx0,h*0.55,w*0.40,h*0.43,0,0,TAU);c.fill();
    ball(c,cx0,h*0.56,w*0.35,'#efb271','#9c6427','#5f3a0f');
    c.strokeStyle='#8b5b23';c.lineWidth=2;c.beginPath();c.moveTo(cx0-16,h*0.4);c.quadraticCurveTo(cx0-8,h*0.5,cx0-13,h*0.66);c.stroke();
    eyes(c,cx0,h*0.52,6.4,0,0); brow(c,cx0-14,h*0.36,8,1,'#6b4517'); brow(c,cx0+14,h*0.36,8,-1,'#6b4517');
    c.strokeStyle='#5f3a0f';c.lineWidth=3;c.beginPath();c.arc(cx0,h*0.68,10,0.12*Math.PI,0.88*Math.PI);c.stroke();
    c.fillStyle='#f7e6c8';c.beginPath();c.arc(cx0,h*0.70,6,0.1*Math.PI,0.9*Math.PI);c.fill();
  } else if(t==='potatomine'){
    c.save(); c.translate(cx0,h); c.scale(1.12,1.12); c.translate(-cx0,-h);
    ell(c,cx0,h-16,w*0.46,h*0.15,'#4f3618'); ell(c,cx0,h-18,w*0.4,h*0.12,'#3d290f');
    c.fillStyle='#3a270e';for(var k=0;k<5;k++){circ(c,cx0-24+k*12,h-16-(k%2)*3,3,'#2c1c08')}
    ball(c,cx0,h*0.68,w*0.33,'#e6c088','#9c7136','#5c3c12');
    c.fillStyle='#8b6b3a';for(var k2=0;k2<4;k2++){circ(c,cx0-14+k2*9,h*0.6+(k2%2)*8,2.2,'#9c7136')}
    eyes(c,cx0,h*0.66,6,0,1); brow(c,cx0-13,h*0.52,8,1,'#5c3c12'); brow(c,cx0+13,h*0.52,8,-1,'#5c3c12');
    c.strokeStyle='#5c3c12';c.lineWidth=3;c.beginPath();c.moveTo(cx0-9,h*0.78);c.quadraticCurveTo(cx0,h*0.84,cx0+9,h*0.78);c.stroke();
    ball(c,cx0,h*0.42,5.4,'#ff8a7a','#c11a0d'); ball(c,cx0,h*0.42,2.2,'#fff6d0','#ffd75e');
    c.restore();
  } else if(t==='cherrybomb'){
    c.strokeStyle='#2b6209';c.lineWidth=4;c.beginPath();c.moveTo(cx0,h*0.44);c.quadraticCurveTo(cx0-10,h*0.24,cx0-16,h*0.16);c.moveTo(cx0,h*0.44);c.quadraticCurveTo(cx0+10,h*0.24,cx0+16,h*0.16);c.stroke();
    leaf(c,cx0,h*0.18,0,'#57b526',13,'#2b6209');
    ball(c,w*0.33,h*0.64,23,'#ff6a58','#a81a10','#640d06'); ball(c,w*0.67,h*0.64,23,'#ff6a58','#a81a10','#640d06');
    ell(c,w*0.27,h*0.55,7,5,'#ffffff55',-0.5); ell(c,w*0.61,h*0.55,7,5,'#ffffff55',-0.5);
    eyes(c,w*0.33,h*0.62,5.4,0,0); eyes(c,w*0.67,h*0.62,5.4,0,0);
    brow(c,w*0.33-2,h*0.5,8,-1,'#5e0a05'); brow(c,w*0.67+2,h*0.5,8,1,'#5e0a05');
    c.strokeStyle='#5e0a05';c.lineWidth=3;c.beginPath();c.arc(w*0.33,h*0.74,7,0.1*Math.PI,0.9*Math.PI);c.arc(w*0.67,h*0.74,7,0.1*Math.PI,0.9*Math.PI);c.stroke();
  } else if(t==='jalapeno'){
    c.save(); c.translate(cx0,h*0.78); c.rotate(sway); c.scale(1.42,1.42);
    c.fillStyle='#a81a10'; c.beginPath(); c.moveTo(-5,-26); c.quadraticCurveTo(24,-10,13,28); c.quadraticCurveTo(-2,38,-18,20); c.quadraticCurveTo(-24,-2,-5,-26); c.fill();
    c.fillStyle='#e0392c'; c.beginPath(); c.moveTo(-2,-21); c.quadraticCurveTo(16,-7,8,23); c.quadraticCurveTo(-2,29,-12,16); c.quadraticCurveTo(-16,0,-2,-21); c.fill();
    ell(c,-6,-6,6,12,'#ff8f7a88',0.3);
    c.strokeStyle='#2b6209';c.lineWidth=6;c.beginPath();c.moveTo(-5,-25);c.quadraticCurveTo(-2,-36,8,-39);c.stroke();
    leaf(c,-1,-30,1,'#57b526',12,'#2b6209');
    eyes(c,-2,-4,5.4,0,1); brow(c,-13,4,7,1,'#5e0a05'); brow(c,9,4,7,-1,'#5e0a05');
    c.strokeStyle='#5e0a05';c.lineWidth=3;c.beginPath();c.moveTo(-10,10);c.quadraticCurveTo(-2,17,6,10);c.stroke();
    c.restore();
  }
  c.restore();
}
function drawZomShape(c,t,w,h,frame,zoom){
  var big=t==='garga', s=big?1.2:1, X=w/2, H=h;
  var Z=zoom||1; c.save();
  if(Z!==1){c.translate(X,H);c.scale(Z,Z);c.translate(-X,-H)}
  var skinA=big?'#cfe0b0':'#d6e3bb', skinB=big?'#7f9761':'#9db07f', skinL='#3f4d28';
  var shirtA=big?'#9a8fc0':'#98a1b0', shirtB='#575e6c', shirtL='#33383f';
  var ph=frame*Math.PI/2, legSw=Math.sin(ph)*9, armSw=Math.cos(ph)*3.5;
  ell(c,X,H-3,31*s,7*s,'#00000033');
  /* kaki: celana gelap + sepatu hitam (aslinya pakai celana, bukan kulit) */
  c.strokeStyle='#4a4038'; c.lineWidth=11*s; c.lineCap='round';
  c.beginPath(); c.moveTo(X-7*s,H-34*s); c.lineTo(X-9*s+legSw,H-7*s); c.stroke();
  c.beginPath(); c.moveTo(X+7*s,H-34*s); c.lineTo(X+9*s-legSw,H-7*s); c.stroke();
  c.strokeStyle='#2b2621'; c.lineWidth=9*s;
  c.beginPath(); c.moveTo(X-9*s+legSw,H-4*s); c.lineTo(X-15*s+legSw,H-4*s); c.stroke();
  c.beginPath(); c.moveTo(X+9*s-legSw,H-4*s); c.lineTo(X+15*s-legSw,H-4*s); c.stroke();
  /* badan: jas lusuh dengan kemeja + DASI MERAH dan kerah, seperti aslinya */
  var g=c.createLinearGradient(X-18*s,H-72*s,X+18*s,H-28*s); g.addColorStop(0,shirtA); g.addColorStop(1,shirtB);
  c.fillStyle=g; c.beginPath(); c.moveTo(X-19*s,H-72*s); c.lineTo(X+19*s,H-72*s); c.lineTo(X+17*s,H-30*s);
  c.lineTo(X+10*s,H-24*s); c.lineTo(X+3*s,H-30*s); c.lineTo(X-5*s,H-24*s); c.lineTo(X-13*s,H-31*s); c.lineTo(X-18*s,H-26*s); c.closePath(); c.fill();
  c.strokeStyle=shirtL; c.lineWidth=3; c.stroke();
  c.strokeStyle='#00000030'; c.lineWidth=2.4; c.beginPath(); c.moveTo(X-4*s,H-68*s); c.lineTo(X-6*s,H-34*s); c.moveTo(X+8*s,H-66*s); c.lineTo(X+9*s,H-36*s); c.stroke();
  /* kemeja dalam (segitiga terang di dada) + dasi merah */
  c.fillStyle='#cdd3d8'; c.beginPath(); c.moveTo(X-7*s,H-71*s); c.lineTo(X+7*s,H-71*s); c.lineTo(X,H-54*s); c.closePath(); c.fill();
  c.strokeStyle='#7c848c'; c.lineWidth=1.8; c.stroke();
  c.fillStyle='#9c2b22'; c.beginPath(); c.moveTo(X-4*s,H-70*s); c.lineTo(X+4*s,H-70*s); c.lineTo(X+5*s,H-62*s); c.lineTo(X,H-57*s); c.lineTo(X-5*s,H-62*s); c.closePath(); c.fill();
  ol(c,'#5e120c',2.2);
  /* kerah jas */
  c.strokeStyle=shirtL; c.lineWidth=3; c.beginPath(); c.moveTo(X-16*s,H-72*s); c.lineTo(X-6*s,H-62*s); c.moveTo(X+16*s,H-72*s); c.lineTo(X+6*s,H-62*s); c.stroke();
  /* rusuk yang kelihatan */
  c.strokeStyle='#eef2e4'; c.lineWidth=2.6; for(var i=0;i<3;i++){c.beginPath(); c.moveTo(X-11*s,H-(60-i*7)*s); c.lineTo(X+11*s,H-(60-i*7)*s); c.stroke()}
  /* tangan menjulur ke kiri (jalan ke kiri): lengan berjas, telapak pucat */
  c.strokeStyle=shirtB; c.lineWidth=11*s;
  c.beginPath(); c.moveTo(X-14*s,H-66*s); c.lineTo(X-30*s,H-60*s+armSw); c.lineTo(X-46*s,H-58*s+armSw); c.stroke();
  c.beginPath(); c.moveTo(X+14*s,H-64*s); c.lineTo(X-4*s,H-56*s-armSw); c.lineTo(X-18*s,H-54*s-armSw); c.stroke();
  c.strokeStyle='#0000002e'; c.lineWidth=3*s;
  c.beginPath(); c.moveTo(X-20*s,H-63*s); c.lineTo(X-34*s,H-59*s+armSw); c.stroke();
  c.fillStyle=skinA; c.beginPath(); c.ellipse(X-52*s,H-58*s+armSw,7*s,6*s,0,0,TAU); c.fill(); ol(c,skinL,2.6);
  c.beginPath(); c.ellipse(X-24*s,H-54*s-armSw,6.5*s,6*s,0,0,TAU); c.fill(); ol(c,skinL,2.6);
  /* leher */
  c.fillStyle=skinB; rr(c,X-7*s,H-82*s,14*s,12*s,3); c.fill(); ol(c,skinL,2.6);
  /* kepala + kilau cahaya dari kiri-atas (biar terasa bervolume) */
  ball(c,X,H-100*s,18*s,skinA,skinB,skinL);
  ell(c,X-7*s,H-110*s,7*s,4.6*s,'#ffffff33',-0.55);
  c.strokeStyle='#ffffff1f'; c.lineWidth=3; c.beginPath(); c.moveTo(X-18*s,H-68*s); c.lineTo(X-17*s,H-32*s); c.stroke();
  c.fillStyle=skinB; c.beginPath(); c.ellipse(X-13*s,H-92*s,8*s,7*s,0,0,TAU); c.fill(); /* rahang bawah */
  c.strokeStyle=skinL; c.lineWidth=2.6; c.beginPath(); c.moveTo(X-6*s,H-90*s); c.lineTo(X-20*s,H-92*s); c.stroke();
  /* lubang mata gelap + bola mata melotot ke kiri (khas zombie PVZ) */
  c.fillStyle='#4a5340'; c.beginPath(); c.ellipse(X-9*s,H-106*s,8.6*s,8*s,0,0,TAU); c.fill();
  c.beginPath(); c.ellipse(X-22*s,H-104*s,6.6*s,6.4*s,0,0,TAU); c.fill();
  circ(c,X-9*s,H-106*s,6*s,'#20180f'); circ(c,X-9*s,H-106*s,4.9*s,'#f2efdd'); circ(c,X-11*s,H-106*s,2.7*s,'#20180f'); circ(c,X-12*s,H-107*s,1.1*s,'#ffffff');
  circ(c,X-22*s,H-104*s,4.7*s,'#20180f'); circ(c,X-22*s,H-104*s,3.7*s,'#f2efdd'); circ(c,X-24*s,H-104*s,2.1*s,'#20180f');
  /* mulut menganga: gelap + gigi jarang + garis rahang */
  c.fillStyle='#3a1d16'; c.beginPath(); c.ellipse(X-22*s,H-88*s,9.5*s,6.8*s,0.2,0,TAU); c.fill();
  ol(c,'#4a5340',2.2);
  c.fillStyle='#f2efdd'; for(var k=-1;k<=1;k++){c.fillRect(X-27*s+k*5*s,H-94*s,3.2*s,5*s)}
  c.fillStyle='#f2efdd'; c.fillRect(X-30*s,H-84*s,3*s,4*s);
  /* rambut acak-acakan */
  c.strokeStyle='#6d7f4d'; c.lineWidth=3.4*s; c.lineCap='round';
  c.beginPath(); c.moveTo(X-6*s,H-117*s); c.lineTo(X-12*s,H-126*s); c.moveTo(X+2*s,H-118*s); c.lineTo(X+9*s,H-127*s); c.moveTo(X+9*s,H-114*s); c.lineTo(X+18*s,H-119*s); c.stroke();
  if(t==='cone'){
    var g2=c.createLinearGradient(X-20*s,0,X+20*s,0); g2.addColorStop(0,'#ffb347'); g2.addColorStop(1,'#c2600c');
    c.fillStyle=g2; c.beginPath(); c.moveTo(X,H-152*s); c.lineTo(X+22*s,H-116*s); c.lineTo(X-22*s,H-116*s); c.closePath(); c.fill(); ol(c,'#7d3c05',3);
    c.fillStyle='#f7f2e4'; c.beginPath(); c.moveTo(X-16*s,H-132*s); c.lineTo(X+16*s,H-132*s); c.lineTo(X+13*s,H-124*s); c.lineTo(X-13*s,H-124*s); c.closePath(); c.fill(); ol(c,'#7d3c05',2.2);
  } else if(t==='bucket'){
    var g3=c.createLinearGradient(X-22*s,0,X+22*s,0); g3.addColorStop(0,'#cdd6dc'); g3.addColorStop(0.4,'#eef3f6'); g3.addColorStop(1,'#8d979d');
    c.fillStyle=g3; c.beginPath(); c.moveTo(X-21*s,H-116*s); c.lineTo(X+21*s,H-116*s); c.lineTo(X+18*s,H-150*s); c.lineTo(X-18*s,H-150*s); c.closePath(); c.fill(); ol(c,'#5f686e',3);
    c.strokeStyle='#8d979d'; c.lineWidth=3; c.beginPath(); c.moveTo(X-20*s,H-126*s); c.lineTo(X+20*s,H-126*s); c.moveTo(X-19*s,H-138*s); c.lineTo(X+19*s,H-138*s); c.stroke();
    c.fillStyle='#b9c3c9'; c.beginPath(); c.ellipse(X,H-150*s,18*s,4.5*s,0,0,TAU); c.fill(); ol(c,'#5f686e',2.4);
  } else if(t==='flag'){
    c.strokeStyle='#8a6a3c'; c.lineWidth=4.5*s; c.beginPath(); c.moveTo(X-46*s,H-56*s); c.lineTo(X-52*s,H-140*s); c.stroke();
    var g4=c.createLinearGradient(X-52*s,0,X+6*s,0); g4.addColorStop(0,'#e04a38'); g4.addColorStop(1,'#9c1f14');
    c.fillStyle=g4; c.beginPath(); c.moveTo(X-52*s,H-140*s); c.quadraticCurveTo(X-20*s,H-132*s,X+4*s,H-138*s); c.lineTo(X+2*s,H-112*s); c.quadraticCurveTo(X-24*s,H-104*s,X-50*s,H-114*s); c.closePath(); c.fill(); ol(c,'#6d1109',2.6);
  }
  if(big){
    c.strokeStyle='#7b5a2c'; c.lineWidth=13*s; c.lineCap='round'; c.beginPath(); c.moveTo(X+38*s,H-58*s); c.lineTo(X+52*s,H-136*s); c.stroke();
    c.strokeStyle='#9c7440'; c.lineWidth=6*s; c.beginPath(); c.moveTo(X+38*s,H-58*s); c.lineTo(X+52*s,H-136*s); c.stroke();
    var g5=c.createLinearGradient(X+42*s,0,X+66*s,0); g5.addColorStop(0,'#8a6a3c'); g5.addColorStop(1,'#4f3a1c');
    c.fillStyle=g5; rr(c,X+42*s,H-158*s,28*s,26*s,5); c.fill(); ol(c,'#33240f',3);
  }
  c.restore();
}
/* Ukuran sprite: tanaman 100x118 (sel 96x112, jadi sedikit melebar seperti aslinya),
   zombie 170x196 (Gargantuar 200x236) supaya kepala/badan besar dan jelas.
   Sel kini 144px tinggi → sprite dibesarkan biar proporsinya tetap seperti aslinya. */
function buildArt(){
  ['sunflower','peashooter','wallnut','potatomine','snowpea','repeater','lilypad','gravebuster','puffshroom','sunshroom','cherrybomb','jalapeno'].forEach(function(t){
    var pw=128, ph=150, pz=(t==='lilypad')?1.0:1.1;   /* pad jangan diperbesar, nanti meluber */
    ART.plants[t]={w:pw,h:ph,frames:[bake(pw,ph,function(c,w,h){drawPlant(c,t,w,h,0,pz)}),bake(pw,ph,function(c,w,h){drawPlant(c,t,w,h,1.7,pz)})]}
  });
  ['normal','cone','bucket','flag','garga'].forEach(function(t){
    var big=t==='garga', bw=big?244:205, bh=big?290:238, zz=big?1.05:1.16;
    ART.zom[t]={w:bw,h:bh,frames:[0,1,2,3].map(function(f){return bake(bw,bh,function(c,w,h){drawZomShape(c,t,w,h,f,zz)})})}
  });
  /* batu nisan: batu berlumut, miring sedikit, ada ukiran */
  ART.nisan=bake(110,134,function(c,w,h){
    var X=w/2;
    ell(c,X,h-6,30,8,'#00000033');
    c.save(); c.translate(X,h); c.rotate(-0.045); c.translate(-X,-h);
    var sg=c.createLinearGradient(X-26,0,X+26,h);
    sg.addColorStop(0,'#b9bcc0'); sg.addColorStop(0.45,'#8d9298'); sg.addColorStop(1,'#5d636a');
    c.fillStyle=sg;
    c.beginPath(); c.moveTo(X-24,h-6); c.lineTo(X-24,h-58); c.quadraticCurveTo(X,h-96,X+24,h-58); c.lineTo(X+24,h-6); c.closePath(); c.fill();
    ol(c,'#3f4449',3);
    c.fillStyle='#ffffff2b'; c.beginPath(); c.moveTo(X-19,h-10); c.lineTo(X-19,h-56); c.quadraticCurveTo(X-8,h-80,X-3,h-84); c.lineTo(X-3,h-12); c.closePath(); c.fill();
    /* ukiran */
    c.strokeStyle='#5a6067'; c.lineWidth=3.4;
    c.beginPath(); c.moveTo(X-11,h-72); c.lineTo(X+11,h-72); c.moveTo(X,h-80); c.lineTo(X,h-58); c.stroke();
    c.strokeStyle='#2f3438'; c.lineWidth=2; c.beginPath(); c.moveTo(X-9,h-48); c.lineTo(X+9,h-48); c.moveTo(X-6,h-40); c.lineTo(X+6,h-40); c.stroke();
    /* retak & lumut */
    c.strokeStyle='#454a4f'; c.lineWidth=2; c.beginPath(); c.moveTo(X+14,h-70); c.lineTo(X+7,h-56); c.lineTo(X+15,h-44); c.stroke();
    c.fillStyle='#4f7a2a88'; for(var m=0;m<9;m++){var mx=X-20+Math.random()*40, my=h-26+Math.random()*20; c.beginPath(); c.ellipse(mx,my,Math.random()*6+3,Math.random()*3+2,0,0,TAU); c.fill()}
    /* rumput di kaki batu */
    c.strokeStyle='#3f7a1c'; c.lineWidth=2.2;
    for(var g2=0;g2<10;g2++){var gx2=X-24+Math.random()*48;
      c.beginPath(); c.moveTo(gx2,h-4); c.quadraticCurveTo(gx2+2,h-12,gx2+(Math.random()*8-4),h-18); c.stroke()}
    c.restore();
  });
  ART.sun=bake(76,76,function(c,w,h){var r=w/2;var g=c.createRadialGradient(r,r,3,r,r,r);g.addColorStop(0,'#fffbe0');g.addColorStop(0.4,'#ffd23f');g.addColorStop(0.78,'#ffab24');g.addColorStop(1,'#ff8a1e00');circ(c,r,r,r,g);c.save();c.translate(r,r);c.strokeStyle='#ffec9a';c.lineWidth=3.4;for(var i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.moveTo(0,-r*0.62);c.lineTo(0,-r*0.98);c.stroke()}c.restore();ball(c,r,r,r*0.5,'#fff6c0','#ffc93c')});
  /* Ukur: kepala zombie ~183px di atas kaki (zombie biasa) — dipakai efek mata menyala */
  ART.pea=bake(31,31,function(c,w,h){circ(c,w/2,h/2,12,'#69c62f');circ(c,w/2-3.6,h/2-3.6,4.8,'#c7f59a')});
  /* spora Puff-shroom: bulatan ungu berasap */
  ART.spore=bake(26,26,function(c,w,h){
    circ(c,w/2,h/2,10,'#8a6fb0'); circ(c,w/2,h/2,6.6,'#c3aee0'); circ(c,w/2-3,h/2-3,3.4,'#f0e6ff');
    c.fillStyle='#8a6fb055'; circ(c,w/2+5,h/2+4,3.4,'#8a6fb055'); circ(c,w/2-6,h/2+5,2.6,'#8a6fb055');
  });
  ART.snow=bake(31,31,function(c,w,h){circ(c,w/2,h/2,12,'#6ed3ec');circ(c,w/2-3.6,h/2-3.6,4.8,'#e6fbff')});
  /* Spora Puff-shroom: bulatan berbulu lembut (bukan kacang hijau) */
  ART.spora=bake(22,22,function(c,w,h){var r=w/2;var g=c.createRadialGradient(r-2,r-2,1,r,r,r);
    g.addColorStop(0,'#ffffff');g.addColorStop(0.42,'#eaf8d8');g.addColorStop(0.8,'#b8de92d0');g.addColorStop(1,'#9dcb7800');
    circ(c,r,r,r,g);circ(c,r-3,r-3,3.4,'#ffffffcc');circ(c,r-6,r+2,2.2,'#ffffff77')});
  ART.mower=bake(96,76,function(c,w,h){
    c.fillStyle='#8f1f16';rr(c,9,19,68,29,8);c.fill();
    var g=c.createLinearGradient(0,19,0,48);g.addColorStop(0,'#e8574a');g.addColorStop(1,'#a5281d');c.fillStyle=g;rr(c,11,21,64,26,7);c.fill();ol(c,'#5e120b',3);
    c.fillStyle='#ffffff55';rr(c,16,23,54,7,4);c.fill();
    c.fillStyle='#8d979c';rr(c,19,45,56,13,5);c.fill();ol(c,'#4d555a',3);
    c.fillStyle='#c3ccd1';circ(c,74,51,10,'#c3ccd1');circ(c,74,51,4,'#6f787d');
    c.fillStyle='#2f2b26';circ(c,26,53,11,'#2f2b26');circ(c,26,53,4.5,'#7b7b7b');
    c.fillStyle='#4a4a4a';rr(c,11,12,28,11,4);c.fill();ol(c,'#262626',2.6);
    c.strokeStyle='#6f787d';c.lineWidth=4;c.beginPath();c.moveTo(22,22);c.lineTo(40,10);c.stroke()});
  pakaiLatar('depan');
}

/* Latar rumput + rumah + potongan mesin dipanggang sekali. */
/* Simpan hasil panggang tiap variasi latar supaya tidak dipanggang berulang kali. */
var LATAR={};
function pakaiLatar(v){if(!LATAR[v])LATAR[v]=makeLawn(v);ART.lawn=LATAR[v]}
/* Latar: 'depan' (halaman depan) · 'belakang' (ada kolam) · 'malam' (kuburan, gelap) */
function makeLawn(v){
  v=v||'depan';
  var malam=(v==='malam'), blk=(v==='belakang');
  return bake(LW,LH,function(c){
    var r,col,i,b,x,y;
    /* ---- halaman: petak bergaris seperti rumput yang baru dipangkas ---- */
    var R1=malam?'#3f6d23':'#6db336', R2=malam?'#4d7f2b':'#82c64a';
    for(r=0;r<ROWS;r++)for(col=0;col<COLS;col++){
      c.fillStyle=((r+col)%2===0)?R1:R2;
      c.fillRect(GX+col*CW,r*CH,CW,CH);
    }
    /* bercak cahaya/mati: rumput tidak pernah rata warnanya */
    for(i=0;i<620;i++){
      x=GX+Math.random()*(LW-GX); y=Math.random()*LH;
      c.fillStyle=Math.random()<0.5?'#93d95a1f':'#4a8a2213';
      c.beginPath(); c.ellipse(x,y,Math.random()*30+7,Math.random()*10+3,Math.random(),0,TAU); c.fill();
    }
    /* ---- helai rumput: tiap helai punya sisi gelap, arah cahaya kiri-atas ---- */
    for(b=0;b<1050;b++){
      x=GX+Math.random()*(LW-GX); y=Math.random()*LH;
      var hg2=Math.random()*10+4, lean=(Math.random()-0.5)*5;
      c.strokeStyle=Math.random()<0.45?'#a9e56c3d':'#3d7a1a30';
      c.lineWidth=Math.random()<0.3?2:1.1;
      c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x+lean*0.5,y-hg2*0.55,x+lean,y-hg2); c.stroke();
    }
    /* ---- kolam (halaman belakang): air bergelombang + bibir batu ---- */
    if(blk){
      var y0=(G.air[0]!==undefined?Math.min.apply(null,G.air):1)*CH, y1=(G.air[0]!==undefined?Math.max.apply(null,G.air)+1:3)*CH;
      var x0=GX+10, x1=LW-24;
      /* bibir kolam */
      c.fillStyle='#00000033'; c.fillRect(x0-6,y0-6,(x1-x0)+12,(y1-y0)+12);
      c.fillStyle='#cdba95'; c.fillRect(x0-5,y0-5,(x1-x0)+10,(y1-y0)+10);
      c.fillStyle='#a9906a'; c.fillRect(x0-5,y0+(y1-y0)+2,(x1-x0)+10,4);
      /* air: makin dalam makin gelap */
      var wg=c.createLinearGradient(0,y0,0,y1);
      wg.addColorStop(0,'#2f86ad'); wg.addColorStop(0.45,'#1f6b93'); wg.addColorStop(1,'#164f74');
      c.fillStyle=wg; c.fillRect(x0,y0,x1-x0,y1-y0);
      /* pantulan langit di tepi atas */
      var rg2=c.createLinearGradient(0,y0,0,y0+26);
      rg2.addColorStop(0,'#9fe0f355'); rg2.addColorStop(1,'#9fe0f300');
      c.fillStyle=rg2; c.fillRect(x0,y0,x1-x0,26);
      /* pantulan cahaya jendela rumah di air */
      var rf=c.createLinearGradient(0,0,58,0);
      rf.addColorStop(0,'#ffd88a55'); rf.addColorStop(1,'#ffd88a00');
      c.fillStyle=rf; c.fillRect(x0,y0,58,y1-y0);
      /* riak-riak kecil */
      for(i=0;i<120;i++){
        var rx=x0+Math.random()*(x1-x0), ry=y0+Math.random()*(y1-y0);
        c.strokeStyle=Math.random()<0.5?'#ffffff2e':'#0b35502e';
        c.lineWidth=Math.random()<0.3?1.8:1;
        c.beginPath(); c.moveTo(rx,ry); c.quadraticCurveTo(rx+9,ry-3.5,rx+19,ry); c.stroke();
      }
      /* warna dasar air tetap terlihat: satu lapis tipis lagi */
      c.fillStyle='#0e42661f'; c.fillRect(x0,y0,x1-x0,y1-y0);
    }
    /* garis petak tetap ada tapi samar (pemain butuh petak untuk menanam) */
    c.strokeStyle='#437d1c2e'; c.lineWidth=1.2;
    for(var r2=0;r2<=ROWS;r2++){c.beginPath();c.moveTo(GX,r2*CH);c.lineTo(LW,r2*CH);c.stroke()}
    for(var c3=0;c3<=COLS;c3++){c.beginPath();c.moveTo(GX+c3*CW,0);c.lineTo(GX+c3*CW,LH);c.stroke()}
    /* ---- bayangan yang jatuh dari rumah ke rumput (matahari dari kiri-atas) ---- */
    var sh=c.createLinearGradient(GX,0,GX+86,0);
    sh.addColorStop(0,'#1d320a66'); sh.addColorStop(0.55,'#1d320a22'); sh.addColorStop(1,'#1d320a00');
    c.fillStyle=sh; c.fillRect(GX,0,86,LH);
    /* ---- dinding rumah: papan kayu + jendela bercahaya + pintu ---- */
    var wall=c.createLinearGradient(0,0,GX,0);
    wall.addColorStop(0,'#3f2710'); wall.addColorStop(0.72,'#7a5528'); wall.addColorStop(1,'#4d3415');
    c.fillStyle=wall; c.fillRect(0,0,GX,LH);
    c.fillStyle='#00000030';
    for(y=0;y<LH;y+=19)c.fillRect(0,y,GX,1.6);
    c.fillStyle='#ffffff12';
    for(y=0;y<LH;y+=19)c.fillRect(0,y+1.6,GX,1.2);
    /* jendela: kaca hangat, kusen, pantulan kaca */
    c.fillStyle='#d7b273'; c.fillRect(20,74,58,74);
    c.fillStyle='#2a1a08'; c.fillRect(24,78,50,66);
    var gl=c.createLinearGradient(24,78,74,144); gl.addColorStop(0,'#ffdf9a'); gl.addColorStop(0.55,'#e8a94a'); gl.addColorStop(1,'#a8631d');
    c.fillStyle=gl; c.fillRect(26,80,46,62);
    c.fillStyle='#ffffff2e'; c.beginPath(); c.moveTo(28,142); c.lineTo(52,80); c.lineTo(60,80); c.lineTo(36,142); c.closePath(); c.fill();
    c.fillStyle='#d7b273'; c.fillRect(47,78,4,66); c.fillRect(24,110,50,4);
    c.fillStyle='#00000038'; c.fillRect(20,144,58,5);
    /* pintu: dua panel + gagang */
    c.fillStyle='#5a3a16'; c.fillRect(18,318,60,132);
    c.fillStyle='#744a1e'; c.fillRect(21,321,54,126);
    c.fillStyle='#00000026'; c.fillRect(24,330,22,48); c.fillRect(50,330,22,48); c.fillRect(24,392,48,46);
    c.fillStyle='#e8cc84'; circ(c,66,388,3.6,'#e8cc84');
    c.fillStyle='#00000030'; c.fillRect(18,312,60,6);
    /* atap: garis sirap di puncak */
    c.fillStyle='#2f1c09'; c.fillRect(0,0,GX,26);
    c.fillStyle='#4a2c0f'; for(var rx=0;rx<GX;rx+=16)c.fillRect(rx,6,12,7);
    c.fillStyle='#00000045'; c.fillRect(0,26,GX,3);
    /* ---- trotoar batu + pagar kayu di kanan ---- */
    c.fillStyle='#c9a75f'; c.fillRect(GX-9,0,9,LH);
    c.fillStyle='#a58243'; for(y=0;y<LH;y+=30)c.fillRect(GX-9,y,9,2);
    c.fillStyle='#3f6f1c'; c.fillRect(GX-2,0,3,LH);
    /* pagar */
    c.fillStyle='#8a5f28'; c.fillRect(LW-20,0,20,LH);
    for(y=-10;y<LH;y+=26){
      c.fillStyle='#6d4a1d'; c.fillRect(LW-18,y,16,20);
      c.fillStyle='#a97a37'; c.fillRect(LW-18,y,4,20);
      c.fillStyle='#00000038'; c.fillRect(LW-18,y+20,16,3);
    }
    c.fillStyle='#5b3a13'; c.fillRect(LW-6,0,6,LH);
    /* ---- cahaya: siang = hangat keemasan dari kiri-atas, malam = biru bulan ---- */
    var sunl=c.createLinearGradient(GX,0,GX+LW,LH);
    if(malam){ sunl.addColorStop(0,'#b9d2ff22'); sunl.addColorStop(0.5,'#8fb0e008'); sunl.addColorStop(1,'#050a20aa'); }
    else { sunl.addColorStop(0,'#fff3c21c'); sunl.addColorStop(0.5,'#fff3c208'); sunl.addColorStop(1,'#1c2a0830'); }
    c.fillStyle=sunl; c.fillRect(GX,0,LW-GX,LH);
    /* baris belakang lebih gelap (jarak), baris depan lebih terang */
    var dep=c.createLinearGradient(0,0,0,LH);
    if(malam){ dep.addColorStop(0,'#050c1e77'); dep.addColorStop(0.34,'#050c1e33'); dep.addColorStop(0.7,'#9fb6e010'); dep.addColorStop(1,'#02040f55'); }
    else { dep.addColorStop(0,'#0b1c0444'); dep.addColorStop(0.32,'#0b1c0410'); dep.addColorStop(0.7,'#fff6c60e'); dep.addColorStop(1,'#00000026'); }
    c.fillStyle=dep; c.fillRect(GX,0,LW-GX,LH);
    c.fillStyle=malam?'#02040f44':'#0000001c'; c.fillRect(0,LH-12,LW,12);
    /* malam: rumah nyaris gelap, kuburan di sudut-sudut */
    if(malam){
      c.fillStyle='#050a1e88'; c.fillRect(0,0,GX,LH);
      c.fillStyle='#1a2547'; c.fillRect(0,0,GX,26);
    }
  });
}

/* ---------- tabel tanaman & zombie ---------- */
var PLANTS={
  sunflower:{n:'Sunflower',cost:50,cd:7.5,hp:300},
  peashooter:{n:'Peashooter',cost:100,cd:7.5,hp:300},
  wallnut:{n:'Wall-nut',cost:50,cd:25,hp:4000},
  potatomine:{n:'Potato Mine',cost:25,cd:25,hp:300,arm:14},
  snowpea:{n:'Snow Pea',cost:175,cd:7.5,hp:300},
  repeater:{n:'Repeater',cost:200,cd:7.5,hp:300},
  lilypad:{n:'Lily Pad',cost:25,cd:7.5,hp:300},
  gravebuster:{n:'Grave Buster',cost:25,cd:7.5,hp:300},
  puffshroom:{n:'Puff-shroom',cost:0,cd:7.5,hp:300},
  sunshroom:{n:'Sun-shroom',cost:25,cd:12,hp:300},
  cherrybomb:{n:'Cherry Bomb',cost:150,cd:35,hp:300},
  jalapeno:{n:'Jalapeno',cost:125,cd:35,hp:300}
};
/* Kartu menyesuaikan level: Lily Pad di level berkolam, jamur & Grave Buster di malam. */
var ORDER=['sunflower','peashooter','wallnut','potatomine','snowpea','repeater','lilypad','puffshroom','sunshroom','gravebuster','cherrybomb','jalapeno'];
function kartuLevel(t){
  var c=G.cfg||LEVELS[1];
  if(t==='lilypad')return !!(c.kolam&&c.kolam.length);
  if(t==='puffshroom'||t==='sunshroom')return !!c.nisan;      /* jamur hanya tumbuh di malam */
  if(t==='gravebuster')return !!c.nisan;
  return true
}
function orderLevel(){return ORDER.filter(kartuLevel)}
/* Kekuatan zombie: diturunkan sedikit dari versi pertama supaya tanaman terasa
   benar-benar melukai (dulu zombie 200 hp vs kacang 20 dmg = lambat sekali). */
var ZTYPE={
  normal:{hp:150,speed:25,w:44,label:'Zombie'},
  cone:{hp:380,speed:25,w:46,label:'Conehead'},
  bucket:{hp:800,speed:24,w:48,label:'Buckethead'},
  flag:{hp:170,speed:34,w:46,label:'Flag Zombie'},
  garga:{hp:1900,speed:19,w:70,label:'Gargantuar'}
};
/* Kekuatan tanaman: kacang 35 (dulu 20) dan jeda tembak lebih rapat. */
/* Kekuatan tembakan: kacang 48 (dulu 35) dan jeda 1.05 detik supaya tanaman
   benar-benar terasa sakit dan menumbangkan zombie dengan cepat. */
var PEA=48,  JEDA=1.05, JEDA_REP=1.25, KECEPAT_KACANG=430;
var DROP=[25,25,25,50];
/* Matahari awal level. 100 = cukup untuk 1 peashooter atau 2 sunflower, jadi
   pemain tidak langsung mati sebelum sempat menanam apa pun. */
var START_SUN=100;
/* ---------- keadaan permainan ---------- */
var SAVE={stars:{},best:0,snd:true,mus:true,auto:true};
var G={state:'menu',mode:'level',level:1,auto:true,sun:START_SUN,plants:[],zoms:[],corpses:[],suns:[],peas:[],fx:[],mowers:[],waves:[],waveIdx:-1,queue:[],nextT:0,waveT:0,t:0,sel:null,shovel:false,sunT:5,cd:{},killed:0,planted:0,mowerUsed:0,survived:0,star:0,slow:1,air:[],gelap:0,nisan:[],cfg:null,gelombangAtas:1,
  /* cuaca: cerah · angin · hujan (angin & hujan naik-turun perlahan, bukan patah-patah) */
  cuaca:'cerah',cuacaT:12,angin:0.18,hujan:0,hujanSfx:0,petirT:20,flash:0};
function loadSave(){try{var s=JSON.parse(localStorage.getItem('nano-pvz')||'{}');  if(s&&typeof s==='object'){SAVE.stars=s.stars||{};SAVE.best=s.best||0;if(s.snd===false)SAVE.snd=false;if(s.mus===false)SAVE.mus=false;if(s.auto===false)SAVE.auto=false}}catch(e){}}
function writeSave(){try{localStorage.setItem('nano-pvz',JSON.stringify({stars:SAVE.stars,best:SAVE.best,snd:SAVE.snd,mus:SAVE.mus,auto:SAVE.auto}))}catch(e){}}
function cxy(r,c){return{x:GX+c*CW+CW/2,y:r*CH+CH/2}}
function cellAt(px,py){var c=Math.floor((px-GX)/CW),r=Math.floor(py/CH);if(px<GX||c<0||c>=COLS||r<0||r>=ROWS)return null;return{r:r,c:c}}
function plantAt(r,c){for(var i=0;i<G.plants.length;i++)if(G.plants[i].r===r&&G.plants[i].c===c)return G.plants[i];return null}
/* Tanaman di petak, mengabaikan Lily Pad (pad itu alas, bukan tanaman). */
function tanamAt(r,c){for(var i=0;i<G.plants.length;i++){var p=G.plants[i];if(p.r===r&&p.c===c&&p.type!=='lilypad')return p}return null}
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},1500)}
function banner(t,s){var b=$('banner');b.innerHTML=t+(s?'<small>'+s+'</small>':'');b.classList.add('show');clearTimeout(b._t);b._t=setTimeout(function(){b.classList.remove('show')},1900)}

/* ---------- gelombang ---------- */
function mixFor(lv,i,big){
  var t='normal',r=Math.random();
  if(lv===1)t=r<0.7?'normal':(r<0.94?'cone':'bucket');
  else if(lv===2)t=r<0.46?'normal':(r<0.78?'cone':(r<0.95?'bucket':'flag'));
  else t=r<0.34?'normal':(r<0.66?'cone':(r<0.88?'bucket':'flag'));
  if(!big&&i<2&&lv>1)t='normal';
  return t;
}
/* ---------- tabel level ----------
   latar : 'depan' halaman depan · 'belakang' ada kolam · 'malam' kuburan
   gelap : [kegelapan gelombang pertama, kegelapan gelombang terakhir] 0=siang 1=malam
           inilah siklus siang→malam: makin jauh gelombangnya, makin gelap
   kolam : nomor baris yang berisi air (butuh Lily Pad supaya bisa ditanami)
   nisan : batu nisan yang menghalangi petak & mengeluarkan zombie
   langit: porsi matahari jatuh dari langit (malam = langit jarang menurunkan)
   cuaca : [cuaca gelombang pertama, cuaca gelombang terakhir]
           'cerah' · 'angin' · 'hujan'  (hujan butuh waktu datang, jadi terasa) */
var LEVELS={
  1:{nama:'1-1 · Halaman Depan',gel:8, latar:'depan',    gelap:[0,0.55],   kolam:[],   nisan:false,langit:1,   cuaca:['cerah','angin']},
  2:{nama:'1-2 · Lebih Ramai',  gel:10,latar:'depan',    gelap:[0.1,0.72], kolam:[],   nisan:false,langit:1,   cuaca:['angin','hujan']},
  3:{nama:'1-3 · Serangan Besar',gel:12,latar:'depan',   gelap:[0.18,0.88],kolam:[],   nisan:false,langit:1,   cuaca:['cerah','hujan']},
  4:{nama:'2-1 · Kolam Belakang',gel:11,latar:'belakang',gelap:[0.22,1],   kolam:[1,2],nisan:false,langit:1,   cuaca:['angin','hujan']},
  5:{nama:'1-4 · Malam Kuburan',gel:10,latar:'malam',    gelap:[1,1],      kolam:[],   nisan:true, langit:0.25,cuaca:['angin','hujan']}
};
function levelInfo(lv){return LEVELS[lv]||LEVELS[1]}
function buildWaves(lv){
  var cfg=levelInfo(lv), n=cfg.gel, w=[], kuat=Math.min(3,lv);
  for(var i=0;i<n;i++){
    var big=(i===n-1),flag=(i%5===4&&i>0);
    var count=clamp(1+Math.floor(i*0.85)+(big?8:0),1,big?16:9);
    var list=[];
    for(var k=0;k<count;k++)list.push(mixFor(kuat,i,big));
    if(flag)list.unshift('flag');
    if(big&&kuat>=3)list.push('garga');
    if(big&&kuat===2&&Math.random()<0.5)list.push('garga');
    w.push({list:list,big:big,flag:flag,n:count});
  }
  return w;
}
function wavePlan(list){
  var q=[],dur=0;
  for(var i=0;i<list.length;i++){
    var d=i*rnd(0.55,1.15)+(i===0?0.4:0);
    q.push({t:d,type:list[i],row:ri(0,ROWS-1)});
    dur=Math.max(dur,d);
  }
  q.sort(function(a,b){return a.t-b.t});
  return {q:q,dur:dur,n:list.length};
}
function nextWave(){
  G.waveIdx++;
  if(G.mode==='endless'){
    var lv=G.level,big=(G.waveIdx>0&&G.waveIdx%5===4),count=clamp(3+Math.floor(G.waveIdx*0.9)+(big?6:0),3,big?16:10),list=[];
    for(var i=0;i<count;i++)list.push(mixFor(lv,G.waveIdx,big));
    if(G.waveIdx>2&&G.waveIdx%6===5)list.push('garga');
    G.waves[G.waveIdx]={list:list,big:big,flag:G.waveIdx%5===4,n:count};
  }
  var w=G.waves[G.waveIdx];
  if(!w){finishWin();return}
  G.waveT=0;
  var plan=wavePlan(w.list);
  G.queue=plan.q; G.planned=plan.n; G.waveDur=Math.max(9,plan.dur);
  if(w.big){banner('A HUGE WAVE OF ZOMBIES IS APPROACHING!','gelombang terakhir — tahan!');sfx('wave')}
  else if(w.flag){banner('ZOMBIE PEMBAWA BENDERA!','gelombang '+(G.waveIdx+1));sfx('wave')}
  else banner('GELOMBANG '+(G.waveIdx+1),w.n+' zombie');
  sfx('groan');
}
function spawnZombie(type,row){
  var Z=ZTYPE[type]||ZTYPE.normal;
  G.zoms.push({type:type,row:row,x:LW+rnd(20,90),hp:Z.hp,max:Z.hp,speed:Z.speed*rnd(0.9,1.12),w:Z.w,eat:0,slow:0,ph:rnd(0,1),dead:false,seed:rnd(0,9),stept:rnd(0,0.5)});
  G.spawned++;
}
function startLevel(lv,mode){
  var cfg=levelInfo(lv);
  G.mode=mode||'level'; G.level=lv; G.cfg=cfg;
  G.state='playing'; G.sun=START_SUN; G.plants=[]; G.zoms=[]; G.corpses=[]; G.suns=[]; G.peas=[]; G.fx=[];
  G.mowers=[true,true,true,true,true]; G.mowX=[0,0,0,0,0];
  G.waves=G.mode==='endless'?[]:buildWaves(lv); G.waveIdx=-1; G.queue=[]; G.nextT=8; G.waveT=0; G.sunT=3; G.cd={}; G.sel=null; G.shovel=false;
  G.killed=0; G.planted=0; G.mowerUsed=0; G.survived=0; G.t=0; G.spawned=0;
  G.gelap=cfg.gelap[0]; G.air=(cfg.kolam||[]).slice();
  G.cuaca=(cfg.cuaca||['cerah','angin'])[0]; G.cuacaT=rnd(10,16);
  G.angin=G.cuaca==='angin'?0.55:(G.cuaca==='hujan'?0.38:0.18);
  G.hujan=G.cuaca==='hujan'?0.45:0; G.hujanSfx=0; G.petirT=rnd(12,26); G.flash=0;
  G.nisan=[];
  if(cfg.nisan)buatNisan();
  pakaiLatar(cfg.latar);
  hideOv('ovStart'); hideOv('ovPause'); hideOv('ovEnd');
  var pesan=cfg.nisan?'malam kelam, batu nisan mengeluarkan zombie':(cfg.kolam.length?'ada kolam — siapkan Lily Pad':'gelombang 1 sebentar lagi');
  banner('READY... SET... PLANT!',pesan); sfx('click');
  buildBank(); syncUI(true);
}
/* Petak air: tidak bisa ditanami kecuali pakai Lily Pad. */
function isAir(r){return G.air.indexOf(r)>=0}
function lilin(r,c){for(var i=0;i<G.plants.length;i++){var p=G.plants[i];if(p.r===r&&p.c===c&&p.type==='lilypad')return p}return null}
function nisanAt(r,c){for(var i=0;i<G.nisan.length;i++){var n=G.nisan[i];if(n.r===r&&n.c===c)return n}return null}
/* Batu nisan: 4 biji di petak acak (bukan di air), masing-masing bisa melahirkan zombie. */
function buatNisan(){
  var dipakai={};
  for(var i=0;i<4;i++){
    var coba=0,r,c;
    do{r=ri(0,ROWS-1);c=ri(0,COLS-1);coba++}while((dipakai[r+'-'+c]||isAir(r)||c===0)&&coba<60);
    dipakai[r+'-'+c]=1;
    G.nisan.push({r:r,c:c,t:rnd(6,14),sehat:true});
  }
}
function finishWin(){
  if(G.state!=='playing')return;
  G.state='won';
  var star=1; if(G.mowerUsed===0)star=3; else if(G.mowerUsed<=1)star=2;
  G.star=star;
  if(G.mode!=='endless'){var key='l'+G.level;SAVE.stars[key]=Math.max(SAVE.stars[key]||0,star)}else SAVE.best=Math.max(SAVE.best,G.waveIdx+1);
  writeSave(); sfx('win');
  showEnd(true);
}
function finishLose(){
  if(G.state!=='playing')return;
  G.state='lost'; sfx('lose'); showEnd(false);
}

/* ---------- aksi ---------- */
function damageZom(z,dmg){
  if(z.dead)return;
  z.hp-=dmg;
  if(z.hp<=0){z.dead=true;G.killed++;sfx('die');
    /* mayat roboh ke belakang (animasi, bukan hilang mendadak) */
    G.corpses.push({x:z.x,row:z.row,type:z.type,t:0});
    if(G.corpses.length>26)G.corpses.shift();
    G.fx.push({k:'puff',x:z.x,y:z.row*CH+CH-40,life:0.55,max:0.55,r:34});
    for(var i=0;i<7;i++)G.fx.push({k:'bit',x:z.x,y:z.row*CH+CH-46,vx:rnd(-60,60),vy:rnd(-90,-20),life:0.7,col:'#8ba36a',s:rnd(2,4)});
  }
}
function hitPea(p){
  for(var i=0;i<G.zoms.length;i++){
    var z=G.zoms[i]; if(z.dead||z.row!==p.row)continue;
    if(p.x>z.x-26&&p.x<z.x+26&&z.x<LW+40){damageZom(z,p.dmg);if(p.slow)z.slow=Math.max(z.slow,4);
      sfx('hit');
      G.fx.push({k:'splat',x:p.x,y:p.y,life:0.18,max:0.18,r:10});return true}
  }
  return false
}
function explode(x,y,rad,dmg){
  sfx('boom'); G.fx.push({k:'boom',x:x,y:y,life:0.5,max:0.5,r:rad});
  for(var i=0;i<14;i++)G.fx.push({k:'bit',x:x,y:y,vx:rnd(-190,190),vy:rnd(-190,60),life:0.6,col:pk(['#ffb43a','#e2543f','#ffe08a']),s:rnd(2,5)});
  for(var j=0;j<G.zoms.length;j++){var z=G.zoms[j];if(z.dead)continue;
    if(Math.abs(z.row*CH+CH/2-y)<rad&&Math.abs(z.x-x)<rad)damageZom(z,dmg)}
}
function burnRow(r){
  var y=r*CH+CH/2; sfx('boom');
  G.fx.push({k:'fire',row:r,life:0.7,max:0.7});
  for(var j=0;j<G.zoms.length;j++){var z=G.zoms[j];if(!z.dead&&z.row===r)damageZom(z,1800)}
  for(var i=0;i<12;i++)G.fx.push({k:'bit',x:rnd(GX,LW),y:y+rnd(-30,30),vx:rnd(-60,60),vy:rnd(-140,-30),life:0.6,col:pk(['#ffb43a','#ff6a2a']),s:rnd(2,4)});
}
function tryPlant(r,c){
  if(!G.sel){toast('Pilih tanaman dulu di bar atas');sfx('nope');return}
  var def=PLANTS[G.sel];
  if((G.cd[G.sel]||0)>0){toast(def.n+' masih mendingin');sfx('nope');return}
  if(G.sun<def.cost){toast('Matahari kurang '+(def.cost-G.sun));sfx('nope');return}
  /* Batu nisan menghalangi petak (bongkar pakai sekop), KECUALI Grave Buster:
     di PVZ asli Grave Buster memang ditanam tepat di atas batu nisannya. */
  if(nisanAt(r,c)&&G.sel!=='gravebuster'){toast('Ada batu nisan — pakai sekop atau Grave Buster');sfx('nope');return}
  if(G.sel==='gravebuster'&&!nisanAt(r,c)){toast('Grave Buster hanya bisa di atas batu nisan');sfx('nope');return}
  var air=isAir(r), pad=lilin(r,c), ada=tanamAt(r,c);
  if(G.sel==='lilypad'){
    if(!air){toast('Lily Pad hanya bisa di petak air');sfx('nope');return}
    if(pad){toast('Sudah ada Lily Pad di situ');sfx('nope');return}
  } else if(air){
    if(!pad){toast('Petak air — tanam Lily Pad dulu');sfx('nope');return}
    if(ada){toast('Petak itu sudah ada tanaman');sfx('nope');return}
  } else if(ada){toast('Petak itu sudah ada tanaman');sfx('nope');return}
  /* pop = animasi muncul dari kecil lalu membal (seperti tanam di PVZ asli) */
  var p={type:G.sel,r:r,c:c,hp:def.hp,max:def.hp,t:0,cool:0.4,fuse:0,ph:rnd(0,1),sway:0,pop:0.5,kick:0};
  if(G.sel==='cherrybomb')p.fuse=1.0;
  if(G.sel==='jalapeno')p.fuse=0.7;
  G.plants.push(p); G.sun-=def.cost; G.cd[G.sel]=def.cd; G.planted++; sfx('plant');
  /* tanah beterbangan saat menanam */
  var pc=cxy(r,c);
  for(var dp=0;dp<7;dp++)G.fx.push({k:'bit',x:pc.x+rnd(-18,18),y:pc.y+CH/2-8,vx:rnd(-70,70),vy:rnd(-150,-40),life:rnd(0.4,0.7),col:pk(['#8a6540','#6b4a28','#a5854f']),s:rnd(2,4)});
  if(G.sel!=='wallnut'){G.sel=null}else{G.sel=null}
  syncUI(true);
}
function digPlant(r,c){
  /* sekop juga berguna untuk membongkar batu nisan */
  var n=nisanAt(r,c);
  if(n){G.nisan.splice(G.nisan.indexOf(n),1);sfx('boom');
    for(var i=0;i<12;i++)G.fx.push({k:'bit',x:GX+c*CW+CW/2+rnd(-16,16),y:r*CH+CH-30,vx:rnd(-120,120),vy:rnd(-170,-40),life:rnd(0.4,0.8),col:pk(['#9aa0a6','#6d7378','#b9bcc0']),s:rnd(2,5)});
    toast('Batu nisan dibongkar');G.shovel=false;syncUI(true);return}
  var p=tanamAt(r,c)||lilin(r,c);
  if(!p){toast('Tidak ada tanaman di petak itu');sfx('nope');return}
  G.plants.splice(G.plants.indexOf(p),1);sfx('dig');toast(p.type==='lilypad'?'Lily Pad diangkat':'Dicabut');G.shovel=false;syncUI(true)
}
function collectSun(s){
  if(s.got)return; s.got=true; s.fly=0.42; G.sun+=s.v; sfx('sun');
  for(var i=0;i<6;i++)G.fx.push({k:'bit',x:s.x,y:s.y,vx:rnd(-45,45),vy:rnd(-80,-10),life:0.45,col:'#ffe08a',s:2.4});
  G.fx.push({k:'text',txt:'+'+s.v,x:s.x,y:s.y-26,life:0.75,max:0.75});
  var el=$('sunVal'); if(el&&el.parentElement){el.parentElement.classList.remove('pulse');void el.offsetWidth;el.parentElement.classList.add('pulse')}
  syncUI(true);
}
function addSun(x,y,v,fromTop){
  var ty=rnd(CH*0.6,LH-CH*0.6);
  G.suns.push({x:x,y:fromTop?-40:y,ty:ty,v:v,life:13,ph:rnd(0,9),got:false,fly:0,sc:fromTop?1:0.2});
}

/* ---------- perbarui ---------- */
function update(dt){
  G.t+=dt; music(dt);
  if(G.state!=='playing')return;
  /* matahari dari langit */
  /* Siklus siang→malam: mengikuti kemajuan gelombang (makin sore makin gelap). */
  var cfg=G.cfg||LEVELS[1];
  if(G.mode==='endless')G.gelap=clamp(cfg.gelap[0]+(1-Math.exp(-G.t/150))*(cfg.gelap[1]-cfg.gelap[0]),0,1);
  else if(G.waves.length)G.gelap=clamp(cfg.gelap[0]+(cfg.gelap[1]-cfg.gelap[0])*clamp((G.waveIdx+1)/G.waves.length,0,1),0,1);
  /* ---------- cuaca: cerah · angin · hujan ----------
     Cuaca bergeser sendiri makin lama makin sering ke ujung level (hujan), dan
     perubahannya halus: kekuatan angin/hujan naik-turun pelan, bukan langsung.
     Hujan butuh waktu datang, jadi terasa seperti cuaca sungguhan. */
  var cua=cfg.cuaca||['cerah','angin'];
  G.cuacaT-=dt;
  if(G.cuacaT<=0){
    G.cuacaT=rnd(16,26);
    var maju=G.waves.length?clamp((G.waveIdx+1)/G.waves.length,0,1):0.4;
    var baru=Math.random()<0.32+maju*0.42?cua[1]:cua[0];
    if(baru!==G.cuaca){
      G.cuaca=baru;
      toast(baru==='hujan'?'☔ Hujan turun — tanah jadi licin':(baru==='angin'?'🍃 Angin bertiup kencang':'☀️ Cuaca kembali cerah'));
    }
  }
  var tAngin=G.cuaca==='angin'?0.9:(G.cuaca==='hujan'?0.6:0.22);
  var tHujan=G.cuaca==='hujan'?1:0;
  G.angin+=(tAngin-G.angin)*Math.min(1,dt*0.55);
  G.hujan+=(tHujan-G.hujan)*Math.min(1,dt*0.5);
  /* Suara hujan: rintik lembut berulang (bukan satu suara panjang yang menumpuk) */
  if(G.hujan>0.28){
    G.hujanSfx-=dt;
    if(G.hujanSfx<=0){G.hujanSfx=rnd(0.4,0.66);noise(0.5,0.030*G.hujan,2600,1500)}
  }
  if(G.flash>0)G.flash=Math.max(0,G.flash-dt*1.7);
  /* Petir: hanya saat hujan turun dan langit sudah gelap */
  if(G.hujan>0.55&&G.gelap>0.3){
    G.petirT-=dt;
    if(G.petirT<=0){G.petirT=rnd(16,34);G.flash=0.42;sfx('petir')}
  }
  /* Angin menerbangkan daun melintasi halaman */
  if(G.angin>0.5&&Math.random()<dt*1.5)G.fx.push({k:'leaf',x:LW+16,y:rnd(24,LH-24),vx:-rnd(120,240)*G.angin,vy:rnd(-16,16),life:rnd(1.7,2.7),max:2.7,col:pk(['#a9e56c','#7fbf3e','#d8c071','#c6e08a']),s:rnd(5,7.5),rot:rnd(0,TAU),rv:rnd(-5,5)});
  /* Matahari dari langit: makin malam makin jarang turun (level malam paling jarang). */
  G.sunT-=dt;
  if(G.sunT<=0){
    var laju=clamp((cfg.langit||1)*(1-G.gelap*0.55),0,1);
    G.sunT=clamp(rnd(4.6,6.8)/Math.max(0.22,laju),3,40);
    if(laju>0.05)addSun(rnd(GX+40,LW-40),0,pk(DROP),true);
  }
  /* Batu nisan melahirkan zombie dari dalam tanah */
  for(var ni=0;ni<G.nisan.length;ni++){
    var ns=G.nisan[ni];
    ns.t-=dt;
    if(ns.t<=0){
      ns.t=rnd(17,26);
      if(G.zoms.length<14){
        spawnZombie('normal',ns.r);
        var nz=G.zoms[G.zoms.length-1]; nz.x=GX+ns.c*CW+CW/2; nz.dariNisan=true;
        sfx('groan'); toast('Batu nisan membuka — ada zombie keluar!');
        for(var nb=0;nb<14;nb++)G.fx.push({k:'bit',x:nz.x+rnd(-18,18),y:ns.r*CH+CH-10,vx:rnd(-90,90),vy:rnd(-190,-60),life:rnd(0.4,0.8),col:pk(['#6b5a3a','#8a7a52','#3f3a2a']),s:rnd(2,4)});
      }
    }
  }
  /* antrean zombie gelombang */
  for(var qi=0;qi<G.queue.length;qi++)G.queue[qi].t-=dt;
  while(G.queue.length&&G.queue[0].t<=0){var q=G.queue.shift();spawnZombie(q.type,q.row)}
  G.waveT+=dt;
  if(!G.queue.length){
    var sisa=G.zoms.length;
    if(G.nextT>0){G.nextT-=dt; if(G.nextT<=0&&(sisa<=2||G.waveT>22)){G.nextT=0;nextWave()}}
    else if(sisa===0||G.waveT>26){G.nextT=2.2}
  }
  /* tanaman */
  for(var i=G.plants.length-1;i>=0;i--){
    var p=G.plants[i],d=PLANTS[p.type];
    p.t+=dt; if(p.sway>0)p.sway-=dt; if(p.pop>0)p.pop-=dt;
    if(p.type==='sunflower'){
      if(p.t>=12){p.t=0;addSun(cxy(p.r,p.c).x,cxy(p.r,p.c).y-18,25,false)}
    } else if(p.type==='sunshroom'){
      /* Sun-shroom: kecil dulu (15 matahari), setelah dewasa jadi 25 */
      p.prod=(p.prod||0)+dt;
      if(p.prod>=12){p.prod=0;addSun(cxy(p.r,p.c).x,cxy(p.r,p.c).y-18,p.t>=45?25:15,false)}
    } else if(p.type==='peashooter'||p.type==='snowpea'||p.type==='repeater'||p.type==='puffshroom'){
      var spora=(p.type==='puffshroom');
      /* Puff-shroom hanya menjangkau sekitar 4,5 petak ke depan (khas PVZ) */
      var jangkau=spora?cxy(p.r,p.c).x+4.6*CW:LW+40;
      var ada=false;
      for(var zi=0;zi<G.zoms.length;zi++){var zz=G.zoms[zi];if(!zz.dead&&zz.row===p.r&&zz.x>cxy(p.r,p.c).x-14&&zz.x<jangkau){ada=true;break}}
      p.cool-=dt; if(p.kick>0)p.kick-=dt;
      if(ada&&p.cool<=0){
        p.cool=p.type==='repeater'?JEDA_REP:(spora?1.6:JEDA); p.kick=0.16;
        var sh=cxy(p.r,p.c);
        G.peas.push({x:sh.x+30,y:sh.y-32,row:p.r,dmg:spora?24:PEA,slow:p.type==='snowpea',spora:spora});
        /* Repeater: dua kacang sekaligus (dulu kacang kedua digantung pada umur
           kacang pertama, jadi hilang begitu kacang pertama kena zombie). */
        if(p.type==='repeater')G.peas.push({x:sh.x+14,y:sh.y-32,row:p.r,dmg:PEA,slow:false});
        sfx(spora?'puff':(p.type==='snowpea'?'snow':'shoot'));
      }
    } else if(p.type==='gravebuster'){
      p.makan=(p.makan||0)+dt; if(p.kick>0)p.kick-=dt;
      if(p.makan>=4.5){
        var nn=nisanAt(p.r,p.c);
        if(nn){G.nisan.splice(G.nisan.indexOf(nn),1);sfx('boom');
          for(var gb2=0;gb2<16;gb2++)G.fx.push({k:'bit',x:GX+p.c*CW+CW/2+rnd(-20,20),y:p.r*CH+CH-26,vx:rnd(-140,140),vy:rnd(-190,-40),life:rnd(0.4,0.9),col:pk(['#9aa0a6','#6d7378','#4f7a2a']),s:rnd(2,5)});
          toast('Batu nisan hancur!');}
        G.plants.splice(i,1);
      }
    } else if(p.type==='potatomine'){
      if(p.t>=14){
        for(var zj=0;zj<G.zoms.length;zj++){var z2=G.zoms[zj];if(!z2.dead&&z2.row===p.r&&Math.abs(z2.x-cxy(p.r,p.c).x)<48){explode(cxy(p.r,p.c).x,cxy(p.r,p.c).y,86,1800);G.plants.splice(i,1);break}}
      }
    } else if(p.type==='cherrybomb'||p.type==='jalapeno'){
      p.hp=9999;
      if(p.fuse>0){p.fuse-=dt}
      else if(p.type==='cherrybomb'){explode(cxy(p.r,p.c).x,cxy(p.r,p.c).y,168,1800);G.plants.splice(i,1)}
      else{burnRow(p.r);G.plants.splice(i,1)}
    }
  }
  /* kacang */
  for(var pi=G.peas.length-1;pi>=0;pi--){
    var pe=G.peas[pi]; pe.x+=(pe.spora?270:KECEPAT_KACANG)*dt;
    if(hitPea(pe)||pe.x>LW+30)G.peas.splice(pi,1);
  }
  /* zombie */
  for(var k=G.zoms.length-1;k>=0;k--){
    var z=G.zoms[k];
    if(z.dead){G.zoms.splice(k,1);continue}
    if(z.slow>0)z.slow-=dt;
    var sp=z.speed*(z.slow>0?0.45:1);
    var target=null,best=1e9;
    /* zombie menggerogoti tanaman; Lily Pad diabaikan (digigit belakangan) */
    for(var m=0;m<G.plants.length;m++){var pl=G.plants[m];if(pl.r!==z.row||pl.type==='lilypad')continue;var dx=z.x-(GX+pl.c*CW+CW/2);if(dx>-6&&dx<52&&dx<best){best=dx;target=pl}}
    if(target){
      z.eat+=dt; if((z.eat%0.55)<dt)sfx('eat');
      target.hp-=110*dt; target.sway=0.3;
      if(z.eat>0.2&&Math.random()<dt*6)G.fx.push({k:'bit',x:z.x-14,y:z.row*CH+CH-46,vx:rnd(-30,10),vy:rnd(-70,-10),life:0.5,col:'#8ed14c',s:2});
      if(target.hp<=0){G.plants.splice(G.plants.indexOf(target),1);G.fx.push({k:'puff',x:GX+target.c*CW+CW/2,y:z.row*CH+CH-40,life:0.4,max:0.4,r:26})}
    } else {
      z.eat=0; z.x-=sp*dt;
      /* debu kecil setiap langkah kaki */
      z.stept=(z.stept||0)-dt;
      if(z.stept<=0){z.stept=rnd(0.52,0.78);G.fx.push({k:'dust',x:z.x+10,y:z.row*CH+CH-7,life:0.55,max:0.55,r:9})}
    }
    if(z.x<=GX+10&&G.mowers[z.row]){
      G.mowers[z.row]=false; G.mowX[z.row]=GX-30; G.mowerUsed++; sfx('mow'); toast('Mesin potong jalan di baris '+(z.row+1));
    }
    if(z.x<=34&&!G.mowers[z.row]&&G.mowX[z.row]<=0){finishLose();return}
  }
  /* mesin pemotong */
  for(var mr=0;mr<ROWS;mr++){
    if(G.mowX[mr]>GX-30){
      G.mowX[mr]+=560*dt;
      for(var mz=0;mz<G.zoms.length;mz++){var zm=G.zoms[mz];if(!zm.dead&&zm.row===mr&&Math.abs(zm.x-G.mowX[mr])<70)damageZom(zm,1800)}
      if(Math.random()<dt*14)G.fx.push({k:'bit',x:G.mowX[mr],y:mr*CH+CH-16,vx:rnd(-40,40),vy:rnd(-60,-10),life:0.4,col:'#cfe6a8',s:2});
    }
  }
  /* matahari jatuh */
  for(var si=G.suns.length-1;si>=0;si--){
    var s=G.suns[si];
    if(s.fly>0){s.fly-=dt;s.sc=Math.max(0.2,s.sc*0.86);s.x+=(GX/2-s.x)*Math.min(1,dt*6);s.y+=(26-s.y)*Math.min(1,dt*6)}
    else{
      s.sc=Math.min(1,s.sc+dt*3);
      if(s.y<s.ty)s.y+=46*dt; else {
        s.ph+=dt; s.y+=Math.sin(s.ph*2)*0.45; s.land=(s.land||0)+dt;
        /* auto-kumpul (bawaan nyala): matahari dijemput sendiri setelah mendarat */
        if(G.auto&&s.land>0.35)collectSun(s);
      }
      if(!s.got)s.life-=dt;
    }
    if(s.got&&s.fly<=0)G.suns.splice(si,1);
    else if(!s.got&&s.life<=0)G.suns.splice(si,1);
  }
  /* efek */
  for(var fi=G.fx.length-1;fi>=0;fi--){
    var f=G.fx[fi]; f.life-=dt;
    if(f.k==='bit'){f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=420*dt}
    else if(f.k==='leaf'){f.x+=f.vx*dt;f.y+=f.vy*dt+Math.sin(f.life*5+f.s)*24*dt;f.rot+=f.rv*dt}
    if(f.life<=0)G.fx.splice(fi,1);
  }
  /* mayat: rotasi jatuh lalu memudar */
  for(var ci2=G.corpses.length-1;ci2>=0;ci2--){G.corpses[ci2].t+=dt; if(G.corpses[ci2].t>1.75)G.corpses.splice(ci2,1)}
  /* pendinginan kartu */
  for(var key in G.cd)if(G.cd[key]>0)G.cd[key]=Math.max(0,G.cd[key]-dt);
  /* geraman latar: sesekali terdengar dari kerumunan zombie (suasana PVZ) */
  if(G.zoms.length&&Math.random()<dt*0.10)sfx('groan');
  /* menang? */
  if(G.mode!=='endless'&&G.waveIdx>=G.waves.length-1&&!G.queue.length&&!G.zoms.length&&G.plants.length>=0)finishWin();
  else if(G.mode==='endless'&&G.waveIdx>=0)G.survived=G.waveIdx+1;
}
/* ---------- gambar layar ---------- */
var uiSun=-1, uiWave='';
function draw(){
  cx.setTransform(SS,0,0,SS,0,0);
  cx.drawImage(ART.lawn,0,0,LW,LH);
  /* Hiasan suasana (awan & butiran debu) hanya di mode HD: di mode hemat
     (HP lambat) bagian ini dilewati supaya kecepatan tidak ikut turun. */
  if(SS>2){
    var awx=((G.t*13)%(LW+520))-260;
    var cg=cx.createRadialGradient(awx,LH*0.42,6,awx,LH*0.42,110);
    cg.addColorStop(0,'#0b1c041f'); cg.addColorStop(1,'#0b1c0400');
    cx.fillStyle=cg; cx.beginPath(); cx.ellipse(awx,LH*0.42,110,72,0,0,TAU); cx.fill();
    cx.fillStyle='rgba(255,246,203,.26)';
    for(var dm=0;dm<8;dm++){
      var mx2=GX+80+((dm*137.5+G.t*11)%(LW-GX-120));
      var my2=((dm*97.3+G.t*7.5)%LH);
      cx.beginPath(); cx.arc(mx2,my2,1.5+((dm%3)*0.55),0,TAU); cx.fill();
    }
  }
  /* mesin pemotong */
  for(var r=0;r<ROWS;r++){
    if(G.mowers[r])cx.drawImage(ART.mower,GX/2-52,r*CH+CH-82,104,82);
    else if(G.mowX[r]>GX-30)cx.drawImage(ART.mower,G.mowX[r]-52,r*CH+CH-82,104,82);
  }
  /* batu nisan (paling belakang) */
  for(var ni2=0;ni2<G.nisan.length;ni2++){
    var nss=G.nisan[ni2],nbb=cxy(nss.r,nss.c);
    var skala=0.95+Math.sin(G.t*1.6+nss.r+nss.c)*0.01;
    cx.fillStyle='rgba(6,10,20,.30)';
    cx.beginPath(); cx.ellipse(nbb.x+8,nbb.y+CH/2-8,30*skala,9,0,0,TAU); cx.fill();
    cx.drawImage(ART.nisan,nbb.x-55*skala,nbb.y+CH/2-4-132*skala,110*skala,132*skala);
    /* saat mau melahirkan zombie, tanahnya bergetar */
    if(nss.t<1.6&&Math.floor(nss.t*12)%2===0){cx.fillStyle='rgba(120,90,40,.35)';cx.beginPath();cx.ellipse(nbb.x,nbb.y+CH/2-8,34,11,0,0,TAU);cx.fill()}
  }
  /* daun teratai lebih dulu (alas di petak air) */
  cx.imageSmoothingQuality='high';
  for(var li=0;li<G.plants.length;li++){
    var lp=G.plants[li]; if(lp.type!=='lilypad')continue;
    var lb=cxy(lp.r,lp.c),LPL=ART.plants.lilypad;
    var lbob=Math.sin(G.t*1.5+lp.ph*5)*1.2+(lp.sway>0?Math.sin(G.t*26)*1.2:0);
    cx.drawImage(LPL.frames[0],lb.x-LPL.w*0.5,lb.y+CH/2-4-LPL.h+lbob,LPL.w,LPL.h);
  }
  /* tanaman */
  for(var i=0;i<G.plants.length;i++){
    var p=G.plants[i],pb=cxy(p.r,p.c),PL=ART.plants[p.type];
    if(p.type==='lilypad')continue;
    var fr=Math.floor(((G.t*2.2+p.ph*3)%2+2)%2);
    var bob=Math.sin(G.t*2.4+p.ph*6)*1.8+(p.sway>0?Math.sin(G.t*30)*1.8:0);
    var low=p.hp<p.max*0.42, sc=1;
    if((p.type==='cherrybomb'||p.type==='jalapeno')&&p.fuse<=0.45)sc=1+(0.45-p.fuse)*1.1;
    /* animasi tanam: muncul dari kecil lalu membal ke ukuran penuh */
    var pop=p.pop>0?p.pop/0.5:0;
    if(pop>0)sc*=1-0.42*pop+0.34*Math.sin(pop*Math.PI);
    /* tendangan mundur saat menembak (peashooter/snowpea/repeater) */
    var tendang=p.kick>0?(p.kick/0.16)*4.5:0;
    var dasar=pb.y+CH/2-4;
    /* bayangan lembut di tanah, bergeser ke kanan karena matahari di kiri-atas */
    cx.fillStyle='rgba(18,38,6,.22)';
    cx.beginPath(); cx.ellipse(pb.x+PL.w*0.09,dasar-7,PL.w*0.40,PL.w*0.125,0,0,TAU); cx.fill();
    cx.save();
    if(low)cx.globalAlpha=0.6;
    /* angin: tanaman ikut miring mengikuti kekuatan angin (makin kencang makin oleng) */
    var tilt=Math.sin(G.t*2.6+p.ph*3)*(0.008+0.05*(G.angin||0));
    cx.translate(pb.x,dasar); cx.rotate(tilt); cx.translate(-pb.x,-dasar);
    cx.drawImage(PL.frames[fr],pb.x-PL.w*sc/2-tendang,dasar-PL.h*sc+bob,PL.w*sc,PL.h*sc);
    cx.restore();
    if(low){cx.fillStyle='rgba(70,20,10,.22)';cx.fillRect(pb.x-PL.w*0.33,dasar-PL.h*0.72,PL.w*0.66,PL.h*0.6)}
    if(p.type==='wallnut'&&low){cx.strokeStyle='#7a4a12';cx.lineWidth=2.6;cx.beginPath();cx.moveTo(pb.x-10,dasar-PL.h*0.62);cx.lineTo(pb.x-2,dasar-PL.h*0.44);cx.lineTo(pb.x-14,dasar-PL.h*0.3);cx.stroke()}
  }
  /* kacang */
  for(var j=0;j<G.peas.length;j++){
    var pe=G.peas[j];
    /* spora Puff-shroom: gumpalan berbulu, bukan kacang */
    if(pe.spora){
      cx.fillStyle='rgba(222,240,204,.26)';
      cx.beginPath(); cx.ellipse(pe.x-9,pe.y,7.5,5,0,0,TAU); cx.fill();
      cx.drawImage(ART.spora,pe.x-14,pe.y-14,28,28);
      continue;
    }
    /* jejak gerak: kacang tampak melesat, bukan teleport tiap frame */
    cx.fillStyle=pe.slow?'rgba(150,226,250,.22)':'rgba(122,214,74,.20)';
    cx.beginPath(); cx.ellipse(pe.x-15,pe.y,8.5,4.6,0,0,TAU); cx.fill();
    cx.fillStyle=pe.slow?'rgba(200,244,255,.30)':'rgba(178,240,130,.28)';
    cx.beginPath(); cx.ellipse(pe.x-7,pe.y,5.5,3.6,0,0,TAU); cx.fill();
    cx.drawImage(pe.slow?ART.snow:ART.pea,pe.x-15,pe.y-15,30,30);
  }
  /* mayat yang sedang jatuh (digambar sebelum zombie hidup supaya di belakang) */
  for(var ci=0;ci<G.corpses.length;ci++){
    var co=G.corpses[ci],ZC=ART.zom[co.type],feetc=co.row*CH+CH-6;
    var kk=Math.min(1,co.t/0.55), jatuh=kk*kk*(3-2*kk)*1.45;   /* mulus lalu cepat */
    cx.save();
    cx.globalAlpha=co.t>1.2?Math.max(0,1-(co.t-1.2)/0.55):1;
    cx.translate(co.x,feetc); cx.rotate(jatuh);
    cx.drawImage(ZC.frames[0],-ZC.w/2,-ZC.h,ZC.w,ZC.h);
    cx.restore();
  }
  /* zombie (yang jauh digambar dulu) */
  var zs=G.zoms.slice().sort(function(a,b){return a.row-b.row||b.x-a.x});
  for(var k=0;k<zs.length;k++){
    var z=zs[k],feet=z.row*CH+CH-6,ZI=ART.zom[z.type];
    /* di petak air: zombie mengarungi air, ada cipratan di kakinya */
    if(isAir(z.row)){
      cx.fillStyle='rgba(190,232,248,.34)';
      cx.beginPath(); cx.ellipse(z.x,feet-2,ZI.w*0.30,8,0,0,TAU); cx.fill();
      cx.fillStyle='rgba(255,255,255,.30)';
      cx.beginPath(); cx.ellipse(z.x-4,feet-6,ZI.w*0.17,5,0,0,TAU); cx.fill();
    }
    var frame=z.eat>0?(Math.floor(G.t*9)%2?2:3):Math.floor(G.t*3.4+z.seed*4)%4;
    /* animasi jalan: badan naik-turun mengikuti langkah; saat menggerogoti,
       badan menyodok maju lalu menggigit turun (seperti PVZ asli). */
    var langkah=Math.abs(Math.sin(G.t*3.4+z.seed*3))*2.6;
    var sodok=z.eat>0?Math.sin(G.t*8.5)*4.2:0;
    var gigit=z.eat>0?Math.max(0,Math.sin(G.t*8.5))*3.2:0;
    cx.fillStyle='rgba(0,0,0,.22)';cx.beginPath();cx.ellipse(z.x,feet-3,ZI.w*0.21,ZI.w*0.055,0,0,TAU);cx.fill();
    /* angin: zombie oleng sedikit HANYA saat angin benar-benar kencang.
       Memutar gambar besar lebih mahal daripada menggambar lurus, jadi ambangnya
       ditaruh tinggi supaya HP lambat tidak membayar terus-menerus. */
    cx.save();
    if((G.angin||0)>0.55){cx.translate(z.x,feet);cx.rotate(Math.sin(G.t*2.1+z.seed*4)*0.012-0.03);cx.translate(-z.x,-feet)}
    cx.drawImage(ZI.frames[frame],z.x-ZI.w/2+sodok,feet-ZI.h-langkah+gigit,ZI.w,ZI.h);
    cx.restore();
    /* malam: mata zombie menyala hijau redup */
    if((G.gelap||0)>0.55){
      var zs2=z.type==='garga'?1.2:1, zz2=z.type==='garga'?1.05:1.16;
      cx.fillStyle='rgba(180,255,130,'+(0.30+0.35*(G.gelap||0))+')';
      cx.beginPath(); cx.arc(z.x-9*zs2*zz2,feet-langkah+gigit-106*zs2*zz2,3.1,0,TAU); cx.fill();
      cx.beginPath(); cx.arc(z.x-22*zs2*zz2,feet-langkah+gigit-104*zs2*zz2,2.5,0,TAU); cx.fill();
    }
    if(z.slow>0){cx.fillStyle='rgba(120,214,240,.32)';rr(cx,z.x-ZI.w*0.23,feet-ZI.h*0.86,ZI.w*0.46,ZI.h*0.84,16);cx.fill();
      cx.fillStyle='rgba(255,255,255,.5)';for(var ic=0;ic<4;ic++){circ(cx,z.x-ZI.w*0.2+ic*ZI.w*0.13,feet-ZI.h*0.5-((ic%2)*22),2.6,'rgba(255,255,255,.5)')}}
    if(z.hp<z.max*0.5){cx.fillStyle='rgba(130,20,14,.3)';cx.beginPath();cx.ellipse(z.x-ZI.w*0.05,feet-ZI.h*0.38,ZI.w*0.11,ZI.h*0.06,0,0,TAU);cx.fill()}
    if(z.hp<z.max*0.94&&z.type!=='normal'){cx.fillStyle='rgba(0,0,0,.16)';cx.fillRect(z.x-ZI.w*0.18,feet-ZI.h*0.78,ZI.w*0.36,7)}
  }
  /* efek */
  for(var f=0;f<G.fx.length;f++){
    var e=G.fx[f],al=Math.max(0,e.life/(e.max||1));
    if(e.k==='text'){cx.globalAlpha=Math.min(1,al*1.6);cx.font='900 26px system-ui';cx.textAlign='center';cx.lineWidth=5;cx.strokeStyle='#5a3a06';cx.strokeText(e.txt,e.x,e.y);cx.fillStyle='#ffe469';cx.fillText(e.txt,e.x,e.y);cx.globalAlpha=1;cx.textAlign='left'}
    else if(e.k==='boom'){var rr2=e.r*(1.15-al*0.55);cx.strokeStyle='rgba(255,196,80,'+al+')';cx.lineWidth=6*al+2;cx.beginPath();cx.arc(e.x,e.y,rr2,0,TAU);cx.stroke();cx.fillStyle='rgba(255,120,40,'+(al*0.5)+')';cx.beginPath();cx.arc(e.x,e.y,rr2*0.8,0,TAU);cx.fill()}
    else if(e.k==='puff'){cx.fillStyle='rgba(150,170,120,'+(al*0.5)+')';cx.beginPath();cx.arc(e.x,e.y,e.r*(1.3-al*0.3),0,TAU);cx.fill()}
    else if(e.k==='splat'){cx.fillStyle='rgba(140,225,90,'+(al*0.9)+')';cx.beginPath();cx.arc(e.x,e.y,e.r,0,TAU);cx.fill()}
    else if(e.k==='fire'){var fy=e.row*CH;
      var gr=cx.createLinearGradient(GX,fy,LW,fy+CH);gr.addColorStop(0,'rgba(255,90,20,'+(al*0.5)+')');gr.addColorStop(0.5,'rgba(255,180,60,'+(al*0.75)+')');gr.addColorStop(1,'rgba(255,60,10,'+(al*0.4)+')');
      cx.fillStyle=gr;cx.fillRect(GX,fy,LW-GX,CH)}
    else if(e.k==='bit'){cx.fillStyle=e.col;cx.globalAlpha=al;cx.fillRect(e.x,e.y,e.s,e.s);cx.globalAlpha=1}
    else if(e.k==='dust'){cx.fillStyle='rgba(214,204,158,'+(al*0.42)+')';cx.beginPath();cx.ellipse(e.x-(1-al)*12,e.y,e.r*(1.5-al*0.6),e.r*(0.6-al*0.2),0,0,TAU);cx.fill()}
    else if(e.k==='leaf'){cx.save();cx.globalAlpha=Math.min(1,al*1.5);cx.translate(e.x,e.y);cx.rotate(e.rot);
      ell(cx,0,0,e.s,e.s*0.42,e.col,-0.3);cx.strokeStyle='#3f6d1f66';cx.lineWidth=1.2;cx.beginPath();cx.moveTo(-e.s*0.85,0);cx.lineTo(e.s*0.85,0);cx.stroke();cx.restore()}
  }
  /* matahari */
  for(var s=0;s<G.suns.length;s++){
    var su=G.suns[s],sc=Math.max(0.2,su.sc);
    if(!su.got&&su.life<3.4)cx.globalAlpha=0.35+0.65*Math.abs(Math.sin(G.t*6));
    cx.drawImage(ART.sun,su.x-38*sc,su.y-38*sc,76*sc,76*sc);
    cx.globalAlpha=1;
    if(G.auto&&!su.got){cx.strokeStyle='rgba(255,255,255,.5)';cx.lineWidth=2;cx.beginPath();cx.arc(su.x,su.y,40*sc,0,TAU);cx.stroke()}
  }
  /* bingkai petak terakhir yang disentuh (biar jelas mau menanam di mana) */
  if(G.lastCell){cx.strokeStyle='rgba(255,242,176,.6)';cx.lineWidth=3;cx.strokeRect(GX+G.lastCell.c*CW+3,G.lastCell.r*CH+3,CW-6,CH-6)}
  /* ---------- cahaya waktu: siang → sore → malam ---------- */
  var gl=G.gelap||0;
  if(gl>0.03){
    /* jendela rumah menyala lebih terang saat gelap */
    var wgl=cx.createRadialGradient(48,112,4,48,112,86);
    wgl.addColorStop(0,'rgba(255,214,140,'+(0.42*gl)+')');
    wgl.addColorStop(0.45,'rgba(255,176,70,'+(0.16*gl)+')');
    wgl.addColorStop(1,'rgba(255,150,40,0)');
    cx.fillStyle=wgl; cx.fillRect(0,20,200,220);
    /* kunang-kunang saat benar-benar gelap */
    if(gl>0.5){
      for(var ff=0;ff<10;ff++){
        var fx2=GX+40+((ff*173.7+G.t*7)%(LW-GX-90));
        var fy2=40+((ff*121.3+Math.sin(G.t*0.7+ff)*60)%(LH-70));
        var blink=0.35+0.65*Math.abs(Math.sin(G.t*1.7+ff*2.1));
        cx.fillStyle='rgba(206,255,140,'+(gl*0.55*blink)+')';
        cx.beginPath(); cx.arc(fx2,fy2,2.6,0,TAU); cx.fill();
        cx.fillStyle='rgba(255,255,190,'+(gl*0.20*blink)+')';
        cx.beginPath(); cx.arc(fx2,fy2,7.5,0,TAU); cx.fill();
      }
    }
    /* Warna waktu dipakai dengan mode "multiply": sore menghangatkan, malam
       benar-benar meredupkan dan membirukan (bukan cuma ditimpa warna terang). */
    var K=[[0,255,244,214],[0.40,255,206,150],[0.68,176,150,192],[1,96,116,178]];
    var aa=K[0],bb=K[K.length-1];
    for(var ci3=0;ci3<K.length-1;ci3++){if(gl>=K[ci3][0]&&gl<=K[ci3+1][0]){aa=K[ci3];bb=K[ci3+1];break}}
    var f2=(bb[0]-aa[0])===0?0:(gl-aa[0])/(bb[0]-aa[0]);
    var cr=Math.round(aa[1]+(bb[1]-aa[1])*f2), cg2=Math.round(aa[2]+(bb[2]-aa[2])*f2), cb=Math.round(aa[3]+(bb[3]-aa[3])*f2);
    var pm=(cr+','+cg2+','+cb);
    if(pm!==warnaTerakhir){
      warnaTerakhir=pm;
      gradWaktu=cx.createLinearGradient(GX,0,GX+LW,LH);
      gradWaktu.addColorStop(0,'rgb('+Math.min(255,cr+14)+','+Math.min(255,cg2+12)+','+Math.min(255,cb+10)+')');
      gradWaktu.addColorStop(1,'rgb('+cr+','+cg2+','+cb+')');
    }
    cx.save();
    cx.globalCompositeOperation='multiply';
    cx.fillStyle=gradWaktu;
    cx.fillRect(GX,0,LW-GX,LH);
    cx.restore();
  }
  /* ---------- cuaca ---------- */
  if((G.hujan||0)>0.03)drawHujan(G.hujan);
  if((G.angin||0)>0.45&&SS>2){
    /* lapisan angin: garis halus melintang sebagai penanda tiupan */
    cx.strokeStyle='rgba(255,255,255,'+(0.05+0.06*G.angin)+')'; cx.lineWidth=1.4;
    for(var wi=0;wi<7;wi++){
      var wy=30+wi*74+Math.sin(G.t*0.9+wi)*8;
      var wx=GX+((G.t*180+wi*180)%(LW-GX))-40;
      cx.beginPath(); cx.moveTo(wx,wy); cx.quadraticCurveTo(wx+40,wy-4,wx+86,wy); cx.stroke();
    }
  }
  /* petir: kilatan singkat seisi layar */
  if((G.flash||0)>0){cx.fillStyle='rgba(255,252,232,'+(G.flash*0.5)+')';cx.fillRect(GX,0,LW-GX,LH)}
}
/* Hujan: garis air miring ke arah angin + percikan kecil di tanah. */
function drawHujan(k){
  var n=Math.floor((SS>2?110:58)*k), sl=26+22*k, slant=(12+30*(G.angin||0))*0.35;
  cx.strokeStyle='rgba(198,228,248,'+(0.24+0.18*k)+')';
  cx.lineWidth=1.6;
  cx.beginPath();
  for(var i=0;i<n;i++){
    var seed=i*97.13;
    var x=GX+((seed*7.3+G.t*(560+i*0.8))%(LW-GX+70))-35;
    var y=((seed*11.7+G.t*(760+i*1.4))%LH);
    cx.moveTo(x,y); cx.lineTo(x-slant,y+sl);
  }
  cx.stroke();
  for(var j=0;j<Math.floor(30*k);j++){
    var sx=GX+((j*211.7+G.t*63)%(LW-GX)), sy=((j*143.3+G.t*97)%LH);
    cx.strokeStyle='rgba(224,244,255,'+(0.22*k)+')'; cx.lineWidth=1.2;
    cx.beginPath(); cx.ellipse(sx,sy,7*k+3,2.4,0,0,TAU); cx.stroke();
  }
}

/* ---------- UI ---------- */
var CARDS={}, LV=1, MODE='level';
function drawSunIco(){var c=$('sunIco').getContext('2d');c.clearRect(0,0,48,48);c.drawImage(ART.sun,2,2,44,44)}
function buildBank(){
  var bank=$('bank'); bank.innerHTML=''; CARDS={};
  var daftar=orderLevel();
  bank.className='bank'+(daftar.length>10?' b6':(daftar.length>8?' b5':''));
  daftar.forEach(function(t){
    var d=PLANTS[t];
    var el=mk('div'); el.className='seed';
    /* Ikon kartu: kanvas 100x60 dengan tanaman diskalakan seragam, supaya
       gambarnya TIDAK gepeng seperti sebelumnya (dulu direntangkan ke 38px). */
    var ico=mk('canvas'); ico.width=100; ico.height=60; el.appendChild(ico);
    var cd=mk('div'); cd.className='cd'; el.appendChild(cd);
    var co=mk('div'); co.className='cost'; co.textContent=d.cost; el.appendChild(co);
    var g=ico.getContext('2d'); g.imageSmoothingQuality='high';
    g.drawImage(ART.plants[t].frames[0],(100-ART.plants[t].w*0.5)/2,0,ART.plants[t].w*0.5,60);
    el.addEventListener('pointerdown',function(ev){ev.preventDefault();ev.stopPropagation();
      if(G.state!=='playing'){toast('Tekan MULAI MAIN dulu');return}
      ensureAC();
      if((G.cd[t]||0)>0){toast(d.n+' masih mendingin');sfx('nope');return}
      if(G.sun<d.cost){toast('Matahari kurang '+(d.cost-G.sun)+' — ketuk matahari yang jatuh');sfx('nope');return}
      G.sel=(G.sel===t)?null:t; G.shovel=false; sfx('click'); syncUI(true);
    },{passive:false});
    bank.appendChild(el); CARDS[t]={el:el,cd:cd,cost:co,def:d};
  });
}
function buildLevels(){
  var list=$('lvList'); list.innerHTML='';
  var data=[
    {lv:1,mode:'level',t:LEVELS[1].nama,s:'8 gelombang · mulai sore',lock:false},
    {lv:2,mode:'level',t:LEVELS[2].nama,s:'10 gelombang · makin gelap',lock:!(SAVE.stars.l1>0)},
    {lv:3,mode:'level',t:LEVELS[3].nama,s:'12 gelombang + Gargantuar',lock:!(SAVE.stars.l2>0)},
    {lv:4,mode:'level',t:LEVELS[4].nama,s:'kolam · butuh Lily Pad',lock:!(SAVE.stars.l3>0)},
    {lv:5,mode:'level',t:LEVELS[5].nama,s:'batu nisan · langit jarang',lock:!(SAVE.stars.l4>0)},
    {lv:1,mode:'endless',t:'SURVIVAL',s:'tanpa akhir · rekor '+(SAVE.best||0),lock:!(SAVE.stars.l1>0)}
  ];
  data.forEach(function(it){
    var b=mk('button'); b.className='lvb'+(it.lock?' lock':'')+((SAVE.stars['l'+it.lv]&&it.mode==='level')?' done':'');
    var st=it.mode==='endless'?'♾':starStr(SAVE.stars['l'+it.lv]||0);
    b.innerHTML='<b>'+it.t+'</b><span>'+it.s+'</span><div class="st">'+st+'</div>';
    b.addEventListener('click',function(){ensureAC(); if(it.lock){toast('Selesaikan level sebelumnya dulu');sfx('nope');return} LV=it.lv; MODE=it.mode; startLevel(it.lv,it.mode)},false);
    list.appendChild(b);
  });
}
function starStr(n){var s='';for(var i=0;i<3;i++)s+=i<n?'★':'☆';return s}
function hideOv(id){$(id).classList.add('hide'); if(id==='ovStart')D.body.classList.remove('menu')}
function showOv(id){$(id).classList.remove('hide'); if(id==='ovStart')D.body.classList.add('menu')}
function syncUI(force){
  if(force||G.sun!==uiSun){uiSun=G.sun; $('sunVal').textContent=G.sun}
  for(var t in CARDS){
    var C=CARDS[t],rem=G.cd[t]||0,miskin=G.sun<C.def.cost,off=rem>0||miskin;
    C.el.classList.toggle('no',off);
    C.el.classList.toggle('sel',G.sel===t);
    C.cd.style.height=miskin?0:Math.round(clamp(rem/C.def.cd,0,1)*100)+'%';
  }
  $('bShovel').classList.toggle('on',G.shovel);
  /* keterangan kecil di samping matahari: apa yang sedang dipilih */
  var ku=$('bseck');
  if(ku){
    var hint;
    if(G.shovel)hint='Sekop aktif — ketuk tanaman untuk mencabutnya';
    else if(G.state!=='playing')hint='Pilih kartu tanaman, lalu ketuk rumput';
    else if(G.sel)hint='Siap menanam '+PLANTS[G.sel].n+' ('+PLANTS[G.sel].cost+') — ketuk rumput';
    else hint='Pilih kartu tanaman, lalu ketuk rumput';
    if(hint!==syncUI._hint){syncUI._hint=hint;ku.textContent=hint}
  }
  /* baris keterangan atas: level + waktu (siang/sore/senja/malam) */
  var sb=$('sub');
  if(sb){
    var gl2=G.gelap||0;
    var waktu=gl2<0.2?'☀️ siang':(gl2<0.5?'🌇 sore':(gl2<0.8?'🌆 senja':'🌙 malam'));
    var cu=(G.hujan||0)>0.45?' · 🌧 hujan':((G.angin||0)>0.55?' · 🍃 angin':'');
    var sbtxt=G.state==='menu'?'Nano Ai · pilih level di bawah':('Nano Ai · '+levelInfo(G.level).nama.split('· ')[1]+' · '+waktu+cu);
    if(sbtxt!==syncUI._sub){syncUI._sub=sbtxt;sb.textContent=sbtxt}
  }
  var txt,mode=G.mode;
  if(G.state==='menu')txt='SIAP MENANAM';
  else if(mode==='endless')txt='SURVIVAL · GELOMBANG '+(G.waveIdx+1)+(G.state==='playing'?'':' · selesai');
  else txt=(G.waveIdx<0?'READY... SET... PLANT!':'GELOMBANG '+(G.waveIdx+1)+' / '+G.waves.length);
  if(force||txt!==uiWave){uiWave=txt;$('waveTxt').textContent=txt}
  var frac=0;
  if(G.state!=='menu'){
    if(mode==='endless')frac=clamp((G.waveIdx+1-(G.planned?G.queue.length/G.planned:0))/8,0,1);
    else if(G.waves.length)frac=clamp((G.waveIdx+(G.planned?(G.planned-G.queue.length)/G.planned:0)+1)/G.waves.length,0,1);
  }
  $('waveFill').style.width=(G.state==='menu'?0:Math.round(frac*100))+'%';
  $('footR').textContent=(mode==='endless'?'Survival':('Level '+G.level))+(G.state==='playing'?' · tertahan '+G.killed+' zombie':'');
}
function showEnd(win){
  var t=$('endTitle'),x=$('endText');
  if(win){
    if(G.mode==='endless'){t.textContent='SURVIVAL: GELOMBANG '+(G.waveIdx+1);x.innerHTML='Rekor kamu: <b>'+(SAVE.best||0)+'</b> gelombang. Gila, bertahan selama itu!'}
    else{t.textContent='LEVEL SELESAI!';x.innerHTML=(G.level<5?'Level berikutnya menanti. ':'Kamu menyelesaikan seluruh halaman! ')+starStr(G.star)}
  } else {
    t.textContent='THE ZOMBIES ATE YOUR BRAINS!';
    x.innerHTML='Zombie menembus rumah di gelombang '+(G.waveIdx+1)+'. Coba tanam Wall-nut lebih awal dan pakai mesin potong untuk cadangan.';
  }
  $('endStats').innerHTML=
    '<div><b>'+(G.mode==='endless'?(G.waveIdx+1):G.killed)+'</b><span>'+(G.mode==='endless'?'gelombang':'zombie tumbang')+'</span></div>'+
    '<div><b>'+G.planted+'</b><span>tanaman ditanam</span></div>'+
    '<div><b>'+G.mowerUsed+'</b><span>mesin terpakai</span></div>';
  $('bNext').style.display=(win&&G.mode==='level'&&G.level<3)?'block':'none';
  showOv('ovEnd');
}
function pauseGame(){
  if(G.state!=='playing')return;
  G.state='paused';
  $('pauseStats').innerHTML=
    '<div><b>'+G.sun+'</b><span>matahari</span></div>'+
    '<div><b>'+(G.waveIdx+1)+(G.mode==='endless'?'':(' / '+G.waves.length))+'</b><span>gelombang</span></div>'+
    '<div><b>'+G.killed+'</b><span>zombie tumbang</span></div>';
  showOv('ovPause');
}
function resumeGame(){if(G.state!=='paused')return;G.state='playing';hideOv('ovPause')}
function toMenu(){G.state='menu';hideOv('ovPause');hideOv('ovEnd');buildLevels();showOv('ovStart');syncUI(true)}

/* ---------- masukannya ---------- */
function toLogic(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*LW,y:(e.clientY-r.top)/r.height*LH}}
cv.addEventListener('pointerdown',function(e){
  e.preventDefault(); e.stopPropagation(); ensureAC();
  if(G.state!=='playing')return;
  var p=toLogic(e);
  for(var i=G.suns.length-1;i>=0;i--){var s=G.suns[i];if(s.got)continue;if(Math.sqrt((p.x-s.x)*(p.x-s.x)+(p.y-s.y)*(p.y-s.y))<52){collectSun(s);return}}
  var cl=cellAt(p.x,p.y); if(!cl)return;
  G.lastCell=cl;
  if(G.shovel){digPlant(cl.r,cl.c);syncUI(true);return}
  tryPlant(cl.r,cl.c); syncUI(true);
},{passive:false});
cv.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});
cv.addEventListener('contextmenu',function(e){e.preventDefault()});
D.addEventListener('keydown',function(e){
  if(e.key>='1'&&e.key<='8'){var t=ORDER[parseInt(e.key,10)-1];if(t&&G.state==='playing'){G.sel=t;G.shovel=false;syncUI(true)}return}
  if(e.key==='x'||e.key==='X'){G.shovel=!G.shovel;G.sel=null;syncUI(true);return}
  if(e.key==='Escape'){G.state==='playing'?pauseGame():resumeGame()}
});
D.addEventListener('visibilitychange',function(){if(D.hidden&&G.state==='playing')pauseGame()});
$('bPlay').addEventListener('click',function(){ensureAC();LV=1;MODE='level';startLevel(1,'level')});
$('bPause').addEventListener('click',function(){ensureAC();G.state==='playing'?pauseGame():resumeGame()});
$('bResume').addEventListener('click',resumeGame);
$('bRestart').addEventListener('click',function(){startLevel(G.level,G.mode)});
$('bQuit').addEventListener('click',toMenu);
$('bMenu').addEventListener('click',toMenu);
$('bAgain').addEventListener('click',function(){startLevel(G.level,G.mode)});
$('bNext').addEventListener('click',function(){startLevel(Math.min(3,G.level+1),'level')});
$('bShovel').addEventListener('click',function(){ensureAC();if(G.state!=='playing')return;G.shovel=!G.shovel;if(G.shovel)G.sel=null;sfx('click');syncUI(true)});
function paintAudio(){ $('bMusic').textContent=mOn?'🎵':'🔇'; $('bSound').textContent=sOn?'🔊':'🔈' }
function paintAuto(){ $('bAuto').classList.toggle('on',G.auto); $('bAuto').title=(G.auto?'Matahari diambil otomatis — ketuk untuk mematikan':'Ketuk matahari sendiri — ketuk untuk menyalakan otomatis') }
$('bAuto').addEventListener('click',function(){G.auto=!G.auto;SAVE.auto=G.auto;writeSave();paintAuto();sfx('click');toast(G.auto?'Matahari dijemput otomatis':'Matahari harus diketuk sendiri')});
$('bMusic').addEventListener('click',function(){mOn=!mOn;SAVE.mus=mOn;writeSave();paintAudio();sfx('click')});
$('bSound').addEventListener('click',function(){sOn=!sOn;SAVE.snd=sOn;writeSave();ensureAC();if(sOn)sfx('click');paintAudio()});

/* ---------- mulai ---------- */
loadSave(); sOn=SAVE.snd!==false; mOn=SAVE.mus!==false; G.auto=SAVE.auto!==false;
buildArt(); drawSunIco(); buildBank(); buildLevels(); paintAudio(); paintAuto(); syncUI(true);
var lastT=0;
/* Resolusi adaptif: mulai HD, tapi kalau HP-nya tidak sanggup (frame > 20 ms)
   gambar diturunkan ke mode hemat satu kali supaya permainan tetap lancar.
   Ini diukur dari frame sungguhan, bukan tebakan soal HP-nya. */
function setSS(v){
  if(v===SS)return;
  SS=v; cv.width=LW*SS; cv.height=LH*SS;
  ART.plants={}; ART.zom={};
  buildArt(); drawSunIco(); buildBank(); syncUI(true);
}
var ukurFrame=[], sudahTurun=false, ukurMulai=0;
function loop(now){
  if(!lastT)lastT=now;
  var dt=Math.min(0.05,(now-lastT)/1000); lastT=now;
  update(dt);
  if(G.state==='menu'){cx.setTransform(SS,0,0,SS,0,0);cx.drawImage(ART.lawn,0,0,LW,LH)}
  else draw();
  syncUI(false);
  /* pemantau kecepatan: 120 frame pertama tiap sesi main */
  if(!sudahTurun&&G.state==='playing'&&dt>0&&D.visibilityState==='visible'){
    if(!ukurMulai)ukurMulai=now;
    ukurFrame.push(dt*1000);
    var cukup=(ukurFrame.length>=60)||(now-ukurMulai>5000&&ukurFrame.length>=25);
    if(cukup){
      var urut=ukurFrame.slice(5).sort(function(a,b){return a-b});
      var tengah=urut[Math.floor(urut.length/2)];
      sudahTurun=true;
      if(tengah>26&&SS>2){ setSS(2); toast('Mode hemat dinyalakan agar tetap lancar') }
      ukurFrame=[];
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🌻', key: reactionKey } }).catch(() => {})

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {},
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: 'Nano Ai Plants vs. Zombies 🌻🧟',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-pvz-2026',
                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: html,
                          trusted_sources: [],
                        },
                        __typename: 'GenAISingleLayoutViewModel',
                      },
                    },
                  ],
                })
              ).toString('base64'),
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: '867051314767696@bot',
              },
              forwardOrigin: 4,
            },
          },
        },
      },
    },
    {}
  )
}

handler.help = ['pvz', 'plantsvszombies', 'plantvszombie', 'zombies']
handler.tags = ['game']
handler.command = /^(pvz|plantsvszombies|plantvszombie|plantsvszombie|zombies)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Plants vs. Zombies Nano Ai - 9x5 rumput, 8 tanaman, mesin pemotong, 3 level + survival'

export default handler
