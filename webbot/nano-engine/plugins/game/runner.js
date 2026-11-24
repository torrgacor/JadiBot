/*
⌬ Nano Ai · Game Plugin · Endless Runner 🏃
*/

'use strict'

/* ==========================================================================
   Nano Ai · Endless Runner 🏃
   Lari otomatis. TAP = lompat (bisa dobel), TAP sambil menunduk = slide.
   Hindari rintangan, kumpulkan koin. Kecepatan naik terus. Simpan best.
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#20242e">
<title>Nano Ai Endless Runner</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#14161c;color:#eef2fa;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#232936,#181b23);border:1px solid #3a4256;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#64d2ff,#2b6ef5);font-size:20px;box-shadow:0 3px 0 #143a8c,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;letter-spacing:.3px;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#93a3c4;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px;flex:none}
.hb{width:34px;height:34px;border:1px solid #4a5678;border-radius:10px;background:linear-gradient(180deg,#2c3450,#20263c);color:#dfe9ff;font-size:15px;box-shadow:0 3px 0 #10141f}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #10141f}
.bar{display:flex;align-items:center;gap:6px;background:#1c2130;border:1px solid #3a4256;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#bfe0ff;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#141822;border:1px solid #3a4256;color:#93a3c4;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #3a4256;border-radius:14px;overflow:hidden;background:#8fd7ff;box-shadow:inset 0 6px 18px #0004}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#141822e6;border:1px solid #4a5678;color:#dfe9ff;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#0a0d14e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #4a5678;border-radius:16px;background:linear-gradient(180deg,#262e44,#171b28);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#bfe0ff;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#93a3c4;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #9ed6ff;border-radius:12px;background:linear-gradient(180deg,#64d2ff,#2b6ef5);color:#04203f;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #17408a}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #17408a}
.gbtn.alt{background:linear-gradient(180deg,#c9a75f,#8a6628);color:#241a08;border-color:#ffe793;box-shadow:0 5px 0 #4a3210}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🏃</div>
        <div>
          <div class="title">ENDLESS RUNNER</div>
          <div class="sub">tap = lompat · tap bawah = slide</div>
        </div>
      </div>
      <div class="hbtns">
        <button class="hb" id="bSound">🔊</button>
      </div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Siap lari?</div>
      <div class="chip">🪙 <b id="cCoin">0</b></div>
      <div class="chip">🏆 <b id="cBest">0</b></div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">🏃 ENDLESS RUNNER</div>
          <div class="small">Karakter lari otomatis.<br><b style="color:#bfe0ff">TAP ATAS</b> = lompat (bisa dobel lompat)<br><b style="color:#bfe0ff">TAP BAWAH</b> = slide menghindari burung<br>Kumpulkan koin 🪙 · jangan menabrak!</div>
          <button class="gbtn" id="bPlay">▶ MULAI LARI</button>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">GAME OVER</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bAgain">↻ LARI LAGI</button>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
(function(){
var DW=800,DH=600,GROUND=470;
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var best=parseInt(stGet('nano-runner-best')||'0')||0;
var sOn=stGet('nano-runner-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={jump:function(){tone(300,0.14,'square',0.09,240)},djump:function(){tone(420,0.13,'square',0.09,320)},slide:function(){tone(180,0.16,'sawtooth',0.06,-90)},coin:function(){tone(950,0.07,'sine',0.12,300)},hit:function(){tone(120,0.35,'sawtooth',0.2,-70)},start:function(){tone(523,0.1,'sine',0.12);setTimeout(function(){tone(784,0.16,'sine',0.13)},110)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
var bgCache=null;
function skyCache(){
  if(bgCache)return bgCache;
  bgCache=document.createElement('canvas');bgCache.width=DW;bgCache.height=DH;
  var g=bgCache.getContext('2d');
  var gr=g.createLinearGradient(0,0,0,DH);
  gr.addColorStop(0,'#6ec6ff');gr.addColorStop(0.62,'#bfe6ff');gr.addColorStop(1,'#e6f7ff');
  g.fillStyle=gr;g.fillRect(0,0,DW,DH);
  g.fillStyle='#fff3b0';g.beginPath();g.arc(660,90,42,0,7);g.fill();
  g.fillStyle='#fff8d0';g.beginPath();g.arc(660,90,32,0,7);g.fill();
  return bgCache;
}
var G=null,particles=[],t0=0;
function reset(){G={spd:330,dist:0,coin:0,dead:false,py:GROUND,vy:0,slide:0,jumps:0,obs:[],nextIn:0.9,legT:0}}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1400)}
function jump(){
  if(!G||G.dead)return;
  if(G.py>=GROUND-1&&G.slide<=0){G.vy=-660;G.jumps=1;SFX.jump()}
  else if(G.jumps<2){G.vy=-560;G.jumps=2;SFX.djump()}
}
function slide(){
  if(!G||G.dead)return;
  if(G.py<GROUND-2){G.vy=780}          /* cepat turun */
  G.slide=0.62;SFX.slide();
}
function spawnObs(){
  var r=Math.random(),x=DW+60;
  if(r<0.42)G.obs.push({k:'box',x:x,w:34+rnd(0,20),h:38});
  else if(r<0.60)G.obs.push({k:'tall',x:x,w:30,h:56});
  else if(r<0.80)G.obs.push({k:'bird',x:x,y:GROUND-58-rnd(0,24),w:40,h:22});
  else G.obs.push({k:'pit',x:x,w:56+rnd(0,40)});
  /* jeda menyesuaikan kecepatan: jarak konstan, bukan waktu konstan */
  G.nextIn=rnd(340,560)/G.spd;
}
function rnd(a,b){return a+Math.random()*(b-a)}
function step(dt){
  if(!G||G.dead)return;
  G.spd=Math.min(760,330+G.dist*0.055);
  G.dist+=G.spd*dt;G.legT+=dt*(G.spd/46);
  /* fisika pemain */
  G.vy+=(G.slide>0?2300:1750)*dt;
  G.py+=G.vy*dt;
  if(G.py>=GROUND){G.py=GROUND;G.vy=0;G.jumps=0}
  if(G.slide>0){G.slide-=dt;if(G.py>=GROUND-1&&G.vy>0)G.vy=0}
  /* rintangan */
  G.nextIn-=dt;
  if(G.nextIn<=0)spawnObs();
  var px=150,head=G.slide>0&&G.py>=GROUND-2?G.py-30:G.py-52,body=G.slide>0?30:52;
  for(var i=G.obs.length-1;i>=0;i--){
    var o=G.obs[i];o.x-=G.spd*dt;
    if(o.x+ (o.w||60) < -80){G.obs.splice(i,1);continue}
    if(o.k==='pit'){continue}          /* lubang: mati saat mendarat di atasnya */
    var oy=o.y||GROUND-o.h;
    var pTop=G.py-body,pBot=G.py;
    if(px+20>o.x&&px-16<o.x+o.w&&pBot>oy&&pTop<oy+o.h){
      die();return;
    }
    /* koin di atas rintangan */
    if(!o.got&&Math.abs(o.x+o.w/2-px)<26&&Math.random()<1){/* noop */}
  }
  /* lubang: pemain di atas lubang & di tanah = jatuh */
  for(var p=0;p<G.obs.length;p++){
    var q=G.obs[p];
    if(q.k==='pit'&&G.py>=GROUND-1&&px>q.x&&px<q.x+q.w){die('Jatuh ke lubang!');return}
  }
  /* koin */
  if(!G._ck||G.dist>G._ck){G._ck=G.dist+rnd(120,260);G.obs.push({k:'coin',x:DW+40,y:GROUND-rnd(30,150),w:20,h:20})}
  for(var c=G.obs.length-1;c>=0;c--){
    var k=G.obs[c];
    if(k.k==='coin'){
      k.x-=G.spd*dt;
      if(Math.hypot(k.x-px,k.y-(G.py-30))<34){G.coin++;SFX.coin();burst(k.x,k.y,'#ffd23f',8);G.obs.splice(c,1);continue}
      if(k.x<-40)G.obs.splice(c,1);
    }
  }
  for(var f=particles.length-1;f>=0;f--){var q2=particles[f];q2.t-=dt;q2.x+=q2.vx*dt;q2.y+=q2.vy*dt;if(q2.t<=0)particles.splice(f,1)}
}
function burst(x,y,col,n){for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:rnd(-160,160),vy:rnd(-200,40),t:rnd(0.3,0.55),life:0.55,col:col,s:rnd(2,4)})}
function die(pesan){
  G.dead=true;SFX.hit();burst(150,G.py-30,'#ff6a5e',18);
  if(G.dist>best){best=Math.round(G.dist);stSet('nano-runner-best',String(best))}
  document.getElementById('cBest').textContent=best;
  setTimeout(function(){
    document.getElementById('endTitle').textContent='GAME OVER';
    document.getElementById('endInfo').innerHTML='Jarak <b style="color:#bfe0ff">'+Math.round(G.dist)+'m</b> · Koin <b style="color:#ffd23f">'+G.coin+'</b><br>Terjauh: <b style="color:#ffd23f">'+best+'m</b>'+(pesan?'<br>'+pesan:'');
    document.getElementById('ovEnd').classList.remove('hide');
  },650);
}
function draw(){
  cx.drawImage(skyCache(),0,0,DW,DH);
  /* awan parallax */
  cx.fillStyle='#ffffffb8';
  var off=(G?G.dist*0.18:0)%400;
  for(var c=0;c<4;c++){var x=((c*260-off)%1100+1100)%1100-150;cx.beginPath();cx.ellipse(x,90+((c*53)%70),58,20,0,0,7);cx.fill();cx.beginPath();cx.ellipse(x+40,80+((c*53)%70),44,17,0,0,7);cx.fill()}
  /* bukit */
  cx.fillStyle='#9fd98a';cx.beginPath();cx.moveTo(0,GROUND);
  var o2=(G?G.dist*0.35:0)%900;
  for(var h=0;h<=900;h+=90){cx.lineTo(h-o2,GROUND-40-40*Math.sin((h+o2*3)/210))}
  cx.lineTo(900,GROUND);cx.closePath();cx.fill();
  /* tanah */
  cx.fillStyle='#6fbf58';cx.fillRect(0,GROUND,DW,DH-GROUND);
  cx.fillStyle='#5aa344';cx.fillRect(0,GROUND,DW,8);
  /* lubang */
  if(G)for(var p2=0;p2<G.obs.length;p2++){var q3=G.obs[p2];
    if(q3.k==='pit'){cx.fillStyle='#14161c';cx.fillRect(q3.x,GROUND+2,q3.w,DH-GROUND-4)}}
  /* garis tanah berjalan */
  cx.fillStyle='#ffffff30';
  if(G){var so=G.dist%56;for(var s=-1;s<15;s++)cx.fillRect(s*56-so,GROUND+22,26,4)}
  /* rintangan */
  if(G)for(var o2i=0;o2i<G.obs.length;o2i++){
    var o=G.obs[o2i];
    if(o.k==='box'){cx.fillStyle='#c9553d';cx.fillRect(o.x,GROUND-o.h,o.w,o.h);cx.fillStyle='#a8432f';cx.fillRect(o.x,GROUND-o.h,o.w,8);cx.fillStyle='#e0705a';cx.fillRect(o.x+4,GROUND-o.h+12,o.w-8,4)}
    else if(o.k==='tall'){cx.fillStyle='#7a4bc9';cx.fillRect(o.x,GROUND-o.h,o.w,o.h);cx.fillStyle='#6538ad';cx.fillRect(o.x,GROUND-o.h,o.w,8);cx.fillStyle='#9b74e0';cx.fillRect(o.x+4,GROUND-o.h+14,o.w-8,4)}
    else if(o.k==='bird'){
      var fl=Math.sin(Date.now()/70)*12;
      cx.fillStyle='#37474f';
      cx.beginPath();cx.ellipse(o.x+o.w/2,o.y+o.h/2,18,10,0,0,7);cx.fill();
      cx.beginPath();cx.moveTo(o.x+o.w/2,o.y+o.h/2);cx.lineTo(o.x+o.w/2-16,o.y+o.h/2-fl);cx.lineTo(o.x+o.w/2+4,o.y+o.h/2);cx.fill();
      cx.fillStyle='#ffca28';cx.beginPath();cx.moveTo(o.x+o.w/2+14,o.y+o.h/2);cx.lineTo(o.x+o.w/2+24,o.y+o.h/2+3);cx.lineTo(o.x+o.w/2+14,o.y+o.h/2+6);cx.fill();
      cx.fillStyle='#fff';cx.beginPath();cx.arc(o.x+o.w/2+8,o.y+o.h/2-3,3,0,7);cx.fill();
      cx.fillStyle='#222';cx.beginPath();cx.arc(o.x+o.w/2+9,o.y+o.h/2-3,1.5,0,7);cx.fill();
    }
    else if(o.k==='coin'){
      var bob=Math.sin(Date.now()/160+o.y)*4;
      cx.fillStyle='#ffd23f';cx.beginPath();cx.arc(o.x,o.y+bob,11,0,7);cx.fill();
      cx.fillStyle='#e0a010';cx.beginPath();cx.arc(o.x,o.y+bob,11,0,7);cx.stroke();
      cx.fillStyle='#fff3b0';cx.font='900 13px system-ui';cx.textAlign='center';cx.fillText('¢',o.x,o.y+bob+4.5);cx.textAlign='left';
    }
  }
  /* pemain */
  if(G){
    var px2=150,py=G.py,sl=G.slide>0&&py>=GROUND-2;
    var bodyH=sl?26:44,bodyW=sl?46:26;
    /* bayangan */
    cx.fillStyle='#00000030';cx.beginPath();cx.ellipse(px2,GROUND+5,22,6,0,0,7);cx.fill();
    cx.save();cx.translate(px2,py);
    /* kaki lari */
    if(!sl&&py>=GROUND-1){
      var sw=Math.sin(G.legT);
      cx.strokeStyle='#1a2740';cx.lineWidth=6;cx.lineCap='round';
      cx.beginPath();cx.moveTo(0,-10);cx.lineTo(sw*13,-2);cx.lineTo(sw*20,-1);cx.stroke();
      cx.beginPath();cx.moveTo(0,-10);cx.lineTo(-sw*13,-2);cx.lineTo(-sw*20,-1);cx.stroke();
    }
    /* badan */
    cx.fillStyle='#2b6ef5';rr2(-bodyW/2,-bodyH,bodyW,bodyH+ (sl?0:10),9);cx.fill();
    cx.fillStyle='#4d92f8';rr2(-bodyW/2+3,-bodyH+3,bodyW-6,bodyH*0.34,7);cx.fill();
    cx.fillStyle='#64d2ff';rr2(-bodyW/2+3,-bodyH+bodyH*0.4,bodyW-6,6,3);cx.fill();
    /* nomor punggung */
    cx.fillStyle='#ffffffcc';cx.font='900 '+(sl?11:13)+'px system-ui';cx.textAlign='center';cx.fillText('9',0,sl?-6:-bodyH*0.62);cx.textAlign='left';
    /* kepala */
    if(!sl){
      cx.fillStyle='#ffd7b0';cx.beginPath();cx.arc(2,-bodyH-12,12,0,7);cx.fill();
      cx.fillStyle='#37474f';cx.beginPath();cx.arc(-3,-bodyH-16,7,0,7);cx.fill();
      cx.fillStyle='#222';cx.beginPath();cx.arc(6,-bodyH-13,2,0,7);cx.fill();
    } else {cx.fillStyle='#ffd7b0';cx.beginPath();cx.arc(bodyW/2+4,-bodyH+7,10,0,7);cx.fill()}
    /* tangan */
    if(!sl){cx.strokeStyle='#2b6ef5';cx.lineWidth=5;cx.lineCap='round';
      var sw2=Math.sin(G.legT+Math.PI);
      cx.beginPath();cx.moveTo(0,-bodyH+12);cx.lineTo(-sw2*14,-bodyH+2);cx.stroke()}
    cx.restore();
  }
  /* partikel */
  for(var q4=0;q4<particles.length;q4++){var pt=particles[q4];cx.globalAlpha=Math.max(0,pt.t/pt.life);cx.fillStyle=pt.col;cx.beginPath();cx.arc(pt.x,pt.y,pt.s,0,7);cx.fill()}
  cx.globalAlpha=1;
}
function rr2(x,y,w,h,r){r=Math.min(r,w/2,h/2);cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function loop(ts){
  var dt=Math.min(0.045,(ts-t0)/1000||0.016);t0=ts;
  if(G&&!G.dead&&started)step(dt);
  if(G)draw();
  if(G&&started&&!G.dead){
    document.getElementById('stx').textContent='Lari '+Math.round(G.dist)+'m · '+Math.round(G.spd/10)+' km/jam';
    document.getElementById('cCoin').textContent=G.coin;
  }
  requestAnimationFrame(loop);
}
var started=false;
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;particles=[];document.getElementById('ovStart').classList.add('hide');document.getElementById('ovEnd').classList.add('hide');SFX.start();toast('LARI!')});
document.getElementById('bAgain').addEventListener('click',function(){ensureAC();reset();particles=[];document.getElementById('ovEnd').classList.add('hide');SFX.start()});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('nano-runner-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
/* input: atas=lompat, bawah=slide */
function zone(e){var r=cv.getBoundingClientRect();return (e.clientY-r.top)/r.height<0.62?'up':'down'}
cv.addEventListener('pointerdown',function(e){
  e.preventDefault();e.stopPropagation();
  if(!started)return;
  if(zone(e)==='up')jump();else slide();
},{passive:false});
document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp')jump();if(e.code==='ArrowDown')slide()});
document.getElementById('cBest').textContent=best;
fit();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🏃', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Nano Ai Endless Runner 🏃', 'nano-ai-runner-2026', html)
}

/* ---------- kirim rich message (pola sama dgn game lain) ---------- */
async function sendRich(conn, chat, title, rid, htmlPayload) {
  await conn.relayMessage(
    chat,
    {
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
    },
    {}
  )
}

handler.help = ['runner', 'endlessrunner', 'lari']
handler.tags = ['game']
handler.command = /^(runner|endlessrunner|lari)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Endless Runner - lari otomatis, lompat & slide menghindari rintangan, kejar rekor terjauh'

export default handler
