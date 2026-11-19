// Builds all audio for one round (lesson N of A1-C2). Credit-safe and resumable.
// Usage: node build-round.mjs <N> <audioOutDir> <tempDir>
// Exit 0 = complete. Exit 42 = out of credits (progress saved; run again after top-up).
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const [N, d, t] = [process.argv[2], process.argv[3], process.argv[4]];
fs.mkdirSync(d, { recursive: true }); fs.mkdirSync(t, { recursive: true });
const sleep = (s) => spawnSync("node", ["-e", `setTimeout(()=>{},${s * 1000})`]);
const run = (args) => { let r; for (let k = 1; k <= 8; k++) { r = spawnSync("node", args, { cwd: here, stdio: "inherit" }); if (r.status === 0 || r.status === 42) break; console.log(`\nNetwork/step error - retry ${k}/8 in 10s...`); sleep(10); } if (r.status === 42) { console.log("\nSTOPPED: out of credits. Top up, then run the same block again - it carries on from here."); process.exit(42); } if (r.status !== 0) { console.log("\nFAILED: node " + args.join(" ")); process.exit(1); } };
const ma = (l, name, script, out) => run(["make-audio.mjs", "--level", l, "--lesson", N, "--name", name, "--script", `scripts/${script}.txt`, "--outdir", out]);
run(["make-audio.mjs", "--level", "a1", "--lesson", "1", "--name", "L1_end", "--script", "scripts/L1_end.txt", "--outdir", t]);
for (const l of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
  const p = `L${N}_${l}`, mark = path.join(d, `${p}_dlg.mp3`);
  if (fs.existsSync(mark) && fs.existsSync(path.join(d, `${p}_dlg.json`))) { console.log(`${l}: already built`); continue; }
  const reading = fs.existsSync(path.join(here, "scripts", `${p}_read.txt`));
  ma(l, `${p}_ib`, `${p}_intro`, t);
  run(["mix-intro.mjs", "--body", `${t}/${p}_ib.mp3`, "--end", `${t}/L1_end.mp3`, "--out", `${d}/${p}_intro.mp3`]);
  for (const i of [1, 2, 3, 4]) ma(l, `${p}_s${i}`, `${p}_s${i}`, d);
  for (const i of [1, 2]) ma(l, `${p}_q${i}`, `${p}_q${i}`, d);
  ma(l, `${p}_dv`, `${p}_dlg`, t);
  run(["mix-intro.mjs", "--body", `${t}/${p}_dv.mp3`, "--json", `${t}/${p}_dv.json`, "--out", `${d}/${p}_dlg.mp3`]);
  console.log(`${l}: done`);
}
console.log("\nROUND " + N + " COMPLETE");
