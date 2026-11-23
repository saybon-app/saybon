(function(){
"use strict";
var API="https://saybonapp-server.onrender.com";
var SLUG=document.body.getAttribute("data-place"),SH="/assets/talkletics/maison/",BASE="/assets/talkletics/places/"+SLUG+"/";
var SAVE="tkPlace-"+SLUG;
var $=function(id){return document.getElementById(id);};
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
var clamp=function(x,a,b){return Math.max(a,Math.min(b,x));};

fetch(BASE+"config.json?v=1").then(function(r){return r.json();}).then(function(CFG){
var PORTRAIT=window.innerWidth/window.innerHeight<0.9;
var LAY=CFG.layouts[PORTRAIT?"m":"d"];LAY.lamps=[];var SPOTS=LAY.spots||CFG.spots;
document.title="Talkletics - "+CFG.name;
$("pickTitle").textContent=CFG.name;$("pickKicker").textContent="Talkletics · Place "+CFG.order;
var ADJ={};LAY.e.split(" ").forEach(function(p){var a=p.split("-");(ADJ[a[0]]=ADJ[a[0]]||[]).push(a[1]);(ADJ[a[1]]=ADJ[a[1]]||[]).push(a[0]);});
function dist(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1]);}
function route(from,to){ // Dijkstra over the walkable points
  var D={},P={},Q=Object.keys(LAY.n);Q.forEach(function(k){D[k]=1e9;});D[from]=0;
  while(Q.length){var u=Q.reduce(function(a,b){return D[a]<=D[b]?a:b;});Q.splice(Q.indexOf(u),1);if(u===to)break;
    (ADJ[u]||[]).forEach(function(v){var d=D[u]+dist(LAY.n[u],LAY.n[v]);if(d<D[v]){D[v]=d;P[v]=u;}});}
  var r=[to];while(P[r[0]])r.unshift(P[r[0]]);return r;
}

/* ---------- the kids: one steady picture per direction, smooth gliding, bopping while they wait ---------- */
var SETS={
  girl:{right:4,left:7,up:2,upR:3,upL:5,front:18,back:2,tiltR:3,tiltL:5},
  boy:{right:14,left:11,up:8,upR:12,upL:9,front:17,back:8,tiltR:12,tiltL:9}
};
function spr(n){return SH+"chars/c"+(n<10?"0":"")+n+".webp";}
var who="girl",actor=$("actor"),layerA=$("actorImg"),layerB=$("actorImg2"),bop=$("bopper");
actor.style.height=LAY.ch+"px";
var front=layerA,backL=layerB,curPose=null;
function setPose(key){ // crossfades to the new picture, never snaps
  var n=SETS[who][key];if(n==null||curPose===who+key)return;curPose=who+key;
  var u=spr(n);backL.src=u;backL.classList.add("on");front.classList.remove("on");var t=front;front=backL;backL=t;
}
var charX=0,charY=0;
function pos(x,y){actor.style.left=x+"px";actor.style.top=y+"px";}

// the whole walk through the house as one long line, so every score can move the child a little further along it
var CHAIN=[],ARCS=[],OCC={},SECARC={};
var JUMPS=[],DOORA=1,DOORB=2; // closed gate and closed front door: the child vanishes at them and appears on the other side
function buildChain(){
  var nodes=[],occ=[];
  C.sections.forEach(function(sec){
    SPOTS[sec.id].forEach(function(sp,i){
      if(!nodes.length){nodes.push(sp);}
      else if(nodes[nodes.length-1]!==sp){var r=route(nodes[nodes.length-1],sp);for(var j=1;j<r.length;j++)nodes.push(r[j]);}
      occ.push({sec:sec.id,i:i,at:nodes.length-1});
    });
  });
  CHAIN=nodes.map(function(n){return LAY.n[n];});
  ARCS=[0];JUMPS=[];
  for(var i=1;i<CHAIN.length;i++){
    var jump=false;
    ARCS.push(ARCS[i-1]+(jump?130:dist(CHAIN[i-1],CHAIN[i])));
    if(jump)JUMPS.push([ARCS[i-1],ARCS[i]]);
  }
  JUMPS.forEach(function(j,n){if(n===1){DOORA=j[0];DOORB=j[1];}});
  occ.forEach(function(o){(SECARC[o.sec]=SECARC[o.sec]||[]).push(ARCS[o.at]);});
}
function settle(a){ // a child never comes to rest inside a gate or door: the step carries them through
  for(var i=0;i<JUMPS.length;i++)if(a>JUMPS[i][0]+4&&a<JUMPS[i][1])return JUMPS[i][1];
  return a;
}
function hiddenAt(a){for(var i=0;i<JUMPS.length;i++)if(a>JUMPS[i][0]+14&&a<JUMPS[i][1]-14)return true;return false;}
function scaleAt(a){
  if(!JUMPS.length)return 1; // walking away from the viewer: smaller and smaller until small enough for the door
  var end=Math.max(0.34,LAY.doorH*0.92/LAY.ch);
  if(a<(DOORA+DOORB)/2)return 1-(1-end)*ease(clamp(a/DOORA,0,1));
  return 0.82+0.13*clamp((a-DOORB)/120,0,1); // stepping out from behind the door at nearly full size
}
function pointAt(a){
  a=clamp(a,0,ARCS[ARCS.length-1]);var i=1;while(i<ARCS.length-1&&ARCS[i]<a)i++;
  var seg=ARCS[i]-ARCS[i-1]||1,t=(a-ARCS[i-1])/seg,p=CHAIN[i-1],q=CHAIN[i];
  return [p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
}
var arc=0,glideA=null,idleSince=performance.now(),want=null,wantSince=0;
function ease(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function glide(to,speed){ // smooth, no bobbing, no picture swapping
  return new Promise(function(done){
    to=settle(to);var from=arc,d=Math.abs(to-from);if(d<1){arc=to;done();return;}
    var dur=clamp(d/speed*1000,1100,9500);
    if(glideA&&glideA.done)glideA.done();
    glideA={from:from,to:to,t0:performance.now(),dur:dur,done:done};
  });
}
function faceOf(dx,dy){
  var ax=Math.abs(dx),ay=Math.abs(dy);
  if(ax>=ay*1.15)return dx>0?"right":"left";
  if(dy<0)return dx>ay*0.3?"upR":dx<-ay*0.3?"upL":"up";
  return "front";
}
var TURNS=[["back",3300],["tiltR",1100],["tiltL",1100],["back",2700],["tiltR",1000],["tiltL",1000],["back",2300]],TURN_TOTAL=TURNS.reduce(function(a,t){return a+t[1];},0);
var lastVis=1;
function dress(){var h=hiddenAt(arc)?0:1,sc=scaleAt(arc);actor.style.transform="translate(-50%,-100%) scale("+sc.toFixed(3)+")";if(h!==lastVis){lastVis=h;actor.style.opacity=h;}}
function updateActor(t){
  var bobY=0;
  if(glideA){
    var k=clamp((t-glideA.t0)/glideA.dur,0,1);arc=glideA.from+(glideA.to-glideA.from)*ease(k);
    var p=pointAt(arc),p2=pointAt(arc+(glideA.to>glideA.from?24:-24));charX=p[0];charY=p[1];
    var f=faceOf(p2[0]-p[0],p2[1]-p[1]);
    if(f!==want){want=f;wantSince=t;}
    if(t-wantSince>220)setPose(want);
    pos(charX,charY);bop.style.transform="none";dress();
    if(k>=1){var d=glideA.done;glideA=null;idleSince=t;want=null;d();}
  }else{
    var p3=pointAt(arc);charX=p3[0];charY=p3[1];
    var e=(t-idleSince)%TURN_TOTAL,acc=0,key="back";
    for(var i=0;i<TURNS.length;i++){acc+=TURNS[i][1];if(e<acc){key=TURNS[i][0];break;}}
    setPose(key);
    bobY=-Math.abs(Math.sin((t-idleSince)/720*Math.PI))*7; // bopping on the spot
    pos(charX,charY);bop.style.transform="translateY("+bobY.toFixed(1)+"px)";dress();
  }
}

/* ---------- the camera: pans slowly, follows the child, never stops moving ---------- */
var world=$("world"),house=$("house"),cam={x:0,y:0,s:1,ready:false},vw=0,vh=0;
function sizeWorld(){
  vw=window.innerWidth;vh=window.innerHeight;
  world.style.width=LAY.W+"px";world.style.height=LAY.H+"px";house.style.width=LAY.W+"px";house.style.height=LAY.H+"px";
}
function camTarget(t){
  var cover=Math.max(vw/LAY.W,(vh*1.0)/LAY.H);
  var z=cover*Math.max(1,LAY.zoom*(PORTRAIT?1:Math.min(1.15,vw/1300+0.3)));
  var breathe=1+Math.sin(t/5200)*0.018;var s=Math.max(cover,z*breathe);
  var fx=charX+Math.sin(t/4300)*26,fy=charY-LAY.ch*0.45+Math.cos(t/3700)*18;
  var tx=vw/2-fx*s,ty=vh*LAY.anchor-fy*s;
  tx=clamp(tx,vw-LAY.W*s,0);ty=clamp(ty,vh-LAY.H*s-vh*0.24,0); // the picture may slide up a little so the card never hides the child at the gate
  return {x:tx,y:ty,s:s};
}
var lastT=performance.now();
function loop(t){
  var dt=Math.min(80,t-lastT);lastT=t;if(CHAIN.length)updateActor(t);var g=camTarget(t);
  if(!cam.ready){cam.x=g.x;cam.y=g.y;cam.s=g.s;cam.ready=true;}
  var k=1-Math.pow(0.0008,dt/1000);cam.x+=(g.x-cam.x)*k;cam.y+=(g.y-cam.y)*k;cam.s+=(g.s-cam.s)*k;
  world.style.transform="translate("+cam.x.toFixed(1)+"px,"+cam.y.toFixed(1)+"px) scale("+cam.s.toFixed(4)+")";
  requestAnimationFrame(loop);
}
// lamp glows
(function(){var g=$("glows");LAY.lamps.forEach(function(p,i){var e=document.createElement("i");var r=PORTRAIT?150:130;
  e.style.cssText="left:"+p[0]+"px;top:"+p[1]+"px;width:"+r+"px;height:"+r+"px;animation-delay:"+(-i*0.55)+"s";g.appendChild(e);});})();
house.onload=function(){ // continue the ground below the picture as a soft blend of its bottom edge, so the card never sits on an empty strip
  try{
    var c=document.createElement("canvas");c.width=LAY.W;c.height=520;c.className="mz-ext";var x=c.getContext("2d");
    var t=document.createElement("canvas");t.width=24;t.height=1;var tx=t.getContext("2d");
    tx.drawImage(house,0,LAY.H-40,LAY.W,40,0,0,24,1);
    var d=tx.getImageData(0,0,24,1).data,g=x.createLinearGradient(0,0,LAY.W,0);
    for(var i=0;i<24;i++){g.addColorStop(i/23,"rgb("+d[i*4]+","+d[i*4+1]+","+d[i*4+2]+")");}
    x.fillStyle=g;x.fillRect(0,0,LAY.W,520);world.appendChild(c);
  }catch(e){}
};
house.src=BASE+LAY.img;

/* ---------- teacher voice ---------- */
var voice=new Audio();voice.preload="auto";
var SILENT="data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
var curFin=null;
function say(file){ if(paused)return waitResume().then(function(){return say(file);}); // resolves true when it finished playing, false if it was missing or stopped
  return new Promise(function(res){
    var done=false;function fin(ok){if(done)return;done=true;voice.onended=voice.onerror=null;curFin=null;res(ok);}
    curFin=fin;voice.onended=function(){fin(true);};voice.onerror=function(){fin(false);};
    voice.src=(/^(ok|retry)\d$|^nohear$|^again$|^intro$|^intro_(new|back)\d+$|^enc\d+$/.test(file)?SH:BASE)+"audio/"+file+".mp3";var p=voice.play();if(p&&p.catch)p.catch(function(){fin(false);});
  });
}
function stopVoice(){try{voice.pause();}catch(e){}if(curFin)curFin(false);}
/* ---------- pause, exit, spoken intro, encouragement ---------- */
var XS=SH,XT=null,paused=false,pauseHit=false,resumeWait=[],streak=0,sinceEnc=0,lastEnc=0,encGap=8+Math.floor(Math.random()*5);
function waitResume(){return paused?new Promise(function(r){resumeWait.push(r);}):Promise.resolve();}
var sleep=function(ms){return new Promise(function(r){var left=ms;(function tk(){if(!paused)left-=80;if(left<=0)return r();setTimeout(tk,80);})();});};
(function(){
  var st0=document.createElement("style");
  st0.textContent=".mz-pausebar{display:flex;justify-content:center;margin-top:10px}.mz-pausebtn{display:inline-flex;align-items:center;gap:8px;padding:9px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.55);background:rgba(255,255,255,.14);color:#fff;font:600 .92rem Poppins,sans-serif;cursor:pointer}.mz-pausebtn svg{width:16px;height:16px}.mz-pausebtn[hidden]{display:none}.mz-gate{z-index:60}.mz-gate .mz-sub{font-size:1.02rem;line-height:1.5;max-width:420px;margin-left:auto;margin-right:auto}.mz-gate .mz-ghost2{display:block;margin:12px auto 0;background:none;border:none;color:#fff;opacity:.85;font:500 .9rem Poppins,sans-serif;text-decoration:underline;cursor:pointer}";
  document.head.appendChild(st0);
  var mz=document.querySelector(".mz");
  mz.insertAdjacentHTML("beforeend",'<section class="mz-pick mz-gate" id="gateBox" hidden><div class="mz-pick-card"><p class="mz-kicker" id="gateK"></p><h1 id="gateH"></h1><p class="mz-sub" id="gateT"></p><button class="mz-btn mz-go" id="gateGo"></button><button class="mz-ghost2" id="gateExit" hidden>Exit to the map</button></div></section>');
  document.getElementById("gateExit").onclick=function(){location.href="map.html";};
  var pb=document.createElement("div");pb.className="mz-pausebar";pb.innerHTML='<button class="mz-pausebtn" id="pauseBtn" hidden aria-label="Pause"><svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>Pause</button>';document.getElementById("card").appendChild(pb);
})();
function gateShow(k,h,t,go,exit){$("gateK").textContent=k;$("gateH").textContent=h;$("gateT").textContent=t;$("gateGo").textContent=go;$("gateExit").hidden=!exit;$("gateBox").hidden=false;
  return new Promise(function(res){$("gateGo").onclick=function(){$("gateBox").hidden=true;res();};});}
function pauseGame(){
  if(paused)return;paused=true;pauseHit=true;try{voice.pause();}catch(e){}
  gateShow("Talkletics","Paused","Take a break. Your progress is saved.","Resume",true).then(function(){
    paused=false;pauseHit=false;
    try{if(voice.src&&voice.src.indexOf("data:")!==0&&!voice.ended&&voice.currentTime>0){var p=voice.play();if(p&&p.catch)p.catch(function(){});}}catch(e){}
    resumeWait.splice(0).forEach(function(r){r();});
  });
}
$("pauseBtn").onclick=pauseGame;
fetch(XS+"extras.json?v=1").then(function(r){return r.json();}).then(function(j){XT=j;}).catch(function(){});
async function introGate(){
  if(!XT)return;
  var seen=false;try{seen=!!localStorage.getItem("tkIntroSeen");}catch(e){}
  var key=seen?"intro_back":"intro_new",arr=XT[key],k=Math.floor(Math.random()*arr.length);
  var b=$("introSkip");
  setPhase("",seen?"Welcome back":"Welcome");$("en").innerHTML="&nbsp;";setDir("Listen to the teacher, then tap Ready.");
  b.textContent="I'm ready";b.hidden=false;
  var done=new Promise(function(res){b.onclick=res;});
  say(key+(k+1));
  await done;stopVoice();b.hidden=true;
  try{localStorage.setItem("tkIntroSeen","1");}catch(e){}
}
async function encourage(score,idx){
  if(!XT||score<62)return;
  var pool=null;
  if(idx+1===Math.floor(N/2))pool=[5];
  else if(N>14&&idx+1===N-3)pool=[11];
  else if(sinceEnc>=encGap)pool=streak>=5?[1,3,4,6,7,8,9,12,14,15,16]:[1,2,4,10,13,15,16];
  if(!pool)return;
  pool=pool.filter(function(n){return n!==lastEnc;});var n=pool[Math.floor(Math.random()*pool.length)];
  lastEnc=n;sinceEnc=0;encGap=8+Math.floor(Math.random()*5);
  setPhase("","Well done");setDir(XT.enc[n-1]);await say("enc"+n);await sleep(300);
}


/* ---------- microphone: opens by itself, no record button ---------- */
var stream=null,actx=null,analyser=null,srcNode=null;
function wavOf(blob){
  return blob.arrayBuffer().then(function(buf){
    var Ctx=window.AudioContext||window.webkitAudioContext,c=new Ctx();
    return new Promise(function(res,rej){c.decodeAudioData(buf,res,rej);}).then(function(dec){
      try{c.close();}catch(e){}
      var rate=16000,len=Math.max(1,Math.ceil(Math.min(dec.duration,60)*rate)),off=new OfflineAudioContext(1,len,rate),s=off.createBufferSource();
      s.buffer=dec;s.connect(off.destination);s.start(0);return off.startRendering();});
  }).then(function(r){
    var d=r.getChannelData(0),n=d.length,v=new DataView(new ArrayBuffer(44+n*2));
    function str(o,t){for(var i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i));}
    str(0,"RIFF");v.setUint32(4,36+n*2,true);str(8,"WAVE");str(12,"fmt ");v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);
    v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,"data");v.setUint32(40,n*2,true);
    var pk=0;for(var j=0;j<n;j++){var q=Math.abs(d[j]);if(q>pk)pk=q;}var G=(pk>0.004&&pk<0.7)?Math.min(40,0.85/pk):1;for(var i=0;i<n;i++){var s=Math.max(-1,Math.min(1,d[i]*G));v.setInt16(44+i*2,s<0?s*0x8000:s*0x7FFF,true);}
    return new Blob([v],{type:"audio/wav"});
  });
}
function openMic(){
  if(stream)return Promise.resolve();
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)return Promise.reject(new Error("nomic"));
  return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}}).then(function(s){
    stream=s;var C=window.AudioContext||window.webkitAudioContext;actx=new C();
    srcNode=actx.createMediaStreamSource(s);analyser=actx.createAnalyser();analyser.fftSize=1024;srcNode.connect(analyser);
  });
}
var wave=$("wave"),wctx=wave.getContext("2d"),levels=[];
function drawWave(){
  var w=wave.width,h=wave.height;wctx.clearRect(0,0,w,h);var n=48,bw=w/n;
  for(var i=0;i<n;i++){var v=levels[levels.length-n+i]||0,bh=Math.max(4,Math.min(h,v*h*5));
    wctx.fillStyle="rgba(255,215,106,"+(0.45+Math.min(.55,v*4))+")";var x=i*bw+bw*0.2;
    wctx.beginPath();if(wctx.roundRect)wctx.roundRect(x,(h-bh)/2,bw*0.6,bh,3);else wctx.rect(x,(h-bh)/2,bw*0.6,bh);wctx.fill();}
}
// listens until the learner has spoken and then stopped; resolves {blob} or {none:true}
function closeMic(){try{if(stream)stream.getTracks().forEach(function(t){t.stop();});}catch(e){}try{if(actx)actx.close();}catch(e){}stream=null;actx=null;analyser=null;srcNode=null;}/*volfix*/
function capture(){return openMic().then(capture0).then(function(r){closeMic();return r;},function(e){closeMic();throw e;});}
function capture0(){
  return new Promise(function(resolve){
    if(actx&&actx.state==="suspended")actx.resume();
    stream.getAudioTracks().forEach(function(t){t.enabled=true;});
    var mime=window.MediaRecorder&&MediaRecorder.isTypeSupported&&MediaRecorder.isTypeSupported("audio/webm;codecs=opus")?"audio/webm;codecs=opus":"";
    var rec=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream),chunks=[];
    rec.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
    var buf=new Uint8Array(analyser.fftSize),start=performance.now(),spoke=false,voiceAt=0,quietAt=0,floor=null,calib=[],ended=false,maxR=0;
    levels=[];wave.classList.add("show");
    function fin(none){
      if(ended)return;ended=true;wave.classList.remove("show");
      stream.getAudioTracks().forEach(function(t){t.enabled=false;});
      if(none){try{rec.stop();}catch(e){}resolve({none:true});return;}
      rec.onstop=function(){resolve({blob:new Blob(chunks,{type:rec.mimeType||"audio/webm"})});};try{rec.stop();}catch(e){resolve({none:true});}
    }
    rec.start(100);
    (function tick(){
      if(ended)return;if(paused)return fin(true);
      analyser.getByteTimeDomainData(buf);var sum=0;for(var i=0;i<buf.length;i++){var x=(buf[i]-128)/128;sum+=x*x;}
      var rms=Math.sqrt(sum/buf.length);levels.push(rms);if(rms>maxR)maxR=rms;drawWave();
      var now=performance.now(),el=now-start;
      if(el<450){calib.push(rms);}else if(floor===null){var cs=calib.slice().sort(function(a,b){return a-b;});floor=cs.length?cs[Math.floor(cs.length*0.3)]:0;}
      if(floor!==null){
        var thr=Math.min(0.05,Math.max(0.012,floor*2.4));
        if(rms>thr){if(!voiceAt)voiceAt=now;if(now-voiceAt>140)spoke=true;quietAt=0;}
        else{voiceAt=0;if(spoke){if(!quietAt)quietAt=now;if(now-quietAt>1250)return fin(false);}}
      }
      if(!spoke&&el>11000)return fin(!(maxR>Math.max(0.014,(floor||0)*1.8)));
      if(el>14000)return fin(false);
      requestAnimationFrame(tick);
    })();
  });
}

