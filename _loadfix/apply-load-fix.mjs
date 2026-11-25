#!/usr/bin/env node
/* SayBon page-load fix. Run from your project root (the folder that contains /public and firebase.json):
 *     node _loadfix/apply-load-fix.mjs            apply
 *     node _loadfix/apply-load-fix.mjs --dry      only report what it WOULD change
 * Every file it touches is first copied to  _backup_loadfix_<time>/  (same folder layout), so you can undo.
 * Safe to run more than once. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const ROOT = path.resolve(args.find(a => !a.startsWith("--")) || process.cwd());
const PUB = path.join(ROOT, "public");
if (!fs.existsSync(PUB) || !fs.existsSync(path.join(ROOT, "firebase.json"))) {
  console.error("Run this from the SayBon project root (needs /public and firebase.json). Root tried: " + ROOT);
  process.exit(1);
}
const STAMP = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
const BACKUP = path.join(ROOT, "_backup_loadfix_" + STAMP);
const stats = {};
const warn = [];
const bump = k => (stats[k] = (stats[k] || 0) + 1);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name === "node_modules" || e.name.startsWith(".")) continue; walk(p, out); }
    else out.push(p);
  }
  return out;
}
const rel = p => path.relative(ROOT, p).replace(/\\/g, "/");
function backup(p) {
  if (DRY || !fs.existsSync(p)) return;
  const dest = path.join(BACKUP, path.relative(ROOT, p));
  if (fs.existsSync(dest)) return;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(p, dest);
}
function save(p, text) { backup(p); if (!DRY) fs.writeFileSync(p, text, "utf8"); }
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const flex = s => new RegExp(esc(s).replace(/\n/g, "\\r?\\n"));

/* exact-text patch of one file; reports instead of failing if the text is not found */
function patchFile(relPath, pairs, tag) {
  const p = path.join(ROOT, relPath);
  if (!fs.existsSync(p)) { warn.push("missing: " + relPath); return; }
  let t = fs.readFileSync(p, "utf8"), changed = false;
  for (const [from, to, marker] of pairs) {
    if (marker && t.includes(marker)) continue;                 // already applied
    const re = flex(from);
    if (!re.test(t)) { if (t.includes(to)) continue; warn.push(relPath + ": expected text not found (" + from.slice(0, 50).replace(/\n/g, " ") + "...)"); continue; }
    t = t.replace(new RegExp(re.source, "g"), () => to); changed = true;
  }
  if (changed) { save(p, t); bump(tag); }
}

const files = walk(PUB);
const htmls = files.filter(f => f.endsWith(".html"));
const jsAndHtml = files.filter(f => f.endsWith(".js") || f.endsWith(".html"));

