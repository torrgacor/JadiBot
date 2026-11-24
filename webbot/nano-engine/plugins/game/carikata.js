/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ━━━[ 🎮 GAME ]━━━━
┇ CARI KATA — Word Search Nano Ai
┇ Tap huruf awal, lalu huruf akhir untuk menandai kata.
⌬
*/

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#12161a">
<title>Nano Ai Cari Kata</title>
<style>
:root{--bg:#12161a;--text:#e9f2ee;--dim:#93a3a8;--gold:#d8b77f}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
html,body{min-height:100%;background:radial-gradient(700px 420px at 50% -10%,#26333a 0%,var(--bg) 70%);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;padding:12px 10px 20px;overflow-x:hidden}
.app{width:min(100%,450px)}
.panel{background:linear-gradient(180deg,#2b363c,#1a2227);border:1px solid #3c4b53;border-radius:20px;padding:11px;box-shadow:0 20px 50px #0009}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#151c20;border:1px solid #2f3d45;border-radius:14px;padding:8px 10px;margin-bottom:9px}
.title{font:900 15px Georgia,serif;letter-spacing:.3px}.sub{color:var(--dim);font-size:7.5px;letter-spacing:.4px;margin-top:2px}
.chips{display:flex;gap:6px}.chip{min-width:52px;text-align:center;background:#1b2429;border:1px solid #35444c;border-radius:10px;padding:4px 7px}
.chip b{display:block;color:var(--dim);font-size:6.5px;letter-spacing:.12em}.chip span{display:block;color:var(--gold);font:900 13px system-ui;line-height:1.1}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:2px;background:#141c21;border:1px solid #2f3d45;border-radius:12px;padding:5px;touch-action:none;box-shadow:inset 0 6px 16px #0008}
.cc{aspect-ratio:1/1;display:grid;place-items:center;border-radius:5px;background:#1c252b;color:#dfeae6;font:900 clamp(8px,2.6vw,13px) system-ui;transition:transform .08s ease,background .12s ease;user-select:none}
.cc.sel{background:#3c4f5a;transform:scale(1.08)}
.cc.pre{background:#2f4550;color:#fff}
.cc.found{background:linear-gradient(180deg,#93d46d,#4d8c34);color:#0f2309;box-shadow:0 0 0 1px #7cbb59 inset}
.cc.hintc{background:#8a6d2b;color:#fff}
.words{display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin-top:9px}
.wd{display:flex;align-items:center;justify-content:space-between;gap:6px;background:#1b2429;border:1px solid #33424a;border-radius:9px;padding:5px 8px;font:900 10px system-ui;letter-spacing:.6px;color:#dbe7e3}
.wd.ok{background:linear-gradient(180deg,#3f6b2c,#2c4a1e);border-color:#5d8f42;color:#dff5d2;text-decoration:line-through}
.wd .len{color:var(--dim);font-size:7.5px;font-weight:700}
.row{display:flex;gap:7px}.row+.row{margin-top:7px}
.btn{flex:1;min-height:42px;border:1px solid #53636a;border-radius:11px;background:linear-gradient(180deg,#3e4e56,#2b363c);color:var(--text);font:900 10.5px system-ui;letter-spacing:.3px;box-shadow:0 4px 0 #12181b;transition:transform .06s ease}
.btn.gold{background:linear-gradient(180deg,#e3c894,#a8834f);border-color:#c8a774;color:#231a0c}
.btn.on{background:linear-gradient(180deg,#93d46d,#4d8c34);border-color:#7cbb59;color:#0f2309}
.btn:active{transform:translateY(2px)}
.tip{margin-top:9px;color:var(--dim);font-size:8px;line-height:1.5;text-align:center}
.ovl{position:fixed;inset:0;display:none;place-items:center;background:#06090bd9;backdrop-filter:blur(8px);z-index:9;padding:16px}
.ovl.on{display:grid}
.modal{width:min(94%,320px);background:linear-gradient(180deg,#35444d,#212a2f);border:1px solid #4d5e68;border-radius:18px;padding:16px;text-align:center;box-shadow:0 20px 44px #000a}
.modal h2{font:900 19px Georgia,serif;margin-top:4px}.modal p{color:var(--dim);font-size:9.5px;margin-top:5px;line-height:1.5}
.ico{font-size:28px}
.modal .row{margin-top:10px}
</style>
</head>
<body>
<div class="app"><div class="panel">
  <div class="head">
    <div><div class="title">CARI KATA</div><div class="sub">WORD SEARCH • NANO AI</div></div>
    <div class="chips"><div class="chip"><b>WAKTU</b><span id="time">0s</span></div><div class="chip"><b>KETEMU</b><span id="found">0/8</span></div></div>
  </div>
  <div class="grid" id="grid"></div>
  <div class="words" id="words"></div>
  <div class="row" style="margin-top:9px">
    <button class="btn" id="bHewan" type="button">HEWAN</button><button class="btn" id="bBuah" type="button">BUAH</button><button class="btn" id="bAlat" type="button">ALAT</button><button class="btn" id="bAlam" type="button">ALAM</button>
  </div>
  <div class="row"><button class="btn gold" id="bNew" type="button">PAPAN BARU</button><button class="btn" id="bHint" type="button">PETUNJUK</button></div>
  <div class="tip" id="tip">Tap huruf <b>awal</b> lalu huruf <b>akhir</b> sebuah kata.<br>Kata bisa mendatar, menurun, atau diagonal — termasuk terbalik.</div>
</div></div>
<div class="ovl" id="ovl"><div class="modal">
  <div class="ico" id="mIco">🏆</div><h2 id="mTitle">Semua ketemu!</h2><p id="mText"></p>
  <div class="row"><button class="btn gold" id="mNew" type="button">MAIN LAGI</button><button class="btn" id="mClose" type="button">TUTUP</button></div>
</div></div>
<script>
(function(){
'use strict';
var SIZE=12,DIRS=[[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
var THEMES={
  hewan:['KUCING','GAJAH','HARIMAU','KATAK','BURUNG','ULAR','KAMBING','KUDA','LEBAH','PENYU','SEMUT','RUSA'],
  buah:['MANGGA','PISANG','JERUK','APEL','ANGGUR','DURIAN','SEMANGKA','SALAK','NANAS','PEPAYA','KELAPA','JAMBU'],
  alat:['PISAU','SENDOK','GARPU','SIKAT','SAPU','PANCI','GELAS','SABUN','PAYUNG','JARUM','KUNCI','BOTOL'],
  alam:['GUNUNG','SUNGAI','PANTAI','HUTAN','DANAU','BUKIT','PULAU','OMBAK','BINTANG','AWAN','HUJAN','LEMBAH']
};
var theme='hewan',cells=[],words=[],found=[],startIdx=-1,over=false,t0=0,tick=0,timerId=0,best=0;
function el(id){return document.getElementById(id)}
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function blip(a,b,c,d,e){try{if(window.GX)GX.blip(a,b,c,d,e)}catch(x){}}
function vib(p){try{if(window.GX)GX.vib(p)}catch(x){}}
function ri(n){return Math.floor(Math.random()*n)}
function pickWords(){
  var pool=THEMES[theme].slice(),out=[];
  while(out.length<8&&pool.length){
    var w=pool.splice(ri(pool.length),1)[0];
    if(w.length<=SIZE)out.push(w)
  }
  return out
}
function makeGrid(list){
  var g=[],r,c,i;
  for(r=0;r<SIZE;r++){g.push([]);for(c=0;c<SIZE;c++)g[r].push('')}
  var placed=[];
  for(i=0;i<list.length;i++){
    var w=list[i],ok=false,attempt=0;
    while(!ok&&attempt<400){
      attempt++;
      var d=DIRS[ri(DIRS.length)],dr=d[0],dc=d[1];
      var r0=ri(SIZE),c0=ri(SIZE);
      var r1=r0+dr*(w.length-1),c1=c0+dc*(w.length-1);
      if(r1<0||r1>=SIZE||c1<0||c1>=SIZE)continue;
      var fits=true,k;
      for(k=0;k<w.length;k++){
        var rr=r0+dr*k,cc=c0+dc*k,cur=g[rr][cc];
        if(cur&&cur!==w.charAt(k)){fits=false;break}
      }
      if(!fits)continue;
      for(k=0;k<w.length;k++)g[r0+dr*k][c0+dc*k]=w.charAt(k);
      placed.push(w);ok=true
    }
  }
  var alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var vowel='AIUEO';
  for(r=0;r<SIZE;r++)for(c=0;c<SIZE;c++){
    if(!g[r][c])g[r][c]=Math.random()<0.38?vowel.charAt(ri(vowel.length)):alpha.charAt(ri(alpha.length))
  }
  return {grid:g,list:placed}
}
function render(){
  var g=el('grid');g.innerHTML='';cells=[];
  var r,c;
  for(r=0;r<SIZE;r++)for(c=0;c<SIZE;c++){
    var d=document.createElement('div');d.className='cc';d.textContent=words[r][c];
    d.dataset.r=String(r);d.dataset.c=String(c);
    cells.push(d);g.appendChild(d)
  }
  paint()
}
function paint(){
  var i;
  for(i=0;i<cells.length;i++)cells[i].className='cc';
  for(i=0;i<found.length;i++){
    var f=found[i];
    for(var k=0;k<f.cells.length;k++)cells[f.cells[k]].className='cc found'
  }
  if(startIdx>=0)cells[startIdx].className='cc sel'
  var wl=el('words');wl.innerHTML='';
  for(i=0;i<words.length?true:false;i++){}
  for(i=0;i<wordList.length;i++){
    var w=wordList[i];
    var done=false,k2;
    for(k2=0;k2<found.length;k2++)if(found[k2].w===w)done=true;
    var div=document.createElement('div');div.className='wd'+(done?' ok':'');
    div.innerHTML='<span>'+w+'</span><span class="len">'+w.length+'</span>';
    wl.appendChild(div)
  }
  el('found').textContent=found.length+'/'+wordList.length;
  el('time').textContent=Math.floor(tick)+'s'
}
function lineCells(a,b){
  var r0=a[0],c0=a[1],r1=b[0],c1=b[1];
  var dr=r1-r0,dc=c1-c0;
  if(dr===0&&dc===0)return null;
  if(dr!==0&&dc!==0&&Math.abs(dr)!==Math.abs(dc))return null;
  var steps=Math.max(Math.abs(dr),Math.abs(dc));
  var sr=dr===0?0:(dr>0?1:-1),sc=dc===0?0:(dc>0?1:-1);
  var out=[],k;
  for(k=0;k<=steps;k++)out.push([r0+sr*k,c0+sc*k]);
  return out
}
function idx(r,c){return r*SIZE+c}
function wordsIn(cellList){
  var s='',k;
  for(k=0;k<cellList.length;k++)s+=words[cellList[k][0]][cellList[k][1]];
  var rev=s.split('').reverse().join('');
  var out=[];
  for(k=0;k<wordList.length;k++){
    if(wordList[k]===s||wordList[k]===rev)out.push({w:wordList[k],cells:cellList.map(function(p){return idx(p[0],p[1])})})
  }
  return out
}
function tap(i){
  if(over)return;
  var r=Number(cells[i].dataset.r),c=Number(cells[i].dataset.c);
  if(startIdx<0){
    startIdx=i;blip(560,760,.05,.035);paint();
    el('tip').textContent='Huruf awal dipilih. Sekarang tap huruf akhir katanya.';
    return
  }
  if(i===startIdx){startIdx=-1;paint();el('tip').textContent='Pilihan dibatalkan.';return}
  var a=[Number(cells[startIdx].dataset.r),Number(cells[startIdx].dataset.c)];
  var path=lineCells(a,[r,c]);
  if(!path){blip(220,180,.1,.045);vib(18);el('tip').textContent='Harus satu baris lurus (mendatar, menurun, atau diagonal).';startIdx=i;paint();return}
  var hits=wordsIn(path);
  if(!hits.length){
    blip(240,190,.12,.045);vib(20);
    el('tip').textContent='Bukan kata di daftar. Coba lagi ya.';
    startIdx=-1;paint();return
  }
  var fresh=false,k;
  for(k=0;k<hits.length;k++){
    var dup=false,j;
    for(j=0;j<found.length;j++)if(found[j].w===hits[k].w)dup=true;
    if(!dup){found.push(hits[k]);fresh=true}
  }
  startIdx=-1;
  if(fresh){
    blip(780,1180,.14,.05);vib([15,30]);
    el('tip').innerHTML='✅ Ketemu: <b style="color:#d8b77f">'+hits.map(function(h){return h.w}).join(', ')+'</b>'
  }else el('tip').textContent='Kata itu sudah ditandai.';
  paint();
  if(found.length>=wordList.length)win()
}
function win(){
  over=true;clearInterval(timerId);
  var t=Math.floor(tick);
  if(!best||t<best){best=t;ss('ck_best',best)}
  blip(720,1200,.18,.05);setTimeout(function(){blip(980,1440,.2,.05)},150);setTimeout(function(){blip(1280,1720,.26,.05)},320);
  vib([25,45,80]);
  el('mIco').textContent='🏆';el('mTitle').textContent='Semua kata ketemu!';
  el('mText').textContent='Waktu: '+t+' detik • Tema: '+theme.toUpperCase()+(best===t?' (rekor baru!)':'');
  el('ovl').className='ovl on'
}
function hint(){
  if(over)return;
  var i,k;
  for(i=0;i<wordList.length;i++){
    var done=false;
    for(k=0;k<found.length;k++)if(found[k].w===wordList[i])done=true;
    if(done)continue
    var w=wordList[i];
    for(var r=0;r<SIZE;r++)for(var c=0;c<SIZE;c++)for(var d=0;d<DIRS.length;d++){
      var dr=DIRS[d][0],dc=DIRS[d][1],ok=true,kk;
      for(kk=0;kk<w.length;kk++){
        var rr=r+dr*kk,cc=c+dc*kk;
        if(rr<0||rr>=SIZE||cc<0||cc>=SIZE||words[rr][cc]!==w.charAt(kk)){ok=false;break}
      }
      if(ok){
        cells[idx(r,c)].className='cc hintc';
        blip(520,900,.12,.045);
        el('tip').innerHTML='💡 Kata <b style="color:#d8b77f">'+w+'</b> mulai di huruf yang disorot, arah '+(dr===0?'mendatar':dc===0?'menurun':'diagonal')+'.';
        return
      }
    }
  }
  el('tip').textContent='Semua kata sudah ketemu.'
}
function newBoard(t){
  if(t)theme=t;
  var list=pickWords();
  var made=makeGrid(list);
  words=made.grid;wordList=made.list;
  found=[];startIdx=-1;over=false;tick=0;t0=performance.now();
  clearInterval(timerId);
  timerId=setInterval(function(){if(!over){tick=(performance.now()-t0)/1000;el('time').textContent=Math.floor(tick)+'s'}},250);
  render();
  var ids=['bHewan','bBuah','bAlat','bAlam'],keys=['hewan','buah','alat','alam'],i;
  for(i=0;i<ids.length;i++)el(ids[i]).className='btn'+(keys[i]===theme?' on':'');
  el('tip').innerHTML='Tap huruf <b>awal</b> lalu huruf <b>akhir</b> sebuah kata.<br>Tema: <b style="color:#d8b77f">'+theme.toUpperCase()+'</b> • '+wordList.length+' kata disembunyikan.';
  blip(600,900,.1,.045)
}
var i;
for(i=0;i<1;i++){}
el('bHewan').addEventListener('click',function(e){e.preventDefault();newBoard('hewan')});
el('bBuah').addEventListener('click',function(e){e.preventDefault();newBoard('buah')});
el('bAlat').addEventListener('click',function(e){e.preventDefault();newBoard('alat')});
el('bAlam').addEventListener('click',function(e){e.preventDefault();newBoard('alam')});
el('bNew').addEventListener('click',function(e){e.preventDefault();newBoard()});
el('bHint').addEventListener('click',function(e){e.preventDefault();hint()});
el('mNew').addEventListener('click',function(e){e.preventDefault();el('ovl').className='ov';newBoard()});
el('mClose').addEventListener('click',function(e){e.preventDefault();el('ovl').className='ov'});
el('grid').addEventListener('pointerdown',function(e){
  var t=e.touches&&e.touches[0]?e.touches[0]:e;
  var rect=el('grid').getBoundingClientRect();
  if(!rect.width)return;
  var col=Math.floor((t.clientX-rect.left)/(rect.width/SIZE));
  var row=Math.floor((t.clientY-rect.top)/(rect.height/SIZE));
  if(row<0||row>=SIZE||col<0||col>=SIZE)return;
  tap(idx(row,col))
});
best=ls('ck_best',0);
var wordList=[];
newBoard('hewan');
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
.grid,.words,.wd,.cc{border-radius:12px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -4px 10px rgba(0,0,0,.3),0 10px 24px rgba(0,0,0,.42)!important}
.cell{border-radius:6px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.32),inset 0 -2px 3px rgba(0,0,0,.2),0 2px 5px rgba(0,0,0,.3)!important}
.chip{border-radius:9px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 3px 0 rgba(0,0,0,.35),0 6px 12px rgba(0,0,0,.35)!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🔎', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Cari Kata 🔎',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-carikata-2026',
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

handler.help = ['carikata', 'wordsearch', 'carikata']
handler.tags = ['game']
handler.command = /^(carikata|wordsearch|tebakcari)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Cari Kata — temukan 8 kata tersembunyi di papan huruf'

export default handler
