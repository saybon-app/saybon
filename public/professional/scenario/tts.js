/* The browser's own voice, used for any line that has no recorded audio yet.
   It speaks clause by clause so that commas, full stops and question marks give real pauses and a lift in the voice. */
(function(){
var synth=window.speechSynthesis,voices=[],cache={};
function load(){try{voices=synth.getVoices()||[]}catch(e){voices=[]}cache={}}
if(synth){load();if(synth.addEventListener)synth.addEventListener("voiceschanged",load)}
function frVoices(){return voices.filter(function(v){return /^fr/i.test(v.lang)})}
function score(v){var n=v.name||"",s=0;if(/google|neural|natural|online|premium|enhanced/i.test(n))s+=3;if(/fr[-_]FR/i.test(v.lang))s+=2;if(v.localService)s+=0;return s}
function pick(male){
 var k=male?"m":"f";if(cache[k])return cache[k];
 var L=frVoices().sort(function(a,b){return score(b)-score(a)}),F=/denise|am[eé]lie|audrey|julie|hortense|marie|eloise|vivienne|brigitte|female|femme/i,M=/henri|thomas|paul|claude|antoine|male|homme|mathieu/i;
 var m=L.filter(function(v){return(male?M:F).test(v.name)})[0]||(male?L[1]:L[0])||L[0]||null;cache[k]=m;return m;
}
function pickEn(){
 if(cache.en)return cache.en;
 var L=voices.filter(function(v){return /^en/i.test(v.lang)}).sort(function(a,b){return score(b)-score(a)}),F=/female|samantha|serena|karen|moira|tessa|aria|jenny|libby|sonia|zira|hazel|susan/i;
 return cache.en=L.filter(function(v){return F.test(v.name)})[0]||L[0]||null;
}
function chunks(t){
 t=String(t).replace(/\s+/g," ").trim();
 var out=[],re=/[^,;:.!?…]+[,;:.!?…]*/g,m;
 while((m=re.exec(t))){var s=m[0].trim();if(s)out.push(s)}
 return out.length?out:[t];
}
var token=0;
function speak(text,role,pace,lang){
 return new Promise(function(res){
  if(!synth){res("err");return}
  api.spoke=false;var my=++token,parts=chunks(text),i=0,male=role==="c",v=lang==="en"?pickEn():pick(male);
  var base=pace==="relaxed"?0.8:pace==="intensive"?1.0:0.9;
  function next(){
   if(my!==token){res("ok");return}
   if(i>=parts.length){res("ok");return}
   var p=parts[i++],u=new SpeechSynthesisUtterance(p),end=p.slice(-1);
   u.lang=lang==="en"?"en-GB":"fr-FR";if(v){u.voice=v;if(lang==="en"&&v.lang)u.lang=v.lang}
   u.rate=base*(end==="!"?1.05:1);
   u.pitch=(male?0.82:1.04)+(end==="?"?0.14:end==="!"?0.06:0);
   u.volume=1;
   var adv=false,guard=null;
   function after(){if(adv)return;adv=true;clearTimeout(guard);var gap=/[.!?\u2026]$/.test(p)?380:/[,;:]$/.test(p)?170:60;setTimeout(next,gap)}
   u.onstart=function(){api.spoke=true};u.onend=after;u.onerror=function(){if(adv)return;adv=true;clearTimeout(guard);res("err")};
   guard=setTimeout(after,Math.round(p.length*95/u.rate)+2500); /* if the browser never reports the end, move on anyway */
   try{synth.speak(u)}catch(e){res("err")}
  }
  try{synth.cancel()}catch(e){}
  setTimeout(next,60);
 });
}
function stop(){token++;try{synth.cancel()}catch(e){}}
function pause(){try{synth.pause()}catch(e){}}
function resume(){try{synth.resume()}catch(e){}}
function unlock(){try{var u=new SpeechSynthesisUtterance(" ");u.volume=0;synth.speak(u)}catch(e){}}
var api=window.SBTTS={spoke:false,speak:speak,stop:stop,pause:pause,resume:resume,unlock:unlock,ok:!!synth};
})();
