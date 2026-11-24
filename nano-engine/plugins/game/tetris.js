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

import { randomUUID } from 'crypto'

const TETRIS_HTML = `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif;-webkit-tap-highlight-color:transparent;user-select:none;-webkit-user-select:none}
html,body{width:100%;min-height:100%;background:#0e0718;color:#f6f0ff}
body{padding:8px;overflow-y:auto}
#tetris-app{width:min(94vw,420px);margin:0 auto;padding:4px}
.t-title{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin:2px 2px 10px}
.t-name{font:900 20px Arial Black,Arial,sans-serif;letter-spacing:1px;color:#f4e8ff;text-shadow:0 0 12px rgba(184,89,255,.35)}
.t-sub{font:700 8px Arial;letter-spacing:2px;color:#a89bb7;margin-top:2px}
.t-brand{font:900 11px Arial;color:#b998ff;margin-top:2px}
.t-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px}
.t-stat{background:#21142f;border:1px solid rgba(255,255,255,.04);border-radius:11px;padding:8px 5px;text-align:center;box-shadow:inset 0 1px rgba(255,255,255,.03)}
.t-stat b{display:block;font:900 19px Arial Black,Arial;color:#fff}
.t-stat span{display:block;font:700 8px Arial;letter-spacing:1px;color:#a89bb7;margin-top:2px}
.t-main{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:10px;align-items:start}
.t-board-wrap{background:#180e22;border:2px solid #342341;border-radius:16px;padding:8px;box-shadow:0 8px 22px rgba(0,0,0,.24)}
#t-board{display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(20,1fr);width:100%;aspect-ratio:1/2;border-radius:9px;overflow:hidden;background:#07040b;border:1px solid #33253b}
.t-cell{position:relative;border:1px solid rgba(255,255,255,.035);background:#0b0710;overflow:hidden}
.t-cell.filled{box-shadow:inset 0 0 0 2px rgba(255,255,255,.25),inset 0 0 12px rgba(255,255,255,.16)}
.t-cell.active{box-shadow:inset 0 0 0 2px rgba(255,255,255,.56),0 0 9px rgba(255,255,255,.18)}
.t-cell.cyan{background:#30d5e8}.t-cell.yellow{background:#f5d85a}.t-cell.purple{background:#ad6cff}.t-cell.green{background:#57d77e}.t-cell.red{background:#ff5b69}.t-cell.blue{background:#5b8dff}.t-cell.orange{background:#ff9b4a}
.t-preview{background:#21142f;border:1px solid rgba(255,255,255,.04);border-radius:12px;padding:9px}
.t-preview h4{font:800 10px Arial;letter-spacing:1.2px;color:#a89bb7;margin-bottom:8px}
#t-next{display:grid;grid-template-columns:repeat(4,12px);grid-auto-rows:12px;gap:2px;justify-content:center;min-height:58px;align-content:center;background:#110a18;border-radius:10px}
.ncell{width:12px;height:12px;border-radius:2px;background:transparent}.ncell.cyan{background:#30d5e8}.ncell.yellow{background:#f5d85a}.ncell.purple{background:#ad6cff}.ncell.green{background:#57d77e}.ncell.red{background:#ff5b69}.ncell.blue{background:#5b8dff}.ncell.orange{background:#ff9b4a}
.t-side{margin-top:8px;display:flex;flex-direction:column;gap:7px}
.t-mini{background:#21142f;border:1px solid rgba(255,255,255,.04);border-radius:10px;padding:7px;text-align:center;color:#b7a7c8;font:700 8px Arial;line-height:1.3}
.t-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.t-btn{height:54px;border:0;border-radius:13px;background:#25192f;color:#fff;box-shadow:0 5px 0 rgba(0,0,0,.24),inset 0 1px rgba(255,255,255,.04);font:700 22px Arial;cursor:pointer;touch-action:manipulation}
.t-btn:active{transform:translateY(4px);box-shadow:0 1px 0 rgba(0,0,0,.24);filter:brightness(1.18)}
.t-btn.small{font-size:24px}.t-btn.drop{font-size:14px;line-height:1.1}.t-btn.reset{font-size:20px}
.t-drop{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}
.t-info{text-align:center;color:#a89bb7;font:600 9px Arial;line-height:1.55;margin:9px 6px 2px}
.t-over{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(10,4,16,.78);backdrop-filter:blur(2px);color:#fff;text-align:center}
.t-over b{font:900 24px Arial Black,Arial;color:#ff7d97;text-shadow:0 0 12px rgba(255,85,115,.28)}
.t-over span{font:700 10px Arial;color:#c2b4cf;margin-top:5px}
#t-wrap{position:relative}
@media (max-width:360px){.t-main{grid-template-columns:minmax(0,1fr) 82px}.t-stat b{font-size:17px}.t-btn{height:50px}.t-preview{padding:7px}}
</style>
<div id="tetris-app">
  <div class="t-title"><div><div class="t-name">TETRIS</div><div class="t-sub">DROP • MOVE • CLEAR</div></div><div class="t-brand">oh</div></div>
  <div class="t-stats">
    <div class="t-stat"><b id="t-score">0</b><span>SCORE</span></div>
    <div class="t-stat"><b id="t-lines">0</b><span>LINES</span></div>
    <div class="t-stat"><b id="t-level">1</b><span>LEVEL</span></div>
  </div>
  <div class="t-main">
    <div class="t-board-wrap">
      <div id="t-wrap"><div id="t-board"></div><div id="t-overlay" style="display:none" class="t-over"><b>GAME OVER</b><span id="t-over-text">Tekan ↻ untuk mulai lagi</span></div></div>
      <div class="t-controls">
        <button class="t-btn" id="t-left" aria-label="Kiri">‹</button>
        <button class="t-btn reset" id="t-reset" aria-label="Reset">↻</button>
        <button class="t-btn" id="t-right" aria-label="Kanan">›</button>
      </div>
      <div class="t-drop">
        <button class="t-btn drop" id="t-soft">⌄ Soft Drop</button>
        <button class="t-btn drop" id="t-hard">⇣ Hard Drop</button>
      </div>
    </div>
    <div>
      <div class="t-preview"><h4>NEXT</h4><div id="t-next"></div></div>
      <div class="t-side">
        <div class="t-mini" id="t-piece-info">Blok turun dari atas</div>
        <div class="t-mini">Tap papan untuk mengarahkan blok ke kolom yang kamu pilih.</div>
        <button class="t-btn small" id="t-rotate" aria-label="Rotasi">⟳</button>
      </div>
    </div>
  </div>
  <div class="t-info">Klik ‹ / › untuk geser · ⟳ untuk putar · Soft Drop untuk mempercepat · Hard Drop untuk jatuhkan langsung. Baris penuh langsung hancur.</div>
</div>
<script>
(function(){
  'use strict';
  var W=10,H=20;
  var shapes={
    I:[[1,1,1,1]],
    O:[[1,1],[1,1]],
    T:[[0,1,0],[1,1,1]],
    S:[[0,1,1],[1,1,0]],
    Z:[[1,1,0],[0,1,1]],
    J:[[1,0,0],[1,1,1]],
    L:[[0,0,1],[1,1,1]]
  };
  var colors={I:'cyan',O:'yellow',T:'purple',S:'green',Z:'red',J:'blue',L:'orange'};
  var board,active,nextType,score,lines,level,over,dropTimer,dropDelay,locked=false;
  var scoreEl=document.getElementById('t-score'),linesEl=document.getElementById('t-lines'),levelEl=document.getElementById('t-level');
  var boardEl=document.getElementById('t-board'),nextEl=document.getElementById('t-next'),overlay=document.getElementById('t-overlay'),overText=document.getElementById('t-over-text');
  function clone(m){return m.map(function(r){return r.slice()});}
  function randomType(){var k=Object.keys(shapes);return k[Math.floor(Math.random()*k.length)];}
  function resetBoard(){board=[];for(var r=0;r<H;r++){board[r]=[];for(var c=0;c<W;c++)board[r][c]=null;}}
  function newActive(type){
    var m=clone(shapes[type]);
    return {type:type,shape:m,x:Math.floor((W-m[0].length)/2),y:-1};
  }
  function canPlace(p,dx,dy,shape){shape=shape||p.shape;for(var r=0;r<shape.length;r++)for(var c=0;c<shape[r].length;c++)if(shape[r][c]){var x=p.x+c+dx,y=p.y+r+dy;if(x<0||x>=W||y>=H)return false;if(y>=0&&board[y][x])return false;}return true;}
  function merge(){for(var r=0;r<active.shape.length;r++)for(var c=0;c<active.shape[r].length;c++)if(active.shape[r][c]){var y=active.y+r,x=active.x+c;if(y>=0)board[y][x]=active.type;}}
  function clearLines(){var cleared=0;for(var r=H-1;r>=0;r--){var full=true;for(var c=0;c<W;c++)if(!board[r][c]){full=false;break;}if(full){board.splice(r,1);var row=[];for(var k=0;k<W;k++)row.push(null);board.unshift(row);cleared++;r++;}}
    if(cleared){window.GX&&GX.blip(880,1320,.15,.05);window.GX&&GX.vib(12);var pts=[0,100,300,500,800][cleared]||1200;score+=pts*level;lines+=cleared;level=1+Math.floor(lines/10);dropDelay=Math.max(90,750-(level-1)*55);restartTimer();}
  }
  function rotate(){
    if(over||locked)return;
    var s=active.shape, rows=s.length, cols=s[0].length, n=[];
    for(var c=0;c<cols;c++){n[c]=[];for(var r=rows-1;r>=0;r--)n[c].push(s[r][c]);}
    var kicks=[0,-1,1,-2,2];
    for(var i=0;i<kicks.length;i++)if(canPlace(active,kicks[i],0,n)){active.shape=n;active.x+=kicks[i];render();return;}
  }
  function move(dx){if(over||locked)return;if(canPlace(active,dx,0)){active.x+=dx;render();}}
  function softDrop(){if(over||locked)return;if(canPlace(active,0,1)){active.y++;score+=1;render();}else lockPiece();}
  function hardDrop(){if(over||locked)return;window.GX&&GX.blip(420,250,.08,.045);var d=0;while(canPlace(active,0,d+1))d++;active.y+=d;score+=2*d;lockPiece();}
  function lockPiece(){if(locked)return;locked=true;merge();clearLines();spawn();locked=false;render();}
  function spawn(){
    active=newActive(nextType||randomType());nextType=randomType();
    if(!canPlace(active,0,0)){window.GX&&GX.blip(320,70,.42,.06,'triangle');window.GX&&GX.vib([30,40,70]);over=true;clearInterval(dropTimer);overlay.style.display='flex';overText.textContent='Score '+score+' · Tekan ↻ untuk main lagi';}
  }
  function tick(){if(over)return;if(canPlace(active,0,1)){active.y++;render();}else lockPiece();}
  function restartTimer(){clearInterval(dropTimer);if(!over)dropTimer=setInterval(tick,dropDelay);}
  function start(){score=0;lines=0;level=1;dropDelay=750;over=false;locked=false;overlay.style.display='none';resetBoard();active=newActive(randomType());nextType=randomType();restartTimer();render();}
  function render(){
    for(var i=0;i<W*H;i++){var cell=boardEl.children[i],r=Math.floor(i/W),c=i%W;cell.className='t-cell';var v=board[r][c];if(v)cell.classList.add('filled',colors[v]);}
    if(active){for(var r=0;r<active.shape.length;r++)for(var c=0;c<active.shape[r].length;c++)if(active.shape[r][c]){var x=active.x+c,y=active.y+r;if(y>=0&&y<H&&x>=0&&x<W){var idx=y*W+x;boardEl.children[idx].classList.add('active',colors[active.type]);}}}
    scoreEl.textContent=score;linesEl.textContent=lines;levelEl.textContent=level;
    renderNext();
  }
  function renderNext(){nextEl.innerHTML='';var s=shapes[nextType]||shapes.I;var cols=Math.max(4,s[0].length);nextEl.style.gridTemplateColumns='repeat('+cols+',12px)';for(var r=0;r<s.length;r++)for(var c=0;c<cols;c++){var d=document.createElement('div');d.className='ncell'+(s[r]&&s[r][c]?(' '+colors[nextType]):'');nextEl.appendChild(d);}}
  function buildBoard(){boardEl.innerHTML='';for(var i=0;i<W*H;i++){var d=document.createElement('div');d.className='t-cell';d.dataset.index=i;d.addEventListener('click',function(){var idx=Number(this.dataset.index),col=idx%W;if(over)return;var center=active.x+(active.shape[0].length-1)/2;if(col<center)move(-1);else if(col>center)move(1);else rotate();});boardEl.appendChild(d);}}
  document.getElementById('t-left').addEventListener('click',function(){move(-1)});
  document.getElementById('t-right').addEventListener('click',function(){move(1)});
  document.getElementById('t-rotate').addEventListener('click',rotate);
  document.getElementById('t-soft').addEventListener('click',softDrop);
  document.getElementById('t-hard').addEventListener('click',hardDrop);
  document.getElementById('t-reset').addEventListener('click',start);
  document.addEventListener('keydown',function(e){var k=e.key;if(k==='ArrowLeft')move(-1);else if(k==='ArrowRight')move(1);else if(k==='ArrowUp')rotate();else if(k==='ArrowDown')softDrop();else if(k===' ')hardDrop();});
  buildBoard();start();
})();
</script>
<script>
(function(){var A=null,on=true;function ac(){try{if(!A){var C=window.AudioContext||window.webkitAudioContext;if(C)A=new C()}if(A&&A.state==='suspended')A.resume()}catch{}}
function blip(f1,f2,d,v,t){if(!on)return;ac();if(!A)return;try{var n=A.currentTime,o=A.createOscillator(),g=A.createGain();o.type=t||'square';o.frequency.setValueAtTime(f1,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v||.05,n+.015);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.03)}catch{}}
function vib(p){if(!on)return;try{if(navigator.vibrate)navigator.vibrate(p)}catch{}}
window.GX={blip:blip,vib:vib,unlock:ac,isOn:function(){return on}};
document.addEventListener('pointerdown',ac,{passive:true});document.addEventListener('keydown',ac,{passive:true});
try{var b=document.createElement('button');b.type='button';b.textContent='\uD83D\uDD0A';b.setAttribute('aria-label','Suara');
b.style.cssText='position:fixed;right:10px;bottom:10px;z-index:2147483000;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(16,22,26,.82);color:#e9f1ef;font-size:15px;line-height:1;box-shadow:0 6px 16px rgba(0,0,0,.45)';
b.onclick=function(){on=!on;b.textContent=on?'\uD83D\uDD0A':'\uD83D\uDD07';if(on)blip(880,1320,.09,.05)};
document.body.appendChild(b)}catch{}
})();
</script>
<script>
/* nano-guard-v2: (1) matikan menu tekan-lama/seleksi/seret, (2) geser di area permainan
   tidak menutup webview, (3) tombol balas SEKETIKA saat jari menyentuh supaya ambang
   tekan-lama WhatsApp tidak pernah tercapai (klik asli sesudahnya dimatikan). */
(function(){var D=document,i,evs=['contextmenu','selectstart','dragstart','gesturestart'];
for(i=0;i<evs.length;i++)D.addEventListener(evs[i],function(e){var t=e.target;if(t&&t.closest&&t.closest('textarea,input,[contenteditable]'))return;e.preventDefault()},false);
D.addEventListener('touchmove',function(e){var t=e.target,n;if(t&&t.closest&&t.closest('textarea,input,[contenteditable],.ovCard,.modal'))return;
for(n=t;n&&n!==D.body;n=n.parentElement)if(n.scrollHeight>n.clientHeight+4)return;
if(D.documentElement.scrollHeight>window.innerHeight+4)return;e.preventDefault()},{passive:false});
var sup=false,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit)/i;
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
html,body{overscroll-behavior:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
img,canvas,svg{-webkit-user-drag:none;-webkit-touch-callout:none}
textarea,input,select,[contenteditable]{-webkit-user-select:text;user-select:text}
button,[role="button"],a,.btn,.key,.pad,.tab,.lvt,.chip,.cell,.tile,.card{-webkit-user-select:none;user-select:none;touch-action:manipulation}
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
::-webkit-scrollbar-thumb{background:rgba(212,180,143,.35);border-radius:99px}
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
.t-board-wrap{border-radius:18px!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.06),inset 0 -9px 22px rgba(0,0,0,.7),0 16px 36px rgba(0,0,0,.5),0 2px 0 rgba(0,0,0,.5)!important}
.t-cell{box-shadow:inset 0 1px 0 rgba(255,255,255,.09),inset 0 -2px 3px rgba(0,0,0,.55)!important}
.t-board-wrap canvas{border-radius:12px;filter:saturate(1.08) contrast(1.04)}
.t-preview,.t-mini,.t-stats,.t-side,.t-controls{border-radius:14px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -4px 10px rgba(0,0,0,.45),0 10px 24px rgba(0,0,0,.45)!important}
</style>`

