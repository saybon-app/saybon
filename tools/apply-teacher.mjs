import fs from "fs";
const dir = process.argv[2] || "public/placement";
const js = dir + "/placement-v2.js", css = dir + "/placement-v2.css";
let j = fs.readFileSync(js, "utf8"), c = fs.readFileSync(css, "utf8");
if (j.includes("/*tsmooth*/")) { console.log("teacher: already smooth"); process.exit(0); }
const a = 'function showFrame(n){Array.prototype.forEach.call(imgs,function(im,i){im.classList.toggle("on",i===n)})}';
if (j.split(a).length !== 2) { console.log("NOT PATCHED (placement-v2.js differs)"); process.exit(1); }
j = j.replace(a, 'var curF=0;/*tsmooth*/function showFrame(n){if(n===curF)return;Array.prototype.forEach.call(imgs,function(im,i){im.classList.remove("prev");if(i===curF)im.classList.add("prev");im.classList.toggle("on",i===n)});curF=n}');
c += '\n/* teacher: one continuous soft pulse; frames dissolve over each other with no dip */\n.t-stage{transform-origin:50% 92%;animation:tpulse 2.8s ease-in-out infinite;will-change:transform}\n@keyframes tpulse{0%,100%{transform:scale(1) translateY(0)}50%{transform:scale(1.028) translateY(-6px)}}\n.t-stage img{transition:opacity .8s ease-in-out;z-index:0}\n.t-stage img.prev{opacity:1;z-index:1;transition:none}\n.t-stage img.on{opacity:1;z-index:2}\n';
fs.writeFileSync(js, j); fs.writeFileSync(css, c);
console.log("teacher: patched");
