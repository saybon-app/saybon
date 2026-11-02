import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const API = "https://saybonapp-server.onrender.com";
const root = document.getElementById("root");
const level = (new URLSearchParams(location.search).get("l") || "").toLowerCase();
const SK = { co: ["Listening", "Compréhension de l'oral"], ce: ["Reading", "Compréhension des écrits"], pe: ["Writing", "Production écrite"], po: ["Speaking", "Production orale"] };
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const LOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 7"/></svg>';
let user = null, steps = [], content = {};

function toast(t) { const e = document.createElement("div"); e.className = "cs-toast"; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }
async function api(path, opt) { const t = await user.getIdToken(); return fetch(API + path, Object.assign({ headers: { Authorization: "Bearer " + t, "Content-Type": "application/json" } }, opt || {})); }
async function loadContent() { await Promise.all(Object.keys(SK).map(async sk => { try { const r = await fetch("/delf/course/data/" + level + "-" + sk + ".json?v=1"); if (r.ok) { const d = await r.json(); content[sk] = {}; (d.lessons || []).forEach(l => { content[sk][l.id] = l; }); } } catch (e) { } })); }
const has = s => s.kind === "lesson" || s.kind === "remedial" ? !!(content[s.skill] && content[s.skill][s.id]) : true;
function hrefFor(s) {
  if (s.kind === "lesson" || s.kind === "remedial") return "/delf/lesson.html?id=" + s.id;
  if (s.kind === "skillmock") return "/delf/mock.html?id=" + s.mockId + "&only=" + s.skill + "&jl=" + level;
  return "/delf/mock.html?id=" + s.mockId + "&jl=" + level;
}
function go(s) {
  if (s.status === "locked") return toast("Finish the step before it to unlock this one.");
  if (!has(s)) return toast("This lesson is being prepared. It will be ready soon.");
  location.href = hrefFor(s);
}
function tile(s, label) {
  const soon = !has(s) && s.status !== "locked";
  return '<button class="cs-t ' + (s.kind === "skillmock" || s.kind === "full" ? "mock " : "") + s.status + (soon ? " soon" : "") + '" data-id="' + s.id + '">' + (s.status === "locked" ? LOCK : s.status === "done" ? TICK : esc(label)) + '</button>';
}
function nextStep() { return steps.filter(s => !s.hidden && s.status === "open" && s.kind !== "remedial")[0] || steps.filter(s => !s.hidden && s.status === "open")[0]; }
function titleOf(s) {
  if (s.kind === "full") return "Full mock exam " + s.id.slice(-1);
  if (s.kind === "skillmock") return SK[s.skill][0] + " mock exam";
  const c = content[s.skill] && content[s.skill][s.id]; return c ? c.title : (s.kind === "remedial" ? "Extra lesson " + s.n : "Lesson " + s.n);
}

