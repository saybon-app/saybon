// Lesson 1 of A1-C2 -> Tout Public flow: intro, 4 teach/repeat/record steps (graded), final automatic dialogue. Anchored, .bak6 backups.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8");
if (ui.includes("UCFG=")) { console.log("Already applied."); process.exit(0); }
const CFG = {
 "A1-1": { intro:"L1_a1_intro", n:4, dlg:"L1_a1_dlg", fin:"Lesson 1", dd:[["Je m'appelle\u2026","Je m\u2019appelle\u2026"],["J'ai\u2026 ans.","J\u2019ai\u2026 ans"],["J'habite \u00e0\u2026","J\u2019habite \u00e0\u2026"],["Je suis\u2026","Je suis\u2026"]] },
 "A2-1": { intro:"L1_a2_intro", n:4, dlg:"L1_a2_dlg", fin:"Lesson 1", dd:[["Je suis all\u00e9 au\u2026","Je suis all\u00e9\u2026"],["Je suis rentr\u00e9 \u00e0\u2026","Je suis rentr\u00e9\u2026"],["Oui, il est venu avec moi.","Il est venu\u2026"]] },
 "B1-1": { intro:"L1_b1_intro", n:4, dlg:"L1_b1_dlg", fin:"Lesson 1", dd:[["D'abord, ensuite, puis, enfin.","D\u2019abord, ensuite, puis, enfin\u2026"],["Dimanche, d'abord, ensuite, enfin.","Dimanche\u2026"]] },
 "B2-1": { intro:"L1_b2_intro", n:4, dlg:"L1_b2_dlg", fin:"Lesson 1", dd:[["Selon moi, d'une part, d'autre part, en conclusion.","Selon moi\u2026"],["Selon moi, d'une part, d'autre part, en conclusion.","Selon moi\u2026"]] },
 "C1-1": { intro:"L1_c1_intro", n:4, dlg:"L1_c1_dlg", fin:"Lesson 1", dd:[["Le film dont je vous ai parl\u00e9, que j'ai vu, m'a marqu\u00e9.","Dont\u2026 que\u2026"],["Le livre dont je vous ai parl\u00e9, que j'ai lu, m'a marqu\u00e9.","Dont\u2026 que\u2026"]] },
 "C2-1": { intro:"L1_c2_intro", n:4, dlg:"L1_c2_dlg", fin:"Lesson 1", dd:[["Je crains que ce rapport ne soit pas \u00e0 la hauteur.","Reformulez\u2026"],["Je ne partage pas tout \u00e0 fait votre avis.","Reformulez\u2026"]] },
};
const PH = {
 "A1-1":["Je m'appelle Lucas.","J'ai vingt-cinq ans.","J'habite \u00e0 Lyon.","Je suis \u00e9tudiant."],
 "A2-1":["Je suis all\u00e9 au march\u00e9.","Elle est arriv\u00e9e hier.","Nous sommes partis ensemble.","Je suis rentr\u00e9 \u00e0 la maison."],
 "B1-1":["D'abord, je me suis lev\u00e9 tard.","Ensuite, j'ai pr\u00e9par\u00e9 le d\u00e9jeuner.","Puis mes amis sont arriv\u00e9s.","Enfin, nous sommes sortis ensemble."],
 "B2-1":["Selon moi, le t\u00e9l\u00e9travail est une bonne chose.","D'une part, il fait gagner du temps.","D'autre part, il favorise l'autonomie.","En conclusion, il faut l'encourager."],
 "C1-1":["Le livre dont je vous ai parl\u00e9 m'a profond\u00e9ment marqu\u00e9.","Le livre, que j'ai enfin termin\u00e9, m'a profond\u00e9ment marqu\u00e9.","Le livre dont je vous ai parl\u00e9, que j'ai enfin termin\u00e9, m'a profond\u00e9ment marqu\u00e9.","Le film dont tout le monde parle, que j'ai vu hier, m'a \u00e9mu."],
 "C2-1":["Je me permets de nuancer votre propos.","Il me serait agr\u00e9able de pouvoir vous rencontrer.","Permettez-moi de vous faire remarquer que ce rapport manque de rigueur.","Je ne partage pas tout \u00e0 fait votre point de vue."]};
