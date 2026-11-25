// Sidebar "My Lessons": go to the hub of the level the learner has actually been taking lessons in,
// otherwise the hub of their placement level, otherwise the Levels chooser.
import { auth } from "/js/firebase-core.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const API = "https://saybonapp-server.onrender.com";
const FALLBACK = "/levels/";
// highest level first: the most advanced level with completed lessons wins
const HUBS = [
  ["c2", "/levels/C2/"], ["c1", "/levels/C1/"], ["b2", "/levels/B2/"], ["b1", "/levels/B1/"],
  ["a2", "/levels/A2/"], ["a1", "/levels/A1/"],
  ["a0-tout-public", "/levels/A0/tout-public/"], ["a0-les-petits", "/levels/A0/les-petits/"]
];
const links = Array.from(document.querySelectorAll('a[data-my-lessons]'));
let target = FALLBACK;

function setTarget(href){ target = href; links.forEach((a) => { a.setAttribute("href", href); }); }

function placement(){
  let lv = null;
  try { lv = sessionStorage.getItem("saybon_level"); } catch (e) {}
  if (!lv || !/^[A-C][0-2]$/i.test(lv)) return null;
  lv = lv.toUpperCase();
  return lv === "A0" ? "/levels/A0/tout-public/" : "/levels/" + lv + "/";
}

function timeout(ms){ return new Promise((r) => setTimeout(() => r(null), ms)); }

async function progressHub(uid){
  const res = await Promise.all(HUBS.map(([key]) =>
    Promise.race([
      fetch(API + "/api/levelProgress?uid=" + encodeURIComponent(uid) + "&level=" + key).then((r) => r.json()).catch(() => null),
      timeout(7000)
    ])
  ));
  for (let i = 0; i < HUBS.length; i++) {
    const d = res[i];
    if (d && Array.isArray(d.completedLessons) && d.completedLessons.length) return HUBS[i][1];
  }
  return null;
}

// show something sensible straight away (placement level), then refine with real progress
setTarget(placement() || FALLBACK);

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    const hub = await progressHub(user.uid);
    if (hub) setTarget(hub);
    else if (!placement()) {
      // placement not cached in this browser yet: level-sync.js stores it shortly after load
      setTimeout(() => { const p = placement(); if (p && target === FALLBACK) setTarget(p); }, 2500);
    }
  } catch (e) {}
});

// if the learner taps before the lookup is back, use the best answer we have right now
links.forEach((a) => a.addEventListener("click", (e) => {
  const p = placement();
  if (target === FALLBACK && p) { e.preventDefault(); window.location.href = p; }
}));
