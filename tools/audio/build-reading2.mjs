// Builds the 8 short teacher cues for the new reading lessons. Credit-safe, resumable. Usage: node build-reading2.mjs <audioOutDir>
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), d = process.argv[2];
fs.mkdirSync(d, { recursive: true });
const sleep = (s) => spawnSync("node", ["-e", `setTimeout(()=>{},${s * 1000})`]);
for (const f of fs.readdirSync(path.join(here, "scripts"))) {
  const m = /^(R2_(en|fr)_\w+)\.txt$/.exec(f); if (!m || fs.existsSync(path.join(d, m[1] + ".mp3"))) continue;
  let r; for (let k = 1; k <= 8; k++) { r = spawnSync("node", ["make-audio.mjs", "--level", m[2] === "en" ? "a1" : "b1", "--lesson", "6", "--name", m[1], "--script", `scripts/${f}`, "--outdir", d], { cwd: here, stdio: "inherit" }); if (r.status === 0 || r.status === 42) break; console.log(`\nNetwork error - retry ${k}/8 in 10s...`); sleep(10); }
  if (r.status === 42) { console.log("\nSTOPPED: out of credits. Top up, run the same block again."); process.exit(42); }
  if (r.status !== 0) { console.log("\nFAILED: " + f); process.exit(1); }
}
console.log("\nREADING CUES COMPLETE");
