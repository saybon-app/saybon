// Installs the reading lesson engine + data and (re)writes lesson6.html for A1-C2. Usage: node apply-reading.mjs <levelsDir>
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), base = process.argv[2] || "public/levels";
fs.copyFileSync(path.join(here, "reading-engine.js"), path.join(base, "reading-engine.js"));
const dataF = path.join(base, "reading-data.json"); let data = {};
try { data = JSON.parse(fs.readFileSync(dataF, "utf8")); } catch {}
Object.assign(data, JSON.parse(fs.readFileSync(path.join(here, "read6.json"), "utf8")));
fs.writeFileSync(dataF, JSON.stringify(data));
let made = 0;
for (const lv of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
  const d = path.join(base, lv), l1 = path.join(d, "lesson1.html"); if (!fs.existsSync(l1)) { console.log("missing " + l1); process.exit(1); }
  const out = path.join(d, "lesson6.html"); if (fs.existsSync(out) && !fs.existsSync(out + ".bakR")) fs.copyFileSync(out, out + ".bakR");
  let s = fs.readFileSync(l1, "utf8");
  s = s.replace(/<script type="module" src="\/levels\/lesson-engine-tp\.js[^"]*"><\/script>/, '<script type="module" src="/levels/reading-engine.js?v=1"></script>').replace(/Lesson 1 - /, "Lesson 6 - ");
  if (!s.includes("reading-engine.js")) { console.log("could not wire " + l1); process.exit(1); }
  fs.writeFileSync(out, s); made++;
}
console.log("Done: reading lesson 6 wired for " + made + " levels");
