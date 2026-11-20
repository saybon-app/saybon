import fs from "fs";import path from "path";
const root=process.argv[2]||"C:\\SayBon";
const pub=path.join(root,"public");
// 1) keep the old generic form
const fi=path.join(pub,"feedback","index.html"),fg=path.join(pub,"feedback","general.html");
if(fs.existsSync(fi)&&!fs.existsSync(fg)){const t=fs.readFileSync(fi,"utf8");if(!t.includes("testerFeedbackSubmit"))fs.copyFileSync(fi,fg),console.log("old form kept as feedback/general.html")}
// 2) static files
const here=path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,"$1"));
const src=path.join(here,"..","public");
for(const f of ["feedback/index.html","admin/tester-feedback.html"]){fs.mkdirSync(path.dirname(path.join(pub,f)),{recursive:true});fs.copyFileSync(path.join(src,f),path.join(pub,f));console.log("wrote",f)}
// 3) tile in the business admin panel
const pp=path.join(pub,"admin","panel.html");
if(fs.existsSync(pp)){let t=fs.readFileSync(pp,"utf8");if(!t.includes("tester-feedback.html")){const a='<button class="ah-btn" data-href="/levels/admin.html">';if(t.includes(a)){t=t.replace(a,'<button class="ah-btn" data-href="/admin/tester-feedback.html">Tester Feedback <span>-&gt;</span></button>\n      '+a);fs.writeFileSync(pp,t);console.log("tile added to business admin")}else console.log("WARN: tile anchor not found in panel.html")}else console.log("tile already there")}
// remove the separate SayBon admin if it was deployed
fs.rmSync(path.join(pub,"saybon-admin"),{recursive:true,force:true});
// 4) server
function walk(d,o=[]){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(["node_modules",".git","public","tmp"].includes(e.name))continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p,o);else if(e.name.endsWith(".js"))o.push(p)}return o}
const MARK='app.post("/api/submitFeedback"';
const sf=walk(root).find(f=>fs.readFileSync(f,"utf8").includes(MARK));
if(!sf){console.log("STOP: server file with /api/submitFeedback not found under",root);process.exit(1)}
let s=fs.readFileSync(sf,"utf8");
if(s.includes("/api/testerFeedbackSubmit"))console.log("server already patched:",sf);
else{
const code=`
// ---- Tester feedback (public submit, admin read) ----
var _tfHits={};
app.post("/api/testerFeedbackSubmit", async(req,res)=>{
  try{
    var ip=String(req.headers["x-forwarded-for"]||req.ip||"").split(",")[0].trim();
    var now=Date.now();var h=(_tfHits[ip]||[]).filter(function(t){return now-t<3600000});
    if(h.length>=8) return res.status(429).json({error:"too many submissions"});
    h.push(now);_tfHits[ip]=h;
    var a=(req.body&&req.body.answers)||{};var clean={};
    Object.keys(a).slice(0,60).forEach(function(k){
      if(!/^[a-z_]{1,20}$/.test(k)) return;var v=a[k];
      if(Array.isArray(v)) clean[k]=v.slice(0,15).map(function(x){return String(x).slice(0,80)});
      else if(typeof v==="number") clean[k]=Math.max(0,Math.min(5,v));
      else clean[k]=String(v==null?"":v).slice(0,2000);
    });
    if(!Object.keys(clean).length) return res.status(400).json({error:"empty"});
    var ref=db.collection("testerFeedback").doc();
    await ref.set({answers:clean,ua:String((req.body&&req.body.ua)||"").slice(0,200),reviewed:false,created:new Date().toISOString()});
    res.json({success:true,id:ref.id});
  }catch(err){console.error(err);res.status(500).json({error:"could not save"})}
});
app.get("/api/adminTesterFeedback", requireAdminAuth, async(req,res)=>{
  try{var snap=await db.collection("testerFeedback").orderBy("created","desc").limit(500).get();
    var items=[];snap.forEach(function(d){var x=d.data();items.push({id:d.id,answers:x.answers||{},reviewed:!!x.reviewed,created:(x.created||"").slice(0,16).replace("T"," ")})});
    res.json({items:items});
  }catch(err){console.error(err);res.status(500).json({error:"could not load"})}
});
app.post("/api/adminTesterFeedbackUpdate", requireAdminAuth, async(req,res)=>{
  try{await db.collection("testerFeedback").doc(String(req.body.id)).update({reviewed:!!req.body.reviewed});res.json({success:true})}
  catch(err){console.error(err);res.status(500).json({error:"failed"})}
});
app.post("/api/adminTesterFeedbackDelete", requireAdminAuth, async(req,res)=>{
  try{await db.collection("testerFeedback").doc(String(req.body.id)).delete();res.json({success:true})}
  catch(err){console.error(err);res.status(500).json({error:"failed"})}
});
// ---- end tester feedback ----

`;
// must come after requireAdminAuth definition (function declaration is hoisted, so before submitFeedback is fine)
s=s.replace(MARK,code+MARK);fs.writeFileSync(sf,s);console.log("server patched:",sf);
}
