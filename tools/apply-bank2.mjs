// Removes the duplicate second bank from the Talkletics map and renumbers the places after it. Safe to run again. Run from the project root.
import fs from "fs";
const PJ = "public/assets/talkletics/map/places.json", M = "public/talkletics/map.js";
const d = JSON.parse(fs.readFileSync(PJ, "utf8"));
const i = d.findIndex(x => x.slug === "banque-2");
if (i < 0) console.log("Second bank already removed.");
else {
  d.splice(i, 1);
  d.forEach((x, k) => { x.order = k + 1; x.badge = String(k + 1).padStart(2, "0") + ".webp"; });
  fs.writeFileSync(PJ, JSON.stringify(d));
  console.log("Removed the second bank. The map now has " + d.length + " places.");
}
let m = fs.readFileSync(M, "utf8"), n = d.length;
let r = m.replace(/for\(k=0;k<50;k\+\+\)/, "for(k=0;k<P.length;k++)").replace(/for\(var k=0;k<50;k\+\+\)/, "for(var k=0;k<P.length;k++)")
  .replace("if(ADMIN)return 50;", "if(ADMIN)return P.length;").replace("Math.min(50,Math.max(1,+q))", "Math.min(P.length,Math.max(1,+q))").replace("Math.min(50,v)", "Math.min(P.length,v)");
if (r !== m) { fs.writeFileSync(M, r); console.log("map.js now counts the real number of places."); }
