(function(){
"use strict";
var LV=window.PT_LEVELS, ITEMS=window.PT_ITEMS;
var START=1, MAXQ=20, MINQ=14, FRENCH_AFTER=7, CONF=0.8, FEEDBACK_MS=1250;
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
// Opening staircase, same for everyone, never skipping a level: questions 1-5 are A0, 6-9 are A1, 10-11 are A2.
// After that the test adapts. If a learner got fewer than half of a stage right, they stay at the lower level instead of moving up.
var STAIR=[5,9,11];
function stageLevel(n){
  var lv=n<STAIR[0]?0:n<STAIR[1]?1:n<STAIR[2]?2:-1;
  // strong learners move on early: three correct answers in a row at the current stage end that stage (never skipping a level)
  while(lv>=0&&lv<2){
    var tail=st.log.slice(-3);
    if(tail.length===3&&tail.every(function(l){return l.ok&&l.lv>=lv&&!l.idk})&&st.log.filter(function(l){return l.lv===lv}).length>=3)lv++; else break;
  }
  while(lv>0){
    var prev=st.log.filter(function(l){return l.lv===lv-1&&l.kind!=="speak"||l.lv===lv-1&&l.kind==="speak"});
    if(prev.length&&prev.filter(function(l){return l.ok}).length/prev.length<0.5)lv--; else break;
  }
  return lv;
}
async function nextItem(){
  // rhythm: one special question (oral first, then photo, reading, listening in turn), then two regular ones, and so on
  var noOral=(speechOff||!canRecord())&&!(st.log.length&&st.log[0].kind==="speak"), n=st.log.length+(noOral?3:0), want;
  // special questions: every third at the start (oral, photo), then every second one, so photos and listening come round often
  var SPEC=["speak","picture","listen","picture","listen","speak","picture","read","listen","picture","listen"];
  var special=n===0||(n<6?n%3===0:n%2===0);
  if(special){var idx=st.log.filter(function(l){return l.kind!=="text"}).length+(noOral?1:0);want=SPEC[idx%SPEC.length];if(want==="speak"&&n>0&&st.lv>2)want="picture"}
  else want="text";
  var sl=stageLevel(st.log.length), lv=null;
  if(sl>=0){lv=[sl];if(sl>0)lv.push(sl-1);lv.push(sl+1);if(want==="speak")lv=[0]}
  var f=await pick(false,[want],lv);
  if(f)return f;
  if(want!=="text"){f=await pick(false,["text"],lv);if(f)return f}
  if(lv){f=await pick(false,null,lv);if(f)return f}
  return (await pick(true))||(await pick(false));
}
async function pick(strict,only,lvls){
  var order=[0,-1,1,-2,2,-3,3];
  for(var k=0;k<(lvls?lvls.length:order.length);k++){
    var L=lvls?lvls[k]:st.lv+order[k];
    if(L<0||L>6)continue;
    if(st.n<FRENCH_AFTER&&L>2)continue;   // French-only questions wait until after question 7
    var lk=st.log.length?st.log[st.log.length-1].kind:null;
    var pool=shuffle(ITEMS.filter(function(x){return x.lv===L&&!st.seen[x.id]&&!(strict&&kind(x)===lk)&&(!only||only.indexOf(kind(x))>-1)}));
    // keep a mix: prefer a kind (picture / listening / text) not used in the last two questions
    var last=st.log.slice(-2).map(function(l){return l.kind});
    // variety: favour the kinds used least so far (photo, listening, reading), plain grammar last
    var cnt={};st.log.forEach(function(l){cnt[l.kind]=(cnt[l.kind]||0)+1});
    var lastShapes=st.log.filter(function(l){return l.kind==="text"}).slice(-2).map(function(l){return l.shape});
    var sc=function(x){var k=kind(x);if(k==="text"){var sh=shape(x);return (lastShapes.indexOf(sh)>-1?8:0)+(sh==="fill"?4:0)}return (last.indexOf(k)>-1?10:0)+(cnt[k]||0)};
    pool.sort(function(a,b){return sc(a)-sc(b)});
    for(var i=0;i<pool.length;i++){ if(await usable(pool[i]))return pool[i]; st.seen[pool[i].id]=1; }
  }
  return null;
}
function shape(it){return it.s||(/^Compl/.test(it.q)?"fill":"reply")}
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
  var MIC='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="10.5" y="2.5" width="11" height="17" rx="5.5" fill="currentColor" stroke="none"/><path d="M11.6 7.2h8.8M11 10.4h10M11 13.6h10M11.6 16.6h8.8" stroke="rgba(40,14,0,.55)" stroke-width="1.15"/><path d="M6.6 14v1.2a9.4 9.4 0 0 0 18.8 0V14"/><path d="M16 24.6v3.4M11.2 28.4h9.6"/></svg>',VU="/assets/audio/placement/intro-eryn.mp3?v=3",BU="/assets/audio/lesson-jazz.mp3",bed=null,fadeT=null,voice=$("qAud"),started=false;
  $("card").innerHTML='<div class="body intro3"><div class="kick">Placement</div><button type="button" class="pc-teach" id="introMic" aria-label="Teacher" style="display:none">'+MIC+'</button><div class="pc-hint" id="introHint">&nbsp;</div><p class="isub">Not an exam. Just a way to place you in the right spot.</p><div class="ilv"><span>A0</span><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span></div><p class="iq">20 questions</p></div><button class="btn" id="go">Begin</button><button type="button" class="iskip" id="introSkip">Skip</button>';
  var mic=$("introMic"),hint=$("introHint");
  function fade(el,to,ms,done){clearInterval(fadeT);if(!el)return;var from=el.volume,n=Math.max(1,Math.round(ms/50)),i=0;fadeT=setInterval(function(){i++;try{el.volume=Math.max(0,Math.min(1,from+(to-from)*i/n))}catch(e){}if(i>=n){clearInterval(fadeT);if(done)done()}},50)}
  function bedStart(){try{if(!bed){bed=new Audio(BU);bed.loop=true;bed.volume=0}bed.currentTime=Math.max(bed.currentTime,22);var p=bed.play();if(p&&p.catch)p.catch(function(){});fade(bed,0.09,1800)}catch(e){}}
  function bedStop(){if(!bed)return;var b=bed;fade(b,0,1600,function(){try{b.pause()}catch(e){}})}
  function stopAll(){try{voice.pause()}catch(e){}voice.onended=null;voice.onplay=null;voice.onpause=null;mic.classList.remove("on");clearInterval(fadeT);if(bed){try{bed.pause()}catch(e){}bed=null}}
  function say(){started=true;voice.defaultPlaybackRate=1;voice.src=VU;voice.currentTime=0;
    voice.onplay=function(){mic.classList.add("on");hint.innerHTML="&nbsp;";bedStart()};
    voice.onpause=function(){if(!voice.ended){mic.classList.remove("on");if(bed)try{bed.pause()}catch(e){}}};
    voice.onended=function(){mic.classList.remove("on");bedStop()};
    var pr=voice.play();if(pr&&pr.catch)pr.catch(function(){started=false;hint.textContent="tap to listen"});}
  mic.onclick=function(){if(!started||voice.ended){say();return}if(voice.paused){var q=voice.play();if(q&&q.catch)q.catch(function(){});if(bed)try{bed.play()}catch(e){}}else voice.pause()};
  fetch(VU,{method:"HEAD"}).then(function(r){var ct=(r.headers.get("content-type")||"").toLowerCase();if(!(r.ok&&ct.indexOf("audio")===0))return;mic.style.display="";say()}).catch(function(){});
  $("introSkip").onclick=function(){$("go").click()};
  $("go").onclick=function(){
    stopAll();
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
  var h='<div class="kick">Question '+(st.n+1)+'</div><div class="body"><h1>'+esc(it.q).replace(/« /g,'«\u00A0').replace(/ »/g,'\u00A0»')+'</h1>'+(it.h?'<p class="hint">'+esc(it.h)+'</p>':'')+(it.p?'<div class="passage">'+esc(it.p)+'</div>':'')+(it.d?'<div class="passage dlg">'+esc(it.d).replace(/\n/g,'<br>')+'</div>':'');
  if(it.img)h+='<div class="qgrid"><img class="pic" src="'+imgUrl(it)+'" alt=""><div>';
  if(it.say)h+='<div class="avatar" id="av" role="button"><img alt="" src="/assets/images/placement/teacher_head.png"></div><p class="hint spk" id="spk">Listen…</p><button class="snd" id="slow" type="button"><i>▶</i> Listen slower</button>';
  h+='<div class="opts">'+opts.map(function(o,i){return '<button class="opt" data-i="'+i+'">'+esc(o.t)+'</button>'}).join("")+'<button class="opt idk" data-i="-1">I don\'t know</button></div>'+(it.img?'</div></div></div>':'</div>');
  $("card").innerHTML=h; $("card").classList.toggle("wide",!!it.img);
  if(it.say){
    var a=$("qAud");
    var av=$("av"),sp=$("spk");
    var play=function(rate){
      rate=(typeof rate==="number")?rate:1;try{a.pause()}catch(e){}
      av.classList.add("talk");sp.textContent="Listen…";
      a.onended=function(){a.onended=null;av.classList.remove("talk");sp.textContent="Tap me to hear it again"};
      a.onerror=function(){a.onerror=null;av.classList.remove("talk");sp.textContent=""};
      a.defaultPlaybackRate=rate;a.src=audUrl(it);a.playbackRate=rate;try{a.preservesPitch=true;a.webkitPreservesPitch=true}catch(e){}a.currentTime=0;
      var pr=a.play();if(pr&&pr.catch)pr.catch(function(){av.classList.remove("talk");sp.textContent="Tap me to hear it"});
    };
    av.onclick=function(){play(1)}; var sl=$("slow");if(sl)sl.onclick=function(){play(0.7)}; setTimeout(function(){play(1)},350);
  }
  Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){answer(+b.dataset.i,b)}});
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
}

