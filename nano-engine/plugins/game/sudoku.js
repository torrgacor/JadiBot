/*
 * Nano Ai Sudoku — generator soal sendiri (solusi dijamin tunggal).
 * Tiga tingkat kesulitan, catatan pensil, bantuan, penghitung waktu,
 * dan progres disimpan supaya bisa dilanjutkan.
 */

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Nano Ai Sudoku</title>
<style>
:root{--bg:#08070b;--line:rgba(255,255,255,.09);--text:#fff;--muted:#9d96a9;--pink:#ff6fae;--accent:#c86bff;--good:#39d98a;--bad:#ff4d6d;--cell:#141019;--cell2:#1b1624}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:radial-gradient(circle at 50% -10%,#231033 0%,#0b0810 46%,#050407 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{min-height:100vh;padding:9px}.app{width:min(100%,540px);margin:auto}
.header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
.brand{display:flex;align-items:center;gap:10px}.avatar{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#ff77b4,#9b4dff);font-size:22px;box-shadow:0 8px 20px rgba(255,111,174,.28)}
.title{font-size:18px;font-weight:800;letter-spacing:-.3px}.subtitle{color:var(--muted);font-size:10.5px;margin-top:3px}
.status{padding:7px 11px;border:1px solid rgba(255,111,174,.22);border-radius:999px;background:rgba(255,111,174,.1);color:#ffd6ea;font-size:10.5px;font-weight:700;white-space:nowrap}
.controls{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.select,.btn{min-height:43px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff;font-size:12.5px;font-weight:800;outline:none;cursor:pointer}
.select{padding:0 11px}.btn{padding:0 11px}.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(135deg,#ff5fa5,#c457ff);border:0}
.btn.on{background:rgba(255,111,174,.18);border-color:rgba(255,111,174,.5);color:#ffd6ea}
.boardWrap{padding:11px;border-radius:22px;background:repeating-linear-gradient(97deg,rgba(255,255,255,.028) 0 2px,rgba(0,0,0,.06) 2px 4px,transparent 4px 12px),linear-gradient(172deg,#4b3222,#241610);border:1px solid rgba(0,0,0,.6);box-shadow:0 24px 60px rgba(0,0,0,.62),inset 0 2px 0 rgba(255,255,255,.14),inset 0 -3px 9px rgba(0,0,0,.65)}
.board{position:relative;display:grid;grid-template-columns:repeat(9,1fr);width:100%;aspect-ratio:1;border-radius:9px;overflow:hidden;border:1px solid rgba(0,0,0,.6);background:#0d0a12;box-shadow:inset 0 4px 14px rgba(0,0,0,.6),inset 0 -1px 0 rgba(255,255,255,.06),0 10px 26px rgba(0,0,0,.5)}
.cell{position:relative;display:grid;place-items:center;min-width:0;min-height:0;background:linear-gradient(160deg,#181322,#0f0c16);border-right:1px solid rgba(255,255,255,.05);border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;user-select:none;transition:background .12s ease,box-shadow .12s ease}
.cell:nth-child(9n){border-right:0}
.cell.bR{border-right:2px solid rgba(255,255,255,.22);box-shadow:1px 0 0 rgba(0,0,0,.55)}
.cell.bB{border-bottom:2px solid rgba(255,255,255,.22);box-shadow:0 1px 0 rgba(0,0,0,.55)}
.cell.dark{background:linear-gradient(160deg,#1e1829,#141020)}
.cell.hl{background:#251a30}
.cell.peer{background:#1d1728}
.cell.same{background:#332145}
.cell.sel{background:#3d2452;box-shadow:inset 0 0 0 2px var(--pink)}
.cell.val{color:var(--pink);font-weight:800}
.cell.given{color:#fff;font-weight:800}
.cell.bad{color:var(--bad)}
.cell.good{color:var(--good)}
.num{font-size:clamp(16px,5.4vw,26px);line-height:1;font-weight:800}
.cell.given .num{text-shadow:0 1px 0 rgba(0,0,0,.65),0 0 14px rgba(255,255,255,.18)}
.cell.val .num{text-shadow:0 0 12px rgba(255,111,174,.45)}
.notes{position:absolute;inset:6%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);pointer-events:none}
.notes span{display:grid;place-items:center;font-size:clamp(6px,1.9vw,9px);color:#b9aecb;font-weight:700}
.pad{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:10px}
.key{min-height:52px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(160deg,#2a2138,#171220);color:#fff;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 7px 16px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.14),inset 0 -3px 8px rgba(0,0,0,.35)}
.key:active{transform:translateY(1px) scale(.97)}
.key.wide{font-size:13px}
.key small{display:block;font-size:8px;color:var(--muted);font-weight:700;margin-top:2px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:10px;border:1px solid var(--line);border-radius:15px;background:rgba(255,255,255,.03);overflow:hidden}
.stat{padding:10px 4px;text-align:center;border-left:1px solid var(--line)}.stat:first-child{border-left:0}
.stat b{display:block;font-size:14.5px}.stat span{display:block;margin-top:3px;color:var(--muted);font-size:8px;letter-spacing:.5px;text-transform:uppercase}
.info{margin-top:10px;padding:10px 12px;border-radius:15px;border:1px solid rgba(255,111,174,.16);background:rgba(255,111,174,.07);color:#ffd5e7;font-size:11.5px;text-align:center;min-height:38px;display:flex;align-items:center;justify-content:center}
.overlay{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.76);backdrop-filter:blur(8px)}
.overlay.show{display:flex}
.modal{width:min(92vw,400px);padding:22px;border-radius:22px;background:linear-gradient(145deg,#1c151e,#0f0c12);border:1px solid rgba(255,255,255,.1);box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}
.modalIcon{font-size:50px}.modal h2{margin:4px 0;font-size:22px}.modal p{color:var(--muted);font-size:12.5px;margin:6px 0 16px}
.modalBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.toast{position:fixed;left:50%;bottom:22px;z-index:60;max-width:88vw;padding:9px 13px;border-radius:12px;background:rgba(24,18,28,.96);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:11.5px;font-weight:700;transform:translate(-50%,12px);opacity:0;pointer-events:none;transition:opacity .14s ease,transform .14s ease}
.toast.show{opacity:1;transform:translate(-50%,0)}
.spin{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite;vertical-align:-2px;margin-right:6px}
@keyframes sp{to{transform:rotate(360deg)}}
@media(max-width:420px){body{padding:7px}.title{font-size:16.5px}.boardWrap{padding:6px;border-radius:16px}.pad{gap:5px}.key{min-height:47px;font-size:18px}}
</style>
</head>
<body>
<div class="app">
<div class="header"><div class="brand"><div class="avatar">🔢</div><div><div class="title">Sudoku Nano ✨</div><div class="subtitle">"Isi 1–9, tiap baris & kotak cuma sekali." ♡</div></div></div><div class="status" id="status">Sedang</div></div>
<div class="controls"><select id="level" class="select" aria-label="Kesulitan"><option value="mudah">🟢 Mudah · 40 petunjuk</option><option value="sedang" selected>🔵 Sedang · 32 petunjuk</option><option value="sulit">🔴 Sulit · 26 petunjuk</option></select><button class="btn primary" id="newGame">＋ Soal Baru</button></div>
<div class="boardWrap"><div class="board" id="board"></div></div>
<div class="pad"><button class="key" data-num="1">1</button><button class="key" data-num="2">2</button><button class="key" data-num="3">3</button><button class="key" data-num="4">4</button><button class="key" data-num="5">5</button><button class="key" data-num="6">6</button><button class="key" data-num="7">7</button><button class="key" data-num="8">8</button><button class="key" data-num="9">9</button><button class="key wide" id="erase">⌫<small>Hapus</small></button><button class="key wide" id="noteBtn">✎<small>Catatan</small></button><button class="key wide" id="hintBtn">💡<small>Bantuan</small></button><button class="key wide" id="checkBtn">✓<small>Periksa</small></button><button class="key wide" id="sound">🔇<small>Suara</small></button></div>
<div class="stats"><div class="stat"><b id="statTime">0:00</b><span>Waktu</span></div><div class="stat"><b id="statMistake">0</b><span>Salah</span></div><div class="stat"><b id="statHint">3</b><span>Bantuan</span></div><div class="stat"><b id="statLevel">Sedang</b><span>Level</span></div></div>
<div class="info" id="info">Pilih kotak kosong, lalu tekan angka. Aktifkan Catatan untuk menandai kemungkinan.</div>
<div class="controls" style="margin-top:9px;grid-template-columns:1fr 1fr"><button class="btn" id="restart">↺ Ulangi Soal</button><button class="btn" id="reveal">👁️ Tampilkan Jawaban</button></div>
</div>
<div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="resultIcon">🎉</div><h2 id="resultTitle">Selesai!</h2><p id="resultText">Papan penuh dan benar.</p><div class="modalBtns"><button class="btn primary" id="againBtn">Soal Baru</button><button class="btn" id="closeBtn">Tutup</button></div></div></div>
<div class="toast" id="toast"></div>
<script>
'use strict';
const $=id=>document.getElementById(id);
const boardEl=$('board'),levelEl=$('level'),statusEl=$('status'),infoEl=$('info'),overlay=$('overlay'),toastEl=$('toast'),resultIcon=$('resultIcon'),resultTitle=$('resultTitle'),resultText=$('resultText');
const KEY='nano-sudoku-v1';
const TARGET={mudah:40,sedang:32,sulit:26};
let solution=[],given=[],values=[],notes=[],cells=[],selected=-1,noteMode=false,difficulty='sedang',mistakes=0,hintLeft=3,startAt=Date.now(),timer=0,finished=false,soundOn=false,audioCtx=null;
function blip(f1,f2,dur,type,gain){if(!soundOn)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const t=audioCtx.currentTime;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+(dur||.09));g.gain.setValueAtTime(gain||.05,t);g.gain.exponentialRampToValueAtTime(.001,t+(dur||.09)+.04);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+(dur||.09)+.05)}catch{}}
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.classList.remove('show'),1500)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function cloneGrid(g){return g.map(r=>r.slice())}
function ok(g,r,c,v){for(let i=0;i<9;i++){if(g[r][i]===v||g[i][c]===v)return false}const br=r-r%3,bc=c-c%3;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(g[br+i][bc+j]===v)return false;return true}
function fillGrid(g,pos){if(pos>=81)return true;const r=(pos/9)|0,c=pos%9;if(g[r][c])return fillGrid(g,pos+1);const order=shuffle([1,2,3,4,5,6,7,8,9]);for(const v of order){if(ok(g,r,c,v)){g[r][c]=v;if(fillGrid(g,pos+1))return true;g[r][c]=0}}return false}
function countSolutions(g,limit){let found=0;const grid=cloneGrid(g);function go(){let r=-1,c=-1,best=10;for(let i=0;i<9;i++)for(let j=0;j<9;j++){if(grid[i][j])continue;let cand=0;for(let v=1;v<=9;v++)if(ok(grid,i,j,v))cand++;if(cand<best){best=cand;r=i;c=j;if(cand<=1)break}}if(r<0){found++;return found>=limit}for(let v=1;v<=9;v++){if(!ok(grid,r,c,v))continue;grid[r][c]=v;if(go())return true;grid[r][c]=0}return false}
go();return found}
function makePuzzle(target){const sol=Array.from({length:9},()=>Array(9).fill(0));fillGrid(sol,0);const puz=cloneGrid(sol);const order=shuffle(Array.from({length:81},(_,i)=>i));let filled=81;for(const pos of order){if(filled<=target)break;const r=(pos/9)|0,c=pos%9;const keep=puz[r][c];if(!keep)continue;puz[r][c]=0;if(countSolutions(puz,2)!==1){puz[r][c]=keep;continue}filled--}return{sol,puz}}
function newGame(level){difficulty=level||levelEl.value;finished=false;statusEl.innerHTML='<span class="spin"></span>Menyusun...';infoEl.textContent='Sedang membuat soal baru...';clearInterval(timer);setTimeout(()=>{const t0=Date.now();const p=makePuzzle(TARGET[difficulty]||32);const gen=Date.now()-t0;solution=p.sol;given=p.puz.map(r=>r.map(v=>v>0?1:0));values=p.puz.map(r=>r.slice());notes=Array.from({length:81},()=>[]);selected=-1;mistakes=0;hintLeft=3;startAt=Date.now();statusEl.textContent=difficulty.charAt(0).toUpperCase()+difficulty.slice(1);infoEl.textContent='Soal siap dalam '+gen+' ms · '+countGivens()+' petunjuk. Pilih kotak kosong lalu tekan angka.';buildBoard();render();save();timer=setInterval(tick,500)},30)}
function countGivens(){let n=0;for(let i=0;i<81;i++)if(given[(i/9)|0][i%9])n++;return n}
function tick(){if(finished)return;const ms=Date.now()-startAt;const s=Math.floor(ms/1000);$('statTime').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function buildBoard(){boardEl.innerHTML='';cells=[];for(let r=0;r<9;r++)for(let c=0;c<9;c++){const el=document.createElement('div');el.className='cell'+((((r/3)|0)+((c/3)|0))%2?' dark':'');if(c%3===2&&c!==8)el.classList.add('bR');if(r%3===2&&r!==8)el.classList.add('bB');el.addEventListener('click',()=>select(r*9+c));boardEl.appendChild(el);cells.push(el)}}
function select(i){if(finished)return;const was=selected;selected=(selected===i?-1:i);blip(selected<0?520:700,selected<0?420:900,.06,'sine',.035);if(was>=0)refreshCell(was);render()}
function refreshCell(i){const r=(i/9)|0,c=i%9,el=cells[i];const val=values[r][c];el.className='cell'+((((r/3)|0)+((c/3)|0))%2?' dark':'');if(c%3===2&&c!==8)el.classList.add('bR');if(r%3===2&&r!==8)el.classList.add('bB');let html='';if(val){html='<span class="num">'+val+'</span>';el.classList.add(given[r][c]?'given':'val')}else if(notes[i].length){html='<span class="notes">'+Array.from({length:9},(_,k)=>'<span>'+(notes[i].includes(k+1)?k+1:'')+'</span>').join('')+'</span>'}el.innerHTML=html}
function render(){const selR=selected<0?-1:(selected/9)|0,selC=selected<0?-1:selected%9;const selV=selected<0?0:values[selR][selC];for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9,el=cells[i];refreshCell(i);if(selected<0)continue;if(r===selR||c===selC||(((r/3)|0)===((selR/3)|0)&&((c/3)|0)===((selC/3)|0)))el.classList.add('peer');if(values[r][c]&&selV&&values[r][c]===selV)el.classList.add('same');if(i===selected)el.classList.add('sel')}$('statMistake').textContent=mistakes;$('statHint').textContent=hintLeft;$('statLevel').textContent=difficulty.charAt(0).toUpperCase()+difficulty.slice(1);$('noteBtn').className='key wide'+(noteMode?' on':'');$('sound').innerHTML=soundOn?'🔊<small>Suara</small>':'🔇<small>Suara</small>'}
function conflictsAt(r,c){const v=values[r][c];if(!v)return false;for(let i=0;i<9;i++){if(i!==c&&values[r][i]===v)return true;if(i!==r&&values[i][c]===v)return true}const br=r-r%3,bc=c-c%3;for(let i=0;i<3;i++)for(let j=0;j<3;j++){const rr=br+i,cc=bc+j;if((rr!==r||cc!==c)&&values[rr][cc]===v)return true}return false}
function setNumber(n){if(finished||selected<0)return;const r=(selected/9)|0,c=selected%9;if(given[r][c]){toast('Kotak petunjuk tidak bisa diubah.');return}if(noteMode){const arr=notes[selected];const at=arr.indexOf(n);if(at>=0)arr.splice(at,1);else arr.push(n);blip(600,880,.05,'sine',.03);render();save();return}if(values[r][c]===n){values[r][c]=0;render();save();return}values[r][c]=n;notes[selected]=[];const wrong=conflictsAt(r,c);if(wrong){mistakes++;blip(300,180,.18,'sawtooth',.05);toast('Angka itu bentrok dengan yang lain.')}else blip(700,1000,.07);render();save();if(wrong){const el=cells[selected];el.classList.add('bad');setTimeout(()=>{if(cells[selected])cells[selected].classList.remove('bad')},900)}checkDone()}
function erase(){if(finished||selected<0)return;const r=(selected/9)|0,c=selected%9;if(given[r][c]){toast('Kotak petunjuk tidak bisa dihapus.');return}values[r][c]=0;notes[selected]=[];blip(420,300,.06);render();save()}
function useHint(){if(finished)return;if(hintLeft<=0){toast('Bantuan sudah habis.');return}let target=-1;if(selected>=0&&!values[(selected/9)|0][selected%9]&&!given[(selected/9)|0][selected%9])target=selected;else{const empties=[];for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9;if(!values[r][c]&&!given[r][c])empties.push(i)}if(!empties.length){toast('Tidak ada kotak kosong.');return}target=empties[Math.floor(Math.random()*empties.length)]}const r=(target/9)|0,c=target%9;values[r][c]=solution[r][c];notes[target]=[];hintLeft--;selected=target;blip(880,1240,.1);infoEl.textContent='💡 Kotak disorot diisi dengan angka yang benar. Sisa bantuan: '+hintLeft;render();save();checkDone()}
function checkBoard(){if(finished)return;let wrong=0,empty=0;for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9;if(!values[r][c]){empty++;continue}if(values[r][c]!==solution[r][c]){wrong++;const el=cells[i];el.classList.add('bad');setTimeout(()=>{if(cells[i])cells[i].classList.remove('bad')},1400)}}if(!wrong&&!empty){infoEl.textContent='Semua benar dan penuh. Papan selesai!';return}infoEl.textContent=wrong?('Ada '+wrong+' angka yang masih salah, '+empty+' kotak kosong.'):('Sejauh ini semua benar. Tinggal '+empty+' kotak lagi.');blip(wrong?340:660,wrong?220:980,.12,wrong?'sawtooth':'triangle',.05)}
function checkDone(){let full=true;for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9;if(values[r][c]!==solution[r][c]){full=false;break}}if(!full)return;finished=true;clearInterval(timer);const secs=Math.floor((Date.now()-startAt)/1000);const bestKey=KEY+'-best-'+difficulty;let best=0;try{best=Number(localStorage.getItem(bestKey)||0)}catch{}const isBest=!best||secs<best;if(isBest){try{localStorage.setItem(bestKey,String(secs))}catch{}}resultIcon.textContent='🎉';resultTitle.textContent='Sudoku selesai!';resultText.textContent='Waktu '+Math.floor(secs/60)+' menit '+(secs%60)+' detik · salah '+mistakes+' kali · bantuan dipakai '+(3-hintLeft)+'. '+(isBest?'Rekor baru untuk level '+difficulty+'!':'Rekor level ini '+(best?Math.floor(best/60)+' menit '+(best%60)+' detik':'-')+'.');blip(720,1180,.13);setTimeout(()=>blip(980,1560,.15),140);overlay.classList.add('show');clearSaved();render()}
function save(){try{localStorage.setItem(KEY,JSON.stringify({difficulty,values,notes,given,solution,startAt,mistakes,hintLeft}))}catch{}}
function clearSaved(){try{localStorage.removeItem(KEY)}catch{}}
function loadSaved(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s||!s.values||!s.given)return false;difficulty=typeof s.difficulty==='string'&&TARGET[s.difficulty]?s.difficulty:'sedang';levelEl.value=difficulty;values=s.values.map(r=>r.map(v=>Number(v)||0));given=s.given.map(r=>r.map(v=>v?1:0));solution=Array.isArray(s.solution)&&s.solution.length===9?s.solution.map(r=>r.map(v=>Number(v)||0)):[];notes=Array.isArray(s.notes)&&s.notes.length===81?s.notes.map(a=>Array.isArray(a)?a.map(Number):[]):Array.from({length:81},()=>[]);mistakes=Number(s.mistakes)||0;hintLeft=Number.isFinite(s.hintLeft)?s.hintLeft:3;startAt=Number(s.startAt)||Date.now();return true}catch{return false}}
function restoreGame(){finished=false;selected=-1;statusEl.textContent=difficulty.charAt(0).toUpperCase()+difficulty.slice(1);buildBoard();render();timer=setInterval(tick,500);infoEl.textContent='Permainan sebelumnya dilanjutkan. Waktu masih berjalan dari terakhir kamu menyimpan.'}
function restart(){if(!solution.length)return;for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9;if(!given[r][c])values[r][c]=0;notes[i]=[]}mistakes=0;selected=-1;finished=false;startAt=Date.now();clearInterval(timer);timer=setInterval(tick,500);infoEl.textContent='Soal dikembalikan ke kondisi awal.';render();save()}
function revealAll(){if(!solution.length)return;for(let i=0;i<81;i++){const r=(i/9)|0,c=i%9;values[r][c]=solution[r][c];notes[i]=[]}finished=true;clearInterval(timer);clearSaved();render();infoEl.textContent='Semua jawaban ditampilkan. Tekan Soal Baru untuk tantangan lagi.';resultIcon.textContent='👁️';resultTitle.textContent='Jawaban dibuka';resultText.textContent='Berikutnya coba selesaikan sendiri ya — tekan Soal Baru.';overlay.classList.add('show')}
document.querySelectorAll('.key[data-num]').forEach(b=>b.addEventListener('click',()=>setNumber(Number(b.dataset.num))));
$('erase').addEventListener('click',erase);$('noteBtn').addEventListener('click',()=>{noteMode=!noteMode;infoEl.textContent=noteMode?'Mode catatan aktif: angka akan ditandai sebagai kemungkinan.':'Mode catatan mati: angka langsung mengisi kotak.';render()});
$('hintBtn').addEventListener('click',useHint);$('checkBtn').addEventListener('click',checkBoard);$('sound').addEventListener('click',()=>{soundOn=!soundOn;if(soundOn)blip(660,980,.07);render()});
$('newGame').addEventListener('click',()=>newGame());$('againBtn').addEventListener('click',()=>{overlay.classList.remove('show');newGame()});$('closeBtn').addEventListener('click',()=>overlay.classList.remove('show'));
$('restart').addEventListener('click',restart);$('reveal').addEventListener('click',revealAll);levelEl.addEventListener('change',()=>newGame(levelEl.value));
if(loadSaved()&&countSavedGivens()&&solution.length===9){restoreGame()}else{newGame()}
function countSavedGivens(){let n=0;for(let i=0;i<81;i++)if(given[(i/9)|0][i%9])n++;return n>=17}
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
button,[role="button"],.btn,.key,.cell,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
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
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🔢', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Sudoku 🔢',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-sudoku-2026',
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

handler.help = ['sudoku', 'sudokugame']
handler.tags = ['game']
handler.command = /^(sudoku|sudokugame)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Sudoku Nano Ai — soal digenerate sendiri (solusi tunggal), 3 tingkat, catatan pensil dan bantuan'

export default handler
