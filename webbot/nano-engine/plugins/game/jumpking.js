/*
⌬ Nano Ai · Game Plugin · Jump King Mini 🦘
*/

'use strict'

/* ==========================================================================
   Nano Ai · Jump King Mini 🦘
   Karakter MELIPAT otomatis. Kamu cuma mengatur ARAH: ◀ kiri / ▶ kanan.
   Setiap lompatan naik ke platform lebih tinggi. Makin tinggi = makin susah
   (platform lebih sempit, ada yang bergerak). Jatuh = turun jauh, tapi tidak
   mati — ini zen climb. Tinggi terbaik tersimpan.
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0e1b2e">
<title>Nano Ai Jump King Mini</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#091120;color:#e8f1ff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#152842,#0c1828);border:1px solid #2f4f78;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#4dd0e1,#00838f);font-size:20px;box-shadow:0 3px 0 #00363d,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#8fb0d1;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px}
.hb{width:34px;height:34px;border:1px solid #3d628f;border-radius:10px;background:linear-gradient(180deg,#1f3a5c,#142840);color:#dcecfc;font-size:15px;box-shadow:0 3px 0 #08111e}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #08111e}
.bar{display:flex;align-items:center;gap:6px;background:#101f34;border:1px solid #2f4f78;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#a5e1f5;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#0a1524;border:1px solid #2f4f78;color:#8fb0d1;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #2f4f78;border-radius:14px;overflow:hidden;background:#0a1626}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#0a1524e6;border:1px solid #3d628f;color:#dcecfc;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#050d18e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #3d628f;border-radius:16px;background:linear-gradient(180deg,#16293f,#0b1727);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#a5e1f5;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#8fb0d1;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #a5e1f5;border-radius:12px;background:linear-gradient(180deg,#4dd0e1,#00838f);color:#00272b;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #00464d}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #00464d}
.ctrls{display:flex;gap:8px;margin-top:8px}
.pedal{flex:1;min-height:56px;border:1px solid #2f4f78;border-radius:14px;background:linear-gradient(180deg,#1f3a5c,#142840);color:#dcecfc;font:950 16px system-ui;box-shadow:0 4px 0 #08111e;touch-action:none}
.pedal:active,.pedal.on{transform:translateY(2px);box-shadow:0 1px 0 #08111e;background:linear-gradient(180deg,#2f5a84,#1f3a5c)}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🦘</div>
        <div>
          <div class="title">JUMP KING MINI</div>
          <div class="sub">lompat otomatis · kamu pegang arah</div>
        </div>
      </div>
      <div class="hbtns"><button class="hb" id="bSound">🔊</button></div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Siap memanjat?</div>
      <div class="chip">⛰️ <b id="cHigh">0</b> m</div>
      <div class="chip">🏆 <b id="cBest">0</b> m</div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">🦘 JUMP KING MINI</div>
          <div class="small">Karakter <b>melipat otomatis</b> setiap mendarat.<br>Tugasmu cuma <b style="color:#a5e1f5">mengatur arah</b>:<br><b style="color:#a5e1f5">◀ ▶</b> tahan saat meliuk = makin jauh jarak lompatannya.<br>Naik setinggi mungkin · platform bergerak di ketinggian atas!</div>
          <button class="gbtn" id="bPlay">▶ MULAI MEMANJAT</button>
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
var DW=800,DH=600;
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var best=parseInt(stGet('nano-jump-best')||'0')||0;
var sOn=stGet('nano-jump-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={charge:function(lv){tone(200+lv*300,0.09,'triangle',0.06)},hop:function(){tone(380,0.12,'square',0.08,260)},land:function(){tone(150,0.07,'sine',0.08,-60)},fall:function(){tone(500,0.3,'sine',0.08,-380)},win:function(){tone(523,0.1,'sine',0.12);setTimeout(function(){tone(659,0.1,'sine',0.12)},100);setTimeout(function(){tone(880,0.2,'sine',0.14)},200)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1400)}
/* dunia naik tak terbatas: platform digenerate per "layar" */
var SEGW=160;            /* tinggi per segmen dunia */
var plats={};            /* idx segmen -> array platform {x,w,move} */
function segIdx(y){return Math.floor(y/SEGW)}
function genSeg(idx){
  if(plats[idx])return plats[idx];
  var arr=[],diff=Math.min(1,idx/60);
  var n=idx<3?3:(Math.random()<0.5?2:1);
  var wBase=150-diff*70;
  for(var i=0;i<n;i++){
    var w=Math.max(52,wBase*(0.65+Math.random()*0.5));
    var x=30+Math.random()*(DW-60-w);
    var move=idx>12&&Math.random()<0.35;
    arr.push({x:x,w:w,move:move,mx:26+Math.random()*40,ph:Math.random()*6.28,base:x});
  }
  plats[idx]=arr;
  return arr;
}
var G=null,started=false,t0=0;
function reset(){
  plats={};
  G={x:DW/2,y:40,vy:0,vx:0,onGround:true,charge:0,dir:0,best:0,air:0,t:0,prevY:40};
  /* platform awal memanjang */
  plats[0]=[{idx:0,x:DW/2-130,w:260,move:false,mx:0,ph:0,base:DW/2-130}];
  genSeg(1);genSeg(2);genSeg(3);
}
function step(dt){
  if(!G)return;
  G.t+=dt;
  var seg=segIdx(G.y-4);
  var list=genSeg(seg).concat(genSeg(seg+1));
  /* platform bergerak */
  for(var i=0;i<list.length;i++){
    var p=list[i];
    if(p.move)p.x=p.base+Math.sin(G.t*1.4+p.ph)*p.mx;
  }
  if(G.onGround){
    /* mengisi tenaga otomatis */
    G.charge+=dt*1.35;
    if(G.charge>=1){
      /* LIPAT! */
      var p0=findUnder(G.x,G.y);
      var power=0.55+0.45*Math.min(1,G.charge-1)/0.55;   /* penuh saat charge ~1.55 */
      power=Math.min(1,power);
      var vx=(0.35+0.65*power)*(G.dir===0?(Math.random()<0.5?-0.5:0.5):G.dir)*430*power*1.15;
      if(G.dir===0)vx=(Math.random()-0.5)*260;
      G.vx=vx;
      G.vy=-(620+430*power);
      G.onGround=false;G.charge=0;G.air=1;
      SFX.hop();
    } else {
      SFX.charge(G.charge);
      /* visual: tahan arah */
    }
  } else {
    G.vy+=1500*dt;
    G.x+=G.vx*dt;G.y+=G.vy*dt;
    G.x=Math.max(16,Math.min(DW-16,G.x));
    if(G.vy>0){
      var u=findUnder(G.x,G.y);
      if(u){
        G.y=u.y;G.vy=0;G.vx=0;G.onGround=true;G.air=0;
        var h=Math.round((40-G.y)/SEGW*10);
        if(h>G.best){G.best=h;SFX.win();toast('Rekor baru: '+h+' m!');stSet('nano-jump-best',String(G.best))}
        SFX.land();
      }
    }
    if(G.y>40+SEGW*1.2&&G.air>0){/* jatuh di bawah layar mulai */ }
  }
  /* kamera mengikuti ke atas */
  var high=Math.round((40-G.y)/SEGW*10);
  document.getElementById('cHigh').textContent=Math.max(0,high);
  document.getElementById('cBest').textContent=Math.max(best,Math.max(0,G.best));
}
function findUnder(x,y){
  var seg=segIdx(y-6);
  var list=genSeg(seg).concat(genSeg(seg+1));
  /* platform idx punya permukaan y=idx*SEGW */
  for(var k=0;k<list.length;k++){
    var r=list[k];
    var ry=r.idx*SEGW;
    if(x>=r.x&&x<=r.x+r.w&&y<=ry&&y>ry-40){return {x:x,y:ry,p:r}}
  }
  return null;
}
/* patch: tandai idx saat generate */
var _gen=genSeg;
genSeg=function(idx){
  var arr=_gen(idx);
  for(var i=0;i<arr.length;i++)arr[i].idx=idx;
  return arr;
};
function draw(){
  /* langit gradasi sesuai tinggi */
  var high=Math.max(0,Math.round((40-(G?G.y:40))/SEGW*10));
  var g=cx.createLinearGradient(0,0,0,DH);
  var t=Math.min(1,high/300);
  g.addColorStop(0,lerpCol([10,22,38],[6,10,28],t));
  g.addColorStop(1,lerpCol([24,48,72],[16,20,48],t));
  cx.fillStyle=g;cx.fillRect(0,0,DW,DH);
  /* bintang makin banyak saat tinggi */
  cx.fillStyle='#ffffffaa';
  var nstar=20+Math.min(50,high/4);
  for(var s=0;s<nstar;s++){
    var sx=(s*163)%DW,sy=(s*97)%DH;
    var tw=(Math.sin(Date.now()/400+s)*0.5+0.5);
    cx.globalAlpha=0.3+tw*0.6;
    cx.fillRect(sx,sy,2,2);
  }
  cx.globalAlpha=1;
  /* bulan */
  cx.fillStyle='#e8f1ff33';cx.beginPath();cx.arc(660,80,46,0,7);cx.fill();
  cx.fillStyle='#e8f1ffcc';cx.beginPath();cx.arc(660,80,34,0,7);cx.fill();
  if(G){
    var camY=G.y-DH*0.62;
    /* platform */
    var i0=Math.max(0,segIdx(camY)-1),i1=segIdx(camY+DH)+1;
    for(var idx=i0;idx<=i1;idx++){
      var arr=genSeg(idx);
      for(var p2=0;p2<arr.length;p2++){
        var pl=arr[p2];
        var sy=idx*SEGW-camY;
        if(sy<-20||sy>DH+20)continue;
        cx.fillStyle='#00000055';cx.fillRect(pl.x+4,sy+6,pl.w,10);
        cx.fillStyle=pl.move?'#f6a623':'#3fa7d6';
        cx.fillRect(pl.x,sy,pl.w,12);
        cx.fillStyle=pl.move?'#ffbe55':'#6cc9ef';
        cx.fillRect(pl.x,sy,pl.w,4);
        /* rumput kecil */
        cx.fillStyle='#57e38988';
        for(var gr=6;gr<pl.w-6;gr+=18)cx.fillRect(pl.x+gr,sy-4,3,4);
      }
    }
    /* garis pengukur tinggi */
    cx.fillStyle='#ffffff22';cx.font='800 10px system-ui';
    for(var m=0;m<=i1;m++){
      if(m%5)continue;
      var my=m*SEGW-camY;
      if(my>0&&my<DH){cx.fillRect(0,my,26,2);cx.fillText(m*10+' m',32,my-3)}
    }
    /* karakter */
    var kx=G.x,ky=G.y-camY;
    cx.fillStyle='#00000055';cx.beginPath();cx.ellipse(kx,G.y>40-2?ky+16:ky+16,16,5,0,0,7);cx.fill();
    /* indikator arah & tenaga saat menumpu */
    if(G.onGround&&G.charge>0.05){
      var pr=G.charge/1.55;
      cx.strokeStyle='#ffd23f';cx.lineWidth=5;
      cx.beginPath();cx.arc(kx,ky-30,26,-Math.PI/2,-Math.PI/2+pr*Math.PI*2);cx.stroke();
      if(G.dir!==0){
        var dlen=30+pr*44;
        cx.fillStyle='#ffd23f';
        cx.beginPath();cx.moveTo(kx+G.dir*dlen,ky-30);
        cx.lineTo(kx+G.dir*(dlen-14),ky-38);cx.lineTo(kx+G.dir*(dlen-14),ky-22);cx.fill();
      }
    }
    cx.save();cx.translate(kx,ky);
    /* badan */
    var squash=G.onGround?1+Math.min(0.35,G.charge*0.4):1;
    cx.scale(1/squash*0.9+0.1,squash);
    cx.fillStyle='#00838f';rr2(-14,-30,28,30,10);cx.fill();
    cx.fillStyle='#4dd0e1';rr2(-14,-30,28,14,10);cx.fill();
    /* mata */
    cx.fillStyle='#fff';
    cx.beginPath();cx.arc(-5,-20,4,0,7);cx.fill();
    cx.beginPath();cx.arc(5,-20,4,0,7);cx.fill();
    cx.fillStyle='#123';
    var look=G.dir*2.4;
    cx.beginPath();cx.arc(-5+look,-20,2,0,7);cx.fill();
    cx.beginPath();cx.arc(5+look,-20,2,0,7);cx.fill();
    /* kaki */
    if(G.onGround){
      cx.fillStyle='#006064';cx.fillRect(-12,-2,9,6);cx.fillRect(3,-2,9,6);
    } else {
      cx.fillStyle='#006064';cx.fillRect(-14,-6,8,6);cx.fillRect(6,-8,8,6);
    }
    cx.restore();
  }
}
function lerpCol(a,b,t){return 'rgb('+Math.round(a[0]+(b[0]-a[0])*t)+','+Math.round(a[1]+(b[1]-a[1])*t)+','+Math.round(a[2]+(b[2]-a[2])*t)+')'}
function rr2(x,y,w,h,r){r=Math.min(r,w/2,h/2);cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function loop(ts){
  var dt=Math.min(0.04,(ts-t0)/1000||0.016);t0=ts;
  if(G&&started)step(dt);
  draw();
  if(G&&started){
    var hi=Math.max(0,Math.round((40-G.y)/SEGW*10));
    document.getElementById('stx').textContent=G.onGround?('Menumpu tenaga… '+(G.dir===0?'tahan arah!':(G.dir<0?'◀ kiri':'kanan ▶'))):'DI UDARA!';
  }
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
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;document.getElementById('ovStart').classList.add('hide');toast('Tahan arah saat menumpu!')});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('nano-jump-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
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
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🦘', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Nano Ai Jump King Mini 🦘', 'nano-ai-jumpking-2026', html)
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

handler.help = ['jumpking', 'jumpkingmini', 'lompat']
handler.tags = ['game']
handler.command = /^(jumpking|jumpkingmini|lompat)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Jump King Mini - karakter melipat otomatis, kamu atur arah, naik setinggi mungkin'

export default handler
