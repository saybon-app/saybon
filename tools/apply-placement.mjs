import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const root = process.argv[2] || "C:\\SayBon";
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, "..", "public");
let n = 0;
function copy(rel) { const from = path.join(src, rel), to = path.join(root, "public", rel); fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(from, to); n++; }
function walk(d, base = "") { for (const e of fs.readdirSync(path.join(src, d, base), { withFileTypes: true })) { const r = path.join(base, e.name); e.isDirectory() ? walk(d, r) : copy(path.join(d, r)); } }
walk("placement"); walk(path.join("assets", "images", "placement"));
console.log("copied", n, "files. New placement test is in public/placement/index.html (old test.html and placement.js are untouched).");
