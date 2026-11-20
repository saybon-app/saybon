// Les Petits tile on the levels page: solid, childish, with falling snow. Usage: node apply-kids.mjs <levelsDir>
import fs from "fs"; import path from "path";
const base = process.argv[2] || "public/levels", cssF = path.join(base, "levels-cinema.css"), htmlF = path.join(base, "index.html");
let css = fs.readFileSync(cssF, "utf8"), html = fs.readFileSync(htmlF, "utf8");
if (!/lv-kids/.test(html)) { console.log("STOP: levels/index.html has no lv-kids tile. Send me this line."); process.exit(1); }
if (css.includes("/*kids2*/")) { console.log("Already patched."); process.exit(0); }
fs.writeFileSync(cssF + ".bakK", css); fs.writeFileSync(htmlF + ".bakK", html);
css += `
/*kids2*/
.levels-grid .level-tile.lv-kids,.levels-grid .level-tile.lv-kids:hover{position:relative;overflow:hidden;isolation:isolate;
  background:linear-gradient(165deg,#5ad1ff 0%,#8f7bff 48%,#ff7fc8 100%)!important;
  border:5px solid #fff!important;border-radius:34px;box-shadow:0 8px 0 #3a2a8c,0 18px 30px rgba(20,10,70,.55)!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  transition:transform .25s cubic-bezier(.3,1.6,.5,1),box-shadow .2s ease!important}
.levels-grid .level-tile.lv-kids:hover{transform:translateY(-6px) rotate(-1.5deg) scale(1.03);box-shadow:0 12px 0 #3a2a8c,0 26px 36px rgba(20,10,70,.6)!important}
.levels-grid .level-tile.lv-kids:active{transform:translateY(4px);box-shadow:0 3px 0 #3a2a8c,0 8px 14px rgba(20,10,70,.5)!important}
.level-tile.lv-kids>*{position:relative;z-index:2}
.level-tile.lv-kids .kd-snow{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden}
.level-tile.lv-kids .kd-snow i{position:absolute;top:-14%;left:var(--x);font-style:normal;line-height:1;font-size:var(--s);color:#fff;opacity:var(--o);text-shadow:0 0 6px rgba(255,255,255,.9);animation:kdFall var(--d) linear var(--l) infinite}
.level-tile.lv-kids .kd-snow i::before{content:"\\2744"}
.level-tile.lv-kids .kd-snow i:nth-child(3n)::before{content:"\\2745"}
.level-tile.lv-kids .kd-snow i:nth-child(5n)::before{content:"\\25CF";font-size:.55em}
@keyframes kdFall{0%{transform:translate(0,0) rotate(0)}25%{transform:translate(8px,30px) rotate(70deg)}50%{transform:translate(-6px,64px) rotate(150deg)}75%{transform:translate(9px,98px) rotate(230deg)}100%{transform:translate(-3px,150px) rotate(320deg)}}
.level-tile.lv-kids .lv-tile-label{font-family:"Fredoka","Baloo 2","Comic Sans MS",system-ui,sans-serif!important;font-weight:700!important;color:#fff!important;letter-spacing:.02em;
  text-shadow:0 3px 0 #5b2a86,2px 2px 0 #5b2a86,-2px 2px 0 #5b2a86,0 6px 10px rgba(40,10,90,.5)!important;display:inline-block;animation:kdBounce 2.4s ease-in-out infinite}
@keyframes kdBounce{0%,100%{transform:translateY(0) rotate(-1deg)}50%{transform:translateY(-4px) rotate(1.5deg)}}
.level-tile.lv-kids .lv-tile-sub{font-family:"Fredoka","Baloo 2","Comic Sans MS",system-ui,sans-serif!important;color:#fff7b0!important;font-weight:600!important;text-shadow:0 2px 0 #5b2a86}
.level-tile.lv-kids .cin-q{padding-right:46px;color:#fffbd0!important;text-shadow:0 2px 0 rgba(91,42,134,.8);font-family:"Fredoka","Baloo 2","Comic Sans MS",system-ui,sans-serif!important;font-style:normal}
.level-tile.lv-kids::before{content:"\\26C4";position:absolute;right:14px;bottom:8px;font-size:2.3rem;z-index:2;filter:drop-shadow(0 3px 0 rgba(58,42,140,.6));animation:kdWob 3s ease-in-out infinite}
.level-tile.lv-kids::after{content:"\\2B50";top:10px;right:14px;font-size:1.25rem;text-shadow:none;z-index:2;animation:kdSpin 4s linear infinite}
@keyframes kdWob{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg) translateY(-3px)}}
@keyframes kdSpin{0%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.3)}100%{transform:rotate(360deg) scale(1)}}
@media (prefers-reduced-motion:reduce){.level-tile.lv-kids .kd-snow i,.level-tile.lv-kids .lv-tile-label,.level-tile.lv-kids::before,.level-tile.lv-kids::after{animation:none}}
`;
fs.writeFileSync(cssF, css);
const font = '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">';
const js = `<script>/*kdsnow*/(function(){try{var t=document.querySelector('.level-tile.lv-kids');if(!t||t.querySelector('.kd-snow'))return;var w=document.createElement('span');w.className='kd-snow';for(var i=0;i<26;i++){var f=document.createElement('i');f.style.setProperty('--x',(Math.random()*96).toFixed(1)+'%');f.style.setProperty('--s',(9+Math.random()*13).toFixed(0)+'px');f.style.setProperty('--o',(0.65+Math.random()*0.35).toFixed(2));f.style.setProperty('--d',(4+Math.random()*5).toFixed(1)+'s');f.style.setProperty('--l',(-Math.random()*8).toFixed(1)+'s');w.appendChild(f)}t.insertBefore(w,t.firstChild)}catch(e){}})();</script>`;
html = html.replace(/levels-cinema\.css\?v=(\d+)/, (m, v) => "levels-cinema.css?v=" + (+v + 1)).replace("</head>", font + "\n</head>").replace(/<\/body>/i, js + "\n</body>");
fs.writeFileSync(htmlF, html);
console.log("Done: Les Petits tile restyled (solid candy colours, snow, bouncing title). Backups: .bakK");
