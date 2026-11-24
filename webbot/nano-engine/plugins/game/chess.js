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
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Nano Ai Chess</title>
<style>
:root{--bg:#08070b;--panel:#121017;--line:rgba(255,255,255,.08);--text:#fff;--muted:#9d96a9;--pink:#ff6fae;--accent:#c86bff;--pad:clamp(13px,3.2vw,20px);--edge:calc(var(--pad) + 4px);--wood-a:#4b3222;--wood-b:#241610;--sq-l1:#f4e4c8;--sq-l2:#dcc59c;--sq-d1:#a4794f;--sq-d2:#75502f;--grain:rgba(126,92,58,.055)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:radial-gradient(circle at top,#21101c 0%,#0b080d 45%,#050407 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{min-height:100vh;padding:10px}.app{width:min(100%,760px);margin:auto}
.header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.brand{display:flex;align-items:center;gap:11px}.avatar{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff77b4,#9b4dff);font-size:23px;box-shadow:0 8px 22px rgba(255,111,174,.28)}
.title{font-size:18px;font-weight:800;letter-spacing:-.3px}.subtitle{color:var(--muted);font-size:11px;margin-top:3px}
.status{padding:7px 12px;border:1px solid rgba(255,111,174,.22);border-radius:999px;background:rgba(255,111,174,.1);color:#ffd6ea;font-size:11px;font-weight:700;white-space:nowrap}
.controls,.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.actions{grid-template-columns:repeat(3,1fr);margin-top:10px}
.select,.btn{min-height:44px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff;font-size:13px;outline:none}
.select{padding:0 12px}.btn{padding:0 12px;font-weight:700;cursor:pointer}.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(135deg,#ff5fa5,#c457ff);border:0}
.boardWrap{position:relative;width:100%;max-width:680px;margin:auto;padding:var(--edge);border-radius:24px;background:repeating-linear-gradient(97deg,rgba(255,255,255,.03) 0 2px,rgba(0,0,0,.055) 2px 4px,transparent 4px 12px),linear-gradient(172deg,var(--wood-a),var(--wood-b));border:1px solid rgba(0,0,0,.6);box-shadow:0 24px 60px rgba(0,0,0,.62),inset 0 2px 0 rgba(255,255,255,.14),inset 0 -3px 9px rgba(0,0,0,.65),0 0 60px rgba(200,107,255,.05)}
.board{position:relative;width:100%;aspect-ratio:1;display:grid;grid-template-columns:repeat(8,1fr);overflow:hidden;border-radius:5px;touch-action:none;user-select:none;box-shadow:inset 0 4px 12px rgba(0,0,0,.42),inset 0 -2px 6px rgba(0,0,0,.3),0 10px 26px rgba(0,0,0,.55)}
.board::after{content:"";position:absolute;inset:0;z-index:6;pointer-events:none;border-radius:inherit;background:linear-gradient(176deg,rgba(255,255,255,.13),transparent 40%),radial-gradient(125% 120% at 84% 112%,rgba(40,20,6,.18),transparent 62%)}
.square{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;cursor:pointer}
.square.light{background:repeating-linear-gradient(88deg,var(--grain) 0 1px,transparent 1px 9px),linear-gradient(168deg,var(--sq-l1),var(--sq-l2));box-shadow:inset -1px -1px 0 rgba(90,62,34,.07)}
.square.dark{background:repeating-linear-gradient(88deg,rgba(0,0,0,.055) 0 1px,transparent 1px 8px),linear-gradient(168deg,var(--sq-d1),var(--sq-d2));box-shadow:inset -1px -1px 0 rgba(0,0,0,.09)}
.square.last{box-shadow:inset 0 0 0 999px rgba(255,206,102,.2)}
.square.selected{box-shadow:inset 0 0 0 999px rgba(255,111,174,.18),inset 0 0 0 3px rgba(255,126,183,.95)}
.square.check{box-shadow:inset 0 0 0 999px rgba(255,52,92,.26),inset 0 0 0 3px rgba(255,72,108,.95)}
.piece{display:block;position:relative;z-index:4;stroke-width:1.6;stroke-linejoin:round;filter:drop-shadow(1.5px 2.2px 0 var(--edge1)) drop-shadow(2.4px 3.4px 0 var(--edge2)) drop-shadow(0 8px 10px rgba(28,14,4,.22));transition:transform .12s ease}
.piece.w{fill:url(#gIv);stroke:rgba(103,79,47,.6);--sheen:rgba(255,255,255,.62);--detail:rgba(140,114,77,.5);--sh:#3a2b16;--edge1:rgba(143,123,88,.95);--edge2:rgba(88,71,44,.6)}
.piece.b{fill:url(#gEb);stroke:rgba(6,6,10,.75);--sheen:rgba(255,255,255,.2);--detail:rgba(176,186,204,.42);--sh:#100c07;--edge1:rgba(14,15,20,.95);--edge2:rgba(3,4,7,.7)}
.square .piece{width:86%;height:86%}
.square.selected .piece{transform:translateY(-2px);filter:drop-shadow(1.5px 2.2px 0 var(--edge1)) drop-shadow(2.4px 3.4px 0 var(--edge2)) drop-shadow(0 10px 13px rgba(28,14,4,.34))}
.moveDot{position:absolute;width:26%;height:26%;border-radius:50%;background:radial-gradient(circle at 34% 28%,#ffc2de,#ff6fae 62%,#e1559b);box-shadow:0 2px 8px rgba(255,111,174,.45);z-index:2}
.captureRing{position:absolute;inset:6%;border-radius:50%;border:4px solid rgba(255,111,174,.85);box-shadow:0 0 12px rgba(255,111,174,.35),inset 0 0 12px rgba(255,111,174,.22);z-index:2}
.frameFiles,.frameRanks{position:absolute;display:grid;place-items:center;pointer-events:none;font-size:9.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:rgba(244,230,203,.62)}
.frameFiles{left:var(--edge);right:var(--edge);bottom:2px;height:10px;grid-template-columns:repeat(8,1fr)}
.frameRanks{top:var(--edge);bottom:var(--edge);left:3px;width:9px;grid-template-rows:repeat(8,1fr)}
.info{display:grid;grid-template-columns:repeat(3,1fr);margin-top:10px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);overflow:hidden}
.card{padding:12px 8px;text-align:center;border-left:1px solid var(--line)}.card:first-child{border-left:0}
.card b{display:block;font-size:16px;font-weight:800;letter-spacing:-.2px}.card span{display:block;margin-top:3px;color:var(--muted);font-size:9px;font-weight:700;letter-spacing:.7px;text-transform:uppercase}
.captured,.message{margin-top:10px;padding:11px 12px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.028);color:#e7e4ee}
.captured{min-height:42px;word-break:break-word;display:flex;align-items:center;flex-wrap:wrap;gap:2px 0}
.captured .piece{width:20px;height:20px;display:inline-block;filter:drop-shadow(0 1px 1px rgba(12,10,20,.35))}
.capTag{width:17px;height:17px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;margin-right:6px;flex:0 0 auto}
.capTag.w{background:#f4ead4;color:#4a3a22}.capTag.b{background:#22232a;color:#e6e0d2;box-shadow:inset 0 0 0 1px rgba(255,255,255,.16)}
.capEmpty{color:var(--muted);font-size:11px;margin-right:12px}.message{min-height:40px;background:rgba(255,111,174,.07);border-color:rgba(255,111,174,.14);text-align:center;color:#ffd5e7;font-size:12px;display:flex;align-items:center;justify-content:center}
.overlay,.promotion{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}
.overlay.show,.promotion.show{display:flex}.modal{width:min(92vw,420px);padding:23px;border-radius:23px;background:linear-gradient(145deg,#1c151e,#0f0c12);border:1px solid rgba(255,255,255,.1);box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}.modalIcon{font-size:55px}.modal h2{margin:5px 0;font-size:24px}.modal p{color:var(--muted);font-size:13px;margin-bottom:17px}
.modeButtons{display:grid;grid-template-columns:1fr 1fr;gap:9px}.modeBtn{padding:14px 10px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.045);color:#fff;cursor:pointer}.modeBtn strong{display:block;margin-bottom:3px}.modeBtn small{color:var(--muted)}
.promoBox{padding:18px;border-radius:20px;background:#171219;border:1px solid var(--line)}.promoBox h3{margin:0 0 12px;text-align:center}.promoChoices{display:flex;gap:8px}.promo{width:62px;height:62px;border:0;border-radius:14px;background:linear-gradient(145deg,#352b38,#1c1721);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 4px 10px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;cursor:pointer}
.promo .piece{width:42px;height:42px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))}
@media(max-width:430px){body{padding:7px}:root{--pad:12px}.boardWrap{border-radius:19px}.board{border-radius:9px}.card{padding:10px 4px}.title{font-size:17px}}
</style>
</head>
<body>
<div class="app">
<div class="header"><div class="brand"><div class="avatar">♟️</div><div><div class="title">Nano Ai Chess ✨</div><div class="subtitle">"Waku waku... ayo catur!" ♡</div></div></div><div class="status" id="status">White turn</div></div>
<div class="controls"><select id="mode" class="select"><option value="easy">🟢 Easy</option><option value="medium" selected>🔵 Medium</option><option value="hard">🟣 Hard</option><option value="master">🔴 Master</option><option value="pvp">👥 2 Player</option></select><button class="btn primary" id="newGame">♻️ New Game</button></div>
<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs><linearGradient id="gIv" x1=".12" y1="0" x2=".88" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".3" stop-color="#fdf7ea"/><stop offset=".62" stop-color="#f0e3c9"/><stop offset=".86" stop-color="#d9c7a3"/><stop offset="1" stop-color="#b8a27c"/></linearGradient><linearGradient id="gEb" x1=".12" y1="0" x2=".88" y2="1"><stop offset="0" stop-color="#70757f"/><stop offset=".32" stop-color="#3a3e47"/><stop offset=".66" stop-color="#1a1c23"/><stop offset="1" stop-color="#08090d"/></linearGradient><g id="pcSh" style="fill:var(--sh,#2a1a08)"><ellipse cx="50" cy="94.2" rx="36" ry="5.6" opacity=".2"/><ellipse cx="50" cy="93.7" rx="30.5" ry="4.3" opacity=".5"/><ellipse cx="50" cy="93.2" rx="21.5" ry="3" opacity=".42"/></g></defs><symbol id="pc-p" viewBox="0 0 100 100"><use href="#pcSh"/><g><circle cx="50" cy="26" r="13"/><ellipse cx="50" cy="42" rx="13" ry="4.6"/><path d="M39 42C39 58 44 66 45 77H55C56 66 61 58 61 42Z"/><path d="M35 77H65L69 87H31Z"/><rect x="27" y="87" width="46" height="6.5" rx="3.2"/></g><g stroke="none" style="fill:var(--sheen)"><ellipse cx="43.5" cy="22" rx="4.6" ry="6.6" transform="rotate(-22 43.5 22)"/><ellipse cx="44" cy="57" rx="2.6" ry="9" transform="rotate(-7 44 57)"/><rect x="33" y="88.8" width="34" height="2.6" rx="1.3"/></g></symbol><symbol id="pc-r" viewBox="0 0 100 100"><use href="#pcSh"/><g><path d="M27 16H38V25H45V16H55V25H62V16H73V36H27Z"/><path d="M33 36H67L63 45H37Z"/><path d="M37 45H63L61 76H39Z"/><path d="M33 76H67L71 87H29Z"/><rect x="26" y="87" width="48" height="6.5" rx="3.2"/></g><g stroke="none" style="fill:var(--sheen)"><rect x="29.5" y="19" width="3.6" height="14" rx="1.8"/><rect x="42" y="48" width="3.6" height="25" rx="1.8"/><rect x="32" y="88.8" width="36" height="2.6" rx="1.3"/></g><g stroke="none" opacity=".5" style="fill:var(--detail)"><rect x="40" y="52" width="20" height="1.8" rx=".9"/><rect x="40" y="60" width="20" height="1.8" rx=".9"/></g></symbol><symbol id="pc-b" viewBox="0 0 100 100"><use href="#pcSh"/><g><circle cx="50" cy="10" r="5.2"/><path d="M50 15C61 26 67 35 67 44C67 53 60 58 50 58C40 58 33 53 33 44C33 35 39 26 50 15Z"/><path d="M35 58H65L61 67H39Z"/><path d="M43 67H57L56 76H44Z"/><path d="M34 76H66L70 87H30Z"/><rect x="27" y="87" width="46" height="6.5" rx="3.2"/></g><g stroke="none" style="fill:var(--sheen)"><ellipse cx="43" cy="34" rx="3.6" ry="7.6" transform="rotate(-20 43 34)"/><rect x="33" y="88.8" width="34" height="2.6" rx="1.3"/></g><g fill="none" stroke-width="2.6" stroke-linecap="round" style="stroke:var(--detail)"><path d="M55 20L61 40"/></g></symbol><symbol id="pc-n" viewBox="0 0 100 100"><use href="#pcSh"/><g><path d="M67 74C67 56 65 46 57 38C52.5 34 50 30 48.4 23C46.7 16 43.4 10 37.7 7C35.3 12 35.3 17 30.3 20C23.8 24 21.3 32 23.8 38C26.2 43 31.1 44 32.8 48C28.7 54 26.6 62 27 74Z"/><path d="M31 74H69L73 87H27Z"/><rect x="25" y="87" width="50" height="6.5" rx="3.2"/></g><g stroke="none" opacity=".7" style="fill:var(--sheen)"><path d="M60 44C64 54 64 66 62 74H56C58 64 57 52 53 44Z"/></g><g stroke="none" style="fill:var(--sheen)"><rect x="31" y="88.8" width="38" height="2.6" rx="1.3"/></g><g fill="none" stroke-width="2" stroke-linecap="round" opacity=".75" style="stroke:var(--detail)"><path d="M58 42C54 50 53 62 53 73"/><path d="M63 46C60 54 59 64 59 73"/><path d="M25 40C29 43 33 43 36 41"/></g><g stroke="none" opacity=".8" style="fill:var(--detail)"><circle cx="42" cy="24" r="2.2"/><circle cx="26.6" cy="33" r="1.8"/></g></symbol><symbol id="pc-q" viewBox="0 0 100 100"><use href="#pcSh"/><g><circle cx="21" cy="26" r="5"/><circle cx="35.5" cy="17" r="5"/><circle cx="50" cy="12.5" r="5.6"/><circle cx="64.5" cy="17" r="5"/><circle cx="79" cy="26" r="5"/><path d="M21 28L50 15L79 28L70 52H30Z"/><path d="M30 52H70L66 61H34Z"/><path d="M36 61H64L61 76H39Z"/><path d="M33 76H67L71 87H29Z"/><rect x="27" y="87" width="46" height="6.5" rx="3.2"/></g><g stroke="none" opacity=".55" style="fill:var(--sheen)"><path d="M30 48L40 20L46 19L36 49Z"/></g><g stroke="none" style="fill:var(--sheen)"><rect x="33" y="88.8" width="34" height="2.6" rx="1.3"/></g><g stroke="none" opacity=".55" style="fill:var(--detail)"><circle cx="50" cy="40" r="3"/><circle cx="38" cy="45" r="2.2"/><circle cx="62" cy="45" r="2.2"/></g></symbol><symbol id="pc-k" viewBox="0 0 100 100"><use href="#pcSh"/><g><path d="M46.5 2H53.5V8H61V15H53.5V22H46.5V15H39V8H46.5Z"/><path d="M50 26L58 34L73 29L68 52H32L27 29L42 34Z"/><path d="M31 52H69L65 61H35Z"/><path d="M37 61H63L60 76H40Z"/><path d="M33 76H67L71 87H29Z"/><rect x="27" y="87" width="46" height="6.5" rx="3.2"/></g><g stroke="none" opacity=".55" style="fill:var(--sheen)"><path d="M31 48L42 33L47 35L36 49Z"/></g><g stroke="none" style="fill:var(--sheen)"><rect x="33" y="88.8" width="34" height="2.6" rx="1.3"/></g><g stroke="none" opacity=".55" style="fill:var(--detail)"><circle cx="50" cy="40" r="3.2"/><circle cx="39" cy="46" r="2.2"/><circle cx="61" cy="46" r="2.2"/></g></symbol></svg>
<div class="boardWrap"><div class="frameRanks" id="frameRanks"></div><div id="board" class="board"></div><div class="frameFiles" id="frameFiles"></div></div>
<div class="info"><div class="card"><b id="turnText">White</b><span>Giliran</span></div><div class="card"><b id="moveText">0</b><span>Moves</span></div><div class="card"><b id="modeText">Medium</b><span>Mode</span></div></div>
<div class="captured" id="captured"></div><div class="message" id="message">Pilih bidak untuk mulai bermain ♟️</div>
<div class="actions"><button class="btn" id="undo">↩️ Undo</button><button class="btn" id="flip">🔄 Flip</button><button class="btn" id="resign">🏳️ Resign</button></div>
</div>
<div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="resultIcon">🏆</div><h2 id="resultTitle">Checkmate!</h2><p id="resultText">White wins.</p><div class="modeButtons"><button class="modeBtn" data-mode="easy"><strong>🟢 Easy</strong><small>Santai</small></button><button class="modeBtn" data-mode="medium"><strong>🔵 Medium</strong><small>Normal</small></button><button class="modeBtn" data-mode="hard"><strong>🟣 Hard</strong><small>Sulit</small></button><button class="modeBtn" data-mode="master"><strong>🔴 Master</strong><small>Serius 😭</small></button><button class="modeBtn" data-mode="pvp"><strong>👥 2 Player</strong><small>Teman vs teman</small></button><button class="modeBtn" id="playAgain"><strong>♻️ Rematch</strong><small>Main lagi</small></button></div></div></div>
<div class="promotion" id="promotion"><div class="promoBox"><h3>Promote Pion 👑</h3><div class="promoChoices"><button class="promo" data-piece="q"><svg class="piece w" viewBox="0 0 100 100"><use href="#pc-q"></use></svg></button><button class="promo" data-piece="r"><svg class="piece w" viewBox="0 0 100 100"><use href="#pc-r"></use></svg></button><button class="promo" data-piece="b"><svg class="piece w" viewBox="0 0 100 100"><use href="#pc-b"></use></svg></button><button class="promo" data-piece="n"><svg class="piece w" viewBox="0 0 100 100"><use href="#pc-n"></use></svg></button></div></div></div>

<script>
'use strict';
const W='w',B='b',FILES=['a','b','c','d','e','f','g','h'];
const DEF={k:'pc-k',q:'pc-q',r:'pc-r',b:'pc-b',n:'pc-n',p:'pc-p'};
const svgOf=(color,type)=>'<svg class="piece '+color+'" viewBox="0 0 100 100" aria-hidden="true"><use href="#'+DEF[type]+'"></use></svg>';
const VALUE={p:100,n:320,b:330,r:500,q:900,k:20000};
const boardEl=document.getElementById('board'),modeEl=document.getElementById('mode'),statusEl=document.getElementById('status'),turnText=document.getElementById('turnText'),moveText=document.getElementById('moveText'),modeText=document.getElementById('modeText'),messageEl=document.getElementById('message'),capturedEl=document.getElementById('captured'),overlay=document.getElementById('overlay'),resultIcon=document.getElementById('resultIcon'),resultTitle=document.getElementById('resultTitle'),resultText=document.getElementById('resultText'),promotionEl=document.getElementById('promotion'),frameFilesEl=document.getElementById('frameFiles'),frameRanksEl=document.getElementById('frameRanks');
let board=[],turn=W,selected=null,legalSelected=[],history=[],flipped=false,gameOver=false,thinking=false,pendingPromotion=null,castle={w:{k:true,q:true},b:{k:true,q:true}},enPassant=null,halfmove=0,mode='medium',captured={w:[],b:[]},lastMove=null,aiToken=0,thinkTimer=0,audioCtx=null;

function audio(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch{}}
function sound(type){try{audio();if(!audioCtx)return;const n=audioCtx.currentTime,len=Math.floor(audioCtx.sampleRate*.05),buf=audioCtx.createBuffer(1,len,audioCtx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);const src=audioCtx.createBufferSource();src.buffer=buf;const bp=audioCtx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=type==='capture'?820:1900;bp.Q.value=1.1;const g=audioCtx.createGain();g.gain.value=type==='capture'?.24:.17;src.connect(bp);bp.connect(g);g.connect(audioCtx.destination);src.start(n);if(type==='capture'){const o=audioCtx.createOscillator(),og=audioCtx.createGain();o.type='triangle';o.frequency.setValueAtTime(230,n);o.frequency.exponentialRampToValueAtTime(85,n+.16);og.gain.setValueAtTime(.15,n);og.gain.exponentialRampToValueAtTime(.001,n+.18);o.connect(og);og.connect(audioCtx.destination);o.start(n);o.stop(n+.19)}}catch{}}
function speak(t){try{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='id-ID';u.pitch=1.4;u.rate=1.1;speechSynthesis.speak(u)}}catch{}}
function clone(b){return b.map(r=>r.map(p=>p?{...p}:null))}
function opp(c){return c===W?B:W} function inside(r,c){return r>=0&&r<8&&c>=0&&c<8}
function piece(b,r,c){return inside(r,c)?b[r][c]:null}
function initial(){const b=Array.from({length:8},()=>Array(8).fill(null)),back=['r','n','b','q','k','b','n','r'];for(let c=0;c<8;c++){b[0][c]={color:B,type:back[c]};b[1][c]={color:B,type:'p'};b[6][c]={color:W,type:'p'};b[7][c]={color:W,type:back[c]}}return b}
function attacked(b,r,c,by){const pd=by===W?1:-1;for(const dc of[-1,1]){const p=piece(b,r+pd,c+dc);if(p&&p.color===by&&p.type==='p')return true}const ns=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];for(const[x,y]of ns){const p=piece(b,r+x,c+y);if(p&&p.color===by&&p.type==='n')return true}for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){if(x||y){const p=piece(b,r+x,c+y);if(p&&p.color===by&&p.type==='k')return true}}
for(const[x,y]of[[-1,-1],[-1,1],[1,-1],[1,1]]){let rr=r+x,cc=c+y;while(inside(rr,cc)){const p=b[rr][cc];if(p){if(p.color===by&&(p.type==='b'||p.type==='q'))return true;break}rr+=x;cc+=y}}
for(const[x,y]of[[-1,0],[1,0],[0,-1],[0,1]]){let rr=r+x,cc=c+y;while(inside(rr,cc)){const p=b[rr][cc];if(p){if(p.color===by&&(p.type==='r'||p.type==='q'))return true;break}rr+=x;cc+=y}}return false}
function king(b,c){for(let r=0;r<8;r++)for(let x=0;x<8;x++){const p=b[r][x];if(p&&p.color===c&&p.type==='k')return{r,c:x}}return null}
function check(b,c){const k=king(b,c);return !k||attacked(b,k.r,k.c,opp(c))}
function pseudo(b,r,c,color,rights,ep){const p=b[r][c];if(!p||p.color!==color)return[];const out=[];const add=(rr,cc,x={})=>{if(!inside(rr,cc))return;const t=b[rr][cc];if(!t||t.color!==p.color)out.push({from:{r,c},to:{r:rr,c:cc},...x})};
if(p.type==='p'){const d=color===W?-1:1,s=color===W?6:1;if(inside(r+d,c)&&!b[r+d][c]){add(r+d,c);if(r===s&&!b[r+2*d][c])add(r+2*d,c,{doublePawn:true})}for(const dc of[-1,1]){const rr=r+d,cc=c+dc;if(!inside(rr,cc))continue;if(b[rr][cc]&&b[rr][cc].color!==color)add(rr,cc,{capture:true});if(ep&&ep.r===rr&&ep.c===cc)add(rr,cc,{capture:true,enPassant:true})}}
if(p.type==='n')for(const[x,y]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])add(r+x,c+y);
if(['b','r','q'].includes(p.type)){const ds=[];if(p.type==='b'||p.type==='q')ds.push([-1,-1],[-1,1],[1,-1],[1,1]);if(p.type==='r'||p.type==='q')ds.push([-1,0],[1,0],[0,-1],[0,1]);for(const[x,y]of ds){let rr=r+x,cc=c+y;while(inside(rr,cc)){if(!b[rr][cc])add(rr,cc);else{if(b[rr][cc].color!==color)add(rr,cc,{capture:true});break}rr+=x;cc+=y}}}
if(p.type==='k'){for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)if(x||y)add(r+x,c+y);const q=rights[color];if(q&&!check(b,color)){if(q.k&&!b[r][5]&&!b[r][6]&&b[r][7]?.type==='r'&&b[r][7].color===color&&!attacked(b,r,5,opp(color))&&!attacked(b,r,6,opp(color)))out.push({from:{r,c},to:{r,c:6},castle:'k'});if(q.q&&!b[r][1]&&!b[r][2]&&!b[r][3]&&b[r][0]?.type==='r'&&b[r][0].color===color&&!attacked(b,r,3,opp(color))&&!attacked(b,r,2,opp(color)))out.push({from:{r,c},to:{r,c:2},castle:'q'})}}return out}
function apply(b,m,promo='q'){const n=clone(b),p=n[m.from.r][m.from.c];n[m.from.r][m.from.c]=null;if(m.enPassant){const d=p.color===W?1:-1;n[m.to.r+d][m.to.c]=null}n[m.to.r][m.to.c]={...p};if(p.type==='p'&&(m.to.r===0||m.to.r===7))n[m.to.r][m.to.c].type=promo;if(m.castle==='k'){n[m.from.r][5]=n[m.from.r][7];n[m.from.r][7]=null}if(m.castle==='q'){n[m.from.r][3]=n[m.from.r][0];n[m.from.r][0]=null}return n}
function legal(b,r,c,color,rights,ep){return pseudo(b,r,c,color,rights,ep).filter(m=>!check(apply(b,m),color))}
function moves(b,color,rights,ep){const a=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c]?.color===color)a.push(...legal(b,r,c,color,rights,ep));return a}
function snapshot(){return{board:clone(board),turn,castle:JSON.parse(JSON.stringify(castle)),enPassant:enPassant?{...enPassant}:null,halfmove,captured:{w:[...captured.w],b:[...captured.b]},lastMove:lastMove?{from:{...lastMove.from},to:{...lastMove.to}}:null}}
function restore(s){board=clone(s.board);turn=s.turn;castle=JSON.parse(JSON.stringify(s.castle));enPassant=s.enPassant?{...s.enPassant}:null;halfmove=s.halfmove;captured={w:[...s.captured.w],b:[...s.captured.b]};lastMove=s.lastMove?{from:{...s.lastMove.from},to:{...s.lastMove.to}}:null;selected=null;legalSelected=[]}
function execute(m,promo='q',save=true){if(gameOver)return;audio();const before=snapshot(),moving=board[m.from.r][m.from.c];let cap=board[m.to.r][m.to.c];if(m.enPassant){const d=moving.color===W?1:-1;cap=board[m.to.r+d][m.to.c]}board=apply(board,m,promo);if(cap){captured[moving.color].push(cap);sound('capture')}else sound('move');if(moving.type==='k')castle[moving.color]={k:false,q:false};if(moving.type==='r'){if(moving.color===W&&m.from.r===7){if(m.from.c===0)castle.w.q=false;if(m.from.c===7)castle.w.k=false}else if(moving.color===B&&m.from.r===0){if(m.from.c===0)castle.b.q=false;if(m.from.c===7)castle.b.k=false}}if(cap?.type==='r'){if(m.to.r===7&&m.to.c===0)castle.w.q=false;if(m.to.r===7&&m.to.c===7)castle.w.k=false;if(m.to.r===0&&m.to.c===0)castle.b.q=false;if(m.to.r===0&&m.to.c===7)castle.b.k=false}enPassant=null;if(moving.type==='p'&&Math.abs(m.to.r-m.from.r)===2)enPassant={r:(m.to.r+m.from.r)/2,c:m.from.c};halfmove=(moving.type==='p'||cap)?0:halfmove+1;if(save)history.push(before);lastMove={from:{...m.from},to:{...m.to}};turn=opp(turn);selected=null;legalSelected=[];render();state();if(!gameOver&&mode!=='pvp'&&turn===B)ai()}
function select(r,c){if(gameOver||thinking||(mode!=='pvp'&&turn===B))return;const p=board[r][c];if(selected){const m=legalSelected.find(x=>x.to.r===r&&x.to.c===c);if(m){const q=board[m.from.r][m.from.c];if(q.type==='p'&&(m.to.r===0||m.to.r===7)){pendingPromotion=m;promotionEl.classList.add('show');return}execute(m);return}if(p?.color===turn){selected={r,c};legalSelected=legal(board,r,c,turn,castle,enPassant);render();return}selected=null;legalSelected=[];render();return}if(p?.color===turn){selected={r,c};legalSelected=legal(board,r,c,turn,castle,enPassant);render()}}
function state(){const ms=moves(board,turn,castle,enPassant),ck=check(board,turn);if(!ms.length){gameOver=true;if(ck){const win=opp(turn)===W?'White':'Black';speak(mode==='pvp'?'Skak mat! '+win+' menang!':win==='White'?'Ughh... kamu menang. Hebat juga ya.':'Yeyyy! Nano Ai menang!');showResult('👑','Checkmate!',win+' menang!')}else{showResult('🤝','Stalemate','Permainan berakhir remis.');speak('Heeeh... permainannya seri nih.')}return}if(halfmove>=100){gameOver=true;showResult('🤝','Draw','50-move rule.');return}statusEl.textContent=ck?'⚠️ CHECK!':turn===W?'White turn':'Black turn';messageEl.textContent=ck?'⚠️ Raja sedang dalam bahaya!':turn===W?'Giliran kamu ♟️':mode==='pvp'?'Giliran Black ♟️':'Nano Ai sedang berpikir... 🧠';turnText.textContent=turn===W?'White':'Black'}
function evaluate(b){let s=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p)continue;let v=VALUE[p.type];const d=Math.abs(3.5-r)+Math.abs(3.5-c);if(p.type==='p')v+=(p.color===W?6-r:r-1)*8;if(p.type==='n'||p.type==='b')v+=Math.max(0,20-d*5);if(p.type==='q')v+=Math.max(0,12-d*2);s+=p.color===W?v:-v}return s}
function order(b,m){let v=0;if(m.capture){const x=b[m.to.r][m.to.c];v+=(VALUE[x?.type||'p']*10)-(VALUE[b[m.from.r][m.from.c].type])}if(m.castle)v+=40;return v}
function minimax(b,color,d,a,z,rights,ep){const ms=moves(b,color,rights,ep);if(!d)return evaluate(b);if(!ms.length)return check(b,color)?(color===W?-999999:999999):0;const max=color===W;let best=max?-Infinity:Infinity;for(const m of ms){const n=apply(b,m);const val=minimax(n,opp(color),d-1,a,z,rights,ep);best=max?Math.max(best,val):Math.min(best,val);if(max)a=Math.max(a,val);else z=Math.min(z,val);if(z<=a)break}return best}
function thinkMs(){const base={easy:[800,1600],medium:[1400,2400],hard:[2000,3200],master:[2600,4200]}[mode]||[1400,2400];const t=base[0]+Math.random()*(base[1]-base[0]);return Math.random()<.14?t+900+Math.random()*1600:t}
function stopThinking(){if(thinkTimer){clearInterval(thinkTimer);thinkTimer=0}}
function ai(){const token=++aiToken;thinking=true;render();const t0=Date.now();setTimeout(()=>{if(token!==aiToken)return;const ms=moves(board,B,castle,enPassant);if(!ms.length){thinking=false;state();return}let best=ms[0];if(mode==='easy'){best=ms[Math.floor(Math.random()*Math.min(6,ms.length))]}else{const d=mode==='medium'?2:mode==='hard'?3:3;let bs=Infinity;for(const m of ms){const v=minimax(apply(board,m),W,d-1,-Infinity,Infinity,castle,enPassant);if(v<bs){bs=v;best=m}}}if(token!==aiToken)return;let dots=0;stopThinking();messageEl.textContent='Nano Ai sedang berpikir 🧠';thinkTimer=setInterval(()=>{dots=(dots+1)%4;messageEl.textContent='Nano Ai sedang berpikir'+'.'.repeat(dots)+' 🧠'},420);setTimeout(()=>{stopThinking();if(token!==aiToken||gameOver){thinking=false;render();return}thinking=false;execute(best)},Math.max(140,thinkMs()-(Date.now()-t0)))},60)}
function renderFrame(){let f='',r='';for(let i=0;i<8;i++){f+='<span>'+FILES[flipped?7-i:i]+'</span>';r+='<span>'+(flipped?i+1:8-i)+'</span>'}frameFilesEl.innerHTML=f;frameRanksEl.innerHTML=r}
function render(){boardEl.innerHTML='';for(let dr=0;dr<8;dr++)for(let dc=0;dc<8;dc++){const r=flipped?7-dr:dr,c=flipped?7-dc:dc,e=document.createElement('div');e.className='square '+((r+c)%2===0?'light':'dark');if(lastMove&&((lastMove.from.r===r&&lastMove.from.c===c)||(lastMove.to.r===r&&lastMove.to.c===c)))e.classList.add('last');if(selected?.r===r&&selected?.c===c)e.classList.add('selected');if(board[r][c]?.type==='k'&&board[r][c]?.color===turn&&check(board,turn))e.classList.add('check');const mm=legalSelected.find(x=>x.to.r===r&&x.to.c===c);if(mm){const q=document.createElement('div');q.className=board[r][c]||mm.enPassant?'captureRing':'moveDot';e.appendChild(q)}if(board[r][c]){const q=document.createElement('div');q.innerHTML=svgOf(board[r][c].color,board[r][c].type);if(q.firstElementChild)e.appendChild(q.firstElementChild)}e.addEventListener('pointerdown',x=>{x.preventDefault();select(r,c)});boardEl.appendChild(e)}turnText.textContent=turn===W?'White':'Black';moveText.textContent=history.length;modeText.textContent=mode==='pvp'?'2 Player':mode[0].toUpperCase()+mode.slice(1);capturedEl.innerHTML='<span class="capTag w">W</span>'+(captured.w.map(p=>svgOf(p.color,p.type)).join('')||'<span class="capEmpty">—</span>')+'<span class="capTag b">B</span>'+(captured.b.map(p=>svgOf(p.color,p.type)).join('')||'<span class="capEmpty">—</span>');renderFrame();if(!gameOver)statusEl.textContent=thinking?'🧠 Thinking...':turn===W?'White turn':'Black turn';statusEl.classList.toggle('busy',thinking&&!gameOver)}
function reset(){aiToken++;stopThinking();board=initial();turn=W;selected=null;legalSelected=[];history=[];gameOver=false;thinking=false;pendingPromotion=null;castle={w:{k:true,q:true},b:{k:true,q:true}};enPassant=null;halfmove=0;captured={w:[],b:[]};lastMove=null;overlay.classList.remove('show');promotionEl.classList.remove('show');messageEl.textContent=mode==='pvp'?'White mulai dulu ♙':'White mulai dulu. Ayo kalahkan Nano Ai 😏';render()}
function showResult(i,t,x){resultIcon.textContent=i;resultTitle.textContent=t;resultText.textContent=x;setTimeout(()=>overlay.classList.add('show'),150)}
document.getElementById('newGame').onclick=reset;document.getElementById('flip').onclick=()=>{flipped=!flipped;render()};document.getElementById('undo').onclick=()=>{if(!history.length||thinking)return;restore(history.pop());gameOver=false;overlay.classList.remove('show');render();state()};document.getElementById('resign').onclick=()=>{if(gameOver)return;aiToken++;stopThinking();thinking=false;gameOver=true;speak('Huuu, cemen! Masa nyerah sih!');showResult('🏳️','Resign',turn===W?'White menyerah. Black menang.':'Black menyerah. White menang.')};modeEl.onchange=()=>{mode=modeEl.value;reset()};document.querySelectorAll('.modeBtn[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;modeEl.value=mode;reset()});document.getElementById('playAgain').onclick=reset;document.querySelectorAll('.promo').forEach(b=>b.onclick=()=>{if(!pendingPromotion)return;const m=pendingPromotion;pendingPromotion=null;promotionEl.classList.remove('show');execute(m,b.dataset.piece)});document.onkeydown=e=>{if(e.key==='Escape'){selected=null;legalSelected=[];render()}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='u')document.getElementById('undo').click()};reset();
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
.status.busy{animation:nanoPulse 1.2s ease-in-out infinite}@keyframes nanoPulse{0%,100%{opacity:1}50%{opacity:.45}}
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
</style>
</body></html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '♟️', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Chess ♟️✨',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-chess-2026',
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

handler.help = ['chess', 'catur']
handler.tags = ['game']
handler.command = /^(chess|catur)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game catur Nano Ai Chess dengan mode Easy sampai Master'

export default handler
