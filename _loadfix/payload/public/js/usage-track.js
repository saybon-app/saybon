// SayBon usage tracker (browser). Sends anonymous counts only: one "active" per day, plus "placement_open".
// First-touch source comes from ?src=name in the link (for example saybonapp.com/?src=school1).
import { auth, onAuthStateChanged } from "./firebase-core.js";
var API = "https://saybonapp-server.onrender.com";
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }
try {
  var q = new URLSearchParams(location.search).get("src");
  if (q && /^[a-z0-9_-]{1,24}$/i.test(q) && !ls("sb_src")) ls("sb_src", q.toLowerCase());
} catch (e) {}
function send(user, event) {
  user.getIdToken().then(function (t) {
    return fetch(API + "/api/usageEvent", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ event: event, src: ls("sb_src") || "direct" }), keepalive: true });
  }).catch(function () {});
}
onAuthStateChanged(auth, function (user) {
  if (!user) return;
  var day = new Date().toISOString().slice(0, 10);
  if (ls("sb_act") !== day + user.uid) { ls("sb_act", day + user.uid); send(user, "active"); }
  if (/\/placement\//.test(location.pathname) && ls("sb_po") !== user.uid) { ls("sb_po", user.uid); send(user, "placement_open"); }
});
