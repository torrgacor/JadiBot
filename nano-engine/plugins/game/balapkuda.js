/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ━━━[ 🎮 GAME ]━━━━
┇ BALAP KUDA GOYANG — Nano Ai
┇ 5 kuda, taruh koin, lihat siapa juara. Odds dinamis.
⌬
*/

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0f1a12">
<title>Nano Ai Balap Kuda</title>
<style>
:root{--bg:#0f1a12;--panel:#1a2620;--line:#37493d;--text:#eaf4ec;--dim:#8fa898;--gold:#e8c877;--good:#7fd66a;--bad:#ff6b6b}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
html,body{min-height:100%;background:radial-gradient(720px 420px at 50% -12%,#22392b 0%,var(--bg) 72%);color:var(--text);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;padding:10px 10px 18px;overflow-x:hidden}
.app{width:min(100%,440px)}
.panel{background:linear-gradient(180deg,#233428,#161f1a);border:1px solid var(--line);border-radius:18px;padding:10px;box-shadow:0 18px 46px #0009}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#131c16;border:1px solid #2d3d33;border-radius:13px;padding:7px 9px;margin-bottom:8px}
.title{font:900 15px Georgia,serif;letter-spacing:.4px}
.sub{color:var(--dim);font-size:7.5px;letter-spacing:.5px;margin-top:1px}
.bal{display:flex;gap:6px}
.chip{min-width:62px;text-align:center;background:#182119;border:1px solid #33443a;border-radius:10px;padding:4px 7px}
.chip b{display:block;color:var(--dim);font-size:6.5px;letter-spacing:.12em}
.chip span{display:block;color:var(--gold);font:900 12.5px system-ui;line-height:1.15}
.trackWrap{position:relative;border-radius:14px;overflow:hidden;border:1px solid #2f4436;background:#132018;box-shadow:inset 0 6px 20px #000a}
canvas{display:block;width:100%;height:auto}
.ovl{position:absolute;inset:0;display:none;place-items:center;background:#08120dd9;backdrop-filter:blur(6px);z-index:6;padding:14px;text-align:center}
.ovl.on{display:grid}
.ovl h3{font:900 18px Georgia,serif}
.ovl p{color:var(--dim);font-size:9.5px;margin-top:6px;line-height:1.55}
.ovl .money{font:900 20px system-ui;margin-top:7px}
.picks{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:9px}
.pick{position:relative;border:1px solid #3a4c40;border-radius:12px;background:linear-gradient(180deg,#243026,#1a231d);color:var(--text);padding:7px 8px;text-align:left;transition:transform .08s ease,box-shadow .15s ease}
.pick:active{transform:scale(.98)}
.pick.on{border-color:var(--gold);box-shadow:0 0 0 1px var(--gold),0 6px 16px #0007}
.pick .nm{display:flex;align-items:center;gap:6px;font:900 10px system-ui;letter-spacing:.2px}
.sw{width:10px;height:10px;border-radius:3px;flex:0 0 auto}
.pick .od{color:var(--dim);font-size:8px;margin-top:2px}
.pick .od i{color:var(--gold);font-style:normal;font-weight:900}
.pick.dimmed{opacity:.42}
.row{display:flex;gap:6px;margin-top:8px}
.btn{flex:1;min-height:40px;border:1px solid #4c6053;border-radius:11px;background:linear-gradient(180deg,#314136,#232e27);color:var(--text);font:900 10.5px system-ui;letter-spacing:.3px;box-shadow:0 4px 0 #101714;transition:transform .06s ease}
.btn:active{transform:translateY(2px)}
.btn.gold{background:linear-gradient(180deg,#ecd08d,#a8813f);border-color:#cfa964;color:#241a08}
.btn.on{background:linear-gradient(180deg,#8ed072,#4a8a33);border-color:#77b95a;color:#0c2007}
.btn:disabled{opacity:.45;box-shadow:none}
.tip{margin-top:8px;color:var(--dim);font-size:8px;line-height:1.5;text-align:center}
.fame{margin-top:7px;display:flex;gap:5px;flex-wrap:wrap;justify-content:center}
.fame span{background:#182119;border:1px solid #33443a;border-radius:20px;padding:2px 7px;font-size:7.5px;color:var(--dim)}
.fame span b{color:var(--text)}
</style>
</head>
<body>
<div class="app"><div class="panel">
  <div class="head">
    <div><div class="title">BALAP KUDA GOYANG</div><div class="sub">NANO AI • 5 KUDA • ODDS DINAMIS</div></div>
    <div class="bal">
      <div class="chip"><b>KOIN</b><span id="hCoins">0</span></div>
      <div class="chip"><b>MENANG</b><span id="hWin">0</span></div>
    </div>
  </div>

  <div class="trackWrap">
    <canvas id="cv"></canvas>
    <div class="ovl" id="ovl"><div>
      <h3 id="ovT">Hasil</h3>
      <div class="money" id="ovM"></div>
      <p id="ovP"></p>
      <div class="row"><button class="btn gold" id="ovBtn" type="button">MAIN LAGI</button></div>
    </div></div>
  </div>

  <div class="picks" id="picks"></div>
  <div class="row" id="stakeRow">
    <button class="btn" id="s10" type="button">10</button>
    <button class="btn" id="s50" type="button">50</button>
    <button class="btn" id="s100" type="button">100</button>
    <button class="btn" id="s500" type="button">500</button>
    <button class="btn" id="sAll" type="button">ALL</button>
  </div>
  <div class="row"><button class="btn gold" id="bGo" type="button">MULAI BALAPAN</button></div>
  <div class="fame" id="fame"></div>
  <div class="tip" id="tip">Pilih satu kuda, tentukan taruhan, lalu mulai.<br>Juara pertama = taruhan × odds. Kalah = taruhan hangus.</div>
</div></div>

<script>
(function(){
'use strict';
var HORSES=[
  {n:'Kilat Merah',c:'#ff5f6d',d:'#a01f2c',base:1.00},
  {n:'Badai Biru',c:'#59a7ff',d:'#1d4f96',base:0.99},
  {n:'Jago Hijau',c:'#63d471',d:'#217a35',base:0.97},
  {n:'Emas Gila',c:'#ffd166',d:'#a37512',base:0.94},
  {n:'Ungu Nakal',c:'#c08cff',d:'#5e2fa8',base:0.90}
];
var LANES=HORSES.length;
var coins=0,stats={w:0,l:0,best:0},stake=50,pick=-1,busy=false,race=null,last=0,hoof=0;
var cv=null,ctx=null,W=0,H=0,DPR=1,laneH=0,padX=0,spr=[],checker=null,ready=false;
var state=[],order=[],finishCount=0;
function el(id){return document.getElementById(id)}
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function cl(v,a,b){return v<a?a:v>b?b:v}
function fmt(n){n=Math.round(n);var s=String(n),o='',i;for(i=0;i<s.length;i++){if(i>0&&(s.length-i)%3===0)o+='.';o+=s[i]}return o}
function blip(a,b,c,d,e){try{if(window.GX)GX.blip(a,b,c,d,e)}catch(x){}}
function vib(p){try{if(window.GX)GX.vib(p)}catch(x){}}

/* ---------- sprite kuda (pre-render, dipakai berulang) ---------- */
function horseSprite(col,dark,frame){
  var w=84,h=62,c=document.createElement('canvas');
  c.width=Math.round(w*DPR);c.height=Math.round(h*DPR);
  var g=c.getContext('2d');
  g.setTransform(DPR,0,0,DPR,0,0);
  var L=frame?1.6:-1.6;
  function leg(x,ph){
    g.strokeStyle=dark;g.lineWidth=3.2;g.lineCap='round';
    g.beginPath();g.moveTo(x,36);g.lineTo(x+ph*4,50);g.lineTo(x+ph*6.5,60);g.stroke();
    g.strokeStyle='#f3ead7';g.lineWidth=3;g.beginPath();g.moveTo(x+ph*6.5,60);g.lineTo(x+ph*6.5,60.6);g.stroke()
  }
  // ekor
  g.strokeStyle=dark;g.lineWidth=5;g.lineCap='round';
  g.beginPath();g.moveTo(12,24);g.quadraticCurveTo(2,30,5,44);g.stroke();
  // kaki belakang & depan
  leg(22,L);leg(64,-L);
  // badan
  var bg=g.createLinearGradient(0,14,0,44);bg.addColorStop(0,col);bg.addColorStop(1,dark);
  g.fillStyle=bg;g.beginPath();g.ellipse(40,28,26,13,0,0,6.284);g.fill();
  // perut terang
  g.fillStyle='rgba(255,255,255,.20)';g.beginPath();g.ellipse(40,34,20,7,0,0,6.284);g.fill();
  // pelana
  g.fillStyle='#2b1f14';g.beginPath();g.ellipse(38,20,11,6,0,0,6.284);g.fill();
  g.fillStyle=col;g.fillRect(30,15,16,3);
  // leher + kepala
  g.fillStyle=col;g.beginPath();g.moveTo(60,26);g.lineTo(74,10);g.lineTo(79,15);g.lineTo(66,32);g.closePath();g.fill();
  g.fillStyle=dark;g.beginPath();g.ellipse(78,15,7,6,-0.28,0,6.284);g.fill();
  g.fillStyle=col;g.beginPath();g.ellipse(75,20,9,5,-0.2,0,6.284);g.fill();
  // telinga
  g.fillStyle=dark;g.beginPath();g.moveTo(77,7);g.lineTo(80,1);g.lineTo(83,8);g.closePath();g.fill();
  // surai
  g.strokeStyle='#20160e';g.lineWidth=2.4;
  g.beginPath();g.moveTo(63,24);g.lineTo(74,9);g.stroke();
  // mata
  g.fillStyle='#fff';g.beginPath();g.arc(80,13,2.1,0,6.284);g.fill();
  g.fillStyle='#101010';g.beginPath();g.arc(80.4,13,1.1,0,6.284);g.fill();
  return c
}
function buildSprites(){
  spr=[];
  for(var i=0;i<LANES;i++)spr.push([horseSprite(HORSES[i].c,HORSES[i].d,0),horseSprite(HORSES[i].c,HORSES[i].d,1)])
}
function buildChecker(){
  var s=8,c=document.createElement('canvas');c.width=s*4;c.height=s*2;
  var g=c.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,s*4,s*2);
  g.fillStyle='#141414';
  for(var y=0;y<2;y++)for(var x=0;x<4;x++)if((x+y)%2===0)g.fillRect(x*s,y*s,s,s);
  checker=c
}

/* ---------- ukuran kanvas adaptif (aman untuk HP lama) ---------- */
function fit(){
  var wrap=cv.parentNode,avail=wrap&&wrap.clientWidth?wrap.clientWidth:360;
  if(avail<240)avail=360;
  if(avail>420)avail=420;
  DPR=Math.min(window.devicePixelRatio||1,2);
  if(avail*DPR>840)DPR=840/avail;
  W=Math.round(avail);laneH=Math.round(cl(avail*0.135,46,58));
  H=laneH*LANES+26;padX=Math.round(cl(avail*0.11,40,56));
  cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
  cv.style.height=H+'px';
  ctx=cv.getContext('2d');ctx.setTransform(DPR,0,0,DPR,0,0);
  buildSprites();buildChecker();
  ready=true
}

/* ---------- odds ---------- */
function oddsFor(i,form){
  var tot=0,k;for(k=0;k<LANES;k++)tot+=(form?form[k]:HORSES[k].base);
  var p=(form?form[i]:HORSES[i].base)/tot;
  return cl(Math.round((0.93/p)*10)/10,1.3,14)
}
function lucky(){var f=[],i;for(i=0;i<LANES;i++)f.push(HORSES[i].base*(0.88+Math.random()*0.3));return f}
var curForm=lucky(),curOdds=[];
function refreshOdds(form){
  curForm=form||lucky();curOdds=[];
  for(var i=0;i<LANES;i++)curOdds.push(oddsFor(i,curForm));
}
function renderPicks(){
  var box=el('picks');
  box.innerHTML='';
  for(var i=0;i<LANES;i++){
    var b=document.createElement('button');
    b.type='button';b.className='pick'+(pick===i?' on':'')+(!race&&coins<stake?' dimmed':'');
    b.id='pk'+i;
    var htmls='<div class="nm"><span class="sw" style="background:'+HORSES[i].c+'"></span>'+HORSES[i].n+'</div>';
    htmls+='<div class="od">ODDS <i>x'+curOdds[i].toFixed(1)+'</i></div>';
    b.innerHTML=htmls;
    (function(k){b.addEventListener('click',function(e){e.preventDefault();choose(k)})})(i);
    box.appendChild(b)
  }
}
function choose(i){
  if(busy)return;
  pick=i;refreshOdds();renderPicks();updateUI();
  blip(560+i*40,760+i*40,.07,.04)
}
function updateUI(){
  el('hCoins').textContent=fmt(coins);
  el('hWin').textContent=fmt(stats.w);
  el('s10').className='btn'+(stake===10?' on':'');el('s50').className='btn'+(stake===50?' on':'');
  el('s100').className='btn'+(stake===100?' on':'');el('s500').className='btn'+(stake===500?' on':'');
  el('sAll').className='btn'+(stake==='all'?' on':'');
  var go=el('bGo');
  var sv=stake==='all'?coins:stake;
  if(pick<0){go.textContent='PILIH KUDA DULU'}
  else if(sv<10||sv>coins){go.textContent='KOIN TIDAK CUKUP'}
  else{go.textContent='MULAI • '+fmt(sv)+' @ x'+curOdds[pick].toFixed(1)}
  go.disabled=busy||pick<0||sv<10||sv>coins;
  var f=el('fame');
  f.innerHTML='<span>Menang <b>'+stats.w+'</b></span><span>Kalah <b>'+stats.l+'</b></span><span>Terbaik <b>'+fmt(stats.best)+'</b></span><span>Kuda favorit <b>'+HORSES[(stats.fav||0)].n+'</b></span>'
}
function setStake(v){
  if(busy)return;
  stake=v;updateUI();blip(640,860,.06,.04)
}

/* ---------- menggambar lintasan ---------- */
function drawTrack(){
  var g=ctx;
  var sky=g.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#1b3324');sky.addColorStop(1,'#10201a');
  g.fillStyle=sky;g.fillRect(0,0,W,H);
  var top=13,i;
  for(i=0;i<LANES;i++){
    var y=top+i*laneH;
    var lg=g.createLinearGradient(0,y,0,y+laneH);
    if(i%2===0){lg.addColorStop(0,'#3c4a34');lg.addColorStop(1,'#2c3826')}
    else{lg.addColorStop(0,'#374530');lg.addColorStop(1,'#283322')}
    g.fillStyle=lg;g.fillRect(0,y,W,laneH);
    g.strokeStyle='rgba(255,255,255,.10)';g.lineWidth=1;
    g.beginPath();g.moveTo(0,y+.5);g.lineTo(W,y+.5);g.stroke();
    // garis tepi rumput
    g.fillStyle='rgba(120,190,110,.10)';g.fillRect(0,y+laneH-3,W,3);
    // marka
    g.strokeStyle='rgba(255,255,255,.13)';g.setLineDash([7,9]);g.lineWidth=1;
    g.beginPath();g.moveTo(padX*.6,y+laneH/2);g.lineTo(W-padX*.4,y+laneH/2);g.stroke();g.setLineDash([])
  }
  // garis start & finish
  g.fillStyle='rgba(255,255,255,.30)';g.fillRect(padX-3,top,3,laneH*LANES);
  var fbx=W-20,bw=14;
  if(checker&&checker.width){
    var ch=checker.width/2,sc=8;
    for(i=0;i<LANES;i++){
      var yy=top+i*laneH;
      for(var k2=0;k2*sc<laneH;k2++){
        g.drawImage(checker,0,(k2%2)*sc,ch,sc,fbx,yy+k2*sc,bw,Math.min(sc,laneH-k2*sc))
      }
    }
  }
  g.fillStyle='#e8f4ea';g.font='900 8px system-ui';g.textAlign='right';g.textBaseline='top';
  g.fillText('FINISH',W-3,1);
  g.textAlign='left';g.textBaseline='middle';
  for(i=0;i<LANES;i++){
    g.fillStyle='rgba(255,255,255,.30)';
    g.fillText(String(i+1),7,laneY(i)+laneH/2)
  }
}
function laneY(i){return 13+i*laneH}
function hx(p){return padX-16+p*(W-padX-88)}
function initState(){
  var i;state=[];
  for(i=0;i<LANES;i++)state.push({dist:0,speed:0,frame:0,frames:0,done:false,tt:0})
}
function drawHorse(i,p,bob,ph){
  var h=laneH+6,w=h*1.3548;
  var x=hx(p),y=laneY(i)+(laneH-h)/2+5+bob;
  var im=spr[i]&&spr[i][ph?1:0];
  if(!im)return;
  ctx.globalAlpha=1;
  ctx.fillStyle='rgba(0,0,0,.30)';
  ctx.beginPath();ctx.ellipse(x+w*.5,y+h-3,w*.30,3.4,0,0,6.284);ctx.fill();
  ctx.drawImage(im,x,y,w,h)
}
function drawRace(){
  if(!ready)return;
  drawTrack();
  var i;
  for(i=0;i<LANES;i++){
    var s=state[i]||{dist:0,speed:0,frame:0};
    var bob=Math.abs(Math.sin(s.dist*34+i))*2.6*(s.done?0.4:1);
    drawHorse(i,s.dist,bob&&s.speed>0?bob:0,s.frame)
  }
  if(race){
    var lead=0,k;
    for(k=1;k<LANES;k++)if((state[k]?state[k].dist:0)>(state[lead]?state[lead].dist:0))lead=k;
    ctx.fillStyle='#ffe9a8';ctx.font='900 8px system-ui';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('MEMIMPIN: '+HORSES[lead].n.toUpperCase(),4,7)
  }
}

/* ---------- jalannya balapan ---------- */
function startRace(){
  if(busy)return;
  var sv=stake==='all'?coins:stake;
  if(pick<0||sv<10||sv>coins){vib(30);return}
  busy=true;finishCount=0;order=[];
  coins-=sv;stats.lastStake=sv;stats.lastPick=pick;stats.fav=pick;
  ss('bk_coins',coins);ss('bk_stats',stats);
  refreshOdds();updateUI();renderPicks();
  el('ovl').className='ovl';
  initState();
  race={t:0,dur:8.4,stake:sv,pick:pick,odds:curOdds[pick]};
  last=0;hoof=0;
  el('tip').innerHTML='Balapan berjalan... kuda favoritmu: <b>'+HORSES[pick].n+'</b> @ x'+curOdds[pick].toFixed(1);
  blip(520,880,.16,.05);setTimeout(function(){blip(660,990,.16,.05)},130);setTimeout(function(){blip(880,1200,.2,.05)},260);
  vib([18,40,18,40,45]);
  requestAnimationFrame(tick)
}
function tick(now){
  if(!race)return;
  if(!last)last=now;
  var dt=(now-last)/1000;last=now;
  if(dt<0)dt=0;if(dt>0.25)dt=0.25;
  race.t+=dt;
  drawRace();
  var i;
  for(i=0;i<LANES;i++){
    var s=state[i];
    // bentuk: base * variasi, sedikit "rubber band" biar seru
    var form=curForm[i];
    var lag=(0.24-s.dist)*0.16;
    var burst=Math.sin(race.t*1.35+i*1.9)>0.72?0.30:0;
    var rate=(1/race.dur)*form*(1+burst)+lag;
    rate*=0.88+0.24*Math.sin(i*2.1+race.t*2.7);
    s.speed=rate;
    s.tt+=dt;
    var pf=(s.tt*11)|0;
    if(pf!==s.frames){s.frames=pf;s.frame=pf%2}
    if(s.done){
      // tetap berlari pelan sampai finish semua
      s.dist=Math.min(1.06,s.dist+dt*0.10)
    }else{
      s.dist+=rate*dt;
      if(s.dist>=1){s.dist=1;s.done=true;finishCount++;order.push(i);
        blip(900-i*60,1200-i*60,.1,.05)}
    }
  }
  // suara langkah
  hoof+=dt;
  if(hoof>0.34){hoof=0;blip(150+Math.random()*90,110,.045,.028,'triangle')}
  var allDone=finishCount>=LANES||race.t>race.dur*1.45;
  if(!allDone){
    requestAnimationFrame(tick);return
  }
  // pastikan semua urut
  if(order.length<LANES){
    var rest=[];
    for(i=0;i<LANES;i++)if(order.indexOf(i)<0)rest.push(i);
    rest.sort(function(a,b){return state[b].dist-state[a].dist});
    for(i=0;i<rest.length;i++)order.push(rest[i])
  }
  finishRace()
}
function finishRace(){
  var win=order[0];
  var won=win===race.pick;
  var gain=won?Math.round(race.stake*race.odds):0;
  var r=race;race=null;busy=false;
  if(won){coins+=gain;stats.w++;if(gain>stats.best)stats.best=gain}
  else stats.l++;
  ss('bk_coins',coins);ss('bk_stats',stats);
  var pod='🥇 '+HORSES[order[0]].n,me;
  for(var i=1;i<order.length;i++)pod+='  •  '+['🥈','🥉','4️⃣','5️⃣'][i-1]+' '+HORSES[order[i]].n;
  el('ovT').textContent=won?'Kuda kamu juara! 🏆':'Belum beruntung 🐎';
  el('ovM').innerHTML=won?'<span style="color:var(--good)">+'+fmt(gain)+'</span>':'<span style="color:var(--bad)">-'+fmt(r.stake)+'</span>';
  el('ovP').innerHTML=pod+'<br><br>'+HORSES[r.pick].n+' @ x'+r.odds.toFixed(1)+(won?' — taruhan '+fmt(r.stake)+' jadi '+fmt(gain)+' koin.':'')
  el('ovl').className='ovl on';
  if(won){blip(720,1180,.16,.05);setTimeout(function(){blip(1040,1500,.22,.05)},150);vib([25,50,90])}
  else{blip(320,180,.22,.05,'triangle');setTimeout(function(){blip(240,120,.3,.05,'triangle')},200);vib([30,60,30])}
  refreshOdds();renderPicks();
  if(coins<10&&pick===r.pick){coins+=150;ss('bk_coins',coins)}
  updateUI();
  el('tip').innerHTML='Pilih kuda berikutnya. Odds diperbarui tiap balapan.'
}

/* ---------- kontrol ---------- */
function bind(){
  el('s10').addEventListener('click',function(e){e.preventDefault();setStake(10)});
  el('s50').addEventListener('click',function(e){e.preventDefault();setStake(50)});
  el('s100').addEventListener('click',function(e){e.preventDefault();setStake(100)});
  el('s500').addEventListener('click',function(e){e.preventDefault();setStake(500)});
  el('sAll').addEventListener('click',function(e){e.preventDefault();setStake('all')});
  el('bGo').addEventListener('click',function(e){e.preventDefault();startRace()});
  el('ovBtn').addEventListener('click',function(e){e.preventDefault();el('ovl').className='ovl';updateUI();renderPicks()});
  if(cv)cv.addEventListener('touchstart',function(){if(window.GX)GX.unlock()},{passive:true})
}

/* ---------- boot ---------- */
cv=el('cv');
coins=ls('bk_coins',null);if(typeof coins!=='number'||!isFinite(coins))coins=1000;
stats=ls('bk_stats',{w:0,l:0,best:0,fav:0});
if(!stats||typeof stats!=='object')stats={w:0,l:0,best:0,fav:0};
if(coins<10)coins=1000;
fit();bind();refreshOdds();initState();renderPicks();updateUI();
drawRace();
var resizeT=0;
window.addEventListener('resize',function(){
  clearTimeout(resizeT);
  resizeT=setTimeout(function(){var keep=race;race=null;fit();drawRace();race=keep},180)
});
})();
</script>
<script>
(function(){var A=null,on=true;function ac(){try{if(!A){var C=window.AudioContext||window.webkitAudioContext;if(C)A=new C()}if(A&&A.state==='suspended')A.resume()}catch{}}
function blip(f1,f2,d,v,t){if(!on)return;ac();if(!A)return;try{var n=A.currentTime,o=A.createOscillator(),g=A.createGain();o.type=t||'square';o.frequency.setValueAtTime(f1,n);if(f2)o.frequency.exponentialRampToValueAtTime(f2,n+d);g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(v||.05,n+.015);g.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(g);g.connect(A.destination);o.start(n);o.stop(n+d+.03)}catch{}}
function vib(p){if(!on)return;try{if(navigator.vibrate)navigator.vibrate(p)}catch{}}
window.GX={blip:blip,vib:vib,unlock:ac,isOn:function(){return on}};
document.addEventListener('pointerdown',ac,{passive:true});document.addEventListener('keydown',ac,{passive:true});
try{var b=document.createElement('button');b.type='button';b.textContent='🔊';b.setAttribute('aria-label','Suara');
b.style.cssText='position:fixed;right:10px;bottom:10px;z-index:2147483000;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(14,22,16,.82);color:#eaf4ec;font-size:15px;line-height:1;box-shadow:0 6px 16px rgba(0,0,0,.45)';
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
.trackWrap{border-radius:18px!important;box-shadow:inset 0 3px 0 rgba(255,255,255,.16),inset 0 -8px 18px rgba(0,0,0,.55),0 16px 34px rgba(0,0,0,.5)!important}
.fame{border-radius:16px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.24),inset 0 -5px 12px rgba(0,0,0,.5),0 12px 28px rgba(0,0,0,.5)!important}
.cell{border-radius:8px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -2px 4px rgba(0,0,0,.35),0 3px 7px rgba(0,0,0,.35)!important}
.pick{border-radius:10px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.25),0 4px 0 rgba(0,0,0,.4),0 8px 16px rgba(0,0,0,.42)!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🐎', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Balap Kuda Goyang 🐎',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-balapkuda-2026',
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

handler.help = ['balapkuda', 'kudagoyang', 'balap']
handler.tags = ['game']
handler.command = /^(balapkuda|kudagoyang|balap)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Balap Kuda Goyang — taruh koin, kejar juara'

export default handler
