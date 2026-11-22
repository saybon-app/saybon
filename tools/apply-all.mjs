// Applies every pending change in one go. Each step is safe to run again. Run from the project root: node tools/apply-all.mjs
import { spawnSync } from "child_process";
const steps = [
  ["Home page cut-off fix", ["tools/apply-homefix.mjs", "public"]],
  ["A0 audio tap fix", ["tools/apply-audiofix.mjs", "public/levels"]],
  ["Les Petits lessons 13-25", ["tools/apply-lp-all.mjs"]],
  ["Les Petits reading lessons 13, 19, 25", ["tools/apply-lp-read.mjs"]],
  ["Reading lessons 12, 18, 24", ["tools/apply-reading-extra.mjs"]],
  ["A1-C2 lessons 21, 22, 23, 25", ["tools/apply-scenes21.mjs", "public/levels"]],
  ["Tout Public lessons 4-25", ["tools/apply-tp.mjs", "public/levels"]],
  ["Placement distractors", ["tools/apply-distractors.mjs"]],
  ["Link preview picture", ["tools/apply-og.mjs"]],
  ["Remove duplicate second bank", ["tools/apply-bank2.mjs"]],
  ["Banque and Arret de bus on the map", ["tools/apply-places.mjs"]],
];
let bad = 0;
for (const [label, args] of steps) { console.log("\n--- " + label); const r = spawnSync("node", args, { stdio: "inherit" }); if (r.status) { bad++; console.log("!! " + label + " did not apply (see above). The rest continues."); } }
console.log(bad ? "\n" + bad + " step(s) need a look. Send me the lines above." : "\nAll steps applied.");
