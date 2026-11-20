// Builds the placement-test audio: the teacher (3 takes, Mira) and the listening questions.
// Usage: node build-placement.mjs <outDir> [--only=teacher|listening]   (needs ELEVENLABS_API_KEY)
// Skips files that already exist. Stops cleanly if credits run low (run the same line again later).
import fs from "fs"; import path from "path"; import vm from "vm"; import { spawnSync } from "child_process"; import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(process.argv[2] || "../../public/assets/audio/placement"); fs.mkdirSync(out, { recursive: true });
const only = (process.argv.find(a => a.startsWith("--only=")) || "").split("=")[1] || "";
const itemsFile = path.resolve(here, "..", "..", "public", "placement", "items.js");
const ctx = { window: {} }; vm.createContext(ctx); vm.runInContext(fs.readFileSync(itemsFile, "utf8"), ctx);
const items = ctx.window.PT_ITEMS;
const TEXT = "Hey, you. Take a breath, and look how far you've come. Honestly, you're doing really well. I already have everything I need to know your level. Would you like to see it now? Or keep going, just for fun. Either way, I'm so proud of you.";
const takes = {
  a: "[warmly] Hey, you. [short pause] [excited] Take a breath, and look how far you've come. [warmly] Honestly, you're doing really well. I already have everything I need to know your level. [short pause] [excited] Would you like to see it now? Or keep going, just for fun. [warmly] Either way, I'm so proud of you.",
  b: "[excited] Hey, you! [calmly] Take a breath, and look how far you've come. [excited] Honestly, you're doing really well! [calmly] I already have everything I need to know your level. [short pause] [excited] Would you like to see it now? [calmly] Or keep going, just for fun. [excited] Either way, I'm so proud of you!",
  c: "[playful] Hey, you. [short pause] [warmly] Take a breath, and look how far you've come. [playful] Honestly, you're doing really well. [warmly] I already have everything I need to know your level. [playful] Would you like to see it now? [warmly] Or keep going, just for fun. [excited] Either way, I'm so proud of you."
};
const lvlVoice = ["a1", "a1", "a2", "b1", "b2", "c1", "c2"];
const jobs = [];
if (only !== "listening") for (const k of Object.keys(takes)) jobs.push({ name: "teacher_" + k, level: "a0-les-petits", text: takes[k] });
if (only !== "teacher") for (const it of items) if (it.say) jobs.push({ name: it.id, level: lvlVoice[it.lv], text: (it.lv <= 1 ? "[slowly] " : "[calmly] ") + it.say });
const tmp = path.join(here, "scripts"); fs.mkdirSync(tmp, { recursive: true });
let made = 0, kept = 0;
for (const j of jobs) {
  if (fs.existsSync(path.join(out, j.name + ".mp3"))) { kept++; continue; }
  const sf = path.join(tmp, "PT_" + j.name + ".txt"); fs.writeFileSync(sf, j.text + "\n");
  console.log("\n=== " + j.name);
  const r = spawnSync("node", [path.join(here, "make-audio.mjs"), "--level", j.level, "--name", j.name, "--script", sf, "--outdir", out], { stdio: "inherit" });
  if (r.status === 42) { console.log("\nOut of credits: stopped cleanly. Top up and run the same line again, it continues where it stopped."); process.exit(42); }
  if (r.status) { console.log("\nFAILED on " + j.name + ". Send me the lines above."); process.exit(1); }
  made++;
}
console.log(`\nAll done. Made ${made}, already there ${kept}.`);
