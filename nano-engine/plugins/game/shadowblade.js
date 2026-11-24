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
┇▫️Nama    : SHADOW BLADE — Nano Ai Arcade
┇▫️Genre   : Aksi ninja / Melee platformer
┇▫️Author  : Danz nano & Awang Ofc
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
<meta name="theme-color" content="#0a0508">
<title>Nano Ai Shadow Blade</title>
<style>
:root{--bg:#0a0508;--panel:#160b12;--line:#4a2436;--text:#fdeef2;--dim:#c39aa8;--gold:#ffcf6e;--red:#ff4d63;--blood:#8d1024;--jade:#66f0b0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(760px 430px at 50% -12%,#4a1226 0%,#1c0a14 54%,#080406 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#2a1220,#12070d);border:1px solid #5c2b3d;border-radius:22px;padding:10px;box-shadow:0 30px 80px #000d,inset 0 1px 0 #ffffff14;touch-action:manipulation}
.head{position:relative;z-index:9;display:flex;align-items:center;justify-content:space-between;gap:9px;background:#140910;border:1px solid #45202f;border-radius:14px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#ffcf6e,#ff4d63 58%,#6a1030);border:1px solid #a0566e;color:#2a0810;font:950 15px system-ui;box-shadow:0 4px 0 #2a0a14,inset 0 1px 0 #ffffff8c}
.brandText{min-width:0}
.title{font-size:16px;font-weight:950;letter-spacing:1.1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(90deg,#ffe6a8,#ff9db1 62%,#ff6b83);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.headBtns{display:flex;gap:6px;flex:none}
.mb{width:38px;height:38px;flex:none;border:1px solid #55283a;border-radius:10px;background:linear-gradient(180deg,#3a1626,#180a12);color:#fbdfe7;font-size:16px;box-shadow:0 3px 0 #10060b}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#120810;border:1px solid #3d1c2b;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hpWrap{display:flex;align-items:center;gap:5px;flex:1 1 120px;min-width:108px}
.hpWrap b{font-size:6.6px;letter-spacing:.14em;color:var(--dim)}
.hpBar{position:relative;flex:1;height:11px;border-radius:6px;background:#2c1018;border:1px solid #7a2c3c;overflow:hidden;box-shadow:inset 0 2px 4px #000a}
.hpBar i{position:absolute;inset:0 auto 0 0;width:100%;border-radius:6px 0 0 6px;background:linear-gradient(180deg,#ffb3c0,#ff5d73 58%,#a3102a);transition:width .16s ease}
.hpBar.low i{background:linear-gradient(180deg,#ffe6a8,#ffab3a 60%,#a8590a)}
.hpBar.crit i{animation:pulseHp .7s infinite}
@keyframes pulseHp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6)}}
.hpNum{font:900 10px system-ui;color:#ffd6de;min-width:20px;text-align:right}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#1a0c16;border:1px solid #40202e;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:var(--dim)}
.hs span{font:900 10px system-ui;color:#ffd3dc;letter-spacing:.3px}
.hs.combo span{color:var(--gold)}
.hs.shur span{color:#bfe9ff}
.hs.fury span.ready{color:var(--jade)}.hs.fury span.wait{color:#c39aa8}
.furyBar{position:relative;flex:1 1 90px;height:8px;border-radius:5px;background:#26101a;border:1px solid #55283a;overflow:hidden}
.furyBar i{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#66f0b0,#ffcf6e);transition:width .2s ease}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #43202e;border-radius:15px;overflow:hidden;background:#080406;box-shadow:inset 0 10px 26px #000d,0 8px 22px #0009}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.prog{position:absolute;left:0;right:0;bottom:0;height:5px;background:#000000aa}
.prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ff4d63,#ffcf6e);box-shadow:0 0 10px #ff4d63aa;transition:width .2s ease}
.bossBar{position:absolute;left:8px;right:8px;top:7px;padding:5px 7px;border-radius:9px;background:#220a16e8;border:1px solid #8a2c4a;opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .25s ease;pointer-events:none}
.bossBar.show{opacity:1;transform:translateY(0)}
.bossBar b{display:block;font:900 6.8px system-ui;letter-spacing:.2em;color:#ffc2cf;margin-bottom:3px}
.bossBar .bb{height:7px;border-radius:4px;background:#2c1018;border:1px solid #7a2c3c;overflow:hidden}
.bossBar .bb i{display:block;height:100%;width:100%;background:linear-gradient(180deg,#ff9db1,#e03050 58%,#7a0c22);transition:width .18s ease}
.banner{position:absolute;left:0;right:0;top:32%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease,letter-spacing .4s ease;font:950 17px system-ui;letter-spacing:.06em;color:#fff0f4;text-shadow:0 3px 0 #000000a0,0 0 18px #ff4d638c}
.banner.show{opacity:1;letter-spacing:.16em}
.banner small{display:block;margin-top:5px;font:800 8px system-ui;letter-spacing:.2em;color:#ffc2cf}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#080406d9;backdrop-filter:blur(9px);padding:12px;border-radius:22px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,366px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #6a3348;border-radius:17px;background:linear-gradient(180deg,#2a1220,#100609);box-shadow:0 20px 46px #000a,inset 0 1px 0 #ffffff1c;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-size:20px;font-weight:950;letter-spacing:.5px}
.ovText{margin-top:6px;color:var(--dim);font-size:9px;line-height:1.5}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #4a2436;border-radius:9px;background:#1a0c16}
.ovStats b{display:block;font-size:12px;color:#ffd6b0}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sbtn{min-height:38px;border:1px solid #5c2a3d;border-radius:10px;background:linear-gradient(180deg,#3a1626,#1a0a12);color:#fdeef2;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #10060b,inset 0 1px 0 #ffffff1c;touch-action:manipulation}
.sbtn.go{border-color:#ffcf6e;background:linear-gradient(180deg,#c9a04a,#6a4a10);color:#221602;box-shadow:0 4px 0 #2a1c06,inset 0 1px 0 #fff6}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #10060b}
.pad{margin-top:9px;display:grid;grid-template-columns:1.05fr 1fr;gap:9px;align-items:end}
.movePad{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:58px 44px;gap:6px;touch-action:none}
.movePad .mbtn{min-height:0;padding:2px;font-size:19px}
.mbtn.down{grid-column:1/3}
/* area tombol arah: gesture eksklusif — jari di sini tidak boleh menggulir halaman */
.nano-analog{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;overscroll-behavior:contain}
body .pad:active{transform:none!important}
.mbtn{min-height:56px;border:1px solid #5c2a3d;border-radius:13px;background:linear-gradient(180deg,#3d1828,#1c0a13);color:#fdeef2;font:900 19px system-ui;box-shadow:0 5px 0 #10060b,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none;display:grid;place-items:center}
.mbtn small{display:block;font-size:6px;letter-spacing:.14em;color:#d3a3b2;margin-top:1px}
.mbtn.active{transform:translateY(3px);box-shadow:0 2px 0 #10060b;filter:brightness(1.2)}
.actPad{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.abtn{min-height:44px;border:1px solid #6a3348;border-radius:13px;background:linear-gradient(180deg,#3d1828,#1a0a12);color:#fdeef2;font:900 8px system-ui;letter-spacing:.06em;box-shadow:0 5px 0 #10060b,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none}
.abtn.slash{grid-column:1/3;grid-row:3;min-height:74px;border-radius:50%;border:2px solid #ffd9a0;background:radial-gradient(circle at 35% 28%,#fff0d0,#ffb03a 46%,#c01f3a 80%,#4a0a18);color:#2a0806;font:950 12px system-ui;letter-spacing:.1em;box-shadow:0 7px 0 #2a0a14,0 0 26px #ff4d635c,inset 0 2px 0 #ffffff66}
.abtn.jump{background:linear-gradient(180deg,#2f5f52,#123028);border-color:#57c9a2}
.abtn.dash{background:linear-gradient(180deg,#4a2a72,#1e0f3a);border-color:#a06bff}
.abtn.shur{background:linear-gradient(180deg,#2a4f6a,#0f2233);border-color:#5cb8ff}
.abtn.fury{background:linear-gradient(180deg,#6a4a10,#2a1c06);border-color:#ffcf6e;color:#ffe6b8}
.abtn.active{transform:translateY(4px);box-shadow:0 2px 0 #10060b;filter:brightness(1.2)}
.abtn.cool{opacity:.45;filter:saturate(.35)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#a8828f;font-size:6.4px}
.foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot kbd{padding:2px 4px;border:1px solid #4a2436;border-radius:4px;background:#1a0c16;color:#e2b6c2;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px;border-radius:19px}.title{font-size:14px}.logo{width:35px;height:35px;font-size:13px}.mbtn{min-height:50px}.abtn.slash{min-height:64px;font-size:10.5px}.ovTitle{font-size:17px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px;border-radius:24px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">SB</div>
        <div class="brandText"><div class="title">SHADOW BLADE</div><div class="sub" id="stageSub">SEKTOR 01 • NANO AI ARCADE</div></div>
      </div>
      <div class="headBtns">
        <button class="mb" id="pauseB" type="button" aria-label="Jeda">⏸</button>
        <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
      </div>
    </div>

    <div class="hud">
      <div class="hpWrap"><b>DARAH</b><div class="hpBar" id="hpBar"><i id="hpFill"></i></div><span class="hpNum" id="hpTxt">100</span></div>
      <div class="hs"><b>SKOR</b><span id="score">0</span></div>
      <div class="hs"><b>NYAWA</b><span id="lives">3</span></div>
      <div class="hs combo"><b>KOMBO</b><span id="combo">0</span></div>
      <div class="hs shur"><b>SHURIKEN</b><span id="shur">12</span></div>
      <div class="hs"><b>AMARAH</b><div class="furyBar"><i id="furyFill"></i></div></div>
      <div class="hs fury"><b>DASH</b><span id="dashTxt" class="ready">SIAP</span></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="bossBar" id="bossBar"><b id="bossName">⚠ BOS</b><div class="bb"><i id="bossFill"></i></div></div>
      <div class="banner" id="banner"></div>
      <div class="prog"><i id="progFill"></i></div>
    </div>

    <div class="pad">
      <div class="movePad nano-analog" id="movePad">
        <button class="mbtn left" id="bLeft" type="button">◀<small>KIRI</small></button>
        <button class="mbtn right" id="bRight" type="button">▶<small>KANAN</small></button>
        <button class="mbtn down" id="bDown" type="button">▼<small>TUNDUK</small></button>
      </div>
      <div class="actPad">
        <button class="abtn jump" id="bJump" type="button">⤒ LOMPAT</button>
        <button class="abtn dash" id="bDash" type="button">↯ DASH</button>
        <button class="abtn shur" id="bShur" type="button">✦ SHURIKEN</button>
        <button class="abtn fury" id="bFury" type="button">🔥 AMARAH</button>
        <button class="abtn slash" id="bSlash" type="button">⚔ TEBAS</button>
      </div>
    </div>

    <div class="foot"><span>Tahan TEBAS = kombo 3 ayunan • ↯ DASH kebal • 🔥 AMARAH saat meterai penuh</span><span><kbd>←→</kbd> <kbd>SPACE</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>U</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">⚔️</div>
        <h2 class="ovTitle" id="ovTitle">SHADOW BLADE</h2>
        <p class="ovText" id="ovText">Pilih sektor, lalu tekan MULAI.</p>
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
function ri(a,b){return Math.floor(a+Math.random()*(b-a+1))}
function pick(a){return a[(Math.random()*a.length)|0]}
function sgn(v){return v<0?-1:(v>0?1:0)}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

var cv=$('cv'),ctx=cv.getContext('2d',{alpha:false});
var VW=480,VH=296,GY=252;
function fit(){
  var host=cv.parentNode||D.body;
  var w=host.clientWidth||VW;
  var dpr=Math.min(1.35,Math.max(1,window.devicePixelRatio||1));
  cv.width=Math.max(280,Math.round(w*dpr));
  cv.height=Math.max(170,Math.round(cv.width*VH/VW));
  if(cv.width/VW>2.6){cv.width=Math.round(2.6*VW);cv.height=Math.round(2.6*VH)}
  ctx.imageSmoothingEnabled=true;
  if(ctx.imageSmoothingQuality)ctx.imageSmoothingQuality='high';
}
/* ══════════ AUDIO ══════════ */
var AC=null,master=null,muted=false;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.48;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  var a=ensureAC();if(!a)return;var m=bus();if(!m)return;
  try{
    var t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(f1,t0);
    if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(24,f2),t0+dur);
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol||0.05),t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(m);o.start(t0);o.stop(t0+dur+0.02);
  }catch(e){}
}
function noise(dur,vol,f0,f1,delay){
  var a=ensureAC();if(!a)return;var m=bus();if(!m)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var s=a.createBufferSource();s.buffer=buf;
    var bp=a.createBiquadFilter();bp.type='lowpass';bp.frequency.setValueAtTime(f0||900,a.currentTime);
    if(f1)bp.frequency.exponentialRampToValueAtTime(Math.max(60,f1),a.currentTime+dur);
    var g=a.createGain();g.gain.value=vol||0.08;
    s.connect(bp);bp.connect(g);g.connect(m);s.start(a.currentTime+(delay||0));
  }catch(e){}
}
var sfx={
  slash:function(){noise(.09,.05,2600,900)},
  heavy:function(){noise(.16,.09,1900,400);tone(320,140,.12,.05,'sawtooth')},
  hit:function(){tone(220,120,.07,.04,'square');noise(.06,.04,1800,700)},
  kill:function(){noise(.24,.08,1500,200);tone(300,90,.16,.035,'square')},
  jump:function(){tone(340,760,.11,.04,'triangle')},
  dash:function(){tone(900,280,.14,.045,'sawtooth')},
  shur:function(){tone(1300,600,.07,.035,'triangle')},
  fury:function(){tone(180,900,.5,.07,'sawtooth');noise(.6,.1,1200,120)},
  boom:function(){noise(.5,.14,900,60);tone(120,40,.4,.06,'sawtooth')},
  pickup:function(){tone(760,1500,.14,.05,'triangle')},
  boss:function(){tone(150,70,.7,.07,'sawtooth');noise(.7,.09,700,90)},
  clear:function(){tone(660,1320,.3,.055,'triangle');tone(990,1980,.34,.045,'triangle',.16)},
  dead:function(){tone(460,70,.6,.06,'sawtooth')},
  click:function(){tone(880,660,.05,.035,'square')}
};
/* ══════════ STAGE ══════════ */
var STAGES=[
  {name:'ATAP KOTA',sub:'SEKTOR 01 • ATAP NEO-KIRANA',w:4200,pal:{sky:['#160a1e','#3a1236','#6a1e46'],far:'#2a1030',mid:'#3d1740',ground:'#1e0c1c',gold:'#ffcf6e',neon:'#ff4d63'},pool:['soldier','archer','ninja'],boss:{name:'PEDANG MERAH',kind:'blade',hp:300}},
  {name:'GERBANG BAMBU',sub:'SEKTOR 02 • HUTAN BAMBU',w:4400,pal:{sky:['#06170f','#0d3a26','#176b45'],far:'#0b2e1f',mid:'#12492f',ground:'#0a2016',gold:'#d8ffa8',neon:'#66f0b0'},pool:['archer','soldier','brute'],boss:{name:'PENJAGA BAMBU',kind:'golem',hp:340}},
  {name:'JALUR SALJU',sub:'SEKTOR 03 • GUNUNG SALJU',w:4600,pal:{sky:['#0c1424','#1e3358','#4a6ea8'],far:'#1a2a48',mid:'#28406e',ground:'#16233c',gold:'#e6f1ff',neon:'#9fd8ff'},pool:['soldier','ninja','mage'],boss:{name:'BAYANG DINGIN',kind:'shade',hp:380}},
  {name:'KUIL LAVA',sub:'SEKTOR 04 • KUIL API',w:4800,pal:{sky:['#240a06','#5c1a08','#a83c0c'],far:'#48160a',mid:'#6b240c',ground:'#2e1008',gold:'#ffcf6e',neon:'#ff7a3d'},pool:['brute','mage','ninja'],boss:{name:'ROH RUBUNG',kind:'kitsune',hp:420}},
  {name:'KUIL BULAN',sub:'SEKTOR 05 • ISTANA BULAN',w:5000,pal:{sky:['#0a0618','#1e1240','#3a2470'],far:'#170e34','mid':'#251a4e',ground:'#120a26',gold:'#ffe6a8',neon:'#c39bff'},pool:['ninja','brute','mage','archer'],boss:{name:'SHOGUN AKHIR',kind:'shogun',hp:500}}
];
/* ══════════ STATE ══════════ */
var state='menu',tick=0,mission=0,ST=STAGES[0];
var score=0,lives=3,kills=0,combo=0,comboT=0,bestCombo=0,fury=0,diff=1;
var enemies=[],bullets=[],eBullets=[],pots=[],drops=[],booms=[],parts=[],pops=[],plats=[],pending=[];
var bossRef=null,waveIdx=0,waveT=0,waveState='idle',waveQuota=0,killStart=0,fightT=0,spawnCd=0,stageDone=false;
var pendingKinds=[],WAVES=5,MAXALIVE=7;
var hitStop=0,cam={x:0,shake:0},bannerT=0,bannerEl=null;
var CLEAR_KEY='nano_sb_clear',cleared={};
try{var _c=localStorage.getItem(CLEAR_KEY);if(_c){var _a=_c.split(',');for(var _i=0;_i<_a.length;_i++)if(_a[_i])cleared[_a[_i]]=1}}catch(e){}
function markCleared(id){cleared[id]=1;try{var l=[],k;for(k in cleared)if(cleared[k])l.push(k);localStorage.setItem(CLEAR_KEY,l.join(','))}catch(e){}}
var FIXED=1/60,acc=0,last=0;
var G=1180,RUN=152,JUMP=-458,DASHV=520,DASH_T=13,DASH_CD=54;
var P={x:60,y:GY-28,w:16,h:28,vx:0,vy:0,onGround:false,face:1,crouch:false,
  hp:100,maxHp:100,inv:0,atkT:0,combo:0,comboT:0,shur:12,dashT:0,dashCd:0,djump:0,hurt:0,anim:0,
  dead:false,deadT:0,furyT:0,slashAnim:0,slashKind:0};
var input={ax:0,left:false,right:false,down:false};
var jumpBuf=0;
/* ══════════ LEVEL ══════════ */
function buildLevel(m){
  var i;ST=STAGES[m];
  plats=[{x:0,y:GY,w:ST.w,h:VH-GY}];
  for(i=0;i<Math.floor(ST.w/400);i++){
    var x=310+i*400+rnd(-40,40),y=GY-ri(62,112),w=ri(80,160);
    plats.push({x:Math.max(200,x),y:y,w:w,h:14});
    if(i%2===1)plats.push({x:Math.max(150,x+130),y:y-ri(56,92),w:ri(66,124),h:14});
  }
  pots=[];
  for(i=0;i<Math.floor(ST.w/330);i++){
    var px=200+i*330+rnd(-40,40);
    pots.push({x:px,y:GY-22,w:22,h:22,hp:16,dead:false,hit:0,kind:Math.random()<.5?'hp':(Math.random()<.5?'shur':'fury')});
  }
  enemies.length=0;bullets.length=0;eBullets.length=0;drops.length=0;booms.length=0;parts.length=0;pops.length=0;pendingKinds.length=0;
  bossRef=null;waveIdx=0;waveT=80;waveState='idle';stageDone=false;killStart=0;spawnCd=0;
  P.x=60;P.y=GY-P.h;P.vx=0;P.vy=0;P.face=1;P.hp=P.maxHp;P.inv=50;P.dead=false;P.deadT=0;P.dashT=0;P.dashCd=0;
  P.djump=0;P.combo=0;P.comboT=0;P.atkT=0;P.shur=12;P.furyT=0;
  fury=0;combo=0;comboT=0;
  cam.x=0;cam.shake=0;
  if(bossBarEl)bossBarEl.classList.remove('show');
}
/* ══════════ MUSUH ══════════ */
function mkEnemy(kind,x,y){
  var e={kind:kind,x:x,y:y,w:18,h:26,vx:0,vy:0,dead:false,hp:1,face:-1,atkT:ri(40,90),hurt:0,anim:rnd(0,6),stun:0,hitT:0,kx:0};
  if(kind==='soldier'){e.hp=Math.round(30*(1+diff*.22));e.w=16;e.h=26}
  else if(kind==='archer'){e.hp=Math.round(24*(1+diff*.2));e.w=15;e.h=26;e.ranged=1}
  else if(kind==='brute'){e.hp=Math.round(88*(1+diff*.25));e.w=26;e.h=32;e.heavy=1;e.y=y-6}
  else if(kind==='mage'){e.hp=Math.round(32*(1+diff*.2));e.w=18;e.h=24;e.fly=1;e.baseY=y;e.bob=rnd(0,6)}
  else if(kind==='ninja'){e.hp=Math.round(30*(1+diff*.22));e.w=16;e.h=26;e.dasher=1;e.cool=ri(60,140)}
  enemies.push(e);return e;
}
function queueWave(){
  var i,budget=6+waveIdx*2+(diff>=2?2:0),t;
  pendingKinds=[];
  for(i=0;i<budget;i++){t=ST.pool[i%ST.pool.length];pendingKinds.push(t)}
  waveQuota=budget;
}
function spawnOne(kind){
  var x=clamp(P.x+ri(130,360),P.x+70,ST.w-30),y;
  if(kind==='mage')y=GY-ri(80,140);
  else if(kind==='brute')y=GY-32;
  else y=GY-26;
  return mkEnemy(kind,x,y);
}
function mkBoss(){
  var b=ST.boss,hp=Math.round(b.hp*(1+(diff-1)*.3));
  var bx=clamp(P.x+170,130,ST.w-120);
  if(bx<P.x+100)bx=clamp(P.x-200,70,ST.w-120);
  var e={kind:'boss',bossKind:b.kind,name:b.name,x:bx,y:GY-58,w:60,h:70,hp:hp,maxHp:hp,vx:0,vy:0,dead:false,
    face:-1,atkT:70,atkT2:170,hurt:0,anim:0,phase:0,spawn:56,fly:b.kind==='shade'||b.kind==='kitsune',baseY:GY-58,kx:0};
  if(b.kind==='golem'){e.w=76;e.h=64;e.y=GY-64;e.baseY=GY-64;e.h=64}
  if(b.kind==='shade'){e.baseY=GY-56;e.y=GY-56}
  if(b.kind==='kitsune'){e.baseY=GY-62;e.y=GY-62}
  e.x=clamp(e.x,70,ST.w-70);
  enemies.push(e);bossRef=e;
  if(bossBarEl)bossBarEl.classList.add('show');
  var bn=$('bossName');if(bn)bn.textContent='⚠ '+b.name;
  banner('⚠ '+b.name,'AYUNKAN PEDANGMU');
  sfx.boss();
  return e;
}
/* ══════════ PEMBAWA ══════════ */
function hitbox(){
  var reach=P.combo>=2?34:26;
  return {x:P.face>0?P.x+2:P.x-reach-2,y:P.y-10,w:reach,h:P.h+22,air:!P.onGround};
}
function attack(){
  if(state!=='play'||P.dead||P.furyT>0)return;
  if(P.atkT>0)return;
  var kind=P.combo>=2?2:(P.combo===1?1:0);
  P.slashKind=kind;
  P.atkT=kind===2?26:15;
  P.combo=(P.combo+1)%3;P.comboT=42;
  P.slashAnim=kind===2?16:11;
  if(kind===2){sfx.heavy();cam.shake=Math.max(cam.shake,3)}else sfx.slash();
  var hb=hitbox(),dmg=kind===2?30:(kind===1?18:14),i,e;
  var landed=0;
  for(i=0;i<enemies.length;i++){
    e=enemies[i];
    if(e.dead)continue;
    if(hb.x<e.x+e.w/2&&hb.x+hb.w>e.x-e.w/2&&hb.y<e.y+e.h/2&&hb.y+hb.h>e.y-e.h/2){
      hurtEnemy(e,dmg,e.x,P.y+8);landed++;
      var kb=kind===2?4.4:2.6;
      e.kx=P.face*kb*(e.heavy?.4:1);
      if(kind===2&&!e.heavy&&!e.bossKind)e.stun=26;
    }
  }
  if(landed){hitStop=kind===2?4:2;addFury(kind===2?7:4)}
  else addFury(1);
  /* pecahkan pot */
  for(i=0;i<pots.length;i++){
    var c=pots[i];
    if(c.dead)continue;
    if(hb.x<c.x+c.w&&hb.x+hb.w>c.x&&hb.y<c.y+c.h&&hb.y+hb.h>c.y)breakPot(c);
  }
  hud();
}
function throwShuriken(){
  if(state!=='play'||P.dead||P.shur<=0||P.furyT>0)return;
  P.shur--;sfx.shur();
  var i;
  for(i=0;i<(P.combo>=2?2:1);i++){
    bullets.push({x:P.x+P.face*12,y:P.y+8-i*8+(P.crouch?6:0),vx:P.face*9,vy:-.2-i*.8,life:64,dmg:11,size:5,spin:0,pierce:0,shuriken:1});
  }
  hud();
}
function doDash(){
  if(state!=='play'||P.dead||P.dashCd>0)return;
  P.dashT=DASH_T;P.dashCd=DASH_CD;P.inv=Math.max(P.inv,DASH_T+8);
  P.vx=P.face*DASHV;P.vy=0;
  sfx.dash();
  var i;for(i=0;i<9;i++)parts.push({x:P.x,y:P.y+rnd(2,P.h),vx:-P.face*rnd(.6,2.6),vy:rnd(-.5,.5),life:16,max:16,c:'#ffcf6e',r:rnd(1.3,2.8)});
  hud();
}
function doFury(){
  if(state!=='play'||P.dead)return;
  if(fury<100||P.furyT>0)return;
  fury=0;P.furyT=130;P.inv=Math.max(P.inv,130);sfx.fury();cam.shake=8;
  banner('AMARAH BULAN','TEBAS TANPA AMPUN');
  hud();
}
function addFury(n){fury=clamp(fury+n,0,100);if(fury===100&&P.furyT<=0)popup(P.x,P.y-10,'AMARAH PENUH','#ffcf6e')}
function jump(){
  if(state!=='play'||P.dead)return;
  if(P.onGround){P.vy=JUMP;P.onGround=false;P.djump=1;sfx.jump()}
  else if(P.djump>0){P.vy=JUMP*.9;P.djump=0;sfx.jump()}
}
function hurtPlayer(n){
  if(state!=='play'||P.dead||P.inv>0)return;
  if(P.furyT>0)return;
  P.hp-=n;P.inv=72;P.hurt=16;cam.shake=Math.max(cam.shake,5);sfx.hit();
  var i;for(i=0;i<11;i++)parts.push({x:P.x,y:P.y+rnd(2,P.h),vx:rnd(-2,2),vy:rnd(-2,.7),life:18,max:18,c:'#ff4d63',r:rnd(1.2,3)});
  if(P.hp<=0){P.hp=0;killPlayer()}
  hud();
}
function killPlayer(){
  if(P.dead)return;
  P.dead=true;P.deadT=0;sfx.dead();cam.shake=10;
  combo=0;comboT=0;
  booms.push({x:P.x,y:P.y+10,r:0,max:34,life:22,lifeMax:22});
  var i;for(i=0;i<22;i++)parts.push({x:P.x,y:P.y+rnd(0,P.h),vx:rnd(-3,3),vy:rnd(-3,1),life:26,max:26,c:pick(['#ff4d63','#ffcf6e','#ffffff']),r:rnd(1.4,3.2)});
}
function popup(x,y,txt,c){pops.push({x:x,y:y,txt:txt,c:c||'#fff',life:38,lifeMax:38})}
function banner(t,s){
  bannerEl=$('banner');if(!bannerEl)return;
  bannerEl.innerHTML=t+(s?'<small>'+s+'</small>':'');
  bannerEl.classList.add('show');bannerT=84;
}
/* ══════════ LUKA ══════════ */
function hurtEnemy(e,dmg,x,y){
  if(e.dead)return;
  e.hp-=dmg;e.hurt=6;
  var i;for(i=0;i<4;i++)parts.push({x:x||e.x,y:y||e.y,vx:rnd(-1.8,1.8),vy:rnd(-2,.4),life:12,max:12,c:'#ffcf6e',r:rnd(1,2.2)});
  combo++;comboT=120;if(combo>bestCombo)bestCombo=combo;
  if(e.hp<=0){
    e.dead=true;kills++;score+=Math.round((e.bossKind?2200:(e.heavy?220:100))*(1+Math.min(combo,20)*.05));
    sfx.kill();
    var n=e.bossKind?36:13;
    for(i=0;i<n;i++)parts.push({x:e.x,y:e.y+rnd(-e.h/2,e.h/2),vx:rnd(-4,4),vy:rnd(-4,3),life:e.bossKind?32:20,max:e.bossKind?32:20,c:pick(['#ffcf6e','#ff4d63','#ffffff','#c39bff']),r:rnd(1.4,3.4)});
    booms.push({x:e.x,y:e.y,r:0,max:e.bossKind?72:26,life:e.bossKind?28:17,lifeMax:e.bossKind?28:17});
    addFury(e.bossKind?20:6);
    if(e.bossKind){cam.shake=13;bossRef=null;if(bossBarEl)bossBarEl.classList.remove('show');onStageClear()}
    else if(Math.random()<.2)drops.push({x:e.x,y:e.y,vy:-2,kind:Math.random()<.6?'hp':'shur',t:0});
  }
}
function breakPot(c){
  c.dead=true;sfx.boom();
  booms.push({x:c.x+11,y:c.y+11,r:0,max:22,life:15,lifeMax:15});
  var i;for(i=0;i<12;i++)parts.push({x:c.x+11,y:c.y+11,vx:rnd(-2.4,2.4),vy:rnd(-2.8,.8),life:18,max:18,c:pick(['#ffcf6e','#ffffff','#ff4d63']),r:rnd(1.2,2.6)});
  drops.push({x:c.x+6,y:c.y,vy:-2,kind:c.kind,t:0});
}
function grabDrop(d){
  if(d.kind==='hp'){P.hp=Math.min(P.maxHp,P.hp+22);popup(P.x,P.y-10,'+22','#66f0b0')}
  else if(d.kind==='shur'){P.shur=Math.min(40,P.shur+8);popup(P.x,P.y-10,'SHURIKEN +8','#bfe9ff')}
  else{fury=clamp(fury+34,0,100);popup(P.x,P.y-10,'AMARAH +34','#ffcf6e')}
  sfx.pickup();hud();
}
/* ══════════ ALUR ══════════ */
function onStageClear(){
  if(stageDone)return;
  stageDone=true;state='win';
  score+=700+Math.round(P.hp*6)+bestCombo*12;
  sfx.clear();
  var stars=1;
  if(P.hp>=P.maxHp*.6)stars++;
  if(bestCombo>=25)stars++;
  var key='m'+mission;
  cleared[key+'_s']=Math.max(cleared[key+'_s']|0,stars);
  markCleared(key);
  setTimeout(function(){if(state==='win')winScreen(stars)},750);
}
function winScreen(stars){
  var s='',i;
  for(i=0;i<3;i++)s+=i<stars?'★':'☆';
  ovShow('🏆','SEKTOR AMAN',ST.name+' bersih. '+s,
    [['SKOR',score],['KOMBO TERBAIK',bestCombo],['BUNUH',kills]],
    mission<STAGES.length-1
      ? [{act:'next',label:'▶ SEKTOR BERIKUT',cls:'go'},{act:'again',label:'↻ ULANG'},{act:'menu',label:'⏹ MENU'}]
      : [{act:'again',label:'↻ MAIN LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
/* ══════════ STEP ══════════ */
function step(){
  if(state!=='play')return;
  tick++;
  var i,j,e;
  if(hitStop>0){hitStop--;if(tick%3===0)hud();return}
  if(bannerT>0){bannerT--;if(bannerT===0&&bannerEl)bannerEl.classList.remove('show')}
  if(P.inv>0)P.inv--;
  if(P.atkT>0)P.atkT--;
  if(P.dashCd>0)P.dashCd--;
  if(P.dashT>0)P.dashT--;
  if(P.furyT>0)P.furyT--;
  if(P.slashAnim>0)P.slashAnim--;
  if(P.hurt>0)P.hurt--;
  if(comboT>0){comboT--;if(comboT===0)combo=0}
  if(P.comboT>0){P.comboT--;if(P.comboT===0)P.combo=0}
  if(cam.shake>0)cam.shake=Math.max(0,cam.shake-.5);

  /* ── pemain ── */
  if(P.dead){
    P.deadT++;
    if(P.deadT>80){
      lives--;
      if(lives<0){state='dead';deadScreen()}
      else{
        P.dead=false;P.hp=P.maxHp;P.inv=100;P.vy=0;
        P.x=clamp(P.x-140,40,ST.w-60);P.y=GY-P.h;
        banner('KEMBALI BANGKIT','NYAWA '+(lives+1));
        hud();
      }
    }
  }else{
    var dir=0;
    P.crouch=!!input.down&&P.onGround;
    if(P.furyT>0){
      /* amarah: berputar cepat, menebas sekeliling */
      var fAx=input.ax||0,fMag=Math.abs(fAx)<STICK_DEAD?0:Math.min(1,Math.abs(fAx));
      var mv=fMag?(fAx<0?-1:1):0;
      P.vx+=(mv*200*fMag-P.vx)*.2;
      P.x=clamp(P.x+P.vx*FIXED,10,ST.w-40);
      if(tick%5===0){
        for(j=0;j<enemies.length;j++){
          e=enemies[j];
          if(!e.dead&&Math.abs(e.x-P.x)<52&&Math.abs(e.y-(P.y+P.h/2))<44)hurtEnemy(e,15,e.x,e.y);
        }
        for(j=0;j<pots.length;j++){
          var cp=pots[j];
          if(!cp.dead&&Math.abs(cp.x+11-P.x)<44&&Math.abs(cp.y+11-(P.y+P.h/2))<40)breakPot(cp);
        }
        parts.push({x:P.x,y:P.y+rnd(0,P.h),vx:rnd(-3,3),vy:rnd(-3,1),life:16,max:16,c:'#ffcf6e',r:rnd(1.4,3)});
      }
      P.anim+=.5;
    }else if(P.dashT>0){
      P.vx=P.face*DASHV;
      P.x=clamp(P.x+P.vx*FIXED,10,ST.w-40);
      P.y+=P.vy*FIXED;
      var gd=hitGround(P);
      if(gd){P.vy=0;P.onGround=true}else P.onGround=false;
    }else{
      var pAx=input.ax||0,aMag=Math.abs(pAx)<STICK_DEAD?0:Math.min(1,Math.abs(pAx));
      if(input.left)dir=-1;
      if(input.right)dir=1;
      if(dir){P.face=dir;P.anim+=.08+.24*aMag}
      var target=dir*(P.crouch?RUN*.42:RUN)*(0.3+0.7*aMag);
      P.vx+=(target-P.vx)*(P.onGround?.34:.16);
      if(P.crouch&&P.onGround)P.vx*=.5;
      P.vy+=G*FIXED;
      if(P.vy>880)P.vy=880;
      P.x=clamp(P.x+P.vx*FIXED,10,ST.w-40);
      P.y+=P.vy*FIXED;
      var g=hitGround(P);
      if(g){if(P.vy>360)cam.shake=Math.max(cam.shake,2.5);P.vy=0;P.onGround=true;P.djump=1}else P.onGround=false;
      if(P.y>VH+60){hurtPlayer(14);P.x=clamp(P.x-90,40,ST.w-60);P.y=GY-P.h;P.vy=0}
      if(jumpBuf>0){jumpBuf=0;jump()}
      /* lompatan ninja bisa mendarat di kepala musuh? tidak — cukup lompat ganda */
    }
  }
  /* ── musuh ── */
  for(i=enemies.length-1;i>=0;i--){
    e=enemies[i];
    if(e.dead){enemies.splice(i,1);continue}
    if(e.hurt>0)e.hurt--;
    if(e.stun>0){e.stun--;e.x+=e.kx*FIXED*60*.5;e.kx*=.9;e.anim+=.1;continue}
    e.anim+=.16;
    if(e.kx){e.x+=e.kx*FIXED*60*.5;e.kx*=.86;if(Math.abs(e.kx)<.05)e.kx=0}
    if(e.bossKind){stepBoss(e);continue}
    if(e.kind==='soldier'){
      e.face=P.x<e.x?-1:1;
      var dx=P.x-e.x;
      if(Math.abs(dx)>44)e.x+=sgn(dx)*.72;
      e.atkT--;
      if(e.atkT<=0&&Math.abs(dx)<52&&Math.abs(P.y-e.y)<34){
        e.atkT=ri(58,96);
        if(!(P.inv>0||P.dashT>0||P.furyT>0))hurtPlayer(9);
        e.swing=10;
      }
      if(e.swing>0)e.swing--;
    }else if(e.kind==='archer'){
      e.face=P.x<e.x?-1:1;
      e.atkT--;
      if(e.atkT<=0&&Math.abs(P.x-e.x)<330){
        e.atkT=ri(74,110);
        var ang=Math.atan2((P.y+10)-(e.y+4),P.x-e.x);
        eBullets.push({x:e.x+e.face*8,y:e.y+4,vx:Math.cos(ang)*4.4,vy:Math.sin(ang)*4.4,dmg:9,life:150,color:'#ffcf6e',size:3.4,arrow:1});
        sfx.shur();
      }
    }else if(e.kind==='brute'){
      e.face=P.x<e.x?-1:1;
      var dx3=P.x-e.x;
      if(Math.abs(dx3)>40)e.x+=sgn(dx3)*.5;
      e.atkT--;
      if(e.atkT<=0&&Math.abs(dx3)<70){
        e.atkT=ri(96,150);e.slam=22;
        sfx.heavy();
      }
      if(e.slam>0){
        e.slam--;
        if(e.slam===0){
          cam.shake=6;
          booms.push({x:e.x,y:GY-8,r:0,max:52,life:20,lifeMax:20});
          if(P.onGround&&Math.abs(P.x-e.x)<76&&!(P.inv>0||P.dashT>0||P.furyT>0))hurtPlayer(15);
        }
      }
    }else if(e.kind==='mage'){
      e.bob+=.07;
      e.y=e.baseY+Math.sin(e.bob)*16;
      e.face=P.x<e.x?-1:1;
      e.atkT--;
      if(e.atkT<=0&&Math.abs(P.x-e.x)<300){
        e.atkT=ri(84,130);
        var a2=Math.atan2((P.y+8)-e.y,P.x-e.x);
        eBullets.push({x:e.x,y:e.y+6,vx:Math.cos(a2)*3.2,vy:Math.sin(a2)*3.2,dmg:10,life:170,color:'#c39bff',size:5,orb:1});
      }
    }else if(e.kind==='ninja'){
      e.face=P.x<e.x?-1:1;
      e.cool--;
      if(e.cool<=0){
        e.cool=ri(90,170);
        if(Math.abs(P.x-e.x)<260&&Math.abs(P.y-e.y)<70){e.vx=e.face*4.6;e.dashT=22;sfx.dash()}
      }
      if(e.dashT>0){
        e.dashT--;
        e.x+=e.vx;
        if(Math.abs(e.x-P.x)<20&&Math.abs(P.y-e.y)<30&&!(P.inv>0||P.dashT>0||P.furyT>0)){hurtPlayer(11);e.dashT=0}
      }else{
        var dxn=P.x-e.x;
        if(Math.abs(dxn)>70)e.x+=sgn(dxn)*.6;
      }
    }
    if(e.x<-60||e.x>ST.w+60){enemies.splice(i,1);continue}
    /* kontak badan */
    if(!P.dead&&Math.abs(e.x-P.x)<(e.w+P.w)/2&&P.y+P.h>e.y-e.h/2&&P.y<e.y+e.h/2){
      if(P.inv>0||P.dashT>0||P.furyT>0){}
      else{hurtPlayer(8)}
    }
  }
  /* ── peluru pemain (shuriken) ── */
  for(i=bullets.length-1;i>=0;i--){
    var b=bullets[i];
    b.x+=b.vx*FIXED*60;b.y+=b.vy*FIXED*60;b.life--;b.spin+=.6;
    var gone=b.life<=0||b.x<-20||b.x>ST.w||b.y<-30||b.y>VH+30;
    if(!gone){
      for(j=0;j<enemies.length;j++){
        e=enemies[j];if(e.dead)continue;
        if(b.x>e.x-e.w/2&&b.x<e.x+e.w/2&&b.y>e.y-e.h/2&&b.y<e.y+e.h/2){
          hurtEnemy(e,b.dmg,b.x,b.y);gone=true;break;
        }
      }
      if(!gone)for(j=0;j<pots.length;j++){
        var c2=pots[j];
        if(!c2.dead&&b.x>c2.x&&b.x<c2.x+c2.w&&b.y>c2.y&&b.y<c2.y+c2.h){breakPot(c2);gone=true;break}
      }
    }
    if(gone)bullets.splice(i,1);
  }
  /* ── peluru musuh ── */
  for(i=eBullets.length-1;i>=0;i--){
    var eb=eBullets[i];
    eb.x+=eb.vx*FIXED*60;eb.y+=eb.vy*FIXED*60;eb.life--;
    if(Math.abs(eb.x-P.x)<P.w/2+eb.size&&eb.y>P.y-4&&eb.y<P.y+P.h+4){
      hurtPlayer(eb.dmg);eBullets.splice(i,1);continue;
    }
    if(eb.life<=0||eb.x<-20||eb.x>ST.w||eb.y>VH+20||eb.y<-30)eBullets.splice(i,1);
  }
  /* ── pot & drop ── */
  for(i=0;i<pots.length;i++){
    var c3=pots[i];
    if(c3.dead)continue;
    if(c3.hit>0)c3.hit--;
    if(Math.abs(P.x-c3.x-11)<20&&Math.abs((P.y+P.h/2)-(c3.y+11))<26&&Math.abs(P.vx)>110){breakPot(c3)}
  }
  for(i=drops.length-1;i>=0;i--){
    var d=drops[i];d.t++;
    d.vy+=G*.5*FIXED;d.y+=d.vy*FIXED;
    var fl=GY-16;if(d.y>fl){d.y=fl;d.vy=0}
    if(Math.abs(d.x-P.x)<20&&Math.abs(d.y-(P.y+P.h/2))<26){grabDrop(d);drops.splice(i,1)}
    else if(d.t>640)drops.splice(i,1);
  }
  /* ── efek ── */
  for(i=booms.length-1;i>=0;i--){var bx=booms[i];bx.life--;bx.r+=(bx.max-bx.r)*.3;if(bx.life<=0)booms.splice(i,1)}
  for(i=parts.length-1;i>=0;i--){var pt=parts[i];pt.life--;pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.08;if(pt.life<=0)parts.splice(i,1)}
  for(i=pops.length-1;i>=0;i--){var pp=pops[i];pp.life--;pp.y-=.5;if(pp.life<=0)pops.splice(i,1)}
  /* ── gelombang ── */
  if(!stageDone){
    var alive=0,an;
    for(an=0;an<enemies.length;an++)if(!enemies[an].dead&&!enemies[an].bossKind)alive++;
    if(pendingKinds.length&&alive<MAXALIVE){
      spawnCd--;
      if(spawnCd<=0){spawnOne(pendingKinds.shift());spawnCd=22}
    }
    if(waveState==='idle'){
      waveT--;
      if(waveT<=0){
        if(waveIdx<WAVES){queueWave();waveIdx++;waveState='fight';fightT=0;killStart=kills;banner('GELOMBANG '+waveIdx+'/'+WAVES,'BASMI SEMUA')}
        else if(!bossRef){mkBoss();waveState='boss'}
      }
    }else if(waveState==='fight'){
      fightT++;
      if(kills-killStart>=waveQuota||fightT>1680){
        pendingKinds.length=0;
        waveState='idle';waveT=100;
        banner('AREA BERSIH','MAJU KE KANAN ➜');
      }
    }
  }
  /* ── kamera ── */
  var cx=P.x-VW*.42;
  cam.x+=(clamp(cx,0,Math.max(0,ST.w-VW))-cam.x)*.12;
  if(cam.x<0)cam.x=0;
  if(P.x<cam.x+22)P.x=cam.x+22;
  if(tick%6===0)hud();
}
function hitGround(o){
  var i,hit=false;
  for(i=0;i<plats.length;i++){
    var s=plats[i];
    if(o.x+o.w/2>s.x&&o.x-o.w/2<s.x+s.w){
      var feet=o.y+o.h;
      if(o.vy>=0&&feet>s.y&&feet<s.y+26){o.y=s.y-o.h;hit=true}
    }
  }
  return hit;
}
/* ══════════ BOS ══════════ */
function stepBoss(e){
  var i,k;
  if(e.spawn>0){e.spawn--;return}
  e.anim++;
  if(e.hp<e.maxHp*.55)e.phase=1;
  if(e.hp<e.maxHp*.25)e.phase=2;
  e.face=P.x<e.x?-1:1;
  if(e.bossKind==='blade'){
    if(e.dash>0){
      e.dash--;e.x+=e.vx;
      if(Math.abs(e.x-P.x)<34&&Math.abs(P.y-e.y)<40&&!(P.inv>0||P.dashT>0)){hurtPlayer(13);e.dash=0;e.atkT=ri(50,80)}
    }else{
      var dx=P.x-e.x;
      if(Math.abs(dx)>70)e.x+=sgn(dx)*.7;
      e.x=clamp(e.x,60,ST.w-60);
      e.atkT--;
      if(e.atkT<=0){
        e.atkT=e.phase>=1?60:84;
        if(Math.abs(dx)<90&&Math.abs(P.y-e.y)<44){
          if(!(P.inv>0||P.dashT>0))hurtPlayer(12);
          e.slash=12;
        }else{e.dash=26;e.vx=sgn(dx)*5.2;e.slash=12;sfx.dash()}
      }
    }
  }else if(e.bossKind==='golem'){
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?70:96;
      if(Math.abs(P.x-e.x)<110){e.slam=24}
      else{e.dash=30;e.vx=sgn(P.x-e.x)*2.4;sfx.dash()}
    }
    if(e.dash>0){e.dash--;e.x=clamp(e.x+e.vx,60,ST.w-60)}
    if(e.slam>0){
      e.slam--;
      if(e.slam===0){
        cam.shake=8;sfx.heavy();
        booms.push({x:e.x,y:GY-8,r:0,max:76,life:22,lifeMax:22});
        if(P.onGround&&Math.abs(P.x-e.x)<96&&!(P.inv>0||P.dashT>0))hurtPlayer(16);
        for(i=0;i<(e.phase>=1?4:2);i++)eBullets.push({x:e.x+(i-1)*40,y:GY-14,vx:(i-1)*1.6,vy:-3.2,dmg:9,life:110,color:'#d8ffa8',size:5,orb:1,grav:1});
      }
    }
  }else if(e.bossKind==='shade'){
    e.bob=(e.bob||0)+.06;
    e.y=e.baseY+Math.sin(e.bob)*22;
    if(e.phaseT===undefined)e.phaseT=0;
    e.phaseT++;
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?54:76;
      for(k=-1;k<=1;k++)eBullets.push({x:e.x+e.face*16,y:e.y+k*12,vx:e.face*4.2,vy:k*.4,dmg:9,life:150,color:'#9fd8ff',size:4,shuriken:1});
      sfx.shur();
    }
    if(e.phaseT%130===0&&Math.abs(P.x-e.x)>120){
      e.x=clamp(P.x-(e.face*130),70,ST.w-70);e.y=clamp(P.y-6,50,VH-60);sfx.dash();
      for(i=0;i<10;i++)parts.push({x:e.x,y:e.y,vx:rnd(-2,2),vy:rnd(-2,2),life:16,max:16,c:'#9fd8ff',r:rnd(1.2,2.6)});
    }
  }else if(e.bossKind==='kitsune'){
    e.bob=(e.bob||0)+.05;
    e.y=e.baseY+Math.sin(e.bob)*20;
    e.x=clamp(e.x+(P.x-e.x)*.008,70,ST.w-70);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?60:86;
      var a=Math.atan2(P.y-e.y,P.x-e.x);
      for(k=-2;k<=2;k++)eBullets.push({x:e.x+e.face*14,y:e.y,vx:Math.cos(a+k*.18)*3.6,vy:Math.sin(a+k*.18)*3.6,dmg:10,life:160,color:'#ff7a3d',size:5,orb:1,flare:1});
      sfx.heavy();
    }
    e.atkT2--;
    if(e.atkT2<=0){
      e.atkT2=ri(220,340);
      var clone=mkEnemy('mage',clamp(e.x+ri(-60,60),70,ST.w-70),e.y+10);
      clone.baseY=e.y+10;clone.hp=Math.round(clone.hp*.6);
    }
  }else{
    /* shogun */
    if(e.mode===undefined)e.mode=0;
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=2?50:72;
      e.mode=(e.mode+1)%3;
      if(e.mode===0){
        for(i=0;i<5;i++)eBullets.push({x:e.x+e.face*20,y:e.y-24+i*12,vx:e.face*4.4,vy:(i-2)*.3,dmg:10,life:160,color:'#ffe6a8',size:4});
      }else if(e.mode===1){
        var an=Math.atan2(P.y-e.y,P.x-e.x);
        for(i=-1;i<=1;i++)eBullets.push({x:e.x+e.face*18,y:e.y,vx:Math.cos(an+i*.2)*4.6,vy:Math.sin(an+i*.2)*4.6,dmg:11,life:160,color:'#c39bff',size:5,orb:1});
      }else{
        e.dash=24;e.vx=sgn(P.x-e.x)*5.0;sfx.dash();
      }
      sfx.shur();
    }
    if(e.dash>0){
      e.dash--;e.x+=e.vx;
      if(Math.abs(e.x-P.x)<36&&Math.abs(P.y-e.y)<44&&!(P.inv>0||P.dashT>0)){hurtPlayer(14);e.dash=0}
    }
    e.x=clamp(e.x,60,ST.w-60);e.y=clamp(e.y+(P.y-e.y)*.004,GY-110,GY-50);
  }
}
/* ══════════ GAMBAR ══════════ */
function drawBG(){
  var p=ST.pal,g=ctx.createLinearGradient(0,0,0,GY);
  g.addColorStop(0,p.sky[0]);g.addColorStop(.55,p.sky[1]);g.addColorStop(1,p.sky[2]);
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  var i,off,x;
  /* bulan/matahari + bintang */
  ctx.globalAlpha=.5;ctx.fillStyle='#ffffff';
  for(i=0;i<24;i++){
    x=((i*79+((cam.x*.1)|0))%(VW+40))-20;
    ctx.fillRect(x,(i*47)%(GY-90),1.2,1.2);
  }
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,240,200,.5)';
  ctx.beginPath();ctx.arc(VW-90,58,24,0,6.283);ctx.fill();
  /* gunung/gedung jauh */
  off=(cam.x*.18)%180;
  for(i=-1;i<5;i++){
    var bx=i*180-off,bh=70+((i*41)%64);
    ctx.fillStyle=p.far;
    ctx.beginPath();ctx.moveTo(bx,GY-30);ctx.lineTo(bx+90,GY-30-bh);ctx.lineTo(bx+180,GY-30);ctx.closePath();ctx.fill();
  }
  off=(cam.x*.36)%200;
  for(i=-1;i<4;i++){
    var cx2=i*200-off,ch=96+((i*57)%70);
    ctx.fillStyle=p.mid;
    ctx.fillRect(cx2,GY-56-ch,150,ch+56);
    ctx.fillStyle=p.gold;ctx.globalAlpha=.35;ctx.fillRect(cx2,GY-56-ch,150,3);ctx.globalAlpha=1;
  }
}
function drawGround(){
  var p=ST.pal;
  ctx.fillStyle=p.ground;ctx.fillRect(0,GY,VW,VH-GY);
  ctx.fillStyle=p.gold;ctx.globalAlpha=.7;ctx.fillRect(0,GY,VW,3);ctx.globalAlpha=1;
  var i,x;
  ctx.strokeStyle='rgba(255,255,255,.07)';
  for(i=0;i<14;i++){
    x=((i*80-((cam.x*.6)%80))%(VW+80))-40;
    ctx.beginPath();ctx.moveTo(x,GY+10);ctx.lineTo(x+24,GY+10);ctx.stroke();
  }
  ctx.fillStyle=p.neon;ctx.globalAlpha=.4;
  for(i=0;i<10;i++){
    x=((i*68-((cam.x*.9)%68))%(VW+68))-34;
    ctx.fillRect(x,GY+18,10,2);
  }
  ctx.globalAlpha=1;
}
function drawPlats(){
  var i;
  for(i=0;i<plats.length;i++){
    var s=plats[i];
    if(s.x>cam.x+VW+40||s.x+s.w<cam.x-40)continue;
    ctx.fillStyle='#140a16';ctx.fillRect(s.x-cam.x,s.y,s.w,s.h+6);
    ctx.fillStyle=ST.pal.gold;ctx.globalAlpha=.75;ctx.fillRect(s.x-cam.x,s.y,s.w,3);ctx.globalAlpha=1;
  }
}
function drawPlayer(){
  if(P.dead)return;
  var x=P.x-cam.x,y=P.y,f=P.face;
  if(P.inv>0&&P.dashT<=0&&(tick>>2)%2===0)return;
  ctx.save();
  ctx.translate(x,y);
  if(P.furyT>0){
    ctx.save();
    ctx.rotate(tick*.5);
    ctx.strokeStyle='rgba(255,207,110,.85)';ctx.lineWidth=3;
    for(var q=0;q<4;q++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(q*1.57)*34,Math.sin(q*1.57)*34);ctx.stroke()}
    ctx.restore();
  }
  ctx.scale(f,1);
  /* bayangan ninja */
  ctx.fillStyle='#1a0d16';
  ctx.fillRect(-5,10,10,P.crouch?6:18);
  ctx.fillStyle='#241426';ctx.fillRect(-5,3,10,P.crouch?7:10);
  /* ikat kepala */
  ctx.fillStyle='#ff4d63';ctx.fillRect(-6,-1,12,4);
  ctx.fillStyle='#ffcf6e';ctx.fillRect(2,0,10,2);
  /* selendang */
  var sw=Math.sin(P.anim*1.6)*4;
  ctx.fillStyle='#8d1024';
  ctx.beginPath();ctx.moveTo(-4,6);ctx.lineTo(-14-sw,10+sw);ctx.lineTo(-4,12);ctx.closePath();ctx.fill();
  /* kaki */
  var legT=Math.sin(P.anim)*3;
  ctx.fillStyle='#0d070c';
  if(P.onGround&&Math.abs(P.vx)>24){ctx.fillRect(-5+legT,24,4,4);ctx.fillRect(1-legT,24,4,4)}
  else{ctx.fillRect(-5,24,4,4);ctx.fillRect(1,24,4,4)}
  /* pedang */
  ctx.fillStyle='#dfe9ff';ctx.fillRect(7,4,3,17);
  ctx.fillStyle='#ffcf6e';ctx.fillRect(5,8,7,3);
  ctx.restore();
  /* efek tebasan */
  if(P.slashAnim>0){
    var t=P.slashAnim/(P.slashKind===2?16:11);
    ctx.globalAlpha=t*.85;
    ctx.strokeStyle=P.slashKind===2?'#ffcf6e':'#ffe6d0';
    ctx.lineWidth=P.slashKind===2?6:4;
    var cx=P.x-cam.x+P.face*20;
    ctx.beginPath();
    ctx.arc(cx,P.y+13,P.slashKind===2?30:22,P.face>0?-1.1:2.0,P.face>0?1.1:4.2);
    ctx.stroke();
    ctx.globalAlpha=1;
  }
}
function drawEnemies(){
  var i;
  for(i=0;i<enemies.length;i++){
    var e=enemies[i];
    if(e.dead)continue;
    var x=e.x-cam.x;
    if(x<-80||x>VW+80)continue;
    if(e.hurt>0)ctx.globalAlpha=.72;
    if(e.bossKind){
      ctx.fillStyle='#240c1a';
      rr(ctx,x-e.w/2,e.y-e.h/2,e.w,e.h,9);ctx.fill();
      ctx.strokeStyle=ST.pal.gold;ctx.lineWidth=2.4;ctx.stroke();
      ctx.fillStyle=ST.pal.neon;
      ctx.beginPath();ctx.arc(x-4,e.y-6,12,0,6.283);ctx.fill();
      ctx.fillStyle='#ffe6a8';
      ctx.beginPath();ctx.arc(x-4,e.y-6,5,0,6.283);ctx.fill();
      ctx.fillStyle='#dfe9ff';
      ctx.fillRect(x+e.w/2-16,e.y-24,5,26);
      ctx.fillStyle=ST.pal.gold;ctx.fillRect(x+e.w/2-20,e.y+2,14,4);
    }else if(e.kind==='soldier'){
      ctx.fillStyle='#2a1420';ctx.fillRect(x-7,e.y-13,14,26);
      ctx.fillStyle='#ff4d63';ctx.fillRect(x-7,e.y-13,14,4);
      ctx.fillStyle='#ffcf6e';ctx.fillRect(x+(e.face>0?5:-10),e.y-4,5,2);
      if(e.swing>0){ctx.globalAlpha=.8;ctx.strokeStyle='#ff4d63';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+e.face*14,e.y,12,e.face>0?-1:2,e.face>0?1:4);ctx.stroke();ctx.globalAlpha=1}
    }else if(e.kind==='archer'){
      ctx.fillStyle='#1e2a16';ctx.fillRect(x-7,e.y-13,14,26);
      ctx.fillStyle='#d8ffa8';ctx.fillRect(x-7,e.y-13,14,4);
      ctx.strokeStyle='#d8ffa8';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+e.face*8,e.y,10,-1,1);ctx.stroke();
    }else if(e.kind==='brute'){
      ctx.fillStyle='#3a1420';rr(ctx,x-13,e.y-16,26,32,5);ctx.fill();
      ctx.fillStyle='#ff7a3d';ctx.fillRect(x-13,e.y-16,26,5);
      ctx.fillStyle='#ffcf6e';ctx.fillRect(x-10,e.y+6,20,6);
      if(e.slam>0){ctx.globalAlpha=.5;ctx.fillStyle='#ffcf6e';ctx.beginPath();ctx.arc(x,GY-6,20,0,6.283);ctx.fill();ctx.globalAlpha=1}
    }else if(e.kind==='mage'){
      ctx.fillStyle='#2a1440';ctx.beginPath();ctx.arc(x,e.y,12,0,6.283);ctx.fill();
      ctx.strokeStyle='#c39bff';ctx.lineWidth=1.8;ctx.stroke();
      ctx.fillStyle='#c39bff';ctx.beginPath();ctx.arc(x,e.y,4,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(195,155,255,.3)';ctx.fillRect(x-14,e.y+12,28,3);
    }else{
      ctx.fillStyle='#1a0d16';ctx.fillRect(x-7,e.y-13,14,26);
      ctx.fillStyle='#9fd8ff';ctx.fillRect(x-7,e.y-13,14,4);
      ctx.fillStyle='#9fd8ff';
      if(e.dashT>0){ctx.globalAlpha=.5;ctx.fillRect(x-e.face*20,e.y-12,22,24);ctx.globalAlpha=1}
      ctx.fillRect(x+(e.face>0?6:-10),e.y-6,4,10);
    }
    ctx.globalAlpha=1;
    if(!e.bossKind&&e.hp>0&&e.hp<40){
      var mx=e.heavy?88:(e.kind==='archer'?24:30);
      ctx.fillStyle='#000a';ctx.fillRect(x-11,e.y-e.h/2-8,22,3);
      ctx.fillStyle='#ff4d63';ctx.fillRect(x-11,e.y-e.h/2-8,22*clamp(e.hp/mx,0,1),3);
    }
  }
}
function drawShots(){
  var i;
  for(i=0;i<bullets.length;i++){
    var b=bullets[i];
    ctx.save();ctx.translate(b.x-cam.x,b.y);ctx.rotate(b.spin);
    ctx.fillStyle='#dfe9ff';
    ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(5,0);ctx.lineTo(0,5);ctx.lineTo(-5,0);ctx.closePath();ctx.fill();
    ctx.fillStyle='#9fd8ff';ctx.beginPath();ctx.arc(0,0,2,0,6.283);ctx.fill();
    ctx.restore();
  }
  for(i=0;i<eBullets.length;i++){
    var eb=eBullets[i];
    if(eb.orb){
      ctx.fillStyle='#00000055';ctx.beginPath();ctx.arc(eb.x-cam.x,eb.y,eb.size+2,0,6.283);ctx.fill();
      ctx.fillStyle=eb.color;ctx.beginPath();ctx.arc(eb.x-cam.x,eb.y,eb.size,0,6.283);ctx.fill();
      ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(eb.x-cam.x-1,eb.y-1,eb.size*.4,0,6.283);ctx.fill();
    }else{
      ctx.strokeStyle=eb.color;ctx.lineWidth=2.4;
      var dir=eb.vx<0?-1:1;
      ctx.beginPath();ctx.moveTo(eb.x-cam.x-dir*10,eb.y);ctx.lineTo(eb.x-cam.x+dir*4,eb.y);ctx.stroke();
      ctx.fillStyle=eb.color;
      ctx.beginPath();ctx.moveTo(eb.x-cam.x+dir*6,eb.y);ctx.lineTo(eb.x-cam.x+dir*-1,eb.y-3);ctx.lineTo(eb.x-cam.x+dir*-1,eb.y+3);ctx.closePath();ctx.fill();
    }
  }
}
function drawPots(){
  var i;
  for(i=0;i<pots.length;i++){
    var c=pots[i];
    if(c.dead)continue;
    var x=c.x-cam.x;
    if(x<-40||x>VW+40)continue;
    ctx.fillStyle=c.hit>0?'#ffcf6e':(c.kind==='hp'?'#4a2338':(c.kind==='shur'?'#1e3348':'#4a3a12'));
    rr(ctx,x,c.y,c.w,c.h,4);ctx.fill();
    ctx.strokeStyle=c.kind==='hp'?'#ff8fa0':(c.kind==='shur'?'#9fd8ff':'#ffcf6e');
    ctx.lineWidth=1.8;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(x+3,c.y+3,4,7);
    ctx.fillStyle='#ffcf6e';ctx.fillRect(x+4,c.y+9,14,2);
  }
  for(i=0;i<drops.length;i++){
    var d=drops[i],dx=d.x-cam.x;
    ctx.save();ctx.translate(dx,d.y);ctx.rotate(Math.sin(tick*.08+i)*.25);
    var col=d.kind==='hp'?'#66f0b0':(d.kind==='shur'?'#9fd8ff':'#ffcf6e');
    ctx.fillStyle=col;rr(ctx,-7,-7,14,14,4);ctx.fill();
    ctx.fillStyle='#140a16';ctx.font='900 8px system-ui';ctx.textAlign='center';
    ctx.fillText(d.kind==='hp'?'+':(d.kind==='shur'?'✦':'🔥'),0,3);
    ctx.textAlign='left';ctx.restore();
  }
}
function drawFX(){
  var i;
  for(i=0;i<booms.length;i++){
    var b=booms[i],t=b.life/b.lifeMax;
    ctx.globalAlpha=t*.85;
    var g=ctx.createRadialGradient(b.x-cam.x,b.y,2,b.x-cam.x,b.y,b.r);
    g.addColorStop(0,'#ffffff');g.addColorStop(.42,'#ffcf6e');g.addColorStop(1,'rgba(255,80,60,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x-cam.x,b.y,b.r,0,6.283);ctx.fill();
    ctx.globalAlpha=1;
  }
  for(i=0;i<parts.length;i++){
    var p=parts[i];
    ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.c;
    ctx.fillRect(p.x-cam.x,p.y,p.r,p.r);
  }
  ctx.globalAlpha=1;
  for(i=0;i<pops.length;i++){
    var pp=pops[i];
    ctx.globalAlpha=clamp(pp.life/pp.lifeMax,0,1);
    ctx.font='900 8px system-ui';ctx.fillStyle=pp.c;ctx.textAlign='center';
    ctx.fillText(pp.txt,pp.x-cam.x,pp.y);
    ctx.textAlign='left';ctx.globalAlpha=1;
  }
  if(combo>2){
    ctx.globalAlpha=.9;
    ctx.font='950 14px system-ui';ctx.fillStyle='#ffcf6e';ctx.textAlign='right';
    ctx.fillText(combo+'x',VW-12,26);
    ctx.textAlign='left';ctx.globalAlpha=1;
  }
}
function draw(){
  ctx.save();
  var sh=cam.shake;
  if(sh)ctx.translate(rnd(-sh,sh),rnd(-sh,sh));
  drawBG();
  drawGround();
  drawPlats();
  drawPots();
  drawEnemies();
  drawPlayer();
  drawShots();
  drawFX();
  ctx.restore();
  var g=ctx.createRadialGradient(VW/2,VH*.46,VH*.32,VW/2,VH/2,VW*.76);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,'rgba(0,0,0,.22)');g.addColorStop(1,'rgba(0,0,0,.62)');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
}
/* ══════════ HUD / OVERLAY ══════════ */
var bossBarEl=null;
function hud(){
  if(!bossBarEl)bossBarEl=$('bossBar');
  var f=$('hpFill');
  f.style.width=clamp(P.hp/P.maxHp*100,0,100)+'%';
  var bar=$('hpBar');
  bar.className='hpBar'+(P.hp/P.maxHp<.3?' crit':(P.hp/P.maxHp<.6?' low':''));
  $('hpTxt').textContent=Math.round(P.hp);
  $('score').textContent=score;
  $('lives').textContent=Math.max(0,lives);
  $('combo').textContent=combo;
  $('shur').textContent=P.shur;
  $('furyFill').style.width=fury+'%';
  var d=$('dashTxt');
  if(P.dashCd>0){d.textContent=Math.round(P.dashCd/60*10)/10+'s';d.className='wait'}
  else{d.textContent='SIAP';d.className='ready'}
  $('progFill').style.width=clamp(P.x/ST.w*100,0,100)+'%';
  if(bossRef)$('bossFill').style.width=clamp(bossRef.hp/bossRef.maxHp*100,0,100)+'%';
}
function ovShow(icon,title,text,stats,btns){
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var s='',i;
  if(stats)for(i=0;i<stats.length;i++)s+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';
  $('ovStats').innerHTML=s;
  var h='<div class="row3">';
  (btns||[]).forEach(function(b){
    if(b.act==='next'||b.act==='again'||b.act==='start')h+='</div><div class="row3">';
    h+='<button class="sbtn '+(b.cls||'')+'" type="button" data-act="'+b.act+'">'+b.label+'</button>';
  });
  h+='</div>';
  $('ovBtns').innerHTML=h;
  $('ov').classList.remove('hide');
}
function ovHide(){$('ov').classList.add('hide')}
function menu(){
  state='menu';
  var i,btns=[];
  for(i=0;i<STAGES.length;i++){
    var ok=i===0||cleared['m'+(i-1)];
    var st=cleared['m'+i+'_s']|0,s='';
    var k;for(k=0;k<3;k++)s+=k<st?'★':'☆';
    btns.push({act:'lv'+(ok?i:'x'),label:(ok?'':'🔒 ')+'S'+(i+1)+' '+s});
  }
  ovShow('⚔️','SHADOW BLADE','Ninja terakhir klan Kurogane. 5 sektor, 5 jagoan.<br><b>Tahan TEBAS</b> untuk kombo 3 ayunan, <b>✦ SHURIKEN</b> untuk musuh jauh/terbang, <b>↯ DASH</b> kebal sekejap. Isi meterai <b>AMARAH</b> lalu lepas 🔥.',
    [['SKOR',score],['SEKTOR',STAGES.length],['KOMBO',bestCombo]],
    btns.concat([{act:'start',label:'▶ MULAI SEKTOR '+(mission+1),cls:'go'},{act:'help',label:'❔ CARA MAIN'}]));
}
function helpScreen(){
  ovShow('📖','CARA MAIN',
    '<b>TOMBOL ARAH</b> (kiri bawah) — <b>◀ ▶</b> bergerak, <b>▼</b> tunduk. Tombol bisa ditekan bersamaan dengan tombol aksi di kanan.<br>'+
    '<b>⚔ TEBAS</b> — tahan untuk <b>kombo 3 ayunan</b>; ayunan ke-3 paling keras & mendorong musuh.<br>'+
    '<b>✦ SHURIKEN</b> — lemparan jarak jauh (stok terbatas, isi ulang dari pecahan pot). Kombo ke-3 melempar 2 sekaligus.<br>'+
    '<b>⤒ LOMPAT</b> — bisa dua kali di udara. <b>▼ TUNDUK</b> untuk merunduk.<br>'+
    '<b>↯ DASH</b> — menerjang cepat & <b>kebal</b> sekejap; tembus musuh tanpa terluka.<br>'+
    '<b>🔥 AMARAH</b> — saat meterai penuh, tekan untuk berputar menebas sekeliling (kebal selama 2 dtk).<br><br>'+
    'Kalahkan musuh tanpa terluka untuk menjaga <b>KOMBO</b> — makin tinggi kombo, makin besar skornya.<br>'+
    'Bos muncul setelah 5 gelombang. Kalahkan untuk membuka sektor berikutnya.',
    null,[{act:'back',label:'◀ KEMBALI'}]);
}
function deadScreen(){
  ovShow('💀','MISI GAGAL','Nyawa habis di '+ST.name+'.',
    [['SKOR',score],['BUNUH',kills],['KOMBO',bestCombo]],
    [{act:'again',label:'↻ COBA LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';
  ovShow('⏸','JEDA','Sektor '+(mission+1)+' — '+ST.name+' ditunda.',
    [['SKOR',score],['KOMBO',bestCombo],['DARAH',Math.round(P.hp)]],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'restart',label:'↻ ULANG',cls:''},{act:'menu',label:'⏹ MENU'}]);
}
function resumeState(){if(state!=='pause')return;state='play';ovHide()}
function start(){
  lives=3;kills=0;bestCombo=0;
  buildLevel(mission);
  state='play';ovHide();
  banner('SEKTOR '+(mission+1)+' — '+ST.name,ST.sub);
  last=performance.now();acc=0;
  hud();
}
/* ══════════ INPUT ══════════ */
function bindHold(el,on,off,opt){
  if(!el)return;
  var pid=null,rep=0,every=(opt&&opt.every)||80,offFn=(typeof off==='function')?off:function(){};
  function tick(){
    if(pid===null)return;
    on();
    if(pid===null)return;
    rep=setTimeout(tick,every);
  }
  function press(e){
    if(pid!==null)return;
    e.preventDefault();ensureAC();
    pid=e.pointerId;
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    el.classList.add('active');
    on();
    if(opt&&opt.repeat)rep=setTimeout(tick,every);
  }
  function release(e){
    if(pid===null)return;
    if(e&&e.pointerId!==undefined&&e.pointerId!==pid)return;
    pid=null;
    if(rep){clearTimeout(rep);rep=0}
    el.classList.remove('active');
    offFn();
  }
  el.addEventListener('pointerdown',press,{passive:false});
  el.addEventListener('pointerup',release);
  el.addEventListener('pointercancel',release);
  D.addEventListener('pointerup',release);
  D.addEventListener('pointercancel',release);
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
/* ── TOMBOL ARAH (D-PAD) ── ◀ ▶ jalan, ▲ lompat, ▼ jongkok.
   Ditangani sejak jari MENYENTUH (bukan saat dilepas) supaya menu tekan-lama WhatsApp
   tidak sempat muncul. Tiap tombol menjaga pointerId-nya sendiri, jadi bisa ditekan
   bersamaan (jalan + lompat) tanpa saling mengunci. */
var STICK_DEAD=0.22;   /* ambang gerak minimum yang dibaca mesin fisika */
var dirDocLock=null,dirHeldN=0;
function dirSync(){input.ax=(input.right?1:0)-(input.left?1:0)}
/* ambil alih gesture: jangan sampai diteruskan ke halaman/chat */
function stickClaim(e){
  if(e.cancelable&&!e.defaultPrevented)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
}
/* Selama tombol arah dipegang, SEMUA geser jari dikunci supaya halaman/chat WhatsApp
   tidak ikut tergulir (termasuk jari kedua di luar tombol). Kunci DICABUT saat semua
   tombol dilepas — tidak ada preventDefault permanen di document, scroll normal hidup. */
function dirLock(on){
  dirHeldN+=on?1:-1;if(dirHeldN<0)dirHeldN=0;
  if(dirHeldN>0&&!dirDocLock){
    dirDocLock=function(e){if(e.cancelable)e.preventDefault()};
    D.addEventListener('touchmove',dirDocLock,{passive:false});
  }else if(dirHeldN===0&&dirDocLock){
    D.removeEventListener('touchmove',dirDocLock,{passive:false});dirDocLock=null;
  }
}
function padReset(){
  input.ax=0;input.left=false;input.right=false;input.down=false;
  dirHeldN=0;
  if(dirDocLock){D.removeEventListener('touchmove',dirDocLock,{passive:false});dirDocLock=null}
  var ids=['bLeft','bRight','bUp','bDown'],i,el;
  for(i=0;i<ids.length;i++){el=$(ids[i]);if(el)el.classList.remove('active')}
}
/* satu tombol: pointerdown = tekan (sejak jari menyentuh), pointerup = lepas.
   pointerId dijaga per tombol supaya bisa ditekan bersamaan. */
function padHold(id,on,off){
  var el=$(id);if(!el)return;
  var pid=null;
  function press(e){
    if(e.button)return;                       /* klik kanan/tengah diabaikan */
    stickClaim(e);ensureAC();                 /* gesture ini milik tombol */
    if(pid!==null)return;                     /* tombol ini sudah dipegang jari lain */
    pid=e.pointerId;
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    el.classList.add('active');
    dirLock(true);
    if(on)on();
  }
  function rel(e){
    if(pid===null)return;
    if(e&&e.pointerId!==undefined&&e.pointerId!==pid)return;
    try{el.releasePointerCapture(pid)}catch(err){}
    pid=null;el.classList.remove('active');
    dirLock(false);
    if(off)off();
  }
  el.addEventListener('pointerdown',press,{passive:false});
  el.addEventListener('pointerup',rel);el.addEventListener('pointercancel',rel);
  D.addEventListener('pointerup',rel);D.addEventListener('pointercancel',rel);
  /* jaring pengaman WebView lama: geser di tombol arah tidak menggulir halaman */
  el.addEventListener('touchmove',function(e){if(e.cancelable)e.preventDefault()},{passive:false});
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
function mountDpad(){
  var pad=$('movePad');if(!pad)return;
  padHold('bLeft',function(){input.left=true;dirSync()},function(){input.left=false;dirSync()});
  padHold('bRight',function(){input.right=true;dirSync()},function(){input.right=false;dirSync()});
  pad.addEventListener('touchmove',function(e){stickClaim(e)},{passive:false});
  /* aplikasi pindah / jari hilang: tombol tidak boleh tertinggal menekan */
  D.addEventListener('visibilitychange',function(){if(D.hidden)padReset()});
  if(window.addEventListener)window.addEventListener('blur',function(){padReset()});
}
function bindInput(){
  mountDpad();
  bindHold($('bDown'),function(){input.down=true},function(){input.down=false});
  bindHold($('bSlash'),function(){attack()},function(){},{repeat:true,every:70});
  bindHold($('bJump'),function(){jumpBuf=8;setTimeout(function(){},0)});
  bindHold($('bDash'),function(){doDash()},{},{});
  bindHold($('bShur'),function(){throwShuriken()},{},{repeat:false});
  bindHold($('bFury'),function(){doFury()},{},{});
  $('ov').addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start'||a==='restart'||a==='again')start();
    else if(a==='next'){mission=Math.min(STAGES.length-1,mission+1);start()}
    else if(a==='help')helpScreen();
    else if(a==='menu'||a==='back')menu();
    else if(a==='resume')resumeState();
    else if(a.indexOf('lv')===0){var n=parseInt(a.slice(2),10);if(!isNaN(n)){mission=n;start()}}
  });
  var mb=$('muteB');
  if(mb)mb.addEventListener('click',function(){
    muted=!muted;
    if(master)master.gain.value=muted?0:0.48;
    mb.textContent=muted?'🔇':'🔊';
  });
  var pb=$('pauseB');
  if(pb)pb.addEventListener('click',function(){
    ensureAC();
    if(state==='play')pause();
    else if(state==='pause')resumeState();
  });
  D.addEventListener('keydown',function(e){
    ensureAC();
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){input.ax=-1;input.left=true;e.preventDefault()}
    else if(k==='arrowright'||k==='d'){input.ax=1;input.right=true;e.preventDefault()}
    else if(k==='arrowdown'||k==='s'){input.down=true;e.preventDefault()}
    else if(k===' '||k==='arrowup'||k==='w'){if(!e.repeat)jumpBuf=8;e.preventDefault()}
    else if(k==='j'||k==='z'){attack()}
    else if(k==='k'||k==='x'){if(!e.repeat)doDash()}
    else if(k==='l'||k==='c'){if(!e.repeat)throwShuriken()}
    else if(k==='u'){if(!e.repeat)doFury()}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause')resumeState()}
    else if(k==='m'){if(mb)mb.click()}
    else if(k==='enter'){if(state==='menu'||state==='dead'||state==='win')start()}
  },{passive:false});
  D.addEventListener('keyup',function(e){
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){input.ax=0;input.left=false}
    else if(k==='arrowright'||k==='d'){input.ax=0;input.right=false}
    else if(k==='arrowdown'||k==='s')input.down=false;
  });
  D.addEventListener('visibilitychange',function(){if(D.hidden&&state==='play')pause()});
  if(window.addEventListener)window.addEventListener('resize',function(){fit()});
}
/* ══════════ LOOP ══════════ */
function loop(now){
  var dt;
  if(!last)last=now;
  dt=now-last;last=now;
  if(dt>120)dt=120;
  acc+=dt;
  var guard=0;
  while(acc>=FIXED*1000&&guard<5){step();acc-=FIXED*1000;guard++}
  if(guard>=5)acc=0;
  draw();
  requestAnimationFrame(loop);
}
/* ══════════ BOOT ══════════ */
fit();bossBarEl=$('bossBar');bannerEl=$('banner');buildLevel(0);bindInput();hud();menu();
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',function(){fit()});
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);

if(typeof window!=='undefined'){
  window.__SB={
    get s(){return{state:state,tick:tick,hp:Math.round(P.hp),lives:lives,score:score,kills:kills,combo:combo,bestCombo:bestCombo,
      x:Math.round(P.x*10)/10,y:Math.round(P.y*10)/10,vx:Math.round(P.vx),vy:Math.round(P.vy),onGround:P.onGround,face:P.face,
      shur:P.shur,fury:Math.round(fury),dashCd:P.dashCd,inv:P.inv,dead:P.dead,furyT:P.furyT,atkCombo:P.combo,
      enemies:enemies.length,alive:(function(){var n=0,i;for(i=0;i<enemies.length;i++)if(!enemies[i].dead)n++;return n})(),
      bullets:bullets.length,eBullets:eBullets.length,pots:(function(){var n=0,i;for(i=0;i<pots.length;i++)if(!pots[i].dead)n++;return n})(),
      drops:drops.length,wave:waveIdx,waveState:waveState,
      boss:bossRef?{hp:Math.round(bossRef.hp),maxHp:bossRef.maxHp,kind:bossRef.bossKind,name:bossRef.name,x:Math.round(bossRef.x),y:Math.round(bossRef.y)}:null,
      mission:mission,missionName:ST.name,levelW:ST.w,cleared:cleared}},
    player:P,input:input,
    get enemies(){return enemies},get bullets(){return bullets},get eBullets(){return eBullets},
    get pots(){return pots},get drops(){return drops},get plats(){return plats},get pending(){return pendingKinds},
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:start,attack:attack,slash:attack,jump:jump,dash:doDash,shuriken:throwShuriken,fury:doFury,
    dir:function(l,r){input.left=!!l;input.right=!!r;dirSync()},get axis(){return input.ax},get dirs(){return{l:!!input.left,r:!!input.right,ax:input.ax,locked:dirHeldN>0}},
    pause:pause,resume:resumeState,boss:mkBoss,
    spawn:function(k,x,y){return mkEnemy(k,x===undefined?(P.x+80):x,y===undefined?GY-26:y)},
    spawnWave:function(){queueWave();var i,n=Math.min(6,pendingKinds.length);for(i=0;i<n;i++)spawnOne(pendingKinds.shift())},
    setMission:function(m){mission=clamp(m,0,STAGES.length-1)},
    teleport:function(x,y){P.x=clamp(x,20,ST.w-40);if(y!==undefined){P.y=clamp(y,20,VH-30);P.vy=0}},
    hurt:function(n){hurtPlayer(n)},setFury:function(f){fury=clamp(f,0,100);hud()},setShur:function(n){P.shur=n;hud()},
    forceAttack:function(){P.atkT=0;attack()},
    hunter:function(){var e=null,i;for(i=0;i<enemies.length;i++)if(!enemies[i].dead){e=enemies[i];break}return e}
  };
}
})();
</script>
<script>
/* nano-tap-fast: tombol balas SEKETIKA saat jari menyentuh, bukan saat jari diangkat —
   supaya ambang tekan-lama WhatsApp (~0,5 dtk) tidak pernah tercapai sehingga menu
   "Hapus/Teruskan" tidak sempat muncul. */
(function(){var D=document,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit)/i;
function hit(el){for(var n=el,k=0;n&&n!==D.body&&k<5;n=n.parentElement,k++){var tn=n.tagName;
if(tn==='BUTTON'||tn==='A'||tn==='SUMMARY')return true;
if(n.getAttribute&&n.getAttribute('role')==='button')return true;
if(n.className&&typeof n.className==='string'&&PAD.test(n.className))return true}return false}
/* Satu ketukan = satu aksi: klik buatan dibedakan dari klik asli lewat isTrusted,
   jadi apa pun urutan kedatangannya, aksi tidak mungkin jalan dua kali. */
var g=null;
D.addEventListener('pointerdown',function(e){if(e.button)return;var t=e.target;
if(!t||!t.dispatchEvent||!hit(t))return;
if(t.closest&&t.closest('textarea,input,select,[contenteditable]'))return;
var x=e.clientX,y=e.clientY,gg={done:0,target:t};g=gg;
setTimeout(function(){
if(gg.done)return;gg.done=1;if(e.defaultPrevented)return;syn=true;
try{t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}))}catch(err){}
syn=false;setTimeout(function(){if(g===gg)g=null},700)},0)},true);
D.addEventListener('click',function(e){
if(syn)return;var gg=g;g=null;
if(!gg||gg.target!==e.target)return;
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
::selection{background:rgba(255,77,99,.32)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(255,207,110,.35);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
.mbtn,.abtn,.sbtn,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.22),inset 0 -3px 5px rgba(0,0,0,.44),0 4px 0 rgba(0,0,0,.45),0 8px 16px rgba(0,0,0,.4)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 18px 40px rgba(0,0,0,.6),0 2px 0 rgba(0,0,0,.5)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.07),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 34px rgba(0,0,0,.55)!important}
.stage canvas{filter:saturate(1.07) contrast(1.05)}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '⚔️', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Shadow Blade ⚔️',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-shadowblade-2026',
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

handler.help = ['shadowblade', 'shadow', 'ninja', 'blade']
handler.tags = ['game']
handler.command = /^(shadowblade|shadow|ninja|blade)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Shadow Blade Nano Ai - ninja melee, kombo 3-hit, shuriken, dash, AMARAH, 5 sektor, 5 bos'

export default handler
