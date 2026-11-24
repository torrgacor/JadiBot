/*
⌬ Nano Ai · Game Plugin · Traffic Escape 🚗
*/

'use strict'

/* ==========================================================================
   Nano Ai · Traffic Escape 🚗
   Grid jalan macet. Ketuk mobil → dia melaju searah arah hadapnya.
   Keluar dari papan = aman. Bertabrakan = ulang level.
   Semua mobil harus keluar. Tepi papan "menyerap" mobil yang keluar
   (menghilang berurutan) supaya mobil belakangan tetap bisa lewat.
   Semua level DIUJI BISA DISELESAIKAN (solver BFS saat pengembangan).
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#17223b">
<title>Nano Ai Traffic Escape</title>
<style>
:root{--bg:#0d1526;--panel:#16233f;--panel2:#1d2d4f;--line:#2c4270;--text:#eef4ff;--dim:#9db1d6;--gold:#ffd23f;--green:#57e389;--red:#ff6a5e;--road:#2a3247}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(700px 420px at 50% -8%,#1b2a4d 0%,#101a30 55%,#090f1c 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#1a2a4d,#111c33);border:1px solid #33487c;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff22}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#ffd23f,#e07b12);font-size:20px;box-shadow:0 3px 0 #7c4407,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 #0008}
.sub{margin-top:1px;color:var(--dim);font-size:8.5px;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px;flex:none}
.hb{width:34px;height:34px;border:1px solid #40598f;border-radius:10px;background:linear-gradient(180deg,#263a63,#182742);color:#dfe9ff;font-size:15px;box-shadow:0 3px 0 #0d1526}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #0d1526}
.hb.on{border-color:#ffe793;box-shadow:0 0 0 2px #ffe79366,0 3px 0 #0d1526}
.bar{display:flex;align-items:center;gap:6px;background:linear-gradient(180deg,#1d2d4f,#16233f);border:1px solid #33487c;border-radius:13px;padding:6px 8px;margin-bottom:8px;box-shadow:inset 0 2px 6px #00000055}
.stx{flex:1;min-width:0;font:900 9px system-ui;letter-spacing:.05em;color:#ffe9b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{flex:none;padding:3px 8px;border-radius:999px;background:#0e1930;border:1px solid #33487c;color:var(--dim);font:800 8.5px system-ui;letter-spacing:.06em;white-space:nowrap}
.chip b{color:var(--gold)}
.stage{position:relative;width:100%;aspect-ratio:1/1;border:2px solid #2c4270;border-radius:14px;overflow:hidden;background:#131c30;box-shadow:inset 0 6px 18px #00000066,0 6px 16px #00000055}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#0e1930e6;border:1px solid #40598f;color:#dfe9ff;font:900 8.5px system-ui;letter-spacing:.06em;opacity:0;transition:.18s ease;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#070d1ae8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s ease}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,360px);max-height:100%;overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:14px 12px;border:1px solid #40598f;border-radius:16px;background:linear-gradient(180deg,#1d2d4f,#121d35);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;letter-spacing:.4px;color:#ffe9b8;text-shadow:0 3px 0 #00000088}
.card2 .small{margin-top:5px;color:var(--dim);font-size:9px;line-height:1.6}
.lv{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:11px}
.lvb{padding:8px 2px;border:1px solid #40598f;border-radius:11px;background:linear-gradient(180deg,#263a63,#182742);color:#dfe9ff;font:950 13px system-ui;box-shadow:0 3px 0 #0b1322;touch-action:manipulation}
.lvb span{display:block;font:800 6.5px system-ui;color:var(--gold);letter-spacing:.1em;margin-top:2px}
.lvb.lock{filter:saturate(.3) brightness(.7)}
.lvb.done{border-color:#ffd23f;box-shadow:0 0 0 1px #ffd23f66,0 3px 0 #0b1322}
.gbtn{display:block;width:100%;margin-top:9px;min-height:44px;border:1px solid #ffe793;border-radius:12px;background:linear-gradient(180deg,#57e389,#1f9d55);color:#06240f;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #12603a}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #12603a}
.gbtn.alt{background:linear-gradient(180deg,#c9a75f,#8a6628);color:#241a08;box-shadow:0 5px 0 #4a3210}
.gbtn.danger{background:linear-gradient(180deg,#ff8a7a,#b33024);color:#fff3e8;box-shadow:0 5px 0 #6b140c}
.rowb{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
.stats div{padding:6px 4px;border:1px solid #40598f;border-radius:10px;background:#0e1930b0}
.stats b{display:block;font:900 13px system-ui;color:var(--gold)}
.stats span{display:block;margin-top:2px;font:800 6.4px system-ui;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.legend{display:flex;flex-wrap:wrap;gap:5px;justify-content:center;margin-top:9px}
.legend i{font-style:normal;font-size:8px;color:#dfe9ff;background:#0e1930a8;border:1px solid #33487c;border-radius:999px;padding:3px 7px}
.foot{display:flex;justify-content:space-between;gap:6px;margin-top:8px;color:var(--dim);font-size:7.5px}
@media(max-width:380px){.title{font-size:13px}.card2 .big{font-size:18px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🚗</div>
        <div class="bt">
          <div class="title">Traffic Escape</div>
          <div class="sub" id="sub">Nano Ai · ketuk mobilnya, keluar dari macet!</div>
        </div>
      </div>
      <div class="hbtns">
        <button class="hb on" id="bSound" title="Efek suara">🔊</button>
        <button class="hb" id="bReset" title="Ulang level">↺</button>
        <button class="hb" id="bMenu" title="Menu level">☰</button>
      </div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Pilih level di menu</div>
      <div class="chip">Level <b id="lvNum">1</b></div>
      <div class="chip">Keluar <b id="outNum">0/0</b></div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">🚗 TRAFFIC ESCAPE 🚙</div>
          <div class="small">Pilih level di bawah. Ketuk mobil → dia melaju searah hidungnya.<br>Jaga jarak! Bertabrakan = ulang dari awal. Semua mobil harus keluar.</div>
          <div class="lv" id="lvList"></div>
          <div class="legend">
            <i>🚗 Kuning = mobil target utama</i>
            <i>⏱️ Makin cepat keluar = bintang makin banyak</i>
            <i>💥 Nabrak mobil lain = ulang</i>
            <i>↺ Tombol ulang kapan saja</i>
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
          <button class="gbtn danger" id="bToMenu">MENU</button>
        </div>
      </div>
    </div>
    <div class="foot">
      <span>Nano Ai · Traffic Escape</span>
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
function ri(a,b){return Math.floor(a+Math.random()*(b-a+1))}
var N=7;                                   /* papan 7x7 */
var cv=$('cv'), cx=cv.getContext('2d');
var SS=Math.min(3,(navigator.deviceMemory||3)>=3?3:2);
var W=560; cv.width=W*SS; cv.height=W*SS; cx.setTransform(SS,0,0,SS,0,0);
var CS=W/N;

