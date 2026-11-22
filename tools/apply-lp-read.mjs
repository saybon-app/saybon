// Les Petits reading lessons 13, 19, 25: switches each one on ONLY when all its audio exists. Safe to run again. Run from the project root.
import fs from "fs"; import path from "path";
const root = process.cwd(), aud = path.join(root, "public", "assets", "audio", "lp"), dir = path.join(root, "public", "levels", "A0", "les-petits");
const man = JSON.parse(fs.readFileSync(path.join(root, "tools", "audio", "lp-read-manifest.json"), "utf8")).man;
const shared = man.filter(m => m.name.startsWith("readlp_")).map(m => m.name);
const has = n => { try { return fs.statSync(path.join(aud, n + ".mp3")).size > 1000; } catch (e) { return false; } };
const sharedMiss = shared.filter(n => !has(n));
let on = [], wait = [];
for (const N of [13, 19, 25]) {
  const mine = man.filter(m => m.name.startsWith("read" + N + "_")).map(m => m.name), miss = mine.filter(n => !has(n)).concat(sharedMiss);
  const p = path.join(dir, "lesson" + N + ".html"); if (!fs.existsSync(p)) { console.log("missing " + p); continue; }
  if (miss.length) { wait.push(N + " (" + miss.length + " files)"); continue; }
  let s = fs.readFileSync(p, "utf8"); const t = s.replace(/<script type="module" src="(lesson-engine|reading-lp)\.js\?v=\d+"><\/script>/, '<script type="module" src="reading-lp.js?v=1"></script>');
  if (t !== s) fs.writeFileSync(p, t); on.push(N);
}
console.log("Les Petits reading lessons live: " + (on.length ? on.join(", ") : "none yet") + (wait.length ? "  | waiting on audio: " + wait.join(", ") : ""));
