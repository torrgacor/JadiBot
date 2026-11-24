/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘█▀█ █ █▀█ █▀█   ▄▀█ █
┇ █  █ █ █▀▄ █▄█   █▀█ █
┇  ▀█  --N--a--n--o------A--i-----
┇
┇ ━━━[ 🎮 GAME ]━━━━
┇ MAHJONG WAYS 2 — slot gaya PG Soft: grid 4-5-5-5-4, 2000 ways,
┇ kaskade, pengali progresif, Gold Plated jadi WILD, free spin.
┇ Tampilan tema Chinese premium (merah/emas, ornamen naga), animasi
┇ reel berbasis requestAnimationFrame, Audio Manager terpusat.
⌬
*/

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#5d0a0c">
<title>Nano Ai Mahjong Ways 2</title>
<style>
:root{
 --red:#7e0c10;--red2:#bd1d18;--or:#e0731a;--or2:#f7ab3c;
 --gold:#f2ca70;--gold2:#fff2c6;--gold3:#b8862c;--gold4:#6d4a0c;
 --jade:#0d6a4c;--jade2:#37cf95;--ivory:#fbf7ea;--ink:#2b1506;
 --card:#2a0810;--card2:#3d0d14;
 --fst:12px;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html{height:100%}
body{
 background:#3d0509;
 color:var(--ivory);font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;
 display:flex;justify-content:center;overflow-x:hidden;min-height:100vh;
 padding:calc(3px + env(safe-area-inset-top)) 2px calc(4px + env(safe-area-inset-bottom))
}
/* ---------- latar fantasi Chinese ----------
   Satu lapisan ber-z-index:-1 => selalu DI BELAKANG semua UI, jadi tidak mungkin
   menutupi panel/tombol (dulu lapisan latar pernah menembus panel semi-transparan). */
.bgfx{position:fixed;left:0;right:0;top:0;bottom:0;z-index:-1;pointer-events:none;overflow:hidden;
 background:
  radial-gradient(78% 40% at 50% 42%,rgba(255,214,130,.34) 0%,rgba(255,150,40,0) 72%),
  radial-gradient(120% 58% at 50% 106%,rgba(255,203,96,.55) 0%,rgba(255,150,40,0) 60%),
  radial-gradient(90% 44% at 50% -12%,rgba(255,130,60,.45) 0%,rgba(255,130,60,0) 72%),
  radial-gradient(120% 76% at 50% 46%,rgba(0,0,0,0) 40%,rgba(38,0,4,.58) 100%),
  linear-gradient(180deg,#5c060c 0%,#8f0f11 22%,#c03612 48%,#8a1208 76%,#43060a 100%)}
.bgfx .cl{position:absolute;left:0;top:0;right:0;bottom:0;opacity:.14;
 background-image:
  radial-gradient(circle at 30% 42%,rgba(255,236,180,.85) 0 17%,rgba(255,236,180,0) 18%),
  radial-gradient(circle at 70% 42%,rgba(255,236,180,.85) 0 17%,rgba(255,236,180,0) 18%),
  radial-gradient(circle at 50% 66%,rgba(255,236,180,.8) 0 25%,rgba(255,236,180,0) 26%);
 background-size:92px 44px}
.bgfx .sv{position:absolute;bottom:-2%;height:min(76%,600px);width:auto;opacity:.19;
 filter:drop-shadow(0 0 22px rgba(255,180,80,.4))}
.bgfx .sv.l{left:-5%}
.bgfx .sv.r{right:-5%;transform:scaleX(-1)}
@supports (min-height:100dvh){body{min-height:100dvh}}
.wrap{display:flex;align-items:stretch;justify-content:center;gap:8px;width:100%;max-width:640px}
.app{position:relative;width:min(100%,440px);flex:1 1 auto;min-width:0}

/* ---------- ornamen naga kiri/kanan ----------
   Diberi RUANG NYATA (bukan position:fixed), jadi tidak menembus panel.
   Di layar HP tempatnya tidak cukup -> disembunyikan. */
.side{display:none;flex:0 0 62px;position:relative;opacity:.55;pointer-events:none;
 filter:drop-shadow(0 0 10px rgba(255,196,96,.35))}
.side svg{width:100%;height:100%;display:block}
.side.r{transform:scaleX(-1)}
@media (min-width:700px){.side{display:block}}

/* ---------- header ---------- */
.hud{display:flex;align-items:center;gap:6px;margin-bottom:4px}
.brand{display:flex;align-items:center;gap:7px;min-width:0}
.seal{width:27px;height:27px;flex:0 0 auto;border-radius:8px;display:grid;place-items:center;
 background:linear-gradient(180deg,#ffe6a8,#e0a93c 52%,#9c6c14);color:#56190a;
 font:900 12px/1 "Noto Sans CJK SC","Noto Sans SC","PingFang SC",system-ui,sans-serif;
 box-shadow:0 0 0 1px #7d5510,0 2px 6px rgba(0,0,0,.5),inset 0 1px 0 #fff8dc}
.ttl{font:900 12.5px/1.1 system-ui;letter-spacing:.1em;color:var(--gold2);text-shadow:0 1px 0 #59100a,0 0 12px rgba(255,196,96,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ttl em{font-style:normal;color:#fff}
.ttl b{color:var(--or2);font-size:14px}
.ways{margin-left:auto;flex:0 0 auto;text-align:center;padding:3px 10px;border-radius:999px;
 background:linear-gradient(180deg,rgba(255,236,180,.28),rgba(90,26,8,.55));
 border:1px solid var(--gold3);font:900 11px system-ui;color:var(--gold2);
 box-shadow:inset 0 1px 0 rgba(255,246,214,.5),0 2px 6px rgba(0,0,0,.4);text-shadow:0 0 8px rgba(255,196,96,.6)}
.ways em{font-style:normal;font-size:8px;letter-spacing:.14em;opacity:.85}

/* ---------- statistik (dipadatkan: papan dapat ruang lebih besar) ---------- */
.stats{display:flex;gap:3px;margin-bottom:3px}
.kv{flex:1;min-width:0;border-radius:8px;padding:2px 5px;
 background:linear-gradient(180deg,rgba(122,30,24,.66),rgba(58,10,12,.84));
 border:1px solid rgba(184,134,44,.5);box-shadow:inset 0 1px 0 rgba(255,236,180,.3)}
.kv b{display:block;font:800 6px system-ui;letter-spacing:.12em;color:#e5c489;opacity:.9}
.kv i{display:block;font:900 11.5px system-ui;font-style:normal;color:var(--gold2);white-space:nowrap;overflow:hidden;line-height:1.15;
 text-shadow:0 1px 0 rgba(60,10,4,.6)}
.kv.w i{color:#8dffc9}

/* ---------- tangga pengali (melengkung) ---------- */
.ladBox{position:relative;margin:0 0 3px;padding:3px 5px 4px;border-radius:20px 20px 10px 10px;
 background:linear-gradient(180deg,rgba(255,232,172,.34),rgba(112,28,14,.58));
 border:1px solid var(--gold3);
 box-shadow:inset 0 1px 0 rgba(255,246,214,.5),inset 0 -6px 10px rgba(0,0,0,.25),0 3px 10px rgba(0,0,0,.4)}
.lad{display:flex;justify-content:center;gap:5px}
.lad i{position:relative;overflow:hidden;font:900 10.5px system-ui;font-style:normal;min-width:40px;text-align:center;
 padding:3px 6px 4px;border-radius:9px;
 background:linear-gradient(180deg,rgba(16,44,38,.95),rgba(8,24,22,.98));
 border:1px solid rgba(122,168,146,.35);color:#7d9a90;text-shadow:0 1px 0 rgba(0,0,0,.45);
 transition:color .22s,background .22s,box-shadow .22s,transform .22s,border-color .22s}
.lad i.next{color:var(--gold2);border-color:var(--gold3);background:linear-gradient(180deg,rgba(60,16,14,.95),rgba(24,5,9,.98))}
.lad i.on{background:linear-gradient(180deg,#fff8dd,#f2ca70 48%,#b8862c);border-color:#fff6d4;color:#3d1f04;
 text-shadow:0 1px 0 #fffbe8;
 box-shadow:0 0 18px rgba(255,206,110,.9),inset 0 1px 0 #fffdf2;transform:translateY(-1px) scale(1.12);
 animation:mpop .4s cubic-bezier(.2,1.5,.4,1)}
.lad i.on:after{content:"";position:absolute;left:-70%;top:0;width:45%;height:100%;
 background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.9),rgba(255,255,255,0));
 animation:mshw 2.1s linear infinite}
@keyframes mpop{0%{transform:translateY(0) scale(.86)}60%{transform:translateY(-2px) scale(1.18)}100%{transform:translateY(-1px) scale(1.12)}}
@keyframes mshw{from{transform:translateX(0)}to{transform:translateX(300%)}}

/* ---------- panggung / papan ---------- */
.stage{position:relative;overflow:hidden;border-radius:18px;padding:3px;
 /* meja laker merah menyala (bukan hitam pekat) + cahaya emas di belakang kartu */
 background:
  radial-gradient(76% 30% at 50% 0%,rgba(255,204,104,.28) 0%,rgba(255,150,40,0) 72%),
  radial-gradient(90% 40% at 50% 100%,rgba(255,170,70,.16) 0%,rgba(255,150,40,0) 70%),
  linear-gradient(180deg,#8d1614 0%,#711013 46%,#540a0e 100%);
 border:2px solid var(--gold3);
 box-shadow:
  0 0 0 1px rgba(255,246,214,.34) inset,
  0 0 0 3px rgba(109,74,12,.5),
  0 0 26px rgba(255,190,90,.3),
  0 16px 34px rgba(0,0,0,.55);
 transition:transform .22s cubic-bezier(.2,1.3,.5,1)}
.stage.zoom{transform:scale(1.014)}
.stage.shake{animation:shk .26s ease-out}
@keyframes shk{0%,100%{transform:translate3d(0,0,0)}28%{transform:translate3d(1.6px,-1.4px,0)}62%{transform:translate3d(-1.4px,1.2px,0)}}
/* sapuan cahaya menyilang papan */
.stage:after{content:"";position:absolute;left:-40%;top:-50%;width:55%;height:200%;z-index:2;pointer-events:none;
 background:linear-gradient(100deg,rgba(255,246,214,0),rgba(255,246,214,.09),rgba(255,246,214,0));
 transform:rotate(14deg);animation:swp 6s ease-in-out infinite}
@keyframes swp{0%,74%{transform:translateX(0) rotate(14deg);opacity:0}80%{opacity:1}100%{transform:translateX(320%) rotate(14deg);opacity:0}}
.cnr{position:absolute;width:13px;height:13px;border:2px solid var(--gold2);opacity:.66;border-radius:3px}
/* ornamen awan emas di 4 sudut papan (di belakang kartu, selalu terlihat di sela papan) */
.orn{position:absolute;left:0;right:0;top:0;bottom:0;z-index:0;pointer-events:none;opacity:.5;
 background-image:
  radial-gradient(circle at 34% 62%,rgba(255,236,180,1) 0 30%,rgba(255,236,180,0) 31%),
  radial-gradient(circle at 64% 34%,rgba(255,236,180,1) 0 26%,rgba(255,236,180,0) 27%);
 background-size:24px 15px;background-repeat:no-repeat;
 background-position:3px 3px,3px 3px,calc(100% - 3px) 3px,calc(100% - 3px) 3px,3px calc(100% - 3px),3px calc(100% - 3px),calc(100% - 3px) calc(100% - 3px),calc(100% - 3px) calc(100% - 3px)}
.cnr.a{left:3px;top:3px;border-right:0;border-bottom:0}
.cnr.b{right:3px;top:3px;border-left:0;border-bottom:0}
.cnr.c{left:3px;bottom:3px;border-right:0;border-top:0}
.cnr.d{right:3px;bottom:3px;border-left:0;border-top:0}
/* motif awan/relief halus di dalam papan (di belakang kartu, terpotong bingkai) */
.stage:before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;z-index:0;pointer-events:none;opacity:.17;
 background-image:
  repeating-linear-gradient(90deg,rgba(255,214,130,.85) 0 5px,rgba(255,214,130,0) 5px 10px),
  repeating-linear-gradient(90deg,rgba(255,214,130,.85) 0 5px,rgba(255,214,130,0) 5px 10px),
  radial-gradient(circle at 50% 45%,rgba(255,214,130,.9) 0 26%,rgba(0,0,0,0) 27%),
  radial-gradient(circle at 0% 45%,rgba(255,214,130,.75) 0 26%,rgba(0,0,0,0) 27%),
  radial-gradient(circle at 100% 45%,rgba(255,214,130,.75) 0 26%,rgba(0,0,0,0) 27%);
 background-size:100% 3px,100% 3px,44px 26px,44px 26px,44px 26px;
 background-position:0 3px,0 calc(100% - 3px),0 0,22px 13px,0 6px;
 background-repeat:repeat-x,repeat-x,repeat,repeat,repeat}
.reels{position:relative;z-index:1;display:flex;gap:var(--gp,4px);margin:0 auto;transform:perspective(1100px) rotateX(2.2deg)}
.col{position:relative;flex:1;height:var(--hh,0)}
.tl{position:absolute;left:0;top:0;width:100%;height:var(--ch,40px);will-change:transform}
.tl .face{position:absolute;left:0;right:0;top:0;bottom:0;border-radius:10px;overflow:hidden;
 background:linear-gradient(180deg,#fffefb 0%,#fdf8ea 34%,#efe0c0 70%,#cfba8c 100%);
 box-shadow:
  inset 0 1px 0 rgba(255,255,255,1),
  inset 0 0 0 1px rgba(255,255,255,.85),
  inset 0 -3px 0 rgba(150,112,58,.62),
  inset 0 -8px 12px rgba(140,104,52,.34),
  0 1px 0 rgba(255,246,214,.5),
  0 4px 7px rgba(40,6,4,.5),
  0 9px 16px rgba(0,0,0,.32);
 display:grid;place-items:center}
.tl .face:after{content:"";position:absolute;left:5%;right:5%;top:3%;height:46%;border-radius:9px 9px 45% 45%;
 background:linear-gradient(180deg,rgba(255,255,255,.88),rgba(255,255,255,0));pointer-events:none}
.tl.k-gd .face{background:linear-gradient(180deg,#fffdf6,#eaf6ee 50%,#cfe3d6)}
.tl.k-rd .face{background:linear-gradient(180deg,#fffdf6,#f9eae8 50%,#e7cbc7)}
.tl.k-wd .face{background:linear-gradient(180deg,#fffdf6,#ebf0f9 50%,#cdd9e9)}
.tl.k-c8 .face{background:linear-gradient(180deg,#fffdf6,#f9f1e0 50%,#e5d3ae)}
.tl.k-d5 .face,.tl.k-s5 .face{background:linear-gradient(180deg,#fffdf6,#eaf3f6 50%,#cbdde4)}
.tl.k-d3 .face,.tl.k-s2 .face{background:linear-gradient(180deg,#fffdf6,#f1ecf9 50%,#d6cce8)}
.tl.k-d2 .face{background:linear-gradient(180deg,#fffdf6,#f9eee3 50%,#e5ceb7)}
.tl.k-fl .face{background:linear-gradient(180deg,#f6f2e8,#e8dfc8 50%,#d2c7a8);opacity:.9}
.tl.k-fl .face:after{display:none}
/* WILD & SCATTER: emas, glow, shine, mengapung */
.tl.k-w .face,.tl.k-sc .face{background:linear-gradient(180deg,#fff8dd,#f2ca70 46%,#a9781e);
 box-shadow:inset 0 2px 0 #fffdf2,inset 0 -4px 0 rgba(120,80,10,.6),inset 0 0 0 2px #ffeeb8,0 0 16px rgba(255,206,110,.7)}
.tl.k-w .face:after,.tl.k-sc .face:after{background:linear-gradient(115deg,rgba(255,255,255,0) 38%,rgba(255,252,232,.8) 50%,rgba(255,255,255,0) 62%);
 left:-40%;right:-40%;top:0;height:100%;border-radius:0;animation:sh 2.1s linear infinite}
.tl.k-w .face,.tl.k-sc .face{animation:flt 2.2s ease-in-out infinite}
@keyframes flt{0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(0,-2px,0)}}
@keyframes sh{from{transform:translateX(-130%)}to{transform:translateX(130%)}}
/* GOLD INGOT: tile berlapis emas */
.tl.gold .face{box-shadow:inset 0 2px 0 #fffdf6,inset 0 -4px 0 rgba(163,131,77,.5),inset 0 0 0 2px #ffeeb8,inset 0 0 0 3px #b8862c,0 0 15px rgba(255,206,110,.8)}
.tl.gold .ig{position:absolute;right:4%;top:5%;width:27%;height:20%;z-index:3;border-radius:26%/40%;
 background:linear-gradient(180deg,#fff6d4,#e8bd54 55%,#9c6c14);box-shadow:0 0 0 1px rgba(120,80,10,.7),0 1px 2px rgba(0,0,0,.35)}
.tl.win .face{box-shadow:inset 0 2px 0 #fffdf6,inset 0 0 0 2px #ffe07a,inset 0 0 0 4px rgba(255,196,60,.45),0 0 20px rgba(255,214,110,.95)}
.tl.win .face{animation:wp .5s cubic-bezier(.2,1.4,.4,1)}
@keyframes wp{0%{transform:scale(1)}45%{transform:scale(1.06)}100%{transform:scale(1)}}
.tl.win{z-index:4;transition:transform .18s cubic-bezier(.2,1.4,.5,1)}
.gly{position:relative;z-index:2;
 font:900 var(--fs,20px)/1 "Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans",system-ui,sans-serif;
 text-shadow:0 1px 0 #fffdf6,0 2px 3px rgba(90,50,10,.3)}
.gly.two{font-size:calc(var(--fs,20px) * .66);letter-spacing:-.03em}
.gly.g{color:#0f8a52}.gly.r{color:#cf2020}.gly.b{color:#1751a0}.gly.c{color:#8a4210}.gly.f{color:#98a29c}
.star{position:relative;z-index:2;font:900 calc(var(--fs,20px) * 1.1)/1 system-ui;color:#8a5a06;text-shadow:0 1px 0 #fffbe4,0 0 10px rgba(255,255,255,.9)}
.tileface{position:relative;z-index:2;width:74%;height:74%}
.tileface span{position:absolute;border-radius:50%;transform:translate(-50%,-50%);
 width:calc(var(--fs,20px) * .29);height:calc(var(--fs,20px) * .29);
 background:radial-gradient(circle at 34% 30%,#c9e8ff,#1f6fbf 58%,#0d3f73);box-shadow:0 1px 2px rgba(0,0,0,.3)}
.tileface span:nth-child(even){background:radial-gradient(circle at 34% 30%,#ffd8d2,#cf2020 58%,#7a1010)}
.tileface.b b{position:absolute;border-radius:2px;transform:translate(-50%,-50%);
 width:calc(var(--fs,20px) * .18);height:calc(var(--fs,20px) * .4);
 background:linear-gradient(90deg,#146b38,#3fbd72 50%,#146b38);box-shadow:0 1px 2px rgba(0,0,0,.28)}
.rwrap{position:absolute;left:0;right:0;overflow:hidden;z-index:5;pointer-events:none;display:none;
 border-radius:9px;background:rgba(30,4,8,.35)}
.rwrap:before,.rwrap:after{content:"";position:absolute;left:0;right:0;height:22%;z-index:4;pointer-events:none}
.rwrap:before{top:0;background:linear-gradient(180deg,rgba(40,4,6,.72),rgba(40,4,6,0))}
.rwrap:after{bottom:0;background:linear-gradient(0deg,rgba(40,4,6,.72),rgba(40,4,6,0))}
.rstrip{position:absolute;left:0;right:0;top:0;will-change:transform;backface-visibility:hidden;
 filter:blur(var(--mb,0px));transition:filter .1s linear}
.col.roll .tl{visibility:hidden}
/* PENTING: kartu di dalam strip reel harus TERLIHAT. Tanpa aturan ini, seluruh isi kolom
   disembunyikan oleh aturan di atas -> reel tampak kosong saat berputar. */
.col.roll .rwrap .tl{visibility:visible}
.col.roll .rwrap{display:block}
/* hentakan saat reel berhenti: kartu sedikit melewati posisi lalu memantul + kilau */
.col.hit .face{animation:tland .3s cubic-bezier(.34,1.55,.64,1)}
@keyframes tland{0%{transform:translateY(0) scaleY(1)}32%{transform:translateY(7px) scaleY(1.015)}66%{transform:translateY(-2.5px) scaleY(.998)}100%{transform:translateY(0) scaleY(1)}}
.col.hit:before{content:"";position:absolute;left:0;right:0;top:0;bottom:0;z-index:8;pointer-events:none;border-radius:9px;
 background:linear-gradient(180deg,rgba(255,236,180,.24),rgba(255,236,180,0));animation:clflash .32s ease-out}
@keyframes clflash{0%{opacity:1}100%{opacity:0}}
.fx{position:absolute;left:0;right:0;top:0;bottom:0;z-index:9;pointer-events:none;overflow:hidden;border-radius:14px}
.fx i{position:absolute;border-radius:50%;background:radial-gradient(circle,#fffbe4,#f0bb3c 62%,rgba(240,187,60,0));
 animation:ptf .8s ease-out forwards}
@keyframes ptf{from{transform:translate3d(0,0,0) scale(1);opacity:1}to{transform:translate3d(var(--tx,0),var(--ty,-20px),0) scale(.2);opacity:0}}
/* pil FREE SPIN di tepi plakat pengali (tidak menutupi kartu) */
.fsBadge{position:absolute;right:9px;top:0;transform:translateY(-52%);display:none;z-index:6;
 padding:3px 12px;border-radius:999px;background:linear-gradient(180deg,#fff3cd,#e0a93c);color:#4a1a04;
 font:900 9.5px system-ui;letter-spacing:.08em;white-space:nowrap;box-shadow:0 0 14px rgba(255,206,110,.75)}
.fsBadge.on{display:block}
body.low .fsBadge.on{box-shadow:none}

/* ---------- pesan ---------- */
/* satu baris: pesan + tombol utilitas (menggantikan baris tombol terpisah -> papan lebih besar) */
.bar2{display:flex;align-items:stretch;gap:4px;margin-top:4px}
.cap{position:relative;flex:1;min-width:0;min-height:28px;display:grid;place-items:center;text-align:center;
 border-radius:9px;padding:2px 8px;font:900 11px system-ui;line-height:1.3;
 background:linear-gradient(180deg,rgba(120,30,22,.76),rgba(56,11,12,.88));border:1px solid rgba(184,134,44,.55);
 color:var(--gold2);box-shadow:inset 0 1px 0 rgba(255,236,180,.2)}
.cap.idle{color:#e2c391;font:900 8.5px system-ui;letter-spacing:.08em}
.cap.big{background:linear-gradient(90deg,#8a4c10,#e9bb4a 50%,#8a4c10);color:#3a1c02;border-color:#fff0c2;
 box-shadow:0 0 16px rgba(255,206,110,.6)}
.cap.big b{color:#2d1400}
/* panel hadiah: muncul DI ATAS papan saat menang, tidak memakan ruang tata letak */
.rw{position:absolute;left:50%;top:50%;z-index:11;transform:translate(-50%,-50%) scale(.82);opacity:0;
 display:grid;justify-items:center;gap:0;padding:5px 13px 6px;border-radius:13px;pointer-events:none;
 background:linear-gradient(180deg,rgba(255,247,216,.97),rgba(242,202,112,.97) 52%,rgba(152,104,20,.97));
 border:2px solid #fff6d4;
 box-shadow:0 0 0 1px rgba(120,80,10,.55),0 0 34px rgba(255,206,110,.85),0 10px 26px rgba(0,0,0,.45);
 transition:opacity .18s ease,transform .3s cubic-bezier(.2,1.5,.4,1)}
.rw.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.rw b{font:900 21px/1 system-ui;color:#3d1f04;text-shadow:0 2px 0 rgba(255,255,255,.55)}
.rw span{font:900 8.5px system-ui;letter-spacing:.28em;color:#6b3a06}
.rw em{font:900 7.5px system-ui;font-style:normal;letter-spacing:.04em;color:#5e3406;white-space:nowrap}

/* ---------- panel kontrol (hierarki: SPIN > AUTO/TURBO > BET/LEVEL > ikon) ---------- */
.panel{display:flex;align-items:stretch;justify-content:space-between;gap:6px;margin-top:5px}
.pgrid{display:flex;flex-direction:column;gap:4px;flex:0 0 84px;min-width:0}
/* SEKUNDER: AUTO / TURBO */
.bt{display:grid;place-items:center;flex:1;border-radius:11px;border:1px solid rgba(184,134,44,.75);color:var(--gold2);
 background:linear-gradient(180deg,rgba(150,38,28,.95),rgba(74,15,14,.96));
 box-shadow:inset 0 1px 0 rgba(255,226,160,.42),0 3px 0 rgba(46,10,10,.9);
 font:900 10.5px system-ui;letter-spacing:.08em;transition:transform .08s ease}
.bt:active{transform:translateY(2px);box-shadow:inset 0 1px 0 rgba(255,236,180,.26),0 1px 0 rgba(46,10,10,.9)}
.bt.on{background:linear-gradient(180deg,#fff3cd,#e0a93c);color:#4a1a04;border-color:#fff3cd}
/* TERSIER: BET / LEVEL */
.pg3{display:flex;flex-direction:column;gap:4px;flex:0 0 76px;min-width:0}
.bt3{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1px;padding:1px 3px;border-radius:9px;
 border:1px solid rgba(184,134,44,.5);
 background:linear-gradient(180deg,rgba(114,28,24,.88),rgba(58,10,12,.92));color:#f0d29a;
 box-shadow:inset 0 1px 0 rgba(255,226,160,.24)}
.bt3 em{font-style:normal;font:900 9.5px/1.05 system-ui;color:#fff;letter-spacing:.02em;text-align:center;
 display:block;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.bt3 span{display:flex;gap:3px;justify-content:center}
.bt3 button{flex:1;min-width:24px;height:22px;padding:0;border-radius:6px;border:1px solid rgba(184,134,44,.65);
 background:linear-gradient(180deg,rgba(168,46,34,.96),rgba(86,18,16,.96));color:#ffe7b4;font:900 13px/1 system-ui}
.bt3 button:disabled{opacity:.4}
.bt3.dis{opacity:.5}
/* PRIMARY: SPIN - focal point, sengaja paling besar & paling banyak dimensi */
.spin{position:relative;flex:0 0 auto;width:var(--sp,96px);height:var(--sp,96px);border-radius:50%;border:0;padding:0;
 background:radial-gradient(circle at 34% 24%,#fff6d8,#f4cf78 32%,#cc9a30 60%,#8a5c12 84%,#5c3c08 100%);
 box-shadow:
  0 0 0 2px rgba(255,246,214,.55),
  0 6px 0 #4a2e05,
  0 7px 0 1px #352003,
  0 14px 26px rgba(0,0,0,.55),
  inset 0 3px 0 #fffbe9,
  inset 0 -7px 13px rgba(90,58,8,.6);
 transition:transform .1s ease,box-shadow .1s ease;overflow:hidden}
.spin .core{position:absolute;left:9%;right:9%;top:9%;bottom:9%;border-radius:50%;display:grid;place-items:center;
 background:radial-gradient(circle at 36% 26%,#7df0bd,#14996a 42%,#07543b 74%,#03301f 100%);
 box-shadow:inset 0 3px 0 rgba(255,255,255,.5),inset 0 -8px 16px rgba(0,0,0,.5),
  0 0 0 1px rgba(255,246,214,.25),0 0 22px rgba(55,207,149,.4)}
.spin .core:after{content:"";position:absolute;left:13%;right:13%;top:7%;height:32%;border-radius:50%;
 background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0));pointer-events:none}
.spin .arw{width:36%;height:36%;transform:rotate(var(--arw,0deg));filter:drop-shadow(0 1px 1px rgba(0,0,0,.45))}
.spin b{position:relative;z-index:2;font:900 10.5px system-ui;letter-spacing:.1em;color:#eafff4;
 text-shadow:0 1px 2px rgba(0,0,0,.55)}
.spin.pulse{animation:brt 3s ease-in-out infinite}
@keyframes brt{0%,100%{transform:scale(1)}50%{transform:scale(1.026)}}
.spin:active{transform:scale(.94);
 box-shadow:0 0 0 2px rgba(255,246,214,.55),0 2px 0 #4a2e05,0 5px 12px rgba(0,0,0,.5),inset 0 3px 0 #fffbe9}
.spin[disabled]{filter:saturate(.72) brightness(.94)}
.spin.fsmode{background:radial-gradient(circle at 34% 24%,#e6ffef,#4fdc9f 34%,#14996a 62%,#07543b 100%)}
.spin.win{animation:spw .62s cubic-bezier(.2,1.4,.4,1)}
@keyframes spw{0%{box-shadow:0 0 0 2px rgba(255,246,214,.55),0 6px 0 #4a2e05,0 14px 26px rgba(0,0,0,.55)}
 45%{box-shadow:0 0 0 3px #fff6d4,0 0 30px 9px rgba(255,206,110,.9),0 6px 0 #4a2e05,0 14px 26px rgba(0,0,0,.55)}
 100%{box-shadow:0 0 0 2px rgba(255,246,214,.55),0 6px 0 #4a2e05,0 14px 26px rgba(0,0,0,.55)}}
@media (hover:hover){.spin:hover{transform:scale(1.03)}.bt:hover{border-color:var(--gold2)}}
/* UTILITAS: tombol ikon */
.ib{flex:0 0 auto;width:33px;min-height:30px;padding:0;border-radius:9px;border:1px solid rgba(184,134,44,.55);
 background:linear-gradient(180deg,rgba(118,30,24,.86),rgba(56,11,12,.92));color:#f2d79e;
 display:grid;place-items:center;transition:transform .08s}
.ib:active{transform:translateY(2px)}
.ib svg{width:17px;height:17px;display:block}
.ib.on{background:linear-gradient(180deg,#fff3cd,#e0a93c);color:#4a1a04;border-color:#fff3cd}
.ib.off{opacity:.45}
.ib.off svg .wv{display:none}

/* ---------- overlay ---------- */
.ovl{position:fixed;left:0;right:0;top:0;bottom:0;z-index:60;display:none;place-items:center;padding:14px;overflow:auto;
 background:rgba(24,2,6,.76);backdrop-filter:blur(2px)}
.ovl.on{display:grid;animation:fi .18s ease-out}
@keyframes fi{from{opacity:0}to{opacity:1}}
.card{width:min(100%,346px);border-radius:16px;padding:13px;text-align:center;
 background:linear-gradient(180deg,rgba(72,16,16,.96),rgba(22,3,7,.98));
 border:2px solid var(--gold3);box-shadow:0 0 0 1px rgba(255,236,180,.3) inset,0 20px 50px rgba(0,0,0,.6);
 animation:pop .22s cubic-bezier(.2,1.4,.5,1)}
@keyframes pop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}
.card h3{font:900 15px system-ui;letter-spacing:.1em;color:var(--gold2);margin-bottom:4px}
.card .big{font:900 30px system-ui;color:#fff6d8;margin:6px 0;text-shadow:0 0 20px rgba(255,206,110,.7)}
.card p{color:#e2c9a4;font-size:9.5px;line-height:1.65;margin-bottom:8px}
.card .sep{height:1px;background:rgba(184,134,44,.4);margin:9px 0}
.pt{text-align:left;max-height:44vh;overflow:auto;margin:6px 0 9px;border-radius:10px;
 background:rgba(12,2,4,.5);border:1px solid rgba(184,134,44,.45)}
.pt div{display:flex;align-items:center;gap:7px;padding:4px 7px;border-bottom:1px solid rgba(184,134,44,.16)}
.pt div:last-child{border-bottom:0}
.pt .mn{position:relative;width:22px;height:22px;flex:0 0 auto;border-radius:5px;overflow:hidden;display:grid;place-items:center;--fs:11px;
 background:linear-gradient(180deg,#fffdf6,#e6dcc4);box-shadow:inset 0 -2px 0 rgba(163,131,77,.5)}
.pt .mn .gly{font-size:11px}.pt .mn .gly.two{font-size:7px}.pt .mn .star{font-size:11px}
.pt .mn .tileface{width:76%;height:76%}.pt .mn .tileface span{width:27%;height:27%}
.pt b{font:900 8.5px system-ui;color:#e0c08a;width:56px;flex:0 0 auto}
.pt .px{margin-left:auto;font:900 9px system-ui;color:var(--gold2);white-space:nowrap}
.setRow{display:flex;align-items:center;gap:8px;margin:8px 0}
.setRow span{font:900 8.5px system-ui;letter-spacing:.08em;color:#e6c88f;width:78px;text-align:left;flex:0 0 auto}
input[type=range]{-webkit-appearance:none;appearance:none;flex:1;height:22px;background:transparent}
input[type=range]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:linear-gradient(90deg,#b8862c,#f2ca70)}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:17px;height:17px;margin-top:-6px;border-radius:50%;
 background:radial-gradient(circle at 36% 30%,#fff8dd,#e8bd54 60%,#8a5c12);box-shadow:0 0 0 1px #6d4a0c,0 1px 3px rgba(0,0,0,.5)}
.setRow em{font-style:normal;font:900 9px system-ui;color:var(--gold2);width:34px;text-align:right;flex:0 0 auto}
.tog{display:block;width:100%;margin:5px 0;min-height:32px;border-radius:9px;border:1px solid rgba(184,134,44,.6);
 background:linear-gradient(180deg,rgba(60,14,16,.85),rgba(22,4,8,.9));color:#e6c88f;font:900 9px system-ui;letter-spacing:.06em}
.tog.on{background:linear-gradient(180deg,#fff3cd,#e0a93c);color:#4a1a04;border-color:#fff3cd}
.tog.danger{color:#ffb3ab;border-color:rgba(190,60,50,.7)}
.tog.confirm{background:linear-gradient(180deg,#e0503c,#8c1410);color:#fff;border-color:#ffd3c8}
.btn{display:block;width:100%;min-height:34px;margin-top:8px;border-radius:10px;border:1px solid #fff3cd;
 background:linear-gradient(180deg,#ffeec2,#e0a93c);color:#4a1a04;font:900 10px system-ui;letter-spacing:.1em}
.btn:active{transform:translateY(2px)}

/* ---------- mode rapat: dipakai otomatis kalau tinggi layar sempit ---------- */
body.compact{padding-top:calc(2px + env(safe-area-inset-top));padding-bottom:calc(3px + env(safe-area-inset-bottom))}
body.compact .hud{margin-bottom:3px}
body.compact .seal{width:25px;height:25px;font-size:11px}
body.compact .ttl{font-size:11.5px}
body.compact .stats{margin-bottom:3px;gap:3px}
body.compact .kv{padding:2px 4px}
body.compact .kv i{font-size:11px}
body.compact .ladBox{margin-bottom:3px;padding:2px 5px 3px}
body.compact .lad i{font-size:10px;padding:2px 5px 3px;min-width:36px}
body.compact .stage{padding:2px}
body.compact .bar2{margin-top:3px;gap:3px}
body.compact .cap{min-height:25px;font-size:10.5px}
body.compact .panel{margin-top:3px;gap:5px}
body.compact .pgrid{gap:3px}
body.compact .pg3{flex:0 0 66px;gap:3px}
body.compact .pgrid{flex:0 0 74px}
body.compact .bt{font-size:9.5px;border-radius:9px}
body.compact .bt3 em{font-size:9px}
body.compact .bt3 button{height:20px;min-width:22px;font-size:12px}
body.compact .ib{width:27px;min-height:25px}
body.compact .ib svg{width:14px;height:14px}

/* ---------- low-end & reduced motion ---------- */
body.low .side,body.low .bgfx .sv{display:none}
body.low .stage:before{opacity:.06}
body.low .stage:after{display:none}
body.low .reels{transform:none}
body.low .fsBadge.on{box-shadow:none}
body.low .rstrip{filter:none}
body.low .col.hit .face,body.low .col.hit:before{animation:none}
body.low .spin.pulse,body.low .tl.k-w .face,body.low .tl.k-sc .face{animation:none}
body.low .rwrap .tl .face{box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 0 0 1px rgba(255,255,255,.7),inset 0 -3px 0 rgba(150,112,58,.5),0 2px 4px rgba(40,6,4,.45)}
@media (prefers-reduced-motion:reduce){
 .spin.pulse,.tl.k-w .face,.tl.k-sc .face{animation:none}
 .stage.shake{animation:none}
}
@media (max-width:339px){.ttl{font-size:11px}.ways{font-size:10px}}
</style>
</head>
<body>
<div class="bgfx" id="bgfx"><div class="cl"></div></div>
<div class="wrap">
<div class="side l" id="ornL"></div>
<div class="app">
  <header class="hud" id="hud">
    <div class="brand">
      <span class="seal" id="seal"></span>
      <span class="ttl">MAHJONG WAYS <b>2</b></span>
    </div>
    <div class="ways">2000 <em>WAYS</em></div>
  </header>

  <div class="stats" id="stats">
    <div class="kv"><b>SALDO</b><i id="hCoins">0</i></div>
    <div class="kv"><b>TARUHAN</b><i id="hBet">6</i></div>
    <div class="kv w"><b>MENANG</b><i id="hWin">0</i></div>
  </div>

  <div class="ladBox" id="ladBox">
    <div class="lad" id="lad"></div>
    <div class="fsBadge" id="fsBar">FREE SPIN <span id="fsN">0</span></div>
  </div>

  <div class="stage" id="stage">
    <span class="cnr a"></span><span class="cnr b"></span><span class="cnr c"></span><span class="cnr d"></span>
    <div class="orn"></div>
    <div class="reels" id="reels"></div>
    <div class="fx" id="fx"></div>
    <div class="rw" id="rw"><b id="rwN">+0</b><span id="rwL">KOIN</span><em id="rwD"></em></div>
  </div>

  <div class="bar2" id="bar2">
    <div class="cap idle" id="cap">TEKAN PUTAR UNTUK MULAI</div>
    <button class="ib" id="bInfo" type="button" aria-label="Tabel bayaran" title="Tabel bayaran"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg></button>
    <button class="ib" id="bMax" type="button" aria-label="Isi koin" title="Isi koin"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 8.2v7.6M8.2 12h7.6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
    <button class="ib" id="bSet" type="button" aria-label="Pengaturan" title="Pengaturan"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="9" cy="8" r="2.7" fill="currentColor"/><circle cx="15" cy="16" r="2.7" fill="currentColor"/></svg></button>
    <button class="ib" id="bSnd" type="button" aria-label="Suara" title="Suara"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor"/><path class="wv" d="M16 8.5c1.8 2.1 1.8 4.9 0 7M19 5.8c2.8 3.3 2.8 9.1 0 12.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>
  </div>

  <div class="panel" id="panel">
    <div class="pg3">
      <div class="bt3"><em id="szV">0.30x</em><span><button id="szM" type="button" aria-label="Kecilkan taruhan">-</button><button id="szP" type="button" aria-label="Besarkan taruhan">+</button></span></div>
      <div class="bt3"><em id="lvV">LEVEL 1</em><span><button id="lvM" type="button" aria-label="Turunkan level">-</button><button id="lvP" type="button" aria-label="Naikkan level">+</button></span></div>
    </div>

    <button class="spin pulse" id="bSpin" type="button" aria-label="Putar">
      <span class="core">
        <svg class="arw" id="arw" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M24 5a19 19 0 1 1-13.4 5.6" fill="none" stroke="#eafff4" stroke-width="5" stroke-linecap="round"/>
          <path d="M8.5 16.5 10.6 6.2l10.3 2.2z" fill="#eafff4"/>
        </svg>
        <b id="spT">SPIN</b>
      </span>
    </button>

    <div class="pgrid">
      <button class="bt" id="bAuto" type="button">AUTO</button>
      <button class="bt" id="bTurbo" type="button">TURBO</button>
    </div>
  </div>

</div>
<div class="side r" id="ornR"></div>
</div>

<div class="ovl" id="ovInfo"><div class="card">
  <h3>TABEL BAYARAN</h3>
  <p>Bayaran <b>per way</b> dikali taruhan. Simbol dibayar berurutan dari gulungan paling kiri (min. 3 gulungan).</p>
  <div class="pt" id="ptBox"></div>
  <p id="ptFoot"></p>
  <button class="btn" id="ptOk" type="button">TUTUP</button>
</div></div>

<div class="ovl" id="ovWin"><div class="card">
  <h3 id="ovT">BIG WIN</h3>
  <div class="big" id="ovB">0</div>
  <p id="ovP"></p>
  <button class="btn" id="ovOk" type="button">LANJUT</button>
</div></div>

<div class="ovl" id="ovSet"><div class="card">
  <h3>PENGATURAN</h3>
  <div class="setRow"><span>MUSIK</span><input type="range" id="rMus" min="0" max="100" step="5"><em id="vMus">55</em></div>
  <div class="setRow"><span>EFEK SUARA</span><input type="range" id="rSfx" min="0" max="100" step="5"><em id="vSfx">85</em></div>
  <button class="tog" id="tMute" type="button">BISUKAN: MATI</button>
  <button class="tog" id="tVib" type="button">GETARAN: AKTIF</button>
  <button class="tog" id="tQ" type="button">GRAFIS: OTOMATIS</button>
  <div class="sep"></div>
  <button class="tog danger" id="tReset" type="button">HAPUS DATA PROGRES</button>
  <p id="setInfo"></p>
  <button class="btn" id="setOk" type="button">TUTUP</button>
</div></div>

<script>
(function(){
'use strict';
/* ================= MESIN: grid 4-5-5-5-4 = 2000 ways ================= */
var ch=String.fromCharCode;
var ROWS=[4,5,5,5,4],REELS=5,MID=2;
var WLD='w',SCT='sc';
var ORD=['gd','rd','wd','c8','d5','s5','d3','d2','s2'];
// bayaran PER WAY, dibedakan untuk 3 / 4 / 5 simbol berurutan
// Nilai disimpan x10 (10 = x1,0). Urutan simbol sama seperti tabel asli
// (Green Dragon tertinggi, lalu naik tajam di 4 & 5 simbol).
// Bayaran PER WAY dikali jumlah taruhan. Angka disetel lewat audit RTP (lihat catatan di bawah).
var PAY={
 gd:{3:13,4:24,5:38},
 rd:{3:10,4:20,5:31},
 wd:{3:9,4:15,5:24},
 c8:{3:6,4:10,5:19},
 d5:{3:5,4:9,5:14},
 s5:{3:5,4:9,5:14},
 d3:{3:5,4:5,5:10},
 d2:{3:5,4:5,5:10},
 s2:{3:5,4:5,5:10}
};
var PAY_DIV=10;   // PAY disimpan x10 -> kemenangan dibagi 10
var FLW='fl';   // kartu bunga: pengisi reel, tidak pernah membentuk kemenangan
var SYMS=ORD.concat([WLD,SCT,FLW]);
var TEX={gd:ch(0x767c),rd:ch(0x4e2d),wd:ch(0x767d),c8:ch(0x516b)+ch(0x842c),fl:ch(0x82b1)};
var GLY={gd:'gly g',rd:'gly r',wd:'gly b',c8:'gly c',fl:'gly f'};
var NAME={gd:'Green Dragon',rd:'Red Dragon',wd:'White Dragon',c8:'Eight Char',d5:'Five Dots',s5:'Five Sticks',d3:'Three Dots',d2:'Two Dots',s2:'Two Sticks',w:'WILD',sc:'SCATTER',fl:'Bunga (tidak dibayar)'};
// bobot munculnya simbol (disetel lewat audit RTP)
// Setelan hasil audit RTP (500.000 putaran): RTP 97,33%, hit rate 32,5%, free spin 1:169,
// kaskade 1,79/putaran, max win teoretis 7.600x. JANGAN ubah tanpa mengukur ulang.
var CFG={goldP:0.055,maxRep:2,w:{gd:1.5,rd:2.2,wd:2.9,c8:4.2,d5:5.6,s5:5.6,d3:6.8,d2:7.6,s2:7.6,w:1.5,sc:1.22,fl:31.7}};
function wOf(sym,reel){
  var x=CFG.w[sym]||1,i=ORD.indexOf(sym),d=reel-MID;
  if(i>=0){ if(i<3)x*=1+(MID-reel)*0.09; else if(i>5)x*=1+reel*0.05 }
  if(sym===WLD)x*=1.3-Math.abs(d)*0.14;
  if(sym===SCT)x*=1+reel*0.03;
  return x>0.01?x:0.01
}
function pickSym(reel){
  var t=0,i,w=[];
  for(i=0;i<SYMS.length;i++){ w.push(wOf(SYMS[i],reel)); t+=w[i] }
  var x=Math.random()*t;
  for(i=0;i<w.length;i++){ x-=w[i]; if(x<=0)return SYMS[i] }
  return SYMS[0]
}
function goldOn(reel,free,sym){
  if(sym===WLD||sym===SCT||sym===FLW)return false;
  if(reel===MID&&free)return true;      // free spin: seluruh reel 3 berlapis emas
  if(reel<1||reel>3)return false;       // gold plated hanya di reel 2,3,4
  return Math.random()<CFG.goldP
}
// goldOnly=true hanya untuk papan awal putaran. Isi ulang kaskade TIDAK boleh berlapis emas,
// kalau tidak wild hasil transformasi menumpuk dan kaskade bisa meledak tanpa batas.
function newCol(r,free,rows,goldOnly){
  var s=[],g=[],y,ss,cnt,tryN;
  for(y=0;y<rows;y++){
    cnt={};for(var k=0;k<s.length;k++)cnt[s[k]]=(cnt[s[k]]||0)+1;
    ss=pickSym(r); tryN=0;
    while(CFG.maxRep>0&&ss!==WLD&&ss!==SCT&&ss!==FLW&&(cnt[ss]||0)>=CFG.maxRep&&tryN++<8)ss=pickSym(r);
    s.push(ss); g.push(goldOnly?goldOn(r,free,ss):false)
  }
  return {s:s,g:g}
}
/* 2000 WAYS: simbol berurutan dari reel paling kiri, tiap reel minimal 1 simbol.
   Wild menggantikan semua simbol biasa. Bayaran mengikuti jumlah reel yang kena. */
function winsOf(g){
  var out=[],i,r,y,sym,run,ways,cells,c;
  for(i=0;i<ORD.length;i++){
    sym=ORD[i]; run=0; ways=1; cells=[];
    for(r=0;r<REELS;r++){
      c=0;
      for(y=0;y<g[r].length;y++)if(g[r][y]===sym||g[r][y]===WLD)c++;
      if(c===0)break;
      run++; ways*=c;
      for(y=0;y<g[r].length;y++)if(g[r][y]===sym||g[r][y]===WLD)cells.push([r,y]);
    }
    if(run<3)continue;
    out.push({sym:sym,reels:run,ways:ways,pay:(PAY[sym][run]||0)*ways,cells:cells});
  }
  out.sort(function(a,b){return b.pay-a.pay});
  return out
}
function payTxt(sym,n){var s=String(PAY[sym][n]);var d=s.length<=1?('0'+s):s;return d.slice(0,-1)+'.'+d.slice(-1)}
function countSc(g){
  var c=0,r,y;
  for(r=0;r<REELS;r++)for(y=0;y<g[r].length;y++)if(g[r][y]===SCT)c++;
  return c
}
/* pengali progresif: x1 x2 x3 x5 (biasa) / x2 x4 x6 x10 (free spin) */
var LAD_BASE=[1,2,3,5],LAD_FREE=[2,4,6,10];
function ladOf(free){return free?LAD_FREE:LAD_BASE}
var FS_BASE=10,FS_EXTRA=2,MAX_CASCADE=15;

/* ---------- satu putaran: bisa dimajukan langkah demi langkah (kaskade) ---------- */
function Spin(bet,free,ladStart){
  var r;
  this.bet=bet; this.free=!!free; this.lad=ladStart||0; this.won=0; this.best=0; this.steps=0;
  this.g=[]; this.gl=[];
  for(r=0;r<REELS;r++){ var c=newCol(r,this.free,ROWS[r],true); this.g.push(c.s); this.gl.push(c.g) }
  this.sc=countSc(this.g)
}
Spin.prototype.mult=function(){var L=ladOf(this.free);return L[this.lad>3?3:this.lad]};
/* maju satu kaskade. return null kalau tidak ada kemenangan lagi */
Spin.prototype.next=function(){
  if(this.steps>=MAX_CASCADE)return null;   // pengaman: kaskade tidak boleh tak terbatas
  var w=winsOf(this.g),i,k,r,y,key;
  if(!w.length)return null;
  var mult=this.mult(),unit=0;
  for(i=0;i<w.length;i++)unit+=w[i].pay;
  var win=Math.round(unit*this.bet*mult/PAY_DIV);
  this.won+=win; if(win>this.best)this.best=win;
  var hit={};
  for(i=0;i<w.length;i++)for(k=0;k<w[i].cells.length;k++)hit[w[i].cells[k][0]+','+w[i].cells[k][1]]=1;
  var res={step:this.steps,mult:mult,win:win,wins:w,hit:hit,need:[],map:[],morph:[],free:this.free};
  for(r=0;r<REELS;r++){
    var keepS=[],keepG=[],keepX=[],newN=0,mi=[];
    for(y=0;y<ROWS[r];y++){
      key=r+','+y;
      if(!hit[key]){ keepS.push(this.g[r][y]); keepG.push(this.gl[r][y]); keepX.push(0); mi.push(y); continue }
      if(this.gl[r][y]){ keepS.push(WLD); keepG.push(false); keepX.push(1); mi.push(y) }
      // sisanya lenyap
    }
    var need=ROWS[r]-keepS.length;
    var nc=need>0?newCol(r,this.free,need,false):{s:[],g:[]};
    var mor=[];
    for(i=0;i<ROWS[r];i++){
      var j=i-need;
      if(j<0)mor.push(0);
      else{ if(keepX[j])mor.push(1); else mor.push(0) }
    }
    res.need.push(need); res.map.push(mi); res.morph.push(mor);
    this.g[r]=nc.s.concat(keepS); this.gl[r]=nc.g.concat(keepG)
  }
  this.steps++; this.lad++;
  return res
};
/* ---------- simulator untuk audit RTP (dipakai tes) ---------- */
function sim(n,bet){
  bet=bet||100;
  var t=0,won=0,i,hits=0,fsRun=0,fsSess=0,maxW=0,big=0,r,s,left,sc;
  for(i=0;i<n;i++){
    t+=bet;
    s=new Spin(bet,false,0);
    while((r=s.next())){ won+=r.win; hits++ ; if(r.win>maxW)maxW=r.win }
    sc=s.sc;
    if(sc>=3){
      fsSess++;
      left=FS_BASE+(sc-3)*FS_EXTRA;
      // pengaman anti-loop-halus DIHITUNG PER SESI. Kalau memakai hitungan kumulatif,
      // sesi free spin setelah 20.000 putaran free spin akan terpotong dan
      // angka RTP pada sampel besar jadi salah (terukur turun ke ~91%).
      var fsGuard=0;
      while(left>0&&fsGuard++<20000){ left--; fsRun++;
        var t2=new Spin(bet,true,0),r2;
        while((r2=t2.next())){ won+=r2.win; hits++; if(r2.win>maxW)maxW=r2.win }
        var sc2=t2.sc; if(sc2>=3)left+=FS_BASE+(sc2-3)*FS_EXTRA;
      }
    }
    if(0)big++;
  }
  return {bet:t,won:won,rtp:won/t,spins:n,hits:hits,fsSessions:fsSess,fsSpins:fsRun,maxWin:maxW,big:big}
}
if(typeof window!=='undefined')window.MJ={ROWS:ROWS,ORD:ORD,PAY:PAY,PAY_DIV:PAY_DIV,payTxt:payTxt,SYMS:SYMS,CFG:CFG,MAX_CASCADE:MAX_CASCADE,WLD:WLD,SCT:SCT,FLW:FLW,FS_BASE:FS_BASE,FS_EXTRA:FS_EXTRA,LAD_BASE:LAD_BASE,LAD_FREE:LAD_FREE,
 winsOf:winsOf,countSc:countSc,Spin:Spin,sim:sim,TEX:TEX,GLY:GLY,NAME:NAME,newCol:newCol};
})();
</script>
<script>
(function(){
'use strict';
/* ================= AUDIO MANAGER TERPUSAT =================
   Semua suara disintesis WebAudio (tidak ada file aset -> tidak ada
   asset path rusak). Satu bus musik + satu bus SFX, volume terpisah,
   fade in/out, tidak pernah ada dua musik berbunyi bersamaan. */
var A=null,sBus=null,mBus=null,ready=false;
var set={mv:0.55,sv:0.85,mute:false,vib:true};
var mus={scene:null,want:'menu',timer:null,step:0,next:0,g:null};
var sl={o:null,g:null,f:null,on:false};
var NOISE=null;
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
(function(){var s=ls('mj2_aud',null);
 if(s&&typeof s==='object'){
  if(typeof s.mv==='number')set.mv=Math.min(1,Math.max(0,s.mv));
  if(typeof s.sv==='number')set.sv=Math.min(1,Math.max(0,s.sv));
  if(typeof s.mute==='boolean')set.mute=s.mute;
  if(typeof s.vib==='boolean')set.vib=s.vib
 }})();
function save(){ss('mj2_aud',set)}
function live(){return A&&ready&&!set.mute}
function mkBus(){
  if(!A)return;
  sBus=A.createGain(); sBus.gain.value=set.sv; sBus.connect(A.destination);
  mBus=A.createGain(); mBus.gain.value=0; mBus.connect(A.destination);
  // buffer noise pendek (dipakai untuk klik reel) - dibuat sekali saja
  try{
    var n=A.sampleRate*0.09;(NOISE===null)&&(NOISE=A.createBuffer(1,Math.max(64,n|0),A.sampleRate));
    var d=NOISE.getChannelData(0),i;
    for(i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length)
  }catch(e){NOISE=null}
}
function ac(){
  try{
    if(!A){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;A=new C();mkBus();ready=true}
    if(A.state==='suspended')A.resume();
    if(mus.want&&!mus.timer)scene(mus.want,true)
  }catch(e){}
}
function tone(f1,f2,d,v,type,delay){
  if(!live()||set.sv<=0)return;
  try{
    var n=A.currentTime+(delay||0),o=A.createOscillator(),g=A.createGain();
    o.type=type||'square';
    o.frequency.setValueAtTime(Math.max(30,f1),n);
    if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(30,f2),n+d);
    g.gain.setValueAtTime(0.0001,n);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002,v*set.sv),n+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,n+d);
    o.connect(g);g.connect(sBus);o.start(n);o.stop(n+d+0.05)
  }catch(e){}
}
function tick(vol){
  if(!live()||!NOISE||set.sv<=0)return;
  try{
    var n=A.currentTime,s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();
    s.buffer=NOISE; f.type='bandpass'; f.frequency.value=1900; f.Q.value=.7;
    g.gain.setValueAtTime(Math.max(0.0002,vol*set.sv),n);
    g.gain.exponentialRampToValueAtTime(0.0001,n+0.07);
    s.connect(f);f.connect(g);g.connect(sBus);s.start(n);s.stop(n+0.1)
  }catch(e){}
}
/* ---------- SFX bernama ---------- */
function sfx(name,o){
  o=o||{};
  if(!live())return;
  switch(name){
    case 'click': tone(780,1180,.05,.05,'triangle'); break;
    case 'hover': tone(1000,1260,.03,.018,'sine'); break;
    case 'start': tone(240,880,.17,.06,'sawtooth'); tone(520,1420,.15,.03,'triangle',.02); break;
    case 'stop':  tone(250-(o.i||0)*20,120-(o.i||0)*7,.1,.06,'triangle'); tick(.05); break;
    case 'match': tone(660,990,.12,.05,'triangle'); tone(990,1320,.11,.04,'triangle',.07); break;
    case 'win':   tone(680,1020,.12,.055,'triangle'); tone(1020,1360,.11,.045,'triangle',.07); tone(1360,1760,.12,.04,'triangle',.14); break;
    case 'big':   var b=[660,880,1040,1320,1560,1980],i;
                  for(i=0;i<b.length;i++)tone(b[i],b[i]*1.25,.14,.05,'triangle',i*.075);
                  tick(.06); break;
    case 'bonus': tone(1040,1560,.16,.05,'triangle'); tone(1560,2080,.16,.045,'triangle',.12); tone(1240,1860,.18,.05,'sine',.24); break;
    case 'wild':  tone(1240,1860,.16,.04,'sine'); tone(1268,1900,.16,.035,'sine',.01); break;
    case 'err':   tone(150,90,.2,.06,'square'); break;
    case 'coin':  tone(1320,1980,.08,.04,'triangle'); tone(1980,2640,.07,.03,'triangle',.05); break;
  }
}
/* ---------- spin loop: nada gulungan yang makin turun saat melambat ---------- */
function spinLoop(on,speed){
  if(!live()){ if(!on){stopLoop()} return }
  try{
    if(on){
      if(!sl.o){
        sl.g=A.createGain(); sl.g.gain.value=0;
        sl.f=A.createBiquadFilter(); sl.f.type='lowpass'; sl.f.frequency.value=700; sl.f.Q.value=3;
        sl.o=A.createOscillator(); sl.o.type='sawtooth'; sl.o.frequency.value=120;
        sl.o.connect(sl.f); sl.f.connect(sl.g); sl.g.connect(sBus); sl.o.start()
      }
      var sp=Math.max(0,Math.min(1,(speed||0)/3200));
      var t=A.currentTime;
      sl.o.frequency.setTargetAtTime(85+sp*300,t,.05);
      sl.f.frequency.setTargetAtTime(420+sp*1500,t,.05);
      sl.g.gain.setTargetAtTime(0.002+sp*0.035,t,.06)
    }else stopLoop()
  }catch(e){}
}
function stopLoop(){
  try{
    if(sl.o){ sl.g.gain.setTargetAtTime(0.0001,A.currentTime,.04);
      var o=sl.o,g=sl.g,f=sl.f; sl.o=null;sl.g=null;sl.f=null;
      setTimeout(function(){try{o.stop();o.disconnect();g.disconnect();f.disconnect()}catch(e){}},160) }
  }catch(e){}
}
/* ---------- musik: pentatonik, satu scene aktif ---------- */
var SC={
 menu:{spb:.42,pat:[0,2,4,2,5,4,2,0],oct:0,g:.05,type:'triangle',bass:1},
 base:{spb:.25,pat:[0,2,4,5,4,2,7,5],oct:0,g:.045,type:'triangle',bass:2},
 bonus:{spb:.16,pat:[4,5,7,8,7,5,9,8],oct:1,g:.04,type:'triangle',bass:2}
};
function freq(idx,oct){
  var p=[0,2,4,7,9,12,14,16,19,21];
  return 261.63*Math.pow(2,((p[idx%p.length]||0)+12*oct)/12)
}
function target(){return set.mute?0.0001:set.mv*0.5}
function scene(sc,force){
  mus.want=sc;
  if(!A||!ready)return;
  if(mus.scene===sc&&!force){try{mus.g.gain.setTargetAtTime(target(),A.currentTime,.4)}catch(e){} return}
  if(mus.timer){clearInterval(mus.timer);mus.timer=null}
  if(mus.g){try{
    mus.g.gain.cancelScheduledValues(A.currentTime);
    mus.g.gain.setTargetAtTime(0.0001,A.currentTime,.12)
  }catch(e){}}
  mus.scene=sc;
  setTimeout(function(){
    if(mus.want!==sc||!A||!ready)return;
    if(!mus.g){mus.g=A.createGain();mus.g.gain.value=0;mus.g.connect(A.destination)}
    mus.step=0; mus.next=A.currentTime+0.08;
    mus.timer=setInterval(pump,25);
    try{mus.g.gain.setTargetAtTime(target(),A.currentTime,.35)}catch(e){}
  },260)
}
function pump(){
  if(!A||!ready){return}
  var sc=SC[mus.scene]; if(!sc)return;
  try{
    while(mus.next<A.currentTime+0.3){
      if(!set.mute&&set.mv>0){
        var i=mus.step,n=freq(sc.pat[i%sc.pat.length],sc.oct);
        if(i%2===0||sc.spb<.2){
          var o=A.createOscillator(),g=A.createGain(),t=mus.next;
          o.type=sc.type; o.frequency.value=n*(i%4===3?2:1);
          g.gain.setValueAtTime(0.0001,t);
          g.gain.exponentialRampToValueAtTime(Math.max(0.0002,sc.g),t+.02);
          g.gain.exponentialRampToValueAtTime(0.0001,t+sc.spb*1.7);
          o.connect(g);g.connect(mus.g);o.start(t);o.stop(t+sc.spb*1.9)
        }
        if(sc.bass&&i%(8/sc.bass)===0){
          var o2=A.createOscillator(),g2=A.createGain(),t2=mus.next;
          o2.type='sine'; o2.frequency.value=freq(sc.pat[i%sc.pat.length],0)/2;
          g2.gain.setValueAtTime(0.0001,t2);
          g2.gain.exponentialRampToValueAtTime(0.0002+.03,t2+.04);
          g2.gain.exponentialRampToValueAtTime(0.0001,t2+sc.spb*3.4);
          o2.connect(g2);g2.connect(mus.g);o2.start(t2);o2.stop(t2+sc.spb*3.6)
        }
      }
      mus.next+=sc.spb; mus.step++
    }
  }catch(e){}
}
/* ---------- getaran ---------- */
function vib(p){ if(!set.vib)return; try{if(navigator.vibrate)navigator.vibrate(p)}catch(e){} }
/* ---------- api publik ---------- */
window.GX={
 sfx:sfx, vib:vib, unlock:ac, music:scene, spinLoop:spinLoop, isOn:function(){return !set.mute},
 get:function(){return {mv:set.mv,sv:set.sv,mute:set.mute,vib:set.vib}},
 setMus:function(v){set.mv=Math.min(1,Math.max(0,v));save();if(A&&ready){try{mus.g.gain.setTargetAtTime(target(),A.currentTime,.1)}catch(e){}}},
 setSfx:function(v){set.sv=Math.min(1,Math.max(0,v));save();if(sBus)sBus.gain.value=set.sv},
 setMute:function(b){set.mute=!!b;save();if(A&&ready){
   try{mus.g.gain.setTargetAtTime(target(),A.currentTime,.12)}catch(e){}
   if(set.mute)stopLoop()
 }},
 setVib:function(b){set.vib=!!b;save()},
 stopAll:function(){stopLoop();if(mus.timer){clearInterval(mus.timer);mus.timer=null}try{mus.g.gain.setTargetAtTime(0.0001,A.currentTime,.1)}catch(e){}},
 // shim kompatibilitas bentuk lama
 blip:function(f1,f2,d,v,t){tone(f1,f2,d,v||.05,t||'square')}
};
document.addEventListener('pointerdown',ac,{passive:true});
document.addEventListener('keydown',ac,{passive:true});
document.addEventListener('touchstart',ac,{passive:true});
})();
</script>
<script>
(function(){
'use strict';
/* ================= TAMPILAN, ANIMASI & INTERAKSI ================= */
var MJ=window.MJ,GX=window.GX;
var ROWS=MJ.ROWS,ORD=MJ.ORD,SYMS=MJ.SYMS,WLD=MJ.WLD,SCT=MJ.SCT,FLW=MJ.FLW;
var LAD_BASE=MJ.LAD_BASE,LAD_FREE=MJ.LAD_FREE,Spin=MJ.Spin,PAY=MJ.PAY;
var el=function(id){return document.getElementById(id)};
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function fmt(n){n=Math.round(n);var s=String(n),o='',i;for(i=0;i<s.length;i++){if(i>0&&(s.length-i)%3===0)o+='.';o+=s[i]}return o}
var REDUCED=false;try{REDUCED=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(e){}

/* ---------- setelan kualitas ---------- */
var Q='auto';
(function(){
  var s=ls('mj2_cfg2',null);
  if(s&&typeof s.q==='string')Q=s.q;
  if(Q==='auto'){
    var hc=0,mem=0;
    try{hc=navigator.hardwareConcurrency||0}catch(e){}
    try{mem=navigator.deviceMemory||0}catch(e){}
    // Ambang lama (<=4 core) menyalakan mode RENDAH di HP 4-core biasa -> ini yang
    // mematikan glow, perspective & animasi. Sekarang hanya perangkat yang benar-benar lemah.
    Q=((hc>0&&hc<=2)||(mem>0&&mem<=2))?'low':'high'
  }
})();
function applyQ(){
  var keep=(document.body.className||'').replace(/\b(low|compact)\b/g,'').replace(/\s+/g,' ').trim();
  document.body.className=((Q==='low'?'low ':'')+(keep?keep+' ':'')).trim();
  el('tQ').textContent='GRAFIS: '+(Q==='low'?'RENDAH':'TINGGI')
}
/* ---------- keadaan ---------- */
var SZ=[3,10,30,90],MN=['0.03x','0.10x','0.30x','0.90x'];
var szI=0,lvI=0,turbo=false,auto=0,coins=6000;
var ST='idle',pending=false;   // IDLE / SPINNING / RESULT / STOPPING
var cellEl=[],CELL={ch:60,gp:4,step:64};
var grid=[],ggrid=[],lad=0,fsLeft=0,fsActive=false,fsTotal=0,CUR=null,lastWin=0;
var stat={spins:0,wins:0,best:0,fs:0};
var ROLLS=[],RAF=null,stopped=0,PN=0,ARW=0;
var PIPS={d2:[[50,27],[50,73]],d3:[[25,23],[50,50],[75,77]],d5:[[25,23],[75,23],[50,50],[25,77],[75,77]],s2:[[50,28],[50,72]],s5:[[31,23],[69,23],[31,77],[69,77],[50,50]]};
function betNow(){return 2*SZ[szI]*(lvI+1)}

/* ---------- ornamen naga (SVG, tanpa aset luar) ---------- */
function ornSVG(){
  return '<svg viewBox="0 0 110 460" aria-hidden="true">'
  +'<defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1">'
  +'<stop offset="0" stop-color="#fff2c6"/><stop offset=".45" stop-color="#f2ca70"/><stop offset="1" stop-color="#7d5510"/></linearGradient></defs>'
  +'<g fill="none" stroke="url(#og)" stroke-linecap="round">'
  +'<path d="M82 438C42 406 88 372 54 340 22 310 76 278 46 246 18 216 70 186 44 154 26 132 44 116 52 104" stroke-width="13" opacity=".92"/>'
  +'<path d="M82 438C42 406 88 372 54 340 22 310 76 278 46 246 18 216 70 186 44 154 26 132 44 116 52 104" stroke-width="4" opacity=".5" stroke="#fff6d8"/>'
  +'</g>'
  +'<g fill="url(#og)" opacity=".95">'
  +'<path d="M62 86C78 60 100 52 108 62 94 63 80 74 72 90Z"/>'
  +'<path d="M44 80C34 56 14 46 4 54 18 57 30 68 34 86Z"/>'
  +'<ellipse cx="50" cy="102" rx="28" ry="21"/>'
  +'<ellipse cx="23" cy="112" rx="16" ry="12"/>'
  +'</g>'
  +'<g stroke="url(#og)" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8">'
  +'<path d="M10 122C-2 132 3 148 14 152"/><path d="M17 128C8 141 15 154 26 156"/>'
  +'</g>'
  +'<g fill="url(#og)" opacity=".5">'
  +'<circle cx="60" cy="196" r="8"/><circle cx="52" cy="252" r="8"/><circle cx="64" cy="308" r="8"/><circle cx="54" cy="366" r="8"/>'
  +'</g>'
  +'<circle cx="39" cy="98" r="4.2" fill="#3a1404"/>'
  +'</svg>'
}
/* siluet naga raksasa untuk latar (bukan aset, digambar SVG) */
function drgSVG(){
  return '<svg class="sv" viewBox="0 0 300 700" aria-hidden="true">'
  +'<g fill="none" stroke="#ffd98a" stroke-linecap="round">'
  +'<path d="M232 690C150 640 250 580 168 528 96 482 208 424 132 372 70 330 176 272 112 220 58 176 108 132 150 104" stroke-width="27"/>'
  +'<path d="M232 690C150 640 250 580 168 528 96 482 208 424 132 372 70 330 176 272 112 220 58 176 108 132 150 104" stroke-width="8" stroke="#fff6d8" opacity=".45"/>'
  +'</g><g fill="#ffd98a">'
  +'<path d="M150 104c26-44 76-62 98-48-31 6-59 28-73 58z"/>'
  +'<path d="M118 92c-24-40-70-54-92-40 28 6 54 26 66 54z"/>'
  +'<ellipse cx="134" cy="126" rx="52" ry="37"/>'
  +'<path d="M150 58c15-25 32-35 46-31-15 10-25 23-31 41z"/>'
  +'<path d="M104 60c-4-27-15-39-29-41 10 12 17 27 19 45z"/>'
  +'</g><g fill="none" stroke="#ffd98a" stroke-width="7" stroke-linecap="round">'
  +'<path d="M84 158c-30 8-44 34-40 58"/><path d="M98 170c-22 16-28 42-20 62"/>'
  +'<path d="M232 330c26 10 40 34 36 58"/><path d="M212 352c20 16 24 40 16 58"/>'
  +'</g><g fill="#ffd98a" opacity=".9">'
  +'<circle cx="62" cy="300" r="9"/><circle cx="212" cy="252" r="9"/><circle cx="152" cy="470" r="9"/>'
  +'</g><circle cx="116" cy="118" r="8" fill="#5c060c"/></svg>'
}
function buildOrn(){
  try{var s=ornSVG();el('ornL').innerHTML=s;el('ornR').innerHTML=s}catch(e){}
  try{
    var b=el('bgfx');
    if(b){
      var d=document.createElement('div');
      d.innerHTML=drgSVG().replace('<svg class="sv"','<svg class="sv l"')+drgSVG().replace('<svg class="sv"','<svg class="sv r"');
      b.appendChild(d)
    }
  }catch(e){}
}
el('seal').textContent=String.fromCharCode(0x9ebb)+String.fromCharCode(0x5c06);

/* ---------- tile ---------- */
function faceHTML(sym){
  if(sym===WLD)return '<span class="star">'+String.fromCharCode(0x2605)+'</span>';
  if(sym===SCT)return '<span class="gly c">'+String.fromCharCode(0x91d1)+'</span>';
  if(sym===FLW)return '<span class="gly f">'+String.fromCharCode(0x82b1)+'</span>';
  if(MJ.GLY[sym])return '<span class="'+MJ.GLY[sym]+(sym==='c8'?' two':'')+'">'+(MJ.TEX[sym]||'')+'</span>';
  var p=PIPS[sym]||[[50,50]],bars=(sym.charAt(0)==='s'),h='<span class="tileface'+(bars?' b':'')+'">',i,q;
  for(i=0;i<p.length;i++){
    q=p[i];
    if(bars)h+='<b style="left:'+q[0]+'%;top:'+q[1]+'%"></b>';
    else h+='<span style="left:'+q[0]+'%;top:'+q[1]+'%"></span>';
  }
  return h+'</span>'
}
function setFace(t,sym,gold){
  if(!t)return;
  t.className='tl k-'+sym+(gold?' gold':'');
  var f=t.firstChild;
  if(f)f.innerHTML=faceHTML(sym)+(gold?'<b class="ig"></b>':'')
}
/* ---------- object pool kartu ----------
   Elemen kartu dipakai ulang antar putaran/kaskade (tidak membuat DOM baru terus-menerus). */
var POOL=[],POOL_MAX=180;
function newTileEl(){
  var t=POOL.pop();
  if(t){t.className='tl';t.style.cssText='';t._win=0;return t}
  t=document.createElement('div');t.className='tl';
  var f=document.createElement('div');f.className='face';
  t.appendChild(f);
  return t
}
function freeTile(t){
  if(!t)return;
  if(t.parentNode)t.parentNode.removeChild(t);
  if(POOL.length<POOL_MAX){t.className='tl';t.style.cssText='';t._win=0;POOL.push(t)}
}
function mkTile(sym,gold){
  var t=newTileEl();
  setFace(t,sym||SYMS[(Math.random()*SYMS.length)|0],gold);
  return t
}
function yOf(r,i){return (5-ROWS[r]+i)*CELL.step}
function setY(t,y,sc){
  if(!t)return;
  t.style.setProperty('--y',y+'px');
  t.style.transform='translate3d(0,'+y+'px,0)'+(sc?' scale('+sc+')':'')
}
function renderStatic(){
  var r,i,t,row;
  for(r=0;r<5;r++){
    row=cellEl[r];if(!row)continue;
    for(i=0;i<ROWS[r];i++){
      t=row[i];if(!t)continue;
      if(t._win)continue;
      setY(t,yOf(r,i))
    }
  }
}
function buildGrid(){
  var box=el('reels'),r,i;
  box.innerHTML='';cellEl=[];grid=[];ggrid=[];
  for(r=0;r<5;r++){
    var c=document.createElement('div');c.className='col';c.id='c'+r;box.appendChild(c);
    var arr=[],syms=[],golds=[];
    for(i=0;i<ROWS[r];i++){
      var sym=SYMS[(Math.random()*SYMS.length)|0];
      var t=mkTile(sym,false);
      c.appendChild(t);arr.push(t);syms.push(sym);golds.push(false)
    }
    cellEl.push(arr);grid.push(syms);ggrid.push(golds)
  }
  renderStatic()
}
/* ---------- ukuran responsif ---------- */
/* tinggi aman elemen: kalau id tidak ada, pakai cadangan (jangan sampai layout mati) */
function oh(id,alt){var e=el(id);return e&&e.offsetHeight?e.offsetHeight:alt}
function viewH(){
  var h=window.innerHeight||640;
  var d=0,v=0;
  try{d=(document.documentElement&&document.documentElement.clientHeight)||0}catch(e){}
  try{v=(window.visualViewport&&window.visualViewport.height)||0}catch(e){}
  // hanya percaya sumber lain kalau nilainya masuk akal (hindari 0/kecii saat boot)
  if(d>240&&d<h)h=d;
  if(v>240&&v<h)h=v;
  return h
}
function belowH(){return oh('bar2',32)+oh('panel',96)+14}
function topH(){return oh('hud',28)+oh('stats',26)+oh('ladBox',26)+10}
/* lebar (cw) dari layar, tinggi (ch) dari sisa ruang -> kartu portrait seperti mahjong asli */
function setCell(cw,ch,gp){
  CELL={cw:cw,ch:ch,gp:gp,step:ch+gp};
  var box=el('reels');if(!box)return;
  var bh=5*CELL.step-gp,bw=5*cw+4*gp;
  box.style.setProperty('--gp',gp+'px');
  box.style.setProperty('--ch',ch+'px');
  box.style.setProperty('--hh',bh+'px');
  // simbol dibuat lebih besar supaya tetap terbaca di dalam card kecil
  box.style.setProperty('--fs',(Math.min(cw*0.56,ch*0.5))+'px');
  box.style.height=bh+'px';
  box.style.width=bw+'px'
}
/* SPIN = fokus utama: paling besar, tapi tidak boleh melebihi tinggi kartu.
   Dipanggil DI DALAM loop layout supaya tinggi panel ikut terukur (tidak overflow). */
function setSpin(ch){
  var small=document.body.className.indexOf('compact')>=0;
  // SPIN = fokus utama: selalu elemen terbesar. Di layar tinggi, kartu dibatasi lebar
  // sehingga menambah SPIN tidak mengurangi papan.
  var sp=Math.round(Math.max(small?74:86,Math.min(small?98:112,ch*1.06)));
  try{document.documentElement.style.setProperty('--sp',sp+'px')}catch(e){}
}
function layout(){
  var box=el('reels'),stage=el('stage');
  if(!box)return;
  var vw=window.innerWidth||360;
  // clientWidth papan sudah termasuk padding papan -> kurangi padding (2x) + cadangan kecil
  var sw=Math.max(190,((stage&&stage.clientWidth)||(vw-10))-6);
  var gp=Math.max(2,Math.round(sw*0.012));
  var vh=viewH();
  var top=0;
  try{top=box.getBoundingClientRect().top||0}catch(e){}
  if(!(top>20))top=topH();              // kalau pengukuran belum siap, hitung dari elemen di atas papan
  var cw=60,ch=60,i,cn='';
  for(i=0;i<5;i++){
    cw=Math.floor((sw-gp*4)/5);                       // lebar kartu: mau lebar layar
    // tinggi kartu: mau sisa ruang, tapi berbentuk portrait seperti kartu mahjong asli
    ch=Math.floor(Math.min((vh-top-belowH()-4-gp*4)/5,cw*1.5));
    if(cw<30)cw=30;
    if(ch<30)ch=30;
    if(cw>110)cw=110;
    if(ch>140)ch=140;
    setCell(cw,ch,gp);
    setSpin(ch);
    // semua sudah masuk layar? selesai
    if(top+(5*CELL.step-gp)+belowH()+3<=vh+2)break;
    // kalau belum: rapatkan panel dulu, lalu ukur ulang; baru kecilkan kartu
    cn=document.body.className||'';
    if(i===0&&cn.indexOf('compact')<0){document.body.className=(Q==='low'?'low compact':'compact');continue}
    if(ch<=30&&cw<=30)break;
    ch-=2;cw-=2
  }
  renderStatic()
}
/* ---------- tangga pengali ---------- */
var ladKind='';
function paintLad(idx){
  var L=ladOfNow(),k=(L===LAD_FREE?'f':'b'),h=el('lad'),i;
  if(ladKind!==k){ladKind=k;h.innerHTML='';for(i=0;i<4;i++){var x=document.createElement('i');x.style.marginTop=(i===0||i===3?2:0)+'px';h.appendChild(x)}}
  for(i=0;i<4;i++){var c=h.children[i];if(!c)continue;c.textContent='x'+L[i];c.className=(idx===i?'on':(idx===i-1?'next':''))}
}
function ladOfNow(){return (fsLeft>0||fsActive)?LAD_FREE:LAD_BASE}
/* ---------- pesan ---------- */
function cap(txt,big){var w=el('cap');w.className='cap'+(big?' big':'');w.innerHTML=txt}
function capIdle(){var w=el('cap');w.className='cap idle';w.textContent='TEKAN PUTAR UNTUK MULAI'}
function countUp(node,to,dur,pre){
  if(!node)return;
  if(REDUCED||Q==='low'){node.textContent=(pre||'')+fmt(to);return}
  var t0=0;
  function f(ts){
    if(!t0)t0=ts;
    var k=(ts-t0)/dur;if(k>1)k=1;
    var e=1-Math.pow(1-k,3);
    node.textContent=(pre||'')+fmt(to*e);
    if(k<1)requestAnimationFrame(f)
  }
  requestAnimationFrame(f)
}
/* ---------- UI ---------- */
function setUI(){
  var bet=betNow();
  el('hCoins').textContent=fmt(coins);
  el('hBet').textContent=fmt(bet);
  el('szV').textContent=MN[szI];
  el('lvV').textContent='LEVEL '+(lvI+1);
  // auto>0 ikut mengunci: di antara putaran AUTO sempat ada jeda 550ms yang
  // dulu membuat tombol aktif lagi sehingga putaran manual bisa menyelip.
  var lockSpin=(ST!=='idle')||auto>0;
  el('bSpin').disabled=lockSpin;
  el('spT').textContent=fsLeft>0?('FS '+fsLeft):(lockSpin?'...':'SPIN');
  el('bSpin').className='spin'+((!lockSpin)?' pulse':'')+(fsLeft>0?' fsmode':'');
  el('bAuto').className='bt'+(auto>0?' on':'');
  el('bAuto').textContent=auto>0?('AUTO '+auto):'AUTO';
  el('bTurbo').className='bt'+(turbo?' on':'');
  var son=GX.isOn();
  el('bSnd').className='ib'+(son?'':' off');
  try{el('bSnd').setAttribute('aria-label',son?'Suara aktif':'Suara dibisukan')}catch(e){}
  el('fsBar').className='fsBadge'+(fsLeft>0?' on':'');
  el('fsN').textContent=fsLeft;
  var lock=lockSpin||fsLeft>0;
  el('szM').disabled=el('szP').disabled=el('lvM').disabled=el('lvP').disabled=lock;
  el('szM').parentNode.parentNode.className='bt3'+(lock?' dis':'');
  el('lvM').parentNode.parentNode.className='bt3'+(lock?' dis':'');
  if(ST==='idle')paintLad(-1)
}
function burst(x,y,n,mode){
  if(REDUCED||Q==='low')return;
  var L=el('fx');if(!L)return;
  var cap2=Q==='high'?n:Math.min(n,8);
  for(var i=0;i<cap2&&PN<44;i++){
    var s=document.createElement('i');PN++;
    var a=Math.random()*6.283,r=(mode==='gold'?12+Math.random()*48:7+Math.random()*26);
    s.style.left=x+'px';s.style.top=y+'px';
    s.style.setProperty('--tx',(Math.cos(a)*r)+'px');
    s.style.setProperty('--ty',(Math.sin(a)*r-16)+'px');
    s.style.width=s.style.height=(2.5+Math.random()*3.6)+'px';
    s.style.animationDuration=(520+Math.random()*420)+'ms';
    L.appendChild(s);
    (function(e){setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);PN--},1000)})(s)
  }
}
/* panel hadiah: muncul di atas papan, angka berjalan, lalu memudar */
/* Satu id timer saja, dan di-nol-kan begitu menyala. Kalau id lama yang sudah menyala
   di-clearTimeout lagi, browser bisa MEMAKAI ULANG id itu untuk timer lain -> timer
   pembersih strip reel ikut terbatalkan (bug nyata: strip reel tertinggal di papan). */
var RW_T=0;
function reward(win,sym,ways,mult){
  var w=el('rw');if(!w)return;
  if(RW_T){clearTimeout(RW_T);RW_T=0}
  if(el('rwL'))el('rwL').innerHTML='KOIN &nbsp;&times;'+mult;
  el('rwD').innerHTML=sym+' SIMBOL &middot; '+ways+' WAYS';
  w.className='rw on';
  var n=el('rwN');
  if(n){n.textContent='+0';countUp(n,win,340,'+')}
  try{
    var L=el('fx');
    if(L){
      var a=w.getBoundingClientRect(),b=L.getBoundingClientRect();
      burst(a.left-b.left+a.width/2,a.top-b.top+a.height/2,12,'gold')
    }
  }catch(e){}
  RW_T=setTimeout(function(){RW_T=0;w.className='rw'},turbo?620:860)
}
function spinWinPulse(){
  var s=el('bSpin');
  if(!s||REDUCED||Q==='low')return;
  s.classList.add('win');
  setTimeout(function(){s.classList.remove('win')},660)
}
function burstTile(t,mode){
  try{
    var L=el('fx'),a=t.getBoundingClientRect(),b=L.getBoundingClientRect();
    burst(a.left-b.left+a.width/2,a.top-b.top+a.height/2,mode==='gold'?6:4,mode)
  }catch(e){}
}
function shake(k){
  if(REDUCED||Q==='low')return;
  var s=el('stage');
  s.classList.remove('shake');
  void s.offsetWidth;
  s.style.transform='scale('+(1+0.006*k)+')';
  s.classList.add('shake');
  setTimeout(function(){s.style.transform='';s.classList.remove('shake')},280)
}
/* ---------- gulungan: gerak ATAS -> BAWAH (rAF) ----------
   M_FILL  : panjang lintasan (jumlah kartu pengisi). Makin banyak = makin "berat".
   STOP_GAP: jeda berhenti antar reel (ms) - bisa disetel 80..150.
   SPIN_BASE/TURBO_BASE: durasi reel pertama. */
var M_FILL=10,STOP_GAP=110,SPIN_BASE=880,TURBO_BASE=620,TURBO_GAP=70;
/* Satu strip reel per kolom yang DIPAKAI ULANG terus-menerus (bukan dibuat/dihapus
   tiap putaran). Jadi saat reel berhenti tidak ada belasan elemen yang dibuang ->
   tidak ada frame panjang/patah-patah, dan tidak ada peluang strip tertinggal. */
var STRIP=[null,null,null,null,null];
function spreadFill(s,rows,r){
  var f0=rows,f1=rows+M_FILL,n=0,wait=r+1;
  function tick(){
    if(++n<wait){requestAnimationFrame(tick);return}
    for(var i=f0;i<f1;i++)setFace(s.tiles[i],SYMS[(Math.random()*SYMS.length)|0],false)
  }
  requestAnimationFrame(tick)
}
function buildRoll(r){
  var col=el('c'+r),rows=ROWS[r],i,s=STRIP[r],need=rows+M_FILL+rows;
  if(!s||s.rows!==rows){
    var wrap=document.createElement('div');wrap.className='rwrap';
    var inner=document.createElement('div');inner.className='rstrip';
    var arr=[];
    for(i=0;i<need;i++){var t=mkTile(undefined,false);inner.appendChild(t);arr.push(t)}
    wrap.appendChild(inner);
    col.appendChild(wrap);
    s=STRIP[r]={wrap:wrap,inner:inner,tiles:arr,rows:rows}
  }
  // Susunan strip: [KARTU HASIL][pengisi][KARTU LAMA].
  // Strip mulai terangkat ke ATAS sejauh (rows+M_FILL) kartu -> yang terlihat saat
  // mulai adalah kartu LAMA (hasil belum bocor), lalu strip bergerak TURUN sampai
  // offset 0 -> kartu HASIL mendarat tepat di posisi grid.
  for(i=0;i<rows;i++)setFace(s.tiles[i],CUR.g[r][i],CUR.gl[r][i]);
  for(i=rows+M_FILL;i<need;i++){var j=i-(rows+M_FILL);setFace(s.tiles[i],grid[r][j],ggrid[r][j])}
  // Kartu pengisi diisi menyusul, disebar per frame: menyiapkan 5 strip sekaligus
  // dalam satu frame sempat membuat satu frame panjang (patah-patah) di awal putaran.
  // Pengisi hanya terlihat di tengah putaran, jadi menunda beberapa frame tak terasa.
  spreadFill(s,rows,r)
  for(i=0;i<need;i++)s.tiles[i].style.transform='translate3d(0,'+(i*CELL.step)+'px,0)';
  var dist=(rows+M_FILL)*CELL.step;
  s.inner.style.setProperty('--mb','0px');
  s.inner.style.transform='translate3d(0,'+(-dist)+'px,0)';
  s.wrap.style.top=yOf(r,0)+'px';
  s.wrap.style.height=(rows*CELL.step-CELL.gp)+'px';
  col.classList.add('roll');
  return {r:r,wrap:s.wrap,inner:s.inner,dist:dist,dur:0,t0:0,done:false,bz:(Q!=='low'),_mb:-1}
}
/* Profil kecepatan reel: easeInCubic (akselerasi) -> linear (kecepatan maksimum)
   -> easeOutQuart (deselerasi). Integralnya dibuat tabel 128 langkah sehingga
   perpindahan pasti monoton: kartu tidak pernah mundur, lompat, atau teleport. */
var PR_TA=0.30,PR_TC=0.40,PR_TD=0.30;
var VP=(function(){
  var N=128,v=[],i,t,k,acc=0;
  for(i=0;i<=N;i++){
    t=i/N;
    if(t<PR_TA)k=Math.pow(t/PR_TA,3);
    else if(t<=PR_TA+PR_TC)k=1;
    else k=Math.pow(1-(t-PR_TA-PR_TC)/PR_TD,4);
    if(k<0)k=0;
    acc+=k;v.push(acc)
  }
  for(i=0;i<v.length;i++)v[i]=v[i]/acc;
  return v
})();
function vprof(t){
  var x=t*128,i=x|0;
  if(i>=128)return 1;
  return VP[i]+(VP[i+1]-VP[i])*(x-i)
}
function frame(ts){
  RAF=null;
  var i,o,busy=false,vmax=0;
  for(i=0;i<ROLLS.length;i++){
    o=ROLLS[i];
    if(o.done)continue;
    busy=true;
    if(ts<o.t0)continue;
    var t=(ts-o.t0)/o.dur;if(t>1)t=1;
    var e=vprof(t);
    // -dist (kartu LAMA) -> 0 (kartu HASIL): bergerak TURUN, selalu mulus
    o.inner.style.transform='translate3d(0,'+(-(o.dist*(1-e))).toFixed(1)+'px,0)';
    var v=(vprof(Math.min(t+0.02,1))-e)*o.dist/(o.dur*0.02);   // px per milidetik
    if(v>vmax)vmax=v;
    // motion blur searah gerak: hanya saat cepat, diturunkan bertahap, 0 saat berhenti
    if(o.bz){
      var mb=Math.round(Math.min(3.2,Math.max(0,v*1.1-0.45))*2)/2;
      if(mb!==o._mb){o._mb=mb;o.inner.style.setProperty('--mb',mb+'px')}
    }
    if(t>=1)finishRoll(o)
  }
  if(ST==='spinning'){
    ARW=(ARW+11)%360;
    try{el('arw').style.setProperty('--arw',ARW+'deg')}catch(e){}
    GX.spinLoop(true,vmax)
  }
  if(busy||ST==='spinning')RAF=requestAnimationFrame(frame);
  else{GX.spinLoop(false);el('arw').style.setProperty('--arw','0deg')}
}
function finishRoll(o){
  var r=o.r,i,col=el('c'+r);
  o.done=true;
  o.inner.style.transition='none';
  if(o.bz)o.inner.style.setProperty('--mb','0px');            // blur = 0 saat berhenti
  o.inner.style.transform='translate3d(0,0,0)';               // mendarat TEPAT di grid
  for(i=0;i<ROWS[r];i++){setFace(cellEl[r][i],CUR.g[r][i],CUR.gl[r][i]);setY(cellEl[r][i],yOf(r,i))}
  grid[r]=CUR.g[r].slice();ggrid[r]=CUR.gl[r].slice();
  // Strip TIDAK dibuang: kartu grid sudah identik di koordinat yang sama, jadi cukup
  // lepas class 'roll' (strip langsung tersembunyi). Strip tersimpan untuk putaran
  // berikutnya -> tanpa pembuatan/penghapusan elemen, tanpa kemungkinan tertinggal.
  col.classList.remove('roll');
  // efek hentakan: sedikit melewati posisi lalu memantul kembali (terasa ada berat)
  col.classList.add('hit');
  setTimeout(function(){col.classList.remove('hit')},340);
  GX.sfx('stop',{i:r});
  shake(1.1);
  stopped++;
  if(stopped>=5){GX.spinLoop(false);setTimeout(afterRoll,130)}
}

/* ---------- putaran ---------- */
function press(){
  if(ST!=='idle'){if(ST==='spinning'||ST==='stopping')pending=true;else GX.sfx('err');return}
  runRound()
}
function runRound(forced){
  if(!forced&&ST!=='idle')return;
  var bet=betNow(),inFS=(fsLeft>0);
  if(inFS)fsLeft--;
  else{
    if(coins<bet){auto=0;setUI();cap('KOIN TIDAK CUKUP - TEKAN ISI KOIN',true);GX.sfx('err');GX.vib(40);return}
    coins-=bet;ss('mj2_coins',coins)
  }
  ST='spinning';pending=false;stopped=0;ROLLS=[];ARW=0;
  CUR=new Spin(bet,inFS,0);
  stat.spins++;
  lastWin=0;
  el('hWin').textContent='0';
  setUI();
  paintLad(-1);
  cap(inFS?'FREE SPIN...':'MEMUTAR...');
  GX.music(fsLeft>0||fsActive?'bonus':'base');
  GX.sfx('start');GX.vib(8);
  el('stage').classList.add('zoom');
  setTimeout(function(){el('stage').classList.remove('zoom')},200);
  // durasi dalam MILIDETIK (ts dari rAF juga milidetik). Semua reel mulai bersamaan,
  // lalu berhenti BERURUTAN satu per satu dengan jeda tetap (STOP_GAP).
  var base=turbo?TURBO_BASE:SPIN_BASE;
  var gap=turbo?TURBO_GAP:STOP_GAP;
  var i;
  for(i=0;i<5;i++){
    var o=buildRoll(i);
    o.dur=base+i*gap;
    o.t0=0;
    ROLLS.push(o)
  }
  requestAnimationFrame(function(ts){
    var t0=ts||0,k;
    for(k=0;k<ROLLS.length;k++)ROLLS[k].t0=t0;
    if(!RAF)RAF=requestAnimationFrame(frame)
  })
}
function afterRoll(){ST='result';stepCascade()}
function markWin(res){
  var k,c,r,y,t,burstCount=0;
  for(k in res.hit){
    if(!res.hit[k])continue;
    c=k.split(',');r=+c[0];y=+c[1];
    t=cellEl[r][y];if(!t)continue;
    t.classList.add('win');t._win=1;
    setY(t,yOf(r,y),1.07);
    if(burstCount<3&&y<2){burstTile(t,res.mult>=3?'gold':'win');burstCount++}
  }
}
function clearWin(){
  var r,i,t;
  for(r=0;r<5;r++)for(i=0;i<ROWS[r];i++){
    t=cellEl[r][i];if(!t)continue;
    t.classList.remove('win');t._win=0;
    setY(t,yOf(r,i))
  }
}
function stepCascade(){
  var res=CUR.next();
  if(!res){clearWin();endSpin();return}
  markWin(res);
  var L=ladOfNow(),idx=L.indexOf(res.mult);
  paintLad(idx<0?0:idx);
  if(res.free)fsTotal+=res.win;
  lastWin=res.win;
  coins+=res.win;
  ss('mj2_coins',coins);
  stat.wins++;if(CUR.won>stat.best)stat.best=CUR.won;
  if(res.mult>=3)GX.sfx('wild');else GX.sfx('match');
  GX.vib(idx>1?[14,30]:12);
  if(res.win>0){
    reward(res.win,res.wins.length,res.wins[0].ways,res.mult);
    cap('+<span id="cw">0</span> koin &nbsp;&bull;&nbsp; x'+res.mult,true);
    countUp(el('cw'),res.win,360,'');
    spinWinPulse()
  }
  el('hCoins').textContent=fmt(coins);
  el('hWin').textContent=fmt(res.win);
  grid=CUR.g.map(function(c){return c.slice()});
  ggrid=CUR.gl.map(function(c){return c.slice()});
  if(res.mult>1)shake(1+res.mult*0.3);
  setTimeout(function(){cascadeOut(res)},turbo?150:250)
}
function cascadeOut(res){
  var r,i,j,y,rm=[],nxt=[],old=cellEl;
  for(r=0;r<5;r++){
    var need=res.need[r],map=res.map[r],arr=new Array(ROWS[r]);
    for(i=need;i<ROWS[r];i++)arr[i]=old[r][map[i-need]];
    for(i=0;i<need;i++)arr[i]=null;
    nxt.push(arr)
  }
  for(r=0;r<5;r++)for(y=0;y<ROWS[r];y++){
    var keep=false;
    for(j=0;j<nxt[r].length;j++)if(nxt[r][j]===old[r][y]){keep=true;break}
    if(!keep)rm.push([old[r][y],r,y])
  }
  for(i=0;i<rm.length;i++){
    var t=rm[i][0],yy=yOf(rm[i][1],rm[i][2]);
    t.style.transition='transform .26s cubic-bezier(.4,0,.7,.25),opacity .26s ease-in';
    t.style.transform='translate3d(0,'+(yy-8)+'px,0) scale(.34)';
    t.style.opacity='0'
  }
  var wait=rm.length?(turbo?150:250):(turbo?60:130);
  setTimeout(function(){
    for(i=0;i<rm.length;i++)freeTile(rm[i][0]);   // dikembalikan ke pool
    var made=[],need2,r2;
    for(r=0;r<5;r++){
      need2=res.need[r];
      for(i=0;i<ROWS[r];i++){
        if(nxt[r][i])continue;
        var nt=mkTile(grid[r][i],ggrid[r][i]);
        var from=yOf(r,i)-CELL.step*Math.max(need2,1);
        nt.style.transition='none';
        nt.style.transform='translate3d(0,'+from+'px,0)';
        nt.style.setProperty('--y',from+'px');
        nt.style.opacity='0';
        el('c'+r).appendChild(nt);
        nxt[r][i]=nt;made.push(nt)
      }
    }
    void el('reels').offsetHeight;
    for(r=0;r<5;r++)for(i=0;i<ROWS[r];i++){
      var tt=nxt[r][i],yy2=yOf(r,i);
      if(!tt)continue;
      tt.style.transition='';
      tt.style.opacity='1';
      if(res.morph[r][i]){
        setFace(tt,WLD,false);
        burstTile(tt,'gold');
        GX.sfx('wild');
      }else setFace(tt,grid[r][i],ggrid[r][i]);
      setY(tt,yy2)
    }
    cellEl=nxt;
    setTimeout(stepCascade,turbo?170:300)
  },wait)
}
function endSpin(){
  ST='stopping';
  var bet=betNow(),hadWin=(CUR?CUR.won:0);
  if(CUR){
    if(CUR.sc>=3&&hadWin>=0){
      var add=MJ.FS_BASE+(CUR.sc-3)*MJ.FS_EXTRA;
      if(fsLeft<=0&&!fsActive){fsTotal=0;stat.fs++}
      fsLeft+=add;fsActive=true;
      cap('<b>'+CUR.sc+' SCATTER</b> &nbsp;+'+add+' FREE SPIN',true);
      GX.sfx('bonus');GX.sfx('bonus',{});
      setTimeout(function(){GX.sfx('bonus')},170);
      GX.vib([26,55,26,55,110]);
      burst(Math.round((el('fx').clientWidth||200)/2),40,26,'gold')
    }
    if(fsActive&&fsLeft<=0){
      fsActive=false;
      cap('<b>FREE SPIN SELESAI</b> &nbsp;TOTAL +'+fmt(fsTotal),true);
      GX.sfx('big');GX.vib([20,45,20,45,140]);
      lad=0;fsTotal=0
    }
    lad=0;   // tangga pengali direset tiap putaran
  }
  ss('mj2_coins',coins);ss('mj2_stat',stat);ss('mj2_fs',{left:fsLeft,lad:lad,total:fsTotal});
  el('hWin').textContent=fmt(hadWin);
  if(hadWin>0&&hadWin<bet*20&&!fsActive){if(!REDUCED)cap('<b>+'+fmt(hadWin)+'</b> &nbsp;MENANG',true)}
  else if(hadWin<=0&&!fsActive)capIdle();
  var nxt=false,delay=turbo?220:600;
  if(fsLeft>0){nxt=true;delay=turbo?160:420}
  else{
    if(fsActive)fsActive=false;
    GX.music('base');
    if(auto>0){auto--;if(auto>0){nxt=true;delay=turbo?.2:.55*1000}}
  }
  setUI();
  var w=hadWin;
  if(w>=bet*20){
    ST='stopping';
    bigWin(w,bet,function(){after(nxt,delay)});
    return
  }
  if(w>0&&w>=bet*5)GX.sfx('win');
  after(nxt,delay)
}
function after(nxt,delay){
  // Kalau masih ada putaran menyusul (free spin / AUTO / klik yang mengantre), JANGAN
  // kembali ke idle dulu: kalau ST='idle' sementara, tombol aktif sekejap dan putaran
  // berikutnya bisa dobel (strip reel lama jadi yatim / tidak dibersihkan).
  if(nxt){setTimeout(function(){runRound(true)},turbo?150:delay);return}
  if(pending){pending=false;setTimeout(function(){runRound(true)},180);return}
  ST='idle';setUI()
}
/* ---------- popup menang besar ---------- */
var ovDone=null;
function bigWin(amount,bet,done){
  var mult=amount/bet;
  var tier=mult>=100?'MEGA WIN':(mult>=50?'SUPER WIN':'BIG WIN');
  el('ovT').textContent=tier;
  el('ovP').textContent='Taruhan '+fmt(bet)+' koin menang '+fmt(amount)+' koin ('+Math.round(mult)+'x).';
  el('ovWin').className='ovl on';
  ovDone=done||null;
  el('ovB').textContent='+0';
  countUp(el('ovB'),amount,900,'+');
  GX.sfx('big');setTimeout(function(){GX.sfx('big')},260);setTimeout(function(){GX.sfx('coin')},520);
  GX.vib([25,50,90]);shake(3);
  spinWinPulse();
  burst(Math.round((el('fx').clientWidth||200)/2),60,34,'gold')
}
/* ---------- tabel bayaran ---------- */
function buildPay(){
  var box=el('ptBox'),h='',i,s,ord=ORD.concat([WLD]);
  for(i=0;i<ord.length;i++){
    s=ord[i];
    var px=(s===WLD)?'ganti semua simbol biasa':('3: x'+MJ.payTxt(s,3)+' &nbsp; 4: x'+MJ.payTxt(s,4)+' &nbsp; 5: x'+MJ.payTxt(s,5));
    h+='<div><span class="mn">'+faceHTML(s)+'</span><b>'+MJ.NAME[s]+'</b><span class="px">'+px+'</span></div>'
  }
  h+='<div><span class="mn">'+faceHTML(SCT)+'</span><b>'+MJ.NAME[SCT]+'</b><span class="px">3+ = 10 FREE SPIN, +2 ekstra</span></div>';
  h+='<div><span class="mn">'+faceHTML(FLW)+'</span><b>'+MJ.NAME[FLW]+'</b><span class="px">pengisi reel, tidak menang</span></div>';
  box.innerHTML=h;
  el('ptFoot').innerHTML='Total spin: <b>'+stat.spins+'</b> &nbsp; Putaran menang: <b>'+stat.wins+'</b> &nbsp; Rekor menang: <b>'+fmt(stat.best)+'</b> &nbsp; Sesi free spin: <b>'+stat.fs+'</b>'
}
/* ---------- pengaturan ---------- */
function paintSet(){
  var g=GX.get();
  el('rMus').value=String(Math.round(g.mv*100));
  el('rSfx').value=String(Math.round(g.sv*100));
  el('vMus').textContent=Math.round(g.mv*100);
  el('vSfx').textContent=Math.round(g.sv*100);
  el('tMute').textContent='BISUKAN: '+(g.mute?'AKTIF':'MATI');
  el('tMute').className='tog'+(g.mute?' on':'');
  el('tVib').textContent='GETARAN: '+(g.vib?'AKTIF':'MATI');
  el('tVib').className='tog'+(g.vib?' on':'');
  el('tQ').textContent='GRAFIS: '+(Q==='low'?'RENDAH':'TINGGI');
  el('tReset').className='tog danger';
  el('tReset').textContent='HAPUS DATA PROGRES';
  el('setInfo').innerHTML='Saldo & progres tersimpan di HP ini saja. Total spin: <b>'+stat.spins+'</b>'
}
/* ---------- ikatan tombol ---------- */
var busy=0;
function tap(id,fn){
  var e=el(id);if(!e)return;
  e.addEventListener('click',function(ev){
    ev.preventDefault();
    if(Date.now()-busy<90)return;
    busy=Date.now();fn()
  })
}
function hover(el2){
  if(!window.matchMedia)return;
  try{if(!window.matchMedia('(hover:hover)').matches)return}catch(e){return}
  el2.addEventListener('pointerenter',function(){if(ST==='idle')GX.sfx('hover')});
  return el2
}
tap('bSpin',press);
tap('szM',function(){if(ST!=='idle'||fsLeft>0)return;szI=(szI+SZ.length-1)%SZ.length;setUI();GX.sfx('click')});
tap('szP',function(){if(ST!=='idle'||fsLeft>0)return;szI=(szI+1)%SZ.length;setUI();GX.sfx('click')});
tap('lvM',function(){if(ST!=='idle'||fsLeft>0)return;lvI=(lvI+9)%10;setUI();GX.sfx('click')});
tap('lvP',function(){if(ST!=='idle'||fsLeft>0)return;lvI=(lvI+1)%10;setUI();GX.sfx('click')});
tap('bTurbo',function(){if(ST!=='idle')return;turbo=!turbo;ss('mj2_cfg',{turbo:turbo});setUI();GX.sfx('click')});
tap('bAuto',function(){
  if(auto>0){auto=0;pending=false;setUI();GX.sfx('click');return}   // AUTO selalu bisa dihentikan
  if(ST!=='idle')return;
  auto=25;setUI();GX.sfx('click');runRound()
});
tap('bMax',function(){
  if(ST!=='idle')return;
  coins+=5000;ss('mj2_coins',coins);setUI();
  cap('KOIN DIISI ULANG +5.000',true);GX.sfx('coin')
});
tap('bInfo',function(){GX.sfx('click');buildPay();el('ovInfo').className='ovl on'});
tap('ptOk',function(){GX.sfx('click');el('ovInfo').className='ovl'});
tap('ovOk',function(){GX.sfx('click');el('ovWin').className='ovl';var f=ovDone;ovDone=null;if(f)f()});
tap('bSnd',function(){
  var on=!GX.isOn();
  GX.setMute(!on);GX.sfx('click');setUI();paintSet()
});
tap('bSet',function(){GX.sfx('click');paintSet();el('ovSet').className='ovl on'});
tap('setOk',function(){GX.sfx('click');el('ovSet').className='ovl'});
tap('tMute',function(){GX.setMute(!GX.get().mute);if(GX.isOn())GX.sfx('click');paintSet();setUI()});
tap('tVib',function(){GX.setVib(!GX.get().vib);GX.sfx('click');GX.vib(20);paintSet()});
tap('tQ',function(){
  Q=(Q==='low'?'high':'low');
  var s=ls('mj2_cfg2',null)||{};s.q=Q;ss('mj2_cfg2',s);
  applyQ();layout();GX.sfx('click');paintSet()
});
var rst=0;
tap('tReset',function(){
  if(!rst){
    rst=1;
    el('tReset').className='tog confirm';
    el('tReset').textContent='YAKIN? TEKAN LAGI UNTUK HAPUS';
    GX.sfx('err');
    setTimeout(function(){rst=0;if(el('tReset')){el('tReset').className='tog danger';el('tReset').textContent='HAPUS DATA PROGRES'}},3000);
    return
  }
  rst=0;
  try{localStorage.removeItem('mj2_coins');localStorage.removeItem('mj2_stat');localStorage.removeItem('mj2_fs')}catch(e){}
  coins=6000;stat={spins:0,wins:0,best:0,fs:0};fsLeft=0;fsActive=false;fsTotal=0;lad=0;auto=0;
  ss('mj2_coins',coins);
  el('hWin').textContent='0';setUI();paintSet();cap('DATA PROGRES DIHAPUS',true);GX.sfx('coin')
});
el('rMus').addEventListener('input',function(){GX.setMus((+el('rMus').value||0)/100);el('vMus').textContent=el('rMus').value});
el('rSfx').addEventListener('input',function(){GX.setSfx((+el('rSfx').value||0)/100);el('vSfx').textContent=el('rSfx').value;GX.sfx('click')});
hover(el('bSpin'));hover(el('bInfo'));hover(el('bSet'));

/* ---------- boot ---------- */
coins=ls('mj2_coins',null);
if(typeof coins!=='number'||!isFinite(coins)||coins<0)coins=6000;
stat=ls('mj2_stat',null)||stat;
if(typeof stat.spins!=='number')stat={spins:0,wins:0,best:0,fs:0};
(function(){var f=ls('mj2_fs',null);
 if(f&&typeof f.left==='number'&&f.left>0){fsLeft=Math.floor(f.left);fsActive=true;lad=(f.lad>0)?(f.lad>3?3:f.lad):0;fsTotal=(typeof f.total==='number'&&f.total>0)?f.total:0}})();
(function(){var c=ls('mj2_cfg',null);if(c&&c.turbo)turbo=true})();
applyQ();buildOrn();buildGrid();layout();buildPay();paintLad(-1);setUI();capIdle();
window.addEventListener('resize',function(){layout()});
window.addEventListener('orientationchange',function(){setTimeout(layout,220)});
setTimeout(function(){layout()},70);
setTimeout(function(){layout()},400);
GX.music('menu');
if(fsLeft>0){fsActive=true;setUI()}
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
::-webkit-scrollbar-thumb{background:rgba(255,111,174,.4);border-radius:99px}
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
.card{border-radius:10px!important;box-shadow:inset 0 3px 0 rgba(255,255,255,.6),inset 0 -4px 7px rgba(0,0,0,.3),0 6px 0 rgba(0,0,0,.28),0 11px 22px rgba(0,0,0,.45)!important}
.rwrap,.rw,.reels,.rstrip{border-radius:14px!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.1),inset 0 -8px 18px rgba(0,0,0,.6),0 14px 32px rgba(0,0,0,.55)!important}
.lad,.ladBox{border-radius:12px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 8px 20px rgba(0,0,0,.45)!important}
.bar2,.hud,.setRow{border-radius:13px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.16),0 8px 18px rgba(0,0,0,.45)!important}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🀄', key: reactionKey } }).catch(() => {})

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
                messageText: 'Nano Ai Mahjong Ways 2 🀄',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-mahjongways2-2026',
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

handler.help = ['mahjong', 'mahjongways', 'mjways', 'mahjong2']
handler.tags = ['game']
handler.command = /^(mahjong|mahjongways|mjways|mahjong2|slotmahjong|mahjongways2)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Mahjong Ways 2 — grid 4-5-5-5-4, 2000 ways, kaskade, pengali progresif, free spin'

export default handler
