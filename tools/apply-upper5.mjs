// Lesson 1 A1-C2: add the back-and-forth practice part (2 teach/repeat/record steps) after the four phrases. Needs apply-upper3/4. .bakA backup.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "C:/SayBon/public/levels";
const uiF = path.join(base, "scene-paris", "scene-ui.js"), enF = path.join(base, "lesson-engine-tp.js");
let ui = fs.readFileSync(uiF, "utf8");
const m = ui.match(/var UCFG=(\{.*?\});\nfunction U\(\)/s);
if (!m) { console.log("STOP: run apply-upper3 first."); process.exit(1); }
const cfg = JSON.parse(m[1]);
const QA = {"A1-1": [{"a": "L1_a1_q1", "t": "Je m'appelle Lucas. Et toi, comment tu t'appelles ?"}, {"a": "L1_a1_q2", "t": "J'ai vingt-cinq ans. Et toi, tu as quel âge ?"}], "A2-1": [{"a": "L1_a2_q1", "t": "Je suis allé au marché. Et toi, tu es allé où ?"}, {"a": "L1_a2_q2", "t": "Je suis rentré à six heures. Et toi, tu es rentré à quelle heure ?"}], "B1-1": [{"a": "L1_b1_q1", "t": "D'abord, je me suis levé tard. Ensuite, j'ai préparé le déjeuner. Et vous, qu'avez-vous fait ?"}, {"a": "L1_b1_q2", "t": "D'abord, j'ai dîné. Ensuite, j'ai regardé un film. Et vous, qu'avez-vous fait ?"}], "B2-1": [{"a": "L1_b2_q1", "t": "Selon moi, c'est une bonne chose. Et vous, qu'en pensez-vous ?"}, {"a": "L1_b2_q2", "t": "Selon moi, il faut les limiter. Et vous, qu'en pensez-vous ?"}], "C1-1": [{"a": "L1_c1_q1", "t": "Le film dont je vous parle m'a profondément marqué. Et vous, quel film vous a marqué ?"}, {"a": "L1_c1_q2", "t": "Le livre dont tout le monde parle m'a ému. Et vous, quel livre avez-vous aimé ?"}], "C2-1": [{"a": "L1_c2_q1", "t": "Je me permets de nuancer : ce rapport manque de rigueur. Et vous, comment le diriez-vous ?"}, {"a": "L1_c2_q2", "t": "Je ne partage pas tout à fait votre point de vue. Et vous, comment le diriez-vous ?"}]};
for (const k in QA) { if (!cfg[k]) { console.log("STOP: missing " + k); process.exit(1); }
  if (cfg[k].steps.some(s => /_q\d$/.test(s.a))) { console.log("Already applied."); process.exit(0); }
  cfg[k].steps = cfg[k].steps.slice(0, 4).concat(QA[k]); }
fs.writeFileSync(uiF + ".bakA", ui);
ui = ui.replace(m[0], () => "var UCFG=" + JSON.stringify(cfg) + ";\nfunction U()");
fs.writeFileSync(uiF, ui);
let en = fs.readFileSync(enF, "utf8");
fs.writeFileSync(enF, en.replace(/scene-ui\.js\?v=(\d+)/, (x, v) => "scene-ui.js?v=" + (+v + 1)));
let n = 0;
for (const lv of ["A1","A2","B1","B2","C1","C2"]) { const d = path.join(base, lv); if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (/^lesson\d+\.html$/.test(f)) { const p = path.join(d, f), s = fs.readFileSync(p, "utf8"), t = s.replace(/lesson-engine-tp\.js\?v=(\d+)/, (x, v) => "lesson-engine-tp.js?v=" + (+v + 1)); if (t !== s) { fs.writeFileSync(p, t); n++; } } }
console.log("Done: back-and-forth practice part added. Pages updated: " + n);
