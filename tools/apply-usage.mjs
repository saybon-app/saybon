// Installs the usage tracker: server route, page tracker, dashboard tile. Safe to run again. Run from the project root.
import fs from "fs";
import cp from "child_process";
function rd(p){return fs.existsSync(p)?fs.readFileSync(p,"utf8"):null}
function save(p,s,bak){ if(bak&&!fs.existsSync(p+bak)) fs.copyFileSync(p,p+bak); fs.writeFileSync(p,s); }
let bad=0;
// 1. server.js: register the route file right after level-routes
let s=rd("server.js");
if(!s||!fs.existsSync("usage-routes.js")){console.log("STOP: server.js or usage-routes.js not found here.");process.exit(1);}
if(s.includes('require("./usage-routes")')) console.log("Server already loads the usage tracker.");
else{
  const m=s.match(/require\("\.\/level-routes"\)\(app,\{admin:admin,db:db,express:express\}\);?/);
  if(!m){console.log("STOP: could not find the level-routes line in server.js.");process.exit(1);}
  save("server.js",s.replace(m[0],m[0]+'\nrequire("./usage-routes")(app,{admin:admin,db:db,express:express});'),".bakUsage");
  const c=cp.spawnSync("node",["--check","server.js"]);
  const c2=cp.spawnSync("node",["--check","usage-routes.js"]);
  if(c.status||c2.status){console.log("STOP: syntax check failed, restoring server.js.\n"+(c.stderr||"")+(c2.stderr||""));fs.copyFileSync("server.js.bakUsage","server.js");process.exit(1);}
  console.log("Server now loads the usage tracker (syntax checked).");
}
// 2. auth-guard.js imports the tracker (covers dashboard and lessons)
let g=rd("public/js/auth-guard.js");
if(g&&!g.includes("usage-track.js")){save("public/js/auth-guard.js",'import "./usage-track.js";\n'+g,".bakUsage");console.log("Tracker added to auth-guard.js.");}
else console.log("auth-guard.js: already done or missing.");
// 3. pages without auth-guard
for(const p of ["public/index.html","public/start.html","public/placement/index.html","public/auth/login.html"]){
  let h=rd(p); if(!h){console.log("Skipped (not found): "+p);continue;}
  if(h.includes("usage-track.js")){console.log("Already in "+p);continue;}
  if(!h.includes("</head>")){console.log("No </head> in "+p);bad++;continue;}
  save(p,h.replace("</head>",'<script type="module" src="/js/usage-track.js"></script>\n</head>'),".bakUsage");console.log("Tracker added to "+p);
}
// 4. dashboard tile
const IDX="public/features/admin/index.html";let h=rd(IDX);
if(h.includes("usage/index.html")) console.log("Usage tile already in the business admin.");
else{
  const tile=`    <a href="usage/index.html" class="bh-card bh-new">
      <div class="bh-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/></svg></div>
      <div class="bh-card-title">Usage and Growth</div>
      <div class="bh-card-sub">Sign-ups, active learners, lessons, funnel. PDF report</div>
    </a>

`;
  let at=h.indexOf('    <a href="tester-feedback/index.html"'); if(at<0) at=h.indexOf('    <a href="translation-review/index.html"');
  if(at<0){console.log("Could not place the tile.");bad++;}
  else{save(IDX,h.slice(0,at)+tile+h.slice(at),".bakUsage");console.log("Added the Usage and Growth tile.");}
}
console.log(bad?"Some parts need a look.":"Usage tracker installed.");