/* ---------- scoring: every word is graded on how accurately it was said, and the worst words pull the phrase down ---------- */
// Azure's word accuracy -> our word grade: sounds like the word = 50 (the pass mark), said exactly right = up to 100,
// nothing like it = 20 or less. The leniency lives here, in the word, not in a bonus on the whole phrase.
function wordGrade(w){
  if(w.errorType==="Omission")return 0;
  var a=clamp(w.accuracyScore||0,0,100);
  if(a>=80)return 85+(a-80)*0.75;
  if(a>=60)return 50+(a-60)*1.75;
  return a*(50/60);
}
function grade(out){
  if(!out||!out.recognizedText)return 0;
  var ws=(out.words||[]).filter(function(w){return w.errorType!=="Insertion";});
  if(!ws.length)ws=[{accuracyScore:out.accuracyScore||0}];
  var g=ws.map(wordGrade),mean=g.reduce(function(x,y){return x+y;},0)/g.length,worst=Math.min.apply(null,g);
  var s=0.4*mean+0.6*worst; // one badly said word cannot hide behind the good ones
  s*=0.92+0.08*clamp((out.fluencyScore||0)/100,0,1);
  return clamp(Math.round(s),0,100);
}
function assess(blob,ref){
  return wavOf(blob).then(function(wav){
    return fetch(API+"/api/assessPronunciation?referenceText="+encodeURIComponent(ref),{method:"POST",body:wav});
  }).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j&&j.error||"fail");return j;});});
}

