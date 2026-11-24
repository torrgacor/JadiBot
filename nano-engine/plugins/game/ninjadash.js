/*
⌬ Nano Ai · Game Plugin · Ninja Dash ⚡
*/

'use strict'

/* ==========================================================================
   Nano Ai · Ninja Dash ⚡
   TAP = teleport dash ke arah itu (jarak terbatas, ada cooldown garis isyarat).
   Lewati dinding/jebakan yang menyala. Sentuh jebakan = mati. Kejar jarak!
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#1a1030">
<title>Nano Ai Ninja Dash</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#120b22;color:#efe9ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#251840,#180f2c);border:1px solid #4a3878;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#c084fc,#7c3aed);font-size:20px;box-shadow:0 3px 0 #3b1d78,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#a795d6;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px}
.hb{width:34px;height:34px;border:1px solid #5d4894;border-radius:10px;background:linear-gradient(180deg,#322453,#241740);color:#e9e0ff;font-size:15px;box-shadow:0 3px 0 #140b26}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #140b26}
.bar{display:flex;align-items:center;gap:6px;background:#1e1436;border:1px solid #4a3878;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#d9c8ff;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#150d28;border:1px solid #4a3878;color:#a795d6;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.dashbar{height:9px;border-radius:999px;background:#150d28;border:1px solid #4a3878;overflow:hidden;margin-bottom:8px}
.dashbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#c084fc,#7c3aed);transition:width .1s linear}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #4a3878;border-radius:14px;overflow:hidden;background:#0d0819}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#150d28e6;border:1px solid #5d4894;color:#e9e0ff;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#0a0516e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #5d4894;border-radius:16px;background:linear-gradient(180deg,#2a1c4a,#180f2c);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#d9c8ff;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#a795d6;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #d9c8ff;border-radius:12px;background:linear-gradient(180deg,#c084fc,#7c3aed);color:#22093f;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #41198a}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #41198a}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">⚡</div>
        <div>
          <div class="title">NINJA DASH</div>
          <div class="sub">tap = teleport dash · hindari jebakan</div>
        </div>
      </div>
      <div class="hbtns"><button class="hb" id="bSound">🔊</button></div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Siap beraksi?</div>
      <div class="chip">🏆 <b id="cBest">0</b></div>
      <div class="chip">💜 <b id="cLife">♥♥♥</b></div>
    </div>
    <div class="dashbar"><i id="dashFill"></i></div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">⚡ NINJA DASH</div>
          <div class="small">Dunia bergulir otomatis.<br><b style="color:#d9c8ff">TAP</b> ke mana pun → ninja <b>teleport</b> ke arah itu (jarak terbatas).<br>Melewati dinding ungu saat dash!<br>Hindari paku &amp; laser · dapatkan nyawa 💜 · dash perlu <b>isi ulang</b> (bar ungu)</div>
          <button class="gbtn" id="bPlay">▶ MULAI</button>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">GUGUR</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bAgain">↻ COBA LAGI</button>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
(function(){
var DW=800,DH=600;
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var best=parseInt(stGet('nano-ninja-best')||'0')||0;
var sOn=stGet('nano-ninja-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={dash:function(){tone(700,0.12,'sawtooth',0.09,-380)},hit:function(){tone(140,0.3,'sawtooth',0.2,-60)},heart:function(){tone(660,0.1,'sine',0.12,220)},coin:function(){tone(980,0.06,'sine',0.1,260)},start:function(){tone(440,0.1,'triangle',0.12);setTimeout(function(){tone(660,0.15,'triangle',0.13)},110)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
var starCache=null;
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
var G=null,started=false,t0=0,ghosts=[];
function rnd(a,b){return a+Math.random()*(b-a)}
function reset(){
  G={spd:300,dist:0,lives:3,dash:1,charging:false,nx:200,ny:DH/2,
     obs:[],coins:[],nextObs:0.8,nextCoin:1.4,dead:false,inv:0,dashFx:0};
}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1400)}
/* dunia: dinding ungu = bolong saat dash; paku/laser = selalu membunuh */
function spawn(){
  var r=Math.random(),x=DW+60;
  if(r<0.4)G.obs.push({k:'wall',x:x,w:34,y:rnd(60,DH-200),h:rnd(120,240)});
  else if(r<0.7)G.obs.push({k:'spike',x:x,w:30,h:36,y:Math.random()<0.5?DH-36:rnd(100,DH-140)});
  else G.obs.push({k:'laser',x:x,hor:Math.random()<0.6,y:rnd(80,DH-80),w:Math.random()<0.6?200:0,h:0,on:0,ph:rnd(0,3)});
}
function dashTo(px,py){
  if(!G||G.dead||!started)return;
  var r=cv.getBoundingClientRect();
  var tx=(px-r.left)/r.width*DW, ty=(py-r.top)/r.height*DH;
  if(G.dash<1){SFX.nope?tone(150,0.08,'square',0.06):0;toast('Dash belum terisi!');return}
  var dx=tx-G.nx, dy=ty-G.ny, d=Math.hypot(dx,dy);
  var max=280;
  if(d>max){dx*=max/d;dy*=max/d}
  var fx=G.nx,fy=G.ny;
  ghosts.push({x:fx,y:fy,t:0.3});
  ghosts.push({x:fx+dx/2,y:fy+dy/2,t:0.3});
  G.nx+=dx;G.ny+=dy;
  G.nx=Math.max(30,Math.min(DW-30,G.nx));G.ny=Math.max(30,Math.min(DH-30,G.ny));
  G.dash=0;G.charging=true;G.dashFx=0.25;
  SFX.dash();burst(G.nx,G.ny,'#c084fc',14);
}
function burst(x,y,col,n){for(var i=0;i<n;i++)ghosts.push({x:x,y:y,vx:rnd(-150,150),vy:rnd(-150,150),t:0.4,col:col,s:rnd(2,4)})}
function step(dt){
  if(!G||G.dead)return;
  G.spd=Math.min(640,300+G.dist*0.05);
  G.dist+=G.spd*dt;
  if(G.inv>0)G.inv-=dt;
  if(G.dashFx>0)G.dashFx-=dt;
  if(G.charging){G.dash=Math.min(1,G.dash+dt*0.62);if(G.dash>=1){G.charging=false;SFX.coin()}}
  document.getElementById('dashFill').style.width=(G.dash*100)+'%';
  /* spawn */
  G.nextObs-=dt;if(G.nextObs<=0){spawn();G.nextObs=rnd(0.62,1.25)*Math.max(0.5,1-G.dist/9000)}
  G.nextCoin-=dt;if(G.nextCoin<=0){G.coins.push({x:DW+40,y:rnd(60,DH-60)});G.nextCoin=rnd(1,2.2)}
  for(var i=G.obs.length-1;i>=0;i--){var o=G.obs[i];o.x-=G.spd*dt;if(o.x<-260)G.obs.splice(i,1)}
  for(var c=G.coins.length-1;c>=0;c--){var k=G.coins[c];k.x-=G.spd*dt;if(k.x<-40){G.coins.splice(c,1);continue}
    if(Math.hypot(k.x-G.nx,k.y-G.ny)<30){G.coins.splice(c,1);SFX.coin();burst(k.x,k.y,'#ffd23f',7)}}
  /* dinding: dash boleh menembus; tanpa dash = tabrak */
  for(var w=0;w<G.obs.length;w++){
    var o2=G.obs[w];
    if(o2.k==='wall'&&G.nx+16>o2.x&&G.nx-16<o2.x+o2.w&&G.ny>o2.y&&G.ny<o2.y+o2.h){
      if(G.dashFx>0){continue}   /* sedang dash → menembus */
      o2.x+=0;                    /* duduk di situ saja; dorong ninja keluar sisi terdekat */
      var dl=Math.abs(G.nx-(o2.x-16)),dr=Math.abs((o2.x+o2.w+16)-G.nx);
      if(dl<dr)G.nx=o2.x-16;else G.nx=o2.x+o2.w+16;
    }
  }
  /* jebakan */
  if(G.inv<=0)for(var s=0;s<G.obs.length;s++){
    var o3=G.obs[s];
    if(o3.k==='spike'){
      var sy=o3.y,act=true;
      if(Math.hypot(G.nx-o3.x-15,G.ny-sy-18)<26){hurt();return}
    } else if(o3.k==='laser'){
      o3.on=(Math.sin(Date.now()/900+o3.ph)>-0.2);
      if(!o3.on)continue;
      var hitL=o3.hor?(Math.abs(G.ny-o3.y)<14&&G.nx>o3.x&&G.nx<o3.x+o3.w):(Math.abs(G.nx-o3.x)<14&&G.ny>o3.y-o3.h&&G.ny<o3.y+120);
      if(hitL){hurt();return}
    }
  }
}
function hurt(){
  G.lives--;G.inv=1.4;SFX.hit();burst(G.nx,G.ny,'#ff5e8a',12);
  document.getElementById('cLife').textContent=G.lives>0?'♥'.repeat(G.lives)+'·'.repeat(3-G.lives):'—';
  if(G.lives<=0)die();
  else toast('Sisa ♥ '+G.lives);
}
function die(){
  G.dead=true;SFX.hit();
  if(G.dist>best){best=Math.round(G.dist);stSet('nano-ninja-best',String(best))}
  document.getElementById('cBest').textContent=best;
  setTimeout(function(){
    document.getElementById('endInfo').innerHTML='Jarak <b style="color:#d9c8ff">'+Math.round(G.dist)+'m</b><br>Terjauh: <b style="color:#ffd23f">'+best+'m</b>';
    document.getElementById('ovEnd').classList.remove('hide');
  },600);
}
function draw(){
  if(!starCache){
    starCache=document.createElement('canvas');starCache.width=DW;starCache.height=DH;
    var sc=starCache.getContext('2d');
    sc.fillStyle='#0d0819';sc.fillRect(0,0,DW,DH);
    sc.fillStyle='#ffffff66';
    for(var s2=0;s2<30;s2++)sc.fillRect((s2*173)%DW,(s2*97)%DH,s2%3+1,s2%3+1);
  }
  cx.drawImage(starCache,0,0,DW,DH);
  /* bulir grid bergerak */
  cx.strokeStyle='#7c3aed22';cx.lineWidth=1;
  var off2=(G?G.dist*0.6:0)%80;
  for(var gx=-80+(-off2%80);gx<DW;gx+=80){cx.beginPath();cx.moveTo(gx,0);cx.lineTo(gx,DH);cx.stroke()}
  /* rintangan */
  if(G)for(var i=0;i<G.obs.length;i++){
    var o=G.obs[i];
    if(o.k==='wall'){
      cx.fillStyle='#4a3878';cx.fillRect(o.x,o.y,o.w,o.h);
      cx.fillStyle='#6d54b8';cx.fillRect(o.x+3,o.y+3,o.w-6,o.h-6);
      cx.fillStyle='#251840';for(var yy=o.y+10;yy<o.y+o.h-8;yy+=22)cx.fillRect(o.x+8,yy,o.w-16,4);
    } else if(o.k==='spike'){
      cx.fillStyle='#c9302c';
      cx.beginPath();cx.moveTo(o.x,o.y+o.h);cx.lineTo(o.x+15,o.y);cx.lineTo(o.x+30,o.y+o.h);cx.closePath();cx.fill();
      cx.fillStyle='#ff8a7a';cx.beginPath();cx.moveTo(o.x+8,o.y+o.h-6);cx.lineTo(o.x+15,o.y+10);cx.lineTo(o.x+22,o.y+o.h-6);cx.closePath();cx.fill();
    } else if(o.k==='laser'){
      var puls=0.5+Math.sin(Date.now()/300+o.ph)*0.5;
      cx.fillStyle='#ff5e8a33';
      if(o.hor)cx.fillRect(o.x,o.y-2,o.w,4);else cx.fillRect(o.x-2,o.y-120,4,240);
      cx.strokeStyle=o.on?'#ff5e8a':'#ff5e8a55';cx.lineWidth=o.on?5+Math.sin(Date.now()/60)*1.6:3;
      if(o.hor){cx.beginPath();cx.moveTo(o.x,o.y);cx.lineTo(o.x+o.w,o.y);cx.stroke()}
      else{cx.beginPath();cx.moveTo(o.x,o.y-120);cx.lineTo(o.x,o.y+120);cx.stroke()}
      cx.fillStyle='rgba(255,94,138,'+(o.on?0.25+puls*0.3:0.1)+')';
      if(o.hor)cx.fillRect(o.x-6,o.y-8,o.w+12,16);else cx.fillRect(o.x-8,o.y-126,16,252);
    }
  }
  /* koin */
  if(G)for(var c=0;c<G.coins.length;c++){
    var k=G.coins[c];var bob=Math.sin(Date.now()/150+k.y)*5;
    cx.fillStyle='#ffd23f';cx.beginPath();cx.arc(k.x,k.y+bob,11,0,7);cx.fill();
    cx.fillStyle='#fff3b0';cx.beginPath();cx.arc(k.x-3,k.y+bob-3,4,0,7);cx.fill();
  }
  /* hantu dash */
  for(var g2=0;g2<ghosts.length;g2++){
    var gh=ghosts[g2];cx.globalAlpha=Math.max(0,gh.t/0.3)*0.6;
    cx.fillStyle=gh.col||'#c084fc';cx.beginPath();cx.arc(gh.x,gh.y,gh.s||14,0,7);cx.fill();
  }
  cx.globalAlpha=1;
  /* ninja */
  if(G){
    var blink=G.inv>0&&Math.floor(Date.now()/90)%2===0;
    if(!blink){
      cx.save();cx.translate(G.nx,G.ny);
      cx.fillStyle='#00000055';cx.beginPath();cx.ellipse(0,22,16,5,0,0,7);cx.fill();
      cx.fillStyle='#251840';cx.beginPath();cx.arc(0,0,17,0,7);cx.fill();
      cx.fillStyle='#7c3aed';cx.beginPath();cx.arc(0,0,13,0,7);cx.fill();
      /* mata ninja */
      cx.fillStyle='#ffd23f';
      cx.beginPath();cx.moveTo(-10,-2);cx.lineTo(-2,-5);cx.lineTo(-2,2);cx.closePath();cx.fill();
      cx.beginPath();cx.moveTo(10,-2);cx.lineTo(2,-5);cx.lineTo(2,2);cx.closePath();cx.fill();
      /* syal */
      var wv=Math.sin(Date.now()/120)*6;
      cx.fillStyle='#c084fc';
      cx.beginPath();cx.moveTo(-12,-4);cx.quadraticCurveTo(-30,-8+wv,-40,4+wv);cx.quadraticCurveTo(-28,8+wv,-12,6);cx.fill();
      cx.restore();
    }
  }
}
function loop(ts){
  var dt=Math.min(0.045,(ts-t0)/1000||0.016);t0=ts;
  for(var g3=ghosts.length-1;g3>=0;g3--){var q=ghosts[g3];q.t-=dt;if(q.vx){q.x+=q.vx*dt;q.y+=q.vy*dt}if(q.t<=0)ghosts.splice(g3,1)}
  if(G&&!G.dead&&started)step(dt);
  draw();
  if(G&&started&&!G.dead)document.getElementById('stx').textContent='Lari '+Math.round(G.dist)+'m · dash '+(G.charging?'mengisi…':'SIAP');
  requestAnimationFrame(loop);
}
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;ghosts=[];document.getElementById('ovStart').classList.add('hide');document.getElementById('ovEnd').classList.add('hide');document.getElementById('cLife').textContent='♥♥♥';SFX.start();toast('TAP UNTUK DASH!')});
document.getElementById('bAgain').addEventListener('click',function(){ensureAC();reset();ghosts=[];document.getElementById('ovEnd').classList.add('hide');document.getElementById('cLife').textContent='♥♥♥';SFX.start()});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('nano-ninja-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
cv.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();dashTo(e.clientX,e.clientY)},{passive:false});
document.getElementById('cBest').textContent=best;
fit();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '⚡', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Nano Ai Ninja Dash ⚡', 'nano-ai-ninjadash-2026', html)
}

async function sendRich(conn, chat, title, rid, htmlPayload) {
  const payload = {
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
  }
  await conn.relayMessage(chat, payload, {})
}

handler.help = ['ninjadash', 'n dash', 'dashninja']
handler.tags = ['game']
handler.command = /^(ninjadash|ndash|dashninja)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Ninja Dash - tap untuk teleport dash melewati dinding, hindari paku & laser'

export default handler
