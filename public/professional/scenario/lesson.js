(function(){
var E=window.ScenEngine;
function $(i){return document.getElementById(i)}
var q=new URLSearchParams(location.search),G=q.get("g")||"",LV=(q.get("lv")||"a0").toLowerCase(),PC=q.get("pc")||"steady",FORCE=q.get("force")==="1",SKIP=q.get("skip")==="1",FAST=q.get("fast")==="1";
if(!E.PACES[PC])PC="steady";
var N=Math.max(1,parseInt(q.get("n")||"1",10)||1),KEY=G+"-"+LV+(N>1?"-"+N:"")+"-"+PC,au=$("au"),LVR={a0:.72,a1:.8,a2:.87,b1:.93,b2:.97,c1:1,c2:1}[LV]||.8,scene=null,started=false,paused=false,missing=0,L=null,S=[],micState=0,stream=null,actx=null,an=null,CAPON=false;
function ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||"null");localStorage.setItem(k,JSON.stringify(v))}catch(e){}return null}
var RET=q.get("ret")||"",HUB=q.get("hub")==="1";
function back(){if(HUB&&RET.indexOf("/professional/hub.html")===0){location.href=RET;return}location.href="./?g="+encodeURIComponent(G)+"&pc="+PC}
$("bk").onclick=back;
function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
function notice(t,p,again){$("endT").textContent=t;$("endP").textContent=p;$("endAgain").style.display=again?"":"none";$("end").hidden=false}
$("endBack").onclick=back;
$("endAgain").onclick=function(){location.href=location.pathname+"?g="+G+"&lv="+LV+(N>1?"&n="+N:"")+"&pc="+PC+"&skip=1"+(FORCE?"&force=1":"")+(HUB?"&hub=1&ret="+encodeURIComponent(RET):"")};
$("rs").onclick=$("endAgain").onclick;
$("cc").onclick=function(){CAPON=!CAPON;$("cc").classList.toggle("on",CAPON);$("cap").classList.toggle("off",!CAPON)};
$("pz").onclick=function(){paused=!paused;$("pz").textContent=paused?"Resume":"Pause";$("pz").classList.toggle("on",paused);if(paused){try{au.pause()}catch(e){}if(window.SBTTS)SBTTS.pause()}else{if(window.SBTTS)SBTTS.resume();if(au.src&&!au.ended&&au.currentTime>0){au.play().catch(function(){})}}};
async function untilGo(){while(paused)await wait(120)}

/* load the lesson */
Promise.all([
 fetch("data/"+G+(N>1?"-more":"")+".json").then(function(r){if(!r.ok)throw 0;return r.json()}),
 fetch("ready.json?t="+Date.now()).then(function(r){return r.json()}).catch(function(){return{lessons:[]}})
]).then(function(a){
 var D=a[0],R=a[1];L=N>1?D[LV+"-"+N]:D.levels[LV];
 if(!L){notice("Not found","This lesson does not exist.",false);return}
 L=Object.assign({lv:LV},L);S=E.build(L,PC);
 init();
}).catch(function(){notice("Not found","This lesson does not exist.",false)});