/* ---- speaking: hear a line, answer out loud, scored kindly by the server (Azure) ---- */
var SPEAK_API="https://saybonapp-server.onrender.com/api/assessPronunciation", SPEAK_PASS=50, speechOff=false;
function canRecord(){return !!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder&&(window.AudioContext||window.webkitAudioContext))}
function recStart(){
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(function(stream){
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
    var d=out.getChannelData(0),n=d.length,b=new ArrayBuffer(44+n*2),v=new DataView(b);var pk=0;for(var j=0;j<n;j++){var q=Math.abs(d[j]);if(q>pk)pk=q}var G=(pk>0.004&&pk<0.7)?Math.min(40,0.85/pk):1;
    function s(o,t){for(var i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i))}
    s(0,"RIFF");v.setUint32(4,36+n*2,true);s(8,"WAVEfmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,"data");v.setUint32(40,n*2,true);
    for(var i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i]*G));v.setInt16(44+i*2,x<0?x*0x8000:x*0x7FFF,true)}
    return new Blob([b],{type:"audio/wav"});
  });
}
/* the same marking curve the lessons use: kind at A0, stricter as the levels climb; a word that sounds like the right word is about 50 */
var LENP={0:{g:.66,f:38},1:{g:.77,f:28},2:{g:.86,f:17},3:{g:.93,f:5},4:{g:.98,f:0},5:{g:1,f:0},6:{g:1,f:0}};
function curveP(raw,lv){var L=LENP[lv]||LENP[1];raw=+raw||0;if(raw<8)return{v:0,heard:false};var v=Math.round(100*Math.pow(Math.min(100,raw)/100,L.g));v=Math.max(v,L.f);return{v:Math.min(100,v),heard:true}}
function askSpeak(it){
  st.cur.shown=[];
  var h='<div class="kick">Question '+(st.n+1)+'</div><div class="body"><h1>'+esc(it.q)+'</h1>'+
   '<div class="avatar" id="av"><img alt="" src="/assets/images/placement/teacher_head.png"></div>'+
   '<p class="hint spk" id="spk">&nbsp;</p>'+
   '<button class="snd" id="snd" style="display:none"><i>▶</i> Tap to hear me</button>'+'<button class="snd" id="slow2" type="button"><i>▶</i> Listen slower</button>'+
   '<div class="opts"><button class="opt idk" data-i="-1">I can\'t speak now</button></div></div>';
  $("card").innerHTML=h; $("card").classList.remove("wide");
  var a=$("qAud"),av=$("av"),msg=$("spk"),snd=$("snd"),tries=0,gone=false,stopRec=null;
  function say(t){msg.textContent=t}
  function skip(){gone=true;speechOff=true;st.seen[it.id]=1;ask()}
  function listen(rate){
    rate=(typeof rate==="number")?rate:1;try{a.pause()}catch(e){}
    snd.style.display="none";av.classList.remove("rec");av.classList.add("talk");say("Listen…");
    a.onended=function(){a.onended=null;av.classList.remove("talk");if(!gone)respond()};
    a.onerror=function(){a.onerror=null;av.classList.remove("talk");skip()};
    a.defaultPlaybackRate=rate;a.src=audUrl(it);a.playbackRate=rate;try{a.preservesPitch=true;a.webkitPreservesPitch=true}catch(e){}a.currentTime=0;
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
    av.classList.add("rec");say("Your turn. Take your time, I'm listening.");
    var rec=null,ctx=null,timer=null,iv=null,done=false;
    function cleanup(){clearInterval(iv);clearTimeout(timer);try{ctx&&ctx.close()}catch(e){}}
    function stop(){ if(done||!rec)return; done=true;cleanup();av.classList.remove("rec");say("Checking…");
      try{rec.mr.stop()}catch(e){}
      rec.done.then(score).then(function(x){
        if(gone)return;
        if(x.status===400){tries++;if(tries<2){say("I didn't catch that. Say it again.");return setTimeout(respond,900)}
          say("I couldn't hear you. Tap me to try again, or skip.");av.onclick=function(){av.onclick=null;tries=0;listen()};return}
        if(!x.ok||typeof x.j.finalScore!=="number"){tries++;if(tries<2){say("One more time.");return setTimeout(respond,900)}return skip()}
        var cv=curveP(x.j.finalScore,it.lv),pass=cv.heard&&cv.v>=SPEAK_PASS;
        av.classList.add(pass?"good":"soft");say(pass?"Très bien !":"Good try, let's keep going");
        Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){b.disabled=true;b.classList.add("dim")});
        gone=true;answer(0,av,pass?"ok":"bad");
      }).catch(function(){if(gone)return;tries++;if(tries<2){say("One more time.");return setTimeout(respond,900)}skip()});
    }
    stopRec=stop;
    recStart().then(function(r){
      if(gone){r.mr.stop();return}
      rec=r;
      var t0=Date.now(),spoke=false,last=0,calib=[],floor=null;
      try{
        var AC=window.AudioContext||window.webkitAudioContext;ctx=new AC();
        var src=ctx.createMediaStreamSource(r.stream),an=ctx.createAnalyser();an.fftSize=1024;src.connect(an);
        var buf=new Uint8Array(an.fftSize);
        iv=setInterval(function(){
          an.getByteTimeDomainData(buf);var s=0;for(var i=0;i<buf.length;i++){var v=(buf[i]-128)/128;s+=v*v}
          var rms=Math.sqrt(s/buf.length),now=Date.now();
          if(now-t0<400){calib.push(rms);return}if(floor===null){var c2=calib.slice().sort(function(a,b){return a-b});floor=c2.length?c2[Math.floor(c2.length*0.3)]:0}var thr=Math.min(0.05,Math.max(0.012,floor*2.4));if(rms>thr){spoke=true;last=now}
          if(spoke&&now-last>1400)stop();
          else if(!spoke&&now-t0>25000)stop();
        },60);
      }catch(e){}
      timer=setTimeout(stop,45000);
    }).catch(function(){skip()});
  }
  snd.onclick=function(){listen(1)};var sl2=$("slow2");if(sl2)sl2.onclick=function(){tries=0;listen(0.7)};
  Array.prototype.forEach.call(document.querySelectorAll(".opt"),function(b){b.onclick=function(){gone=true;try{a.pause()}catch(e){}if(stopRec)try{stopRec()}catch(e){}answer(-1,b)}});
  if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();
  setTimeout(function(){listen(1)},500);
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
  st.log.push({id:it.id,lv:it.lv,ok:ok,idk:idk,kind:kind(it),shape:shape(it)});
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
  function showFrame(n){Array.prototype.forEach.call(imgs,function(im,i){im.classList.toggle("on",i===n)})}/*twalk*/function walk(total){var W=Math.max(5,Math.min(10,total*0.85/1000)),n=imgs.length,t0=null,raf=0,ended=false,last=0;var dist=(window.innerWidth/2)+(stage.offsetWidth||200)/2+20,bounces=Math.max(3,Math.round(W/1.4));stage.style.transform="translateX("+(-dist)+"px)";function rest(){ended=true;cancelAnimationFrame(raf);stage.style.transform="none"}function step(ts){if(ended)return;if(shown)return rest();if(t0===null)t0=ts;var t=Math.min(1,(ts-t0)/(W*1000)),e=1-Math.pow(1-t,2);var x=-dist*(1-e),s=Math.sin(Math.PI*bounces*t),y=-12*s*s*(1-t*t);stage.style.transform="translate("+x.toFixed(1)+"px,"+y.toFixed(1)+"px)";var f=Math.min(n-1,Math.floor(t*(n-1)+0.0001));if(t>=1)f=n-1;if(f!==last){last=f;fi=f;showFrame(f)}if(t>=1)return rest();raf=requestAnimationFrame(step)}raf=requestAnimationFrame(step)}/*endwalk*/
  function reveal(){ if(shown)return; shown=true; clearInterval(textTimer); clearInterval(frameTimer); txt.textContent=TEACHER_TEXT; showFrame(imgs.length-1); act.classList.add("on") }
  var take=window.PT_TEACHER||"a";
  aud.src="/assets/audio/placement/teacher_"+take+".mp3";
  aud.onended=reveal; aud.onerror=function(){txt.textContent=TEACHER_TEXT;setTimeout(reveal,2500)};
  function startShow(dur){
    var total=(dur&&isFinite(dur)?dur:words.length*0.33)*1000;
    var perWord=total/words.length;
    textTimer=setInterval(function(){k++;txt.textContent=words.slice(0,k).join(" ");if(k>=words.length)clearInterval(textTimer)},perWord);
    var nf=imgs.length;if(nf>1){var per=Math.max(2200,total/nf);frameTimer=setInterval(function(){fi=Math.min(nf-1,fi+1);showFrame(fi);if(fi>=nf-1)clearInterval(frameTimer)},per)}
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