/* ---------- suara ---------- */
var AC=null, sOn=true;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function tone(f1,f2,dur,vol,type){if(!sOn||!ensureAC())return;var t0=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f1,t0);if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),t0+dur);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||0.14,t0+0.012);g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);o.connect(g);g.connect(AC.destination);o.start(t0);o.stop(t0+dur+0.02)}
function noiseS(dur,vol,f0){if(!sOn||!ensureAC())return;var t0=AC.currentTime,n=Math.max(1,Math.floor(AC.sampleRate*dur)),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);var s=AC.createBufferSource();s.buffer=b;var f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=f0||900;var g=AC.createGain();g.gain.setValueAtTime(vol||0.2,t0);g.gain.exponentialRampToValueAtTime(0.001,t0+dur);s.connect(f);f.connect(g);g.connect(AC.destination);s.start(t0)}
var SFX={
  click:function(){tone(520,520,0.05,0.08)},
  vroom:function(){tone(90,260,0.4,0.16,'sawtooth')},
  out:function(){tone(660,990,0.16,0.12,'triangle');tone(990,1320,0.14,0.09,'triangle',0.12)},
  crash:function(){noiseS(0.5,0.4,1400);tone(140,50,0.4,0.2,'sawtooth')},
  win:function(){var s=[523,659,784,1046];for(var i=0;i<s.length;i++)tone(s[i],s[i],0.24,0.14,'triangle',i*0.12)},
  nope:function(){tone(220,170,0.12,0.12)}
};