/* ---------- 1. every signed-in page: gate + light guard + early connections + no font swap ---------- */
const GUARD_TAG = /<script\b[^>]*src=['"]\/js\/auth-guard\.js['"][^>]*>\s*<\/script>/;
const HINT = (o, cors) => `<link rel="preconnect" href="${o}"${cors ? " crossorigin" : ""}>`;
const hasPre = (t, o) => new RegExp(`rel=["']preconnect["'][^>]*href=["']${esc(o)}/?["']|href=["']${esc(o)}/?["'][^>]*rel=["']preconnect["']`).test(t);

for (const f of htmls) {
  let t = fs.readFileSync(f, "utf8"), o = t;
  const guarded = GUARD_TAG.test(t);
  const usesFonts = /fonts\.googleapis\.com\/css/.test(t);
  const hints = [];
  if (guarded) {
    if (!hasPre(t, "https://www.gstatic.com")) hints.push(HINT("https://www.gstatic.com", true));
    if (!hasPre(t, "https://saybonapp-server.onrender.com")) hints.push(HINT("https://saybonapp-server.onrender.com", true));
  }
  if (usesFonts) {
    if (!hasPre(t, "https://fonts.googleapis.com")) hints.push(HINT("https://fonts.googleapis.com", false));
    if (!hasPre(t, "https://fonts.gstatic.com")) hints.push(HINT("https://fonts.gstatic.com", true));
  }
  if (guarded && !t.includes("/js/auth-gate.js")) {
    t = t.replace(GUARD_TAG, () => hints.join("\n") + (hints.length ? "\n" : "") +
      '<script src="/js/auth-gate.js"></script>\n<script type="module" src="/js/auth-guard.js"></script>');
    bump("pages: gate + light guard");
  } else if (hints.length) {
    t = t.replace(/<head[^>]*>/i, m => m + "\n" + hints.join("\n"));
  }
  if (hints.length) bump("pages: early-connection hints added");
  // fonts: no late swap (the text blink). Cached after the first visit, so later pages show the real font at once.
  t = t.replace(/(fonts\.googleapis\.com\/css[^"'>]*?)display=swap/g, (m, a) => { bump("font links: swap -> optional"); return a + "display=optional"; });
  if (t !== o) save(f, t);
}

/* home + login are not gated, but they should wake the server too */
for (const r of ["public/index.html", "public/auth/login.html"]) {
  const p = path.join(ROOT, r);
  if (!fs.existsSync(p)) continue;
  let t = fs.readFileSync(p, "utf8");
  if (!t.includes("/js/warm.js")) { t = t.replace(/<\/head>/i, '<script src="/js/warm.js" defer></script>\n</head>'); save(p, t); bump("pages: server wake-up"); }
}

/* ---------- 3. dashboard: one paint, no jump ---------- */
const dash = path.join(PUB, "dashboard/index.html");
if (fs.existsSync(dash)) {
  let t = fs.readFileSync(dash, "utf8"), o = t;
  if (!t.includes("snow-pan.js")) t = t.replace(/<body[^>]*>/i, m => m + '\n<script src="/dashboard/snow-pan.js"></script>');
  if (!t.includes("sb-instant")) {
    const inline = fs.readFileSync(path.join(HERE, "payload/public/dashboard/dashboard-instant.inline.js"), "utf8").trim();
    t = t.replace(/<script src="\/dashboard\/dashboard\.js/, m => `<script>/*sb-instant*/\n${inline}\n</script>\n` + m);
  }
  if (t !== o) { save(dash, t); bump("dashboard/index.html"); }
}
patchFile("public/dashboard/level-sync.js", [[
  `const show = (lv) => document.querySelectorAll(".js-profile-level").forEach((el) => { el.textContent = lv; });`,
  `const show = (lv) => { try { localStorage.setItem("sb_level_cache", lv); } catch (e) {} document.querySelectorAll(".js-profile-level").forEach((el) => { if (el.textContent !== lv) el.textContent = lv; }); };`,
  "sb_level_cache"]], "dashboard/level-sync.js");

/* ---------- 4. lessons: start loading content at once, show the saved copy instantly ---------- */
patchFile("public/levels/lesson-engine-tp.js", [
  [`import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

window.lsCurrentUid = null;
onAuthStateChanged(auth, function(user){
  window.lsCurrentUid = user ? user.uid : null;
});`,
   `window.lsCurrentUid = null;
/* loaded on the side so the lesson request below is not held up by Firebase */
import("/js/firebase-core.js").then(function(m){
  m.onAuthStateChanged(m.auth, function(user){ window.lsCurrentUid = user ? user.uid : null; });
}).catch(function(){});`, "m.onAuthStateChanged(m.auth"],
  [`fetch(API_BASE + "/api/levelAssets?level=" + LEVEL + "&lesson=" + LESSON)
  .then(function(res){ return res.json(); })
  .then(function(assets){`,
   `function sbLoadAssets(){
  var K = "sb_la_" + LEVEL + "_" + LESSON, cached = null;
  try{ cached = JSON.parse(localStorage.getItem(K) || "null"); }catch(e){}
  var net = fetch(API_BASE + "/api/levelAssets?level=" + LEVEL + "&lesson=" + LESSON)
    .then(function(res){ return res.json(); })
    .then(function(a){ try{ if(Array.isArray(a) && a.length){ localStorage.setItem(K, JSON.stringify(a)); } }catch(e){} return a; });
  if(cached && cached.length){ net.catch(function(){}); return Promise.resolve(cached); }   /* saved copy now, refreshed for next time */
  return net;
}
sbLoadAssets()
  .then(function(assets){`, "function sbLoadAssets"]
], "levels/lesson-engine-tp.js");

/* ---------- 5. login remembers the sign-in so the dashboard paints at once ---------- */
patchFile("public/auth/login.js", [[
  `window.location.href = "/dashboard/";`,
  `try{ localStorage.setItem("sb_auth","1"); }catch(e){} window.location.href = "/dashboard/";`, `localStorage.setItem("sb_auth"`]], "auth/login.js");

/* ---------- 2. app-wide: pages that only need auth stop downloading Firestore ---------- */
const IMP = /import\s*\{([^}]*)\}\s*from\s*(["'])([^"']*?)firebase-init\.js\2/g;
for (const f of jsAndHtml) {
  const t0 = fs.readFileSync(f, "utf8");
  if (!t0.includes("firebase-init.js")) continue;
  const t = t0.replace(IMP, (m, names, q, dir) => {
    const ok = names.split(",").map(s => s.trim()).filter(Boolean).every(n => /^(app|auth)(\s+as\s+\w+)?$/.test(n));
    if (!ok) return m;
    bump("imports: firebase-init -> firebase-core (no Firestore)");
    return m.replace("firebase-init.js", "firebase-core.js");
  });
  if (t !== t0) save(f, t);
}

/* ---------- 6. choppy entrance animations: no full-page blur (keeps fade + slide) ---------- */
const BLUR_DIRS = ["music", "translation", "talkletics", "chat", "feedback", "professional"].map(d => path.join(PUB, d) + path.sep);
function deblur(text) {
  const names = new Set();
  let out = text.replace(/(@keyframes\s+([\w-]+)\s*\{)((?:[^{}]*\{[^{}]*\})+[^{}]*)(\})/g, (m, a, name, body, z) => {
    if (!/blur\(/.test(body)) return m;
    names.add(name);
    return a + body.replace(/\s*filter\s*:\s*blur\([^)]*\)\s*;?/g, "") + z;
  });
  if (names.size) {
    out = out.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, body) => {
      if (/@keyframes/.test(sel)) return m;
      const uses = [...names].some(n => new RegExp(`animation(?:-name)?\\s*:[^;]*\\b${esc(n)}\\b`).test(body));
      return uses && /filter\s*:\s*blur\(/.test(body) ? sel + "{" + body.replace(/\s*filter\s*:\s*blur\([^)]*\)\s*;?/g, "") + "}" : m;
    });
  }
  return out;
}
for (const f of files.filter(f => /\.(css|html)$/.test(f) && BLUR_DIRS.some(d => f.startsWith(d)))) {
  const t = fs.readFileSync(f, "utf8"), n = deblur(t);
  if (n !== t) { save(f, n); bump("files: entrance blur removed"); }
}
patchFile("public/css/page-reveal.css", [[`  opacity:0;
  filter:blur(6px);`, `  opacity:0;`], [`  opacity:1;
  filter:blur(0);
  transition:
    opacity .7s ease,
    filter .8s ease;`, `  opacity:1;
  transition:opacity .5s ease;`]], "css/page-reveal.css");

/* ---------- 7. new / replaced shared files ---------- */
const payload = path.join(HERE, "payload");
for (const f of walk(payload)) {
  if (f.endsWith(".inline.js")) continue;
  const dest = path.join(ROOT, path.relative(payload, f));
  const nw = fs.readFileSync(f, "utf8");
  if (fs.existsSync(dest) && fs.readFileSync(dest, "utf8") === nw) continue;
  backup(dest);
  if (!DRY) { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, nw, "utf8"); }
  bump("shared files written");
}

/* ---------- 8. hosting cache rules ---------- */
{
  const p = path.join(ROOT, "firebase.json");
  const j = JSON.parse(fs.readFileSync(p, "utf8").replace(/^\uFEFF/, ""));
  const h = j.hosting;
  const keep = (h.headers || []).filter(x => x.source !== "**/*.@(html|js|css)" && x.source !== "/professional/**" && !/^\*\*\/\*\.(html|@\(js\|css\)|@\(webp)/.test(x.source));
  const cc = v => [{ key: "Cache-Control", value: v }];
  h.headers = [
    ...keep,
    { source: "**/*.html", headers: cc("no-cache") },
    { source: "**/*.@(js|css)", headers: cc("public, max-age=120, stale-while-revalidate=604800") },
    { source: "**/*.@(webp|png|jpg|jpeg|gif|svg|ico|mp3|m4a|ogg|wav|mp4|webm|woff|woff2)", headers: cc("public, max-age=86400, stale-while-revalidate=604800") }
  ];
  const nw = JSON.stringify(j, null, 2) + "\n";
  if (nw !== fs.readFileSync(p, "utf8")) { save(p, nw); bump("firebase.json"); }
}

console.log((DRY ? "DRY RUN - nothing written.\n" : "Done. Backup of every changed file: " + path.basename(BACKUP) + "\n"));
for (const [k, v] of Object.entries(stats)) console.log(String(v).padStart(5) + "  " + k);
if (warn.length) { console.log("\nNeeds a look:"); warn.forEach(w => console.log("  - " + w)); }
