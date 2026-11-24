/*
 * Nano Ai UNO — kartu warna, lawan 1-3 bot.
 * Aturan: cocokkan warna atau angka/simbol. +2/+4 membuat lawan menarik kartu
 * dan kehilangan giliran. Tekan UNO! saat sisa 1 kartu atau kena denda 2 kartu.
 */

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Nano Ai UNO</title>
<style>
:root{--bg:#08070b;--line:rgba(255,255,255,.08);--text:#fff;--muted:#9d96a9;--pink:#ff6fae;--accent:#c86bff;--felt:#123027;--r:#e0392f;--y:#e8b21f;--g:#2fa94f;--b:#2a6fd6;--k:#1b1b21}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:radial-gradient(circle at 50% -10%,#1d1030 0%,#0b0810 45%,#050407 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{min-height:100vh;padding:9px}.app{width:min(100%,640px);margin:auto}
.header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
.brand{display:flex;align-items:center;gap:10px}.avatar{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#ff77b4,#9b4dff);font-size:22px;box-shadow:0 8px 20px rgba(255,111,174,.28)}
.title{font-size:18px;font-weight:800;letter-spacing:-.3px}.subtitle{color:var(--muted);font-size:10.5px;margin-top:3px}
.status{padding:7px 11px;border:1px solid rgba(255,111,174,.22);border-radius:999px;background:rgba(255,111,174,.1);color:#ffd6ea;font-size:10.5px;font-weight:700;white-space:nowrap}
.controls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:9px}
.select,.btn{min-height:43px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff;font-size:12.5px;font-weight:700;outline:none;cursor:pointer}
.select{padding:0 11px}.btn{padding:0 11px}.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(135deg,#ff5fa5,#c457ff);border:0}
.btn.ghost{background:rgba(255,255,255,.04);font-weight:600}
.table{position:relative;padding:13px;border-radius:26px;border:7px solid #3b2819;background-color:#123527;background-image:repeating-linear-gradient(46deg,rgba(0,0,0,.10) 0 2px,rgba(255,255,255,.022) 2px 4px),repeating-linear-gradient(-46deg,rgba(0,0,0,.08) 0 2px,rgba(255,255,255,.02) 2px 4px),radial-gradient(120% 100% at 50% -8%,#1c5a42,#0b281d 72%);box-shadow:0 26px 60px rgba(0,0,0,.62),0 0 0 1px rgba(0,0,0,.5),inset 0 2px 0 rgba(255,255,255,.12),inset 0 0 44px rgba(0,0,0,.5)}
.bots{display:flex;justify-content:space-around;gap:8px;margin-bottom:10px}
.bot{flex:1 1 0;min-width:0;padding:8px 6px;border-radius:15px;border:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.24);text-align:center;transition:box-shadow .2s ease,border-color .2s ease}
.bot.active{border-color:rgba(255,111,174,.55);box-shadow:0 0 0 1px rgba(255,111,174,.35),0 0 22px rgba(255,111,174,.22)}
.bot.uno{border-color:rgba(232,178,31,.6)}
.botName{font-size:9.5px;font-weight:900;letter-spacing:.4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.botSub{margin-top:3px;color:var(--muted);font-size:8.5px}
.mini{display:flex;justify-content:center;gap:2px;margin-top:6px;min-height:20px}
.back{width:13px;height:19px;border-radius:3px;background:radial-gradient(closest-side ellipse at 50% 46%,#b8241d 0 50%,rgba(184,36,29,0) 51%),linear-gradient(150deg,#2c2c3a,#131319);border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),0 1px 2px rgba(0,0,0,.4)}
.back.unoC{background:linear-gradient(150deg,#5a3b12,#2a1c07);border-color:rgba(232,178,31,.6)}
.middle{display:flex;align-items:center;justify-content:center;gap:16px;padding:6px 0 4px}
.pile{position:relative;width:74px;height:106px;flex:0 0 auto}
.pileLabel{position:absolute;left:0;right:0;bottom:-17px;text-align:center;color:var(--muted);font-size:8.5px;letter-spacing:.4px}
.card{position:relative;width:74px;height:106px;border-radius:12px;border:2px solid rgba(255,255,255,.94);box-shadow:0 10px 20px rgba(0,0,0,.45),0 2px 0 rgba(0,0,0,.3),inset 0 0 0 1px rgba(0,0,0,.16);display:grid;place-items:center;overflow:hidden}
.card:after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background-image:linear-gradient(152deg,rgba(255,255,255,.34),rgba(255,255,255,.05) 40%,rgba(0,0,0,.16)),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23p)' opacity='.4'/%3E%3C/svg%3E");background-size:auto,120px 120px}
#discard .card{transform:rotate(-2.6deg)}
.card .big{font-size:34px;font-weight:900;color:#fff;text-shadow:0 3px 5px rgba(0,0,0,.5),0 -1px 0 rgba(255,255,255,.22);line-height:1}
.card .corner{position:absolute;font-size:11px;font-weight:900;color:#fff;opacity:.95}
.card .corner.tl{top:5px;left:6px}.card .corner.br{bottom:5px;right:6px;transform:rotate(180deg)}
.card .oval{position:absolute;inset:9px 12px;border-radius:50%;background:radial-gradient(80% 70% at 38% 30%,rgba(255,255,255,.3),rgba(255,255,255,.14));border:1px solid rgba(255,255,255,.34);box-shadow:inset 0 0 12px rgba(0,0,0,.12)}
.card.r{background:linear-gradient(150deg,#ff5a4d,var(--r) 60%,#a8211a)}
.card.y{background:linear-gradient(150deg,#ffd34d,var(--y) 60%,#a67a0d)}
.card.g{background:linear-gradient(150deg,#54cf72,var(--g) 60%,#17712f)}
.card.b{background:linear-gradient(150deg,#5a9bff,var(--b) 60%,#17458e)}
.card.w{background:conic-gradient(from 45deg,#e0392f 0 25%,#e8b21f 0 50%,#2fa94f 0 75%,#2a6fd6 0)}
.card.w .oval{background:rgba(0,0,0,.34);border-color:rgba(255,255,255,.5)}
.card.w .big,.card.w .corner{color:#fff;text-shadow:0 2px 5px rgba(0,0,0,.65)}
.deck{cursor:pointer}.deck:active{transform:translateY(2px)}
.deckStack{position:absolute;inset:0;border-radius:11px;background:linear-gradient(150deg,#2b2b3a,#101018);border:2px solid rgba(255,255,255,.2);box-shadow:3px 3px 0 rgba(0,0,0,.55),6px 6px 0 rgba(0,0,0,.3)}
.deckFace{position:absolute;inset:0;border-radius:12px;display:grid;place-items:center;background:radial-gradient(closest-side ellipse at 50% 50%,#cf2a22 0 60%,rgba(207,42,34,0) 61%),linear-gradient(155deg,#2f2f3b,#0c0c11);border:2px solid rgba(255,255,255,.9);box-shadow:0 10px 20px rgba(0,0,0,.5),inset 0 0 0 1px rgba(0,0,0,.32);font-size:19px;font-weight:900;font-style:italic;letter-spacing:.8px;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.6);z-index:2}
.colorDot{width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.75);box-shadow:0 5px 14px rgba(0,0,0,.5)}
.colorWrap{display:grid;gap:5px;justify-items:center}
.colorWrap span{color:var(--muted);font-size:8.5px}
.handWrap{margin-top:12px}
.handTop{display:flex;align-items:center;justify-content:space-between;margin:0 2px 7px;font-size:9.5px;color:var(--muted)}
.hand{display:flex;gap:0;overflow-x:auto;overflow-y:hidden;padding:14px 6px 10px;scrollbar-width:none}
.hand::-webkit-scrollbar{display:none}
.hand .card{flex:0 0 auto;width:66px;height:95px;margin-left:-16px;transition:transform .14s ease,filter .14s ease}
.hand .card:first-child{margin-left:0}
.hand .card .big{font-size:30px}
.hand .card.playable{cursor:pointer;transform:translateY(-8px);box-shadow:0 12px 22px rgba(0,0,0,.5),0 0 0 2px rgba(255,255,255,.5)}
.hand .card.playable:active{transform:translateY(-4px) scale(.98)}
.hand .card.dead{filter:saturate(.28) brightness(.72)}
.hand .card.hinted{box-shadow:0 12px 22px rgba(0,0,0,.5),0 0 0 3px rgba(255,111,174,.9)}
.actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px}
.btn.unoBtn{background:linear-gradient(135deg,#ffd34d,#e8a41f);border:0;color:#3a2600;font-weight:900}
.btn.unoBtn:disabled{filter:grayscale(.7) brightness(.6);cursor:default}
.info{margin-top:10px;padding:10px 12px;border-radius:15px;border:1px solid rgba(255,111,174,.16);background:rgba(255,111,174,.07);color:#ffd5e7;font-size:11.5px;text-align:center;min-height:38px;display:flex;align-items:center;justify-content:center}
.stats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:10px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.03);overflow:hidden}
.stat{padding:10px 6px;text-align:center;border-left:1px solid var(--line)}.stat:first-child{border-left:0}
.stat b{display:block;font-size:15px}.stat span{display:block;margin-top:3px;color:var(--muted);font-size:8.5px;letter-spacing:.6px;text-transform:uppercase}
.overlay,.picker{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.75);backdrop-filter:blur(8px)}
.overlay.show,.picker.show{display:flex}
.modal{width:min(92vw,400px);padding:22px;border-radius:22px;background:linear-gradient(145deg,#1c151e,#0f0c12);border:1px solid rgba(255,255,255,.1);box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}
.modalIcon{font-size:50px}.modal h2{margin:4px 0;font-size:22px}.modal p{color:var(--muted);font-size:12.5px;margin:6px 0 16px}
.modalBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.swatches{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-top:6px}
.swatch{aspect-ratio:1;border-radius:16px;border:2px solid rgba(255,255,255,.8);cursor:pointer;box-shadow:0 8px 18px rgba(0,0,0,.5)}
.swatch.r{background:linear-gradient(150deg,#ff5a4d,var(--r))}.swatch.y{background:linear-gradient(150deg,#ffd34d,var(--y))}
.swatch.g{background:linear-gradient(150deg,#54cf72,var(--g))}.swatch.b{background:linear-gradient(150deg,#5a9bff,var(--b))}
.toast{position:fixed;left:50%;bottom:22px;z-index:60;max-width:88vw;padding:9px 13px;border-radius:12px;background:rgba(24,18,28,.96);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:11.5px;font-weight:700;transform:translate(-50%,12px);opacity:0;pointer-events:none;transition:opacity .14s ease,transform .14s ease}
.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:420px){body{padding:7px}.title{font-size:16.5px}.hand .card{width:60px;height:87px;margin-left:-18px}.hand .card .big{font-size:26px}.pile,.card{width:66px;height:95px}.pile .card{width:66px;height:95px}.card .big{font-size:30px}.actions{gap:6px}.btn{font-size:11.5px}}
</style>
</head>
<body>
<div class="app">
<div class="header"><div class="brand"><div class="avatar">🃏</div><div><div class="title">Nano Ai UNO ✨</div><div class="subtitle">"Kartu terakhir... jangan lupa bilang UNO!" ♡</div></div></div><div class="status" id="status">Giliran kamu</div></div>
<div class="controls"><select id="mode" class="select" aria-label="Mode"><option value="easy">🟢 Santai · bot ceroboh</option><option value="normal" selected>🔵 Seimbang · bot pintar</option><option value="hard">🔴 Tajam · bot licik</option></select><select id="bots" class="select" aria-label="Jumlah lawan"><option value="1" selected>1 lawan</option><option value="2">2 lawan</option><option value="3">3 lawan</option></select></div>
<div class="table">
<div class="bots" id="botsRow"></div>
<div class="middle">
<div class="pile deck" id="deck"><div class="deckStack" style="transform:translate(6px,6px)"></div><div class="deckStack" style="transform:translate(3px,3px)"></div><div class="deckFace">UNO</div><div class="pileLabel" id="deckLabel">Tumpukan · 0</div></div>
<div class="pile"><div id="discard"></div><div class="pileLabel">Meja</div></div>
<div class="colorWrap"><div class="colorDot" id="colorDot" style="background:#555"></div><span>Warna</span></div>
</div>
<div class="handWrap"><div class="handTop"><span id="handLabel">Kartumu · 0</span><span id="turnHint">Menunggu</span></div><div class="hand" id="hand"></div></div>
</div>
<div class="actions"><button class="btn unoBtn" id="unoBtn" disabled>UNO!</button><button class="btn ghost" id="passBtn" disabled>Lewat</button><button class="btn ghost" id="accuseBtn" disabled>Tuduh UNO!</button></div>
<div class="info" id="info">Tekan kartu yang menyala untuk memainkannya.</div>
<div class="stats"><div class="stat"><b id="statWin">0</b><span>Menang</span></div><div class="stat"><b id="statLose">0</b><span>Kalah</span></div><div class="stat"><b id="statPoints">0</b><span>Poin</span></div></div>
<div class="controls" style="margin-top:9px;grid-template-columns:1fr 1fr"><button class="btn primary" id="newGame">♻️ Rombak Kartu</button><button class="btn ghost" id="sound">🔇 Suara: Mati</button></div>
</div>
<div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="resultIcon">🏆</div><h2 id="resultTitle">Kamu menang!</h2><p id="resultText">Kartu lawan habis duluan.</p><div class="modalBtns"><button class="btn primary" id="playAgain">Main Lagi</button><button class="btn ghost" id="closeModal">Tutup</button></div></div></div>
<div class="picker" id="picker"><div class="modal"><h2>Pilih warna</h2><p>Kartu wild bebas memilih warna.</p><div class="swatches"><button class="swatch r" data-color="r"></button><button class="swatch y" data-color="y"></button><button class="swatch g" data-color="g"></button><button class="swatch b" data-color="b"></button></div><button class="btn ghost" id="cancelPick" style="margin-top:12px">Batal</button></div></div>
<div class="toast" id="toast"></div>
<script>
'use strict';
const $=id=>document.getElementById(id);
const statusEl=$('status'),botsRow=$('botsRow'),deckEl=$('deck'),deckLabel=$('deckLabel'),discardEl=$('discard'),colorDot=$('colorDot'),handEl=$('hand'),handLabel=$('handLabel'),turnHint=$('turnHint'),infoEl=$('info'),unoBtn=$('unoBtn'),passBtn=$('passBtn'),accuseBtn=$('accuseBtn'),overlay=$('overlay'),picker=$('picker'),toastEl=$('toast'),modeEl=$('mode'),botsEl=$('bots'),resultIcon=$('resultIcon'),resultTitle=$('resultTitle'),resultText=$('resultText');
const COLORS=['r','y','g','b'],NAMES={r:'Merah',y:'Kuning',g:'Hijau',b:'Biru'},SYM={s:'⊘',r:'⇄',d2:'+2',w:'★',w4:'+4'};
const BOT_NAMES=['Nano Ki','Nano Yu','Nano Mi'];
let deck=[],discard=[],hands=[],turn=0,dir=1,wildColor=null,drawnIndex=-1,opponents=1,mode='normal',players=2,gameOver=false,busy=false,unoPending=false,unoDeadline=0,unoTimer=0,forgot=[],accuseTarget=-1,score={win:0,lose:0,points:0},soundOn=false,audioCtx=null,gameToken=0,botTimer=0,aiThinking=false;
function label(card){return card.v in SYM?SYM[card.v]:card.v}
function points(card){if(card.v in SYM)return card.v==='w'||card.v==='w4'?50:20;return Number(card.v)}
function buildDeck(){const d=[];for(const c of COLORS){d.push({c,v:'0'});for(let n=1;n<=9;n++){d.push({c,v:String(n)});d.push({c,v:String(n)})}for(const v of ['s','r','d2']){d.push({c,v});d.push({c,v})}}for(let i=0;i<4;i++){d.push({c:'w',v:'w'});d.push({c:'w',v:'w4'})}return d}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function topCard(){return discard[discard.length-1]}
function activeColor(){return wildColor||topCard().c}
function canPlay(card,topCard){if(card.c==='w')return true;const ac=wildColor||topCard.c;return card.c===ac||card.v===topCard.v}
function step(n){let i=turn;for(let k=0;k<(n||1);k++)i=(i+dir+players)%players;return i}
function isHuman(p){return p===0}
function loadScore(){try{const s=JSON.parse(localStorage.getItem('nano-uno-score-v1')||'null');if(s&&Number.isFinite(s.win))score={win:Math.max(0,s.win|0),lose:Math.max(0,s.lose|0),points:Math.max(0,s.points|0)}}catch{}}
function saveScore(){try{localStorage.setItem('nano-uno-score-v1',JSON.stringify(score))}catch{}}
function audio(){try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch{}}
function sound(kind){if(!soundOn)return;try{audio();if(!audioCtx)return;const t=audioCtx.currentTime;const freqs=kind==='play'?[520,760]:kind==='draw'?[300,220]:kind==='uno'?[880,1200]:[660,990];const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=kind==='draw'?'sawtooth':'triangle';o.frequency.setValueAtTime(freqs[0],t);o.frequency.exponentialRampToValueAtTime(freqs[1],t+.09);g.gain.setValueAtTime(kind==='uno'?.07:.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.15)}catch{}}
function toast(text){toastEl.textContent=text;toastEl.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.classList.remove('show'),1600)}
function cardHtml(card,extraClass){const cls='card '+card.c+(extraClass?' '+extraClass:'');const l=label(card);const multi=l.length>1||card.v==='w'||card.v==='w4';return '<div class="'+cls+'"><span class="corner tl">'+l+'</span><span class="oval"></span><span class="big"'+(multi?' style="font-size:22px"':'')+'>'+l+'</span><span class="corner br">'+l+'</span></div>'}
function reshuffleIfNeeded(){if(deck.length)return;if(discard.length<2)return;const keep=discard.pop();deck=shuffle(discard.splice(0));discard=[keep];toast('Tumpukan dikocok ulang.')}
function drawTo(p,n){const got=[];for(let i=0;i<n;i++){reshuffleIfNeeded();if(!deck.length)break;got.push(deck.pop())}hands[p]=hands[p].concat(got);return got}
function newRound(keepScore){gameToken++;clearTimeout(botTimer);clearInterval(unoTimer);unoTimer=0;aiThinking=false;deck=shuffle(buildDeck());discard=[];const total=opponents+1;hands=Array.from({length:total},()=>[]);for(let i=0;i<7;i++)for(let p=0;p<total;p++)hands[p].push(deck.pop());let first=deck.pop();while(first.c==='w'){deck.unshift(first);first=deck.pop()}discard=[first];wildColor=null;drawnIndex=-1;forgot=Array(total).fill(false);accuseTarget=-1;dir=1;turn=0;gameOver=false;busy=false;unoPending=false;clearInterval(unoTimer);unoTimer=0;overlay.classList.remove('show');picker.classList.remove('show');infoEl.textContent='Kartu pertama: '+NAMES[first.c]+' '+label(first)+'. Giliran kamu.';
render();}
function startTurn(){if(gameOver)return;if(isHuman(turn)){aiThinking=false;enableHuman();render()}else{aiThinking=true;render();clearTimeout(botTimer);botTimer=setTimeout(botMove,mode==='easy'?700:mode==='normal'?900:1100)}}
function enableHuman(){drawnIndex=-1;const playable=hands[0].filter(c=>canPlay(c,topCard()));unoBtn.disabled=!unoPending;passBtn.disabled=true;accuseBtn.disabled=accuseTarget<0;if(unoPending){infoEl.textContent='Sisa 1 kartu! Tekan UNO! sebelum jendela 4 detik habis.';return}if(!playable.length){infoEl.textContent='Tidak ada kartu yang cocok — tekan tumpukan untuk menarik.';return}infoEl.textContent='Ada '+playable.length+' kartu bisa dimainkan. Tekan kartunya.'}
function playCard(p,index,chosenColor){if(gameOver)return;const card=hands[p][index];if(!card)return;if(!canPlay(card,topCard()))return;hands[p].splice(index,1);discard.push(card);drawnIndex=-1;sound('play');if(card.c==='w'){wildColor=chosenColor||bestColorFor(p);infoEl.textContent=NAMES[wildColor]+' dipilih lewat kartu wild.'}else{wildColor=null}
if(hands[p].length===1){if(isHuman(p)){unoPending=true;unoDeadline=Date.now()+4000;unoBtn.disabled=false;infoEl.textContent='Sisa 1 kartu! Tekan UNO! sebelum jendela 4 detik habis.';clearInterval(unoTimer);unoTimer=setInterval(()=>{const left=Math.max(0,Math.ceil((unoDeadline-Date.now())/1000));if(!unoPending){clearInterval(unoTimer);unoTimer=0;return}if(Date.now()>unoDeadline){clearInterval(unoTimer);unoTimer=0;unoPending=false;unoBtn.disabled=true;if(hands[0].length===1){drawTo(0,2);sound('draw');toast('Kamu lupa bilang UNO! +2 kartu.');infoEl.textContent='Lupa bilang UNO — dapat 2 kartu denda.';render()}return}if(!gameOver&&hands[0].length===1)infoEl.textContent='Sisa 1 kartu! Tekan UNO! ('+left+' detik)'},250)}else{const forget=mode==='easy'?.5:mode==='normal'?.22:.06;if(Math.random()<forget){forgot[p]=true;accuseTarget=p;toast(BOT_NAMES[p-1]+' lupa bilang UNO!')}}}
if(!hands[p].length){finishRound(p);return}
applyEffect(card,p);if(gameOver)return;render();startTurn()}
function applyEffect(card,p){if(card.v==='s'){turn=step(2);return}if(card.v==='r'){dir*=-1;turn=step(1);return}if(card.v==='d2'){const target=step(1);drawTo(target,2);sound('draw');if(isHuman(target))toast('Kamu kena +2!');turn=step(2);return}if(card.v==='w4'){const target=step(1);drawTo(target,4);sound('draw');if(isHuman(target))toast('Kamu kena +4!');turn=step(2);return}turn=step(1)}
function bestColorFor(p){const tally={r:0,y:0,g:0,b:0};for(const c of hands[p])if(c.c!=='w')tally[c.c]++;let best='r',bv=-1;for(const k of COLORS)if(tally[k]>bv){bv=tally[k];best=k}return best}
function humanPlay(index){if(gameOver||busy||turn!==0)return;const card=hands[0][index];if(!card)return;if(!canPlay(card,topCard())){toast('Kartu itu tidak cocok.');return}if(card.c==='w'){picker.classList.add('show');picker.dataset.index=String(index);return}playCard(0,index)}
function humanDraw(){if(gameOver||busy||turn!==0)return;if(hands[0].some(c=>canPlay(c,topCard()))){toast('Masih ada kartu yang bisa dimainkan.');return}const got=drawTo(0,1);sound('draw');if(!got.length){toast('Tumpukan habis.');return}const idx=hands[0].length-1;render();if(canPlay(got[0],topCard())){drawnIndex=idx;passBtn.disabled=false;infoEl.textContent='Kartu baru bisa dimainkan — tekan kartunya, atau tekan Lewat.'}else{infoEl.textContent='Kartu baru tidak cocok. Giliran lewat.';setTimeout(()=>{if(turn!==0||gameOver)return;turn=step(1);render();startTurn()},700)}}
function humanPass(){if(turn!==0||gameOver)return;drawnIndex=-1;passBtn.disabled=true;turn=step(1);render();startTurn()}
function botMove(){if(gameOver||isHuman(turn))return;const p=turn;const playable=hands[p].map((c,i)=>({c,i})).filter(x=>canPlay(x.c,topCard()));if(!playable.length){drawTo(p,1);sound('draw');const last=hands[p].length-1;const got=hands[p][last];if(canPlay(got,topCard())){render();botTimer=setTimeout(()=>playCard(p,last),420);return}render();botTimer=setTimeout(()=>{turn=step(1);render();startTurn()},520);return}
let choice=playable[0];if(mode==='easy'){const nonWild=playable.filter(x=>x.c.c!=='w');const pool=nonWild.length&&Math.random()<.75?nonWild:playable;choice=pool[Math.floor(Math.random()*pool.length)]}else{const nextCount=hands[step(1)].length;const mine=bestColorFor(p);const rank=x=>{let s=0;if(x.c.c!=='w'&&x.c.c!==topCard().c)s+=4;if(x.c.v==='d2'||x.c.v==='w4')s+=nextCount<=2?40:6;if(x.c.v==='s'||x.c.v==='r')s+=nextCount<=2?22:3;if(x.c.v==='w')s-=mode==='hard'?14:6;if(mode==='hard'&&x.c.c!=='w'&&x.c.c!==mine)s-=6;return s};playable.sort((a,b)=>rank(b)-rank(a));choice=playable[0]}
render();botTimer=setTimeout(()=>playCard(p,choice.i),360)}
function finishRound(winner){gameOver=true;clearInterval(unoTimer);unoTimer=0;unoPending=false;unoBtn.disabled=true;passBtn.disabled=true;accuseBtn.disabled=true;let reste=0;for(let p=1;p<players;p++)reste+=hands[p].reduce((s,c)=>s+points(c),0);if(winner===0){score.win++;score.points+=reste;resultIcon.textContent='🏆';resultTitle.textContent='Kamu menang!';resultText.textContent='Kamu menghabiskan kartu lebih dulu. Poin putaran ini '+reste+'.';sound('win')}else{score.lose++;resultIcon.textContent='🙈';resultTitle.textContent='Kamu kalah';resultText.textContent=BOT_NAMES[winner-1]+' sudah habis kartunya. Sisa kartumu '+hands[0].reduce((s,c)=>s+points(c),0)+' poin.';sound('lose')}saveScore();render();setTimeout(()=>overlay.classList.add('show'),260)}
function accuse(){if(accuseTarget<0||gameOver)return;const p=accuseTarget;accuseTarget=-1;forgot[p]=false;accuseBtn.disabled=true;drawTo(p,2);sound('uno');toast(BOT_NAMES[p-1]+' ketahuan! +2 kartu.');score.points+=20;saveScore();render()}
function render(){deckLabel.textContent='Tumpukan · '+deck.length;discardEl.innerHTML=cardHtml(topCard());const ac=activeColor();colorDot.style.background=({r:'linear-gradient(150deg,#ff5a4d,#e0392f)',y:'linear-gradient(150deg,#ffd34d,#e8b21f)',g:'linear-gradient(150deg,#54cf72,#2fa94f)',b:'linear-gradient(150deg,#5a9bff,#2a6fd6)'})[ac];let row='';for(let p=1;p<players;p++){const n=hands[p].length;const backs=Array.from({length:Math.min(n,9)},()=>'<span class="back'+(n<=1?' unoC':'')+'"></span>').join('');row+='<div class="bot'+(turn===p?' active':'')+(n===1?' uno':'')+'"><div class="botName">'+BOT_NAMES[p-1]+'</div><div class="botSub">'+(n===1?'UNO! sisa 1':n+' kartu')+'</div><div class="mini">'+backs+'</div></div>'}botsRow.innerHTML=row;const mine=turn===0&&!gameOver;let h='';hands[0].forEach((card,i)=>{const ok=mine&&canPlay(card,topCard());const cls=(ok?'playable ':'')+(mine&&!ok?'dead':'')+(i===drawnIndex?' hinted':'');h+=cardHtml(card,cls)});handEl.innerHTML=h;Array.from(handEl.children).forEach((el,i)=>{if(el.classList.contains('playable'))el.addEventListener('click',()=>humanPlay(i))});handLabel.textContent='Kartumu · '+hands[0].length+(hands[0].length===1?' (UNO!)':'');turnHint.textContent=gameOver?'Selesai':isHuman(turn)?'Giliran kamu':BOT_NAMES[turn-1]+' berpikir';statusEl.textContent=gameOver?'Ronde selesai':isHuman(turn)?'Giliran kamu':'🧠 '+BOT_NAMES[turn-1]+' jalan';$('statWin').textContent=score.win;$('statLose').textContent=score.lose;$('statPoints').textContent=score.points;accuseBtn.disabled=accuseTarget<0||gameOver;unoBtn.disabled=!(unoPending&&!gameOver);$('sound').textContent=soundOn?'🔊 Suara: Nyala':'🔇 Suara: Mati'}
function setPlayers(n){opponents=n;players=n+1;newRound()}
deckEl.addEventListener('click',humanDraw);passBtn.addEventListener('click',humanPass);unoBtn.addEventListener('click',()=>{if(!unoPending)return;if(unoTimer){clearInterval(unoTimer);unoTimer=0}unoPending=false;unoBtn.disabled=true;sound('uno');toast('UNO! Aman.');infoEl.textContent='UNO! Kamu aman.'});accuseBtn.addEventListener('click',accuse);
document.querySelectorAll('.swatch').forEach(sw=>sw.addEventListener('click',()=>{const i=Number(picker.dataset.index);picker.classList.remove('show');if(!Number.isFinite(i))return;playCard(0,i,sw.dataset.color)}));
$('cancelPick').addEventListener('click',()=>{picker.classList.remove('show');picker.dataset.index='';infoEl.textContent='Kartu wild dibatalkan — pilih kartu lain.'});
$('newGame').addEventListener('click',()=>newRound());$('playAgain').addEventListener('click',()=>newRound());$('closeModal').addEventListener('click',()=>overlay.classList.remove('show'));$('sound').addEventListener('click',()=>{soundOn=!soundOn;if(soundOn)sound('play');render()});
modeEl.addEventListener('change',()=>{mode=modeEl.value;newRound()});botsEl.addEventListener('change',()=>setPlayers(Number(botsEl.value)));
loadScore();newRound();
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
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.card,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
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
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🃏', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai UNO 🃏',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-uno-2026',
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

handler.help = ['uno', 'unogame', 'kartuuno']
handler.tags = ['game']
handler.command = /^(uno|unogame|kartuuno)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game UNO Nano Ai — lawan 1-3 bot, ada +2, +4, skip, wild dan tombol UNO!'

export default handler
