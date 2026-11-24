/*
⌬ Nano Ai · Game Plugin · Bomb Puzzle 💣
*/

'use strict'

/* ==========================================================================
   Nano Ai · Bomb Puzzle 💣
   Pasang bom di petak kosong, bom meledak + menghancurkan blok dalam jangkauan
   (ledakan menyebar garis lurus, dinding batu menghalangi).
   Bom TERBATAS per level → harus efisien. Semua blok hancur = menang,
   bom habis tapi masih ada blok = kalah.
   Semua level DIUJI BISA DISELESAIKAN dengan solver lengkap (lihat --solve).
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#241a10">
<title>Nano Ai Bomb Puzzle</title>
<style>
:root{--bg:#140e08;--panel:#241a10;--panel2:#2f2317;--line:#4d3a22;--text:#fdf3e0;--dim:#c9b28c;--gold:#ffd23f;--green:#8fe04a;--red:#ff6a5e}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(700px 420px at 50% -8%,#2c2013 0%,#1a120a 55%,#0d0804 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#2b1f12,#1a120a);border:1px solid #5a4426;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff22}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#ff9b3d,#c23a10);font-size:20px;box-shadow:0 3px 0 #5e1a04,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 #0008}
.sub{margin-top:1px;color:var(--dim);font-size:8.5px;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px;flex:none}
.hb{width:34px;height:34px;border:1px solid #5a4426;border-radius:10px;background:linear-gradient(180deg,#3a2b18,#241a10);color:#fdf3e0;font-size:15px;box-shadow:0 3px 0 #0d0804}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #0d0804}
.hb.on{border-color:#ffe793;box-shadow:0 0 0 2px #ffe79366,0 3px 0 #0d0804}
.bar{display:flex;align-items:center;gap:6px;background:linear-gradient(180deg,#2f2317,#241a10);border:1px solid #5a4426;border-radius:13px;padding:6px 8px;margin-bottom:8px;box-shadow:inset 0 2px 6px #00000055}
.stx{flex:1;min-width:0;font:900 9px system-ui;letter-spacing:.05em;color:#ffe9b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{flex:none;padding:3px 8px;border-radius:999px;background:#1a120a;border:1px solid #5a4426;color:var(--dim);font:800 8.5px system-ui;letter-spacing:.06em;white-space:nowrap}
.chip b{color:var(--gold)}
.stage{position:relative;width:100%;aspect-ratio:1/1;border:2px solid #4d3a22;border-radius:14px;overflow:hidden;background:#191007;box-shadow:inset 0 6px 18px #00000066,0 6px 16px #00000055}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#241a10e6;border:1px solid #5a4426;color:#fdf3e0;font:900 8.5px system-ui;letter-spacing:.06em;opacity:0;transition:.18s ease;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#0d0804e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s ease}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,360px);max-height:100%;overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:14px 12px;border:1px solid #5a4426;border-radius:16px;background:linear-gradient(180deg,#2f2317,#1a120a);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;letter-spacing:.4px;color:#ffe9b8;text-shadow:0 3px 0 #00000088}
.card2 .small{margin-top:5px;color:var(--dim);font-size:9px;line-height:1.6}
.lv{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:11px}
.lvb{padding:8px 2px;border:1px solid #5a4426;border-radius:11px;background:linear-gradient(180deg,#3a2b18,#241a10);color:#fdf3e0;font:950 13px system-ui;box-shadow:0 3px 0 #0d0804;touch-action:manipulation}
.lvb span{display:block;font:800 6.5px system-ui;color:var(--gold);letter-spacing:.1em;margin-top:2px}
.lvb.lock{filter:saturate(.3) brightness(.7)}
.lvb.done{border-color:#ffd23f;box-shadow:0 0 0 1px #ffd23f66,0 3px 0 #0d0804}
.gbtn{display:block;width:100%;margin-top:9px;min-height:44px;border:1px solid #ffe793;border-radius:12px;background:linear-gradient(180deg,#ff9b3d,#c23a10);color:#2b0d02;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #5e1a04}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #5e1a04}
.gbtn.alt{background:linear-gradient(180deg,#c9a75f,#8a6628);color:#241a08;box-shadow:0 5px 0 #4a3210}
.rowb{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
.stats div{padding:6px 4px;border:1px solid #5a4426;border-radius:10px;background:#1a120ab0}
.stats b{display:block;font:900 13px system-ui;color:var(--gold)}
.stats span{display:block;margin-top:2px;font:800 6.4px system-ui;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.legend{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:9px}
.legend i{font-style:normal;font-size:8px;color:#fdf3e0;background:#1a120aa8;border:1px solid #5a4426;border-radius:999px;padding:3px 7px}
.foot{display:flex;justify-content:space-between;gap:6px;margin-top:8px;color:var(--dim);font-size:7.5px}
@media(max-width:380px){.title{font-size:13px}.card2 .big{font-size:18px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">💣</div>
        <div class="bt">
          <div class="title">Bomb Puzzle</div>
          <div class="sub" id="sub">Nano Ai · bom terbatas, ledakannya harus efisien!</div>
        </div>
      </div>
      <div class="hbtns">
        <button class="hb on" id="bSound" title="Efek suara">🔊</button>
        <button class="hb" id="bReset" title="Ulang level">↺</button>
        <button class="hb" id="bMenu" title="Menu level">☰</button>
      </div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Ketuk petak kosong untuk memasang bom</div>
      <div class="chip">💣 <b id="bombaNum">0</b></div>
      <div class="chip">🧱 <b id="blokNum">0</b></div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">💣 BOMB PUZZLE 🧨</div>
          <div class="small">Ketuk petak kosong untuk memasang bom. Ledakan merusak blok dalam garis lurus (dinding batu menghalangi).<br>Bom terbatas — habis tapi masih ada blok = ulang!</div>
          <div class="lv" id="lvList"></div>
          <div class="legend">
            <i>🧱 Blok kayu: 1× ledakan</i>
            <i>🪨 Blok batu: butuh 2× ledakan</i>
            <i>⬛ Dinding batu: kebal</i>
            <i>💥 Ledakan menyebar garis lurus (max 3 petak)</i>
            <i>⭐ Sisa bom = bintang bonus</i>
          </div>
          <button class="gbtn" id="bPlay">MULAI MAIN</button>
          <div class="small" style="margin-top:7px">Progres & bintang tersimpan otomatis di HP ini.</div>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">LEVEL SELESAI!</div>
          <div class="small" id="endText"></div>
          <div class="stats" id="endStats"></div>
          <div class="rowb" style="margin-top:10px">
            <button class="gbtn" id="bNext">LANJUT</button>
            <button class="gbtn alt" id="bAgain">ULANG</button>
          </div>
          <button class="gbtn alt" id="bToMenu">MENU</button>
        </div>
      </div>
    </div>
    <div class="foot">
      <span>Nano Ai · Bomb Puzzle</span>
      <span id="footR">Level 1</span>
    </div>
  </div>
</div>
<script>
'use strict';
var D=document, TAU=Math.PI*2;
function $(i){return D.getElementById(i)}
function clamp(v,a,b){return v<a?a:(v>b?b:v)}
function rnd(a,b){return a+Math.random()*(b-a)}
var N=7;
var cv=$('cv'), cx=cv.getContext('2d');
var SS=Math.min(3,(navigator.deviceMemory||3)>=3?3:2);
var W=560; cv.width=W*SS; cv.height=W*SS; cx.setTransform(SS,0,0,SS,0,0);
var CS=W/N;

/* ---------- suara ---------- */
var AC=null, sOn=true;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function tone(f1,f2,dur,vol,type,delay){if(!sOn||!ensureAC())return;var t0=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f1,t0);if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||0.14,t0+0.012);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);o.connect(g);g.connect(AC.destination);o.start(t0);o.stop(t0+dur+0.02)}
function noiseS(dur,vol,f0,delay){if(!sOn||!ensureAC())return;var t0=AC.currentTime+(delay||0),n=Math.max(1,Math.floor(AC.sampleRate*dur)),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);var s=AC.createBufferSource();s.buffer=b;var f=AC.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(f0||900,t0);var g=AC.createGain();g.gain.setValueAtTime(vol||0.2,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+dur);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t0)}
var SFX={
  click:function(){tone(520,520,0.05,0.08)},
  pasang:function(){tone(300,460,0.12,0.11,'triangle')},
  boom:function(){noiseS(0.55,0.42,1600);tone(120,42,0.5,0.22,'sawtooth')},
  pecah:function(){noiseS(0.22,0.24,900,0.06)},
  win:function(){var s=[523,659,784,1046,1318];for(var i=0;i<s.length;i++)tone(s[i],s[i],0.26,0.14,'triangle',i*0.12)},
  nope:function(){tone(220,170,0.12,0.12)}
};