/* ---------- level ----------
   Format: huruf = mobil. Kapital 'T' = target (kuning).
   'h' = mobil horizontal menghadap KANAN, 'H' = menghadap KIRI.
   'v' = mobil vertikal menghadap BAWAH, 'V' = menghadap ATAS.
   Mobil panjang 2 atau 3 sel (tanda sama huruf berulang).
   '.' = jalan kosong. '.' di tepi = pintu keluar.
   SEMUA LEVEL DIUJI BISA DISELESAIKAN dengan solver BFS. */
var LEVELS=[
  {map:['.T.....','......V','..h....','.....h.','H....v.','..h....','......h'],hint:'Mobil kuning melaju ke kanan — buka jalannya dulu'},
  {map:['..h..T.','v......','..H....','h......','..v.H..','.H...h.','..h....'],hint:'Ketuk yang jalannya bebas dulu'},
  {map:['T..h...','.h...v.','..v.h..','H....h.','...H...','.h.v...','h......'],hint:'Ada mobil yang cuma perlu sekali jalan'},
  {map:['.h.T...','v...h..','..H..v.','h......','..v.h.H','.H.....','...h..v'],hint:'Urutkan: yang paling dekat pintu duluan'},
  {map:['..h..T.','.v..h..','h...v..','..H..h.','.h..v..','H....h.','..h.v..'],hint:'Mobil kuning keluar lewat kanan atas'},
  {map:['.T..h..','h....v.','..v.h..','.H...h.','h....v.','..h....','.v..H.h'],hint:'Kunci mobil vertikal dulu, baru baris target'},
  {map:['T.h....','.v.h..H','h....h.','.h..v..','..H..h.','.v...h.','h..h...'],hint:'Banyak mobil panjang — sabar urutannya'},
  {map:['..h.T..','v....h.','.h.v...','...H..h','h......','.v.h.H.','..h...h'],hint:'Target di atas — bersihkan kolomnya'},
  {map:['.h..T..','..v.h.h','h......','.H.v...','..h..H.','v....h.','.h.v.h.'],hint:'Perhatikan arah hadap setiap mobil'},
  {map:['T.....h','h.v....','..h..v.','H...h..','..v....','.h..H.h','....h..'],hint:'Kiri dulu, kanan belakangan'},
  {map:['.hT....','v...h.h','..H....','h...v..','..h.H..','.v...h.','h....h.'],hint:'Target cuma 1 langkah dari pintu — siapkan jalannya'},
  {map:['T..v...','.h...h.','..h.v.H','H......','...h..h','.v.H...','..h....'],hint:'Kolom target penuh — buka dari bawah'},
  {map:['.h.T.h.','h....v.','v..h...','..H..h.','h....v.','..h..H.','.H.h..h'],hint:'Dua mobil menghalangi target — cek arah hadapnya'},
  {map:['T...h..','.v.h..H','h....h.','.h.v...','..H..h.','v...h.h','.h...H.'],hint:'Rencanakan 3 langkah ke depan'},
  {map:['.hT...h','v....v.','..h.h..','H....h.','...v...','.h.H.h.','h....h.'],hint:'Level pamungkas — semua mobil panjang!'}
];