function draw() {
  const main = steps.filter(s => s.kind !== "remedial" && !s.hidden), doneN = main.filter(s => s.status === "done").length, nx = nextStep();
  let h = '<p class="cs-eyebrow">DELF Tout Public</p><h1 class="cs-title">DELF ' + level.toUpperCase() + ' journey</h1><p class="cs-sub">Learn each skill, test it, then sit the full mock exams. One step opens the next. ' + doneN + ' of ' + main.length + ' steps done.</p>';
  if (nx) h += '<div class="cs-card cs-cont"><div class="cs-eyebrow" style="text-align:left;margin-bottom:4px">' + (nx.kind === "remedial" ? "Recommended next" : "Your next step") + '</div><div class="cs-h" style="margin-bottom:2px">' + esc(titleOf(nx)) + '</div><div class="cs-note" style="margin:0">' + (nx.skill ? SK[nx.skill][0] : "Both full mocks come after all four skills") + '</div><button class="cs-btn" id="go">' + (has(nx) ? "Continue" : "Being prepared") + '</button></div>';
  else h += '<div class="cs-card cs-cont"><div class="cs-h">Journey complete</div><p class="cs-p">You have finished every step for this level.</p></div>';
  Object.keys(SK).forEach(sk => {
    const L = steps.filter(s => s.skill === sk && s.kind === "lesson"), M = steps.filter(s => s.skill === sk && s.kind === "skillmock")[0], R = steps.filter(s => s.skill === sk && s.kind === "remedial" && !s.hidden);
    h += '<div class="cs-card cs-sk"><div class="cs-skh"><span class="cs-skn">' + SK[sk][0] + '</span><span class="cs-skf">' + SK[sk][1] + '</span></div><div class="cs-tiles">' +
      L.map(s => tile(s, s.n)).join("") + tile(M, "Mock") + '</div>';
    if (M.score != null) h += '<p class="cs-note">Mock score: ' + M.score + ' / 25 (' + M.pct + '%). Pass mark 50%.</p>';
    if (R.length) {
      const resolved = R.every(r => r.status === "done") || (M.status === "done" && nextAfter(sk));
      h += '<div class="cs-rem">You scored ' + M.pct + '%, under the 50% pass mark. We strongly recommend these two extra lessons. They go slowly and explain more. The choice is yours.' +
        '<div class="cs-tiles" style="margin-top:10px">' + R.map(r => tile(r, "+" + r.n)).join("") + '</div>' +
        (R.every(r => r.status === "done") ? "" : '<button class="cs-btn ghost" data-skip="' + sk + '">Skip the extra lessons and continue</button>') + '</div>';
    }
    h += '</div>';
  });
  const F = steps.filter(s => s.kind === "full");
  h += '<div class="cs-card cs-sk"><div class="cs-skh"><span class="cs-skn">Full mock exams</span><span class="cs-skf">All four papers</span></div><div class="cs-tiles">' + F.map((s, i) => tile(s, "Mock " + (i + 1))).join("") + '</div>';
  F.forEach(s => { if (s.score != null) h += '<p class="cs-note">' + titleOf(s) + ': ' + s.score + ' / 100 (' + (s.passed ? "pass" : "below the pass mark") + ')</p>'; });
  if (F.every(s => s.status === "done") && F.some(s => !s.passed)) h += '<p class="cs-note">A score under the pass mark means more practice will help. We strongly recommend the extra mock exams below, but the choice is yours.</p>';
  if (F.every(s => s.status === "done")) h += '<button class="cs-btn ghost" onclick="location.href=\'/delf/mocks.html?t=tp&l=' + level + '\'">More practice mock exams</button>';
  h += '</div>';
  root.innerHTML = h;
  const g = document.getElementById("go"); if (g) g.onclick = () => go(nx);
  root.querySelectorAll(".cs-t").forEach(b => b.onclick = () => go(steps.filter(s => s.id === b.dataset.id)[0]));
  root.querySelectorAll("[data-skip]").forEach(b => b.onclick = async () => { b.disabled = true; try { const r = await api("/api/delf/journey/skip-remedial", { method: "POST", body: JSON.stringify({ level, skill: b.dataset.skip }) }); if (r.ok) return load(); } catch (e) { } b.disabled = false; toast("Could not save. Try again."); });
}
function nextAfter(sk) { const i = Object.keys(SK).indexOf(sk); const n = Object.keys(SK)[i + 1]; if (!n) return false; return steps.some(s => s.skill === n && s.kind === "lesson" && s.n === 1 && s.status !== "locked"); }

async function load() {
  let st = null, code = 0;
  for (let i = 0; i < 6 && !st; i++) {
    try { const r = await api("/api/delf/journey?level=" + level); code = r.status; if (r.ok) st = await r.json(); else if (r.status === 403 || r.status === 400) break; } catch (e) { }
    if (!st && code !== 403 && code !== 400) await new Promise(r => setTimeout(r, 4000));
  }
  if (code === 403) { root.innerHTML = '<p class="cs-msg">This level is not unlocked yet.</p><button class="cs-btn" onclick="location.href=\'/delf/tout-public/\'">Choose a level</button>'; return; }
  if (!st) { root.innerHTML = '<p class="cs-msg">We could not load your journey just now. Please refresh in a moment.</p>'; return; }
  steps = st.steps; await loadContent(); draw();
}
onAuthStateChanged(auth, u => {
  if (!/^(a1|a2|b1|b2|c1)$/.test(level)) { root.innerHTML = '<p class="cs-msg">Choose a level first.</p><button class="cs-btn" onclick="location.href=\'/delf/tout-public/\'">Choose a level</button>'; return; }
  if (!u || (u.isAnonymous && !u.email)) { root.innerHTML = '<p class="cs-msg">Please log in to see your journey.</p><button class="cs-btn" onclick="location.href=\'/auth/login.html\'">Log In</button>'; return; }
  user = u; load();
});
