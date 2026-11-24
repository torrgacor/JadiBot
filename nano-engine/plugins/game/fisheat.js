/*
⌬ Nano Ai · Game Plugin · Fish Eat Fish 🐟 (HD + D-Pad)
*/

'use strict'

/* ==========================================================================
   Nano Ai · Fish Eat Fish 🐟 · versi HD
   • Kontrol: D-PAD 4 arah (bisa ditahan) ATAU geser jari — pilih yang enak
   • Karakter ikan digambar detail (sisik, sirip, ekor bergerak) & dibake 2x
   • Gerakan halus: percepatan + perlambatan, bukan patah-patah
   • Ikan liar punya 5 spesies bentuk & warna berbeda (terbaca ukurannya)
   • Kesulitan adil: ikan bahaya selalu kelihatan jelas (garis tepi merah)
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#062a3d">
<title>Nano Ai Fish Eat Fish</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#041e2c;color:#e2f6ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#0a3a54,#062433);border:1px solid #1a5f83;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#4fc3f7,#0277bd);font-size:20px;box-shadow:0 3px 0 #013b5c,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#8ecbe6;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px}
.hb{width:34px;height:34px;border:1px solid #2278a3;border-radius:10px;background:linear-gradient(180deg,#0e4560,#093046);color:#d8f1fc;font-size:15px;box-shadow:0 3px 0 #03151f}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #03151f}
.bar{display:flex;align-items:center;gap:6px;background:#083044;border:1px solid #1a5f83;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#a9e3f8;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#052232;border:1px solid #1a5f83;color:#8ecbe6;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.growbar{height:10px;border-radius:999px;background:#052232;border:1px solid #1a5f83;overflow:hidden;margin-bottom:8px}
.growbar i{display:block;height:100%;width:0%;background:linear-gradient(90deg,#4fc3f7,#ffd23f);transition:width .25s}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #1a5f83;border-radius:14px;overflow:hidden;background:linear-gradient(180deg,#0c4a6e,#022c43)}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#052232e6;border:1px solid #2278a3;color:#d8f1fc;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#02131de8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #2278a3;border-radius:16px;background:linear-gradient(180deg,#0a3a54,#052230);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#a9e3f8;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#8ecbe6;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #a9e3f8;border-radius:12px;background:linear-gradient(180deg,#4fc3f7,#0277bd);color:#01273d;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #014a73}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #014a73}
.dpad{display:grid;grid-template-columns:64px 64px 64px;grid-template-rows:52px 52px;gap:6px;justify-content:center;margin-top:8px}
.dp{border:1px solid #2278a3;border-radius:14px;background:linear-gradient(180deg,#0e4560,#093046);color:#d8f1fc;font-size:19px;box-shadow:0 3px 0 #03151f;touch-action:none;-webkit-user-select:none;user-select:none}
.dp:active,.dp.on{transform:translateY(2px);box-shadow:0 1px 0 #03151f;background:linear-gradient(180deg,#155a7e,#0e4560)}
.dp.up{grid-column:2;grid-row:1}
.dp.left{grid-column:1;grid-row:2}
.dp.right{grid-column:2;grid-row:2}
.dp.down{grid-column:3;grid-row:2}
.dp.mid{grid-column:3;grid-row:1;font-size:14px}
.dpnote{text-align:center;color:#8ecbe6;font:800 7.5px system-ui;letter-spacing:.06em;margin-top:5px}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🐟</div>
        <div>
          <div class="title">FISH EAT FISH</div>
          <div class="sub">makan yang kecil · hindari yang besar</div>
        </div>
      </div>
      <div class="hbtns"><button class="hb" id="bSound">🔊</button></div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Siap berenang?</div>
      <div class="chip">🍽️ <b id="cEat">0</b></div>
      <div class="chip">🏅 <b id="cBest">0</b></div>
    </div>
    <div class="growbar"><i id="growFill"></i></div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">🐟 FISH EAT FISH</div>
          <div class="small">Kontrol: <b style="color:#a9e3f8">D-PAD</b> di bawah <i>(bisa ditahan)</i><br>atau <b style="color:#a9e3f8">GESEK</b> langsung di kolam.<br>Makan ikan <b style="color:#81d4fa">lebih kecil</b> → evolusi 🐡!<br>Ikan ber<b style="color:#ff8a7a">tepi merah</b> = lebih besar = BAHAYA.<br>Evolusi akhir: 🐡 Raja Laut — jerung jadi santapan!</div>
          <button class="gbtn" id="bPlay">▶ BERENANG</button>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">TERMAKAN!</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bAgain">↻ COBA LAGI</button>
        </div>
      </div>
    </div>
    <div class="dpad">
      <button class="dp up" id="dU">▲</button>
      <button class="dp mid" id="dS">🔍</button>
      <button class="dp left" id="dL">◀</button>
      <button class="dp right" id="dR">▶</button>
      <button class="dp down" id="dD">▼</button>
    </div>
    <div class="dpnote">TAHAN TOMBOL UNTUK BERENANG TERUS · 🔍 = SONAR</div>
  </div>
</div>
<script>
(function(){
var DW=840,DH=630;   /* kanvas 2x agar gambar tajam (HD) */
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var best=parseInt(stGet('nano-fish-best')||'0')||0;
var sOn=stGet('nano-fish-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={bite:function(){tone(620,0.07,'square',0.1,200)},big:function(){tone(200,0.3,'sawtooth',0.16,-80)},evolve:function(){tone(523,0.1,'sine',0.14);setTimeout(function(){tone(659,0.1,'sine',0.14)},110);setTimeout(function(){tone(880,0.22,'sine',0.16)},220)},dead:function(){tone(300,0.4,'sawtooth',0.16,-240)},sonar:function(){tone(900,0.1,'sine',0.06,320)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1500)}
var STAGES=[
  {name:'🥚 Telur',r:13,spd:270},
  {name:'🐠 Anak Ikan',r:18,spd:295},
  {name:'🐟 Remaja',r:24,spd:320},
  {name:'🐬 Delapan',r:32,spd:345},
  {name:'🐡 Raja Laut',r:42,spd:370}
];
/* 5 spesies ikan liar: bentuk & warna khas, ukuran 10..46 */
var SPECIES=[
  {col:'#ffb74d',fin:'#ff9800',pat:'stripe'},   /* nemo */
  {col:'#4dd0e1',fin:'#00acc1',pat:'plain'},    /* biru */
  {col:'#f06292',fin:'#ec407a',pat:'dots'},     /* merah muda */
  {col:'#aed581',fin:'#7cb342',pat:'plain'},    /* hijau */
  {col:'#ffb300',fin:'#ff6f00',pat:'stripe'}    /* kuning */
];
function rnd(a,b){return a+Math.random()*(b-a)}
/* ---------- SPRITE BAKE: ikan digambar sekali rinci, dipakai berulang ---------- */
function bakeFish(spec,r){
  var c=document.createElement('canvas');
  var pad=Math.ceil(r*2.6),S=2;   /* resolusi 2x */
  c.width=pad*S;c.height=pad*S;
  var g=c.getContext('2d');g.scale(S,S);
  var cxr=pad/2,cyr=pad/2;
  g.save();g.translate(cxr,cyr);
  /* ekor */
  g.fillStyle=spec.fin;
  g.beginPath();g.moveTo(-r*0.72,0);
  g.quadraticCurveTo(-r*1.28,-r*0.62,-r*1.42,0);
  g.quadraticCurveTo(-r*1.28,r*0.62,-r*0.72,0);
  g.fill();
  /* sirip atas */
  g.beginPath();g.moveTo(-r*0.15,-r*0.55);
  g.quadraticCurveTo(r*0.1,-r*1.22,r*0.5,-r*0.62);
  g.quadraticCurveTo(r*0.2,-r*0.5,-r*0.15,-r*0.55);
  g.fill();
  /* sirip bawah kecil */
  g.beginPath();g.moveTo(r*0.05,r*0.52);
  g.quadraticCurveTo(r*0.22,r*0.95,r*0.5,r*0.58);
  g.fill();
  /* badan: dua nada utk kesan volume */
  var grad=g.createRadialGradient(-r*0.2,-r*0.2,r*0.1,0,0,r*1.15);
  grad.addColorStop(0,'#ffffffcc');
  grad.addColorStop(0.25,spec.col);
  grad.addColorStop(1,shade(spec.col,-0.28));
  g.fillStyle=grad;
  g.beginPath();g.ellipse(0,0,r,r*0.66,0,0,7);g.fill();
  /* garis tepi bawah lembut */
  g.strokeStyle='rgba(0,0,0,0.18)';g.lineWidth=r*0.06;
  g.beginPath();g.ellipse(0,0,r,r*0.66,0,0.2,Math.PI-0.2);g.stroke();
  /* pola */
  g.save();g.beginPath();g.ellipse(0,0,r,r*0.66,0,0,7);g.clip();
  if(spec.pat==='stripe'){
    g.fillStyle='rgba(255,255,255,0.5)';
    for(var sx=-r*0.55;sx<r*0.75;sx+=r*0.42){g.fillRect(sx,-r*0.7,r*0.14,r*1.4)}
  } else if(spec.pat==='dots'){
    g.fillStyle='rgba(255,255,255,0.45)';
    for(var d1=-2;d1<=2;d1++)for(var d2=-1;d2<=1;d2++){
      g.beginPath();g.arc(d1*r*0.3,d2*r*0.26+r*0.05,r*0.08,0,7);g.fill();
    }
  }
  g.restore();
  /* sisik samar */
  g.strokeStyle='rgba(255,255,255,0.12)';g.lineWidth=r*0.045;
  for(var row=-1;row<=1;row++)for(var col2=0;col2<4;col2++){
    var fx=-r*0.5+col2*r*0.34, fy=row*r*0.24;
    g.beginPath();g.arc(fx,fy,r*0.13,0.15*Math.PI,0.85*Math.PI);g.stroke();
  }
  /* insang */
  g.strokeStyle='rgba(0,0,0,0.16)';g.lineWidth=r*0.05;
  g.beginPath();g.arc(r*0.18,0,r*0.5,-Math.PI*0.32,Math.PI*0.32);g.stroke();
  /* mata besar HD */
  g.fillStyle='#fff';
  g.beginPath();g.arc(r*0.52,-r*0.16,r*0.24,0,7);g.fill();
  g.fillStyle='#12232e';
  g.beginPath();g.arc(r*0.58,-r*0.16,r*0.13,0,7);g.fill();
  g.fillStyle='#fff';
  g.beginPath();g.arc(r*0.53,-r*0.22,r*0.045,0,7);g.fill();
  /* mulut */
  g.strokeStyle='rgba(0,0,0,0.3)';g.lineWidth=r*0.05;
  g.beginPath();g.arc(r*0.86,r*0.1,r*0.12,Math.PI*0.15,Math.PI*0.85);g.stroke();
  g.restore();
  return c;
}
function shade(hex,amt){
  var n=parseInt(hex.slice(1),16),r=(n>>16)&255,g2=(n>>8)&255,b=n&255;
  r=Math.max(0,Math.min(255,Math.round(r+255*amt)));
  g2=Math.max(0,Math.min(255,Math.round(g2+255*amt)));
  b=Math.max(0,Math.min(255,Math.round(b+255*amt)));
  return 'rgb('+r+','+g2+','+b+')';
}
/* sprite ikan liar per (spesies, ukuran dibulatkan 4px) */
var spriteCache={};
function fishSprite(specIdx,r){
  var key=specIdx+'_'+Math.round(r/4);
  if(spriteCache[key])return spriteCache[key];
  var s=bakeFish(SPECIES[specIdx],r);
  spriteCache[key]=s;
  return s;
}
/* ikan pemain per tahap, dua arah */
var playerSprites={};
function playerSprite(stage,face){
  var key='p'+stage+'_'+face;
  if(playerSprites[key])return playerSprites[key];
  var c=document.createElement('canvas');
  var r=STAGES[stage].r;
  var pad=Math.ceil(r*2.9),S=2;
  c.width=pad*S;c.height=pad*S;
  var g=c.getContext('2d');g.scale(S,S);
  g.translate(pad/2,pad/2);
  g.scale(face,1);
  /* ekor bergerak tak bisa di-bake → ekor digambar runtime, badan di-bake */
  g.save();
  g.fillStyle='#ff9800';
  g.beginPath();g.moveTo(-r*0.6,0);g.quadraticCurveTo(-r*1.35,-r*0.7,-r*1.55,0);g.quadraticCurveTo(-r*1.35,r*0.7,-r*0.6,0);g.fill();
  /* sirip atas */
  g.fillStyle='#f57c00';
  g.beginPath();g.moveTo(-r*0.1,-r*0.5);g.quadraticCurveTo(r*0.15,-r*1.3,r*0.55,-r*0.55);g.quadraticCurveTo(r*0.2,-r*0.45,-r*0.1,-r*0.5);g.fill();
  /* badan kuning-oranye volume */
  var grad=g.createRadialGradient(-r*0.15,-r*0.25,r*0.08,0,0,r*1.2);
  grad.addColorStop(0,'#fff8e1');
  grad.addColorStop(0.3,'#ffca28');
  grad.addColorStop(1,'#ef6c00');
  g.fillStyle=grad;
  g.beginPath();g.ellipse(0,0,r,r*0.68,0,0,7);g.fill();
  g.strokeStyle='rgba(120,50,0,0.35)';g.lineWidth=r*0.07;
  g.beginPath();g.ellipse(0,0,r,r*0.68,0,0,7);g.stroke();
  /* pola takik kuning */
  g.fillStyle='rgba(255,255,255,0.35)';
  g.fillRect(-r*0.2,-r*0.66,r*0.12,r*1.32);
  g.fillRect(r*0.24,-r*0.62,r*0.1,r*1.24);
  /* sisik */
  g.strokeStyle='rgba(255,255,255,0.16)';g.lineWidth=r*0.05;
  for(var row=-1;row<=1;row++)for(var col3=0;col3<4;col3++){
    g.beginPath();g.arc(-r*0.4+col3*r*0.3,row*r*0.26,r*0.14,0.15*Math.PI,0.85*Math.PI);g.stroke();
  }
  /* mata */
  g.fillStyle='#fff';g.beginPath();g.arc(r*0.5,-r*0.18,r*0.26,0,7);g.fill();
  g.fillStyle='#1a1a2e';g.beginPath();g.arc(r*0.57,-r*0.18,r*0.14,0,7);g.fill();
  g.fillStyle='#fff';g.beginPath();g.arc(r*0.52,-r*0.24,r*0.05,0,7);g.fill();
  /* mahkota utk Raja Laut */
  if(stage>=4){
    g.fillStyle='#ffd23f';
    g.beginPath();
    g.moveTo(r*0.05,-r*0.75);g.lineTo(r*0.2,-r*1.05);g.lineTo(r*0.35,-r*0.8);
    g.lineTo(r*0.5,-r*1.1);g.lineTo(r*0.65,-r*0.78);
    g.closePath();g.fill();
  }
  g.restore();
  playerSprites[key]=c;
  return c;
}
/* ---------- dunia ---------- */
var G=null,started=false,t0=0,fishes=[],sharks=[],bubbles=[],floats=[];
function reset(){
  G={x:DW/2,y:DH/2,vx:0,vy:0,ax:0,ay:0,dir:1,keys:{up:0,down:0,left:0,right:0},
     grow:0,eaten:0,stage:0,dead:false,inv:2.2,t:0,sonar:0};
  fishes=[];sharks=[];bubbles=[];floats=[];
  for(var i=0;i<13;i++)spawnFish();
  sharks.push({x:rnd(80,DW-80),y:rnd(80,DH-80),vx:60,vy:30,t:4});
  document.getElementById('cBest').textContent=best;
}
function spawnFish(){
  /* ukuran: sekitar ukuran pemain, ada yang lebih kecil (bisa dimakan) & besar (bahaya) */
  var st=STAGES[G.stage].r;
  var roll=Math.random();
  var r;
  if(roll<0.52)r=st*rnd(0.5,0.86);        /* kecil — makanan */
  else if(roll<0.78)r=st*rnd(0.86,1.08);  /* seukuran — netral */
  else r=st*rnd(1.2,1.5);                 /* besar — bahaya */
  r=Math.max(9,Math.min(48,r));
  var spec=Math.floor(rnd(0,SPECIES.length));
  var dir=Math.random()<0.5?1:-1;
  fishes.push({x:dir>0?-60:DW+60,y:rnd(40,DH-40),r:r,spec:spec,
    vx:dir*rnd(34,86),vy:rnd(-16,16),t:rnd(0,9),wob:rnd(2,4)});
}
function floatText(x,y,txt,col){floats.push({x:x,y:y,txt:txt,col:col,t:0.9})}
function step(dt){
  if(!G||G.dead)return;
  G.t+=dt;
  if(G.inv>0)G.inv-=dt;
  if(G.sonar>0)G.sonar-=dt;
  var st=STAGES[G.stage];
  /* kontrol D-pad: percepatan halus */
  var ACC=1500;
  var tx=(G.keys.right-G.keys.left), ty=(G.keys.down-G.keys.up);
  var mag=Math.hypot(tx,ty);
  if(mag>1){tx/=mag;ty/=mag}
  G.vx+=tx*ACC*dt; G.vy+=ty*ACC*dt;
  /* redaman air */
  G.vx*=1-Math.min(0.9,2.6*dt); G.vy*=1-Math.min(0.9,2.6*dt);
  var spd=Math.hypot(G.vx,G.vy);
  var maxs=st.spd;
  if(spd>maxs){G.vx*=maxs/spd;G.vy*=maxs/spd}
  G.x+=G.vx*dt;G.y+=G.vy*dt;
  /* dinding lembut */
  if(G.x<st.r){G.x=st.r;G.vx=Math.abs(G.vx)*0.35}
  if(G.x>DW-st.r){G.x=DW-st.r;G.vx=-Math.abs(G.vx)*0.35}
  if(G.y<st.r){G.y=st.r;G.vy=Math.abs(G.vy)*0.35}
  if(G.y>DH-st.r){G.y=DH-st.r;G.vy=-Math.abs(G.vy)*0.35}
  if(Math.abs(G.vx)>14)G.dir=G.vx>0?1:-1;
  /* ikan liar */
  for(var i=fishes.length-1;i>=0;i--){
    var f=fishes[i];
    f.t+=dt;
    f.x+=f.vx*dt;f.y+=f.vy*dt+Math.sin(f.t*f.wob)*10*dt;
    if(f.x<-70)f.x=DW+60;else if(f.x>DW+70)f.x=-60;
    if(f.y<24){f.y=24;f.vy=Math.abs(f.vy)}
    if(f.y>DH-24){f.y=DH-24;f.vy=-Math.abs(f.vy)}
    var dist=Math.hypot(f.x-G.x,f.y-G.y);
    if(dist<st.r+f.r*0.82){
      if(f.r<st.r*0.92){
        fishes.splice(i,1);
        G.eaten++;G.grow+=Math.max(5,f.r*0.6);
        SFX.bite();
        floatText(f.x,f.y,'+1','#ffd23f');
        if(G.grow>=100){
          G.grow-=100;
          if(G.stage<STAGES.length-1){G.stage++;SFX.evolve();toast('EVOLUSI! '+STAGES[G.stage].name)}
          else{G.eaten+=2;floatText(G.x,G.y-30,'+2','#57e389')}
        }
        if(fishes.length<13)spawnFish();
      } else if(f.r>=st.r*0.92&&G.inv<=0&&f.r>st.r){
        die('Dimakan ikan lebih besar!');return;
      }
    } else if(f.r>st.r*1.12&&dist<210&&G.inv<=0){
      /* ikan besar mengejar pelan */
      f.vx+=(G.x-f.x)/dist*130*dt;
      f.vy+=(G.y-f.y)/dist*130*dt;
      var sp2=Math.hypot(f.vx,f.vy);
      if(sp2>150){f.vx*=150/sp2;f.vy*=150/sp2}
    }
  }
  /* jerung */
  for(var s2=0;s2<sharks.length;s2++){
    var sh=sharks[s2];sh.t-=dt;
    if(sh.t<=0){
      var ang=rnd(0,Math.PI*2);
      sh.vx=Math.cos(ang)*70;sh.vy=Math.sin(ang)*46;sh.t=rnd(2.5,5);
    }
    var king=G.stage>=STAGES.length-1;
    if(!king&&G.inv<=0){
      var sd=Math.hypot(sh.x-G.x,sh.y-G.y);
      if(sd<240){sh.vx+=(G.x-sh.x)/sd*170*dt;sh.vy+=(G.y-sh.y)/sd*170*dt}
      var sp3=Math.hypot(sh.vx,sh.vy);
      if(sp3>160){sh.vx*=160/sp3;sh.vy*=160/sp3}
    }
    sh.x+=sh.vx*dt;sh.y+=sh.vy*dt;
    if(sh.x<50||sh.x>DW-50)sh.vx*=-1;
    if(sh.y<50||sh.y>DH-50)sh.vy*=-1;
    sh.x=Math.max(40,Math.min(DW-40,sh.x));sh.y=Math.max(40,Math.min(DH-40,sh.y));
    if(!king&&G.inv<=0&&Math.hypot(sh.x-G.x,sh.y-G.y)<st.r+30){die('Diterjang jerung! 🦈');return}
    if(king&&Math.hypot(sh.x-G.x,sh.y-G.y)<st.r+26){
      G.eaten+=5;G.grow=Math.min(100,G.grow+15);SFX.big();
      floatText(sh.x,sh.y-20,'+5 JERUNG!','#ff8a65');
      sh.x=sh.x>DW/2?50:DW-50;sh.y=rnd(60,DH-60);
    }
  }
  /* gelembung & teks melayang */
  if(Math.random()<dt*3)bubbles.push({x:rnd(0,DW),y:DH+10,t:rnd(2,4),r:rnd(2,5)});
  for(var b2=bubbles.length-1;b2>=0;b2--){var bb=bubbles[b2];bb.y-=45*dt;bb.t-=dt;if(bb.t<=0)bubbles.splice(b2,1)}
  for(var ft=floats.length-1;ft>=0;ft--){var q=floats[ft];q.t-=dt;q.y-=34*dt;if(q.t<=0)floats.splice(ft,1)}
  document.getElementById('cEat').textContent=G.eaten;
  document.getElementById('growFill').style.width=G.grow+'%';
}
function die(pesan){
  G.dead=true;SFX.dead();
  if(G.eaten>best){best=G.eaten;stSet('nano-fish-best',String(best))}
  document.getElementById('cBest').textContent=best;
  setTimeout(function(){
    document.getElementById('endInfo').innerHTML='Terhadap <b style="color:#a9e3f8">'+G.eaten+'</b> ikan<br>Evolusi: <b style="color:#ffd23f">'+STAGES[G.stage].name+'</b> · Rekor: <b style="color:#ffd23f">'+best+'</b><br>'+(pesan||'');
    document.getElementById('ovEnd').classList.remove('hide');
  },500);
}
/* ---------- gambar ---------- */
var bgCache=null;
function drawBG(){
  if(bgCache)return cx.drawImage(bgCache,0,0,DW,DH),bgCache;
  bgCache=document.createElement('canvas');
  bgCache.width=DW;bgCache.height=DH;
  var g=bgCache.getContext('2d');
  var grad=g.createLinearGradient(0,0,0,DH);
  grad.addColorStop(0,'#0d5a86');grad.addColorStop(0.5,'#07415f');grad.addColorStop(1,'#02293c');
  g.fillStyle=grad;g.fillRect(0,0,DW,DH);
  /* berkas cahaya */
  g.save();g.globalAlpha=0.12;g.fillStyle='#bfe9ff';
  g.beginPath();g.moveTo(140,0);g.lineTo(300,0);g.lineTo(120,DH);g.lineTo(-60,DH);g.fill();
  g.beginPath();g.moveTo(520,0);g.lineTo(660,0);g.lineTo(860,DH);g.lineTo(700,DH);g.fill();
  g.restore();
  /* karang siluet */
  g.fillStyle='#063048';
  g.beginPath();g.moveTo(60,DH);g.quadraticCurveTo(40,DH-70,80,DH-110);g.quadraticCurveTo(110,DH-60,120,DH);g.fill();
  g.beginPath();g.moveTo(700,DH);g.quadraticCurveTo(690,DH-90,740,DH-130);g.quadraticCurveTo(780,DH-70,800,DH);g.fill();
  /* batu */
  g.fillStyle='#0a3a52';
  g.beginPath();g.ellipse(200,DH-14,90,26,0,0,7);g.fill();
  g.beginPath();g.ellipse(620,DH-10,120,30,0,0,7);g.fill();
  /* rumput laut */
  g.strokeStyle='#0e5c46';g.lineWidth=7;g.lineCap='round';
  for(var wp=0;wp<6;wp++){
    var wx=80+wp*140;
    g.beginPath();g.moveTo(wx,DH);
    g.quadraticCurveTo(wx-14,DH-70,wx+8,DH-130-wp*8);
    g.stroke();
    g.lineWidth=5;
    g.beginPath();g.moveTo(wx+18,DH);g.quadraticCurveTo(wx+30,DH-50,wx+12,DH-92);g.stroke();
    g.lineWidth=7;
  }
  /* pasir */
  g.fillStyle='#0f3d54';
  g.beginPath();g.moveTo(0,DH-16);
  for(var px=0;px<=DW;px+=40)g.lineTo(px,DH-16-6*Math.sin(px/60));
  g.lineTo(DW,DH);g.lineTo(0,DH);g.fill();
  return bgCache;
}
function draw(){
  cx.drawImage(drawBG(),0,0,DW,DH);
  /* gelembung */
  cx.strokeStyle='#bfe9ff44';cx.lineWidth=1.5;
  for(var b=0;b<bubbles.length;b++){var bb=bubbles[b];cx.beginPath();cx.arc(bb.x,bb.y,bb.r,0,7);cx.stroke()}
  /* ikan liar (sprite baked, flip saat ke kiri) */
  for(var i=0;i<fishes.length;i++){
    var f=fishes[i];
    var spr=fishSprite(f.spec,f.r);
    var sway=Math.sin(f.t*f.wob)*f.r*0.12;
    cx.save();
    cx.translate(f.x,f.y+sway);
    if(f.vx<0)cx.scale(-1,1);
    /* bayangan */
    cx.globalAlpha=0.25;cx.fillStyle='#000';
    cx.beginPath();cx.ellipse(0,f.r*0.85,f.r*0.9,f.r*0.22,0,0,7);cx.fill();
    cx.globalAlpha=1;
    cx.drawImage(spr,-spr.width/4,-spr.height/4,spr.width/2,spr.height/2);
    /* tanda bahaya: tepi merah utk ikan lebih besar */
    if(G&&f.r>STAGES[G.stage].r*1.02){
      cx.strokeStyle='rgba(255,82,82,0.85)';cx.lineWidth=2.5;
      cx.beginPath();cx.ellipse(0,0,f.r*1.08,f.r*0.74,0,0,7);cx.stroke();
    }
    cx.restore();
  }
  /* jerung (digambar rinci runtime) */
  for(var s=0;s<sharks.length;s++){
    var sh=sharks[s];
    cx.save();cx.translate(sh.x,sh.y);cx.scale(sh.vx>0?1:-1,1);
    var tw=Math.sin(Date.now()/160)*6;
    cx.fillStyle='#455a64';
    cx.beginPath();cx.moveTo(-34,0);cx.quadraticCurveTo(-56,-18+tw,-64,-26+tw);cx.quadraticCurveTo(-50,-4+tw,-64,18+tw);cx.quadraticCurveTo(-48,10+tw,-34,8);cx.closePath();cx.fill();
    var sg=cx.createLinearGradient(0,-18,0,16);
    sg.addColorStop(0,'#78909c');sg.addColorStop(0.6,'#546e7a');sg.addColorStop(1,'#37474f');
    cx.fillStyle=sg;
    cx.beginPath();cx.ellipse(0,0,44,17,0,0,7);cx.fill();
    cx.beginPath();cx.moveTo(-6,-13);cx.quadraticCurveTo(4,-36,14,-12);cx.closePath();cx.fill();
    cx.fillStyle='#90a4ae';
    cx.beginPath();cx.ellipse(4,7,26,7,0,0,7);cx.fill();
    cx.fillStyle='#fff';cx.beginPath();cx.arc(30,-5,4.4,0,7);cx.fill();
    cx.fillStyle='#101820';cx.beginPath();cx.arc(31,-5,2.2,0,7);cx.fill();
    cx.strokeStyle='#263238';cx.lineWidth=1.6;cx.beginPath();cx.arc(40,4,7,Math.PI*1.05,Math.PI*1.95);cx.stroke();
    cx.restore();
    /* penanda bahaya */
    cx.strokeStyle='rgba(255,82,82,0.7)';cx.lineWidth=2.5;
    cx.beginPath();cx.arc(sh.x,sh.y,46,0,7);cx.stroke();
  }
  /* ikan pemain */
  if(G){
    var st=STAGES[G.stage];
    var blink=G.inv>0&&Math.floor(Date.now()/100)%2===0;
    if(!blink){
      var spr2=playerSprite(G.stage,G.dir);
      var bob=Math.sin(G.t*6)*2;
      cx.save();cx.translate(G.x,G.y+bob);
      cx.globalAlpha=0.28;cx.fillStyle='#000';
      cx.beginPath();cx.ellipse(0,st.r*0.9,st.r,st.r*0.24,0,0,7);cx.fill();
      cx.globalAlpha=1;
      cx.drawImage(spr2,-spr2.width/4,-spr2.height/4,spr2.width/2,spr2.height/2);
      cx.restore();
    }
    if(G.inv>0){cx.strokeStyle='#ffffff44';cx.lineWidth=2;cx.beginPath();cx.arc(G.x,G.y,st.r+9,0,7);cx.stroke()}
    /* sonar */
    if(G.sonar>0){
      cx.strokeStyle='rgba(79,195,247,'+G.sonar+')';cx.lineWidth=2.5;
      for(var sc=1;sc<=2;sc++){cx.beginPath();cx.arc(G.x,G.y,(1.3-G.sonar+sc*0.4)*260,0,7);cx.stroke()}
    }
  }
  /* teks melayang */
  cx.font='900 16px system-ui';cx.textAlign='center';
  for(var f2=0;f2<floats.length;f2++){
    var q2=floats[f2];
    cx.globalAlpha=Math.max(0,q2.t/0.9);
    cx.fillStyle=q2.col;cx.fillText(q2.txt,q2.x,q2.y);
  }
  cx.globalAlpha=1;cx.textAlign='left';
}
function loop(ts){
  var dt=Math.min(0.04,(ts-t0)/1000||0.016);t0=ts;
  if(G&&started&&!G.dead)step(dt);
  draw();
  if(G&&started&&!G.dead)document.getElementById('stx').textContent=STAGES[G.stage].name+' · makan yang bertepi TIDAK merah!';
  requestAnimationFrame(loop);
}
/* ---------- input: D-pad tahan + geser di kolam ---------- */
function bindHold(id,key){
  var el=document.getElementById(id);
  el.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();ensureAC();if(G)G.keys[key]=1;el.classList.add('on')},{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){el.addEventListener(ev,function(){if(G)G.keys[key]=0;el.classList.remove('on')})});
}
bindHold('dU','up');bindHold('dD','down');bindHold('dL','left');bindHold('dR','right');
document.getElementById('dS').addEventListener('click',function(){if(G&&!G.dead){G.sonar=1.3;SFX.sonar()}});
var dragging=false;
cv.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();dragging=true;upd(e)},{passive:false});
cv.addEventListener('pointermove',function(e){if(!dragging)return;e.preventDefault();upd(e)},{passive:false});
['pointerup','pointercancel'].forEach(function(ev){cv.addEventListener(ev,function(){dragging=false})});
function upd(e){
  if(!G)return;
  var r=cv.getBoundingClientRect();
  var tx=(e.clientX-r.left)/r.width*DW, ty=(e.clientY-r.top)/r.height*DH;
  var dx=tx-G.x, dy=ty-G.y, d=Math.hypot(dx,dy)||1;
  /* tarik ke arah jari (bukan teleport) */
  G.keys.left=dx<-14?1:0; G.keys.right=dx>14?1:0;
  G.keys.up=dy<-14?1:0; G.keys.down=dy>14?1:0;
}
document.addEventListener('keydown',function(e){if(!G)return;
  if(e.code==='ArrowUp'||e.code==='KeyW')G.keys.up=1;
  if(e.code==='ArrowDown'||e.code==='KeyS')G.keys.down=1;
  if(e.code==='ArrowLeft'||e.code==='KeyA')G.keys.left=1;
  if(e.code==='ArrowRight'||e.code==='KeyD')G.keys.right=1;});
