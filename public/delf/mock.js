import { auth } from "/js/firebase-init.js";
const API_BASE = "https://saybonapp-server.onrender.com";
const root = document.getElementById("mkRoot");
const bar = document.getElementById("mkBar");
const qs = new URLSearchParams(location.search);
const mockId = qs.get("id") || "";
const TRACKS = { tp: "Tout Public", jr: "Junior", pr: "Prim" };
const LV = { a11: "A1.1", a1: "A1", a2: "A2", b1: "B1", b2: "B2", c1: "C1 DALF", c2: "C2 DALF" };
const SECS4 = [["co", "Listening", "Compréhension de l'oral"], ["ce", "Reading", "Compréhension des écrits"], ["pe", "Writing", "Production écrite"], ["po", "Speaking", "Production orale"]];
const SECS_C2 = [["pe", "Written paper", "Compréhension et production écrites"], ["co", "Sound document", "Document sonore"], ["po", "Oral paper", "Compréhension et production orales"]];
let SECS = SECS4;
const ONLY = ["co", "ce", "pe", "po"].indexOf(qs.get("only")) >= 0 ? qs.get("only") : "";
const JL = /^(a1|a2|b1|b2|c1)$/.test(qs.get("jl") || "") ? qs.get("jl") : "";
const BACK = ONLY && JL ? "/delf/journey.html?l=" + JL : "/delf/mocks.html";
window.__mkBack = BACK;
const S = { mock: null, timed: true, sec: -1, answers: {}, plays: {}, pe: {}, po: {}, timer: null, left: 0, results: {} };

