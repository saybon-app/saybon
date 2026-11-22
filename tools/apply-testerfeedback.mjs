// Puts a "Tester Feedback" tile in the business admin (features/admin) and points the admin panel link at the new page. Safe to run again. Run from the project root.
import fs from "fs";
const IDX = "public/features/admin/index.html", PAN = "public/admin/panel.html";
let h = fs.readFileSync(IDX, "utf8");
if (h.includes("tester-feedback/index.html")) console.log("Tester Feedback tile already in the business admin.");
else {
  const tile = `    <a href="tester-feedback/index.html" class="bh-card bh-new">
      <div class="bh-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
      <div class="bh-card-title">Tester Feedback</div>
      <div class="bh-card-sub">What friends and testers said, page by page</div>
    </a>

`;
  const at = h.indexOf('    <a href="translation-review/index.html"');
  if (at < 0) { console.log("STOP: could not find where to put the tile."); process.exit(1); }
  fs.writeFileSync(IDX + ".bakTF", h); fs.writeFileSync(IDX, h.slice(0, at) + tile + h.slice(at)); console.log("Added the Tester Feedback tile to the business admin.");
}
if (fs.existsSync(PAN)) { const p = fs.readFileSync(PAN, "utf8"), q = p.replace('/admin/tester-feedback.html', '/features/admin/tester-feedback/'); if (q !== p) { fs.writeFileSync(PAN, q); console.log("Admin panel link updated."); } }
