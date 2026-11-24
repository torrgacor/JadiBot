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
<meta name="theme-color" content="#0a1013">
<title>Nano Kocok Dadu</title>
<style>
:root{--bg:#0a1013;--bg2:#101a20;--panel:#131e25;--panel2:#18242d;--line:#27353e;--ink:#e9eef1;--muted:#8b9aa3;--gold:#d9b26a;--gold2:#7d6230;--jade:#3f8f79;--red:#c8564b;--felt:#0d3b33}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;min-height:100%;background:radial-gradient(circle at 50% -18%,#16242c 0,#0d151b 42%,#080d10 100%);color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{padding:max(8px,env(safe-area-inset-top)) max(8px,env(safe-area-inset-right)) max(10px,env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));overflow-x:hidden}
.app{width:min(100%,620px);margin:0 auto}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.mark{width:44px;height:44px;flex:0 0 auto;display:grid;place-items:center;border:1px solid #37474f;border-radius:13px;background:linear-gradient(150deg,#1d2b33,#121b21);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 8px 18px rgba(0,0,0,.5);font-size:22px}
.eyebrow{color:#7c8b94;font-size:6.8px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
.title{font-size:19px;font-weight:900;letter-spacing:-.3px;line-height:1.1}
.sub{margin-top:2px;color:var(--muted);font-size:7.6px;line-height:1.35}
.tot{min-width:96px;padding:6px 11px;border:1px solid #3a4a46;border-radius:12px;background:linear-gradient(150deg,#16241f,#0e1714);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 8px 18px rgba(0,0,0,.45);text-align:right}
.totLbl{color:#7f8f88;font-size:6.4px;font-weight:800;letter-spacing:1.3px}
.totVal{font-size:23px;font-weight:900;line-height:1.05;color:#f2e2bd;text-shadow:0 0 16px rgba(217,178,106,.35)}
.totVal small{font-size:9px;color:#8d9b95;font-weight:800}
.deck{padding:8px;border:1px solid #22303a;border-radius:18px;background:linear-gradient(180deg,#0f1a20,#0b1418);box-shadow:0 18px 40px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.05)}
.stage{position:relative;width:100%;aspect-ratio:1.42/1;max-height:46vh;overflow:hidden;border:1px solid #3c4a44;border-radius:15px;background:radial-gradient(120% 96% at 50% 8%,#17332c,#0a2420 46%,#061413 100%);box-shadow:inset 0 0 0 2px rgba(217,178,106,.16),inset 0 -10px 26px rgba(0,0,0,.65),0 14px 30px rgba(0,0,0,.5)}
.stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:manipulation}
.badge{position:absolute;z-index:3;top:8px;left:8px;padding:5px 9px;border:1px solid #42554e;border-radius:999px;background:#061412d8;color:#cfe0d8;font-size:6.6px;font-weight:900;letter-spacing:1.1px;pointer-events:none}
.badge.live{color:#f0dcae;border-color:#5c4f30;background:#1a1408e0}
.ruby{position:absolute;z-index:3;top:8px;right:8px;display:flex;gap:4px;pointer-events:none}
.ruby span{padding:5px 8px;border:1px solid #3c4a44;border-radius:999px;background:#061412d8;color:#9fb0a9;font-size:6.4px;font-weight:800}
.combo{position:absolute;z-index:4;left:50%;top:26%;transform:translate(-50%,-50%) scale(.6);opacity:0;padding:7px 14px;border:1px solid #6b5527;border-radius:999px;background:linear-gradient(150deg,#3d2f10,#241c08);color:#ffe9b4;font-size:11px;font-weight:900;letter-spacing:1.6px;box-shadow:0 0 26px rgba(217,178,106,.5),inset 0 1px 0 rgba(255,255,255,.2);pointer-events:none;transition:transform .26s cubic-bezier(.2,1.5,.4,1),opacity .22s ease}
.combo.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.hint{position:absolute;z-index:3;left:8px;right:8px;bottom:8px;text-align:center;color:#a9bab2;font-size:6.8px;font-weight:700;text-shadow:0 1px 4px #000;pointer-events:none}
.tap{position:absolute;z-index:2;inset:0;cursor:pointer}
.vals{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:8px;min-height:30px}
.chip{display:flex;align-items:center;gap:5px;padding:5px 9px;border:1px solid #2e3d45;border-radius:9px;background:linear-gradient(150deg,#17232a,#111a20);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 4px 10px rgba(0,0,0,.4);font-size:9.5px;font-weight:900}
.chip i{display:grid;place-items:center;width:17px;height:17px;border-radius:6px;background:#101a20;border:1px solid #33434b;color:#8fa0a8;font-size:6.4px;font-style:normal;font-weight:800}
.chip b{color:#f0e2c2}
.chip.pop{animation:pop .34s cubic-bezier(.2,1.6,.4,1)}
@keyframes pop{0%{transform:scale(.7);opacity:.2}62%{transform:scale(1.09)}100%{transform:scale(1)}}
.panel{margin-top:8px;padding:9px;border:1px solid #25333c;border-radius:13px;background:linear-gradient(180deg,#111c23,#0d161c);box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}
.row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);gap:8px}
.field{min-width:0}
.fl{display:block;margin-bottom:5px;color:#7f8f98;font-size:6.4px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase}
.step{display:flex;align-items:center;gap:6px}
.step button{width:40px;min-height:38px;border:1px solid #33434b;border-radius:11px;background:linear-gradient(150deg,#1b2830,#131d23);color:#dbe4e8;font-size:17px;font-weight:900;box-shadow:inset 0 2px 0 rgba(255,255,255,.12),inset 0 -3px 5px rgba(0,0,0,.4),0 4px 0 rgba(0,0,0,.4),0 7px 14px rgba(0,0,0,.35);touch-action:manipulation}
.step button:disabled{opacity:.4}
.step b{flex:1;text-align:center;font-size:15px;font-weight:900;color:#f0e6cd}
.kinds{display:flex;flex-wrap:wrap;gap:4px}
.kind{flex:1 1 auto;min-width:38px;min-height:38px;border:1px solid #2d3c44;border-radius:10px;background:linear-gradient(150deg,#16222a,#101a20);color:#93a3ab;font:900 9px system-ui;box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 3px 8px rgba(0,0,0,.35);touch-action:manipulation}
.kind.on{border-color:#6d5a2d;background:linear-gradient(150deg,#33290f,#1e1707);color:#ffe6b0;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 0 18px rgba(217,178,106,.28),0 3px 8px rgba(0,0,0,.4)}
.quick{display:flex;align-items:center;gap:5px;margin-top:7px}
.qLbl{flex:0 0 auto;color:#7f8f98;font-size:6.4px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase}
.qbtn{flex:1 1 auto;min-height:34px;border:1px solid #2d3c44;border-radius:9px;background:linear-gradient(150deg,#16222a,#101a20);color:#a8b6be;font:900 10px system-ui;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 3px 8px rgba(0,0,0,.35);touch-action:manipulation}
.qbtn.on{border-color:#6d5a2d;background:linear-gradient(150deg,#33290f,#1e1707);color:#ffe6b0;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 0 16px rgba(217,178,106,.3),0 3px 8px rgba(0,0,0,.4)}
.vals.many .chip{padding:4px 7px;font-size:8.6px}
.vals.many .chip i{width:14px;height:14px;font-size:5.6px}
.roll{position:relative;overflow:hidden;width:100%;min-height:56px;margin-top:9px;border:1px solid #7b6330;border-radius:15px;background:linear-gradient(180deg,#4a3a16,#2c220c 62%,#201807);color:#ffeec2;font:900 15px/1 system-ui;letter-spacing:1.4px;box-shadow:inset 0 2px 0 rgba(255,255,255,.24),inset 0 -4px 8px rgba(0,0,0,.5),0 6px 0 #120d04,0 12px 22px rgba(0,0,0,.5);touch-action:manipulation;animation:breathe 2.6s ease-in-out infinite}
@keyframes breathe{0%,100%{box-shadow:inset 0 2px 0 rgba(255,255,255,.24),inset 0 -4px 8px rgba(0,0,0,.5),0 6px 0 #120d04,0 12px 22px rgba(0,0,0,.5),0 0 0 rgba(217,178,106,0)}50%{box-shadow:inset 0 2px 0 rgba(255,255,255,.24),inset 0 -4px 8px rgba(0,0,0,.5),0 6px 0 #120d04,0 12px 22px rgba(0,0,0,.5),0 0 26px rgba(217,178,106,.34)}}
.roll:active{transform:translateY(2px) scale(.995)}
.roll.busy{animation:none;filter:saturate(.7) brightness(.82)}
.roll span{position:relative;z-index:2}
.roll:before{content:"";position:absolute;top:-60%;left:-30%;width:44%;height:220%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.24),rgba(255,255,255,0));transform:rotate(18deg);animation:sweep 3.4s ease-in-out infinite}
@keyframes sweep{0%,64%{left:-40%}100%{left:130%}}
.row2{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.mini{min-height:37px;border:1px solid #2c3a42;border-radius:10px;background:linear-gradient(150deg,#16222a,#101a20);color:#c3ced4;font:800 8px system-ui;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 3px 8px rgba(0,0,0,.35);touch-action:manipulation}
.mini.off{color:#77868e;filter:saturate(.5)}
.mini:active{transform:translateY(1px)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px}
.stat{min-width:0;padding:8px 4px;border:1px solid #25333c;border-radius:11px;background:linear-gradient(180deg,#111c23,#0d161c);text-align:center}
.stat b{display:block;font-size:13px;line-height:1.1;color:#efe4ca}
.stat span{display:block;margin-top:3px;color:#7b8a92;font-size:5.8px;font-weight:800;letter-spacing:.6px;text-transform:uppercase}
.hist{margin-top:8px}
.hHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px}
.hTitle{font-size:8.4px;font-weight:900;letter-spacing:.7px}
.hSub{color:#7b8a92;font-size:6.4px}
.rows{display:grid;gap:5px;max-height:168px;overflow-y:auto}
.hrow{display:grid;grid-template-columns:minmax(0,58px) minmax(0,1fr) minmax(0,44px);align-items:center;gap:7px;padding:7px 9px;border:1px solid #24323a;border-radius:10px;background:linear-gradient(150deg,#121d23,#0e171c);animation:slide .26s ease}
@keyframes slide{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.hKind{color:#8c9ba3;font-size:6.6px;font-weight:900}
.hVals{color:#c8d3d8;font-size:8.4px;font-weight:800;letter-spacing:1.2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hTot{text-align:right;color:#f0e0ba;font-size:11px;font-weight:900}
.emptyHist{padding:14px;border:1px dashed #2a3841;border-radius:11px;color:#7e8d95;text-align:center;font-size:7.4px;line-height:1.5}
.note{margin-top:8px;color:#7d8c94;text-align:center;font-size:6.6px;line-height:1.5}
.toast{position:fixed;left:50%;bottom:14px;z-index:30;max-width:90vw;padding:8px 11px;border:1px solid #465a52;border-radius:999px;background:#071412f2;color:#eef3ef;font-size:7.4px;font-weight:800;opacity:0;pointer-events:none;transform:translate(-50%,12px);transition:opacity .15s ease,transform .15s ease}
.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:420px){body{padding:7px}.mark{width:40px;height:40px;font-size:20px}.title{font-size:17px}.sub{font-size:7px}.tot{min-width:84px}.totVal{font-size:20px}.deck{padding:7px;border-radius:16px}.stage{aspect-ratio:1.32/1}.row{grid-template-columns:1fr}.row2{grid-template-columns:1fr 1fr}.stats{grid-template-columns:1fr 1fr}.roll{min-height:52px;font-size:13.5px}}
@media(max-width:340px){.row2{grid-template-columns:1fr 1fr}.kinds .kind{min-width:34px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<div class="app">
<div class="top">
<div class="brand">
<div class="mark">🎲</div>
<div><div class="eyebrow">Nano Dice Table</div><div class="title">Kocok Dadu</div><div class="sub" id="sub">Ketuk meja untuk mengocok dadu.</div></div>
</div>
<div class="tot"><div class="totLbl">TOTAL</div><div class="totVal"><span id="total">0</span><small id="totalMax"></small></div></div>
</div>
<div class="deck">
<div class="stage" id="stage">
<canvas id="cv"></canvas>
<div class="badge" id="stateBadge">SIAP</div>
<div class="ruby"><span id="rubyKind">D6</span><span id="rubyCount">1 DADU</span></div>
<div class="combo" id="combo">SERAGAM!</div>
<div class="hint" id="hint">Ketuk meja atau tekan KOCOK</div>
<div class="tap" id="tap"></div>
</div>
<div class="vals" id="vals"></div>
<div class="panel">
<div class="row">
<div class="field"><span class="fl">Jumlah dadu</span>
<div class="step"><button id="minus" type="button" aria-label="Kurangi dadu">−</button><b id="count">1</b><button id="plus" type="button" aria-label="Tambah dadu">+</button></div>
</div>
<div class="field"><span class="fl">Jenis dadu</span>
<div class="kinds" id="kinds"></div>
</div>
</div>
<div class="quick" id="quick"><span class="qLbl">Cepat</span><button class="qbtn" type="button" data-n="1">1</button><button class="qbtn" type="button" data-n="2">2</button><button class="qbtn" type="button" data-n="4">4</button><button class="qbtn" type="button" data-n="8">8</button><button class="qbtn" type="button" data-n="12">12</button></div>
<button class="roll" id="roll" type="button"><span>🎲 KOCOK DADU</span></button>
<div class="row2">
<button class="mini" id="again" type="button">↻ Ulang</button>
<button class="mini" id="snd" type="button">🔊 Suara</button>
<button class="mini" id="vib" type="button">📳 Getar</button>
<button class="mini" id="clear" type="button">🧹 Riwayat</button>
</div>
</div>
<div class="stats">
<div class="stat"><b id="stRoll">0</b><span>Kocokan</span></div>
<div class="stat"><b id="stSum">0</b><span>Total Angka</span></div>
<div class="stat"><b id="stAvg">0</b><span>Rata-rata</span></div>
<div class="stat"><b id="stBest">0</b><span>Tertinggi</span></div>
</div>
<div class="panel hist">
<div class="hHead"><div class="hTitle">RIWAYAT KOCOKAN</div><div class="hSub" id="hSub">belum ada</div></div>
<div class="rows" id="rows"></div>
</div>
<div class="note" id="note">Dadu digambar 3D penuh (bukan gambar): D4, D6, D8, D10, D12, D20 — sampai 12 dadu sekali kocok. Lemparan berputar cepat dengan efek kabur gerak, lalu berhenti satu per satu. Khusus D4, nilai dibaca dari sisi yang menyentuh meja.</div>
</div>
</div>
<div class="toast" id="toast"></div>
<script>
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var stage=$('stage'), cv=$('cv'), ctx=cv.getContext('2d');
var UI={total:$('total'),totalMax:$('totalMax'),count:$('count'),kinds:$('kinds'),vals:$('vals'),rows:$('rows'),hSub:$('hSub'),roll:$('roll'),badge:$('stateBadge'),hint:$('hint'),combo:$('combo'),rubyKind:$('rubyKind'),rubyCount:$('rubyCount'),sub:$('sub'),note:$('note'),toast:$('toast'),stRoll:$('stRoll'),stSum:$('stSum'),stAvg:$('stAvg'),stBest:$('stBest'),minus:$('minus'),plus:$('plus'),quick:$('quick'),again:$('again'),snd:$('snd'),vib:$('vib'),clear:$('clear'),tap:$('tap')};

/* ── vektor & kuaternion ─────────────────────────────────────────── */
var UP=[0,1,0], WORLD_Z=[0,0,1];
function V(x,y,z){return [x,y,z]}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]}
function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]}
function mul(a,s){return [a[0]*s,a[1]*s,a[2]*s]}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}
function len(a){return Math.sqrt(dot(a,a))}
function nrm(a){var l=len(a)||1;return [a[0]/l,a[1]/l,a[2]/l]}
function clamp(v,a,b){return v<a?a:(v>b?b:v)}
function lerp(a,b,t){return a+(b-a)*t}
function qMul(a,b){return [
a[0]*b[0]-a[1]*b[1]-a[2]*b[2]-a[3]*b[3],
a[0]*b[1]+a[1]*b[0]+a[2]*b[3]-a[3]*b[2],
a[0]*b[2]-a[1]*b[3]+a[2]*b[0]+a[3]*b[1],
a[0]*b[3]+a[1]*b[2]-a[2]*b[1]+a[3]*b[0]]}
function qNorm(q){var l=Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3])||1;return [q[0]/l,q[1]/l,q[2]/l,q[3]/l]}
function qAxis(ax,ang){var h=ang/2,s=Math.sin(h);return [Math.cos(h),ax[0]*s,ax[1]*s,ax[2]*s]}
function qRot(q,v){
var w=q[0],x=q[1],y=q[2],z=q[3],vx=v[0],vy=v[1],vz=v[2];
var tx=2*(y*vz-z*vy),ty=2*(z*vx-x*vz),tz=2*(x*vy-y*vx);
return [vx+w*tx+(y*tz-z*ty),vy+w*ty+(z*tx-x*tz),vz+w*tz+(x*ty-y*tx)]}
function qFromTo(a,b){
a=nrm(a);b=nrm(b);
var d=dot(a,b);
if(d>0.999999)return [1,0,0,0];
if(d<-0.999999){var any=Math.abs(a[0])<0.9?V(1,0,0):V(0,1,0);return qAxis(nrm(cross(a,any)),Math.PI)}
var c=cross(a,b),s=Math.sqrt((1+d)*2);
return qNorm([s/2,c[0]/s,c[1]/s,c[2]/s])}
function qSlerp(a,b,t){
var d=a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3],bb=b;
if(d<0){bb=[-b[0],-b[1],-b[2],-b[3]];d=-d}
if(d>0.9995)return qNorm([a[0]+(bb[0]-a[0])*t,a[1]+(bb[1]-a[1])*t,a[2]+(bb[2]-a[2])*t,a[3]+(bb[3]-a[3])*t]);
var th=Math.acos(d),s=Math.sin(th),A=Math.sin((1-t)*th)/s,B=Math.sin(t*th)/s;
return [a[0]*A+bb[0]*B,a[1]*A+bb[1]*B,a[2]*A+bb[2]*B,a[3]*A+bb[3]*B]}

/* ── mesin polyhedra: hull dari daftar titik → muka datar ────────── */
function faceFromPoly(poly,normal,d){
var i,c=[0,0,0];
for(i=0;i<poly.length;i++)c=add(c,poly[i]);
c=mul(c,1/poly.length);
var u=nrm(sub(poly[0],c)),v=cross(normal,u);
poly.sort(function(a,b){
var aa=Math.atan2(dot(sub(a,c),v),dot(sub(a,c),u));
var bb=Math.atan2(dot(sub(b,c),v),dot(sub(b,c),u));
return aa-bb});
var R=0,apo=1e9;
for(i=0;i<poly.length;i++)R=Math.max(R,len(sub(poly[i],c)));
for(i=0;i<poly.length;i++){
var a=poly[i],b=poly[(i+1)%poly.length];
var e=sub(b,a),t=Math.abs(dot(sub(c,a),e))/(len(e)||1);
apo=Math.min(apo,t)}
return {poly:poly,n:normal,c:c,u:u,v:v,R:R,apo:apo,value:0}}
function hullFaces(verts){
var eps=1e-6,planes=[],faces=[],n=verts.length,i,j,k,m;
function sudahAda(normal,d){
for(var q=0;q<planes.length;q++){
if(dot(planes[q].n,normal)>0.99985&&Math.abs(planes[q].d-d)<2e-3)return true}
planes.push({n:normal,d:d});
return false}
for(i=0;i<n;i++)for(j=i+1;j<n;j++)for(k=j+1;k<n;k++){
var normal=cross(sub(verts[j],verts[i]),sub(verts[k],verts[i]));
if(dot(normal,normal)<1e-12)continue;
normal=nrm(normal);
var d=dot(normal,verts[i]),pos=0,neg=0;
for(m=0;m<n;m++){var s=dot(normal,verts[m])-d;if(s>eps)pos++;else if(s<-eps)neg++}
if(pos&&neg)continue;
if(pos){normal=mul(normal,-1);d=-d}
var poly=[];
for(m=0;m<n;m++)if(Math.abs(dot(normal,verts[m])-d)<1e-4)poly.push(verts[m]);
if(poly.length<3)continue;
if(sudahAda(normal,d))continue;
faces.push(faceFromPoly(poly,normal,d))}
return faces}
function pairOpposites(faces){
/* sisi "berhadapan" = normal paling ANTI-paralel (dot paling kecil).
   Salah pakai dot paling besar membuat pasangan ngawur (D10/D12/D20). */
var i,j;
for(i=0;i<faces.length;i++){
var best=-1,bd=2;
for(j=0;j<faces.length;j++){
if(j===i)continue;
var dd=dot(faces[i].n,faces[j].n);
if(dd<bd){bd=dd;best=j}}
if(best>=0&&bd<-0.98)faces[i].opp=best}}
var PHI=(1+Math.sqrt(5))/2;
function cubeVertices(){var o=[-1,1],v=[],i,j,k;for(i=0;i<2;i++)for(j=0;j<2;j++)for(k=0;k<2;k++)v.push(V(o[i],o[j],o[k]));return v}
function tetraVertices(){return [V(1,1,1),V(1,-1,-1),V(-1,1,-1),V(-1,-1,1)]}
function octaVertices(){return [V(1,0,0),V(-1,0,0),V(0,1,0),V(0,-1,0),V(0,0,1),V(0,0,-1)]}
function icosaVertices(){var v=[],i,j;for(i=0;i<2;i++)for(j=0;j<2;j++){
v.push(V(0,i?1:-1,j?PHI:-PHI));
v.push(V(i?1:-1,j?PHI:-PHI,0));
v.push(V(j?PHI:-PHI,0,i?1:-1))}
return v}
function dodecaVertices(){var v=[],i,j,k,a=1/PHI;
for(i=-1;i<=1;i+=2)for(j=-1;j<=1;j+=2)for(k=-1;k<=1;k+=2)v.push(V(i,j,k));
var pats=[[0,a,PHI],[0,a,-PHI],[0,-a,PHI],[0,-a,-PHI]];
var perms=[[0,1,2],[1,2,0],[2,0,1]];
for(var p=0;p<3;p++)for(var q=0;q<4;q++){
var t=[0,0,0];t[perms[p][0]]=pats[q][0];t[perms[p][1]]=pats[q][1];t[perms[p][2]]=pats[q][2];v.push(t)}
return v}
function trapezoVertices(){
var h=0.16,R=1,i,U=[],L=[],a1,a2;
for(i=0;i<5;i++){a1=i*2*Math.PI/5;U.push(V(R*Math.cos(a1),h,R*Math.sin(a1)))}
for(i=0;i<5;i++){a2=(i+0.5)*2*Math.PI/5;L.push(V(R*Math.cos(a2),-h,R*Math.sin(a2)))}
/* tinggi puncak HARUS memenuhi syarat sisi layang-layang datar:
   bidang lewat U0, L0, U1 wajib memuat puncak (0,c,0). Kalau tidak,
   hull pecah jadi 20 segitiga (bukan dadu D10). */
var nb=cross(sub(L[0],U[0]),sub(U[1],U[0]));
var c=dot(nb,U[0])/nb[1];
return [V(0,c,0),V(0,-c,0)].concat(U).concat(L)}
var PIP_R=0.158;
var PIPS={1:[[0,0]],2:[[-0.5,0.5],[0.5,-0.5]],3:[[-0.5,0.5],[0,0],[0.5,-0.5]],
4:[[-0.5,-0.5],[-0.5,0.5],[0.5,-0.5],[0.5,0.5]],
5:[[-0.5,-0.5],[-0.5,0.5],[0,0],[0.5,-0.5],[0.5,0.5]],
6:[[-0.5,-0.5],[-0.5,0],[-0.5,0.5],[0.5,-0.5],[0.5,0],[0.5,0.5]]};
var CACHE={};
function buildDie(kind){
if(CACHE[kind])return CACHE[kind];
var verts,faces,pips=(kind==='D6');
if(kind==='D4')verts=tetraVertices();
else if(kind==='D6')verts=cubeVertices();
else if(kind==='D8')verts=octaVertices();
else if(kind==='D10')verts=trapezoVertices();
else if(kind==='D12')verts=dodecaVertices();
else verts=icosaVertices();
var scale=1/Math.max.apply(null,verts.map(function(v){return len(v)}));
verts=verts.map(function(v){return mul(v,scale)});
faces=hullFaces(verts);
faces.sort(function(a,b){
var ka=a.n[1].toFixed(3)+'|'+a.n[0].toFixed(3)+'|'+a.n[2].toFixed(3);
var kb=b.n[1].toFixed(3)+'|'+b.n[0].toFixed(3)+'|'+b.n[2].toFixed(3);
return ka<kb?-1:(ka>kb?1:0)});
pairOpposites(faces);
var F=faces.length,i;
if(kind==='D6'){
for(i=0;i<F;i++){
var n=faces[i].n;
if(n[1]>0.9)faces[i].value=2;
else if(n[1]<-0.9)faces[i].value=5;
else if(n[0]>0.9)faces[i].value=1;
else if(n[0]<-0.9)faces[i].value=6;
else if(n[2]>0.9)faces[i].value=3;
else faces[i].value=4}
}else if(kind==='D4'){
for(i=0;i<F;i++)faces[i].value=i+1;
}else{
var next=1;
for(i=0;i<F;i++){
if(faces[i].value)continue;
faces[i].value=next;
if(faces[i].opp!==undefined&&!faces[faces[i].opp].value)faces[faces[i].opp].value=F+1-next;
next++}
for(i=0;i<F;i++)if(!faces[i].value)faces[i].value=next++;
}
var rest=1e9;
for(i=0;i<F;i++)rest=Math.min(rest,dot(faces[i].n,faces[i].c));
var die={kind:kind,verts:verts,faces:faces,count:F,pips:pips,rest:rest,radius:1};
CACHE[kind]=die;
return die}
function faceByValue(die,val){for(var i=0;i<die.faces.length;i++)if(die.faces[i].value===val)return die.faces[i];return die.faces[0]}
function restQuat(die,val){
var f=faceByValue(die,val);
var align=(die.kind==='D4')?qFromTo(mul(f.n,-1),UP):qFromTo(f.n,UP);
var wv=qRot(align,f.v);
var ang=-Math.atan2(wv[0],wv[2]);
var q=qMul(qAxis(UP,ang),align);
if(die.pips)q=qMul(qAxis(UP,(Math.random()-0.5)*0.26),q);
return qNorm(q)}
function dieValue(die,q){
var best=null,bv=(die.kind==='D4')?2:-2;
for(var i=0;i<die.faces.length;i++){
var wy=qRot(q,die.faces[i].n)[1];
if(die.kind==='D4'){if(wy<bv){bv=wy;best=die.faces[i]}}
else if(wy>bv){bv=wy;best=die.faces[i]}}
return best?best.value:1}

/* ── kamera & kanvas ─────────────────────────────────────────────── */
var TX=6.1,TZ=4.4;
var cam={eye:V(0,7.4,-9.6),target:V(0,0.35,0.35),fov:42};
var view={},cssW=300,cssH=210,dpr=1,F=420,cx=150,cy=105,tableCv=null;
function recomputeView(){
var f=nrm(sub(cam.target,cam.eye));
var r=nrm(cross(f,UP));
var u=cross(r,f);
view={f:f,r:r,u:u};
F=(cssH/2)/Math.tan(cam.fov*Math.PI/180/2);
cx=cssW/2;cy=cssH/2}
function proj(p){
var rel=sub(p,cam.eye);
var zv=dot(rel,view.f);
if(zv<0.05)zv=0.05;
return [cx+dot(rel,view.r)*F/zv, cy-dot(rel,view.u)*F/zv, zv]}
/* dipakai sekali waktu menyiapkan meja (bukan tiap bingkai) */
function projectPoly(pts){var out=[],i;for(i=0;i<pts.length;i++)out.push(proj(pts[i]));return out}
function worldAt(die,local){var rot=qRot(die.q,local);return [die.x+rot[0]*sim.scale,die.y+rot[1]*sim.scale,die.z+rot[2]*sim.scale]}
function resize(){
var rect=stage.getBoundingClientRect();
cssW=Math.max(80,rect.width);cssH=Math.max(70,rect.height);
dpr=Math.min(2,Math.max(1,Math.round(window.devicePixelRatio||1)));
if(degrade)dpr=1;
cv.width=Math.round(cssW*dpr);cv.height=Math.round(cssH*dpr);
cv.style.width=cssW+'px';cv.style.height=cssH+'px';
ctx.setTransform(dpr,0,0,dpr,0,0);
recomputeView();
buildTable();
draw()}
function buildTable(){
var w=Math.round(cssW*dpr),h=Math.round(cssH*dpr);
if(w<8||h<8)return;
tableCv=document.createElement('canvas');
tableCv.width=w;tableCv.height=h;
var c=tableCv.getContext('2d');
c.setTransform(dpr,0,0,dpr,0,0);
var quad=projectPoly([V(-TX,0,-TZ),V(TX,0,-TZ),V(TX,0,TZ),V(-TX,0,TZ)]);
c.save();
c.beginPath();
c.moveTo(quad[0][0],quad[0][1]);
for(var i=1;i<4;i++)c.lineTo(quad[i][0],quad[i][1]);
c.closePath();
c.clip();
c.fillStyle='#0d3b33';
c.fillRect(0,0,cssW,cssH);
var g1=c.createRadialGradient(cx-0.13*cssW,cy-0.3*cssH,4,cx-0.13*cssW,cy-0.3*cssH,cssW*0.86);
g1.addColorStop(0,'rgba(255,246,214,.20)');
g1.addColorStop(0.45,'rgba(180,220,200,.05)');
g1.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=g1;c.fillRect(0,0,cssW,cssH);
var z,x,i2;
c.lineWidth=1;
c.strokeStyle='rgba(255,255,255,.028)';
c.beginPath();
for(z=-TZ;z<=TZ+0.001;z+=0.46){var a=proj(V(-TX,0,z)),b=proj(V(TX,0,z));c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1])}
for(x=-TX;x<=TX+0.001;x+=0.46){var a2=proj(V(x,0,-TZ)),b2=proj(V(x,0,TZ));c.moveTo(a2[0],a2[1]);c.lineTo(b2[0],b2[1])}
c.stroke();
c.strokeStyle='rgba(217,178,106,.16)';
c.lineWidth=1.2;
for(i2=0;i2<2;i2++){
var rr=1.55+i2*0.24,pts=[];
for(var t=0;t<48;t++){var an=t*Math.PI/24;pts.push(proj(V(Math.cos(an)*rr,0,Math.sin(an)*rr)))}
c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
for(var t2=1;t2<48;t2++)c.lineTo(pts[t2][0],pts[t2][1]);
c.closePath();c.stroke()}
var g2=c.createRadialGradient(cx,cy,cssH*0.28,cx,cy,Math.max(cssW,cssH)*0.72);
g2.addColorStop(0,'rgba(0,0,0,0)');
g2.addColorStop(1,'rgba(0,0,0,.55)');
c.fillStyle=g2;c.fillRect(0,0,cssW,cssH);
c.restore();
c.save();
c.beginPath();
c.moveTo(quad[0][0],quad[0][1]);
for(var q2=1;q2<4;q2++)c.lineTo(quad[q2][0],quad[q2][1]);
c.closePath();
c.lineWidth=5;c.strokeStyle='rgba(0,0,0,.5)';c.stroke();
c.lineWidth=2.4;c.strokeStyle='rgba(217,178,106,.5)';c.stroke();
c.lineWidth=1;c.strokeStyle='rgba(255,236,190,.22)';c.stroke();
c.restore()}

/* ── suara ───────────────────────────────────────────────────────── */
var actx=null,soundOn=true,vibOn=true,noiseBuf=null;
function audio(){
try{
if(!actx){var C=window.AudioContext||window.webkitAudioContext;if(!C)return null;actx=new C()}
if(actx.state==='suspended')actx.resume()}
catch(e){actx=null}
return actx}
function noise(){
if(noiseBuf)return noiseBuf;
var a=audio();if(!a)return null;
var n=Math.floor(a.sampleRate*0.35),b=a.createBuffer(1,n,a.sampleRate),ch=b.getChannelData(0);
for(var i=0;i<n;i++)ch[i]=Math.random()*2-1;
noiseBuf=b;return b}
function click(vol,freq,dur,type){
if(!soundOn)return;
var a=audio();if(!a)return;
try{
var o=a.createOscillator(),g=a.createGain(),t=a.currentTime;
o.type=type||'triangle';
o.frequency.setValueAtTime(freq,t);
o.frequency.exponentialRampToValueAtTime(Math.max(80,freq*0.45),t+dur);
g.gain.setValueAtTime(vol,t);
g.gain.exponentialRampToValueAtTime(0.0008,t+dur);
o.connect(g);g.connect(a.destination);
o.start(t);o.stop(t+dur+0.02)}catch(e){}}
function clack(vol){
if(!soundOn)return;
var a=audio(),buf=noise();
if(!a||!buf)return;
try{
var s=a.createBufferSource(),bp=a.createBiquadFilter(),g=a.createGain(),t=a.currentTime;
s.buffer=buf;
bp.type='bandpass';bp.frequency.value=1500+Math.random()*1400;bp.Q.value=1.1;
g.gain.setValueAtTime(Math.min(0.3,vol),t);
g.gain.exponentialRampToValueAtTime(0.0007,t+0.09);
s.connect(bp);bp.connect(g);g.connect(a.destination);
s.start(t);s.stop(t+0.12)}catch(e){}}
function buzz(ms){if(vibOn&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}}
function sfxRoll(){click(0.05,320,0.28,'sine')}
function sfxBounce(v){var vol=clamp(v*0.035,0.03,0.26);clack(vol);buzz(8)}
function sfxSettle(){clack(0.22);click(0.05,880,0.1,'triangle');buzz(14)}
function sfxWin(){click(0.06,660,0.14,'triangle');setTimeout(function(){click(0.06,880,0.14,'triangle')},110);setTimeout(function(){click(0.06,1180,0.22,'triangle')},220)}

/* ── simulasi ────────────────────────────────────────────────────── */
var KINDS={D4:'D4',D6:'D6',D8:'D8',D10:'D10',D12:'D12',D20:'D20'};
var TUMBLE=1240,SETLK=520,STAG=85,GRAV=30,MAXDADU=12;
var sim={phase:'idle',kind:'D6',count:1,dice:[],t:0,scale:1.2,rolls:0,sum:0,best:0,history:[],last:null,shake:0};
var manual=false,lastFrame=0,loopOn=false,degrade=false,smearOff=false;
function dieScale(count){
if(count<=1)return 1.62;
if(count===2)return 1.5;
if(count===3)return 1.38;
if(count===4)return 1.26;
if(count===5)return 1.16;
if(count<=6)return 1.08;
return Math.max(0.7,1.05-(count-6)*0.032)}
function layout(){
var n=sim.count,i;
sim.scale=dieScale(n);
var cols=n<=3?n:(n<=6?3:4),rows=Math.ceil(n/cols);
/* 7-12 dadu = 3 baris; kamera ditarik mundur & dinaikkan supaya semua masuk frame */
var t=clamp((n-6)/6,0,1);
var we=[0,7.4+t*2.3,-9.6-t*2.9],wt=[0,0.35+t*0.12,0.35-t*0.55];
if(Math.abs(cam.eye[1]-we[1])>0.001||Math.abs(cam.eye[2]-we[2])>0.001){
cam.eye=V(we[0],we[1],we[2]);
cam.target=V(wt[0],wt[1],wt[2]);
recomputeView();
buildTable()}
var spx=2*sim.scale*1.5,spz=2*sim.scale*1.62;
for(i=0;i<n;i++){
var col=i%cols,row=Math.floor(i/cols);
var d=sim.dice[i];    d.rx=(col-(cols-1)/2)*spx;
    d.rz=(row-(rows-1)/2)*spz+0.25;
    d.rest=buildDie(sim.kind).rest*sim.scale+0.002}
}
function makeDice(values){
var kind=buildDie(sim.kind),n=sim.count,i;
sim.dice=[];
for(i=0;i<n;i++){
var val=values&&values[i]!==undefined?Math.round(values[i]):1+Math.floor(Math.random()*kind.count);
val=clamp(val,1,kind.count);
sim.dice.push({value:val,mode:'rest',x:0,y:0,z:0,rx:0,rz:0,rest:1,vx:0,vy:0,vz:0,w:V(0,0,0),q:[1,0,0,0],q0:[1,0,0,0],qT:[1,0,0,0],x0:0,z0:0,y0:0,st:0,loud:0})}
layout();
for(i=0;i<n;i++){
var d=sim.dice[i];
d.q=restQuat(kind,d.value);
d.x=d.rx;d.z=d.rz;d.y=d.rest}
sim.last=sim.dice.map(function(d){return d.value})}
function roll(values){
if(sim.phase!=='idle')return false;
var kind=buildDie(sim.kind),n=sim.count,i;
sim.phase='spin';sim.t=0;
sim.shake=0;
UI.combo.classList.remove('on');
UI.badge.textContent='MENGCOK';UI.badge.classList.add('live');
UI.roll.classList.add('busy');
sim.dice=[];
for(i=0;i<n;i++){
var val=values&&values[i]!==undefined?Math.round(values[i]):1+Math.floor(Math.random()*kind.count);
val=clamp(val,1,kind.count);
/* putaran jauh lebih kencang (26-50 rad/dtk ≈ 4-8 putaran per detik)
   supaya lemparan terasa benar-benar berputar, plus pop ke atas lebih tinggi. */
var d={value:val,mode:'spin',x:(Math.random()-0.5)*3.4,y:1.5+Math.random()*0.9,z:-TZ*0.72-i*0.12,
vx:(Math.random()-0.5)*2.6,vy:4.6+Math.random()*2.4,vz:2.7+Math.random()*1.6,
w:mul(nrm(V(Math.random()-0.5,Math.random()-0.3,Math.random()-0.5)),34+Math.random()*30),
q:[1,0,0,0],q0:[1,0,0,0],qT:[1,0,0,0],x0:0,z0:0,y0:0,st:0,loud:0};
d.q=qNorm([Math.random()-0.5,Math.random()-0.5,Math.random()-0.5,Math.random()-0.5]);
d.qT=restQuat(kind,val);
sim.dice.push(d)}
layout();
sfxRoll();buzz(10);
UI.hint.textContent='Dadu sedang berputar di meja...';
UI.sub.textContent='Menunggu dadu berhenti satu per satu.';
startLoop();
return true}
function stepDie(d,dt){
var i;
d.vy-=GRAV*dt;
d.x+=d.vx*dt;d.y+=d.vy*dt;d.z+=d.vz*dt;
var sp=len(d.w);
if(sp>0.0001)d.q=qNorm(qMul(d.q,qAxis(mul(d.w,1/sp),sp*dt)));
/* gesekan udara: putaran melambat terasa sepanjang dadu melayang */
var fr=1-0.35*dt;
d.w[0]*=fr;d.w[1]*=fr;d.w[2]*=fr;
if(d.y<d.rest){
d.y=d.rest;
if(d.vy<-0.8){var v=-d.vy;d.vy=v*0.38;if(v>2.6){sfxBounce(v);d.loud=1}}
else d.vy=0;
d.vx*=0.93;d.vz*=0.93;
d.w=[d.w[0]*0.965,d.w[1]*0.975,d.w[2]*0.965];
if(len(d.w)<7)d.w=mul(nrm(V(Math.random()-0.5,Math.random()-0.3,Math.random()-0.5)),7.5);
d.vx+=(Math.random()-0.5)*0.35;d.vz+=(Math.random()-0.5)*0.35}
var bx=TX-1.4*sim.scale*0.55,bz=TZ-1.5*sim.scale*0.55;
if(d.x<-bx){d.x=-bx;d.vx=Math.abs(d.vx)*0.55+0.3}
if(d.x>bx){d.x=bx;d.vx=-Math.abs(d.vx)*0.55-0.3}
if(d.z<-bz){d.z=-bz;d.vz=Math.abs(d.vz)*0.55+0.3}
if(d.z>bz){d.z=bz;d.vz=-Math.abs(d.vz)*0.55-0.3}
for(i=0;i<d.w.length;i++)if(!isFinite(d.w[i]))d.w[i]=0;
if(!isFinite(d.x)||!isFinite(d.y)||!isFinite(d.z)){d.x=0;d.y=d.rest;d.z=0;d.vx=d.vy=d.vz=0}}
function collide(){
var n=sim.dice.length,i,j;
for(i=0;i<n;i++)for(j=i+1;j<n;j++){
var a=sim.dice[i],b=sim.dice[j];
if(a.mode!=='spin'&&b.mode!=='spin')continue;
var dx=b.x-a.x,dz=b.z-a.z,rr=sim.scale*1.72,d2=dx*dx+dz*dz;
if(d2<rr*rr&&d2>1e-6){
var dist=Math.sqrt(d2),ov=(rr-dist)*0.5,ux=dx/dist,uz=dz/dist;
a.x-=ux*ov;a.z-=uz*ov;b.x+=ux*ov;b.z+=uz*ov;
var p=(b.vx-a.vx)*ux+(b.vz-a.vz)*uz;
if(p<0){a.vx+=ux*p*0.62;a.vz+=uz*p*0.62;b.vx-=ux*p*0.62;b.vz-=uz*p*0.62}
a.w[1]+=(Math.random()-0.5)*2;b.w[1]+=(Math.random()-0.5)*2}}}
function beginSettle(d){
var kind=buildDie(sim.kind);
d.mode='settle';d.st=0;
var jit=kind.pips?(Math.random()-0.5)*0.2:0;
var f=faceByValue(kind,d.value);
var align=(kind.kind==='D4')?qFromTo(mul(f.n,-1),UP):qFromTo(f.n,UP);
var wv=qRot(align,f.v);
var ang=-Math.atan2(wv[0],wv[2])+jit;
d.qT=qNorm(qMul(qAxis(UP,ang),align));
d.q0=d.q.slice();d.x0=d.x;d.z0=d.z;d.y0=d.y}
function onSettle(d){
d.loud=1;
sfxSettle()}
function advance(dt){
if(sim.phase==='idle')return;
sim.t+=dt;
var i,d,chunk;
for(i=0;i<sim.dice.length;i++){
d=sim.dice[i];
if(d.mode==='spin'&&sim.t<TUMBLE+i*STAG){
/* dt dalam milidetik, stepDie butuh detik: tanpa /1000 setiap bingkai
   melompat ~8 detik fisika sehingga dadu tak pernah terbang & putarannya mati. */
var left=dt/1000;
while(left>0){chunk=Math.min(left,0.004);stepDie(d,chunk);left-=chunk}}
else if(d.mode==='spin')beginSettle(d);
if(d.mode==='settle'){
d.st+=dt;
var u=clamp(d.st/SETLK,0,1),e=1-Math.pow(1-u,3);
d.q=qSlerp(d.q0,d.qT,e);
d.x=lerp(d.x0,d.rx,e);d.z=lerp(d.z0,d.rz,e);
d.y=d.rest+(d.y0-d.rest)*(1-e)+0.2*Math.sin(u*Math.PI)*(1-u);
if(u>=1){d.mode='rest';d.y=d.rest;d.q=d.qT;onSettle(d)}}}
collide();
if(sim.shake>0)sim.shake=Math.max(0,sim.shake-dt*0.004);
var done=true;
for(i=0;i<sim.dice.length;i++)if(sim.dice[i].mode!=='rest')done=false;
if(done)finish()}
function finish(){
sim.phase='idle';
var vals=[],tot=0,i;
for(i=0;i<sim.dice.length;i++){vals.push(sim.dice[i].value);tot+=sim.dice[i].value}
sim.last=vals;
stats.rolls++;stats.sum+=tot;
if(tot>stats.best)stats.best=tot;
sim.history.unshift({kind:sim.kind,vals:vals,total:tot,count:sim.count});
if(sim.history.length>40)sim.history.pop();
var same=sim.count>1;
for(i=1;i<vals.length;i++)if(vals[i]!==vals[0])same=false;
UI.badge.textContent='HASIL';UI.badge.classList.remove('live');
UI.roll.classList.remove('busy');
if(same){UI.combo.textContent=vals[0]+' ×'+sim.count+' SERAGAM!';UI.combo.classList.add('on');sfxWin();buzz(30);sim.shake=1}
else sfxSettle();
UI.hint.textContent=same?'Semua dadu menunjukkan angka yang sama!':'Ketuk meja untuk mengocok lagi.';
UI.sub.textContent=same?'Kombinasi seragam — kocokan hebat!':'Total kocokan terakhir '+tot+'.';
renderChips(vals,true);
renderStats();renderHistory();renderTotal(tot);
stopLoop()}

/* ── gambar ──────────────────────────────────────────────────────── */
var LIGHT=nrm(V(-0.42,0.84,-0.34));
var VIEWDIR=nrm(V(0,0.62,0.78));
var HALF=nrm(add(LIGHT,VIEWDIR));
/* ── proyeksi skalar tanpa alokasi array (dipakai tiap bingkai; dengan 12 dadu
   cara lama membuat ratusan array per bingkai dan bikin tersendat) ────────── */
var PX=0,PY=0,PZ=0,WX=0,WY=0,WZ=0,NX=0,NY=0,NZ=0;
function projLocal(d,lx,ly,lz){
var q=d.q,w=q[0],x=q[1],y=q[2],z=q[3];
var tx=2*(y*lz-z*ly),ty=2*(z*lx-x*lz),tz=2*(x*ly-y*lx);
WX=d.x+(lx+w*tx+(y*tz-z*ty))*sim.scale;
WY=d.y+(ly+w*ty+(z*tx-x*tz))*sim.scale;
WZ=d.z+(lz+w*tz+(x*ty-y*tx))*sim.scale;
var rx=WX-cam.eye[0],ry=WY-cam.eye[1],rz=WZ-cam.eye[2];
var zv=rx*view.f[0]+ry*view.f[1]+rz*view.f[2];
PZ=zv;
if(zv<0.05)zv=0.05;
PX=cx+(rx*view.r[0]+ry*view.r[1]+rz*view.r[2])*F/zv;
PY=cy-(rx*view.u[0]+ry*view.u[1]+rz*view.u[2])*F/zv}
function normLocal(d,lx,ly,lz){
var q=d.q,w=q[0],x=q[1],y=q[2],z=q[3];
var tx=2*(y*lz-z*ly),ty=2*(z*lx-x*lz),tz=2*(x*ly-y*lx);
NX=lx+w*tx+(y*tz-z*ty);
NY=ly+w*ty+(z*tx-x*tz);
NZ=lz+w*tz+(x*ty-y*tx)}
function blurOf(d){
if(d.mode!=='spin')return 0;
return clamp((len(d.w)-11)/28,0,1)*2.4}
/* Bayangan: sprite pra-render sekali, bukan gradien baru tiap bingkai. */
var shadowSprite=null;
function buildShadowSprite(){
var s=document.createElement('canvas');
s.width=64;s.height=64;
var c=s.getContext('2d');
var g=c.createRadialGradient(32,32,1,32,32,32);
g.addColorStop(0,'rgba(0,0,0,1)');
g.addColorStop(0.5,'rgba(0,0,0,0.55)');
g.addColorStop(1,'rgba(0,0,0,0)');
c.fillStyle=g;
c.fillRect(0,0,64,64);
shadowSprite=s}
function drawShadow(d){
var hgt=clamp((d.y-d.rest)/2.4,0,1);
var rad=sim.scale*1.66*(1+hgt*0.7);
var rx=d.x-cam.eye[0],ry=0.01-cam.eye[1],rz=d.z-cam.eye[2];
var zv=rx*view.f[0]+ry*view.f[1]+rz*view.f[2];
if(zv<0.25)return;
var sx=cx+(rx*view.r[0]+ry*view.r[1]+rz*view.r[2])*F/zv;
var sy=cy-(rx*view.u[0]+ry*view.u[1]+rz*view.u[2])*F/zv;
var scr=Math.max(2.5,rad*F/zv);
if(!shadowSprite)buildShadowSprite();
ctx.globalAlpha=0.42*(1-hgt*0.62);
ctx.drawImage(shadowSprite,sx-scr,sy-scr*0.46,scr*2,scr*0.92);
ctx.globalAlpha=1}
/* urutkan sisi jauh→dekat memakai buffer tetap (tanpa alokasi per bingkai) */
var visIdx=new Int32Array(64),visZ=new Float64Array(64),visB=new Float64Array(64),visS=new Float64Array(64);
function facePath(d,f,dy){
/* dy wajib angka: kalau tidak, PY+undefined = NaN dan path jadi kosong
   (dadu tidak tergambar sama sekali saat jejak kabur aktif). */
if(dy===undefined)dy=0;
var i,n=f.poly.length;
for(i=0;i<n;i++){
projLocal(d,f.poly[i][0],f.poly[i][1],f.poly[i][2]);
if(i===0)ctx.moveTo(PX,PY+dy);else ctx.lineTo(PX,PY+dy)}
ctx.closePath()}
function drawDie(d){
var kind=buildDie(sim.kind),nf=kind.faces.length,i,n=0,f,b,sp;
for(i=0;i<nf&&n<64;i++){
f=kind.faces[i];
normLocal(d,f.n[0],f.n[1],f.n[2]);
var nx=NX,ny=NY,nz=NZ;
projLocal(d,f.c[0],f.c[1],f.c[2]);
if(nx*(cam.eye[0]-WX)+ny*(cam.eye[1]-WY)+nz*(cam.eye[2]-WZ)<=0.001)continue;
visIdx[n]=i;
visZ[n]=PZ;
b=0.30+0.72*Math.max(0,nx*LIGHT[0]+ny*LIGHT[1]+nz*LIGHT[2]);
var h=Math.max(0,nx*HALF[0]+ny*HALF[1]+nz*HALF[2]);
visB[n]=b;
visS[n]=Math.pow(h,26)*0.5;
n++}
for(i=1;i<n;i++){
var ki=visIdx[i],kz=visZ[i],kb=visB[i],ks=visS[i],j=i-1;
while(j>=0&&visZ[j]<kz){visIdx[j+1]=visIdx[j];visZ[j+1]=visZ[j];visB[j+1]=visB[j];visS[j+1]=visS[j];j--}
visIdx[j+1]=ki;visZ[j+1]=kz;visB[j+1]=kb;visS[j+1]=ks}
/* efek kabur gerak: bayangan muka yang digeser searah gerak (smear), BUKAN
   ctx.filter blur — blur kanvas 97x119 px terbukti menyita ~12 DETIK dalam satu
   bingkai (rasterisasi perangkat lunak), dan di HP kelas bawah sama riskannya.
   Menggeser + menurunkan kelegapan memberi kesan kabur yang sama, tapi cuma
   gegambar geometri biasa. Dimatikan kalau perangkat lambat atau dadunya banyak. */
var bl=blurOf(d),smear=(bl>0.15&&!degrade&&!smearOff&&sim.count<=8)?bl:0;
if(smear){
/* jejak selalu tertinggal DI BELAKANG arah gerak (vy<0 = turun → jejak di atas) */
var dir=d.vy<0?-1:1,gh=smear>1.6?3:2,g,off,a;
for(g=gh;g>=1;g--){

off=dir*smear*1.6*g;
a=0.17*(1-(g-1)/gh);
ctx.globalAlpha=a;
for(i=0;i<n;i++){
f=kind.faces[visIdx[i]];
ctx.beginPath();
facePath(d,f,off);
ctx.fillStyle='rgb(238,234,224)';
ctx.fill()}}
ctx.globalAlpha=1}
for(i=0;i<n;i++){
f=kind.faces[visIdx[i]];
b=visB[i];
sp=visS[i];
ctx.beginPath();
facePath(d,f);
ctx.fillStyle='rgb('+Math.round(241*b+255*sp)+','+Math.round(238*b+250*sp)+','+Math.round(229*b+238*sp)+')';
ctx.fill();
ctx.lineWidth=Math.max(0.6,cssW*0.0022);
ctx.strokeStyle='rgba(60,54,44,'+(0.18+0.2*b).toFixed(3)+')';
ctx.stroke();
if(kind.pips)drawPips(d,f);
else drawNumber(d,f)}
}
function faceNormalVisible(d,f){
var nw=qRot(d.q,f.n),cw=worldAt(d,f.c);
return dot(nw,sub(cam.eye,cw))>0.05}
function drawPips(d,f){
/* PIP: 0,5 satuan dari titik tengah sisi, jari-jari 0,158 satuan.
   Satuan di sini adalah APOTEMA sisi (jarak tengah ke tepi), bukan 1 satuan dunia —
   tanpa ini pip jadi ~1,7x terlalu besar sehingga melewati tepi sisi dadu. */
var pips=PIPS[f.value]||PIPS[1],i,j,sc=f.apo;
var cu=f.c[0],cv=f.c[1],cw=f.c[2],uu=f.u[0],uv=f.u[1],uw=f.u[2],vu=f.v[0],vv=f.v[1],vw=f.v[2];
for(i=0;i<pips.length;i++){
var pu=pips[i][0]*sc,pv=pips[i][1]*sc;
ctx.beginPath();
for(j=0;j<12;j++){
var an=j*Math.PI/6;
var q1=pu+PIP_R*sc*Math.cos(an),q2=pv+PIP_R*sc*Math.sin(an);
projLocal(d,cu+uu*q1+vu*q2,cv+uv*q1+vv*q2,cw+uw*q1+vw*q2);
if(j===0)ctx.moveTo(PX,PY);else ctx.lineTo(PX,PY)}
ctx.closePath();
ctx.fillStyle='#22242a';
ctx.fill()}}
function drawNumber(d,f){
var cu=f.c[0],cv=f.c[1],cw=f.c[2],uu=f.u[0],uv=f.u[1],uw=f.u[2],vu=f.v[0],vv=f.v[1],vw=f.v[2];
projLocal(d,cu,cv,cw);
var x0=PX,y0=PY;
projLocal(d,cu+uu,cv+uv,cw+uw);
var ux=PX-x0,uy=PY-y0;
projLocal(d,cu+vu,cv+vv,cw+vw);
var vx=PX-x0,vy=PY-y0;
var det=ux*(-vy)-uy*(-vx);
if(!isFinite(det)||Math.abs(det)<0.0002)return;
var fontSize=f.apo*1.2;
ctx.save();
ctx.transform(ux,uy,-vx,-vy,x0,y0);
ctx.fillStyle='#22242a';
ctx.textAlign='center';ctx.textBaseline='middle';
ctx.font='900 '+fontSize.toFixed(3)+'px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif';
ctx.fillText(String(f.value),0,0);
ctx.restore()}
function draw(){
if(!tableCv)return;
ctx.setTransform(dpr,0,0,dpr,0,0);
ctx.clearRect(0,0,cssW,cssH);
var shx=0,shy=0;
if(sim.shake>0){var m=sim.shake*2.2;shx=(Math.random()-0.5)*m;shy=(Math.random()-0.5)*m}
if(shx||shy)ctx.translate(shx,shy);
ctx.drawImage(tableCv,0,0,cssW,cssH);
var order=sim.dice.slice().sort(function(a,b){return b.z-a.z});
var i;
for(i=0;i<order.length;i++)drawShadow(order[i]);
for(i=0;i<order.length;i++)drawDie(order[i]);
if(shx||shy)ctx.setTransform(dpr,0,0,dpr,0,0)}
var frameTimes=[];
function frame(now){
var dt=lastFrame?Math.min(64,now-lastFrame):16;
lastFrame=now;
if(!manual)advance(dt);
draw();
frameTimes.push(dt);
if(frameTimes.length>50)frameTimes.shift();
if(frameTimes.length===50&&!degrade){
var avg=0;
for(var i=0;i<frameTimes.length;i++)avg+=frameTimes[i];
avg/=frameTimes.length;
if(avg>27){degrade=true;resize()}}
if(loopOn)requestAnimationFrame(frame);
else lastFrame=0}
function startLoop(){
if(loopOn||manual)return;
loopOn=true;lastFrame=0;
requestAnimationFrame(frame)}
function stopLoop(){loopOn=false;lastFrame=0}

/* ── UI ──────────────────────────────────────────────────────────── */
var stats={rolls:0,sum:0,best:0};
function renderTotal(tot){
UI.total.textContent=String(tot);
UI.totalMax.textContent=sim.count>1?' / '+sim.count+' dadu':''}
function renderChips(vals,pop){
var htmlStr='',i=0;
UI.vals.classList.toggle('many',vals.length>6);
for(i=0;i<vals.length;i++)htmlStr+='<span class="chip'+(pop?' pop':'')+'" style="animation-delay:'+(i*55)+'ms"><i>'+sim.kind+'</i><b>'+vals[i]+'</b></span>';
UI.vals.innerHTML=htmlStr;
UI.rubyKind.textContent=sim.kind;
UI.rubyCount.textContent=sim.count+' DADU'}
function renderStats(){
UI.stRoll.textContent=stats.rolls;
UI.stSum.textContent=stats.sum;
UI.stAvg.textContent=stats.rolls?(stats.sum/stats.rolls).toFixed(1):'0';
UI.stBest.textContent=stats.best}
function renderHistory(){
if(!sim.history.length){UI.rows.innerHTML='<div class="emptyHist">Belum ada kocokan. Tekan KOCOK DADU untuk mulai.</div>';UI.hSub.textContent='belum ada';return}
var s='',i;
for(i=0;i<Math.min(sim.history.length,10);i++){
var h=sim.history[i];
s+='<div class="hrow"><span class="hKind">'+h.kind+' ×'+h.count+'</span><span class="hVals">'+h.vals.join('  ')+'</span><span class="hTot">'+h.total+'</span></div>'}
UI.rows.innerHTML=s;
UI.hSub.textContent=sim.history.length+' kocokan'}
function renderKinds(){
var s='',k;
for(k in KINDS){
s+='<button class="kind'+(k===sim.kind?' on':'')+'" type="button" data-kind="'+k+'">'+k+'</button>'}
UI.kinds.innerHTML=s}
function setKind(k){
if(!KINDS[k]||sim.phase!=='idle')return;
sim.kind=k;
var vals=sim.last;
if(sim.count>MAXDADU)sim.count=MAXDADU;
makeDice(vals);
renderKinds();renderChips(sim.dice.map(function(d){return d.value}),false);
UI.sub.textContent='Jenis dadu '+k+' ('+buildDie(k).count+' sisi).';
UI.combo.classList.remove('on')}
function maxCount(){return MAXDADU}
function markQuick(){
if(!UI.quick)return;
var bs=UI.quick.children,i;
for(i=0;i<bs.length;i++)bs[i].classList.toggle('on',parseInt(bs[i].getAttribute('data-n'),10)===sim.count)}
function setCount(n){
if(sim.phase!=='idle')return;
var mx=maxCount();
sim.count=clamp(n,1,mx);
makeDice(null);
UI.count.textContent=sim.count;
UI.minus.disabled=sim.count<=1;
UI.plus.disabled=sim.count>=mx;
markQuick();
renderChips(sim.dice.map(function(d){return d.value}),false)}
function clearAll(){
sim.history=[];stats={rolls:0,sum:0,best:0};
renderHistory();renderStats();
UI.sub.textContent='Riwayat dan statistik dibersihkan.'}
function toast(msg){
UI.toast.textContent=msg;UI.toast.classList.add('show');
clearTimeout(toast.t);
toast.t=setTimeout(function(){UI.toast.classList.remove('show')},1600)}
function syncIdle(reason){
if(reason==='reset'){
sim.phase='idle';
UI.badge.textContent='SIAP';UI.badge.classList.remove('live');
UI.roll.classList.remove('busy')}
UI.count.textContent=sim.count;
UI.minus.disabled=sim.count<=1;
UI.plus.disabled=sim.count>=maxCount();
markQuick();
UI.hint.textContent='Ketuk meja atau tekan KOCOK'}
function doRoll(values){
if(sim.phase!=='idle'){toast('Dadu masih berputar...');return false}
return roll(values)}

/* ── tombol ──────────────────────────────────────────────────────── */
UI.roll.addEventListener('click',function(){doRoll(null)});
UI.tap.addEventListener('click',function(){doRoll(null)});
UI.plus.addEventListener('click',function(){setCount(sim.count+1)});
UI.minus.addEventListener('click',function(){setCount(sim.count-1)});
if(UI.quick)UI.quick.addEventListener('click',function(e){
var t=e.target;
while(t&&t!==UI.quick&&!(t.getAttribute&&t.getAttribute('data-n')))t=t.parentElement;
if(t&&t.getAttribute&&t.getAttribute('data-n'))setCount(parseInt(t.getAttribute('data-n'),10))});
UI.kinds.addEventListener('click',function(e){
var t=e.target;
while(t&&t!==UI.kinds&&!(t.getAttribute&&t.getAttribute('data-kind')))t=t.parentElement;
if(t&&t.getAttribute&&t.getAttribute('data-kind'))setKind(t.getAttribute('data-kind'))});
UI.again.addEventListener('click',function(){doRoll(null)});
UI.snd.addEventListener('click',function(){
soundOn=!soundOn;
UI.snd.textContent=soundOn?'🔊 Suara':'🔇 Bisu';
UI.snd.classList.toggle('off',!soundOn);
if(soundOn)click(0.05,620,0.12,'triangle');
toast(soundOn?'Suara diaktifkan.':'Suara dimatikan.')});
UI.vib.addEventListener('click',function(){
vibOn=!vibOn;
UI.vib.textContent=vibOn?'📳 Getar':'📴 Getar';
UI.vib.classList.toggle('off',!vibOn);
toast(vibOn?'Getaran diaktifkan.':'Getaran dimatikan.')});
UI.clear.addEventListener('click',function(){clearAll()});
window.addEventListener('resize',function(){resize()});
window.addEventListener('orientationchange',function(){setTimeout(resize,180)});
document.addEventListener('visibilitychange',function(){if(document.hidden)stopLoop();else{lastFrame=0;draw()}});

/* ── hook uji ────────────────────────────────────────────────────── */
window.__DADU={
version:'dadu-3d-1',
ready:false,
state:function(){return {phase:sim.phase,kind:sim.kind,count:sim.count,scale:sim.scale,
values:sim.dice.map(function(d){return d.value}),
modes:sim.dice.map(function(d){return d.mode}),
total:sim.dice.reduce(function(a,d){return a+d.value},0),
poses:sim.dice.map(function(d){return {x:d.x,y:d.y,z:d.z,rx:d.rx,rz:d.rz,rest:d.rest}})}},
roll:function(values){return roll(values)},
setCount:function(n){setCount(n);return sim.count},
setKind:function(k){setKind(k);return sim.kind},
stats:function(){return {rolls:stats.rolls,sum:stats.sum,best:stats.best,history:sim.history.length}},
history:function(){return sim.history},
setManual:function(v){manual=Boolean(v);if(manual)stopLoop();return manual},
setSmear:function(v){smearOff=!v;return !smearOff},
setShake:function(v){sim.shake=Number(v)||0;return sim.shake},
step:function(ms){
/* 0 = gambar ulang saja tanpa memajukan fisika (ms||16 dulu mengubah 0 jadi 16,
   sehingga dua jepretan yang harusnya sama ternyata beda keadaan). */
var left=(ms===undefined||ms===null)?16:ms;
while(left>0){var c=Math.min(left,8);advance(c);left-=c}
draw();return sim.phase},
advanceToEnd:function(limit){
var n=0;
while(sim.phase!=='idle'&&n<(limit||12000)){advance(16);n+=16}
draw();return sim.phase},
faces:function(kind){
var die=buildDie(kind||sim.kind);
return die.faces.map(function(f,i){return {i:i,value:f.value,count:die.count,n:f.n,apo:f.apo,verts:f.poly.length}})},
restQuat:function(kind,val){return restQuat(buildDie(kind),val)},
valueOfQ:function(kind,q){return dieValue(buildDie(kind),q)},
facesWorld:function(i){
var d=sim.dice[i];if(!d)return null;
var kind=buildDie(sim.kind),out=[];
for(var k=0;k<kind.faces.length;k++){
var f2=kind.faces[k];
var nw=qRot(d.q,f2.n);
out.push({value:f2.value,ny:nw[1],visible:faceNormalVisible(d,f2)})}
return {q:d.q.slice(),reads:kind.kind==='D4'?'down':'up',faces:out}},
topBasis:function(i){
/* mengembalikan sisi yang dibaca + basis lokalnya di layar,
   supaya penguji bisa mengubah posisi pip di kanvas jadi satuan lokal dadu. */
var d=sim.dice[i];if(!d)return null;
var kind=buildDie(sim.kind),f=faceByValue(kind,d.value),cw=worldAt(d,f.c),p0=proj(cw);
var u=sub(proj(worldAt(d,add(f.c,f.u))),p0),v=sub(proj(worldAt(d,add(f.c,f.v))),p0);
return {value:f.value,center:p0,u:u,v:v,apo:f.apo}},
topFace:function(i){
var d=sim.dice[i];if(!d)return null;
var kind=buildDie(sim.kind),best=null,bv=(kind.kind==='D4')?2:-2,f2;
for(var k=0;k<kind.faces.length;k++){
var wy=qRot(d.q,kind.faces[k].n)[1];
if(kind.kind==='D4'){if(wy<bv){bv=wy;best=kind.faces[k]}}
else if(wy>bv){bv=wy;best=kind.faces[k]}}
var pts=[];
for(var j=0;j<best.poly.length;j++)pts.push(proj(worldAt(d,best.poly[j])));
var ctv=proj(worldAt(d,best.c));
return {value:best.value,quad:pts,center:ctv,normalY:bv,visible:faceNormalVisible(d,best)}},
proj:function(x,y,z){return proj(V(x,y,z))},
blur:function(){return sim.dice.length?blurOf(sim.dice[0]):0},
raw:function(){return {t:sim.t,phase:sim.phase,dice:sim.dice.map(function(d){
return {value:d.value,mode:d.mode,y:d.y,vy:d.vy,rest:d.rest,w:len(d.w),st:d.st,x:d.x,z:d.z}})}},
spin:function(){return sim.dice.length?len(sim.dice[0].w):0},
tableSize:function(){return {w:cssW,h:cssH,dpr:dpr,TX:TX,TZ:TZ}},
camera:function(){return {eye:cam.eye,f:F}},
setDice:function(list){
var n=list.length;sim.count=clamp(n,1,MAXDADU);
makeDice(list.map(function(v){return v}));
UI.count.textContent=sim.count;
renderChips(sim.dice.map(function(d){return d.value}),false);
return sim.dice.map(function(d){return d.value})},
idle:function(){return sim.phase==='idle'}};

/* ── init ────────────────────────────────────────────────────────── */
renderKinds();
setCount(1);
renderChips(sim.dice.map(function(d){return d.value}),false);
renderHistory();renderStats();renderTotal(0);
syncIdle('reset');
resize();
window.__DADU.ready=true;
})();
</script>
<script>
/* nano-tap-fast: tombol balas SEKETIKA saat jari menyentuh, bukan saat jari diangkat —
   supaya ambang tekan-lama WhatsApp (~0,5 dtk) tidak pernah tercapai sehingga menu
   "Hapus/Teruskan" tidak sempat muncul. Klik asli sesudahnya dimatikan agar tidak dobel. */
(function(){var D=document,sup=false,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit|roll|kind|tap|min)/i;
function hit(el){for(var n=el,k=0;n&&n!==D.body&&k<5;n=n.parentElement,k++){var tn=n.tagName;
if(tn==='BUTTON'||tn==='A'||tn==='SUMMARY')return true;
if(n.getAttribute&&n.getAttribute('role')==='button')return true;
if(n.className&&typeof n.className==='string'&&PAD.test(n.className))return true}return false}
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
html,body{overscroll-behavior:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
img,canvas,svg{-webkit-user-drag:none;-webkit-touch-callout:none}
button,[role="button"],a,.roll,.kind,.mini,.chip,.step button{-webkit-user-select:none;user-select:none;touch-action:manipulation}
canvas{touch-action:manipulation}
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button:active,[role="button"]:active,.mini:active,.kind:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
::selection{background:rgba(217,178,106,.32)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(217,178,106,.3);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🎲', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Kocok Dadu 3D 🎲',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-dadu-2026',
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

/* 'dice' dan 'roll' sengaja TIDAK diklaim di sini: keduanya milik plugin RPG
   (plugins/rpg/dice.js) yang dimuat setelah folder game, sehingga kalau diklaim
   di sini perintah RPG tersebut jadi tidak bisa dipanggil sama sekali. */
handler.help = ['dadu', 'kocokdadu', 'rolldadu']
handler.tags = ['game']
handler.command = /^(dadu|kocokdadu|rolldadu|dadugame)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game kocok dadu 3D Nano Ai - lempar sampai 12 dadu (D4/D6/D8/D10/D12/D20) dengan fisika nyata'

export default handler