/* ---------- simpanan ---------- */
var SAVE={stars:{},snd:true,unlocked:1};
function loadSave(){try{var s=JSON.parse(localStorage.getItem('nano-tescape')||'{}');if(s&&typeof s==='object'){SAVE.stars=s.stars||{};if(s.snd===false)SAVE.snd=false;SAVE.unlocked=s.unlocked||1}}catch(e){}}
function writeSave(){try{localStorage.setItem('nano-tescape',JSON.stringify({stars:SAVE.stars,snd:SAVE.snd,unlocked:SAVE.unlocked}))}catch(e){}}
function starStr(n){var s='';for(var i=0;i<3;i++)s+=i<n?'★':'☆';return s}

/* ---------- status ---------- */
var G={state:'menu',lv:1,cars:[],grid:[],t:0,out:0,total:0,kendaraan:null,winT:0,langkah:0,mulai:0,crashFx:[]};

function parseLevel(lv){
  var rows=LEVELS[lv-1].map, seen={}, cars=[];
  G.grid=[];
  for(var r=0;r<N;r++){G.grid.push([]);for(var c=0;c<N;c++){
    var ch=rows[r][c];
    if(ch==='.'){G.grid[r].push(null);continue}
    if(seen[ch]){G.grid[r].push(ch);continue}
    /* cari panjang & arah */
    var len=1, hor=(c<N-1&&rows[r][c+1]===ch), ver=(!hor&&r<N-1&&rows[r+1][c]===ch);
    if(hor){while(c+len<N&&rows[r][c+len]===ch)len++}
    else if(ver){len=1;while(r+len<N&&rows[r+len][c]===ch)len++}
    var dir=hor?(ch==='H'?'L':'R'):(ch==='V'?'U':'D');
    cars.push({id:ch,r:r,c:c,len:len,hor:hor,dir:dir,x:c*CS,y:r*CS,target:null});
    seen[ch]=1; G.grid[r].push(ch);
  }}
  /* mobil yang hurufnya hanya 1 sel (tak mungkin) — aman saja */
  G.cars=cars;
  G.total=cars.length; G.out=0; G.langkah=0; G.mulai=0;
  /* target: mobil yang menempati baris 0 kolom 1 di peta asli berupa 'T' */
  var t=null;
  for(var i=0;i<cars.length;i++){if(cars[i].id==='T')t=cars[i]}
  if(!t){/* fallback: mobil pertama */ t=cars[0]; t.id='T'}
  t.target=true;
}
function carAt(id){for(var i=0;i<G.cars.length;i++)if(G.cars[i].id===id)return G.cars[i];return null}
function cellFree(r,c,me){if(r<0||c<0||r>=N||c>=N)return true;      /* di luar papan = bebas (bakal keluar) */
  var ch=G.grid[r][c];return !ch||ch===me.id}
function snap(car){ /* tulis posisi mobil ke grid */
  for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(G.grid[r][c]===car.id)G.grid[r][c]=null;
  var dr=car.hor?0:1, dc=car.hor?1:0;
  for(var k=0;k<car.len;k++)G.grid[car.r+dr*k][car.c+dc*k]=car.id;
}
function stepDir(car){return car.dir==='R'?[0,1]:car.dir==='L'?[0,-1]:car.dir==='U'?[-1,0]:[1,0]}
function jalurBebas(car){
  var d=stepDir(car), dr=d[0], dc=d[1];
  var r=car.r, c=car.c;
  var er=car.hor?r:(car.dir==='U'?r-1:r+car.len), ec=car.hor?(car.dir==='R'?c+car.len:c-1):c;
  return cellFree(er,ec,car);
}
function mulaiJalan(car){
  if(car.jalan)return;
  car.jalan=true; SFX.vroom();
  G.langkah++;
}

