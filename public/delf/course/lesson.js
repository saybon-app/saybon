import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const API = "https://saybonapp-server.onrender.com";
const root = document.getElementById("root");
const id = (new URLSearchParams(location.search).get("id") || "").toLowerCase();
const m = /^(a1|a2|b1|b2|c1)-(co|ce|pe|po)-(\d|r\d)$/.exec(id);
const level = m && m[1], skill = m && m[2];
const back = level ? "/delf/journey.html?l=" + level : "/delf/";
document.getElementById("csBack").onclick = () => { location.href = back; };
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const nf = s => String(s || "").toLowerCase().replace(/:/g, "h").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\b(euros?|centimes?)\b|€/g, " ").replace(/[^a-z0-9]+/g, "");
const S = { lesson: null, i: 0, user: null, answers: {}, checked: {}, audio: {} };

function fail(msg, link) { root.innerHTML = '<p class="cs-msg">' + esc(msg) + '</p><button class="cs-btn" onclick="location.href=\'' + (link || back) + '\'">Back to my journey</button>'; }
async function tok() { return S.user ? await S.user.getIdToken() : null; }
async function api(path, opt) { const t = await tok(); const r = await fetch(API + path, Object.assign({ headers: Object.assign({ Authorization: "Bearer " + t, "Content-Type": "application/json" }, (opt && opt.headers) || {}) }, opt || {})); return r; }

async function start(user) {
  S.user = user;
  if (!m) return fail("This lesson link is not valid.", "/delf/");
  let state = null;
  for (let i = 0; i < 6 && !state; i++) {
    try { const r = await api("/api/delf/journey?level=" + level); if (r.status === 403) return fail("This level is not unlocked yet.", "/delf/tout-public/"); if (r.ok) state = await r.json(); } catch (e) { }
    if (!state) await new Promise(r => setTimeout(r, 4000));
  }
  if (!state) return fail("We could not reach the server. Please try again in a moment.");
  const st = state.steps.filter(x => x.id === id)[0];
  if (!st) return fail("This lesson does not exist.");
  if (st.status === "locked") return fail("This lesson opens after you finish the step before it.");
  let data; try { const r = await fetch("/delf/course/data/" + level + "-" + skill + ".json?v=1"); if (!r.ok) throw 0; data = await r.json(); } catch (e) { return fail("This lesson is being prepared and will be ready soon."); }
  S.lesson = (data.lessons || []).filter(x => x.id === id)[0];
  if (!S.lesson) return fail("This lesson is being prepared and will be ready soon.");
  S.data = data; S.done = st.status === "done"; show();
}

function prog() { return '<div class="cs-prog">' + S.lesson.blocks.map((b, i) => '<i class="' + (i <= S.i ? "on" : "") + '"></i>').join("") + '</div>'; }
function head() {
  const L = S.lesson, rem = L.remedial;
  return '<p class="cs-eyebrow">' + esc(S.data.skillName) + (rem ? " · Extra lesson" : " · Lesson " + L.n + " of 4") + '</p><h1 class="cs-title">' + esc(L.title) + '</h1><p class="cs-sub">' + esc(L.titleEn || "") + '</p>' + prog();
}
function next() { S.i++; stopAudio(); show(); window.scrollTo(0, 0); }

