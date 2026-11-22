/* Shared by the lesson page and the build script: turns one scene into a lesson for a pace. */
(function(root,f){if(typeof module==="object"&&module.exports)module.exports=f();else root.ScenEngine=f()})(this,function(){
var CUES={scene:"Voici la scène. Écoutez bien.",again:"Encore une fois.",phrases:"Maintenant, les phrases importantes.",listen:"Écoutez.",repeat:"Répétez.",yours:"À vous.",model:"Voici le modèle.",drills:"Maintenant, les échanges.",swap:"Changeons un détail.",twist:"Attention, une surprise !",final:"Maintenant, vous jouez la scène en entier.",end:"Bravo ! La leçon est terminée. À bientôt."};
var PACES={relaxed:{phr:6,swaps:1,mult:1.5},steady:{phr:8,swaps:2,mult:1.15},intensive:{phr:12,swaps:2,mult:0.9}};
function hash(s){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
function lineId(role,text){return role+"-"+hash(text)}
function win(text,pace){var n=text.split(/\s+/).length;return Math.min(14,Math.max(3.5,Math.round((2+n*0.55)*PACES[pace].mult*10)/10))}
function say(role,text){return{k:"say",a:lineId(role,text),who:role,fr:text}}
function cue(name){return say("t",CUES[name])}
function uniq(a){var s={},o=[];a.forEach(function(x){if(!s[x]){s[x]=1;o.push(x)}});return o}
function build(L,pace){
 var P=PACES[pace],S=[];
 if(L.goal&&(L.lv==="a0"||L.lv==="a1"))S.push({k:"goal",text:L.goal});
 S.push({k:"sec",t:"La scène"});S.push(cue("scene"));
 L.scene.forEach(function(x){S.push(say(x[0],x[1]))});
 if(pace==="relaxed"){S.push(cue("again"));L.scene.forEach(function(x){S.push(say(x[0],x[1]))})}
 var pool=[];L.scene.forEach(function(x){if(x[0]==="p")pool.push(x[1])});
 L.drills.forEach(function(d){pool.push(d.p)});L.swaps.forEach(function(d){pool.push(d.p)});
 (L.extra||[]).forEach(function(x){pool.push(x)});if(L.twist)pool.push(L.twist.p);
 var ph=uniq(pool).slice(0,P.phr);
 S.push({k:"sec",t:"Les phrases"});S.push(cue("phrases"));
 if(pace==="steady")S.push(cue("repeat"));
 ph.forEach(function(t){
  if(pace==="relaxed"){S.push(cue("listen"));S.push(say("p",t));S.push(cue("repeat"));S.push({k:"turn",fr:t,w:win(t,pace),hint:2});S.push(say("p",t))}
  else{S.push(say("p",t));S.push({k:"turn",fr:t,w:win(t,pace),hint:2})}
 });
 S.push({k:"sec",t:"Les échanges"});S.push(cue("drills"));
 L.drills.forEach(function(d){
  S.push(say("c",d.c));
  if(pace==="relaxed"){S.push(cue("model"));S.push(say("p",d.p));S.push(cue("yours"));S.push({k:"turn",fr:d.p,w:win(d.p,pace),hint:2})}
  else{S.push({k:"turn",fr:d.p,w:win(d.p,pace),hint:pace==="steady"?1:0});S.push(say("p",d.p))}
 });
 S.push(cue("swap"));
 L.swaps.slice(0,P.swaps).forEach(function(d){
  S.push(say("c",d.c));
  if(pace==="relaxed"){S.push(cue("model"));S.push(say("p",d.p));S.push(cue("yours"));S.push({k:"turn",fr:d.p,w:win(d.p,pace),hint:2})}
  else{S.push({k:"turn",fr:d.p,w:win(d.p,pace),hint:pace==="steady"?1:0});S.push(say("p",d.p))}
 });
 if(pace==="intensive"&&L.twist){S.push(cue("twist"));S.push(say("c",L.twist.c));S.push({k:"turn",fr:L.twist.p,w:win(L.twist.p,pace),hint:0});S.push(say("p",L.twist.p))}
 S.push({k:"sec",t:"À vous"});S.push(cue("final"));
 L.scene.forEach(function(x){
  if(x[0]==="c")S.push(say("c",x[1]));
  else S.push({k:"turn",fr:x[1],w:win(x[1],pace),hint:pace==="relaxed"?2:(pace==="steady"?1:0)});
 });
 S.push(cue("end"));
 return S}
function needs(L,pace){var o={},a=[];build(L,pace).forEach(function(s){if(s.k==="say"&&!o[s.a]){o[s.a]=1;a.push({id:s.a,role:s.who,text:s.fr})}});return a}
return{CUES:CUES,PACES:PACES,hash:hash,lineId:lineId,build:build,needs:needs,win:win}});