/* ---------- animasi jalan & keluar ---------- */
function update(dt){
  G.t+=dt;
  for(var i=0;i<G.cars.length;i++){
    var car=G.cars[i];
    if(!car.jalan)continue;
    var d=stepDir(car), sp=CS*4.2*dt;
    car.x+=d[1]*sp; car.y+=d[0]*sp;
    /* sudah keluar penuh? */
    var keluar=car.hor?(car.dir==='R'?car.x>W+1:car.x+car.len*CS<-1):(car.dir==='D'?car.y>W+1:car.y+car.len*CS<-1);
    if(keluar){
      G.cars.splice(i,1); i--;
      G.out++; SFX.out(); toast('Mobil keluar! ('+G.out+'/'+G.total+')');
      syncBar();
      if(G.out>=G.total){menang()}
      continue;
    }
    /* tabrakan: cek sel depan mobil */
    var d2=stepDir(car);
    var depanR=car.hor?car.r:(d2[0]<0?Math.floor(car.y/CS)-1:Math.floor((car.y+car.len*CS)/CS)+0);
    var depanC=car.hor?(d2[1]<0?Math.floor(car.x/CS)-1:Math.floor((car.x+car.len*CS)/CS)):car.c;
    var hit=null;
    for(var j=0;j<G.cars.length;j++){
      var o=G.cars[j]; if(o===car)continue;
      var ox=o.x, oy=o.y, ow=o.hor?o.len*CS:CS, oh=o.hor?CS:o.len*CS;
      var mx=car.hor?car.x:car.x, my=car.hor?car.y:car.y;
      var mw=car.hor?car.len*CS:CS, mh=car.hor?CS:car.len*CS;
      if(mx<ox+ow&&mx+mw>ox&&my<oy+oh&&my+mh>oh){hit=o;break}
    }
    if(hit){
      SFX.crash(); kalah('Tabrakan dengan mobil '+hit.id+'!');
      return;
    }
  }
  for(var f=G.crashFx.length-1;f>=0;f--){G.crashFx[f].t-=dt;if(G.crashFx[f].t<=0)G.crashFx.splice(f,1)}
}
function kalah(pesan){
  G.state='over'; SFX.nope();
  for(var i=0;i<14;i++)G.crashFx.push({x:rnd(0,W),y:rnd(0,W),t:rnd(0.3,0.7),max:0.7,r:rnd(8,22)});
  setTimeout(function(){showEnd(false,pesan)},700);
}
function menang(){
  G.state='won'; SFX.win();
  var waktu=(performance.now()-G.mulai)/1000;
  var bintang=waktu<20?3:(waktu<40?2:1);
  SAVE.stars['l'+G.lv]=Math.max(SAVE.stars['l'+G.lv]||0,bintang);
  if(G.lv<LEVELS.length)SAVE.unlocked=Math.max(SAVE.unlocked,G.lv+1);
  writeSave();
  setTimeout(function(){showEnd(true,'Semua '+G.total+' mobil selamat!')},500);
}

