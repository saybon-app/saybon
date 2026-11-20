(function(){
"use strict";
var LV=window.PT_LEVELS, ITEMS=window.PT_ITEMS;
var START=1, MAXQ=14, MINQ=5, FRENCH_AFTER=7, CONF=0.8, FEEDBACK_MS=1250;
function sig(x){return 1/(1+Math.exp(-x))}
function know(th,L){return .05+.9*sig(1.7*(th-L+.5))}
function lik(th,L,res){var k=know(th,L);if(res==="ok")return k+(1-k)*.4*.25;if(res==="idk")return (1-k)*.6;return (1-k)*.4*.75}
var TEACHER_TEXT="Hey, you. Take a breath, and look how far you've come. Honestly, you're doing really well. I already have everything I need to know your level. Would you like to see it now? Or keep going, just for fun. Either way, I'm so proud of you.";
var $=function(i){return document.getElementById(i)};
var st=null, okCache={};
function fresh(){return{lv:START,n:0,post:(function(){var w=[1,2,3,3,3,2,1],s=14;return w.map(function(x){return x/s})})(),res:LV.map(function(){return{c:0,t:0}}),seen:{},hist:[],wrong:0,teacherShown:0,cur:null,log:[]}}

/* ---- asset availability: skip any item whose picture/audio is missing ---- */
function check(url,kind){
  if(url in okCache)return okCache[url];
  okCache[url]=fetch(url,{method:"HEAD"}).then(function(r){var ct=(r.headers.get("content-type")||"").toLowerCase();return r.ok&&ct.indexOf(kind)===0}).catch(function(){return false});
  return okCache[url];
}
function imgUrl(it){return "/assets/images/placement/"+it.img+".webp"}
function audUrl(it){return "/assets/audio/placement/"+it.id+".mp3"}
function usable(it){
  if(it.speak&&(speechOff||!canRecord()))return Promise.resolve(false);
  var p=[];
  if(it.img)p.push(check(imgUrl(it),"image"));
  if(it.say)p.push(check(audUrl(it),"audio"));
  return Promise.all(p).then(function(a){return a.every(Boolean)});
}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}

/* ---- pick the next question: nearest level with an unseen, usable item ---- */
async function nextItem(){
  // rhythm: one special question (oral first, then photo, reading, listening in turn), then two regular ones, and so on
  var noOral=(speechOff||!canRecord())&&!(st.log.length&&st.log[0].kind==="speak"), n=st.log.length+(noOral?3:0), want;
  if(n===0)want="speak";
  else{var m=(n-1)%3; want=m<2?"text":["picture","read","listen"][Math.floor((n-1)/3)%3]}
  var f=await pick(false,[want],want==="speak"?0:null);
  if(f)return f;
  if(want!=="text"){f=await pick(false,["text"]);if(f)return f}
  return (await pick(true))||(await pick(false));
}
async function pick(strict,only,exactLv){
  var order=[0,-1,1,-2,2,-3,3];
  for(var k=0;k<order.length;k++){
    var L=st.lv+order[k]; if(exactLv!=null){if(k>0)break;L=exactLv}
    if(L<0||L>6)continue;
    if(st.n<FRENCH_AFTER&&L>2)continue;   // French-only questions wait until after question 7
    var lk=st.log.length?st.log[st.log.length-1].kind:null;
    var pool=shuffle(ITEMS.filter(function(x){return x.lv===L&&!st.seen[x.id]&&!(strict&&kind(x)===lk)&&(!only||only.indexOf(kind(x))>-1)}));
    // keep a mix: prefer a kind (picture / listening / text) not used in the last two questions
    var last=st.log.slice(-2).map(function(l){return l.kind});
    // variety: favour the kinds used least so far (photo, listening, reading), plain grammar last
    var cnt={};st.log.forEach(function(l){cnt[l.kind]=(cnt[l.kind]||0)+1});
    var sc=function(x){var k=kind(x);return (last.indexOf(k)>-1?10:0)+(cnt[k]||0)+(k==="text"?6:0)};
    pool.sort(function(a,b){return sc(a)-sc(b)});
    for(var i=0;i<pool.length;i++){ if(await usable(pool[i]))return pool[i]; st.seen[pool[i].id]=1; }
  }
  return null;
}
function kind(it){return it.speak?"speak":it.say?"listen":it.img?"picture":it.p?"read":"text"}

/* ---- placement estimate: Bayesian over the seven levels ---- */
function mapLevel(){var m=0;for(var i=1;i<7;i++)if(st.post[i]>st.post[m])m=i;return m}
function conf(){return Math.max.apply(null,st.post)}
function estimate(){return mapLevel()}
function update(L,res){
  var p=st.post.map(function(v,th){return v*lik(th,L,res)}),s=p.reduce(function(a,b){return a+b},0);
  st.post=p.map(function(v){return v/s});
}

/* ---- screens ---- */
function setFill(){ $("fill").style.width=Math.min(94,(st.n/12)*100)+"%"; }
function intro(){
  $("card").innerHTML='<div class="body"><div class="kick">Placement</div><h1 class="big">Let\'s find your level.</h1><p class="lead">A few short questions with pictures, sounds and sentences. There is no pass or fail, and it stops as soon as we know. Answer what you can, and guess if you are unsure.</p></div><button class="btn" id="go">Begin</button>';
  $("go").onclick=function(){
    // unlock audio on this tap (mobile browsers)
    try{var a=$("qAud");a.muted=true;a.src="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";a.play().then(function(){a.pause();a.muted=false}).catch(function(){a.muted=false})}catch(e){}
    st=fresh(); $("scoreN").textContent="0";
    if(canRecord()){navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){s.getTracks().forEach(function(t){t.stop()});ask()},function(){speechOff=true;ask()})}else ask();
  };
}
async function ask(){
  setFill();
  var it=await nextItem();
  if(!it){return finish()}
  st.cur=it; st.seen[it.id]=1;
  if(it.speak)return askSpeak(it);
  var opts=shuffle(it.o.map(function(t,i){return{t:t,ok:i===it.c}}));
  st.cur.shown=opts;
  var h='<div class="kick">Question '+(st.n+1)+'</div><div class="body"><h1>'+esc(it.q).replace(/« /g,'«\u00A0').replace(/ »/g,'\u00A0»')+'</h1>'+(it.h?'<p class="hint">'+esc(it.h)+'</p>':'')+(it.p?'<div class="passage">'+esc(it.p)+'</div>':'');
  if(it.img)h+='<div class="qgrid"><img class="pic" src="'+imgUrl(it)+'" alt=""><div>';
  if(it.say)h+='<button class="snd" id="snd"><i>▶</i> Play the audio</button>';
  h+='<div class="opts">'+opts.map(function(o,i){return '<button class="opt" data-i="'+i+'">'+esc(o.t)+'</button>'}).join("")+'<button class="opt idk" data-i="-1">I don\'t know</button></div>'+(it.img?'</div></div></div>':'</div>');
  $("card").innerHTML=h; $("card").classList.toggle("wide",!!it.img);
  if(it.say){
    var a=$("qAud");
    var play=function(){a.src=audUrl(it);a.currentTime=0;a.play().catch(function(){})};
    $("snd").onclick=play; setTimeout(play,350);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.dataset.i,b)}});
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
}

