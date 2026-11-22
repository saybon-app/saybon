// Builds Tout Public lessons 4-25 in the same scene design as A1-C2. Credit-safe: a lesson is only published when ALL its audio is done.
// Usage: node build-tp.mjs <audioOutDir> <tempDir>   Exit 0 = all built, 42 = out of credits (run again after top-up).
import { spawnSync } from "child_process"; import fs from "fs"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), d = process.argv[2], t = process.argv[3], flags = path.join(here, "done");
for (const x of [d, t, flags]) fs.mkdirSync(x, { recursive: true });
const sleep = (s) => spawnSync("node", ["-e", `setTimeout(()=>{},${s * 1000})`]);
const run = (args) => { let r; for (let k = 1; k <= 8; k++) { r = spawnSync("node", args, { cwd: here, stdio: "inherit" }); if (r.status === 0 || r.status === 42) break; console.log(`\nNetwork/step error - retry ${k}/8 in ${k * 5}s`); sleep(k * 5); } if (r.status === 42) { console.log("\n*** OUT OF CREDITS. Everything finished so far is kept. Top up and run again. ***"); process.exit(42); } if (r.status) { console.log("Step failed: " + args.join(" ")); process.exit(1); } };
const ma = (n, name, script, out) => run(["make-audio.mjs", "--level", "a0", "--lesson", String(n), "--name", name, "--script", `scripts/${script}.txt`, "--outdir", out, ...(process.env.SB_DRY ? ["--dry"] : [])]);
run(["make-audio.mjs", "--level", "a0", "--lesson", "1", "--name", "L1_end", "--script", "scripts/L1_end.txt", "--outdir", t, ...(process.env.SB_DRY ? ["--dry"] : [])]);
const CFG = JSON.parse(fs.readFileSync(path.join(here, "..", "tp-lessons.json"), "utf8"));
for (let n = 4; n <= 25; n++) {
  const ns = CFG["A0-" + n].steps.length - 2;
  const p = `L${n}_a0`, flag = path.join(flags, p + ".flag");
  if (fs.existsSync(flag) && !process.argv.includes("--force")) { console.log(`${p}: already built`); continue; }
  const st = path.join(t, "stage_" + p); fs.rmSync(st, { recursive: true, force: true }); fs.mkdirSync(st, { recursive: true });
  ma(n, `${p}_ib`, `${p}_intro`, t);
  run(["mix-intro.mjs", "--body", `${t}/${p}_ib.mp3`, "--end", `${t}/L1_end.mp3`, "--out", `${t}/${p}_im.mp3`]);
  ma(n, `${p}_md`, `${p}_model`, t);
  run(["concat-audio.mjs", "0.9", `${st}/${p}_intro.mp3`, `${t}/${p}_im.mp3`, `${t}/${p}_md.mp3`]);
  for (let i = 1; i <= ns; i++) ma(n, `${p}_s${i}`, `${p}_s${i}`, st);
  for (const i of [1, 2]) ma(n, `${p}_q${i}`, `${p}_q${i}`, st);
  ma(n, `${p}_dv`, `${p}_dlg`, t);
  run(["mix-intro.mjs", "--body", `${t}/${p}_dv.mp3`, "--json", `${t}/${p}_dv.json`, "--out", `${st}/${p}_dlg.mp3`]);
  for (const f of fs.readdirSync(st)) fs.copyFileSync(path.join(st, f), path.join(d, f));
  fs.writeFileSync(flag, new Date().toISOString()); fs.rmSync(st, { recursive: true, force: true });
  console.log(`${p}: built and published`);
}
console.log("\nALL TOUT PUBLIC LESSONS BUILT");
