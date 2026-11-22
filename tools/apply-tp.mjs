// Tout Public lessons 4-25: wires each lesson into the scene design, but only once ALL its audio is built. Safe to run again.
// Usage: node apply-tp.mjs <levelsDir>
import fs from "fs"; import path from "path";
const base = process.argv[2] || "public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8"), en = fs.readFileSync(enF, "utf8");
const m = ui.match(/var UCFG=(\{.*?\});\nfunction U\(\)/s);
if (!m) { console.log("STOP: UCFG not found in scene-ui.js"); process.exit(1); }
const cfg = JSON.parse(m[1]), all = JSON.parse(fs.readFileSync(new URL("./tp-lessons.json", import.meta.url), "utf8"));
const flagDir = new URL("./audio/done/", import.meta.url); let added = 0, ready = 0;
for (const k in all) { const n = k.split("-")[1]; if (process.argv.includes("--all") || fs.existsSync(new URL(`L${n}_a0.flag`, flagDir))) { ready++; if (JSON.stringify(cfg[k]) !== JSON.stringify(all[k])) { cfg[k] = all[k]; added++; } } }
console.log("Tout Public lessons with finished audio: " + ready + " of " + Object.keys(all).length);
if (!added) { console.log("Nothing new to wire."); process.exit(0); }
fs.writeFileSync(uiF + ".bakTP", ui); fs.writeFileSync(enF + ".bakTP", en);
ui = ui.replace(m[0], () => "var UCFG=" + JSON.stringify(cfg) + ";\nfunction U()");
en = en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1));
fs.writeFileSync(uiF, ui); fs.writeFileSync(enF, en);
const d = path.join(base, "A0", "tout-public"); let n = 0;
for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (x, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } }
console.log("Wired " + added + " Tout Public lesson(s). Lesson pages refreshed: " + n);