/* ---- speaking: hear a line, answer out loud, scored kindly by the server (Azure) ---- */
var SPEAK_API="https://saybonapp-server.onrender.com/api/assessPronunciation", SPEAK_PASS=50, speechOff=false;
function canRecord(){return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder&&(window.AudioContext||window.webkitAudioContext))}
function recStart(){
  return navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    var mr=new MediaRecorder(stream),chunks=[],h={mr:mr,stream:stream};
    mr.ondataavailable=function(ev){if(ev.data&&ev.data.size)chunks.push(ev.data)};
    h.done=new Promise(function(res){mr.onstop=function(){stream.getTracks().forEach(function(t){t.stop()});res(new Blob(chunks,{type:mr.mimeType||"audio/mp4"}))}});
    mr.start();return h;
  });
}
function toWav16(blob){
  return blob.arrayBuffer().then(function(ab){
    var AC=window.AudioContext||window.webkitAudioContext,ac=new AC();
    return new Promise(function(res,rej){ac.decodeAudioData(ab,res,rej)}).then(function(buf){
      try{ac.close()}catch(e){}
      var len=Math.max(1,Math.ceil(buf.duration*16000)),oc=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(1,len,16000);
      var src=oc.createBufferSource();src.buffer=buf;src.connect(oc.destination);src.start(0);
      return new Promise(function(res,rej){var r=oc.startRendering();if(r&&r.then)r.then(res,rej);oc.oncomplete=function(ev){res(ev.renderedBuffer)}});
    });
  }).then(function(out){
    var d=out.getChannelData(0),n=d.length,b=new ArrayBuffer(44+n*2),v=new DataView(b);
    function s(o,t){for(var i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))}
    s(0,"RIFF");v.setUint32(4,36+n*2,true);s(8,"WAVEfmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,"data");v.setUint32(40,n*2,true);
    for(var i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i]));v.setInt16(44+i*2,x<0?x*0x8000:x*0x7FFF,true)}
    return new Blob([b],{type:"audio/wav"});
  });
}
function askSpeak(it){
  st.cur.shown=[];
  var h='<div class="kick">Question '+(st.n+1)+'</div><div class="body"><h1>'+esc(it.q)+'</h1>'+
   '<div class="avatar" id="av"><img alt="" src="/assets/images/placement/teacher_head.png"></div>'+
   '<p class="hint spk" id="spk">&nbsp;</p>'+
   '<button class="snd" id="snd" style="display:none"><i>▶</i> Tap to hear me</button>'+
   '<div class="opts"><button class="opt idk" data-i="-1">I can\'t speak now</button></div></div>';
  $("card").innerHTML=h; $("card").classList.remove("wide");
  var a=$("qAud"),av=$("av"),msg=$("spk"),snd=$("snd"),tries=0,gone=false,stopRec=null;
  function say(t){msg.textContent=t}
  function skip(){gone=true;speechOff=true;st.seen[it.id]=1;ask()}
  function listen(){
    snd.style.display="none";av.classList.remove("rec");av.classList.add("talk");say("Listen…");
    a.onended=function(){a.onended=null;av.classList.remove("talk");if(!gone)respond()};
    a.onerror=function(){a.onerror=null;av.classList.remove("talk");skip()};
    a.src=audUrl(it);a.currentTime=0;
    var pr=a.play();
    if(pr&&pr.catch)pr.catch(function(){av.classList.remove("talk");say("Tap to hear me");snd.style.display="";});
  }
  function score(blob){
    return toWav16(blob).then(function(wav){
      var ctl=new AbortController(),to=setTimeout(function(){ctl.abort()},45000);
      return fetch(SPEAK_API+"?referenceText="+encodeURIComponent(it.speak),{method:"POST",headers:{"Content-Type":"audio/wav"},body:wav,signal:ctl.signal}).then(function(r){clearTimeout(to);return r.json().then(function(j){return{ok:r.ok,status:r.status,j:j}})});
    });
  }
  function respond(){
    if(gone)return;
    av.classList.add("rec");say("Your turn. Answer me out loud.");
    var rec=null,ctx=null,timer=null,iv=null,done=false;
    function cleanup(){clearInterval(iv);clearTimeout(timer);try{ctx&&ctx.close()}catch(e){}}
    function stop(){ if(done||!rec)return; done=true;cleanup();av.classList.remove("rec");say("Checking…");
      try{rec.mr.stop()}catch(e){}
      rec.done.then(score).then(function(x){
        if(gone)return;
        if(x.status===400){tries++;if(tries<2){say("I didn't catch that. Say it again.");return setTimeout(respond,900)}
          say("I couldn't hear you. Tap me to try again, or skip.");av.onclick=function(){av.onclick=null;tries=0;listen()};return}
        if(!x.ok||typeof x.j.finalScore!=="number")return skip();
        var pass=x.j.finalScore>=SPEAK_PASS;
        av.classList.add(pass?"good":"soft");say(pass?"Très bien !":"Good try, let's keep going");
        Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){b.disabled=true;b.classList.add("dim")});
        gone=true;answer(0,av,pass?"ok":"bad");
      }).catch(function(){if(!gone)skip()});
    }
    stopRec=stop;
    recStart().then(function(r){
      if(gone){r.mr.stop();return}
      rec=r;
      var t0=Date.now(),spoke=false,last=0;
      try{
        var AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();
        var src=ctx.createMediaStreamSource(r.stream),an=ctx.createAnalyser();an.fftSize=1024;src.connect(an);
        var buf=new Uint8Array(an.fftSize);
        iv=setInterval(function(){
          an.getByteTimeDomainData(buf);var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}
          var rms=Math.sqrt(s/buf.length),now=Date.now();
          if(rms>0.03){spoke=true;last=now}
          if(spoke&&now-last>900)stop();
          else if(!spoke&&now-t0>6000)stop();
        },60);
      }catch(e){}
      timer=setTimeout(stop,7000);
    }).catch(function(){skip()});
  }
  snd.onclick=listen;
  Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){gone=true;try{a.pause()}catch(e){}if(stopRec)try{stopRec()}catch(e){}answer(-1,b)}});
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  setTimeout(listen,500);
}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

