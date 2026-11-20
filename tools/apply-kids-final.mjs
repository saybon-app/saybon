// Les Petits card: rose/lavender tint, no snow, 4 dancing stars that travel between "For kids" and the title.
import fs from "fs"; import path from "path";
const base = process.argv[2] || "public/levels", cssF = path.join(base, "levels-cinema.css"), htmlF = path.join(base, "index.html");
let css = fs.readFileSync(cssF, "utf8"), html = fs.readFileSync(htmlF, "utf8");
if (!/lv-kids/.test(html)) { console.log("STOP: no lv-kids tile in levels/index.html"); process.exit(1); }
if (css.includes("/*kids4*/")) { console.log("Already patched."); process.exit(0); }
fs.writeFileSync(cssF + ".bakK4", css); fs.writeFileSync(htmlF + ".bakK4", html);
for (const m of ["/*kids3*/", "/*kids2*/"]) { const i = css.indexOf(m); if (i >= 0) css = css.slice(0, i); }
html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fredoka[^>]*>\s*/g, "")
           .replace(/<script>\/\*kdsnow3?\*\/[\s\S]*?<\/script>\s*/g, "");
const star = "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c2"/><stop offset="1" stop-color="#ffb8dc"/></linearGradient></defs><path d="M12 1.8l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17l-6.1 3.4 1.4-6.8L2.2 8.9l6.9-.8z" fill="url(#g)" stroke="#fff" stroke-width="1" stroke-linejoin="round"/></svg>');
css += `
/*kids4*/
.levels-grid .level-tile.lv-kids{position:relative;overflow:hidden;border-radius:26px;border-color:rgba(255,184,222,.8);
  background:linear-gradient(155deg,rgba(255,140,200,.34),rgba(176,140,255,.26) 55%,var(--cb) 100%)}
.level-tile.lv-kids::after{content:none!important;display:none!important;animation:none!important}
.level-tile.lv-kids .lv-tile-label{color:#ffcfe8!important;text-shadow:0 0 14px rgba(255,150,210,.55)}
.level-tile.lv-kids .lv-tile-sub{color:#e4d4ff!important}
.level-tile.lv-kids .cin-q{color:#f6c9e4}
.level-tile.lv-kids .kd-stars{position:absolute;inset:0;pointer-events:none;z-index:3}
.level-tile.lv-kids .kd-st{position:absolute;left:var(--hx);top:var(--hy);width:20px;height:20px;animation:kdMove 9s cubic-bezier(.45,0,.25,1) var(--dl) infinite}
.level-tile.lv-kids .kd-st b{display:block;width:100%;height:100%;background:url("${star}") center/contain no-repeat;filter:drop-shadow(0 0 5px rgba(255,170,220,.85));animation:kdDance 2.4s ease-in-out var(--dd) infinite}
@keyframes kdMove{0%,28%{transform:translate(0,0)}46%,74%{transform:translate(var(--dx),var(--dy))}92%,100%{transform:translate(0,0)}}
@keyframes kdDance{0%,100%{transform:rotate(-14deg) scale(1)}25%{transform:rotate(10deg) scale(1.25) translateY(-2px)}50%{transform:rotate(18deg) scale(.95)}75%{transform:rotate(-6deg) scale(1.15)}}
@media (prefers-reduced-motion:reduce){.level-tile.lv-kids .kd-st,.level-tile.lv-kids .kd-st b{animation:none}}
`;
fs.writeFileSync(cssF, css);
const js = `<script>/*kdstars*/(function(){try{var t=document.querySelector('.level-tile.lv-kids');if(!t)return;var L=t.querySelector('.lv-tile-label'),S=t.querySelector('.lv-tile-sub');if(!L||!S)return;var w=t.querySelector('.kd-stars');if(!w){w=document.createElement('span');w.className='kd-stars';for(var i=0;i<4;i++){var s=document.createElement('span');s.className='kd-st';s.style.setProperty('--dl',(i*0.18)+'s');s.style.setProperty('--dd',(-i*0.5)+'s');s.appendChild(document.createElement('b'));w.appendChild(s)}t.appendChild(w)}
function place(){L=t.querySelector('.lv-tile-label');S=t.querySelector('.lv-tile-sub');var T=t.getBoundingClientRect();function pos(el){var r=el.getBoundingClientRect(),c=getComputedStyle(el),k=document.createElement('canvas').getContext('2d');k.font=c.fontStyle+' '+c.fontWeight+' '+c.fontSize+' '+c.fontFamily;var tx=el===L?'Les Petits':'For kids';return{x:r.left-T.left+k.measureText(tx).width+10,y:r.top-T.top+(r.height-20)/2}}var a=pos(S),b=pos(L);[].forEach.call(w.children,function(s,i){s.style.setProperty('--hx',(a.x+i*24)+'px');s.style.setProperty('--hy',a.y+'px');s.style.setProperty('--dx',(b.x-a.x)+'px');s.style.setProperty('--dy',(b.y-a.y)+'px')})}
place();setTimeout(place,600);setTimeout(place,2500);setInterval(place,3000);window.addEventListener('resize',place);window.addEventListener('load',place)}catch(e){}})();</script>`;
html = html.replace(/levels-cinema\.css\?v=(\d+)/, (m, v) => "levels-cinema.css?v=" + (+v + 1)).replace(/<\/body>/i, js + "\n</body>");
fs.writeFileSync(htmlF, html);
console.log("Done: rose/lavender card, no snow, 4 travelling stars.");
