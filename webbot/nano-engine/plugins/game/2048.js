/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ━━━[ 🎮 GAME ]━━━━
┇ GABUNG ANGKA — 2048 Nano Ai
┇ Geser / swipe untuk menggabungkan angka yang sama.
┇ Skor terbaik disimpan di HP (localStorage).
⌬
*/

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#12161a">
<title>Nano Ai Gabung Angka</title>
<style>
:root{--bg:#12161a;--text:#e9f2ee;--dim:#93a3a8;--gold:#d8b77f}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
html,body{min-height:100%;background:radial-gradient(700px 420px at 50% -10%,#26333a 0%,var(--bg) 70%);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;padding:12px 10px 20px;overflow-x:hidden}
.app{width:min(100%,430px)}
.panel{background:linear-gradient(180deg,#2b363c,#1a2227);border:1px solid #3c4b53;border-radius:20px;padding:11px;box-shadow:0 20px 50px #0009}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#151c20;border:1px solid #2f3d45;border-radius:14px;padding:8px 10px;margin-bottom:9px}
.title{font:900 15px Georgia,serif;letter-spacing:.3px}.sub{color:var(--dim);font-size:7.5px;letter-spacing:.4px;margin-top:2px}
.chips{display:flex;gap:6px}.chip{min-width:58px;text-align:center;background:#1b2429;border:1px solid #35444c;border-radius:10px;padding:4px 7px}
.chip b{display:block;color:var(--dim);font-size:6.5px;letter-spacing:.12em}.chip span{display:block;color:var(--gold);font:900 13px system-ui;line-height:1.1}
.bd{position:relative;width:100%;aspect-ratio:1/1;background:#151c20;border:1px solid #33424a;border-radius:16px;padding:9px;overflow:hidden;touch-action:none;box-shadow:inset 0 8px 20px #0008}
.cg{position:absolute;inset:9px;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr);gap:8px}
.cc{background:#212a30;border-radius:10px;box-shadow:inset 0 2px 6px #0006}
.tw{position:absolute;inset:9px}
.tile{position:absolute;top:0;left:0;width:calc((100% - 24px)/4);height:calc((100% - 24px)/4);display:grid;place-items:center;border-radius:10px;font:900 clamp(15px,5.6vw,27px) system-ui;color:#2a2113;background:#eee4d4;transition:transform .11s ease,background .12s ease;will-change:transform;box-shadow:0 3px 0 rgba(0,0,0,.25)}
.tile.pop{animation:pop .16s ease}
@keyframes pop{0%{transform:scale(.86)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
.t2{background:#eee4d4}.t4{background:#ecdcbe}.t8{background:#f2b179;color:#3a2410}.t16{background:#f59563;color:#3a2410;font-size:clamp(14px,5vw,25px)}
.t32{background:#f67c5f;color:#fff}.t64{background:#f65e3b;color:#fff}.t128{background:#edcf72;color:#3a2a05;font-size:clamp(13px,4.6vw,23px)}
.t256{background:#edcc61;color:#3a2a05;font-size:clamp(13px,4.6vw,23px)}.t512{background:#edc850;color:#3a2a05;font-size:clamp(13px,4.6vw,23px)}
.t1024{background:#edc53f;color:#332405;font-size:clamp(11px,4vw,20px)}.t2048{background:linear-gradient(180deg,#f7d97a,#e3a91f);color:#2b1d02;box-shadow:0 0 18px rgba(237,197,63,.6);font-size:clamp(11px,4vw,20px)}
.thi{background:#2f3c44;color:#cfe0e6;font-size:clamp(10px,3.6vw,18px)}
.ovl{position:absolute;inset:0;display:none;place-items:center;border-radius:16px;background:#0a1114d9;backdrop-filter:blur(6px);z-index:3;padding:14px;text-align:center}
.ovl.on{display:grid}
.ovl h3{font:900 20px Georgia,serif}.ovl p{color:var(--dim);font-size:9.5px;margin-top:5px;line-height:1.5}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:9px 0 7px}
.grid4 .btn{min-height:46px}
.row{display:flex;gap:7px}.row+.row{margin-top:7px}
.btn{flex:1;min-height:42px;border:1px solid #53636a;border-radius:11px;background:linear-gradient(180deg,#3e4e56,#2b363c);color:var(--text);font:900 10.5px system-ui;letter-spacing:.3px;box-shadow:0 4px 0 #12181b;transition:transform .06s ease}
.btn.gold{background:linear-gradient(180deg,#e3c894,#a8834f);border-color:#c8a774;color:#231a0c}
.btn:active{transform:translateY(2px)}
.tip{margin-top:9px;color:var(--dim);font-size:8px;line-height:1.5;text-align:center}
</style>
</head>
<body>
<div class="app"><div class="panel">
  <div class="head">
    <div><div class="title">GABUNG ANGKA</div><div class="sub">2048 • NANO AI</div></div>
    <div class="chips"><div class="chip"><b>SKOR</b><span id="score">0</span></div><div class="chip"><b>BEST</b><span id="best">0</span></div></div>
  </div>
  <div class="bd" id="bd">
    <div class="cg" id="cg"></div>
    <div class="tw" id="tw"></div>
    <div class="ovl" id="ovl"><div><h3 id="ovT">Selesai</h3><p id="ovP"></p><div class="row"><button class="btn gold" id="ovBtn" type="button">COBA LAGI</button></div></div></div>
  </div>
  <div class="grid4" style="margin-top:9px">
    <button class="btn" id="bL" type="button">◀</button>
    <button class="btn" id="bU" type="button">▲</button>
    <button class="btn" id="bD" type="button">▼</button>
    <button class="btn" id="bR" type="button">▶</button>
  </div>
  <div class="row"><button class="btn gold" id="bNew" type="button">GAME BARU</button><button class="btn" id="bUndo" type="button">↶ UNDO</button></div>
  <div class="tip" id="tip">Geser layar (swipe) atau pakai tombol arah.<br>Gabungkan angka yang sama sampai muncul 2048</div>
</div></div>
<script>
(function(){
'use strict';
var N=4,P=[],S=0,B=0,nextId=1,over=false,wonShown=false,undoSnap=null,busy=false;
var dom={};
function el(id){return document.getElementById(id)}
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function blip(a,b,c,d,e){try{if(window.GX)GX.blip(a,b,c,d,e)}catch(x){}}
function vib(p){try{if(window.GX)GX.vib(p)}catch(x){}}
var COL={2:'t2',4:'t4',8:'t8',16:'t16',32:'t32',64:'t64',128:'t128',256:'t256',512:'t512',1024:'t1024',2048:'t2048'};
function buildGrid(){
  var g=el('cg');g.innerHTML='';
  for(var i=0;i<N*N;i++){var d=document.createElement('div');d.className='cc';g.appendChild(d)}
}
function tileAt(r,c){for(var i=0;i<P.length;i++){var t=P[i];if(!t.dead&&!t.removed&&t.r===r&&t.c===c)return t}return null}
function emptyCells(){var out=[],r,c;for(r=0;r<N;r++)for(c=0;c<N;c++)if(!tileAt(r,c))out.push([r,c]);return out}
function spawn(){
  var e=emptyCells();if(!e.length)return null;
  var pick=e[Math.floor(Math.random()*e.length)];
  var t={id:nextId++,v:Math.random()<0.9?2:4,r:pick[0],c:pick[1],fresh:true,merged:false,removed:false,dead:false};
  P.push(t);return t
}
function pos(t){var x='calc('+(t.c*100)+'% + '+(t.c*8)+'px)',y='calc('+(t.r*100)+'% + '+(t.r*8)+'px)';return 'translate('+x+','+y+')'}
function cls(t){var base=t.v>=4096?'thi':(COL[t.v]||'thi');return 'tile '+base}
function render(){
  var i,t,seen={};
  for(i=0;i<P.length;i++){
    t=P[i];
    if(t.removed){if(dom[t.id])dom[t.id].style.zIndex='1';continue}
    var e=dom[t.id];
    if(!e){e=document.createElement('div');dom[t.id]=e;el('tw').appendChild(e);e.style.transform=pos(t)}
    e.className=cls(t)+(t.fresh?' pop':'');
    e.textContent=t.v;
    e.style.transform=pos(t);
    e.style.zIndex=t.fresh?'2':'1';
    seen[t.id]=1;t.fresh=false
  }
  for(i in dom){if(!seen[i]){try{dom[i].remove()}catch(x){}delete dom[i]}}
  el('score').textContent=S;el('best').textContent=B;
}
function order(dir){
  var out=[],r,c;
  if(dir==='l'){for(r=0;r<N;r++)for(c=0;c<N;c++)out.push([r,c])}
  else if(dir==='r'){for(r=0;r<N;r++)for(c=N-1;c>=0;c--)out.push([r,c])}
  else if(dir==='u'){for(c=0;c<N;c++)for(r=0;r<N;r++)out.push([r,c])}
  else{for(c=0;c<N;c++)for(r=N-1;r>=0;r--)out.push([r,c])}
  return out
}
function snapshot(){
  var g=[],r,c;for(r=0;r<N;r++){var row=[];for(c=0;c<N;c++){var t=tileAt(r,c);row.push(t?t.v:0)}g.push(row)}
  return {g:g,s:S}
}
function restore(snap){
  var r,c;P=[];dom={};el('tw').innerHTML='';
  for(r=0;r<N;r++)for(c=0;c<N;c++)if(snap.g[r][c])P.push({id:nextId++,v:snap.g[r][c],r:r,c:c,fresh:false,merged:false,removed:false,dead:false});
  S=snap.s;over=false;wonShown=false;el('ovl').className='ovl';render()
}
function move(dir){
  if(over||busy)return;
  var vect={l:[0,-1],r:[0,1],u:[-1,0],d:[1,0]}[dir];
  var before=snapshot(),moved=false,gained=0,merges=0;
  var ord=order(dir),i;
  for(i=0;i<P.length;i++)P[i].merged=false;
  for(i=0;i<ord.length;i++){
    var r=ord[i][0],c=ord[i][1],t=tileAt(r,c);
    if(!t)continue;
    var nr=r,nc=c;
    while(true){
      var ar=nr+vect[0],ac=nc+vect[1];
      if(ar<0||ar>=N||ac<0||ac>=N)break;
      var o=tileAt(ar,ac);
      if(o){
        if(o.v===t.v&&!o.merged&&!t.merged){
          o.v=o.v*2;o.merged=true;o.fresh=true;
          t.removed=true;t.r=ar;t.c=ac;
          gained+=o.v;merges++;moved=true;
          if(o.v===2048&&!wonShown){wonShown=true;setTimeout(winMsg,220)}
        }
        break
      }
      nr=ar;nc=ac
    }
    if(!t.removed){if(nr!==r||nc!==c){t.r=nr;t.c=nc;moved=true}}
  }
  if(!moved){blip(200,160,.05,.03);return}
  S+=gained;if(S>B){B=S;ss('g2048_best',B)}
  undoSnap=before;
  render();
  blip(merges?520:420,merges?900:640,.07,.035);
  if(merges>1||gained>=64)vib(12);
  busy=true;
  setTimeout(function(){
    P=P.filter(function(t){return !t.removed});
    for(var k in dom){}
    P.forEach(function(t){t.merged=false});
    spawn();render();busy=false;checkOver()
  },115);
}
function checkOver(){
  if(emptyCells().length)return;
  var r,c;
  for(r=0;r<N;r++)for(c=0;c<N;c++){
    var t=tileAt(r,c);if(!t)return;
    var rt=tileAt(r,c+1),dt=tileAt(r+1,c);
    if(rt&&rt.v===t.v)return;
    if(dt&&dt.v===t.v)return
  }
  over=true;blip(300,90,.45,.06,'triangle');vib([35,60,110]);
  el('ovT').textContent='Tidak ada langkah lagi';
  el('ovP').textContent='Skor akhir: '+S+(S>=B?' (rekor baru 🎉)':' • Best '+B);
  el('ovl').className='ovl on'
}
function winMsg(){
  blip(760,1240,.18,.05);setTimeout(function(){blip(1040,1560,.22,.05)},160);vib([25,45,80]);
  el('ovT').textContent='2048 tercapai! 🎉';
  el('ovP').textContent='Luar biasa! Mau lanjut mengejar skor lebih tinggi?';
  el('ovl').className='ovl on'
}
function newGame(){
  P=[];dom={};el('tw').innerHTML='';S=0;over=false;wonShown=false;undoSnap=null;busy=false;
  el('ovl').className='ovl';buildGrid();spawn();spawn();render();
  blip(560,860,.1,.045)
}
el('bNew').addEventListener('click',function(e){e.preventDefault();newGame()});
el('ovBtn').addEventListener('click',function(e){e.preventDefault();newGame()});
el('bUndo').addEventListener('click',function(e){e.preventDefault();if(!undoSnap||busy)return;restore(undoSnap);undoSnap=null;blip(600,880,.09,.04)});
el('bL').addEventListener('click',function(e){e.preventDefault();move('l')});
el('bR').addEventListener('click',function(e){e.preventDefault();move('r')});
el('bU').addEventListener('click',function(e){e.preventDefault();move('u')});
el('bD').addEventListener('click',function(e){e.preventDefault();move('d')});
document.addEventListener('keydown',function(e){
  var k=e.key.toLowerCase();
  var map={arrowleft:'l',arrowright:'r',arrowup:'u',arrowdown:'d',a:'l',d:'r',w:'u',s:'d'};
  if(map[k]){e.preventDefault();move(map[k])}
  else if(k==='r'){newGame()}
});
var sx=0,sy=0,dragging=false;
function down(e){var t=e.touches&&e.touches[0]?e.touches[0]:e;sx=t.clientX;sy=t.clientY;dragging=true}
function up(e){
  if(!dragging)return;dragging=false;
  var t=e.changedTouches&&e.changedTouches[0]?e.changedTouches[0]:e;
  var dx=t.clientX-sx,dy=t.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))<22)return;
  if(Math.abs(dx)>Math.abs(dy))move(dx>0?'r':'l');else move(dy>0?'d':'u')
}
var bd=el('bd');
bd.addEventListener('pointerdown',down);bd.addEventListener('pointerup',up);
bd.addEventListener('touchstart',down,{passive:true});bd.addEventListener('touchend',up,{passive:true});
B=ls('g2048_best',0);
newGame();
})();
</script>
<script>
(function(){var A=null,on=true;function ac(){try{if(!A){var C=window.AudioContext||window.webkitAudioContext;if(C)A=new C()}if(A&&A.state==='suspended')A.resume()}catch{}}
function blip(f1,f2,d,v,t){if(!on)return;ac();if(!A)return;try{var n=A.currentTime,o=A.createOscillator(),g=A.createGain();o.type=t||'square';o.frequency.setValueAtTime(f1,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v||.05,n+.015);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.03)}catch{}}
function vib(p){if(!on)return;try{if(navigator.vibrate)navigator.vibrate(p)}catch{}}
window.GX={blip:blip,vib:vib,unlock:ac,isOn:function(){return on}};
document.addEventListener('pointerdown',ac,{passive:true});document.addEventListener('keydown',ac,{passive:true});
try{var b=document.createElement('button');b.type='button';b.textContent='🔊';b.setAttribute('aria-label','Suara');
b.style.cssText='position:fixed;right:10px;bottom:10px;z-index:2147483000;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(16,22,26,.82);color:#e9f1ef;font-size:15px;line-height:1;box-shadow:0 6px 16px rgba(0,0,0,.45)';
b.onclick=function(){on=!on;b.textContent=on?'🔊':'🔇';if(on)blip(880,1320,.09,.05)};
document.body.appendChild(b)}catch{}
})();
</script>
<script>
/* nano-touch-guard — sentuhan milik permainan, bukan lapisan chat/WhatsApp.
   Mematikan menu tekan-lama (Salin/Bagikan/Hapus), seleksi teks, dan seret yang membuat
   webview tertutup / chat ikut bergeser. Kotak yang memang bisa digulir (menu) dan halaman
   yang lebih tinggi dari layar TETAP bisa digulir. */
(function(){
  var D=document,i,evs=['contextmenu','selectstart','dragstart','gesturestart'];
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
</script>
<style>
html,body{overscroll-behavior:none;touch-action:manipulation;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
img,canvas,svg{-webkit-user-drag:none;-webkit-touch-callout:none}
textarea,input,select,[contenteditable]{-webkit-user-select:text;user-select:text}
canvas,.sceneCanvas{touch-action:none}
</style>
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
::selection{background:rgba(212,180,143,.35)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(255,111,174,.4);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
/* ── lapisan HD Nano ─────────────────────────────
   cahaya ruang dari kiri-atas + vignette + butiran halus supaya layar
   tidak terasa datar. Tidak mengubah tata letak sama sekali. */
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
canvas,img,svg{-webkit-user-drag:none;-webkit-user-select:none;user-select:none}
html::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;background-image:radial-gradient(122% 82% at 16% -12%,rgba(255,255,255,.11),rgba(255,255,255,0) 58%),radial-gradient(132% 112% at 92% 118%,rgba(0,0,0,.20),rgba(0,0,0,0) 62%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");background-size:auto,auto,160px 160px}
/* ── material v2: bevel + bayangan kontak supaya elemen terasa benda nyata ── */
.btn,.key,.chip,.chipBtn,.mini,.tab,.pad button{box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -2px 0 rgba(0,0,0,.42),0 7px 16px rgba(0,0,0,.45)}
.cell,.tile,.block,.pod{box-shadow:inset 0 1px 0 rgba(255,255,255,.24),inset 0 -2px 0 rgba(0,0,0,.3),0 3px 8px rgba(0,0,0,.42)}
.panel,.card,.stat,.stats,.modal,.grid,.board{box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 16px 36px rgba(0,0,0,.5),0 2px 0 rgba(0,0,0,.45)}
div:has(>canvas){position:relative;border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,255,255,.08)}
div:has(>canvas)>canvas{border-radius:10px;display:block}

/* ── material v3: kedalaman benda nyata: bevel, kilau, bayangan kontak ── */
/* gloss + kontak umum: dipakai kalau game tidak punya aturan khusus */
.btn,.chip,.chipBtn,.key,.mini,.tab{border-radius:11px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.22),inset 0 -3px 5px rgba(0,0,0,.42),0 4px 0 rgba(0,0,0,.42),0 8px 16px rgba(0,0,0,.4)!important}
.panel{border-radius:16px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 -4px 12px rgba(0,0,0,.42),0 16px 36px rgba(0,0,0,.5),0 2px 0 rgba(0,0,0,.45)!important}
.cell{background:#0d1418!important;box-shadow:inset 0 3px 8px rgba(0,0,0,.75),inset 0 -1px 0 rgba(255,255,255,.05)!important}
.tile{border-radius:12px!important;text-shadow:0 1px 0 rgba(255,255,255,.55);box-shadow:inset 0 2px 0 rgba(255,255,255,.55),inset 0 -3px 5px rgba(0,0,0,.2),0 5px 0 rgba(0,0,0,.24),0 9px 18px rgba(0,0,0,.38)!important}
.t32,.t64{box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 5px 0 rgba(0,0,0,.24),0 9px 18px rgba(0,0,0,.38),0 0 0 1px rgba(255,255,255,.14)!important}
.t128,.t256{box-shadow:inset 0 2px 0 rgba(255,255,255,.55),0 5px 0 rgba(0,0,0,.26),0 9px 18px rgba(0,0,0,.4),0 0 20px rgba(255,180,50,.45)!important}
.t512,.t1024,.t2048{box-shadow:inset 0 2px 0 rgba(255,255,255,.6),0 5px 0 rgba(0,0,0,.3),0 10px 22px rgba(0,0,0,.45),0 0 26px rgba(255,140,20,.6)!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🔢', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Gabung Angka 2048 🔢',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-2048-2026',
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

handler.help = ['2048', 'gabungangka', 'angka2048']
handler.tags = ['game']
handler.command = /^(2048|gabungangka|angka2048|game2048)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Gabung Angka 2048 — geser untuk menggabungkan angka sama'

export default handler
