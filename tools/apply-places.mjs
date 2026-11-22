// Opens Banque and Arret de bus on the map, but only once ALL their teacher audio exists. Safe to run again.
import fs from "fs";
const P = "public/assets/talkletics/places/", M = "public/talkletics/map.js", PL = "public/talkletics/place.js";
const ready = [];
for (const s of ["banque", "arret-de-bus"]) {
  const c = JSON.parse(fs.readFileSync(P + s + "/config.json", "utf8"));
  const ids = [...(c.extras || []).map(x => x.id)];
  for (const k of c.sections) { ids.push(k.introId); k.items.forEach(i => ids.push(i.id)); }
  const miss = ids.filter(i => { try { return fs.statSync(P + s + "/audio/" + i + ".mp3").size < 1000; } catch (e) { return true; } });
  if (miss.length) console.log(s + ": " + miss.length + " of " + ids.length + " audio clips missing, so it stays 'being built'. Run Make-PlacesAudio.ps1 then this again.");
  else { ready.push(s); console.log(s + ": audio complete."); }
}
let m = fs.readFileSync(M, "utf8"), n = 0;
for (const s of ready) { const k = s.includes("-") ? '"' + s + '"' : s; if (!new RegExp("[{,]\"?" + s + "\"?:1").test(m)) { m = m.replace("BUILT={", "BUILT={" + k + ":1,"); n++; } }
if (n) { fs.writeFileSync(M, m); console.log("map.js: " + n + " place(s) opened."); }
let p = fs.readFileSync(PL, "utf8");
const skip = []; if (!ready.includes("banque")) skip.push("17:1"); if (!ready.includes("arret-de-bus")) skip.push("19:1");
const q = p.replace(/var SKIP=\{[^}]*\}/, "var SKIP={" + skip.join(",") + "}");
if (q !== p) { fs.writeFileSync(PL, q); console.log("place.js: skip list is now {" + skip.join(",") + "}"); }