/* ---------- content + state ---------- */
var C=null,flat=[],N=0,st={idx:0,gain:0,sum:0,done:0,who:null,finished:false};
function load(){try{var s=JSON.parse(localStorage.getItem(SAVE));if(s&&typeof s.idx==="number")st=Object.assign(st,s);}catch(e){}}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(st));}catch(e){}}
function unlockNext(){try{var SKIP={},n=CFG.order+1;while(SKIP[n])n++;var c=parseInt(localStorage.getItem("tkMapUnlocked"),10)||1;if(c<n)localStorage.setItem("tkMapUnlocked",String(n));}catch(e){}}
function setBar(){$("barFill").style.width=Math.min(100,st.gain/N*100).toFixed(1)+"%";}
function setPhase(cls,txt){var p=document.querySelector(".mz-phase");p.className="mz-phase "+cls;$("phaseTxt").textContent=txt;}
function dots(n,state){var d=$("listenDots").children;for(var i=0;i<3;i++)d[i].className=i<n?"done":(i===n&&state==="on"?"on":"");}
function chips(words,ref){
  var el=$("frWords");el.innerHTML="";
  var list=words&&words.length?words:ref.split(/\s+/).map(function(w){return {word:w,accuracyScore:null,errorType:null};});
  list.forEach(function(w){var e=document.createElement("em"),a=w.accuracyScore;
    e.textContent=w.word;e.className=(w.errorType==="Omission"||(a!=null&&a<55))?"r":(a!=null&&a<80)?"a":(a!=null?"g":"");el.appendChild(e);});
}
function label(s){return s>=88?"Parfait !":s>=75?"Très bien !":s>=62?"Bien !":s>=50?"On avance !":"Presque !";}
function hintFor(words){
  if(!words||!words.length)return "";
  var bad=words.filter(function(w){return w.errorType==="Omission"||(w.accuracyScore!=null&&w.accuracyScore<55);}).map(function(w){return w.word.replace(/[.,!?;:]/g,"");}).filter(Boolean);
  if(!bad.length)return "";
  return (bad.length===1?"Work on this word: ":"Work on these words: ")+bad.slice(0,3).join(", ")+".";
}
function sectionOf(i){var n=0;for(var s=0;s<C.sections.length;s++){var L=C.sections[s].items.length;if(i<n+L)return {sec:C.sections[s],k:i-n,L:L};n+=L;}return null;}

