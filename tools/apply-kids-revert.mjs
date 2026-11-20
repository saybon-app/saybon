// Revert Les Petits tile to the original glass card, add subtle snow dots + a proper dancing star icon.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "public/levels", cssF = path.join(base, "levels-cinema.css"), htmlF = path.join(base, "index.html");
let css = fs.readFileSync(cssF, "utf8"), html = fs.readFileSync(htmlF, "utf8");
if (!/lv-kids/.test(html)) { console.log("STOP: no lv-kids tile in levels/index.html"); process.exit(1); }
if (css.includes("/*kids3*/")) { console.log("Already patched."); process.exit(0); }
fs.writeFileSync(cssF + ".bakK3", css); fs.writeFileSync(htmlF + ".bakK3", html);
const i = css.indexOf("/*kids2*/"); if (i >= 0) css = css.slice(0, i);
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fredoka[^>]*>\s*/g, "")
           .replace(/<script>\/\*kdsnow\*\/[\s\S]*?<\/script>\s*/g, "");
const star = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8"/><stop offset="1" stop-color="#ffb347"/></linearGradient></defs><path d="M12 1.8l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.4 1.4-6.8L2.2 8.9l6.9-.8z" fill="url(#g)" stroke="#fff3c9" stroke-width="1" stroke-linejoin="round"/></svg>');
css += `
/*kids3*/
.levels-grid .level-tile.lv-kids{position:relative;overflow:hidden}
.level-tile.lv-kids>*{position:relative;z-index:2}
.level-tile.lv-kids .kd-snow{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.level-tile.lv-kids .kd-snow i{position:absolute;top:-6%;left:var(--x);width:var(--s);height:var(--s);border-radius:50%;background:#fff;opacity:var(--o);animation:kdFall var(--d) linear var(--l) infinite}
@keyframes kdFall{0%{transform:translate(0,0)}33%{transform:translate(5px,45px)}66%{transform:translate(-5px,95px)}100%{transform:translate(2px,150px)}}
.level-tile.lv-kids::after{content:"";width:24px;height:24px;top:10px;right:14px;font-size:0;color:transparent;text-shadow:none;background:url("${star}") center/contain no-repeat;filter:drop-shadow(0 0 6px rgba(255,210,122,.8));z-index:2;animation:kdDance 2.6s ease-in-out infinite}
@keyframes kdDance{0%,100%{transform:rotate(-14deg) scale(1)}25%{transform:rotate(10deg) scale(1.2) translateY(-2px)}50%{transform:rotate(18deg) scale(.95)}75%{transform:rotate(-6deg) scale(1.15) translateY(-1px)}}
@media (prefers-reduced-motion:reduce){.level-tile.lv-kids .kd-snow i,.level-tile.lv-kids::after{animation:none}}
`;
fs.writeFileSync(cssF, css);
const js = `<script>/*kdsnow3*/(function(){try{var t=document.querySelector('.level-tile.lv-kids');if(!t||t.querySelector('.kd-snow'))return;var w=document.createElement('span');w.className='kd-snow';for(var i=0;i<22;i++){var f=document.createElement('i');f.style.setProperty('--x',(Math.random()*97).toFixed(1)+'%');f.style.setProperty('--s',(2+Math.random()*3).toFixed(1)+'px');f.style.setProperty('--o',(0.3+Math.random()*0.4).toFixed(2));f.style.setProperty('--d',(5+Math.random()*5).toFixed(1)+'s');f.style.setProperty('--l',(-Math.random()*9).toFixed(1)+'s');w.appendChild(f)}t.insertBefore(w,t.firstChild)}catch(e){}})();</script>`;
html = html.replace(/levels-cinema\.css\?v=(\d+)/, (m, v) => "levels-cinema.css?v=" + (+v + 1)).replace(/<\/body>/i, js + "\n</body>");
fs.writeFileSync(htmlF, html);
console.log("Done: old glass card restored, subtle snow dots + dancing star icon added.");
