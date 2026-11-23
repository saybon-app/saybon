/* Shared by the lesson page and the build script: turns one scene into a lesson for a pace. */
(function(root,f){if(typeof module==="object"&&module.exports)module.exports=f();else root.ScenEngine=f()})(this,function(){
var CUES={scene:"Voici la scène. Écoutez bien.",again:"Encore une fois.",phrases:"Maintenant, les phrases importantes.",listen:"Écoutez.",repeat:"Répétez.",yours:"À vous.",model:"Voici le modèle.",drills:"Maintenant, les échanges.",swap:"Changeons un détail.",twist:"Attention, une surprise !",final:"Maintenant, vous jouez la scène en entier.",end:"Bravo ! La leçon est terminée. À bientôt."};
/* The three paces only change how often a learner studies, never how the lesson itself runs. */
var PACES={relaxed:{phr:6,mult:1.5},steady:{phr:6,mult:1.5},intensive:{phr:6,mult:1.5}};
var EN={
 promise:"[chuckles] That was the conversation. And here's the plan: by the end of this lesson, you'll be able to take part in it yourself, fluently. Let's get you there!",
 drills:"Now the drills. Short exchanges, one at a time. [chuckles] You'll be surprised how quickly they stick.",
 c12:"Lovely. Now let's put drill one and drill two together, as a little conversation.",
 c34:"Great. Now drills three and four, together, as a conversation.",
 c1234:"Now all four together. This is a real conversation, so take your time.",
 whole:"Now the whole conversation, from the start. This time, you play your part. Ready? [chuckles] Let's go!",
 done:"[chuckles] And that's the lesson! Wow, great job today. [sighs] Ahh, I'm proud of you. See you in the next one.",
 praise:["Great job!","Wow, you're doing so well!","Brilliant! Keep going.","[chuckles] Lovely. That sounded really good.","Yes! Exactly like that.","[sighs] Ahh, perfect. You've got this."]};
function strip(t){return String(t).replace(/<<([^>]*)>>/g,"$1").replace(/\[[^\]]*\]/g,"").replace(/\s{2,}/g," ").trim()}
function hash(s){var h1=0xdeadbeef,h2=0x41c6ce57;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
function lineId(role,text){return role+"-"+hash(text)}
function win(text,pace){var n=text.split(/\s+/).length;return Math.min(14,Math.max(3.5,Math.round((2+n*0.55)*PACES[pace].mult*10)/10))}
function say(role,text,lang){var o={k:"say",a:lineId(role,text),who:role,fr:strip(text),raw:text};if(lang)o.lang=lang;return o}
function en(text){return say("t",text,"en")}
function cue(name){return say("t",CUES[name])}
function uniq(a){var s={},o=[];a.forEach(function(x){if(!s[x]){s[x]=1;o.push(x)}});return o}
function build(L,pace){
 var P=PACES[pace]||PACES.steady,S=[],pi=0;
 function praise(){S.push(en(EN.praise[pi++%EN.praise.length]))}
 function turn(t,h){S.push({k:"turn",fr:t,w:win(t,pace),hint:h===undefined?2:h})}
 function drill(d){S.push(say("c",d.c));S.push(cue("model"));S.push(say("p",d.p));S.push(cue("yours"));turn(d.p)}
 function mini(ds){ds.forEach(function(d){S.push(say("c",d.c));turn(d.p,1)})}
 if(L.goal&&(L.lv==="a0"||L.lv==="a1"))S.push({k:"goal",text:L.goal});
 /* 1. where you are, who is talking, then the whole conversation once */
 S.push({k:"sec",t:"La scène"});
 S.push(en(L.setup||"For this lesson, you will play a short conversation. First, just listen."));
 S.push(cue("scene"));
 L.scene.forEach(function(x){S.push(say(x[0],x[1]))});
 S.push(en(EN.promise));
 /* 2. the key phrases */
 var pool=[];L.scene.forEach(function(x){if(x[0]==="p")pool.push(x[1])});
 L.drills.forEach(function(d){pool.push(d.p)});L.swaps.forEach(function(d){pool.push(d.p)});
 (L.extra||[]).forEach(function(x){pool.push(x)});
 var ph=uniq(pool).slice(0,P.phr);
 S.push({k:"sec",t:"Les phrases"});S.push(cue("phrases"));
 ph.forEach(function(t,i){S.push(cue("listen"));S.push(say("p",t));S.push(cue("repeat"));turn(t);S.push(say("p",t));if(i===2)praise()});
 /* 3. the drills, joined up into a conversation step by step */
 var D=[L.drills[0],L.drills[1],L.drills[2],L.swaps[0]];
 S.push({k:"sec",t:"Les échanges"});S.push(en(EN.drills));
 drill(D[0]);drill(D[1]);praise();S.push(en(EN.c12));mini([D[0],D[1]]);praise();
 drill(D[2]);drill(D[3]);S.push(en(EN.c34));mini([D[2],D[3]]);praise();
 S.push(en(EN.c1234));mini(D);praise();
 /* 4. the whole conversation, with the learner playing their part */
 S.push({k:"sec",t:"À vous"});S.push(en(EN.whole));
 L.scene.forEach(function(x){if(x[0]==="c")S.push(say("c",x[1]));else turn(x[1],1)});
 S.push(en(EN.done));
 return S}
function needs(L,pace){var o={},a=[];build(L,pace).forEach(function(s){if(s.k==="say"&&!o[s.a]){o[s.a]=1;a.push({id:s.a,role:s.who,text:s.raw,lang:s.lang||"fr"})}});return a}
return{CUES:CUES,EN:EN,strip:strip,PACES:PACES,hash:hash,lineId:lineId,build:build,needs:needs,win:win}});
