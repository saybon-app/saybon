// Builds the Les Petits lessons 2-6 audio (Mira). Skips files that already exist. Stops cleanly if credits run low.
// Usage: node build-lp.mjs <outDir>   (needs ELEVENLABS_API_KEY)
import fs from "fs"; import path from "path"; import { spawnSync } from "child_process"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || "../../public/assets/audio/lp"); fs.mkdirSync(out, { recursive: true });
const { man } = JSON.parse(fs.readFileSync(path.join(here, "lp-manifest.json"), "utf8"));
let made = 0, kept = 0;
for (const m of man) {
  if (fs.existsSync(path.join(out, m.name + ".mp3"))) { kept++; continue; }
  console.log("\n=== " + m.name);
  const r = spawnSync("node", [path.join(here, "make-audio.mjs"), "--level", "a0-les-petits", "--lesson", String(m.lesson), "--name", m.name, "--script", path.join(here, "scripts", m.script), "--outdir", out], { stdio: "inherit" });
  if (r.status === 42) { console.log("\nOut of credits: stopped cleanly. Top up and run the same block again, it continues where it stopped."); process.exit(42); }
  if (r.status) { console.log("\nFAILED on " + m.name + ". Send me the lines above."); process.exit(1); }
  made++;
}
console.log(`\nAll done. Made ${made}, already there ${kept}.`);