function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim(); }
function fmt(sec) { sec = Math.max(0, sec | 0); return String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0"); }
function words(t) { return (String(t).trim().match(/\S+/g) || []).length; }
async function token() { try { return auth && auth.currentUser ? await auth.currentUser.getIdToken() : null; } catch (e) { return null; } }

async function load() {
  const m = /^(tp|jr|pr)-(a11|a1|a2|b1|b2|c1|c2)-(\d{2})$/.exec(mockId);
  if (!m) return fail("This exam link is not valid.");
  try {
    const r = await fetch("/delf/mocks/data/" + m[1] + "-" + m[2] + ".json?v=1");
    if (!r.ok) throw 0;
    const arr = await r.json();
    S.mock = arr.find(x => x.id === mockId);
    if (!S.mock) throw 0;
    if (S.mock.scheme === "c2") SECS = SECS_C2;
    if (ONLY) { const f = SECS.filter(x => x[0] === ONLY); if (f.length) SECS = f; }
  } catch (e) { return fail("This mock exam is not available yet."); }
  intro();
}
function fail(msg) { root.innerHTML = '<div class="mk-card"><h2>Oops</h2><p class="mk-instr">' + esc(msg) + '</p><div class="mk-row"><button class="mk-btn" onclick="location.href=\'/delf/mocks.html\'">Back to mock exams</button></div></div>'; }

function steps() { return '<div class="mk-steps">' + SECS.map((s, i) => '<div class="mk-step ' + (i < S.sec ? "done" : i === S.sec ? "on" : "") + '"></div>').join("") + "</div>"; }
function setBar(i) {
  if (i < 0) { bar.hidden = true; return; }
  bar.hidden = false; bar.innerHTML = '<span class="mk-sec">' + SECS[i][1] + ' · ' + SECS[i][2] + '</span><span class="mk-timer" id="mkTimer"></span>';
}

function intro() {
  const m = S.mock, sp = m.spec;
  setBar(-1);
  root.innerHTML = '<p class="mk-eyebrow">' + esc(TRACKS[m.track]) + ' · ' + LV[m.level] + ' · Mock ' + m.n + '</p>' +
    '<h1 class="mk-title">' + esc(m.theme) + '</h1><p class="mk-sub">' + esc(m.themeEn) + '' + (ONLY ? ' — a single-paper test, marked out of 25. The pass mark is 50%.' : ' — a full practice exam in the official DELF format.') + '</p>' +
    (m.scheme === "c2"
      ? '<div class="mk-card"><h2>The two papers</h2><p class="mk-instr">The DALF C2 has two papers, each marked out of 50. To pass you need 50/100 in total and at least 10/50 in each paper.</p><p><b>Written paper</b> — read the dossier of documents, then write a structured text (article, editorial, report or speech) · <span class="mk-small">' + sp.pe + ' min</span></p><p><b>Oral paper</b> — hear a sound document twice, prepare, then summarise it, develop your point of view and debate with the examiner · <span class="mk-small">' + sp.po + ' min + ' + sp.prep + ' min preparation</span></p>'
      : '<div class="mk-card"><h2>' + (ONLY ? 'This paper' : 'The four papers') + '</h2><p class="mk-instr">' + (ONLY ? 'This paper is marked out of 25. The pass mark is 50 percent (12.5 out of 25).' : 'Each paper is marked out of 25. To pass you need 50/100 in total and at least 5/25 in every paper.') + '</p>' +
    SECS.map((s, i) => '<p><b>' + s[1] + '</b> — ' + s[2] + ' · <span class="mk-small">' + (s[0] === "po" ? sp.po + ' min' + (sp.prep ? " + " + sp.prep + " min preparation" : "") : sp[s[0]] + ' min') + '</span></p>').join("")) +
    '</div><div class="mk-card"><h2>Before you start</h2><p class="mk-instr">Use a quiet room and headphones. Listening documents play twice only. For the speaking paper your microphone must be allowed. Your writing and speaking are marked by AI against the official grid, so treat the feedback as a close guide, not an official result.</p>' +
    '<label class="mk-small"><input type="checkbox" id="mkTimed" checked> Exam conditions (timed). Untick for relaxed practice.</label>' +
    '<div class="mk-row"><button class="mk-btn" id="mkGo">Start the exam</button></div></div>';
  document.getElementById("mkGo").onclick = () => { S.timed = document.getElementById("mkTimed").checked; next(); };
}

function startTimer(min, onEnd) {
  clearInterval(S.timer); const el = document.getElementById("mkTimer");
  if (!S.timed) { el.textContent = "Untimed"; return; }
  S.left = min * 60; el.textContent = fmt(S.left);
  S.timer = setInterval(() => { S.left--; el.textContent = fmt(S.left); el.classList.toggle("low", S.left <= 60); if (S.left <= 0) { clearInterval(S.timer); onEnd(true); } }, 1000);
}
function next() { clearInterval(S.timer); stopAudio(); S.sec++; window.__mkBusy = S.sec < SECS.length; if (S.sec >= SECS.length) return finish(); const k = SECS[S.sec][0]; ({ co: runObj, ce: runObj, pe: runPE, po: runPO })[k](k); window.scrollTo(0, 0); }

/* ---------- objective papers ---------- */
function qHtml(q, ex) {
  const k = q.id; let h = '<div class="mk-q">' + esc(q.q) + "</div>";
  if (q.type === "fill") return h + '<input class="mk-fill" data-q="' + k + '" value="' + esc(S.answers[k] || "") + '" autocomplete="off" placeholder="Votre réponse">';
  q.opts.forEach((o, i) => { const sel = S.answers[k] === i; const lab = typeof o === "object" ? '<span class="em">' + esc(o.e) + "</span><span>" + esc(o.t) + "</span>" : "<span>" + esc(o) + "</span>"; h += '<div class="mk-opt ' + (sel ? "sel" : "") + '" data-q="' + k + '" data-i="' + i + '">' + lab + "</div>"; });
  return h;
}
function docHtml(d) { return '<div class="mk-doc"><div class="dh">' + esc(d.title) + "</div>" + esc(d.body) + "</div>"; }
function runObj(k) {
  setBar(S.sec); const part = S.mock[k], sp = S.mock.spec;
  let h = steps() + '<div id="mkBody">';
  part.exercises.forEach(ex => {
    h += '<div class="mk-card"><h2>' + esc(ex.title) + '</h2><p class="mk-instr">' + esc(ex.instr) + "</p>";
    if (k === "co") h += '<div class="mk-play" data-ex="' + ex.id + '"><button class="mk-btn" data-play="' + ex.id + '">▶ Play</button><div class="mk-wave"><i></i></div><span class="cnt">Plays left: <b>' + (ex.plays || 2) + "</b></span></div>";
    else (ex.docs || []).forEach(d => h += docHtml(d));
    ex.questions.forEach(q => h += qHtml(q, ex)); h += "</div>";
  });
  h += '</div><div class="mk-row"><button class="mk-btn" id="mkNext">Submit this paper</button></div>';
  root.innerHTML = h;
  if (k === "co") part.exercises.forEach(ex => { const a = prepAudio(ex); paintPlay(ex); a.promise.then(() => paintPlay(ex)); });
  root.onclick = e => {
    const o = e.target.closest(".mk-opt"); if (o) { S.answers[o.dataset.q] = +o.dataset.i; o.parentNode.querySelectorAll(".mk-opt[data-q='" + o.dataset.q + "']").forEach(x => x.classList.remove("sel")); o.classList.add("sel"); }
    const p = e.target.closest("[data-play]"); if (p) play(part.exercises.find(x => x.id === p.dataset.play), p);
  };
  root.oninput = e => { if (e.target.classList.contains("mk-fill")) S.answers[e.target.dataset.q] = e.target.value; };
  document.getElementById("mkNext").onclick = () => { if (!S.timed || confirm("Submit this paper? You cannot come back to it.")) { score(k); next(); } };
  startTimer(sp[k], () => { score(k); next(); });
}
function score(k) {
  const part = S.mock[k]; let got = 0; const review = [];
  part.exercises.forEach(ex => ex.questions.forEach(q => {
    const a = S.answers[q.id]; let ok = false;
    if (q.type === "fill") ok = q.accepted.some(x => norm(x) === norm(a)); else ok = a === q.ans;
    if (ok) got += q.w; review.push({ ex, q, a, ok });
  }));
  S.results[k] = { raw: got, total: part.totalW, score: part.totalW ? Math.round((got / part.totalW) * 25 * 10) / 10 : 0, review };
}

/* ---------- listening audio (server voices, fetched ahead so it plays on iPhone) ---------- */
const AUDIO = {};
function voiceFor(v) {
  const vs = (speechSynthesis.getVoices() || []).filter(x => /^fr/i.test(x.lang)); const pick = i => vs.length ? vs[i % vs.length] : null;
  return v === "F" ? { voice: pick(0), pitch: 1.2, rate: .88 } : v === "H" ? { voice: pick(1), pitch: .8, rate: .88 } : { voice: pick(0), pitch: 1, rate: .92 };
}
function stopAudio() { if (S.audioEl) { try { S.audioEl.pause(); } catch (e) { } S.audioEl = null; } }
function prepAudio(ex, force) {
  const key = S.mock.id + "|" + ex.id; if (AUDIO[key] && !force) return AUDIO[key];
  const a = AUDIO[key] = { state: "loading", url: null };
  a.promise = (async () => {
    const tk = await token(); if (!tk) throw new Error("login");
    const r = await fetch(API_BASE + "/api/delf/tts-lines", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tk }, body: JSON.stringify({ lines: ex.audio.lines, level: S.mock.level }) });
    if (!r.ok) throw new Error(String(r.status));
    a.url = URL.createObjectURL(await r.blob()); a.state = "ready";
  })().catch(() => { a.state = "error"; });
  return a;
}
function paintPlay(ex) {
  const a = AUDIO[S.mock.id + "|" + ex.id]; const box = root.querySelector('.mk-play[data-ex="' + ex.id + '"]'); if (!box || !a) return;
  const btn = box.querySelector("button"), left = +box.querySelector("b").textContent;
  if (a.state === "loading") { btn.disabled = true; btn.textContent = "Preparing audio…"; }
  else if (a.state === "error") { btn.disabled = false; btn.textContent = "Audio did not load. Tap to retry"; }
  else { btn.disabled = left <= 0; btn.textContent = left <= 0 ? "Finished" : (left < (ex.plays || 2) ? "▶ Play again" : "▶ Play"); }
}
function play(ex, btn) {
  const box = btn.closest(".mk-play"); const cnt = box.querySelector("b"); let left = +cnt.textContent;
  const a = AUDIO[S.mock.id + "|" + ex.id];
  if (!a || a.state === "error") { prepAudio(ex, true).promise.then(() => paintPlay(ex)); paintPlay(ex); return; }
  if (a.state !== "ready" || left <= 0) return;
  stopAudio(); left--; cnt.textContent = left; btn.disabled = true; btn.textContent = "Playing…";
  const bar = box.querySelector("i"); bar.style.width = "0";
  const au = new Audio(a.url); S.audioEl = au;
  au.ontimeupdate = () => { if (au.duration) bar.style.width = Math.round(au.currentTime / au.duration * 100) + "%"; };
  const done = () => { bar.style.width = "100%"; paintPlay(ex); };
  au.onended = done; au.onerror = () => { left++; cnt.textContent = left; a.state = "error"; paintPlay(ex); };
  au.play().catch(() => { left++; cnt.textContent = left; paintPlay(ex); });
}

