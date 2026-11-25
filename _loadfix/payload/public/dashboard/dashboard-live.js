import { auth } from "/js/firebase-core.js";
const API = "https://saybonapp-server.onrender.com";
const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $$ = (s) => Array.from(document.querySelectorAll(s));
const C = 2 * Math.PI * 42;
const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365];

// wake the (sleepy) server early so Progress and Achievements load fast
try { fetch(API + "/api/activity/ping", { mode: "no-cors" }).catch(() => {}); } catch (e) {}

function localDay() { const d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function safe(f, d) { try { return f(); } catch (e) { return d; } }

// A saved copy of the last numbers/profile, so the page paints once with the right values (see the inline
// script in index.html) and the live data only animates when something actually changed.
function readCache() { try { return JSON.parse(localStorage.getItem("sb_dash") || "null") || null; } catch (e) { return null; } }
function writeCache(patch) { try { var c = readCache() || {}; Object.assign(c, patch); localStorage.setItem("sb_dash", JSON.stringify(c)); } catch (e) {} }

function roll(el, from, to, ms) {
  if (RM || from === to) { el.textContent = to; return; }
  const t0 = performance.now();
  (function step(t) {
    const p = Math.min((t - t0) / ms, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

function confetti() {
  if (RM) return;
  const box = document.createElement("div"); box.className = "sb-confetti";
  const bits = ["🔥", "⭐", "🎉", "✨", "💛"];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("span");
    s.textContent = bits[i % bits.length];
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    box.appendChild(s);
  }
  document.body.appendChild(box); setTimeout(() => box.remove(), 4500);
}
function toast(msg) {
  const t = document.createElement("div"); t.className = "sb-toast"; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("show")));
  setTimeout(() => { t.classList.remove("show"); setTimeout(() => t.remove(), 600); }, 3200);
}

function animateStreak(streak, same) {
  const seen = Number(safe(() => localStorage.getItem("sb_seen_streak"), 0)) || 0;
  const flames = $$(".dash-streak-flame");
  const nums = $$(".js-streak-num");
  nums.forEach((n) => same ? (n.textContent = streak) : roll(n, Math.min(seen, streak), streak, 900));
  if (streak > 0) {
    flames.forEach((f) => {
      if (!RM && !same && streak !== seen) { f.classList.add("fly"); setTimeout(() => { f.classList.remove("fly"); f.classList.add("lit"); }, 950); }
      else f.classList.add("lit");
    });
    if (streak > seen && !RM) nums.forEach((n) => setTimeout(() => n.classList.add("bump"), 900));
    if (streak > seen && MILESTONES.indexOf(streak) >= 0) {
      setTimeout(() => { confetti(); toast("🔥 " + streak + "-day streak!"); }, 900);
    }
  } else flames.forEach((f) => (f.style.opacity = ".55"));
  safe(() => localStorage.setItem("sb_seen_streak", String(streak)));
}

function setRing(minutes, goal, fromCache, cachedMin) {
  const pct = Math.min(minutes / goal, 1);
  $$(".js-goal-ring-fill").forEach((r) => {
    r.style.strokeDasharray = C;
    if (fromCache) { r.style.strokeDashoffset = C * (1 - pct); }
    else {
      r.style.strokeDashoffset = C;
      r.getBoundingClientRect();
      requestAnimationFrame(() => { r.style.strokeDashoffset = C * (1 - pct); });
    }
    r.classList.toggle("is-done", pct >= 1);
  });
  $$(".dash-goal-ring-wrap").forEach((w) => w.classList.toggle("is-done", pct >= 1));
  $$(".js-goal-minutes").forEach((n) => roll(n, fromCache ? (cachedMin || 0) : 0, Math.floor(minutes), 900));
  $$(".dash-goal-ring-text small").forEach((s) => (s.textContent = "/" + goal + " min"));
}

function lines(st) {
  const m = Math.floor(st.today.seconds / 60), g = st.goalMinutes, left = Math.max(g - m, 0);
  const next = [
    ["Try a lesson", "Pick up where you left off"],
    ["Play a mission", "Talkletics is waiting"],
    ["Put some music on", "Listening counts too"]
  ];
  let L = [];
  if (st.today.goalMet) {
    L.push(["Goal done", "Keep the flame going"]);
    L.push(["Bonus time", "Extra practice sticks"]);
    L.push(next[0], next[1], next[2]);
  } else if (m === 0) {
    L.push(["Ready when you are", g + " minutes to go"]);
    if (st.streak > 0 && !st.countedToday) L.push(["Keep the flame", "Day " + (st.streak + 1) + " awaits"]);
    L.push(["Start small", "One lesson counts"]);
    L.push(next[0], next[1], next[2]);
  } else {
    L.push([m + (m === 1 ? " minute in" : " minutes in"), left + " to go"]);
    L.push(["Nice rhythm", left + (left === 1 ? " minute left" : " minutes left")]);
    L.push(next[1], next[2], next[0]);
  }
  return L;
}

let tickTimer = null;
function ticker(st) {
  const L = lines(st);
  $$(".js-goal-caption").forEach((cap) => {
    cap.classList.add("sb-ticker"); cap.textContent = "";
    const mk = (l) => { const d = document.createElement("div"); d.className = "tk"; const h = document.createElement("span"); h.className = "tk-h"; h.textContent = l[0]; const s = document.createElement("span"); s.className = "tk-s"; s.textContent = l[1]; d.append(h, s); cap.appendChild(d); return d; };
    let i = 0, cur = mk(L[0]); cur.classList.add("in");
    cap._tk = setInterval(() => {
      const old = cur; i = (i + 1) % L.length; cur = mk(L[i]);
      requestAnimationFrame(() => requestAnimationFrame(() => cur.classList.add("in")));
      old.classList.remove("in"); old.classList.add("out"); setTimeout(() => old.remove(), 600);
    }, 3800);
  });
}

function fallbackTicker() { /* API unreachable: keep the original static caption */ }

async function load(user) {
  const token = await user.getIdToken();
  const r = await fetch(API + "/api/activity/summary?day=" + localDay(), { headers: { Authorization: "Bearer " + token } });
  if (!r.ok) throw new Error("summary " + r.status);
  return r.json();
}

let started = false;
function render(st) {
  $$(".js-goal-caption").forEach((c) => c._tk && clearInterval(c._tk));
  const minutes = st.today.seconds / 60;
  const cache = readCache();
  const same = !!cache && cache.streak === st.streak && Math.floor(cache.minutes || 0) === Math.floor(minutes) && (cache.goal || 10) === st.goalMinutes;
  setRing(minutes, st.goalMinutes, !!cache, cache && Math.floor(cache.minutes || 0));
  animateStreak(st.streak, same);
  ticker(st);
  writeCache({ streak: st.streak, minutes: minutes, goal: st.goalMinutes, cap: lines(st)[0] });
}

function applyProfile(user) {
  const name = user.displayName || "";
  if (name) $$(".dash-profile-name").forEach((n) => { if (n.textContent !== name) n.textContent = name; });
  $$(".dash-avatar").forEach((a) => {
    if (user.photoURL) {
      const cur = a.querySelector("img");
      if (cur && cur.getAttribute("src") === user.photoURL) return;
      a.textContent = ""; const i = document.createElement("img"); i.alt = ""; i.src = user.photoURL; a.appendChild(i);
    } else if (name) { const ch = name.charAt(0).toUpperCase(); if (a.textContent !== ch) a.textContent = ch; }
  });
  writeCache({ name: name, photo: user.photoURL || "" });
}

auth.onAuthStateChanged(async (user) => {
  if (user) applyProfile(user);
  if (!user || started) return; started = true;
  try { render(await load(user)); } catch (e) { console.warn("dashboard-live:", e); fallbackTicker(); }
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") { try { render(await load(user)); } catch (e) {} }
  });
});


