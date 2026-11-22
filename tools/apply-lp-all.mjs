// Les Petits lessons 13-25: switches on each lesson ONLY when all five of its audio files exist, so a half-built lesson never goes live.
// Safe to run again after every audio top-up. Usage: node tools/apply-lp-all.mjs  (run from the project root)
import fs from "fs"; import path from "path";
const root = process.cwd(), lv = path.join(root, "public", "levels"), aud = path.join(root, "public", "assets", "audio", "lp");
const man = JSON.parse(fs.readFileSync(path.join(root, "tools", "audio", "lp-manifest.json"), "utf8"));
const ui = path.join(lv, "scene-paris", "scene-ui.js"), en = path.join(lv, "A0", "les-petits", "lesson-engine.js");
let u = fs.readFileSync(ui, "utf8"), e = fs.readFileSync(en, "utf8"); const u0 = u, e0 = e;
for (const n of ["KDR", "KDT", "KINTRO"]) if (!new RegExp(n + "\\s*=\\s*\\{[^}]*\\}").test(u)) { console.log("STOP: cannot find " + n + " in scene-ui.js"); process.exit(1); }
if (!e.includes("allAssets = assets || [];")) { console.log("STOP: cannot find the allAssets line in the Les Petits engine"); process.exit(1); }
const done = [], missing = {};
for (let n = 13; n <= 25; n++) {
  const jobs = man.man.filter(m => m.lesson === n), miss = [];
  for (const j of jobs) { if (!fs.existsSync(path.join(aud, j.name + ".mp3"))) miss.push(j.name); }
  if (!miss.length && jobs.length === 5) done.push(n); else missing[n] = miss.length;
}
const mine = x => done.includes(+x.split("'")[1].split("-")[0]);
function add(name, entries, keyOf) { u = u.replace(new RegExp("(" + name + "\\s*=\\s*\\{)([^}]*)\\}"), (m, a, body) => { let b = body.replace(/,\s*$/, ""); for (const x of entries) if (!body.includes(keyOf(x))) b += (b ? "," : "") + x; return a + b + "}"; }); }
add("KDR", man.KDR.filter(mine), x => x.split(":")[0] + ":");
add("KINTRO", man.KINTRO.filter(mine), x => x.split(":")[0] + ":");
const keysDone = new Set(man.KDR.filter(mine).map(x => x.split(":")[1].replace(/'/g, "")));
add("KDT", Object.entries(man.KDT).filter(([k]) => keysDone.has(k)).map(([k, v]) => k + ":" + JSON.stringify(v)), x => x.split(":")[0] + ":");
// the lesson page shows five parts for every finished lesson (2-12 already work; 13+ appear as they complete)
const list = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, ...done];
const patch = 'if(LEVEL==="a0-les-petits"&&allAssets.length===0&&[' + list.join(",") + '].indexOf(LESSON)>-1){allAssets=[1,2,3,4,5].map(function(p){return {part:p,type:"text",content:" "};});}/*LPALL*/';
if (/if\(LEVEL==="a0-les-petits"&&allAssets\.length===0&&\[[\d,]*\]\.indexOf\(LESSON\)>-1\)\{[^}]*\}[^}]*\}\/\*LPALL\*\//.test(e)) e = e.replace(/if\(LEVEL==="a0-les-petits"&&allAssets\.length===0&&\[[\d,]*\]\.indexOf\(LESSON\)>-1\)\{[^}]*\}[^}]*\}\/\*LPALL\*\//, patch);
else e = e.replace("allAssets = assets || [];", "allAssets = assets || [];" + patch);
if (u !== u0 || e !== e0) {
  fs.writeFileSync(ui + ".bakLPA", u0); fs.writeFileSync(en + ".bakLPA", e0);
  e = e.replace(/scene-ui\.js\?v=(\d+)/g, (m, n) => "scene-ui.js?v=" + (+n + 1));
  fs.writeFileSync(ui, u); fs.writeFileSync(en, e);
  const d = path.join(lv, "A0", "les-petits");
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine\.js\?v=(\d+)/, (m, n) => "lesson-engine.js?v=" + (+n + 1)); if (t !== s) fs.writeFileSync(p, t); }
}
console.log("Les Petits 13-25 live: " + (done.length ? done.join(", ") : "none yet") + (Object.keys(missing).length ? "  | waiting on audio: " + Object.entries(missing).map(([k, v]) => k + " (" + v + " files)").join(", ") : ""));
