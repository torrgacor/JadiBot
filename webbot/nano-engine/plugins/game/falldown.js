/*
⌬ Nano Ai · Game Plugin · Fall Down 🪂
*/

'use strict'

/* ==========================================================================
   Nano Ai · Fall Down 🪂
   Kamu jatuh terus. Gerakkan kiri/kanan agar lolos lewat CELAH platform.
   Plafon duri mengejar dari atas — tersentuh = mati. Koin bonus di celah.
   Makin dalam = makin cepat. Kedalaman terbaik tersimpan.
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#23142e">
<title>Nano Ai Fall Down</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#150c1d;color:#f3e9ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#2c1a3d,#1a0f26);border:1px solid #553578;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#ce93d8,#7b1fa2);font-size:20px;box-shadow:0 3px 0 #3d0f52,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#c39ee0;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px}
.hb{width:34px;height:34px;border:1px solid #6a4494;border-radius:10px;background:linear-gradient(180deg,#37224e,#241436);color:#f0e2ff;font-size:15px;box-shadow:0 3px 0 #10081a}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #10081a}
.bar{display:flex;align-items:center;gap:6px;background:#221434;border:1px solid #553578;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#e3c9fa;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#180e26;border:1px solid #553578;color:#c39ee0;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #553578;border-radius:14px;overflow:hidden;background:#120a1c}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#180e26e6;border:1px solid #6a4494;color:#f0e2ff;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#0d0616e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #6a4494;border-radius:16px;background:linear-gradient(180deg,#2c1a3d,#180e26);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#e3c9fa;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#c39ee0;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #e3c9fa;border-radius:12px;background:linear-gradient(180deg,#ce93d8,#7b1fa2);color:#2a0a3a;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #451064}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #451064}
.ctrls{display:flex;gap:8px;margin-top:8px}
.pedal{flex:1;min-height:56px;border:1px solid #553578;border-radius:14px;background:linear-gradient(180deg,#37224e,#241436);color:#f0e2ff;font:950 16px system-ui;box-shadow:0 4px 0 #10081a;touch-action:none}
.pedal:active,.pedal.on{transform:translateY(2px);box-shadow:0 1px 0 #10081a;background:linear-gradient(180deg,#4c3168,#37224e)}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🪂</div>
        <div>
          <div class="title">FALL DOWN</div>
          <div class="sub">jatuh lewat celah · plafon mengejar!</div>
        </div>
      </div>
      <div class="hbtns"><button class="hb" id="bSound">🔊</button></div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Siap menyelam ke jurang?</div>
      <div class="chip">📉 <b id="cDepth">0</b> m</div>
      <div class="chip">🏆 <b id="cBest">0</b> m</div>
      <div class="chip">🪙 <b id="cCoin">0</b></div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">🪂 FALL DOWN</div>
          <div class="small">Kamu jatuh tanpa henti.<br><b style="color:#e3c9fa">◀ ▶</b> geser antar celah platform.<br><b style="color:#ff8a7a">Plafon duri</b> mengejar dari atas — jangan tersentuh!<br>🪙 koin di celah · makin dalam makin cepat!</div>
          <button class="gbtn" id="bPlay">▶ MULAI JATUH</button>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">TERTANGKAP!</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bAgain">↻ JATUH LAGI</button>
        </div>
      </div>
    </div>
    <div class="ctrls">
      <button class="pedal" id="pL">◀</button>
      <button class="pedal" id="pR">▶</button>
    </div>
  </div>
</div>
<script>
(function(){
var DW=800,DH=600,PLAT_H=22,SPACING=110;
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var best=parseInt(stGet('nano-fall-best')||'0')||0;
var sOn=stGet('nano-fall-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={pass:function(){tone(500,0.06,'sine',0.07,140)},coin:function(){tone(950,0.07,'sine',0.1,260)},hit:function(){tone(130,0.35,'sawtooth',0.2,-70)},start:function(){tone(392,0.1,'triangle',0.1);setTimeout(function(){tone(523,0.14,'triangle',0.12)},110)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1400)}
function rnd(a,b){return a+Math.random()*(b-a)}
var G=null,started=false,t0=0,caveCache=null;
function makePlat(y,idx){
  var gap=Math.max(120,210-idx*2.4);
  var gx=rnd(60,DW-60-gap);
  var plat=[];
  /* platform dua sisi dgn celah di tengah */
  if(gx>30)plat.push({x:0,w:gx});
  if(gx+gap<DW-30)plat.push({x:gx+gap,w:DW-(gx+gap)});
  var coin=(idx>2&&Math.random()<0.4)?{x:gx+gap/2,y:y+PLAT_H+26}:null;
  return {y:y,gapX:gx,gapW:gap,parts:plat,coin:coin,coinGot:false,idx:idx};
}
function reset(){
  G={x:DW/2,y:120,px:DW/2,vy:0,fall:0,depth:0,coin:0,dead:false,
     plats:[],topY:0,camY:0,dir:0,t:0,passed:0,wobble:0};
  /* platform pertama rapat di bawah pemain */
  for(var i=0;i<8;i++)G.plats.push(makePlat(180+i*SPACING,i));
  G.plats[0]={y:180,gapX:DW/2-110,gapW:220,parts:[{x:0,w:DW/2-110},{x:DW/2+110,w:DW/2-110}],coin:null,coinGot:false,idx:0};
  G.plats[1]={y:290,gapX:DW/2-110,gapW:220,parts:[{x:0,w:DW/2-110},{x:DW/2+110,w:DW/2-110}],coin:null,coinGot:false,idx:1};
  G.topY=180;
}
function step(dt){
  if(!G||G.dead)return;
  G.t+=dt;
  var depth=Math.max(0,Math.round((G.y-120)/50));
  G.depth=depth;
  var spd=230+Math.min(320,depth*2.2);
  /* jatuh */
  G.vy=Math.min(spd,G.vy+900*dt);
  G.y+=G.vy*dt;
  /* geser kiri/kanan */
  var vx=G.dir*330;
  G.px+=vx*dt;
  G.px=Math.max(18,Math.min(DW-18,G.px));
  /* generasi platform di bawah */
  var lastP=G.plats[G.plats.length-1];
  while(lastP.y<G.y+DH){
    var np=makePlat(lastP.y+SPACING,lastP.idx+1);
    G.plats.push(np);lastP=np;
  }
  /* buang platform di atas jauh */
  while(G.plats.length&&G.plats[0].y<G.y-DH)G.plats.shift();
  /* cek menembus platform: kalau pemain melintasi garis platform di luar celah → berhenti di atasnya */
  for(var i=0;i<G.plats.length;i++){
    var p=G.plats[i];
    var py=p.y+PLAT_H/2;
    var crossed=G._py!==undefined&&G._py<=py&&G.y>=py;
    if(crossed){
      var insideGap=G.px>p.gapX&&G.px<p.gapX+p.gapW;
      if(!insideGap){
        G.y=py-PLAT_H/2-6;G.vy=Math.min(G.vy,60);  /* nyangkut & meluncur pelan */
      } else {
        if(!p.passed){p.passed=true;G.passed++;SFX.pass()}
        if(p.coin&&!p.coinGot&&Math.hypot(G.px-p.coin.x,G.y-p.coin.y)<40){p.coinGot=true;G.coin++;SFX.coin()}
      }
    }
  }
  G._py=G.y;
  /* plafon duri mengejar */
  G.topY+=dt*(90+depth*1.35);
  if(G.y-14<G.topY){die();return}
  document.getElementById('cDepth').textContent=depth;
  document.getElementById('cCoin').textContent=G.coin;
}
function die(){
  G.dead=true;SFX.hit();
  if(G.depth>best){best=G.depth;stSet('nano-fall-best',String(best))}
  document.getElementById('cBest').textContent=best;
  setTimeout(function(){
    document.getElementById('endInfo').innerHTML='Kedalaman: <b style="color:#e3c9fa">'+G.depth+' m</b><br>Koin: <b style="color:#ffd23f">'+G.coin+'</b><br>Terdalam: <b style="color:#ffd23f">'+best+' m</b>';
    document.getElementById('ovEnd').classList.remove('hide');
  },500);
}
function drawSpike(x,w,y,flip){
  cx.fillStyle='#ff5252';
  var n=Math.floor(w/22);
  for(var i=0;i<n;i++){
    cx.beginPath();
    if(flip){cx.moveTo(x+i*22,y+16);cx.lineTo(x+i*22+11,y-6);cx.lineTo(x+i*22+22,y+16)}
    else{cx.moveTo(x+i*22,y-16);cx.lineTo(x+i*22+11,y+6);cx.lineTo(x+i*22+22,y-16)}
    cx.closePath();cx.fill();
  }
  cx.fillStyle='#b71c1c';cx.fillRect(x,y-2,w,4);
}
function draw(){
  if(!caveCache){
    caveCache=document.createElement('canvas');caveCache.width=DW;caveCache.height=DH;
    var cc=caveCache.getContext('2d');
    var g2=cc.createLinearGradient(0,0,0,DH);
    g2.addColorStop(0,'#2a1440');g2.addColorStop(1,'#0d0518');
    cc.fillStyle=g2;cc.fillRect(0,0,DW,DH);
    cc.fillStyle='#7b1fa233';
    for(var k3=0;k3<14;k3++){
      var kx=(k3*173)%DW,ky=(k3*97)%DH;
      cc.beginPath();cc.moveTo(kx,ky);cc.lineTo(kx+9,ky-24);cc.lineTo(kx+18,ky);cc.closePath();cc.fill();
    }
  }
  cx.drawImage(caveCache,0,0,DW,DH);
  if(!G)return;
  var cam=G.y-DH*0.42;
  /* plafon duri di world-y G.topY */
  var sy=G.topY-cam;
  drawSpike(0,DW,sy,true);
  cx.fillStyle='#4a0f0f';cx.fillRect(0,sy-DW-2+0,DW,Math.max(0,sy));   /* area terkutuk di atas */
  /* platform */
  for(var i=0;i<G.plats.length;i++){
    var p=G.plats[i];
    var y=p.y-cam;
    if(y<-40||y>DH+40)continue;
    for(var j=0;j<p.parts.length;j++){
      var pt=p.parts[j];
      cx.fillStyle='#00000055';cx.fillRect(pt.x+3,y+5,pt.w,PLAT_H);
      cx.fillStyle='#5e35b1';cx.fillRect(pt.x,y,pt.w,PLAT_H);
      cx.fillStyle='#7e57c2';cx.fillRect(pt.x,y,pt.w,7);
      /* tekstur bata */
      cx.fillStyle='#00000022';
      for(var bx=pt.x+18;bx<pt.x+pt.w-6;bx+=36)cx.fillRect(bx,y+9,2,PLAT_H-12);
    }
    /* koin */
    if(p.coin&&!p.coinGot){
      var cy2=p.coin.y-cam;
      var bob=Math.sin(Date.now()/180)*4;
      cx.fillStyle='#ffd23f';cx.beginPath();cx.arc(p.coin.x,cy2+bob,10,0,7);cx.fill();
      cx.fillStyle='#fff3b0';cx.beginPath();cx.arc(p.coin.x-2,cy2+bob-2,3,0,7);cx.fill();
    }
    /* tanda celah yang sudah dilewati */
    if(p.passed){cx.fillStyle='#57e38944';cx.fillRect(p.gapX,y-4,p.gapW,4)}
  }
  /* pemain: parasut kecil */
  var px=G.px, py=G.y-cam;
  cx.fillStyle='#00000055';cx.beginPath();cx.ellipse(px,py+16,14,4,0,0,7);cx.fill();
  /* parasut */
  cx.fillStyle='#e040fb';
  cx.beginPath();cx.arc(px,py-16,20,Math.PI,0);cx.fill();
  cx.strokeStyle='#f3e5f5';cx.lineWidth=1.5;
  cx.beginPath();cx.moveTo(px-20,py-16);cx.lineTo(px-6,py-2);cx.moveTo(px+20,py-16);cx.lineTo(px+6,py-2);cx.stroke();
  /* badan */
  cx.fillStyle='#ffd7b0';cx.beginPath();cx.arc(px,py+2,7,0,7);cx.fill();
  cx.fillStyle='#9575cd';rr2(px-7,py+7,14,14,5);cx.fill();
  cx.fillStyle='#4a148c';cx.fillRect(px-6,py+19,5,5);cx.fillRect(px+1,py+19,5,5);
  cx.fillStyle='#222';cx.beginPath();cx.arc(px-2.4,py+1,1.4,0,7);cx.arc(px+2.4,py+1,1.4,0,7);cx.fill();
  /* garis kedalaman */
  cx.fillStyle='#ffffff30';cx.font='800 10px system-ui';
  var topM=Math.floor((cam+120)/50);
  for(var m=Math.max(0,topM);m<topM+15;m++){
    var my=m*50+120-cam;
    if(my>0&&my<DH){cx.fillRect(0,my,20,2);cx.fillText(m+' m',26,my-3)}
  }
}
function rr2(x,y,w,h,r){r=Math.min(r,w/2,h/2);cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function loop(ts){
  var dt=Math.min(0.04,(ts-t0)/1000||0.016);t0=ts;
  if(G&&started&&!G.dead)step(dt);
  draw();
  if(G&&started&&!G.dead)document.getElementById('stx').textContent='Dalam '+G.depth+' m · kejar celah!';
  requestAnimationFrame(loop);
}
function bindHold(id,val){
  var el=document.getElementById(id);
  el.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();if(G)G.dir=val;el.classList.add('on')},{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){el.addEventListener(ev,function(){if(G&&G.dir===val)G.dir=0;el.classList.remove('on')})});
}
bindHold('pL',-1);bindHold('pR',1);
document.addEventListener('keydown',function(e){if(!G)return;if(e.code==='ArrowLeft')G.dir=-1;if(e.code==='ArrowRight')G.dir=1});
document.addEventListener('keyup',function(e){if(!G)return;if(e.code==='ArrowLeft'&&G.dir<0)G.dir=0;if(e.code==='ArrowRight'&&G.dir>0)G.dir=0});
/* geser horizontal di kanvas juga bisa */
var dragging=false,lastX=0;
cv.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();dragging=true;lastX=e.clientX},{passive:false});
cv.addEventListener('pointermove',function(e){if(!dragging||!G)return;e.preventDefault();G.px+=(e.clientX-lastX)/cv.getBoundingClientRect().width*DW;G.px=Math.max(18,Math.min(DW-18,G.px));lastX=e.clientX},{passive:false});
['pointerup','pointercancel'].forEach(function(ev){cv.addEventListener(ev,function(){dragging=false})});
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;document.getElementById('ovStart').classList.add('hide');document.getElementById('ovEnd').classList.add('hide');SFX.start();toast('Jatuh lewat celah!')});
document.getElementById('bAgain').addEventListener('click',function(){ensureAC();reset();document.getElementById('ovEnd').classList.add('hide');SFX.start()});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('nano-fall-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
document.getElementById('cBest').textContent=best;
fit();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🪂', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Nano Ai Fall Down 🪂', 'nano-ai-falldown-2026', html)
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

handler.help = ['falldown', 'fall', 'turun']
handler.tags = ['game']
handler.command = /^(falldown|fall|turun)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Fall Down - jatuh lewat celah platform, hindari plafon duri yang mengejar'

export default handler
