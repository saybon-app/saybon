// Builds ALL new audio in order of importance, stops cleanly the moment credits run out, and never makes a half-finished lesson go live.
// Run again after a top-up: it carries on where it stopped. Needs ELEVENLABS_API_KEY (set in PowerShell by you, never stored).
import { spawnSync } from "child_process"; import fs from "fs"; import os from "os"; import path from "path"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url)), aud = path.resolve(here, "..", "..", "public", "assets", "audio");
if (!process.env.ELEVENLABS_API_KEY) { console.log("\nNo ELEVENLABS_API_KEY set: skipping audio. The pages stay as they are. Set the key in PowerShell and run this block again."); process.exit(0); }
const tmp = path.join(os.tmpdir(), "saybon-audio-tmp"); fs.mkdirSync(tmp, { recursive: true });
const steps = [
  ["Les Petits lessons 13-25", ["build-lp.mjs", path.join(aud, "lp")]],
  ["Reading lessons 12, 18, 24", ["build-reading-extra.mjs", path.join(aud, "lessons")]],
  ["Lessons 21, 22, 23, 25 (A1-C2)", ["build-scenes.mjs", path.join(aud, "lessons"), tmp, "--rounds=21,22,23,25"]],
];
let stopped = false;
for (const [label, args] of steps) {
  console.log("\n==================== " + label + " ====================");
  const r = spawnSync("node", args, { cwd: here, stdio: "inherit" });
  if (r.status === 42) { stopped = true; break; }
  if (r.status) console.log("\n(" + label + " hit an error. Carrying on with the rest. Send me the lines above if it repeats.)");
}
console.log(stopped ? "\n*** CREDITS RAN OUT. Everything finished so far is kept and will go live. Top up and run the same block again to continue. ***" : "\nAll audio is built.");
process.exit(0);
