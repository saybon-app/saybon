// Reading lessons 12, 18, 24 (A1-C2): short teacher clips. Credit-safe and resumable. Usage: node build-reading-extra.mjs <audioOutDir>
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), d = path.resolve(process.argv[2] || "../../public/assets/audio/lessons");
fs.mkdirSync(d, { recursive: true });
const jobs = JSON.parse(fs.readFileSync(path.join(here, "reading-extra-jobs.json"), "utf8"));
const sleep = s => spawnSync("node", ["-e", `setTimeout(()=>{},${s * 1000})`]);
let made = 0, kept = 0;
for (const name of jobs) {
  if (fs.existsSync(path.join(d, name + ".mp3"))) { kept++; continue; }
  const m = /^R(\d+)_(a1|a2|b1|b2|c1|c2)_/.exec(name); let r;
  for (let k = 1; k <= 6; k++) {
    r = spawnSync("node", ["make-audio.mjs", "--level", m[2], "--lesson", m[1], "--name", name, "--script", `scripts/${name}.txt`, "--outdir", d], { cwd: here, stdio: "inherit" });
    if (r.status === 0 || r.status === 42) break; console.log(`\nStep error, retry ${k}/6 in 10s...`); sleep(10);
  }
  if (r.status === 42) { console.log("\nREADING: out of credits, stopped cleanly."); process.exit(42); }
  if (r.status) { console.log("\nREADING: failed on " + name); process.exit(1); }
  made++;
}
console.log(`\nREADING clips complete. Made ${made}, already there ${kept}.`);
