// Lesson 1 of A1 to C2 becomes: part 1 = intro (with music), part 2 = lesson. Safe: checks anchors, keeps .bak5 copies.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8"), en = fs.readFileSync(enF, "utf8");
if (ui.includes("UINTRO=")) { console.log("Already applied."); process.exit(0); }
const re1 = /UDR=\{[^}]*\},/, re2 = /var UK=!kids\(\)\?\(UDR\[[^;]*?\|\|null\):null,UQ=[^;]*?'skip':null;/;
const A3 = "var url=video||audioUrl,_m=window.__psMeta||{},ovr=false;";
const bad = [];
if (!re1.test(ui)) bad.push("UDR"); if (!re2.test(ui)) bad.push("UK/UQ"); if (ui.split(A3).length !== 2) bad.push("intro url line");
const E2 = 'allAssets = [{part:1,type:"text",content:" "}];';
if (!en.includes(E2)) bad.push("engine injection");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
fs.writeFileSync(uiF + ".bak5", ui); fs.writeFileSync(enF + ".bak5", en);
const L = ["A1", "A2", "B1", "B2", "C1", "C2"];
ui = ui.replace(re1, "UDR={" + L.map(l => `'${l}-1-2':'L1_${l.toLowerCase()}'`).join(",") + "},UINTRO={" + L.map(l => `'${l}-1-1':'L1_${l.toLowerCase()}_intro'`).join(",") + "},");
const lv = "((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-'";
ui = ui.replace(re2, `var UK=!kids()?(UDR[${lv}+partNum]||null):null,UQ=(!kids()&&!UK&&partNum>2&&UDR[${lv}+'2'])?'skip':null;`);
ui = ui.replace(A3, A3 + `if(!url&&!kids()&&UINTRO[${lv}+partNum])url='/assets/audio/lessons/'+UINTRO[${lv}+partNum]+'.mp3?v=1';`);
fs.writeFileSync(uiF, ui);
en = en.replace(E2, 'allAssets = [{part:1,type:"text",content:" "},{part:2,type:"text",content:" "}];');
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (m, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv2 of L) { const d = path.join(base, lv2); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (m, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log(`Done: lesson 1 of A1 to C2 = intro with music, then the lesson. Updated ${n} lesson pages.`);
