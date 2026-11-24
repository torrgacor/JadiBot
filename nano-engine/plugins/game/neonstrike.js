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
┇▫️Nama    : NEON STRIKE — Nano Ai Arcade
┇▫️Genre   : Run & Gun / Platformer aksi
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
<meta name="theme-color" content="#05060f">
<title>Nano Ai Neon Strike</title>
<style>
:root{--bg:#05060f;--panel:#0d1024;--panel2:#141935;--line:#2f3a6e;--text:#eaf0ff;--dim:#8e9ac9;--cyan:#4de2ff;--magenta:#ff4dd2;--violet:#8a6bff;--amber:#ffc24d;--lime:#7bff8e;--red:#ff5b6e}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(780px 440px at 50% -10%,#22205c 0%,#0a0c22 56%,#04050e 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#1b1f45,#0a0d20);border:1px solid #3a4688;border-radius:22px;padding:10px;box-shadow:0 30px 80px #000d,inset 0 1px 0 #ffffff14;touch-action:manipulation}
.head{position:relative;z-index:9;display:flex;align-items:center;justify-content:space-between;gap:9px;background:#080a1c;border:1px solid #2a3266;border-radius:14px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#39e6ff,#7a3cff 60%,#ff3fc0);border:1px solid #6f7bdd;color:#04061a;font:950 17px system-ui;letter-spacing:-.5px;box-shadow:0 4px 0 #170f3c,inset 0 1px 0 #ffffff8c}
.brandText{min-width:0}
.title{font-size:16px;font-weight:950;letter-spacing:1.1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(90deg,#8ff4ff,#ff9ceb 70%,#ffe08a);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.headBtns{display:flex;gap:6px;flex:none}
.mb{width:38px;height:38px;flex:none;border:1px solid #39418a;border-radius:10px;background:linear-gradient(180deg,#222a5e,#101433);color:#e7ecff;font-size:16px;box-shadow:0 3px 0 #06091c}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#070919;border:1px solid #252d5c;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hpWrap{display:flex;align-items:center;gap:5px;flex:1 1 128px;min-width:118px}
.hpWrap b{font-size:6.6px;letter-spacing:.14em;color:var(--dim)}
.hpBar{position:relative;flex:1;height:11px;border-radius:6px;background:#2a1030;border:1px solid #5c2a58;overflow:hidden;box-shadow:inset 0 2px 4px #000a}
.hpBar i{position:absolute;inset:0 auto 0 0;width:100%;border-radius:6px 0 0 6px;background:linear-gradient(180deg,#7bffb0,#2fd68a 58%,#12935c);transition:width .16s ease}
.hpBar.low i{background:linear-gradient(180deg,#ffe08a,#ffa53a 60%,#b85a06)}
.hpBar.crit i{background:linear-gradient(180deg,#ffb0bd,#ff4d63 60%,#8d0f24);animation:pulseHp .7s infinite}
@keyframes pulseHp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}
.hpNum{font:900 10px system-ui;color:#c9d6ff;min-width:20px;text-align:right}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#111634;border:1px solid #2b3369;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:var(--dim)}
.hs span{font:900 10px system-ui;color:#bcd0ff;letter-spacing:.3px}
.hs.wp span{color:#8ff4ff}.hs.wp b{color:#3fb8d8}
.hs.dash span.ready{color:var(--lime)}.hs.dash span.wait{color:#ffab6b}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #2b335f;border-radius:15px;overflow:hidden;background:#03040c;box-shadow:inset 0 10px 26px #000d,0 8px 22px #0009}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.prog{position:absolute;left:0;right:0;bottom:0;height:5px;background:#000000aa}
.prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#39e6ff,#ff3fc0);box-shadow:0 0 10px #39e6ffaa;transition:width .2s ease}
.bossBar{position:absolute;left:8px;right:8px;top:7px;padding:5px 7px;border-radius:9px;background:#14062ae8;border:1px solid #6c2ba8;opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .25s ease;pointer-events:none}
.bossBar.show{opacity:1;transform:translateY(0)}
.bossBar b{display:block;font:900 6.8px system-ui;letter-spacing:.2em;color:#e6b0ff;margin-bottom:3px}
.bossBar .bb{height:7px;border-radius:4px;background:#26103f;border:1px solid #5c2585;overflow:hidden}
.bossBar .bb i{display:block;height:100%;width:100%;background:linear-gradient(180deg,#ff9cf0,#c33ce0 58%,#6b0f92);transition:width .18s ease}
.banner{position:absolute;left:0;right:0;top:33%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease,letter-spacing .4s ease;font:950 17px system-ui;letter-spacing:.06em;color:#dff7ff;text-shadow:0 3px 0 #000000a0,0 0 18px #39e6ff8c}
.banner.show{opacity:1;letter-spacing:.16em}
.banner small{display:block;margin-top:5px;font:800 8px system-ui;letter-spacing:.2em;color:#9fb4ff}
.flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 55%,rgba(255,77,110,0) 40%,rgba(255,77,110,.5));opacity:0;transition:opacity .12s ease}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#03040cd9;backdrop-filter:blur(9px);padding:12px;border-radius:22px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,366px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #4a56a8;border-radius:17px;background:linear-gradient(180deg,#181e4a,#0b0f28);box-shadow:0 20px 46px #000a,inset 0 1px 0 #ffffff1c;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-size:20px;font-weight:950;letter-spacing:.5px}
.ovText{margin-top:6px;color:var(--dim);font-size:9px;line-height:1.5}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #333c7e;border-radius:9px;background:#0c1130}
.ovStats b{display:block;font-size:12px;color:#9df0ff}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sbtn{min-height:38px;border:1px solid #414c9c;border-radius:10px;background:linear-gradient(180deg,#232c66,#131940);color:#eaf0ff;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #080c22,inset 0 1px 0 #ffffff1c;touch-action:manipulation}
.sbtn.sel{border-color:#ffd98a;background:linear-gradient(180deg,#a8853a,#5f4a12);color:#1b1403;box-shadow:0 4px 0 #3a2c08,inset 0 1px 0 #fff6}
.sbtn.go{border-color:#7bffb0;background:linear-gradient(180deg,#4be0a0,#177a52);color:#052016;box-shadow:0 4px 0 #0d3a28,inset 0 1px 0 #ffffff4d}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #080c22}
.pad{margin-top:9px;display:grid;grid-template-columns:1.05fr 1fr;gap:9px;align-items:end}
.movePad{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:58px 44px;gap:6px;touch-action:none}
.movePad .mbtn{min-height:0;padding:2px;font-size:19px}
.mbtn.down{grid-column:1/3}
/* area tombol arah: gesture eksklusif — jari di sini tidak boleh menggulir halaman */
.nano-analog{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;overscroll-behavior:contain}
body .pad:active{transform:none!important}
.mbtn{min-height:56px;border:1px solid #3f4a95;border-radius:13px;background:linear-gradient(180deg,#28326f,#141a44);color:#f0f4ff;font:900 19px system-ui;box-shadow:0 5px 0 #080c22,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none;display:grid;place-items:center}
.mbtn small{display:block;font-size:6px;letter-spacing:.14em;color:#a4b0e8;margin-top:1px}
.mbtn.active{transform:translateY(3px);box-shadow:0 2px 0 #080c22;filter:brightness(1.2)}
.actPad{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.abtn{min-height:44px;border:1px solid #4652a8;border-radius:13px;background:linear-gradient(180deg,#2a3477,#151b48);color:#f0f4ff;font:900 8px system-ui;letter-spacing:.06em;box-shadow:0 5px 0 #080c22,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none}
.abtn.fire{grid-column:1/3;grid-row:3;min-height:74px;border-radius:50%;border:2px solid #9ff2ff;background:radial-gradient(circle at 35% 28%,#bff6ff,#1fbcff 45%,#7a2bff 78%,#2a0a5e);color:#00131f;font:950 12px system-ui;letter-spacing:.1em;box-shadow:0 7px 0 #150a3a,0 0 28px #39e6ff5c,inset 0 2px 0 #ffffff66}
.abtn.jump{background:linear-gradient(180deg,#2f6f6b,#123a3a);border-color:#3fa6a0}
.abtn.dash{background:linear-gradient(180deg,#5c3a94,#2a1657);border-color:#9a6bff}
.abtn.nade{background:linear-gradient(180deg,#8a6a1e,#3d2c08);border-color:#d8ac33;color:#ffeeb8}
.abtn.active{transform:translateY(4px);box-shadow:0 2px 0 #080c22;filter:brightness(1.2)}
.abtn.cool{opacity:.45;filter:saturate(.35)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#7d88c4;font-size:6.4px}
.foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot kbd{padding:2px 4px;border:1px solid #333d7c;border-radius:4px;background:#0a0e28;color:#9faaeb;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px;border-radius:19px}.title{font-size:14px}.logo{width:35px;height:35px;font-size:14px}.mbtn{min-height:50px}.abtn.fire{min-height:64px;font-size:10.5px}.hs span{font-size:9px}.ovTitle{font-size:17px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px;border-radius:24px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">NS</div>
        <div class="brandText"><div class="title">NEON STRIKE</div><div class="sub" id="missionSub">SEKTOR 01 • NANO AI ARCADE</div></div>
      </div>
      <div class="headBtns">
        <button class="mb" id="pauseB" type="button" aria-label="Jeda">⏸</button>
        <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
      </div>
    </div>

    <div class="hud">
      <div class="hpWrap"><b>BODY</b><div class="hpBar" id="hpBar"><i id="hpFill"></i></div><span class="hpNum" id="hpTxt">100</span></div>
      <div class="hs"><b>SKOR</b><span id="score">0</span></div>
      <div class="hs"><b>NYAWA</b><span id="lives">3</span></div>
      <div class="hs wp"><b id="wpn">PULSE</b><span id="ammo">∞</span></div>
      <div class="hs dash"><b>DASH</b><span id="dashTxt" class="ready">SIAP</span></div>
      <div class="hs"><b>EMP</b><span id="nade">5</span></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="bossBar" id="bossBar"><b id="bossName">⚠ BOS</b><div class="bb"><i id="bossFill"></i></div></div>
      <div class="banner" id="banner"></div>
      <div class="flash" id="flash"></div>
      <div class="prog"><i id="progFill"></i></div>
    </div>

    <div class="pad">
      <div class="movePad nano-analog" id="movePad">
        <button class="mbtn left" id="bLeft" type="button">◀<small>KIRI</small></button>
        <button class="mbtn right" id="bRight" type="button">▶<small>KANAN</small></button>
        <button class="mbtn down" id="bDown" type="button">▼<small>JONGKOK</small></button>
      </div>
      <div class="actPad">
        <button class="abtn jump" id="bJump" type="button">⤒ LOMPAT</button>
        <button class="abtn dash" id="bDash" type="button">↯ DASH</button>
        <button class="abtn nade" id="bNade" type="button">💥 EMP</button>
        <button class="abtn fire" id="bFire" type="button">TEMBAK</button>
      </div>
    </div>

    <div class="foot"><span>Tahan TEMBAK untuk tembakan beruntun • ↯ DASH membuat kamu kebal sekejap</span><span><kbd>←→</kbd> <kbd>SPACE</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> <kbd>P</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🌃</div>
        <h2 class="ovTitle" id="ovTitle">NEON STRIKE</h2>
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
function sgn(v){return v<0?-1:(v>0?1:0)}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function pick(a){return a[(Math.random()*a.length)|0]}

var cv=$('cv'),ctx=cv.getContext('2d',{alpha:false});
var VW=480,VH=296,GY=252;
var PX=1,LOW=false;
try{LOW=(navigator.hardwareConcurrency||4)<=2}catch(e){}
function fit(){
  var host=cv.parentNode||D.body;
  var w=host.clientWidth||VW,h=host.clientHeight||VH;
  var dpr=Math.min(1.35,Math.max(1,window.devicePixelRatio||1));
  cv.width=Math.max(280,Math.round(w*dpr));
  cv.height=Math.max(170,Math.round(cv.width*VH/VW));
  if(cv.width/VW>2.6)cv.width=Math.round(2.6*VW),cv.height=Math.round(2.6*VH);
  PX=cv.width/VW;
  ctx.imageSmoothingEnabled=true;
  if(ctx.imageSmoothingQuality)ctx.imageSmoothingQuality='high';
}
/* ══════════ AUDIO ══════════ */
var AC=null,master=null,muted=false;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.5;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  var a=ensureAC();if(!a)return;var m=bus();if(!m)return;
  try{
    var t0=a.currentTime+(delay||0);
    var o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';
    o.frequency.setValueAtTime(f1,t0);
    if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(24,f2),t0+dur);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol||0.05),t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(m);o.start(t0);o.stop(t0+dur+0.02);
  }catch(e){}
}
function noise(dur,vol,f0,f1,delay){
  var a=ensureAC();if(!a)return;var m=bus();if(!m)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur));
    var buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var s=a.createBufferSource();s.buffer=buf;
    var bp=a.createBiquadFilter();bp.type='lowpass';
    bp.frequency.setValueAtTime(f0||900,a.currentTime);
    if(f1)bp.frequency.exponentialRampToValueAtTime(Math.max(60,f1),a.currentTime+dur);
    var g=a.createGain();g.gain.value=vol||0.08;
    s.connect(bp);bp.connect(g);g.connect(m);
    s.start(a.currentTime+(delay||0));
  }catch(e){}
}
var sfx={
  shot:function(){tone(520,220,.07,.045,'square')},
  scatter:function(){noise(.16,.07,1800,400)},
  rail:function(){tone(1200,240,.2,.06,'sawtooth')},
  flame:function(){noise(.22,.05,700,260)},
  jump:function(){tone(320,700,.12,.045,'triangle')},
  dash:function(){tone(900,300,.16,.05,'sawtooth')},
  hit:function(){tone(180,90,.08,.05,'square')},
  kill:function(){noise(.24,.09,1200,180);tone(300,80,.18,.04,'square')},
  boom:function(){noise(.5,.16,900,60);tone(120,40,.42,.07,'sawtooth')},
  pickup:function(){tone(700,1400,.14,.05,'triangle')},
  nade:function(){tone(240,1400,.3,.06,'sawtooth')},
  boss:function(){tone(120,60,.7,.08,'sawtooth');noise(.7,.1,700,90)},
  clear:function(){tone(660,1320,.3,.06,'triangle');tone(990,1980,.34,.05,'triangle',.16)},
  dead:function(){tone(420,60,.6,.07,'sawtooth')},
  click:function(){tone(880,660,.05,.04,'square')},
  mech:function(){tone(140,420,.4,.06,'square')}
};
/* ══════════ SENJATA ══════════ */
var WPN={
  pulse:{name:'PULSE',dmg:9,cd:9,speed:8.2,spread:0,count:1,ammo:0,color:'#8ff4ff',size:3,snd:'shot'},
  scatter:{name:'SCATTER',dmg:6,cd:28,speed:7,spread:.26,count:5,ammo:60,color:'#ffd98a',size:2.6,snd:'scatter'},
  rail:{name:'RAIL',dmg:26,cd:42,speed:12,spread:0,count:1,ammo:32,color:'#c9a4ff',size:4,pierce:8,snd:'rail'},
  flame:{name:'FLAME',dmg:4,cd:6,speed:5.4,spread:.1,count:2,ammo:90,color:'#ff9a4d',size:4.6,life:22,snd:'flame'}
};
var WORDER=['pulse','scatter','rail','flame'];
/* ══════════ MISI ══════════ */
function pal(o){return o}
var MISSIONS=[
  {name:'NEO-GANGWAY',sub:'SEKTOR 01 • HUJAN NEON',w:4180,
   pal:pal({sky:['#1b1140','#3b1d63','#6b2a7a'],far:'#241a52',mid:'#2f2a6e',ground:'#171a3d',top:'#4de2ff',neon:['#ff4dd2','#4de2ff','#ffc24d'],rain:true}),
   pool:['drone','trooper','charger'],boss:{name:'BOR-9 WALKER',kind:'walker',hp:260}},
  {name:'DATAPORT 77',sub:'SEKTOR 02 • RUANG SERVER',w:4380,
   pal:pal({sky:['#06121f','#0a2340','#0e3a5c'],far:'#0d2740',mid:'#123a56',ground:'#0a2036',top:'#7bff8e',neon:['#7bff8e','#4de2ff','#ffc24d'],rain:false}),
   pool:['turret','trooper','drone'],boss:{name:'ARCHIVE SENTINEL',kind:'sentinel',hp:300}},
  {name:'SKY BRIDGE',sub:'SEKTOR 03 • JEMBATAN LANGIT',w:4520,
   pal:pal({sky:['#240f2e','#4a1a4a','#8a2f5c'],far:'#3a1740',mid:'#57245a',ground:'#2a1230',top:'#ffc24d',neon:['#ffc24d','#ff4dd2','#c9a4ff'],rain:false}),
   pool:['drone','charger','turret'],boss:{name:'HOVER CARRIER',kind:'carrier',hp:320}},
  {name:'REACTOR CORE',sub:'SEKTOR 04 • ZONA PANAS',w:4680,
   pal:pal({sky:['#2a1104','#5c2208','#a8440c'],far:'#521c06',mid:'#75300a',ground:'#3a1706',top:'#ff9a4d',neon:['#ff9a4d','#ffe08a','#ff4d63'],rain:false}),
   pool:['shield','trooper','turret'],boss:{name:'MAGMA CRAWLER',kind:'crawler',hp:360}},
  {name:'NEON THRONE',sub:'SEKTOR 05 • ISTANA DATA',w:4900,
   pal:pal({sky:['#0a0620','#1a0f45','#331b73'],far:'#1b1150',mid:'#2b1a6e',ground:'#140d38',top:'#ff4dd2',neon:['#ff4dd2','#8a6bff','#4de2ff'],rain:true}),
   pool:['drone','shield','charger','trooper'],boss:{name:'OMEGA CORE',kind:'core',hp:420}}
];
/* ══════════ STATE ══════════ */
var state='menu',tick=0,mission=0,LEV=MISSIONS[0];
var cam={x:0,shake:0},flashT=0,bannerT=0,bannerTxt='',bannerSub='',bannerEl=null;
var score=0,lives=3,kills=0,shots=0,hits=0,diff=1,diffName='NORMAL';
var enemies=[],bullets=[],eBullets=[],nades=[],booms=[],parts=[],pops=[],drops=[],plats=[],pods=[],mech=null;
var bossRef=null,waveIdx=0,waveT=0,waveState='idle',spawned=0,missionDone=false;
var pending=[],spawnCd=0,waveQuota=0,fightT=0,MAXALIVE=8,WAVES=5,killStart=0;
var CLEAR_KEY='nano_ns_clear';
var cleared={};
try{var _c=localStorage.getItem(CLEAR_KEY);if(_c){var _a=_c.split(',');for(var _i=0;_i<_a.length;_i++)if(_a[_i])cleared[_a[_i]]=1}}catch(e){}
function markCleared(id){cleared[id]=1;try{var l=[],k;for(k in cleared)if(cleared[k])l.push(k);localStorage.setItem(CLEAR_KEY,l.join(','))}catch(e){}}
var FIXED=1/60,acc=0,last=0;
var G=1180,RUN=138,JUMP=-452,DASHV=460,DASH_T=13,DASH_CD=58;
var P={x:60,y:GY-26,w:15,h:26,vx:0,vy:0,onGround:false,face:1,crouch:false,
  hp:100,maxHp:100,inv:0,weapon:'pulse',ammo:{},bombs:5,dashT:0,dashCd:0,djump:0,hurt:0,anim:0,dead:false,deadT:0,fireT:0,pierceT:0};
var input={ax:0,left:false,right:false,down:false,jump:false,fire:false};
var jumpBuf=0,nadeBuf=0;
/* ══════════ LEVEL ══════════ */
function buildLevel(m){
  var i,LV=MISSIONS[m];LEV=LV;
  plats=[{x:0,y:GY,w:LV.w,h:VH-GY}];
  pods=[];mech=null;bossRef=null;waveIdx=0;waveState='idle';waveT=90;missionDone=false;spawned=0;
  for(i=0;i<Math.floor(LV.w/430);i++){
    var x=330+i*430+rnd(-40,40);
    var y=GY-ri(64,116),w=ri(84,168);
    plats.push({x:Math.max(200,x),y:y,w:w,h:14});
    if(i%2===1)plats.push({x:Math.max(160,x+120),y:y-ri(58,96),w:ri(70,130),h:14});
  }
  /* pod mech di tengah misi */
  pods.push({x:Math.floor(LV.w*0.46),y:GY-30,w:30,h:30,used:false});
  enemies.length=0;bullets.length=0;eBullets.length=0;nades.length=0;booms.length=0;parts.length=0;pops.length=0;drops.length=0;
  P.x=60;P.y=GY-P.h;P.vx=0;P.vy=0;P.face=1;P.hp=P.maxHp;P.inv=40;P.dead=false;P.deadT=0;P.dashT=0;P.dashCd=0;P.djump=0;P.crouch=false;
  P.weapon='pulse';P.ammo={scatter:0,rail:0,flame:0};P.bombs=5;P.pierceT=0;
  cam.x=0;cam.shake=0;
}
function solidRects(){
  var out=[],i;
  for(i=0;i<plats.length;i++)out.push(plats[i]);
  for(i=0;i<crates.length;i++)if(!crates[i].dead)out.push({x:crates[i].x,y:crates[i].y,w:crates[i].w,h:crates[i].h,crate:true,ref:crates[i]});
  return out;
}
var crates=[];
function spawnCrates(){
  crates=[];var i;
  for(i=0;i<Math.floor(LEV.w/360);i++){
    var x=200+i*360+rnd(-50,50);
    if(Math.random()<.45)crates.push({x:x,y:GY-22,w:22,h:22,hp:18,kick:rnd(-1,1),dead:false,kind:Math.random()<.45?'weapon':'bomb',hit:0});
  }
}
/* ══════════ SPAWNER ══════════ */
/* Daftar musuh satu gelombang dimasukkan ke antrean, lalu dimunculkan bertahap
   (paling banyak MAXALIVE di layar) supaya layar tidak jadi ladang penuh tapi
   juga tidak pernah macet kalau pemain lambat membunuh. */
function queueWave(){
  var i,budget=6+waveIdx*2+(diff>=2?2:0),t;
  pending=[];
  for(i=0;i<budget;i++){
    if(mission===4&&Math.random()<.3)t='shield';
    else t=LEV.pool[i%LEV.pool.length];
    pending.push(t);
  }
  waveQuota=budget;spawnCd=0;
  return budget;
}
function spawnOne(kind){
  var x=clamp(P.x+ri(110,340),P.x+60,LEV.w-30),y=GY-24;
  if(kind==='drone')y=GY-ri(78,140);
  else if(kind==='shield')y=GY-26;
  else if(kind==='charger')y=GY-22;
  mkEnemy(kind,x,y);
}
function spawnWave(){
  queueWave();
  var n=Math.min(6,pending.length),i;
  for(i=0;i<n;i++)spawnOne(pending.shift());
}
function mkEnemy(kind,x,y){
  var e={kind:kind,x:x,y:y,vx:0,vy:0,dead:false,hp:1,w:18,h:26,face:-1,atkT:ri(30,70),hurt:0,anim:rnd(0,6),stun:0,hitT:0};
  if(kind==='trooper'){e.hp=Math.round(26*(1+diff*.25));e.w=15;e.h=24}
  else if(kind==='drone'){e.hp=Math.round(18*(1+diff*.2));e.w=20;e.h=13;e.fly=1;e.baseY=y;e.bob=rnd(0,6);e.cool=ri(110,220);e.diveT=0}
  else if(kind==='turret'){e.hp=Math.round(40*(1+diff*.25));e.w=24;e.h=24;e.static=1}
  else if(kind==='charger'){e.hp=Math.round(22*(1+diff*.2));e.w=17;e.h=22;e.charge=0}
  else if(kind==='shield'){e.hp=Math.round(46*(1+diff*.25));e.w=18;e.h=26;e.shield=1;e.shieldHp=22}
  enemies.push(e);return e;
}
function mkBoss(){
  var b=LEV.boss,hp=Math.round(b.hp*(1+(diff-1)*.35));
  /* bos HARUS lahir di dalam peta — kalau pemain sudah di ujung kanan, bos muncul di sebelah kiri,
     supaya tidak pernah ada kondisi bos di luar batas level yang tak bisa ditembak */
  var bx=clamp(P.x+150,120,LEV.w-110);
  if(bx<P.x+90)bx=clamp(P.x-190,60,LEV.w-110);
  var e={kind:'boss',bossKind:b.kind,name:b.name,x:bx,y:GY-64,w:56,h:64,hp:hp,maxHp:hp,vx:0,vy:0,dead:false,face:-1,atkT:70,hurt:0,anim:0,phase:0,phaseT:0,fly:b.kind==='carrier'||b.kind==='sentinel',baseY:GY-64,hitT:0,spawn:60};
  e.x=clamp(e.x,60,LEV.w-60);
  if(b.kind==='crawler'){e.h=44;e.w=78;e.y=GY-44}
  if(b.kind==='core'){e.h=72;e.w=64;e.y=GY-72}
  enemies.push(e);bossRef=e;bossBar.classList.add('show');$('bossName').textContent='⚠ '+b.name;
  sfx.boss();
  return e;
}
/* ══════════ PLAYER ACTIONS ══════════ */
function curW(){return WPN[P.weapon]||WPN.pulse}
function fire(){
  if(state!=='play'||P.dead)return;
  var w=curW();
  if(P.fireT>0)return;
  P.fireT=w.cd;
  if(P.weapon!=='pulse'){
    if((P.ammo[P.weapon]||0)<=0){P.weapon='pulse';hud();}
    else P.ammo[P.weapon]--;
  }
  var i,sp=w.spread||0;
  var mx=P.x+P.face*12,my=P.y+(P.crouch?15:7);
  for(i=0;i<w.count;i++){
    var ang=-sp/2+(w.count>1?sp*(i/(w.count-1)):0);
    bullets.push({x:mx,y:my,vx:P.face*w.speed*Math.cos(ang),vy:w.speed*Math.sin(ang),dmg:w.dmg,life:w.life||52,color:w.color,size:w.size,pierce:w.pierce||0,hit:[]});
  }
  shots++;
  var s=sfx[w.snd]||sfx.shot;s();
  if(P.weapon==='flame')for(i=0;i<2;i++)parts.push({x:mx,y:my,vx:P.face*rnd(1,2.6),vy:rnd(-.7,.7),life:12,max:12,c:w.color,r:rnd(2,4)});
  hud();
}
function throwNade(){
  if(state!=='play'||P.dead||P.bombs<=0||nadeBuf>0)return;
  P.bombs--;nadeBuf=12;
  nades.push({x:P.x,y:P.y+4,vx:P.face*3.1,vy:-2.6,t:0,shock:1});
  sfx.nade();
  if(mech){mech.emp=1}
  hud();
}
function doDash(){
  if(state!=='play'||P.dead||P.dashCd>0)return;
  P.dashT=DASH_T;P.dashCd=DASH_CD;P.inv=Math.max(P.inv,DASH_T+4);P.pierceT=34;
  P.vx=P.face*DASHV;P.vy=0;
  sfx.dash();
  var i;for(i=0;i<8;i++)parts.push({x:P.x,y:P.y+rnd(2,P.h),vx:-P.face*rnd(.6,2.4),vy:rnd(-.5,.5),life:16,max:16,c:'#8ff4ff',r:rnd(1.4,3)});
  hud();
}
function jump(){
  if(state!=='play'||P.dead)return;
  if(P.onGround){P.vy=JUMP;P.onGround=false;P.djump=1;sfx.jump()}
  else if(P.djump>0){P.vy=JUMP*.88;P.djump=0;sfx.jump();var i;for(i=0;i<7;i++)parts.push({x:P.x,y:P.y+P.h,vx:rnd(-1.4,1.4),vy:rnd(0,1.6),life:14,max:14,c:'#c9a4ff',r:rnd(1.2,2.6)})}
}
function hurtPlayer(n,fromX){
  if(state!=='play'||P.dead||P.inv>0)return;
  P.hp-=n;P.inv=80;P.hurt=18;cam.shake=Math.max(cam.shake,5);
  var fin=P.hp<=0;if(fin)P.hp=0;
  sfx.hit();
  flashT=8;
  var i;for(i=0;i<10;i++)parts.push({x:P.x,y:P.y+rnd(2,P.h),vx:rnd(-2,2),vy:rnd(-2,.6),life:18,max:18,c:'#ff5b6e',r:rnd(1.3,3)});
  if(fin)killPlayer();
  else if(!mech&&P.hp<20)popup(P.x,P.y-8,'AWAS!','#ff5b6e');
}
function killPlayer(){
  if(P.dead)return;
  P.dead=true;P.deadT=0;sfx.dead();
  var i;for(i=0;i<24;i++)parts.push({x:P.x,y:P.y+rnd(0,P.h),vx:rnd(-3,3),vy:rnd(-3.2,1),life:30,max:30,c:pick(['#ff5b6e','#ffc24d','#8ff4ff']),r:rnd(1.6,3.6)});    booms.push({x:P.x,y:P.y+8,r:0,max:34,life:22,lifeMax:22,kind:'death'});
}
/* ══════════ DAMAGE ══════════ */
function hurtEnemy(e,dmg,x,y){
  if(e.dead)return;
  /* perisai hanya bisa ditembus dengan DASH (menerjang dari sisi lain) */
  if(e.shield&&e.shieldHp>0&&!(P.dashT>0||P.pierceT>0)){
    e.shieldHp-=dmg;hits++;popup(e.x,e.y,'BLOCK','#9fb4ff');
    if(e.shieldHp<=0){e.shieldHp=0;e.shield=0;popup(e.x,e.y-8,'PERISAI PECAH','#7bff8e');booms.push({x:e.x,y:e.y+10,r:0,max:20,life:14,lifeMax:14,kind:'crate'})}
    sfx.hit();return
  }
  e.hp-=dmg;e.hurt=6;hits++;
  var i;for(i=0;i<4;i++)parts.push({x:x||e.x,y:y||e.y+e.h/2,vx:rnd(-1.6,1.6),vy:rnd(-1.8,.4),life:12,max:12,c:'#ffd98a',r:rnd(1,2.2)});
  if(e.hp<=0){
    e.dead=true;kills++;
    score+=e.bossKind?1600:e.fly?95:75;
    sfx.kill();
    for(i=0;i<(e.bossKind?34:12);i++)parts.push({x:e.x,y:e.y+rnd(0,e.h),vx:rnd(-3.4,3.4),vy:rnd(-3.4,1.2),life:e.bossKind?34:22,max:e.bossKind?34:22,c:pick(['#ffc24d','#ff9a4d','#8ff4ff','#ff4d63']),r:rnd(1.4,3.4)});
    booms.push({x:e.x,y:e.y+e.h/2,r:0,max:e.bossKind?64:26,life:e.bossKind?30:18,lifeMax:e.bossKind?30:18,kind:'kill'});
    if(e.bossKind){cam.shake=12;flashT=10}
    else if(Math.random()<.22)drops.push({x:e.x,y:e.y+e.h/2,vy:-1.6,kind:Math.random()<.6?'weapon':'hp',t:0});
    if(e===bossRef||e.bossKind){
      bossBar.classList.remove('show');
      bossRef=null;
      onMissionClear();
    }
    hud();
  }
}
function popup(x,y,txt,c){pops.push({x:x,y:y,txt:txt,c:c||'#fff',life:34,lifeMax:34})}
/* ══════════ MISSION FLOW ══════════ */
function onMissionClear(){
  if(missionDone)return;
  missionDone=true;state='win';
  score+=600+Math.round(P.hp*6);
  sfx.clear();
  var stars=1;
  if(P.hp>=P.maxHp*.6)stars++;
  if(kills>=45)stars++;
  var key='m'+mission;
  var prev=cleared[key+'_s']|0;
  cleared[key+'_s']=Math.max(prev,stars);
  markCleared(key);
  setTimeout(function(){if(state==='win')winScreen(stars)},700);
}
function winScreen(stars){
  var s='',i;
  for(i=0;i<3;i++)s+=i<stars?'★':'☆';
  ovShow('🏆','SEKTOR AMAN',LEV.name+' selesai. '+s,
    [['SKOR',score],['BUNUH',kills],['AKURASI',(shots?Math.round(hits/shots*100):0)+'%']],
    mission<MISSIONS.length-1
      ? [{act:'next',label:'▶ SEKTOR BERIKUT',cls:'go'},{act:'again',label:'↻ ULANG'},{act:'menu',label:'⏹ MENU'}]
      : [{act:'again',label:'↻ MAIN LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
/* ══════════ CRATES / DROPS / POD ══════════ */
function breakCrate(c){
  c.dead=true;sfx.boom();
  booms.push({x:c.x+11,y:c.y+11,r:0,max:24,life:16,lifeMax:16,kind:'crate'});
  var i;for(i=0;i<12;i++)parts.push({x:c.x+11,y:c.y+11,vx:rnd(-2.4,2.4),vy:rnd(-2.8,.8),life:20,max:20,c:pick(['#ffc24d','#8ff4ff','#ff4d63']),r:rnd(1.2,2.8)});
  if(c.kind==='weapon')drops.push({x:c.x+6,y:c.y,vy:-2,kind:'weapon',t:0});
  else drops.push({x:c.x+6,y:c.y,vy:-2,kind:P.bombs<8?'nade':'hp',t:0});
}
function grabDrop(d){
  if(d.kind==='weapon'){
    var list=['scatter','rail','flame'];
    var w=pick(list);
    P.weapon=w;P.ammo[w]=(P.ammo[w]||0)+WPN[w].ammo;
    popup(P.x,P.y-6,WPN[w].name,'#8ff4ff');
  }else if(d.kind==='hp'){
    P.hp=Math.min(P.maxHp,P.hp+18);popup(P.x,P.y-6,'+18','#7bff8e');
  }else{
    P.bombs=Math.min(9,P.bombs+1);popup(P.x,P.y-6,'EMP+1','#ffc24d');
  }
  sfx.pickup();hud();
}
/* ══════════ MECH ══════════ */
function enterMech(pod){
  pod.used=true;  mech={x:pod.x+15,y:GY-46,w:34,h:46,vx:0,vy:0,onGround:true,face:P.face,hp:180,maxHp:180,fireT:0,emp:0,stomp:0,anim:0,inv:20};
  sfx.mech();banner('VIPER-9 ONLINE','MECH SIAP');
  var i;for(i=0;i<18;i++)parts.push({x:pod.x+15,y:GY-20,vx:rnd(-2.4,2.4),vy:rnd(-3,0),life:22,max:22,c:'#8ff4ff',r:rnd(1.4,3)});
}
function mechFire(){
  if(!mech||mech.fireT>0)return;
  mech.fireT=6;
  var i,side;
  for(side=-1;side<=1;side+=2){
    var mx=mech.x+mech.face*20,my=mech.y+14+side*7;
    for(i=0;i<2;i++)bullets.push({x:mx,y:my+(i-.5)*3,vx:mech.face*8.6,vy:rnd(-.12,.12),dmg:14,life:56,color:'#ffd98a',size:3.4,pierce:1,hit:[]});
  }
  shots+=2;sfx.scatter();
}
function ejectMech(){
  if(!mech)return;
  P.x=mech.x;P.y=mech.y-2;P.vy=-2.4;P.onGround=false;
  booms.push({x:mech.x,y:mech.y+mech.h/2,r:0,max:30,life:18,lifeMax:18,kind:'crate'});
  var i;for(i=0;i<18;i++)parts.push({x:mech.x,y:mech.y+mech.h/2,vx:rnd(-3,3),vy:rnd(-3,1),life:22,max:22,c:pick(['#ffc24d','#ff9a4d']),r:rnd(1.4,3)});
  P.inv=Math.max(P.inv,50);
  mech=null;sfx.boom();
}
/* ══════════ STEP (60 fps tetap) ══════════ */
function step(){
  if(state!=='play')return;
  tick++;
  var i,j,e,b;
  if(flashT>0)flashT--;
  if(bannerT>0)bannerT--;else if(bannerEl)bannerEl.classList.remove('show');
  if(nadeBuf>0)nadeBuf--;
  if(P.fireT>0)P.fireT--;
  if(P.inv>0)P.inv--;
  if(P.hurt>0)P.hurt--;
  if(P.dashCd>0)P.dashCd--;
  if(P.pierceT>0)P.pierceT--;
  if(mech&&mech.inv>0)mech.inv--;
  if(cam.shake>0)cam.shake=Math.max(0,cam.shake-.55);
  if(jumpBuf>0)jumpBuf--;

  /* ── pemain / mech ── */
  if(mech){
    var mAx=input.ax||0,mMag=Math.abs(mAx)<STICK_DEAD?0:Math.min(1,Math.abs(mAx)),mv=0;
    if(mMag)mv=mAx<0?-1:1;
    mech.vx+=(mv*164*mMag-mech.vx)*.2;
    if(mv)mech.face=mv;
    mech.vy+=G*.72*FIXED;
    if(mech.vy>900)mech.vy=900;
    mech.x=clamp(mech.x+mech.vx*FIXED,mech.w/2+4,LEV.w-mech.w/2-4);
    mech.y+=mech.vy*FIXED;
    var mSolid=hitGround(mech,true);
    if(mSolid){if(mech.vy>360)cam.shake=Math.max(cam.shake,4);mech.vy=0;mech.onGround=true}else mech.onGround=false;
    if(input.fire)mechFire();
    if(mech.fireT>0)mech.fireT--;
    if(mech.emp){mech.emp=0}
    if(jumpBuf>0&&mech.onGround){mech.vy=-520;mech.onGround=false;jumpBuf=0;sfx.jump()}
    if(mech.hp<=0)ejectMech();
    if(mech)P.x=mech.x;
    if(mech)P.y=mech.y;
    P.inv=Math.max(P.inv,2);
  }else{
    if(P.dead){
      P.deadT++;
      if(P.deadT>90){
        lives--;hud();
        if(lives<0){state='dead';deadScreen()}
        else{
          P.dead=false;P.hp=P.maxHp;P.inv=90;P.vy=0;
          P.x=clamp(P.x-120,40,LEV.w-60);P.y=GY-P.h;
          banner('NYAWA '+(lives+1),'HATI-HATI');
        }
      }
    }else{
      var dir=0,pAx=input.ax||0,aMag=Math.abs(pAx)<STICK_DEAD?0:Math.min(1,Math.abs(pAx));
      P.crouch=!!input.down&&P.onGround;
      if(P.dashT<=0){
        if(input.left)dir=-1;
        if(input.right)dir=1;
        if(dir){P.face=dir;P.anim+=.08+.24*aMag}
        var target=dir*(P.crouch?RUN*.42:RUN)*(0.3+0.7*aMag);
        P.vx+=(target-P.vx)*(P.onGround?.34:.16);
      }else{
        P.dashT--;
        P.vx=P.face*DASHV;
      }
      if(P.crouch&&P.onGround)P.vx*=.5;
      P.vy+=G*FIXED;
      if(P.vy>880)P.vy=880;
      P.x=clamp(P.x+P.vx*FIXED,10,LEV.w-40);
      P.y+=P.vy*FIXED;
      var g=hitGround(P,false);
      if(g){if(P.vy>7)cam.shake=Math.max(cam.shake,2.5);P.vy=0;P.onGround=true;P.djump=1}else P.onGround=false;
      if(P.y>VH+60){hurtPlayer(16,P.x);P.x=clamp(P.x-90,40,LEV.w-60);P.y=GY-P.h;P.vy=0}
      if(jumpBuf>0){jumpBuf=0;jump()}
      /* tembakan */
      if(input.fire)fire();
      /* ambil pod mech */
      for(i=0;i<pods.length;i++){
        var pd=pods[i];
        if(!pd.used&&Math.abs(P.x-(pd.x+15))<20&&Math.abs(P.y+P.h-(pd.y+30))<34){enterMech(pd);break}
      }
    }
  }
  /* ── granat ── */
  for(i=nades.length-1;i>=0;i--){
    var n=nades[i];n.t++;
    n.vy+=G*.5*FIXED;
    n.x+=n.vx*FIXED;n.y+=n.vy*FIXED;
    if(n.y>GY-4||n.t>90){
      nades.splice(i,1);
      booms.push({x:n.x,y:GY-8,r:0,max:74,life:26,lifeMax:26,kind:'emp'});
      sfx.boom();cam.shake=10;
      for(j=0;j<26;j++)parts.push({x:n.x,y:GY-8,vx:rnd(-5,5),vy:rnd(-4,1),life:26,max:26,c:pick(['#8ff4ff','#ffffff','#c9a4ff']),r:rnd(1.4,3.2)});
      for(j=0;j<enemies.length;j++){
        e=enemies[j];
        if(!e.dead&&Math.abs(e.x-n.x)<92)hurtEnemy(e,34,n.x,n.y);
      }
      for(j=0;j<crates.length;j++){
        var c2=crates[j];
        if(!c2.dead&&Math.abs(c2.x+11-n.x)<78)breakCrate(c2);
      }
    }
  }
  /* ── peluru pemain ── */
  for(i=bullets.length-1;i>=0;i--){
    b=bullets[i];
    b.x+=b.vx*FIXED*60;b.y+=b.vy*FIXED*60;b.life--;
    var gone=b.life<=0||b.x<0||b.x>LEV.w||b.y<-40||b.y>VH+40;
    if(!gone){
      for(j=0;j<enemies.length;j++){
        e=enemies[j];
        if(e.dead)continue;
        if(b.x>e.x-e.w/2&&b.x<e.x+e.w/2&&b.y>e.y&&b.y<e.y+e.h){
          if(b.pierce>0){if(b.hit.indexOf(e)<0){b.hit.push(e);hurtEnemy(e,b.dmg,b.x,b.y);if(b.pierce--<=0){gone=true}}}
          else{hurtEnemy(e,b.dmg,b.x,b.y);gone=true;break}
        }
      }
      if(!gone&&b.dmg>=6)for(j=0;j<crates.length;j++){
        var c3=crates[j];
        if(c3.dead)continue;
        if(b.x>c3.x&&b.x<c3.x+c3.w&&b.y>c3.y&&b.y<c3.y+c3.h){
          c3.hp-=b.dmg;c3.hit=6;
          if(c3.hp<=0)breakCrate(c3);
          gone=true;break;
        }
      }
    }
    if(gone)bullets.splice(i,1);
  }
  /* ── musuh ── */
  for(i=enemies.length-1;i>=0;i--){
    e=enemies[i];
    if(e.dead){enemies.splice(i,1);continue}
    if(e.hurt>0)e.hurt--;
    if(e.hitT>0)e.hitT--;
    e.anim+=.16;
    if(e.bossKind){stepBoss(e);continue}
    if(Math.abs(e.x-P.x)>640&&!e.fly)continue;
    if(e.kind==='trooper'){
      e.face=P.x<e.x?-1:1;
      var dx=P.x-e.x;
      if(Math.abs(dx)>110)e.x+=sgn(dx)*.62;
      else if(Math.abs(dx)<54)e.x-=sgn(dx)*.34;
      e.atkT--;
      if(e.atkT<=0&&Math.abs(dx)<260){
        e.atkT=ri(56,96);
        eBullets.push({x:e.x+e.face*9,y:e.y+9,vx:e.face*3.3,vy:0,dmg:7,life:120,color:'#ff5b6e',size:3});
        sfx.shot();
      }
    }else if(e.kind==='charger'){
      e.face=P.x<e.x?-1:1;
      if(e.charge<=0&&Math.abs(P.x-e.x)<230){e.charge=1;e.wind=26}
      if(e.wind>0){e.wind--;if(e.wind===0)e.vx=e.face*3.3}
      e.x+=e.vx*FIXED*60*0.55;
      e.vx*=.94;
      if(Math.abs(e.x-P.x)<15&&Math.abs(e.y-(P.y))<26){hurtPlayer(10,e.x);e.vx*=-.4;e.charge=0}
    }else if(e.kind==='turret'){
      e.atkT--;
      if(e.atkT<=0&&Math.abs(e.x-P.x)<300){
        e.atkT=ri(40,70);
        var ang=Math.atan2((P.y+10)-(e.y+10),(P.x)-(e.x));
        eBullets.push({x:e.x,y:e.y+8,vx:Math.cos(ang)*3.6,vy:Math.sin(ang)*3.6,dmg:8,life:120,color:'#ffc24d',size:3.4});
        sfx.shot();
      }
    }else if(e.kind==='shield'){
      e.face=P.x<e.x?-1:1;
      var dx2=P.x-e.x;
      if(Math.abs(dx2)>74)e.x+=sgn(dx2)*.5;
      e.atkT--;
      if(e.atkT<=0&&Math.abs(dx2)<240){
        e.atkT=ri(64,100);
        eBullets.push({x:e.x+e.face*10,y:e.y+10,vx:e.face*3.1,vy:0,dmg:8,life:120,color:'#9fb4ff',size:3.2});
        sfx.shot();
      }
      /* perisai pulih perlahan — begitu cukup tebal, dia menahan lagi (harus diterjang DASH) */
      if(e.shieldHp<22){
        e.shieldHp=Math.min(22,e.shieldHp+.06);
        if(e.shieldHp>11&&!e.shield){e.shield=1;popup(e.x,e.y-10,'PERISAI KEMBALI','#9fb4ff')}
      }
    }else if(e.kind==='drone'){
      e.bob+=.08;
      var tx=P.x-e.x;
      e.x=clamp(e.x+clamp(tx*.014,-1.9,1.9),16,LEV.w-16);
      /* drone menyelam ke ketinggian pemain supaya bisa ditembak sambil berdiri */
      if(e.diveT>0){e.diveT--;e.y+=(P.y+6-e.y)*.07;if(e.diveT<=0)e.cool=ri(150,280)}
      else{
        e.y=e.baseY+Math.sin(e.bob)*14;
        e.cool--;
        if(e.cool<=0)e.diveT=ri(60,90);
      }
      e.atkT--;
      if(e.atkT<=0&&Math.abs(e.x-P.x)<220){
        e.atkT=ri(50,84);
        var a2=Math.atan2((P.y+8)-e.y,(P.x)-e.x);
        eBullets.push({x:e.x,y:e.y+7,vx:Math.cos(a2)*3.5,vy:Math.sin(a2)*3.5,dmg:6,life:120,color:'#ff4dd2',size:3});
        sfx.shot();
      }
    }
    /* kontak badan */
    if(!e.dead&&Math.abs(e.x-P.x)<(e.w+P.w)/2&&P.y+P.h>e.y&&P.y<e.y+e.h){
      if(mech){if(mech.inv<=0){mech.hp-=8;mech.inv=34;sfx.hit();cam.shake=4}}
      else hurtPlayer(8,e.x);
    }
  }
  /* ── peluru musuh ── */
  for(i=eBullets.length-1;i>=0;i--){
    var eb=eBullets[i];
    eb.x+=eb.vx*FIXED*60*0.5;eb.y+=eb.vy*FIXED*60*0.5;eb.life--;
    var hitP=(mech?Math.abs(eb.x-(mech.x+mech.w/2))<mech.w/2&&eb.y>mech.y&&eb.y<mech.y+mech.h
                   :Math.abs(eb.x-P.x)<P.w/2+2&&eb.y>P.y&&eb.y<P.y+P.h);
    if(hitP){
      if(mech){if(mech.inv<=0){mech.hp-=eb.dmg*1.2;mech.inv=24;sfx.hit();cam.shake=4}}
      else hurtPlayer(eb.dmg,eb.x);
      eBullets.splice(i,1);continue;
    }
    if(eb.life<=0||eb.x<-20||eb.x>LEV.w+20||eb.y>VH+20||eb.y<-40)eBullets.splice(i,1);
  }
  /* ── drop ── */
  for(i=drops.length-1;i>=0;i--){
    var d=drops[i];d.t++;
    d.vy+=G*.5*FIXED;d.y+=d.vy*FIXED;
    var floor=GY-16;
    if(d.y>floor){d.y=floor;d.vy=0}
    if(Math.abs(d.x-P.x)<20&&Math.abs(d.y-(P.y+P.h/2))<26){grabDrop(d);drops.splice(i,1)}
    else if(d.t>620)drops.splice(i,1);
  }
  /* ── kotak ── */
  for(i=0;i<crates.length;i++){
    var cr=crates[i];
    if(cr.dead)continue;
    if(cr.hit>0)cr.hit--;
    if(Math.abs(cr.x+11-P.x)<18&&Math.abs(cr.y+11-(P.y+P.h/2))<26&&Math.abs(P.vx)>60){cr.hp-=8;cr.hit=6;if(cr.hp<=0)breakCrate(cr)}
  }
  /* ── ledakan & partikel ── */
  for(i=booms.length-1;i>=0;i--){var bx=booms[i];bx.life--;bx.r+=(bx.max-bx.r)*.3;if(bx.life<=0)booms.splice(i,1)}
  for(i=parts.length-1;i>=0;i--){var pt=parts[i];pt.life--;pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.08;if(pt.life<=0)parts.splice(i,1)}
  for(i=pops.length-1;i>=0;i--){var pp=pops[i];pp.life--;pp.y-=.5;if(pp.life<=0)pops.splice(i,1)}
  /* ── gelombang / bos ── */
  if(!missionDone){
    var alive=0,an;
    for(an=0;an<enemies.length;an++)if(!enemies[an].dead&&!enemies[an].bossKind)alive++;
    /* semburan musuh bertahap */
    if(pending.length&&alive<MAXALIVE){
      spawnCd--;
      if(spawnCd<=0){spawnOne(pending.shift());spawnCd=22}
    }
    if(waveState==='idle'){
      waveT--;
      if(waveT<=0){
        if(waveIdx<WAVES){queueWave();waveIdx++;waveState='fight';fightT=0;killStart=kills;banner('GELOMBANG '+waveIdx+'/'+WAVES,'BERSIHKAN AREA')}
        else if(!bossRef){mkBoss();waveState='boss';banner('⚠ BOS DATANG','BERSIAP')}
      }
    }else if(waveState==='fight'){
      fightT++;
      /* gelombang maju kalau kuota bunuh tercapai; kalau pemain lambat (>28 dtk),
         tetap maju supaya tidak pernah macet total */
      if(kills-killStart>=waveQuota||fightT>1680){
        pending.length=0;
        waveState='idle';waveT=110;
        banner('AREA BERSIH','LANJUT KE KANAN ➜');
      }
    }
  }
  /* ── kamera ── */
  var cx=(mech?mech.x:P.x)-VW*.40;
  cam.x+=(clamp(cx,0,Math.max(0,LEV.w-VW))-cam.x)*.12;
  if(cam.x<0)cam.x=0;
  if(P.x<cam.x+22)P.x=cam.x+22;
  if(tick%6===0)hud();
}
function hitGround(o,isMech){
  var r=solidRects(),i,hit=false;
  for(i=0;i<r.length;i++){
    var s=r[i];
    if(s.ref&&s.ref.dead)continue;
    var top=s.ref?s.ref.y:s.y;
    if(o.x+o.w/2>s.x&&o.x-o.w/2<s.x+s.w){
      var feet=o.y+o.h;
      if(o.vy>=0&&feet>top&&feet<top+26){
        o.y=top-o.h;hit=true;
      }
    }
  }
  return hit;
}
function stepBoss(e){
  var i;
  if(e.spawn>0){e.spawn--;return}
  e.phaseT++;
  e.face=P.x<e.x?-1:1;
  if(e.bossKind==='walker'){
    e.x=clamp(e.x+e.face*.42*(e.phase===0?1:1.5),50,LEV.w-50);
    if(Math.random()<.03)e.vy=-3.4;      e.vy+=G*.5*FIXED;e.y+=e.vy*FIXED;
    var gg=hitGround(e,true);if(gg)e.vy=0;
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=ri(52,86);
      for(i=-1;i<=1;i++)eBullets.push({x:e.x+e.face*26,y:e.y+22+i*9,vx:e.face*3.5,vy:i*.35,dmg:9,life:130,color:'#ff4dd2',size:3.6});
      sfx.shot();
    }
  }else if(e.bossKind==='sentinel'){
    e.bob=(e.bob||0)+.06;
    e.y=e.baseY+Math.sin(e.bob)*22;
    if(e.phaseT%140===0){e.phasing=1;e.phX=e.x}
    if(e.phasing){e.x+=(P.x-e.x)*.03;if(e.phaseT%140===60)e.phasing=0}
    else e.x=clamp(e.x+e.face*.3,50,LEV.w-50);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=ri(46,74);
      var a=Math.atan2(P.y-e.y,P.x-e.x);
      for(i=-1;i<=1;i++)eBullets.push({x:e.x,y:e.y+e.h/2,vx:Math.cos(a+i*.18)*3.8,vy:Math.sin(a+i*.18)*3.8,dmg:8,life:140,color:'#7bff8e',size:3.4});
      sfx.shot();
    }
  }else if(e.bossKind==='carrier'){
    e.bob=(e.bob||0)+.05;
    e.y=e.baseY-18+Math.sin(e.bob)*14;   /* diturunkan supaya bisa ditembak sambil berdiri */
    e.x=clamp(e.x+e.face*.5,50,LEV.w-50);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=90;
      eBullets.push({x:e.x,y:e.y+e.h,vx:0,vy:3.2,dmg:9,life:130,color:'#ffc24d',size:4});
      if(Math.random()<.7){var d1=mkEnemy('drone',e.x-20,e.y+20);d1.baseY=e.y+20}
      sfx.shot();
    }
  }else if(e.bossKind==='crawler'){
    e.x=clamp(e.x+e.face*.5,50,LEV.w-50);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=ri(60,92);
      for(i=0;i<5;i++)eBullets.push({x:e.x+e.face*30,y:e.y+8+i*5,vx:e.face*3.2,vy:(i-2)*.22,dmg:8,life:130,color:'#ff9a4d',size:3.8});
      e.vy=-3;
      sfx.shot();
    }
    e.vy+=G*.6*FIXED;e.y+=e.vy*FIXED;
    if(hitGround(e,true))e.vy=0;
  }else{
    /* core: berputar + hujan peluru */
    e.bob=(e.bob||0)+.04;
    e.x=clamp(e.x+(P.x-e.x)*.01,50,LEV.w-50);
    e.y=e.baseY+Math.sin(e.bob)*10;
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=ri(38,60);
      var n2=8,base=e.phaseT*.03;
      for(i=0;i<n2;i++){
        var ang2=base+i*(Math.PI*2/n2);
        eBullets.push({x:e.x+Math.cos(ang2)*26,y:e.y+36+Math.sin(ang2)*26,vx:Math.cos(ang2)*3.1,vy:Math.sin(ang2)*3.1,dmg:7,life:130,color:'#c9a4ff',size:3.2});
      }
      sfx.shot();
    }
  }
  if(e.hp<e.maxHp*.5)e.phase=1;
}
/* ══════════ GAMBAR ══════════ */
function skyGrad(){
  var p=LEV.pal,g=ctx.createLinearGradient(0,0,0,GY);
  g.addColorStop(0,p.sky[0]);g.addColorStop(.5,p.sky[1]);g.addColorStop(1,p.sky[2]);
  return g;
}
function drawBG(){
  var p=LEV.pal,i,x,off;
  ctx.fillStyle=skyGrad();ctx.fillRect(0,0,VW,VH);
  /* bintang / hujan neon */
  ctx.globalAlpha=.5;
  for(i=0;i<26;i++){
    x=((i*67+((cam.x*.12)|0))%(VW+40))-20;
    var y=(i*53)%(GY-70);
    ctx.fillStyle=i%3===0?'#ffffff':'#bcd0ff';
    ctx.fillRect(x,y,1,1);
  }
  ctx.globalAlpha=1;
  /* gedung jauh */
  off=(cam.x*.18)%160;
  for(i=-1;i<5;i++){
    var bx=i*160-off,bh=60+((i*37)%70);
    ctx.fillStyle=p.far;
    ctx.fillRect(bx,GY-40-bh,120,bh+40);
    if(p.neon&&i%2===0){
      ctx.fillStyle=p.neon[0];ctx.globalAlpha=.5;
      var wy;
      for(wy=0;wy<6;wy++)ctx.fillRect(bx+14,GY-30-bh+wy*13,7,3);
      ctx.globalAlpha=1;
    }
  }
  /* gedung dekat */
  off=(cam.x*.36)%200;
  for(i=-1;i<4;i++){
    var cx2=i*200-off,ch=110+((i*53)%80);
    ctx.fillStyle=p.mid;
    ctx.fillRect(cx2,GY-60-ch,150,ch+60);
    ctx.fillStyle=p.top;ctx.globalAlpha=.34;
    ctx.fillRect(cx2,GY-60-ch,150,3);
    ctx.globalAlpha=1;
    if(p.neon){
      ctx.globalAlpha=.6;ctx.fillStyle=p.neon[(i+1)%p.neon.length];
      var wy2;
      for(wy2=0;wy2<10;wy2++)if((i+wy2)%3===0)ctx.fillRect(cx2+16+((wy2%3)*40),GY-50-ch+wy2*11,10,4);
      ctx.globalAlpha=1;
    }
  }
  /* hujan */
  if(p.rain){
    ctx.strokeStyle='rgba(180,220,255,.34)';ctx.lineWidth=1;
    for(i=0;i<34;i++){
      x=((i*41+((tick*7+i*13)%VW))%(VW+30))-15;
      var y2=((i*61+tick*9)%(GY+40))-20;
      ctx.beginPath();ctx.moveTo(x,y2);ctx.lineTo(x-2,y2+9);ctx.stroke();
    }
  }
}
function drawGround(){
  var p=LEV.pal;ctx.fillStyle=p.ground;ctx.fillRect(0,GY,VW,VH-GY);
  ctx.fillStyle=p.top;ctx.globalAlpha=.85;ctx.fillRect(0,GY,VW,3);ctx.globalAlpha=1;
  var i,x;
  ctx.strokeStyle='rgba(255,255,255,.09)';
  for(i=0;i<14;i++){
    x=((i*80-((cam.x*.6)%80))%(VW+80))-40;
    ctx.beginPath();ctx.moveTo(x,GY+8);ctx.lineTo(x+22,GY+8);ctx.stroke();
  }
}
function drawPlats(){
  var p=LEV.pal,i;
  for(i=0;i<plats.length;i++){
    var s=plats[i];
    if(s.x>cam.x+VW+40||s.x+s.w<cam.x-40)continue;
    ctx.fillStyle='#0d1030';ctx.fillRect(s.x-cam.x,s.y,s.w,s.h+6);
    ctx.fillStyle=p.top;ctx.globalAlpha=.9;ctx.fillRect(s.x-cam.x,s.y,s.w,3);ctx.globalAlpha=1;
  }
}
function drawPlayer(){
  var x=(mech?mech.x:P.x)-cam.x,y=mech?mech.y:P.y,i;
  if(P.dead){
    ctx.globalAlpha=.6;ctx.fillStyle='#ff5b6e';
    ctx.fillRect(x-8,y+14,16,4);
    ctx.globalAlpha=1;return;
  }
  if(mech){
    var mx=x-mech.w/2,armX=mech.face>0?(x+4):(x-mech.w/2-8);
    if(mech.inv>0&&(tick>>2)%2===0)ctx.globalAlpha=.55;
    ctx.fillStyle='#1b2a5e';
    rr(ctx,mx,y,mech.w,mech.h,7);ctx.fill();
    ctx.strokeStyle='#8ff4ff';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#8ff4ff';ctx.fillRect(x-7,y-6,14,7);
    ctx.fillStyle='#c9a4ff';ctx.fillRect(x-4,y+6,8,6);
    ctx.fillStyle='#ffc24d';ctx.fillRect(armX,y+16,8,7);
    ctx.fillStyle='#2a1a52';rr(ctx,mx+4,y+mech.h-13,mech.w-8,9,3);ctx.fill();
    ctx.fillStyle='#7bff8e';ctx.fillRect(mx+5,y+8,4,4);ctx.fillRect(mx+mech.w-9,y+8,4,4);
    if(mech.fireT>3){ctx.fillStyle='#fff2a8';ctx.fillRect(armX+(mech.face>0?8:-12),y+16,12,7)}
    ctx.globalAlpha=1;
    return;
  }
  if(P.inv>0&&P.dashT<=0&&(tick>>2)%2===0)return;
  var f=P.face;
  if(P.pierceT>0){
    ctx.globalAlpha=.5;ctx.strokeStyle='#8ff4ff';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.arc(x,y+13,19,0,6.283);ctx.stroke();
    ctx.globalAlpha=1;
  }
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(f,1);
  ctx.fillStyle='#141a44';
  ctx.fillRect(-5,10,10,P.crouch?6:16);
  ctx.fillStyle='#8ff4ff';
  ctx.fillRect(-5,4,10,P.crouch?7:9);
  ctx.fillStyle='#2a3477';ctx.fillRect(-6,-1,12,6);
  ctx.fillStyle='#c9a4ff';ctx.fillRect(1,1,8,3);
  var legT=Math.sin(P.anim)*3;
  ctx.fillStyle='#0b0f24';
  ctx.fillRect(-5,24+(P.crouch?0:0),4,4);
  ctx.fillRect(1,24,4,4);
  if(P.onGround&&Math.abs(P.vx)>24){
    ctx.fillRect(-5+legT,25,4,3);ctx.fillRect(1-legT,25,4,3);
  }
  if(P.fireT>curW().cd-4){
    ctx.fillStyle='#fff2a8';ctx.fillRect(9,3,7,4);
  }
  ctx.restore();
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
      ctx.fillStyle='#1b0f3a';
      rr(ctx,x-e.w/2,e.y,e.w,e.h,8);ctx.fill();
      ctx.strokeStyle='#c33ce0';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#ff9cf0';
      ctx.fillRect(x-10,e.y+12,20,7);
      ctx.fillStyle='#ffc24d';
      var k;for(k=0;k<3;k++)ctx.fillRect(x-e.w/2+6+k*18,e.y+e.h-10,10,6);
    }else if(e.kind==='drone'){
      ctx.fillStyle='#2a1030';rr(ctx,x-e.w/2,e.y,e.w,e.h,5);ctx.fill();
      ctx.strokeStyle='#ff4dd2';ctx.lineWidth=1.6;ctx.stroke();
      ctx.fillStyle='#ff4dd2';ctx.fillRect(x-3,e.y+4,6,5);
      ctx.fillStyle='rgba(255,77,210,.35)';ctx.fillRect(x-11,e.y-3,22,2);
    }else if(e.kind==='turret'){
      ctx.fillStyle='#20183f';rr(ctx,x-e.w/2,e.y,e.w,e.h,5);ctx.fill();
      ctx.fillStyle='#ffc24d';ctx.fillRect(x-6,e.y+6,12,9);
      ctx.strokeStyle='#ffc24d';ctx.lineWidth=2;
      ctx.beginPath();var a=Math.atan2((P.y)-(e.y),P.x-e.x);
      ctx.moveTo(x,e.y+10);ctx.lineTo(x+Math.cos(a)*14,e.y+10+Math.sin(a)*14);ctx.stroke();
    }else if(e.kind==='shield'){
      ctx.fillStyle='#141a44';ctx.fillRect(x-7,e.y,14,e.h);
      ctx.fillStyle='#9fb4ff';ctx.fillRect(x-7,e.y+3,14,9);
      ctx.fillStyle='#7bff8e';ctx.fillRect(x+e.face*8,e.y+2,3,e.h-6);
      ctx.globalAlpha=.4*Math.max(.2,e.shieldHp/22);
      ctx.fillStyle='#8ff4ff';ctx.fillRect(x+e.face*10-2,e.y-2,5,e.h+4);
      ctx.globalAlpha=1;
    }else if(e.kind==='charger'){
      ctx.fillStyle='#3a0f22';ctx.fillRect(x-7,e.y,14,e.h);
      ctx.fillStyle='#ff5b6e';ctx.fillRect(x-7,e.y+2,14,7);
      ctx.fillStyle='#ffd98a';ctx.fillRect(x+(e.face>0?5:-9),e.y+4,4,3);
    }else{
      ctx.fillStyle='#1d2450';ctx.fillRect(x-6,e.y,12,e.h);
      ctx.fillStyle='#4de2ff';ctx.fillRect(x-6,e.y+2,12,7);
      ctx.fillStyle='#0b0f24';ctx.fillRect(x-6,e.y+e.h-2,5,3);ctx.fillRect(x+1,e.y+e.h-2,5,3);
      if(e.atkT<14){ctx.fillStyle='#ff5b6e';ctx.fillRect(x+e.face*8,e.y+7,6,3)}
    }
    ctx.globalAlpha=1;
    if(e.hp>0&&!e.bossKind&&e.hp<(e.kind==='turret'?40:26)){
      var maxHp=e.kind==='turret'?40*(1+diff*.25):(e.kind==='shield'?46*(1+diff*.25):26*(1+diff*.25));
      ctx.fillStyle='#000a';ctx.fillRect(x-10,e.y-7,20,3);
      ctx.fillStyle='#ff5b6e';ctx.fillRect(x-10,e.y-7,20*clamp(e.hp/maxHp,0,1),3);
    }
  }
}
function drawShots(){
  var i;
  for(i=0;i<bullets.length;i++){
    var b=bullets[i];
    ctx.globalAlpha=.9;
    ctx.fillStyle=b.color;
    rr(ctx,b.x-cam.x-b.size/2,b.y-b.size/2,b.size,b.size,b.size/2);ctx.fill();
    ctx.globalAlpha=.24;
    ctx.fillRect(b.x-cam.x-b.vx*.7,b.y-1,b.vx*1.1,2);
    ctx.globalAlpha=1;
  }
  for(i=0;i<eBullets.length;i++){
    var eb=eBullets[i];
    ctx.fillStyle=eb.color;
    rr(ctx,eb.x-cam.x-eb.size/2,eb.y-eb.size/2,eb.size,eb.size,eb.size/2);ctx.fill();
    ctx.globalAlpha=.3;ctx.fillRect(eb.x-cam.x-eb.size/2-1,eb.y-1,eb.size+2,2);ctx.globalAlpha=1;
  }
  for(i=0;i<nades.length;i++){
    var n=nades[i];
    ctx.fillStyle='#ffc24d';ctx.beginPath();ctx.arc(n.x-cam.x,n.y,4,0,6.283);ctx.fill();
    ctx.strokeStyle='#8ff4ff';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(n.x-cam.x,n.y,7+Math.sin(tick*.3)*1.5,0,6.283);ctx.stroke();
  }
}
function drawFX(){
  var i;
  for(i=0;i<booms.length;i++){
    var b=booms[i],t=b.life/b.lifeMax;
    ctx.globalAlpha=t*.85;
    var g=ctx.createRadialGradient(b.x-cam.x,b.y,2,b.x-cam.x,b.y,b.r);
    g.addColorStop(0,'#ffffff');g.addColorStop(.4,'#ffd98a');g.addColorStop(1,'rgba(255,90,60,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x-cam.x,b.y,b.r,0,6.283);ctx.fill();
    ctx.globalAlpha=1;
  }
  for(i=0;i<parts.length;i++){
    var p=parts[i];
    ctx.globalAlpha=clamp(p.life/p.max,0,1);
    ctx.fillStyle=p.c;
    ctx.fillRect(p.x-cam.x,p.y,p.r,p.r);
    ctx.globalAlpha=1;
  }
  for(i=0;i<pops.length;i++){
    var pp=pops[i];
    ctx.globalAlpha=clamp(pp.life/pp.lifeMax,0,1);
    ctx.font='900 8px system-ui';ctx.fillStyle=pp.c;ctx.textAlign='center';
    ctx.fillText(pp.txt,pp.x-cam.x,pp.y);
    ctx.textAlign='left';ctx.globalAlpha=1;
  }
}
function drawPickups(){
  var i;
  for(i=0;i<drops.length;i++){
    var d=drops[i],x=d.x-cam.x;
    ctx.save();
    ctx.translate(x,d.y);ctx.rotate(Math.sin(tick*.08+i)*.2);
    ctx.fillStyle=d.kind==='weapon'?'#8ff4ff':d.kind==='hp'?'#7bff8e':'#ffc24d';
    rr(ctx,-7,-7,14,14,4);ctx.fill();
    ctx.fillStyle='#05060f';ctx.font='900 8px system-ui';ctx.textAlign='center';
    ctx.fillText(d.kind==='weapon'?'W':d.kind==='hp'?'+':'E',0,3);
    ctx.textAlign='left';ctx.restore();
  }
  for(i=0;i<crates.length;i++){
    var c=crates[i];
    if(c.dead)continue;
    var cx3=c.x-cam.x;
    if(cx3<-30||cx3>VW+30)continue;
    ctx.fillStyle=c.hit>0?'#ffd98a':'#241a4e';
    rr(ctx,cx3,c.y,c.w,c.h,3);ctx.fill();
    ctx.strokeStyle=c.kind==='weapon'?'#8ff4ff':'#ffc24d';ctx.lineWidth=1.6;ctx.stroke();
    ctx.fillStyle=c.kind==='weapon'?'#8ff4ff':'#ffc24d';
    ctx.fillRect(cx3+6,c.y+9,10,3);
  }
  for(i=0;i<pods.length;i++){
    var pd=pods[i];
    if(pd.used)continue;
    var px2=pd.x-cam.x;
    if(px2<-40||px2>VW+40)continue;
    ctx.globalAlpha=.25+Math.sin(tick*.1)*.12;
    ctx.fillStyle='#8ff4ff';rr(ctx,px2-4,pd.y-4,pd.w+8,pd.h+8,6);ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle='#1b2350';rr(ctx,px2,pd.y,pd.w,pd.h,4);ctx.fill();
    ctx.strokeStyle='#ffc24d';ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle='#ffc24d';ctx.font='900 7px system-ui';ctx.textAlign='center';
    ctx.fillText('MECH',px2+15,pd.y+18);ctx.textAlign='left';
  }
}
function draw(){
  ctx.save();
  var sh=cam.shake;
  ctx.translate(sh?rnd(-sh,sh):0,sh?rnd(-sh,sh):0);
  drawBG();
  drawGround();
  drawPlats();
  drawPickups();
  drawEnemies();
  drawPlayer();
  drawShots();
  drawFX();
  ctx.restore();
  /* vignette */
  ctx.globalAlpha=.9;
  var g=ctx.createRadialGradient(VW/2,VH*.46,VH*.3,VW/2,VH/2,VW*.76);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.68,'rgba(0,0,0,.2)');g.addColorStop(1,'rgba(0,0,0,.6)');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  ctx.globalAlpha=1;
  if(mech){
    ctx.fillStyle='rgba(77,226,255,.1)';ctx.fillRect(0,0,VW,3);ctx.fillRect(0,VH-4,VW,3);
  }
}
/* ══════════ HUD / OVERLAY ══════════ */
var bossBar=$('bossBar');
function hud(){
  var hf=$('hpFill');
  var hpNow=mech?Math.round(mech.hp):Math.round(P.hp),mx=mech?mech.maxHp:P.maxHp;
  hf.style.width=clamp(hpNow/mx*100,0,100)+'%';
  var bar=$('hpBar');
  bar.className='hpBar'+(hpNow/mx<.3?' crit':(hpNow/mx<.6?' low':''));
  $('hpTxt').textContent=hpNow+ (mech?' ⚙':'');
  $('score').textContent=score;
  $('lives').textContent=Math.max(0,lives);
  $('wpn').textContent=mech?'VIPER-9':curW().name;
  $('ammo').textContent=mech?'∞':(P.weapon==='pulse'?'∞':(P.ammo[P.weapon]||0));
  $('nade').textContent=P.bombs;
  var d=$('dashTxt');
  if(P.dashCd>0){d.textContent=Math.round(P.dashCd/60*10)/10+'s';d.className='wait'}
  else{d.textContent='SIAP';d.className='ready'}
  $('progFill').style.width=clamp(((cam.x+ (mech?mech.x:P.x))/Math.max(1,LEV.w))*100,0,100)+'%';
  if(bossRef)$('bossFill').style.width=clamp(bossRef.hp/bossRef.maxHp*100,0,100)+'%';
}
function banner(main,sub){
  bannerTxt=main;bannerSub=sub||'';
  bannerEl=$('banner');
  var b=bannerEl;if(!b)return;
  b.innerHTML=main+(sub?'<small>'+sub+'</small>':'');
  b.classList.add('show');bannerT=80;
}
function ovShow(icon,title,text,stats,btns){
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var s='',i;
  if(stats)for(i=0;i<stats.length;i++)s+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';
  $('ovStats').innerHTML=s;
  var h='<div class="row3">',k=0;
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
  var i,levelBtns=[];
  for(i=0;i<MISSIONS.length;i++){
    var ok=i===0||cleared['m'+(i-1)];
    var st=cleared['m'+i+'_s']|0,s='';
    var k;for(k=0;k<3;k++)s+=k<st?'★':'☆';
    levelBtns.push({act:'lv'+(ok?i:'x'),label:(ok?'':'🔒 ')+'S'+(i+1)+' '+s,cls:ok?'':'cool'});
  }
  ovShow('🌃','NEON STRIKE','Kota Neo-Kirana dikuasai mesin. 5 sektor, 5 bos. Pilih sektor:<br><b>Tahan TEMBAK</b> untuk beruntun • <b>DASH</b> bikin kebal sekejap • masuk <b>MECH</b> di tengah jalan.',
    [['SKOR',score],['SEKTOR',MISSIONS.length],['SENJATA',4]],
    levelBtns.concat([{act:'start',label:'▶ MULAI SEKTOR '+(mission+1),cls:'go'},{act:'help',label:'❔ CARA MAIN'}]));
}
function helpScreen(){
  ovShow('📖','CARA MAIN',
    '<b>TOMBOL ARAH</b> (kiri bawah) — <b>◀ ▶</b> jalan, <b>▼</b> jongkok (tombol bisa ditekan bersamaan).<br>'+
    '<b>⤒ LOMPAT</b> — bisa lompat dua kali di udara.<br>'+
    '<b>↯ DASH</b> — menerjang cepat sambil <b>kebal</b> sekejap. Sesaat sesudah dash, tembakanmu <b>menembus perisai</b> musuh (lingkaran biru di sekitarmu = sedang aktif).<br>'+
    '<b>💥 EMP</b> — gelombang kejut, kena semua musuh di sekitarmya.<br>'+
    '<b>TEMBAK</b> — tahan untuk beruntun.<br><br>'+
    '<b>SENJATA</b>: PULSE (∞) · SCATTER (sebar) · RAIL (tembus) · FLAME (dekat, cepat). Ambil drop <b>W</b> dari musuh/kotak.<br>'+
    'Drop <b>+</b> memulihkan badan, <b>E</b> menambah EMP.<br><br>'+
    'Di tengah tiap sektor ada pod <b>MECH VIPER-9</b> — masuk untuk armor tebal & meriam ganda; kalau hancur, kamu terlempar keluar.<br>'+
    'Bos menunggu di ujung sektor setelah 5 gelombang.',
    null,[{act:'back',label:'◀ KEMBALI'}]);
}
function deadScreen(){
  ovShow('💀','MISI GAGAL','Semua nyawa habis di '+LEV.name+'.',
    [['SKOR',score],['BUNUH',kills],['SEKTOR',mission+1]],
    [{act:'again',label:'↻ COBA LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';
  ovShow('⏸','JEDA','Sektor '+(mission+1)+' — '+LEV.name+' ditunda.',
    [['SKOR',score],['BUNUH',kills],['HP',mech?Math.round(mech.hp):Math.round(P.hp)]],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'restart',label:'↻ ULANG',cls:''},{act:'menu',label:'⏹ MENU'}]);
}
function resumeState(){if(state!=='pause')return;state='play';ovHide()}
function start(){
  score=score||0;
  lives=3;kills=0;shots=0;hits=0;
  buildLevel(mission);spawnCrates();
  state='play';
  ovHide();
  banner('SEKTOR '+(mission+1)+' — '+LEV.name,LEV.sub);
  last=performance.now();acc=0;
  hud();
}
/* ══════════ INPUT ══════════ */
function bindHold(el,on,off,opt){
  if(!el)return;
  var pid=null,rep=0,every=(opt&&opt.every)||70,offFn=(typeof off==='function')?off:function(){};
  function tick(){
    if(pid===null)return;
    on();
    if(pid===null){rep=0;return}
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
  padHold('bDown',function(){input.down=true},function(){input.down=false});
  bindHold($('bFire'),function(){input.fire=true;fire()},function(){input.fire=false},{repeat:true,every:70});
  bindHold($('bJump'),function(){input.jump=true;jumpBuf=8;setTimeout(function(){input.jump=false},90)});
  bindHold($('bDash'),function(){doDash()},{},{});
  bindHold($('bNade'),function(){throwNade()},{},{});
  var ov=$('ov');
  ov.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start'||a==='restart'||a==='again'){if(a==='restart'){lives=3;kills=0}start()}
    else if(a==='next'){mission=Math.min(MISSIONS.length-1,mission+1);score=score||0;start()}
    else if(a==='help')helpScreen();
    else if(a==='menu')menu();
    else if(a==='back')menu();
    else if(a==='resume')resumeState();
    else if(a.indexOf('lv')===0){var n=parseInt(a.slice(2),10);if(!isNaN(n)){mission=n;start()}}
  });
  var mb=$('muteB');
  mb.addEventListener('click',function(){
    muted=!muted;
    if(master)master.gain.value=muted?0:0.5;
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
    else if(k===' '||k==='arrowup'||k==='w'){if(!e.repeat){input.jump=true;jumpBuf=8}if(state==='play')e.preventDefault()}
    else if(k==='j'||k==='z'||k==='f'){input.fire=true;fire()}
    else if(k==='k'||k==='x'||k==='g'){if(!e.repeat)doDash()}
    else if(k==='l'||k==='c'){if(!e.repeat)throwNade()}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause')resumeState()}
    else if(k==='enter'){if(state==='menu'||state==='dead'||state==='win')start()}
    else if(k==='m'){if(mb)mb.click()}
  },{passive:false});
  D.addEventListener('keyup',function(e){
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){input.ax=0;input.left=false}
    else if(k==='arrowright'||k==='d'){input.ax=0;input.right=false}
    else if(k==='arrowdown'||k==='s')input.down=false;
    else if(k===' '||k==='arrowup'||k==='w')input.jump=false;
    else if(k==='j'||k==='z'||k==='f')input.fire=false;
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
fit();bannerEl=$('banner');buildLevel(0);spawnCrates();bindInput();hud();menu();
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',function(){fit()});
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);

if(typeof window!=='undefined'){
  window.__NS={
    get s(){return{state:state,tick:tick,hp:Math.round(P.hp),lives:lives,score:score,kills:kills,shots:shots,hits:hits,
      x:Math.round(P.x*10)/10,y:Math.round(P.y*10)/10,vx:Math.round(P.vx*100)/100,vy:Math.round(P.vy*100)/100,
      onGround:P.onGround,face:P.face,weapon:P.weapon,ammo:P.ammo[P.weapon]||0,bombs:P.bombs,dashCd:P.dashCd,inv:P.inv,dead:P.dead,
      enemies:enemies.length,alive:(function(){var n=0,i;for(i=0;i<enemies.length;i++)if(!enemies[i].dead)n++;return n})(),bullets:bullets.length,eBullets:eBullets.length,
      crates:(function(){var n=0,i;for(i=0;i<crates.length;i++)if(!crates[i].dead)n++;return n})(),drops:drops.length,mech:mech?{hp:Math.round(mech.hp),x:Math.round(mech.x)}:null,
      wave:waveIdx,waveState:waveState,boss:bossRef?{hp:bossRef.hp,maxHp:bossRef.maxHp,kind:bossRef.bossKind,name:bossRef.name}:null,
      mission:mission,missionName:LEV.name,levelW:LEV.w,cam:Math.round(cam.x),cleared:cleared,state2:state}},
    player:P,input:input,
    get enemies(){return enemies},get bullets(){return bullets},get eBullets(){return eBullets},
    get crates(){return crates},get pods(){return pods},get plats(){return plats},get drops(){return drops},
    get mech(){return mech},get pending(){return pending},
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:start,fire:fire,jump:jump,dash:doDash,nade:throwNade,pause:pause,resume:resumeState,
    dir:function(l,r){input.left=!!l;input.right=!!r;dirSync()},get axis(){return input.ax},
    get dirs(){return{l:!!input.left,r:!!input.right,ax:input.ax,locked:dirHeldN>0}},
    setMission:function(m){mission=clamp(m,0,MISSIONS.length-1)},
    spawnWave:function(){spawnWave();waveIdx++},
    boss:function(){mkBoss()},
    killAll:function(){for(var i=0;i<enemies.length;i++)enemies[i].hp=0;enemies.length=0},
    hunt:function(){var e=null,i;for(i=0;i<enemies.length;i++)if(!enemies[i].dead){e=enemies[i];break}return e},
    hurt:function(n){hurtPlayer(n)},forceFire:function(){P.fireT=0;fire()},
    setWeapon:function(w){if(WPN[w]){P.weapon=w;P.ammo[w]=WPN[w].ammo;hud()}},
    teleport:function(x){P.x=x;cam.x=clamp(x-VW*.4,0,Math.max(0,LEV.w-VW))},
    chest:function(){for(var i=0;i<8;i++)drops.push({x:P.x+20+i*9,y:P.y-10,vy:0,kind:i%3===0?'weapon':(i%3===1?'hp':'nade'),t:0})},
    entities:{get enemies(){return enemies},get bullets(){return bullets},get crates(){return crates}}
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
/* lapisan kilap aditif: tidak mengubah tata letak, hanya rasa sentuh & ketajaman */
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.key,.pad,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
button:active,[role="button"]:active,.btn:active,.key:active,.pad:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(77,226,255,.32)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(77,226,255,.35);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
/* ── material: bevel + bayangan kontak supaya tombol terasa benda nyata ── */
.mbtn,.abtn,.sbtn,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.22),inset 0 -3px 5px rgba(0,0,0,.42),0 4px 0 rgba(0,0,0,.44),0 8px 16px rgba(0,0,0,.38)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.08),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 34px rgba(0,0,0,.52)!important}
.stage canvas{filter:saturate(1.09) contrast(1.05)}
.hud,.head{border-radius:12px!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🌃', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Neon Strike 🌃',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-neonstrike-2026',
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

handler.help = ['neonstrike', 'neon', 'nstrike', 'neons']
handler.tags = ['game']
handler.command = /^(neonstrike|neon|nstrike|neons)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Neon Strike Nano Ai - run and gun cyberpunk, 5 sektor, 4 senjata, mech VIPER-9, 5 bos'

export default handler
