// Link preview (WhatsApp, Facebook, X, iMessage): adds a title, a line and a picture to saybonapp.com and the feedback page. Safe to run again. Run from the project root.
import fs from "fs"; import path from "path";
const root = process.cwd();
const img = "https://saybonapp.com/assets/home/og-saybon.jpg";
const pages = [
  ["public/index.html", "https://saybonapp.com/", "SayBon: Easy Fun French", "Learn French by speaking it. A gentle, no-stress way to start, with a teacher beside you."],
  ["public/feedback/index.html", "https://saybonapp.com/feedback", "Tell us what you think about SayBon", "A short, mostly tap-to-answer form. Your honest view helps us make SayBon better."],
];
let n = 0;
for (const [f, url, title, desc] of pages) {
  const p = path.join(root, f); if (!fs.existsSync(p)) { console.log("missing " + f); continue; }
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/<!--OG-->[\s\S]*?<!--\/OG-->\s*/g, "");
  const tags = `<!--OG-->\n<meta name="description" content="${desc}">\n<meta property="og:type" content="website">\n<meta property="og:site_name" content="SayBon">\n<meta property="og:url" content="${url}">\n<meta property="og:title" content="${title}">\n<meta property="og:description" content="${desc}">\n<meta property="og:image" content="${img}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${title}">\n<meta name="twitter:description" content="${desc}">\n<meta name="twitter:image" content="${img}">\n<!--/OG-->\n`;
  s = s.replace(/<meta name="description"[^>]*>\s*/i, "");
  if (!/<\/title>/i.test(s)) { console.log("no <title> in " + f); continue; }
  s = s.replace(/<\/title>/i, m => m + "\n" + tags);
  fs.writeFileSync(p, s); n++;
}
console.log("Link preview set on " + n + " page(s).");
