/*
⌬ Nano Ai · Generator sprite Pokémon → scripts/../assets/poke/sprite-pokemon.js
  Unduh sprite PNG resmi (PokeAPI sprites repo) lalu simpan sebagai data URI
  supaya kartu richmessage bisa menampilkan Pokémon tanpa internet.
  Jalankan: node scripts/buat-sprite-poke.js
*/
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(DIR, '..', 'assets', 'poke', 'sprite-pokemon.js')

/* id = dex ID sprite resmi; nama = tampilan di game */
const SPECIES = [
  [1, 'Bulbasaur'], [2, 'Ivysaur'], [3, 'Venusaur'],
  [4, 'Charmander'], [5, 'Charmeleon'], [6, 'Charizard'],
  [7, 'Squirtle'], [8, 'Wartortle'], [9, 'Blastoise'],
  [10, 'Caterpie'], [11, 'Metapod'], [12, 'Butterfree'],
  [16, 'Pidgey'], [17, 'Pidgeotto'], [18, 'Pidgeot'],
  [19, 'Rattata'], [20, 'Raticate'],
  [21, 'Spearow'], [22, 'Fearow'],
  [23, 'Ekans'], [24, 'Arbok'],
  [25, 'Pikachu'], [26, 'Raichu'],
  [27, 'Sandshrew'], [28, 'Sandslash'],
  [35, 'Clefairy'], [36, 'Clefable'],
  [37, 'Vulpix'], [38, 'Ninetales'],
  [39, 'Jigglypuff'], [40, 'Wigglytuff'],
  [41, 'Zubat'], [42, 'Golbat'],
  [43, 'Oddish'], [44, 'Gloom'], [45, 'Vileplume'],
  [50, 'Diglett'], [51, 'Dugtrio'],
  [52, 'Meowth'], [53, 'Persian'],
  [54, 'Psyduck'], [55, 'Golduck'],
  [58, 'Growlithe'], [59, 'Arcanine'],
  [60, 'Poliwag'], [61, 'Poliwhirl'], [62, 'Poliwrath'],
  [63, 'Abra'], [64, 'Kadabra'], [65, 'Alakazam'],
  [66, 'Machop'], [67, 'Machoke'], [68, 'Machamp'],
  [69, 'Bellsprout'], [70, 'Weepinbell'], [71, 'Victreebel'],
  [72, 'Tentacool'], [73, 'Tentacruel'],
  [74, 'Geodude'], [75, 'Graveler'], [76, 'Golem'],
  [77, 'Ponyta'], [78, 'Rapidash'],
  [79, 'Slowpoke'], [80, 'Slowbro'],
  [81, 'Magnemite'], [82, 'Magneton'],
  [83, 'Farfetchd'],
  [84, 'Doduo'], [85, 'Dodrio'],
  [86, 'Seel'], [87, 'Dewgong'],
  [88, 'Grimer'], [89, 'Muk'],
  [90, 'Shellder'], [91, 'Cloyster'],
  [92, 'Gastly'], [93, 'Haunter'], [94, 'Gengar'],
  [95, 'Onix'],
  [96, 'Drowzee'], [97, 'Hypno'],
  [98, 'Krabby'], [99, 'Kingler'],
  [100, 'Voltorb'], [101, 'Electrode'],
  [102, 'Exeggcute'], [103, 'Exeggutor'],
  [104, 'Cubone'], [105, 'Marowak'],
  [106, 'Hitmonlee'], [107, 'Hitmonchan'],
  [108, 'Lickitung'],
  [109, 'Koffing'], [110, 'Weezing'],
  [111, 'Rhyhorn'], [112, 'Rhydon'],
  [113, 'Chansey'],
  [114, 'Tangela'],
  [115, 'Kangaskhan'],
  [116, 'Horsea'], [117, 'Seadra'],
  [118, 'Goldeen'], [119, 'Seaking'],
  [120, 'Staryu'], [121, 'Starmie'],
  [122, 'Mr. Mime'],
  [123, 'Scyther'],
  [124, 'Jynx'],
  [125, 'Electabuzz'],
  [126, 'Magmar'],
  [127, 'Pinsir'],
  [128, 'Tauros'],
  [129, 'Magikarp'], [130, 'Gyarados'],
  [131, 'Lapras'],
  [132, 'Ditto'],
  [133, 'Eevee'],
  [134, 'Vaporeon'], [135, 'Jolteon'], [136, 'Flareon'],
  [137, 'Porygon'],
  [138, 'Omanyte'], [139, 'Omastar'],
  [140, 'Kabuto'], [141, 'Kabutops'],
  [142, 'Aerodactyl'],
  [143, 'Snorlax'],
  [144, 'Articuno'], [145, 'Zapdos'], [146, 'Moltres'],
  [147, 'Dratini'], [148, 'Dragonair'], [149, 'Dragonite'],
  [150, 'Mewtwo'], [151, 'Mew'],
]

async function unduh(id) {
  const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} id=${id}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 100) throw new Error(`sprite terlalu kecil id=${id}`)
  return buf
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  const hasil = {}
  let gagal = 0
  for (const [id] of SPECIES) {
    try {
      const buf = await unduh(id)
      hasil[id] = `data:image/png;base64,${buf.toString('base64')}`
      process.stdout.write(`ok ${id} (${buf.length}b)\n`)
    } catch (e) {
      gagal++
      process.stdout.write(`GAGAL ${id}: ${e.message}\n`)
    }
    await new Promise((r) => setTimeout(r, 120))
  }

  const isi = `/*
⌬ Nano Ai · Sprite Pokémon (data URI, dibuat otomatis oleh scripts/buat-sprite-poke.js)
  JANGAN edit manual — jalankan ulang generator untuk memperbarui.
  Sumber gambar: PokeAPI sprites (github.com/PokeAPI/sprites).
*/
export const SPRITE = ${JSON.stringify(hasil)}

export default SPRITE
`
  fs.writeFileSync(OUT, isi)
  console.log(`\nSelesai: ${Object.keys(hasil).length} sprite tersimpan, ${gagal} gagal.`)
  console.log(`Output: ${OUT}`)
  if (gagal > 5) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
