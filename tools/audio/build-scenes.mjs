// Builds lessons 1-5 (A1-C2) in the scene design. Credit-safe: a lesson is only published (copied + flagged) when ALL its audio is done.
// Usage: node build-scenes.mjs <audioOutDir> <tempDir>   Exit 0 = everything built, 42 = out of credits (run again after top-up).
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), d = process.argv[2], t = process.argv[3], flags = path.join(here, "done");
for (const x of [d, t, flags]) fs.mkdirSync(x, { recursive: true });
const sleep = (s) => spawnSync("node", ["-e", `setTimeout(()=>{},${s * 1000})`]);
const run = (args) => { let r; for (let k = 1; k <= 8; k++) { r = spawnSync("node", args, { cwd: here, stdio: "inherit" }); if (r.status === 0 || r.status === 42) break; console.log(`\nNetwork/step error - retry ${k}/8 in 10s...`); sleep(10); } if (r.status === 42) { console.log("\nSTOPPED: out of credits. Lessons finished so far are saved and will be published. Top up, then run the same block again."); process.exit(42); } if (r.status !== 0) { console.log("\nFAILED: node " + args.join(" ")); process.exit(1); } };
const ma = (l, n, name, script, out) => run(["make-audio.mjs", "--level", l, "--lesson", String(n), "--name", name, "--script", `scripts/${script}.txt`, "--outdir", out, ...(process.env.SB_DRY ? ["--dry"] : [])]);
run(["make-audio.mjs", "--level", "a1", "--lesson", "1", "--name", "L1_end", "--script", "scripts/L1_end.txt", "--outdir", t, ...(process.env.SB_DRY ? ["--dry"] : [])]);
let stopped = false;
for (const n of [1, 2, 3, 4, 5]) for (const l of ["a1", "a2", "b1", "b2", "c1", "c2"]) {
  const p = `L${n}_${l}`, flag = path.join(flags, p + ".flag");
  if (fs.existsSync(flag) && !process.argv.includes("--force")) { console.log(`${p}: already built`); continue; }
  const st = path.join(t, "stage_" + p); fs.rmSync(st, { recursive: true, force: true }); fs.mkdirSync(st, { recursive: true });
  ma(l, n, `${p}_ib`, `${p}_intro`, t);
  run(["mix-intro.mjs", "--body", `${t}/${p}_ib.mp3`, "--end", `${t}/L1_end.mp3`, "--out", `${t}/${p}_im.mp3`]);
  ma(l, n, `${p}_md`, `${p}_model`, t);
  run(["concat-audio.mjs", "0.9", `${st}/${p}_intro.mp3`, `${t}/${p}_im.mp3`, `${t}/${p}_md.mp3`]);
  for (const i of [1, 2, 3, 4]) ma(l, n, `${p}_s${i}`, `${p}_s${i}`, st);
  for (const i of [1, 2]) ma(l, n, `${p}_q${i}`, `${p}_q${i}`, st);
  ma(l, n, `${p}_dv`, `${p}_dlg`, t);
  run(["mix-intro.mjs", "--body", `${t}/${p}_dv.mp3`, "--json", `${t}/${p}_dv.json`, "--out", `${st}/${p}_dlg.mp3`]);
  for (const f of fs.readdirSync(st)) fs.copyFileSync(path.join(st, f), path.join(d, f));
  fs.writeFileSync(flag, new Date().toISOString()); fs.rmSync(st, { recursive: true, force: true });
  console.log(`${p}: built and published`);
}
console.log("\nALL SCENE LESSONS BUILT");
