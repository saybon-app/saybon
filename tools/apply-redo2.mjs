// Fix: Redo/complete must clear the saved resume position (psResume:*) too. Anchored, .bak8 backups.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8"), en = fs.readFileSync(enF, "utf8");
if (en.includes("psResume:'")) { console.log("Already applied."); process.exit(0); }
const A = "if(k.indexOf('psL1:')===0)localStorage.removeItem(k);", B = "markLessonComplete();\n    render(", C = "l1Write(0);window.__psIntroUsed=1;l1Show(0,ctx);";
const bad = []; if (!en.includes(A)) bad.push("redo (run apply-redo first)"); if (!en.includes(B)) bad.push("complete"); if (!ui.includes(C)) bad.push("scene redo");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
fs.writeFileSync(enF + ".bak8", en); fs.writeFileSync(uiF + ".bak8", ui);
const CLR = "try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('psResume:')===0)localStorage.removeItem(k);});}catch(e){}";
en = en.replace(A, () => "if(k.indexOf('psL1:')===0||k.indexOf('psResume:')===0)localStorage.removeItem(k);");
en = en.replace(B, () => CLR + "markLessonComplete();\n    render(");
ui = ui.replace(C, () => "rsWrite(0);" + C);
ui = ui.replace(" l1Write(0);\n try{var uid=window.lsCurrentUid,LV=", () => " l1Write(0);rsWrite(0);\n try{var uid=window.lsCurrentUid,LV=");
fs.writeFileSync(uiF, ui);
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (m, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv of fs.readdirSync(base)) { const d = path.join(base, lv); if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (m, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: Redo now restarts from the beginning. Pages updated: " + n);
