// Makes the pronunciation server return sound-by-sound detail (phonemes + word timings) for specific feedback.
// Finds the server file that holds /api/assessPronunciation under C:\SayBon and patches it. Safe to run twice.
import fs from "fs"; import path from "path";
const root = process.argv[2] || "C:\\SayBon";
function find(dir, depth) {
  if (depth > 3) return null;
  for (const n of fs.readdirSync(dir)) {
    if (/^(node_modules|\.git|_QUARANTINE|_ARCHIVE|public|dumps)/.test(n)) continue;
    const f = path.join(dir, n), st = fs.statSync(f);
    if (st.isDirectory()) { const r = find(f, depth + 1); if (r) return r; }
    else if (/\.js$/.test(n) && st.size < 3e6) { const t = fs.readFileSync(f, "utf8"); if (t.includes("/api/assessPronunciation") && t.includes("Pronunciation-Assessment")) return f; }
  }
  return null;
}
const f = find(root, 0);
if (!f) { console.log("STOP: could not find the server file with /api/assessPronunciation under " + root); process.exit(1); }
let s = fs.readFileSync(f, "utf8");
if (s.includes("/*detail-v1*/")) { console.log("Already patched: " + f); process.exit(0); }
fs.writeFileSync(f + ".bakDetail", s);
const g = /Granularity:\s*"Word"/;
if (!g.test(s)) { console.log("STOP: Granularity line not found in " + f); process.exit(1); }
s = s.replace(g, 'Granularity: "Phoneme",\nPhonemeAlphabet: "IPA"');
const m = /res\.json\(\{\s*\n?\s*recognizedText:/;
if (!m.test(s)) { console.log("STOP: response block not found in " + f); process.exit(1); }
s = s.replace(m, (x) => x.replace("recognizedText:", "detail: (best.Words || []), /*detail-v1*/\nrecognizedText:"));
fs.writeFileSync(f, s);
console.log("Patched: " + f + "  (backup: " + path.basename(f) + ".bakDetail)");
