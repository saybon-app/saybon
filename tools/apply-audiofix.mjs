// A0/lesson audio fix: (1) a tap that starts a blocked intro no longer pauses it again, (2) a clear "Tap to hear the teacher" button-style hint.
// Usage: node apply-audiofix.mjs <levelsDir>. Safe to run twice. Keeps a .bakAF backup.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const f = path.join(base, "scene-paris", "scene-ui.js");
let s = fs.readFileSync(f, "utf8");
if (s.includes("/*AF*/")) { console.log("Already applied."); process.exit(0); }
const miss = [];
const kicks = (s.match(/var kick2?=function\(\)\{/g) || []).length;
if (kicks < 4) miss.push("kick handlers (found " + kicks + ")");
const tog = "btn.onclick=function(){if(media.paused){try{if(media.ended)media.currentTime=0;}catch(e){}var q=media.play();";
if (!s.includes(tog)) miss.push("intro button toggle");
if (!s.includes("'tap to listen'")) miss.push("hint text");
if (miss.length) { console.log("STOP, cannot find: " + miss.join(" | ")); process.exit(1); }
fs.writeFileSync(f + ".bakAF", s);
s = s.replace(/var kick(2?)=function\(\)\{/g, (x, n) => "var kick" + n + "=function(){window.__psKickAt=Date.now();");
s = s.replace(tog, "btn.onclick=function(){if(Date.now()-(window.__psKickAt||0)<800)return;if(media.paused){try{if(media.ended)media.currentTime=0;}catch(e){}var q=media.play();");
s = s.split("'tap to listen'").join("'Tap to hear the teacher'");
const css = "/*AF*/(function(){try{var st=document.createElement('style');st.textContent='.pc-hint{display:inline-block!important;margin:10px auto 0!important;padding:9px 18px!important;border-radius:999px!important;background:rgba(255,214,140,.95)!important;color:#3a2410!important;font:700 15px/1.2 Poppins,Manrope,sans-serif!important;letter-spacing:.02em!important;text-transform:none!important;opacity:1!important;box-shadow:0 4px 14px rgba(0,0,0,.25)!important;animation:afPulse 1.4s ease-in-out infinite}@keyframes afPulse{50%{transform:scale(1.06)}}';document.head.appendChild(st);}catch(e){}})();\n";
fs.writeFileSync(f, css + s);
// cache-bust scene-ui
const e = path.join(base, "lesson-engine-tp.js"); let en = fs.readFileSync(e, "utf8");
fs.writeFileSync(e + ".bakAF", en); fs.writeFileSync(e, en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1)));
console.log("Done: audio fix applied (" + kicks + " tap handlers, hint made visible).");