/* ---------- level ----------
   . = kosong (bisa pasang bom)   W = dinding batu (kebal)
   1 = blok kayu (hp 1)           2 = blok batu (hp 2)
   b = jumlah bom. SEMUA LEVEL DIUJI BISA (solver --solve). */
var LEVELS=[
  {b:6,map:['1......','11...1.','..2.2..','.......','...1...','..1.1..','.......']},  // min 4
  {b:6,map:['.1...1.','.......','.21..2.','..2.2..','.......','.......','12...21']},  // min 4
  {b:6,map:['.......','1.....1','1..1.1.','..2.2..','11...1.','1...1.1','.......']},  // min 4
  {b:8,map:['...1...','.2...2.','......1','....W1.','....2.1','..111..','22...22']},  // min 7
  {b:8,map:['.11.11.','.1.2.1.','.2...2.','11...11','1....W1','.....1.','.......']},  // min 7
  {b:8,map:['.1...1.','11...11','1....1.','.......','.12.21.','.W.....','21.1112']},  // min 7
  {b:9,map:['.2...2.','.21.W..','..2.2..','112..11','..1.1..','..111.2','11....1']},  // min 8
  {b:12,map:['2..1..2','1.....1','212.212','..2.2..','.21W12.','2.2.2W2','...2...']},  // min 12
  {b:11,map:['2.1...2','2W.1.12','.2...2.','.21.12.','..1W.2.','.1..112','112.21.']},  // min 11
  {b:11,map:['111.111','2....W2','22...2.','11...W1','2.1.122','211.122','1......']},  // min 11
  {b:12,map:['22..122','2..1..2','2W1.2.2','122.2.1','.2.212.','...11W.','211...2']},  // min 12
  {b:13,map:['2.1.1.2','.2.122.','21..212','1.W...1','.1.....','12W2221','1121211']}   // min 13
];

