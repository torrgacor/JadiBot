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

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#111314">
<title>Nano Ai Ular Rimba</title>
<style>
:root{--bg:#111314;--wood:#d4b48f;--text:#ece7de;--dim:#95a1a8;--panel:#232d32;--panel2:#1a2225;--line:#3b4b54;--green:#8fb17a;--green2:#5c8650;--red:#e56a62;--gold:#d8b77f}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{min-height:100%;background:radial-gradient(900px 500px at 50% -10%,#2e3a3e 0%,var(--bg) 68%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(10px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,540px);margin:auto}
.console{width:100%;background:linear-gradient(180deg,#303b42,#1d2529);border:1px solid #42525b;border-radius:26px;padding:12px;box-shadow:0 30px 80px #000a,inset 0 1px 0 #ffffff14}
.head{display:flex;align-items:center;justify-content:space-between;gap:10px;background:#181e21;border:1px solid #344047;border-radius:15px;padding:9px 10px;margin-bottom:9px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:10px;background:radial-gradient(120% 120% at 30% 20%,#e9c9a0,#8d6e4a);color:#241a0b;font-size:21px;font-weight:950;box-shadow:0 4px 0 #5a3f28}.brandText{min-width:0}.title{font-family:Georgia,serif;font-size:16px;font-weight:900;letter-spacing:.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.35px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chips{display:grid;grid-template-columns:repeat(2,minmax(54px,1fr));gap:6px;flex:none}.chip{min-width:54px;padding:5px 7px;text-align:center;background:#1c2225;border:1px solid #35444c;border-radius:9px}.chip b{display:block;color:var(--dim);font-size:6.5px;letter-spacing:.13em}.chip span{display:block;margin-top:2px;color:var(--wood);font-size:13px;font-weight:900;line-height:1}
.arena{position:relative;width:100%;padding:7px;border:1px solid #2f3d44;border-radius:17px;background:#11171a;box-shadow:inset 0 12px 28px #000d;overflow:hidden}.canvasWrap{position:relative;width:100%;aspect-ratio:1/1;border-radius:11px;overflow:hidden;background:#1a2225}.canvasWrap canvas{display:block;width:100%;height:100%;background:#1a2225;image-rendering:auto;touch-action:none;user-select:none}.hint{position:absolute;left:9px;right:9px;top:9px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}.badge{padding:5px 7px;border-radius:999px;background:#10181bd9;border:1px solid #ffffff12;color:#dce6e1;font-size:6.7px;font-weight:900;letter-spacing:.04em}.badge.gold{color:var(--wood)}
.overlay{position:absolute;inset:7px;border-radius:11px;display:grid;place-items:center;background:#0a0e0fcc;backdrop-filter:blur(10px);opacity:0;pointer-events:none;transition:opacity .2s ease}.overlay.show{opacity:1;pointer-events:auto}.modal{width:min(84%,320px);padding:20px 16px;text-align:center;border:1px solid #4d5e68;border-radius:16px;background:linear-gradient(180deg,#35444d,#242d32);box-shadow:0 18px 40px #0008}.modalIcon{font-size:30px;line-height:1}.modal h2{margin-top:7px;font-family:Georgia,serif;font-size:21px}.modal p{margin-top:5px;color:var(--dim);font-size:9px;line-height:1.45}.modal .miniRow{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px}.mini{padding:7px;border:1px solid #41515a;border-radius:8px;background:#1b2428}.mini b{display:block;color:var(--wood);font-size:13px}.mini span{display:block;margin-top:2px;color:var(--dim);font-size:6.4px;letter-spacing:.04em;text-transform:uppercase}
.ctrl{margin-top:9px;padding:10px;border:1px solid #3b4b54;border-radius:16px;background:linear-gradient(180deg,#28343a,#1f282d)}.ctrlTop{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.ctrlTop b{font-size:7px;letter-spacing:.13em;color:var(--dim)}.ctrlTop b:last-child{color:var(--wood)}
.actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-bottom:9px}.btn{min-height:41px;border:1px solid #53636a;border-radius:10px;background:linear-gradient(180deg,#3e4e56,#2b363c);color:var(--text);font:900 8px system-ui;letter-spacing:.04em;box-shadow:0 4px 0 #13191d,inset 0 1px 0 #ffffff1a;touch-action:manipulation;user-select:none}.btn.primary{background:linear-gradient(180deg,#9fc08b,#5c8650);border-color:#89aa78;color:#0f1a0e}.btn.active{transform:translateY(3px);box-shadow:0 1px 0 #13191d}.btn:focus-visible{outline:2px solid var(--wood);outline-offset:2px}
.dpadWrap{display:flex;justify-content:center}.dpad{position:relative;width:min(55vw,230px);height:min(55vw,230px);min-width:182px;min-height:182px;max-width:230px;max-height:230px;border-radius:50%;border:1px solid #3a4a53;background:radial-gradient(100% 100% at 50% 45%,#202a2f,#151c1f);box-shadow:inset 0 8px 20px #000b;touch-action:none}.pad{position:absolute;width:29%;height:29%;min-width:52px;min-height:52px;max-width:68px;max-height:68px;border:1px solid #5a6d79;border-radius:17px;display:grid;place-items:center;background:linear-gradient(180deg,#404f58,#28333a);color:#e3ebee;font-size:20px;font-weight:900;box-shadow:0 7px 0 #131a1e,0 12px 20px #0006,inset 0 1px 0 #ffffff1f;touch-action:manipulation;user-select:none;transition:transform .05s ease,background .05s ease}.pad.up{top:4.3%;left:50%;transform:translateX(-50%)}.pad.down{bottom:4.3%;left:50%;transform:translateX(-50%)}.pad.left{left:4.3%;top:50%;transform:translateY(-50%)}.pad.right{right:4.3%;top:50%;transform:translateY(-50%)}.pad.active{background:linear-gradient(180deg,#4a5d69,#323f47)}.pad.up.active,.pad.down.active{transform:translateX(-50%) translateY(4px) scale(.97)}.pad.left.active,.pad.right.active{transform:translateY(-50%) translateY(4px) scale(.97)}.centerDot{position:absolute;left:50%;top:50%;width:22%;height:22%;min-width:42px;min-height:42px;max-width:52px;max-height:52px;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(100% at 30% 30%,#d4b48f,#7a5a36);border:1px solid #a68660;box-shadow:0 5px 0 #4a3a27,inset 0 1px 0 #ffffff80}
.footer{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#6f7e84;font-size:6.5px}.footer span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.footer kbd{padding:2px 4px;border:1px solid #37464d;border-radius:4px;background:#131a1d;color:#97a5aa;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.console{padding:9px;border-radius:22px}.head{padding:8px;margin-bottom:7px}.logo{width:34px;height:34px;font-size:18px}.title{font-size:14px}.sub{font-size:7px}.chip{min-width:48px}.chip b{font-size:5.8px}.chip span{font-size:11px}.ctrl{padding:8px}.actions{gap:5px}.btn{min-height:38px;font-size:7px}.dpad{width:205px;height:205px}}
@media(min-width:700px){body{padding-top:20px;padding-bottom:20px}.console{padding:14px;border-radius:28px}}
</style>
</head>
<body>
<div class="app">
  <div class="console">
    <div class="head">
      <div class="brand">
        <div class="logo">S</div>
        <div class="brandText"><div class="title">ULAR RIMBA</div><div class="sub">NANO AI MINI GAME • HD</div></div>
      </div>
      <div class="chips">
        <div class="chip"><b>SKOR</b><span id="score">0</span></div>
        <div class="chip"><b>LEVEL</b><span id="level">1</span></div>
      </div>
    </div>
    <div class="arena">
      <div class="canvasWrap"><canvas id="game" width="720" height="720"></canvas>
        <div class="hint"><span class="badge" id="stateBadge">SIAP</span><span class="badge gold" id="bestBadge">BEST 0</span></div>
        <div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="modalIcon">🐍</div><h2 id="modalTitle">Ular Rimba</h2><p id="modalText">Tekan MULAI untuk berburu.</p><div class="miniRow"><div class="mini"><b id="modalScore">0</b><span>Skor</span></div><div class="mini"><b id="modalBest">0</b><span>Best</span></div></div></div></div>
      </div>
    </div>
    <div class="ctrl">
      <div class="ctrlTop"><b>◈ KONTROL</b><b>© AWANG OFFICIAL</b></div>
      <div class="actions"><button class="btn primary" id="startBtn" type="button">▶ MULAI</button><button class="btn" id="resetBtn" type="button">↻ ULANG</button><button class="btn" id="sndBtn" type="button">🔊 ON</button></div>
      <div class="dpadWrap"><div class="dpad" id="dpad"><button class="pad up" data-dir="up" type="button" aria-label="Atas">▲</button><button class="pad down" data-dir="down" type="button" aria-label="Bawah">▼</button><button class="pad left" data-dir="left" type="button" aria-label="Kiri">◀</button><button class="pad right" data-dir="right" type="button" aria-label="Kanan">▶</button><div class="centerDot"></div></div></div>
      <div class="footer"><span>Geser layar atau gunakan tombol arah</span><span><kbd>WASD</kbd> <kbd>←↑↓→</kbd> <kbd>SPACE</kbd></span></div>
    </div>
  </div>
</div>
<script>
'use strict';
(()=>{
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d',{alpha:false});
const scoreEl=document.getElementById('score'),levelEl=document.getElementById('level'),stateBadge=document.getElementById('stateBadge'),bestBadge=document.getElementById('bestBadge');
const overlay=document.getElementById('overlay'),modalIcon=document.getElementById('modalIcon'),modalTitle=document.getElementById('modalTitle'),modalText=document.getElementById('modalText'),modalScore=document.getElementById('modalScore'),modalBest=document.getElementById('modalBest');
const startBtn=document.getElementById('startBtn'),resetBtn=document.getElementById('resetBtn'),sndBtn=document.getElementById('sndBtn');
const cssW=Math.max(240,Math.round(canvas.clientWidth||(canvas.parentNode&&canvas.parentNode.clientWidth)||Math.min(360,(typeof window!=='undefined'&&window.innerWidth)||360)));
const dpr=Math.min(2,(typeof window!=='undefined'&&window.devicePixelRatio)||1);
const RES=Math.max(560,Math.min(1024,Math.round(cssW*dpr)));
canvas.width=RES;canvas.height=RES;
const GRID=20,CELL=canvas.width/GRID,BASE_SPEED=145,MIN_SPEED=78,LEVEL_SCORE=40;
const TAU=Math.PI*2,U=CELL/36,sc=v=>v*U;
let snake=[],prevSnake=[],dir={x:1,y:0},nextDir={x:1,y:0},inputQueue=[],fruit=null,score=0,best=0,running=false,paused=false,gameOver=false,speed=BASE_SPEED,accumulator=0,lastTime=0,visualAngle=0,targetAngle=0,bodyAngles=[],particles=[],tongue=0,pulse=0,swipeStart=null,trail=[],visualHead={x:10,y:10},lastTrailPoint={x:10,y:10},floaters=[],rings=[],shake=0,blink=0;
const spr=(w,h,draw)=>{const c=document.createElement('canvas');c.width=Math.max(2,Math.round(w));c.height=Math.max(2,Math.round(h));draw(c.getContext('2d'),c.width,c.height);return c};
const RW=CELL*.46*1.24,RH=CELL*.46*.95,PAD=sc(9),SPW=Math.ceil(RW*2+PAD*2),SPH=Math.ceil(RH*2+PAD*2),SCX=SPW/2,SCY=SPH/2;
const pattern=spr(sc(40),sc(20),(p,W1,H1)=>{p.strokeStyle='rgba(0,0,0,.16)';p.lineWidth=Math.max(1,sc(.7));for(let x=0;x<W1;x+=sc(10)){p.beginPath();p.moveTo(x,0);p.lineTo(x+sc(5),H1/2);p.lineTo(x+sc(10),0);p.stroke();p.beginPath();p.moveTo(x,H1/2);p.lineTo(x+sc(5),H1);p.lineTo(x+sc(10),H1/2);p.stroke()}});
const scaleTex=ctx.createPattern(pattern,'repeat');
const bodyBase=(x,cx,cy)=>{const g=x.createLinearGradient(cx-RW,cy-RH,cx+RW,cy+RH);g.addColorStop(0,'#b3d894');g.addColorStop(.4,'#5f8d48');g.addColorStop(1,'#1b2d15');x.fillStyle=g;x.beginPath();x.ellipse(cx,cy,RW,RH,0,0,TAU);x.fill();if(scaleTex){x.save();x.beginPath();x.ellipse(cx,cy,RW*.94,RH*.84,0,0,TAU);x.fillStyle=scaleTex;x.fill();x.restore()}const rim=x.createLinearGradient(0,cy-RH,0,cy+RH*.35);rim.addColorStop(0,'rgba(255,255,255,.3)');rim.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=rim;x.beginPath();x.ellipse(cx,cy-RH*.14,RW*.88,RH*.58,0,0,TAU);x.fill();x.fillStyle='rgba(236,220,166,.15)';x.beginPath();x.ellipse(cx,cy+RH*.5,RW*.68,RH*.28,0,0,TAU);x.fill();x.fillStyle='rgba(12,24,10,.28)';x.beginPath();x.ellipse(cx,cy,RW*.3,RH*.46,0,0,TAU);x.fill()};
const eyePair=(x,open)=>{const ex=SCX+RW*.32,ey=RH*.46,er=sc(4.8),ir=sc(2.9);for(const sg of [-1,1]){x.fillStyle='rgba(10,20,10,.3)';x.beginPath();x.ellipse(ex,SCY+ey*sg+sc(.9),er*1.03,er*1.03*open,0,0,TAU);x.fill();x.fillStyle=open<.5?'#17301b':'#f8fff2';x.beginPath();x.ellipse(ex,SCY+ey*sg,er,er*open,0,0,TAU);x.fill();if(open>=.5){x.fillStyle='#e2ab3e';x.beginPath();x.ellipse(ex+sc(.8),SCY+ey*sg,ir,ir*.94,0,0,TAU);x.fill();x.fillStyle='#0f180c';x.beginPath();x.ellipse(ex+sc(.8),SCY+ey*sg,ir*.48,ir*.94,0,0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.94)';x.beginPath();x.arc(ex-sc(.2),SCY+ey*sg-sc(1.2),sc(1.2),0,TAU);x.fill()}}};
const faceDraw=(x)=>{x.fillStyle='rgba(255,255,255,.12)';x.beginPath();x.ellipse(SCX+RW*.4,SCY,RH*.44,RH*.34,0,0,TAU);x.fill();x.fillStyle='rgba(12,22,10,.7)';x.beginPath();x.arc(SCX+RW*.9,SCY-RH*.18,sc(1.4),0,TAU);x.arc(SCX+RW*.9,SCY+RH*.18,sc(1.4),0,TAU);x.fill();x.lineCap='round';x.strokeStyle='rgba(20,32,16,.8)';x.lineWidth=Math.max(1,sc(1.5));x.beginPath();x.moveTo(SCX+RW*.6,SCY+RH*.12);x.quadraticCurveTo(SCX+RW*.95,SCY,SCX+RW*.6,SCY-RH*.12);x.stroke()};
const shadowDraw=(x)=>{x.fillStyle='rgba(0,0,0,.34)';x.beginPath();x.ellipse(SCX+sc(2.4),SCY+sc(7.4),RW*.99,RH*.62,0,0,TAU);x.fill()};
const segSpr=spr(SPW,SPH,(x)=>{shadowDraw(x);bodyBase(x,SCX,SCY)});
const headSpr=spr(SPW,SPH,(x)=>{shadowDraw(x);bodyBase(x,SCX,SCY);faceDraw(x);eyePair(x,1)});
const headBlink=spr(SPW,SPH,(x)=>{shadowDraw(x);bodyBase(x,SCX,SCY);faceDraw(x);eyePair(x,.14)});
const tongSpr=spr(sc(22),sc(13),(x,W1,H1)=>{x.strokeStyle='#ff3b3b';x.lineWidth=Math.max(1.4,sc(2.3));x.lineCap='round';x.beginPath();x.moveTo(0,H1/2);x.quadraticCurveTo(W1*.5,H1/2-sc(2.6),W1,H1/2-sc(3.6));x.moveTo(0,H1/2);x.quadraticCurveTo(W1*.5,H1/2+sc(2.6),W1,H1/2+sc(3.6));x.stroke()});
const glowTint={apple:'255,90,90',banana:'255,205,60',shroom:'150,235,130'},glow={};for(const k in glowTint){glow[k]=spr(sc(58),sc(58),(x,W1,H1)=>{const g=x.createRadialGradient(W1/2,H1/2,sc(2),W1/2,H1/2,W1/2);g.addColorStop(0,'rgba('+glowTint[k]+',.4)');g.addColorStop(.55,'rgba('+glowTint[k]+',.15)');g.addColorStop(1,'rgba('+glowTint[k]+',0)');x.fillStyle=g;x.fillRect(0,0,W1,H1)})}
const roundSpr=(c1,c2,c3)=>(x,w2,h2)=>{x.save();x.translate(w2/2,h2/2-sc(2));x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.ellipse(sc(2),sc(11),sc(10.5),sc(4.4),0,0,TAU);x.fill();const g=x.createRadialGradient(-sc(4),-sc(7),sc(2),0,-sc(2.6),sc(15));g.addColorStop(0,c1);g.addColorStop(.48,c2);g.addColorStop(1,c3);x.fillStyle=g;x.beginPath();x.arc(0,-sc(2.6),sc(12),0,TAU);x.fill();x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(-sc(4.2),-sc(6.4),sc(4.1),sc(2.4),-.6,0,TAU);x.fill();x.restore()};
const fruitSpr={};
fruitSpr.apple=spr(sc(34),sc(38),(x,w2,h2)=>{roundSpr('#ffc9c9','#e5382f','#7c1212')(x,w2,h2);x.save();x.translate(w2/2,h2/2-sc(2));x.fillStyle='rgba(232,222,190,.9)';x.beginPath();x.ellipse(0,sc(7),sc(5),sc(5.4),0,0,TAU);x.fill();x.strokeStyle='#4a2f16';x.lineWidth=sc(1.8);x.lineCap='round';x.beginPath();x.moveTo(0,-sc(13.4));x.quadraticCurveTo(sc(1),-sc(17.4),sc(3),-sc(18.4));x.stroke();const lg=x.createLinearGradient(sc(1),-sc(19),sc(9),-sc(13));lg.addColorStop(0,'#93e26d');lg.addColorStop(1,'#2f7a2c');x.fillStyle=lg;x.beginPath();x.moveTo(sc(2),-sc(16.6));x.quadraticCurveTo(sc(8),-sc(20.4),sc(10.2),-sc(14.6));x.quadraticCurveTo(sc(5.2),-sc(13.4),sc(2),-sc(16.6));x.fill();x.restore()});
fruitSpr.banana=spr(sc(38),sc(32),(x,w2,h2)=>{x.save();x.translate(w2/2,h2/2-sc(2));x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.ellipse(0,sc(9),sc(13),sc(4.2),0,0,TAU);x.fill();const g=x.createRadialGradient(-sc(5),-sc(5),sc(2),0,0,sc(18));g.addColorStop(0,'#fff7b6');g.addColorStop(.5,'#f1c219');g.addColorStop(1,'#9d6f00');x.fillStyle=g;x.beginPath();x.ellipse(0,0,sc(14),sc(8.4),-.34,0,TAU);x.fill();x.strokeStyle='rgba(255,255,255,.42)';x.lineWidth=sc(1.1);x.beginPath();x.ellipse(0,-sc(1.2),sc(10),sc(4.6),-.34,Math.PI*.2,Math.PI*.92);x.stroke();x.fillStyle='#6a5200';x.beginPath();x.arc(sc(13),sc(4.4),sc(1.5),0,TAU);x.fill();x.restore()});
fruitSpr.shroom=spr(sc(30),sc(38),(x,w2,h2)=>{x.save();x.translate(w2/2,h2/2-sc(2));x.fillStyle='rgba(0,0,0,.4)';x.beginPath();x.ellipse(sc(1),sc(11),sc(9),sc(4),0,0,TAU);x.fill();x.fillStyle='rgba(232,222,190,.95)';x.beginPath();x.ellipse(0,sc(6),sc(5.4),sc(6),0,0,TAU);x.fill();const g=x.createRadialGradient(-sc(4),-sc(7),sc(2),0,-sc(2.6),sc(15));g.addColorStop(0,'#d9f3c4');g.addColorStop(.5,'#7fae5c');g.addColorStop(1,'#2a4520');x.fillStyle=g;x.beginPath();x.arc(0,-sc(2.6),sc(12),0,TAU);x.fill();x.fillStyle='rgba(228,247,208,.78)';for(const sp of [[-sc(4),-sc(8),sc(2.4)],[sc(3.6),-sc(7),sc(1.9)],[sc(.6),-sc(11.4),sc(2.2)],[-sc(5.4),-sc(2.4),sc(1.8)],[sc(4.4),-sc(2.6),sc(1.7)]]){x.beginPath();x.arc(sp[0],sp[1],sp[2],0,TAU);x.fill()}x.restore()});
const spark=spr(sc(26),sc(26),(x,W1,H1)=>{const g=x.createRadialGradient(W1/2,H1/2,0,W1/2,H1/2,W1/2);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.34,'rgba(255,255,255,.42)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,W1,H1)});
const tile=spr(CELL*2,CELL*2,(b,W1,H1)=>{b.fillStyle='#19251d';b.fillRect(0,0,W1,H1);b.fillStyle='rgba(255,255,255,.022)';b.fillRect(0,0,CELL,CELL);b.fillRect(CELL,CELL,CELL,CELL);b.fillStyle='rgba(0,0,0,.16)';b.fillRect(CELL,0,CELL,CELL);b.fillRect(0,CELL,CELL,CELL);b.strokeStyle='rgba(196,232,176,.05)';b.lineWidth=Math.max(1,sc(.7));b.beginPath();b.moveTo(CELL,0);b.lineTo(CELL,H1);b.moveTo(0,CELL);b.lineTo(W1,CELL);b.stroke();let sd=987654321;const rn=()=>((sd=(sd*1103515245+12345)&0x7fffffff)/0x7fffffff);for(let i=0;i<26;i++){const gx=rn()*W1,gy=rn()*H1,len=sc(3+rn()*7),tilt=(rn()-.5)*sc(3);b.strokeStyle='rgba('+(110+rn()*70|0)+','+(160+rn()*64|0)+','+(98+rn()*52|0)+','+(.05+rn()*.09).toFixed(3)+')';b.lineWidth=Math.max(1,sc(.75));b.beginPath();b.moveTo(gx,gy);b.quadraticCurveTo(gx+tilt,gy-len/2,gx+tilt*1.7,gy-len);b.stroke()}});
const boardTex=ctx.createPattern(tile,'repeat');
const vign=spr(200,200,(v,W1,H1)=>{const g=v.createRadialGradient(W1/2,H1/2,W1*.17,W1/2,H1/2,W1*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,'rgba(0,0,0,.26)');g.addColorStop(1,'rgba(0,0,0,.6)');v.fillStyle=g;v.fillRect(0,0,W1,H1)});
try{best=Number(localStorage.getItem('nano_ai_snake_best')||0)||0}catch{}
let AC=null,sndOn=true;
function ensureAudio(){try{if(!AC){const C=(typeof window!=='undefined')&&(window.AudioContext||window.webkitAudioContext);if(C)AC=new C()}if(AC&&AC.state==='suspended')AC.resume()}catch{}}
function beep(f1,f2,dur,vol,type){if(!sndOn||!AC)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f1,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.05,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.03)}catch{}}
function cloneSnake(a){return a.map(s=>({x:s.x,y:s.y}))}
function safeBestSave(){try{localStorage.setItem('nano_ai_snake_best',String(best))}catch{}}
function wrapDelta(d){if(d>GRID/2)return d-GRID;if(d<-GRID/2)return d+GRID;return d}
function normalizeCoord(v){return((v%GRID)+GRID)%GRID}
function spawnFruit(){let f,guard=0;do{f={x:Math.floor(Math.random()*GRID),y:Math.floor(Math.random()*GRID),type:Math.random()<.7?(Math.random()<.6?'apple':'banana'):'shroom'};guard++}while(snake.some(s=>s.x===f.x&&s.y===f.y)&&guard<500);return f}
function updateUi(){scoreEl.textContent=score;levelEl.textContent=Math.floor(score/LEVEL_SCORE)+1;bestBadge.textContent='BEST '+best;stateBadge.textContent=gameOver?'K.O':paused?'JEDA':running?'BERBURU':'SIAP';startBtn.textContent=gameOver?'▶ MULAI':paused?'▶ LANJUT':running?'Ⅱ JEDA':'▶ MULAI';modalScore.textContent=score;modalBest.textContent=best}
function show(title,text,icon='🐍'){modalIcon.textContent=icon;modalTitle.textContent=title;modalText.textContent=text;modalScore.textContent=score;modalBest.textContent=best;overlay.classList.add('show');updateUi()}
function hide(){overlay.classList.remove('show')}
function reset(){snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}];prevSnake=cloneSnake(snake);dir={x:1,y:0};nextDir={x:1,y:0};inputQueue=[];fruit=spawnFruit();score=0;speed=BASE_SPEED;accumulator=0;running=false;paused=false;gameOver=false;visualAngle=0;targetAngle=0;bodyAngles=[0,0,0];particles=[];floaters=[];rings=[];shake=0;blink=0;tongue=0;visualHead={x:10,y:10};trail=[{x:10,y:10},{x:9.2,y:10},{x:8.4,y:10},{x:7.6,y:10}];lastTrailPoint={x:10,y:10};hide();updateUi();draw(0)}
function start(){if(gameOver){reset()}if(running)return;paused=false;running=true;hide();lastTime=performance.now();accumulator=0;updateUi()}
function togglePause(){if(gameOver){reset();start();return}if(!running){start();return}paused=!paused;if(!paused){lastTime=performance.now();accumulator=0;hide()}else show('Jeda','Tekan LANJUT untuk kembali berburu.','⏸️');updateUi()}
function endGame(){if(gameOver)return;gameOver=true;running=false;paused=false;shake=26;beep(320,70,.42,.07,'triangle');beep(160,60,.5,.05,'sawtooth');try{if(typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate([40,50,90])}catch{}explode(snake[0].x*CELL+CELL/2,snake[0].y*CELL+CELL/2);if(score>best){best=score;safeBestSave()}stateBadge.textContent='K.O';show('Ular Tumbang','Skor '+score+' • Best '+best+' • Tekan ULANG.','💥')}
function setDirection(x,y){const last=inputQueue.length?inputQueue[inputQueue.length-1]:nextDir;if(last.x===-x&&last.y===-y)return;if(last.x===x&&last.y===y)return;if(inputQueue.length<4)inputQueue.push({x,y});targetAngle=Math.atan2(y,x);if(!running&&!gameOver)start()}
function logicTick(){prevSnake=cloneSnake(snake);if(inputQueue.length){nextDir=inputQueue.shift()}dir=nextDir;targetAngle=Math.atan2(dir.y,dir.x);let h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0)h.x=GRID-1;if(h.x>=GRID)h.x=0;if(h.y<0)h.y=GRID-1;if(h.y>=GRID)h.y=0;const tailCanMove=h.x===snake[snake.length-1]?.x&&h.y===snake[snake.length-1]?.y;const bodyHit=snake.some((s,i)=>i<snake.length-1&&!tailCanMove&&s.x===h.x&&s.y===h.y)||snake.slice(0,-1).some(s=>s.x===h.x&&s.y===h.y);if(bodyHit){endGame();return}snake.unshift(h);bodyAngles.unshift(targetAngle);if(h.x===fruit.x&&h.y===fruit.y){const gain=fruit.type==='apple'?10:fruit.type==='banana'?20:50;score+=gain;tongue=10;beep(fruit.type==='shroom'?320:fruit.type==='banana'?820:660,fruit.type==='shroom'?880:fruit.type==='banana'?1240:990,.14,.05);const kx=h.x*CELL+CELL/2,ky=h.y*CELL+CELL/2;burst(kx,ky,fruit.type);popScore(kx,ky,gain,fruit.type);addRing(kx,ky,fruit.type);fruit=spawnFruit();speed=Math.max(MIN_SPEED,BASE_SPEED-Math.floor(score/50)*4);if(score>best){best=score;safeBestSave()}}else{snake.pop();bodyAngles.pop()}updateUi()}
function burst(x,y,type){const n=type==='shroom'?18:14;for(let i=0;i<n;i++){const a=Math.random()*TAU,v=sc(1.2)+Math.random()*sc(3.4);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sc(1.2),life:22+Math.random()*14,max:36,type,size:sc(2.2+Math.random()*2.6)})}try{if(typeof navigator!=='undefined'&&navigator.vibrate)navigator.vibrate(type==='shroom'?26:14)}catch{}}
function addRing(x,y,type){rings.push({x,y,r:sc(5),life:22,max:22,color:type==='apple'?'rgba(255,140,140,':type==='banana'?'rgba(255,224,120,':'rgba(172,240,150,'})}
function popScore(x,y,gain,type){floaters.push({x,y,text:'+'+gain,life:38,max:38,color:type==='apple'?'#ffa8a8':type==='banana'?'#ffe28a':'#bcf2a4'})}
function explode(x,y){for(let i=0;i<34;i++){const a=Math.random()*TAU,v=sc(1.6)+Math.random()*sc(6.4);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-sc(1.8),life:26+Math.random()*20,max:46,type:'ko',size:sc(2.4+Math.random()*3.4)})}}
function unwrapTarget(prev,curr){let d=curr-prev;if(d>GRID/2)curr-=GRID;if(d<-GRID/2)curr+=GRID;return curr}
function trailPointAt(distance){if(!trail.length)return{x:visualHead.x,y:visualHead.y};let remain=distance;for(let i=0;i<trail.length-1;i++){const a=trail[i],b=trail[i+1];const dx=wrapDelta(b.x-a.x),dy=wrapDelta(b.y-a.y);const len=Math.hypot(dx,dy);if(len<=0)continue;if(remain<=len){const q=remain/len;return{x:normalizeCoord(a.x+dx*q),y:normalizeCoord(a.y+dy*q)}}remain-=len}const z=trail[trail.length-1];return{x:normalizeCoord(z.x),y:normalizeCoord(z.y)}}
function drawWrappedSegment(x,y,r,i,angle,alpha=1){const cx=x*CELL+CELL/2,cy=y*CELL+CELL/2,canvasSize=canvas.width,extent=r*1.45+2,wrapPx=GRID*CELL;for(let ox=-1;ox<=1;ox++){for(let oy=-1;oy<=1;oy++){const px=cx+ox*wrapPx,py=cy+oy*wrapPx;if(px+extent<0||px-extent>canvasSize||py+extent<0||py-extent>canvasSize)continue;snakeDraw(px,py,r,i,angle,alpha)}}}
function angleBetween(a,b,fallback=0){const dx=wrapDelta(b.x-a.x),dy=wrapDelta(b.y-a.y);return Math.hypot(dx,dy)>.001?Math.atan2(dy,dx):fallback}
function snakeDraw(x,y,r,i,angle,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);if(i===0){if(tongue>0){const tl=1+.22*Math.sin(pulse/70);ctx.drawImage(tongSpr,RW*.85,-tongSpr.height/2,tongSpr.width*tl,tongSpr.height)}ctx.drawImage(blink>0?headBlink:headSpr,-SPW/2,-SPH/2)}else{const tp=Math.max(.5,1-(i/Math.max(10,snake.length))*.5),wS=SPW*tp,hS=SPH*tp;ctx.drawImage(segSpr,-wS/2,-hS/2,wS,hS)}ctx.restore()}
function drawFruit(){const fx=fruit.x*CELL+CELL/2,fy=fruit.y*CELL+CELL/2,p=.9+Math.sin(pulse/260)*.07,gf=glow[fruit.type]||glow.apple,ff=fruitSpr[fruit.type]||fruitSpr.apple;ctx.save();ctx.translate(fx,fy);ctx.scale(p,p);ctx.drawImage(gf,-gf.width/2,-gf.height/2);ctx.drawImage(ff,-ff.width/2,-ff.height/2);ctx.restore()}
function draw(t){ctx.fillStyle='#0e1611';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.save();if(shake>0){const sk=shake*(.3+Math.random()*.7);ctx.translate((Math.random()-.5)*sk,(Math.random()-.5)*sk)}if(boardTex){ctx.fillStyle=boardTex;ctx.fillRect(0,0,canvas.width,canvas.height)}ctx.drawImage(vign,0,0,canvas.width,canvas.height);for(const ring of rings){ring.r+=sc(.95);ring.life-=1;ctx.globalAlpha=Math.max(0,ring.life/ring.max)*.55;ctx.strokeStyle=ring.color+'1)';ctx.lineWidth=sc(2.4);ctx.beginPath();ctx.arc(ring.x,ring.y,ring.r,0,TAU);ctx.stroke()}ctx.globalAlpha=1;rings=rings.filter(rg=>rg.life>0);drawFruit();const headPrev=prevSnake[0]||snake[0];const headCurr=snake[0];let tx=unwrapTarget(headPrev.x,headCurr.x),ty=unwrapTarget(headPrev.y,headCurr.y);visualHead={x:normalizeCoord(headPrev.x+(tx-headPrev.x)*t),y:normalizeCoord(headPrev.y+(ty-headPrev.y)*t)};if(Math.hypot(wrapDelta(visualHead.x-lastTrailPoint.x),wrapDelta(visualHead.y-lastTrailPoint.y))>=.035){trail.unshift({x:visualHead.x,y:visualHead.y});lastTrailPoint={x:visualHead.x,y:visualHead.y}}const maxTrail=Math.max(24,Math.ceil(snake.length*CELL*.92/.6)+12);if(trail.length>maxTrail)trail.length=maxTrail;for(let i=snake.length-1;i>=0;i--){const p=trailPointAt(i*.92);const q=trailPointAt(Math.max(0,i*.92-.55));const ang=i===0?visualAngle:angleBetween(p,q,bodyAngles[i]??visualAngle);drawWrappedSegment(p.x,p.y,CELL*.46,i,ang,1)}if(isFinite(t)){ctx.globalCompositeOperation='lighter';for(const p of particles){p.x+=p.vx;p.y+=p.vy;p.vy+=sc(.14);p.life-=1;const pa=Math.max(0,p.life/p.max);ctx.globalAlpha=pa;ctx.fillStyle=p.type==='apple'?'#ff8a8a':p.type==='banana'?'#ffd868':p.type==='ko'?'#ff6a5c':'#a6e58a';ctx.beginPath();ctx.arc(p.x,p.y,p.size||sc(3.6),0,TAU);ctx.fill();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=pa*.8;ctx.drawImage(spark,p.x-spark.width/2,p.y-spark.height/2);ctx.globalAlpha=1}ctx.globalCompositeOperation='source-over'}particles=particles.filter(p=>p.life>0);ctx.textAlign='center';ctx.font='900 '+Math.round(sc(17))+'px system-ui,sans-serif';for(const fl of floaters){fl.y-=sc(.5);fl.life-=1;const fa=Math.max(0,fl.life/fl.max);ctx.globalAlpha=fa;ctx.lineWidth=sc(3.4);ctx.strokeStyle='rgba(6,12,8,.85)';ctx.strokeText(fl.text,fl.x,fl.y);ctx.fillStyle=fl.color;ctx.fillText(fl.text,fl.x,fl.y);ctx.globalAlpha=1}floaters=floaters.filter(fl=>fl.life>0);ctx.restore();if(tongue>0&&running)tongue--}
function frame(now){requestAnimationFrame(frame);if(!lastTime)lastTime=now;const dt=Math.min(40,Math.max(0,now-lastTime));lastTime=now;pulse=now;if(shake>0)shake=Math.max(0,shake-dt*.085);if(blink>0)blink-=dt;else if(running&&!paused&&!gameOver&&Math.random()<.01)blink=150;if(running&&!paused&&!gameOver){accumulator+=dt;while(accumulator>=speed){logicTick();accumulator-=speed;if(gameOver)break}let d=targetAngle-visualAngle;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;const turnEase=1-Math.exp(-dt*.032);visualAngle+=d*turnEase;for(let i=1;i<bodyAngles.length;i++){let q=bodyAngles[i-1]-bodyAngles[i];while(q>Math.PI)q-=Math.PI*2;while(q<-Math.PI)q+=Math.PI*2;bodyAngles[i]+=q*(1-Math.exp(-dt*.028))}}draw(running&&!paused&&!gameOver?Math.min(1,accumulator/speed):0)}
function bind(){startBtn.addEventListener('pointerdown',e=>{e.preventDefault();ensureAudio();togglePause()},{passive:false});resetBtn.addEventListener('pointerdown',e=>{e.preventDefault();reset();show('Siap','Tekan MULAI untuk memulai.','🐍')},{passive:false});document.querySelectorAll('.pad').forEach(btn=>{const press=e=>{e.preventDefault();ensureAudio();btn.classList.add('active');const d=btn.dataset.dir;if(d==='up')setDirection(0,-1);else if(d==='down')setDirection(0,1);else if(d==='left')setDirection(-1,0);else setDirection(1,0)};const release=()=>btn.classList.remove('active');btn.addEventListener('pointerdown',press,{passive:false});btn.addEventListener('pointerup',release);btn.addEventListener('pointercancel',release);btn.addEventListener('pointerleave',release)});document.addEventListener('keydown',e=>{ensureAudio();const k=e.key.toLowerCase();if(k===' '){e.preventDefault();togglePause();return}if(k==='r'){e.preventDefault();reset();show('Siap','Tekan MULAI untuk memulai.','🐍');return}if(k==='w'||k==='arrowup')setDirection(0,-1);else if(k==='s'||k==='arrowdown')setDirection(0,1);else if(k==='a'||k==='arrowleft')setDirection(-1,0);else if(k==='d'||k==='arrowright')setDirection(1,0)},{passive:false});sndBtn.addEventListener('pointerdown',e=>{e.preventDefault();sndOn=!sndOn;sndBtn.textContent=sndOn?'🔊 ON':'🔇 OFF';ensureAudio();if(sndOn)beep(880,1320,.09,.05)});canvas.addEventListener('pointerdown',e=>{swipeStart={x:e.clientX,y:e.clientY}},{passive:true});canvas.addEventListener('pointerup',e=>{if(!swipeStart)return;const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;if(Math.abs(dx)>Math.abs(dy))setDirection(dx>0?1:-1,0);else setDirection(0,dy>0?1:-1)},{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){paused=true;show('Jeda','Game dijeda otomatis saat layar ditinggalkan.','⏸️');updateUi()}})}
reset();show('Ular Rimba','Tekan MULAI untuk berburu.','🐍');bind();requestAnimationFrame(frame);
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
.arena{border-radius:16px!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.08),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 36px rgba(0,0,0,.55)!important}
canvas{border-radius:12px;filter:saturate(1.1) contrast(1.05)}
.console,.chip{border-radius:10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.20),0 4px 10px rgba(0,0,0,.45)!important}
.dpadWrap .btn{border-radius:12px!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.22),inset 0 -3px 5px rgba(0,0,0,.42),0 4px 0 rgba(0,0,0,.45)!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🐍', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Ular Rimba 🐍',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-snake-2026',
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

handler.help = ['snake', 'ular', 'ularrimba', 'snakegame']
handler.tags = ['game']
handler.command = /^(snake|ular|ularrimba|snakegame)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Ular Rimba Nano Ai'

export default handler