function init(){
 /* the regular background first, a different one each time */
 var last=-1;try{last=+localStorage.getItem("sbpro_bg")}catch(e){}
 var th=Math.floor(Math.random()*3);if(th===last)th=(th+1+Math.floor(Math.random()*2))%3;
 try{localStorage.setItem("sbpro_bg",String(th))}catch(e){}
 loadPic();
 if(SKIP){begin();return}
 var sk=$("sk");sk.style.display="";sk.onclick=begin;
 $("pic").classList.add("on","intro");
 var NM={medical:"Medical",legal:"Legal",military:"Military and peacekeeping",police:"Police and security",border:"Border and customs",banking:"Banking",logistics:"Logistics",hospitality:"Hospitality",business:"Business",education:"Education"};
 $("inT").textContent=(NM[G]||"Professional")+" \u00b7 "+LV.toUpperCase();
 fetch("intros.json").then(function(r){return r.json()}).then(function(I){
  var T=I[G+"-"+LV.toUpperCase()+(N>1?"-"+N:"")];if(!T){begin();return}
  $("intro").hidden=false;var tx=$("inTx"),k=0,done=false,tm=null;
  function paint(n){tx.innerHTML="";var a=document.createElement("span");a.textContent=T.slice(0,n);tx.appendChild(a);if(n<T.length){var c=document.createElement("span");c.className="caret";tx.appendChild(c);var r=document.createElement("span");r.className="rest";r.textContent=T.slice(n);tx.appendChild(r)}}
  function finish(){if(done)return;done=true;clearInterval(tm);paint(T.length);$("inGo").hidden=false}
  var SRC="../audio/intro-"+G+"-"+LV.toUpperCase()+".mp3";
  function typed(){ /* no voice available on this device: still no transcript, just the microphone and a tap to begin */
   var orb=$("inOrb"),st=$("inSt");$("intro").classList.add("voice");tx.hidden=true;orb.hidden=false;st.hidden=false;orb.classList.remove("say","wait");st.textContent="Tap the microphone to begin";orb.onclick=begin;
  }
  /* recorded teacher voice: no transcript, the microphone speaks; if there is no recording yet, the typed text is shown instead */
  function voice(){
   var orb=$("inOrb"),st=$("inSt"),ok=false,fell=false,to;
   $("intro").classList.add("voice");tx.hidden=true;orb.hidden=false;st.hidden=false;st.textContent="Your teacher is getting ready";
   function fall(){if(ok||fell)return;fell=true;clearTimeout(to);bvoice()}
   /* no recording yet: the browser voice reads the intro aloud, still with no transcript */
   function bvoice(){
    if(!(window.SBTTS&&SBTTS.ok)){orb.hidden=true;st.hidden=true;typed();return}
    var tries=0,busy=false;
    function wait(){busy=false;orb.classList.remove("say");orb.classList.add("wait");st.textContent="Tap the microphone to listen"}
    function go(){if(busy)return;busy=true;tries++;orb.classList.remove("wait");orb.classList.add("say");st.textContent="Your teacher is speaking";
     var t0=Date.now();setTimeout(function(){if(!started&&busy&&!SBTTS.spoke){SBTTS.stop();tries++;if(tries>=3){orb.hidden=true;st.hidden=true;typed()}else wait()}},3500);SBTTS.speak(T,"t","relaxed","en").then(function(r){if(started)return;if(!busy)return;if(r==="ok"&&Date.now()-t0<4000)r="err";if(r==="err"){if(tries>=2){orb.hidden=true;st.hidden=true;typed()}else wait()}else{orb.classList.remove("say");begin()}})}
    orb.onclick=function(){SBTTS.unlock();go()};
    go()}
   au.onerror=fall;to=setTimeout(fall,4500);
   au.oncanplay=function(){if(fell||ok)return;ok=true;clearTimeout(to);st.textContent="Tap the microphone to listen";var p=au.play();if(p&&p.catch)p.catch(function(){orb.classList.add("wait")})};
   au.onplaying=function(){orb.classList.remove("wait");orb.classList.add("say");st.textContent="Your teacher is speaking"};
   au.onpause=function(){orb.classList.remove("say")};
   au.onended=function(){orb.classList.remove("say");st.textContent="";begin()};
   orb.onclick=function(){if(au.paused)au.play().catch(function(){})};
   au.src=SRC;slow();au.load();
  }
  if(N===1&&!FAST)voice();else typed();
 }).catch(function(){begin()});
}
function loadPic(){
 var tall=innerHeight>innerWidth,exts=["webp","png","jpg","jpeg"],names=tall?["tall","wide"]:["wide","tall"],list=[];
 names.forEach(function(n){exts.forEach(function(e){list.push("img/"+G+"-"+LV+"-"+n+"."+e)})});
 var h=0,key=G+LV;for(var c=0;c<key.length;c++)h=(h*31+key.charCodeAt(c))%7;var gi=h+1;/* shared pictures for scenes without their own */
 if(tall)list.push("img/gen-t"+(gi===2?2:1)+".webp");list.push("img/gen-"+gi+".webp");
 list.push(tall?"../bg-mobile.webp":"../bg-desktop.webp");
 var i=0,im=$("pimg");im.onerror=function(){i++;if(i<list.length)im.src=list[i]};im.onload=function(){$("pic").classList.toggle("soft",/\/gen-|bg-(desktop|mobile)/.test(im.src))};im.src=list[0];
}
function begin(){
 if(started)return;started=true;if(window.SBTTS)SBTTS.unlock();
 try{au.pause();au.oncanplay=null}catch(e){}try{if(window.SBTTS)SBTTS.stop()}catch(e){}
 $("intro").hidden=true;$("orb").style.display="none";$("sk").style.display="none";
 $("pic").classList.remove("intro");$("pic").classList.add("on");document.querySelector(".sc-top").classList.add("on");document.querySelector(".sc-bottom").classList.add("on");
 run();
}

