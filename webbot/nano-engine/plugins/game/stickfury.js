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

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#08080c">
<title>Nano Ai Stick Fury</title>
<style>
:root{--bg:#07070b;--panel:#12121a;--line:#2d2d3d;--text:#f0f0f6;--dim:#8f8fa6;--blood:#e0342e;--ice:#57c8ff;--gold:#ffd166;--green:#4ad07a}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(760px 420px at 50% -10%,#23233a 0%,#0b0b14 55%,#05050a 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#20202e,#0d0d15);border:1px solid #34344a;border-radius:20px;padding:10px;box-shadow:0 30px 80px #000c,inset 0 1px 0 #ffffff10;touch-action:manipulation}
.head{display:flex;align-items:center;justify-content:space-between;gap:9px;background:#0c0c14;border:1px solid #2b2b3c;border-radius:13px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:10px;background:linear-gradient(150deg,#3a3a52,#1a1a26);border:1px solid #4a4a66;color:var(--gold);font:900 18px system-ui;box-shadow:0 4px 0 #101018,inset 0 1px 0 #ffffff1a}
.brandText{min-width:0}
.title{font-size:16px;font-weight:900;letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}
.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.headBtns{display:flex;gap:6px;flex:none}
.mb{width:38px;height:38px;flex:none;border:1px solid #34344a;border-radius:10px;background:linear-gradient(180deg,#26263a,#141420);color:#eaeaf6;font-size:16px;box-shadow:0 3px 0 #0c0c14}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0a0a12;border:1px solid #26263a;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hpWrap{display:flex;align-items:center;gap:5px;flex:1 1 130px;min-width:118px}
.hpWrap b{font-size:6.6px;letter-spacing:.14em;color:var(--dim)}
.hpBar{position:relative;flex:1;height:11px;border-radius:6px;background:#2a0f12;border:1px solid #4d1c20;overflow:hidden;box-shadow:inset 0 2px 4px #000a}
.hpBar i{position:absolute;inset:0 auto 0 0;width:100%;border-radius:6px 0 0 6px;background:linear-gradient(180deg,#ff7a6a,#d02a22 60%,#7c140f);transition:width .16s ease}
.rageWrap{display:flex;align-items:center;gap:5px;flex:1 1 108px;min-width:96px}
.rageWrap b{font-size:6.6px;letter-spacing:.14em;color:var(--dim)}
.rageBar{position:relative;flex:1;height:9px;border-radius:5px;background:#201a06;border:1px solid #4a3d10;overflow:hidden}
.rageBar i{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(180deg,#ffe89a,#ffb020 60%,#c07000);transition:width .12s ease}
.rageBar.full i{animation:rp .5s infinite}
@keyframes rp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.6)}}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#101020;border:1px solid #2b2b40;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:var(--dim)}
.hs span{font:900 10px system-ui;color:var(--gold)}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #2c2c40;border-radius:14px;overflow:hidden;background:#05050a;box-shadow:inset 0 10px 26px #000c,0 8px 22px #0008}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.banner{position:absolute;left:0;right:0;top:32%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease;font:950 19px system-ui;letter-spacing:.1em;color:#fff;text-shadow:0 3px 0 #00000090,0 0 20px #ff4a3a80}
.banner.show{opacity:1}
.banner small{display:block;margin-top:5px;font:800 8px system-ui;letter-spacing:.2em;color:#ffb4a8}
.waveBar{position:absolute;left:8px;right:8px;top:7px;padding:5px 7px;border-radius:9px;background:#160808e8;border:1px solid #6b2b22;opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .25s ease;pointer-events:none}
.waveBar.show{opacity:1;transform:translateY(0)}
.waveBar b{display:block;font:900 6.8px system-ui;letter-spacing:.2em;color:#ffb19a;margin-bottom:3px}
.waveBar .bb{height:7px;border-radius:4px;background:#2a100c;border:1px solid #6b2b1a;overflow:hidden}
.waveBar .bb i{display:block;height:100%;width:100%;background:linear-gradient(180deg,#ff9a6a,#d02a22 60%,#7c140f);transition:width .18s ease}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#04040acc;backdrop-filter:blur(9px);padding:12px;border-radius:20px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,364px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #3c3c56;border-radius:16px;background:linear-gradient(180deg,#1e1e2c,#0e0e16);box-shadow:0 20px 46px #0009,inset 0 1px 0 #ffffff14;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-size:20px;font-weight:950;letter-spacing:.4px}
.ovText{margin-top:6px;color:var(--dim);font-size:9px;line-height:1.5}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #2f2f44;border-radius:9px;background:#0b0b14}
.ovStats b{display:block;font-size:12px;color:var(--gold)}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sbtn{min-height:38px;border:1px solid #3c3c56;border-radius:10px;background:linear-gradient(180deg,#28283c,#141420);color:#eef;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #0a0a12,inset 0 1px 0 #ffffff14;touch-action:manipulation}
.sbtn.sel{border-color:#ffb020;background:linear-gradient(180deg,#a67c1c,#5c4408);color:#1c1503}
.sbtn.go{border-color:#63d68c;background:linear-gradient(180deg,#3fbf6a,#1c6b38);color:#06210f;box-shadow:0 4px 0 #0d2a17,inset 0 1px 0 #ffffff3d}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #0a0a12}
.pad{margin-top:9px;display:grid;grid-template-columns:1fr 1.25fr;gap:9px;align-items:end}
.movePad{display:grid;grid-template-columns:1fr 1fr;gap:6px;touch-action:none}
.movePad .mbtn{min-height:78px;font-size:23px}
/* area tombol arah: gesture eksklusif — jari di sini tidak boleh menggulir halaman */
.nano-analog{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;overscroll-behavior:contain}
body .pad:active{transform:none!important}
.mbtn{min-height:58px;border:1px solid #3c3c56;border-radius:13px;background:linear-gradient(180deg,#2b2b40,#16161f);color:#f0f0f6;font:900 19px system-ui;box-shadow:0 5px 0 #0a0a12,inset 0 1px 0 #ffffff1c;touch-action:none;user-select:none;display:grid;place-items:center}
.mbtn small{display:block;font-size:6px;letter-spacing:.14em;color:#9c9cb5;margin-top:1px}
.mbtn.active{transform:translateY(3px);box-shadow:0 2px 0 #0a0a12;filter:brightness(1.2)}
.actPad{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.abtn{min-height:44px;border:1px solid #3c3c56;border-radius:12px;background:linear-gradient(180deg,#2b2b40,#16161f);color:#f0f0f6;font:900 8px system-ui;letter-spacing:.06em;box-shadow:0 5px 0 #0a0a12,inset 0 1px 0 #ffffff1c;touch-action:none;user-select:none}
.abtn.punch{grid-column:1/3;min-height:66px;border-radius:50%;border:2px solid #ff9a8a;background:radial-gradient(circle at 35% 28%,#ff9d8a,#d02a22 55%,#6b0f0a);color:#fff;font:950 12px system-ui;letter-spacing:.1em;box-shadow:0 7px 0 #4a0a06,0 0 24px #ff4a3a33,inset 0 2px 0 #ffffff55}
.abtn.kick{background:linear-gradient(180deg,#3a4a6a,#1a2238);border-color:#4f6a9c}
.abtn.jump{background:linear-gradient(180deg,#2f5a44,#132a1f);border-color:#3f7a5c}
.abtn.special{grid-column:1/3;min-height:50px;background:linear-gradient(180deg,#8a6a18,#3a2c06);border-color:#d8a92c;color:#ffe9a8}
.abtn.active{transform:translateY(4px);box-shadow:0 2px 0 #0a0a12;filter:brightness(1.2)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#6d6d85;font-size:6.4px}
.foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot kbd{padding:2px 4px;border:1px solid #2f2f44;border-radius:4px;background:#0b0b14;color:#9c9cb5;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px;border-radius:17px}.title{font-size:14px}.logo{width:35px;height:35px;font-size:15px}.mbtn{min-height:52px}.abtn.punch{min-height:58px;font-size:10.5px}.ovTitle{font-size:17px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">拳</div>
        <div class="brandText"><div class="title">STICK FURY</div><div class="sub">GANG ALLEY • NANO AI ARCADE</div></div>
      </div>
      <div class="headBtns">
        <button class="mb" id="pauseB" type="button" aria-label="Jeda">⏸</button>
        <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
      </div>
    </div>

    <div class="hud">
      <div class="hpWrap"><b>DARAH</b><div class="hpBar" id="hpBar"><i id="hpFill"></i></div></div>
      <div class="rageWrap"><b>AMARAH</b><div class="rageBar" id="rageBar"><i id="rageFill"></i></div></div>
      <div class="hs"><b>SKOR</b><span id="score">0</span></div>
      <div class="hs"><b>NYAWA</b><span id="lives">3</span></div>
      <div class="hs"><b>GEL</b><span id="wave">1</span></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="waveBar" id="waveBar"><b id="waveName">⚠ BOS</b><div class="bb"><i id="waveFill"></i></div></div>
      <div class="banner" id="banner"></div>
    </div>

    <div class="pad">
      <div class="movePad nano-analog" id="movePad">
        <button class="mbtn left" id="bLeft" type="button">◀<small>KIRI</small></button>
        <button class="mbtn right" id="bRight" type="button">▶<small>KANAN</small></button>
      </div>
      <div class="actPad">
        <button class="abtn kick" id="bKick" type="button">TENDANG</button>
        <button class="abtn jump" id="bJump" type="button">⤒ LOMPAT</button>
        <button class="abtn special" id="bSpecial" type="button">💥 FATAL</button>
        <button class="abtn punch" id="bPunch" type="button">PUKUL</button>
      </div>
    </div>

    <div class="foot"><span>Pukul 3× beruntun untuk uppercut • FATAL saat AMARAH penuh</span><span><kbd>←→</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>SPACE</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🥊</div>
        <h2 class="ovTitle" id="ovTitle">STICK FURY</h2>
        <p class="ovText" id="ovText">Gang Alley. Bersihkan 6 gelombang preman jalanan.</p>
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
function ri(a,b){return Math.floor(a+Math.random()*(b-a+1))}
function sgn(v){return v<0?-1:(v>0?1:0)}
function lerp(a,b,t){return a+(b-a)*t}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

var cv=$('cv'),ctx=cv.getContext('2d');
var VW=480,VH=296,GY=252;
var PX=1,LOW=false;
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
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.55;master.connect(AC.destination)}return master}
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
function noise(dur,vol,f0,f1,delay){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var t=a.currentTime+(delay||0),s=a.createBufferSource();s.buffer=buf;
    var fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(Math.max(60,f0||1400),t);
    if(f1)fl.frequency.exponentialRampToValueAtTime(Math.max(60,f1),t+dur);
    var g=a.createGain();g.gain.setValueAtTime(Math.max(0.001,vol||0.2),t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl);fl.connect(g);g.connect(bus());s.start(t);
  }catch(e){}
}
var sfx={
  punch:function(){noise(0.07,0.24,1800,300);tone(220,90,0.07,0.05,'square')},
  heavy:function(){noise(0.12,0.3,1200,180);tone(150,60,0.14,0.07,'sawtooth')},
  kick:function(){noise(0.1,0.26,1500,240);tone(180,70,0.1,0.06,'square')},
  whoosh:function(){noise(0.14,0.1,900,220)},
  hurt:function(){tone(320,120,0.2,0.07,'sawtooth');noise(0.12,0.16,700,140)},
  die:function(){tone(420,70,0.5,0.07,'square')},
  ko:function(){tone(300,60,0.6,0.09,'sawtooth');noise(0.4,0.2,900,90)},
  jump:function(){tone(380,660,0.09,0.045,'square')},
  land:function(){noise(0.07,0.12,500,110)},
  special:function(){for(var i=0;i<3;i++)tone(600-i*120,1400+i*200,0.14,0.06,'square',i*0.07);noise(0.4,0.24,2000,120)},
  clear:function(){var s=[523,659,784,1047],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*1.02,0.18,0.055,'square',i*0.11)},
  fail:function(){var s=[392,330,262,196],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*0.97,0.28,0.055,'triangle',i*0.15)},
  rage:function(){tone(140,900,0.4,0.06,'sawtooth')},
  food:function(){tone(760,1180,0.09,0.05,'square');tone(1180,1560,0.1,0.04,'square',0.08)},
  click:function(){tone(660,900,0.05,0.04,'square')},
  alert:function(){tone(880,880,0.06,0.04,'square');tone(1100,1100,0.06,0.035,'square',0.09)}
};

/* ══════════ GAMBAR STICKMAN ══════════ */
var PAL={
  hero:{line:'#f2f6ff',shade:'#b9c6e0',band:'#57c8ff',glow:'rgba(87,200,255,.55)'},
  thug:{line:'#ff8f7a',shade:'#c05a48',band:'#e0342e',glow:'rgba(224,52,46,.45)'},
  fat:{line:'#ffc46a',shade:'#c08a30',band:'#8a5a12',glow:'rgba(255,196,106,.45)'},
  boss:{line:'#ff5a4a',shade:'#a02015',band:'#ffd166',glow:'rgba(255,90,74,.6)'}
};
/* stickman: seluruh batang tubuh dihitung dari sudut sendi */
function drawStick(x,px,py,o){
  var p=o.pal,scale=o.scale||1,face=o.face||1,ph=o.phase||0,pose=o.pose||'idle',thick=o.thick||6.4;
  var hip=-21,sh=-40,headY=-52,r=o.headR||8.6;
  var k1=0,k2=0,a1=0,a2=0,lean=0;
  if(pose==='idle'){a1=Math.sin(ph*0.5)*0.14;a2=-a1;k1=Math.sin(ph*0.5)*0.06;k2=-k1}
  else if(pose==='walk'){a1=-Math.sin(ph)*0.7;a2=Math.sin(ph)*0.7;k1=Math.sin(ph)*0.55;k2=-Math.sin(ph)*0.55}
  else if(pose==='run'){a1=-Math.sin(ph)*0.95;a2=Math.sin(ph)*0.95;k1=Math.sin(ph)*0.8;k2=-Math.sin(ph)*0.8;lean=0.13}
  else if(pose==='jump'){k1=0.5;k2=-0.35;a1=-1.9;a2=-1.5;lean=0.12}
  else if(pose==='punch'){a1=-3.05;a2=0.55;k2=0.3;lean=0.1}
  else if(pose==='punch2'){a2=-3.05;a1=0.5;k1=-0.3;lean=0.12}
  else if(pose==='kick'){k1=Math.PI/2-0.15;k2=0.3;a1=1.2;a2=-1.0;lean=-0.16}
  else if(pose==='wind'){a1=-0.9;a2=0.4;k1=0.25;k2=-0.9;lean=-0.12}
  else if(pose==='hurt'){lean=-0.24;a1=1.5;a2=1.3;k1=-0.4;k2=0.5}
  x.save();
  x.translate(px,py);
  x.scale(face*scale,scale);
  if(o.rot)x.rotate(o.rot);
  if(lean)x.transform(1,0,-lean*0.9,1,0,0);
  var thigh=15,shin=15,upper=13,fore=13;
  function seg(bx,by,ang1,l1,ang2,l2,w,col){
    var mx=bx+Math.cos(ang1)*l1,my=by+Math.sin(ang1)*l1;
    var ex=mx+Math.cos(ang1+ang2)*l2,ey=my+Math.sin(ang1+ang2)*l2;
    x.strokeStyle=col;x.lineWidth=w;x.lineCap='round';
    x.beginPath();x.moveTo(bx,by);x.lineTo(mx,my);x.lineTo(ex,ey);x.stroke();
    return[ex,ey];
  }
  /* kaki belakang */
  seg(0,hip,Math.PI/2+k2,thigh,0.12,shin,thick,p.shade);
  /* lengan belakang */
  seg(0,sh,Math.PI/2+0.3+a2*0.6,upper,0.7+a2*0.3,fore,thick*0.9,p.shade);
  /* badan */
  x.strokeStyle=p.line;x.lineWidth=thick+0.6;
  x.beginPath();x.moveTo(0,hip);x.lineTo(0,sh);x.stroke();
  x.fillStyle=p.band;rr(x,-3.5,sh-1,7,4,1.6);x.fill();
  /* kaki depan */
  seg(0,hip,Math.PI/2+k1,thigh,0.12,shin,thick,p.line);
  /* lengan depan */
  var hx=seg(0,sh,Math.PI/2+0.3+a1*0.6,upper,0.7+a1*0.3,fore,thick*0.9,p.line);
  /* kepala */
  x.fillStyle=p.line;x.beginPath();x.arc(0,headY+4,r,0,6.3);x.fill();
  x.strokeStyle=p.line;x.lineWidth=thick*0.8;
  x.beginPath();x.moveTo(0,sh);x.lineTo(0,headY+4+r*0.6);x.stroke();
  x.fillStyle=p.band;x.beginPath();x.arc(0,headY+4,r,Math.PI*1.15,Math.PI*1.85);x.fill();
  x.fillStyle='#0b0b12';
  x.beginPath();x.arc(r*0.42,headY+3,r*0.22,0,6.3);x.fill();
  x.beginPath();x.arc(r*0.06,headY+3,r*0.2,0,6.3);x.fill();
  /* efek tinju */
  if(pose==='punch'||pose==='punch2'){
    x.fillStyle='rgba(255,255,255,.16)';
    x.beginPath();x.arc(hx[0],hx[1],7,0,6.3);x.fill();
  }
  x.restore();
  return hx;
}

/* ══════════ KEADAAN ══════════ */
var state='menu',tick=0,fights=0,cam={x:0,shake:0},hitstop=0;
var score=0,lives=3,waveIdx=0,waveTimer=0,waveState='idle',combo=0,comboT=0,best=0;
var enemies=[],fx=[],popups=[],drops=[],bg=[];
var GROUND_Y=252;
var P={x:80,y:GROUND_Y,vx:0,vy:0,onGround:true,face:1,hp:100,maxHp:100,anim:0,rage:0,rageMax:100,
  atk:0,atkTimer:0,combo:0,comboWindow:0,hurt:0,inv:0,dead:false,deadT:0,special:0,scale:1,reach:0};
var GRAV=0.62,MAXFALL=10,SPD=2.5,JUMP=-9.4;
var input={ax:0,left:false,right:false};
var WAVES=[
  {n:2,k:['thug','thug']},
  {n:3,k:['thug','thug','fat']},
  {n:4,k:['thug','thug','thug','fat']},
  {n:5,k:['thug','fat','thug','thug','fat']},
  {n:5,k:['thug','thug','fat','thug','fat']},
  {n:3,k:['boss','thug','thug']}
];
var WALL=[40,1240];
function later(f,fn){timers.push({t:tick+f,fn:fn})}
var timers=[];

function mkEnemy(kind,x){
  var base={x:x,y:GROUND_Y,vx:0,vy:0,onGround:false,face:-1,anim:rnd(0,6),atk:0,atkTimer:ri(20,70),hurt:0,dead:false,deadT:0,kind:kind,scale:1,rot:0,wind:0,hitCd:0};
  if(kind==='thug'){base.hp=base.maxHp=34;base.spd=1.35;base.dmg=7;base.pal=PAL.thug;base.headR=8.6;base.reach=34;base.score=100}
  else if(kind==='fat'){base.hp=base.maxHp=70;base.spd=0.95;base.dmg=12;base.pal=PAL.fat;base.headR=10.5;base.scale=1.22;base.reach=38;base.score=200}
  else if(kind==='boss'){base.hp=base.maxHp=240;base.spd=1.5;base.dmg=16;base.pal=PAL.boss;base.headR=12.5;base.scale=1.55;base.reach=52;base.score=1200;base.boss=true}
  return base;
}
function spawnWave(){
  var w=WAVES[waveIdx];
  if(!w)return;
  var i;
  for(i=0;i<w.k.length;i++){
    var side=(i%2===0)?1:-1;
    var x=side>0?clamp(P.x+rnd(230,420),WALL[0]+40,WALL[1]-30):clamp(P.x-rnd(200,360),WALL[0]+30,WALL[1]-40);
    var en=mkEnemy(w.k[i],x);
    en.dmg=Math.round(en.dmg*(1+waveIdx*0.07));      /* gelombang makin dalam = makin sakit */
    en.atkTimer=ri(24,64);
    enemies.push(en);
  }
  if(w.k.indexOf('boss')>=0){
    showBanner('BOS MUNCUL','BRUTUS — RAJA GANG');
    var wb=$('waveBar');if(wb)wb.classList.add('show');
    var wn=$('waveName');if(wn)wn.textContent='⚠ BRUTUS • BOS GELOMBANG '+WAVES.length;
    sfx.ko();
  }else{
    showBanner('GELOMBANG '+(waveIdx+1),w.k.length+' PREMAN DATANG');
    sfx.alert();
  }
  waveState='fighting';
}
function showBanner(t,s){var b=$('banner');bannerTxt=t;b.innerHTML=t+(s?'<small>'+s+'</small>':'');b.classList.add('show');bannerT=tick}
var bannerTxt='',bannerT=0;
function hideBanner(){var b=$('banner');if(b)b.classList.remove('show')}

/* ══════════ KEMAMPUAN PEMILIH ══════════ */
function addRage(v){P.rage=clamp(P.rage+v,0,P.rageMax);hud()}
function hitStop(n){hitstop=Math.max(hitstop,n)}
function spark(x,y,n,col){
  var i;for(i=0;i<n;i++)fx.push({x:x,y:y,vx:rnd(-3.4,3.4),vy:rnd(-3.4,1.6),life:ri(10,22),max:22,c:col||'#fff',r:rnd(1.4,3),g:0.16,type:'spark'});
}
function popText(x,y,t,c){popups.push({x:x,y:y,t:t,c:c||'#fff',life:46,max:46})}
function shake(v){cam.shake=Math.max(cam.shake,v)}

function playerAttack(kind){
  if(state!=='play'||P.dead||P.atkTimer>0||P.special>0)return;
  P.atkHit=false;
  if(kind==='punch'){
    P.combo=(P.comboWindow>0)?(P.combo+1)%3:0;
    P.comboWindow=26;
    P.atk=kind;
    P.atkTimer=P.combo===2?22:12;
    P.reach=P.combo===2?42:36;
    P.atkDmg=P.combo===2?17:9;
    sfx[P.combo===2?'heavy':'punch']();
    addRage(P.combo===2?7:4);
  }else if(kind==='kick'){
    P.atk=kind;P.atkTimer=20;P.reach=44;P.atkDmg=14;
    sfx.kick();
    addRage(6);
  }else if(kind==='special'){
    if(P.rage<P.rageMax)return;
    P.rage=0;P.special=26;P.atk='special';
    sfx.special();shake(7);
    addScore(0);
    hud();
  }
  if(P.onGround&&kind!=='special')P.vx+=P.face*(kind==='punch'?1.1:1.6);
}
function doHits(){
  var i,e;
  /* FATAL: putaran mematikan ke semua arah, memukul berulang tiap 4 frame */
  if(P.special>0){
    for(i=0;i<enemies.length;i++){
      e=enemies[i];
      if(e.dead)continue;
      if(Math.abs(e.x-P.x)<88&&Math.abs(e.y-P.y)<54){
        e.hits=0;e.stunT=0;                       /* fatal mematahkan ketahanan musuh */
        damageEnemy(e,11,sgn(e.x-P.x)||1);
      }
    }
    return;
  }
  if(P.atkHit)return;                              /* satu tebasan = satu kali kerusakan */
  P.atkHit=true;
  var reach=P.reach||36,dmg=P.atkDmg||8;
  var cx=P.x+P.face*(reach*0.55),cy=P.y-24;
  for(i=0;i<enemies.length;i++){
    e=enemies[i];
    if(e.dead)continue;
    if(Math.abs(e.x-cx)<reach*0.75+e.scale*8&&Math.abs((e.y-24)-cy)<46)damageEnemy(e,dmg,P.face);
  }
}
function damageEnemy(e,dmg,dir){
  if(e.dead)return;
  e.hp-=dmg;
  /* ketahanan: musuh yang dipukul terus-menerus mulai menahan pukulan lalu balas */
  e.hits=(e.stunT>0?(e.hits||0):0)+1;
  e.stunT=72;
  var armor=e.hits>=4&&!e.boss?1:(e.hits>=7?1:0);
  e.hurt=armor?2:10;
  e.vx=dir*(armor?0.5:(e.boss?1.2:2.4));
  e.vy=armor?0:(e.boss?-1.2:-2.2);
  spark(e.x,e.y-26,armor?3:8,'#ffd88a');
  hitStop(armor?2:6);
  shake(armor?1.6:3.4);
  soundHit();
  combo++;comboT=96;
  popText(e.x,e.y-46,'+'+(dmg),armor?'#c8c8d8':'#ffe08a');
  addScore(Math.round(dmg/2));
  if(e.hp<=0)killEnemy(e);
  hud();
}
function soundHit(){noise(0.05,0.2,2200,400)}
function killEnemy(e){
  e.dead=true;e.deadT=70;e.vy=-6.4;e.vx=(e.vx||0)+rnd(-1,1);
  score+=e.score||100;
  popText(e.x,e.y-52,'+'+((e.score||100)),'#fff');
  spark(e.x,e.y-30,18,'#ffcf7a');
  shake(4);hitStop(5);
  if(e.boss){sfx.ko();showBanner('K.O.!','BOS TUMBANG');}
  else sfx.die();
  if(Math.random()<0.28)dropFood(e.x,e.y-30);
  hud();
}
function dropFood(x,y){drops.push({x:x,y:y,vy:-3.4,life:600,type:'food'})}
function collectFood(){P.hp=Math.min(P.maxHp,P.hp+26);sfx.food();popText(P.x,P.y-60,'+26','#8ef0a8');hud()}
function addScore(v){score+=v;hud()}
function hurtPlayer(n,fromX){
  if(P.dead||P.inv>0||state!=='play')return;
  var d=Math.round(n*(diffMul()));
  P.hp-=d;P.inv=52;P.hurt=12;shake(4.4);hitstop=Math.max(hitstop,5);
  sfx.hurt();
  P.vx=sgn(P.x-(fromX||P.x-1))*2.2;P.vy=-2.6;
  spark(P.x,P.y-28,10,'#ff8f7a');
  popText(P.x,P.y-58,'-'+d,'#ff9a8a');
  combo=0;
  if(P.hp<=0){P.hp=0;killPlayer()}
  hud();
}
function diffMul(){return 1}
function killPlayer(){
  P.dead=true;P.deadT=90;P.vy=-5;P.rot=1.3;
  sfx.die();shake(6);
  lives--;
  if(lives<0){lives=0;gameOver()}
  hud();
}
function respawnPlayer(){
  P.dead=false;P.hp=P.maxHp;P.inv=110;P.vy=0;P.vx=0;P.x=clamp(WALL[0]+80,WALL[0],WALL[1]);P.rot=0;
  P.rage=Math.round(P.rageMax*0.3);
  enemies.length=0;waveState='idle';waveTimer=40;
  showBanner('BANGKIT','GELOMBANG DIULANG');
  hud();
}

/* ══════════ PEMBARUAN ══════════ */
function updatePlayer(){
  if(P.dead){
    P.deadT--;
    P.vy+=GRAV*0.8;P.y+=P.vy;P.vy=Math.min(P.vy,MAXFALL);
    P.x+=P.vx;P.vx*=0.94;
    if(P.deadT<=0)respawnPlayer();
    return;
  }
  var aAx=input.ax||0,aMag=Math.abs(aAx)<STICK_DEAD?0:Math.min(1,Math.abs(aAx));
  var want=aMag?(aAx<0?-1:1):0;
  if(P.special>0){
    P.special--;
    P.anim+=0.7;
    P.vx*=0.86;
    if(P.special%4===0){spark(P.x,P.y-28,6,'#ffd166');addRage(0)}
    doHits();
  }else if(want!==0&&P.atkTimer<=0){
    P.face=want;
    P.vx+=want*0.7*(0.35+0.65*aMag);
    P.anim+=0.08+0.16*aMag;
  }else if(P.onGround&&P.atkTimer<=0){
    P.vx*=0.72;P.anim+=0.06;
  }
  /* batas kecepatan ikut tuas: geser sedikit = jalan, geser penuh = lari */
  var vcap=want!==0?SPD*1.4*(0.3+0.7*aMag):SPD*1.4;
  P.vx=clamp(P.vx,-vcap,vcap);
  if(P.onGround)P.vx*=0.9;
  P.y+=P.vy;P.vy+=GRAV;P.vy=Math.min(P.vy,MAXFALL);
  if(P.y>=GROUND_Y){P.y=GROUND_Y;if(P.vy>2.2)sfx.land();P.vy=0;P.onGround=true}else P.onGround=false;
  P.x+=P.vx;
  P.x=clamp(P.x,WALL[0],WALL[1]);
  if(P.inv>0)P.inv--;
  if(P.hurt>0)P.hurt--;
  if(P.atkTimer>0){
    P.atkTimer--;
    if(P.atkTimer===Math.round(22*0.5)||P.atkTimer===Math.round(12*0.45))doHits();
  }
  if(P.comboWindow>0)P.comboWindow--;else P.combo=0;
  if(P.rage<P.rageMax&&tick%30===0)hud();
  if(comboT>0){comboT--;if(comboT===0)combo=0}
}
function updateEnemies(){
  var i;
  for(i=enemies.length-1;i>=0;i--){
    var e=enemies[i];
    if(e.hurt>0)e.hurt--;
    if(e.dead){
      e.deadT--;
      e.vy+=GRAV*0.9;e.y+=e.vy;e.x+=e.vx;e.vx*=0.97;e.rot=(e.rot||0)+0.16*sgn(e.vx||1);
      if(e.y>GROUND_Y){e.y=GROUND_Y;e.vy*=-0.32;e.vx*=0.6}
      if(e.deadT<=0)enemies.splice(i,1);
      continue;
    }
    var dx=P.x-e.x,ad=Math.abs(dx);
    e.face=dx>0?1:-1;
    if(e.hitCd>0)e.hitCd--;
    if(e.stunT>0){e.stunT--;if(e.stunT===0)e.hits=0}
    if(e.wind>0){
      e.wind--;
      e.vx*=0.8;
      if(e.wind===0){
        if(ad<e.reach+22){
          hurtPlayer(e.dmg,P.x);
          spark(P.x,P.y-26,10,'#ff6a5a');
          if(e.boss){shake(5)}
        }
        e.atkTimer=ri(34,64)-(e.boss?14:0);
      }
    }else{
      if(ad>e.reach-6){
        e.vx+=e.face*0.28*(e.spd/1.35);
        e.anim+=0.24*(e.spd/1.35);
      }else{
        e.vx*=0.7;
        if(e.atkTimer<=0&&e.hitCd<=0&&P.dead===false&&P.inv<40){
          e.wind=e.boss?16:13;
          e.hitCd=20;
          sfx.whoosh();
        }
      }
      if(e.atkTimer>0)e.atkTimer--;
    }
    e.vx=clamp(e.vx,-3.2,3.2);
    e.x+=e.vx;e.x=clamp(e.x,WALL[0]-20,WALL[1]+20);
    if(e.onGround)e.vx*=0.92;
    e.y+=e.vy;e.vy+=GRAV;e.vy=Math.min(e.vy,MAXFALL);
    if(e.y>=GROUND_Y){e.y=GROUND_Y;e.vy=0;e.onGround=true}else e.onGround=false;
    /* pemisahan anti-tumpuk */
    var j;
    for(j=0;j<enemies.length;j++){
      var o=enemies[j];
      if(o===e||o.dead)continue;
      var d=o.x-e.x;
      if(Math.abs(d)<16){
        e.x-=sgn(d||1)*0.4;
      }
    }
  }
}
function updateWorld(){
  var i;
  for(i=fx.length-1;i>=0;i--){
    var p=fx[i];p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;
    if(p.life<=0)fx.splice(i,1);
  }
  for(i=popups.length-1;i>=0;i--){popups[i].y-=0.5;popups[i].life--;if(popups[i].life<=0)popups.splice(i,1)}
  for(i=drops.length-1;i>=0;i--){
    var d=drops[i];
    d.vy+=GRAV*0.7;d.y+=d.vy;
    if(d.y>GROUND_Y-10){d.y=GROUND_Y-10;d.vy*= -0.4}
    d.life--;
    if(d.y>GROUND_Y-14&&Math.abs(d.x-P.x)<22&&!P.dead){collectFood();drops.splice(i,1);continue}
    if(d.life<=0)drops.splice(i,1);
  }
  if(cam.shake>0)cam.shake*=0.88;
  if(bannerT&&tick-bannerT>110)hideBanner();
  var target=clamp(P.x-VW*0.42,WALL[0]-40,WALL[1]-VW+140);
  cam.x+=(target-cam.x)*0.12;
}
function updateWaveLogic(){
  if(state!=='play')return;
  if(waveState==='idle'){
    waveTimer--;
    if(waveTimer<=0)spawnWave();
    return;
  }
  if(waveState==='fighting'&&enemies.length===0){
    waveState='clear';
    waveTimer=70;
    if(waveIdx>=WAVES.length-1){
      sfx.clear();
      victory();
      return;
    }
    sfx.clear();
    showBanner('GELOMBANG '+(waveIdx+1)+' BERSIH','SIAP UNTUK BERIKUTNYA');
    score+=250;
    P.hp=Math.min(P.maxHp,P.hp+18);
    hud();
  }
  if(waveState==='clear'){
    waveTimer--;
    if(waveTimer<=0){
      waveIdx++;
      var wn=$('wave');if(wn)wn.textContent=waveIdx+1;
      waveState='idle';waveTimer=32;
    }
  }
}

/* ══════════ GAMBAR ══════════ */
function bakeBg(){
  bg.length=0;
  var far=makeCanvas(960,200,function(x,w,h){
    var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1b1b2e');g.addColorStop(1,'#0d0d18');
    x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle='#141424';
    for(var i=0;i<26;i++){var bx=i*38,hh=40+((i*53)%90);x.fillRect(bx,h-hh,30,hh)}
    x.fillStyle='rgba(87,200,255,.10)';
    for(var j=0;j<70;j++)x.fillRect((j*137)%w,20+((j*71)%130),3,4);
  });
  var near=makeCanvas(960,220,function(x,w,h){
    x.fillStyle='#0b0b16';
    for(var i=0;i<14;i++){var bx=i*72,hh=90+((i*97)%110);x.fillRect(bx,h-hh,58,hh);
      x.fillStyle='rgba(255,209,102,.10)';
      for(var k=0;k<6;k++)x.fillRect(bx+8+(k%3)*16,h-hh+14+Math.floor(k/3)*22,9,11);
      x.fillStyle='#0b0b16';
    }
    x.fillStyle='#000';x.fillRect(0,h-14,w,14);
  });
  var road=makeCanvas(120,60,function(x,w,h){
    var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2a2a3a');g.addColorStop(1,'#14141e');
    x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.05)';
    for(var i=0;i<26;i++)x.fillRect((i*41)%w,(i*23)%h,3,2);
    x.fillStyle='rgba(255,209,102,.16)';
    for(var j=0;j<8;j++)x.fillRect((j*60)%w,26,26,3);
  });
  bg.push({img:far,par:0.16,y:VH-200,h:200});
  bg.push({img:near,par:0.42,y:VH-190,h:220});
  bg.push({img:road,par:1,y:GROUND_Y-2,h:60,repeat:true});
}
function makeCanvas(w,h,fn){var c=D.createElement('canvas');c.width=w;c.height=h;var x=c.getContext('2d');fn(x,w,h);return c}
var lampPulse=0;
function drawBg(){
  var sky=ctx.createLinearGradient(0,0,0,VH);
  sky.addColorStop(0,'#0a0a14');sky.addColorStop(.55,'#14142a');sky.addColorStop(1,'#1d1d33');
  ctx.fillStyle=sky;ctx.fillRect(0,0,VW,VH);
  ctx.fillStyle='rgba(240,246,255,.9)';
  ctx.beginPath();ctx.arc(VW*0.78,52,17,0,6.3);ctx.fill();
  ctx.fillStyle='rgba(240,246,255,.10)';
  ctx.beginPath();ctx.arc(VW*0.78,52,40,0,6.3);ctx.fill();
  var i;
  for(i=0;i<bg.length;i++){
    var L=bg[i],off=-(cam.x*L.par)%(L.img.width);
    var y=L.y;
    if(L.repeat){
      for(var k=-1;k<3;k++)ctx.drawImage(L.img,off+k*L.img.width,y,L.img.width,L.h);
    }else{
      for(var k2=-1;k2<3;k2++)ctx.drawImage(L.img,off+k2*L.img.width,y,L.img.width,L.h);
    }
  }
  /* lampu jalan */
  var lx=[120,420,760,1100];
  for(i=0;i<lx.length;i++){
    var sx=lx[i]-(cam.x*0.42)%1400;
    if(sx<-40||sx>VW+40)continue;
    ctx.fillStyle='#2a2a3c';ctx.fillRect(sx-2,GROUND_Y-120,4,120);
    ctx.fillStyle='#3a3a52';ctx.fillRect(sx-9,GROUND_Y-124,20,5);
    var g2=ctx.createRadialGradient(sx,GROUND_Y-118,2,sx,GROUND_Y-118,70);
    g2.addColorStop(0,'rgba(255,209,102,.35)');g2.addColorStop(1,'rgba(255,209,102,0)');
    ctx.fillStyle=g2;ctx.beginPath();ctx.arc(sx,GROUND_Y-118,70,0,6.3);ctx.fill();
  }
}
function drawGround(){
  ctx.fillStyle='#1a1a26';ctx.fillRect(0,GROUND_Y,VW,VH-GROUND_Y);
  ctx.fillStyle='#242438';ctx.fillRect(0,GROUND_Y,VW,4);
  ctx.fillStyle='rgba(255,255,255,.05)';
  var i;for(i=0;i<40;i++)ctx.fillRect((i*53-cam.x*0.6)%(VW+60)-30,GROUND_Y+8+(i*7)%34,14,2);
}
function drawFx(){
  var i;
  for(i=0;i<fx.length;i++){
    var p=fx[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.fillStyle=p.c;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r*(0.4+a*0.6),0,6.3);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawPopups(){
  ctx.textAlign='center';
  var i;
  for(i=0;i<popups.length;i++){
    var p=popups[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.font='900 14px system-ui,sans-serif';
    ctx.lineWidth=3.4;ctx.strokeStyle='rgba(0,0,0,.8)';
    ctx.strokeText(p.t,p.x,p.y);
    ctx.fillStyle=p.c;ctx.fillText(p.t,p.x,p.y);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}
function drawHpBar(x,y,w,pct,col){
  ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(x-w/2,y,w,4.6);
  ctx.fillStyle=col;ctx.fillRect(x-w/2,y,w*clamp(pct,0,1),4.6);
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=1;ctx.strokeRect(x-w/2,y,w,4.6);
}
function draw(){
  ctx.setTransform(PX,0,0,PX,0,0);
  ctx.clearRect(0,0,VW,VH);
  drawBg();
  ctx.save();
  var sx=0,sy=0;
  if(cam.shake>0.3){sx=rnd(-1,1)*cam.shake;sy=rnd(-1,1)*cam.shake}
  ctx.translate(-Math.round(cam.x)+sx,sy);
  drawGround();
  var i;
  for(i=0;i<drops.length;i++){
    var d=drops[i],bob=Math.sin(tick/8)*2;
    ctx.fillStyle='rgba(142,240,168,.22)';
    ctx.beginPath();ctx.arc(d.x,d.y+bob,15,0,6.3);ctx.fill();
    ctx.fillStyle='#3fbf6a';rr(ctx,d.x-9,d.y-8+bob,18,16,4);ctx.fill();
    ctx.fillStyle='#8ef0a8';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.fillText('+',d.x,d.y+4+bob);ctx.textAlign='left';
  }
  for(i=0;i<enemies.length;i++){
    var e=enemies[i];
    var pose='idle';
    if(e.dead)pose='down';
    else if(e.wind>0)pose='wind';
    else if(Math.abs(e.vx)>0.35)pose=e.spd>1.2?'run':'walk';
    if(e.hurt>0)pose='hurt';
    drawStick(ctx,e.x,e.y,{pal:e.pal,face:e.face,phase:e.anim,pose:pose,scale:e.scale,headR:e.headR,rot:e.dead?(e.rot||0):0});
    if(!e.dead&&e.hp<e.maxHp)drawHpBar(e.x,e.y-64*e.scale,Math.max(24,e.scale*30),e.hp/e.maxHp,e.boss?'#ff5a4a':'#ffb060');
    if(e.wind>0){
      ctx.fillStyle='rgba(255,120,90,.9)';
      ctx.font='900 15px system-ui';ctx.textAlign='center';
      ctx.fillText('!',e.x,e.y-72*e.scale);ctx.textAlign='left';
    }
  }
  if(!P.dead||P.deadT>0){
    var ppose='idle';
    if(P.special>0)ppose='kick';
    else if(P.dead)ppose='down';
    else if(P.atkTimer>0)ppose=(P.atk==='kick')?'kick':(P.combo===2?'punch2':'punch');
    else if(!P.onGround)ppose='jump';
    else if(Math.abs(P.vx)>0.35)ppose='run';
    else if(P.hurt>0)ppose='hurt';
    if(P.inv>0&&P.inv%8<4&&!P.dead)ctx.globalAlpha=0.5;
    drawStick(ctx,P.x,P.y,{pal:PAL.hero,face:P.face,phase:P.anim,pose:ppose,scale:1,headR:8.8,rot:P.dead?(P.rot||0):0});
    ctx.globalAlpha=1;
    if(P.special>0){
      ctx.strokeStyle='rgba(255,209,102,'+(0.35+0.35*Math.abs(Math.sin(tick/3)))+')';
      ctx.lineWidth=4;
      ctx.beginPath();ctx.arc(P.x,P.y-26,42,0,6.3);ctx.stroke();
    }
  }
  drawFx();
  drawPopups();
  ctx.restore();
  if(combo>1){
    ctx.textAlign='center';
    ctx.font='950 20px system-ui';
    ctx.fillStyle='rgba(255,209,102,.92)';
    ctx.fillText(combo+' HIT',VW/2,44);
    ctx.font='900 8px system-ui';ctx.fillStyle='rgba(255,255,255,.6)';
    ctx.fillText('KOMBO',VW/2,56);
    ctx.textAlign='left';
  }
}

/* ══════════ HUD & OVERLAY ══════════ */
var hc={hp:-1,rage:-1,score:-1,lives:-1,wave:-1};
function hud(){
  if(hc.hp!==Math.round(P.hp)){hc.hp=Math.round(P.hp);var h=$('hpFill');if(h)h.style.width=(clamp(P.hp/P.maxHp,0,1)*100)+'%'}
  if(hc.rage!==Math.round(P.rage)){hc.rage=Math.round(P.rage);var r=$('rageFill'),rb=$('rageBar');
    if(r)r.style.width=(clamp(P.rage/P.rageMax,0,1)*100)+'%';
    if(rb)rb.className='rageBar'+(P.rage>=P.rageMax?' full':'');
  }
  if(hc.score!==score){hc.score=score;var s=$('score');if(s)s.textContent=score}
  if(hc.lives!==lives){hc.lives=lives;var l=$('lives');if(l)l.textContent=Math.max(0,lives)}
  if(hc.wave!==waveIdx){hc.wave=waveIdx;var w=$('wave');if(w)w.textContent=waveIdx+1}
}
function ovShow(icon,title,text,stats,buttons){
  var o=$('ov');if(!o)return;
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var st=$('ovStats');st.innerHTML='';
  if(stats&&stats.length){
    for(var i=0;i<stats.length;i++)st.innerHTML+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';
    st.style.display='grid';
  }else st.style.display='none';
  var bs=$('ovBtns');bs.innerHTML='';
  for(var j=0;j<buttons.length;j++){
    var b=buttons[j];
    bs.innerHTML+='<button class="sbtn'+(b.cls?' '+b.cls:'')+'" type="button" data-act="'+b.act+'"'+(b.d!==undefined?' data-d="'+b.d+'"':'')+'>'+b.label+'</button>';
  }
  o.classList.remove('hide');
}
function ovHide(){var o=$('ov');if(o)o.classList.add('hide')}
function menu(){
  state='menu';showBanner('','');hideBanner();
  ovShow('🥊','STICK FURY',
    'Kamu sendirian di <b>Gang Alley</b>. Enam gelombang preman jalanan menunggu, ditutup <b>BRUTUS</b> si raja gang.<br><br><b>PUKUL</b> tiga kali beruntun = <b>uppercut</b> (17 kerusakan). <b>TENDANG</b> melempar musuh. <b>FATAL</b> saat bilah <b>AMARAH</b> penuh — putaran mematikan ke semua arah.<br><br>Musuh berkedip <b>!</b> sebelum menyerang — menghindarlah.',
    [['GELOMBANG',WAVES.length],['NYAWA',3],['BOS','BRUTUS']],
    [{act:'start',label:'▶ MULAI BRAWL',cls:'go'},{act:'help',label:'❔ CARA MAIN'}]);
}
function help(){
  ovShow('📖','CARA MAIN',
    '<b>TOMBOL ARAH</b> (kiri bawah) — <b>◀ ▶</b> jalan; bisa ditekan bersamaan dengan tombol aksi di kanan.<br><b>PUKUL</b> kombo 3 (jab-jab-uppercut) — <b>tahan</b> untuk pukulan beruntun otomatis.<br><b>TENDANG</b> melempar musuh ke belakang • <b>LOMPAT</b> menghindar serangan (bisa bersamaan dengan jalan).<br><b>⏸ JEDA</b> di kanan atas untuk berhenti sebentar.<br><b>FATAL</b> hanya saat bilah AMARAH penuh — mengosongkan amarah untuk putaran dahsyat<br><br>Setiap pukulan yang masuk menambah amarah. Musuh tebal (jingga) lebih lambat tapi memukul keras; <b>BRUTUS</b> kebal terhadap knockback.<br><br>Makanan jatuh dari musuh yang tumbang — ambil untuk memulihkan darah.<br><br>Keyboard: ← → jalan, J pukul, K tendang, Space lompat, L fatal, P jeda, M bisu.',
    null,[{act:'back',label:'◀ KEMBALI'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';
  ovShow('⏸️','JEDA','Gelombang '+(waveIdx+1)+' ditunda. Ambil napas.',
    [['SKOR',score],['TUMPAS',fights],['GELOMBANG',(waveIdx+1)]],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'restart',label:'↻ ULANG',cls:''},{act:'menu',label:'⏹ MENU'}]);
}
function resumeState(){if(state!=='pause')return;state='play';ovHide()}
function gameOver(){
  state='dead';
  sfx.fail();
  ovShow('💀','TUMBANG','Gang Alley menang malam ini. Coba lagi, petarung.',
    [['SKOR',score],['TUMPAS',fights],['GELOMBANG',waveIdx+1]],
    [{act:'restart',label:'↻ COBA LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
function victory(){
  state='win';
  sfx.clear();
  ovShow('🏆','GANG ALLEY BERSIH','Semua preman — termasuk BRUTUS — sudah tumbang. Nama kamu jadi cerita di jalanan.',
    [['SKOR',score],['TUMPAS',fights],['NYAWA',lives]],
    [{act:'restart',label:'↻ MAIN LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
function start(){
  state='play';tick=0;score=0;lives=3;waveIdx=0;waveState='idle';waveTimer=52;combo=0;comboT=0;fights=0;
  enemies.length=0;fx.length=0;popups.length=0;drops.length=0;timers.length=0;
  P.x=WALL[0]+70;P.y=GROUND_Y;P.vx=0;P.vy=0;P.face=1;P.hp=P.maxHp;P.rage=0;P.atkTimer=0;P.combo=0;P.comboWindow=0;
  P.hurt=0;P.inv=60;P.dead=false;P.deadT=0;P.special=0;P.anim=0;P.rot=0;
  cam.x=0;cam.shake=0;hitstop=0;
  input.ax=0;input.left=input.right=false;
  hc.hp=-1;hc.rage=-1;hc.score=-1;hc.lives=-1;hc.wave=-1;
  var wb=$('waveBar');if(wb)wb.classList.remove('show');
  ovHide();hud();
  showBanner('GANG ALLEY','BERSIHKAN ENAM GELOMBANG');
}

/* ══════════ LOOP ══════════ */
function step(){
  tick++;
  var i;
  for(i=timers.length-1;i>=0;i--){if(timers[i].t<=tick){var f=timers[i].fn;timers.splice(i,1);try{f()}catch(e){}}}
  if(hitstop>0){hitstop--;updateWorld();return}
  if(state==='play'){
    updatePlayer();
    updateEnemies();
    updateWaveLogic();
  }
  updateWorld();
}
var last=0,acc=0,FIXED=1000/60;
function loop(now){
  requestAnimationFrame(loop);
  var dt;
  if(!last)last=now;
  dt=now-last;last=now;
  if(dt>120)dt=120;
  acc+=dt;
  var guard=0;
  while(acc>=FIXED&&guard<5){step();acc-=FIXED;guard++}
  if(guard>=5)acc=0;
  draw();
}

/* ══════════ INPUT ══════════ */
/* Tombol tahan: jari menyentuh = aksi langsung. Kalau opt.repeat, aksinya diulang terus
   selama jari menahan (dibatasi sendiri oleh cooldown serangan game), jadi kombo tidak
   perlu ketuk-ketuk. Lepas jari = berhenti; pointer id dijaga supaya jari lain yang
   diangkat (mis. tombol lompat) tidak mematikan tombol ini. */
function hold(id,on,off,opt){
  var el=$(id);if(!el)return;
  var pid=null,rep=0,every=(opt&&opt.every)||70,offFn=off||function(){};
  function tick(){
    if(pid===null)return;
    on();
    if(pid===null){rep=0;return}   // jari sudah lepas saat aksi diproses → jangan lanjut
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
function doJump(){
  if(state!=='play'||P.dead||!P.onGround)return;
  P.vy=JUMP;P.onGround=false;sfx.jump();
  for(var i=0;i<5;i++)fx.push({x:P.x,y:GROUND_Y-2,vx:rnd(-1.4,1.4),vy:rnd(-1,-.2),life:14,max:14,c:'rgba(200,200,220,',r:2,g:0.05});
}

function bind(){
  mountDpad();
  hold('bPunch',function(){playerAttack('punch')},null,{repeat:true,every:60});
  hold('bKick',function(){playerAttack('kick')},null,{repeat:true,every:70});
  hold('bSpecial',function(){playerAttack('special')},null,{repeat:true,every:90});
  hold('bJump',doJump);
  var ov=$('ov');
  ov.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start'||a==='restart')start();
    else if(a==='help')help();
    else if(a==='back')menu();
    else if(a==='resume')resumeState();
    else if(a==='menu')menu();
  });
  var st=$('stage');
  st.addEventListener('pointerdown',function(e){
    ensureAudioInit();
    if(state!=='play')return;
    var r=st.getBoundingClientRect();
    var rx=(e.clientX-r.left)/r.width;
    if(rx>0.6)playerAttack('punch');
    else if(rx<0.4)playerAttack('kick');
  },{passive:true});
  function ensureAudioInit(){ensureAC()}
  var mb=$('muteB');
  mb.addEventListener('click',function(){
    muted=!muted;
    if(master)master.gain.value=muted?0:0.55;
    mb.textContent=muted?'🔇':'🔊';
  });
  /* JEDA yang bisa disentuh — di WhatsApp tidak ada keyboard, jadi keyboard 'P' tidak cukup */
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
    else if(k==='j'||k==='z'){if(!e.repeat)playerAttack('punch')}
    else if(k==='k'||k==='x'){if(!e.repeat)playerAttack('kick')}
    else if(k==='l'||k==='c'){if(!e.repeat)playerAttack('special')}
    else if(k===' '||k==='arrowup'||k==='w'){e.preventDefault();if(!e.repeat){(function(){if(state!=='play'||P.dead||!P.onGround)return;P.vy=JUMP;P.onGround=false;sfx.jump()})()}}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause')resumeState()}
    else if(k==='enter'){if(state==='menu'||state==='dead'||state==='win')start()}
    else if(k==='m'){if(mb)mb.click()}
  },{passive:false});
  D.addEventListener('keyup',function(e){
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){input.ax=0;input.left=false}
    else if(k==='arrowright'||k==='d'){input.ax=0;input.right=false}
  });
  D.addEventListener('visibilitychange',function(){if(D.hidden&&state==='play')pause()});
  if(window.addEventListener)window.addEventListener('resize',fit);
}

/* ══════════ BOOT ══════════ */
fit();bakeBg();bind();hud();menu();
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',fit);
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);
if(typeof window!=='undefined'){
  window.__SF={
    get s(){return{state:state,tick:tick,hp:Math.round(P.hp),lives:lives,score:score,x:Math.round(P.x),y:Math.round(P.y),wave:waveIdx+1,waveState:waveState,
      enemies:enemies.length,alive:enemies.filter(function(e){return !e.dead}).length,rage:Math.round(P.rage),combo:P.combo,atk:P.atk,special:P.special,
      hitCombo:combo,armored:enemies.filter(function(e){return !e.dead&&e.stunT>0&&(e.hits||0)>=4}).length,maxHp:P.maxHp,
      drops:drops.length,fx:fx.length,onGround:P.onGround,face:P.face,deaths:3-lives}},
    player:P,enemies:enemies,fx:fx,input:input,
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:start,punch:function(){playerAttack('punch')},kick:function(){playerAttack('kick')},special:function(){playerAttack('special')},
    jump:function(){if(P.onGround){P.vy=JUMP;P.onGround=false}},
    spawnWave:function(){spawnWave()},
    hold:function(dir){input.ax=dir==='left'?-1:(dir==='right'?1:0);input.left=(dir==='left');input.right=(dir==='right')},
    dir:function(l,r){input.left=!!l;input.right=!!r;dirSync()},get axis(){return input.ax},get dirs(){return{l:!!input.left,r:!!input.right,ax:input.ax,locked:dirHeldN>0}},
    banner:function(){return bannerTxt},
    killAll:function(){enemies.length=0},
    forceWave:function(n){waveIdx=clamp(n,0,WAVES.length-1);enemies.length=0;waveState='idle';waveTimer=1},
    dropFood:function(x,y){dropFood(x,y)},
    hurtPlayerAt:function(n,x){hurtPlayer(n,x)},
    enemyOf:function(){return enemies.filter(function(e){return !e.dead})},
    timers:function(){return timers.length},
    setRage:function(v){P.rage=clamp(v,0,P.rageMax);hud()},
    hurt:function(n){hurtPlayer(n,P.x-10)},
    teleport:function(x){P.x=x}
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
.mbtn,.abtn,.sbtn,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -3px 5px rgba(0,0,0,.4),0 4px 0 rgba(0,0,0,.42),0 8px 16px rgba(0,0,0,.34)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.06),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 34px rgba(0,0,0,.5)!important}
.stage canvas{filter:saturate(1.08) contrast(1.05)}
.hud,.head{border-radius:12px!important}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🥊', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Stick Fury 🥊',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-stickfury-2026',
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

handler.help = ['stickfury', 'stick', 'angerstick', 'aos']
handler.tags = ['game']
handler.command = /^(stickfury|stick|angerstick|aos)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Stick Fury Nano Ai - beat em up stickman 6 gelombang'

export default handler
