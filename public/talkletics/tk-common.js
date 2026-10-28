// Shared helpers for the Talkletics journey. Loaded as an ES module.
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export const API = "https://saybonapp-server.onrender.com";
export const CUR = window.TK_CURRICULUM;

export function whenUser() {
  return new Promise(function (resolve) {
    var off = onAuthStateChanged(auth, function (u) { off(); resolve(u); });
  });
}
export async function token() { return auth.currentUser ? auth.currentUser.getIdToken() : null; }

export async function loadProgress() {
  try {
    var t = await token();
    var r = await fetch(API + "/api/talkleticsProgress", { headers: { Authorization: "Bearer " + t } });
    if (!r.ok) return {};
    return (await r.json()).scores || {};
  } catch (e) { return {}; }
}

export async function loadAssets() {
  var map = {};
  try {
    var r = await fetch(API + "/api/assets");
    (await r.json()).forEach(function (a) { map[a.name] = a; });
  } catch (e) {}
  return map;
}

// avg of best item scores (missing item = 0)
export function gameAvg(game, scores) {
  var s = scores[game.id] || {};
  var sum = 0;
  game.items.forEach(function (it) { sum += s[it.id] || 0; });
  return Math.round(sum / game.items.length);
}
export function gameDone(game, scores) {
  var s = scores[game.id] || {};
  var all = game.items.every(function (it) { return s[it.id] != null; });
  return all && gameAvg(game, scores) >= game.passMark;
}
export function stars(game, scores) {
  if (!gameDone(game, scores)) return 0;
  var a = gameAvg(game, scores), span = 100 - game.passMark;
  return a >= game.passMark + span * 0.75 ? 3 : a >= game.passMark + span * 0.4 ? 2 : 1;
}
// returns {unlocked, done, avg, stars}
export function status(level, game, scores, unlockAll) {
  var li = CUR.levels.indexOf(level);
  var levelOpen = unlockAll || li === 0 || gameDone(CUR.levels[li - 1].graduation, scores);
  var open = false;
  if (levelOpen) {
    if (game.isGraduation) open = level.games.every(function (g) { return gameDone(g, scores); });
    else open = game.index === 1 || gameDone(level.games[game.index - 2], scores);
  }
  if (unlockAll) open = true;
  return { unlocked: open, done: gameDone(game, scores), avg: gameAvg(game, scores), stars: stars(game, scores) };
}
export function nextGame(game) {
  var all = CUR.allGames();
  var i = all.findIndex(function (g) { return g.id === game.id; });
  return all[i + 1] || null;
}
export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}