/* the teacher and the characters speak */
if(window.SBTTS){SBTTS.base=LVR*.88;SBTTS.gapx=LV==='a0'?1.6:LV==='a1'?1.3:1}
function slow(){try{au.defaultPlaybackRate=LVR;au.playbackRate=LVR;if("preservesPitch" in au)au.preservesPitch=true}catch(e){}}
function playLine(s){
 return new Promise(function(res){
  var done=false;function fin(v){if(done)return;done=true;res(v)}
  function voice(){if(window.SBTTS&&SBTTS.ok&&s.fr){SBTTS.speak(s.fr,s.who,PC).then(function(r){fin(r==="err"?"err":"ok")})}else fin("err")}
  au.onended=function(){fin("ok")};au.onerror=voice;
  au.src="audio/"+s.a+".mp3";slow();
  var p=au.play();if(p&&p.catch)p.catch(voice);
 });
}
function whoLabel(w,kind){if(w==="c")return["L'autre personne","c"];if(w==="t")return["Le professeur","t"];return[kind==="turn"?"Vous":"Modèle","p"]}
function setCap(w,text,kind){var l=whoLabel(w,kind),el=$("who");el.textContent=l[0];el.className="who "+l[1];$("txt").textContent=text}
function hintText(s){var w=s.fr.split(/\s+/);if(s.hint>=2)return s.fr;if(s.hint===1)return w.slice(0,3).join(" ")+" …";return"…"}

