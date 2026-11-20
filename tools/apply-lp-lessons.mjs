// Les Petits lessons 2-12: 5 parts each (intro, 3 drills, conversation). Safe to run again. Usage: node apply-lp-lessons.mjs <levelsDir>
import fs from "fs"; import path from "path";
const lv = process.argv[2] || "public/levels";
const man = JSON.parse(fs.readFileSync(new URL("./audio/lp-manifest.json", import.meta.url), "utf8"));
const ui = path.join(lv, "scene-paris", "scene-ui.js"), en = path.join(lv, "lesson-engine-tp.js");
let u = fs.readFileSync(ui, "utf8"), e = fs.readFileSync(en, "utf8"); const u0 = u, e0 = e;
const bad = [];
for (const n of ["KDR", "KDT", "KINTRO"]) if (!new RegExp(n + "\\s*=\\s*\\{[^}]*\\}").test(u)) bad.push(n + " in scene-ui.js");
if (!e.includes("allAssets = assets || [];")) bad.push("allAssets line in lesson-engine-tp.js");
if (!/scene-ui\.js\?v=(\d+)/.test(e)) bad.push("scene-ui version in lesson-engine-tp.js");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); for (const n of ["KDR", "KDT", "KINTRO"]) { const ks = u.split("\n").filter(l => l.includes(n)).slice(0, 2).map(l => l.slice(0, 200)); console.log(n + ": " + (ks.join(" // ") || "(none)")); } process.exit(1); }
function addEntries(name, entries, keyOf) { u = u.replace(new RegExp("(" + name + "\\s*=\\s*\\{)([^}]*)\\}"), (m, a, body) => { let b = body.replace(/,\s*$/, ""); for (const en of entries) { if (!body.includes(keyOf(en))) b += (b ? "," : "") + en; } return a + b + "}"; }); }
addEntries("KDR", man.KDR, x => x.split(":")[0] + ":");
addEntries("KINTRO", man.KINTRO, x => x.split(":")[0] + ":");
addEntries("KDT", Object.entries(man.KDT).map(([k, v]) => k + ":" + JSON.stringify(v)), x => x.split(":")[0] + ":");
const assets = 'if(LEVEL==="a0-les-petits"&&LESSON>=2&&LESSON<=12){allAssets=[1,2,3,4,5].map(function(p){return {part:p,type:"text",content:" "};});}';
if (/LEVEL==="a0-les-petits"&&LESSON>=2&&LESSON<=\d+\)\{allAssets/.test(e)) e = e.replace(/LESSON<=\d+\)\{allAssets/, "LESSON<=12){allAssets"); else e = e.replace("allAssets = assets || [];", "allAssets = assets || [];" + assets);
if (u === u0 && e === e0) { console.log("Already up to date."); process.exit(0); }
fs.writeFileSync(ui + ".bakLP", u0); fs.writeFileSync(en + ".bakLP", e0);
e = e.replace(/scene-ui\.js\?v=(\d+)/, (m, n) => "scene-ui.js?v=" + (+n + 1));
fs.writeFileSync(ui, u); fs.writeFileSync(en, e);
let pages = 0;
(function walk(d) { for (const x of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, x.name); if (x.isDirectory()) { if (!/node_modules|assets/.test(x.name)) walk(p); } else if (/\.html$/.test(x.name)) { const s = fs.readFileSync(p, "utf8"); const t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/g, (m, n) => "lesson-engine-tp.js?v=" + (+n + 1)); if (t !== s) { fs.writeFileSync(p, t); pages++; } } } })(lv);
console.log("Done: Les Petits lessons 2-12 wired (" + pages + " lesson pages refreshed).");
