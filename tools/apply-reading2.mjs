// Installs reading engine v2 and busts the cache on the reading pages. Usage: node apply-reading2.mjs <levelsDir>
import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), base = process.argv[2] || "public/levels";
fs.copyFileSync(path.join(here, "reading-engine.js"), path.join(base, "reading-engine.js"));
let n = 0;
for (const lv of ["A1", "A2", "B1", "B2", "C1", "C2"]) {
  const f = path.join(base, lv, "lesson6.html"); if (!fs.existsSync(f)) { console.log("missing " + f); process.exit(1); }
  let s = fs.readFileSync(f, "utf8"); if (!/reading-engine\.js/.test(s)) { console.log(f + " is not a reading page"); process.exit(1); }
  s = s.replace(/reading-engine\.js\?v=\d+/, "reading-engine.js?v=10"); fs.writeFileSync(f, s); n++;
}
console.log("Done: reading engine v2 installed on " + n + " levels");
