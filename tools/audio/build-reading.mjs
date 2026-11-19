// Builds the reading-lesson audio. Credit-safe and resumable. Usage: node build-reading.mjs <audioOutDir> <tempDir>
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), d = process.argv[2], t = process.argv[3];
fs.mkdirSync(d, { recursive: true }); fs.mkdirSync(t, { recursive: true });
const sleep = (s) => spawnSync("node", ["-e", `setTimeout(()=>{},${s * 1000})`]);
const run = (args) => { let r; for (let k = 1; k <= 8; k++) { r = spawnSync("node", args, { cwd: here, stdio: "inherit" }); if (r.status === 0 || r.status === 42) break; console.log(`\nNetwork/step error - retry ${k}/8 in 10s...`); sleep(10); } if (r.status === 42) { console.log("\nSTOPPED: out of credits. Top up, then run the same block again - it carries on from here."); process.exit(42); } if (r.status !== 0) { console.log("\nFAILED: node " + args.join(" ")); process.exit(1); } };
const ma = (l, name, out) => run(["make-audio.mjs", "--level", l, "--lesson", "6", "--name", name, "--script", `scripts/${name}.txt`, "--outdir", out]);
run(["make-audio.mjs", "--level", "a1", "--lesson", "1", "--name", "L1_end", "--script", "scripts/L1_end.txt", "--outdir", t]);
for (const f of fs.readdirSync(path.join(here, "scripts"))) { const m = /^(R_(en|fr)_\w+)\.txt$/.exec(f); if (m && !fs.existsSync(path.join(d, m[1] + ".mp3"))) ma(m[2] === "en" ? "a1" : "b1", m[1], d); }
for (const l of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
  const p = `R6_${l}`;
  ma(l, `${p}_intro`.replace("_intro", "_intro"), t) ;
  fs.renameSync(path.join(t, `${p}_intro.mp3`), path.join(t, `${p}_ib.mp3`));
  run(["mix-intro.mjs", "--body", `${t}/${p}_ib.mp3`, "--end", `${t}/L1_end.mp3`, "--out", `${d}/${p}_intro.mp3`]);
  for (const f of fs.readdirSync(path.join(here, "scripts"))) { const m = new RegExp(`^(${p}_(p\\d(_s\\d)?|s\\d))\\.txt$`).exec(f); if (m) ma(l, m[1], d); }
  console.log(l + ": done");
}
console.log("\nREADING AUDIO COMPLETE");
