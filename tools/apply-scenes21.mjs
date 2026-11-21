// A1-C2 scene lessons 21, 22, 23, 25. Safe to run again. Usage: node apply-scenes21.mjs <levelsDir>
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8"), en = fs.readFileSync(enF, "utf8");
const m = ui.match(/var UCFG=(\{.*?\});\nfunction U\(\)/s);
if (!m) { console.log("STOP: UCFG not found in scene-ui.js"); process.exit(1); }
if (!/LESSON <= (\d+) && \/\^\(a1\|a2\|b1\|b2\|c1\|c2\)\$\//.test(en)) { console.log("STOP: lesson range line not found in lesson-engine-tp.js"); process.exit(1); }
const cfg = JSON.parse(m[1]), all = JSON.parse(fs.readFileSync(new URL("./lessons21.json", import.meta.url), "utf8")), add = {};
const flagDir = new URL("./audio/done/", import.meta.url);
for (const k in all) { const [lv, n] = k.split("-"); const f = new URL(`L${n}_${lv.toLowerCase()}.flag`, flagDir); if (process.argv.includes("--all") || fs.existsSync(f)) add[k] = all[k]; }
console.log("Lessons with finished audio: " + Object.keys(add).length + " of " + Object.keys(all).length);
if (!Object.keys(add).length) { console.log("Nothing finished yet, nothing to wire."); process.exit(0); }
let added = 0; for (const k in add) { if (!cfg[k]) added++; cfg[k] = add[k]; }
fs.writeFileSync(uiF + ".bak21", ui); fs.writeFileSync(enF + ".bak21", en);
ui = ui.replace(m[0], () => "var UCFG=" + JSON.stringify(cfg) + ";\nfunction U()");
en = en.replace(/LESSON <= (\d+) && \/\^\(a1\|a2\|b1\|b2\|c1\|c2\)\$\//, (x, d) => (+d >= 25 ? x : "LESSON <= 25 && /^(a1|a2|b1|b2|c1|c2)$/"));
if (added) en = en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1));
fs.writeFileSync(uiF, ui); fs.writeFileSync(enF, en);
let n = 0, made = 0;
for (const lv of ["A1", "A2", "B1", "B2", "C1", "C2"]) { const d = path.join(base, lv); if (!fs.existsSync(d)) continue; const l1 = path.join(d, "lesson1.html");
  for (const N of [21, 22, 23, 25]) { const p = path.join(d, `lesson${N}.html`); if (!fs.existsSync(p) && fs.existsSync(l1)) { fs.writeFileSync(p, fs.readFileSync(l1, "utf8").replace("Lesson 1 -", `Lesson ${N} -`)); made++; } }
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (x, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: " + Object.keys(add).length + " lesson-levels wired (" + added + " new). Lesson pages refreshed: " + n + ", new pages: " + made);
