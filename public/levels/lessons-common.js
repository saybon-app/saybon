// Shared helpers for SayBon lessons (ES module)
import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export const API = "https://saybonapp-server.onrender.com";
export const META = window.TK_TRACK_META || [];

export function whenUser() {
  return new Promise(function (resolve) { var off = onAuthStateChanged(auth, function (u) { off(); resolve(u); }); });
}
export async function token() { return auth.currentUser ? auth.currentUser.getIdToken() : null; }
export async function loadProgress() {
  try {
    var r = await fetch(API + "/api/lessonProgress", { headers: { Authorization: "Bearer " + await token() } });
    if (!r.ok) return { scores: {}, completed: {} };
    return await r.json();
  } catch (e) { return { scores: {}, completed: {} }; }
}
export async function loadAssets() {
  var map = {};
  try { (await (await fetch(API + "/api/assets")).json()).forEach(function (a) { map[a.name] = a; }); } catch (e) {}
  return map;
}
export function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
}
export function loadTrackData(id) {
  return new Promise(function (resolve) {
    if (window.TK_LESSON_TRACKS && window.TK_LESSON_TRACKS[id]) return resolve(window.TK_LESSON_TRACKS[id]);
    var s = document.createElement("script");
    s.src = "data/" + id + ".js?v=1";
    s.onload = function () { resolve((window.TK_LESSON_TRACKS || {})[id] || null); };
    s.onerror = function () { resolve(null); };
    document.head.appendChild(s);
  });
}
export function pad(n) { return (n < 10 ? "0" : "") + n; }
export function isPreview() { return new URLSearchParams(location.search).get("preview") === "1"; }
