// SayBon full-project audit. Usage: node tools\audit-full.mjs C:\SayBon [other project folders...] [--no-live]
import fs from "fs"; import path from "path"; import { spawnSync } from "child_process";
const args = process.argv.slice(2), NOLIVE = args.includes("--no-live"), roots = args.filter(a => !a.startsWith("--")).map(r => path.resolve(r));
if (!roots.length) roots.push(path.resolve("."));
const SITE = "https://saybonapp.com";
const SKIP = new Set(["node_modules", ".git", ".firebase", "cache", "_QUARANTINE", "tmp"]);
const out = [], issues = { HIGH: [], MED: [], LOW: [] };
const P = s => out.push(s), flag = (sev, s) => issues[sev].push(s);
const walk = (d, f = []) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return f; } for (const e of es) { if (SKIP.has(e.name) || e.name.startsWith("_QUARANTINE")) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p, f); else f.push(p); } return f; };
const kb = n => n > 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.round(n / 1e3) + " KB";
const rel = (r, p) => path.relative(r, p).replace(/\\/g, "/");
for (const root of roots) {
  P(`\n################ PROJECT: ${root}`);
  const files = walk(root), size = files.reduce((t, f) => t + fs.statSync(f).size, 0);
  P(`${files.length} files, ${kb(size)} (node_modules, .git and the audio cache are skipped)`);
  // A inventory
  P("\n== A. Folders (files / size)");
  const top = {}; for (const f of files) { const k = rel(root, f).split("/")[0]; const t = top[k] || (top[k] = { n: 0, s: 0 }); t.n++; t.s += fs.statSync(f).size; }
  Object.entries(top).sort((a, b) => b[1].s - a[1].s).slice(0, 25).forEach(([k, v]) => P(`  ${k}: ${v.n} files, ${kb(v.s)}`));
  P("\n== A2. Largest files");
  files.map(f => [f, fs.statSync(f).size]).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([f, s]) => { P(`  ${kb(s)}  ${rel(root, f)}`); if (s > 25e6) flag("MED", `very large file ${rel(root, f)} (${kb(s)})`); });
  // B syntax
  P("\n== B. JavaScript syntax"); let jsN = 0, jsBad = 0;
  for (const f of files.filter(f => /\.(m?js|cjs)$/.test(f) && fs.statSync(f).size < 3e6)) { jsN++;
    let r = spawnSync(process.execPath, ["--check", f], { encoding: "utf8" });
    if (r.status !== 0) { const src = fs.readFileSync(f, "utf8"); const r2 = spawnSync(process.execPath, ["--input-type=module", "--check"], { input: src, encoding: "utf8" }); if (r2.status !== 0) { jsBad++; const m = (r.stderr || "").split("\n").find(l => /SyntaxError/.test(l)) || "syntax error"; P(`  BAD: ${rel(root, f)}  ${m.trim()}`); flag("HIGH", `JavaScript will not run: ${rel(root, f)} (${m.trim()})`); } } }
  P(`  ${jsN} scripts checked, ${jsBad} broken`);
  // C json
  P("\n== C. JSON files"); let jN = 0;
  for (const f of files.filter(f => /\.json$/.test(f) && fs.statSync(f).size < 20e6)) { jN++; try { JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "")); } catch (e) { P(`  BAD: ${rel(root, f)} ${e.message}`); flag("HIGH", `invalid JSON: ${rel(root, f)}`); } }
  P(`  ${jN} files checked`);
  // D html refs
  const pub = ["public", "dist", "build", "www"].map(d => path.join(root, d)).find(d => fs.existsSync(d)) || null;
  let fb = null; try { fb = JSON.parse(fs.readFileSync(path.join(root, "firebase.json"), "utf8").replace(/^\uFEFF/, "")); } catch {}
  const hostPub = fb && fb.hosting && (Array.isArray(fb.hosting) ? fb.hosting[0].public : fb.hosting.public);
  const pubDir = hostPub ? path.join(root, hostPub) : pub;
  if (pubDir && fs.existsSync(pubDir)) {
    const pf = walk(pubDir), htmls = pf.filter(f => /\.html$/.test(f));
    P(`\n== D. Pages: ${htmls.length} html files in ${rel(root, pubDir)}`);
    const exists = (base, u) => { u = u.split("#")[0].split("?")[0]; if (!u) return true; let p = u.startsWith("/") ? path.join(pubDir, decodeURIComponent(u)) : path.resolve(path.dirname(base), decodeURIComponent(u)); if (fs.existsSync(p)) return fs.statSync(p).isFile() || fs.existsSync(path.join(p, "index.html")); return false; };
    const ver = {}; let missing = 0;
    for (const f of htmls) { const s = fs.readFileSync(f, "utf8");
      if (!/<title>/i.test(s)) flag("LOW", `no <title>: ${rel(root, f)}`);
      if (!/viewport/i.test(s)) flag("MED", `no mobile viewport tag: ${rel(root, f)}`);
      for (const m of s.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) { const u = m[1]; if (/^(https?:|\/\/|mailto:|tel:|data:|javascript:|#|about:|\{|<|\$)/i.test(u) || u.includes("{{") || /[+"']/.test(u.trim()) || u.trim() === "lesson") continue; const b = u.split("#")[0].split("?")[0].replace(/^.*\//, ""); if (/\.(js|css)$/.test(b)) { const q = (u.match(/\?v=([\w.]+)/) || [])[1] || "none"; ((ver[u.split("?")[0]] ||= {})[q] ||= []).push(rel(pubDir, f)); }
        if (!exists(f, u)) { missing++; P(`  MISSING: ${u}   (in ${rel(pubDir, f)})`); flag("HIGH", `${rel(pubDir, f)} refers to a file that is not there: ${u}`); } } }
    P(`  ${missing} broken references`);
    P("\n== D2. Script/style versions that differ between pages (stale cache risk)");
    for (const [u, v] of Object.entries(ver)) { const ks = Object.keys(v); if (ks.length > 1) { P(`  ${u}: ` + ks.map(k => `v=${k} (${v[k].length} pages)`).join(" | ")); flag("MED", `${u} loaded with different versions: ${ks.join(", ")}`); } }
    // E asset names mentioned in code
    P("\n== E. Assets named inside scripts/pages/data");
    const text = pf.filter(f => /\.(js|html|css|json)$/.test(f) && fs.statSync(f).size < 4e6).map(f => [f, fs.readFileSync(f, "utf8")]);
    const seen = new Set(); let mm = 0;
    for (const [f, s] of text) for (const m of s.matchAll(/["'`](\/(?:assets|levels|images|img|audio|library)[A-Za-z0-9_\-\/.%]+\.(?:mp3|wav|ogg|m4a|mp4|webm|png|jpe?g|webp|svg|gif|json))(?:\?[^"'`]*)?["'`]/g)) { const u = m[1]; if (seen.has(u)) continue; seen.add(u); if (!fs.existsSync(path.join(pubDir, decodeURIComponent(u)))) { mm++; P(`  MISSING: ${u}  (named in ${rel(pubDir, f)})`); flag("HIGH", `${rel(pubDir, f)} names a file that is not in the project: ${u}`); } }
    P(`  ${seen.size} distinct asset paths checked, ${mm} missing`);
    // F unreferenced big media
    const blob = text.map(t => t[1]).join("\n");
    const media = pf.filter(f => /\.(mp3|wav|mp4|webm|png|jpe?g|webp)$/i.test(f) && fs.statSync(f).size > 1e6);
    const unref = media.filter(f => !blob.includes(path.basename(f))); P(`\n== F. Large media (over 1 MB) never named in any page or script: ${unref.length} of ${media.length} (they may be built from patterns, so check before deleting)`);
    unref.sort((a, b) => fs.statSync(b).size - fs.statSync(a).size).slice(0, 25).forEach(f => P(`  ${kb(fs.statSync(f).size)}  ${rel(pubDir, f)}`));
    const bigImg = pf.filter(f => /\.(png|jpe?g)$/i.test(f) && fs.statSync(f).size > 800e3); if (bigImg.length) { P(`\n  Images over 800 KB (slow on mobile data): ${bigImg.length}`); bigImg.slice(0, 15).forEach(f => P(`   ${kb(fs.statSync(f).size)}  ${rel(pubDir, f)}`)); flag("LOW", `${bigImg.length} images over 800 KB slow the site down on phones`); }
    // library
    const lib = htmls.filter(f => /library|seaborn|reader|book/i.test(rel(pubDir, f)));
    P(`\n== G. Library / readers: ${lib.length} pages`); const libDirs = {}; lib.forEach(f => { const d = path.dirname(rel(pubDir, f)); libDirs[d] = (libDirs[d] || 0) + 1; }); Object.entries(libDirs).slice(0, 30).forEach(([d, n]) => P(`  ${d}: ${n} pages`));
  } else { P("\n== D. No public/hosting folder found in this project (skipped page and asset checks)"); }
  // H firebase
  P("\n== H. Firebase configuration");
  if (!fb) { P("  no firebase.json here"); } else { P(`  hosting folder: ${hostPub || "(none)"}`); const h = fb.hosting && (Array.isArray(fb.hosting) ? fb.hosting[0] : fb.hosting) || {};
    const hdrs = (h.headers || []).map(x => x.source + " -> " + (x.headers || []).map(y => y.key + ":" + y.value).join(";")); P("  headers: " + (hdrs.length ? hdrs.join(" | ") : "none"));
    if (!hdrs.some(x => /cache-control/i.test(x))) flag("MED", "no Cache-Control rules in firebase.json: browsers may keep old scripts and audio after a deploy (this causes the 'my change did not show' problem). Set no-cache for js/html and long cache for audio.");
    P("  rewrites: " + ((h.rewrites || []).map(r => r.source + "->" + (r.destination || r.function || "")).join(" | ") || "none")); P(`  functions: ${fb.functions ? "yes" : "no"}   firestore rules: ${fb.firestore ? "yes" : "no"}`); }
  // I secrets
  P("\n== I. Possible secrets left in files (values hidden)");
  const pats = [[/sk_[A-Za-z0-9]{20,}/, "ElevenLabs/Stripe-style secret key"], [/AIza[0-9A-Za-z_\-]{35}/, "Google API key (normal inside a web app's Firebase config, but check restrictions)"], [/-----BEGIN (RSA |EC )?PRIVATE KEY-----/, "private key"], [/xi-api-key["']?\s*[:=]\s*["'][A-Za-z0-9]{16,}/i, "ElevenLabs key"], [/(secret|password|passwd|api[_-]?key|token)["']?\s*[:=]\s*["'][A-Za-z0-9_\-+/]{16,}["']/i, "hard-coded credential"]];
  let sc = 0; for (const f of files.filter(f => /\.(m?js|json|html|env|ps1|txt|md|yml|yaml)$/i.test(f) && fs.statSync(f).size < 2e6)) { const ls = fs.readFileSync(f, "utf8").split("\n"); ls.forEach((l, i) => { const fbk = /AIza[0-9A-Za-z_\-]{35}/.test(l); for (const [re, why] of pats) if (re.test(l) && !/AIza/.test(why) && !(fbk && why === "hard-coded credential")) { sc++; P(`  ${rel(root, f)}:${i + 1}  ${why}`); flag("HIGH", `${why} in ${rel(root, f)} line ${i + 1}`); } }); }
  if (fs.existsSync(path.join(root, ".env"))) { const g = fs.existsSync(path.join(root, ".gitignore")) ? fs.readFileSync(path.join(root, ".gitignore"), "utf8") : ""; if (!/\.env/.test(g)) flag("HIGH", ".env exists but is not in .gitignore"); }
  P(`  ${sc} findings`);
  // J git
  P("\n== J. Git state");
  if (fs.existsSync(path.join(root, ".git"))) { const g = a => spawnSync("git", a, { cwd: root, encoding: "utf8" }).stdout || ""; const st = g(["status", "--porcelain"]).trim().split("\n").filter(Boolean); P(`  uncommitted changes: ${st.length}`); st.slice(0, 15).forEach(l => P("   " + l)); if (st.length) flag("LOW", `${st.length} uncommitted changes in ${root}`); P("  last commits:\n   " + g(["log", "-5", "--oneline"]).trim().split("\n").join("\n   ")); const gi = fs.existsSync(path.join(root, ".gitignore")) ? fs.readFileSync(path.join(root, ".gitignore"), "utf8") : ""; if (!/node_modules/.test(gi)) flag("MED", "node_modules is not in .gitignore"); const tracked = g(["ls-files"]).split("\n"); const big = tracked.filter(f => f && fs.existsSync(path.join(root, f)) && fs.statSync(path.join(root, f)).size > 50e6); if (big.length) flag("MED", `files over 50 MB are tracked in git: ${big.slice(0, 5).join(", ")}`); } else P("  not a git folder");
  // K dependencies
  P("\n== K. Packages");
  for (const f of files.filter(f => path.basename(f) === "package.json")) { try { const j = JSON.parse(fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "")); P(`  ${rel(root, f)}: ${Object.keys(j.dependencies || {}).length} dependencies, node engine ${(j.engines || {}).node || "unspecified"}`); } catch {} }
}
// L live
if (!NOLIVE) { P("\n################ LIVE SITE");
  const tf = async (u, o = {}) => { for (let i = 0; i < 3; i++) { try { const r = await fetch(u, { ...o, signal: AbortSignal.timeout(45000), redirect: "follow" }); if (r.ok || i === 2) return r; } catch { if (i === 2) return null; } await new Promise(r => setTimeout(r, 3000)); } return null; };
  const root = roots.find(r => fs.existsSync(path.join(r, "public"))) || roots[0], pd = path.join(root, "public"); const pages = fs.existsSync(pd) ? walk(pd).filter(f => /\.html$/.test(f)).map(f => "/" + rel(pd, f)).slice(0, 400) : ["/"];
  let bad = 0; for (const u of pages) { const h = await tf(SITE + u, { method: "HEAD" }); if (!h || !h.ok) { bad++; P(`  ${h ? h.status : "no reply"}  ${u}`); flag("HIGH", `live page not loading: ${u} (${h ? h.status : "no reply"})`); } }
  P(`  ${pages.length} pages checked on the live site, ${bad} not loading`);
  const home = await tf(SITE + "/", { method: "GET" }); if (home) { const hd = n => home.headers.get(n); P(`  home page headers: cache-control=${hd("cache-control")} | content-security-policy=${hd("content-security-policy") ? "yes" : "no"} | strict-transport-security=${hd("strict-transport-security") ? "yes" : "no"} | x-content-type-options=${hd("x-content-type-options") || "no"}`); if (!hd("x-content-type-options")) flag("LOW", "live site lacks the X-Content-Type-Options security header"); }
  const js = await tf(SITE + "/levels/scene-paris/scene-ui.js", { method: "HEAD" }); if (js) P(`  scene-ui.js cache-control: ${js.headers.get("cache-control")}`);
  const srv = await tf("https://saybonapp-server.onrender.com/api/levelAssets?level=a1&lesson=1"); P(`  server lesson request: ${srv ? srv.status : "no reply"}`); if (!srv || !srv.ok) flag("HIGH", "the lesson server did not answer");
  const t0 = Date.now(); await tf("https://saybonapp-server.onrender.com/api/levelAssets?level=a1&lesson=2"); P(`  server response time: ${Date.now() - t0} ms`); if (Date.now() - t0 > 4000) flag("LOW", "the lesson server is slow to answer (free hosting goes to sleep; the first learner each hour waits)");
}
// M lesson system
const lessonAudit = path.join(path.dirname(process.argv[1]), "audit.mjs"); const mainRoot = roots.find(r => fs.existsSync(path.join(r, "public", "levels"))) || null;
if (mainRoot && fs.existsSync(lessonAudit) && !NOLIVE) { P("\n################ LESSON AUDIO AND RECORDERS (the lesson audit)"); const r = spawnSync(process.execPath, [lessonAudit, mainRoot], { encoding: "utf8", maxBuffer: 5e7 }); const txt = r.stdout || ""; P(txt.split("\n").filter(l => /!!|RESULT|==|^\s+[A-C][12]-\d/.test(l)).join("\n")); if (r.status !== 0) flag("HIGH", "the lesson audit found problems (see the lesson section below)"); }
const head = [`SAYBON FULL AUDIT  ${new Date().toISOString()}`, `HIGH: ${issues.HIGH.length}   MEDIUM: ${issues.MED.length}   LOW: ${issues.LOW.length}`, ""];
for (const [k, n] of [["HIGH", "HIGH (broken now or unsafe)"], ["MED", "MEDIUM (will cause trouble)"], ["LOW", "LOW (tidy up)"]]) { head.push(`== ${n}`); if (!issues[k].length) head.push("  none"); [...new Set(issues[k])].slice(0, 60).forEach((s, i) => head.push(`  ${i + 1}. ${s}`)); head.push(""); }
const report = head.concat(out).join("\n"); const dest = path.join(roots[0], "audit-full-report.txt"); fs.writeFileSync(dest, report);
console.log(head.join("\n")); console.log("Full report saved: " + dest);