document.addEventListener('keyup',function(e){if(!G)return;
  if(e.code==='ArrowUp'||e.code==='KeyW')G.keys.up=0;
  if(e.code==='ArrowDown'||e.code==='KeyS')G.keys.down=0;
  if(e.code==='ArrowLeft'||e.code==='KeyA')G.keys.left=0;
  if(e.code==='ArrowRight'||e.code==='KeyD')G.keys.right=0;});
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;document.getElementById('ovStart').classList.add('hide');document.getElementById('ovEnd').classList.add('hide');toast('Makan ikan bertepi BUKAN merah! 🐟')});
document.getElementById('bAgain').addEventListener('click',function(){ensureAC();reset();document.getElementById('ovEnd').classList.add('hide')});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('nano-fish-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
fit();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🐟', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Nano Ai Fish Eat Fish 🐟', 'nano-ai-fisheat-2026', html)
}

async function sendRich(conn, chat, title, rid, htmlPayload) {
  const payload = {
    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: {} },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: title }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              response_id: rid,
              sections: [{ view_model: { primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: htmlPayload, trusted_sources: [] }, __typename: 'GenAISingleLayoutViewModel' } }],
            })).toString('base64'),
          },
          contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' }, forwardOrigin: 4 },
        },
      },
    },
  }
  await conn.relayMessage(chat, payload, {})
}

handler.help = ['fisheat', 'fisheatfish', 'ikan']
handler.tags = ['game']
handler.command = /^(fisheat|fisheatfish|ikan)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Fish Eat Fish HD - D-pad 4 arah atau geser, ikan sprite HD 5 spesies, evolusi 5 tahap'

export default handler
