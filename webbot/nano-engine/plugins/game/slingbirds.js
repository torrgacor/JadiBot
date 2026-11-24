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
┇ ━━━[ 💬 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗦𝗜 ]━━━━
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

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#7ec8e3">
<title>Nano Ai Sling Birds</title>
<style>
:root{--text:#1d2b36;--dim:#5c7284;--wood:#a9713b;--stone:#8d949e;--ice:#9fd8f2;--pig:#76c043;--red:#e8452f}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(760px 430px at 50% -6%,#bfe6f5 0%,#8ec6dd 45%,#4f7d99 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#f2f8fb,#cfdfe8);border:1px solid #a8c2d1;border-radius:20px;padding:10px;box-shadow:0 30px 80px #1b354370,inset 0 1px 0 #fff}
.head{display:flex;align-items:center;justify-content:space-between;gap:9px;background:#0e2a3a;border:1px solid #24536c;border-radius:13px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8f7a,#c8281a 60%,#7a1209);border:2px solid #fff;color:#fff;font:900 17px system-ui;box-shadow:0 3px 0 #6b1108}
.brandText{min-width:0}
.title{font-size:16px;font-weight:900;letter-spacing:.5px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:2px;color:#8fb4c8;font-size:8px;letter-spacing:.32px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:6px;flex:none}
.mb{width:38px;height:38px;flex:none;border:1px solid #24536c;border-radius:10px;background:linear-gradient(180deg,#1c4359,#0d2431);color:#dff0f8;font-size:16px;box-shadow:0 3px 0 #081821}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0d2532;border:1px solid #1f4a60;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hs{display:flex;align-items:center;gap:4px;padding:3px 7px;background:#12303f;border:1px solid #2b5e77;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:#87aec2}
.hs span{font:900 11px system-ui;color:#ffd166}
.birds{display:flex;align-items:center;gap:3px;padding:3px 7px;background:#12303f;border:1px solid #2b5e77;border-radius:8px}
.birds i{display:block;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff8f7a,#c8281a);border:1px solid #fff8}
.birds i.used{background:#2b5e77;border-color:#2b5e7788}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #8fb0c2;border-radius:14px;overflow:hidden;background:#9fd0e8;box-shadow:inset 0 10px 26px #1b354360;touch-action:none}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.banner{position:absolute;left:0;right:0;top:26%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease;font:950 19px system-ui;letter-spacing:.06em;color:#fff;text-shadow:0 3px 0 #00000055,0 0 18px #ffd16690}
.banner.show{opacity:1}
.banner small{display:block;margin-top:4px;font:800 8px system-ui;letter-spacing:.16em;color:#fff3c4}
.hint{position:absolute;left:50%;transform:translateX(-50%);bottom:6px;padding:4px 9px;border-radius:99px;background:#0d2532d9;border:1px solid #2b5e77;color:#cfe8f4;font:800 7px system-ui;letter-spacing:.1em;white-space:nowrap}
.hint.hide{display:none}
.pad{margin-top:9px;display:grid;grid-template-columns:1fr 1fr;gap:9px;align-items:end}
.movePad{display:grid;grid-template-columns:1fr 1fr;gap:7px;touch-action:none}
.actPad{display:grid;grid-template-columns:1fr;gap:7px}
/* area tombol: gesture eksklusif — jari di sini tidak boleh menggulir halaman */
.nano-analog{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;overscroll-behavior:contain}
body .pad:active{transform:none!important}
.mbtn{min-height:62px;border:1px solid #24536c;border-radius:13px;background:linear-gradient(180deg,#1c4359,#0d2431);color:#eaf6fc;font:900 20px system-ui;box-shadow:0 5px 0 #081821,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none;display:grid;place-items:center}
.mbtn small{display:block;font-size:6px;letter-spacing:.14em;color:#87aec2;margin-top:2px}
.mbtn.active{transform:translateY(3px);box-shadow:0 2px 0 #081821;filter:brightness(1.25)}
.mbtn.cool{opacity:.45;filter:saturate(.35)}
.abtn{min-height:76px;border:2px solid #ffd166;border-radius:14px;background:radial-gradient(circle at 35% 24%,#ff9d8a,#d8321c 56%,#7a1209);color:#fff;font:950 14px system-ui;letter-spacing:.1em;box-shadow:0 6px 0 #6b1108,0 0 20px #e8452f44,inset 0 2px 0 #ffffff55;touch-action:none;user-select:none;display:grid;place-items:center}
.abtn small{display:block;margin-top:2px;font:800 6.2px system-ui;letter-spacing:.06em;color:#ffe2d3}
.abtn.active{transform:translateY(4px);box-shadow:0 2px 0 #6b1108,0 0 24px #ffd16688;filter:brightness(1.15)}
.abtn.cool{opacity:.5;filter:saturate(.4)}
.ov{position:fixed;inset:0;z-index:7;display:grid;place-items:center;background:#06131bcc;backdrop-filter:blur(9px);padding:calc(10px + env(safe-area-inset-top,0px)) 10px calc(10px + env(safe-area-inset-bottom,0px));transition:opacity .22s ease;overflow:auto}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,364px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #2b5e77;border-radius:16px;background:linear-gradient(180deg,#12303f,#081821);box-shadow:0 20px 46px #0009,inset 0 1px 0 #ffffff14;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-size:20px;font-weight:950;color:#fff}
.ovText{margin-top:6px;color:#9dc0d2;font-size:9px;line-height:1.55}
.ovText b{color:#ffe08a}
.stars{margin-top:8px;font-size:22px;letter-spacing:4px}
.stars i{color:#43606f;font-style:normal}
.stars i.on{color:#ffd166;text-shadow:0 0 12px #ffd166aa}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #2b5e77;border-radius:9px;background:#0a1b25}
.ovStats b{display:block;font-size:12px;color:#ffd166}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:#87aec2;text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.sbtn{min-height:38px;border:1px solid #2b5e77;border-radius:10px;background:linear-gradient(180deg,#1c4359,#0d2431);color:#e6f4fb;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #071620,inset 0 1px 0 #ffffff14;touch-action:manipulation}
.sbtn.go{border-color:#63d68c;background:linear-gradient(180deg,#3fbf6a,#1c6b38);color:#06210f;box-shadow:0 4px 0 #0d2a17,inset 0 1px 0 #ffffff3d}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #071620}
.lvGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}
.lvt{position:relative;min-height:50px;border:1px solid #2b5e77;border-radius:11px;background:linear-gradient(180deg,#1c4359,#0d2431);color:#e6f4fb;font:900 14px system-ui;box-shadow:0 4px 0 #071620;touch-action:manipulation}
.lvt small{display:block;font-size:6px;letter-spacing:.1em;color:#87aec2;margin-top:2px}
.lvt .st{position:absolute;top:3px;right:3px;font-size:8px;color:#ffd166}
.lvt.lock{opacity:.45}
.lvt:active{transform:translateY(3px);box-shadow:0 1px 0 #071620}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#5c7284;font-size:6.4px}
.foot kbd{padding:2px 4px;border:1px solid #a8c2d1;border-radius:4px;background:#eaf3f8;color:#3d5866;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px}.title{font-size:14px}.logo{width:35px;height:35px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🐦</div>
        <div class="brandText"><div class="title">SLING BIRDS</div><div class="sub">KATAPEL & BABI • NANO AI ARCADE</div></div>
      </div>
      <div class="hbtns">
        <button class="mb" id="pauseB" type="button" aria-label="Jeda">⏸</button>
        <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
      </div>
    </div>

    <div class="hud">
      <div class="hs"><b>LEVEL</b><span id="lvl">1</span></div>
      <div class="hs"><b>SKOR</b><span id="score">0</span></div>
      <div class="hs"><b>BABI</b><span id="pigs">0</span></div>
      <div class="hs"><b>BLOK</b><span id="blocks">0</span></div>
      <div class="birds" id="birdIcons"></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="banner" id="banner"></div>
      <div class="hint" id="hint">TAHAN TARIK LALU LEPAS</div>
    </div>

    <div class="pad">
      <div class="movePad nano-analog" id="movePad">
        <button class="mbtn" id="bAimL" type="button" aria-label="Bidik kiri">◀<small>BIDIK KIRI</small></button>
        <button class="mbtn" id="bAimR" type="button" aria-label="Bidik kanan">▶<small>BIDIK KANAN</small></button>
      </div>
      <div class="actPad">
        <button class="abtn pull" id="bPull" type="button">🎯 TARIK<small>TAHAN = TARIK TALI · LEPAS = MELUNCUR</small></button>
      </div>
    </div>

    <div class="foot"><span>Tombol ◀ ▶ untuk bidik • tahan TARIK lalu lepas untuk meluncur (bisa juga geser burung di layar)</span><span><kbd>R</kbd> <kbd>P</kbd> <kbd>M</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🐦</div>
        <h2 class="ovTitle" id="ovTitle">SLING BIRDS</h2>
        <p class="ovText" id="ovText">Hancurkan semua babi hijau dengan katapel.</p>
        <div class="stars" id="stars"></div>
        <div class="ovStats" id="ovStats"></div>
        <div class="ovBtns" id="ovBtns"></div>
      </div>
    </div>
  </div>
</div>
<script>
'use strict';
(function(){
var D=document;
/* WhatsApp/webview: matikan menu TEKAN-LAMA (Salin/Bagikan/Hapus), seleksi teks, dan seret
   gambar — supaya sentuhan di permainan tidak direbut lapisan chat di atasnya */
(function(){
  var evs=['contextmenu','selectstart','dragstart','gesturestart'],i;
  for(i=0;i<evs.length;i++){
    D.addEventListener(evs[i],function(e){
      var t=e.target;
      if(t&&t.closest&&t.closest('textarea,input,[contenteditable]'))return;
      e.preventDefault();
    },false);
  }
  /* geser di area permainan tidak boleh menutup webview / menggeser chat; kotak yang memang
     bisa digulir (menu) dan halaman yang lebih tinggi dari layar tetap dibiarkan */
  D.addEventListener('touchmove',function(e){
    var t=e.target,n;
    if(t&&t.closest&&t.closest('textarea,input,[contenteditable],.ovCard,.modal'))return;
    for(n=t;n&&n!==D.body;n=n.parentElement){
      if(n.scrollHeight>n.clientHeight+4)return;
    }
    if(D.documentElement.scrollHeight>window.innerHeight+4)return;
    e.preventDefault();
  },{passive:false});
})();
function $(i){return D.getElementById(i)}
function clamp(v,a,b){return v<a?a:(v>b?b:v)}
function rnd(a,b){return a+Math.random()*(b-a)}
function sgn(v){return v<0?-1:(v>0?1:0)}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

var cv=$('cv'),ctx=cv.getContext('2d');
var VW=480,VH=296,PX=1,LOW=false,GY=252;
try{LOW=(navigator.hardwareConcurrency||4)<=2}
catch(e){}
function fit(){
  var host=cv.parentNode||D.body;
  var cssW=Math.max(150,Math.round(host.clientWidth||((window.innerWidth||360)-26)));
  var dpr=Math.min(LOW?1.5:2,(window.devicePixelRatio)||1);
  PX=clamp(Math.round(cssW*dpr/VW),1,2);
  cv.width=Math.round(VW*PX);cv.height=Math.round(VH*PX);
}

/* ══════════ AUDIO ══════════ */
var AC=null,master=null,muted=false;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.5;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(Math.max(24,f1),t);
    if(f2&&f2>0)o.frequency.exponentialRampToValueAtTime(Math.max(24,f2),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.001,vol||0.05),t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(bus());o.start(t);o.stop(t+dur+0.03);
  }catch(e){}
}
function noise(dur,vol,f0,f1,delay,q){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var t=a.currentTime+(delay||0),s=a.createBufferSource();s.buffer=buf;
    var fl=a.createBiquadFilter();fl.type=q==='high'?'highpass':'lowpass';fl.frequency.setValueAtTime(Math.max(60,f0||1200),t);
    if(f1)fl.frequency.exponentialRampToValueAtTime(Math.max(60,f1),t+dur);
    var g=a.createGain();g.gain.setValueAtTime(Math.max(0.001,vol||0.2),t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl);fl.connect(g);g.connect(bus());s.start(t);
  }catch(e){}
}
var sfx={
  stretch:function(){tone(120,240,0.08,0.03,'sawtooth')},
  launch:function(){noise(0.2,0.16,1800,300);tone(700,240,0.16,0.05,'square')},
  wood:function(){noise(0.09,0.2,900,180);tone(220,120,0.08,0.05,'square')},
  ice:function(){noise(0.16,0.16,5000,2200,0,'high');tone(1800,2600,0.1,0.03,'triangle')},
  stone:function(){noise(0.14,0.24,600,120);tone(140,70,0.14,0.06,'sawtooth')},
  pig:function(){tone(700,1200,0.09,0.05,'square');tone(1200,500,0.14,0.04,'square',0.08);noise(0.14,0.14,1600,600)},
  thud:function(){noise(0.08,0.14,500,120)},
  win:function(){var s=[523,659,784,1047,1319],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*1.02,0.2,0.05,'square',i*0.1)},
  lose:function(){var s=[392,330,262,196],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*0.96,0.28,0.05,'triangle',i*0.14)},
  star:function(){tone(1047,1568,0.14,0.05,'square');tone(1568,2093,0.16,0.04,'square',0.12)},
  click:function(){tone(660,900,0.05,0.04,'square')}
};

/* ══════════ BAHAN ══════════ */
var MAT={
  wood:{hp:58,m:1.0,c1:'#c08a4a',c2:'#a9713b',c3:'#7d4f22',score:100},
  ice:{hp:34,m:0.7,c1:'#d6f0ff',c2:'#9fd8f2',c3:'#6fb2d6',score:80},
  stone:{hp:118,m:2.4,c1:'#a8b0ba',c2:'#8d949e',c3:'#69707a',score:150}
};
var GRAV=0.34,DRAG=0.9985,REST=0.22,FRIC=0.86,graceT=0;
var SETTLE_T=30;   /* jeda singkat setelah burung berhenti sebelum burung berikutnya */
var killLog=[];   /* catatan pembunuhan untuk pengujian */
var bodies=[],pigs=[],parts=[],pops=[],bird=null,birdState='idle';
var LEVELS=null;
function L(){
  if(LEVELS)return LEVELS;
  /* W(x, dasarY, lebar, tinggi, bahan) — dasarY = ketinggian ALAS blok (bukan tengah) */
  function W(x,base,w,h,t){return{x:x,base:base,w:w,h:h,t:t||'wood'}}
  var LV=[];
  /* 1 — Pondok kayu: satu babi terbuka di depan, satu bersembunyi di bawah atap.
     Celah antar tiang 58 satuan supaya terasa lapang (maksudnya: minta dirobohkan). */
  LV.push({birds:3,blocks:[
    W(360,0,14,52,'wood'),W(432,0,14,52,'wood'),W(396,52,92,14,'wood')
  ],pigs:[{x:296,base:0},{x:396,base:0}]});
  /* 2 — Rumah dua lantai + babi depan yang jelas terlihat */
  LV.push({birds:3,blocks:[
    W(376,0,14,50,'wood'),W(440,0,14,50,'wood'),W(408,50,88,12,'wood'),
    W(388,62,12,28,'ice'),W(428,62,12,28,'ice'),W(408,90,64,12,'wood')
  ],pigs:[{x:296,base:0},{x:408,base:0},{x:408,base:62}]});
  /* 3 — Kubu batu: babi di tanah depan, di dalam, dan di atas atap (dua bisa dibidik langsung) */
  LV.push({birds:3,blocks:[
    W(400,0,110,20,'stone'),W(370,20,14,26,'wood'),W(440,20,14,26,'wood'),
    W(405,46,100,12,'wood')
  ],pigs:[{x:300,base:0},{x:405,base:20},{x:405,base:58}]});
  /* 4 — Dua menara: puncak terbuka, isi perlu dirobohkan. */
  LV.push({birds:5,blocks:[
    W(346,0,14,60,'wood'),W(414,0,14,60,'wood'),W(380,60,90,12,'stone'),
    W(452,0,14,44,'stone'),W(512,0,14,44,'stone'),W(482,44,76,12,'wood'),
    W(466,56,12,18,'ice'),W(498,56,12,18,'ice'),W(482,74,56,12,'ice')
  ],pigs:[{x:292,base:0},{x:380,base:0},{x:380,base:72},{x:482,base:0}]});
  /* 5 — Benteng terakhir: dua babi terbuka, sisanya di bawah runtuhan. */
  LV.push({birds:5,blocks:[
    W(410,0,140,24,'stone'),
    W(366,24,14,28,'wood'),W(454,24,14,28,'wood'),W(410,52,112,12,'wood'),
    W(386,64,12,26,'stone'),W(434,64,12,26,'stone'),W(410,90,86,12,'wood'),
    W(520,0,14,60,'wood'),W(568,0,14,60,'wood'),W(544,60,76,12,'stone')
  ],pigs:[{x:288,base:0},{x:410,base:24},{x:410,base:102},{x:544,base:0}]});
  LEVELS=LV;
  return LV;
}
/* ubah data level (dasar) ke satuan dunia: x tengah, y dasar diukur dari tanah */
function bodyFromDef(d){
  var M=MAT[d.t];
  return{x:d.x-d.w/2,y:GY-d.base-d.h,w:d.w,h:d.h,t:d.t,m:M.m,hp:M.hp,maxHp:M.hp,vx:0,vy:0,dead:false,type:'block',hurt:0}
}
function pigFromDef(d){return mkPig(d.x,GY-d.base-9.5)}
var SLING={x:92,y:GY-52,topY:GY-96};

/* ══════════ KEADAAN ══════════ */
var state='menu',tick=0,level=0,score=0,birdsLeft=3,dragging=false,dragX=0,dragY=0,cam={x:0,shake:0},waveT=0;
var bestStars=[0,0,0,0,0];
try{var bsj=localStorage.getItem('nano-slingbirds-stars');if(bsj)bestStars=JSON.parse(bsj)||bestStars}catch(e){}
function saveStars(){try{localStorage.setItem('nano-slingbirds-stars',JSON.stringify(bestStars))}catch(e){}}

function mkBody(x,y,w,h,t){
  var M=MAT[t]||MAT.wood;
  return{x:x,y:y,w:w,h:h,t:t,m:M.m,hp:M.hp,maxHp:M.hp,vx:0,vy:0,ang:0,dead:false,type:'block',hurt:0};
}
function mkPig(x,y){
  return{x:x,y:y,r:9.5,m:0.85,hp:20,maxHp:20,vx:0,vy:0,dead:false,type:'pig',hurt:0,blink:rnd(0,300)};
}
function resetBird(){
  bird={x:SLING.x,y:SLING.y-14,r:7.4,m:1.5,vx:0,vy:0,dead:false,type:'bird',alive:true,trail:[],flight:0,slow:0};
  birdState='idle';
}
function loadLevel(i){
  var lv=L()[i],k;
  bodies=[];pigs=[];parts=[];pops=[];
  for(k=0;k<lv.blocks.length;k++)bodies.push(bodyFromDef(lv.blocks[k]));
  for(k=0;k<lv.pigs.length;k++)pigs.push(pigFromDef(lv.pigs[k]));
  birdsLeft=lv.birds;
  score=0;cam.x=0;cam.shake=0;waveT=0;graceT=tick+40;
  resetBird();
  hud();
  var h=$('hint');if(h)h.className='hint';
}
function startLevel(i){
  level=clamp(i,0,L().length-1);
  loadLevel(level);
  state='play';
  ovHide();
  showBanner('LEVEL '+(level+1),'HANCURKAN SEMUA BABI');
  sfx.click();
}
function restart(){startLevel(level)}

/* ══════════ FISIKA ══════════ */
function birds(){
  return bird&&bird.alive&&birdState!=='idle';
}
function solve(){
  var i,j,it;
  var all=[];
  if(bird&&bird.alive)all.push(bird);
  for(i=0;i<bodies.length;i++)if(!bodies[i].dead)all.push(bodies[i]);
  for(i=0;i<pigs.length;i++)if(!pigs[i].dead)all.push(pigs[i]);
  for(it=0;it<10;it++){
    for(i=0;i<all.length;i++){
      var a=all[i];
      if(a===bird&&birdState==='idle')continue;
      for(j=i+1;j<all.length;j++){
        var b=all[j];
        if(b===bird&&birdState==='idle')continue;
        var hit=overlap(a,b);
        if(!hit)continue;
        push(a,b,hit);
      }
    }
    /* tanah & dinding */
    for(i=0;i<all.length;i++){
      var o=all[i];
      if(o===bird&&birdState==='idle')continue;
      /* o.y = sudut kiri-atas, jadi jarak ke alas = o.h (blok) atau o.r (lingkaran) */
      var cut=o.type==='block'?o.h:(o.r||8);
      if(o.y+cut>GY){
        var pen=(o.y+cut)-GY;
        o.y-=pen;
        if(o.vy>0){
          /* babi yang terhempas lalu jatuh ke tanah juga terluka (seperti aslinya) */
          if(o.vy>2.2&&o.type==='pig'&&tick>graceT)damage(o,Math.min(90,Math.round(o.vy*o.vy*1.5)),o.vy);
          if(o.vy>2.2)sfx.thud();
          o.vy=-o.vy*REST;
          o.vx*=0.9;
        }
      }
      var eL=o.type==='block'?o.x:o.x-(o.r||8);
      var eR=o.type==='block'?o.x+o.w:o.x+(o.r||8);
      if(eL<8)  { o.x+=8-eL; o.vx=Math.abs(o.vx)*0.3 }
      if(eR>1180){ o.x-=eR-1180; o.vx=-Math.abs(o.vx)*0.3 }
    }
  }
  /* terhimpit: babi yang tertindih blok berat kehilangan tenaga perlahan-lahan */
  for(i=0;i<pigs.length;i++){
    var pg=pigs[i];
    if(pg.dead)continue;
    if(pg.crush&&tick>graceT&&tick%10===0)damage(pg,3,3);
    pg.crush=0;
  }
}
var SLOP=0.35;  /* toleransi sentuhan: kontak yang hanya menempel tidak boleh menghasilkan gaya */
function overlap(a,b){
  var ac=a.type==='block',bc=b.type==='block';
  if(!ac&&!bc){
    /* lingkaran vs lingkaran (burung vs babi) */
    var ddx=b.x-a.x,ddy=b.y-a.y,dd=Math.sqrt(ddx*ddx+ddy*ddy),rr=(a.r||8)+(b.r||8);
    if(dd>=rr)return null;
    if(dd<0.0001)return{nx:0,ny:-1,pen:rr};
    var pc=rr-dd;
    if(pc<0.15)return null;
    return{nx:ddx/dd,ny:ddy/dd,pen:pc};
  }
  if(ac&&bc){
    /* dx/dy = pusat A - pusat B, jadi normal dari A KE B = -(dx,dy) */
    var dx=(a.x+a.w/2)-(b.x+b.w/2),px=(a.w+b.w)/2-Math.abs(dx);
    if(px<=SLOP)return null;
    var dy=(a.y+a.h/2)-(b.y+b.h/2),py=(a.h+b.h)/2-Math.abs(dy);
    if(py<=SLOP)return null;
    if(px<py)return{nx:-(sgn(dx)||1),ny:0,pen:px};
    return{nx:0,ny:-(sgn(dy)||1),pen:py};
  }
  var cir=ac?b:a,box=ac?a:b,swap=ac?1:-1;
  var hw=box.w/2,hh=box.h/2;
  var cx=box.x+hw,cy=box.y+hh;
  var nx=clamp(cir.x,cx-hw,cx+hw),ny=clamp(cir.y,cy-hh,cy+hh);
  var dx2=cir.x-nx,dy2=cir.y-ny,d=Math.sqrt(dx2*dx2+dy2*dy2);
  if(d>cir.r)return null;
  var n1x,n1y,pen;
  if(d<0.0001){n1x=0;n1y=-1;pen=cir.r}
  else{n1x=dx2/d;n1y=dy2/d;pen=cir.r-d}
  if(pen<SLOP)return null;
  if(swap<0)return{nx:-n1x,ny:-n1y,pen:pen};
  return{nx:n1x,ny:n1y,pen:pen};
}
function push(o1,o2,hit){
  var deg1=(o1===bird&&birdState==='idle'),deg2=(o2===bird&&birdState==='idle');
  var i1=1/(o1.m||1),i2=1/(o2.m||1),sum=i1+i2;
  if(sum<=0)return;
  var nx=hit.nx,ny=hit.ny;
  /* babi yang terjepit beban berat (kayu/batu) akan terhimpit — seperti di aslinya */
  if(o1.type==='pig'||o2.type==='pig'){
    /* blok berat yang menekan dari atas = babi terhimpit (mati perlahan) */
    var pg0=(o1.type==='pig')?o1:o2, bl0=(o1.type==='pig')?o2:o1;
    if(bl0.type==='block'&&(bl0.m||1)>=0.9&&(bl0.y+bl0.h)<=(pg0.y+2))pg0.crush=1;
  }
  if(o1.type==='pig'||o2.type==='pig'){
    killLog.push({ev:'pair',a:o1.type,b:o2.type,pen:+hit.pen.toFixed(2),nx:+nx.toFixed(2),ny:+ny.toFixed(2),f:tick});
    if(killLog.length>60)killLog.shift();
  }
  var kf=0.75;
  o1.x-=nx*(hit.pen*i1/sum)*kf; o1.y-=ny*(hit.pen*i1/sum)*kf;
  o2.x+=nx*(hit.pen*i2/sum)*kf; o2.y+=ny*(hit.pen*i2/sum)*kf;
  var rvx=(o2.vx||0)-(o1.vx||0),rvy=(o2.vy||0)-(o1.vy||0);
  var vn=rvx*nx+rvy*ny;
  if(vn>-0.3)return;   /* abaikan gangguan angka kecil supaya benda diam tetap diam */
  var e=(Math.abs(vn)<1.6)?0:REST;   /* kontak pelan tidak memantul, supaya tumpukan tenang */
  var j=-((1+e)*vn)/sum;
  o1.vx-=(j*nx)*i1; o1.vy-=(j*ny)*i1;
  o2.vx+=(j*nx)*i2; o2.vy+=(j*ny)*i2;
  var impact=-vn;
  /* masa aman hanya untuk guncangan awal struktur — burung selalu dihitung */
  var olehBurung=(o1.type==='bird'||o2.type==='bird');
  if(tick<=graceT&&!olehBurung)return;
  var speed=Math.max(Math.abs(o1.vx)+Math.abs(o1.vy),Math.abs(o2.vx)+Math.abs(o2.vy));
  var pigHit=(o1.type==='pig'||o2.type==='pig');
  /* babi itu lunak: runtuhan blok yang jatuh menimpanya sudah cukup untuk melukainya,
     sedangkan blok hanya rusak oleh benturan yang benar-benar berarti */
  if(pigHit&&impact>1.15&&speed>0.85){
    var pd=pigDmg(impact);
    if(o1.type==='pig')damage(o1,pd,impact);
    if(o2.type==='pig')damage(o2,pd,impact);
  }
  if(impact>3.4&&speed>2.6){
    var dmg=Math.min(70,Math.round((impact-2.5)*impact*0.62));
    if(o1.type==='block')damage(o1,dmg,impact);
    if(o2.type==='block')damage(o2,dmg,impact);
    if(o1.type==='bird'||o2.type==='bird')score+=Math.round(impact*2);
    var other=(o1.type==='bird')?o2:(o2.type==='bird'?o1:null);
    if(other)impactFx(other.x,other.y-6,other.t||'pig',impact);
    cam.shake=Math.min(5,cam.shake+impact*0.35);
    hud();
  } else if(pigHit&&impact>1.15&&speed>0.85){
    cam.shake=Math.min(4,cam.shake+impact*0.2);
    hud();
  }
}
function pigDmg(impact){return Math.min(90,Math.round(impact*impact*1.6))}
function damage(o,dmg,impact){
  if(o.dead)return;
  o.hp-=dmg;o.hurt=8;
  if(dmg>4)killLog.push({ev:'dmg',t:o.type,x:Math.round(o.x),y:Math.round(o.y),d:dmg,imp:+impact.toFixed(1),f:tick});
  if(o.hp<=0)kill(o,'damage');
}
function kill(o,why){
  if(o.dead)return;
  o.dead=true;
  killLog.push({ev:'kill',t:o.type,x:Math.round(o.x),y:Math.round(o.y),why:why||'?',f:tick});
  if(killLog.length>60)killLog.shift();
  if(o.type==='pig'){
    score+=5000;
    for(var i=0;i<14;i++)parts.push({x:o.x,y:o.y,vx:rnd(-3,3),vy:rnd(-4,1),life:34,max:34,c:i%2?'#76c043':'#4f8a2a',r:rnd(1.6,3.4)});
    popText(o.x,o.y-16,'+5000','#ffe08a');
    sfx.pig();
  }else{
    var M=MAT[o.t];
    score+=M.score;
    var n=8;
    for(var k=0;k<n;k++)parts.push({x:o.x+o.w/2,y:o.y+o.h/2,vx:rnd(-2.6,2.6),vy:rnd(-3.4,0.6),life:30,max:30,c:k%2?M.c1:M.c3,r:rnd(1.4,3)});
    popText(o.x+o.w/2,o.y,'+'+M.score,'#fff');
    if(o.t==='ice')sfx.ice();else if(o.t==='stone')sfx.stone();else sfx.wood();
  }
  hud();
}
function impactFx(x,y,t,impact){
  if(impact<1.6)return;
  var c=(t==='ice')?'#d6f0ff':(t==='stone'?'#cfd6de':(t==='wood'?'#e0b070':'#b6e88a'));
  for(var i=0;i<5;i++)parts.push({x:x,y:y,vx:rnd(-2.6,2.6),vy:rnd(-3.2,0.4),life:20,max:20,c:c,r:rnd(1.2,2.6)});
  if(t==='pig'||!t)sfx.thud();
}
function popText(x,y,t,c){pops.push({x:x,y:y,t:t,c:c||'#fff',life:50,max:50})}

/* ══════════ LANGKAH ══════════ */
function step(){
  tick++;
  if(tick%12===0)pullBtns();
  if(state==='play'){
    var i;
    /* tombol TARIK ditahan: tali makin jauh tertarik, kekuatan naik */
    if(charging&&dragging){pullLen=Math.min(PULL_MAX,pullLen+PULL_RATE);applyPull()}
    if(bird&&bird.alive&&birdState==='fly'){
      bird.vy+=GRAV;bird.vx*=DRAG;bird.vy*=DRAG;
      bird.x+=bird.vx;bird.y+=bird.vy;
      bird.trail.push({x:bird.x,y:bird.y});
      if(bird.trail.length>90)bird.trail.shift();
      bird.flight++;
      if(bird.x>VW+cam.x-6||bird.x<cam.x-40||bird.y>VH+60||bird.x>1180||bird.y<-60){
        bird.alive=false;birdState='settle';waveT=SETTLE_T;
      }
      else if(Math.abs(bird.vx)<0.55&&Math.abs(bird.vy)<0.55&&bird.x<cam.x+VW+20){
        bird.slow++;
        if(bird.slow>24){bird.alive=false;birdState='settle';waveT=SETTLE_T}
      }
      /* jangan biarkan pemain menunggu lama kalau burung memantul-mantul pelan */
      else if(bird.flight>200){bird.alive=false;birdState='settle';waveT=SETTLE_T}
    }
    for(i=0;i<bodies.length;i++){
      var b=bodies[i];
      if(b.dead)continue;
      b.vy+=GRAV;b.vx*=DRAG;b.vy*=DRAG;
      b.x+=b.vx;b.y+=b.vy;
      b.vx*=FRIC;b.vy*=0.999;
      if(b.hurt>0)b.hurt--;
    }
    for(i=0;i<pigs.length;i++){
      var p=pigs[i];
      if(p.dead)continue;
      p.vy+=GRAV;p.vx*=DRAG;p.vy*=DRAG;
      p.x+=p.vx;p.y+=p.vy;
      p.vx*=0.94;
      if(p.hurt>0)p.hurt--;
      if(p.y>GY+40)kill(p,'fall-through');
    }
    solve();
    for(i=0;i<bodies.length;i++){var bb=bodies[i];if(!bb.dead&&bb.y>GY+60)kill(bb,'fall-through')}
    /* kamera */
    if(birdState==='fly'&&bird&&bird.alive){
      var tx=clamp(bird.x-VW*0.5,0,1180-VW);
      cam.x+=(tx-cam.x)*0.10;
    }else{
      cam.x+=(0-cam.x)*0.07;
    }
    /* keadaan akhir gelombang */
    if(waveT>0){
      waveT--;
      if(waveT===0)nextShot();
    }
    if(pigsAlive()===0&&state==='play'){
      state='clear';waveT=0;
      var bonus=birdsLeft*1000;
      score+=bonus;
      sfx.win();
      setTimeout(function(){if(state==='clear')levelDone()},420);
    }
  }
  var i2;
  for(i2=parts.length-1;i2>=0;i2--){
    var pt=parts[i2];pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=0.24;pt.vx*=0.99;pt.life--;
    if(pt.life<=0)parts.splice(i2,1);
  }
  for(i2=pops.length-1;i2>=0;i2--){pops[i2].y-=0.42;pops[i2].life--;if(pops[i2].life<=0)pops.splice(i2,1)}
  if(cam.shake>0)cam.shake*=0.86;
  if(bannerT&&tick-bannerT>100)hideBanner();
  if(tick%12===0)hud();
}
function pigsAlive(){
  var n=0,i;
  for(i=0;i<pigs.length;i++)if(!pigs[i].dead)n++;
  return n;
}
function blocksAlive(){
  var n=0,i;
  for(i=0;i<bodies.length;i++)if(!bodies[i].dead)n++;
  return n;
}
function nextShot(){
  if(pigsAlive()===0)return;
  if(birdsLeft<=0){state='dead';sfx.lose();levelFail();return}
  resetBird();
  var h=$('hint');if(h)h.className='hint';
  hud();
}
function levelDone(){
  state='done';
  var base=20000,st=1;
  if(score>46000)st=3;else if(score>34000)st=2;
  if(st>bestStars[level]){bestStars[level]=st;saveStars()}
  sfx.star();
  ovShow('🏆','LEVEL '+(level+1)+' BERSIH',
    'Semua babi kalah. Bonus burung tersisa: <b>'+(birdsLeft*1000)+'</b>.',
    [['SKOR',score],['BABI',L()[level].pigs.length],['BURUNG',birdsLeft]],
    [{act:'next',label:(level<L().length-1?'▶ LEVEL BERIKUTNYA':'▶ LEVEL PILIH'),cls:'go'},{act:'retry',label:'↻ ULANG'},{act:'levels',label:'⏹ LEVEL'}],
    st);
}
function levelFail(){
  ovShow('💥','BURUNG HABIS','Babi masih hidup. Coba sudut lain — blok batu butuh pukulan lebih keras.',
    [['SKOR',score],['BABI SISA',pigsAlive()],['LEVEL',level+1]],
    [{act:'retry',label:'↻ COBA LAGI',cls:'go'},{act:'levels',label:'⏹ LEVEL'}]);
}

/* ══════════ GAMBAR ══════════ */
var clouds=[];
function bakeClouds(){clouds.length=0;for(var i=0;i<14;i++)clouds.push({x:rnd(0,1300),y:rnd(14,86),s:rnd(0.6,1.5)})}
function drawSky(){
  var g=ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,'#4fa8d8');g.addColorStop(0.5,'#8fd0ea');g.addColorStop(1,'#cfeeff');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  var s=ctx.createRadialGradient(VW*0.78,44,6,VW*0.78,44,80);
  s.addColorStop(0,'rgba(255,250,210,1)');s.addColorStop(0.3,'rgba(255,245,180,.42)');s.addColorStop(1,'rgba(255,245,180,0)');
  ctx.fillStyle=s;ctx.beginPath();ctx.arc(VW*0.78,44,80,0,6.3);ctx.fill();
  var i;
  for(i=0;i<clouds.length;i++){
    var c=clouds[i],sx=c.x-cam.x*0.35;
    sx=((sx%(VW+340))+VW+340)%(VW+340)-170;
    ctx.fillStyle='rgba(255,255,255,.82)';
    ctx.beginPath();ctx.arc(sx,c.y,13*c.s,0,6.3);ctx.arc(sx+15*c.s,c.y+3*c.s,10*c.s,0,6.3);ctx.arc(sx-14*c.s,c.y+4*c.s,9*c.s,0,6.3);ctx.fill();
  }
  /* bukit jauh */
  ctx.fillStyle='#6fb46a';
  ctx.beginPath();ctx.moveTo(0,VH);
  for(i=0;i<=VW;i+=16){
    var wx=(cam.x*0.28+i)*0.012;
    ctx.lineTo(i,GY-46+Math.sin(wx*1.3)*22+Math.sin(wx*0.5+1)*14);
  }
  ctx.lineTo(VW,VH);ctx.closePath();ctx.fill();
  ctx.fillStyle='#57a052';
  ctx.beginPath();ctx.moveTo(0,VH);
  for(i=0;i<=VW;i+=14){
    var w2=(cam.x*0.55+i)*0.019;
    ctx.lineTo(i,GY-22+Math.sin(w2*1.6+2)*13+Math.sin(w2*0.7)*8);
  }
  ctx.lineTo(VW,VH);ctx.closePath();ctx.fill();
}
function drawGround(){
  var g=ctx.createLinearGradient(0,GY,0,VH);
  g.addColorStop(0,'#79c94f');g.addColorStop(0.22,'#5aa93a');g.addColorStop(1,'#35682a');
  ctx.fillStyle=g;ctx.fillRect(0,GY,VW,VH-GY);
  ctx.fillStyle='#8fd86a';ctx.fillRect(0,GY,VW,3.4);
  var i;
  ctx.fillStyle='rgba(40,80,30,.22)';
  for(i=0;i<26;i++){
    var bx=((i*57-cam.x*0.9)%(VW+80)+VW+80)%(VW+80)-40;
    ctx.beginPath();ctx.ellipse(bx,GY+9+(i*11)%34,7,2.4,0,0,6.3);ctx.fill();
  }
}
function drawSling(){
  var sx=SLING.x-cam.x,bx=sx-7,by=GY-cam.y;
  ctx.strokeStyle='#8a5a2b';ctx.lineWidth=7;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+2,by-62);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx+2,by-30);ctx.lineTo(bx+18,by-58);ctx.stroke();
  ctx.beginPath();ctx.moveTo(bx+2,by-56);ctx.lineTo(bx+18,by-56);ctx.stroke();
  ctx.strokeStyle='#a9713b';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(bx+2,by-62);ctx.lineTo(bx+22,by-62);ctx.stroke();
}
function drawSlingBand(){
  var sx=SLING.x-cam.x;
  var ax=sx+22,ay=GY-62;
  var px,py;
  if(dragging){px=dragX-cam.x;py=dragY}
  else if(bird&&bird.alive&&birdState==='idle'){px=bird.x-cam.x;py=bird.y}
  else return;
  ctx.strokeStyle='#5a3a1b';ctx.lineWidth=3.4;
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(px,py);ctx.stroke();
  ctx.strokeStyle='#3f2711';ctx.lineWidth=1.6;
  ctx.beginPath();ctx.moveTo(ax,ay-3);ctx.lineTo(px,py);ctx.stroke();
}
function drawTrail(){
  if(!bird||!bird.trail.length)return;
  var i;
  ctx.fillStyle='rgba(255,255,255,.5)';
  for(i=0;i<bird.trail.length;i+=4){
    var t=bird.trail[i],a=(i/bird.trail.length)*0.5+0.1;
    ctx.globalAlpha=a;
    ctx.beginPath();ctx.arc(t.x-cam.x,t.y,2.2,0,6.3);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawPig(X,Y,r,p){
  var x=ctx,y=X,t=Y;
  x.save();x.translate(t,y);
  var breathe=Math.sin(tick/22+p.blink)*0.5;
  ctx.fillStyle='rgba(0,0,0,.2)';
  ctx.beginPath();ctx.ellipse(0,r*1.02,r*0.9,r*0.24,0,0,6.3);ctx.fill();
  var g=ctx.createRadialGradient(-r*0.3,-r*0.35,1,0,0,r*1.1);
  g.addColorStop(0,'#b3e77a');g.addColorStop(0.55,'#76c043');g.addColorStop(1,'#4f8a2a');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.arc(0,0,r+breathe,0,6.3);ctx.fill();
  /* telinga */
  ctx.fillStyle='#5fa033';
  ctx.beginPath();ctx.ellipse(-r*0.62,-r*0.86,r*0.3,r*0.22,-0.5,0,6.3);ctx.fill();
  ctx.beginPath();ctx.ellipse(r*0.62,-r*0.86,r*0.3,r*0.22,0.5,0,6.3);ctx.fill();
  /* mata */
  var blink=(tick+p.blink)%180<7;
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(-r*0.32,-r*0.24,r*0.28,0,6.3);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.32,-r*0.24,r*0.28,0,6.3);ctx.fill();
  if(!blink){
    ctx.fillStyle='#1b1b22';
    ctx.beginPath();ctx.arc(-r*0.28,-r*0.24,r*0.14,0,6.3);ctx.fill();
    ctx.beginPath();ctx.arc(r*0.36,-r*0.24,r*0.14,0,6.3);ctx.fill();
  }else{
    ctx.strokeStyle='#1b1b22';ctx.lineWidth=r*0.1;
    ctx.beginPath();ctx.moveTo(-r*0.46,-r*0.24);ctx.lineTo(-r*0.16,-r*0.24);ctx.stroke();
    ctx.beginPath();ctx.moveTo(r*0.16,-r*0.24);ctx.lineTo(r*0.46,-r*0.24);ctx.stroke();
  }
  /* moncong */
  ctx.fillStyle='#64a836';
  ctx.beginPath();ctx.ellipse(0,r*0.26,r*0.42,r*0.32,0,0,6.3);ctx.fill();
  ctx.fillStyle='#3f6b22';
  ctx.beginPath();ctx.arc(-r*0.15,r*0.26,r*0.09,0,6.3);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.15,r*0.26,r*0.09,0,6.3);ctx.fill();
  /* pipi */
  ctx.fillStyle='rgba(255,140,140,.35)';
  ctx.beginPath();ctx.arc(-r*0.66,r*0.14,r*0.19,0,6.3);ctx.fill();
  ctx.beginPath();ctx.arc(r*0.66,r*0.14,r*0.19,0,6.3);ctx.fill();
  if(p.hurt>0){
    ctx.strokeStyle='rgba(255,255,255,'+(p.hurt/9)+')';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,r+2,0,6.3);ctx.stroke();
  }
  x.restore();
}
function drawBlock(b){
  var x=b.x-cam.x,y=b.y,M=MAT[b.t];
  if(x+b.w<-20||x>VW+20)return;
  var g=ctx.createLinearGradient(x,y,x,y+b.h);
  g.addColorStop(0,M.c1);g.addColorStop(0.55,M.c2);g.addColorStop(1,M.c3);
  ctx.fillStyle=g;rr(ctx,x,y,b.w,b.h,Math.min(3,b.w/4,b.h/4));ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.24)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.2)';rr(ctx,x+2,y+2,Math.max(2,b.w-4),Math.min(4,b.h*0.22),1.6);ctx.fill();
  if(b.t==='wood'){
    ctx.strokeStyle='rgba(90,55,20,.4)';ctx.lineWidth=1;
    var n=Math.max(2,Math.floor(b.h/12));
    for(var i=1;i<n;i++){ctx.beginPath();ctx.moveTo(x+2,y+b.h*i/n);ctx.lineTo(x+b.w-2,y+b.h*i/n);ctx.stroke()}
  }else if(b.t==='ice'){
    ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(x+3,y+b.h-3);ctx.lineTo(x+b.w*0.55,y+3);ctx.stroke();
  }else{
    ctx.fillStyle='rgba(0,0,0,.14)';
    ctx.beginPath();ctx.arc(x+b.w*0.3,y+b.h*0.35,1.6,0,6.3);ctx.fill();
    ctx.beginPath();ctx.arc(x+b.w*0.7,y+b.h*0.66,1.9,0,6.3);ctx.fill();
  }
  var hpPct=b.hp/b.maxHp;
  if(hpPct<0.72){
    ctx.strokeStyle='rgba(30,20,10,'+(0.3+(1-hpPct)*0.5)+')';ctx.lineWidth=1.1;
    ctx.beginPath();
    ctx.moveTo(x+b.w*0.2,y+b.h*0.15);
    ctx.lineTo(x+b.w*0.45,y+b.h*0.45);
    ctx.lineTo(x+b.w*0.3,y+b.h*0.8);
    ctx.stroke();
    if(hpPct<0.4){
      ctx.beginPath();ctx.moveTo(x+b.w*0.75,y+b.h*0.18);ctx.lineTo(x+b.w*0.6,y+b.h*0.55);ctx.stroke();
    }
  }
  if(b.hurt>0){
    ctx.fillStyle='rgba(255,255,255,'+(b.hurt/14)+')';
    rr(ctx,x,y,b.w,b.h,2);ctx.fill();
  }
}
function drawParts(){
  var i;
  for(i=0;i<parts.length;i++){
    var p=parts[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;ctx.fillStyle=p.c;
    ctx.beginPath();ctx.arc(p.x-cam.x,p.y,p.r*(0.5+a*0.5),0,6.3);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawPops(){
  ctx.textAlign='center';
  var i;
  for(i=0;i<pops.length;i++){
    var p=pops[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.font='900 13px system-ui';
    ctx.lineWidth=3.2;ctx.strokeStyle='rgba(0,0,0,.55)';
    ctx.strokeText(p.t,p.x-cam.x,p.y);
    ctx.fillStyle=p.c;ctx.fillText(p.t,p.x-cam.x,p.y);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}
function drawAim(){
  if(!dragging)return;
  var dx=SLING.x-dragX,dy=(SLING.y-14)-dragY;
  var d=Math.sqrt(dx*dx+dy*dy);
  if(d<6)return;
  var maxD=72,k=Math.min(1,d/maxD);
  var vx=dx*0.175,vy=dy*0.175;
  /* busur kekuatan */
  var ax=dragX-cam.x,ay=dragY;
  ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=2;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(SLING.x-cam.x,SLING.y-14);ctx.lineTo(ax,ay);ctx.stroke();
  ctx.setLineDash([]);
  /* pratinjau 12 titik */
  var px=bird?bird.x:SLING.x,py=bird?bird.y:SLING.y-14,svx=vx,svy=vy,i;
  ctx.fillStyle='rgba(255,255,255,'+(0.35+0.4*k)+')';
  for(i=0;i<40;i++){
    svy+=GRAV;svx*=DRAG;svy*=DRAG;px+=svx;py+=svy;
    if(i%3===0&&i>2){
      ctx.globalAlpha=Math.max(0.12,0.7-i*0.02);
      ctx.beginPath();ctx.arc(px-cam.x,py,2,0,6.3);ctx.fill();
    }
  }
  ctx.globalAlpha=1;
  /* indikator kekuatan */
  var bw=54,bx=VW/2-bw/2,by=12;
  ctx.fillStyle='rgba(0,0,0,.4)';rr(ctx,bx,by,bw,9,4.5);ctx.fill();
  ctx.fillStyle=k>0.85?'#e8452f':(k>0.55?'#ffb020':'#63d68c');
  rr(ctx,bx+1.5,by+1.5,(bw-3)*k,6,3);ctx.fill();
  ctx.fillStyle='#fff';ctx.font='900 6.5px system-ui';ctx.textAlign='center';
  ctx.fillText('KEKUATAN '+Math.round(k*100)+'%',VW/2,by+22);
  ctx.textAlign='left';
}
function draw(){
  ctx.setTransform(PX,0,0,PX,0,0);
  ctx.clearRect(0,0,VW,VH);
  drawSky();
  ctx.save();
  var sx=0,sy=0;
  if(cam.shake>0.2){sx=rnd(-1,1)*cam.shake;sy=rnd(-1,1)*cam.shake}
  ctx.translate(sx,sy);
  drawGround();
  drawSling();
  var i;
  for(i=0;i<bodies.length;i++)if(!bodies[i].dead)drawBlock(bodies[i]);
  for(i=0;i<pigs.length;i++){var p=pigs[i];if(!p.dead)drawPig(p.x-cam.x,p.y,p.r,p);}
  drawTrail();
  drawSlingBand();
  if(bird&&bird.alive&&(birdState==='idle'||birdState==='fly')){
    var ang=birdState==='fly'?clamp(bird.vy*0.06,-0.6,0.9):0;
    ctx.save();
    ctx.translate(bird.x-cam.x,bird.y);
    ctx.rotate(ang);
    drawBirdObj(ctx,bird.r);
    ctx.restore();
  }
  drawParts();
  drawPops();
  ctx.restore();
  drawAim();
  if(state==='play'&&birdState==='idle'&&!dragging){
    ctx.fillStyle='rgba(255,255,255,.9)';ctx.font='900 8px system-ui';ctx.textAlign='center';
    ctx.fillText('◀ TARIK BURUNG KE ARAH BERLAWANAN',VW/2,VH-14);
    ctx.textAlign='left';
  }
}
function drawBirdObj(x,r){
  x.fillStyle='#c8281a';x.beginPath();x.arc(0,0,r,0,6.3);x.fill();
  var g=x.createRadialGradient(-r*0.35,-r*0.4,1,0,0,r);
  g.addColorStop(0,'#ff9d8a');g.addColorStop(0.6,'#e8452f');g.addColorStop(1,'#a81c10');
  x.fillStyle=g;x.beginPath();x.arc(0,0,r,0,6.3);x.fill();
  x.fillStyle='#a81c10';
  x.beginPath();x.moveTo(-r*0.82,-r*0.3);x.lineTo(-r*1.7,-r*0.9);x.lineTo(-r*1.6,r*0.2);x.closePath();x.fill();
  x.beginPath();x.moveTo(-r*0.2,-r*1.02);x.lineTo(0,-r*1.9);x.lineTo(r*0.34,-r*1.0);x.closePath();x.fill();
  x.fillStyle='#fff';
  x.beginPath();x.arc(r*0.34,-r*0.28,r*0.34,0,6.3);x.fill();
  x.beginPath();x.arc(r*0.62,-r*0.28,r*0.28,0,6.3);x.fill();
  x.fillStyle='#1b1b22';
  x.beginPath();x.arc(r*0.4,-r*0.28,r*0.16,0,6.3);x.fill();
  x.beginPath();x.arc(r*0.66,-r*0.28,r*0.15,0,6.3);x.fill();
  x.strokeStyle='#7a1209';x.lineWidth=r*0.2;
  x.beginPath();x.moveTo(r*0.14,-r*0.66);x.lineTo(r*0.62,-r*0.5);x.stroke();
  x.fillStyle='#ffb020';
  x.beginPath();x.moveTo(r*0.72,r*0.04);x.lineTo(r*1.5,r*0.24);x.lineTo(r*0.7,r*0.46);x.closePath();x.fill();
  x.fillStyle='#e08a12';
  x.beginPath();x.moveTo(r*0.72,r*0.26);x.lineTo(r*1.4,r*0.3);x.lineTo(r*0.7,r*0.46);x.closePath();x.fill();
  x.fillStyle='#ffe0b0';
  x.beginPath();x.ellipse(r*0.2,r*0.44,r*0.5,r*0.36,0,0,6.3);x.fill();
}

/* ══════════ HUD & OVERLAY ══════════ */
var hc={lvl:-1,score:-1,pigs:-1,blk:-1,birds:-1};
function hud(){
  if(hc.lvl!==level){hc.lvl=level;var e=$('lvl');if(e)e.textContent=level+1}
  if(hc.score!==score){hc.score=score;var s=$('score');if(s)s.textContent=score}
  var pa=pigsAlive();
  if(hc.pigs!==pa){hc.pigs=pa;var p=$('pigs');if(p)p.textContent=pa}
  var ba=blocksAlive();
  if(hc.blk!==ba){hc.blk=ba;var b=$('blocks');if(b)b.textContent=ba}
  if(hc.birds!==birdsLeft){
    hc.birds=birdsLeft;
    var ic=$('birdIcons');if(ic){
      var n=L()[level].birds,hh='',i;
      for(i=0;i<n;i++)hh+='<i class="'+(i<birdsLeft?'':'used')+'"></i>';
      ic.innerHTML=hh;
    }
  }
}
var bannerT=0,bannerTxt='';
function showBanner(t,s){var b=$('banner');bannerTxt=t;b.innerHTML=t+(s?'<small>'+s+'</small>':'');b.classList.add('show');bannerT=tick}
function hideBanner(){var b=$('banner');if(b)b.classList.remove('show')}
function ovShow(icon,title,text,stats,buttons,stars){
  var o=$('ov');if(!o)return;
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var st=$('stars');
  if(stars){
    st.style.display='block';
    var h='',i;
    for(i=0;i<3;i++)h+='<i class="'+(i<stars?'on':'')+'">★</i>';
    st.innerHTML=h;
  }else st.style.display='none';
  var sb=$('ovStats');sb.innerHTML='';
  if(stats&&stats.length){for(var j=0;j<stats.length;j++)sb.innerHTML+='<div><b>'+stats[j][1]+'</b><span>'+stats[j][0]+'</span></div>';sb.style.display='grid'}
  else sb.style.display='none';
  var bs=$('ovBtns');bs.innerHTML='';
  for(var k=0;k<buttons.length;k++){var b=buttons[k];bs.innerHTML+='<button class="sbtn'+(b.cls?' '+b.cls:'')+'" type="button" data-act="'+b.act+'">'+b.label+'</button>'}
  o.classList.remove('hide');
}
function ovHide(){var o=$('ov');if(o)o.classList.add('hide')}
function levelSelect(){
  state='menu';hideBanner();
  var lv=L(),grid='<div class="lvGrid">',i;
  for(i=0;i<lv.length;i++){
    var s=bestStars[i]||0,stars='';
    for(var j=0;j<3;j++)stars+=j<s?'★':'☆';
    grid+='<button class="lvt" type="button" data-lv="'+i+'">'+(i+1)+'<small>'+lv[i].pigs.length+' BABI</small><span class="st">'+(s?stars:'')+'</span></button>';
  }
  grid+='</div>';
  ovShow('🐦','SLING BIRDS',
    'Tarik burung di katapel, bidik, lepas. Hancurkan <b>semua babi hijau</b>.<br><br><b>Batu</b> butuh pukulan keras, <b>es</b> pecah paling gampang, <b>kayu</b> sedang. Babi bisa mati kejatuhan blok.<br><br>Pilih level:',
    [['LEVEL',lv.length],['BURUNG','3-5'],['SKOR','+5000']],
    [{act:'help',label:'❔ CARA MAIN'}]);
  /* kisi level harus BENAR-BENAR dipasang ke halaman, kalau tidak pemain tidak punya tombol mulai */
  var tx=$('ovText');if(tx)tx.innerHTML+=grid;
  var o=$('ov');o.classList.remove('hide');
  var g=D.querySelector('.lvGrid');
  if(g)g.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-lv]'):null;
    if(!b)return;
    ensureAC();sfx.click();
    startLevel(parseInt(b.getAttribute('data-lv'),10));
  });
  $('ovTitle').textContent='SLING BIRDS';
}
function help(){
  ovShow('📖','CARA MAIN',
    '<b>CARA MENEMBAK:</b><br><b>1.</b> Tombol <b>◀ ▶</b> (kiri bawah) untuk membidik sudut tembakan.<br><b>2.</b> <b>TAHAN</b> tombol <b>🎯 TARIK</b> — makin lama ditahan, tali makin jauh tertarik dan kekuatan makin besar (lihat bilah <i>KEKUATAN</i> di atas layar).<br><b>3.</b> <b>LEPAS</b> tombolnya untuk meluncur. Tarikan terlalu pendek = batal (burung tidak terpakai). Bisa juga geser burung langsung di layar kalau mau.<br><b>4.</b> Garis titik menunjukkan lintasan perkiraan.<br><br><b>Tip:</b> pukul <b>kaki tiang</b> supaya menara roboh, bukan atapnya. Blok yang jatuh menimpa babi langsung membunuhnya. Es paling rapuh; batu perlu 3-4 pukulan.<br><br>Keyboard: <b>←→↑↓</b> menggeser bidikan, <b>SPASI</b> melepas, <b>R</b> ulang level, <b>N</b> level berikutnya.',
    null,[{act:'levels',label:'◀ PILIH LEVEL'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';
  ovShow('⏸️','JEDA','Level '+(level+1)+' ditunda.',[['SKOR',score],['BABI',pigsAlive()],['BURUNG',birdsLeft]],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'retry',label:'↻ ULANG'},{act:'levels',label:'⏹ LEVEL'}]);
}

/* ══════════ SENTUHAN ══════════ */
function toWorld(cx,cy){
  var r=cv.getBoundingClientRect();
  var x=(cx-r.left)/r.width*VW,y=(cy-r.top)/r.height*VH;
  return{x:x,y:y};
}
function canDrag(){return state==='play'&&birdState==='idle'&&bird&&bird.alive&&birdsLeft>0}
function beginDrag(wx,wy){
  if(!canDrag())return false;
  var d=Math.abs(wx-(bird.x-cam.x))+Math.abs(wy-bird.y);
  if(d>64)return false;
  dragging=true;dragX=bird.x;dragY=bird.y;
  return true;
}
function moveDrag(wx,wy){
  if(!dragging||!bird)return;
  var dx=wx-(SLING.x-cam.x),dy=wy-(SLING.y-14);
  var d=Math.sqrt(dx*dx+dy*dy),maxD=72;
  if(d>maxD){dx=dx/d*maxD;dy=dy/d*maxD}
  if(dx>10){dx=10;dy=dy*0.4}
  dragX=SLING.x+dx;dragY=(SLING.y-14)+dy;
  bird.x=dragX;bird.y=dragY;
  if(tick%6===0)sfx.stretch();
}
function endDrag(){
  if(!dragging||!bird)return;
  dragging=false;
  var dx=(SLING.x-cam.x)-(dragX-cam.x),dy=(SLING.y-14)-dragY;
  var d=Math.sqrt(dx*dx+dy*dy);
  if(d<8){bird.x=SLING.x;bird.y=SLING.y-14;return}
  bird.vx=dx*0.175;bird.vy=dy*0.175;
  birdState='fly';bird.trail=[];
  birdsLeft--;
  var h=$('hint');if(h)h.className='hint hide';
  sfx.launch();
  hud();
}
/* ── BIDIK & TARIK DENGAN TOMBOL ── ◀ ▶ membidik, TARIK ditahan supaya tali makin jauh
   tertarik (kekuatan naik), lepas = meluncur. Geser burung di layar tetap bisa dipakai. */
var AIM_MIN=98,AIM_MAX=172,AIM_STEP=3,AIM_REP=76;   /* 3° per ketukan: cukup halus untuk membidik babi sebesar 19 px, tahan = menyapu cepat */
var AIM_DEF=145,PULL_MAX=72,PULL_MIN=14,PULL_RATE=1.15;
var aimDeg=AIM_DEF,pullLen=0,charging=false;
/* CATATAN: nama ini TIDAK boleh "resetBird" — nama itu sudah dipakai fungsi pembuat
   burung di atas; kalau bentrok, burung tidak pernah dibuat dan game jadi tanpa burung. */
function parkBird(){if(bird){bird.x=SLING.x;bird.y=SLING.y-14}}
function applyPull(){
  var a=aimDeg*Math.PI/180,dx=Math.cos(a)*pullLen,dy=Math.sin(a)*pullLen;
  dragX=SLING.x+dx;dragY=(SLING.y-14)+dy;
  if(bird){bird.x=dragX;bird.y=dragY}
  if(tick%7===0)sfx.stretch();
}
function aimBy(d,snd){
  if(!canDrag()&&!charging)return;
  var before=aimDeg;
  aimDeg=clamp(aimDeg+d,AIM_MIN,AIM_MAX);
  if(dragging)applyPull();
  if(snd&&aimDeg!==before)sfx.click();
}
function startCharge(){
  if(charging)return true;
  if(!canDrag())return false;
  charging=true;dragging=true;pullLen=0;
  dragX=SLING.x;dragY=SLING.y-14;
  if(bird){bird.x=dragX;bird.y=dragY}
  dragLockPage(true);
  return true
}
function releaseCharge(){
  if(!charging)return;
  charging=false;dragLockPage(false);
  if(pullLen<PULL_MIN){dragging=false;parkBird();pullLen=0;return}   /* tarikan terlalu pendek: burung tidak terpakai */
  applyPull();
  endDrag();                        /* meluncur memakai tarikan terakhir */
  pullLen=0;
}
function cancelCharge(){
  charging=false;pullLen=0;
  if(dragging){dragging=false;parkBird()}
  padClear();
}
function padClear(){
  var ids=['bAimL','bAimR','bPull'],i,el;
  for(i=0;i<ids.length;i++){
    el=$(ids[i]);if(!el)continue;
    if(el.__rep){clearInterval(el.__rep);el.__rep=null}
    el.classList.remove('active');
    var pid=el.__pid;el.__pid=null;
  }
}
function pullBtns(){
  var ok=(canDrag()||charging),ids=['bAimL','bAimR','bPull'],i,el;
  for(i=0;i<ids.length;i++){
    el=$(ids[i]);if(!el)continue;
    if(ok)el.classList.remove('cool');else el.classList.add('cool');
  }
}
/* satu tombol: tekan sejak jari MENYENTUH (menu tekan-lama WhatsApp tidak sempat muncul),
   pointerId dijaga per tombol, dan boleh berulang selama ditahan. */
function holdBtn(id,on,off,rep){
  var el=$(id);if(!el)return;
  function stopRep(){if(el.__rep){clearInterval(el.__rep);el.__rep=null}}
  function press(e){
    if(e.button)return;
    dragClaim(e);ensureAC();
    if(el.__pid!==null&&el.__pid!==undefined)return;
    el.__pid=e.pointerId;
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    el.classList.add('active');
    on(true);
    if(rep){stopRep();el.__rep=setInterval(function(){if(el.__pid!==null&&el.__pid!==undefined)on(false)},rep)}
  }
  function rel(e){
    if(el.__pid===null||el.__pid===undefined)return;
    if(e&&e.pointerId!==undefined&&e.pointerId!==el.__pid)return;
    try{el.releasePointerCapture(el.__pid)}catch(err){}
    el.__pid=null;stopRep();el.classList.remove('active');
    off();
  }
  el.addEventListener('pointerdown',press,{passive:false});
  el.addEventListener('pointerup',rel);el.addEventListener('pointercancel',rel);
  D.addEventListener('pointerup',rel);D.addEventListener('pointercancel',rel);
  el.addEventListener('touchmove',function(e){if(e.cancelable)e.preventDefault()},{passive:false});
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
/* gesture eksklusif: saat menarik ketapel / menahan tombol, halaman/chat tidak boleh ikut
   tergulir. Kunci hanya selama jari menempel, lalu dicabut supaya scroll normal kembali.
   Dipakai bersama beberapa pemegang (geser layar + tombol), jadi memakai penghitung. */
var dragDocLock=null,pageLockN=0,stageLocked=false;
function dragClaim(e){
  if(e.cancelable&&!e.defaultPrevented)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
}
function dragLockPage(on){
  pageLockN+=on?1:-1;if(pageLockN<0)pageLockN=0;
  if(pageLockN>0){
    if(!dragDocLock){
      dragDocLock=function(e){if(e.cancelable)e.preventDefault()};
      D.addEventListener('touchmove',dragDocLock,{passive:false});
    }
  }else if(dragDocLock){D.removeEventListener('touchmove',dragDocLock,{passive:false});dragDocLock=null}
}
function pageLockReset(){
  pageLockN=0;
  if(dragDocLock){D.removeEventListener('touchmove',dragDocLock,{passive:false});dragDocLock=null}
}
function bind(){
  var st=$('stage');
  st.addEventListener('pointerdown',function(e){
    ensureAC();
    if(state==='menu'||state==='done'||state==='dead')return;
    if(charging)return;                          /* sedang menarik lewat tombol TARIK */
    var p=toWorld(e.clientX,e.clientY);
    if(beginDrag(p.x,p.y)){dragClaim(e);try{st.setPointerCapture(e.pointerId)}catch(err){}dragLockPage(true);stageLocked=true}
  },{passive:false});
  st.addEventListener('pointermove',function(e){
    if(!dragging)return;
    dragClaim(e);
    var p=toWorld(e.clientX,e.clientY);
    moveDrag(p.x,p.y);
  },{passive:false});
  var releaseStageLock=function(){if(stageLocked){dragLockPage(false);stageLocked=false}};
  var up=function(e){
    if(!dragging)return;
    if(e&&e.clientX!==undefined){var p=toWorld(e.clientX,e.clientY);moveDrag(p.x,p.y)}
    endDrag();releaseStageLock();
  };
  st.addEventListener('pointerup',up);
  st.addEventListener('pointercancel',up);
  st.addEventListener('pointerleave',function(){if(dragging){endDrag()}releaseStageLock()});
  /* jaring pengaman WebView lama — hanya di area permainan, bukan seluruh halaman */
  st.addEventListener('touchmove',function(e){dragClaim(e)},{passive:false});
  D.addEventListener('visibilitychange',function(){if(D.hidden){pageLockReset();cancelCharge()}});
  if(window.addEventListener)window.addEventListener('blur',function(){pageLockReset();cancelCharge()});
  /* tombol bidik + tombol tarik (pengganti tarikan jari) */
  holdBtn('bAimL',function(first){aimBy(-AIM_STEP,first)},function(){},AIM_REP);
  holdBtn('bAimR',function(first){aimBy(AIM_STEP,first)},function(){},AIM_REP);
  holdBtn('bPull',function(){startCharge()},function(){releaseCharge()},0);
  pullBtns();
  st.addEventListener('contextmenu',function(e){e.preventDefault()});
  var ov=$('ov');
  ov.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='next'){if(level<L().length-1)startLevel(level+1);else levelSelect()}
    else if(a==='retry')restart();
    else if(a==='levels')levelSelect();
    else if(a==='help')help();
    else if(a==='resume'){state='play';ovHide()}
  });
  var mb=$('muteB');
  mb.addEventListener('click',function(){muted=!muted;if(master)master.gain.value=muted?0:0.5;mb.textContent=muted?'🔇':'🔊'});
  /* tombol jeda bisa disentuh (di WhatsApp tidak ada papan kunci) */
  var pb=$('pauseB');
  pb.addEventListener('click',function(){
    ensureAC();
    if(state==='play'){sfx.click();pause()}
    else if(state==='pause'){sfx.click();state='play';ovHide()}
    else if(state==='dead'||state==='done'){sfx.click();restart()}
  });
  var kx=0,ky=0;
  D.addEventListener('keydown',function(e){
    ensureAC();
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){if(canDrag()){if(!dragging){dragging=true;dragX=bird.x;dragY=bird.y}kx-=5;moveDrag(SLING.x-cam.x+kx,(SLING.y-14)+ky);e.preventDefault()}}
    else if(k==='arrowright'||k==='d'){if(canDrag()){if(!dragging){dragging=true;dragX=bird.x;dragY=bird.y}kx+=5;moveDrag(SLING.x-cam.x+kx,(SLING.y-14)+ky);e.preventDefault()}}
    else if(k==='arrowup'||k==='w'){if(canDrag()){if(!dragging){dragging=true;dragX=bird.x;dragY=bird.y}ky-=5;moveDrag(SLING.x-cam.x+kx,(SLING.y-14)+ky);e.preventDefault()}}
    else if(k==='arrowdown'||k==='s'){if(canDrag()){if(!dragging){dragging=true;dragX=bird.x;dragY=bird.y}ky+=5;moveDrag(SLING.x-cam.x+kx,(SLING.y-14)+ky);e.preventDefault()}}
    else if(k===' '){e.preventDefault();if(canDrag()){if(!dragging){dragging=true;dragX=SLING.x-56;dragY=(SLING.y-14)-20;bird.x=dragX;bird.y=dragY}endDrag()}}
    else if(k==='r'){if(state==='play'||state==='dead'||state==='done'||state==='pause')restart()}
    else if(k==='n'){if(state==='done'||state==='play'){if(level<L().length-1)startLevel(level+1)}}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause'){state='play';ovHide()}}
    else if(k==='m'){if(mb)mb.click()}
  },{passive:false});
  D.addEventListener('keyup',function(){
    if(dragging&&state==='play'&&(birdState==='idle')){endDrag();kx=0;ky=0}
  });
  D.addEventListener('visibilitychange',function(){if(D.hidden&&state==='play')pause()});
  if(window.addEventListener)window.addEventListener('resize',fit);
}

/* ══════════ LOOP ══════════ */
var last=0,acc=0,FIXED=1000/60;
function loop(now){
  requestAnimationFrame(loop);
  if(!last)last=now;
  var dt=now-last;last=now;
  if(dt>120)dt=120;
  acc+=dt;
  var g=0;
  while(acc>=FIXED&&g<5){step();acc-=FIXED;g++}
  if(g>=5)acc=0;
  draw();
}

/* ══════════ BOOT ══════════ */
fit();bakeClouds();bind();loadLevel(0);levelSelect();
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',fit);
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);
if(typeof window!=='undefined'){
  window.__SB={
    get aim(){return{deg:+aimDeg.toFixed(1),len:+pullLen.toFixed(1),charging:charging,dragging:dragging,
      launchVX:+((SLING.x-dragX)*0.175).toFixed(2),launchVY:+(((SLING.y-14)-dragY)*0.175).toFixed(2)}},
    aimTo:function(d){aimDeg=clamp(d,AIM_MIN,AIM_MAX);if(dragging)applyPull();return aimDeg},
    aimStep:function(d){aimBy(d||AIM_STEP,false);return aimDeg},
    beginCharge:function(){return startCharge()},
    endCharge:function(){releaseCharge()},
    setCharge:function(v){pullLen=clamp(v,0,PULL_MAX);dragging=true;applyPull();return pullLen},
    get s(){return{state:state,tick:tick,level:level+1,score:score,birdsLeft:birdsLeft,birdState:birdState,
      pigs:pigsAlive(),blocks:blocksAlive(),parts:parts.length,camX:+cam.x.toFixed(1),
      drag:dragging,birdX:bird?+bird.x.toFixed(1):0,birdY:bird?+bird.y.toFixed(1):0,
      birdVX:bird?+bird.vx.toFixed(2):0,birdVY:bird?+bird.vy.toFixed(2):0,
      stars:bestStars.slice(0)}},
    get pigsObj(){return pigs},
    get blocks(){return bodies},
    get birdObj(){return bird},
    overlapAt:function(a,b){return overlap(a,b)},
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:startLevel,levels:levelSelect,
    drag:function(dx,dy){
      if(!canDrag())return false;
      dragging=true;dragX=SLING.x+dx;dragY=(SLING.y-14)+dy;
      bird.x=dragX;bird.y=dragY;
      return true
    },
    release:function(){endDrag()},
    shoot:function(dx,dy){if(this.drag(dx,dy)){this.release()}},
    /* luncurkan dengan vektor kecepatan langsung (memudahkan pengujian) */
    launch:function(vx,vy){
      if(!canDrag())return false;
      var dx=-vx/0.175,dy=-vy/0.175;
      var d=Math.sqrt(dx*dx+dy*dy),maxD=72;
      if(d>maxD){dx=dx/d*maxD;dy=dy/d*maxD}
      dragging=true;
      dragX=SLING.x+dx;dragY=(SLING.y-14)+dy;
      bird.x=dragX;bird.y=dragY;
      endDrag();
      return true
    },
    pigCount:function(){return pigsAlive()},
    blockCount:function(){return blocksAlive()},
    killPig:function(i){if(pigs[i])kill(pigs[i],'test')},
    overlaps:function(){
      var out=[],all=[];var i,j;
      for(i=0;i<bodies.length;i++)if(!bodies[i].dead)all.push(bodies[i]);
      for(i=0;i<pigs.length;i++)if(!pigs[i].dead)all.push(pigs[i]);
      for(i=0;i<all.length;i++)for(j=i+1;j<all.length;j++){
        var h=overlap(all[i],all[j]);
        if(h)out.push({a:all[i].type,b:all[j].type,pen:+h.pen.toFixed(2)});
      }
      return out
    },
    get pigsNow(){return pigs},
    killLog:function(){return killLog.slice()},
    clearLog:function(){killLog.length=0},
    forceBlock:function(x,y,w,h,t){var b=mkBody(x-w/2,y-h/2,w,h,t||'wood');bodies.push(b);return b},
    forcePig:function(x,y){var p=mkPig(x,y);pigs.push(p);return p},
    scoreVal:function(){return score},
    loadLevel:loadLevel,
    autoShoot:function(){ /* bidik otomatis: sudut 42 derajat, kekuatan penuh */
      var a=-0.72,d=72;
      if(!canDrag())return false;
      dragging=true;dragX=SLING.x-Math.cos(a)*d;dragY=(SLING.y-14)-Math.sin(a)*d;
      bird.x=dragX;bird.y=dragY;
      endDrag();return true
    }
  };
}
})();
</script>
<script>
/* nano-tap-fast: tombol balas SEKETIKA saat jari menyentuh, bukan saat jari diangkat —
   supaya ambang tekan-lama WhatsApp (~0,5 dtk) tidak pernah tercapai sehingga menu
   "Hapus/Teruskan" tidak sempat muncul. Klik asli sesudahnya dimatikan agar tidak dobel. */
(function(){var D=document,sup=false,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit)/i;
function hit(el){for(var n=el,k=0;n&&n!==D.body&&k<5;n=n.parentElement,k++){var tn=n.tagName;
if(tn==='BUTTON'||tn==='A'||tn==='SUMMARY')return true;
if(n.getAttribute&&n.getAttribute('role')==='button')return true;
if(n.className&&typeof n.className==='string'&&PAD.test(n.className))return true}return false}
/* Satu ketukan = satu aksi: klik buatan kita dibedakan dari klik asli lewat isTrusted,
   jadi urutan keduanya tidak lagi bisa membuat aksi jalan dua kali. */
var g=null;
D.addEventListener('pointerdown',function(e){if(e.button)return;var t=e.target;
if(!t||!t.dispatchEvent||!hit(t))return;
if(t.closest&&t.closest('textarea,input,select,[contenteditable]'))return;
var x=e.clientX,y=e.clientY,gg={done:0};g=gg;
setTimeout(function(){
if(gg.done)return;gg.done=1;if(e.defaultPrevented)return;syn=true;
try{t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}))}catch(err){}
syn=false;setTimeout(function(){if(g===gg)g=null},700)},0)},true);
D.addEventListener('click',function(e){
if(syn||!g)return;var gg=g;g=null;
if(!gg.done){gg.done=1;return}
if(e.isTrusted){e.stopPropagation();e.preventDefault()}},true)})();
</script>
<style>
button,[role="button"],a,.btn,.key,.pad,.tab,.lvt,.chip,.cell,.tile,.card{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
canvas{touch-action:none}
</style>
<!-- nano-polish -->
<style>
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.key,.pad,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
button:active,[role="button"]:active,.btn:active,.key:active,.pad:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(255,209,102,.35)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(255,209,102,.3);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
html::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;background-image:radial-gradient(122% 82% at 16% -12%,rgba(255,255,255,.07),rgba(255,255,255,0) 58%),radial-gradient(132% 112% at 92% 118%,rgba(0,0,0,.24),rgba(0,0,0,0) 62%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");background-size:auto,auto,160px 160px}
.sbtn,.lvt,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -3px 5px rgba(0,0,0,.4),0 4px 0 rgba(0,0,0,.42),0 8px 16px rgba(0,0,0,.34)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.16),inset 0 -8px 20px rgba(0,0,0,.24),0 16px 34px rgba(0,0,0,.34)!important}
.stage canvas{filter:saturate(1.06) contrast(1.03)}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🐦', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Sling Birds 🐦',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-slingbirds-2026',
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

handler.help = ['slingbirds', 'slingshot', 'angrybirds', 'bird']
handler.tags = ['game']
handler.command = /^(slingbirds|slingshot|angrybirds|bird)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Sling Birds Nano Ai - katapel fisika hancurkan babi'

export default handler