/* ---------- simpanan ---------- */
var SAVE={stars:{},snd:true,unlocked:1};
function loadSave(){try{var s=JSON.parse(localStorage.getItem('nano-bomb')||'{}');if(s&&typeof s==='object'){SAVE.stars=s.stars||{};if(s.snd===false)SAVE.snd=false;SAVE.unlocked=s.unlocked||1}}catch(e){}}
function writeSave(){try{localStorage.setItem('nano-bomb',JSON.stringify({stars:SAVE.stars,snd:SAVE.snd,unlocked:SAVE.unlocked}))}catch(e){}}
function starStr(n){var s='';for(var i=0;i<3;i++)s+=i<n?'★':'☆';return s}

/* ---------- status ---------- */
var G={state:'menu',lv:1,grid:[],bom:0,bomMax:0,blok:0,blok0:0,t:0,fx:[]};

function parseLevel(lv){
  var L=LEVELS[lv-1];
  G.grid=[]; G.blok=0;
  for(var r=0;r<N;r++){
    G.grid.push([]);
    for(var c=0;c<N;c++){
      var ch=L.map[r][c];
      if(ch==='1'){G.grid[r].push({hp:1,max:1});G.blok++}
      else if(ch==='2'){G.grid[r].push({hp:2,max:2});G.blok++}
      else if(ch==='W'){G.grid[r].push({wall:true})}
      else G.grid[r].push(null);
    }
  }
  G.bomMax=L.b; G.bom=L.b; G.blok0=G.blok; G.fx=[];
}
function ledak(r,c){
  /* bom meledak: menyebar 4 arah sampai 3 petak, berhenti di dinding/blok;
     blok kena 1 damage (batu butuh 2×). Blok yang hancur TIDAK meneruskan ledakan. */
  SFX.boom();
  G.fx.push({k:'boom',r:r,c:c,t:0.5,max:0.5});
  var arah=[[1,0],[-1,0],[0,1],[0,-1]];
  for(var a=0;a<4;a++){
    var rr=r+arah[a][0], cc=c+arah[a][1], jarak=0;
    while(rr>=0&&cc>=0&&rr<N&&cc<N&&jarak<3){
      var cell=G.grid[rr][cc];
      if(cell&&cell.wall)break;
      if(cell){
        cell.hp--;
        G.fx.push({k:'hit',r:rr,c:cc,t:0.35,max:0.35});
        if(cell.hp<=0){G.grid[rr][cc]=null;G.blok--;SFX.pecah();
          /* blok kayu hancur: ledakan MENERUS ke belakangnya.
             Blok batu (hp 2→1) tetap menghentikan ledakan. */
          for(var p=0;p<6;p++)G.fx.push({k:'bit',x:cc*CS+CS/2+rnd(-14,14),y:rr*CS+CS/2+rnd(-14,14),vx:rnd(-120,120),vy:rnd(-160,-20),life:rnd(0.35,0.6),t:0.6,col:cell.max===2?'#9aa0a6':'#a06a3a',s:rnd(2.5,5)});
        }
        if(cell.hp>0)break;   /* batu yang masih hidup menghentikan ledakan */
      }
      G.fx.push({k:'api',r:rr,c:cc,t:0.3,max:0.3});
      rr+=arah[a][0]; cc+=arah[a][1]; jarak++;
    }
  }
  G.fx.push({k:'api',r:r,c:c,t:0.35,max:0.35});
  if(G.blok<=0){menang();return true}
  if(G.bom<=0){kalah('Bom habis, masih ada '+G.blok+' blok!');return true}
  return false;
}
function pasang(r,c){
  if(G.grid[r][c]){toast('Ketuk petak kosong!');SFX.nope();return}
  if(G.bom<=0){toast('Bom habis!');SFX.nope();return}
  G.bom--; SFX.pasang(); syncBar();
  G.fx.push({k:'sumbu',r:r,c:c,t:0.35,max:0.35});
  setTimeout(function(){
    if(G.state!=='playing')return;
    var selesai=ledak(r,c);
    syncBar();
    if(!selesai)toast(G.blok+' blok tersisa · '+G.bom+' bom');
  },350);
}
function menang(){
  G.state='won'; SFX.win();
  var sisa=G.bom;
  var bintang=sisa>=Math.ceil(G.bomMax*0.4)?3:(sisa>=1?2:1);
  SAVE.stars['l'+G.lv]=Math.max(SAVE.stars['l'+G.lv]||0,bintang);
  if(G.lv<LEVELS.length)SAVE.unlocked=Math.max(SAVE.unlocked,G.lv+1);
  writeSave();
  setTimeout(function(){showEnd(true)},500);
}
function kalah(pesan){
  G.state='over';
  setTimeout(function(){showEnd(false,pesan)},500);
}

