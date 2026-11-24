/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ━━━[ 🎮 GAME ]━━━━
┇ KATA RAHASIA — Wordle Indonesia
┇ Skor disimpan di HP (localStorage).
⌬
*/

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#12161a">
<title>Nano Ai Kata Rahasia</title>
<style>
:root{--bg:#12161a;--panel:#1b2429;--line:#3a4a52;--text:#e9f2ee;--dim:#93a3a8;--gold:#d8b77f}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
html,body{min-height:100%;background:radial-gradient(700px 420px at 50% -10%,#26333a 0%,var(--bg) 70%);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;padding:12px 10px 20px;overflow-x:hidden}
.app{width:min(100%,430px)}
.panel{background:linear-gradient(180deg,#2b363c,#1a2227);border:1px solid #3c4b53;border-radius:20px;padding:11px;box-shadow:0 20px 50px #0009}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#151c20;border:1px solid #2f3d45;border-radius:14px;padding:8px 10px;margin-bottom:9px}
.title{font:900 15px Georgia,serif;letter-spacing:.3px}.sub{color:var(--dim);font-size:7.5px;letter-spacing:.4px;margin-top:2px}
.chips{display:flex;gap:6px}.chip{min-width:54px;text-align:center;background:#1b2429;border:1px solid #35444c;border-radius:10px;padding:4px 7px}
.chip b{display:block;color:var(--dim);font-size:6.5px;letter-spacing:.12em}.chip span{display:block;color:var(--gold);font:900 13px system-ui;line-height:1.1}
.board{display:grid;grid-template-rows:repeat(6,1fr);gap:5px;margin-bottom:8px}
.brow{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.cell{aspect-ratio:1/1;display:grid;place-items:center;border:2px solid #36454d;border-radius:10px;background:#161d21;font:900 clamp(15px,5vw,23px) system-ui;text-transform:uppercase}
.cell.f{border-color:#5d6f78;transform:scale(1.04)}
.cell.hit{background:linear-gradient(180deg,#93d46d,#4d8c34);border-color:#93d46d;color:#0f2309}
.cell.near{background:linear-gradient(180deg,#eac864,#a5841e);border-color:#eac864;color:#2a1f04}
.cell.miss{background:#232d33;border-color:#2a343a;color:#8f9ea3}
@keyframes fl{0%{transform:rotateX(0)}45%{transform:rotateX(88deg)}100%{transform:rotateX(0)}}
.cell.fl{animation:fl .3s ease}
.kb{display:grid;gap:4px;margin:4px 0 9px}
.kr{display:flex;gap:4px;justify-content:center}
.key{flex:1;min-width:0;height:40px;border:1px solid #48585f;border-radius:8px;background:linear-gradient(180deg,#3a4a52,#27323a);color:#e8f0ee;font:900 12px system-ui;box-shadow:0 3px 0 #141a1d;transition:transform .06s ease}
.key.w{flex:1.8;font-size:9.5px}
.key:active{transform:translateY(2px)}
.key.hit{background:linear-gradient(180deg,#93d46d,#4d8c34);border-color:#7cbb59;color:#0f2309}
.key.near{background:linear-gradient(180deg,#eac864,#a5841e);border-color:#c8a43a;color:#2a1f04}
.key.miss{background:#20282d;border-color:#283238;color:#75838a}
.row{display:flex;gap:7px}.row+.row{margin-top:7px}
.btn{flex:1;min-height:42px;border:1px solid #53636a;border-radius:11px;background:linear-gradient(180deg,#3e4e56,#2b363c);color:var(--text);font:900 10.5px system-ui;letter-spacing:.3px;box-shadow:0 4px 0 #12181b;transition:transform .06s ease}
.btn.gold{background:linear-gradient(180deg,#e3c894,#a8834f);border-color:#c8a774;color:#231a0c}
.btn:active{transform:translateY(2px)}
.tip{margin-top:9px;color:var(--dim);font-size:8px;line-height:1.5;text-align:center}
.ov{position:fixed;inset:0;display:none;place-items:center;background:#06090bd9;backdrop-filter:blur(8px);z-index:9;padding:16px}
.ov.on{display:grid}
.modal{width:min(94%,330px);background:linear-gradient(180deg,#35444d,#212a2f);border:1px solid #4d5e68;border-radius:18px;padding:16px;text-align:center;box-shadow:0 20px 44px #000a}
.modal h2{font:900 19px Georgia,serif;margin-top:4px}.modal p{color:var(--dim);font-size:9px;margin-top:5px;line-height:1.5}
.ico{font-size:28px}
.share{margin-top:9px;padding:8px;border:1px dashed #4d5e68;border-radius:10px;background:#101619;color:#e9f2ee;font:12px/1.5 system-ui;white-space:pre-wrap;word-break:break-word}
.modal .row{margin-top:10px}
</style>
</head>
<body>
<div class="app"><div class="panel">
  <div class="head">
    <div><div class="title">KATA RAHASIA</div><div class="sub">WORDLE INDONESIA • NANO AI</div></div>
    <div class="chips"><div class="chip"><b>MENANG</b><span id="wins">0</span></div><div class="chip"><b>STREAK</b><span id="streak">0</span></div></div>
  </div>
  <div class="board" id="board"></div>
  <div class="kb" id="kb"></div>
  <div class="row"><button class="btn gold" id="bDaily" type="button">MODE HARIAN</button><button class="btn" id="bRand" type="button">ACAK</button></div>
  <div class="row"><button class="btn" id="bHint" type="button">PETUNJUK (2)</button><button class="btn" id="bShare" type="button">BAGIKAN</button></div>
  <div class="tip" id="tip">Tebak kata 5 huruf bahasa Indonesia dalam 6 percobaan.<br>Hijau = huruf &amp; posisi tepat • Kuning = huruf ada tapi salah posisi</div>
</div></div>
<div class="ov" id="ov"><div class="modal">
  <div class="ico" id="mIco">🎉</div><h2 id="mTitle">Hebat!</h2><p id="mText"></p>
  <pre class="share" id="mShare"></pre>
  <div class="row"><button class="btn gold" id="mAgain" type="button">MAIN LAGI</button><button class="btn" id="mCopy" type="button">SALIN</button></div>
  <div class="row"><button class="btn" id="mClose" type="button">TUTUP</button></div>
</div></div>
<script>
(function(){
'use strict';
var WORDS=['rumah','pintu','kunci','bunga','bulan','hutan','pulau','kapal','sawah','cabai','tomat','bayam','bakso','gudeg','tempe','jeruk','salak','nanas','gajah','katak','lebah','semut','lalat','cicak','tokek','kadal','penyu','udang','bambu','hujan','panas','angin','sinar','gelap','siang','malam','senja','fajar','petir','gempa','bukit','danau','kolam','pasir','tanah','jalan','pasar','murid','kursi','lampu','dapur','kamar','gelas','garpu','pisau','panci','wajan','kuali','botol','garam','serai','sabun','sikat','batik','tenun','rebab','puisi','macan','singa','badak','domba','bebek','tikus','motor','mobil','balon','kabel','kasur','ember','sumur','taman','pagar','papan','semen','perak','surat','paket','kotak','cerek','ketel','kukus','rebus','bakar','arang','beras','sayur','sirup','jajan','kelas','tugas','ujian','nilai','rajin','malas','kapur','absen','raket','juara','piala','trofi','musik','piano','gitar','komik','novel','koran','sakit','sehat','dosis','utang','bayar','harga','angka','garis','warna','merah','hijau','hitam','putih','dunia','ombak','umpan','rambu','sopir','tiket','pohon','hewan','satwa','tidur','mimpi','makan','minum','duduk','lihat','sedih','takut','marah','sabar','jujur','sopan','ramah','kerja','rekan','rapat','hasil','usaha','layar','kuota','video','suara'];
var ROWS=6,COLS=5;
var target='',cur='',rows=[],states=[],over=false,won=false,mode='daily',hints=2,usedHint=false,todayKey='';
var E={},KB=[],cells=[],keys={};
function el(id){return document.getElementById(id)}
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var stats=ls('kr_stats',{p:0,w:0,s:0,ms:0});
var daily=ls('kr_daily',{k:'',g:''});
function dayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function todayIdx(){return Math.floor(Date.now()/864e5)%WORDS.length}
function blip(a,b,c,d,e){try{if(window.GX)GX.blip(a,b,c,d,e)}catch(x){}}
function vib(p){try{if(window.GX)GX.vib(p)}catch(x){}}

function build(){
  var b=el('board');b.innerHTML='';cells=[];
  for(var r=0;r<ROWS;r++){
    var row=document.createElement('div');row.className='brow';var line=[];
    for(var c=0;c<COLS;c++){var d=document.createElement('div');d.className='cell';row.appendChild(d);line.push(d)}
    b.appendChild(row);cells.push(line)
  }
  var kb=el('kb');kb.innerHTML='';KB=[];keys={};
  var layout=['qwertyuiop','asdfghjkl','zxcvbnm'];
  for(var i=0;i<layout.length;i++){
    var kr=document.createElement('div');kr.className='kr';var lineK=[];
    if(i===2){lineK.push(mkKey('enter','⏎ KIRIM',true))}
    for(var j=0;j<layout[i].length;j++){lineK.push(mkKey(layout[i][j],layout[i][j].toUpperCase(),false))}
    if(i===2){lineK.push(mkKey('del','⌫ HAPUS',true))}
    for(var k=0;k<lineK.length;k++)kr.appendChild(lineK[k]);
    kb.appendChild(kr);KB.push(lineK)
  }
}
function mkKey(v,label,wide){
  var b=document.createElement('button');b.type='button';b.className='key'+(wide?' w':'');b.textContent=label;
  b.addEventListener('click',function(e){e.preventDefault();press(v)});
  if(v.length===1)keys[v]=b;
  return b
}
function newGame(m){
  mode=m;target=m==='daily'?WORDS[todayIdx()]:WORDS[Math.floor(Math.random()*WORDS.length)];
  cur='';rows=[];states=[];over=false;won=false;usedHint=false;hints=2;
  todayKey=dayKey();
  el('bHint').textContent='PETUNJUK (2)';
  el('ov').className='ov';
  build();paint();
  el('tip').innerHTML=m==='daily'?'Mode HARIAN — kata sama untuk semua orang hari ini.<br>Bagikan hasilmu ke grup biar bisa dibandingkan!':'Mode ACAK — kata baru setiap kali main.';
  if(m==='daily'&&daily.k===todayKey&&daily.g){el('tip').innerHTML='Kata harian hari ini sudah kamu selesaikan.<br>Hasilmu: '+daily.g+' — mau coba mode ACAK?'}
}
function paint(){
  var r,c;
  for(r=0;r<ROWS;r++)for(c=0;c<COLS;c++){
    var cell=cells[r][c];cell.className='cell';cell.textContent='';
    if(rows[r]){cell.textContent=rows[r].g[c];cell.className='cell '+rows[r].m[c]}
    else if(r===rows.length&&cur[c]){cell.textContent=cur[c];cell.className='cell f'}
  }
  var i;for(i in keys){keys[i].className='key'+(i.length>1?' w':'')}
  for(i in keys){
    var st='';
    for(r=0;r<rows.length;r++){for(c=0;c<COLS;c++){if(rows[r].g[c]===i){var s=rows[r].m[c];if(s==='hit'||(s==='near'&&st!=='hit')||(s==='miss'&&!st))st=s}}}
    if(st)keys[i].className='key'+(i.length>1?' w':'')+' '+st
  }
  el('wins').textContent=stats.w;el('streak').textContent=stats.s;
}
function mark(g,t){
  var out=[],pool={},i,ch;
  for(i=0;i<5;i++){out.push('miss');pool[t.charAt(i)]=(pool[t.charAt(i)]||0)+1}
  for(i=0;i<5;i++){ch=g.charAt(i);if(ch===t.charAt(i)){out[i]='hit';pool[ch]--}}
  for(i=0;i<5;i++){ch=g.charAt(i);if(out[i]!=='hit'&&pool[ch]>0){out[i]='near';pool[ch]--}}
  return out
}
function press(k){
  if(over)return;
  if(k==='enter'){submit();return}
  if(k==='del'){cur=cur.slice(0,-1);paint();blip(300,220,.05,.03);return}
  if(cur.length<COLS&&/[a-z]/.test(k)){cur+=k;paint();blip(520+cur.length*40,700+cur.length*40,.04,.028)}
}
function submit(){
  if(cur.length<COLS){el('tip').textContent='Hurufnya belum 5. Isi dulu ya.';vib(20);return}
  var g=cur.toLowerCase(),m=mark(g,target);
  rows.push({g:g,m:m});cur='';paint();
  var idx=rows.length-1,i=0,row=cells[idx];
  var t=setInterval(function(){
    if(i>=COLS){
      clearInterval(t);
      var r;for(r=0;r<COLS;r++)row[r].textContent=rows[idx].g[r];
      paint();finish();
      return
    }
    row[i].className='cell '+m[i]+' fl';row[i].textContent=rows[idx].g[i];
    blip(m[i]==='hit'?880:m[i]==='near'?620:320,m[i]==='hit'?1240:m[i]==='near'?760:260,.07,.04);
    i++
  },110);
}
function finish(){
  var last=rows[rows.length-1],i;
  if(last.g===target){
    won=true;over=true;stats.p++;stats.w++;
    if(!usedHint){stats.s++;if(stats.s>stats.ms)stats.ms=stats.s}
    ss('kr_stats',stats);
    if(mode==='daily'){daily={k:todayKey,g:gridEmoji()};ss('kr_daily',daily)}
    blip(700,1180,.16,.05);setTimeout(function(){blip(980,1480,.18,.05)},140);setTimeout(function(){blip(1320,1760,.24,.05)},300);
    vib([25,50,80]);
    pop('🎉','Hebat!','Kata rahasianya benar: '+target.toUpperCase()+(usedHint?' (pakai petunjuk, streak tidak naik)':''))
    return
  }
  if(rows.length>=ROWS){
    over=true;stats.p++;stats.s=0;ss('kr_stats',stats);
    if(mode==='daily'){daily={k:todayKey,g:gridEmoji()};ss('kr_daily',daily)}
    blip(300,90,.5,.06,'triangle');vib([40,60,120]);
    pop('😵','Kesempatan habis','Katanya: '+target.toUpperCase()+'. Coba lagi ya!')
  }
}
function gridEmoji(){
  var out=[],r,c;
  for(r=0;r<rows.length;r++){var line='';for(c=0;c<COLS;c++)line+=rows[r].m[c]==='hit'?'🟩':rows[r].m[c]==='near'?'🟨':'⬛';out.push(line)}
  return out.join('\\n')
}
function shareText(){
  var used=won?rows.length:'X';
  var s='KATA RAHASIA ('+(mode==='daily'?'harian':'acak')+') '+used+'/6';
  if(stats.s>1)s+='  🔥'+stats.s;
  s+='\\n'+gridEmoji()+'\\n— Nano Ai';
  return s
}
function pop(ico,title,text){
  el('mIco').textContent=ico;el('mTitle').textContent=title;el('mText').textContent=text;
  el('mShare').textContent=shareText();el('ov').className='ov on'
}
function copyShare(){
  var txt=el('mShare').textContent;
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt);blip(900,1300,.1,.05)}
    else{var ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}
    el('mCopy').textContent='TERSALIN ✓'
  }catch(e){el('mCopy').textContent='SALIN MANUAL'}
}
function hint(){
  if(over)return;
  if(hints<=0){el('tip').textContent='Petunjuk sudah habis.';return}
  hints--;usedHint=true;el('bHint').textContent='PETUNJUK ('+hints+')';
  var idx=Math.floor(Math.random()*COLS);
  el('tip').innerHTML='💡 Petunjuk: huruf ke-'+(idx+1)+' adalah <b style="color:#d8b77f">'+target.charAt(idx).toUpperCase()+'</b>'
  blip(560,920,.12,.045)
}
el('bDaily').addEventListener('click',function(e){e.preventDefault();blip(760,1100,.09,.05);newGame('daily')});
el('bRand').addEventListener('click',function(e){e.preventDefault();blip(760,1100,.09,.05);newGame('rand')});
el('bHint').addEventListener('click',function(e){e.preventDefault();hint()});
el('bShare').addEventListener('click',function(e){e.preventDefault();pop('📤','Hasil kamu',(rows.length?('Sampai baris '+rows.length+' dari 6. Salin lalu tempel ke grup.'):'Belum ada tebakan.'))});
el('mCopy').addEventListener('click',function(e){e.preventDefault();copyShare()});
el('mAgain').addEventListener('click',function(e){e.preventDefault();newGame(mode==='daily'?'rand':'daily')});
el('mClose').addEventListener('click',function(e){e.preventDefault();el('ov').className='ov'});
document.addEventListener('keydown',function(e){
  var k=e.key.toLowerCase();
  if(k==='enter'){e.preventDefault();press('enter');return}
  if(k==='backspace'){e.preventDefault();press('del');return}
  if(/^[a-z]$/.test(k)){e.preventDefault();press(k)}
});
newGame('daily');
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
.board,.kb,.share{border-radius:14px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -5px 12px rgba(0,0,0,.5),0 14px 32px rgba(0,0,0,.5)!important}
.key,.bt{border-radius:10px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.26),inset 0 -3px 5px rgba(0,0,0,.42),0 4px 0 rgba(0,0,0,.45),0 8px 16px rgba(0,0,0,.4)!important}
.kr{border-radius:8px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.22),0 3px 0 rgba(0,0,0,.4)!important}
.chip{border-radius:9px!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '📝', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Kata Rahasia 📝',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-katarahasia-2026',
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

handler.help = ['katarahasia', 'wordle', 'katara']
handler.tags = ['game']
handler.command = /^(katarahasia|wordle|katara|wordleid)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Kata Rahasia — tebak kata 5 huruf (Wordle Indonesia)'

export default handler
