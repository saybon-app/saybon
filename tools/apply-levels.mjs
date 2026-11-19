// Levels page: Les Petits + A0 + A1..C2 (8 tiles), phone keeps one tile per line. Safe: checks anchors, keeps .bak copies.
import fs from "fs"; import path from "path";
const root = process.argv[2] || "C:/SayBon/public/levels";
const rd = f => fs.readFileSync(path.join(root, f), "utf8"), wr = (f, s) => fs.writeFileSync(path.join(root, f), s);
const bad = [];
let html = rd("index.html"), js = rd("levels-cinema.js"), css = rd("levels-cinema.css");
if (html.includes("goLevel('C2')")) { console.log("Already applied."); process.exit(0); }
const aTile = html.match(/<button class="level-tile" onclick="goLevel\('A0'\)">[\s\S]*?<\/button>/);
const cTile = html.match(/<button class="level-tile" onclick="goLevel\('C1'\)">[\s\S]*?<\/button>/);
if (!aTile) bad.push("A0 tile"); if (!cTile) bad.push("C1 tile");
if (!js.includes("var QUIP={A0:")) bad.push("QUIP"); if (!js.includes("im.src='/assets/images/levels-icon-'")) bad.push("quip image");
if (!css.includes("@media (max-width:700px){")) bad.push("css mobile block");
if (!fs.existsSync(path.join(root, "C1", "index.html"))) bad.push("C1/index.html");
if (bad.length) { console.log("STOP: cannot find: " + bad.join(" | ")); process.exit(1); }
for (const f of ["index.html", "levels-cinema.js", "levels-cinema.css"]) fs.copyFileSync(path.join(root, f), path.join(root, f + ".bak3"));
const tile = (go, label, sub, cls = "") => `<button class="level-tile${cls}" onclick="goLevel('${go}')">\n        <span class="lv-tile-accent"></span>\n        <span class="lv-tile-label">${label}</span>\n        <span class="lv-tile-sub">${sub}</span>\n      </button>`;
// order: Les Petits, A0, A1, A2, B1, B2, C1, C2
html = html.replace(aTile[0], tile("A0/les-petits", "Les Petits", "For kids", " lv-kids") + "\n\n      " + tile("A0/tout-public", "A0", "Absolute Beginner"));
html = html.replace(cTile[0], cTile[0] + "\n\n      " + tile("C2", "C2", "Mastery"));
html = html.replace("levels-cinema.css?v=2", "levels-cinema.css?v=3").replace("levels-cinema.js?v=2", "levels-cinema.js?v=3");
wr("index.html", html);
js = js.replace("var QUIP={A0:", "var QUIP={'Les Petits':['Little learners, big French smiles.'],C2:['Fluent in French, and then some.'],A0:");
js = js.replace("im.src='/assets/images/levels-icon-'+t._lab.toLowerCase()+'.png';", "im.onerror=function(){im.remove();};im.src='/assets/images/levels-icon-'+t._lab.toLowerCase()+'.png';");
wr("levels-cinema.js", js);
css += `
/* eight tiles: two rows of four on a computer, one tile per line on a phone */
@media (min-width:1000px){
  .lv-stage{max-width:1120px}
  .levels-grid{grid-template-columns:repeat(4,1fr);gap:16px}
  .levels-grid .level-tile{padding:20px 18px 18px}
  .level-tile .lv-tile-label{font-size:1.65rem}
  .cin-q{font-size:.72rem}
}
@media (min-width:701px) and (max-width:999px){.levels-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:700px){
  .lv-page-header{margin-bottom:34px}
  .levels-grid{gap:11px}
  .levels-grid .level-tile{padding:15px 20px 13px}
  .level-tile .lv-tile-label{font-size:1.55rem}
}
/* Les Petits: same glass family, warmer and rounder, with a little star */
.levels-grid .level-tile.lv-kids{border-radius:26px;border-color:rgba(255,205,120,.7);background:linear-gradient(160deg,rgba(255,170,90,.26),var(--cb) 70%)}
.level-tile.lv-kids::after{content:"\\2726";position:absolute;top:12px;right:16px;font-size:1.05rem;color:#ffd27a;text-shadow:0 0 10px rgba(255,210,122,.7);animation:lvTw 3.2s ease-in-out infinite}
.level-tile.lv-kids .lv-tile-label{color:#ffe3a8}
@keyframes lvTw{50%{transform:scale(1.35) rotate(18deg);opacity:.65}}
@media (prefers-reduced-motion:reduce){.level-tile.lv-kids::after{animation:none}}
`;
wr("levels-cinema.css", css);
// C2 hub: copy of the C1 hub, renamed (only if it does not exist yet)
const c2 = path.join(root, "C2");
if (!fs.existsSync(c2)) {
  fs.mkdirSync(c2, { recursive: true });
  for (const f of fs.readdirSync(path.join(root, "C1"))) {
    const src = path.join(root, "C1", f); if (!fs.statSync(src).isFile() || /\.bak/.test(f)) continue;
    if (/\.(html|css|js)$/.test(f)) fs.writeFileSync(path.join(c2, f), fs.readFileSync(src, "utf8").replace(/C1 - Advanced/g, "C2 - Mastery").replace(/\bC1\b/g, "C2"));
    else fs.copyFileSync(src, path.join(c2, f));
  }
  console.log("Created C2 hub from C1.");
}
console.log("Done: levels page now has eight tiles.");