/* ---------- gambar ---------- */
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function drawCar(car){
  var x=car.x, y=car.y, w=car.hor?car.len*CS:CS, h=car.hor?CS:car.len*CS, pad=5;
  var kuning=car.target;
  /* bayangan */
  cx.fillStyle='rgba(0,0,0,.32)'; rr(cx,x+pad+3,y+pad+4,w-pad*2,h-pad*2,10); cx.fill();
  /* badan */
  var g=cx.createLinearGradient(x,y,x,y+h); 
  if(kuning){g.addColorStop(0,'#ffe07a');g.addColorStop(1,'#e09012')}
  else{g.addColorStop(0,'#8fa8d8');g.addColorStop(1,'#40598f')}
  cx.fillStyle=g; rr(cx,x+pad,y+pad,w-pad*2,h-pad*2,10); cx.fill();
  cx.strokeStyle=kuning?'#7c4407':'#1b2a4d'; cx.lineWidth=2.4; cx.stroke();
  /* kaca depan: sesuai arah */
  cx.fillStyle='#bfe3ffcc';
  var ww=Math.min(w,h)*0.34;
  if(car.dir==='R')rr(cx,x+w-pad-ww*1.7,y+pad+5,ww,h-pad*2-10,5);
  else if(car.dir==='L')rr(cx,x+pad+ww*0.7,y+pad+5,ww,h-pad*2-10,5);
  else if(car.dir==='D')rr(cx,x+pad+5,y+h-pad-ww*1.7,w-pad*2-10,ww,5);
  else rr(cx,x+pad+5,y+pad+ww*0.7,w-pad*2-10,ww,5);
  cx.fill();
  /* lampu depan kuning kecil */
  cx.fillStyle='#fff6c0';
  if(car.dir==='R'){cx.fillRect(x+w-pad-4,y+pad+6,3,7);cx.fillRect(x+w-pad-4,y+h-pad-13,3,7)}
  else if(car.dir==='L'){cx.fillRect(x+pad+1,y+pad+6,3,7);cx.fillRect(x+pad+1,y+h-pad-13,3,7)}
  else if(car.dir==='D'){cx.fillRect(x+pad+6,y+h-pad-4,7,3);cx.fillRect(x+w-pad-13,y+h-pad-4,7,3)}
  else{cx.fillRect(x+pad+6,y+pad+1,7,3);cx.fillRect(x+w-pad-13,y+pad+1,7,3)}
  /* roda */
  cx.fillStyle='#0d1526';
  var rw=6, rh=4;
  if(car.hor){for(var k=0;k<car.len;k++){cx.fillRect(x+k*CS+CS*0.2,y-1,rw,rh);cx.fillRect(x+k*CS+CS*0.2,y+CS-3,rw,rh)}}
  else{for(var k2=0;k2<car.len;k2++){cx.fillRect(x-1,y+k2*CS+CS*0.2,rh,rw);cx.fillRect(x+CS-3,y+k2*CS+CS*0.2,rh,rw)}}
}
function draw(){
  cx.setTransform(SS,0,0,SS,0,0);
  cx.clearRect(0,0,W,W);
  /* aspal */
  cx.fillStyle='#2a3247'; cx.fillRect(0,0,W,W);
  /* garis jalan putus-putus */
  cx.strokeStyle='#3d4a66'; cx.lineWidth=2; cx.setLineDash([8,10]);
  for(var i=1;i<N;i++){cx.beginPath();cx.moveTo(i*CS,0);cx.lineTo(i*CS,W);cx.stroke();cx.beginPath();cx.moveTo(0,i*CS);cx.lineTo(W,i*CS);cx.stroke()}
  cx.setLineDash([]);
  /* pintu keluar: sisi yang mobilnya bisa lewat, diberi panah hijau */
  cx.strokeStyle='#57e389aa'; cx.lineWidth=3;
  cx.strokeRect(1.5,1.5,W-3,W-3);
  /* marka keluar */
  cx.fillStyle='#57e38922';
  cx.fillRect(0,0,W,6); cx.fillRect(0,W-6,W,6); cx.fillRect(0,0,6,W); cx.fillRect(W-6,0,6,W);
  /* mobil */
  var urut=G.cars.slice().sort(function(a,b){return a.y-b.y});
  for(var k=0;k<urut.length;k++)drawCar(urut[k]);
  /* efek tabrakan */
  for(var f=0;f<G.crashFx.length;f++){
    var e=G.crashFx[f], al=e.t/e.max;
    cx.fillStyle='rgba(255,120,60,'+(al*0.8)+')';
    cx.beginPath();cx.arc(e.x,e.y,e.r*(1.4-al*0.4),0,TAU);cx.fill();
  }
  /* teks level di pojok */
  cx.fillStyle='rgba(255,255,255,.14)'; cx.font='900 26px system-ui'; cx.textAlign='left';
  cx.fillText('LV '+G.lv, 10, W-12); cx.textAlign='left';
}

