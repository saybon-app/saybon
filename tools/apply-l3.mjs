// Restores Tout Public lesson 3 (and the "own name is not marked wrong" scoring, and Les Petits cache-busting) that this scene-ui.js had lost. Run AFTER apply-upper3. .bakC backup.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js");
let ui = fs.readFileSync(uiF, "utf8");
if (ui.includes("var L3W=")) { console.log("Already applied."); process.exit(0); }
const R = [];
const bad = [];
function S(name, a, b, count = 1) { const n = ui.split(a).length - 1; if (n !== count) bad.push(name + "(" + n + ")"); else R.push([a, b]); }
S("pickScoreL", "function decode16(", `/* lesson 2 and 3: words the learner adds (their own name) must not count against them - score only the reference words */
function pickScoreL(d){
 if((lessonNo()===2||lessonNo()===3)&&d&&d.wordFeedback&&d.wordFeedback.length){
  var w=d.wordFeedback.filter(function(x){return x&&x.errorType!=='Insertion';});
  if(w.length){var t=0;w.forEach(function(x){t+=(typeof x.accuracyScore==='number'&&x.errorType!=='Omission')?x.accuracyScore:0;});return t/w.length;}
 }
 return pickScore(d);
}
function decode16(`);
S("L3 data", "function DW(){", `var L3W=[[2.96,5.86],[6.44,8.90],[12.74,14.96],[19.00,20.68],[21.14,23.58]];
var L3D=[['Bonjour.','Bonjour\\u2026'],['\\u00c7a va bien.','\\u00c7a va bien\\u2026'],["Je m'appelle.",'Je m\\u2019appelle\\u2026'],['Au revoir.','Au revoir\\u2026'],['\\u00c0 bient\\u00f4t.','\\u00c0 bient\\u00f4t\\u2026']];
var L3P=["Comment \\u00e7a va ?","\\u00c7a va. \\u00c7a va bien. \\u00c7a va tr\\u00e8s bien."];
function DW(){`);
S("DW", "lessonNo()===2?L2W:L1W", "lessonNo()===3?L3W:lessonNo()===2?L2W:L1W");
S("DD", "lessonNo()===2?L2D:L1D", "lessonNo()===3?L3D:lessonNo()===2?L2D:L1D");
S("dlgUrl", "return lessonNo()===2?'/assets/audio/A0_TP_L2_dialogue.mp3?v=':", "return lessonNo()===3?'/assets/audio/A0_TP_L3_dialogue.mp3?v=1':lessonNo()===2?'/assets/audio/A0_TP_L2_dialogue.mp3?v=':");
S("dlgIdx", "lessonNo()===2?L2P.length:5", "lessonNo()===3?3:lessonNo()===2?L2P.length:5");
S("isL1", "m.lesson===1||m.lesson===2)", "m.lesson===1||m.lesson===2||m.lesson===3)");
S("introUrl", "return lessonNo()===2?'/assets/audio/A0_TP_L2_intro.mp3?v=':", "return lessonNo()===3?'/assets/audio/A0_TP_L3_intro.mp3?v=1':lessonNo()===2?'/assets/audio/A0_TP_L2_intro.mp3?v=':");
S("lastStep", "return lessonNo()===2?L2P.length+1:6;", "return lessonNo()===3?4:lessonNo()===2?L2P.length+1:6;");
S("l1Show", " var b=lessonNo()===2?(i<L2P.length?", " if(lessonNo()===3&&i===2){window.__psListen={url:'/assets/audio/A0_TP_L3_dialogue_intro.mp3?v=1',next:3};window.__psSkipIntro=0;window.__psUI(9000+i,[{type:'text',text:' '}],ctx);return;}\n var b=lessonNo()===3?(i<2?[{type:'text',recordPrompt:true,expectedText:L3P[i],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}]):lessonNo()===2?(i<L2P.length?");
S("finish", "lessonNo()===2?'You finished Je m\\u2019appelle'", "lessonNo()===3?'You finished Comment \\u00e7a va ?':lessonNo()===2?'You finished Je m\\u2019appelle'");
S("title", "lessonNo()===2?'Phrase cinq'", "lessonNo()===3?'Phrase trois':lessonNo()===2?'Phrase cinq'");
S("phrase audio", "'/assets/audio/A0_TP_L'+(lessonNo()===2?2:1)+'_phrase'", "'/assets/audio/A0_TP_L'+lessonNo()+'_phrase'");
S("rec limit", "lessonNo()===2?14000:9000", "lessonNo()>=2?14000:9000");
S("listen", "if(ovr)window.__psAdv=function(){l1Show(", "var lis=window.__psListen||null;if(lis){window.__psListen=null;url=lis.url;video=null;window.__psAdv=function(){l1Show(lis.next,ctx);};}\n  if(ovr)window.__psAdv=function(){l1Show(");
S("listen more", "if(ovr)l1Show(", "if(lis)l1Show(lis.next,ctx);else if(ovr)l1Show(");
S("score dlg", "var r=pickScore(j);", "var r=pickScoreL(j);");
S("score kids", "raw=quiet?0:pickScore(d||{})", "raw=quiet?0:pickScoreL(d||{})");
S("lp json", "fetch(dn+'.json?v=')", "fetch(dn+'.json?v=5')");
S("lp mp3", "media.src=dn+'.mp3?v='", "media.src=dn+'.mp3?v=5'");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
fs.writeFileSync(uiF + ".bakC", ui);
for (const [a, b] of R) ui = ui.replace(a, () => b);
fs.writeFileSync(uiF, ui);
const enF = path.join(base, "lesson-engine-tp.js");
try { const en = fs.readFileSync(enF, "utf8"); fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1))); } catch {}
let n = 0;
for (const lv of fs.readdirSync(base)) { const d = path.join(base, lv); if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (x, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: Tout Public lesson 3 restored. Pages updated: " + n);