/* ---------- writing ---------- */
const ACC = ["é", "è", "ê", "à", "â", "ç", "î", "ï", "ô", "ù", "û", "œ", "«", "»"];
function runPE() {
  setBar(S.sec); const tasks = S.mock.pe.tasks; let h = steps();
  tasks.forEach(t => {
    h += '<div class="mk-card"><h2>' + esc(t.title) + '</h2>' + (t.docs || []).map(docHtml).join("") + '<p class="mk-instr">' + esc(t.instr) + "</p>";
    if (t.type === "form") t.fields.forEach(f => h += '<div class="mk-field"><label>' + esc(f.l) + '</label><input class="mk-fill pe-f" data-t="' + t.id + '" data-k="' + f.k + '"></div>');
    else h += '<div class="mk-acc">' + ACC.map(c => '<button type="button" data-ch="' + c + '">' + c + "</button>").join("") + '</div><textarea class="mk-ta pe-t" data-t="' + t.id + '" placeholder="Écrivez ici…"></textarea><div class="mk-wc" data-wc="' + t.id + '">0 / ' + t.min + " words minimum</div>";
    h += "</div>";
  });
  h += '<div class="mk-row"><button class="mk-btn" id="mkNext">Submit for marking</button></div>';
  root.innerHTML = h; let last = null;
  root.onfocusin = e => { if (e.target.matches("textarea,input")) last = e.target; };
  root.onclick = e => { const b = e.target.closest("[data-ch]"); if (b && last) { const s = last.selectionStart; last.value = last.value.slice(0, s) + b.dataset.ch + last.value.slice(last.selectionEnd); last.focus(); last.selectionStart = last.selectionEnd = s + 1; last.dispatchEvent(new Event("input", { bubbles: true })); } };
  root.oninput = e => { const el = e.target; if (el.classList.contains("pe-t")) { const t = tasks.find(x => x.id === el.dataset.t), n = words(el.value), w = root.querySelector('[data-wc="' + t.id + '"]'); w.textContent = n + " / " + t.min + " words minimum"; w.classList.toggle("ok", n >= t.min); } };
  const submit = () => { tasks.forEach(t => { if (t.type === "form") { const o = {}; root.querySelectorAll('.pe-f[data-t="' + t.id + '"]').forEach(i => o[i.dataset.k] = i.value); S.pe[t.id] = o; } else S.pe[t.id] = root.querySelector('.pe-t[data-t="' + t.id + '"]').value; }); next(); };
  document.getElementById("mkNext").onclick = () => { if (!S.timed || confirm("Submit your writing?")) submit(); };
  startTimer(S.mock.spec.pe, submit);
}

