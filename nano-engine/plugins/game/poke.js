/* eslint-disable max-len */
/*
⌬
┇ ━━━[ 🥳 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗕𝗥𝗢𝗞 ]━━━━
┇
┇ ❘ Nano Ai · POKÉMON GAME ⚡
⌬
*/

'use strict'

import { SPRITE } from '../../assets/poke/sprite-pokemon.js'

/* ════════════════════════════════ DATA GAME ════════════════════════════════
   Disematkan di dalam kartu (embed) supaya semua logika jalan di sisi klien
   dan data user tersimpan di localStorage perangkat — arsitektur yang sama
   dengan game dadu/pvz/tycoon di folder ini.                                  */

const SPECIES = [
  { id: 1, name: 'Bulbasaur', types: ['grass', 'poison'], rarity: 'common', hp: 45, atk: 49, def: 49, spd: 45 },
  { id: 2, name: 'Ivysaur', types: ['grass', 'poison'], rarity: 'common', hp: 60, atk: 62, def: 63, spd: 60 },
  { id: 3, name: 'Venusaur', types: ['grass', 'poison'], rarity: 'rare', hp: 80, atk: 82, def: 83, spd: 80 },
  { id: 4, name: 'Charmander', types: ['fire'], rarity: 'common', hp: 39, atk: 52, def: 43, spd: 65 },
  { id: 5, name: 'Charmeleon', types: ['fire'], rarity: 'common', hp: 58, atk: 64, def: 58, spd: 80 },
  { id: 6, name: 'Charizard', types: ['fire', 'flying'], rarity: 'rare', hp: 78, atk: 84, def: 78, spd: 100 },
  { id: 7, name: 'Squirtle', types: ['water'], rarity: 'common', hp: 44, atk: 48, def: 65, spd: 43 },
  { id: 8, name: 'Wartortle', types: ['water'], rarity: 'common', hp: 59, atk: 63, def: 80, spd: 58 },
  { id: 9, name: 'Blastoise', types: ['water'], rarity: 'rare', hp: 79, atk: 83, def: 100, spd: 78 },
  { id: 10, name: 'Caterpie', types: ['bug'], rarity: 'common', hp: 45, atk: 30, def: 35, spd: 45 },
  { id: 11, name: 'Metapod', types: ['bug'], rarity: 'common', hp: 50, atk: 20, def: 55, spd: 30 },
  { id: 12, name: 'Butterfree', types: ['bug', 'flying'], rarity: 'uncommon', hp: 60, atk: 45, def: 50, spd: 70 },
  { id: 16, name: 'Pidgey', types: ['normal', 'flying'], rarity: 'common', hp: 40, atk: 45, def: 40, spd: 56 },
  { id: 17, name: 'Pidgeotto', types: ['normal', 'flying'], rarity: 'common', hp: 63, atk: 60, def: 55, spd: 71 },
  { id: 18, name: 'Pidgeot', types: ['normal', 'flying'], rarity: 'uncommon', hp: 83, atk: 80, def: 75, spd: 91 },
  { id: 19, name: 'Rattata', types: ['normal'], rarity: 'common', hp: 30, atk: 56, def: 35, spd: 72 },
  { id: 20, name: 'Raticate', types: ['normal'], rarity: 'uncommon', hp: 55, atk: 81, def: 60, spd: 97 },
  { id: 21, name: 'Spearow', types: ['normal', 'flying'], rarity: 'common', hp: 40, atk: 60, def: 30, spd: 70 },
  { id: 22, name: 'Fearow', types: ['normal', 'flying'], rarity: 'uncommon', hp: 65, atk: 90, def: 65, spd: 100 },
  { id: 23, name: 'Ekans', types: ['poison'], rarity: 'common', hp: 35, atk: 60, def: 44, spd: 55 },
  { id: 24, name: 'Arbok', types: ['poison'], rarity: 'uncommon', hp: 60, atk: 85, def: 69, spd: 80 },
  { id: 25, name: 'Pikachu', types: ['electric'], rarity: 'uncommon', hp: 35, atk: 55, def: 40, spd: 90 },
  { id: 26, name: 'Raichu', types: ['electric'], rarity: 'rare', hp: 60, atk: 90, def: 55, spd: 110 },
  { id: 27, name: 'Sandshrew', types: ['ground'], rarity: 'common', hp: 50, atk: 75, def: 85, spd: 40 },
  { id: 28, name: 'Sandslash', types: ['ground'], rarity: 'uncommon', hp: 75, atk: 100, def: 110, spd: 65 },
  { id: 35, name: 'Clefairy', types: ['fairy'], rarity: 'common', hp: 70, atk: 45, def: 48, spd: 35 },
  { id: 36, name: 'Clefable', types: ['fairy'], rarity: 'uncommon', hp: 95, atk: 70, def: 73, spd: 60 },
  { id: 37, name: 'Vulpix', types: ['fire'], rarity: 'common', hp: 38, atk: 41, def: 40, spd: 65 },
  { id: 38, name: 'Ninetales', types: ['fire'], rarity: 'rare', hp: 73, atk: 76, def: 75, spd: 100 },
  { id: 39, name: 'Jigglypuff', types: ['normal', 'fairy'], rarity: 'common', hp: 115, atk: 45, def: 20, spd: 20 },
  { id: 40, name: 'Wigglytuff', types: ['normal', 'fairy'], rarity: 'uncommon', hp: 140, atk: 70, def: 45, spd: 45 },
  { id: 41, name: 'Zubat', types: ['poison', 'flying'], rarity: 'common', hp: 40, atk: 45, def: 35, spd: 55 },
  { id: 42, name: 'Golbat', types: ['poison', 'flying'], rarity: 'uncommon', hp: 75, atk: 80, def: 70, spd: 90 },
  { id: 43, name: 'Oddish', types: ['grass', 'poison'], rarity: 'common', hp: 45, atk: 50, def: 55, spd: 30 },
  { id: 44, name: 'Gloom', types: ['grass', 'poison'], rarity: 'common', hp: 60, atk: 65, def: 70, spd: 40 },
  { id: 45, name: 'Vileplume', types: ['grass', 'poison'], rarity: 'uncommon', hp: 75, atk: 80, def: 85, spd: 50 },
  { id: 50, name: 'Diglett', types: ['ground'], rarity: 'common', hp: 10, atk: 55, def: 25, spd: 95 },
  { id: 51, name: 'Dugtrio', types: ['ground'], rarity: 'uncommon', hp: 35, atk: 80, def: 50, spd: 120 },
  { id: 52, name: 'Meowth', types: ['normal'], rarity: 'common', hp: 40, atk: 45, def: 35, spd: 90 },
  { id: 53, name: 'Persian', types: ['normal'], rarity: 'uncommon', hp: 65, atk: 70, def: 60, spd: 115 },
  { id: 54, name: 'Psyduck', types: ['water'], rarity: 'common', hp: 50, atk: 52, def: 48, spd: 55 },
  { id: 55, name: 'Golduck', types: ['water'], rarity: 'uncommon', hp: 80, atk: 82, def: 78, spd: 85 },
  { id: 58, name: 'Growlithe', types: ['fire'], rarity: 'common', hp: 55, atk: 70, def: 45, spd: 60 },
  { id: 59, name: 'Arcanine', types: ['fire'], rarity: 'rare', hp: 90, atk: 110, def: 80, spd: 95 },
  { id: 60, name: 'Poliwag', types: ['water'], rarity: 'common', hp: 40, atk: 50, def: 40, spd: 90 },
  { id: 61, name: 'Poliwhirl', types: ['water'], rarity: 'common', hp: 65, atk: 65, def: 65, spd: 90 },
  { id: 62, name: 'Poliwrath', types: ['water', 'fighting'], rarity: 'rare', hp: 90, atk: 95, def: 95, spd: 70 },
  { id: 63, name: 'Abra', types: ['psychic'], rarity: 'common', hp: 25, atk: 20, def: 15, spd: 90 },
  { id: 64, name: 'Kadabra', types: ['psychic'], rarity: 'uncommon', hp: 40, atk: 35, def: 30, spd: 105 },
  { id: 65, name: 'Alakazam', types: ['psychic'], rarity: 'rare', hp: 55, atk: 50, def: 45, spd: 120 },
  { id: 66, name: 'Machop', types: ['fighting'], rarity: 'common', hp: 70, atk: 80, def: 50, spd: 35 },
  { id: 67, name: 'Machoke', types: ['fighting'], rarity: 'common', hp: 80, atk: 100, def: 70, spd: 45 },
  { id: 68, name: 'Machamp', types: ['fighting'], rarity: 'uncommon', hp: 90, atk: 130, def: 80, spd: 55 },
  { id: 69, name: 'Bellsprout', types: ['grass', 'poison'], rarity: 'common', hp: 50, atk: 75, def: 35, spd: 40 },
  { id: 70, name: 'Weepinbell', types: ['grass', 'poison'], rarity: 'common', hp: 65, atk: 90, def: 50, spd: 55 },
  { id: 71, name: 'Victreebel', types: ['grass', 'poison'], rarity: 'uncommon', hp: 80, atk: 105, def: 65, spd: 70 },
  { id: 72, name: 'Tentacool', types: ['water', 'poison'], rarity: 'common', hp: 40, atk: 40, def: 35, spd: 70 },
  { id: 73, name: 'Tentacruel', types: ['water', 'poison'], rarity: 'uncommon', hp: 80, atk: 80, def: 95, spd: 60 },
  { id: 74, name: 'Geodude', types: ['rock', 'ground'], rarity: 'common', hp: 40, atk: 80, def: 100, spd: 20 },
  { id: 75, name: 'Graveler', types: ['rock', 'ground'], rarity: 'common', hp: 55, atk: 95, def: 115, spd: 35 },
  { id: 76, name: 'Golem', types: ['rock', 'ground'], rarity: 'uncommon', hp: 80, atk: 120, def: 130, spd: 45 },
  { id: 77, name: 'Ponyta', types: ['fire'], rarity: 'common', hp: 50, atk: 85, def: 55, spd: 90 },
  { id: 78, name: 'Rapidash', types: ['fire'], rarity: 'uncommon', hp: 65, atk: 100, def: 70, spd: 105 },
  { id: 79, name: 'Slowpoke', types: ['water', 'psychic'], rarity: 'common', hp: 90, atk: 65, def: 65, spd: 15 },
  { id: 80, name: 'Slowbro', types: ['water', 'psychic'], rarity: 'uncommon', hp: 95, atk: 100, def: 110, spd: 30 },
  { id: 81, name: 'Magnemite', types: ['electric', 'steel'], rarity: 'common', hp: 25, atk: 35, def: 70, spd: 45 },
  { id: 82, name: 'Magneton', types: ['electric', 'steel'], rarity: 'uncommon', hp: 50, atk: 60, def: 95, spd: 70 },
  { id: 83, name: 'Farfetchd', types: ['normal', 'flying'], rarity: 'uncommon', hp: 52, atk: 65, def: 55, spd: 60 },
  { id: 84, name: 'Doduo', types: ['normal', 'flying'], rarity: 'common', hp: 35, atk: 85, def: 45, spd: 75 },
  { id: 85, name: 'Dodrio', types: ['normal', 'flying'], rarity: 'uncommon', hp: 60, atk: 110, def: 70, spd: 100 },
  { id: 86, name: 'Seel', types: ['water'], rarity: 'common', hp: 65, atk: 45, def: 55, spd: 45 },
  { id: 87, name: 'Dewgong', types: ['water', 'ice'], rarity: 'uncommon', hp: 90, atk: 70, def: 80, spd: 70 },
  { id: 88, name: 'Grimer', types: ['poison'], rarity: 'common', hp: 80, atk: 80, def: 50, spd: 25 },
  { id: 89, name: 'Muk', types: ['poison'], rarity: 'uncommon', hp: 105, atk: 105, def: 75, spd: 50 },
  { id: 90, name: 'Shellder', types: ['water'], rarity: 'common', hp: 30, atk: 65, def: 100, spd: 40 },
  { id: 91, name: 'Cloyster', types: ['water', 'ice'], rarity: 'rare', hp: 50, atk: 95, def: 180, spd: 70 },
  { id: 92, name: 'Gastly', types: ['ghost', 'poison'], rarity: 'common', hp: 30, atk: 35, def: 30, spd: 80 },
  { id: 93, name: 'Haunter', types: ['ghost', 'poison'], rarity: 'uncommon', hp: 45, atk: 50, def: 45, spd: 95 },
  { id: 94, name: 'Gengar', types: ['ghost', 'poison'], rarity: 'rare', hp: 60, atk: 65, def: 60, spd: 110 },
  { id: 95, name: 'Onix', types: ['rock', 'ground'], rarity: 'uncommon', hp: 35, atk: 45, def: 160, spd: 70 },
  { id: 96, name: 'Drowzee', types: ['psychic'], rarity: 'common', hp: 60, atk: 48, def: 45, spd: 42 },
  { id: 97, name: 'Hypno', types: ['psychic'], rarity: 'uncommon', hp: 85, atk: 73, def: 70, spd: 67 },
  { id: 98, name: 'Krabby', types: ['water'], rarity: 'common', hp: 30, atk: 105, def: 90, spd: 50 },
  { id: 99, name: 'Kingler', types: ['water'], rarity: 'uncommon', hp: 55, atk: 130, def: 115, spd: 75 },
  { id: 100, name: 'Voltorb', types: ['electric'], rarity: 'common', hp: 40, atk: 30, def: 50, spd: 100 },
  { id: 101, name: 'Electrode', types: ['electric'], rarity: 'uncommon', hp: 60, atk: 50, def: 70, spd: 150 },
  { id: 102, name: 'Exeggcute', types: ['grass', 'psychic'], rarity: 'common', hp: 60, atk: 40, def: 80, spd: 40 },
  { id: 103, name: 'Exeggutor', types: ['grass', 'psychic'], rarity: 'uncommon', hp: 95, atk: 95, def: 85, spd: 55 },
  { id: 104, name: 'Cubone', types: ['ground'], rarity: 'common', hp: 50, atk: 50, def: 95, spd: 35 },
  { id: 105, name: 'Marowak', types: ['ground'], rarity: 'uncommon', hp: 60, atk: 80, def: 110, spd: 45 },
  { id: 106, name: 'Hitmonlee', types: ['fighting'], rarity: 'uncommon', hp: 50, atk: 120, def: 53, spd: 87 },
  { id: 107, name: 'Hitmonchan', types: ['fighting'], rarity: 'uncommon', hp: 50, atk: 105, def: 79, spd: 76 },
  { id: 108, name: 'Lickitung', types: ['normal'], rarity: 'uncommon', hp: 90, atk: 55, def: 75, spd: 30 },
  { id: 109, name: 'Koffing', types: ['poison'], rarity: 'common', hp: 40, atk: 65, def: 95, spd: 35 },
  { id: 110, name: 'Weezing', types: ['poison'], rarity: 'uncommon', hp: 65, atk: 90, def: 120, spd: 60 },
  { id: 111, name: 'Rhyhorn', types: ['ground', 'rock'], rarity: 'common', hp: 80, atk: 85, def: 95, spd: 25 },
  { id: 112, name: 'Rhydon', types: ['ground', 'rock'], rarity: 'rare', hp: 105, atk: 130, def: 120, spd: 40 },
  { id: 113, name: 'Chansey', types: ['normal'], rarity: 'rare', hp: 250, atk: 5, def: 5, spd: 50 },
  { id: 114, name: 'Tangela', types: ['grass'], rarity: 'uncommon', hp: 65, atk: 55, def: 115, spd: 60 },
  { id: 115, name: 'Kangaskhan', types: ['normal'], rarity: 'rare', hp: 105, atk: 95, def: 80, spd: 90 },
  { id: 116, name: 'Horsea', types: ['water'], rarity: 'common', hp: 30, atk: 40, def: 70, spd: 60 },
  { id: 117, name: 'Seadra', types: ['water'], rarity: 'uncommon', hp: 55, atk: 65, def: 95, spd: 85 },
  { id: 118, name: 'Goldeen', types: ['water'], rarity: 'common', hp: 45, atk: 67, def: 60, spd: 63 },
  { id: 119, name: 'Seaking', types: ['water'], rarity: 'uncommon', hp: 80, atk: 92, def: 65, spd: 68 },
  { id: 120, name: 'Staryu', types: ['water'], rarity: 'common', hp: 30, atk: 45, def: 55, spd: 85 },
  { id: 121, name: 'Starmie', types: ['water', 'psychic'], rarity: 'rare', hp: 60, atk: 75, def: 85, spd: 115 },
  { id: 122, name: 'Mr. Mime', types: ['psychic', 'fairy'], rarity: 'uncommon', hp: 40, atk: 45, def: 65, spd: 90 },
  { id: 123, name: 'Scyther', types: ['bug', 'flying'], rarity: 'rare', hp: 70, atk: 110, def: 80, spd: 105 },
  { id: 124, name: 'Jynx', types: ['ice', 'psychic'], rarity: 'uncommon', hp: 65, atk: 50, def: 35, spd: 95 },
  { id: 125, name: 'Electabuzz', types: ['electric'], rarity: 'uncommon', hp: 65, atk: 83, def: 57, spd: 105 },
  { id: 126, name: 'Magmar', types: ['fire'], rarity: 'uncommon', hp: 65, atk: 95, def: 57, spd: 93 },
  { id: 127, name: 'Pinsir', types: ['bug'], rarity: 'uncommon', hp: 65, atk: 125, def: 100, spd: 85 },
  { id: 128, name: 'Tauros', types: ['normal'], rarity: 'uncommon', hp: 75, atk: 100, def: 95, spd: 110 },
  { id: 129, name: 'Magikarp', types: ['water'], rarity: 'common', hp: 20, atk: 10, def: 55, spd: 80 },
  { id: 130, name: 'Gyarados', types: ['water', 'flying'], rarity: 'rare', hp: 95, atk: 125, def: 79, spd: 81 },
  { id: 131, name: 'Lapras', types: ['water', 'ice'], rarity: 'rare', hp: 130, atk: 85, def: 80, spd: 60 },
  { id: 132, name: 'Ditto', types: ['normal'], rarity: 'rare', hp: 48, atk: 48, def: 48, spd: 48 },
  { id: 133, name: 'Eevee', types: ['normal'], rarity: 'uncommon', hp: 55, atk: 55, def: 50, spd: 55 },
  { id: 134, name: 'Vaporeon', types: ['water'], rarity: 'rare', hp: 130, atk: 65, def: 60, spd: 65 },
  { id: 135, name: 'Jolteon', types: ['electric'], rarity: 'rare', hp: 65, atk: 65, def: 60, spd: 130 },
  { id: 136, name: 'Flareon', types: ['fire'], rarity: 'rare', hp: 65, atk: 130, def: 60, spd: 65 },
  { id: 137, name: 'Porygon', types: ['normal'], rarity: 'uncommon', hp: 65, atk: 60, def: 70, spd: 40 },
  { id: 138, name: 'Omanyte', types: ['rock', 'water'], rarity: 'common', hp: 35, atk: 40, def: 100, spd: 35 },
  { id: 139, name: 'Omastar', types: ['rock', 'water'], rarity: 'uncommon', hp: 70, atk: 60, def: 125, spd: 55 },
  { id: 140, name: 'Kabuto', types: ['rock', 'water'], rarity: 'common', hp: 30, atk: 80, def: 90, spd: 55 },
  { id: 141, name: 'Kabutops', types: ['rock', 'water'], rarity: 'uncommon', hp: 60, atk: 115, def: 105, spd: 80 },
  { id: 142, name: 'Aerodactyl', types: ['rock', 'flying'], rarity: 'rare', hp: 80, atk: 105, def: 65, spd: 130 },
  { id: 143, name: 'Snorlax', types: ['normal'], rarity: 'rare', hp: 160, atk: 110, def: 65, spd: 30 },
  { id: 144, name: 'Articuno', types: ['ice', 'flying'], rarity: 'legendary', hp: 90, atk: 85, def: 100, spd: 85 },
  { id: 145, name: 'Zapdos', types: ['electric', 'flying'], rarity: 'legendary', hp: 90, atk: 90, def: 85, spd: 100 },
  { id: 146, name: 'Moltres', types: ['fire', 'flying'], rarity: 'legendary', hp: 90, atk: 100, def: 90, spd: 90 },
  { id: 147, name: 'Dratini', types: ['dragon'], rarity: 'uncommon', hp: 41, atk: 64, def: 45, spd: 50 },
  { id: 148, name: 'Dragonair', types: ['dragon'], rarity: 'rare', hp: 61, atk: 84, def: 65, spd: 70 },
  { id: 149, name: 'Dragonite', types: ['dragon', 'flying'], rarity: 'legendary', hp: 91, atk: 134, def: 95, spd: 80 },
  { id: 150, name: 'Mewtwo', types: ['psychic'], rarity: 'legendary', hp: 106, atk: 110, def: 90, spd: 130 },
  { id: 151, name: 'Mew', types: ['psychic'], rarity: 'legendary', hp: 100, atk: 100, def: 100, spd: 100 },
]

