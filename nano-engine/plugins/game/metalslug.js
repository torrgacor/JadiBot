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
<meta name="theme-color" content="#0c1207">
<title>Nano Ai Metal Slug</title>
<style>
:root{--bg:#080d05;--panel:#131c0e;--panel2:#1b2613;--line:#3b5327;--text:#f0f7e6;--dim:#9cb387;--olive:#8fae4d;--sand:#e0c98a;--orange:#eb8b34;--red:#e2543f;--steel:#8e9aa0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(820px 460px at 50% -12%,#26381a 0%,#0d1408 58%,#060903 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#2b3a1b,#131c0e);border:1px solid #4a6430;border-radius:22px;padding:10px;box-shadow:0 30px 80px #000c,inset 0 1px 0 #ffffff12;touch-action:manipulation}
.head{display:flex;align-items:center;justify-content:space-between;gap:9px;background:#0f170a;border:1px solid #34491f;border-radius:14px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:10px;background:linear-gradient(150deg,#d8c07a,#7c6320);border:1px solid #a98d3f;color:#231a05;font:950 15px Georgia,serif;letter-spacing:-.5px;box-shadow:0 4px 0 #4b3a12,inset 0 1px 0 #fff8}
.brandText{min-width:0}
.title{font-family:Georgia,serif;font-size:16px;font-weight:900;letter-spacing:.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mb{width:38px;height:38px;flex:none;border:1px solid #4c6733;border-radius:10px;background:linear-gradient(180deg,#33481f,#1d2a12);color:#eaf3dd;font-size:16px;box-shadow:0 3px 0 #0f1709}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0e1608;border:1px solid #2f4420;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hpWrap{display:flex;align-items:center;gap:5px;flex:1 1 132px;min-width:120px}
.hpWrap b{font-size:6.6px;letter-spacing:.14em;color:var(--dim)}
.hpBar{position:relative;flex:1;height:11px;border-radius:6px;background:#20120e;border:1px solid #4d261d;overflow:hidden;box-shadow:inset 0 2px 4px #000a}
.hpBar i{position:absolute;inset:0 auto 0 0;width:100%;border-radius:6px 0 0 6px;background:linear-gradient(180deg,#7fe06a,#2f8b2b 60%,#1c5b1a);transition:width .16s ease,background .3s ease}
.hpBar.low i{background:linear-gradient(180deg,#ffd166,#e2543f 60%,#8e2418)}
.hpBar.crit i{background:linear-gradient(180deg,#ff9a8a,#c02212 60%,#6d1006);animation:pulseHp .7s infinite}
@keyframes pulseHp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}
.hpNum{font:900 10px system-ui;color:#cfe6b8;min-width:20px;text-align:right}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#16210e;border:1px solid #33471f;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:var(--dim)}
.hs span{font:900 10px system-ui;color:var(--sand);letter-spacing:.3px}
.hs.wp span{color:#ffd98a}.hs.wp b{color:#b9964f}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #34481f;border-radius:14px;overflow:hidden;background:#070c04;box-shadow:inset 0 10px 26px #000c,0 8px 22px #0008}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.prog{position:absolute;left:0;right:0;bottom:0;height:5px;background:#000000aa}
.prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#8fae4d,#e0c98a);box-shadow:0 0 8px #e0c98a88;transition:width .2s ease}
.bossBar{position:absolute;left:8px;right:8px;top:7px;padding:5px 7px;border-radius:9px;background:#1a0c08e8;border:1px solid #7d3320;opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .25s ease;pointer-events:none}
.bossBar.show{opacity:1;transform:translateY(0)}
.bossBar b{display:block;font:900 6.8px system-ui;letter-spacing:.2em;color:#ffb19a;margin-bottom:3px}
.bossBar .bb{height:7px;border-radius:4px;background:#2a120c;border:1px solid #6b2b1a;overflow:hidden}
.bossBar .bb i{display:block;height:100%;width:100%;background:linear-gradient(180deg,#ffb36a,#e2543f 60%,#8d1f10);transition:width .18s ease}
.banner{position:absolute;left:0;right:0;top:34%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease,letter-spacing .4s ease;font:950 17px Georgia,serif;letter-spacing:.06em;color:#ffe6a8;text-shadow:0 3px 0 #00000090,0 0 18px #ffb43a80}
.banner.show{opacity:1;letter-spacing:.14em}
.banner small{display:block;margin-top:5px;font:800 8px system-ui;letter-spacing:.2em;color:#d5e6bf}
.flash{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 55%,rgba(226,84,63,0) 40%,rgba(226,84,63,.55));opacity:0;transition:opacity .12s ease}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#040701cc;backdrop-filter:blur(9px);padding:12px;border-radius:22px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,364px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #4f6a33;border-radius:16px;background:linear-gradient(180deg,#26361a,#141d0e);box-shadow:0 20px 46px #0009,inset 0 1px 0 #ffffff1a;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-family:Georgia,serif;font-size:20px;letter-spacing:.4px}
.ovText{margin-top:6px;color:var(--dim);font-size:9px;line-height:1.5}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #3f5729;border-radius:9px;background:#101809}
.ovStats b{display:block;font-size:12px;color:var(--sand)}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sbtn{min-height:38px;border:1px solid #546d38;border-radius:10px;background:linear-gradient(180deg,#374c20,#1f2c11);color:#eef7e2;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #0e1607,inset 0 1px 0 #ffffff1c;touch-action:manipulation}
.sbtn.sel{border-color:#d8c07a;background:linear-gradient(180deg,#a68c3c,#5f4c12);color:#1c1503;box-shadow:0 4px 0 #3a2d08,inset 0 1px 0 #fff6}
.sbtn.go{border-color:#a8c46a;background:linear-gradient(180deg,#9dc258,#4c7325);color:#10200a;box-shadow:0 4px 0 #22380f,inset 0 1px 0 #ffffff4d}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #0e1607}
.pad{margin-top:9px;display:grid;grid-template-columns:1.1fr 1fr;gap:9px;align-items:end}
.movePad{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:58px 44px;gap:6px;touch-action:none}
.movePad .mbtn{min-height:0;padding:2px;font-size:19px}
.mbtn.down{grid-column:1/3}
/* area tombol arah: gesture eksklusif — jari di sini tidak boleh menggulir halaman */
.nano-analog{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;overscroll-behavior:contain}
body .pad:active{transform:none!important}
.mbtn{min-height:56px;border:1px solid #5b7440;border-radius:13px;background:linear-gradient(180deg,#3b5222,#22301a);color:#f2f8e7;font:900 19px system-ui;box-shadow:0 5px 0 #0f1709,inset 0 1px 0 #ffffff20;touch-action:none;user-select:none;display:grid;place-items:center}
.mbtn small{display:block;font-size:6px;letter-spacing:.14em;color:#b6cba0;margin-top:1px}
.mbtn.active{transform:translateY(3px);box-shadow:0 2px 0 #0f1709;filter:brightness(1.18)}
.actPad{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.abtn{min-height:46px;border:1px solid #6a7f4c;border-radius:13px;background:linear-gradient(180deg,#495f2c,#26351a);color:#f4fae9;font:900 8px system-ui;letter-spacing:.06em;box-shadow:0 5px 0 #101808,inset 0 1px 0 #ffffff20;touch-action:none;user-select:none}
.abtn.fire{grid-column:1/3;grid-row:2;min-height:76px;border-radius:50%;border:2px solid #f0c377;background:radial-gradient(circle at 35% 28%,#ffd48a,#e2543f 55%,#8a1c0d);color:#fff6e6;font:950 12px system-ui;letter-spacing:.1em;box-shadow:0 7px 0 #5c1105,0 0 26px #ff9a4440,inset 0 2px 0 #ffffff55}
.abtn.jump{background:linear-gradient(180deg,#5f7a3a,#2c3d1c)}
.abtn.bomb{background:linear-gradient(180deg,#8c6c2c,#3f2f10);border-color:#c2a25c}
.abtn.active{transform:translateY(4px);box-shadow:0 2px 0 #101808;filter:brightness(1.2)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#7d9068;font-size:6.4px}
.foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot kbd{padding:2px 4px;border:1px solid #3c5127;border-radius:4px;background:#0e1608;color:#9db389;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px;border-radius:19px}.title{font-size:14px}.sub{font-size:7px;letter-spacing:.2px}.logo{width:35px;height:35px;font-size:13px}.mbtn{min-height:50px}.abtn.fire{min-height:66px;font-size:10.5px}.hs span{font-size:9px}.ovTitle{font-size:17px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px;border-radius:24px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">MS</div>
        <div class="brandText"><div class="title">METAL SLUG</div><div class="sub">IRON SHORE • NANO AI ARCADE</div></div>
      </div>
      <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
    </div>

    <div class="hud">
      <div class="hpWrap"><b>HP</b><div class="hpBar" id="hpBar"><i id="hpFill"></i></div><span class="hpNum" id="hpTxt">100</span></div>
      <div class="hs"><b>SKOR</b><span id="score">0</span></div>
      <div class="hs"><b>NYAWA</b><span id="lives">3</span></div>
      <div class="hs wp"><b id="wpn">PISTOL</b><span id="ammo">∞</span></div>
      <div class="hs"><b>BOM</b><span id="bomb">8</span></div>
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
        <button class="abtn bomb" id="bBomb" type="button">💣 BOM</button>
        <button class="abtn fire" id="bFire" type="button">TEMBAK</button>
      </div>
    </div>

    <div class="foot"><span>Tahan TEMBAK untuk menembus barisan musuh</span><span><kbd>←→</kbd> <kbd>SPACE</kbd> <kbd>J</kbd> <kbd>K</kbd> <kbd>P</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🎖️</div>
        <h2 class="ovTitle" id="ovTitle">METAL SLUG</h2>
        <p class="ovText" id="ovText">Pilih misi, lalu tekan MULAI.</p>
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
function hex2rgb(h){var n=parseInt(h.slice(1),16);return[(n>>16)&255,(n>>8)&255,n&255]}
function shade(h,a){var c=hex2rgb(h);for(var i=0;i<3;i++)c[i]=clamp(Math.round(c[i]+a),0,255);return 'rgb('+c[0]+','+c[1]+','+c[2]+')'}
function rgba(h,a){var c=hex2rgb(h);return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}

var cv=$('cv'),ctx=cv.getContext('2d');
var VW=480,VH=296,GY=246,LEVEL_W=4260;
var PX=1,LOW=false,REDUCED=false;
try{REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}
try{LOW=REDUCED||((navigator.hardwareConcurrency||4)<=2)}catch(e){}
function fit(){
  var host=cv.parentNode||D.body;
  var cssW=Math.max(150,Math.round(host.clientWidth||((window.innerWidth||360)-26)));
  var dpr=Math.min(LOW?1.5:2,(window.devicePixelRatio)||1);
  PX=clamp(Math.round(cssW*dpr/VW),1,2);
  cv.width=Math.round(VW*PX);cv.height=Math.round(VH*PX);
}

/* ══════════ AUDIO ══════════ */
var AC=null,master=null,muted=false,musicOn=true;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.55;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(Math.max(24,f1),t);
    if(f2&&f2>0)o.frequency.exponentialRampToValueAtTime(Math.max(24,f2),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.001,vol||0.05),t+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(bus());o.start(t);o.stop(t+dur+0.04);
  }catch(e){}
}
function noise(dur,vol,f0,f1,delay){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var t=a.currentTime+(delay||0),s=a.createBufferSource();s.buffer=buf;
    var fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(Math.max(60,f0||1200),t);
    if(f1)fl.frequency.exponentialRampToValueAtTime(Math.max(60,f1),t+dur);
    var g=a.createGain();g.gain.setValueAtTime(Math.max(0.001,vol||0.2),t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl);fl.connect(g);g.connect(bus());s.start(t);
  }catch(e){}
}
var sfx={
  shoot:function(){tone(780,230,0.05,0.05,'square')},
  heavy:function(){tone(540,190,0.04,0.042,'square')},
  shotgun:function(){noise(0.17,0.2,2600,380);tone(320,90,0.12,0.05,'sawtooth')},
  rocket:function(){noise(0.3,0.17,900,170);tone(190,70,0.3,0.05,'triangle')},
  eshoot:function(){tone(330,150,0.06,0.03,'sawtooth')},
  hit:function(){tone(900,1500,0.035,0.045,'square')},
  exp:function(){noise(0.42,0.29,1500,80);tone(130,40,0.34,0.07,'sawtooth')},
  bigexp:function(){noise(0.72,0.34,1900,60);tone(90,32,0.6,0.09,'sawtooth')},
  jump:function(){tone(430,780,0.1,0.045,'square')},
  land:function(){noise(0.07,0.1,700,140)},
  hurt:function(){tone(310,105,0.24,0.07,'sawtooth')},
  pickup:function(){tone(880,1330,0.08,0.05,'square');tone(1330,1780,0.1,0.04,'square',0.08)},
  click:function(){tone(660,900,0.05,0.04,'square')},
  alert:function(){tone(1000,1000,0.07,0.045,'square');tone(1260,1260,0.07,0.04,'square',0.1)},
  die:function(){tone(430,60,0.72,0.08,'sawtooth')},
  crate:function(){noise(0.14,0.15,900,150)},
  win:function(){var s=[523,659,784,1047,1319],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*1.02,0.22,0.055,'square',i*0.13)},
  fail:function(){var s=[392,330,262,196],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*0.97,0.3,0.055,'triangle',i*0.16)},
  boss:function(){tone(72,58,1.1,0.08,'sawtooth')}
};
var MUS={
  tm:null,step:0,next:0,
  start:function(){
    if(!musicOn||muted||LOW)return;var a=ensureAC();if(!a||this.tm)return;
    this.next=a.currentTime+0.1;this.step=0;var S=this;
    this.tm=setInterval(function(){S.tick()},70);
  },
  tick:function(){
    if(!AC){this.stop();return}
    if(this.next<AC.currentTime-0.4)this.next=AC.currentTime+0.05;
    var guard=0;
    while(this.next<AC.currentTime+0.22&&guard++<24){this.at(this.next-AC.currentTime);this.next+=0.1227;this.step++}
  },
  at:function(d){
    var s=this.step%16,root=110,scale=[0,0,7,0,5,5,3,0],b=scale[Math.floor(this.step/2)%8];
    if(s%4===0)noise(0.16,0.2,260,50,d);
    if(s%2===1)noise(0.03,0.05,7000,4000,d);
    if(s%8===0||s%8===6)tone(root*Math.pow(2,b/12),root*Math.pow(2,b/12),0.15,0.05,'square',d);
  },
  stop:function(){if(this.tm){clearInterval(this.tm);this.tm=null}}
};

/* ══════════ SPRITES ══════════ */
var SS=3;
function bake(w,h,fn){var c=D.createElement('canvas');c.width=Math.max(1,Math.ceil(w*SS));c.height=Math.max(1,Math.ceil(h*SS));var x=c.getContext('2d');x.save();x.scale(SS,SS);x.lineJoin='round';x.lineCap='round';fn(x,w,h);x.restore();return c}
var PALP={helmet:'#4f6c33',uniform:'#6f9350',vest:'#39472a',skin:'#e5b088',boot:'#2e2417',strap:'#8d6c38',accent:'#c8443a'};
var PALE={helmet:'#7d3a26',uniform:'#ad5a3c',vest:'#5b2c1c',skin:'#d8a274',boot:'#2a1c12',strap:'#96603a',accent:'#e8c05a'};
function soldier(x,w,h,o){
  var p=o.pal,cx=w/2,feet=h-0.6,crouch=!!o.crouch,legs=o.legs||[[-3.6,0],[3.6,0]];
  var tY=crouch?h-15:h-21,tH=crouch?11:15;
  for(var i=0;i<2;i++){
    var lx=cx+legs[i][0],ly=legs[i][1],lw=5.1,lh=crouch?6:11;
    x.fillStyle=shade(p.uniform,i?0:-26);
    rr(x,lx-lw/2,tY+tH-2+ly,lw,lh,2.2);x.fill();
    x.fillStyle=p.boot;
    rr(x,lx-lw/2-1,feet-3.2+ly,lw+2,3.2,1.4);x.fill();
  }
  x.fillStyle=shade(p.vest,-12);rr(x,cx-8,tY+2.5,5.4,tH-4,2.2);x.fill();
  var g=x.createLinearGradient(0,tY,0,tY+tH);
  g.addColorStop(0,shade(p.uniform,20));g.addColorStop(.55,p.uniform);g.addColorStop(1,shade(p.uniform,-26));
  x.fillStyle=g;rr(x,cx-5.4,tY,10.8,tH,3.2);x.fill();
  x.fillStyle=p.vest;rr(x,cx-5,tY+2,10,tH-4.4,2.6);x.fill();
  x.fillStyle=rgba(p.strap,.85);rr(x,cx-5,tY+5.6,10,2.6,1.2);x.fill();
  var hy=tY-6.6;
  x.fillStyle=p.skin;rr(x,cx-4.2,hy,8.6,7.4,3.4);x.fill();
  x.fillStyle=shade(p.skin,-24);rr(x,cx-4.2,hy+5.2,8.6,2.2,1.4);x.fill();
  x.fillStyle='#20240f';rr(x,cx+0.6,hy+3.1,3.2,1.5,0.7);x.fill();
  x.fillStyle=shade(p.helmet,-18);rr(x,cx-4.6,hy-1.4,9.4,4.6,2.6);x.fill();
  x.fillStyle=p.helmet;rr(x,cx-5.6,hy-2.4,11.4,4,2);x.fill();
  x.fillStyle=shade(p.helmet,26);rr(x,cx-5.6,hy-2.4,11.4,1.5,1);x.fill();
  x.fillStyle=p.accent;rr(x,cx-5.6,hy+1,11.4,1.4,0.7);x.fill();
  x.fillStyle=p.accent;rr(x,cx-9.4,hy+1.4,4,1.8,0.9);x.fill();
  var gy=crouch?h-13:h-17,gx=cx+(o.aimUp?-1:3.4),grx=gx+(o.recoil?-1.4:0);
  x.fillStyle=shade(p.uniform,-14);rr(x,grx-4.4,gy+1.6,5.6,4.6,2);x.fill();
  x.fillStyle='#2b2f26';rr(x,grx-1,gy-0.6,11,3.1,1.2);x.fill();
  x.fillStyle='#4a5044';rr(x,grx-1,gy-0.6,11,1.2,0.6);x.fill();
  x.fillStyle='#1c1f19';rr(x,grx+8,gy+0.4,3.6,1.5,0.6);x.fill();
  x.fillStyle=p.skin;rr(x,grx+1.6,gy+0.6,3.4,2.6,1.2);x.fill();
}
function mkSoldier(pal,pose){
  var w=26,h=30;
  return bake(w,h,function(x){
    var o={pal:pal};
    if(pose==='idle')o.legs=[[-4,0],[4,0]];
    else if(pose==='run1')o.legs=[[-6.4,-1],[2.2,0]];
    else if(pose==='run2')o.legs=[[-1.6,0],[5.4,-1]];
    else if(pose==='run3')o.legs=[[2.4,0],[5.6,-1.4]];
    else if(pose==='run4')o.legs=[[-5.6,-.6],[1.6,0]];
    else if(pose==='jump'){o.legs=[[-5.4,-3.4],[3.4,-2.2]];o.aimUp=false}
    else if(pose==='fall'){o.legs=[[-5.6,0],[4.4,-1.4]]}
    else if(pose==='crouch'){o.crouch=true;o.legs=[[-5.2,-.4],[4.4,-.4]]}
    else if(pose==='hurt'){o.legs=[[-5.6,0],[3.4,-2.6]];o.recoil=true}
    if(pose==='fire'){o.legs=[[-4,0],[4,0]];o.recoil=true}
    soldier(x,w,h,o);
  });
}
var SPR={};
SPR.p={idle:mkSoldier(PALP,'idle'),run1:mkSoldier(PALP,'run1'),run2:mkSoldier(PALP,'run2'),run3:mkSoldier(PALP,'run3'),run4:mkSoldier(PALP,'run4'),jump:mkSoldier(PALP,'jump'),fall:mkSoldier(PALP,'fall'),crouch:mkSoldier(PALP,'crouch'),fire:mkSoldier(PALP,'fire'),hurt:mkSoldier(PALP,'hurt')};
SPR.e={idle:mkSoldier(PALE,'idle'),run1:mkSoldier(PALE,'run1'),run2:mkSoldier(PALE,'run2'),run3:mkSoldier(PALE,'run3'),run4:mkSoldier(PALE,'run4'),jump:mkSoldier(PALE,'jump'),fall:mkSoldier(PALE,'fall'),crouch:mkSoldier(PALE,'crouch'),fire:mkSoldier(PALE,'fire'),hurt:mkSoldier(PALE,'hurt')};
var PALV={helmet:'#26301c',uniform:'#42502d',vest:'#1e2517',skin:'#c98f68',boot:'#151a10',strap:'#6b5a2e',accent:'#c8342a'};
SPR.ev={idle:mkSoldier(PALV,'idle'),run1:mkSoldier(PALV,'run1'),run2:mkSoldier(PALV,'run2'),run3:mkSoldier(PALV,'run3'),run4:mkSoldier(PALV,'run4'),jump:mkSoldier(PALV,'jump'),fall:mkSoldier(PALV,'fall'),crouch:mkSoldier(PALV,'crouch'),fire:mkSoldier(PALV,'fire'),hurt:mkSoldier(PALV,'hurt')};
SPR.turret=bake(30,22,function(x,w,h){
  var g=x.createLinearGradient(0,4,0,h);g.addColorStop(0,'#7d8c74');g.addColorStop(1,'#2e3a2b');
  x.fillStyle=g;rr(x,2,h-13,w-4,12,3);x.fill();
  x.fillStyle='#4b5a45';rr(x,4,h-15,w-8,5,2.4);x.fill();
  x.fillStyle='#242c22';rr(x,6,h-9,w-12,3,1.4);x.fill();
  x.fillStyle='#9aa893';rr(x,w/2-5,h-20,10,7,2.6);x.fill();
  x.fillStyle='#38442f';rr(x,w/2-3.4,h-22.6,6.8,4.2,1.8);x.fill();
  x.fillStyle='#e2543f';x.beginPath();x.arc(w/2+4.2,h-20.6,1.5,0,6.3);x.fill();
  x.fillStyle='#d8c07a';x.fillRect(4,h-4,4,2);x.fillRect(w-8,h-4,4,2);
});
SPR.drone=bake(34,18,function(x,w,h){
  var g=x.createLinearGradient(0,2,0,h-3);g.addColorStop(0,'#8d9aa0');g.addColorStop(.5,'#525c60');g.addColorStop(1,'#242b2d');
  x.fillStyle=g;rr(x,7,4,w-14,h-7,5);x.fill();
  x.fillStyle='#1b2123';rr(x,10,7,w-20,4,2);x.fill();
  x.fillStyle='#e2543f';x.beginPath();x.arc(w/2-6,11,2.1,0,6.3);x.fill();
  x.fillStyle='#ffd166';x.beginPath();x.arc(w/2+7,11,1.5,0,6.3);x.fill();
  x.fillStyle='#3a4346';x.fillRect(3,h-6,10,2.2);x.fillRect(w-13,h-6,10,2.2);x.fill();
  x.fillStyle='#2a3134';x.fillRect(6,2,8,3);x.fillRect(w-14,2,8,3);
});
SPR.crate=bake(26,26,function(x,w,h){
  var g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#a97c43');g.addColorStop(1,'#6b4a22');
  x.fillStyle=g;rr(x,1,1,w-2,h-2,3);x.fill();
  x.strokeStyle='#4a3116';x.lineWidth=2;rr(x,1.6,1.6,w-3.2,h-3.2,3);x.stroke();
  x.lineWidth=2.2;x.beginPath();x.moveTo(3,3);x.lineTo(w-3,h-3);x.moveTo(w-3,3);x.lineTo(3,h-3);x.stroke();
  x.fillStyle='#c9a05c';x.fillRect(2,2,w-4,2.2);
});
SPR.barrel=bake(24,28,function(x,w,h){
  var g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#7a2517');g.addColorStop(.4,'#cc4a2e');g.addColorStop(1,'#6d2113');
  x.fillStyle=g;rr(x,3,2,w-6,h-4,3.4);x.fill();
  x.fillStyle='#ffd166';x.fillRect(3,h/2-3,w-6,6);
  x.fillStyle='#3a1409';x.fillRect(3,h/2-1,w-6,2);
  x.fillStyle='rgba(0,0,0,.35)';x.fillRect(3,2,w-6,2.4);x.fillRect(3,h-4.4,w-6,2.4);
});
function mkPickup(letter,col){
  return bake(24,24,function(x,w,h){
    var g=x.createLinearGradient(0,0,w,h);g.addColorStop(0,'#f0e2b0');g.addColorStop(1,'#a99459');
    x.fillStyle=g;rr(x,1,1,w-2,h-2,3.4);x.fill();
    x.strokeStyle=col;x.lineWidth=2;rr(x,2,2,w-4,h-4,3);x.stroke();
    x.fillStyle=col;x.font='900 13px system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';
    x.fillText(letter,w/2,h/2+0.6);
  });
}
SPR.pk={H:mkPickup('H','#3b6ea8'),S:mkPickup('S','#8a3f9c'),R:mkPickup('R','#c02a1c'),G:mkPickup('G','#3b7a35'),hp:mkPickup('+','#c02a5a')};
function mkGround(gc){
  return bake(64,64,function(x,w,h){
    var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,gc[0]);g.addColorStop(.35,gc[1]);g.addColorStop(1,gc[2]);
    x.fillStyle=g;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(0,0,0,.28)';x.fillRect(0,0,w,10);
    var sd=98765;
    function rn(){sd=(sd*1103515245+12345)&0x7fffffff;return sd/0x7fffffff}
    for(var i=0;i<70;i++){
      var px=rn()*w,py=10+rn()*(h-10),r=rn()*2.6+0.6;
      x.fillStyle='rgba('+(120+rn()*90|0)+','+(100+rn()*70|0)+','+(60+rn()*50|0)+','+(0.25+rn()*0.35).toFixed(2)+')';
      x.beginPath();x.arc(px,py,r,0,6.3);x.fill();
    }
    x.fillStyle='rgba(255,255,255,.05)';x.fillRect(0,10,w,1.4);
  });
}
function mkTree(col){
  return bake(96,150,function(x,w,h){
    x.fillStyle=shade(col,-12);x.beginPath();x.moveTo(w/2-5,h);x.lineTo(w/2-2,h*.45);x.lineTo(w/2+3,h*.45);x.lineTo(w/2+7,h);x.fill();
    var c=[shade(col,16),col,shade(col,-14)],i;
    for(i=0;i<3;i++){
      x.fillStyle=c[i];
      x.beginPath();x.arc(w/2+(i-1)*13,h*.34-i*4,20-i*3,0,6.3);x.fill();
    }
    x.fillStyle='rgba(160,220,150,.12)';x.beginPath();x.arc(w/2-9,h*.28,11,0,6.3);x.fill();
  });
}
function mkFar(fc){
  return bake(1200,170,function(x,w,h){
    var g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,fc[0]);g.addColorStop(1,fc[1]);
    x.fillStyle=g;x.beginPath();x.moveTo(0,h);
    var pts=[[0,h*.9],[120,h*.62],[210,h*.8],[320,h*.5],[430,h*.78],[560,h*.56],[660,h*.84],[790,h*.46],[900,h*.76],[1030,h*.6],[1200,h*.88]];
    for(var i=0;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);
    x.lineTo(w,h);x.closePath();x.fill();
    x.fillStyle='rgba(255,255,255,.06)';x.beginPath();x.moveTo(320,h*.5);x.lineTo(280,h*.8);x.lineTo(360,h*.8);x.closePath();x.fill();
  });
}
function mkMid(col,col2){
  return bake(900,150,function(x,w,h){
    x.fillStyle=col;
    for(var i=0;i<9;i++){
      var bx=i*100+((i*37)%53);
      x.beginPath();x.arc(bx,h-30,26+(i%3)*6,0,6.3);x.fill();
      x.fillRect(bx-3,h-30,7,34);
    }
    x.fillStyle=col2;x.fillRect(0,h-22,w,22);
  });
}
function mkSky(list,sun){
  return bake(VW,VH,function(x,w,h){
    var g=x.createLinearGradient(0,0,0,h),i;
    for(i=0;i<list.length;i++)g.addColorStop(list[i][1],list[i][0]);
    x.fillStyle=g;x.fillRect(0,0,w,h);
    var s=x.createRadialGradient(w*.72,h*.72,4,w*.72,h*.72,124);
    s.addColorStop(0,'rgba('+sun[0]+',.92)');s.addColorStop(.3,'rgba('+sun[1]+',.32)');s.addColorStop(1,'rgba('+sun[2]+',0)');
    x.fillStyle=s;x.fillRect(0,0,w,h);
    x.fillStyle='rgba(255,255,255,.12)';
    for(i=0;i<26;i++)x.fillRect((i*83)%w,(i*47)%120,28,1.2);
  });
}
function mkCloud(rgb){
  return bake(160,44,function(x,w,h){
    x.fillStyle='rgba('+rgb+',.16)';
    x.beginPath();x.arc(38,28,20,0,6.3);x.arc(70,20,26,0,6.3);x.arc(108,28,21,0,6.3);x.fill();
    x.fillRect(30,26,88,14);
  });
}
/* latar dibuat per misi (di-cache) */
var ART=[];
/* palet cadangan: kalau sebuah misi tidak mendefinisikan bossPal, bos tetap tergambar
   (sebelumnya bossPal tidak pernah ikut dibangun → bos gagal digambar tiap bingkai). */
var DEFAULT_BOSS_PAL={hull:'#6b7a56',tread:'#4c5a3c',eye:'#e2543f',trim:'#c8342a',glass:'#82d066'};
function buildArt(m){
  if(ART[m])return ART[m];
  var A=MISSIONS[m].art;
  ART[m]={sky:mkSky(A.sky,A.sun),far:mkFar(A.far),mid:mkMid(A.mid,A.mid2),ground:mkGround(A.ground),tree:mkTree(A.tree),cloud:mkCloud(A.cloud),bush:A.bush,top:A.top,top2:A.top2,bossPal:A.bossPal||DEFAULT_BOSS_PAL};
  return ART[m];
}
function art(){return ART[mission]||buildArt(mission)}
var vig=null;
function bakeVig(){vig=bake(VW,VH,function(x,w,h){var g=x.createRadialGradient(w/2,h*.46,h*.24,w/2,h/2,w*.78);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.66,'rgba(0,0,0,.24)');g.addColorStop(1,'rgba(0,0,0,.62)');x.fillStyle=g;x.fillRect(0,0,w,h)})}

/* ══════════ MISI (2 level) ══════════ */
var MISSIONS=[
{
  id:1,name:'IRON SHORE',sub:'Garis pantai musuh • senja',
  w:4260,
  segs:[{x:0,w:1430},{x:1470,w:1090},{x:2600,w:1660}],
  plaf:[
    {x:280,y:198,w:96},{x:620,y:172,w:84},{x:830,y:142,w:76},
    {x:1090,y:186,w:92},{x:1330,y:162,w:70},
    {x:1600,y:196,w:104},{x:1810,y:162,w:84},{x:1990,y:130,w:76},
    {x:2200,y:176,w:96},{x:2420,y:150,w:74},
    {x:2760,y:190,w:96},{x:2960,y:158,w:88},{x:3140,y:126,w:78},
    {x:3330,y:182,w:104},{x:3540,y:150,w:88},{x:3760,y:196,w:96}
  ],
  crates:[
    {x:300,t:'crate',item:'G'},{x:470,t:'barrel'},
    {x:700,t:'crate',item:null},{x:960,t:'barrel'},
    {x:1620,t:'crate',item:'H'},{x:1900,t:'crate',item:null},
    {x:2180,t:'barrel'},{x:2330,t:'crate',item:'hp'},
    {x:2840,t:'crate',item:'S'},{x:3060,t:'barrel'},
    {x:3250,t:'crate',item:'hp'},{x:3600,t:'crate',item:'R'},
    {x:3660,t:'crate',item:'G'},
    {x:3740,t:'barrel'},{x:3900,t:'barrel'}
  ],
  waves:[
    {t:110,k:[['g',340],['g',420]]},
    {t:500,k:[['tur',700],['g',620]]},
    {t:880,k:[['g',1080],['g',1160],['d',1300]]},
    {t:1300,k:[['g',1500],['g',1580],['d',1720]]},
    {t:1700,k:[['tur',1900],['g',1820],['g',1990]]},
    {t:2100,k:[['g',2260],['g',2340],['d',2450]]},
    {t:2480,k:[['g',2680],['g',2770],['tur',2890]]},
    {t:2900,k:[['g',3080],['g',3160],['d',3280]]},
    {t:3200,k:[['tur',3380],['g',3300],['g',3460],['g',3520]]},
    {t:3560,k:[['boss',4020],['g',3710],['g',3790]]}
  ],
  checks:[0,1200,2400,3500],
  boss:{name:'IRON SCORPION',kind:'tank',hp:260,rot:[3,4],arena:[3700,4110],spawn:4020,minion:'g'},
  treeLine:[240,760,1240,1780,2260,2820,3300,3860],
  art:{sky:[['#20305c',0],['#4a5a7d',.3],['#91825f',.58],['#c98f4a',.8],['#6b4526',1]],
    sun:['255,225,150','255,180,90','255,140,60'],
    far:['#2b432e','#16241a'],mid:'#12200f',mid2:'#0c1809',
    ground:['#5a4a2c','#3d3119','#241d0f'],top:'#6f5c34',top2:'#8a7443',
    tree:'#243b1b',cloud:'232,228,214',bush:'#16240f',
    bossPal:{hull:'#6b7a56',tread:'#4c5a3c',eye:'#e2543f',trim:'#c8342a',glass:'#82d066'}}
},
{
  id:2,name:'JUNGLE FORTRESS',sub:'Benteng rimba • malam',
  w:4900,
  segs:[{x:0,w:1180},{x:1220,w:760},{x:2020,w:1180},{x:3240,w:1660}],
  plaf:[
    {x:180,y:196,w:92},{x:420,y:158,w:80},{x:700,y:130,w:74},
    {x:960,y:188,w:96},
    {x:1300,y:170,w:98},{x:1520,y:134,w:80},{x:1740,y:190,w:94},
    {x:2140,y:172,w:100},{x:2380,y:136,w:82},
    {x:2600,y:190,w:96},{x:2820,y:150,w:88},{x:3020,y:120,w:76},
    {x:3350,y:186,w:104},{x:3580,y:146,w:88},{x:3800,y:190,w:96},
    {x:4030,y:150,w:84},{x:4240,y:120,w:74},{x:4450,y:186,w:100},{x:4680,y:156,w:84}
  ],
  crates:[
    {x:260,t:'crate',item:'G'},{x:420,t:'barrel'},
    {x:640,t:'crate',item:'H'},{x:880,t:'barrel'},
    {x:1040,t:'crate',item:'hp'},{x:1300,t:'crate',item:'S'},
    {x:1500,t:'barrel'},{x:1700,t:'crate',item:'hp'},
    {x:1900,t:'barrel'},{x:2100,t:'crate',item:'R'},
    {x:2400,t:'barrel'},{x:2650,t:'crate',item:'hp'},
    {x:2860,t:'barrel'},{x:3100,t:'crate',item:'H'},
    {x:3300,t:'barrel'},{x:3500,t:'crate',item:'hp'},
    {x:3700,t:'crate',item:'G'},{x:3900,t:'barrel'},
    {x:4100,t:'crate',item:'R'},{x:4300,t:'barrel'},
    {x:4400,t:'crate',item:'hp'}
  ],
  waves:[
    {t:110,k:[['g',320],['v',420]]},
    {t:520,k:[['tur',700],['g',620],['v',800]]},
    {t:900,k:[['g',1050],['v',1120],['d',1300]]},
    {t:1400,k:[['v',1520],['g',1600],['tur',1780]]},
    {t:1800,k:[['g',1920],['v',2060],['d',2150]]},
    {t:2200,k:[['v',2320],['g',2400],['tur',2600]]},
    {t:2700,k:[['g',2820],['v',2900],['d',3020]]},
    {t:3100,k:[['tur',3320],['v',3400],['g',3480]]},
    {t:3500,k:[['v',3620],['g',3700],['d',3800]]},
    {t:3900,k:[['tur',4050],['v',4120],['g',4200],['v',4280]]},
    {t:4250,k:[['boss',4620],['v',4380],['g',4440]]}
  ],
  checks:[0,1100,2000,3200],
  boss:{name:'STEEL MANTIS',kind:'walker',hp:340,rot:[4,4],arena:[4340,4750],spawn:4620,minion:'v'},
  treeLine:[120,420,760,1080,1420,1760,2080,2440,2780,3120,3460,3800,4140,4480,4720],
  art:{sky:[['#050a1a',0],['#0c1730',.34],['#16264a',.62],['#22355c',.84],['#0a1424',1]],
    sun:['235,242,255','150,190,255','70,120,210'],
    far:['#16243c','#080e1b'],mid:'#0a1a16',mid2:'#050d0a',
    ground:['#3b4134','#252b21','#12160e'],top:'#4d5942',top2:'#606f52',
    tree:'#0f2a1c',cloud:'168,186,220',bush:'#0a1410',
    bossPal:{hull:'#4c5a6b',tread:'#2a3440',eye:'#8ef0a8',trim:'#3aa06a',glass:'#bff8d0'}}
},
{
  id:3,name:'DESERT STORM',sub:'Gurun panas • siang terik',
  w:4600,
  segs:[{x:0,w:1160},{x:1200,w:880},{x:2120,w:900},{x:3060,w:1540}],
  plaf:[
    {x:220,y:196,w:96},{x:460,y:160,w:84},{x:720,y:190,w:96},{x:980,y:150,w:80},
    {x:1260,y:180,w:100},{x:1520,y:140,w:84},{x:1760,y:192,w:96},
    {x:2180,y:170,w:100},{x:2440,y:132,w:82},{x:2700,y:188,w:96},
    {x:3120,y:176,w:100},{x:3380,y:136,w:86},{x:3620,y:190,w:96},{x:3860,y:148,w:84},
    {x:4100,y:186,w:100},{x:4340,y:142,w:84}
  ],
  crates:[
    {x:240,t:'crate',item:'G'},{x:420,t:'barrel'},{x:640,t:'crate',item:'H'},{x:880,t:'barrel'},
    {x:1060,t:'crate',item:'hp'},{x:1300,t:'crate',item:'S'},{x:1560,t:'barrel'},{x:1780,t:'crate',item:'hp'},
    {x:1990,t:'crate',item:'R'},{x:2260,t:'barrel'},{x:2500,t:'crate',item:'hp'},{x:2760,t:'barrel'},
    {x:2960,t:'crate',item:'H'},{x:3200,t:'barrel'},{x:3440,t:'crate',item:'hp'},{x:3700,t:'crate',item:'G'},
    {x:3950,t:'barrel'},{x:4150,t:'crate',item:'R'},{x:4400,t:'barrel'}
  ],
  waves:[
    {t:110,k:[['g',300],['v',380]]},
    {t:520,k:[['tur',700],['g',640],['d',820]]},
    {t:900,k:[['g',1000],['v',1090],['d',1260]]},
    {t:1350,k:[['v',1450],['g',1530],['tur',1700]]},
    {t:1750,k:[['g',1900],['v',2000],['d',2260]]},
    {t:2200,k:[['v',2320],['g',2400],['tur',2600]]},
    {t:2600,k:[['g',2760],['v',2840],['d',3000]]},
    {t:3000,k:[['tur',3160],['v',3240],['g',3320]]},
    {t:3350,k:[['v',3480],['g',3560],['d',3700]]},
    {t:3700,k:[['tur',3860],['v',3940],['g',4020],['v',4100]]},
    {t:4150,k:[['boss',4380],['v',4200],['g',4280]]}
  ],
  checks:[0,1000,2000,3000,4000],
  boss:{name:'SAND GOLIATH',kind:'tank',hp:300,rot:[3,4],arena:[4260,4570],spawn:4380,minion:'v'},
  pitDmg:26,
  treeLine:[150,560,980,1400,1900,2400,2900,3400,3900,4300],
  art:{sky:[['#1d4a7a',0],['#3f7fb0',.32],['#8fc0d8',.6],['#e8d6a8',.84],['#a8763c',1]],
    sun:['255,250,220','255,225,150','255,170,80'],
    far:['#c9a86a','#9c7c46'],mid:'#8a6a3c',mid2:'#6b4f28',
    ground:['#c9a86a','#a5844b','#7a5f32'],top:'#d9bb7a',top2:'#e8d29a',
    tree:'#4f7a3a',cloud:'255,245,220',bush:'#6b5a2e',
    bossPal:{hull:'#b09a5e',tread:'#7a6a3c',eye:'#ff8a3a',trim:'#c07a1e',glass:'#ffd166'}}
},
{
  id:4,name:'ARCTIC BASE',sub:'Pangkalan salju • malam beku',
  w:5200,
  segs:[{x:0,w:1200},{x:1240,w:900},{x:2180,w:1000},{x:3220,w:880},{x:4140,w:1060}],
  plaf:[
    {x:200,y:196,w:96},{x:440,y:158,w:84},{x:680,y:186,w:96},{x:920,y:146,w:80},
    {x:1300,y:180,w:100},{x:1560,y:140,w:86},{x:1820,y:190,w:96},
    {x:2240,y:172,w:100},{x:2500,y:134,w:84},{x:2760,y:188,w:96},{x:3000,y:150,w:88},
    {x:3280,y:178,w:100},{x:3540,y:138,w:86},{x:3800,y:190,w:96},
    {x:4200,y:170,w:100},{x:4460,y:132,w:84},{x:4720,y:186,w:96},{x:4960,y:148,w:88}
  ],
  crates:[
    {x:220,t:'crate',item:'G'},{x:400,t:'barrel'},{x:620,t:'crate',item:'H'},{x:860,t:'barrel'},
    {x:1050,t:'crate',item:'hp'},{x:1320,t:'crate',item:'S'},{x:1600,t:'barrel'},{x:1900,t:'crate',item:'hp'},
    {x:1980,t:'crate',item:'R'},{x:2300,t:'barrel'},{x:2560,t:'crate',item:'hp'},{x:2820,t:'barrel'},
    {x:3050,t:'crate',item:'H'},{x:3350,t:'barrel'},{x:3600,t:'crate',item:'hp'},{x:3900,t:'crate',item:'G'},
    {x:4050,t:'crate',item:'R'},{x:4300,t:'barrel'},{x:4600,t:'crate',item:'hp'},{x:4900,t:'barrel'}
  ],
  waves:[
    {t:110,k:[['v',300],['g',380]]},
    {t:520,k:[['tur',700],['v',640],['d',820]]},
    {t:900,k:[['g',1000],['v',1090],['d',1280]]},
    {t:1350,k:[['v',1450],['g',1530],['tur',1700]]},
    {t:1750,k:[['v',1880],['g',1960],['d',2280]]},
    {t:2250,k:[['tur',2420],['v',2500],['g',2600]]},
    {t:2650,k:[['v',2780],['g',2860],['d',3060]]},
    {t:3100,k:[['v',3300],['g',3380],['tur',3560]]},
    {t:3600,k:[['g',3720],['v',3800],['d',3960]]},
    {t:4050,k:[['tur',4220],['v',4300],['g',4380],['v',4460]]},
    {t:4500,k:[['v',4620],['g',4700],['d',4820]]},
    {t:4700,k:[['boss',4980],['v',4780],['g',4880]]}
  ],
  checks:[0,1200,2200,3300,4400],
  boss:{name:'FROST WALKER',kind:'walker',hp:380,rot:[4,4],arena:[4860,5170],spawn:4980,minion:'v'},
  pitDmg:26,slip:0.8,
  treeLine:[180,620,1080,1540,2040,2520,3020,3500,4000,4480,4900],
  art:{sky:[['#0b1a2e',0],['#16324f',.32],['#2a4e70',.6],['#4a7ba8',.84],['#0d1c30',1]],
    sun:['235,245,255','170,205,255','90,140,220'],
    far:['#5a7a9a','#2c4258'],mid:'#233c52',mid2:'#16283a',
    ground:['#8fb0c8','#6d8ca4','#48607a'],top:'#a8c8dc',top2:'#d2e8f6',
    tree:'#3a6a72',cloud:'220,235,250',bush:'#2f4a5c',
    bossPal:{hull:'#8fb0c8',tread:'#4a6274',eye:'#8ad8ff',trim:'#2f7fa8',glass:'#d8f4ff'}}
},
{
  id:5,name:'VOLCANO CORE',sub:'Inti gunung berapi • lava',
  w:5400,
  segs:[{x:0,w:1100},{x:1140,w:1000},{x:2180,w:900},{x:3120,w:1100},{x:4260,w:1140}],
  plaf:[
    {x:200,y:196,w:96},{x:430,y:156,w:84},{x:680,y:188,w:96},{x:930,y:144,w:80},
    {x:1220,y:182,w:100},{x:1480,y:140,w:86},{x:1740,y:192,w:96},{x:1980,y:150,w:88},
    {x:2260,y:174,w:100},{x:2520,y:134,w:84},{x:2780,y:190,w:96},{x:3000,y:148,w:88},
    {x:3200,y:180,w:100},{x:3460,y:138,w:86},{x:3720,y:192,w:96},{x:3980,y:150,w:88},
    {x:4340,y:172,w:100},{x:4600,y:132,w:84},{x:4860,y:188,w:96},{x:5120,y:146,w:88}
  ],
  crates:[
    {x:240,t:'crate',item:'G'},{x:420,t:'barrel'},{x:640,t:'crate',item:'H'},{x:880,t:'barrel'},
    {x:1020,t:'crate',item:'hp'},{x:1260,t:'crate',item:'R'},{x:1520,t:'barrel'},{x:1780,t:'crate',item:'hp'},
    {x:2040,t:'barrel'},{x:2320,t:'crate',item:'H'},{x:2580,t:'barrel'},{x:2840,t:'crate',item:'hp'},
    {x:3020,t:'crate',item:'S'},{x:3280,t:'barrel'},{x:3520,t:'crate',item:'hp'},{x:3760,t:'barrel'},
    {x:4000,t:'crate',item:'R'},{x:4200,t:'barrel'},{x:4380,t:'crate',item:'hp'},{x:4700,t:'barrel'},
    {x:4980,t:'crate',item:'hp'}
  ],
  waves:[
    {t:110,k:[['v',280],['g',360]]},
    {t:520,k:[['tur',680],['v',600],['d',800]]},
    {t:900,k:[['v',980],['g',1060],['d',1240]]},
    {t:1350,k:[['tur',1500],['v',1580],['g',1660]]},
    {t:1750,k:[['v',1860],['g',1940],['d',2060]]},
    {t:2150,k:[['tur',2320],['v',2400],['g',2480]]},
    {t:2500,k:[['v',2640],['g',2720],['d',2900]]},
    {t:2950,k:[['v',3080],['g',3160],['tur',3340]]},
    {t:3300,k:[['v',3420],['g',3500],['d',3660]]},
    {t:3700,k:[['tur',3860],['v',3940],['g',4020],['v',4100]]},
    {t:4100,k:[['v',4200],['g',4280],['d',4400]]},
    {t:4550,k:[['tur',4720],['v',4800],['g',4880],['v',4960]]},
    {t:4900,k:[['boss',5180],['v',5060],['g',5120]]}
  ],
  checks:[0,1100,2200,3100,4200],
  boss:{name:'MAGMA TITAN',kind:'walker',hp:440,rot:[4,4],arena:[5060,5370],spawn:5180,minion:'v'},
  pitDmg:34,hazard:'lava',
  treeLine:[140,560,1020,1480,1940,2380,2860,3320,3780,4240,4700,5100],
  art:{sky:[['#1a0a08',0],['#3a1410',.32],['#6b2414',.6],['#8a3a12',.84],['#1a0a08',1]],
    sun:['255,200,120','255,120,40','180,40,10'],
    far:['#4a2420','#22100e'],mid:'#2a1310',mid2:'#180a08',
    ground:['#5a3a30','#3a221c','#20120e'],top:'#7a4a3a',top2:'#9a5f42',
    tree:'#3a2418',cloud:'90,60,50',bush:'#2a1a14',
    bossPal:{hull:'#7a3a2c',tread:'#4a1f16',eye:'#ffd166',trim:'#e2543f',glass:'#ff9a3a'}}
}
];
var mission=0,LEV=MISSIONS[0];
LEVEL_W=LEV.w;
var SOLIDS=[],BUSHES=[];
function buildSolids(){
  SOLIDS.length=0;
  var i;
  for(i=0;i<LEV.segs.length;i++)SOLIDS.push({x:LEV.segs[i].x,y:GY,w:LEV.segs[i].w,h:VH-GY+40,kind:'ground'});
  for(i=0;i<LEV.plaf.length;i++)SOLIDS.push({x:LEV.plaf[i].x,y:LEV.plaf[i].y,w:LEV.plaf[i].w,h:10,kind:'metal'});
  SOLIDS.push({x:-20,y:-200,w:20,h:VH+400,kind:'wall'});
  SOLIDS.push({x:LEVEL_W,y:-200,w:20,h:VH+400,kind:'wall'});
}
function solidAt(px,py){
  for(var i=0;i<SOLIDS.length;i++){
    var s=SOLIDS[i];
    if(px>=s.x&&px<=s.x+s.w&&py>=s.y&&py<=s.y+s.h)return true;
  }
  return false;
}
function blockers(){return SOLIDS}
function los(x1,y1,x2,y2){
  var dx=(x2-x1)/8,dy=(y2-y1)/8,i;
  for(i=1;i<8;i++){if(solidAt(x1+dx*i,y1+dy*i))return false}
  return true;
}

/* ══════════ STATE ══════════ */
var state='menu',tick=0,cam={x:0,shake:0},flashT=0,bannerT=0,bannerTxt='',bannerSub='';
var score=0,kills=0,shots=0,hits=0,diff=1,diffName='NORMAL',checkpoint=0,mode='';
var enemies=[],bullets=[],grenades=[],explosions=[],particles=[],popups=[],pickups=[],props=[],timers=[];
var CLEAR_KEY='nano_ms_clear';
var cleared={};
try{var cSaved=localStorage.getItem(CLEAR_KEY);if(cSaved)cSaved.split(',').forEach(function(v){cleared[v]=1})}catch(e){}
function markCleared(id){cleared[id]=1;try{var l=[];for(var k in cleared)if(cleared[k])l.push(k);localStorage.setItem(CLEAR_KEY,l.join(','))}catch(e){}}
var WPN={
  pistol:{n:'PISTOL',cool:9,dmg:2,speed:8.2,pellet:1,spread:0.03,inf:true,snd:'shoot'},
  H:{n:'HEAVY MG',cool:4,dmg:2,speed:8.6,pellet:1,spread:0.075,snd:'heavy',shake:0.5},
  S:{n:'SHOTGUN',cool:23,dmg:3,speed:7.2,pellet:4,spread:0.21,snd:'shotgun',shake:1.6},
  R:{n:'ROCKET',cool:32,dmg:6,speed:5.8,pellet:1,spread:0,rocket:true,snd:'rocket',shake:2.2}
};
var P={x:60,y:GY,vx:0,vy:0,onGround:true,face:1,hp:100,maxHp:100,lives:3,w:15,h:28,
  weapon:'pistol',ammo:{H:0,S:0,R:0},bombs:8,maxBombs:20,cool:0,bcool:0,inv:0,anim:0,
  crouch:false,dead:false,deadT:0,muzzle:0,recoil:0,hitTick:0};
var GRAV=0.5,MAXFALL=8.6,ACC=0.62,MAXVX=2.2,JUMP=-7.05,FRIC=0.66;
var input={ax:0,left:false,right:false,down:false,fire:false,jump:false};
var jumpBuf=0,bombBuf=0,coyote=0;
var DIF=[{n:'MUDAH',dmg:0.62,rate:1.35,hp:0.8},{n:'NORMAL',dmg:1,rate:1,hp:1},{n:'GILA',dmg:1.45,rate:0.7,hp:1.25}];

/* ══════════ ENTITIES ══════════ */
function later(f,fn){timers.push({t:tick+f,fn:fn})}
function runTimers(){
  for(var i=timers.length-1;i>=0;i--){
    if(timers[i].t<=tick){var f=timers[i].fn;timers.splice(i,1);try{f()}catch(e){}}
  }
}
function makeEnemy(t,x){
  var D0=DIF[diff];
  if(t==='g')return{k:'g',x:x,y:GY,vx:0,vy:0,w:15,h:28,face:-1,dir:Math.random()<.5?-1:1,hp:Math.round(6*D0.hp),maxhp:Math.round(6*D0.hp),alert:false,fire:ri(40,110),mark:0,onGround:false,flash:0,anim:0,hitCd:0,dead:false,deadT:0,home:x};
  if(t==='tur')return{k:'tur',x:x,y:GY,vx:0,vy:0,w:26,h:20,face:-1,aim:3.14,hp:Math.round(12*D0.hp),maxhp:Math.round(12*D0.hp),fire:ri(50,90),burst:0,flash:0,dead:false,deadT:0};
  if(t==='d')return{k:'d',x:x,y:GY-112,vx:0,vy:0,w:30,h:18,hp:Math.round(5*D0.hp),maxhp:5,baseY:GY-112,ph:rnd(0,6.3),fire:ri(50,110),home:x,flash:0,dead:false,deadT:0};
  if(t==='v')return{k:'v',vet:1,x:x,y:GY,vx:0,vy:0,w:16,h:29,face:-1,dir:Math.random()<.5?-1:1,hp:Math.round(10*D0.hp),maxhp:Math.round(10*D0.hp),alert:false,fire:ri(50,110),burst:0,gfire:ri(90,200),mark:0,onGround:false,flash:0,anim:0,hitCd:0,dead:false,deadT:0,home:x};
  if(t==='boss'){
    var bh=LEV.boss.hp;
    return{k:'boss',kind:LEV.boss.kind,x:x,y:GY,vx:0,vy:0,w:LEV.boss.kind==='walker'?126:136,h:LEV.boss.kind==='walker'?80:88,face:-1,hp:bh,maxhp:bh,cyc:120,atk:0,flash:0,dead:false,dying:0,deadT:0,smoke:0};
  }
  return null;
}
function spawnWave(w){
  w.done=true;
  for(var i=0;i<w.k.length;i++){
    var e=makeEnemy(w.k[i][0],w.k[i][1]);
    if(e){enemies.push(e);if(e.k==='boss'){
      bossRef=e;sfx.boss();cam.shake=6;showBanner('WARNING',LEV.boss.name+' MENDEKAT');
      var bn=$('bossName');if(bn)bn.textContent='⚠ '+LEV.boss.name+' • BOS';
      var bb2=$('bossBar');if(bb2)bb2.classList.add('show');
      var bf=$('bossFill');if(bf)bf.style.width='100%';
      bossFillShown=1;
    }}
    if(e&&(e.k==='g'||e.k==='v'))e.y=GY;
  }
}
var bossRef=null,bossFillShown=-1;
function spawnProps(){
  props.length=0;
  for(var i=0;i<LEV.crates.length;i++){
    var c=LEV.crates[i];
    props.push({x:c.x,y:GY,w:24,h:26,t:c.t,item:c.item,hp:c.t==='barrel'?3:5,flash:0,dead:false,vy:0,onGround:true});
  }
}
function showBanner(txt,sub){bannerTxt=txt;bannerSub=sub||'';bannerT=tick;var b=$('banner');b.innerHTML=txt+(sub?'<small>'+sub+'</small>':'');b.classList.add('show')}
function hideBanner(){var b=$('banner');if(b)b.classList.remove('show')}

/* ══════════ PHYSICS ══════════ */
function boxHit(a,b){return a.x-a.w/2<b.x+b.w/2&&a.x+a.w/2>b.x-b.w/2&&a.y-a.h<b.y&&a.y>b.y-b.h}
function collideX(e){
  var s=blockers(),i;
  for(i=0;i<s.length;i++){
    var r=s[i];
    if(e.x+e.w/2>r.x&&e.x-e.w/2<r.x+r.w&&e.y>r.y&&e.y-e.h<r.y+r.h){
      if(e.vx>0||e.x<r.x+r.w/2)e.x=r.x-e.w/2-0.01;else e.x=r.x+r.w+e.w/2+0.01;
      e.vx=0;return true;
    }
  }
  return false;
}
function collideY(e,isPlayer){
  var s=blockers(),i,land=false;
  for(i=0;i<s.length;i++){
    var r=s[i];
    if(e.x+e.w/2>r.x&&e.x-e.w/2<r.x+r.w&&e.y>r.y&&e.y-e.h<r.y+r.h){
      if(e.vy>=0&&e.y-e.vy<=r.y+2){
        e.y=r.y;e.vy=0;land=true;
      }else if(e.vy<0){
        e.y=r.y+r.h+e.h;e.vy=0.4;
      }
    }
  }
  if(land){
    if(!e.onGround&&isPlayer){sfx.land();dust(e.x,e.y,4)}
    e.onGround=true;
  }else if(isPlayer)e.onGround=false;
  return land;
}

/* ══════════ PLAYER ══════════ */
function playerBox(){return{x:P.x,y:P.y,w:P.w,h:P.crouch?17:P.h}}
function updatePlayer(){
  if(P.dead){
    P.deadT--;
    P.vy+=GRAV*0.6;P.y+=P.vy;
    if(P.deadT<=0)respawn();
    return;
  }
  var aAx=input.ax||0,aMag=Math.abs(aAx)<STICK_DEAD?0:Math.min(1,Math.abs(aAx));
  var want=aMag?(aAx<0?-1:1):0;
  var slip=LEV.slip||0;
  if(want!==0){P.face=want;P.vx+=ACC*(1-slip*0.45)*want*(0.3+0.7*aMag);P.anim+=0.35+0.65*aMag}
  else{P.vx*=(P.onGround?FRIC+slip*0.28:0.94);if(P.onGround)P.anim+=0.4}
  /* batas kecepatan ikut tuas: geser sedikit = jalan, geser penuh = lari */
  var vcap=want!==0?MAXVX*(0.34+0.66*aMag):MAXVX;
  P.vx=clamp(P.vx,-vcap,vcap);
  P.crouch=!!(input.down&&P.onGround);
  if(jumpBuf>0)jumpBuf--;
  if(jumpBuf>0&&(P.onGround||coyote>0)){
    P.vy=JUMP;jumpBuf=0;coyote=0;P.onGround=false;sfx.jump();dust(P.x,P.y,5);
  }
  P.vy+= (input.jump&&P.vy<0)?GRAV*0.66:GRAV;
  P.vy=Math.min(P.vy,MAXFALL);
  P.x+=P.vx;collideX(P);
  P.y+=P.vy;collideY(P,true);
  if(P.onGround)coyote=6;else if(coyote>0)coyote--;
  P.x=clamp(P.x,10,LEVEL_W-10);
  if(P.inv>0)P.inv--;
  if(P.cool>0)P.cool--;
  if(P.bcool>0)P.bcool--;
  if(P.muzzle>0)P.muzzle--;
  if(P.recoil>0)P.recoil--;
  if(P.hitTick>0)P.hitTick--;
  if(P.y>VH+50){
    hurtPlayer(LEV.pitDmg||22);
    if(!P.dead){P.y=GY-30;P.vy=0;P.x=nearestCheck();P.inv=Math.max(P.inv,50)}
  }
  if(input.fire&&P.cool<=0)fire();
  if(bombBuf>0){bombBuf--;if(bombBuf>0&&P.bcool<=0&&P.bombs>0){bombBuf=0;throwBomb()}}
  var cp=checkpoint;
  for(var i=LEV.checks.length-1;i>=0;i--){if(P.x>=LEV.checks[i]){cp=LEV.checks[i];break}}
  if(cp!==checkpoint){checkpoint=cp;showBanner('CHECKPOINT','Posisi aman tersimpan')}
}
function nearestCheck(){
  var best=0,i;
  for(i=0;i<LEV.checks.length;i++)if(P.x>=LEV.checks[i]-30)best=LEV.checks[i];
  return best+40;
}
function weaponDef(){return WPN[P.weapon]||WPN.pistol}
function fire(){
  var w=weaponDef();
  if(!w.inf){
    if((P.ammo[P.weapon]||0)<=0){P.weapon='pistol';w=WPN.pistol;sfx.click();}
    else P.ammo[P.weapon]--;
  }
  var mx=P.x+P.face*13,my=P.y-(P.crouch?11:18),i;
  for(i=0;i<w.pellet;i++){
    var a=(Math.random()-0.5)*w.spread;
    bullets.push({x:mx,y:my,vx:Math.cos(a)*w.speed*P.face,vy:Math.sin(a)*w.speed+(w.rocket?0:0),own:'p',dmg:w.dmg,rocket:!!w.rocket,r:w.rocket?3.6:2.1,life:130,smoke:0});
  }
  P.cool=w.cool;P.muzzle=4;P.recoil=4;shots+=w.pellet;
  cam.shake=Math.max(cam.shake,w.shake||0.5);
  sfx[w.snd]();
  if(P.weapon==='R')bullets[bullets.length-1].vy-=0.2;
}
function throwBomb(){
  P.bombs--;P.bcool=20;
  grenades.push({x:P.x+P.face*10,y:P.y-22,vx:P.face*3.5,vy:-4.8,t:0,fuse:82,dmg:28,r:60,own:'p'});
  sfx.click();
}
function dust(x,y,n){
  for(var i=0;i<n;i++)particles.push({x:x+rnd(-6,6),y:y-rnd(0,4),vx:rnd(-.8,.8),vy:rnd(-1.1,-.2),life:ri(12,22),max:22,c:'rgba(216,200,160,',r:rnd(1.4,3),g:0.04});
}
function hurtPlayer(n){
  if(P.dead||P.inv>0||state!=='play')return;
  var d=Math.max(1,Math.round(n*DIF[diff].dmg));
  P.hp-=d;P.inv=64;P.hitTick=12;flashT=10;cam.shake=Math.max(cam.shake,3.4);
  sfx.hurt();
  for(var i=0;i<8;i++)particles.push({x:P.x,y:P.y-16,vx:rnd(-2.4,2.4),vy:rnd(-2.6,.4),life:ri(14,26),max:26,c:'rgba(255,120,90,',r:rnd(1.6,3.2),g:0.14});
  if(P.hp<=0){P.hp=0;killPlayer()}
  hud();
}
function killPlayer(){
  if(P.dead)return;
  P.dead=true;P.deadT=96;P.vy=-4.4;P.vx=0;
  sfx.die();cam.shake=5;
  for(var i=0;i<18;i++)particles.push({x:P.x,y:P.y-14,vx:rnd(-3,3),vy:rnd(-4,-.4),life:ri(22,42),max:42,c:'rgba(255,160,120,',r:rnd(1.8,3.6),g:0.16});
}
function respawn(){
  P.lives--;
  if(P.lives<0){gameOver();return}
  P.dead=false;P.hp=P.maxHp;P.inv=130;P.cool=0;P.bcool=0;P.vy=0;
  P.x=nearestCheck();P.y=GY-30;P.weapon='pistol';P.bombs=Math.min(P.maxBombs,P.bombs+4);
  grenades.length=0;
  showBanner('NYAWA -1','Bangkit kembali, prajurit!');
  hud();
}

/* ══════════ ENEMIES ══════════ */
function enemyShoot(e,spread){
  var ex=e.x,ey=e.y-15,px=P.x,py=P.y-(P.crouch?9:15);
  var a=Math.atan2(py-ey,px-ex)+(Math.random()-0.5)*(spread||0.14);
  var sp=e.k==='tur'?4.1:3.4;
  bullets.push({x:ex+e.face*8,y:ey,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,own:'e',dmg:e.k==='tur'?9:7,r:2.6,life:150});
  sfx.eshoot();
}
function damageEnemy(e,dmg,fromX){
  if(e.dead||e.dying)return;
  e.hp-=dmg;e.flash=6;hits++;
  for(var i=0;i<4;i++)particles.push({x:e.x,y:e.y-16,vx:rnd(-2,2),vy:rnd(-2.4,.2),life:ri(10,20),max:20,c:'rgba(255,214,120,',r:rnd(1.4,2.8),g:0.14});
  if(e.hp<=0)killEnemy(e);
  else sfx.hit();
}
function killEnemy(e){
  if(e.k==='boss'){e.dying=110;e.dead=false;sfx.bigexp();return}
  e.dead=true;e.deadT=26;
  var val=e.k==='g'?100:(e.k==='tur'?200:(e.k==='v'?160:150));
  addScore(val,e.x,e.y-26);
  kills++;
  boom(e.x,e.y-14,e.k==='tur'?34:26,0,'e',false);
  if(e.k==='g'&&Math.random()<0.14)dropPickup(e.x,e.y-20,Math.random()<0.5?'hp':'G');
}
function addScore(v,x,y){score+=v;popups.push({x:x,y:y,txt:'+'+v,life:52,max:52,c:'#ffe08a'})}
function dropPickup(x,y,type){pickups.push({x:x,y:y,vy:-3.4,vx:rnd(-.6,.6),type:type,life:900,onGround:false})}
function updGrunt(e){
  var pcx=P.x,pcy=P.y-15,ad=Math.abs(pcx-e.x),vet=!!e.vet;
  if(e.mark>0)e.mark--;
  if(e.hitCd>0)e.hitCd--;
  if(e.gfire>0)e.gfire--;
  if(!e.alert&&ad<(vet?340:310)&&Math.abs(pcy-(e.y-15))<95){e.alert=true;e.mark=52;sfx.alert()}
  e.vy+=GRAV;e.vy=Math.min(e.vy,MAXFALL);
  if(e.alert){
    e.face=pcx>e.x?1:-1;
    var want=ad>(vet?132:112)?e.face:(ad<(vet?76:66)?-e.face:0);
    e.vx=want*(vet?1.18:0.92)*DIF[diff].rate;
    if(e.vx!==0&&e.onGround&&!solidAt(e.x+sgn(e.vx)*13,e.y+8))e.vx=0;
    if(ad<(vet?420:370)&&los(e.x,e.y-16,pcx,pcy)){
      if(e.burst>0){
        e.burst--;
        if(e.burst%9===0)enemyShoot(e,0.12);
      }else{
        e.fire--;
        if(e.fire<=0){
          e.fire=Math.round(ri(vet?38:44,vet?70:84)*DIF[diff].rate);
          enemyShoot(e,vet?0.12:0.2);
          if(vet)e.burst=18;
        }
      }
    }
    if(vet&&e.gfire<=0&&ad>100&&ad<330&&e.onGround&&los(e.x,e.y-16,pcx,pcy)){
      e.gfire=Math.round(ri(150,260)*DIF[diff].rate);
      var pxg=pcx+(P.vx*26);
      bullets.push({x:e.x+8*e.face,y:e.y-26,vx:clamp((pxg-e.x)/46,-4,4),vy:-5.2,own:'e',dmg:13,r:3.8,life:230,shell:true,g:0.22});
      sfx.eshoot();
    }
    if(ad<28&&e.hitCd<=0){hurtPlayer(vet?12:9);e.hitCd=44}
  }else{
    if(!solidAt(e.x+e.dir*13,e.y+8)||solidAt(e.x+e.dir*13,e.y-12))e.dir*=-1;
    e.vx=e.dir*0.5*DIF[diff].rate;
  }
  if(e.vx!==0)e.anim+=1;
  e.x+=e.vx;collideX(e);
  e.y+=e.vy;
  if(!collideY(e,false))e.onGround=false;
  if(e.y>VH+60){e.dead=true;e.deadT=0}
}
function updTurret(e){
  var pcx=P.x,pcy=P.y-15,ad=Math.abs(pcx-e.x);
  e.face=pcx>e.x?1:-1;
  var ta=Math.atan2(pcy-(e.y-20),pcx-e.x);
  var d=ta-e.aim;while(d>3.14)d-=6.28;while(d<-3.14)d+=6.28;
  e.aim+=clamp(d,-0.06,0.06);
  if(e.burst>0){
    e.burst--;
    if(e.burst%6===0){
      var sp=4.2;
      bullets.push({x:e.x+Math.cos(e.aim)*16,y:e.y-20+Math.sin(e.aim)*16,vx:Math.cos(e.aim)*sp,vy:Math.sin(e.aim)*sp,own:'e',dmg:9,r:2.8,life:150});
      sfx.eshoot();
    }
  }else if(ad<350&&los(e.x,e.y-20,pcx,pcy)){
    e.fire--;
    if(e.fire<=0){e.fire=Math.round(ri(70,110)*DIF[diff].rate);e.burst=19}
  }
}
function updDrone(e){
  e.ph+=0.06;
  var tx=clamp(P.x,e.home-130,e.home+130);
  e.vx=clamp((tx-e.x)*0.02,-0.9,0.9);
  e.x+=e.vx;
  e.y=e.baseY+Math.sin(e.ph)*11;
  var ad=Math.abs(P.x-e.x);
  e.fire--;
  if(e.fire<=0&&ad<62&&e.y<P.y-30){
    e.fire=Math.round(ri(80,130)*DIF[diff].rate);
    bullets.push({x:e.x,y:e.y+10,vx:0,vy:2.6,own:'e',dmg:11,r:3.4,life:200,bomb:true});
  }else if(e.fire<=0)e.fire=24;
}
function updBoss(e){
  var pcx=P.x,ad=Math.abs(pcx-e.x);
  if(e.dying>0){
    e.dying--;
    if(e.dying%14===0){boom(e.x+rnd(-56,56),e.y-rnd(10,80),rnd(26,44),0,'e',true);cam.shake=5}
    if(e.dying<=0){
      e.dead=true;e.deadT=0;score+=5000;
      popups.push({x:e.x,y:e.y-70,txt:'+5000',life:120,max:120,c:'#ffd166'});
      victory();
    }
    return;
  }
  e.face=pcx>e.x?1:-1;
  var target=clamp(P.x-150*e.face,LEV.boss.arena[0],LEV.boss.arena[1]);
  e.x+=clamp((target-e.x)*0.012,-0.62,0.62);
  var hpR=e.hp/e.maxhp;
  if(hpR<0.5){e.smoke--;if(e.smoke<=0){e.smoke=6;particles.push({x:e.x+rnd(-40,40),y:e.y-rnd(30,70),vx:rnd(-.4,.4),vy:rnd(-.9,-.3),life:ri(28,48),max:48,c:'rgba(60,60,60,',r:rnd(4,9),g:-0.01})}}
  e.cyc--;
  if(e.cyc<=0){
    e.cyc=hpR>0.6?96:(hpR>0.3?76:56);
    var rot=LEV.boss.rot||[3,4];
    e.atk=(e.atk+1)%(hpR>0.34?rot[0]:rot[1]);
    var raw=e.atk;
    if(raw===0){
      var i;
      for(i=0;i<3;i++)(function(k){
        later(k*18,function(){
          if(e.dead)return;
          var px=P.x+(P.vx*22);
          var vx=clamp((px-(e.x+40*e.face))/40,-4.4,4.4);
          bullets.push({x:e.x+40*e.face,y:e.y-70,vx:vx,vy:-6.2,own:'e',dmg:16,r:4.4,life:220,shell:true,g:0.24});
          sfx.eshoot();
        });
      })(i);
    }else if(raw===1){
      var j;
      for(j=0;j<9;j++)(function(k){
        later(k*4,function(){
          if(e.dead)return;
          var px2=P.x,py2=P.y-15,ey=e.y-64;
          var a=Math.atan2(py2-ey,px2-(e.x+50*e.face))+(Math.random()-0.5)*0.14;
          bullets.push({x:e.x+50*e.face,y:ey,vx:Math.cos(a)*5.4,vy:Math.sin(a)*5.4,own:'e',dmg:7,r:2.6,life:160});
          sfx.eshoot();
        });
      })(j);
    }else if(raw===2){
      var mk=LEV.boss.minion||'g',alive=0;
      for(var q=0;q<enemies.length;q++)if(enemies[q].k===mk&&!enemies[q].dead)alive++;
      if(alive<4){
        later(10,function(){
          var a1=makeEnemy(mk,clamp(e.x-70,40,LEVEL_W-60)),a2=makeEnemy(mk,clamp(e.x+70,40,LEVEL_W-60));
          enemies.push(a1);enemies.push(a2);
          showBanner('TENTARA CADANGAN','Musuh memanggil bala bantuan');
        });
      }
    }else{
      var salvo=e.kind==='walker'?3:1;
      for(var s=0;s<salvo;s++)(function(k){
        later(6+k*11,function(){
          if(e.dead)return;
          var px3=P.x,py3=P.y-15,ey2=e.y-56;
          var a2=Math.atan2(py3-ey2,px3-e.x)+(e.kind==='walker'?(k-1)*0.14:0);
          bullets.push({x:e.x+26*e.face,y:ey2,vx:Math.cos(a2)*6.2,vy:Math.sin(a2)*6.2,own:'e',dmg:e.kind==='walker'?12:14,r:4,life:170,rocket:true});
          sfx.rocket();
        });
      })(s);
    }
  }
  if(ad<70&&P.hitTick<=0)hurtPlayer(14);
}
function updateEnemies(){
  var i;
  for(i=enemies.length-1;i>=0;i--){
    var e=enemies[i];
    if(e.flash>0)e.flash--;
    if(e.dead){e.deadT--;if(e.deadT<=0){enemies.splice(i,1);if(e===bossRef)bossRef=null}continue}
    if(e.k==='g'||e.k==='v')updGrunt(e);
    else if(e.k==='tur')updTurret(e);
    else if(e.k==='d')updDrone(e);
    else if(e.k==='boss')updBoss(e);
  }
}

/* ══════════ BULLETS / EXPLOSIONS ══════════ */
function updateBullets(){
  var i,j;
  for(i=bullets.length-1;i>=0;i--){
    var b=bullets[i];
    if(b.shell){b.vy+=b.g;b.vx*=0.992}
    b.x+=b.vx;b.y+=b.vy;b.life--;
    if(b.rocket||b.shell){
      b.smoke++;
      if(b.smoke%2===0)particles.push({x:b.x,y:b.y,vx:rnd(-.4,.4),vy:rnd(-.4,0),life:ri(10,20),max:20,c:'rgba(180,180,180,',r:rnd(1.6,3),g:-0.02});
    }
    var gone=b.life<=0||b.x<cam.x-60||b.x>cam.x+VW+60||b.y<-80||b.y>VH+80;
    var sol=blockers();
    if(!gone){
      for(j=0;j<sol.length;j++){
        var s=sol[j];
        if(b.x>s.x&&b.x<s.x+s.w&&b.y>s.y&&b.y<s.y+s.h){
          if(b.rocket||b.shell)boom(b.x,b.y,b.rocket?40:30,b.rocket?22:16,'p',false);
          else{
            for(var k=0;k<4;k++)particles.push({x:b.x,y:b.y,vx:rnd(-2,2),vy:rnd(-2,.4),life:ri(8,16),max:16,c:'rgba(255,220,140,',r:rnd(1.2,2.4),g:0.1});
          }
          gone=true;break;
        }
      }
    }
    if(!gone&&b.own==='p'){
      for(j=0;j<enemies.length;j++){
        var e=enemies[j];
        if(e.dead||e.dying)continue;
        var bw=e.w,bh=e.h;
        if(b.x>e.x-bw/2&&b.x<e.x+bw/2&&b.y>e.y-bh&&b.y<e.y){
          if(b.rocket)boom(b.x,b.y,42,24,'p',false);else damageEnemy(e,b.dmg,e.x);
          gone=true;break;
        }
      }
      if(!gone){
        for(j=0;j<props.length;j++){
          var pr=props[j];
          if(pr.dead)continue;
          if(b.x>pr.x-pr.w/2&&b.x<pr.x+pr.w/2&&b.y>pr.y-pr.h&&b.y<pr.y){
            hurtProp(pr,b.rocket?6:b.dmg);
            if(b.rocket)boom(b.x,b.y,40,20,'p',false);
            gone=true;break;
          }
        }
      }
    }else if(!gone&&b.own==='e'){
      var pb=playerBox();
      if(b.x>pb.x-pb.w/2&&b.x<pb.x+pb.w/2&&b.y>pb.y-pb.h&&b.y<pb.y){
        if(b.rocket||b.shell)boom(b.x,b.y,b.rocket?40:30,0,'e',false);
        hurtPlayer(b.dmg);gone=true;
      }
    }
    if(gone)bullets.splice(i,1);
  }
}
function boom(x,y,r,dmg,who,big){
  explosions.push({x:x,y:y,r:2,mr:r,t:0,max:big?32:22,big:!!big});
  cam.shake=Math.max(cam.shake,big?7:4.2);
  if(big)sfx.bigexp();else sfx.exp();
  var n=LOW?(big?12:7):(big?22:13),i;
  for(i=0;i<n;i++){
    var a=Math.random()*6.28,s=rnd(.8,3.4);
    particles.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-rnd(.6,2),life:ri(14,34),max:34,c:'rgba(255,'+(150+ri(0,80))+','+ri(30,90)+',',r:rnd(1.6,3.6),g:0.16});
  }
  for(i=0;i<(big?8:4);i++)particles.push({x:x+rnd(-6,6),y:y+rnd(-6,6),vx:rnd(-.8,.8),vy:rnd(-1.6,-.4),life:ri(24,46),max:46,c:'rgba(120,110,100,',r:rnd(3,7),g:-0.02});
  if(dmg){
    for(i=0;i<enemies.length;i++){
      var e=enemies[i];
      if(e.dead||e.dying)continue;
      var d=Math.hypot(e.x-x,e.y-16-y);
      if(d<r+e.w/2)damageEnemy(e,Math.max(2,Math.round(dmg*(1-d/(r+e.w/2)))),x);
    }
    for(i=0;i<props.length;i++){
      var pr=props[i];
      if(pr.dead)continue;
      if(Math.hypot(pr.x-x,pr.y-13-y)<r)hurtProp(pr,dmg>16?6:4);
    }
  }
}
function hurtProp(pr,dmg){
  if(pr.t==='barrel'){
    pr.hp-=dmg;
    if(pr.hp<=0){pr.dead=true;addScore(50,pr.x,pr.y-20);kills++;boom(pr.x,pr.y-12,58,26,'p',true)}
    else{pr.flash=5;sfx.hit()}
  }else{
    pr.hp-=dmg;pr.flash=5;
    if(pr.hp<=0){
      pr.dead=true;addScore(20,pr.x,pr.y-20);sfx.crate();
      for(var i=0;i<8;i++)particles.push({x:pr.x,y:pr.y-12,vx:rnd(-2.4,2.4),vy:rnd(-2.6,.4),life:ri(14,28),max:28,c:'rgba(190,150,90,',r:rnd(1.6,3.4),g:0.18});
      if(pr.item)dropPickup(pr.x,pr.y-16,pr.item);
    }else sfx.hit();
  }
  hud();
}
function updateGrenades(){
  var i,j;
  for(i=grenades.length-1;i>=0;i--){
    var g=grenades[i];
    g.vy+=0.34;g.x+=g.vx;g.y+=g.vy;g.t++;
    if(g.y>GY-6&&g.vy>0){g.y=GY-6;g.vy*=-0.42;g.vx*=0.7}
    if(g.t%3===0)particles.push({x:g.x,y:g.y,vx:rnd(-.3,.3),vy:rnd(-.5,0),life:12,max:12,c:'rgba(150,150,150,',r:1.6,g:-0.02});
    if(g.t>=g.fuse){
      boom(g.x,g.y,g.r,g.dmg,g.own,true);
      grenades.splice(i,1);
    }
  }
  for(i=explosions.length-1;i>=0;i--){
    var ex=explosions[i];
    ex.t++;ex.r=ex.mr*(1-Math.pow(1-ex.t/ex.max,2));
    if(ex.t>=ex.max)explosions.splice(i,1);
  }
  for(i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life--;
    if(p.life<=0)particles.splice(i,1);
  }
  for(i=popups.length-1;i>=0;i--){
    popups[i].y-=0.55;popups[i].life--;
    if(popups[i].life<=0)popups.splice(i,1);
  }
}
function updatePickups(){
  var i;
  for(i=pickups.length-1;i>=0;i--){
    var pk=pickups[i];
    pk.vy+=0.34;pk.y+=pk.vy;pk.x+=pk.vx||0;pk.life--;
    if(pk.y>GY-8&&pk.vy>0){pk.y=GY-8;pk.vy*=-0.42;pk.vx*=0.6}
    else if(pk.y>GY+30)pk.life=0;
    var pb=playerBox();
    if(pk.x>pb.x-pb.w/2-10&&pk.x<pb.x+pb.w/2+10&&pk.y>pb.y-pb.h-14&&pk.y<pb.y+6){
      collect(pk.type,pk.x,pk.y);pickups.splice(i,1);continue;
    }
    if(pk.life<=0)pickups.splice(i,1);
  }
}
function collect(t,x,y){
  sfx.pickup();
  if(t==='hp'){P.hp=Math.min(P.maxHp,P.hp+35);popups.push({x:x,y:y-10,txt:'+35 HP',life:52,max:52,c:'#9be07a'})}
  else if(t==='G'){P.bombs=Math.min(P.maxBombs,P.bombs+8);popups.push({x:x,y:y-10,txt:'+8 BOM',life:52,max:52,c:'#ffd166'})}
  else{
    P.weapon=t;
    P.ammo[t]= t==='H'?220:(t==='S'?60:12);
    popups.push({x:x,y:y-10,txt:WPN[t].n,life:60,max:60,c:'#ffe08a'});
  }
  for(var i=0;i<10;i++)particles.push({x:x,y:y,vx:rnd(-2,2),vy:rnd(-2.6,-.2),life:ri(14,28),max:28,c:'rgba(255,230,150,',r:rnd(1.6,3),g:0.12});
  addScore(25,x,y-14);
  hud();
}
function updateWaves(){
  var i;
  for(i=0;i<LEV.waves.length;i++){
    if(!LEV.waves[i].done&&cam.x+VW*0.92>=LEV.waves[i].t)spawnWave(LEV.waves[i]);
  }
}
function updateCamera(){
  var target=clamp(P.x-VW*0.42,0,LEVEL_W-VW);
  cam.x+=(target-cam.x)*0.13;
}
function updateProps(){
  for(var i=0;i<props.length;i++)if(props[i].flash>0)props[i].flash--;
}

/* ══════════ DRAW ══════════ */
function drawSoldX(spr,x,y,face,scale){
  var w=spr.width/SS,h=spr.height/SS;
  ctx.save();
  ctx.translate(Math.round(x),Math.round(y));
  if(face<0)ctx.scale(-1,1);
  ctx.scale(scale||1,scale||1);
  ctx.drawImage(spr,-w*0.42,-h, w,h);
  ctx.restore();
}
function drawPlayerSprite(){
  if(P.dead&&P.deadT<=0)return;
  var s;
  if(P.dead)s=SPR.p.hurt;
  else if(P.hitTick>0&&P.hitTick%6<3)s=SPR.p.hurt;
  else if(P.crouch)s=SPR.p.crouch;
  else if(!P.onGround)s=(P.vy<0?SPR.p.jump:SPR.p.fall);
  else if(Math.abs(P.vx)>0.35){
    var f=Math.floor(P.anim/5)%4;
    s=[SPR.p.run1,SPR.p.run2,SPR.p.run3,SPR.p.run4][f];
  }else s=SPR.p.idle;
  if(P.inv>0&&P.inv%8<4&&!P.dead)ctx.globalAlpha=0.55;
  drawSoldX(s,P.x,P.y+1,P.face,1);
  ctx.globalAlpha=1;
  if(P.muzzle>0&&!P.crouch){
    var mx=P.x+P.face*17,my=P.y-19;
    ctx.save();ctx.translate(mx,my);ctx.rotate(P.face<0?3.14:0);
    var g=ctx.createRadialGradient(0,0,0,0,0,13);
    g.addColorStop(0,'rgba(255,255,220,.95)');g.addColorStop(.4,'rgba(255,205,90,.75)');g.addColorStop(1,'rgba(255,150,40,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,13,0,6.3);ctx.fill();
    ctx.fillStyle='rgba(255,236,170,.9)';
    ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(13,0);ctx.lineTo(0,4);ctx.closePath();ctx.fill();
    ctx.restore();
  }
}
function drawEnemy(e){
  if(e.dead&&e.deadT<=0)return;
  ctx.save();
  if(e.flash>0&&e.flash%4<2)ctx.globalAlpha=0.85;
  if(e.k==='g'||e.k==='v'){
    var pack=e.vet?SPR.ev:SPR.e,s;
    if(e.dead)s=pack.fall;
    else if(!e.onGround)s=(e.vy<0?pack.jump:pack.fall);
    else if(Math.abs(e.vx)>0.1){var f=Math.floor(e.anim/6)%4;s=[pack.run1,pack.run2,pack.run3,pack.run4][f]}
    else s=pack.idle;
    if(e.dead){ctx.globalAlpha=0.6;drawSoldX(s,e.x,e.y+2,e.face,1);ctx.restore();return}
    drawSoldX(s,e.x,e.y+1,e.face,1);
    if(e.mark>0){
      ctx.fillStyle='rgba(255,90,60,.95)';ctx.font='900 15px system-ui';ctx.textAlign='center';
      ctx.fillText('!',e.x,e.y-33-Math.sin(e.mark/4)*2);ctx.textAlign='left';
    }
  }else if(e.k==='tur'){
    var w=SPR.turret.width/SS,h=SPR.turret.height/SS;
    ctx.save();ctx.translate(e.x,e.y);ctx.scale(e.face<0?-1:1,1);
    ctx.drawImage(SPR.turret,-w/2,-h+1,w,h);
    ctx.save();ctx.translate(0,-h+7);ctx.rotate(e.face<0?3.14-e.aim:-e.aim);
    ctx.fillStyle='#39432f';rr(ctx,0,-2.4,22,5,2);ctx.fill();
    ctx.fillStyle='#5d6b4c';rr(ctx,0,-2.4,22,2,1);ctx.fill();
    ctx.fillStyle='#20261a';rr(ctx,18,-3.2,5,6.4,1.6);ctx.fill();
    ctx.restore();
    ctx.restore();
  }else if(e.k==='d'){
    var w2=SPR.drone.width/SS,h2=SPR.drone.height/SS;
    ctx.save();ctx.translate(e.x,e.y);
    var sw=Math.sin(tick*0.9)*6;
    ctx.fillStyle='rgba(200,210,215,.20)';ctx.beginPath();ctx.ellipse(-11,-6,11,1.8,0,0,6.3);ctx.fill();
    ctx.beginPath();ctx.ellipse(11,-6,11,1.8,0,0,6.3);ctx.fill();
    ctx.fillStyle='rgba(255,80,60,.5)';ctx.beginPath();ctx.arc(0,14,3,0,6.3);ctx.fill();
    ctx.drawImage(SPR.drone,-w2/2,-h2/2,w2,h2);
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(-2+sw*0.6,-9,4,3);
    ctx.restore();
  }else if(e.k==='boss'){
    drawBoss(e);
  }
  ctx.restore();
  if((e.k==='g'||e.k==='v'||e.k==='tur'||e.k==='d')&&!e.dead&&e.hp<e.maxhp){
    var bw=Math.max(20,e.w),pct=clamp(e.hp/e.maxhp,0,1);
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(e.x-bw/2,e.y-e.h-9,bw,3.4);
    ctx.fillStyle=pct>0.5?'#8fda6a':(pct>0.25?'#ffd166':'#e2543f');
    ctx.fillRect(e.x-bw/2,e.y-e.h-9,bw*pct,3.4);
  }
}
function drawWalker(e){
  var bp=art().bossPal||DEFAULT_BOSS_PAL,y=e.y,i;
  ctx.save();
  ctx.translate(e.x,y);
  if(e.face<0)ctx.scale(-1,1);
  if(e.flash>0&&e.flash%4<2)ctx.globalAlpha=0.8;
  if(e.dying>0&&e.dying%8<4)ctx.globalAlpha=0.5;
  ctx.fillStyle='#070b06';ctx.beginPath();ctx.ellipse(0,2,72,9,0,0,6.3);ctx.fill();
  var legs=[[-40,-52],[-6,-58],[32,-50]];
  for(i=0;i<3;i++){
    var bx=legs[i][0],by=legs[i][1],ph=Math.sin(tick*0.11+i*1.2)*6;
    ctx.strokeStyle=shade(bp.tread,-6);ctx.lineWidth=8;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-24,-by*0.5+ph*0.5);ctx.lineTo(bx-34,0);ctx.stroke();
    ctx.strokeStyle=shade(bp.tread,20);ctx.lineWidth=4.6;
    ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx-22,-by*0.5+ph*0.5);ctx.lineTo(bx-32,-1);ctx.stroke();
    ctx.fillStyle=shade(bp.tread,34);ctx.beginPath();ctx.arc(bx,by,4,0,6.3);ctx.fill();
  }
  var g=ctx.createLinearGradient(0,-78,0,-16);
  g.addColorStop(0,shade(bp.hull,28));g.addColorStop(.42,shade(bp.hull,-4));g.addColorStop(1,shade(bp.hull,-32));
  ctx.fillStyle=g;rr(ctx,-56,-76,112,62,20);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-28);rr(ctx,-48,-70,96,20,9);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-16);rr(ctx,-14,-40,34,26,9);ctx.fill();
  var eg=ctx.createRadialGradient(4,-56,0,4,-56,20);
  eg.addColorStop(0,rgba(bp.glass,.95));eg.addColorStop(.4,rgba(bp.eye,.62));eg.addColorStop(1,rgba(bp.eye,0));
  ctx.fillStyle=eg;ctx.beginPath();ctx.arc(4,-56,20,0,6.3);ctx.fill();
  ctx.fillStyle=bp.eye;ctx.beginPath();ctx.arc(4,-56,6+Math.sin(tick/7)*1.2,0,6.3);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-40);ctx.beginPath();ctx.arc(4,-56,2.6,0,6.3);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-8);rr(ctx,34,-62,30,12,5);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-30);rr(ctx,56,-60,10,8,3);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-8);rr(ctx,34,-40,30,12,5);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-30);rr(ctx,56,-38,10,8,3);ctx.fill();
  ctx.fillStyle=bp.trim;rr(ctx,-56,-26,112,8,4);ctx.fill();
  ctx.fillStyle=shade(bp.trim,44);ctx.fillRect(-52,-25,104,2.2);
  if(e.dying>0){
    ctx.fillStyle='rgba(190,255,190,'+(0.28+0.4*Math.abs(Math.sin(tick/4)))+')';
    rr(ctx,-56,-76,112,62,20);ctx.fill();
  }
  ctx.restore();
  if(e.dying<=0){
    var pct=clamp(e.hp/e.maxhp,0,1);
    if(bossFillShown!==pct){bossFillShown=pct;var fill=$('bossFill');if(fill)fill.style.width=(pct*100).toFixed(1)+'%'}
  }
}
function drawBoss(e){
  if(e.kind==='walker'){drawWalker(e);return}
  var bp=art().bossPal||DEFAULT_BOSS_PAL,y=e.y;
  ctx.save();
  ctx.translate(e.x,y);
  if(e.face<0)ctx.scale(-1,1);
  if(e.flash>0&&e.flash%4<2)ctx.globalAlpha=0.8;
  if(e.dying>0&&e.dying%8<4)ctx.globalAlpha=0.5;
  ctx.fillStyle='#11170d';ctx.beginPath();ctx.ellipse(0,2,74,10,0,0,6.3);ctx.fill();
  var tg=ctx.createLinearGradient(0,-18,0,0);
  tg.addColorStop(0,shade(bp.tread,18));tg.addColorStop(1,shade(bp.tread,-22));
  ctx.fillStyle=tg;
  rr(ctx,-70,-16,140,16,7);ctx.fill();
  ctx.fillStyle=shade(bp.tread,-30);
  for(var i=0;i<9;i++){
    var off=(tick*1.6+i*15)%140;
    ctx.beginPath();ctx.arc(-70+off,-8,3.4,0,6.3);ctx.fill();
  }
  var g=ctx.createLinearGradient(0,-88,0,-14);
  g.addColorStop(0,shade(bp.hull,26));g.addColorStop(.45,shade(bp.hull,-4));g.addColorStop(1,shade(bp.hull,-32));
  ctx.fillStyle=g;
  rr(ctx,-66,-84,132,70,12);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-28);rr(ctx,-58,-78,116,20,7);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-16);rr(ctx,-58,-52,74,36,8);ctx.fill();
  ctx.fillStyle=bp.glass;rr(ctx,-50,-46,56,14,5);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.24)';rr(ctx,-50,-46,56,5,2.4);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-34);rr(ctx,-44,-28,44,8,3);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-10);rr(ctx,26,-76,32,50,7);ctx.fill();
  ctx.fillStyle=shade(bp.hull,-26);rr(ctx,32,-70,22,12,4);ctx.fill();
  ctx.fillStyle=bp.eye;ctx.beginPath();ctx.arc(43,-64,5.4,0,6.3);ctx.fill();
  ctx.fillStyle=rgba(bp.eye,.55);ctx.beginPath();ctx.arc(43,-64,9+Math.sin(tick/6)*1.6,0,6.3);ctx.fill();
  ctx.fillStyle=bp.trim;rr(ctx,-66,-30,132,9,4);ctx.fill();
  ctx.fillStyle=shade(bp.trim,44);ctx.fillRect(-62,-29,124,2.4);
  if(e.dying>0){
    ctx.fillStyle='rgba(255,200,120,'+(0.3+0.4*Math.abs(Math.sin(tick/4)))+')';
    rr(ctx,-66,-84,132,70,12);ctx.fill();
  }
  ctx.restore();
  if(e.dying<=0){
    var pct=clamp(e.hp/e.maxhp,0,1);
    if(bossFillShown!==pct){bossFillShown=pct;var fill=$('bossFill');if(fill)fill.style.width=(pct*100).toFixed(1)+'%'}
  }
}
function drawProps(){
  var i;
  for(i=0;i<props.length;i++){
    var pr=props[i];
    if(pr.dead)continue;
    var spr=pr.t==='barrel'?SPR.barrel:SPR.crate;
    var w=spr.width/SS,h=spr.height/SS;
    if(pr.flash>0&&pr.flash%4<2)ctx.globalAlpha=0.7;
    ctx.fillStyle='rgba(0,0,0,.34)';
    ctx.beginPath();ctx.ellipse(pr.x,pr.y-1,w*0.44,3.4,0,0,6.3);ctx.fill();
    ctx.drawImage(spr,pr.x-w/2,pr.y-h,w,h);
    ctx.globalAlpha=1;
  }
  for(i=0;i<pickups.length;i++){
    var pk=pickups[i];
    var spr2=SPR.pk[pk.type]||SPR.pk.hp;
    var w2=spr2.width/SS,h2=spr2.height/SS;
    var bob=Math.sin(tick/9)*2;
    ctx.save();
    ctx.globalAlpha=(pk.life<120&&pk.life%8<4)?0.4:1;
    ctx.fillStyle='rgba(255,225,150,.18)';
    ctx.beginPath();ctx.arc(pk.x,pk.y-10+bob,14,0,6.3);ctx.fill();
    ctx.drawImage(spr2,pk.x-w2/2,pk.y-10-h2/2+bob,w2,h2);
    ctx.restore();
  }
}
var groundPat=null,groundPatFor=-1;
function drawTerrain(){
  var i,A=art();
  if(!groundPat||groundPatFor!==mission){groundPat=ctx.createPattern(A.ground,'repeat');groundPatFor=mission}
  for(i=0;i<LEV.segs.length;i++){
    var s=LEV.segs[i];
    ctx.fillStyle=groundPat;
    ctx.save();ctx.translate(s.x,GY);
    ctx.fillRect(0,0,s.w,VH-GY+40);
    ctx.restore();
    ctx.fillStyle=A.top;ctx.fillRect(s.x,GY-2,s.w,4);
    ctx.fillStyle=A.top2;ctx.fillRect(s.x,GY-2,s.w,1.6);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(s.x,GY+2,s.w,2);
  }
  if(LEV.hazard==='lava'){
    for(i=0;i<LEV.segs.length-1;i++){
      var gx=LEV.segs[i].x+LEV.segs[i].w,gw=LEV.segs[i+1].x-gx;
      var lv=ctx.createLinearGradient(0,GY+14,0,VH);
      lv.addColorStop(0,'rgba(255,196,70,.96)');lv.addColorStop(.38,'rgba(255,122,20,.92)');lv.addColorStop(1,'rgba(140,22,10,.95)');
      ctx.fillStyle=lv;ctx.fillRect(gx,GY+14,gw,VH-GY);
      ctx.fillStyle='rgba(255,236,150,'+(0.3+0.22*Math.abs(Math.sin(tick/12)))+')';
      ctx.fillRect(gx-2,GY+12,gw+4,4);
    }
  }
  for(i=0;i<LEV.plaf.length;i++){
    var p=LEV.plaf[i];
    var g=ctx.createLinearGradient(0,p.y,0,p.y+10);
    g.addColorStop(0,'#6f7a5c');g.addColorStop(.4,'#4a543a');g.addColorStop(1,'#242c18');
    ctx.fillStyle=g;rr(ctx,p.x,p.y,p.w,10,3);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.18)';rr(ctx,p.x+1,p.y+1,p.w-2,2.4,1.2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(p.x+3,p.y+10,p.w-6,2.6);
    ctx.fillStyle='#8c9a70';
    ctx.fillRect(p.x+4,p.y+4,2,2);ctx.fillRect(p.x+p.w-6,p.y+4,2,2);
  }
  for(i=0;i<BUSHES.length;i++){
    var b=BUSHES[i];
    ctx.fillStyle=A.bush;
    ctx.beginPath();ctx.arc(b.x,GY+2,b.r,3.14,6.3);ctx.fill();
  }
}
function drawBg(){
  var A=art(),i;
  ctx.drawImage(A.sky,0,0,VW,VH);
  for(i=0;i<3;i++){
    var cx=(i*230+ -cam.x*0.06)%700-100;
    ctx.globalAlpha=0.75;
    ctx.drawImage(A.cloud,cx,26+i*22,150,42);
    ctx.globalAlpha=1;
  }
  var fx=-(cam.x*0.16)%1200;
  for(i=0;i<2;i++)ctx.drawImage(A.far,fx+i*1200,VH-170,1200,170);
  var tx=-(cam.x*0.5),t;
  for(i=0;i<LEV.treeLine.length;i++){
    t=LEV.treeLine[i]-tx;
    if(t>-110&&t<VW+40)ctx.drawImage(A.tree,t,GY-146,96,150);
  }
  var mx=-(cam.x*0.34)%900;
  for(i=0;i<2;i++)ctx.drawImage(A.mid,mx+i*900,VH-150,900,150);
}
function drawFx(){
  var i;
  ctx.save();
  for(i=0;i<explosions.length;i++){
    var e=explosions[i],k=e.t/e.max;
    var a=1-k;
    ctx.globalAlpha=a*0.9;
    var g=ctx.createRadialGradient(e.x,e.y,0,e.x,e.y,Math.max(2,e.r));
    g.addColorStop(0,'rgba(255,255,220,'+(a*0.95)+')');
    g.addColorStop(.35,'rgba(255,196,80,'+(a*0.8)+')');
    g.addColorStop(.7,'rgba(226,84,63,'+(a*0.6)+')');
    g.addColorStop(1,'rgba(120,40,20,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(e.x,e.y,Math.max(2,e.r),0,6.3);ctx.fill();
    ctx.strokeStyle='rgba(255,240,200,'+(a*0.5)+')';ctx.lineWidth=1.6;
    ctx.beginPath();ctx.arc(e.x,e.y,e.r*1.05,0,6.3);ctx.stroke();
  }
  ctx.globalAlpha=1;
  for(i=0;i<particles.length;i++){
    var p=particles[i];
    ctx.globalAlpha=clamp(p.life/p.max,0,1);
    ctx.fillStyle=p.c+clamp(p.life/p.max,0,1)+')';
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.3);ctx.fill();
  }
  ctx.globalAlpha=1;
  ctx.restore();
  for(i=0;i<bullets.length;i++){
    var b=bullets[i];
    if(b.own==='p'){
      if(b.rocket){
        ctx.fillStyle='rgba(255,190,90,.9)';
        ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx));
        rr(ctx,-5,-3.2,11,6.4,3);ctx.fill();
        ctx.fillStyle='#3a3f36';rr(ctx,-9,-2.4,7,4.8,2);ctx.fill();
        ctx.restore();
      }else{
        var g2=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,7);
        g2.addColorStop(0,'rgba(255,255,210,.85)');g2.addColorStop(1,'rgba(255,200,80,0)');
        ctx.fillStyle=g2;ctx.beginPath();ctx.arc(b.x,b.y,7,0,6.3);ctx.fill();
        ctx.fillStyle='#fff3c4';
        ctx.beginPath();ctx.ellipse(b.x,b.y,4.4,1.9,Math.atan2(b.vy,b.vx),0,6.3);ctx.fill();
      }
    }else{
      if(b.shell){
        ctx.fillStyle='#2b2f26';ctx.beginPath();ctx.arc(b.x,b.y,4.4,0,6.3);ctx.fill();
        ctx.fillStyle='#e2543f';ctx.beginPath();ctx.arc(b.x-1,b.y-1,2,0,6.3);ctx.fill();
      }else{
        var g3=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,8);
        g3.addColorStop(0,'rgba(255,170,140,.9)');g3.addColorStop(1,'rgba(226,84,63,0)');
        ctx.fillStyle=g3;ctx.beginPath();ctx.arc(b.x,b.y,8,0,6.3);ctx.fill();
        ctx.fillStyle='#ffd0c0';ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.62,0,6.3);ctx.fill();
      }
    }
  }
  for(i=0;i<grenades.length;i++){
    var gr=grenades[i];
    ctx.fillStyle='#4c5a34';ctx.beginPath();ctx.arc(gr.x,gr.y,3.6,0,6.3);ctx.fill();
    ctx.fillStyle='#8fae4d';ctx.beginPath();ctx.arc(gr.x-1,gr.y-1,1.5,0,6.3);ctx.fill();
  }
}
function drawPopups(){
  var i;
  ctx.textAlign='center';
  for(i=0;i<popups.length;i++){
    var p=popups[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.font='900 13px system-ui,sans-serif';
    ctx.lineWidth=3.4;ctx.strokeStyle='rgba(5,10,3,.85)';
    ctx.strokeText(p.txt,p.x,p.y);
    ctx.fillStyle=p.c;ctx.fillText(p.txt,p.x,p.y);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}
function draw(){
  ctx.setTransform(PX,0,0,PX,0,0);
  ctx.clearRect(0,0,VW,VH);
  drawBg();
  ctx.save();
  var sx=0,sy=0;
  if(cam.shake>0.2&&!REDUCED){sx=(Math.random()-0.5)*cam.shake*2;sy=(Math.random()-0.5)*cam.shake*2}
  ctx.translate(-Math.round(cam.x)+sx,Math.round(sy));
  drawTerrain();
  drawProps();
  drawEnemyList();
  drawPlayerSprite();
  drawFx();
  drawPopups();
  ctx.restore();
  if(vig){ctx.globalAlpha=0.85;ctx.drawImage(vig,0,0,VW,VH);ctx.globalAlpha=1}
  if(flashT>0){
    ctx.fillStyle='rgba(226,84,63,'+(flashT/16)+')';
    ctx.fillRect(0,0,VW,VH);
  }
  if(state==='play'||state==='pause'){
    ctx.fillStyle='rgba(255,255,255,.75)';ctx.font='900 8px system-ui';
    ctx.fillText('MISSION 1 • IRON SHORE',9,14);
    ctx.fillStyle='rgba(255,255,255,.42)';ctx.font='700 8px system-ui';
    ctx.fillText('TARGET: HANCURKAN BOS DI UJUNG PANTAI',9,25);
  }
}
function drawEnemyList(){
  var order=[],i;
  for(i=0;i<enemies.length;i++){
    var e=enemies[i];
    if(e.x<cam.x-80||e.x>cam.x+VW+120)continue;
    order.push(e);
  }
  order.sort(function(a,b){return (a.k==='boss'?1:0)-(b.k==='boss'?1:0)});
  for(i=0;i<order.length;i++)drawEnemy(order[i]);
}

/* ══════════ HUD / OVERLAY ══════════ */
var hudCache={hp:-1,lives:-1,score:-1,wpn:'',ammo:-1,bomb:-1,prog:-1};
function hud(){
  if(hudCache.hp!==P.hp){
    hudCache.hp=P.hp;
    var f=$('hpFill'),b=$('hpBar');
    if(f)f.style.width=(clamp(P.hp/P.maxHp,0,1)*100)+'%';
    var t=$('hpTxt');if(t)t.textContent=Math.max(0,Math.round(P.hp));
    if(b){b.className='hpBar'+(P.hp<=30?' crit':(P.hp<=60?' low':''))}
  }
  if(hudCache.lives!==P.lives){hudCache.lives=P.lives;var l=$('lives');if(l)l.textContent=Math.max(0,P.lives)}
  if(hudCache.score!==score){hudCache.score=score;var s=$('score');if(s)s.textContent=score}
  var ammo=P.weapon==='pistol'?'∞':(P.ammo[P.weapon]||0);
  if(hudCache.wpn!==P.weapon||hudCache.ammo!==ammo){
    hudCache.wpn=P.weapon;hudCache.ammo=ammo;
    var w=$('wpn'),a=$('ammo');
    if(w)w.textContent=weaponDef().n;
    if(a)a.textContent=ammo;
  }
  if(hudCache.bomb!==P.bombs){hudCache.bomb=P.bombs;var bo=$('bomb');if(bo)bo.textContent=P.bombs}
  var prog=Math.round(clamp((P.x)/LEVEL_W,0,1)*100);
  if(hudCache.prog!==prog){hudCache.prog=prog;var pf=$('progFill');if(pf)pf.style.width=prog+'%'}
}
function ovShow(icon,title,text,stats,buttons){
  var o=$('ov');
  if(!o)return;
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var st=$('ovStats');st.innerHTML='';
  if(stats&&stats.length){
    for(var i=0;i<stats.length;i++)st.innerHTML+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';
  }else st.style.display='none';
  if(stats&&stats.length)st.style.display='grid';
  var bs=$('ovBtns');bs.innerHTML='';
  for(var j=0;j<buttons.length;j++){
    var b=buttons[j];
    if(b.cls==='row'){bs.innerHTML+='<div class="row3">'+b.html+'</div>'}
    else bs.innerHTML+='<button class="sbtn'+(b.cls?' '+b.cls:'')+'" type="button" data-act="'+b.act+'"'+(b.d!==undefined?' data-d="'+b.d+'"':'')+'>'+b.label+'</button>';
  }
  o.classList.remove('hide');
}
function ovHide(){var o=$('ov');if(o)o.classList.add('hide')}
function diffBtns(){
  var h='',i;
  for(i=0;i<DIF.length;i++)h+='<button class="sbtn'+(i===diff?' sel':'')+'" type="button" data-act="diff" data-d="'+i+'">'+DIF[i].n+'</button>';
  return h;
}
function missionBtns(){
  var h='',i,M;
  for(i=0;i<MISSIONS.length;i++){
    M=MISSIONS[i];
    h+='<button class="sbtn'+(i===mission?' sel':'')+'" type="button" data-act="mission" data-d="'+i+'">'+M.id+' • '+M.name+(cleared[M.id]?' ✓':'')+'</button>';
  }
  return h;
}
function menu(){
  state='menu';mode='';
  MUS.stop();
  var M=LEV;
  ovShow('🎖️','METAL SLUG',
    '<b>MISI '+M.id+' — '+M.name+'</b><br>'+M.sub+'<br>Tembus garis pertahanan, rebut amunisi, hancurkan <b>'+M.boss.name+'</b> di ujung rute.<br><br>Pistol tak terbatas • ambil <b>H</b> senapan mesin, <b>S</b> shotgun, <b>R</b> roket • 💣 bom untuk kerumunan.',
    [['NYAWA',3],['BOM',8],['ZONA',M.w+'m']],
    [{cls:'row',html:missionBtns()},{cls:'row',html:diffBtns()},{act:'start',label:'▶ MULAI MISI '+M.id,cls:'go'},{act:'help',label:'❔ CARA MAIN'}]);
}
function pickMission(m){
  mission=clamp(m,0,MISSIONS.length-1);
  LEV=MISSIONS[mission];
  LEVEL_W=LEV.w;
  buildSolids();
  spawnProps();
  cam.x=0;P.x=60;P.y=GY;score=0;kills=0;
  menu();
}
function help(){
  ovShow('📖','CARA MAIN',
    '<b>◀ ▶</b> berjalan • <b>▼</b> jongkok menembak rendah<br><b>⤒</b> lompat — tahan untuk lompat lebih tinggi<br><b>TEMBAK</b> tahan untuk tembakan otomatis • <b>BOM</b> granat busur<br><br>Peti kayu & tong merah bisa dihancurkan. Tong meledak — ledakkan saat musuh berkerumun.<br>Musuh punya nyawa; perhatikan bilah HP di atas kepala mereka.<br><br><b>2 misi:</b> Iron Shore (senja) dan Jungle Fortress (malam). Musuh <b>veteran</b> di misi 2 menembak beruntun dan melempar granat; bos <b>STEEL MANTIS</b> menembakkan salvo roket.<br><br>Keyboard: ←→ / A D, Space lompat, J tembak, K bom, P jeda, M bisu.',
    null,[{act:'back',label:'◀ KEMBALI'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';MUS.stop();
  ovShow('⏸️','JEDA','Misi '+LEV.id+' — '+LEV.name+' dihentikan sementara. Ambil napas, prajurit.',
    [['SKOR',score],['BUNUH',kills],['LANTAI',Math.round(P.x/LEVEL_W*100)+'%']],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'restart',label:'↻ ULANG MISI'},{act:'menu',label:'⏹ KEMBALI KE MENU'}]);
}
function resumeState(){
  if(state!=='pause')return;
  state='play';ovHide();MUS.start();
}
function gameOver(){
  state='dead';mode='dead';MUS.stop();sfx.fail();
  var acc=shots?Math.round(hits/shots*100):0;
  ovShow('💀','MISI GAGAL','Misi '+LEV.id+' — '+LEV.name+'. Barisanmu tumbang sebelum '+LEV.boss.name+' jatuh.',
    [['SKOR',score],['BUNUH',kills],['AKURASI',acc+'%']],
    [{act:'restart',label:'↻ COBA LAGI',cls:'go'},{act:'menu',label:'⏹ MENU UTAMA'}]);
}
function rank(){
  if(score>12000)return 'S';
  if(score>8000)return 'A';
  if(score>4500)return 'B';
  return 'C';
}
function isLastMission(){return mission>=MISSIONS.length-1}
function victory(){
  state='win';mode='win';MUS.stop();sfx.win();
  markCleared(LEV.id);
  var acc=shots?Math.round(hits/shots*100):0;
  var secs=Math.round(tick/60);
  var last=isLastMission();
  var btns=[];
  if(!last)btns.push({act:'next',label:'▶ LANJUT MISI '+(LEV.id+1)+' — '+MISSIONS[mission+1].name,cls:'go'});
  btns.push({act:'restart',label:last?'↻ MAIN LAGI':'↻ ULANG MISI '+LEV.id,cls:last?'go':''});
  btns.push({act:'menu',label:'⏹ PILIH MISI'});
  ovShow(last?'🏅':'🏆',last?'KAMPANYE SELESAI':'MISI '+LEV.id+' SELESAI',
    LEV.boss.name+' hancur. '+(last?'Kedua garis pertahanan sudah diamankan — kamu prajurit terbaik!':'Basis berikutnya sudah terlihat di seberang rimba.'),
    [['SKOR',score],['BUNUH',kills],['WAKTU',Math.floor(secs/60)+':'+('0'+(secs%60)).slice(-2)],['AKURASI',acc+'%'],['PERINGKAT',rank()],['SULIT',diffName]],
    btns);
}
function nextMission(){
  if(isLastMission()){start();return}
  mission++;
  LEV=MISSIONS[mission];
  LEVEL_W=LEV.w;
  buildSolids();
  start();
}
function start(){
  var i;
  state='play';tick=0;score=0;kills=0;shots=0;hits=0;checkpoint=0;
  enemies.length=0;bullets.length=0;grenades.length=0;explosions.length=0;particles.length=0;popups.length=0;pickups.length=0;timers.length=0;
  bossRef=null;
  cam.x=0;cam.shake=0;flashT=0;
  P.x=60;P.y=GY;P.vx=0;P.vy=0;P.onGround=false;P.face=1;P.hp=P.maxHp;P.lives=3;
  P.weapon='pistol';P.ammo={H:0,S:0,R:0};P.bombs=8;P.cool=0;P.bcool=0;P.inv=60;
  P.crouch=false;P.dead=false;P.deadT=0;P.anim=0;P.hitTick=0;
  jumpBuf=0;bombBuf=0;coyote=0;
  input.ax=0;input.left=input.right=input.down=input.fire=input.jump=false;
  for(i=0;i<LEV.waves.length;i++)LEV.waves[i].done=false;
  diffName=DIF[diff].n;
  buildSolids();
  spawnProps();
  hudCache.hp=-1;hudCache.lives=-1;hudCache.score=-1;hudCache.wpn='';hudCache.ammo=-1;hudCache.bomb=-1;hudCache.prog=-1;
  var bb=$('bossBar');if(bb)bb.classList.remove('show');
  ovHide();
  hud();
  var bn=$('bossName');if(bn)bn.textContent='⚠ '+LEV.boss.name+' • BOS';
  bossFillShown=-1;
  showBanner('MISSION '+LEV.id,LEV.name+' — MAJU PRAJURIT');
  MUS.start();
}
function setDiff(d){
  diff=clamp(d,0,2);
  var o=$('ov');
  if(o&&!o.classList.contains('hide'))menu();
}

/* ══════════ LOOP ══════════ */
function step(){
  if(state==='play'){
    tick++;
    runTimers();
    updateWaves();
    updatePlayer();
    updateEnemies();
    updateBullets();
    updateProps();
    updateGrenades();
    updatePickups();
    updateCamera();
    hud();
    if(bannerT&&tick-bannerT>110)hideBanner();
    if(cam.shake>0)cam.shake*=0.9;
  }else{
    tick++;
    runTimers();
    updateGrenades();
    if(cam.shake>0)cam.shake*=0.9;
  }
  if(flashT>0)flashT--;
}
var last=0,acc=0,FIXED=1000/60;
function loop(now){
  requestAnimationFrame(loop);
  var dt;
  if(!last)last=now;
  dt=now-last;last=now;
  if(dt>130)dt=130;
  acc+=dt;
  var guard=0;
  while(acc>=FIXED&&guard<5){step();acc-=FIXED;guard++}
  if(guard>=5)acc=0;
  draw();
}

/* ══════════ INPUT ══════════ */
function hold(id,on,off){
  var el=$(id);
  if(!el)return;
  el.addEventListener('pointerdown',function(e){e.preventDefault();ensureAC();el.classList.add('active');on()},{passive:false});
  var up=function(){el.classList.remove('active');if(off)off()};
  el.addEventListener('pointerup',up);
  el.addEventListener('pointercancel',up);
  el.addEventListener('pointerleave',up);
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
  hold('bDown',function(){input.down=true},function(){input.down=false});
  hold('bFire',function(){input.fire=true;if(state==='play')fire()},function(){input.fire=false});
  hold('bJump',function(){input.jump=true;jumpBuf=8},function(){input.jump=false});
  hold('bBomb',function(){bombBuf=10},function(){});
  var ov=$('ov');
  if(ov)ov.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start'){start()}
    else if(a==='diff'){setDiff(parseInt(b.getAttribute('data-d')||'1',10))}
    else if(a==='mission'){pickMission(parseInt(b.getAttribute('data-d')||'0',10))}
    else if(a==='next'){nextMission()}
    else if(a==='help'){help()}
    else if(a==='back'){menu()}
    else if(a==='resume'){resumeState()}
    else if(a==='restart'){start()}
    else if(a==='menu'){menu()}
  });
  var mb=$('muteB');
  if(mb)mb.addEventListener('click',function(){
    muted=!muted;musicOn=!muted;
    if(master)master.gain.value=muted?0:0.55;
    mb.textContent=muted?'🔇':'🔊';
    if(muted)MUS.stop();else if(state==='play')MUS.start();
  });
  var st=$('stage');
  if(st)st.addEventListener('pointerdown',function(e){
    ensureAC();
    if(state!=='play')return;
    var r=st.getBoundingClientRect();
    var rx=(e.clientX-r.left)/r.width;
    if(rx>0.62){input.fire=true;fire()}
    else if(rx<0.38){jumpBuf=8;input.jump=true}
  },{passive:true});
  if(st)st.addEventListener('pointerup',function(){input.fire=false;input.jump=false});
  D.addEventListener('keydown',function(e){
    ensureAC();
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){input.ax=-1;input.left=true;e.preventDefault()}
    else if(k==='arrowright'||k==='d'){input.ax=1;input.right=true;e.preventDefault()}
    else if(k==='arrowdown'||k==='s'){input.down=true;e.preventDefault()}
    else if(k===' '||k==='arrowup'||k==='w'){if(!e.repeat){input.jump=true;jumpBuf=8}if(state==='play')e.preventDefault()}
    else if(k==='j'||k==='z'||k==='f'){input.fire=true}
    else if(k==='k'||k==='x'||k==='g'){if(!e.repeat)bombBuf=10}
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
  D.addEventListener('visibilitychange',function(){
    if(D.hidden&&state==='play')pause();
  });
  if(window.addEventListener)window.addEventListener('resize',function(){fit()});
}

/* ══════════ BOOT ══════════ */
var BUSH=[];
(function initBushes(){
  var i;
  for(i=0;i<40;i++)BUSH.push({x:i*110+rnd(0,60),r:rnd(9,16)});
  BUSHES.length=0;
  for(i=0;i<BUSH.length;i++)BUSHES.push(BUSH[i]);
})();
fit();buildSolids();spawnProps();bakeVig();bindInput();hud();menu();
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',function(){fit()});
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);

if(typeof window!=='undefined'){
  window.__MS={
    get s(){return{state:state,tick:tick,hp:P.hp,lives:P.lives,x:Math.round(P.x*10)/10,y:Math.round(P.y*10)/10,vx:Math.round(P.vx*100)/100,vy:Math.round(P.vy*100)/100,onGround:P.onGround,score:score,kills:kills,shots:shots,hits:hits,enemies:enemies.length,bullets:bullets.length,grenades:grenades.length,props:props.filter(function(p){return !p.dead}).length,pickups:pickups.length,weapon:P.weapon,ammo:P.ammo[P.weapon]||0,bombs:P.bombs,cam:Math.round(cam.x),boss:bossRef?{hp:bossRef.hp,dying:bossRef.dying,dead:bossRef.dead}:null,banner:bannerTxt,wave:LEV.waves.filter(function(w){return w.done}).length,diff:diff,diffName:diffName,mission:mission,missionName:LEV.name,levelW:LEVEL_W,cleared:cleared}},
    input:input,player:P,enemies:enemies,bullets:bullets,
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:start,setDiff:setDiff,fire:fire,throwBomb:throwBomb,hurt:hurtPlayer,
    dir:function(l,r){input.left=!!l;input.right=!!r;dirSync()},get axis(){return input.ax},get dirs(){return{l:!!input.left,r:!!input.right,ax:input.ax,locked:dirHeldN>0}},
    jump:function(){jumpBuf=8;input.jump=true},
    forceWaves:function(){for(var i=0;i<LEV.waves.length;i++)if(!LEV.waves[i].done)spawnWave(LEV.waves[i])},
    teleport:function(x){P.x=x;P.y=GY-20;cam.x=clamp(x-VW*0.42,0,LEVEL_W-VW)},
    setMission:function(m){mission=clamp(m,0,MISSIONS.length-1);LEV=MISSIONS[mission];LEVEL_W=LEV.w;buildSolids();spawnProps();},
    setHp:function(v){P.hp=v},
    killBoss:function(){if(bossRef){bossRef.hp=1;damageEnemy(bossRef,5)}},
    entities:{get enemies(){return enemies},get bullets(){return bullets},get explosions(){return explosions}}
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
/* lapisan kilap aditif: tidak mengubah tata letak, hanya rasa sentuh & ketajaman */
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.key,.pad,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
button:active,[role="button"]:active,.btn:active,.key:active,.pad:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(224,201,138,.35)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(143,174,77,.35);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
/* ── lapisan HD Nano: cahaya ruang + vignette + butiran halus ── */
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
html::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;background-image:radial-gradient(122% 82% at 16% -12%,rgba(255,255,255,.09),rgba(255,255,255,0) 58%),radial-gradient(132% 112% at 92% 118%,rgba(0,0,0,.22),rgba(0,0,0,0) 62%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");background-size:auto,auto,160px 160px}
/* material: bevel + bayangan kontak supaya tombol terasa benda nyata */
.mbtn,.abtn,.sbtn,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.2),inset 0 -3px 5px rgba(0,0,0,.4),0 4px 0 rgba(0,0,0,.42),0 8px 16px rgba(0,0,0,.36)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.07),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 34px rgba(0,0,0,.5)!important}
.stage canvas{filter:saturate(1.08) contrast(1.04)}
.hud,.head{border-radius:12px!important}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🎖️', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Metal Slug 🎖️',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-metalslug-2026',
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

handler.help = ['metalslug', 'mslug', 'slug', 'metalslug3']
handler.tags = ['game']
handler.command = /^(metalslug|mslug|slug|metalslug3)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Metal Slug Nano Ai - run and gun, 4 senjata, bos Iron Scorpion'

export default handler
