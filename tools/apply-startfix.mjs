// Fixes the start page headline: typing no longer freezes, and the text is never cut off on narrow phones.
// Safe to run again. Run from the project root.
import fs from "fs";
const JS="public/js/start.js", CSS="public/css/start.css", HTML="public/start.html";
let j=fs.readFileSync(JS,"utf8");
if(j.includes("/*startfix*/")) console.log("Start page JS already fixed.");
else{
  const a=j.indexOf("function typeTitle("), b=j.indexOf('document.getElementById("startHomeBtn")');
  if(a<0||b<0||b<a){console.log("STOP: start.js is not the version I expected. Nothing changed.");process.exit(1);}
  const neu=`/*startfix*/
function typeTitle(el, onDone){
  if(!el) return;
  const text = el.getAttribute("data-text") || "";
  const speed = 38;
  const cursor = document.createElement("span");
  cursor.className = "start-title-cursor";
  el.textContent = "";
  el.appendChild(cursor);
  const t0 = performance.now();
  let shown = 0, done = false;
  function finish(){
    if(done) return;
    done = true;
    el.textContent = text;
    shell?.classList.add("start-cards-ready");
    if(typeof onDone === "function") onDone();
  }
  // Time-based, so a throttled or backgrounded tab jumps to the right letter instead of freezing.
  function tick(){
    if(done) return;
    const n = Math.min(text.length, Math.floor((performance.now() - t0) / speed));
    if(n !== shown){ shown = n; cursor.previousSibling && cursor.previousSibling.remove(); cursor.insertAdjacentText("beforebegin", text.slice(0, n)); }
    if(n >= text.length){ setTimeout(finish, 500); return; }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  document.addEventListener("visibilitychange", () => { if(!document.hidden) tick(); });
  setTimeout(finish, text.length * speed + 1800); // safety net: always show the full line
}

const shell = document.querySelector(".start-shell");

document.querySelectorAll(".start-title").forEach(titleEl => {
  const textEl = titleEl.querySelector(".start-title-text");
  let started = false;
  function go(){ if(started) return; started = true; typeTitle(textEl); }
  titleEl.addEventListener("animationend", (e) => { if(e.target === titleEl) go(); }, { once:true });
  setTimeout(go, 1500); // if the entrance animation never reports back, start anyway
});

`;
  fs.writeFileSync(JS+".bakSF",j); fs.writeFileSync(JS,j.slice(0,a)+neu+j.slice(b)); console.log("Start page JS fixed.");
}
let c=fs.readFileSync(CSS,"utf8");
if(c.includes("/*startfix*/")) console.log("Start page CSS already fixed.");
else{
  fs.writeFileSync(CSS+".bakSF",c);
  fs.appendFileSync(CSS,`
/*startfix*/
.start-title-text{ white-space:normal; overflow:visible; min-width:0; line-height:1.2; }
.start-title{ width:max-content; }
@media (max-width:800px){ .start-title{ font-size:17px; max-width:94%; } }
`);console.log("Start page CSS fixed.");
}
let h=fs.readFileSync(HTML,"utf8"),stamp=String(Date.now());
const h2=h.replace(/\/css\/start\.css\?v=[^"']*/,"/css/start.css?v="+stamp).replace(/\/js\/start\.js\?v=[^"']*/,"/js/start.js?v="+stamp);
if(h2!==h){fs.writeFileSync(HTML+".bakSF",h);fs.writeFileSync(HTML,h2);console.log("Cache stamps updated.");}
