/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ━━━[ 🎮 GAME ]━━━━
┇ SAMBUNG 4 — Connect Four Nano Ai
┇ Lawan AI (3 tingkat) atau 2 pemain bergantian.
⌬
*/

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#12161a">
<title>Nano Ai Sambung 4</title>
<style>
:root{--bg:#12161a;--text:#e9f2ee;--dim:#93a3a8;--gold:#d8b77f;--p1:#ff5c6c;--p2:#f4c53d}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
html,body{min-height:100%;background:radial-gradient(700px 420px at 50% -10%,#26333a 0%,var(--bg) 70%);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;padding:12px 10px 20px;overflow-x:hidden}
.app{width:min(100%,440px)}
.panel{background:linear-gradient(180deg,#2b363c,#1a2227);border:1px solid #3c4b53;border-radius:20px;padding:11px;box-shadow:0 20px 50px #0009}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#151c20;border:1px solid #2f3d45;border-radius:14px;padding:8px 10px;margin-bottom:9px}
.title{font:900 15px Georgia,serif;letter-spacing:.3px}.sub{color:var(--dim);font-size:7.5px;letter-spacing:.4px;margin-top:2px}
.chips{display:flex;gap:6px}.chip{min-width:54px;text-align:center;background:#1b2429;border:1px solid #35444c;border-radius:10px;padding:4px 7px}
.chip b{display:block;color:var(--dim);font-size:6.5px;letter-spacing:.12em}.chip span{display:block;color:var(--gold);font:900 13px system-ui;line-height:1.1}
.turn{display:flex;align-items:center;justify-content:center;gap:7px;margin-bottom:8px;font:900 10.5px system-ui;letter-spacing:.4px;color:#cfe0e6}
.dot{width:13px;height:13px;border-radius:50%;background:var(--p1);box-shadow:0 0 10px currentColor}
.dot.p2{background:var(--p2)}
.bd{position:relative;width:100%;background:linear-gradient(180deg,#20303c,#16232c);border:1px solid #35505f;border-radius:16px;padding:9px;box-shadow:inset 0 6px 18px #0009}
.inner{position:relative;width:100%;aspect-ratio:7/6}
.hole{position:absolute;top:0;left:0;width:calc((100% - 48px)/7);aspect-ratio:1/1;border-radius:50%;background:#0e161c;box-shadow:inset 0 3px 8px #000b}
.disc{position:absolute;top:0;left:0;width:calc((100% - 48px)/7);aspect-ratio:1/1;border-radius:50%;transition:transform .22s cubic-bezier(.34,1.4,.64,1);z-index:2}
.disc.p1{background:radial-gradient(120% 120% at 32% 26%,#ffb3ba,#e0384c 62%,#8d1122);box-shadow:inset 0 -3px 8px #0006,0 2px 6px #0007}
.disc.p2{background:radial-gradient(120% 120% at 32% 26%,#fff0b8,#e3a81c 62%,#8c6806);box-shadow:inset 0 -3px 8px #0006,0 2px 6px #0007}
.disc.win{animation:blink .6s ease infinite alternate}
@keyframes blink{from{filter:brightness(1)}to{filter:brightness(1.5);transform-origin:center}}
.colBtn{position:absolute;top:-1px;height:100%;width:calc(100% / 7);z-index:4;background:transparent;border:0}
.hint{position:absolute;top:0;left:0;width:calc((100% - 48px)/7);height:calc((100% - 40px)/6);border-radius:50%;border:2px dashed #ffffff2e;z-index:3;pointer-events:none;transition:transform .1s ease;display:none}
.ovl{position:absolute;inset:0;display:none;place-items:center;border-radius:16px;background:#0a1114d9;backdrop-filter:blur(6px);z-index:6;padding:14px;text-align:center}
.ovl.on{display:grid}
.ovl h3{font:900 19px Georgia,serif}.ovl p{color:var(--dim);font-size:9.5px;margin-top:5px;line-height:1.5}
.row{display:flex;gap:7px}.row+.row{margin-top:7px;margin-bottom:0}
.btn{flex:1;min-height:42px;border:1px solid #53636a;border-radius:11px;background:linear-gradient(180deg,#3e4e56,#2b363c);color:var(--text);font:900 10.5px system-ui;letter-spacing:.3px;box-shadow:0 4px 0 #12181b;transition:transform .06s ease}
.btn.gold{background:linear-gradient(180deg,#e3c894,#a8834f);border-color:#c8a774;color:#231a0c}
.btn.on{background:linear-gradient(180deg,#93d46d,#4d8c34);border-color:#7cbb59;color:#0f2309}
.btn:active{transform:translateY(2px)}
.modeRow{margin-top:8px}
.tip{margin-top:9px;color:var(--dim);font-size:8px;line-height:1.5;text-align:center}
</style>
</head>
<body>
<div class="app"><div class="panel">
  <div class="head">
    <div><div class="title">SAMBUNG 4</div><div class="sub">CONNECT FOUR • NANO AI</div></div>
    <div class="chips"><div class="chip"><b>MENANG</b><span id="wWin">0</span></div><div class="chip"><b>KALAH</b><span id="wLose">0</span></div></div>
  </div>
  <div class="turn" id="turn"><span class="dot" id="turnDot"></span><span id="turnText">GILIRAN KAMU</span></div>
  <div class="bd"><div class="inner" id="inner"></div>
    <div class="ovl" id="ovl"><div><h3 id="ovT">Hasil</h3><p id="ovP"></p><div class="row"><button class="btn gold" id="ovBtn" type="button">MAIN LAGI</button></div></div></div>
  </div>
  <div class="row modeRow" id="modeRow">
    <button class="btn" id="bEasy" type="button">MUDAH</button><button class="btn on" id="bMid" type="button">SEDANG</button><button class="btn" id="bHard" type="button">SULIT</button>
  </div>
  <div class="row"><button class="btn gold" id="bNew" type="button">ULANG</button><button class="btn" id="bTwo" type="button">2 PEMAIN</button></div>
  <div class="tip" id="tip">Tap salah satu kolom untuk menjatuhkan koin.<br>Susun 4 koin sebaris (horizontal, vertikal, atau diagonal) untuk menang.</div>
</div></div>
<script>
(function(){
'use strict';
var COLS=7,ROWS=6,ME=1,AI=2;
var st=new Array(42).fill(0),turn=1,over=false,busy=false,depth=4,twoPlayer=false,budget=0,nodes=0,best={w:0,l:0};
var dom={},holes=[],bounds=[];
function el(id){return document.getElementById(id)}
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function blip(a,b,c,d,e){try{if(window.GX)GX.blip(a,b,c,d,e)}catch(x){}}
function vib(p){try{if(window.GX)GX.vib(p)}catch(x){}}
function I(r,c){return r*COLS+c}
var WINDOWS=(function(){
  var out=[],r,c,d,dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++)for(d=0;d<4;d++){
    var dr=dirs[d][0],dc=dirs[d][1],cells=[],ok=true,k;
    for(k=0;k<4;k++){var rr=r+dr*k,cc=c+dc*k;if(rr<0||rr>=ROWS||cc<0||cc>=COLS){ok=false;break}cells.push(I(rr,cc))}
    if(ok)out.push(cells)
  }
  return out
})();
function dropper(s,col){for(var r=ROWS-1;r>=0;r--)if(!s[I(r,col)])return r;return -1}
function moves(s){var out=[],c;for(c=0;c<COLS;c++)if(dropper(s,c)>=0)out.push(c);return out}
function winner(s){
  for(var i=0;i<WINDOWS.length;i++){var w=WINDOWS[i],v=s[w[0]];if(!v)continue;if(s[w[1]]===v&&s[w[2]]===v&&s[w[3]]===v)return {p:v,cells:w}}
  return null
}
function evaluate(s,me){
  var opp=me===1?2:1,score=0,i,k,v,w,mine,theirs;
  for(var r=0;r<ROWS;r++){v=s[I(r,3)];if(v===me)score+=3;else if(v===opp)score-=3}
  for(i=0;i<WINDOWS.length;i++){
    w=WINDOWS[i];mine=0;theirs=0;
    for(k=0;k<4;k++){v=s[w[k]];if(v===me)mine++;else if(v===opp)theirs++}
    if(mine&&theirs)continue;
    if(mine===3)score+=60;else if(mine===2)score+=9;else if(mine===1)score+=1;
    if(theirs===3)score-=70;else if(theirs===2)score-=11;else if(theirs===1)score-=1
  }
  return score
}
function search(s,d,alpha,beta,me,toMove){
  var win=winner(s);
  if(win)return win.p===me?100000+d:-(100000+d);
  if(d===0||nodes>budget)return evaluate(s,me);
  var mv=moves(s);
  if(!mv.length)return 0;
  mv.sort(function(a,b){return Math.abs(3-a)-Math.abs(3-b)});
  var i,c,r,v;
  if(toMove===me){
    var bestv=-1e9;
    for(i=0;i<mv.length;i++){
      c=mv[i];r=dropper(s,c);s[I(r,c)]=me;nodes++;
      v=search(s,d-1,alpha,beta,me,me===1?2:1);
      s[I(r,c)]=0;
      if(v>bestv)bestv=v;
      if(bestv>alpha)alpha=bestv;
      if(alpha>=beta)break
    }
    return bestv
  }
  var worstv=1e9;
  for(i=0;i<mv.length;i++){
    c=mv[i];r=dropper(s,c);s[I(r,c)]=me===1?2:1;nodes++;
    v=search(s,d-1,alpha,beta,me,me);
    s[I(r,c)]=0;
    if(v<worstv)worstv=v;
    if(worstv<beta)beta=worstv;
    if(alpha>=beta)break
  }
  return worstv
}
function aiMove(){
  var mv=moves(st);
  if(!mv.length)return -1;
  if(depth<=2&&Math.random()<0.28)return mv[Math.floor(Math.random()*mv.length)];
  var bestv=-1e9,bestCol=mv[0],i,c,r,v;
  nodes=0;budget=depth<=2?4000:depth<=4?40000:160000;
  mv.sort(function(a,b){return Math.abs(3-a)-Math.abs(3-b)});
  for(i=0;i<mv.length;i++){
    c=mv[i];r=dropper(st,c);st[I(r,c)]=AI;
    if(winner(st)){st[I(r,c)]=0;return c}
    v=search(st,depth-1,-1e9,1e9,AI,ME);
    st[I(r,c)]=0;
    v+=Math.random()*2;
    if(v>bestv){bestv=v;bestCol=c}
  }
  return bestCol
}
function build(){
  var inner=el('inner');inner.innerHTML='';holes=[];dom={};
  var r,c,i;
  for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
    var h=document.createElement('div');h.className='hole';
    h.style.transform=tr(r,c);inner.appendChild(h);holes.push(h)
  }
  for(c=0;c<COLS;c++){
    var btn=document.createElement('button');btn.type='button';btn.className='colBtn';
    btn.style.left='calc('+(c*100/7)+'% + '+(c*8/7)+'px)';
    (function(col){btn.addEventListener('click',function(e){e.preventDefault();play(col)});btn.addEventListener('pointerdown',function(e){e.preventDefault();showHint(col)})})(c);
    inner.appendChild(btn)
  }
  var hint=document.createElement('div');hint.className='hint';hint.id='hint';
  for(i=0;i<ROWS;i++){}
  inner.appendChild(hint)
}
function tr(r,c){return 'translate(calc('+(c*100)+'% + '+(c*8)+'px), calc('+(r*100)+'% + '+(r*8)+'px))'}
function showHint(col){
  if(over||busy)return;
  var h=el('hint');h.style.display='block';h.style.transform=tr(0,col)
}
function place(r,c,p,animate){
  var d=document.createElement('div');d.className='disc p'+p;
  if(animate){
    d.style.transform=tr(-1.2,c);
    el('inner').appendChild(d);
    requestAnimationFrame(function(){requestAnimationFrame(function(){d.style.transform=tr(r,c)})})
  }else{d.style.transform=tr(r,c);el('inner').appendChild(d)}
  dom[I(r,c)]=d
}
function play(col){
  if(over||busy)return;
  if(twoPlayer&&turn===2){applyMove(col,2);return}
  if(turn!==1&&!twoPlayer)return;
  applyMove(col,1)
}
function applyMove(col,p){
  var r=dropper(st,col);
  if(r<0)return;
  st[I(r,col)]=p;place(r,col,p,true);
  blip(p===1?620:480,p===1?900:700,.09,.045);vib(10);
  var w=winner(st);
  if(w){finish(w);return}
  if(!moves(st).length){draw();return}
  if(twoPlayer){
    turn=p===1?2:1;setTurn(turn);return
  }
  turn=2;setTurn(2);busy=true;
  setTimeout(function(){
    var c=aiMove();
    if(c<0){busy=false;return}
    var rr=dropper(st,c);st[I(rr,c)]=AI;place(rr,c,2,true);
    blip(480,700,.09,.045);
    var w2=winner(st);
    busy=false;
    if(w2){finish(w2);return}
    if(!moves(st).length){draw();return}
    turn=1;setTurn(1)
  },300)
}
function setTurn(t){
  el('turnDot').className='dot'+(t===2?' p2':'');
  el('turnText').textContent=(twoPlayer?(t===1?'PEMAIN 1 (MERAH)':'PEMAIN 2 (KUNING)'):(t===1?'GILIRAN KAMU':'AI BERPIKIR...'))
}
function finish(w){
  over=true;
  var p1won=w.p===1;
  var i;for(i=0;i<w.cells.length;i++){var d=dom[w.cells[i]];if(d)d.className='disc p'+w.p+' win'}
  if(twoPlayer){
    el('ovT').textContent='PEMAIN '+(p1won?'1':'2')+' MENANG!';
    el('ovP').textContent='Susunan 4 sebaris berhasil dibuat.';
    blip(760,1240,.18,.05);blip(980,1500,.22,.05)
  }else if(p1won){
    best.w++;ss('s4_stats',best);
    el('ovT').textContent='Kamu menang! 🎉';
    el('ovP').textContent='Hebat — AI berhasil kamu kalahkan.';
    blip(720,1160,.16,.05);setTimeout(function(){blip(1000,1480,.2,.05)},150);vib([25,45,80])
  }else{
    best.l++;ss('s4_stats',best);
    el('ovT').textContent='AI menang 🤖';
    el('ovP').textContent='Coba lagi, atau turunkan tingkat kesulitan.';
    blip(300,90,.45,.06,'triangle');vib([40,60,120])
  }
  el('wWin').textContent=best.w;el('wLose').textContent=best.l;
  el('ovl').className='ovl on'
}
function draw(){
  over=true;blip(420,300,.2,.05);
  el('ovT').textContent='Seri!';
  el('ovP').textContent='Papan penuh tanpa 4 sebaris. Ulangi lagi ya.';
  el('ovl').className='ovl on'
}
function reset(){
  st=new Array(42).fill(0);turn=1;over=false;busy=false;
  el('ovl').className='ovl';build();setTurn(1);
  var h=el('hint');if(h)h.style.display='none';
  blip(560,860,.1,.045)
}
function setDepth(d,btn){
  depth=d;el('bEasy').className='btn'+(d===2?' on':'');el('bMid').className='btn'+(d===4?' on':'');el('bHard').className='btn'+(d===6?' on':'');
  blip(700,1000,.08,.04)
}
el('bEasy').addEventListener('click',function(e){e.preventDefault();setDepth(2)});
el('bMid').addEventListener('click',function(e){e.preventDefault();setDepth(4)});
el('bHard').addEventListener('click',function(e){e.preventDefault();setDepth(6)});
el('bNew').addEventListener('click',function(e){e.preventDefault();reset()});
el('ovBtn').addEventListener('click',function(e){e.preventDefault();reset()});
el('bTwo').addEventListener('click',function(e){
  e.preventDefault();
  twoPlayer=!twoPlayer;
  el('bTwo').className='btn'+(twoPlayer?' on':'');
  el('bTwo').textContent=twoPlayer?'2 PEMAIN: ON':'2 PEMAIN';
  el('tip').innerHTML=twoPlayer?'Mode 2 pemain: bergantian di satu HP.<br>Merah jalan dulu, lalu kuning.':'Tap salah satu kolom untuk menjatuhkan koin.<br>Susun 4 koin sebaris (horizontal, vertikal, atau diagonal) untuk menang.';
  reset()
});
el('inner').addEventListener('pointerdown',function(e){
  var t=e.touches&&e.touches[0]?e.touches[0]:e;
  var rect=el('inner').getBoundingClientRect();
  if(!rect.width)return;
  var x=(t.clientX-rect.left)/rect.width;
  var col=Math.floor(x*COLS);
  if(col<0)col=0;if(col>COLS-1)col=COLS-1;
  play(col)
});
best=ls('s4_stats',{w:0,l:0});
el('wWin').textContent=best.w;el('wLose').textContent=best.l;
reset();
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
.bd{border-radius:18px!important;box-shadow:inset 0 7px 20px rgba(0,0,0,.6),inset 0 -2px 0 rgba(255,255,255,.06),0 16px 34px rgba(0,0,0,.5),0 3px 0 rgba(0,0,0,.45)!important}
.hole{border-radius:50%!important;box-shadow:inset 0 4px 11px rgba(0,0,0,.85),inset 0 -2px 0 rgba(255,255,255,.07)!important}
.disc{border-radius:50%!important;box-shadow:inset 0 3px 0 rgba(255,255,255,.5),inset 0 -4px 8px rgba(0,0,0,.45),0 4px 11px rgba(0,0,0,.55)!important}
.dot{border-radius:50%!important}
.chip{border-radius:9px!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🔴', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Sambung 4 🔴',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-sambung4-2026',
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

handler.help = ['sambung4', 'connect4', 'sambung']
handler.tags = ['game']
handler.command = /^(sambung4|connect4|sambung)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Sambung 4 — lawan AI atau 2 pemain di satu HP'

export default handler
