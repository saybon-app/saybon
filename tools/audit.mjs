// SayBon audit: every audio file a lesson uses must exist, and every recorder must be wired. Writes audit-report.txt
import fs from "fs"; import path from "path";
const root = process.argv[2] || "C:/SayBon", pub = path.join(root, "public"), lv = path.join(pub, "levels");
const SERVER = "https://saybonapp-server.onrender.com", SITE = "https://saybonapp.com";
const ui0 = fs.existsSync(path.join(lv, "scene-paris", "scene-ui.js")) ? fs.readFileSync(path.join(lv, "scene-paris", "scene-ui.js"), "utf8") : "";
const out = []; const P = s => { out.push(s); console.log(s); }; let PROBLEMS = 0; const F = s => { PROBLEMS++; P("  !! " + s); };
const tf = async (u, o = {}, tries = 3) => { for (let i = 0; i < tries; i++) { try { const r = await fetch(u, { ...o, signal: AbortSignal.timeout(60000) }); if (r.ok || i === tries - 1) return r; } catch (e) { if (i === tries - 1) return null; } await new Promise(r => setTimeout(r, 4000)); } return null; };
const exists = u => { const f = path.join(pub, decodeURIComponent(u.split("?")[0]).replace(/^\//, "")); return fs.existsSync(f) && fs.statSync(f).size > 1000 ? "ok" : (fs.existsSync(f) ? "TOO SMALL" : "MISSING"); };
P("== 1. Lesson pages and engines");
const dirs = fs.readdirSync(lv).filter(d => fs.statSync(path.join(lv, d)).isDirectory());
for (const d of dirs) { const fl = fs.readdirSync(path.join(lv, d)).filter(f => /\.html$/.test(f)); const eng = new Set();
  for (const f of fl) { const s = fs.readFileSync(path.join(lv, d, f), "utf8"); const m = s.match(/src="([^"]*lesson-engine[^"]*)"/); eng.add(m ? m[1] : "NO ENGINE"); }
  const noEng = fl.filter(f => !/lesson-engine/.test(fs.readFileSync(path.join(lv, d, f), "utf8")));
  if (noEng.length) P(`  ${d}: pages WITHOUT the lesson engine: ${noEng.join(" ")}`);
  P(`${d}: ${fl.length} pages (${fl.filter(f => /^lesson\d+/.test(f)).join(" ") || "-"}) engine: ${[...eng].join(" , ")}`); }
P("\n== 2. Recorder wiring in the scripts");
for (const f of fs.readdirSync(lv).filter(f => /\.js$/.test(f)).concat(["scene-paris/scene-ui.js"].filter(f => fs.existsSync(path.join(lv, f))))) {
  const s = fs.readFileSync(path.join(lv, f), "utf8");
  P(`${f}: getUserMedia=${/getUserMedia/.test(s)} MediaRecorder=${/MediaRecorder/.test(s)} assessPronunciation=${/assessPronunciation/.test(s)} stops tracks=${/getTracks\(\)\.forEach/.test(s)}`); }
P("\n== 3. Audio files named in the scripts (static)");
const seen = new Set(); let miss = 0;
for (const f of fs.readdirSync(lv).filter(f => /\.js$/.test(f)).concat(["scene-paris/scene-ui.js"])) { const p = path.join(lv, f); if (!fs.existsSync(p)) continue;
  for (const m of fs.readFileSync(p, "utf8").matchAll(/\/assets\/audio\/[A-Za-z0-9_\-\/.]+\.mp3/g)) { if (seen.has(m[0])) continue; seen.add(m[0]); const r = exists(m[0]); if (r !== "ok") { miss++; F(`${r}: ${m[0]}  (${f})`); } } }
P(`  ${seen.size} fixed audio paths, ${miss} problems`);
P("\n== 3b. Tout Public lessons 1-3 and Les Petits audio (built from names)");
{ const A = "/assets/audio/"; const chk = (u, why) => { const r = exists(u); if (r !== "ok") F(`${r}: ${u}  (${why})`); return r === "ok"; }; let t = 0, ok = 0;
  const TP = { 1: 5, 2: 4, 3: 2 }; for (const l in TP) for (let i = 1; i <= TP[l]; i++) { t++; ok += chk(`${A}A0_TP_L${l}_phrase${i}.mp3`, "Tout Public phrase") ? 1 : 0; }
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
    if (bad.length) F(`${k}: ` + bad.join("; ")); else P(`  ${k}: all ${c.steps.length + 2} audio files + windows ok`); } }
P("\n== 5. Live lessons from the server (assets per lesson) and their audio");
const ids = ["a0-les-petits", "a0-tout-public", "a1", "a2", "b1", "b2", "c1", "c2"];
try { const h = await tf(SERVER + "/api/levelAssets?level=a1&lesson=1"); if (!h || !h.ok) F("server did not answer the lessons request"); else P("server answers: " + h.status); } catch {}
for (const id of ids) for (let n = 1; n <= 5; n++) {
  try { const r = await tf(`${SERVER}/api/levelAssets?level=${id}&lesson=${n}`); if (!r || !r.ok) throw new Error("no answer"); const j = await r.json(); const a = Array.isArray(j) ? j : (j.assets || []);
    const urls = []; const walk = o => { if (typeof o === "string") { if (/\.(mp3|wav|m4a|webm|ogg)(\?|$)/i.test(o)) urls.push(o); } else if (o && typeof o === "object") for (const v of Object.values(o)) walk(v); }; walk(a);
    if (id === "a1" && n === 1 && a[0]) P("  (shape of one asset: " + Object.keys(a[0]).join(", ") + "; types: " + [...new Set(a.map(x => x.type))].join(", ") + ")");
    const bad = [];
    for (const u of urls) { const full = u.startsWith("http") ? u : SITE + (u.startsWith("/") ? "" : "/") + u; const h = await tf(full, { method: "HEAD" }); if (!h || !h.ok) bad.push(u + " -> " + (h ? h.status : "no reply")); }
    if (bad.length) F(`${id} lesson ${n}: broken audio ${bad.join("; ")}`); else P(`  ${id} lesson ${n}: ${a.length} assets, ${urls.length} audio links ok`);
  } catch (e) { F(`${id} lesson ${n}: could not read the lesson (${e.message})`); } }
P("\n== 6. Live site: pages and every built audio file");
for (const u of ["/", "/levels/", "/levels/A1/", "/levels/A1/lesson1.html", "/levels/A1/lesson2.html", "/levels/A2/lesson1.html", "/levels/B1/lesson1.html", "/levels/B2/lesson1.html", "/levels/C1/lesson1.html", "/levels/C2/lesson1.html", "/levels/lesson-engine-tp.js", "/levels/scene-paris/scene-ui.js"]) { const h = await tf(SITE + u, { method: "HEAD" }); if (!h || !h.ok) F(`page ${u} -> ${h ? h.status : "no reply"}`); else P(`  ${u}: ${h.status}`); }
for (const k of ["A0_TP_L1_intro", "A0_TP_L1_dialogue", "A0_TP_L2_dialogue", "A0_TP_L3_dialogue", "A0_TP_L3_intro", "A0_TP_L3_dialogue_intro"]) { const h = await tf(`${SITE}/assets/audio/${k}.mp3`, { method: "HEAD" }); if (!h || !h.ok) F(`live audio ${k}.mp3 -> ${h ? h.status : "no reply"}`); }
if (mm) { const cfg = JSON.parse(mm[1]); let ok = 0, tot = 0; for (const k in cfg) { const c = cfg[k]; for (const n of [c.intro + ".mp3", ...c.steps.map(s => s.a + ".mp3"), c.dlg + ".mp3", c.dlg + ".json"]) { tot++; const h = await tf(`${SITE}/assets/audio/lessons/${n}`, { method: "HEAD" }); if (h && h.ok) ok++; else F(`live ${k}: ${n} -> ${h ? h.status : "no reply"}`); } } P(`  built lesson audio live: ${ok} of ${tot}`); }
P(PROBLEMS ? `\nRESULT: ${PROBLEMS} PROBLEM(S)` : "\nRESULT: all good");
fs.writeFileSync(path.join(root, "audit-report.txt"), out.join("\n"));
P("\nSaved: " + path.join(root, "audit-report.txt"));
process.exit(PROBLEMS ? 1 : 0);