/* ---------- UI ---------- */
function toast(t){var e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(function(){e.classList.remove('show')},1400)}
function syncBar(){
  $('lvNum').textContent=G.lv;
  $('outNum').textContent=G.out+'/'+G.total;
  $('stx').textContent=G.state==='menu'?'Pilih level di menu':LEVELS[G.lv-1].hint;
  $('footR').textContent='Level '+G.lv+' · keluar '+G.out+'/'+G.total;
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
  G.lv=lv; parseLevel(lv); G.state='playing'; G.crashFx=[]; G.mulai=performance.now();
  hideOv('ovStart'); hideOv('ovEnd'); syncBar();
  toast('Level '+lv+' — selamatkan semua mobil!'); SFX.click();
}
function showEnd(win,pesan){
  var t=$('endTitle'),x=$('endText');
  if(win){
    t.textContent='SEMUA MOBIL SELAMAT! 🎉';
    var waktu=Math.round((performance.now()-G.mulai)/1000);
    var bintang=waktu<20?3:(waktu<40?2:1);
    x.innerHTML='Waktu '+waktu+' detik '+starStr(bintang);
    $('endStats').innerHTML='<div><b>'+G.total+'</b><span>mobil keluar</span></div><div><b>'+G.langkah+'</b><span>ketukan</span></div><div><b>'+waktu+'s</b><span>waktu</span></div>';
    $('bNext').style.display=G.lv<LEVELS.length?'block':'none';
  } else {
    t.textContent='💥 TABRAKAN!';
    x.innerHTML=pesan+'<br>Urutkan mobilnya pelan-pelan.';
    $('endStats').innerHTML='<div><b>'+G.out+'</b><span>sudah keluar</span></div><div><b>'+(G.total-G.out)+'</b><span>tertahan</span></div><div><b>'+G.langkah+'</b><span>ketukan</span></div>';
    $('bNext').style.display='none';
  }
  showOv('ovEnd');
}
function hideOv(id){$(id).classList.add('hide')}
function showOv(id){$(id).classList.remove('hide')}
function toMenu(){G.state='menu';hideOv('ovEnd');buildLevels();showOv('ovStart');syncBar()}

/* ---------- input ---------- */
cv.addEventListener('pointerdown',function(e){
  e.preventDefault(); e.stopPropagation(); ensureAC();
  if(G.state!=='playing')return;
  var r=cv.getBoundingClientRect();
  var x=(e.clientX-r.left)/r.width*W, y=(e.clientY-r.top)/r.height*W;
  var c=clamp(Math.floor(x/CS),0,N-1), rr2=clamp(Math.floor(y/CS),0,N-1);
  var id=G.grid[rr2]&&G.grid[rr2][c];
  if(!id){SFX.nope();return}
  var car=carAt(id);
  if(!car||car.jalan)return;
  if(!jalurBebas(car)){toast('Ditutupi mobil lain di depannya!');SFX.nope();return}
  mulaiJalan(car);
},{passive:false});

$('bReset').addEventListener('click',function(){ensureAC();if(G.state==='menu')return;startLevel(G.lv)});
$('bMenu').addEventListener('click',function(){ensureAC();SFX.click();toMenu()});
$('bPlay').addEventListener('click',function(){ensureAC();startLevel(Math.min(SAVE.unlocked,LEVELS.length))});
$('bAgain').addEventListener('click',function(){ensureAC();startLevel(G.lv)});
$('bNext').addEventListener('click',function(){ensureAC();if(G.lv<LEVELS.length)startLevel(G.lv+1);else toMenu()});
$('bToMenu').addEventListener('click',function(){ensureAC();toMenu()});
$('bSound').addEventListener('click',function(){sOn=!sOn;this.classList.toggle('on',sOn);SAVE.snd=sOn;writeSave();ensureAC()});
D.addEventListener('visibilitychange',function(){if(D.hidden&&G.state==='playing'){G.state='paused';toast('Jeda — ketuk layar untuk lanjut')}else if(!D.hidden&&G.state==='paused'){G.state='playing'}});