function show() {
  const b = S.lesson.blocks[S.i]; let h = head();
  if (b.type === "teach") {
    h += '<div class="cs-card"><div class="cs-h">' + esc(b.title) + '</div>' + (b.paras || []).map(p => '<p class="cs-p">' + esc(p) + '</p>').join("") +
      (b.points ? '<ul class="cs-ul">' + b.points.map(p => '<li>' + esc(p) + '</li>').join("") + '</ul>' : "") +
      (b.tip ? '<div class="cs-tip"><b>Tip.</b> ' + esc(b.tip) + '</div>' : "") + '</div><button class="cs-btn" id="nx">Continue</button>';
  } else if (b.type === "vocab") {
    h += '<div class="cs-card"><div class="cs-h">' + esc(b.title) + '</div>' + b.items.map(x => '<div class="cs-voc"><b>' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>').join("") + (b.note ? '<p class="cs-note">' + esc(b.note) + '</p>' : "") + '</div><button class="cs-btn" id="nx">Continue</button>';
  } else if (b.type === "listen") { h += listenHtml(b); }
  else if (b.type === "recap") {
    h += '<div class="cs-card"><div class="cs-h">' + esc(b.title) + '</div><ul class="cs-ul">' + b.points.map(p => '<li>' + esc(p) + '</li>').join("") + '</ul></div><button class="cs-btn" id="fin">Finish lesson</button>';
  }
  root.innerHTML = h;
  const nx = document.getElementById("nx"); if (nx) nx.onclick = next;
  const fin = document.getElementById("fin"); if (fin) fin.onclick = finish;
  if (b.type === "listen") bindListen(b);
}

/* ---- listening block ---- */
function transcript(b) { return '<div class="cs-tr">' + b.lines.map(l => '<b>' + (l.v === "F" ? "Woman" : l.v === "H" ? "Man" : "Announcer") + '</b>' + esc(l.t)).join("") + '</div>'; }
function listenHtml(b) {
  const chk = S.checked[b.id];
  let h = '<div class="cs-card"><div class="cs-h">' + esc(b.title) + '</div><p class="cs-p">' + esc(b.instr) + '</p>' +
    '<div class="cs-play"><button class="cs-pb" id="pb" disabled>▶</button><div class="cs-wave"><i id="pw"></i></div><span class="cs-pst" id="ps">Preparing audio...</span></div>' +
    (b.transcript === "before" ? transcript(b) : "") + (b.transcript === "after" && chk ? transcript(b) : "");
  b.questions.forEach((q, qi) => {
    const a = S.answers[b.id + q.id], r = chk && chk.res[q.id];
    h += '<div class="cs-q">' + (qi + 1) + '. ' + esc(q.q) + '</div>';
    if (q.type === "fill") h += '<input class="cs-fill ' + (chk ? (r.ok ? "ok" : "bad") : "") + '" data-q="' + q.id + '" value="' + esc(a || "") + '" ' + (chk ? "disabled" : "") + ' placeholder="Your answer" autocomplete="off">';
    else q.opts.forEach((o, oi) => { let c = "cs-opt"; if (chk) { if (oi === q.ans) c += " ok"; else if (a === oi) c += " bad"; } else if (a === oi) c += " sel"; h += '<button class="' + c + '" data-q="' + q.id + '" data-o="' + oi + '"' + (chk ? " disabled" : "") + '>' + esc(o) + '</button>'; });
    if (chk) h += '<div class="cs-ex">' + (q.type === "fill" ? '<b>' + (r.ok ? "Correct. " : "The answer is " + esc(q.accepted[0]) + ". ") + '</b>' : "") + esc(q.expl) + '</div>';
  });
  if (chk) h += '<div class="cs-score">' + chk.got + ' / ' + b.questions.length + ' correct</div><button class="cs-btn" id="nx">Continue</button>';
  else h += '<button class="cs-btn" id="ck" disabled>Check my answers</button>';
  return h + '</div>';
}
function bindListen(b) {
  const chk = S.checked[b.id];
  root.querySelectorAll(".cs-opt").forEach(o => o.onclick = () => { if (chk) return; S.answers[b.id + o.dataset.q] = +o.dataset.o; root.querySelectorAll('.cs-opt[data-q="' + o.dataset.q + '"]').forEach(x => x.classList.remove("sel")); o.classList.add("sel"); ready(b); });
  root.querySelectorAll(".cs-fill").forEach(f => f.oninput = () => { S.answers[b.id + f.dataset.q] = f.value; ready(b); });
  const ck = document.getElementById("ck"); if (ck) { ready(b); ck.onclick = () => check(b); }
  const nx = document.getElementById("nx"); if (nx) nx.onclick = next;
  setupAudio(b);
}
function ready(b) { const ck = document.getElementById("ck"); if (!ck) return; ck.disabled = !b.questions.every(q => { const a = S.answers[b.id + q.id]; return q.type === "fill" ? String(a || "").trim() : a != null; }); }
function check(b) {
  const res = {}; let got = 0;
  b.questions.forEach(q => { const a = S.answers[b.id + q.id]; const ok = q.type === "fill" ? q.accepted.some(x => nf(x) === nf(a)) : a === q.ans; res[q.id] = { ok }; if (ok) got++; });
  S.checked[b.id] = { res, got }; const keepAudio = S.audio[b.id]; show();
}

/* ---- audio: fetched ahead and played from a blob so it also works on iPhone ---- */
function stopAudio() { if (S.el) { try { S.el.pause(); } catch (e) { } S.el = null; } }
function fetchAudio(b, force) {
  let a = S.audio[b.id]; if (a && !force) return a; a = S.audio[b.id] = { state: "loading", url: null };
  a.p = (async () => { const r = await api("/api/delf/tts-lines", { method: "POST", body: JSON.stringify({ lines: b.lines, level }) }); if (!r.ok) throw new Error(r.status); a.url = URL.createObjectURL(await r.blob()); a.state = "ready"; })().catch(() => { a.state = "error"; });
  return a;
}
function setupAudio(b) {
  const a = fetchAudio(b); const pb = document.getElementById("pb"), ps = document.getElementById("ps"), pw = document.getElementById("pw");
  const paint = () => { if (!document.getElementById("pb")) return; if (a.state === "loading") { pb.disabled = true; ps.textContent = "Preparing audio..."; } else if (a.state === "error") { pb.disabled = false; pb.textContent = "↻"; ps.textContent = "Tap to retry"; } else { pb.disabled = false; pb.textContent = S.el ? "❚❚" : "▶"; ps.textContent = S.el ? "Playing" : "Tap to play"; } };
  paint(); a.p.then(paint);
  pb.onclick = () => {
    if (a.state === "error") { fetchAudio(b, true).p.then(() => setupAudio(b)); setupAudio(b); return; }
    if (a.state !== "ready") return;
    if (S.el) { stopAudio(); pw.style.width = "0"; paint(); return; }
    const au = new Audio(a.url); S.el = au;
    au.ontimeupdate = () => { if (au.duration) pw.style.width = Math.round(au.currentTime / au.duration * 100) + "%"; };
    au.onended = () => { S.el = null; pw.style.width = "100%"; paint(); ps.textContent = "Tap to replay"; };
    au.onerror = () => { S.el = null; paint(); };
    au.play().then(paint).catch(() => { S.el = null; paint(); });
  };
}

async function finish() {
  const b = document.getElementById("fin"); b.disabled = true; b.textContent = "Saving...";
  try { const r = await api("/api/delf/journey/lesson", { method: "POST", body: JSON.stringify({ level, step: id }) }); if (!r.ok) throw 0; location.href = back; }
  catch (e) { b.disabled = false; b.textContent = "Could not save. Tap to try again"; }
}

onAuthStateChanged(auth, u => { if (!u || (u.isAnonymous && !u.email)) { root.innerHTML = '<p class="cs-msg">Please log in to continue your lesson.</p><button class="cs-btn" onclick="location.href=\'/auth/login.html\'">Log In</button>'; return; } start(u); });