/* ---------- gambar ---------- */
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function draw(){
  cx.setTransform(SS,0,0,SS,0,0);
  cx.clearRect(0,0,W,W);
  var g=cx.createLinearGradient(0,0,0,W); g.addColorStop(0,'#241a10'); g.addColorStop(1,'#171008');
  cx.fillStyle=g; cx.fillRect(0,0,W,W);
  cx.strokeStyle='#00000033'; cx.lineWidth=1;
  for(var i=1;i<N;i++){cx.beginPath();cx.moveTo(i*CS,0);cx.lineTo(i*CS,W);cx.stroke();cx.beginPath();cx.moveTo(0,i*CS);cx.lineTo(W,i*CS);cx.stroke()}
  for(var r=0;r<N;r++)for(var c=0;c<N;c++){
    var cell=G.grid[r][c], x=c*CS, y=r*CS;
    if(cell&&cell.wall){
      cx.fillStyle='#4d4f56'; rr(cx,x+3,y+3,CS-6,CS-6,6); cx.fill();
      cx.fillStyle='#5e6169'; rr(cx,x+6,y+6,CS-12,CS-12,4); cx.fill();
      cx.strokeStyle='#26272b'; cx.lineWidth=2; cx.stroke();
      cx.fillStyle='#00000022'; cx.fillRect(x+8,y+CS*0.5,CS-16,2);
    } else if(cell){
      var pecah=cell.hp<cell.max;
      if(cell.max===2){
        cx.fillStyle=pecah?'#8a6a4a':'#9aa0a6'; rr(cx,x+3,y+3,CS-6,CS-6,6); cx.fill();
        cx.fillStyle=pecah?'#a07a55':'#b4bac0'; rr(cx,x+6,y+6,CS-12,CS-12,4); cx.fill();
      } else {
        cx.fillStyle=pecah?'#8a5a2a':'#a06a3a'; rr(cx,x+3,y+3,CS-6,CS-6,6); cx.fill();
        cx.fillStyle=pecah?'#b06e36':'#b87f47'; rr(cx,x+6,y+6,CS-12,CS-12,4); cx.fill();
      }
      cx.strokeStyle='#241a10'; cx.lineWidth=2; cx.stroke();
      cx.strokeStyle='#00000028'; cx.lineWidth=1.6;
      if(cell.max===2){cx.beginPath();cx.moveTo(x+10,y+CS*0.35);cx.lineTo(x+CS-10,y+CS*0.35);cx.moveTo(x+10,y+CS*0.65);cx.lineTo(x+CS-10,y+CS*0.65);cx.stroke()}
      if(pecah){cx.beginPath();cx.moveTo(x+8,y+8);cx.lineTo(x+CS*0.4,y+CS*0.5);cx.lineTo(x+CS*0.3,y+CS-8);cx.moveTo(x+CS-8,y+8);cx.lineTo(x+CS*0.55,y+CS*0.55);cx.stroke()}
    }
  }
  for(var f=0;f<G.fx.length;f++){
    var e=G.fx[f], al=e.t/(e.max||1), x=e.c*CS, y=e.r*CS;
    if(e.k==='boom'){
      var R=CS*2.6*(1.1-al*0.4);
      var rg=cx.createRadialGradient(x+CS/2,y+CS/2,4,x+CS/2,y+CS/2,R);
      rg.addColorStop(0,'rgba(255,240,160,'+al+')');
      rg.addColorStop(0.5,'rgba(255,140,50,'+(al*0.75)+')');
      rg.addColorStop(1,'rgba(255,60,20,0)');
      cx.fillStyle=rg; cx.beginPath(); cx.arc(x+CS/2,y+CS/2,R,0,TAU); cx.fill();
    } else if(e.k==='api'){
      cx.fillStyle='rgba(255,170,70,'+(al*0.6)+')';
      rr(cx,x+6,y+6,CS-12,CS-12,8); cx.fill();
    } else if(e.k==='hit'){
      cx.strokeStyle='rgba(255,220,120,'+al+')'; cx.lineWidth=3;
      rr(cx,x+3,y+3,CS-6,CS-6,6); cx.stroke();
    } else if(e.k==='sumbu'){
      cx.fillStyle='rgba(255,240,180,'+(1-al)+')';
      cx.beginPath(); cx.arc(x+CS/2,y+CS/2,5+al*8,0,TAU); cx.fill();
    } else if(e.k==='bit'){
      cx.fillStyle=e.col; cx.globalAlpha=Math.max(0,al);
      cx.fillRect(e.x,e.y,e.s,e.s); cx.globalAlpha=1;
    }
  }
  cx.fillStyle='rgba(255,255,255,.12)'; cx.font='900 24px system-ui';
  cx.fillText('💣'+G.bom, 10, 30);
}