const steps = k => [1,2,3,4].map(i => ({ a: CFG[k].intro.replace("_intro", "_s" + i), t: PH[k][i-1] }));
for (const k in CFG) CFG[k].steps = steps(k);
const bad = [], rep = [];
function R(name, a, b) { if (ui.split(a).length !== 2) bad.push(name); else rep.push([a, b]); }
R("var chain", "var L1P=", "var UCFG=" + JSON.stringify(CFG) + ";\nfunction U(){var m=window.__psMeta||{};var c=UCFG[(m.level||'')+'-'+m.lesson];if(c&&!c._ld){c._ld=1;try{fetch('/assets/audio/lessons/'+c.dlg+'.json?v=1').then(function(r){return r.json();}).then(function(j){c.gaps=j.gaps;}).catch(function(){c._ld=0;});}catch(e){c._ld=0;}}return c||null;}\nvar L1P=");
R("DW", "function DW(){return lessonNo()===3", "function DW(){if(U())return U().gaps||[];return lessonNo()===3");
R("DD", "function DD(){return lessonNo()===3", "function DD(){if(U())return U().dd;return lessonNo()===3");
R("dlgUrl", "function dlgUrl(){return lessonNo()===3", "function dlgUrl(){if(U())return '/assets/audio/lessons/'+U().dlg+'.mp3?v=1';return lessonNo()===3");
R("dlgIdx", "function dlgIdx(){return lessonNo()===3", "function dlgIdx(){if(U())return U().steps.length;return lessonNo()===3");
R("l1Key", "return 'psL1:'+(window.lsCurrentUid||'anon')+':'+((window.__psMeta||{}).lesson||'');", "return 'psL1:'+(window.lsCurrentUid||'anon')+':'+(U()?((window.__psMeta||{}).level||'')+'-':'')+((window.__psMeta||{}).lesson||'');");
R("isL1", "return m.level==='A0'&&(m.lesson===1", "return !!U()||m.level==='A0'&&(m.lesson===1");
R("introUrl", "function introUrl(){return lessonNo()===3", "function introUrl(){if(U())return '/assets/audio/lessons/'+U().intro+'.mp3?v=1';return lessonNo()===3");
R("lastStep", "function lastStep(){return lessonNo()===3", "function lastStep(){if(U())return U().steps.length+1;return lessonNo()===3");
R("l1Show", " if(i>=lastStep()){l1Finish(ctx);return;}\n", " if(i>=lastStep()){l1Finish(ctx);return;}\n if(U()){var uc=U();if(i>=uc.steps.length&&!uc.gaps){T(function(){l1Show(i,ctx);},250);return;}window.__psUI(9000+i,[i<uc.steps.length?{type:'text',recordPrompt:true,expectedText:'',_l1:i}:{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}],ctx);return;}\n");
R("dlg title", "(lessonNo()===3?'Phrase trois':", "(U()?'Phrase '+FR[U().steps.length]:lessonNo()===3?'Phrase trois':");
R("finish", "(lessonNo()===3?'You finished Comment", "(U()?'You finished '+U().fin:lessonNo()===3?'You finished Comment");
R("step audio", "('/assets/audio/A0_TP_L'+lessonNo()+'_phrase'+(L1i+1)+'.mp3?v=5')", "(U()?'/assets/audio/lessons/'+U().steps[L1i].a+'.mp3?v=1':'/assets/audio/A0_TP_L'+lessonNo()+'_phrase'+(L1i+1)+'.mp3?v=5')");
R("more delay", "else window.lsGoNext();},400);}", "else window.lsGoNext();},30);}");
R("intro adv", "if(ovr)window.__psAdv=function(){l1Show(0,ctx);};", "if(ovr)window.__psAdv=function(){l1Show(U()?Math.min(l1Read(),lastStep()-1):0,ctx);};");
R("intro more", "else if(ovr)l1Show(0,ctx);else window.lsGoNext()", "else if(ovr)l1Show(U()?Math.min(l1Read(),lastStep()-1):0,ctx);else window.lsGoNext()");
// expected text for steps comes from the step script text
R("exp", "var expected=pb.expectedText||'';", "var expected=pb.expectedText||'';if(pb._l1!==undefined&&!pb._dlgAll&&U()){expected=U().steps[pb._l1].t||'';}");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
fs.writeFileSync(uiF + ".bak6", ui);
for (const [a, b] of rep) ui = ui.replace(a, () => b);
// kill the old drill mapping for lesson 1 of A1-C2
ui = ui.replace(/UDR=\{[^}]*\},UINTRO=\{[^}]*\}/, "UDR={},UINTRO={}");
fs.writeFileSync(uiF, ui);
let en = fs.readFileSync(enF, "utf8"); fs.writeFileSync(enF + ".bak6", en);
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (m, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv of ["A1","A2","B1","B2","C1","C2"]) { const d = path.join(base, lv); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (m, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: lesson 1 of A1-C2 now follows the Tout Public flow. Pages updated: " + n);