function flyPlus(from){
  var to=$("score").getBoundingClientRect(),f=from.getBoundingClientRect();
  var p=document.createElement("div");p.className="plus";p.textContent="+1";
  p.style.left=(f.left+f.width/2-14)+"px";p.style.top=(f.top+f.height/2-14)+"px";document.body.appendChild(p);
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    p.style.transform="translate("+(to.left+to.width/2-f.left-f.width/2)+"px,"+(to.top+to.height/2-f.top-f.height/2)+"px) scale(.8)";
  })});
  setTimeout(function(){p.style.opacity="0"},650);
  setTimeout(function(){
    if(p.parentNode)p.parentNode.removeChild(p);
    var s=$("score"),n=$("scoreN");n.textContent=(+n.textContent||0)+1;
    s.classList.remove("bump");void s.offsetWidth;s.classList.add("bump");
  },780);
}
function answer(i,btn,force){
  var it=st.cur, idk=(i<0), ok=!idk&&(force?force==="ok":st.cur.shown[i].ok);
  var all=document.querySelectorAll(".opt");
  Array.prototype.forEach.call(all,function(b){b.disabled=true});
  // colour: your pick turns red if wrong, the right answer turns green
  Array.prototype.forEach.call(all,function(b){
    var bi=+b.dataset.i;
    if(bi>=0&&st.cur.shown[bi].ok)b.classList.add("good");
    else if(b===btn&&!idk)b.classList.add("bad");
    else b.classList.add("dim");
  });
  if(ok)flyPlus(btn);
  try{$("qAud").pause()}catch(e){}
  var r=st.res[it.lv]; r.t++; if(ok)r.c++;
  update(it.lv,ok?"ok":(idk?"idk":"bad"));
  st.n++; st.hist.push(it.lv);
  st.log.push({id:it.id,lv:it.lv,ok:ok,idk:idk,kind:kind(it)});
  st.wrong=ok?0:st.wrong+1;
  var want=Math.round(st.post.reduce(function(a,p,i){return a+p*i},0));
  st.lv=Math.max(0,Math.min(6,Math.max(it.lv-1,Math.min(it.lv+1,want)))); // at most one step from the question just asked
  setFill();
  setTimeout(function(){
    if(st.wrong>=3 && st.teacherShown<2 ){return teacher()}
    if(st.wrong>=3 && st.n>=3 && st.teacherShown>=2){return finish()}
    var top3=st.log.slice(-3).length===3&&st.log.slice(-3).every(function(l){return l.ok&&l.lv===6});
    if(top3||st.n>=MAXQ||(st.n>=MINQ&&conf()>=CONF&&(st.n>=FRENCH_AFTER||mapLevel()<=1)))return finish();
    ask();
  },FEEDBACK_MS);
}

