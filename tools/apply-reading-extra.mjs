// Reading lessons 12, 18, 24 for A1-C2. A lesson is switched on only when ALL its audio exists. Safe to run again. Run from the project root.
import fs from "fs"; import path from "path";
const root = process.cwd(), lv = path.join(root, "public", "levels"), aud = path.join(root, "public", "assets", "audio", "lessons");
const extra = JSON.parse(fs.readFileSync(path.join(root, "tools", "read-extra.json"), "utf8"));
const dataF = path.join(lv, "reading-data.json"); let data = {}; try { data = JSON.parse(fs.readFileSync(dataF, "utf8")); } catch { console.log("STOP: reading-data.json not found"); process.exit(1); }
const has = n => fs.existsSync(path.join(aud, n + ".mp3"));
const live = [], wait = [];
for (const [key, e] of Object.entries(extra)) {
  const names = [e.intro]; if (e.passages) e.passages.forEach(p => { names.push(p.audio); p.sents.forEach(s => names.push(s.a)); }); else e.sents.forEach(s => names.push(s.a));
  if (names.every(has)) { data[key] = e; live.push(key); } else wait.push(key + "(" + names.filter(n => !has(n)).length + ")");
}
let pages = 0;
if (live.length) {
  fs.writeFileSync(dataF, JSON.stringify(data));
  for (const key of live) {
    const [l, n] = key.split("-"), L = l.toUpperCase(), src = path.join(lv, L, "lesson6.html"), out = path.join(lv, L, `lesson${n}.html`);
    if (!fs.existsSync(src)) { console.log("missing " + src); continue; }
    const s = fs.readFileSync(src, "utf8").replace("Lesson 6 - ", `Lesson ${n} - `);
    if (!fs.existsSync(out) || fs.readFileSync(out, "utf8") !== s) { fs.writeFileSync(out, s); pages++; }
  }
}
console.log("Reading lessons live: " + (live.length ? live.join(", ") : "none yet") + (wait.length ? "  | waiting on audio: " + wait.join(", ") : ""));
