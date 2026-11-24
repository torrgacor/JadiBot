/*
⌬ Nano Ai · Game Plugin · Idle Tycoon 💰
*/

'use strict'

/* ==========================================================================
   Nano Ai · Idle Tycoon 💰
   Bangun bisnis, kumpulkan uang pasif walau game ditutup (bonus offline).
   6 bisnis dengan harga & income naik. Upgrade: naikkan level (income ×),
   manajer otomatis, dan prestise (reset dgn bonus permanen).
   Semua tersimpan di localStorage.
   ========================================================================== */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#132916">
<title>Nano Ai Idle Tycoon</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#0b130c;color:#eafbe9;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#1a3320,#10200f);border:1px solid #3c7040;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#8bc34a,#33691e);font-size:20px;box-shadow:0 3px 0 #1b3d0f,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#9ccf9f;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px}
.hb{width:34px;height:34px;border:1px solid #4a8a4e;border-radius:10px;background:linear-gradient(180deg,#244626,#17301a);color:#eafbe9;font-size:15px;box-shadow:0 3px 0 #0a180b}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #0a180b}
.wallet{display:flex;align-items:center;gap:6px;background:#152b17;border:1px solid #3c7040;border-radius:13px;padding:8px 10px;margin-bottom:8px}
.money{flex:1;font:950 17px system-ui;color:#ffd23f;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rate{color:#9ccf9f;font:800 8.5px system-ui;white-space:nowrap}
.biz{display:flex;align-items:center;gap:9px;background:#152b17;border:1px solid #3c7040;border-radius:14px;padding:9px;margin-bottom:7px;box-shadow:0 3px 0 #0a180b}
.biz .ic{width:42px;height:42px;flex:none;display:grid;place-items:center;border-radius:11px;font-size:22px;background:#0e1f10;border:1px solid #3c7040}
.biz .mid{flex:1;min-width:0}
.biz .nm{font:900 11px system-ui;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.biz .lv{color:#9ccf9f;font:800 8px system-ui;margin-top:1px}
.biz .inc{color:#ffd23f;font:800 9px system-ui;margin-top:2px}
.biz .btns{display:flex;flex-direction:column;gap:4px;flex:none}
.bb{min-width:74px;padding:6px 8px;border:1px solid #4a8a4e;border-radius:9px;background:linear-gradient(180deg,#2c5a30,#1d3d20);color:#eafbe9;font:900 9px system-ui;box-shadow:0 2px 0 #0a180b;touch-action:manipulation;white-space:nowrap}
.bb:active{transform:translateY(1px);box-shadow:0 1px 0 #0a180b}
.bb:disabled{filter:saturate(.25) brightness(.75)}
.bb.mgr{background:linear-gradient(180deg,#4a6fa5,#2c4a75);border-color:#7ba3d4}
.bb.prest{background:linear-gradient(180deg,#c9a75f,#8a6628);border-color:#ffe793;color:#241a08}
.collect{display:block;width:100%;margin-top:4px;min-height:46px;border:1px solid #ffe793;border-radius:12px;background:linear-gradient(180deg,#ffd23f,#e09012);color:#3d2600;font:950 13px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #7c4407}
.collect:active{transform:translateY(2px);box-shadow:0 2px 0 #7c4407}
.stats{display:flex;gap:6px;margin-top:8px}
.stat{flex:1;text-align:center;background:#152b17;border:1px solid #3c7040;border-radius:11px;padding:6px}
.stat b{display:block;color:#ffd23f;font:950 12px system-ui}
.stat span{color:#9ccf9f;font:800 7.5px system-ui;letter-spacing:.06em}
.toast{position:fixed;left:50%;top:14px;transform:translate(-50%,-30px);padding:7px 13px;border-radius:999px;background:#0e1f10e6;border:1px solid #4a8a4e;color:#eafbe9;font:900 9px system-ui;opacity:0;transition:.2s;pointer-events:none;white-space:nowrap;z-index:50;max-width:92vw;overflow:hidden;text-overflow:ellipsis}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:fixed;inset:0;z-index:40;display:grid;place-items:center;background:#060c07e8;backdrop-filter:blur(7px);padding:14px}
.ov.hide{display:none}
.card2{width:min(100%,360px);text-align:center;padding:16px 14px;border:1px solid #4a8a4e;border-radius:16px;background:linear-gradient(180deg,#1a3320,#0f1f10);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:20px;font-weight:950;color:#c5f0c8;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#9ccf9f;font-size:9px;line-height:1.7}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #c5f0c8;border-radius:12px;background:linear-gradient(180deg,#8bc34a,#33691e);color:#0b2405;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #1b3d0f}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #1b3d0f}
.gbtn.warn{background:linear-gradient(180deg,#e57373,#b71c1c);border-color:#ffcdd2;color:#fff}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">💰</div>
        <div>
          <div class="title">IDLE TYCOON</div>
          <div class="sub">bisnis jalan sendiri · kaya makin kaya</div>
        </div>
      </div>
      <div class="hbtns">
        <button class="hb" id="bSound">🔊</button>
        <button class="hb" id="bInfo">ℹ️</button>
      </div>
    </div>
    <div class="wallet">
      <div class="money" id="money">🪙 0</div>
      <div class="rate" id="rate">+0/dtk</div>
    </div>
    <div id="bizList"></div>
    <button class="collect" id="bCollect">🫳 KUMPULKAN SEMUA</button>
    <div class="stats">
      <div class="stat"><b id="sTotal">0</b><span>TOTAL TERKUMPUL</span></div>
      <div class="stat"><b id="sMgr">0</b><span>MANAJER</span></div>
      <div class="stat"><b id="sPrest">0</b><span>PRESTISE</span></div>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>
<div class="ov hide" id="ovInfo">
  <div class="card2">
    <div class="big">💰 CARA MAIN</div>
    <div class="small">• Beli bisnis → income pasif mengalir sendiri<br>• <b style="color:#ffd23f">UPGRADE</b> menaikkan level &amp; income<br>• <b style="color:#7ba3d4">MANAJER</b> = klik sekali jalan terus otomatis<br>• Tutup game pun uang tetap masuk (maks 8 jam)<br>• <b style="color:#ffe793">PRESTISE</b>: reset dgn bonus +25% permanen tiap lapis</div>
    <button class="gbtn" id="bCloseInfo">MENGERTI!</button>
  </div>
</div>
<div class="ov hide" id="ovPrest">
  <div class="card2">
    <div class="big">✨ PRESTISE</div>
    <div class="small" id="prestInfo"></div>
    <button class="gbtn" id="bDoPrest">✨ LAKUKAN PRESTISE</button>
    <button class="gbtn warn" id="bCancelPrest">BATAL</button>
  </div>
</div>
<script>
(function(){
var BIZ=[
  {ic:'🍋',nm:'Jual Lemonade',base:60,inc:1.2,mgr:300},
  {ic:'📰',nm:'Kios Koran',base:450,inc:6,mgr:1800},
  {ic:'🍕',nm:'Pizzeria',base:3200,inc:38,mgr:12000},
  {ic:'🚗',nm:'Dealer Mobil',base:24000,inc:260,mgr:90000},
  {ic:'🏦',nm:'Bank Investasi',base:180000,inc:1900,mgr:650000},
  {ic:'🚀',nm:'Antariksa Inc.',base:1400000,inc:15000,mgr:4800000}
];
/* income minimum pemain baru: lemonade Lv1 tanpa manajer = 0.4/dtk
   → diberi tenda awal 2/dtk via uang awal lebih besar agar progres terasa */
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var sOn=stGet('nano-tycoon-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={buy:function(){tone(600,0.08,'square',0.1,180)},coin:function(){tone(900,0.07,'sine',0.12,240)},prest:function(){tone(523,0.12,'sine',0.14);setTimeout(function(){tone(659,0.12,'sine',0.14)},130);setTimeout(function(){tone(880,0.3,'sine',0.16)},260)}};
function fmt(n){
  if(n>=1e12)return (n/1e12).toFixed(2)+'T';
  if(n>=1e9)return (n/1e9).toFixed(2)+'M';
  if(n>=1e6)return (n/1e6).toFixed(2)+'jt';
  if(n>=1e3)return (n/1e3).toFixed(1)+'rb';
  return Math.floor(n)+'';
}
var S=null;
function fresh(){return {money:250,total:0,biz:BIZ.map(function(){return {lv:0,mgr:false}}),prest:0,last:Date.now(),best:0}}
function load(){
  try{
    var s=stGet('nano-tycoon');
    S=s?JSON.parse(s):fresh();
    if(!S.biz||S.biz.length!==BIZ.length)S=fresh();
  }catch(e){S=fresh()}
  /* bonus offline: income/dtk × waktu (maks 8 jam) */
  var per=perSec();
  if(per>0){
    var dt=Math.min(8*3600,(Date.now()-S.last)/1000);
    var earn=per*dt;
    if(earn>1){
      S.money+=earn;S.total+=earn;
      setTimeout(function(){toast('💰 Bonus offline: 🪙'+fmt(earn)+' ('+Math.floor(dt/60)+' mnt)')},400);
    }
  }
  S.last=Date.now();
}
function save(){S.last=Date.now();stSet('nano-tycoon',JSON.stringify(S))}
function upCost(i){
  var lv=S.biz[i].lv;
  return Math.floor(BIZ[i].base*Math.pow(1.15,lv));
}
function bizIncome(i){
  var lv=S.biz[i].lv;
  if(!lv)return 0;
  return BIZ[i].inc*lv*(1+S.prest*0.25);
}
function perSec(){
  /* income pasif penuh bila ada manajer; tanpa manajer 34% (kumpulkan manual) */
  var s=0;
  for(var i=0;i<BIZ.length;i++)s+=bizIncome(i)*(S.biz[i].mgr?1:0.34);
  return s;
}
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1800)}
function buildList(){
  var el=document.getElementById('bizList');
  el.innerHTML='';
  for(var i=0;i<BIZ.length;i++){(function(i){
    var d=document.createElement('div');d.className='biz';
    d.innerHTML='<div class="ic">'+BIZ[i].ic+'</div>'+
      '<div class="mid"><div class="nm">'+BIZ[i].nm+'</div><div class="lv">Lv <span id="lv'+i+'">0</span></div><div class="inc" id="inc'+i+'">🪙0/dtk</div></div>'+
      '<div class="btns"><button class="bb" id="buy'+i+'">🛒 UPGRADE</button><button class="bb mgr" id="mgr'+i+'">👔 MANAJER</button></div>';
    el.appendChild(d);
    document.getElementById('buy'+i).addEventListener('click',function(){ensureAC();
      var c=upCost(i);
      if(S.money<c){toast('🪙 Butuh '+fmt(c)+' — kumpulkan lagi!');return}
      S.money-=c;S.biz[i].lv++;SFX.buy();refresh();
    });
    document.getElementById('mgr'+i).addEventListener('click',function(){ensureAC();
      if(S.biz[i].mgr){toast('Manajer sudah dipasang');return}
      if(S.money<BIZ[i].mgr){toast('👔 Butuh '+fmt(BIZ[i].mgr)+' untuk manajer');return}
      S.money-=BIZ[i].mgr;S.biz[i].mgr=true;SFX.buy();refresh();
      toast('👔 Manajer '+BIZ[i].nm+' dipekerjakan!');
    });
  })(i)}
  var pr=document.createElement('button');
  pr.className='bb prest';pr.style.cssText='display:block;width:100%;margin-top:6px;min-height:40px;font-size:11px';
  pr.id='bPrest';pr.textContent='✨ PRESTISE';
  pr.addEventListener('click',function(){ensureAC();
    var gain=S.prest+1;
    document.getElementById('prestInfo').innerHTML='Reset semua bisnis &amp; uang.<br>Dapat <b style="color:#ffd23f">+'+(gain*25)+'% income permanen</b> selamanya.<br>Prestise saat ini: '+S.prest;
    document.getElementById('ovPrest').classList.remove('hide');
  });
  el.appendChild(pr);
}
function refresh(){
  document.getElementById('money').textContent='🪙 '+fmt(S.money);
  document.getElementById('rate').textContent='+'+fmt(perSec())+'/dtk';
  document.getElementById('sTotal').textContent=fmt(S.total);
  var mgrN=0;for(var i=0;i<BIZ.length;i++)if(S.biz[i].mgr)mgrN++;
  document.getElementById('sMgr').textContent=mgrN+'/6';
  document.getElementById('sPrest').textContent=S.prest+' (+'+(S.prest*25)+'%)';
  for(var j=0;j<BIZ.length;j++){
    document.getElementById('lv'+j).textContent=S.biz[j].lv;
    document.getElementById('inc'+j).textContent='🪙'+fmt(bizIncome(j))+'/dtk'+(S.biz[j].mgr?' 👔':'');
    var b=document.getElementById('buy'+j);
    b.textContent='🛒 '+fmt(upCost(j));
    b.disabled=S.money<upCost(j);
    var m=document.getElementById('mgr'+j);
    m.textContent=S.biz[j].mgr?'👔 AKTIF':'👔 '+fmt(BIZ[j].mgr);
    m.disabled=S.biz[j].mgr||S.money<BIZ[j].mgr;
  }
}
var lastTick=0,accum=0;
function loop(ts){
  var dt=Math.min(0.5,(ts-lastTick)/1000||0);lastTick=ts;
  if(S){
    var per=perSec();
    var add=per*dt;
    if(add>0){S.money+=add;S.total+=add}
    accum+=dt;
    if(accum>1){accum=0;refresh();save()}
  }
  requestAnimationFrame(loop);
}
document.getElementById('bCollect').addEventListener('click',function(){ensureAC();
  /* bonus aktif: kumpulkan income 30 detik sekaligus */
  var bonus=perSec()*30;
  S.money+=bonus;S.total+=bonus;SFX.coin();refresh();
  toast('🫳 +🪙'+fmt(bonus)+' (income 30 dtk)');
});
document.getElementById('bDoPrest').addEventListener('click',function(){
  var baru=S.prest+1;
  S=fresh();S.prest=baru;
  SFX.prest();save();buildList();refresh();
  document.getElementById('ovPrest').classList.add('hide');
  toast('✨ Prestise '+baru+'! Income +'+(baru*25)+'% permanen');
});
document.getElementById('bCancelPrest').addEventListener('click',function(){document.getElementById('ovPrest').classList.add('hide')});
document.getElementById('bInfo').addEventListener('click',function(){document.getElementById('ovInfo').classList.remove('hide')});
document.getElementById('bCloseInfo').addEventListener('click',function(){document.getElementById('ovInfo').classList.add('hide')});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('nano-tycoon-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
window.addEventListener('beforeunload',save);
load();buildList();refresh();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '💰', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Nano Ai Idle Tycoon 💰', 'nano-ai-tycoon-2026', html)
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

handler.help = ['tycoon', 'idletycoon', 'bisnis']
handler.tags = ['game']
handler.command = /^(tycoon|idletycoon|bisnis)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Idle Tycoon - bangun 6 bisnis, income pasif + bonus offline, manajer & prestise'

export default handler