/* ---------- speaking ---------- */
function lsToWav(blob) {
  return blob.arrayBuffer().then(buf => { const Ctx = window.AudioContext || window.webkitAudioContext; const c = new Ctx(); return c.decodeAudioData(buf).finally(() => { try { c.close(); } catch (e) { } }); }).then(ab => {
    const len = Math.max(1, Math.ceil(ab.duration * 16000)); const oc = new OfflineAudioContext(1, len, 16000); const src = oc.createBufferSource(); src.buffer = ab; src.connect(oc.destination); src.start(0); return oc.startRendering();
  }).then(r => {
    const d = r.getChannelData(0), n = d.length, out = new DataView(new ArrayBuffer(44 + n * 2)); const w = (o, s) => { for (let i = 0; i < s.length; i++) out.setUint8(o + i, s.charCodeAt(i)); };
    w(0, "RIFF"); out.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true); out.setUint32(24, 16000, true); out.setUint32(28, 32000, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, "data"); out.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) { const s = Math.max(-1, Math.min(1, d[i])); out.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true); } return new Blob([out], { type: "audio/wav" });
  });
}
function speak(t, cb) {
  if (!("speechSynthesis" in window)) return cb && cb(); try { speechSynthesis.cancel(); } catch (e) { }
  const u = new SpeechSynthesisUtterance(t); u.lang = "fr-FR"; const vp = voiceFor("F"); if (vp.voice) u.voice = vp.voice; u.rate = .9; u.onend = () => cb && cb(); u.onerror = () => cb && cb(); speechSynthesis.speak(u);
}
function runPO() {
  setBar(S.sec); const sp = S.mock.spec, parts = S.mock.po.parts;
  if (sp.prep && S.timed) {
    root.innerHTML = steps() + '<div class="mk-card"><h2>Preparation time</h2><p class="mk-instr">In the real exam you have ' + sp.prep + ' minutes to prepare. Look at the role-play card below, then continue when ready.</p>' + parts.filter(p => p.card).map(p => '<div class="mk-ex"><b>' + esc(p.title) + "</b><br>" + esc(p.card.instr) + (p.card.words ? "<br>" + p.card.words.map(esc).join(" · ") : "") + (p.card.doc ? '<div class="mk-doc">' + esc(p.card.doc) + "</div>" : "") + "</div>").join("") + '<div class="mk-row"><button class="mk-btn" id="mkNext">I am ready</button></div></div>';
    startTimer(sp.prep, () => poParts(parts)); document.getElementById("mkNext").onclick = () => poParts(parts); return;
  }
  poParts(parts);
}
function poParts(parts) {
  clearInterval(S.timer); const el = document.getElementById("mkTimer"); if (el) el.textContent = ""; S.po = { turns: [] };
  let pi = 0, ti = 0;
  const show = () => {
    const p = parts[pi], t = p.turns[ti]; const last = pi === parts.length - 1 && ti === p.turns.length - 1;
    root.innerHTML = steps() + '<div class="mk-card"><p class="mk-small">Part ' + (pi + 1) + " of " + parts.length + " · turn " + (ti + 1) + " of " + p.turns.length + "</p><h2>" + esc(p.title) + "</h2>" +
      (p.card ? '<div class="mk-ex">' + esc(p.card.instr) + (p.card.words ? "<br><b>" + p.card.words.map(esc).join(" · ") + "</b>" : "") + "</div>" + (p.card.doc ? '<div class="mk-doc">' + esc(p.card.doc) + "</div>" : "") : "") +
      '<div class="mk-says"><b>Examiner:</b> ' + esc(t.ex) + '</div><div class="mk-row"><button class="mk-btn ghost" id="mkRepeat">🔊 Hear again</button></div>' + (t.hint ? '<p class="mk-hint">' + esc(t.hint) + "</p>" : "") +
      '<button class="mk-rec" id="mkRec" aria-label="Record">🎙</button><p class="mk-small" style="text-align:center" id="mkSt">Tap to answer, tap again to stop. For a long answer you can record several times.</p><div id="mkTr"></div>' +
      '<div class="mk-row"><button class="mk-btn ghost" id="mkClear">Clear</button><button class="mk-btn ghost" id="mkType">Type instead</button><button class="mk-btn" id="mkNx" disabled>' + (last ? "Finish speaking" : "Next") + "</button></div></div>";
    let answer = "", rec = null, chunks = [], stream = null, auto = null;
    const setAns = a => { answer = a; document.getElementById("mkTr").innerHTML = a ? '<div class="mk-says"><b>You:</b> ' + esc(a) + "</div>" : ""; document.getElementById("mkNx").disabled = !a; };
    document.getElementById("mkRepeat").onclick = () => speak(t.ex);
    document.getElementById("mkClear").onclick = () => { setAns(""); };
    document.getElementById("mkType").onclick = () => { const a = prompt("Type your answer in French"); if (a) setAns((answer ? answer + " " : "") + a.trim()); };
    document.getElementById("mkRec").onclick = async function () {
      const b = this, st = document.getElementById("mkSt");
      if (rec && rec.state === "recording") { clearTimeout(auto); rec.stop(); return; }
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { st.textContent = "Microphone not available. Use “Type instead”."; return; }
      chunks = []; rec = new MediaRecorder(stream); rec.ondataavailable = ev => chunks.push(ev.data);
      rec.onstop = async () => {
        b.classList.remove("on"); stream.getTracks().forEach(x => x.stop()); st.textContent = "Listening to your answer…";
        try {
          const wav = await lsToWav(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
          const r = await fetch(API_BASE + "/api/delfTranscribe", { method: "POST", body: wav }); const j = await r.json();
          if (j.error) throw new Error(j.error); if (!j.text) { st.textContent = "I could not hear you clearly. Try again or type."; return; }
          st.textContent = "Got it. Record again to add more, or continue."; setAns(answer ? answer + " " + j.text : j.text);
        } catch (e) { st.textContent = "Could not process the recording. Try again or use “Type instead”."; }
      };
      rec.start(); b.classList.add("on"); st.textContent = "Recording… tap to stop."; auto = setTimeout(() => rec.state === "recording" && rec.stop(), 55000);
    };
    document.getElementById("mkNx").onclick = () => {
      S.po.turns.push({ part: p.title, examiner: t.ex, answer }); try { speechSynthesis.cancel(); } catch (e) { }
      if (ti + 1 < p.turns.length) ti++; else if (pi + 1 < parts.length) { pi++; ti = 0; } else return next(); show();
    };
    speak(t.ex);
  };
  show();
}

/* ---------- results ---------- */
async function gradeAll() {
  const m = S.mock; const out = { pe: [], po: null };
  const docsOf = t => (t.docs || []).length ? "\n\nDOCUMENTS:\n" + t.docs.map(d => d.title + "\n" + d.body).join("\n\n") : "";
  const call = (rubric, responses) => fetch(API_BASE + "/api/gradeDelfMock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rubric, responses }) }).then(r => r.json());
  for (const t of m.pe.tasks) {
    const resp = t.type === "form" ? m.pe.tasks.find(x => x.id === t.id).fields.map(f => f.l + ": " + ((S.pe[t.id] || {})[f.k] || "")).join("\n") : (S.pe[t.id] || "");
    try { const g = await call(t.rubric, [{ task: t.instr + docsOf(t), response: resp }]); out.pe.push(Object.assign({ t }, g)); } catch (e) { out.pe.push({ t, error: true }); }
  }
  const tr = S.po.turns || [];
  const src = (m.scheme === "c2" && m.co.exercises[0] ? "\n\nSOUND DOCUMENT (transcript):\n" + m.co.exercises[0].audio.lines.map(l => l.t).join(" ") : "") + m.po.parts.filter(p => p.card && p.card.doc).map(p => "\n\nDOCUMENT:\n" + p.card.doc).join("");
  const poR = tr.map((x, i) => ({ task: (i === 0 ? "Source material for the oral task:" + src + "\n\n" : "") + x.part + " — examiner: " + x.examiner, response: x.answer }));
  try { out.po = await call("po-" + m.level, poR); } catch (e) { out.po = { error: true }; }
  return out;
}
async function finish() {
  if (ONLY) return finishOnly();
  window.__mkBusy = false; setBar(-1); root.onclick = null; root.oninput = null;
  root.innerHTML = '<div class="mk-card"><h2>Marking your writing and speaking…</h2><p class="mk-instr">This takes about half a minute.</p></div>';
  const g = await gradeAll(); const m = S.mock;
  let pe = 0, peMax = 0, ok = true;
  g.pe.forEach(x => { if (x.error || x.max == null) { ok = false; return; } pe += Math.min(1, Math.max(0, x.total / x.max)) * x.t.share; peMax += x.t.share; });
  const SC = m.scheme === "c2" ? 50 : 25;
  const po = g.po && !g.po.error && g.po.max ? Math.min(1, Math.max(0, g.po.total / g.po.max)) * SC : 0; if (!g.po || g.po.error) ok = false;
  S.results.pe = { score: Math.round(pe * 10) / 10, g: g.pe, failed: g.pe.some(x => x.error) }; S.results.po = { score: Math.round(po * 10) / 10, g: g.po };
  const sc = m.scheme === "c2" ? { pe: S.results.pe.score, po: S.results.po.score } : { co: S.results.co.score, ce: S.results.ce.score, pe: S.results.pe.score, po: S.results.po.score };
  const total = Math.round(Object.values(sc).reduce((a, b) => a + b, 0) * 10) / 10; const pass = total >= 50 && Object.values(sc).every(v => v >= (m.scheme === "c2" ? 10 : 5));
  S.final = { sc, total, pass, ok };
  let saved = null; const tk = await token();
  if (tk && ok) { try { const r = await fetch(API_BASE + "/api/delfMockSave", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tk }, body: JSON.stringify({ mockId: m.id, scores: sc, feedback: { pe: g.pe.map(x => ({ total: x.total, max: x.max, strengths: x.strengths, improvements: x.improvements })), po: g.po && { total: g.po.total, max: g.po.max, strengths: g.po.strengths, improvements: g.po.improvements } }, answers: { co: Object.keys(S.answers).length, pe: S.pe, po: S.po } }) }); saved = (await r.json()).ok; } catch (e) { saved = false; } }
  results(saved);
}
async function finishOnly() {
  window.__mkBusy = false; setBar(-1); root.onclick = null; root.oninput = null;
  const k = ONLY, m = S.mock; let score = 0, ok = true;
  if (k === "co" || k === "ce") { score = S.results[k] ? S.results[k].score : 0; }
  else {
    root.innerHTML = '<div class="mk-card"><h2>Marking your ' + (k === "pe" ? "writing" : "speaking") + '…</h2><p class="mk-instr">This takes about half a minute.</p></div>';
    const g = await gradeAll();
    if (k === "pe") { let pe = 0; g.pe.forEach(x => { if (x.error || x.max == null) { ok = false; return; } pe += Math.min(1, Math.max(0, x.total / x.max)) * x.t.share; }); score = Math.round(pe * 10) / 10; S.results.pe = { score, g: g.pe, failed: g.pe.some(x => x.error) }; }
    else { const po = g.po && !g.po.error && g.po.max ? Math.min(1, Math.max(0, g.po.total / g.po.max)) * 25 : 0; if (!g.po || g.po.error) ok = false; score = Math.round(po * 10) / 10; S.results.po = { score, g: g.po }; }
  }
  S.final = { sc: { [k]: score }, total: score, pass: score >= 12.5, ok, only: true };
  let saved = null; const tk = await token();
  if (tk && ok && JL) { try { const r = await fetch(API_BASE + "/api/delf/journey/skill-mock", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + tk }, body: JSON.stringify({ level: JL, skill: k, mockId: m.id, score }) }); saved = (await r.json()).ok === true; } catch (e) { saved = false; } }
  results(saved);
}
function decorateOnly(saved) {
  const f = S.final, pct = Math.round(f.total / 25 * 100), pass = f.total >= 12.5, card = root.querySelector(".mk-card");
  const msg = !f.ok ? "Part of your answer could not be marked (connection problem), so this score is not saved. Please retake it in a moment."
    : pass ? "You are at or above the 50% pass mark for this paper. Well done: you can move on to the next skill."
    : "This is under the 50% pass mark. We strongly recommend the two extra lessons for this skill, which go slowly and explain more. The choice is yours: you can also skip them and move on.";
  card.innerHTML = '<div class="mk-score">' + f.total + '<span style="font-size:1.4rem"> / 25</span></div><p style="margin:6px 0;font-weight:800">' + pct + '%</p><p style="margin:10px 0"><span class="mk-pass ' + (pass && f.ok ? "y" : "n") + '">' + (!f.ok ? "NOT SAVED" : pass ? "ABOVE THE PASS MARK" : "BELOW THE PASS MARK") + '</span></p><p class="mk-small">' + msg + '</p>' +
    (f.ok && saved === true ? '<p class="mk-small">Saved to your journey.</p>' : f.ok && saved === false ? '<p class="mk-small" style="color:var(--bad)">Could not save this result. Please check your connection and retake.</p>' : "");
  root.querySelectorAll(".tabs button").forEach(b => { const k = b.dataset.tab; const keep = (ONLY === "co" || ONLY === "ce") ? k === "rv" : ONLY === "pe" ? k === "wr" : k === "sp"; if (!keep) b.remove(); });
  const row = root.querySelector(".mk-row"); if (row) row.innerHTML = '<button class="mk-btn" onclick="location.href=\'' + BACK + '\'">' + (JL ? "Back to my journey" : "Back") + '</button><button class="mk-btn ghost" onclick="location.reload()">Retake</button>';
}
function results(saved) {
  const f = S.final, m = S.mock;
  const tiles = SECS.filter(s => f.sc[s[0]] != null).map(s => '<div class="mk-tile ' + (f.sc[s[0]] < (m.scheme === "c2" ? 10 : 5) ? "low" : "") + '"><span class="mk-small">' + s[1] + '</span><b>' + f.sc[s[0]] + '</b><span class="mk-small">/ ' + (m.scheme === "c2" ? 50 : 25) + '</span></div>').join("");
  root.innerHTML = '<p class="mk-eyebrow">Your result</p><div class="mk-card" style="text-align:center"><div class="mk-score">' + f.total + '<span style="font-size:1.4rem"> / 100</span></div><p style="margin:10px 0"><span class="mk-pass ' + (f.pass ? "y" : "n") + '">' + (f.pass ? "PASS LEVEL" : "NOT YET") + "</span></p><p class='mk-small'>" + (m.scheme === "c2" ? "Pass mark: 50/100 overall and at least 10/50 in each paper." : "Pass mark: 50/100 overall and at least 5/25 in each paper.") + "</p><div class='mk-grid4'>" + tiles + "</div>" +
    (f.ok ? "" : '<p class="mk-small" style="color:var(--bad)">Some of your writing or speaking could not be marked (connection problem). That paper counts as 0 here. Please try again later.</p>') +
    (saved === true ? '<p class="mk-small">Saved to your DELF progress.</p>' : saved === false ? '<p class="mk-small">Could not save this result. Take a screenshot to keep it.</p>' : "") + "</div>" +
    '<div class="tabs">' + (m.scheme === "c2" ? "" : '<button class="on" data-tab="rv">Answers</button>') + '<button data-tab="wr">Writing</button><button data-tab="sp">Speaking</button></div><div id="mkTab"></div>' +
    '<div class="mk-row"><button class="mk-btn" onclick="location.href=\'/delf/mocks.html\'">More mock exams</button><button class="mk-btn ghost" onclick="location.reload()">Retake</button></div>';
  const tab = k => {
    const d = document.getElementById("mkTab"); root.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === k)); let h = "";
    if (k === "rv") ["co", "ce"].filter(sk => S.results[sk]).forEach(sk => { h += '<div class="mk-card"><h2>' + SECS.find(s => s[0] === sk)[1] + " — " + S.results[sk].raw + " / " + S.results[sk].total + " points</h2>"; S.results[sk].review.forEach(r => { const q = r.q; const ans = q.type === "fill" ? q.accepted[0] : (typeof q.opts[q.ans] === "object" ? q.opts[q.ans].t : q.opts[q.ans]); const mine = r.a == null || r.a === "" ? "(no answer)" : q.type === "fill" ? r.a : (typeof q.opts[r.a] === "object" ? q.opts[r.a].t : q.opts[r.a]); h += '<div class="mk-q">' + esc(q.q) + '</div><div class="mk-opt ' + (r.ok ? "ok" : "bad") + '">' + (r.ok ? "✓ " : "✗ ") + esc(mine) + "</div>" + (r.ok ? "" : '<div class="mk-opt ok">✓ ' + esc(ans) + "</div>") + '<p class="mk-expl">' + esc(q.expl) + "</p>"; }); if (sk === "co") { h += "<h2 style='margin-top:20px'>Transcripts</h2>"; S.mock.co.exercises.forEach(ex => h += '<div class="mk-ex"><b>' + esc(ex.title) + "</b><br>" + ex.audio.lines.map(l => (l.v === "N" ? "<i>" + esc(l.t) + "</i>" : esc(l.v + " : " + l.t))).join("<br>") + "</div>"); } h += "</div>"; });
    if (k === "wr") S.results.pe.g.forEach(x => { h += '<div class="mk-card"><h2>' + esc(x.t.title) + "</h2>" + (x.error ? "<p class='mk-instr'>Could not be marked.</p>" : meters(x) + fb(x) + '<div class="mk-ex"><b>Model answer</b><br>' + esc(x.t.model) + "</div>") + "</div>"; });
    if (k === "sp") { const g = S.results.po.g; h += '<div class="mk-card"><h2>Speaking</h2>' + (!g || g.error ? "<p class='mk-instr'>Could not be marked.</p>" : meters(g) + fb(g)) + "<h2 style='margin-top:16px'>What you said</h2>" + (S.po.turns || []).map(x => '<div class="mk-says"><b>' + esc(x.examiner) + "</b><br>" + esc(x.answer || "(no answer)") + "</div>").join("") + (m.scheme === "c2" && m.co.exercises[0] ? "<h2 style='margin-top:16px'>Transcript of the sound document</h2><div class='mk-doc'>" + esc(m.co.exercises[0].audio.lines.map(l => l.t).join("\n\n")) + "</div>" : "") + "<h2 style='margin-top:16px'>Model answers</h2>" + m.po.parts.map(p => p.turns.filter(t => t.reply).map(t => '<p class="mk-small">' + esc(t.ex) + " → <b>" + esc(t.reply) + "</b></p>").join("")).join("") + "</div>"; }
    d.innerHTML = h;
  };
  const meters = g => (g.criteria || []).map(c => '<p class="mk-small">' + esc(c.l) + " — " + g.scores[c.k] + " / " + c.max + '</p><div class="mk-meter"><i style="width:' + Math.round(g.scores[c.k] / c.max * 100) + '%"></i></div>').join("");
  const fb = g => (g.strengths ? "<p><b>Strengths.</b> " + esc(g.strengths) + "</p>" : "") + (g.improvements ? "<p><b>To improve.</b> " + esc(g.improvements) + "</p>" : "") + (g.correction ? "<p class='mk-small'>Correction: <i>" + esc(g.correction) + "</i></p>" : "");
  root.querySelectorAll(".tabs button").forEach(b => b.onclick = () => tab(b.dataset.tab)); tab(ONLY === "pe" ? "wr" : ONLY === "po" ? "sp" : (m.scheme === "c2" ? "wr" : "rv")); if (S.final.only) decorateOnly(saved); window.scrollTo(0, 0);
}
if ("speechSynthesis" in window) { try { speechSynthesis.getVoices(); } catch (e) { } }
load();
