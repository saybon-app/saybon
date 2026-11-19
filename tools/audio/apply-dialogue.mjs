// Wires the Les Petits conversation (part 6), skips parts 7-11, shortens the stars pause. Safe: checks anchors, keeps a backup.
import fs from "fs";
const f = process.argv[2] || "C:/SayBon/public/levels/scene-paris/scene-ui.js";
let s = fs.readFileSync(f, "utf8");
const bad = [];
if (!s.includes("'1-6':'dialogue'")) {
  if (!/'1-5':'skip'/.test(s)) bad.push("'1-5':'skip'");
  if (!/aurevoir:'Au revoir'\}/.test(s)) bad.push("aurevoir:'Au revoir'}");
  if (!s.includes("T(kNext,3200)") && !s.includes("T(kNext,1400)")) bad.push("T(kNext,3200)");
  if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
  fs.writeFileSync(f + ".bak2", s);
  s = s.replace("'1-5':'skip'", "'1-5':'skip','1-6':'dialogue','1-7':'skip','1-8':'skip','1-9':'skip','1-10':'skip','1-11':'skip'");
  s = s.replace("aurevoir:'Au revoir'}", "aurevoir:'Au revoir',dialogue:'Conversation'}");
  s = s.replace("T(kNext,3200)", "T(kNext,1400)");
}
s = s.replace(/(dn\+'\.(?:json|mp3)\?v=)\d+/g, "$15");
s = s.replace(/'\.(json|mp3)\?v=\d+'/g, "'.$1?v=5'");
fs.writeFileSync(f, s);
console.log("Done: conversation wired, endings tightened.");
