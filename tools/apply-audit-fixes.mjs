// Safe fixes from the full audit: cache rules in firebase.json, mobile viewport tag on responsive pages, plus a diagnosis print. Backup of firebase.json: .bakD (pages are backed up by git)
import fs from "fs"; import path from "path";
const root = path.resolve(process.argv[2] || "C:/SayBon"), pub = path.join(root, "public");
const strip = s => s.replace(/^\uFEFF/, "");
// 1. firebase.json cache rules
const fF = path.join(root, "firebase.json");
if (fs.existsSync(fF)) { const raw = fs.readFileSync(fF, "utf8"); let j; try { j = JSON.parse(strip(raw)); } catch (e) { console.log("firebase.json: cannot read (" + e.message + ") - skipped"); }
  if (j) { const h = Array.isArray(j.hosting) ? j.hosting[0] : j.hosting; if (!h) console.log("firebase.json: no hosting block - skipped"); else { h.headers = h.headers || [];
      if (h.headers.some(x => (x.headers || []).some(y => /cache-control/i.test(y.key)))) console.log("firebase.json: already has Cache-Control rules - left alone");
      else { fs.writeFileSync(fF + ".bakD", raw); h.headers.push({ source: "**/*.@(html|js|css)", headers: [{ key: "Cache-Control", value: "no-cache" }] }); fs.writeFileSync(fF, JSON.stringify(j, null, 2) + "\n"); console.log("firebase.json: added no-cache for html, js and css (the browser still re-uses them when nothing changed)"); } } } }
// 2. viewport on responsive pages
const walk = (d, f = []) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (!["node_modules", ".git"].includes(e.name)) walk(p, f); } else f.push(p); } return f; };
let added = 0; const skipped = [];
for (const f of walk(pub).filter(f => /\.html$/.test(f))) { let s = fs.readFileSync(f, "utf8"); if (/viewport/i.test(s) || !/<head[^>]*>/i.test(s)) continue;
  let resp = /@media/.test(s); if (!resp) for (const m of s.matchAll(/href=["']([^"'#?]+\.css)/gi)) { const cp = m[1].startsWith("/") ? path.join(pub, m[1]) : path.resolve(path.dirname(f), m[1]); try { if (/@media/.test(fs.readFileSync(cp, "utf8"))) { resp = true; break; } } catch {} }
  if (resp) { fs.writeFileSync(f, s.replace(/<head[^>]*>/i, m => m + '\n<meta name="viewport" content="width=device-width, initial-scale=1">')); added++; } else skipped.push(path.relative(pub, f).replace(/\\/g, "/")); }
console.log(`viewport tag added to ${added} responsive pages`); if (skipped.length) { console.log(`left alone (no sign they are built for phones, so adding the tag could break their layout): ${skipped.length}`); skipped.forEach(x => console.log("   " + x)); }
// 3. diagnosis
console.log("\n--- diagnosis ---");
const rq = path.join(pub, "js", "request.js"); if (fs.existsSync(rq)) { const t = fs.readFileSync(rq, "utf8"); console.log(`public/js/request.js: ${t.length} bytes, starts with: ${JSON.stringify(t.slice(0, 120))}`); const users = walk(pub).filter(f => /\.(html|js)$/.test(f) && f !== rq && fs.readFileSync(f, "utf8").includes("request.js")); console.log("  used by: " + (users.map(u => path.relative(pub, u)).join(", ") || "nothing (safe to delete)")); }
const mf = path.join(pub, "manifest.json"); if (fs.existsSync(mf)) console.log(`public/manifest.json: ${fs.statSync(mf).size} bytes ${fs.statSync(mf).size === 0 ? "(EMPTY)" : ""}`);
for (const [f, name] of [["features/delf/tests/prim.html", "DELF prim test"], ["features/delf/start-test.html", "DELF start page"]]) console.log(`${name} exists: ${fs.existsSync(path.join(pub, f))}`);
const pp = walk(pub).filter(f => /\.(pptx|docx|xlsx|pdf)$/i.test(f)); console.log("office/PDF files publicly downloadable on the site:\n" + (pp.map(f => "   " + path.relative(pub, f).replace(/\\/g, "/") + "  (" + Math.round(fs.statSync(f).size / 1e3) + " KB)").join("\n") || "   none"));
