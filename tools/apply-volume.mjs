import fs from "fs";
const dir = process.argv[2] || "public/talkletics";
let bad = 0;
for (const f of ["place.js", "maison.js"]) {
  const p = dir + "/" + f;
  let s = fs.readFileSync(p, "utf8");
  if (s.includes("/*volfix*/")) { console.log(f + ": already fixed"); continue; }
  const a1 = "function capture(){";
  const a2 = 'openMic().then(function(){$("pick").hidden=true;game();})';
  if (s.split(a1).length !== 2 || s.split(a2).length !== 2) { console.log("NOT PATCHED (code differs): " + f); bad++; continue; }
  s = s.replace(a1, "function closeMic(){try{if(stream)stream.getTracks().forEach(function(t){t.stop();});}catch(e){}try{if(actx)actx.close();}catch(e){}stream=null;actx=null;analyser=null;srcNode=null;}/*volfix*/\nfunction capture(){return openMic().then(capture0).then(function(r){closeMic();return r;},function(e){closeMic();throw e;});}\nfunction capture0(){");
  s = s.replace(a2, 'openMic().then(function(){closeMic();$("pick").hidden=true;game();})');
  fs.writeFileSync(p, s);
  console.log("patched " + f);
}
process.exit(bad ? 1 : 0);
