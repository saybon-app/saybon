// Lesson-complete screens: nicer design + "Redo lesson" button. Anchored, .bak7 backups.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8"), en = fs.readFileSync(enF, "utf8");
if (en.includes("lsRedoBtn")) { console.log("Already applied."); process.exit(0); }
const E1 = /'<div class="ls-card" style="text-align:center;">' \+\s*'<p class="ls-part-label">Lesson Complete<\/p>' \+\s*'<p style="color:#fff;font-size:1\.1rem;margin-bottom:20px;">Well done\.<\/p>' \+\s*'<button class="ls-btn ls-btn-primary" onclick="window\.location\.href=\\'\.\/\\'">Back to Lessons<\/button>' \+\s*'<\/div>'/;
const U1 = /<div class="pc-bot"><button type="button" class="pc-go pc-back">Back to lessons<\/button><\/div>'\);/;
const U2 = "p.querySelector('.pc-back').onclick=function(){location.href='./';};";
const bad = []; if (!E1.test(en)) bad.push("engine card"); if (!U1.test(ui)) bad.push("scene button"); if (ui.split(U2).length !== 2) bad.push("scene click");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
fs.writeFileSync(enF + ".bak7", en); fs.writeFileSync(uiF + ".bak7", ui);
const css = "display:block;width:100%;max-width:300px;margin:10px auto 0;padding:14px 20px;border-radius:999px;font:600 1rem Poppins,system-ui,sans-serif;cursor:pointer;";
const gold = css + "border:0;background:linear-gradient(135deg,#ffd68c,#f0a94a);color:#2b1a05;box-shadow:0 8px 24px rgba(240,169,74,.35);";
const ghost = css + "border:1.5px solid rgba(255,214,140,.7);background:transparent;color:#ffd68c;";
const ring = "width:76px;height:76px;margin:0 auto 18px;border-radius:50%;border:2px solid #ffd68c;display:flex;align-items:center;justify-content:center;font-size:2.2rem;color:#ffd68c;box-shadow:0 0 0 8px rgba(255,214,140,.12);";
const card = `'<div class="ls-card" style="text-align:center;padding:36px 22px;">' +
      '<div style="${ring}">\\u2713</div>' +
      '<p class="ls-part-label" style="letter-spacing:.14em;">LESSON COMPLETE</p>' +
      '<p style="color:#fff;font:600 1.7rem Cormorant Garamond,Georgia,serif;margin:6px 0 24px;">Bravo ! Well done.</p>' +
      '<button class="ls-btn ls-btn-primary" id="lsBackBtn" style="${gold}">Back to lessons</button>' +
      '<button class="ls-btn" id="lsRedoBtn" style="${ghost}">Redo lesson</button>' +
      '</div>'`;
en = en.replace(E1, () => card);
en = en.replace(/(markLessonComplete\(\);\s*render\([\s\S]*?\n    \);)/, (m) => m + "\n    setTimeout(function(){var b=document.getElementById('lsBackBtn'),r=document.getElementById('lsRedoBtn');if(b)b.onclick=function(){location.href='./';};if(r)r.onclick=function(){try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('psL1:')===0)localStorage.removeItem(k);});}catch(e){}location.reload();};},0);");
ui = ui.replace(U1, () => `<div class="pc-bot"><button type="button" class="pc-go pc-back">Back to lessons</button><button type="button" class="pc-redo-l" style="${ghost}">Redo lesson</button></div>');`);
ui = ui.replace(U2, () => U2 + "var rl=p.querySelector('.pc-redo-l');if(rl)rl.onclick=function(){l1Write(0);window.__psIntroUsed=1;l1Show(0,ctx);};");
fs.writeFileSync(uiF, ui);
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (m, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv of fs.readdirSync(base)) { const d = path.join(base, lv); if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (m, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: new lesson-complete screen with Redo. Pages updated: " + n);