/* ---- the teacher: five stills that cross-fade while she speaks ---- */
var tFrames=null;
async function loadFrames(){
  if(tFrames)return tFrames;
  var list=[];
  for(var i=1;i<=5;i++){var u="/assets/images/placement/teacher_"+i+".png";if(await check(u,"image"))list.push(u)}
  if(!list.length&&await check("/assets/images/teacher-intervention.webp","image"))list.push("/assets/images/teacher-intervention.webp");
  tFrames=list;return list;
}
async function teacher(){
  st.teacherShown++;
  var T=$("teacher"),txt=$("tTxt"),act=$("tAct"),aud=$("tAud"),stage=$("tStage");
  var frames=await loadFrames();
  stage.innerHTML=frames.map(function(u,i){return '<img alt="" src="'+u+'" class="'+(i===0?'on':'')+'">'}).join("");
  var imgs=stage.querySelectorAll("img");
  txt.textContent=""; act.classList.remove("on"); T.classList.add("on");
  var words=TEACHER_TEXT.split(" "),k=0,textTimer=null,frameTimer=null,shown=false,fi=0;
  function showFrame(n){Array.prototype.forEach.call(imgs,function(im,i){im.classList.toggle("on",i===n)})}
  function reveal(){ if(shown)return; shown=true; clearInterval(textTimer); clearInterval(frameTimer); txt.textContent=TEACHER_TEXT; showFrame(imgs.length-1); act.classList.add("on") }
  var take=window.PT_TEACHER||"a";
  aud.src="/assets/audio/placement/teacher_"+take+".mp3";
  aud.onended=reveal; aud.onerror=function(){txt.textContent=TEACHER_TEXT;setTimeout(reveal,2500)};
  function startShow(dur){
    var total=(dur&&isFinite(dur)?dur:words.length*0.33)*1000;
    var perWord=total/words.length;
    textTimer=setInterval(function(){k++;txt.textContent=words.slice(0,k).join(" ");if(k>=words.length)clearInterval(textTimer)},perWord);
    if(imgs.length>1){var step=total/imgs.length;frameTimer=setInterval(function(){fi=Math.min(imgs.length-1,fi+1);showFrame(fi);if(fi>=imgs.length-1)clearInterval(frameTimer)},step)}
  }
  var p=aud.play();
  if(p&&p.then){p.then(function(){ if(aud.readyState>=1)startShow(aud.duration); else aud.onloadedmetadata=function(){startShow(aud.duration)} }).catch(function(){startShow(0);setTimeout(reveal,words.length*330+2500)})}
  else startShow(0);
  setTimeout(reveal,45000); // safety
  $("tShow").onclick=function(){T.classList.remove("on");aud.pause();finish()};
  $("tKeep").onclick=function(){T.classList.remove("on");aud.pause();clearInterval(textTimer);clearInterval(frameTimer);st.wrong=0;ask()};
}

function finish(){
  var L=LV[estimate()];
  try{sessionStorage.setItem("saybon_level",L);sessionStorage.setItem("saybon_next","/reveal/");sessionStorage.setItem("saybon_placement_log",JSON.stringify(st.log))}catch(e){}
  window.location.href="/loader.html";
}
$("home").onclick=function(){window.location.href="/start.html"};
window.__pt={get:function(){return st},estimate:function(){return estimate()}};
intro();
})();