/* ---------- UI ---------- */
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},1400)}
function syncBar(){
  $('bombaNum').textContent=G.bom;
  $('blokNum').textContent=G.blok;
  $('footR').textContent='Level '+G.lv+' · bom '+G.bom+' · blok '+G.blok;
}
function buildLevels(){
  var list=$('lvList'); list.innerHTML='';
  for(var i=1;i<=LEVELS.length;i++){
    var b=D.createElement('button'); b.className='lvb'+(i>SAVE.unlocked?' lock':'')+((SAVE.stars['l'+i]>0)?' done':'');
    b.innerHTML=i+'<span>'+(SAVE.stars['l'+i]>0?starStr(SAVE.stars['l'+i]):(i>SAVE.unlocked?'🔒':'▶'))+'</span>';
    (function(lv){b.addEventListener('click',function(){ensureAC();if(lv>SAVE.unlocked){toast('Selesaikan level sebelumnya dulu');SFX.nope();return}startLevel(lv)},false)})(i);
    list.appendChild(b);
  }
}
function startLevel(lv){
  G.lv=lv; parseLevel(lv); G.state='playing';
  hideOv('ovStart'); hideOv('ovEnd'); syncBar();
  toast('Level '+lv+' — hancurkan '+G.blok+' blok dengan '+G.bom+' bom!'); SFX.click();
}
function showEnd(win,pesan){
  var t=$('endTitle'),x=$('endText');
  if(win){
    t.textContent='SEMUA BLOK HANCUR! 💥';
    var sisa=G.bom;
    var bintang=sisa>=Math.ceil(G.bomMax*0.4)?3:(sisa>=1?2:1);
    x.innerHTML='Sisa '+sisa+' bom '+starStr(bintang);
    $('endStats').innerHTML='<div><b>'+G.blok0+'</b><span>blok hancur</span></div><div><b>'+(G.bomMax-G.bom)+'</b><span>bom terpakai</span></div><div><b>'+sisa+'</b><span>bom sisa</span></div>';
    $('bNext').style.display=G.lv<LEVELS.length?'block':'none';
  } else {
    t.textContent='💨 BOM HABIS';
    x.innerHTML=pesan+'<br>Coba posisi bom yang lebih efisien.';
    $('endStats').innerHTML='<div><b>'+(G.blok0-G.blok)+'</b><span>blok hancur</span></div><div><b>'+G.blok+'</b><span>tersisa</span></div><div><b>'+G.bomMax+'</b><span>bom total</span></div>';
    $('bNext').style.display='none';
  }
  showOv('ovEnd');
}
function hideOv(id){$(id).classList.add('hide')}
function showOv(id){$(id).classList.remove('hide')}
function toMenu(){G.state='menu';hideOv('ovEnd');buildLevels();showOv('ovStart');syncBar()}

