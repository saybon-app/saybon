// Adds the "French for Professionals" card (second, right after Levels) to the dashboard. Safe to run again. Run from the project root.
import fs from "fs";
const F="public/dashboard/index.html";
let h=fs.readFileSync(F,"utf8");
if(!fs.existsSync("public/professional/index.html")||!fs.existsSync("public/css/dashboard-pro.css")){console.log("STOP: the professional files are not in place.");process.exit(1);}
if(h.includes("card-professional")){
  const NEWT="Build real French proficiency for your work, career, and professional goals.";
  const m=h.match(/(card-professional[\s\S]*?<span>)([^<]*)(<\/span>)/);
  if(m&&m[2]!==NEWT){fs.writeFileSync(F+".bakPro",h);fs.writeFileSync(F,h.replace(m[0],m[1]+NEWT+m[3]));console.log("Updated the card wording.");} else console.log("Dashboard card already up to date."); }
else{
  const a=h.indexOf('onclick="goLevels()"'); if(a<0){console.log("STOP: could not find the Levels card in the dashboard.");process.exit(1);}
  const start=h.lastIndexOf("<div",a), end=h.indexOf("</div>\n",h.indexOf("</span>",a));
  if(start<0||end<0){console.log("STOP: could not read the Levels card.");process.exit(1);}
  const endAt=end+"</div>".length;
  const card=`

      <div class="dash-card card-professional" onclick="window.location.href='/professional/'">
        <div class="pro-tag">NEW</div>
        <div class="pro-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg></div>
        <h3>French for Professionals</h3>
        <span>Build real French proficiency for your work, career, and professional goals.</span>
      </div>`;
  fs.writeFileSync(F+".bakPro",h);
  h=h.slice(0,endAt)+card+h.slice(endAt);
  if(!h.includes("dashboard-pro.css")) h=h.replace('<link rel="stylesheet" href="/css/dashboard-polish.css?v=1" />','<link rel="stylesheet" href="/css/dashboard-polish.css?v=1" />\n  <link rel="stylesheet" href="/css/dashboard-pro.css?v=1" />');
  fs.writeFileSync(F,h); console.log("Added the French for Professionals card after Levels.");
}
if(!fs.readFileSync(F,"utf8").includes("dashboard-pro.css")) console.log("WARNING: stylesheet link not added, card will look unstyled.");