const SIG = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YcN55YRyad2+ZA=="
const CERT1 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGEOvtJr968bbpKdZreOTwkk9aPN++XPE60RfuzNLkXXc7LE8BOkJOWRpo2oNXaRJ3uCNJ43HY3A+oetnvHSfcxWqmvvTSrBOI5V1NOD6RMsZ/st1XVPUx83AGps1l5jYBOYzqMNy6un2tToJ2Bt9bXRo29tWLZTu8m7TNY/hISwVpVc5tjSet5U7btPN+dMIx2UvykB1jcbWGsdklheeuz8RXSStNXzeaGvsf1lpZ/ugLE4b2BdmlRNKrY6zLE4qFtRYQoS7axOyQX+4QUyN2m9bfm7urQmn+QRSXJwMO7X5kAJJLbkVGJFt9Pm9VXPwQVrK2aaqiXlpusj+7DfDw00OULmYMmZDTqXM0nUVLxj13z0LhMQoQhhNG8utdUn4uKOFceliTZ/xiP+A54GnX9620641bqw3ctfh9NNXPsTEK8hAUD7FDqUhVntHmoEYYEHq8X1tHHZYP49/f2iezTiE8AUaoZo42/jIWQIKohOGNUib2hEqMkW8NsR8vPihvNuqPc0zKZcl6359YFQdjiiW8kCRD/rsDOr9v1eYLFZKYloFyzFqEgj+jcG/V47elOjShJ5CCPwatXwP6HIloVwtgygFsnOFmCg6Ojoivfo8Nw1qxFwg5OU2cq/1WbWNELKnaFg4eUWCAIJ/3ZIJsEPkgemZxGhE+hdiNn9dkQYBJs1kx2BxdIkJmQ9vJSKkrMz6lTxZM3IJ9mhmKS6zYdU1ppeAao0/ayte997DQParb/AHLN79g0iW1ad0z8ir5jAl0q3a+UZPTSa4YiSqC2PZ/gfxG5wvL2mKmeKowG0RXjmEp5iNxrni+T/HRLZOoH7y0DQ24nMCPg"
const CERT2 = "TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGHsL0Ccm0ELINFZ2IaBhKaeWnVuh0o6nZLCioCn9xpSADzwIS5VCWO+1eVXT2atJOyf7FYlpB0/JA3Us+aQtekuIkHu/zBXijORZ4ClF4+sF3cSTNg6gY/+6iwLK/zs3bMg+GeJrcI65vXfs95Shxlb2Rd5GRT2/2yBmR6Zkf5QwMJuptUHWtM26WY7/xlkEKGFYDZVqOSylusiOzSALa815zC6dCiHoJNLBEKMlaZZQOk57/+OYoU5zzTaEgLhyvNFHSyAlyLQ3SGFtVHAaJZHSmmSPyJowCOB+92Gkk6SWVMsk6FbU8QJWFtlhzV/W/gZ7WzUlS/AKgN0th9/cq20ToFkW7X9c+rtYavufmuieqFhXgaMD8AGsoN9QC/HzNC9D1nydPfFYEUr9BHVy2nF5gM58Y59r2rT8p5LPARIkUp8g+5DLhyW0tdZFZ1305o4AHCayZnp5rjcU2Xi/c1Qf/djBGakmijlMs4aMzKJYD0c4Q8jdI7sNyd876K2wRD+L6KeD2QB3PtCS4P7BWAl5gh5CJ6ZBrwcaKXZqcSjEwm52MqVCgYZdapAaNYUy/QndttjLOG0wxxwuX1hIhMjPnIKZR1kwnqD5EqlHpilrnojRZvjVGN4zEKmilS8rNstt4HHs/D849W+Q6LRVWiWMs0cT2IugrX+Skxd8En7Gq52UEmuVBrSTpN+UpIu20NsVb9lsvuYh3XO441606tOEY2eKcZJdTtqrOTNqbbTk0zVn1yhbOCvmfctBNDhTwaC5QMi0P9wjU5XI9SBtkdQLizc5oqpoiHeqgb8+aJHVLcbgIJ/KLZKtRWFDfzRNM02Csx4etUUapVd2NA/L0oMs/O5T9sVj9FBJ7q99GWr3PVmxJb36mHZlXC4k1gGN9swE0LtzYsUdT5tUo9ri/hS3W/SM+F1p4Kh4QIgRcG3ciIHGN44bnDh3HDCz0fDnzKYw0bclMxZPctEyJ5gEOPF6OAkjD9dEaRGq/tEPf1k9Aub+v2dEjnfrYWAm4Qq4j8yRekrQ=="

