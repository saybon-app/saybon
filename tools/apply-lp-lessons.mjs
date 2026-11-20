// Les Petits lessons 2-6: 5 parts each (intro, 3 drills, conversation). Usage: node apply-lp-lessons.mjs <levelsDir>
import fs from "fs"; import path from "path";
const lv = process.argv[2] || "public/levels";
const man = JSON.parse(fs.readFileSync(new URL("./audio/lp-manifest.json", import.meta.url), "utf8"));
const ui = path.join(lv, "scene-paris", "scene-ui.js"), en = path.join(lv, "lesson-engine-tp.js");
let u = fs.readFileSync(ui, "utf8"), e = fs.readFileSync(en, "utf8");
const bad = [];
if (!/KDR=\{[^}]*'1-11':'skip'\}/.test(u)) bad.push("KDR list in scene-ui.js");
if (!/KINTRO\s*=\s*\{[^}]*\}/.test(u)) bad.push("KINTRO in scene-ui.js");
if (!/KDT=\{[^}]*dialogue:'Conversation'\}/.test(u)) bad.push("KDT in scene-ui.js");
if (!e.includes("allAssets = assets || [];")) bad.push("allAssets line in lesson-engine-tp.js");
if (!/scene-ui\.js\?v=(\d+)/.test(e)) bad.push("scene-ui version in lesson-engine-tp.js");
if (bad.length && !u.includes("/*lp2-6*/")) { console.log("STOP: cannot find: " + bad.join(" | ")); const ks = u.split("\n").filter(l => /KINTRO|KINTR/.test(l)).slice(0, 4).map(l => l.slice(0, 220)); console.log("Lines mentioning KINTRO:\n" + (ks.join("\n") || "(none)")); process.exit(1); }
if (!u.includes("/*lp2-6*/")) {
  fs.writeFileSync(ui + ".bakLP", u); fs.writeFileSync(en + ".bakLP", e);
  u = u.replace(/(KDR=\{[^}]*'1-11':'skip')\}/, "$1," + man.KDR.join(",") + "}");
  u = u.replace(/KINTRO\s*=\s*\{([^}]*)\}/, (m, body) => "/*lp2-6*/KINTRO={" + body.replace(/,\s*$/, "") + "," + man.KINTRO.join(",") + "}");
  u = u.replace(/(KDT=\{[^}]*dialogue:'Conversation')\}/, "$1," + Object.entries(man.KDT).map(([k, v]) => k + ":" + JSON.stringify(v)).join(",") + "}");
  e = e.replace("allAssets = assets || [];", 'allAssets = assets || [];if(LEVEL==="a0-les-petits"&&LESSON>=2&&LESSON<=6){allAssets=[1,2,3,4,5].map(function(p){return {part:p,type:"text",content:" "};});}');
  e = e.replace(/scene-ui\.js\?v=(\d+)/, (m, n) => "scene-ui.js?v=" + (+n + 1));
  fs.writeFileSync(ui, u); fs.writeFileSync(en, e);
  /* new engine version in every lesson page */
  let pages = 0;
  (function walk(d) { for (const x of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, x.name); if (x.isDirectory()) { if (!/node_modules|assets/.test(x.name)) walk(p); } else if (/\.html$/.test(x.name)) { const s = fs.readFileSync(p, "utf8"); const t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/g, (m, n) => "lesson-engine-tp.js?v=" + (+n + 1)); if (t !== s) { fs.writeFileSync(p, t); pages++; } } } })(lv);
  console.log("Done: Les Petits lessons 2-6 wired (" + pages + " lesson pages refreshed).");
} else console.log("Already applied.");
