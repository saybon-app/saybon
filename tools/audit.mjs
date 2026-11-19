// SayBon audit: every audio file a lesson uses must exist, and every recorder must be wired. Writes audit-report.txt
import fs from "fs"; import path from "path";
const root = process.argv[2] || "C:/SayBon", pub = path.join(root, "public"), lv = path.join(pub, "levels");
const SERVER = "https://saybonapp-server.onrender.com", SITE = "https://saybonapp.com";
const ui0 = fs.existsSync(path.join(lv, "scene-paris", "scene-ui.js")) ? fs.readFileSync(path.join(lv, "scene-paris", "scene-ui.js"), "utf8") : "";
const out = []; const P = s => { out.push(s); console.log(s); };
const exists = u => { const f = path.join(pub, decodeURIComponent(u.split("?")[0]).replace(/^\//, "")); return fs.existsSync(f) && fs.statSync(f).size > 1000 ? "ok" : (fs.existsSync(f) ? "TOO SMALL" : "MISSING"); };
P("== 1. Lesson pages and engines");
const dirs = fs.readdirSync(lv).filter(d => fs.statSync(path.join(lv, d)).isDirectory());
for (const d of dirs) { const fl = fs.readdirSync(path.join(lv, d)).filter(f => /\.html$/.test(f)); const eng = new Set();
  for (const f of fl) { const s = fs.readFileSync(path.join(lv, d, f), "utf8"); const m = s.match(/src="([^"]*lesson-engine[^"]*)"/); eng.add(m ? m[1] : "NO ENGINE"); }
  P(`${d}: ${fl.length} pages (${fl.filter(f => /^lesson\d+/.test(f)).join(" ") || "-"}) engine: ${[...eng].join(" , ")}`); }
P("\n== 2. Recorder wiring in the scripts");
for (const f of fs.readdirSync(lv).filter(f => /\.js$/.test(f)).concat(["scene-paris/scene-ui.js"].filter(f => fs.existsSync(path.join(lv, f))))) {
  const s = fs.readFileSync(path.join(lv, f), "utf8");
  P(`${f}: getUserMedia=${/getUserMedia/.test(s)} MediaRecorder=${/MediaRecorder/.test(s)} assessPronunciation=${/assessPronunciation/.test(s)} stops tracks=${/getTracks\(\)\.forEach/.test(s)}`); }
P("\n== 3. Audio files named in the scripts (static)");
const seen = new Set(); let miss = 0;
for (const f of fs.readdirSync(lv).filter(f => /\.js$/.test(f)).concat(["scene-paris/scene-ui.js"])) { const p = path.join(lv, f); if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, "utf8").matchAll(/\/assets\/audio\/[A-Za-z0-9_\-\/.]+\.mp3/g)) { if (seen.has(m[0])) continue; seen.add(m[0]); const r = exists(m[0]); if (r !== "ok") { miss++; P(`  ${r}: ${m[0]}  (${f})`); } } }
P(`  ${seen.size} fixed audio paths, ${miss} problems`);
P("\n== 3b. Tout Public lessons 1-3 and Les Petits audio (built from names)");
{ const A = "/assets/audio/"; const chk = (u, why) => { const r = exists(u); if (r !== "ok") P(`  ${r}: ${u}  (${why})`); return r === "ok"; }; let t = 0, ok = 0;
  const TP = { 1: 5, 2: 4, 3: 2 }; for (const l in TP) for (let i = 1; i <= TP[l]; i++) { t++; ok += chk(`${A}A0_TP_L${l}_phrase${i}.mp3`, "Tout Public phrase") ? 1 : 0; }
  for (const w of ["Bonjour", "Salut", "Bonsoir", "Au revoir", "\u00c0 bient\u00f4t"]) { t++; ok += chk(`${A}A0_TP_L1_dlg_${w}.mp3`, "Tout Public dialogue question") ? 1 : 0; }
  const km = (n) => { const m = ui0.match(new RegExp("var " + n + "=\\{([^}]*)\\}")); return m ? [...m[1].matchAll(/'(\d+)-(\d+)'/g)].map(x => [x[1], x[2]]) : []; };
  for (const [l, p] of km("KAUD")) { t++; ok += chk(`${A}lp/lesson${l}_part${p}.mp3`, "Les Petits part audio") ? 1 : 0; }
  for (const [l, p] of km("KINTRO")) { t++; ok += chk(`${A}lp/lesson${l}_part${p}.mp3`, "Les Petits intro") ? 1 : 0; }
  P(`  ${ok} of ${t} present`); }
P("\n== 4. Built lessons (A1-C2 and Tout Public): intro, steps, dialogue and its answer windows");
const ui = fs.readFileSync(path.join(lv, "scene-paris", "scene-ui.js"), "utf8"); const mm = ui.match(/var UCFG=(\{.*?\});\nfunction U\(\)/s);
if (!mm) P("  no UCFG found (apply-upper3 not applied)"); else { const cfg = JSON.parse(mm[1]); const A = "/assets/audio/lessons/";
  for (const k in cfg) { const c = cfg[k], bad = [];
    for (const n of [c.intro, ...c.steps.map(s => s.a), c.dlg]) { const r = exists(A + n + ".mp3"); if (r !== "ok") bad.push(`${n}.mp3 ${r}`); }
    const jf = path.join(pub, "assets/audio/lessons", c.dlg + ".json");
    if (!fs.existsSync(jf)) bad.push(c.dlg + ".json MISSING"); else { const g = JSON.parse(fs.readFileSync(jf, "utf8")).gaps || []; if (g.length !== c.dd.length) bad.push(`windows ${g.length} but expected-answers ${c.dd.length}`); }
    P(`  ${k}: ${bad.length ? "PROBLEMS -> " + bad.join("; ") : "all " + (c.steps.length + 2) + " audio files + windows ok"}`); } }
P("\n== 5. Live lessons from the server (assets per lesson) and their audio");
const ids = ["a0-les-petits", "a0-tout-public", "a1", "a2", "b1", "b2", "c1", "c2"];
try { const h = await fetch(SERVER + "/api/health").catch(() => null); P(`server reachable: ${h ? h.status : "NO"}`); } catch {}
for (const id of ids) for (let n = 1; n <= 5; n++) {
  try { const r = await fetch(`${SERVER}/api/levelAssets?level=${id}&lesson=${n}`); const j = await r.json(); const a = Array.isArray(j) ? j : (j.assets || []);
    const urls = a.map(x => x.url || x.audioUrl || x.src).filter(Boolean); const bad = [];
    for (const u of urls) { const full = u.startsWith("http") ? u : SITE + u; const h = await fetch(full, { method: "HEAD" }).catch(() => null); if (!h || !h.ok) bad.push(u + " -> " + (h ? h.status : "no reply")); }
    P(`  ${id} lesson ${n}: ${a.length} assets, ${urls.length} with audio${bad.length ? ", BROKEN: " + bad.join("; ") : ""}`);
  } catch (e) { P(`  ${id} lesson ${n}: could not read (${e.message})`); } }
P("\n== 6. Built audio on the live site");
for (const k of ["A0_TP_L1_intro", "A0_TP_L1_dialogue", "A0_TP_L2_dialogue", "A0_TP_L3_dialogue"]) { const h = await fetch(`${SITE}/assets/audio/${k}.mp3`, { method: "HEAD" }).catch(() => null); P(`  ${k}.mp3: ${h ? h.status : "no reply"}`); }
fs.writeFileSync(path.join(root, "audit-report.txt"), out.join("\n"));
P("\nSaved: " + path.join(root, "audit-report.txt"));