const ITEMS = {
  pokeball: { name: 'Poké Ball', emoji: '🟡', price: 120, sell: 40, catch: 0.40, color: '#e63946' },
  greatball: { name: 'Great Ball', emoji: '🔵', price: 320, sell: 110, catch: 0.60, color: '#3b82f6' },
  ultraball: { name: 'Ultra Ball', emoji: '🔴', price: 700, sell: 240, catch: 0.80, color: '#f59e0b' },
  masterball: { name: 'Master Ball', emoji: '🟣', price: 12000, sell: 4000, catch: 1.00, color: '#a855f7' },
  potion: { name: 'Potion', emoji: '🧪', price: 180, sell: 60, heal: 40 },
  superpotion: { name: 'Super Potion', emoji: '💉', price: 420, sell: 140, heal: 90 },
  candy: { name: 'Rare Candy', emoji: '🍬', price: 900, sell: 300, exp: 220 },
  berry: { name: 'Oran Berry', emoji: '🍓', price: 90, sell: 30, heal: 18, feed: true },
}

const STARTERS = [1, 4, 7]

const NPC_TRAINERS = [
  { name: 'Youngster Joey', team: [19, 21], reward: 140 },
  { name: 'Bug Catcher Rick', team: [10, 13, 127], reward: 180 },
  { name: 'Lass Dana', team: [39, 35, 52], reward: 230 },
  { name: 'Hiker Elias', team: [74, 95, 111], reward: 300 },
  { name: 'Sailor Bruno', team: [72, 98, 54], reward: 340 },
  { name: 'Rocker Vince', team: [100, 81, 125], reward: 420 },
  { name: 'Picnicker June', team: [43, 114, 79], reward: 460 },
  { name: 'Jr. Trainer Ray', team: [66, 106, 25], reward: 560 },
  { name: 'Gym Leader Kaia', team: [7, 90, 131], reward: 800 },
  { name: 'Elite Rowan', team: [65, 143, 149], reward: 1500 },
]