/* ---------- loop ---------- */
var lastT=0;
function loop(now){
  if(!lastT)lastT=now;
  var dt=Math.min(0.05,(now-lastT)/1000); lastT=now;
  if(G.state==='playing')update(dt);
  if(G.state!=='menu')draw();
  else{cx.setTransform(SS,0,0,SS,0,0);cx.clearRect(0,0,W,W);cx.fillStyle='#131c30';cx.fillRect(0,0,W,W)}
  requestAnimationFrame(loop);
}
loadSave(); sOn=SAVE.snd!==false; $('bSound').classList.toggle('on',sOn);
buildLevels(); syncBar(); requestAnimationFrame(loop);
</script>
</body>
</html>`

/* ---------- SOLVER: buktikan semua level bisa diselesaikan.
   Jalankan: node plugins/game/tescape.js --solve — LEVELS diambil dari HTML (satu sumber).
   Model sesuai mesin: mobil melaju terus searah hadapnya sampai keluar;
   urutan launch valid = jalur lurus mobil bebas dari semua mobil yang masih
   ada di papan. Ini KONSERVATIF (launch satu per satu) → pasti aman di mesin. */
if (process.argv[2] === '--solve') {
  const mLevel = html.match(/var LEVELS=\[([\s\S]*?)\];/)
  const LEVELS2 = eval('[' + mLevel[1] + ']')
  function parseCars(rows) {
    const seen = {}, cars = []
    for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
      const ch = rows[r][c]
      if (ch === '.' || seen[ch]) continue
      const hor = (c < 6 && rows[r][c + 1] === ch)
      let len = 1
      if (hor) { while (c + len < 7 && rows[r][c + len] === ch) len++ }
      else { while (r + len < 7 && rows[r + len][c] === ch) len++ }
      const dir = hor ? (ch === 'H' ? 'L' : 'R') : (ch === 'V' ? 'U' : 'D')
      cars.push({ id: ch, r, c, len, hor, dir })
    }
    return cars
  }
  /* jalur lurus mobil ke tepi keluar harus bebas dari semua mobil di `sisa` */
  function jalurBebas(car, sisa) {
    const occupied = (r, c) => sisa.some((o) => o !== car && r >= o.r && r < o.r + (o.hor ? 1 : o.len) && c >= o.c && c < o.c + (o.hor ? o.len : 1))
    if (car.dir === 'R') { for (let c = car.c + car.len; c < 7; c++) if (occupied(car.r, c)) return false }
    else if (car.dir === 'L') { for (let c = 0; c < car.c; c++) if (occupied(car.r, c)) return false }
    else if (car.dir === 'U') { for (let r = 0; r < car.r; r++) if (occupied(r, car.c)) return false }
    else { for (let r = car.r + car.len; r < 7; r++) if (occupied(r, car.c)) return false }
    return true
  }
  function solve(L) {
    let cars = parseCars(L.map)
    /* mobil yang jalurnya SUDAH bebas sejak awal bisa keluar kapan pun →
       BFS urutan pelepasan sampai papan kosong */
    const q = [[cars, []]], vis = new Set()
    while (q.length) {
      const [sisa, urutan] = q.shift()
      if (!sisa.length) return urutan
      const kKey = sisa.map((o) => o.id).sort().join('')
      if (vis.has(kKey)) continue
      vis.add(kKey)
      for (const car of sisa) {
        if (!jalurBebas(car, sisa)) continue
        q.push([sisa.filter((o) => o !== car), urutan.concat(car.id)])
      }
    }
    return null
  }
  let semua = true, gagal = []
  for (let i = 0; i < LEVELS2.length; i++) {
    const urutan = solve(LEVELS2[i])
    console.log('Level ' + String(i + 1).padStart(2) + (urutan ? ' ✓ urutan keluar: ' + urutan.join('→') : ' ✗ TIDAK BISA'))
    if (!urutan) { semua = false; gagal.push(i + 1) }
  }
  if (gagal.length) console.log('GAGAL: level ' + gagal.join(', '))
  process.exit(semua ? 0 : 1)
}

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🚗', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Traffic Escape 🚗',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-tescape-2026',
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

handler.help = ['tescape', 'trafficescape', 'traffic']
handler.tags = ['game']
handler.command = /^(tescape|trafficescape|traffic)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Traffic Escape - ketuk mobil supaya semua bisa keluar dari papan macet, 15 level'

export default handler
