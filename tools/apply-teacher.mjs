import fs from "fs";
const dir = process.argv[2] || "public/placement";
const js = dir + "/placement-v2.js", css = dir + "/placement-v2.css";
let j = fs.readFileSync(js, "utf8"), c = fs.readFileSync(css, "utf8");
// 1. bring the file back to its original state (undo my earlier attempts)
const orig = 'function showFrame(n){Array.prototype.forEach.call(imgs,function(im,i){im.classList.toggle("on",i===n)})}';
j = j.replace(/var curF=0;\/\*tsmooth\*\/function showFrame\(n\)\{.*?curF=n\}/s, orig);
j = j.replace("tFrames=list.slice(0,1);return tFrames;/*one-pose*/", "tFrames=list;return list;");
j = j.replace(/\/\*twalk\*\/function walk\(total\)\{.*?\}\/\*endwalk\*\//s, "");
j = j.replace("walk(total)/*w*/", 'if(imgs.length>1){var step=total/imgs.length;frameTimer=setInterval(function(){fi=Math.min(imgs.length-1,fi+1);showFrame(fi);if(fi>=imgs.length-1)clearInterval(frameTimer)},step)}');
const loop = 'if(imgs.length>1){var step=total/imgs.length;frameTimer=setInterval(function(){fi=Math.min(imgs.length-1,fi+1);showFrame(fi);if(fi>=imgs.length-1)clearInterval(frameTimer)},step)}';
if (j.split(orig).length !== 2 || j.split(loop).length !== 2) { console.log("NOT PATCHED (placement-v2.js differs)"); process.exit(1); }
// 2. the walk-in: she enters from the left, bouncing softly, changing pose as she travels, lands in the middle on the last pose
const walk = '/*twalk*/function walk(total){var W=Math.max(5,Math.min(10,total*0.85/1000)),n=imgs.length,t0=null,raf=0,ended=false,last=0;var dist=(window.innerWidth/2)+(stage.offsetWidth||200)/2+20,bounces=Math.max(3,Math.round(W/1.4));'
 + 'stage.style.transform="translateX("+(-dist)+"px)";'
 + 'function rest(){ended=true;cancelAnimationFrame(raf);stage.style.transform="none"}'
 + 'function step(ts){if(ended)return;if(shown)return rest();if(t0===null)t0=ts;var t=Math.min(1,(ts-t0)/(W*1000)),e=1-Math.pow(1-t,2);'
 + 'var x=-dist*(1-e),s=Math.sin(Math.PI*bounces*t),y=-12*s*s*(1-t*t);'
 + 'stage.style.transform="translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px)";'
 + 'var f=Math.min(n-1,Math.floor(t*(n-1)+0.0001));if(t>=1)f=n-1;if(f!==last){last=f;fi=f;showFrame(f)}'
 + 'if(t>=1)return rest();raf=requestAnimationFrame(step)}'
 + 'raf=requestAnimationFrame(step)}/*endwalk*/';
j = j.replace(orig, orig + walk).replace(loop, "walk(total)/*w*/");
// 3. styles: remove the pulse, keep a quick dissolve for the pose changes
let i = c.indexOf("\n/* teacher: one continuous"); if (i >= 0) c = c.slice(0, i);
i = c.indexOf("\n/*tpulse2*/"); if (i >= 0) c = c.slice(0, i);
c += '\n/*twalk*/ /* teacher walks in from the left; poses change while she moves */\n.t-stage{will-change:transform}\n.t-stage img{transition:opacity .22s ease-in-out}\n';
fs.writeFileSync(js, j); fs.writeFileSync(css, c);
console.log("teacher: walk-in installed");