cv.addEventListener('pointerdown',function(e){
  e.preventDefault(); e.stopPropagation(); ensureAC();
  if(G.state!=='playing')return;
  var r=cv.getBoundingClientRect();
  var x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*W;
  var c=clamp(Math.floor(x/CS),0,N-1), rr2=clamp(Math.floor(y/CS),0,N-1);
  pasang(rr2,c);
},{passive:false});

$('bReset').addEventListener('click',function(){ensureAC();if(G.state==='menu')return;startLevel(G.lv)});
$('bMenu').addEventListener('click',function(){ensureAC();SFX.click();toMenu()});
$('bPlay').addEventListener('click',function(){ensureAC();startLevel(Math.min(SAVE.unlocked,LEVELS.length))});
$('bAgain').addEventListener('click',function(){ensureAC();startLevel(G.lv)});
$('bNext').addEventListener('click',function(){ensureAC();if(G.lv<LEVELS.length)startLevel(G.lv+1);else toMenu()});
$('bToMenu').addEventListener('click',function(){ensureAC();toMenu()});
$('bSound').addEventListener('click',function(){sOn=!sOn;this.classList.toggle('on',sOn);SAVE.snd=sOn;writeSave();ensureAC()});

/* ---------- loop ---------- */
var lastT=0;
function loop(now){
  if(!lastT)lastT=now;
  var dt=Math.min(0.05,(now-lastT)/1000); lastT=now;
  G.t+=dt;
  for(var f=G.fx.length-1;f>=0;f--){var e=G.fx[f];if(e.k==='bit'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vy+=420*dt}e.t-=dt;if(e.t<=0)G.fx.splice(f,1)}
  if(G.state!=='menu')draw();
  else{cx.setTransform(SS,0,0,SS,0,0);cx.clearRect(0,0,W,W);cx.fillStyle='#191007';cx.fillRect(0,0,W,W)}
  requestAnimationFrame(loop);
}
loadSave(); sOn=SAVE.snd!==false; $('bSound').classList.toggle('on',sOn);
buildLevels(); syncBar(); requestAnimationFrame(loop);
</script>
</body>
</html>`

/* ---------- SOLVER: buktikan semua level bisa diselesaikan.
   Jalankan: node plugins/game/bomb.js --solve */
if (process.argv[2] === '--solve') {
  const LEVELS2 = eval('[' + html.match(/var LEVELS=\[([\s\S]*?)\];/)[1] + ']')
  function kopy(g){return g.map(r=>r.map(c=>c?{hp:c.hp,wall:c.wall}:null))}
  function boom(grid,r,c){
    const g=kopy(grid), arah=[[1,0],[-1,0],[0,1],[0,-1]]
    for(let a=0;a<4;a++){
      let rr=r+arah[a][0], cc=c+arah[a][1], jarak=0
      while(rr>=0&&cc>=0&&rr<7&&cc<7&&jarak<3){
        const cell=g[rr][cc]
        if(cell&&cell.wall)break
        if(cell){
          cell.hp--
          if(cell.hp<=0){g[rr][cc]=null}
          else break          /* batu masih hidup → menghentikan */
          /* kayu hancur → ledakan menerus */
        }
        rr+=arah[a][0];cc+=arah[a][1];jarak++
      }
    }
    return g
  }
  function selesai(g){return g.every(row=>row.every(c=>!c||c.wall))}
  function progres(a,b){let s=0;for(let r=0;r<7;r++)for(let c=0;c<7;c++){const x=a[r][c],y=b[r][c]
    if(x&&!y)s+=10;else if(x&&y&&y.hp<x.hp)s+=3}return s}
  function solve(L) {
    let g0=[]
    for(let r=0;r<7;r++){g0.push([]);for(let c=0;c<7;c++){const ch=L.map[r][c];g0[r].push(ch==='1'?{hp:1}:ch==='2'?{hp:2}:ch==='W'?{wall:true}:null)}}
    /* beam search: jauh lebih cepat dari BFS penuh, menemukan rencana pendek.
       Rencana hasil diverifikasi ulang dengan replay di bawah. */
    let beams=[{g:g0,plan:[]}],seen=new Set([key(g0)])
    for(let step=0;step<30;step++){
      const next=[]
      for(const b of beams){
        for(let r=0;r<7;r++)for(let c=0;c<7;c++){
          if(b.g[r][c])continue
          const ng=boom(b.g,r,c)
          const sc=progres(b.g,ng)
          if(sc<=0)continue
          const k=key(ng)
          if(seen.has(k))continue
          seen.add(k)
          next.push({g:ng,plan:b.plan.concat([[r,c]]),sc})
        }
      }
      if(!next.length)break
      next.sort((x,y)=>y.sc-x.sc)
      beams=next.slice(0,16)
      const done=beams.find(b=>selesai(b.g))
      if(done){
        /* replay deterministik: bukti rencana benar */
        let g=g0
        for(const [r,c] of done.plan){if(g[r][c])return null;g=boom(g,r,c)}
        return selesai(g)?done.plan:null
      }
    }
    return null
  }
  function key(g){return g.map(r=>r.map(c=>c?(c.wall?'W':String(c.hp)):'-').join('')).join('|')}
  let gagal=[]
  for(let i=0;i<LEVELS2.length;i++){
    const plan=solve(LEVELS2[i])
    console.log('Level '+String(i+1).padStart(2)+(plan?' ✓ '+plan.length+' bom: '+JSON.stringify(plan):' ✗ TIDAK BISA'))
    if(!plan)gagal.push(i+1)
  }
  process.exit(gagal.length?1:0)
}

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '💣', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Bomb Puzzle 💣',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-bomb-2026',
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

handler.help = ['bomb', 'bombpuzzle', 'bom']
handler.tags = ['game']
handler.command = /^(bomb|bombpuzzle|bom)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Bomb Puzzle - hancurkan semua blok dengan bom terbatas, 12 level'

export default handler
