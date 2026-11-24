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

import { randomUUID } from 'node:crypto'

let handler = async (m, { conn }) => {
  const html = `
<style>
*{
  -webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;
  user-select:none;
  -webkit-touch-callout:none
}

body{
  margin:0;
  background:#0a0a0f;
  font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color:#eee;
  touch-action:manipulation;
}

.wrap{
  width:100%;
  max-width:620px;
  margin:auto;
  padding:10px;
  box-sizing:border-box
}

.box{
  background:#12131c;
  border:1px solid #222536;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 12px 40px rgba(0,0,0,.9)
}

.head{
  padding:12px 16px;
  border-bottom:1px solid #222536;
  display:flex;
  justify-content:space-between;
  align-items:center;
  background:#181a26;
}

.title-group{
  display:flex;
  flex-direction:column;
}

.title{
  font-size:16px;
  font-weight:900;
  letter-spacing:1.5px;
  color:#f1c40f;
  text-transform:uppercase;
  text-shadow:0 0 10px rgba(241, 196, 15, 0.5);
}

.subtitle{
  font-size:8px;
  color:#e67e22;
  letter-spacing:1px;
  font-weight:bold;
}

.right-head{
  display:flex;
  align-items:center;
  gap:10px;
}

.sound-btn{
  background:#222536;
  border:1px solid #f1c40f;
  border-radius:8px;
  padding:4px 8px;
  font-size:12px;
  cursor:pointer;
  user-select:none;
}

.scorebox{
  display:flex;
  gap:10px;
  text-align:center;
}

.score-item{
  display:flex;
  flex-direction:column;
}

.score-label{
  font-size:8px;
  color:#a4b0be;
  font-weight:bold;
}

.score-val{
  font-size:13px;
  font-weight:bold;
  color:#2ecc71;
}

.content{
  padding:14px;
  background:#0c0d14;
}

.grid-container{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:8px;
  background:#050508;
  padding:10px;
  border-radius:12px;
  border:2px solid #222536;
  box-shadow:inset 0 0 15px rgba(0,0,0,0.8);
}

.slot-box{
  background:#181a26;
  border:2px solid #34495e;
  border-radius:10px;
  height:75px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:36px;
  box-shadow:0 4px 8px rgba(0,0,0,0.5);
  transition:border-color 0.2s, transform 0.1s;
}

.slot-box.win{
  border-color:#f1c40f;
  background:#2c3e50;
  animation:bounce 0.4s infinite alternate;
}

@keyframes bounce{
  from{ transform:scale(1); }
  to{ transform:scale(1.05); }
}

.bet-controls{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-top:14px;
  background:#181a26;
  padding:8px 12px;
  border-radius:10px;
  border:1px solid #222536;
}

.bet-label{
  font-size:11px;
  font-weight:bold;
  color:#a4b0be;
}

.bet-btn-group{
  display:flex;
  gap:6px;
}

.btn-bet{
  background:#222536;
  border:1px solid #34495e;
  border-radius:6px;
  color:#fff;
  padding:6px 10px;
  font-size:11px;
  font-weight:bold;
  cursor:pointer;
}

.btn-bet:active{
  background:#f1c40f;
  color:#000;
}

.btn-spin{
  width:100%;
  margin-top:12px;
  padding:14px;
  background:linear-gradient(180deg, #f1c40f, #e67e22);
  border:1px solid #f39c12;
  border-radius:10px;
  color:#000;
  font-size:16px;
  font-weight:900;
  letter-spacing:1px;
  cursor:pointer;
  box-shadow:0 4px 15px rgba(241, 196, 15, 0.3);
  transition:all 0.1s;
}

.btn-spin:active{
  transform:scale(0.98);
  background:#e67e22;
}

#status{
  text-align:center;
  margin-top:10px;
  font-size:11px;
  color:#a4b0be;
  font-weight:bold;
}
</style>

<body>

<div class="wrap">
  <div class="box">

    <div class="head">
      <div class="title-group">
        <div class="title">FRUIT SLOT 🎰</div>
        <div class="subtitle">CASINO MINI • 3X3 GRID</div>
      </div>

      <div class="right-head">
        <div class="scorebox">
          <div class="score-item">
            <div class="score-label">SALDO</div>
            <div class="score-val" id="balance">$10,000</div>
          </div>
        </div>
        <div class="sound-btn" id="btnSound">🔊</div>
      </div>
    </div>

    <div class="content">
      <div class="grid-container">
        <div class="slot-box" id="b0">🍒</div>
        <div class="slot-box" id="b1">🍋</div>
        <div class="slot-box" id="b2">🍉</div>
        <div class="slot-box" id="b3">🍇</div>
        <div class="slot-box" id="b4">🔔</div>
        <div class="slot-box" id="b5">🍎</div>
        <div class="slot-box" id="b6">🍓</div>
        <div class="slot-box" id="b7">💎</div>
        <div class="slot-box" id="b8">7️⃣</div>
      </div>

      <div class="bet-controls">
        <div class="bet-label">TARUHAN (BET): <span id="betText" style="color:#f1c40f;">$100</span></div>
        <div class="bet-btn-group">
          <div class="btn-bet" id="btnBetMinus">-50</div>
          <div class="btn-bet" id="btnBetPlus">+50</div>
          <div class="btn-bet" id="btnBetMax">MAX</div>
        </div>
      </div>

      <button class="btn-spin" id="btnSpin">🎰 PUTAR (SPIN)</button>

      <div id="status">Atur jumlah Bet lalu tekan PUTAR!</div>
    </div>

  </div>
</div>

<script>

var FRUITS = ['🍒', '🍋', '🍉', '🍇', '🔔', '🍎', '🍓', '💎', '7️⃣']

var balance = 10000
var bet = 100
var isSpinning = false
var soundOn = true
var audioCtx = null

var balanceEl = document.getElementById('balance')
var betTextEl = document.getElementById('betText')
var statusEl = document.getElementById('status')

var btnBetMinus = document.getElementById('btnBetMinus')
var btnBetPlus = document.getElementById('btnBetPlus')
var btnBetMax = document.getElementById('btnBetMax')
var btnSpin = document.getElementById('btnSpin')
var btnSound = document.getElementById('btnSound')

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playTone(freq, duration, type, volume) {
  if (!soundOn) return
  try {
    var audio = getAudio()
    var osc = audio.createOscillator()
    var gain = audio.createGain()
    osc.type = type || 'sine'
    osc.frequency.setValueAtTime(freq, audio.currentTime)
    gain.gain.setValueAtTime(0.0001, audio.currentTime)
    gain.gain.exponentialRampToValueAtTime(volume || 0.1, audio.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (duration || 0.1))
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start()
    osc.stop(audio.currentTime + (duration || 0.1) + 0.05)
  } catch(e){}
}

function spinSound() { playTone(400, 0.05, 'square', 0.05) }
function winSound() { 
  playTone(523, 0.1, 'sine', 0.15)
  setTimeout(function(){ playTone(659, 0.1, 'sine', 0.15) }, 80)
  setTimeout(function(){ playTone(783, 0.2, 'sine', 0.2) }, 160)
}
function jackpotSound() {
  playTone(880, 0.15, 'triangle', 0.2)
  setTimeout(function(){ playTone(1174, 0.3, 'triangle', 0.25) }, 120)
}

function formatMoney(num) {
  return '$' + num.toLocaleString()
}

function updateUI() {
  balanceEl.textContent = formatMoney(balance)
  betTextEl.textContent = formatMoney(bet)
}

function clearWinEffects() {
  for (var i = 0; i < 9; i++) {
    document.getElementById('b' + i).classList.remove('win')
  }
}

function getRandomFruit() {
  return FRUITS[Math.floor(Math.random() * FRUITS.length)]
}

function startSpin() {
  if (isSpinning) return
  if (balance < bet) {
    statusEl.textContent = '❌ Saldo tidak cukup!'
    return
  }

  isSpinning = true
  balance -= bet
  updateUI()
  clearWinEffects()
  statusEl.textContent = 'Memutar slot...'

  var intervals = []
  var results = new Array(9)

  for (var i = 0; i < 9; i++) {
    (function(index) {
      intervals[index] = setInterval(function() {
        var randomIcon = getRandomFruit()
        document.getElementById('b' + index).textContent = randomIcon
        spinSound()
      }, 60)

      setTimeout(function() {
        clearInterval(intervals[index])
        results[index] = getRandomFruit()
        document.getElementById('b' + index).textContent = results[index]

        if (index === 8) {
          isSpinning = false
          checkWin(results)
        }
      }, 600 + index * 120)
    })(i)
  }
}

function checkWin(res) {
  var lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ]

  var winAmount = 0
  var winningBoxes = {}

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var a = res[line[0]]
    var b = res[line[1]]
    var c = res[line[2]]

    if (a === b && b === c) {
      var multiplier = 5
      if (a === '💎') multiplier = 10
      if (a === '7️⃣') multiplier = 20

      winAmount += bet * multiplier
      winningBoxes[line[0]] = true
      winningBoxes[line[1]] = true
      winningBoxes[line[2]] = true
    }
  }

  if (winAmount > 0) {
    balance += winAmount
    updateUI()

    for (var boxIndex in winningBoxes) {
      document.getElementById('b' + boxIndex).classList.add('win')
    }

    if (winAmount >= bet * 10) {
      jackpotSound()
      statusEl.textContent = '🔥 JACKPOT BANJIR CUSH! MENANG ' + formatMoney(winAmount) + ' 🔥'
    } else {
      winSound()
      statusEl.textContent = '🎉 MENANG ' + formatMoney(winAmount) + '!'
    }
  } else {
    statusEl.textContent = 'Belum beruntung, coba lagi!'
  }
}

btnBetMinus.addEventListener('click', function() {
  if (isSpinning) return
  if (bet > 50) {
    bet -= 50
    updateUI()
  }
})

btnBetPlus.addEventListener('click', function() {
  if (isSpinning) return
  if (bet + 50 <= balance) {
    bet += 50
    updateUI()
  }
})

btnBetMax.addEventListener('click', function() {
  if (isSpinning) return
  bet = Math.max(50, Math.min(balance, 2000))
  updateUI()
})

btnSpin.addEventListener('click', startSpin)

btnSound.addEventListener('click', function() {
  soundOn = !soundOn
  btnSound.textContent = soundOn ? '🔊' : '🔇'
  btnSound.style.borderColor = soundOn ? '#f1c40f' : '#e74c3c'
})

updateUI()

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
.box{border-radius:26px!important;box-shadow:inset 0 3px 0 rgba(255,255,255,.4),inset 0 -8px 20px rgba(0,0,0,.6),0 20px 44px rgba(0,0,0,.6),0 0 0 2px rgba(0,0,0,.5)!important}
.slot-box{border-radius:14px!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.16),inset 9px 0 14px rgba(0,0,0,.45),inset -9px 0 14px rgba(0,0,0,.45),0 8px 18px rgba(0,0,0,.45)!important}
.grid-container{border-radius:16px!important;box-shadow:inset 0 0 0 2px rgba(0,0,0,.5),inset 0 10px 24px rgba(0,0,0,.55),0 12px 28px rgba(0,0,0,.5)!important}
.btn-spin{border-radius:50%!important;box-shadow:inset 0 5px 8px rgba(255,255,255,.5),inset 0 -7px 12px rgba(0,0,0,.5),0 7px 0 rgba(0,0,0,.5),0 14px 28px rgba(0,0,0,.5),0 0 26px rgba(255,210,80,.4)!important}
.score-item{border-radius:10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 4px 10px rgba(0,0,0,.4)!important}
.sound-btn{border-radius:50%!important;box-shadow:inset 0 2px 0 rgba(255,255,255,.3),0 4px 0 rgba(0,0,0,.45)!important}
</style>
</body>
`

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: randomUUID()
        }
      },

      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,

            submessages: [
              {
                messageType: 2,
                messageText: 'FRUIT SLOT 🎰'
              }
            ],

            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: randomUUID(),

                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename:
                            'GenAIaeacdsnwHtmlPrimitive',

                          payload: html,

                          trusted_sources: []
                        },

                        __typename:
                          'GenAISingleLayoutViewModel'
                      }
                    }
                  ]
                })
              ).toString('base64')
            },

            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,

              forwardedAiBotMessageInfo: {
                botJid: '0@bot'
              },

              forwardOrigin: 4
            }
          }
        }
      }
    },
    {}
  )
}

handler.help = ['fruitslot']
handler.tags = ['game']
handler.category = 'game'
handler.command = /^fruitslot$/i
handler.description = 'Fruit Slot 3x3'
handler.limit = false

export default handler