/* the microphone: record while you speak, with the orb moving to your voice. Nothing is saved or sent. */
function micClose(){try{if(stream)stream.getTracks().forEach(function(t){t.stop()})}catch(e){}try{if(actx)actx.close()}catch(e){}stream=null;actx=null;an=null}
var ICREC='<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="2.8" width="15" height="26.4" rx="4.6"/><path d="M12.4 7.4h7.2M12.4 10.2h7.2M12.4 13h7.2"/><circle cx="16" cy="21.4" r="3.9" fill="#e5543f" stroke="none"/></svg>',ICSTOP='<svg viewBox="0 0 32 32" fill="currentColor"><rect x="9" y="9" width="14" height="14" rx="3.2"/></svg>',hist=[];for(var hi=0;hi<56;hi++)hist.push(0);
var wv=$("wv"),wg=wv.getContext("2d");
function drawWave(v,on){hist.push(v);hist.shift();wg.clearRect(0,0,560,88);for(var j=0;j<hist.length;j++){var h=3+hist[j]*70,x=j*10+3;wg.fillStyle=on?"rgba(255,214,140,"+(.35+.65*hist[j])+")":"rgba(255,255,255,.28)";var y=44-h/2;wg.beginPath();if(wg.roundRect)wg.roundRect(x,y,5,h,2.5);else wg.rect(x,y,5,h);wg.fill()}}
au.addEventListener("play",function(){$("tb").classList.add("on")});au.addEventListener("pause",function(){$("tb").classList.remove("on")});au.addEventListener("ended",function(){$("tb").classList.remove("on")});
async function micInit(){
 micState=1;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  actx=new (window.AudioContext||window.webkitAudioContext)();an=actx.createAnalyser();an.fftSize=512;actx.createMediaStreamSource(stream).connect(an);micState=2;
 }catch(e){micState=3;stream=null;an=null}
}
function turn(s){
 return new Promise(async function(res){
  var mic=$("mic");setCap("p",hintText(s),"turn");$("state").textContent="Your turn";
  if(micState!==3)await micInit();
  mic.classList.add("rec");mic.classList.remove("hint");mic.innerHTML=ICSTOP;
  var t0=Date.now(),spoke=false,quiet=0,fin=false,buf=an?new Uint8Array(an.fftSize):null,timer=null,rec=null;
  function end(){if(fin)return;fin=true;clearInterval(timer);mic.onclick=null;mic.classList.remove("rec");mic.classList.add("hint");mic.innerHTML=ICREC;drawWave(0,false);hist.fill(0);wg.clearRect(0,0,560,88);mic.style.removeProperty("--lv");try{if(rec&&rec.state!=="inactive")rec.stop()}catch(e){}$("state").textContent="";micClose();res()}
  mic.onclick=function(){if(Date.now()-t0>900)end()};
  if(stream&&window.MediaRecorder){try{rec=new MediaRecorder(stream);rec.ondataavailable=function(){};rec.start()}catch(e){rec=null}}
  if(!stream)$("state").textContent="Microphone off: say it out loud";
  timer=setInterval(function(){
   var el=Date.now()-t0;
   if(an){an.getByteTimeDomainData(buf);var m=0;for(var i=0;i<buf.length;i++){var v=Math.abs(buf[i]-128)/128;if(v>m)m=v}mic.style.setProperty("--lv",Math.min(1,m*3).toFixed(2));drawWave(Math.min(1,m*3),true);
    if(m>0.06){spoke=true;quiet=0}else if(spoke)quiet+=70;
    if(spoke&&quiet>1500&&el>1800)end()}
   var limit=FAST?400:(stream?s.w*1000:s.w*1000*0.8);
   if(el>=limit)end();
  },70);
 });
}

async function run(){
 var tool=$("bar");if(FAST)E.__fast=1;
 for(var i=0;i<S.length;i++){
  await untilGo();
  var s=S[i];tool.style.width=Math.round(i/S.length*100)+"%";
  if(s.k==="sec")$("sec").textContent=s.t;
  else if(s.k==="goal")$("goal").textContent=s.text;
  else if(s.k==="say"){
   setCap(s.who,s.fr,"say");$("state").textContent=s.who==="t"?"":"Écoutez";
   var r=await playLine(s);
   if(r==="err"){missing++;$("state").textContent="Audio missing";await wait(FAST?50:Math.min(3500,500+s.fr.length*45))}
   else await wait(FAST?20:(s.who==="c"?260:180));
  }
  else if(s.k==="turn"){await turn(s);await wait(200)}
 }
 tool.style.width="100%";
 var d=ls("sbpro_scen_done")||{};d[KEY]=Date.now();ls("sbpro_scen_done",d);
 if(HUB&&window.scUid&&!FAST){try{fetch("https://saybonapp-server.onrender.com/api/levelProgressComplete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uid:window.scUid,level:LV==="a0"?"a0-tout-public":LV,lesson:N})}).catch(function(){})}catch(e){}}
 $("state").textContent="";
 notice("Bravo !",missing?("Done. "+missing+" line(s) had no audio yet."):"You played the whole scene. Saved on this device.",true);
}
})();
