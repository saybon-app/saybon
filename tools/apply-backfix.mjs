// Les Petits / Tout Public back buttons: stop the old A0 chooser page from appearing.
// Usage: node apply-backfix.mjs <publicDir>   (no git, no deploy: safe to run while a build is running)
import fs from "fs"; import path from "path";
const pub = process.argv[2] || "public", lv = path.join(pub, "levels");
const chooser = ["A0", "a0"].map(d => path.join(lv, d, "index.html")).find(f => fs.existsSync(f));
if (!chooser) { console.log("STOP: no levels/A0/index.html found. Send me this line."); process.exit(1); }
const txt = fs.readFileSync(chooser, "utf8");
if (!/petits/i.test(txt) || !/tout[ -]?public/i.test(txt)) { console.log("STOP: " + chooser + " does not look like the old chooser (no Les Petits / Tout Public tiles). Not touching it."); process.exit(1); }
/* safety: the levels page must not link into the chooser, or it would loop */
const bad = [];
for (const f of ["index.html", "levels.js", "levels-cinema.js", "hub-unlock-tp.js"]) { const p = path.join(lv, f); if (!fs.existsSync(p)) continue; const s = fs.readFileSync(p, "utf8"); const m = s.match(/["'`](?:\.\/|\/levels\/|levels\/)?[Aa]0\/?(?:index\.html)?["'`]/g); if (m) bad.push(f + ": " + m.slice(0, 3).join(" ")); }
if (bad.length) { console.log("STOP: the levels page links to the old chooser, redirecting it would loop:\n  " + bad.join("\n  ") + "\nSend me these lines."); process.exit(1); }
if (txt.includes("/*backfix*/")) { console.log("Already patched: " + chooser); process.exit(0); }
fs.writeFileSync(chooser + ".bakBF", txt);
const snip = '<script>/*backfix*/location.replace("/levels/");</script>';
const out = /<head[^>]*>/i.test(txt) ? txt.replace(/<head[^>]*>/i, m => m + snip) : snip + txt;
fs.writeFileSync(chooser, out);
console.log("Done: " + chooser + " now sends visitors to /levels/. Test: open a lesson, press back twice.");
/* report only: other pages that name the chooser */
const hits = []; (function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!/node_modules|assets/.test(e.name)) walk(p); } else if (/\.(html|js)$/.test(e.name) && !/\.bak/.test(e.name) && p !== chooser) { const s = fs.readFileSync(p, "utf8"); if (/["'](?:\.\.\/|\/levels\/)[Aa]0\/?["']/.test(s)) hits.push(p); } } })(lv);
if (hits.length) console.log("Pages that still point at the old chooser (they now bounce to /levels/):\n  " + hits.join("\n  "));
