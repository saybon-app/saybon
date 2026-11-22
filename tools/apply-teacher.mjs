import fs from "fs";
const dir = process.argv[2] || "public/placement";
const js = dir + "/placement-v2.js", css = dir + "/placement-v2.css";
let j = fs.readFileSync(js, "utf8"), c = fs.readFileSync(css, "utf8");
const orig = 'function showFrame(n){Array.prototype.forEach.call(imgs,function(im,i){im.classList.toggle("on",i===n)})}';
const v1 = /var curF=0;\/\*tsmooth\*\/function showFrame\(n\)\{.*?curF=n\}/s;
if (v1.test(j)) j = j.replace(v1, orig);
if (j.split(orig).length !== 2) { console.log("NOT PATCHED (placement-v2.js differs)"); process.exit(1); }
const i = c.indexOf("\n/* teacher: one continuous");
if (i >= 0) c = c.slice(0, i);
if (!c.includes("/*tpulse2*/")) c += '\n/*tpulse2*/ /* teacher: very slow soft pulse; poses swap with a quick dissolve so no old pose lingers */\n.t-stage{transform-origin:50% 95%;animation:tpulse 7s ease-in-out infinite;will-change:transform}\n@keyframes tpulse{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.012) translateY(-3px)}}\n.t-stage img{transition:opacity .28s ease-in-out}\n';
const lf = "tFrames=list;return list;";
if (j.includes(lf)) j = j.replace(lf, "tFrames=list.slice(0,1);return tFrames;/*one-pose*/");
else if (!j.includes("/*one-pose*/")) { console.log("NOT PATCHED (loadFrames differs)"); process.exit(1); }
fs.writeFileSync(js, j); fs.writeFileSync(css, c);
console.log("teacher: patched");
