// Lesson 1 A1-C2: back-and-forth dialogue (answer + ask back), per-answer gaps, A1 "Et toi ?" steps. Needs apply-upper3. .bak9 backup.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8");
const m = ui.match(/var UCFG=(\{.*?\});\nfunction U\(\)/s);
if (!m) { console.log("STOP: run apply-upper3 first (cannot find the lesson 1 settings)."); process.exit(1); }
const cfg = JSON.parse(m[1]);
const DD = {"A1-1": [["Je m'appelle Lucas.", "Je m'appelle Lucas…"], ["Et toi, comment tu t'appelles ?", "Et toi…"], ["J'ai vingt-cinq ans.", "J'ai vingt-cinq ans…"], ["Et toi, tu as quel âge ?", "Et toi…"], ["J'habite à Lyon.", "J'habite à Lyon…"], ["Et toi, où est-ce que tu habites ?", "Et toi…"]], "A2-1": [["Je suis allé au marché.", "Je suis allé au marché…"], ["Et toi, tu es allé où ?", "Et toi…"], ["Je suis rentré à six heures.", "Je suis rentré à six heures…"], ["Et toi, tu es rentré à quelle heure ?", "Et toi…"]], "B1-1": [["D'abord, je me suis levé tard. Ensuite, j'ai préparé le déjeuner. Enfin, nous sommes sortis.", "D'abord…"], ["Et vous, qu'avez-vous fait ce week-end ?", "Et vous…"], ["D'abord, j'ai dîné. Ensuite, j'ai regardé un film. Enfin, je me suis couché.", "D'abord…"], ["Et vous, qu'avez-vous fait hier soir ?", "Et vous…"]], "B2-1": [["Selon moi, c'est une bonne chose. D'une part, on gagne du temps. D'autre part, on est plus autonome.", "Selon moi…"], ["Et vous, qu'en pensez-vous ?", "Et vous…"], ["Selon moi, il faut les limiter. D'abord pour la concentration, ensuite pour le respect.", "Selon moi…"], ["Et vous, qu'en pensez-vous ?", "Et vous…"]], "C1-1": [["Le film dont je vous parle, que j'ai vu hier, m'a profondément marqué.", "Le film dont je vous parle…"], ["Et vous, quel film vous a marqué ?", "Et vous…"], ["Le livre dont tout le monde parle, que j'ai enfin lu, m'a ému.", "Le livre dont tout le monde parle…"], ["Et vous, quel livre avez-vous aimé ?", "Et vous…"]], "C2-1": [["Je me permets de nuancer : ce rapport manque de rigueur.", "Je me permets de nuancer : ce rapport manque de rigueur…"], ["Et vous, comment le diriez-vous ?", "Et vous…"], ["Je ne partage pas tout à fait votre point de vue.", "Je ne partage pas tout à fait votre point de vue…"], ["Et vous, comment le diriez-vous ?", "Et vous…"]]};
for (const k in DD) { if (!cfg[k]) { console.log("STOP: missing " + k); process.exit(1); } cfg[k].dd = DD[k]; }
const A1 = ["Je m'appelle Lucas. Et toi ?", "J'ai vingt-cinq ans. Et toi ?", "J'habite \u00e0 Lyon. Et toi ?", "Je suis \u00e9tudiant. Et toi ?"];
cfg["A1-1"].steps.forEach((s, i) => s.t = A1[i]);
fs.writeFileSync(uiF + ".bak9", ui);
ui = ui.replace(m[0], () => "var UCFG=" + JSON.stringify(cfg) + ";\nfunction U()");
fs.writeFileSync(uiF, ui);
let en = fs.readFileSync(enF, "utf8");
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv of ["A1","A2","B1","B2","C1","C2"]) { const d = path.join(base, lv); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (x, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: back-and-forth dialogue settings applied. Pages updated: " + n);
