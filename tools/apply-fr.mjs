// French-only on-screen text for B1-C2 + audio cache bump. Usage: node apply-fr.mjs <levelsDir>
import fs from "fs"; import path from "path";
const base = process.argv[2] || "public/levels";
const enF = path.join(base, "lesson-engine-tp.js"), uiF = path.join(base, "scene-paris", "scene-ui.js");
let ui = fs.readFileSync(uiF, "utf8"); fs.writeFileSync(uiF + ".bakFR", ui);
const n0 = ui.length;
ui = ui.replace(/(U\(\)\.(?:dlg|intro)\+'\.mp3\?v=)\d+/g, "$12").replace(/(U\(\)\.steps\[L1i\]\.a\+'\.mp3\?v=)\d+/g, "$12").replace(/(c\.dlg\+'\.json\?v=)\d+/g, "$12");
if (!ui.includes("/*FRUI*/")) {
  ui += `\n/*FRUI*/(function(){try{var lv=String(((window.__psMeta||{}).level)||'').toUpperCase();if(!/^(B1|B2|C1|C2)$/.test(lv))return;
var X=[[/^Record again$/,'Réenregistrer'],[/^Recording\\.\\.\\.$/,'Enregistrement…'],[/^Record$/,'Enregistrer'],[/^Stop$/,'Arrêter'],[/^Scoring\\.\\.\\.$/,'Évaluation…'],[/^Try again$/,'Réessayer'],[/^Replay recording$/,"Réécouter mon enregistrement"],[/^Replay$/,'Réécouter'],[/^Hear the teacher again$/,'Réécouter la professeure'],[/^Teacher$/,'Professeure'],[/^Listen$/,'Écoutez'],[/^Next\\b/,'Suivant'],[/^Submit\\b/,'Envoyer'],[/^Your turn!$/,'À vous !'],[/^Lesson complete$/,'Leçon terminée'],[/^Well done[.!]*$/,'Bien joué !'],[/^Redo lesson$/,'Refaire la leçon'],[/^Back to lessons$/i,'Retour aux leçons'],[/^You finished /,'Vous avez terminé '],[/^Headphones work best$/,'Un casque est recommandé'],[/^Audio unavailable$/,'Audio indisponible'],[/^Microphone blocked$/,'Micro bloqué'],[/^Could not score( that)?\\. Try again\\.$/,"Évaluation impossible. Réessayez."],[/^Listen, then say it with me!$/,'Écoutez, puis dites-le avec moi !'],[/^Listen, then say it!$/,'Écoutez, puis dites-le !'],[/^Listen carefully\\.$/,'Écoutez bien.'],[/^Listen to the teacher, then answer\\.$/,'Écoutez la professeure, puis répondez.'],[/^Listen attentively, and repeat when prompted\\.$/,'Écoutez bien, et répétez quand on vous le demande.'],[/^Conversation$/,'Conversation']];
function fx(s){var t=s.trim();if(!t)return s;for(var i=0;i<X.length;i++){if(X[i][0].test(t))return s.replace(t,t.replace(X[i][0],X[i][1]))}return s}
function walk(n){if(n.nodeType===3){var v=fx(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}if(n.nodeType!==1||/^(SCRIPT|STYLE)$/.test(n.tagName))return;['title','aria-label','placeholder'].forEach(function(a){var x=n.getAttribute&&n.getAttribute(a);if(x){var y=fx(x);if(y!==x)n.setAttribute(a,y)}});for(var c=n.firstChild;c;c=c.nextSibling)walk(c)}
var busy=0;var mo=new MutationObserver(function(){if(busy)return;busy=1;try{walk(document.body)}finally{busy=0}});
function go(){walk(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.body)go();else document.addEventListener('DOMContentLoaded',go)}catch(e){}})();
`;
}
fs.writeFileSync(uiF, ui);
let en = fs.readFileSync(enF, "utf8");
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv of ["A1","A2","B1","B2","C1","C2"]) { const d = path.join(base, lv); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (x, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: French UI for B1-C2, audio cache bumped. Pages updated: " + n);
