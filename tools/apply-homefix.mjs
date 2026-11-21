// Home page cut-off fix for Chrome/Safari on phones (the toolbar covered the bottom: Login button cut).
// The page used 100vh (the tall viewport with toolbars hidden). It now fills exactly the visible screen.
import fs from "fs"; import path from "path";
const root = process.argv[2] || "C:/SayBon/public";
const cssF = path.join(root, "css", "home.css"), htmlF = path.join(root, "index.html");
let c = fs.readFileSync(cssF, "utf8");
if (c.includes("/*HF*/")) { console.log("Already applied."); process.exit(0); }
const a = ".home-shell{\n  position:relative;\n  width:100vw;\n  height:100vh;\n  overflow:hidden;\n}";
if (!c.includes(a)) { console.log("STOP: .home-shell block not found (file changed?)"); process.exit(1); }
fs.writeFileSync(cssF + ".bakHF", c);
c = c.replace(a, ".home-shell{ /*HF*/\n  position:fixed;\n  top:0;left:0;right:0;bottom:0;\n  width:100%;\n  height:100%;\n  overflow:hidden;\n}");
c = c.replace("min-height:100vh;\n  overflow:hidden;\n  font-family", "min-height:100vh;\n  min-height:100dvh;\n  overflow:hidden;\n  font-family");
const lg = "  .saybon-logo{\n    width:150px;\n    left:50%;\n    top:60%;";
if (!c.includes(lg)) { console.log("STOP: mobile logo block not found"); process.exit(1); }
c = c.replace(lg, "  .saybon-logo{\n    width:min(150px,19.5vh);\n    left:50%;\n    top:57.5%;");
fs.writeFileSync(cssF, c);
let h = fs.readFileSync(htmlF, "utf8");
fs.writeFileSync(htmlF + ".bakHF", h);
fs.writeFileSync(htmlF, h.replace(/css\/home\.css\?v=(\d+)/, (x, v) => "css/home.css?v=" + (+v + 1)));
console.log("Done: home page now fits the visible screen.");