async function kirimForwardSigned(conn, chatId, html, judul) {
    const data = Buffer.from(JSON.stringify({
        __typename: 'GenAIUnifiedResponse',
        response_id: randomUUID(),
        sections: [{
            __typename: 'GenAIUnifiedResponseSection',
            view_model: {
                __typename: 'GenAISingleLayoutViewModel',
                primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload: html,
                    trusted_sources: []
                }
            }
        }]
    })).toString('base64')

    return conn.relayMessage(chatId, {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                messageDisclaimerText: "",
                botResponseId: randomUUID(),
                verificationMetadata: {
                    proofs: [{
                        version: 1,
                        useCase: 1,
                        signature: SIG,
                        certificateChain: [CERT1, CERT2]
                    }]
                }
            }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 1,
                    submessages: [{
                        messageType: 2,
                        messageText: judul
                    }],
                    unifiedResponse: { data },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
                        forwardOrigin: 4
                    }
                }
            }
        }
    }, {})
}

const handler = async (m, { conn }) => {
    try {
        await kirimForwardSigned(conn, m.chat, TETRIS_HTML, '🧱 TETRIS')
    } catch (e) {
        console.error('[TETRIS]', e?.message || e)
        await conn.sendMessage(
            m.chat,
            { text: '❌ Gagal mengirim game: ' + (e?.message || e) },
            { quoted: m.raw }
        ).catch(() => {})
    }
}

handler.command = /^(?:tetris|tetri)$/i
handler.help = ['tetris', 'tetri']
handler.tags = ['game']
handler.category = 'game'
handler.description = 'Inline Tetris game'
handler.ownerOnly = false
handler.groupOnly = false
handler.disabled = false
handler.hiddenFromCategory = false

export default handler
