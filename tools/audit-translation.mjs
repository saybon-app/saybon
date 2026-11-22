// READ-ONLY audit of the whole translation system. Changes nothing. Writes one report file.
// node tools/audit-translation.mjs <outFile> [--no-live]
import fs from "fs";
import path from "path";
import crypto from "crypto";

const OUT = process.argv[2] || "translation-audit.txt";
const LIVE = !process.argv.includes("--no-live");
const BASE = "https://saybonapp.com", SERVER = "https://saybonapp-server.onrender.com";
const PUB = "public";
const L = []; const flags = { HIGH: [], MED: [], LOW: [] };
const out = (s = "") => L.push(s);
const H = (s) => { out(""); out("=".repeat(78)); out(s); out("=".repeat(78)); };
const flag = (sev, where, msg) => { flags[sev].push(where + ": " + msg); out("  [" + sev + "] " + where + ": " + msg); };
const rd = (f) => { try { return fs.readFileSync(f, "utf8"); } catch (e) { return null; } };
const ex = (f) => { try { return fs.statSync(f); } catch (e) { return null; } };
const kb = (n) => (n / 1024).toFixed(n > 10240 ? 0 : 1) + " KB";
const redact = (s) => s.replace(/(sk|rk)_(live|test)_[A-Za-z0-9]+/g, "$1_$2_<hidden>").replace(/[A-Za-z0-9_\-]{40,}/g, "<long-token-hidden>");
const lineOf = (txt, idx) => txt.slice(0, idx).split("\n").length;

// ---------- file sets ----------
function walk(d, acc = []) { if (!ex(d)) return acc; for (const n of fs.readdirSync(d)) { const p = path.join(d, n); const s = fs.statSync(p); if (s.isDirectory()) { if (n === "node_modules" || n.startsWith(".")) continue; walk(p, acc); } else acc.push(p); } return acc; }
const slash = (p) => p.split(path.sep).join("/");
const trFiles = walk(PUB + "/translation").map(slash);
const extraPages = [PUB + "/translators.html", PUB + "/features/translation/index.html", PUB + "/admin/translation-admin.html", PUB + "/features/admin/translation-review/index.html", PUB + "/features/admin/translation/index.html"].filter(ex);
walk(PUB + "/features/translation").map(slash).forEach((f) => { if (!extraPages.includes(f) && /\.(html|js|css)$/.test(f)) extraPages.push(f); });
const pages = [...new Set([...trFiles.filter((f) => f.endsWith(".html")), ...extraPages.filter((f) => f.endsWith(".html"))])];
const scripts = [...new Set([...trFiles.filter((f) => f.endsWith(".js")), ...extraPages.filter((f) => f.endsWith(".js"))])];

out("SAYBON TRANSLATION SYSTEM AUDIT (read-only)");
out("Run: " + new Date().toISOString() + "   Live checks: " + (LIVE ? "on" : "off"));
out("Pages scanned: " + pages.length + "   Scripts: " + scripts.length);

// ---------- 1 inventory ----------
H("1. INVENTORY");
for (const f of [...pages, ...scripts, ...trFiles.filter((f) => /\.(css|json)$/.test(f))]) { const s = ex(f); out("  " + f.padEnd(60) + kb(s.size).padStart(9) + "  " + s.mtime.toISOString().slice(0, 10)); }

