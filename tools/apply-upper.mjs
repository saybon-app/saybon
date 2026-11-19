// Connects the A1 to C2 lesson 1 audio (one recording, learner turns recorded by themselves, loose stars).
// Safe: checks every anchor first, keeps .bak4 copies, changes nothing if an anchor is missing.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8"), en = fs.readFileSync(enF, "utf8");
if (ui.includes("UDR={")) { console.log("Already applied."); process.exit(0); }
const A = {
  kdt: "KDT={bonjour:'Bonjour',",
  dk: "var DK=kids()?KDR[lessonNo()+'-'+partNum]:null;",
  dn: "var dn='/assets/audio/lp/lesson'+lessonNo()+'_drill_'+DK;",
};
const bad = Object.entries(A).filter(([k, v]) => ui.split(v).length !== 2).map(([k]) => k);
const E1 = "allAssets = assets || [];\n    if(allAssets.length === 0){";
if (en.split(E1).length !== 2) bad.push("engine fetch");
if (!/scene-ui\.js\?v=\d+/.test(en)) bad.push("engine scene-ui version");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
fs.writeFileSync(uiF + ".bak4", ui); fs.writeFileSync(enF + ".bak4", en);
const parts = []; for (const [lv, nm] of [["A1", "a1"], ["A2", "a2"], ["B1", "b1"], ["B2", "b2"], ["C1", "c1"], ["C2", "c2"]]) { parts.push(`'${lv}-1-1':'L1_${nm}'`); }
const UDR = "UDR={" + parts.join(",") + "},";
ui = ui.replace(A.kdt, UDR + "KDT={upper:'Lesson 1',bonjour:'Bonjour',");
ui = ui.replace(A.dk, "var UK=!kids()?(UDR[((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-'+partNum]||null):null,UQ=(!kids()&&!UK&&UDR[((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-1'])?'skip':null;\n var DK=kids()?KDR[lessonNo()+'-'+partNum]:(UK?'upper':UQ);");
ui = ui.replace(A.dn, "var dn=UK?'/assets/audio/lessons/'+UK:'/assets/audio/lp/lesson'+lessonNo()+'_drill_'+DK;");
fs.writeFileSync(uiF, ui);
// engine: scripted lessons need no server content; bump the scene-ui version
en = en.replace(E1, "allAssets = assets || [];\n    if(allAssets.length === 0 && LESSON === 1 && /^(a1|a2|b1|b2|c1|c2)$/.test(LEVEL)){ allAssets = [{part:1,type:\"text\",content:\" \"}]; }\n    if(allAssets.length === 0){");
en = en.replace(/scene-ui\.js\?v=(\d+)/, (m, v) => "scene-ui.js?v=" + (+v + 1));
fs.writeFileSync(enF, en);
// every lesson page of A1 to C2 loads the engine: bump its version
let n = 0;
for (const lv of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
  const d = path.join(base, lv); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) {
    const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (m, v) => "lesson-engine-tp.js?v=" + (+v + 1));
    if (t !== s) { fs.writeFileSync(p, t); n++; }
  }
}
console.log(`Done: lesson 1 of A1 to C2 now plays its recording. Updated ${n} lesson pages.`);