/* ── Jurus battle klasik ── */
const MOVES = {
  tackle: { name: 'Tackle', type: 'normal', pow: 40, acc: 100, pp: 35, pri: 0 },
  quickattack: { name: 'Quick Attack', type: 'normal', pow: 40, acc: 100, pp: 30, pri: 1 },
  bodyslam: { name: 'Body Slam', type: 'normal', pow: 85, acc: 100, pp: 15, pri: 0 },
  hyperbeam: { name: 'Hyper Beam', type: 'normal', pow: 150, acc: 90, pp: 5, pri: 0 },
  ember: { name: 'Ember', type: 'fire', pow: 40, acc: 100, pp: 25, pri: 0 },
  flamethrower: { name: 'Flamethrower', type: 'fire', pow: 90, acc: 100, pp: 15, pri: 0 },
  fireblast: { name: 'Fire Blast', type: 'fire', pow: 110, acc: 85, pp: 5, pri: 0 },
  watergun: { name: 'Water Gun', type: 'water', pow: 40, acc: 100, pp: 25, pri: 0 },
  surf: { name: 'Surf', type: 'water', pow: 90, acc: 100, pp: 15, pri: 0 },
  hydropump: { name: 'Hydro Pump', type: 'water', pow: 110, acc: 80, pp: 5, pri: 0 },
  vinewhip: { name: 'Vine Whip', type: 'grass', pow: 45, acc: 100, pp: 25, pri: 0 },
  energyball: { name: 'Energy Ball', type: 'grass', pow: 90, acc: 100, pp: 15, pri: 0 },
  spark: { name: 'Spark', type: 'electric', pow: 45, acc: 100, pp: 25, pri: 0 },
  thunderbolt: { name: 'Thunderbolt', type: 'electric', pow: 90, acc: 100, pp: 15, pri: 0 },
  thunder: { name: 'Thunder', type: 'electric', pow: 110, acc: 70, pp: 10, pri: 0 },
  icywind: { name: 'Icy Wind', type: 'ice', pow: 55, acc: 95, pp: 15, pri: 0 },
  icebeam: { name: 'Ice Beam', type: 'ice', pow: 90, acc: 100, pp: 10, pri: 0 },
  karatechop: { name: 'Karate Chop', type: 'fighting', pow: 50, acc: 100, pp: 25, pri: 0 },
  crosschop: { name: 'Cross Chop', type: 'fighting', pow: 100, acc: 80, pp: 5, pri: 0 },
  acid: { name: 'Acid', type: 'poison', pow: 40, acc: 100, pp: 30, pri: 0 },
  sludgebomb: { name: 'Sludge Bomb', type: 'poison', pow: 90, acc: 100, pp: 10, pri: 0 },
  mudshot: { name: 'Mud Shot', type: 'ground', pow: 55, acc: 95, pp: 15, pri: 0 },
  earthquake: { name: 'Earthquake', type: 'ground', pow: 100, acc: 100, pp: 10, pri: 0 },
  gust: { name: 'Gust', type: 'flying', pow: 40, acc: 100, pp: 35, pri: 0 },
  wingattack: { name: 'Wing Attack', type: 'flying', pow: 75, acc: 100, pp: 20, pri: 0 },
  aerialace: { name: 'Aerial Ace', type: 'flying', pow: 60, acc: 100, pp: 20, pri: 1 },
  confusion: { name: 'Confusion', type: 'psychic', pow: 50, acc: 100, pp: 25, pri: 0 },
  psychicm: { name: 'Psychic', type: 'psychic', pow: 90, acc: 100, pp: 10, pri: 0 },
  bugbite: { name: 'Bug Bite', type: 'bug', pow: 60, acc: 100, pp: 20, pri: 0 },
  xscissor: { name: 'X-Scissor', type: 'bug', pow: 80, acc: 100, pp: 15, pri: 0 },
  rockthrow: { name: 'Rock Throw', type: 'rock', pow: 50, acc: 95, pp: 15, pri: 0 },
  rockslide: { name: 'Rock Slide', type: 'rock', pow: 75, acc: 90, pp: 10, pri: 0 },
  lick: { name: 'Lick', type: 'ghost', pow: 40, acc: 100, pp: 30, pri: 0 },
  shadowball: { name: 'Shadow Ball', type: 'ghost', pow: 80, acc: 100, pp: 15, pri: 0 },
  dragonbreath: { name: 'Dragon Breath', type: 'dragon', pow: 60, acc: 100, pp: 20, pri: 0 },
  dragonclaw: { name: 'Dragon Claw', type: 'dragon', pow: 80, acc: 100, pp: 15, pri: 0 },
  bite: { name: 'Bite', type: 'dark', pow: 60, acc: 100, pp: 25, pri: 0 },
  darkpulse: { name: 'Dark Pulse', type: 'dark', pow: 80, acc: 100, pp: 15, pri: 0 },
  metalclaw: { name: 'Metal Claw', type: 'steel', pow: 50, acc: 95, pp: 35, pri: 0 },
  ironhead: { name: 'Iron Head', type: 'steel', pow: 80, acc: 100, pp: 15, pri: 0 },
  fairywind: { name: 'Fairy Wind', type: 'fairy', pow: 40, acc: 100, pp: 30, pri: 0 },
  moonblast: { name: 'Moonblast', type: 'fairy', pow: 95, acc: 100, pp: 15, pri: 0 },
}
const MOVE_T1 = { normal: 'tackle', fire: 'ember', water: 'watergun', grass: 'vinewhip', electric: 'spark', ice: 'icywind', fighting: 'karatechop', poison: 'acid', ground: 'mudshot', flying: 'gust', psychic: 'confusion', bug: 'bugbite', rock: 'rockthrow', ghost: 'lick', dragon: 'dragonbreath', dark: 'bite', steel: 'metalclaw', fairy: 'fairywind' }
const MOVE_T2 = { normal: 'bodyslam', fire: 'flamethrower', water: 'surf', grass: 'energyball', electric: 'thunderbolt', ice: 'icebeam', fighting: 'crosschop', poison: 'sludgebomb', ground: 'earthquake', flying: 'wingattack', psychic: 'psychicm', bug: 'xscissor', rock: 'rockslide', ghost: 'shadowball', dragon: 'dragonclaw', dark: 'darkpulse', steel: 'ironhead', fairy: 'moonblast' }
const MOVECOL = { normal: '#a8a878', fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030', ice: '#98d8d8', fighting: '#c03028', poison: '#a040a0', ground: '#e0c068', flying: '#a890f0', psychic: '#f85888', bug: '#a8b820', rock: '#b8a038', ghost: '#705898', dragon: '#7038f8', dark: '#705848', steel: '#b8b8d0', fairy: '#ee99ac' }

const RARITY_LABEL = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' }
const RARITY_COLOR = { common: '#9aa7b5', uncommon: '#57c785', rare: '#4aa3ff', epic: '#c26bff', legendary: '#ffb63d' }
const GACHA_RATES = { common: 58, uncommon: 26, rare: 11, epic: 4, legendary: 1 }
const TYPE_EMOJI = {
  normal: '⭐', fire: '🔥', water: '💧', grass: '🌿', electric: '⚡', ice: '❄️',
  fighting: '🥊', poison: '☠️', ground: '🏜️', flying: '🕊️', psychic: '🔮',
  bug: '🐛', rock: '🪨', ghost: '👻', dragon: '🐲', steel: '⚙️', fairy: '🌸',
}
const CHART = {
  fire: { grass: 2, ice: 2, bug: 2, steel: 2, fire: 0.5, water: 0.5, rock: 0.5, dragon: 0.5 },
  water: { fire: 2, rock: 2, ground: 2, water: 0.5, grass: 0.5, dragon: 0.5 },
  grass: { water: 2, rock: 2, ground: 2, fire: 0.5, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, steel: 0.5 },
  electric: { water: 2, flying: 2, electric: 0.5, grass: 0.5, dragon: 0.5, ground: 0 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, fairy: 0.5 },
  poison: { grass: 2, fairy: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: 0.5, bug: 0.5, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2, electric: 0.5, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2, fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: 0.5, ground: 0.5, steel: 0.5 },
  ghost: { psychic: 2, ghost: 2, dark: 0.5, normal: 0 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { psychic: 2, ghost: 2, fighting: 0.5, dark: 0.5, fairy: 0.5 },
  steel: { ice: 2, rock: 2, fairy: 2, fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
  fairy: { fighting: 2, dragon: 2, dark: 2, fire: 0.5, poison: 0.5, steel: 0.5 },
}

function effectivenessNode(moveType, defTypes) {
  let mult = 1
  for (const t of defTypes) {
    const row = CHART[moveType]
    if (row && row[t] !== undefined) mult *= row[t]
  }
  return mult
}
void effectivenessNode

/* ════════════════════════════════ KARTU HTML ════════════════════════════════ */

const DATA_JSON = JSON.stringify({ SPECIES, ITEMS, STARTERS, NPC_TRAINERS, MOVES, MOVE_T1, MOVE_T2, MOVECOL, RARITY_LABEL, RARITY_COLOR, GACHA_RATES, TYPE_EMOJI, CHART, SPRITE })

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Pokémon Game</title>
<style>
:root{--bg:#0e1626;--panel:#16213a;--panel2:#1b2a4a;--line:#2a3d66;--gold:#ffcb05;--blue:#3b6fd6;--txt:#eaf1ff;--dim:#8fa3c8;--good:#57c785;--bad:#ff6b6b}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{background:radial-gradient(120% 90% at 50% 0%,#1c2f57 0%,var(--bg) 62%);color:var(--txt);font-family:-apple-system,'Segoe UI',Roboto,sans-serif;min-height:100%;overscroll-behavior:none}
body{padding:12px 10px 90px}
img{-webkit-user-drag:none;user-select:none}
button{font-family:inherit}
.app{max-width:480px;margin:0 auto}
.logo{text-align:center;margin-bottom:10px}
.logo h1{font-size:20px;letter-spacing:.12em;color:var(--gold);text-shadow:0 2px 12px rgba(255,203,5,.35)}
.logo small{color:var(--dim);font-size:11px;letter-spacing:.3em}
.card{background:linear-gradient(160deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:10px;box-shadow:0 10px 26px rgba(0,0,0,.35)}
.head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}
.head b{font-size:14px;letter-spacing:.08em;color:var(--gold)}
.pill{font-size:11px;padding:3px 10px;border-radius:99px;background:#0d1526;border:1px solid var(--line);color:var(--dim)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat{background:#0d1526;border:1px solid var(--line);border-radius:10px;padding:8px 10px}
.stat span{display:block;font-size:10px;color:var(--dim);letter-spacing:.08em}
.stat b{font-size:15px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:none;border-radius:12px;padding:10px 14px;font-weight:700;font-size:13px;color:#fff;cursor:pointer;transition:transform .08s ease,filter .15s}
.btn:active{transform:scale(.96)}
.btn.gold{background:linear-gradient(160deg,#ffd54d,#f0a500);color:#3a2800;box-shadow:0 4px 14px rgba(240,165,0,.35)}
.btn.blue{background:linear-gradient(160deg,#4d84ff,#2c56b8);box-shadow:0 4px 14px rgba(44,86,184,.4)}
.btn.red{background:linear-gradient(160deg,#ff7a6b,#d64533);box-shadow:0 4px 14px rgba(214,69,51,.35)}
.btn.ghost{background:#0d1526;border:1px solid var(--line);color:var(--txt)}
.btn:disabled{opacity:.45;pointer-events:none}
.menu{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.mbtn{background:linear-gradient(160deg,#20304f,#16213a);border:1px solid var(--line);border-radius:12px;padding:10px 4px;text-align:center;color:var(--txt);cursor:pointer;transition:transform .08s}
.mbtn:active{transform:scale(.95)}
.mbtn .ico{font-size:19px}
.mbtn .lbl{font-size:10.5px;margin-top:3px;color:var(--dim);font-weight:600}
.mbtn.hot{border-color:rgba(255,203,5,.55);box-shadow:0 0 14px rgba(255,203,5,.14)}
.sprite-wrap{display:flex;justify-content:center;padding:6px 0}
.sprite-wrap img{width:132px;height:132px;image-rendering:auto;filter:drop-shadow(0 10px 14px rgba(0,0,0,.5))}
.hpbar{height:9px;border-radius:99px;background:#0d1526;border:1px solid var(--line);overflow:hidden}
.hpbar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#57c785,#8fe3ae);transition:width .35s ease}
.hpbar.low i{background:linear-gradient(90deg,#ff8a5c,#ff6b6b)}
.hpbar.mid i{background:linear-gradient(90deg,#ffd54d,#ffe487)}
.log{background:#0d1526;border:1px solid var(--line);border-radius:10px;padding:8px 10px;font-size:12px;line-height:1.55;max-height:150px;overflow-y:auto;color:#c9d7f2}
.log b{color:var(--gold)}
.toast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%) translateY(20px);background:#0d1526ee;border:1px solid var(--gold);color:var(--gold);padding:9px 16px;border-radius:12px;font-size:13px;font-weight:700;opacity:0;pointer-events:none;transition:.25s;z-index:50;max-width:88%;text-align:center}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.views{display:none}.views.on{display:block}
.tabs{display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap}
.tab{flex:1;min-width:70px;text-align:center;padding:8px 6px;border-radius:10px;background:#0d1526;border:1px solid var(--line);color:var(--dim);font-size:12px;font-weight:700;cursor:pointer}
.tab.on{color:#3a2800;background:linear-gradient(160deg,#ffd54d,#f0a500);border-color:transparent}
.deckrow{display:flex;align-items:center;gap:10px;background:#0d1526;border:1px solid var(--line);border-radius:12px;padding:8px 10px;margin-bottom:7px;cursor:pointer}
.deckrow img{width:52px;height:52px}
.deckrow .inf{flex:1;min-width:0}
.deckrow .nm{font-weight:700;font-size:13.5px}
.deckrow .sb{font-size:11px;color:var(--dim)}
.badge{font-size:9.5px;font-weight:800;letter-spacing:.06em;padding:2px 7px;border-radius:99px}
.rowflex{display:flex;gap:7px;align-items:center;flex-wrap:wrap}
.itemrow{display:flex;align-items:center;gap:10px;background:#0d1526;border:1px solid var(--line);border-radius:12px;padding:9px 11px;margin-bottom:7px}
.itemrow .em{font-size:21px}
.itemrow .inf{flex:1}
.itemrow .nm{font-size:13px;font-weight:700}
.itemrow .sb{font-size:11px;color:var(--dim)}
.qty{font-size:12px;color:var(--gold);font-weight:800}
.bottombar{position:fixed;left:0;right:0;bottom:0;background:linear-gradient(180deg,rgba(14,22,38,0),rgba(14,22,38,.96) 42%);padding:12px 12px 14px;display:flex;gap:8px;justify-content:center;z-index:40}
.bottombar .btn{flex:1;max-width:170px;padding:13px 10px;font-size:14px;border-radius:14px}
.small{font-size:11px;color:var(--dim)}
.center{text-align:center}
.mono{font-variant-numeric:tabular-nums}
.shake{animation:shk .4s}
@keyframes shk{0%,100%{transform:translateX(0)}25%{transform:translateX(-7px)}75%{transform:translateX(7px)}}
.pop{animation:pp .5s ease}
@keyframes pp{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
.float{position:fixed;pointer-events:none;font-weight:900;font-size:20px;z-index:60;animation:fl 1s ease forwards;text-shadow:0 2px 8px rgba(0,0,0,.6)}
@keyframes fl{0%{opacity:0;transform:translateY(6px)}20%{opacity:1}100%{opacity:0;transform:translateY(-46px)}}
.lbrw{display:flex;align-items:center;gap:9px;padding:7px 10px;border-bottom:1px dashed #22345a;font-size:12.5px}
.lbrw .rank{width:26px;color:var(--gold);font-weight:800}
.spin{display:inline-block;animation:sp 1s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
.muted{opacity:.55}
.arena{position:relative;height:280px;border-radius:14px;border:1px solid #22345a;overflow:hidden;background:linear-gradient(180deg,#4f9be0 0%,#7fc4ef 30%,#c9ecfb 52%,#cfe9a8 52%,#9ed37f 74%,#79b45a 100%)}.arena.shake{animation:shk .45s}
@keyframes shk{0%,100%{transform:translate(0,0)}15%{transform:translate(-8px,4px)}30%{transform:translate(7px,-5px)}45%{transform:translate(-5px,-3px)}60%{transform:translate(5px,4px)}80%{transform:translate(-2px,1px)}}
.arena .sun{position:absolute;top:12px;right:20px;width:46px;height:46px;border-radius:50%;background:radial-gradient(circle,#fffbe0 0%,#ffe98a 52%,rgba(255,233,138,0) 74%);z-index:1}
.arena .cloud{position:absolute;background:#fff;border-radius:50px;opacity:.92;z-index:1;animation:cdrift 30s linear infinite}
.arena .cloud::before,.arena .cloud::after{content:"";position:absolute;background:#fff;border-radius:50%}
.arena .cloud.c1{top:18px;left:-110px;width:78px;height:22px}
.arena .cloud.c1::before{width:32px;height:32px;top:-15px;left:15px}
.arena .cloud.c1::after{width:24px;height:24px;top:-9px;left:42px}
.arena .cloud.c2{top:52px;left:-150px;width:58px;height:16px;animation-duration:40s;animation-delay:-14s;opacity:.72}
.arena .cloud.c2::before{width:23px;height:23px;top:-11px;left:10px}
.arena .cloud.c2::after{width:17px;height:17px;top:-7px;left:31px}
@keyframes cdrift{0%{transform:translateX(0)}100%{transform:translateX(520px)}}
.arena .tallgrass{position:absolute;bottom:0;left:0;right:0;height:60px;z-index:1;background:repeating-linear-gradient(90deg,transparent 0 7px,rgba(44,88,24,.4) 7px 9px,transparent 9px 16px);-webkit-mask-image:linear-gradient(180deg,transparent,#000 55%);mask-image:linear-gradient(180deg,transparent,#000 55%)}
.plat{position:absolute;border-radius:50%;background:radial-gradient(closest-side,#bce290 0%,#8cc35f 60%,#69a341 100%);box-shadow:0 5px 0 rgba(35,68,16,.5),inset 0 3px 6px rgba(255,255,255,.45);z-index:1}
.plat.pfoe{top:104px;right:12px;width:150px;height:38px}
.plat.pme{bottom:36px;left:6px;width:196px;height:50px}
.plate{position:absolute;background:linear-gradient(180deg,#fdf8e8,#ece4c4);border:2.5px solid #6b5a36;border-radius:4px 14px 4px 14px;padding:6px 9px;width:50%;box-shadow:0 3px 0 #3a2f14,0 6px 14px rgba(0,0,0,.4);z-index:3}
.foeplate{top:10px;left:10px}
.myplate{bottom:40px;right:10px}
.plate .nm{font-weight:800;font-size:12px;color:#2c2416;text-transform:uppercase;letter-spacing:.4px}
.plate .lv{float:right;font-weight:800;color:#b3541e}
.plate .hpbar{height:8px;margin-top:4px;background:#d8cfae;border-color:#6b5a36}
.plate .hpt{font-size:9.5px;color:#4c4128;text-align:right;margin-top:2px;font-weight:700}
.bspr{position:absolute;width:124px;height:124px;image-rendering:pixelated;filter:drop-shadow(0 12px 6px rgba(20,40,10,.45));transition:transform .16s ease,opacity .5s;z-index:2;animation:bob 2.8s ease-in-out infinite}
@keyframes bob{0%,100%{margin-top:0}50%{margin-top:-5px}}
.bspr.foe{top:16px;right:24px;transform:scaleX(-1);animation-delay:-1.4s}
.bspr.me{bottom:38px;left:28px}
.bspr.lunge-me{transform:translate(48px,-24px) scale(1.07);animation:none}
.bspr.lunge-foe{transform:scaleX(-1) translate(48px,-24px) scale(1.07);animation:none}
.bspr.hitfx{animation:hitf .55s!important}
@keyframes hitf{0%,100%{opacity:1;transform:translateX(0)}12%,50%{opacity:.15;filter:brightness(2.6)}25%,65%{transform:translateX(-8px)}38%,78%{transform:translateX(8px)}}
.bspr.hitfx.foe{animation-name:hitff}
@keyframes hitff{0%,100%{opacity:1;transform:scaleX(-1) translateX(0)}12%,50%{opacity:.15;filter:brightness(2.6);transform:scaleX(-1) translateX(-8px)}25%,65%{transform:scaleX(-1) translateX(8px)}}
.bspr.faintfx{transform:translateY(58px)!important;opacity:0;transition:transform .6s ease-in,opacity .6s;animation:none!important}
.bspr.faintfx.foe{transform:scaleX(-1) translateY(58px)!important}
.critflash{position:absolute;inset:0;background:#fff;z-index:5;pointer-events:none;animation:cfl .4s forwards}
@keyframes cfl{0%{opacity:.85}100%{opacity:0}}
.dmgfloat{position:absolute;font-weight:900;font-size:27px;font-style:italic;z-index:6;animation:dfl .95s forwards;text-shadow:0 2px 0 #3a0d0d,0 3px 6px rgba(0,0,0,.55);pointer-events:none}
@keyframes dfl{0%{opacity:0;transform:translateY(10px) scale(.6)}25%{opacity:1;transform:translateY(0) scale(1.2)}55%{transform:translateY(-14px) scale(1.05)}100%{opacity:0;transform:translateY(-46px) scale(1)}}
.ballfly{position:absolute;left:80px;bottom:90px;z-index:6;animation:bfl .85s ease-in forwards;pointer-events:none}
.ballfly i{display:block;width:24px;height:24px;border-radius:50%;background:linear-gradient(180deg,#e63946 48%,#f2f2f2 52%);border:2.5px solid #1c1c1c;box-shadow:0 3px 5px rgba(0,0,0,.4)}
@keyframes bfl{0%{transform:translate(0,0) rotate(0);opacity:1}70%{opacity:1}100%{transform:translate(150px,-150px) rotate(720deg);opacity:0}}
.textbox{background:#f7f2df;border:3px solid #6b5a36;border-radius:11px;min-height:66px;padding:8px 11px;color:#2c2416;font-size:12.5px;margin-top:8px;line-height:1.55;box-shadow:0 3px 0 #3a2f14}
.textbox b{color:#8a3b12}
.actiongrid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:8px}
.movebtn{display:flex;flex-direction:column;align-items:flex-start;gap:2px;background:#0d1526;border:1.5px solid var(--line);border-radius:11px;padding:8px 10px;color:var(--txt);font-weight:800;font-size:12.5px;cursor:pointer;text-align:left}
.movebtn .sub{font-weight:600;font-size:10px;color:var(--dim)}
.movebtn:active{transform:scale(.96)}
.movebtn:disabled{opacity:.4}
</style>
</head>
<body>
<div class="app">
  <div class="logo"><h1>⚡ POKÉMON GAME</h1><small>TRAINER ADVENTURE</small></div>
  <div id="app"></div>
</div>
<div class="bottombar" id="bottombar"></div>
<div class="toast" id="toast"></div>
<script>
(function(){
'use strict'
var D = ${DATA_JSON}
function effectiveness(moveType, defTypes) {
  var mult = 1
  for (var ti = 0; ti < defTypes.length; ti++) {
    var row = D.CHART[moveType]
    if (row && row[defTypes[ti]] !== undefined) mult *= row[defTypes[ti]]
  }
  return mult
}
var $ = function(s){return document.querySelector(s)}
var app = $('#app'), bar = $('#bottombar'), toastEl = $('#toast')
var KEY = 'nano_poke_save_v1'
var esc = function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]})}
var fmt = function(n){return Math.round(n).toLocaleString('id-ID')}
var now = function(){return Date.now()}

/* ── state ─────────────────────────── */
function defaultTrainer(){return{trainerId:'PKM-'+(100000+Math.floor(Math.random()*899999)),name:'Trainer',level:1,exp:0,coin:600,win:0,lose:0,catch:0,daily:0,dailyDate:'',started:false,active:0}}
function defPkm(spId,lvl){var s=spFor(spId);var m=maxExpFor(lvl);return{uid:'PKM-'+(100000+Math.floor(Math.random()*899999)),sp:spId,nick:'',level:lvl,exp:0,maxExp:m,hp:s.hp+Math.floor(s.hp*.12*(lvl-1)),maxHp:s.hp+Math.floor(s.hp*.12*(lvl-1)),atk:s.atk+Math.floor(s.atk*.10*(lvl-1)),def:s.def+Math.floor(s.def*.10*(lvl-1)),spd:s.spd+Math.floor(s.spd*.09*(lvl-1)),candy:0}}
function maxExpFor(l){return 60+l*34}
function trainerMaxExp(l){return 120+l*70}
function spFor(id){for(var i=0;i<D.SPECIES.length;i++){if(D.SPECIES[i].id===id)return D.SPECIES[i]}return D.SPECIES[0]}
function spr(id){return D.SPRITE[id]||''}
function typeTag(t){var e=D.TYPE_EMOJI[t]||'⭐';return '<span style="opacity:.9">'+e+'</span>'}
var mem={}
function stGet(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}}
function stSet(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v}
function clone(o){return JSON.parse(JSON.stringify(o))}
var S=load()
function safe(raw){raw=raw&&typeof raw==='object'?raw:{};var out=Object.assign(defaultTrainer(),raw);out.deck=Array.isArray(raw.deck)?raw.deck:[];out.bag=raw.bag&&typeof raw.bag==='object'?raw.bag:{};out.encounter=raw.encounter&&typeof raw.encounter==='object'?raw.encounter:null;out.battle=raw.battle&&typeof raw.battle==='object'?raw.battle:null;out.cds=raw.cds&&typeof raw.cds==='object'?raw.cds:{};out.streak=raw.streak||0;out.claimed=raw.claimed||{};out.lastTrain=raw.lastTrain||0;out.lastHunt=raw.lastHunt||0;out.lastExplore=raw.lastExplore||0;out.coin=Math.max(0,Math.floor(out.coin)||0);if(out.active>=out.deck.length)out.active=Math.max(0,out.deck.length-1);if(out.started&&out.deck.length===0)out.started=false;return out}
function load(){try{var raw=JSON.parse(stGet(KEY)||'null');return safe(raw)}catch(e){return safe(null)}}
function save(){try{stSet(KEY,JSON.stringify(S))}catch(e){}}
function trExp(n){S.exp+=n;var up=0;while(S.exp>=trainerMaxExp(S.level)){S.exp-=trainerMaxExp(S.level);S.level++;up++}if(up)toast('🎖️ Trainer naik ke Lv.'+S.level+'!');save();return up}
function cdRemain(k,ms){var t=S.cds[k]||0;if(t>now())return t-now();return 0}
function cdSet(k,ms){S.cds[k]=now()+ms;save()}
function cdText(ms){var s=Math.ceil(ms/1000);var m=Math.floor(s/60);s=s%60;return(m>0?m+':':'')+String(s).padStart(2,'0')}

/* ── UI helpers ────────────────────── */
var view='home'
var VIEWS=['home','bag','deck','card','find','battle','fight','gacha','feed','explore','shop','sell','leaderboard','profile','info','reward']
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toastEl._t);toastEl._t=setTimeout(function(){toastEl.classList.remove('show')},1800)}
function floatText(x,y,txt,color){var f=document.createElement('div');f.className='float';f.style.left=x+'px';f.style.top=y+'px';f.style.color=color||'#ffd54d';f.textContent=txt;document.body.appendChild(f);setTimeout(function(){f.remove()},1000)}
function setView(v){view=v;render()}
function go(v){S.encounter=null;setView(v)}
var renderers={home:vHome,bag:vBag,deck:vDeck,card:vCard,find:vFind,battle:vBattle,fight:vFight,gacha:vGacha,feed:vFeed,explore:vExplore,shop:vShop,sell:vSell,leaderboard:vBoard,profile:vProfile,info:vInfo,reward:vReward}
function render(){var fn=renderers[view]||vHome;app.innerHTML=fn();window.scrollTo(0,0);renderBar();bind()}

function topbar(t,extra,noBack){return '<div class="card"><div class="head">'+(noBack?'':'<button class="btn ghost" data-act="back" style="padding:6px 11px;font-size:13px">◀</button>')+'<b style="flex:1;text-align:center">'+t+'</b><span style="width:38px"></span>'+(extra||'')+'</div>'}
function statBox(l,v,c){return '<div class="stat"><span>'+l+'</span><b style="'+(c?'color:'+c:'')+'">'+v+'</b></div>'}
function actPkm(){return S.deck[S.active]||S.deck[0]||null}
function pkmName(p){return p.nick||spFor(p.sp).name}
function pkmTypes(p){return spFor(p.sp).types}
function hpPct(p){return Math.max(0,Math.min(100,Math.round(p.hp/p.maxHp*100)))}
function hpCls(p){var x=hpPct(p);return x<=25?'low':x<=55?'mid':''}
function badge(r){var c=D.RARITY_COLOR[r]||'#999';return '<span class="badge" style="background:'+c+'22;color:'+c+';border:1px solid '+c+'55">'+(D.RARITY_LABEL[r]||r).toUpperCase()+'</span>'}
function pkmRow(p,idx,extra){var s=spFor(p.sp);return '<div class="deckrow" data-act="pickdeck" data-i="'+idx+'"><img src="'+spr(p.sp)+'" alt=""><div class="inf"><div class="nm">'+esc(pkmName(p))+' <span class="small">Lv.'+p.level+'</span></div><div class="sb">HP '+Math.round(p.hp)+'/'+p.maxHp+' · ATK '+p.atk+' · DEF '+p.def+' · SPD '+p.spd+' · '+s.types.map(typeTag).join(' ')+'</div></div>'+(extra||'')+'</div>'}

/* ── HOME ──────────────────────────── */
function vHome(){
 if(!S.started)return vStart()
 var p=actPkm();var items=bagCount()
 var h=topbar('🏠 TRAINER '+esc(S.name),'<span class="pill">ID '+S.trainerId+'</span>',true)+
 '<div class="grid2" style="margin-bottom:8px">'+statBox('⭐ Level',S.level,'var(--gold)')+statBox('💰 Coin',fmt(S.coin),'#ffd54d')+
 statBox('🎒 Item',items)+statBox('🐾 Pokémon',S.deck.length)+'</div>'
 if(p)h+='<div class="grid2">'+statBox('⚔️ Aktif',esc(pkmName(p))+' Lv.'+p.level)+statBox('❤️ HP',Math.round(p.hp)+'/'+p.maxHp,p.hp<=0?'var(--bad)':'var(--good)')+'</div>'
 h+='<div class="small" style="margin-top:8px">Win '+S.win+' · Lose '+S.lose+' · Catch '+S.catch+'</div></div>'
 h+='<div class="card"><div class="head"><b>❰ MENU POKEMON ❱</b></div><div class="menu">'+
 [['bag','🎒','Bag'],['deck','🐾','Deck'],['card','🃏','Card'],['find','🔎','Find'],['train','🏋️','Train'],['hunt','🏹','Hunt'],['explore','🌍','Explore'],['feed','🍖','Feed'],['battle','⚔️','Battle'],['gacha','🎰','Gacha'],['shop','🛒','Shop'],['sell','💰','Sell'],['daily','📅','Daily'],['board','🏆','Rank'],['profile','📋','Profile']].
 map(function(x){return '<button class="mbtn'+(x[0]==='find'||x[0]==='train'?' hot':'')+'" data-act="menu" data-v="'+x[0]+'"><div class="ico">'+x[1]+'</div><div class="lbl">'+x[2]+'</div></button>'}).join('')+'</div></div>'
 return h}
function vStart(){
 return topbar('🖐️ MULAI PETUALANGAN','',true)+
 '<div class="center" style="margin-bottom:10px"><div class="sprite-wrap"><img class="pop" src="'+spr(25)+'"></div>'+
 '<div class="small">Pilih Pokémon pertamamu. Starter menentukan jalur type-mu — pilih yang cocok!</div></div>'+
 '<div class="grid2">'+D.STARTERS.map(function(id){var s=spFor(id);return '<div class="card" style="margin:0;cursor:pointer;text-align:center" data-act="starter" data-id="'+id+'"><div class="sprite-wrap" style="padding:0"><img src="'+spr(id)+'" style="width:86px;height:86px"></div><b style="font-size:13px">'+s.name+'</b><div class="small">'+s.types.map(typeTag).join(' ')+'</div><div class="small">HP '+s.hp+' · ATK '+s.atk+'</div></div>'}).join('')+'</div></div>'}
function bagCount(){var n=0;for(var k in S.bag)n+=S.bag[k]||0;return n}
function itemOf(k){return D.ITEMS[k]||null}

/* ── BAG ───────────────────────────── */
function vBag(){
 var keys=Object.keys(D.ITEMS).filter(function(k){return (S.bag[k]||0)>0})
 var h=topbar('🎒 POKÉ BAG','<span class="pill">'+bagCount()+' item</span>')
 if(!keys.length)h+='<div class="small center">Tas kosong. Beli item di Shop 🛒 atau jelajah 🌍.</div>'
 keys.forEach(function(k){var it=D.ITEMS[k];h+='<div class="itemrow"><div class="em">'+it.emoji+'</div><div class="inf"><div class="nm">'+it.name+'</div><div class="sb">'+(it.catch?('Catch rate '+Math.round(it.catch*100)+'%'):'')+(it.heal?(' Pulihkan '+it.heal+' HP'):'')+(it.exp?(' +'+it.exp+' EXP Pokémon'):'')+(it.feed?(' Pakai untuk Feed'):'')+'</div></div><div class="qty">×'+S.bag[k]+'</div>'+
 ((it.heal||it.exp)?'<button class="btn blue" data-act="useitem" data-k="'+k+'" style="padding:7px 11px;font-size:11.5px">PAKAI</button>':'')+'</div>'})
 return h+'</div>'}

/* ── DECK / CARD ───────────────────── */
var cardIdx=0
function vDeck(){
 var h=topbar('🐾 MY POKÉMON','<span class="pill">'+S.deck.length+' ekor</span>')
 if(!S.deck.length)h+='<div class="small center">Belum punya Pokémon. Coba 🔎 Find atau 🎰 Gacha.</div>'
 S.deck.forEach(function(p,i){h+=pkmRow(p,i,'<span class="pill" style="'+(i===S.active?'color:var(--gold);border-color:var(--gold)':'')+'">'+(i===S.active?'★ AKTIF':'#'+(i+1))+'</span>')})
 return h+'</div>'}
function vCard(){
 if(!S.deck.length)return topbar('🃏 POKÉ CARD','')+'<div class="small center">Tidak ada Pokémon.</div></div>'
 if(cardIdx>=S.deck.length)cardIdx=0
 var p=S.deck[cardIdx];var s=spFor(p.sp);var c=D.RARITY_COLOR[s.rarity]
 var h=topbar('🃏 POKÉ CARD','<span class="pill">'+(cardIdx+1)+'/'+S.deck.length+'</span>')
 h+='<div class="center" style="background:linear-gradient(165deg,'+c+'18,#0d1526 60%);border:1px solid '+c+'55;border-radius:14px;padding:14px 10px;margin-bottom:10px">'
 h+='<div class="sprite-wrap"><img class="pop" src="'+spr(p.sp)+'"></div>'
 h+='<div style="font-size:17px;font-weight:800">'+esc(pkmName(p))+' <span style="color:var(--gold)">Lv.'+p.level+'</span></div>'
 h+='<div style="margin:4px 0 8px">'+badge(s.rarity)+' '+s.types.map(typeTag).join(' ')+'</div>'
 h+='<div class="hpbar '+hpCls(p)+'" style="margin-bottom:8px"><i style="width:'+hpPct(p)+'%"></i></div>'
 h+='<div class="grid2">'+statBox('❤️ HP',Math.round(p.hp)+'/'+p.maxHp)+statBox('⚔️ ATK',p.atk)+statBox('🛡️ DEF',p.def)+statBox('💨 SPD',p.spd)+statBox('✨ EXP',Math.round(p.exp)+'/'+p.maxExp)+statBox('🍬 Candy',p.candy)+'</div>'
 h+='<div class="small" style="margin-top:8px">UID: '+p.uid+'</div></div>'
 h+='<div class="rowflex" style="justify-content:center"><button class="btn ghost" data-act="cardprev">◀</button>'+
 '<button class="btn blue" data-act="cardset" style="flex:1">'+(cardIdx===S.active?'★ POKÉMON AKTIF':'JADIKAN AKTIF')+'</button>'+
 '<button class="btn ghost" data-act="cardnext">▶</button></div>'
 return h+'</div>'}

/* ── FIND / CATCH ──────────────────── */
function rollSpecies(minR){var pool=D.SPECIES.filter(function(s){return rarityRank(s.rarity)>=rarityRank(minR)});var weights=pool.map(function(s){var r=rarityRank(s.rarity);return [100,34,10,3,0.6][r]});var tot=weights.reduce(function(a,b){return a+b},0);var x=Math.random()*tot;for(var i=0;i<pool.length;i++){x-=weights[i];if(x<=0)return pool[i]}return pool[0]}
function rarityRank(r){return{common:0,uncommon:1,rare:2,epic:3,legendary:4}[r]||0}
function vFind(){
 var e=S.encounter
 var h=topbar('🔎 CARI POKÉMON','')
 if(!e){
  h+='<div class="center" style="margin:8px 0"><div class="sprite-wrap"><img src="'+spr(54)+'" style="opacity:.85"></div><div class="small">Jelajahi rumput liar untuk menemukan Pokémon liar.</div></div>'
  h+='<div class="center"><button class="btn gold" data-act="dofind" style="min-width:180px">🌿 CARI SEKARANG</button></div>'
 }else{
  var s=spFor(e.sp)
  h+='<div class="center"><div class="sprite-wrap"><img class="pop" src="'+spr(e.sp)+'"></div>'
  h+='<div style="font-size:16px;font-weight:800">A wild '+s.name+' appeared!</div>'
  h+='<div style="margin:5px 0">'+badge(s.rarity)+' '+s.types.map(typeTag).join(' ')+'</div>'
  h+='<div class="small">Lv.'+e.level+' · HP '+Math.round(e.hp)+'/'+e.maxHp+'</div>'
  h+='<div class="hpbar" style="max-width:220px;margin:8px auto"><i style="width:'+Math.round(e.hp/e.maxHp*100)+'%"></i></div></div>'
  h+='<div class="rowflex" style="justify-content:center;margin-top:10px">'
  ;['pokeball','greatball','ultraball','masterball'].forEach(function(k){if((S.bag[k]||0)>0){var it=D.ITEMS[k];h+='<button class="btn '+(k==='masterball'?'gold':'blue')+'" data-act="throw" data-k="'+k+'" style="flex:1;min-width:86px">'+it.emoji+' ×'+S.bag[k]+'</button>'}})
  h+='</div>'
  if(!hasBall())h+='<div class="small center" style="margin-top:8px">❌ Tidak punya Poké Ball! Beli di 🛒 Shop.</div>'
  h+='<div class="center" style="margin-top:8px"><button class="btn ghost" data-act="flee">🏃 KABUR</button></div>'
 }
 return h+'</div>'}
function hasBall(){return ['pokeball','greatball','ultraball','masterball'].some(function(k){return (S.bag[k]||0)>0})}
function doFind(){
 var e={sp:rollSpecies('common').id,level:2+Math.floor(Math.random()*18),hp:0,maxHp:0}
 var s=spFor(e.sp)
 e.maxHp=Math.round((s.hp+Math.floor(s.hp*.12*(e.level-1)))*(0.8+Math.random()*.4));e.hp=e.maxHp
 S.encounter=e;save();render()}
function throwBall(k){
 var e=S.encounter;if(!e)return
 if((S.bag[k]||0)<=0)return toast('Ball habis!')
 S.bag[k]--
 var it=D.ITEMS[k];var s=spFor(e.sp)
 var hpFactor=1-0.45*(e.hp/e.maxHp)
 var chance=Math.min(1,it.catch*hpFactor*(e.level>15?0.85:1))
 var ok=Math.random()<chance
 if(ok){
  var p=defPkm(e.sp,e.level);p.hp=e.hp
  S.deck.push(p);S.catch++
  if(S.catch>=1&&S.deck.length===1)S.started=true
  trExp(30+e.level*4)
  toast('🎉 '+s.name+' berhasil ditangkap!')
  S.encounter=null;save();setView('deck')
 }else{
  e.hp=Math.max(1,Math.round(e.hp*0.98))
  var esc=Math.random()<0.25
  if(esc){S.encounter=null;toast('💨 '+s.name+' berhasil kabur!');save();render()}
  else{toast('❌ Gagal! '+it.name+' terlepas.');save();render()}
 }}

/* ── TRAIN / HUNT / EXPLORE / DAILY ── */
var CD_TRAIN=3*60*1000,CD_HUNT=4*60*1000,CD_EXPLORE=4*60*1000,CD_DAILY=22*60*60*1000
function vExplore(){
 var cdT=cdRemain('train',CD_TRAIN),cdH=cdRemain('hunt',CD_HUNT),cdE=cdRemain('explore',CD_EXPLORE)
 var today=new Date().toISOString().slice(0,10)
 var dailyReady=S.dailyDate!==today
 var h=topbar('🗺️ AKTIVITAS HARIAN','')
 function actRow(icon,title,desc,cd,act,ready){return '<div class="itemrow"><div class="em">'+icon+'</div><div class="inf"><div class="nm">'+title+'</div><div class="sb">'+desc+'</div></div>'+(cd>0?'<span class="qty small">⏳ '+cdText(cd)+'</span>':'<button class="btn gold" data-act="'+act+'" style="padding:8px 13px;font-size:12px">MULAI</button>')+'</div>'}
 h+=actRow('🏋️','Training','Latih dirimu: +EXP trainer, +coin, +item acak',cdT,'dotrain',cdT<=0)
 h+=actRow('🏹','Hunting','Berburu untuk coin — bisa bonus item!',cdH,'dohunt',cdH<=0)
 h+=actRow('🌍','Explore','Jelajah dunia: item, coin, bahkan Pokémon',cdE,'doexplore',cdE<=0)
 h+=actRow('📅','Daily Reward','Klaim hadiah harian (streak '+S.streak+'🔥)',dailyReady?0:CD_DAILY,'dodaily',dailyReady)
 return h+'</div>'}
function randItem(k){S.bag[k]=(S.bag[k]||0)+1;return itemOf(k)}
function doTrain(){S.lastTrain=now();var coin=40+Math.floor(Math.random()*70);var exp=35+Math.floor(Math.random()*45);var txt=['🏋️ Training selesai!','+'+exp+' EXP · +'+coin+' Coin'];S.coin+=coin;trExp(exp)
 var r=Math.random()
 if(r<.5){randItem('pokeball');txt.push('+1 Poké Ball 🟡')}else if(r<.72){randItem('berry');txt.push('+1 Oran Berry 🍓')}else if(r<.9){randItem('potion');txt.push('+1 Potion 🧪')}
 var p=actPkm();if(p&&Math.random()<.6){p.exp+=12;checkLevel(p);txt.push(pkmName(p)+' ikut latihan +12 EXP')}
 cdSet('train',CD_TRAIN);save();showReward('🏋️ HASIL TRAINING',txt)}
function doHunt(){var coin,gagal=Math.random()<0.16
 if(gagal){cdSet('hunt',CD_HUNT);save();showReward('🏹 HASIL HUNTING',['❌ Mangsa lolos... Tidak ada hasil.'])}
 else{coin=60+Math.floor(Math.random()*140);S.coin+=coin;var txt=['🎯 Berhasil! +'+coin+' Coin']
  if(Math.random()<.3){randItem('pokeball');txt.push('Bonus: +1 Poké Ball 🟡')}
  var p=actPkm();if(p&&Math.random()<.4){p.exp+=10;checkLevel(p);txt.push(pkmName(p)+' +10 EXP')}
  cdSet('hunt',CD_HUNT);save();showReward('🏹 HASIL HUNTING',txt)}}
function doExplore(){var r=Math.random();var txt=['🌍 Kamu menjelajah dunia Pokémon...']
 if(r<.34){var c=30+Math.floor(Math.random()*90);S.coin+=c;txt.push('Menemukan '+c+' Coin 💰')}
 else if(r<.55){randItem('pokeball');txt.push('Menemukan Poké Ball 🟡')}
 else if(r<.68){randItem('potion');txt.push('Menemukan Potion 🧪')}
 else if(r<.78){randItem('berry');txt.push('Menemukan Oran Berry 🍓')}
 else if(r<.86){randItem('greatball');txt.push('Menemukan Great Ball 🔵!')}
 else if(r<.93){randItem('candy');txt.push('Menemukan Rare Candy 🍬 — langka!')}
 else{var s=rollSpecies(Math.random()<.25?'rare':'uncommon');var p=defPkm(s.id,3+Math.floor(Math.random()*8));S.deck.push(p);S.catch++;txt.push('✨ Menemukan '+s.name+' Lv.'+p.level+' — langsung bergabung!')}
 cdSet('explore',CD_EXPLORE);save();showReward('🌍 HASIL EXPLORE',txt)}
function doDaily(){var today=new Date().toISOString().slice(0,10);if(S.dailyDate===today)return
 var yest=new Date(now()-86400000).toISOString().slice(0,10)
 S.streak=S.dailyDate===yest?S.streak+1:1;S.dailyDate=today
 var coin=150+Math.min(350,S.streak*40);var txt=[]
 S.coin+=coin;txt.push('+'+coin+' Coin 💰 (streak '+S.streak+' 🔥)')
 randItem('pokeball');randItem('pokeball');txt.push('+2 Poké Ball 🟡')
 if(S.streak>=3){randItem('greatball');txt.push('Streak bonus: +1 Great Ball 🔵')}
 if(S.streak>=7){randItem('ultraball');randItem('candy');txt.push('Streak 7 hari: +Ultra Ball 🔴 +Rare Candy 🍬!')}
 trExp(50);txt.push('+50 EXP')
 save();showReward('📅 DAILY REWARD',txt)}
var rewardData=null
function showReward(title,lines){rewardData={title:title,lines:lines};setView('reward')}
function vReward(){
 var r=rewardData||{title:'HASIL',lines:[]}
 return topbar(r.title,'')+'<div class="center"><div class="sprite-wrap"><img class="pop" src="'+spr(52)+'"></div>'+
 r.lines.map(function(t){return '<div style="font-size:14px;margin:5px 0;font-weight:700;color:#ffe9a3">'+esc(t)+'</div>'}).join('')+
 '<button class="btn gold" data-act="back" style="margin-top:12px;min-width:150px">LANJUT</button></div></div>'}
function checkLevel(p){var up=0;while(p.exp>=p.maxExp){p.exp-=p.maxExp;p.level++;p.maxExp=maxExpFor(p.level);var s=spFor(p.sp);p.maxHp+=Math.max(2,Math.floor(s.hp*.12));p.hp=p.maxHp;p.atk+=Math.max(1,Math.floor(s.atk*.10));p.def+=Math.max(1,Math.floor(s.def*.10));p.spd+=Math.max(1,Math.floor(s.spd*.09));up++}
 if(up){toast('⬆️ '+pkmName(p)+' naik ke Lv.'+p.level+'!')}}

/* ── FEED / USE ────────────────────── */
function vFeed(){
 var h=topbar('🍖 FEED POKÉMON','')
 if(!S.deck.length)h+='<div class="small center">Belum punya Pokémon.</div>'
 var berries=S.bag.berry||0,candy=S.bag.candy||0
 h+='<div class="small" style="margin-bottom:8px">🍓 Oran Berry: <b class="mono">'+berries+'</b> · 🍬 Rare Candy: <b class="mono">'+candy+'</b> — pilih Pokémon lalu beri makan untuk EXP.</div>'
 S.deck.forEach(function(p,i){h+=pkmRow(p,i,'<span class="rowflex">'+
  '<button class="btn blue" data-act="feeditem" data-i="'+i+'" data-k="berry" style="padding:7px 10px;font-size:11px">🍓</button>'+
  '<button class="btn gold" data-act="feeditem" data-i="'+i+'" data-k="candy" style="padding:7px 10px;font-size:11px">🍬</button></span>')})
 return h+'</div>'}
function feedPkm(i,k){
 var p=S.deck[i];if(!p)return
 if((S.bag[k]||0)<=0)return toast('Item habis!')
 var it=itemOf(k);S.bag[k]--
 if(it.exp){p.exp+=it.exp;toast('🍬 '+pkmName(p)+' +'+it.exp+' EXP!')}
 else{var heal=it.heal||20;p.hp=Math.min(p.maxHp,p.hp+heal);p.exp+=15;toast('🍓 '+pkmName(p)+' +'+heal+' HP, +15 EXP')}
 checkLevel(p);save();render()}
function useHealItem(k){
 var p=actPkm();if(!p)return toast('Tidak ada Pokémon aktif!')
 var it=itemOf(k)
 if(it.heal){if(p.hp>=p.maxHp)return toast('HP sudah penuh!');if((S.bag[k]||0)<=0)return toast('Item habis!');S.bag[k]--;p.hp=Math.min(p.maxHp,p.hp+it.heal);toast('🧪 '+pkmName(p)+' pulih +'+it.heal+' HP')}
 else if(it.exp){if((S.bag[k]||0)<=0)return toast('Item habis!');S.bag[k]--;p.exp+=it.exp;checkLevel(p);toast('🍬 '+pkmName(p)+' +'+it.exp+' EXP!')}
 save();render()}

/* ── BATTLE (NPC) ──────────────────── */
function vBattle(){
 var p=actPkm()
 var h=topbar('⚔️ BATTLE','')
 if(!p||p.hp<=0&&!S.deck.some(function(x){return x.hp>0})){h+='<div class="small center">Tidak ada Pokémon siap tempur. Sembuhkan dulu 🧪</div></div>';return h}
 h+='<div class="small" style="margin-bottom:8px">Pertarungan klasik: pilih jurus (FIGHT), pakai item (BAG), ganti Pokémon, atau kabur (RUN). Urutan serangan ditentukan Speed & prioritas jurus.</div>'
 D.NPC_TRAINERS.forEach(function(t,i){var tot=t.team.reduce(function(a,id){var s=spFor(id);return a+s.hp+s.atk},0)
  h+='<div class="itemrow"><div class="em">'+['🧢','🐛','🎀','⛏️','⚓','🎸','🧺','🎽','🏅','👑'][i]+'</div><div class="inf"><div class="nm">'+esc(t.name)+'</div><div class="sb">'+t.team.map(function(id){return spFor(id).name}).join(' · ')+'</div></div><button class="btn '+(i<4?'blue':i<8?'gold':'red')+'" data-act="startfight" data-i="'+i+'" style="padding:8px 12px;font-size:12px">FIGHT</button></div>'})
 return h+'</div>'}
function vFight(){
 var b=S.battle
 if(!b)return topbar('⚔️','')+'<div class="small center">Tidak ada pertarungan aktif.</div></div>'
 var mine=b.mine[b.mi],foe=b.foe[Math.min(b.fi,b.foe.length-1)]
 var h=topbar('⚔️ '+esc(b.npc),'<span class="pill">Turn '+b.turn+'</span>')
 h+='<div class="arena" id="arena">'
 h+='<i class="sun"></i><i class="cloud c1"></i><i class="cloud c2"></i><i class="tallgrass"></i>'
 h+='<i class="plat pfoe"></i><i class="plat pme"></i>'
 if(b.shake)h+='<i class="critflash"></i>'
 h+='<div class="plate foeplate"><div class="nm">'+esc(spFor(foe.sp).name)+'<span class="lv">Lv.'+foe.level+'</span></div><div class="hpbar '+hpCls(foe)+'"><i style="width:'+hpPct(foe)+'%;transition:width .5s ease"></i></div><div class="hpt">'+Math.round(Math.max(0,foe.hp))+' / '+foe.maxHp+'</div></div>'
 h+='<div class="plate myplate"><div class="nm">'+esc(pkmName(mine))+'<span class="lv">Lv.'+mine.level+'</span></div><div class="hpbar '+hpCls(mine)+'"><i style="width:'+hpPct(mine)+'%;transition:width .5s ease"></i></div><div class="hpt">HP '+Math.round(Math.max(0,mine.hp))+'/'+mine.maxHp+' · ATK '+mine.atk+' · DEF '+mine.def+'</div></div>'
 h+='<img id="spr-me" class="bspr me'+(b.fx&&b.fx.side==='me'&&b.fx.kind==='hit'?' hitfx':b.fx&&b.fx.side==='me'&&b.fx.kind==='faint'?' faintfx':b.fx&&b.fx.side==='foe'&&b.fx.kind==='lunge'?' lunge-me':'')+'" src="'+spr(mine.sp)+'">'
 h+='<img id="spr-foe" class="bspr foe'+(b.fx&&b.fx.side==='foe'&&b.fx.kind==='hit'?' hitfx':b.fx&&b.fx.side==='foe'&&b.fx.kind==='faint'?' faintfx':b.fx&&b.fx.side==='me'&&b.fx.kind==='lunge'?' lunge-foe':'')+'" src="'+spr(foe.sp)+'">'
 if(b.fxPos)h+='<div class="dmgfloat" style="left:'+(b.fxPos.x||50)+'%;top:'+(b.fxPos.y||40)+'%;color:'+(b.fxPos.c||'#d63c2f')+'">'+b.fxPos.t+'</div>'
 if(b.ball)h+='<div class="ballfly"><i style="background:linear-gradient(180deg,'+(D.ITEMS[b.ball.type].color||'#e63946')+' 48%,#f2f2f2 52%)"></i></div>'
 h+='</div>'
 var tb='Apa yang harus <b>'+esc(pkmName(mine))+'</b> lakukan?'
 if(b.log.length)tb=b.log[b.log.length-1]
 if(b.msg)tb=b.msg
 if(b.done)tb=b.win?'🏆 <b>KAMU MENANG!</b>':'💀 <b>KAMU KALAH...</b>'
 h+='<div class="textbox">'+tb+'</div>'
 if(b.done){
  h+='<div class="center" style="margin-top:10px"><button class="btn '+(b.win?'gold':'ghost')+'" data-act="fightend" style="min-width:170px">'+(b.win?'🎉 KLAIM KEMENANGAN':'KEMBALI')+'</button></div>'
 }else if(b.menu==='moves'){
  h+='<div class="actiongrid">'
  mine.moves.forEach(function(mv,i){var pp=mv.pp>0;var col=D.MOVECOL[mv.type]||'#aaa'
   h+='<button class="movebtn mvtype" data-act="usemove" data-i="'+i+'" style="background:linear-gradient(135deg,'+col+'26,'+col+'0d);border-color:'+col+'66" '+(pp?'':'disabled')+'><span><b style="color:'+col+'">●</b> '+esc(mv.name)+(mv.pri>0?' <span class="sub" style="color:#f6c945">⚡utama</span>':'')+'</span><span class="sub">'+mv.type.toUpperCase()+' · POW '+mv.pow+' · AKURASI '+mv.acc+'% · PP '+mv.pp+'/'+mv.maxPp+'</span></button>'})
  h+='</div><div class="center" style="margin-top:7px"><button class="btn ghost" data-act="openmenu" style="padding:7px 14px;font-size:12px">◀ KEMBALI</button></div>'
 }else if(b.menu==='bag'){
  h+='<div class="actiongrid">'
  ;['potion','superpotion','berry'].forEach(function(k){var it=D.ITEMS[k],n=S.bag[k]||0
   h+='<button class="movebtn" data-act="bagheal" data-k="'+k+'" '+(n>0?'':'disabled')+'><span>'+it.emoji+' '+it.name+'</span><span class="sub">×'+n+' · pulih '+(it.heal||0)+' HP (pakai giliran)</span></button>'})
  ;['pokeball','greatball','ultraball','masterball'].forEach(function(k){var it=D.ITEMS[k],n=S.bag[k]||0
   h+='<button class="movebtn" data-act="ballthrow" data-k="'+k+'" '+(n>0&&b.wild?'':'disabled')+'><span>'+it.emoji+' '+it.name+'</span><span class="sub">'+(n>0?'×'+n:'habis')+(b.wild?' · tangkap!':' · vs trainer tidak bisa')+'</span></button>'})
  h+='</div><div class="center" style="margin-top:7px"><button class="btn ghost" data-act="openmenu" style="padding:7px 14px;font-size:12px">◀ KEMBALI</button></div>'
 }else if(b.menu==='switch'){
  h+='<div class="actiongrid">'
  b.mine.forEach(function(mp,i){if(i===b.mi)return
   h+='<button class="movebtn" data-act="doswitch" data-i="'+i+'" '+(mp.hp>0?'':'disabled')+'><span>'+esc(pkmName(mp))+' Lv.'+mp.level+'</span><span class="sub">HP '+Math.round(Math.max(0,mp.hp))+'/'+mp.maxHp+(mp.hp>0?'':' · PINGSAN')+'</span></button>'})
  h+='</div><div class="center" style="margin-top:7px"><button class="btn ghost" data-act="openmenu" style="padding:7px 14px;font-size:12px">◀ KEMBALI</button></div>'
 }else{
  h+='<div class="actiongrid">'
  h+='<button class="btn red" data-act="openfight" style="padding:14px 8px;font-size:15px">⚔️ FIGHT</button>'
  h+='<button class="btn blue" data-act="openbag" style="padding:14px 8px;font-size:15px">🎒 BAG</button>'
  h+='<button class="btn gold" data-act="openswitch" style="padding:14px 8px;font-size:15px">🔄 POKÉMON</button>'
  h+='<button class="btn ghost" data-act="fightflee" style="padding:14px 8px;font-size:15px">🏃 RUN</button>'
  h+='</div>'
 }
 return h+'</div>'}
function pkmMoves(p){
 var s=spFor(p.sp),ts=s.types
 var k1=D.MOVE_T1[ts[0]]||'tackle',m1=D.MOVES[k1]
 var k2=D.MOVE_T2[ts[0]]||'bodyslam',m2=D.MOVES[k2]
 var ms=[{key:k1,name:m1.name,type:m1.type,pow:m1.pow,acc:m1.acc,pp:m1.pp,maxPp:m1.pp,pri:m1.pri},{key:k2,name:m2.name,type:m2.type,pow:m2.pow,acc:m2.acc,pp:m2.pp,maxPp:m2.pp,pri:m2.pri}]
 if(ts[1]){var k3=D.MOVE_T1[ts[1]],m3=D.MOVES[k3];ms.push({key:k3,name:m3.name,type:m3.type,pow:m3.pow,acc:m3.acc,pp:m3.pp,maxPp:m3.pp,pri:m3.pri})
  var k4=D.MOVE_T2[ts[1]],m4=D.MOVES[k4];ms.push({key:k4,name:m4.name,type:m4.type,pow:m4.pow,acc:m4.acc,pp:m4.pp,maxPp:m4.pp,pri:m4.pri})}
 return ms}
function battlePkm(p){var b=clone(p);b.moves=clone(pkmMoves(p));b.candy=b.candy||0;return b}
function makeNpcPkm(spId,lvl){var s=spFor(spId);var hp=s.hp+Math.floor(s.hp*.12*(lvl-1))
 var bp={sp:spId,level:lvl,maxHp:hp,hp:hp,atk:s.atk+Math.floor(s.atk*.10*(lvl-1)),def:s.def+Math.floor(s.def*.10*(lvl-1)),spd:s.spd+Math.floor(s.spd*.09*(lvl-1)),exp:0,maxExp:maxExpFor(lvl),candy:0,nick:'',moves:null}
 bp.moves=pkmMoves(bp);return bp}
function startFight(npcIdx){
 var alive=S.deck.filter(function(p){return p.hp>0})
 if(!alive.length)return toast('Semua Pokémon mu pingsan! Pakai Potion 🧪')
 var npc=D.NPC_TRAINERS[npcIdx]
 var base=2+Math.floor(Math.random()*3)+npcIdx
 var foe=npc.team.map(function(id){return makeNpcPkm(id,base+Math.floor(Math.random()*3))})
 S.battle={npc:npc.name,npcIdx:npcIdx,wild:false,mine:S.deck.map(battlePkm),mi:S.deck.indexOf(alive[0]),foe:foe,fi:0,turn:1,menu:null,msg:null,fx:null,fxPos:null,log:[],done:false,win:false}
 S.battle.log.push('⚔️ <b>'+esc(npc.name)+'</b> ingin bertarung!')
 S.battle.log.push('Go! <b>'+esc(pkmName(S.battle.mine[S.battle.mi]))+'</b>!')
 save();setView('fight')}
function startWildFight(){
 var e=S.encounter;if(!e)return
 var alive=S.deck.filter(function(p){return p.hp>0})
 if(!alive.length)return toast('Semua Pokémon mu pingsan!')
 var s=spFor(e.sp)
 var foe={sp:e.sp,level:e.level,maxHp:e.maxHp,hp:e.hp,atk:s.atk+Math.floor(s.atk*.10*(e.level-1)),def:s.def+Math.floor(s.def*.10*(e.level-1)),spd:s.spd+Math.floor(s.spd*.09*(e.level-1)),exp:0,maxExp:maxExpFor(e.level),candy:0,nick:'',moves:null}
 foe.moves=pkmMoves(foe)
 S.battle={npc:'Pokémon Liar',npcIdx:-1,wild:true,mine:S.deck.map(battlePkm),mi:S.deck.indexOf(alive[0]),foe:[foe],fi:0,turn:1,menu:null,msg:null,fx:null,fxPos:null,log:[],done:false,win:false}
 S.battle.log.push('🌿 <b>'+esc(s.name)+'</b> liar muncul!')
 S.battle.log.push('Go! <b>'+esc(pkmName(S.battle.mine[S.battle.mi]))+'</b>!')
 S.encounter=null
 save();setView('fight')}
function aiPickMove(foe,mine){
 var usable=foe.moves.filter(function(m){return m.pp>0})
 if(!usable.length)usable=[{name:'Struggle',type:'normal',pow:35,acc:100,pp:99,pri:0}]
 var best=null,bestScore=-1
 usable.forEach(function(m){var eff=effectiveness(m.type,spFor(mine.sp).types)
  var score=m.pow*eff*(m.acc/100)*(0.7+Math.random()*0.6)
  if(score>bestScore){bestScore=score;best=m}})
 return best}
function doAttack(b,atk,def,move,side){
 move.pp=Math.max(0,move.pp-1)
 var dt=spFor(def.sp).types
 var eff=effectiveness(move.type,dt)
 var txt='<b>'+esc(pkmName(atk))+'</b> memakai <b>'+esc(move.name)+'</b>'
 if(Math.random()*100>move.acc){txt+=' — <b>meleset!</b>';b.log.push(txt);b.fx={side:side,kind:'lunge'};return}
 var stab=spFor(atk.sp).types.indexOf(move.type)>=0?1.25:1
 var crit=Math.random()<0.0625?1.5:1
 var base=(move.pow/100)*(atk.atk*0.75-def.def*0.40)*(0.86+Math.random()*0.28)
 var dmg=Math.max(1,Math.round(base*eff*stab*crit))
 def.hp=Math.max(0,def.hp-dmg)
 if(crit>1)txt+=' — <b>CRITICAL!</b>'
 if(eff>=2)txt+=' — <b>SUPER EFFECTIVE!</b>'
 else if(eff===0)txt+=' — tidak berefek...'
 else if(eff<1)txt+=' — tidak efektif'
 txt+=' ('+dmg+')'
 b.log.push(txt)
 b.fx={side:side==='me'?'foe':'me',kind:'hit'}
 if(crit>1)b.shake=true
 b.fxPos={t:'-'+dmg,c:crit>1?'#ffb63d':'#d63c2f',x:side==='me'?66:14,y:side==='me'?40:74}}
function resolveTurn(playerAct){
 var b=S.battle;if(!b||b.done)return
 b.menu=null;b.msg=null;b.fx=null;b.fxPos=null;b.shake=null;b.ball=null
 var mine=b.mine[b.mi],foe=b.foe[b.fi]
 if(playerAct.type==='switch'){
  b.mi=playerAct.i;mine=b.mine[b.mi]
  b.log.push('🔄 <b>'+esc(pkmName(mine))+'</b> maju!')
  var fm=aiPickMove(foe,mine)
  doAttack(b,foe,mine,fm,'foe')
  if(mine.hp<=0){b.fx={side:'me',kind:'faint'};b.log.push('💥 '+esc(pkmName(mine))+' pingsan!')
   var nx=b.mine.map(function(mp,i){return{i:i,mp:mp}}).filter(function(x){return x.mp.hp>0})
   if(!nx.length){endFight(false);return}
   b.mi=nx[0].i;b.log.push('🔁 '+esc(pkmName(b.mine[b.mi]))+' maju!')}
  b.turn++;afterTurn(b);return}
 if(playerAct.type==='item'){
  var it=D.ITEMS[playerAct.k]
  if((S.bag[playerAct.k]||0)<=0){b.msg='Item habis!';save();render();return}
  S.bag[playerAct.k]--
  if(it.heal){mine.hp=Math.min(mine.maxHp,mine.hp+it.heal);b.log.push('💊 '+esc(pkmName(mine))+' pulih +'+it.heal+' HP')}
  var fm2=aiPickMove(foe,mine)
  doAttack(b,foe,mine,fm2,'foe')
  if(mine.hp<=0){b.fx={side:'me',kind:'faint'};b.log.push('💥 '+esc(pkmName(mine))+' pingsan!')
   var nx2=b.mine.map(function(mp,i){return{i:i,mp:mp}}).filter(function(x){return x.mp.hp>0})
   if(!nx2.length){endFight(false);return}
   b.mi=nx2[0].i;b.log.push('🔁 '+esc(pkmName(b.mine[b.mi]))+' maju!')}
  b.turn++;afterTurn(b);return}
 if(playerAct.type==='ball'){
  if(!b.wild){b.msg='Tidak bisa menangkap Pokémon trainer!';save();render();return}
  var ball=D.ITEMS[playerAct.k]
  if((S.bag[playerAct.k]||0)<=0){b.msg='Ball habis!';save();render();return}
 S.bag[playerAct.k]--
 b.log.push('🎯 '+esc(pkmName(mine))+' melempar '+ball.name+'!')
 b.ball={type:playerAct.k}
 var hpF=1-0.55*(foe.hp/foe.maxHp)
  var ch=Math.min(1,ball.catch*(0.65+0.7*hpF))
  if(Math.random()<ch){
   b.log.push('🎉 <b>'+esc(spFor(foe.sp).name)+' tertangkap!</b>')
   var np=defPkm(foe.sp,foe.level);np.hp=Math.max(1,foe.hp);S.deck.push(np);S.catch++
   b.mine.forEach(function(mp,i){if(S.deck[i])S.deck[i].hp=mp.hp})
   b.done=true;b.win=true;b.fx={side:'foe',kind:'faint'}
   trExp(25+foe.level*3)
   b.msg=esc(spFor(foe.sp).name)+' masuk ke deck!'
   save();render();return}
  b.log.push('❌ '+esc(spFor(foe.sp).name)+' keluar dari ball!')
  var fm3=aiPickMove(foe,mine)
  doAttack(b,foe,mine,fm3,'foe')
  if(mine.hp<=0){b.fx={side:'me',kind:'faint'};b.log.push('💥 '+esc(pkmName(mine))+' pingsan!')
   var nx3=b.mine.map(function(mp,i){return{i:i,mp:mp}}).filter(function(x){return x.mp.hp>0})
   if(!nx3.length){endFight(false);return}
   b.mi=nx3[0].i;b.log.push('🔁 '+esc(pkmName(b.mine[b.mi]))+' maju!')}
  b.turn++;afterTurn(b);return}
 /* ── FIGHT ── */
 var mv=mine.moves[playerAct.i]
 if(!mv||mv.pp<=0){b.menu='moves';b.msg='PP jurus itu habis!';save();render();return}
 var fm4=aiPickMove(foe,mine)
 var firstMe=mv.pri>fm4.pri||(mv.pri===fm4.pri&&(mine.spd>foe.spd||(mine.spd===foe.spd&&Math.random()<0.5)))
 var seq=firstMe?[['me',mv],['foe',fm4]]:[['foe',fm4],['me',mv]]
 for(var si=0;si<seq.length;si++){
  if(b.done)break
  var side=seq[si][0],mvs=seq[si][1]
  if(side==='me'){
   if(mine.hp<=0)continue
   doAttack(b,mine,foe,mvs,'me')
   if(foe.hp<=0){b.fx={side:'foe',kind:'faint'};b.log.push('💥 '+esc(spFor(foe.sp).name)+' pingsan!');b.fi++
    if(b.fi>=b.foe.length){endFight(true);return}
    b.log.push('🔥 Lawan mengirim '+esc(spFor(b.foe[b.fi].sp).name)+'!')
    break}}
  else{
   if(foe.hp<=0)continue
   doAttack(b,foe,mine,mvs,'foe')
   if(mine.hp<=0){b.fx={side:'me',kind:'faint'};b.log.push('💥 '+esc(pkmName(mine))+' pingsan!')
    var nx4=b.mine.map(function(mp,i){return{i:i,mp:mp}}).filter(function(x){return x.mp.hp>0})
    if(!nx4.length){endFight(false);return}
    b.mi=nx4[0].i;b.log.push('🔁 '+esc(pkmName(b.mine[b.mi]))+' maju!')}}
 }
 b.turn++;afterTurn(b)}
function afterTurn(b){
 b.mine.forEach(function(mp,i){if(S.deck[i])S.deck[i].hp=mp.hp})
 save();render()
 /* bersihkan flag animasi setelah efek selesai main, supaya render berikutnya tidak mengulang animasi */
 setTimeout(function(){if(S.battle===b&&(b.fx||b.fxPos||b.shake||b.ball)){b.fx=null;b.fxPos=null;b.shake=null;b.ball=null;save();render()}},1100)}
function endFight(win){
 var b=S.battle;b.done=true;b.win=win
 /* sinkronkan HP clone → deck asli */
 b.mine.forEach(function(mp,i){if(S.deck[i])S.deck[i].hp=mp.hp})
 if(win){S.win++
  var expBase=b.npcIdx>=0?(35+b.npcIdx*12):24
  b.mine.forEach(function(mp,i){var real=S.deck[i];if(!real||mp.hp<=0)return
   var gain=expBase+mp.level*6;real.exp+=gain
   b.log.push('✨ '+esc(pkmName(real))+' +'+gain+' EXP')
   var up=0;while(real.exp>=real.maxExp){real.exp-=real.maxExp;real.level++;real.maxExp=maxExpFor(real.level);var s=spFor(real.sp);real.maxHp+=Math.max(2,Math.floor(s.hp*.12));real.hp=real.maxHp;real.atk+=Math.max(1,Math.floor(s.atk*.10));real.def+=Math.max(1,Math.floor(s.def*.10));real.spd+=Math.max(1,Math.floor(s.spd*.09));up++}
   if(up)b.log.push('⬆️ '+esc(pkmName(real))+' naik ke Lv.'+real.level+'!')})
  if(b.npcIdx>=0){var npc=D.NPC_TRAINERS[b.npcIdx]
   var coin=Math.round(npc.reward*(0.9+Math.random()*0.3));S.coin+=coin
   b.log.push('🏆 <b>MENANG vs '+esc(npc.name)+'!</b> +'+coin+' Coin')
   trExp(40+b.npcIdx*15)
   if(Math.random()<0.35){randItem('pokeball');b.log.push('🎁 Hadiah: +1 Poké Ball')}
  }else{var c2=45+Math.floor(Math.random()*70);S.coin+=c2
   b.log.push('🏆 <b>KAMU MENANG!</b> +'+c2+' Coin');trExp(20)}
 }else{S.lose++;b.log.push('💀 <b>KAMU KALAH...</b> Sembuhkan & latih Pokémonmu lagi!')}
 save();render()}
function fightFlee(){var b=S.battle;if(!b)return
 if(!b.done&&Math.random()<0.22&&b.turn>1){b.msg='Gagal kabur!';b.log.push('💨 Kabur gagal!');save();render();return}
 b.mine.forEach(function(mp,i){if(S.deck[i])S.deck[i].hp=mp.hp})
 S.battle=null;toast('🏃 Kamu berhasil kabur.');save();setView('battle')}

/* ── GACHA ─────────────────────────── */
var gachaView=null
function vGacha(){
 var h=topbar('🎰 GACHA','<span class="pill">💰 '+fmt(S.coin)+'</span>')
 h+='<div class="small" style="margin-bottom:8px">1 pull = <b>500</b> coin · 10 pull = <b>4500</b> coin<br>Rate: C58% · U26% · R11% · E4% · L1%</div>'
 h+='<div class="rowflex" style="justify-content:center"><button class="btn blue" data-act="gacha" data-n="1">🎰 PULL ×1</button><button class="btn gold" data-act="gacha" data-n="10">🎰 PULL ×10</button></div>'
 if(gachaView){
  h+='<div style="margin-top:12px">'+gachaView.map(function(r){
   var s=spFor(r.sp);var c=D.RARITY_COLOR[s.rarity]
   return '<div style="display:flex;align-items:center;gap:9px;background:#0d1526;border:1px solid '+c+'55;border-radius:11px;padding:7px 10px;margin-bottom:6px"><img src="'+spr(r.sp)+'" style="width:44px;height:44px"><div style="flex:1"><div style="font-weight:700;font-size:12.5px">'+s.name+' <span class="small">Lv.'+r.level+'</span></div><div>'+badge(s.rarity)+'</div></div></div>'
  }).join('')+'</div>'
  var best=gachaView.slice().sort(function(a,b){return rarityRank(spFor(b.sp).rarity)-rarityRank(spFor(a.sp).rarity)})[0]
  h+='<div class="center small" style="margin-top:6px">✨ Semua hasil masuk ke Deck.</div>'
 }
 return h+'</div>'}
function doGacha(n){
 var cost=n===10?4500:500*n
 if(S.coin<cost)return toast('❌ Coin tidak cukup! Butuh '+fmt(cost))
 S.coin-=cost
 var hasil=[]
 for(var i=0;i<n;i++){
  var x=Math.random()*100,acc=0,r='common'
  var keys=['common','uncommon','rare','epic','legendary']
  for(var j=0;j<keys.length;j++){acc+=D.GACHA_RATES[keys[j]];if(x<acc){r=keys[j];break}}
  var pool=D.SPECIES.filter(function(s){return s.rarity===r})
  if(!pool.length)pool=D.SPECIES
  var sp=pool[Math.floor(Math.random()*pool.length)]
  var lvl=1+Math.floor(Math.random()*(r==='legendary'?25:r==='epic'?18:12))
  var p=defPkm(sp.id,lvl);S.deck.push(p);hasil.push(p)
 }
 gachaView=hasil;trExp(15*n);save();render()}

/* ── SHOP / SELL ───────────────────── */
function vShop(){
 var h=topbar('🛒 POKÉ SHOP','<span class="pill">💰 '+fmt(S.coin)+'</span>')
 Object.keys(D.ITEMS).forEach(function(k){var it=D.ITEMS[k]
  h+='<div class="itemrow"><div class="em">'+it.emoji+'</div><div class="inf"><div class="nm">'+it.name+'</div><div class="sb">'+(it.catch?('Catch '+Math.round(it.catch*100)+'%'):'')+(it.heal?(' Heal '+it.heal):'')+(it.exp?(' +'+it.exp+' EXP'):'')+(it.feed?(' Bahan Feed'):'')+'</div></div><div class="rowflex">'+
  '<button class="btn ghost" data-act="buy" data-k="'+k+'" data-n="1" style="padding:6px 9px;font-size:11px">×1<br><span class="small">'+fmt(it.price)+'</span></button>'+
  '<button class="btn blue" data-act="buy" data-k="'+k+'" data-n="10" style="padding:6px 9px;font-size:11px">×10<br><span class="small">'+fmt(it.price*10)+'</span></button></div></div>'})
 return h+'</div>'}
function buy(k,n){
 var it=itemOf(k);if(!it)return
 var cost=it.price*n
 if(S.coin<cost)return toast('❌ Coin tidak cukup! Butuh '+fmt(cost))
 S.coin-=cost;S.bag[k]=(S.bag[k]||0)+n
 toast('🛒 '+it.name+' ×'+n+' dibeli!');save();render()}
function vSell(){
 var h=topbar('💰 JUAL','')
 var keys=Object.keys(D.ITEMS).filter(function(k){return (S.bag[k]||0)>0})
 h+='<div class="small" style="margin-bottom:6px">📦 Item:</div>'
 if(!keys.length)h+='<div class="small">— tidak ada item.</div>'
 keys.forEach(function(k){var it=D.ITEMS[k]
  h+='<div class="itemrow"><div class="em">'+it.emoji+'</div><div class="inf"><div class="nm">'+it.name+' ×'+S.bag[k]+'</div><div class="sb">Harga jual '+fmt(it.sell)+'/pcs</div></div><div class="rowflex">'+
  '<button class="btn ghost" data-act="sellitem" data-k="'+k+'" data-n="1" style="padding:6px 9px;font-size:11px">×1</button>'+
  '<button class="btn ghost" data-act="sellitem" data-k="'+k+'" data-n="10" style="padding:6px 9px;font-size:11px">×10</button></div></div>'})
 h+='<div class="small" style="margin:10px 0 6px">🐾 Pokémon (tidak bisa jual yang aktif):</div>'
 S.deck.forEach(function(p,i){var s=spFor(p.sp);var price=120+Math.round((s.hp+s.atk+s.def+s.spd)*p.level*0.32)
  var isAct=i===S.active
  h+='<div class="itemrow"><img src="'+spr(p.sp)+'" style="width:40px;height:40px"><div class="inf"><div class="nm">'+esc(pkmName(p))+' Lv.'+p.level+'</div><div class="sb">'+fmt(price)+' coin · '+badge(s.rarity)+'</div></div>'+
  (isAct?'<span class="small">★ aktif</span>':'<button class="btn red" data-act="sellpkm" data-i="'+i+'" style="padding:6px 10px;font-size:11px">JUAL</button>')+'</div>'})
 return h+'</div>'}
function sellItem(k,n){
 n=Math.min(n,S.bag[k]||0);if(n<=0)return
 var it=itemOf(k);var gain=it.sell*n
 S.bag[k]-=n;if(S.bag[k]<=0)delete S.bag[k]
 S.coin+=gain;toast('💰 +'+fmt(gain)+' coin');save();render()}
function sellPkm(i){
 if(i===S.active)return toast('❌ Tidak bisa jual Pokémon aktif!')
 var p=S.deck[i];if(!p)return
 var s=spFor(p.sp);var price=120+Math.round((s.hp+s.atk+s.def+s.spd)*p.level*0.32)
 S.deck.splice(i,1);S.coin+=price
 if(S.active>=S.deck.length)S.active=Math.max(0,S.deck.length-1)
 toast('💰 '+pkmName(p)+' dijual +'+fmt(price)+' coin');save();render()}

/* ── LEADERBOARD / PROFILE / INFO ──── */
function vBoard(){
 var all=[];try{all=JSON.parse(stGet(KEY+'_lb')||'[]')}catch(e){all=[]}
 var me={name:S.name||'Kamu',lv:S.level,deck:S.deck.length,win:S.win,coin:S.coin,me:true}
 var rows=all.slice();rows.push(me);rows.sort(function(a,b){return b.lv*10000+b.win-a.lv*10000-a.win})
 var h=topbar('🏆 PAPAN PERINGKAT','<span class="pill">lokal</span>')
 rows.slice(0,10).forEach(function(r,i){
  h+='<div class="lbrw" style="'+(r.me?'background:#ffcb0512;border-radius:8px':'')+'"><span class="rank">'+['🥇','🥈','🥉'][i]||('#'+(i+1))+'</span><div style="flex:1">'+esc(r.name)+(r.me?' <span class="small">(kamu)</span>':'')+'</div><span class="small">Lv.'+r.lv+' · W'+r.win+' · 🐾'+r.deck+'</span></div>'})
 h+='<div class="small center" style="margin-top:8px">Peringkat menyimpan progresmu; bot perlu integrasi grup utk papan global.</div>'
 return h+'</div>'}
function vProfile(){
 var h=topbar('📋 TRAINER PROFILE','')
 h+='<div class="grid2">'+statBox('👤 Nama',esc(S.name||'Trainer'))+statBox('🆔 ID',S.trainerId)+statBox('⭐ Level',S.level,'var(--gold)')+statBox('✨ EXP',Math.round(S.exp)+'/'+trainerMaxExp(S.level))+statBox('💰 Coin',fmt(S.coin),'#ffd54d')+statBox('🐾 Pokémon',S.deck.length)+statBox('⚔️ Win',S.win,'var(--good)')+statBox('💀 Lose',S.lose,'var(--bad)')+statBox('🎯 Catch',S.catch)+statBox('🔥 Streak Daily',S.streak)+'</div>'
 return h+'</div>'}
var infoSp=25
function vInfo(){
 var s=spFor(infoSp)
 var h=topbar('📖 POKÉDEX','<span class="pill">#'+String(s.id).padStart(3,'0')+'</span>')
 var dex=D.SPECIES.slice().sort(function(a,b){return a.id-b.id})
 h+='<div class="center"><div class="sprite-wrap"><img class="pop" src="'+spr(s.id)+'"></div><div style="font-weight:800;font-size:16px">'+s.name+'</div><div style="margin:4px 0">'+badge(s.rarity)+' '+s.types.map(typeTag).join(' ')+'</div>'
 h+='<div class="grid2" style="margin-top:8px">'+statBox('❤️ HP',s.hp)+statBox('⚔️ ATK',s.atk)+statBox('🛡️ DEF',s.def)+statBox('💨 SPD',s.spd)+'</div></div>'
 h+='<div class="tabs" style="margin-top:10px;max-height:150px;overflow-y:auto;flex-wrap:wrap">'
 dex.forEach(function(x){h+='<button class="tab" data-act="info" data-id="'+x.id+'" style="min-width:58px;flex:initial;font-size:10px">'+x.name+'</button>'})
 h+='</div>'
 return h+'</div>'}

/* ── BOTTOM BAR ────────────────────── */
function renderBar(){
 if(!S.started){bar.innerHTML='';return}
 bar.innerHTML='<button class="btn ghost" data-act="menu" data-v="home">🏠</button>'+
 '<button class="btn gold" data-act="menu" data-v="find">🌿 CARI</button>'+
 '<button class="btn blue" data-act="menu" data-v="battle">⚔️ BATTLE</button>'+
 '<button class="btn ghost" data-act="menu" data-v="explore">🗺️</button>'}

/* ── BIND ──────────────────────────── */
function bind(){
 var els=document.querySelectorAll('[data-act]')
 Array.prototype.forEach.call(els,function(el){
  el.addEventListener('click',function(ev){
   ev.preventDefault();ev.stopPropagation()
   var act=el.getAttribute('data-act')
   try{handle(act,el,ev)}catch(e){toast('⚠️ '+e.message)}
  })
 })}
function handle(act,el,ev){
 if(!S.started&&['menu','starter'].indexOf(act)<0&&act!=='back')act=act==='starter'?'starter':act
 if(!S.started&&act!=='starter'&&act!=='back'){setView('home');return}
 switch(act){
  case 'starter':{var id=parseInt(el.getAttribute('data-id'));if(D.STARTERS.indexOf(id)<0)return
   S=load();S.started=true;S.name='Trainer';S.deck=[defPkm(id,5)];S.active=0
   S.bag={pokeball:6,berry:3,potion:2};save()
   toast('🎉 Selamat datang, Trainer! '+spFor(id).name+' bergabung!');setView('home');break}
  case 'menu':{var v=el.getAttribute('data-v');if(v==='daily')go('explore');else if(v==='board')setView('leaderboard');else if(v==='profile')setView('profile');else go(v);break}
  case 'back':go('home');break
  case 'pickdeck':{cardIdx=parseInt(el.getAttribute('data-i'))||0;setView('card');break}
  case 'cardprev':{cardIdx=(cardIdx-1+S.deck.length)%S.deck.length;render();break}
  case 'cardnext':{cardIdx=(cardIdx+1)%S.deck.length;render();break}
  case 'cardset':{S.active=cardIdx;toast('★ '+pkmName(S.deck[cardIdx])+' jadi Pokémon aktif!');save();render();break}
  case 'dofind':{if(Math.random()<0.5){doFind()}else{startWildFight()}break}
  case 'throw':throwBall(el.getAttribute('data-k'));break
  case 'flee':S.encounter=null;save();setView('home');break
  case 'dotrain':if(cdRemain('train',CD_TRAIN)>0)return toast('⏳ Tunggu '+cdText(cdRemain('train',CD_TRAIN)));doTrain();break
  case 'dohunt':if(cdRemain('hunt',CD_HUNT)>0)return toast('⏳ Tunggu '+cdText(cdRemain('hunt',CD_HUNT)));doHunt();break
  case 'doexplore':if(cdRemain('explore',CD_EXPLORE)>0)return toast('⏳ Tunggu '+cdText(cdRemain('explore',CD_EXPLORE)));doExplore();break
  case 'dodaily':doDaily();break
  case 'useitem':useHealItem(el.getAttribute('data-k'));break
  case 'feeditem':feedPkm(parseInt(el.getAttribute('data-i')),el.getAttribute('data-k'));break
  case 'startfight':startFight(parseInt(el.getAttribute('data-i')));break
  case 'openfight':{if(S.battle){S.battle.menu='moves'}save();render();break}
  case 'openbag':{if(S.battle){S.battle.menu='bag'}save();render();break}
  case 'openswitch':{if(S.battle){S.battle.menu='switch'}save();render();break}
  case 'openmenu':{if(S.battle){S.battle.menu=null;S.battle.msg=null}save();render();break}
  case 'usemove':{resolveTurn({type:'move',i:parseInt(el.getAttribute('data-i'))});break}
  case 'bagheal':{resolveTurn({type:'item',k:el.getAttribute('data-k')});break}
  case 'ballthrow':{resolveTurn({type:'ball',k:el.getAttribute('data-k')});break}
  case 'doswitch':{resolveTurn({type:'switch',i:parseInt(el.getAttribute('data-i'))});break}
  case 'fightturn':fightTurn();break
  case 'fightflee':fightFlee();break
  case 'fightend':{S.battle=null;save();setView('battle');break}
  case 'gacha':doGacha(parseInt(el.getAttribute('data-n')));break
  case 'buy':buy(el.getAttribute('data-k'),parseInt(el.getAttribute('data-n')));break
  case 'sellitem':sellItem(el.getAttribute('data-k'),parseInt(el.getAttribute('data-n')));break
  case 'sellpkm':sellPkm(parseInt(el.getAttribute('data-i')));break
  case 'info':{infoSp=parseInt(el.getAttribute('data-id'))||25;render();break}
 }}

render()
/* hook debug/inspeksi (pengujian headless & konsol dev) — tidak dipakai UI */
window.__poke = { get S() { return S }, save: save, go: setView }
})()
</script>
</body>
</html>`

/* ══════════════════════════ KIRIM VIA RICHMESSAGE ══════════════════════════ */

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '⚡', key: reactionKey } }).catch(() => {})

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
                messageText: '⚡ Pokémon Game · Trainer Adventure',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'nano-ai-poke-2026',
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

handler.help = ['poke', 'pokemon', 'pokegame']
handler.tags = ['game']
handler.command = /^(poke|pokemon|pokegame)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Pokémon lengkap: kumpulkan, latih, tangkap, gacha, dan bertarung'

/* dipakai pengujian headless (puppeteer) — tidak berpengaruh saat berjalan normal */
handler.__html = html

export default handler