// ---------- 2 server routes ----------
H("2. SERVER ROUTES");
const srvFiles = fs.readdirSync(".").filter((f) => f.endsWith(".js") && !/^(index)\.js$/.test(f));
const routes = [];
for (const f of srvFiles) {
  const t = rd(f); if (!t) continue;
  const re = /\b(?:app|router)\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]([^\n]*)/g; let m; const hits = [];
  while ((m = re.exec(t))) hits.push({ f, method: m[1].toUpperCase(), p: m[2], rest: m[3], idx: m.index, line: lineOf(t, m.index), t });
  hits.forEach((h, i) => { h.body = t.slice(h.idx, i + 1 < hits.length ? hits[i + 1].idx : Math.min(t.length, h.idx + 6000)); routes.push(h); });
}
const MONEY = /pay|wallet|payout|withdraw|paystack|stripe|checkout|refund|momo/i;
const TRANS = /translat|job|nda|formatting|paystack|payout|wallet|segment|review/i;
const AUTHTOK = /requireAdminAuth|requireUser|requireSelf|verifyIdToken|verifyTranslatorKey|passkey|authorization|apiKey|secret|signature/i;
const tr = routes.filter((r) => TRANS.test(r.p));
out("Routes found (all files): " + routes.length + "   translation/job/payment related: " + tr.length);
for (const r of tr) {
  const auth = AUTHTOK.test(r.rest + r.body.slice(0, 2500)), rl = /rateLimit\(/.test(r.rest), tx = /runTransaction|\.batch\(\)/.test(r.body);
  out("  " + (r.method + " " + r.p).padEnd(48) + (r.f + ":" + r.line).padEnd(22) + "auth:" + (auth ? "yes" : "NO ") + " rateLimit:" + (rl ? "yes" : "no ") + " transaction:" + (tx ? "yes" : "no"));
  if (!auth && r.method !== "GET" && MONEY.test(r.p)) flag("HIGH", r.method + " " + r.p, "money-related route with no sign of authentication or signature check (verify by hand)");
  else if (!auth && r.method !== "GET") flag("MED", r.method + " " + r.p, "write route with no visible authentication (may rely on a job key or passkey, verify)");
  if (!rl && r.method === "POST" && /createTranslation|submit|complete|apply|register|payout|withdraw/i.test(r.p)) flag("LOW", r.method + " " + r.p, "no rate limit");
}
const routeSet = new Set(routes.map((r) => r.p));

// ---------- 3 per-page checks ----------
H("3. PAGE-BY-PAGE");
const fsCfg = (() => { try { return JSON.parse(rd("firebase.json")); } catch (e) { return {}; } })();
const cleanUrls = !!(fsCfg.hosting && fsCfg.hosting.cleanUrls);
const rewrites = (fsCfg.hosting && fsCfg.hosting.rewrites) || [];
function resolveRef(page, ref) {
  if (/^(https?:)?\/\//i.test(ref)) return { ext: true };
  if (/^(mailto:|tel:|javascript:|data:|blob:|#|sms:|whatsapp:)/i.test(ref)) return { skip: true };
  let r = ref.split("#")[0].split("?")[0]; if (!r) return { skip: true };
  let p = r.startsWith("/") ? PUB + r : slash(path.join(path.dirname(page), r));
  p = slash(path.normalize(p));
  const cands = [p]; if (p.endsWith("/")) cands.push(p + "index.html"); else if (!path.extname(p)) { cands.push(p + ".html", p + "/index.html"); }
  for (const c of cands) { const s = ex(c); if (s && s.isFile()) return { file: c, size: s.size }; }
  const rw = rewrites.some((w) => { try { return new RegExp("^" + (w.source || "").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$").test(r); } catch (e) { return false; } });
  return rw ? { rewrite: true } : { missing: p };
}
const graph = {}, liveQueue = new Set(), pageWeights = {};
const allText = {};
for (const page of pages) {
  const html = rd(page) || ""; allText[page] = html;
  out(""); out("-- " + page + "  (" + kb(html.length) + ")");
  const W = (sev, msg) => flag(sev, page, msg);
  const title = (html.match(/<title[^>]*>([^<]*)/i) || [])[1];
  if (!title || !title.trim()) W("LOW", "no <title>");
  if (!/name=["']viewport["']/i.test(html)) W("MED", "no viewport meta (renders tiny on phones)");
  if (!/<html[^>]*\slang=/i.test(html)) W("LOW", "no lang attribute on <html>");
  // references
  const refs = new Set();
  let m; const reA = /(?:src|href|action|poster)\s*=\s*["']([^"']+)["']/gi; while ((m = reA.exec(html))) refs.add(m[1]);
  const reL = /(?:location(?:\.href)?\s*=|location\.(?:assign|replace)\()\s*["'`]([^"'`]+)["'`]/g; while ((m = reL.exec(html))) refs.add(m[1]);
  const linkedJs = [];
  for (const r of refs) { const s = /\.js(\?|$)/.test(r) ? resolveRef(page, r) : null; if (s && s.file) linkedJs.push(s.file); }
  const jsText = linkedJs.map((f) => rd(f) || "").join("\n");
  const reL2 = /(?:location(?:\.href)?\s*=|location\.(?:assign|replace)\()\s*["'`]([^"'`]+)["'`]/g; while ((m = reL2.exec(jsText))) refs.add(m[1]);
  graph[page] = new Set(); let weight = html.length; const assets = [];
  for (const r of refs) {
    if (/[+`]|\$\{|\|^\s/.test(r) || r.includes(" + ")) continue;
    const res = resolveRef(page, r);
    if (res.missing) W("HIGH", "broken reference -> " + r + "  (nothing at " + res.missing + ")");
    else if (res.file) { graph[page].add(res.file); if (!/\.html$/.test(res.file)) { weight += res.size; assets.push([res.file, res.size]); } liveQueue.add(res.file); }
    else if (res.ext && /^https?:\/\/(?!saybonapp)/i.test(r)) { /* external listed below */ }
  }
  // css url() weight
  for (const [f] of assets.filter((a) => a[0].endsWith(".css"))) { const c = rd(f) || ""; let u; const ru = /url\(\s*["']?([^)"']+)/g; while ((u = ru.exec(c))) { const rr = resolveRef(f, u[1]); if (rr.file) { weight += rr.size; assets.push([rr.file, rr.size]); } else if (rr.missing) W("HIGH", "css " + f + " points to missing file " + u[1]); } if (/@import/.test(c)) W("MED", f + " uses @import (blocks rendering one file at a time)"); }
  pageWeights[page] = { weight, assets };
  assets.sort((a, b) => b[1] - a[1]);
  out("  Local files this page pulls in: " + assets.length + "   total about " + kb(weight) + (assets[0] ? "   heaviest: " + assets.slice(0, 3).map((a) => path.basename(a[0]) + " " + kb(a[1])).join(", ") : ""));
  if (weight > 1.5 * 1024 * 1024) W("MED", "heavy page: " + kb(weight) + " before fonts and API data (slow on mobile data)");
  for (const [f, s] of assets) { if (/\.(png|jpe?g|gif)$/i.test(f) && s > 150 * 1024) W("MED", "large unoptimised image " + f + " " + kb(s) + " (convert to webp)"); else if (/\.(webp|png|jpe?g|svg)$/i.test(f) && s > 400 * 1024) W("MED", "large image " + f + " " + kb(s)); if (/\.(mp3|mp4|wav)$/i.test(f) && s > 1024 * 1024) W("LOW", "large media file " + f + " " + kb(s)); }
  // head blocking scripts
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [""])[0];
  const blocking = (head.match(/<script\b[^>]*\bsrc=[^>]*>/gi) || []).filter((s) => !/\b(defer|async)\b|type=["']module["']/i.test(s));
  if (blocking.length) W("LOW", blocking.length + " script(s) in <head> block the first paint (no defer/async/module): " + blocking.map((s) => (s.match(/src=["']([^"']+)/) || [])[1]).join(", "));
  // fonts and external hosts
  const ext = [...new Set([...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)/gi)].map((x) => x[1]))].filter((u) => !/saybonapp/.test(u));
  ext.forEach((u) => { out("  external: " + u.slice(0, 120)); if (/fonts\.googleapis/.test(u)) { const fam = (u.match(/family=/g) || []).length; if (!/display=swap/.test(u)) W("LOW", "Google font link without display=swap (text can stay invisible while loading)"); if (fam > 3) W("LOW", fam + " font families loaded"); } if (/(cdn|unpkg|jsdelivr|cdnjs)/.test(u) && /@latest|\/latest\//.test(u)) W("MED", "unpinned CDN version " + u.slice(0, 80)); });
  if (/fonts\.googleapis/.test(html) && !/rel=["']preconnect["']/i.test(html)) W("LOW", "Google Fonts used without preconnect");
  const inl = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].reduce((a, x) => a + x[1].length, 0);
  if (inl > 40000) W("LOW", "inline script is " + kb(inl) + " (hard to cache, hard to maintain)");
  // images
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((x) => x[0]);
  const noAlt = imgs.filter((i) => !/\balt=/i.test(i)).length, noDim = imgs.filter((i) => !/\bwidth=/i.test(i) || !/\bheight=/i.test(i)).length, noLazy = imgs.filter((i) => !/loading=/i.test(i)).length;
  if (imgs.length) out("  images: " + imgs.length + " (no alt: " + noAlt + ", no width/height: " + noDim + ", no lazy: " + noLazy + ")");
  if (noAlt) W("LOW", noAlt + " image(s) without alt text");
  if (imgs.length > 3 && noLazy > 3) W("LOW", noLazy + " images could load lazily");
  // content smells
  const all = html + "\n" + jsText;
  const smells = [[/lorem ipsum|coming soon|\bTBD\b|\bXXX\b|placeholder text/gi, "placeholder text"], [/TODO|FIXME|HACK/g, "TODO/FIXME left"], [/localhost|127\.0\.0\.1/g, "localhost reference"], [/\bhttp:\/\/(?!www\.w3\.org)/g, "plain http:// link"], [/pk_test_|sk_test_|sk_live_|rk_live_/g, "payment key in page"], [/console\.log\(/g, "console.log calls"], [/\balert\(/g, "alert() popups"], [/href=["']#["']/g, 'empty "#" links']];
  for (const [re, label] of smells) { const c = (all.match(re) || []).length; if (c) { const sev = /payment key/.test(label) ? "HIGH" : /localhost|placeholder/.test(label) ? "MED" : "LOW"; W(sev, c + " x " + label); } }
  const apiCalls = [...new Set([...all.matchAll(/["'`](?:https?:\/\/[^"'`\/]+)?(\/api\/[A-Za-z0-9_\-\/]+)/g)].map((x) => x[1]))];
  if (apiCalls.length) { out("  API calls: " + apiCalls.join(", ")); for (const a of apiCalls) if (!routeSet.has(a) && !(a.endsWith('/') ? [...routeSet].some((x) => x.startsWith(a)) : false)) W("HIGH", "calls " + a + " but no such route exists in the server code"); }
  // auth
  const adminish = /admin|review|desk|formatting|editor/i.test(page), usesGuard = /admin-guard|adminAuthorized|accessControlCheck|requireAdmin/i.test(all);
  if (/admin|review/i.test(page) && !usesGuard) W("HIGH", "admin page with no admin guard in the page (server may still protect the data, verify)");
  const userish = /dashboard|profile|payment-methods|job-board|wallet/i.test(page);
  if (userish && !/onAuthStateChanged|getIdToken|auth-guard|localStorage|sessionStorage|passkey|translatorKey/i.test(all)) W("MED", "personal page with no sign-in or key check visible");
  // forms
  const inputs = [...html.matchAll(/<(input|select|textarea)\b[^>]*>/gi)].map((x) => x[0]).filter((i) => !/type=["'](hidden|submit|button|checkbox|radio|file)["']/i.test(i));
  if (inputs.length) {
    const noLabel = inputs.filter((i) => { const id = (i.match(/\bid=["']([^"']+)/) || [])[1]; return !(id && new RegExp('for=["\']' + id + '["\']').test(html)) && !/aria-label|placeholder/i.test(i); }).length;
    const emailBad = inputs.filter((i) => /email/i.test(i) && !/type=["']email["']/i.test(i)).length, telBad = inputs.filter((i) => /phone|tel|momo/i.test(i) && !/type=["']tel["']|inputmode/i.test(i)).length;
    out("  form fields: " + inputs.length + " (no label/placeholder: " + noLabel + ")");
    if (noLabel) W("LOW", noLabel + " field(s) with no label or placeholder");
    if (emailBad) W("LOW", emailBad + " email field(s) not type=email (phone keyboards will not show the @ layout)");
    if (telBad) W("LOW", telBad + " phone field(s) without type=tel or inputmode");
  }
  if (/<form\b|type=["']submit["']|submit/i.test(html) && !/disabled\s*=\s*true|\.disabled\s*=|setAttribute\(["']disabled/.test(all)) W("LOW", "no sign that the submit button is disabled while sending (double submissions possible)");
  const secrets = (all.match(/(sk|rk)_(live|test)_[A-Za-z0-9]{8,}/g) || []).length; if (secrets) W("HIGH", "SECRET payment key text present in page");
}

// ---------- 4 journeys ----------
H("4. JOURNEYS (does each step link to the next?)");
const journeys = {
  "Client order": ["public/translation/index.html", "public/translation/request.html", "public/translation/payment.html", "public/translation/success.html"],
  "Client order (features landing)": ["public/features/translation/index.html", "public/translation/request.html"],
  "Translator signup": ["public/translators.html", "public/translation/translator-register.html", "public/translation/translator-test.html", "public/translation/translator-result.html", "public/translation/translator-login.html", "public/translation/translator-dashboard.html", "public/translation/job-board.html"],
  "Translator work": ["public/translation/job-board.html", "public/translation/editor-workspace.html"]
};
function linksTo(a, b) { const t = allText[a] || rd(a) || ""; const base = path.basename(b, ".html"); const js = scripts.filter((s) => path.dirname(s) === path.dirname(a)).map((s) => rd(s) || "").join("\n"); return (graph[a] && graph[a].has(b)) || t.includes(base) || js.includes(base + ".html"); }
for (const [n, steps] of Object.entries(journeys)) {
  out(n + ":");
  steps.forEach((s, i) => { if (!ex(s)) { out("  " + s + "  MISSING FILE"); if (i > 0 || n === "Client order") flag("HIGH", n, "page missing: " + s); return; } if (i === 0) { out("  start  " + s); return; } if (!ex(steps[i - 1])) return; const ok = linksTo(steps[i - 1], s); out("  " + (ok ? "ok    " : "NO LINK") + " " + path.basename(steps[i - 1]) + " -> " + path.basename(s)); if (!ok) flag("MED", n, path.basename(steps[i - 1]) + " has no visible link or redirect to " + path.basename(s)); });
}
const reach = new Set(), q = ["public/translation/index.html", "public/features/translation/index.html", "public/translators.html", "public/index.html"].filter(ex);
while (q.length) { const p = q.shift(); if (reach.has(p)) continue; reach.add(p); const g = graph[p] || (() => { const t = rd(p) || ""; const s = new Set(); for (const mm of t.matchAll(/(?:href|location(?:\.href)?\s*=)\s*["']([^"']+\.html)/g)) { const r = resolveRef(p, mm[1]); if (r.file) s.add(r.file); } return s; })(); g.forEach((x) => { if (/\.html$/.test(x)) q.push(x); }); }
const orphans = pages.filter((p) => !reach.has(p));
out("Pages not reachable by links from the landing pages: " + (orphans.length ? "" : "none"));
orphans.forEach((o) => { out("  " + o); flag("LOW", o, "no page links to it (fine for admin/private pages, wasted otherwise)"); });

// ---------- 5 duplicates ----------
H("5. DUPLICATE OR NEAR-DUPLICATE FILES");
const hashes = {}; for (const p of pages) { const h = crypto.createHash("md5").update(rd(p) || "").digest("hex"); (hashes[h] = hashes[h] || []).push(p); }
const dups = Object.values(hashes).filter((a) => a.length > 1); if (!dups.length) out("No identical copies."); dups.forEach((a) => { out("  identical: " + a.join(" = ")); flag("MED", a[0], "identical copy exists (" + a.slice(1).join(", ") + ")"); });
const byBase = {}; for (const p of pages) (byBase[path.basename(p)] = byBase[path.basename(p)] || []).push(p); Object.entries(byBase).filter(([, a]) => a.length > 1).forEach(([b, a]) => { out("  same name, different folders: " + a.join("  |  ")); flag("LOW", b, "same file name in several folders: " + a.join(", ")); });
const pairs = [["public/translation/desk.html", "public/translation/translation-desk.html"], ["public/translation/admin.html", "public/admin/translation-admin.html"], ["public/translation/translators.html", "public/translators.html"], ["public/translation/index.html", "public/features/translation/index.html"]];
for (const [a, b] of pairs) if (ex(a) && ex(b)) out("  related pair: " + a + " (" + kb(ex(a).size) + ")  vs  " + b + " (" + kb(ex(b).size) + ")  -> check which one is the real one");

// ---------- 6 data exposure ----------
H("6. PUBLIC DATA FILES");
for (const j of trFiles.filter((f) => f.endsWith(".json"))) { const t = rd(j) || ""; const emails = (t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || []).length, phones = (t.match(/\+?\d[\d\s-]{8,}\d/g) || []).length; out("  " + j + " (" + kb(t.length) + "): emails " + emails + ", phone-like numbers " + phones + "   (anyone on the internet can open this file)"); if (emails || phones) flag("HIGH", j, "personal contact data inside a publicly served file"); else if (t.length > 2) flag("LOW", j, "publicly served data file, confirm it is meant to be public"); }

// ---------- 7 NDA, test, pricing ----------
H("7. NDA, TEST, PRICING, KEY LINES");
function grepAll(label, re, files, max = 40) {
  out(label); let n = 0;
  for (const f of files) { const t = rd(f); if (!t) continue; const lines = t.split("\n"); lines.forEach((ln, i) => { if (n < max && re.test(ln)) { n++; out("  " + f + ":" + (i + 1) + "  " + redact(ln.trim()).slice(0, 190)); } re.lastIndex = 0; }); }
  if (!n) out("  (nothing found)"); return n;
}
const trSrc = [...pages, ...scripts, "server.js"].filter(ex);
const nda = grepAll("NDA / confidentiality wording and storage:", /\bNDA\b|non-?disclosure|confidential/i, trSrc, 45);
if (!nda) flag("HIGH", "NDA", "no NDA wording found anywhere in the translation files");
else { const stored = grepAll("NDA acceptance saved by the server?", /nda(Accepted|Signed|Agreed|At|Date)|acceptedNda|ndaAccept/i, ["server.js", ...scripts], 10); if (!stored) flag("MED", "NDA", "no field that records WHEN a translator accepted the NDA (hard to prove later)"); }
grepAll("Translator test: pass mark, timer, anti-copy, attempts:", /pass(Mark|ing|ed|Score)|threshold|>=\s*\d{2}|score\s*[<>]=?\s*\d|timeLeft|setInterval|paste|copy|visibilitychange|attempt|retake|cooldown/i, ["public/translation/translator-test.js", "public/translation/translator-test.html", "public/translation/translator-result.html"].filter(ex), 40);
grepAll("Server side of the test:", /pass(Mark|ing|ed|Score)|threshold|score\s*[<>]=?\s*\d|attempt|retake|cooldown|expire/i, ["server.js"], 30);
grepAll("Prices and currencies (compare these across pages):", /(GH[₵S]|GHS|₵|cedis?|USD|EUR|€|\$)\s?\d[\d,.]*|\d[\d,.]*\s?(GHS|cedis?|USD|EUR|per word|\/\s?word)|pricePer|perWord|rate\b/i, trSrc.filter((f) => f !== "server.js"), 60);
grepAll("Prices and commissions in the server (translation part):", /pricePer|perWord|commission|payoutRate|platformFee|translatorShare|\*\s*0\.\d+|rate\s*[:=]/i, ["server.js"], 40);
grepAll("Deadlines, refunds, revision and dispute wording:", /refund|revision|dispute|deadline|turnaround|late|overdue/i, trSrc.filter((f) => f !== "server.js"), 30);

// ---------- 8 payments ----------
H("8. PAYMENT HANDLERS (excerpts, secrets hidden)");
const pay = routes.filter((r) => /paystack|checkout|verify.*translat|translat.*checkout|wallet|payout|withdraw/i.test(r.p));
for (const r of pay) {
  out(""); out("-- " + r.method + " " + r.p + "  (" + r.f + ":" + r.line + ")");
  const b = r.body; const has = (re) => re.test(b);
  out("   checks: reference-verify=" + (has(/transaction\/verify|paystack/i) ? "yes" : "NO") + "  amount-compared=" + (has(/amount/i) ? "yes" : "NO") + "  currency=" + (has(/currency/i) ? "yes" : "no") + "  already-paid guard=" + (has(/paid|status\s*===?|alreadyProcessed|processed/i) ? "yes" : "NO") + "  transaction=" + (has(/runTransaction/) ? "yes" : "no"));
  if (/verify.*(paystack|payment)/i.test(r.p) && !has(/amount/i)) flag("HIGH", r.p, "payment verification does not appear to compare the amount paid");
  if (/verify.*(paystack|payment)/i.test(r.p) && !has(/paid|status\s*===?|processed/i)) flag("MED", r.p, "no visible guard against verifying the same payment twice");
  b.split("\n").slice(0, 45).forEach((ln) => out("   | " + redact(ln).slice(0, 170)));
}
const hook = grepAll("Paystack webhook / signature check:", /x-paystack-signature|createHmac|webhook/i, srvFiles.filter(ex), 8); if (!hook) flag("MED", "Paystack", "no webhook with signature check found (payments depend on the buyer's browser returning to the site)");
const envs = new Set(); for (const f of srvFiles) { const t = rd(f) || ""; for (const mm of t.matchAll(/process\.env\.([A-Z0-9_]+)/g)) envs.add(mm[1]); } out("Environment variable names the server reads: " + [...envs].join(", "));

// ---------- 9 database rules ----------
H("9. DATABASE RULES VS TRANSLATION COLLECTIONS");
const cols = new Set(); for (const f of [...trSrc, ...srvFiles]) { const t = rd(f) || ""; for (const mm of t.matchAll(/collection\(\s*(?:db\s*,\s*)?["'`]([A-Za-z0-9_]+)["'`]/g)) if (/translat|job|payout|wallet|segment|nda|review|formatting|submission/i.test(mm[1])) cols.add(mm[1]); }
out("Translation-related collections used: " + [...cols].join(", "));
const rules = rd("firestore.rules") || "";
if (!rules) flag("MED", "firestore.rules", "file not found");
else {
  if (/allow\s+[a-z, ]+:\s*if\s+true/.test(rules)) flag("HIGH", "firestore.rules", "contains 'if true' rule, anyone could read or write that path");
  for (const c of cols) { const found = new RegExp("match\\s+/" + c + "\\b").test(rules); out("  " + c.padEnd(32) + (found ? "has its own rule" : "no rule (falls back to default/wildcard)")); if (!found) flag("LOW", "firestore.rules", c + " has no explicit rule (fine if only the server touches it, confirm)"); }
  rules.split("\n").forEach((ln, i) => { if (/translat|job|payout|wallet/i.test(ln)) out("  rules:" + (i + 1) + "  " + ln.trim().slice(0, 160)); });
}
const srules = rd("storage.rules") || ""; if (/if\s+true/.test(srules)) flag("HIGH", "storage.rules", "contains 'if true' rule");
else if (/translat|upload|doc|file/i.test(srules)) out("storage.rules mention uploads/translation, check they require sign-in");
srules.split("\n").forEach((ln, i) => { if (/allow|match/.test(ln)) out("  storage:" + (i + 1) + "  " + ln.trim().slice(0, 140)); });

// ---------- 10 hosting + loading ----------
H("10. LOADING AND HOSTING CONFIG");
const hdrs = (fsCfg.hosting && fsCfg.hosting.headers) || [];
hdrs.forEach((h) => out("  headers for " + h.source + ": " + h.headers.map((x) => x.key + "=" + x.value).join("; ")));
if (!hdrs.some((h) => /jpg|png|webp|mp3|woff/i.test(h.source))) flag("MED", "firebase.json", "no long cache rule for images/audio/fonts (they re-download more often than needed)");
out("  cleanUrls: " + cleanUrls + "   rewrites: " + rewrites.length);
out("  service worker: " + (ex(PUB + "/sw.js") || ex(PUB + "/service-worker.js") ? "present" : "none"));
out(""); out("Page weights (local files only, before fonts/API):");
Object.entries(pageWeights).sort((a, b) => b[1].weight - a[1].weight).forEach(([p, w]) => out("  " + kb(w.weight).padStart(10) + "  " + p));

// ---------- 11 live ----------
async function timed(url, opt = {}) { const t0 = Date.now(); const ac = new AbortController(); const to = setTimeout(() => ac.abort(), 20000); try { const r = await fetch(url, { ...opt, signal: ac.signal, redirect: "follow" }); const t1 = Date.now() - t0; return { r, ms: t1 }; } catch (e) { return { err: String(e.message || e).slice(0, 80) }; } finally { clearTimeout(to); } }
if (LIVE) {
  H("11. LIVE SITE CHECKS (public pages only, nothing logged in)");
  const toUrl = (f) => BASE + "/" + f.replace(/^public\//, "");
  const targets = [...liveQueue, ...pages].map((f) => f.replace(/\\/g, "/")).filter((f) => f.startsWith("public/")); const uniq = [...new Set(targets)];
  const res = []; let i = 0;
  async function worker() { while (i < uniq.length) { const f = uniq[i++]; const t = await timed(toUrl(f), { method: "GET" }); if (t.err) { res.push({ f, err: t.err }); continue; } const buf = Buffer.from(await t.r.arrayBuffer()); res.push({ f, st: t.r.status, ms: t.ms, size: buf.length, enc: t.r.headers.get("content-encoding"), cc: t.r.headers.get("cache-control"), ct: t.r.headers.get("content-type") }); } }
  await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
  res.sort((a, b) => a.f.localeCompare(b.f));
  let bad = 0; for (const r of res) {
    if (r.err) { out("  ERROR " + r.f + "  " + r.err); bad++; continue; }
    out("  " + String(r.st).padEnd(4) + String(r.ms + "ms").padEnd(8) + kb(r.size).padStart(9) + "  enc:" + String(r.enc || "none").padEnd(5) + " " + r.f + "   cache:" + (r.cc || "-"));
    if (r.st >= 400) { flag("HIGH", r.f, "live site returns " + r.st + " but the file exists in the project (deploy missing or blocked)"); bad++; }
    else if (/\.(html|js|css|json)$/.test(r.f) && !r.enc && r.size > 5000) flag("LOW", r.f, "served without compression (" + kb(r.size) + ")");
    if (r.ms > 2500 && r.st < 400) flag("LOW", r.f, "slow response " + r.ms + "ms");
    if (/\.(webp|png|jpe?g|mp3)$/i.test(r.f) && r.cc && /no-cache|max-age=0/.test(r.cc)) flag("LOW", r.f, "media with no-cache re-downloads every visit");
  }
  out("Live files checked: " + res.length + "   problems: " + bad);
  out(""); out("Server wake-up and speed (Render):");
  for (let k = 1; k <= 3; k++) { const t = await timed(SERVER + "/api/translatorTestPassages"); out("  try " + k + ": " + (t.err ? "ERROR " + t.err : t.r.status + " in " + t.ms + "ms (" + (t.r.headers.get("content-type") || "") + ")")); if (!t.err && k === 1 && t.ms > 8000) flag("MED", "Render server", "first request took " + t.ms + "ms (cold start). Visitors see a frozen page while it wakes. Consider a keep-awake ping or a paid always-on instance"); if (!t.err && k === 3 && t.ms > 2500) flag("LOW", "Render server", "warm request still " + t.ms + "ms"); }
  const cors = await timed(SERVER + "/api/translatorTestPassages", { headers: { Origin: BASE } }); if (cors.r) out("  CORS header for saybonapp.com: " + (cors.r.headers.get("access-control-allow-origin") || "none"));
} else { H("11. LIVE SITE CHECKS"); out("Skipped."); }

// ---------- summary ----------
const sumLines = ["", "SUMMARY", "  HIGH: " + flags.HIGH.length + "   MEDIUM: " + flags.MED.length + "   LOW: " + flags.LOW.length, ""];
["HIGH", "MED", "LOW"].forEach((s) => { sumLines.push(s + " items:"); flags[s].slice(0, 80).forEach((x) => sumLines.push("  - " + x)); if (flags[s].length > 80) sumLines.push("  ...and " + (flags[s].length - 80) + " more below"); sumLines.push(""); });
L.splice(3, 0, ...sumLines);
fs.writeFileSync(OUT, L.join("\n"), "utf8");
console.log("Report written: " + OUT + "  (HIGH " + flags.HIGH.length + ", MEDIUM " + flags.MED.length + ", LOW " + flags.LOW.length + ")");