var lastSec=null;
function setDir(txt,go){var d=$("dir");d.innerHTML=go?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg><span></span>':"<span></span>";d.lastChild.textContent=txt;d.className="mz-dir"+(go?" go":"");$("card").classList.toggle("speaking",!!go);}
function chime(){ // a short two-note signal so nobody misses that it is their turn
  try{if(!actx)return;var t=actx.currentTime;[[660,0],[990,0.16]].forEach(function(n){var o=actx.createOscillator(),g=actx.createGain();o.type="sine";o.frequency.value=n[0];
    g.gain.setValueAtTime(0.0001,t+n[1]);g.gain.exponentialRampToValueAtTime(0.22,t+n[1]+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+n[1]+0.2);o.connect(g);g.connect(actx.destination);o.start(t+n[1]);o.stop(t+n[1]+0.22);});}catch(e){}
}
async function runItem(){
  var info=sectionOf(st.idx),item=info.sec.items[info.k],arcs=SECARC[info.sec.id],a0=arcs[0],a1=arcs[arcs.length-1];
  $("result").hidden=true;$("againBtn").hidden=true;$("skipBtn").hidden=true;$("introSkip").hidden=true;
  $("en").innerHTML="&nbsp;";dots(0);
  if(lastSec!==info.sec.id){
    lastSec=info.sec.id;
    $("secFr").textContent=info.sec.fr;$("secEn").textContent=info.sec.title;
    var b=$("banner");$("banFr").textContent=info.sec.fr;$("banEn").textContent=info.sec.title;b.hidden=false;b.style.animation="none";void b.offsetWidth;b.style.animation="";
    setTimeout(function(){b.hidden=true;},2700);
    setPhase("","Next place");setDir("");$("en").textContent=info.sec.intro;
    var walk=Math.abs(arc-a0)>2?glide(a0,LAY.ch*1.7):Promise.resolve();
    await Promise.all([say(info.sec.introId),walk]);
    await sleep(250);
  }
  $("en").textContent=item.en;
  var fails=0,noHear=0,first=true;
  for(;;){
    await waitResume();    var reps=3;first=false;
    $("result").hidden=true;
    for(var k=0;k<reps;k++){
      setPhase("","Listen · "+(k+1)+"/"+reps);dots(k,"on");
      setDir(k===0?"Stay quiet and listen. The teacher will say this "+reps+" times.":"Keep listening, without speaking.");
      var played=await say(item.id);
      if(!played&&!skipThis){$("en").textContent="Teacher audio is still being prepared for this phrase.";await sleep(1400);}
      await sleep(850);dots(k+1);
      if(skipThis)break;
    }
    if(skipThis){skipThis=false;st.done++;break;}
    setPhase("","Get ready");setDir("Get ready…");await sleep(700);
    chime();await sleep(480);
    setPhase("speak","Speak now");setDir("Speak now! Say it as accurately as you heard it.",true);
    var cap;try{cap=await capture();}catch(e){cap={none:true};}
    $("card").classList.remove("speaking");
    if(skipThis){skipThis=false;st.done++;break;}
    if(cap.none&&pauseHit){pauseHit=false;await waitResume();continue;}
    if(cap.none){
      noHear++;setPhase("","I didn't hear you");setDir("I didn't hear you. Listen once more, then speak a little louder.");await say("nohear");await sleep(300);
      if(noHear>=2){$("hint").textContent="Check your microphone is allowed, and speak right after the signal.";$("result").hidden=false;$("scoreNum").textContent="–";$("scoreLbl").textContent="";chips([],item.fr);}
      continue;
    }
    setPhase("eval","Evaluating…");setDir("Evaluating…");
    var out;
    try{out=await assess(cap.blob,item.fr.replace(/[«»]/g,""));}catch(e){
      noHear++;setPhase("","Couldn't evaluate");setDir("The scoring service didn't answer. Let's try again.");$("result").hidden=false;$("scoreNum").textContent="–";$("scoreLbl").textContent="";chips([],item.fr);
      await sleep(1800);continue;
    }
    var score=grade(out),pass=score>=50;
    $("scoreNum").textContent=score;$("scoreLbl").textContent=label(score);chips(out.words,item.fr);
    $("hint").textContent=hintFor(out.words);$("result").hidden=false;
    if(pass){
      var q=clamp((score-50)/45,0,1);st.lastQ=q;st.gain+=0.45+0.55*q;st.sum+=score;st.done++;setBar();
      setPhase("","Well done");setDir("Well done! Moving on…");
      // every passing score propels the child along the route: a better score, a longer step
      var target=a0+(a1-a0)*(info.k+1)/info.L,step=arc+(target-arc)*(0.55+0.45*q);
      await Promise.all([glide(Math.max(arc,step),LAY.ch*1.05),say("ok"+(1+Math.floor(Math.random()*6))),sleep(2400)]);
      streak++;sinceEnc++;await encourage(score,st.idx);
      break;
    }
    fails++;streak=0;setPhase("","Almost");setDir("Not quite yet. Press the replay button, listen again and match it as closely as you can.");
    // the replay button stays until they get across, however many tries it takes
    var tapped=new Promise(function(res){$("againBtn").onclick=function(){stopVoice();res();};});
    $("againBtn").hidden=false;$("skipBtn").hidden=true;
    say("retry"+(1+Math.floor(Math.random()*4)));
    await tapped;
    $("againBtn").hidden=true;
  }
  skipThis=false;
  st.idx++;save();
}
var skipThis=false;
$("skipBtn").onclick=function(){skipThis=true;stopVoice();$("skipBtn").hidden=true;};

async function game(){
  $("top").hidden=false;$("card").hidden=false;$("pauseBtn").hidden=false;await introGate();
  while(st.idx<N){await runItem();}
  $("pauseBtn").hidden=true;
  st.finished=true;save();unlockNext();
  $("card").hidden=true;$("top").hidden=true;
  var dist=Math.round(st.gain/N*100),avg=st.done?Math.round(st.sum/st.done):0;
  $("fDist").textContent=dist+"%";$("fAvg").textContent=avg;
  $("finalTxt").textContent=dist>=90?"You spoke it beautifully, all the way round.":"You made it all the way round. Play again to go even further.";
  $("final").hidden=false;say(CFG.finalId);
}

/* ---------- start screen ---------- */
function reset(){st={idx:0,gain:0,sum:0,done:0,who:st.who,finished:false,introDone:false};save();}
function init(){
  sizeWorld();buildChain();
  // where the child stands: at the gate on a fresh start, or at the beginning of the room being resumed
  var inf=sectionOf(st.idx);arc=(st.idx>0&&!st.finished&&inf)?SECARC[inf.sec.id][0]:0;lastSec=null;
  if(st.idx>0&&!st.finished&&inf){lastSec=inf.sec.id;$("secFr").textContent=inf.sec.fr;$("secEn").textContent=inf.sec.title;}
  var p0=pointAt(arc);charX=p0[0];charY=p0[1];pos(charX,charY);
  requestAnimationFrame(loop);
  fetch(API+"/api/health",{mode:"no-cors"}).catch(function(){}); // wakes the scoring server before the first answer
  var btns=document.querySelectorAll(".mz-char");
  function choose(w){who=w;st.who=w;curPose=null;btns.forEach(function(b){b.classList.toggle("on",b.getAttribute("data-who")===w);});$("goBtn").disabled=false;}
  btns.forEach(function(b){b.onclick=function(){choose(b.getAttribute("data-who"));};});
  if(st.who&&SETS[st.who])choose(st.who);else{who="girl";}
  Object.keys(SETS).forEach(function(k){Object.keys(SETS[k]).forEach(function(n){(new Image()).src=spr(SETS[k][n]);});});
  if(st.idx>0&&!st.finished){$("goBtn").textContent="Continue";$("restartBtn").hidden=false;}
  $("restartBtn").onclick=function(){reset();location.reload();};
  $("replayBtn").onclick=function(){reset();location.reload();};
  $("goBtn").onclick=function(){
    // everything audio-related starts from this tap so phones allow sound and the microphone
    voice.src=SILENT;var p=voice.play();if(p&&p.catch)p.catch(function(){});
    $("goBtn").disabled=true;$("pickErr").hidden=true;
    openMic().then(function(){closeMic();$("pick").hidden=true;game();}).catch(function(e){
      $("goBtn").disabled=false;$("pickErr").hidden=false;
      var n=(e&&e.name)||"",m="Talkletics needs your microphone. Please allow it in your browser, then tap again.";
      if(n==="NotAllowedError"||n==="SecurityError")m="The microphone is blocked for this site. Tap the lock icon next to the address, choose Permissions, allow Microphone, then tap Start again.";
      else if(n==="NotFoundError"||n==="OverconstrainedError"||(e&&e.message==="nomic"))m="No microphone was found on this device. Plug one in or check your phone settings, then tap again.";
      else if(n==="NotReadableError"||n==="AbortError")m="Your microphone is being used by another app. Close it (calls, recorders), then tap again.";
      else m="Could not start the microphone ("+(n||"unknown")+"). Close other apps using it, reload the page and tap again.";
      $("pickErr").textContent=m;
    });
  };
}
C=CFG;C.sections.forEach(function(s){s.items.forEach(function(i){flat.push(i);});});N=flat.length;
load();if(st.finished){st.finished=false;}
if(st.idx>=N){st.idx=0;}
init();setBar();
window.addEventListener("resize",function(){var p=window.innerWidth/window.innerHeight<0.9;if(p!==PORTRAIT){location.reload();}sizeWorld();});
}).catch(function(e){console.error(e);var p=document.getElementById("pickErr");p.hidden=false;p.textContent="Could not load the lesson. Please refresh.";});
})();
