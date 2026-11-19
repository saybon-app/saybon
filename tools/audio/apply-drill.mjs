// Adds the Les Petits drill screens to scene-ui.js (safe: checks its anchors, keeps a backup).
import fs from "fs";
const f = process.argv[2] || "C:/SayBon/public/levels/scene-paris/scene-ui.js";
let s = fs.readFileSync(f, "utf8");
if (s.includes("KDR=")) { console.log("Already applied."); process.exit(0); }
const A1 = "var KAUD={'1-3':1,'1-4':1,'1-5':1};";
const A2 = "/* ---------- INTRO / LISTEN-ONLY ---------- */";
for (const a of [A1, A2]) if (s.split(a).length !== 2) { console.log("STOP: cannot find a spot to edit: " + a); process.exit(1); }
const DEFS = `var KDR={'1-2':'bonjour','1-3':'salut','1-4':'aurevoir','1-5':'skip'},KDT={bonjour:'Bonjour',salut:'Salut',aurevoir:'Au revoir'};`;
const BLOCK = `
 /* ---------- LES PETITS DRILL: one long teacher track, mic open from the start, wave only moves in the child's turns ---------- */
 var DK=kids()?KDR[lessonNo()+'-'+partNum]:null;
 if(DK==='skip'){T(function(){window.lsGoNext();},30);return true;}
 if(DK){
  var dn='/assets/audio/lp/lesson'+lessonNo()+'_drill_'+DK;
  var kp=swap(c,'<div class="pc-top"><div class="pc-hn">'+KDT[DK]+'</div><div class="pc-hi">Listen, then say it with me!</div><div class="pc-hp">Headphones work best</div></div><div class="pc-mid"><div class="pc-s1 pc-dl"><button type="button" class="pc-teach pc-spk" aria-label="Teacher">'+I.mic+'</button><div class="pc-hslot"></div><canvas class="pc-wv" width="560" height="88"></canvas></div></div><div class="pc-bot"><div class="pc-st"></div><div class="pc-res"></div></div>');
  kp.classList.add('pc-pr');
  var kSpk=kp.querySelector('.pc-spk'),kSt=kp.querySelector('.pc-st'),kRes=kp.querySelector('.pc-res'),kCv=kp.querySelector('.pc-wv'),kG=kCv.getContext('2d');
  var kH=[],kGaps=[],kMax=[],kIn=-1,kWent=false;
  for(var kq=0;kq<56;kq++)kH.push(0);
  function kDraw(){
   if(dead)return;raf=requestAnimationFrame(kDraw);
   var v=0,w=-1,ct=media?media.currentTime:0;
   if(media&&!media.paused)for(var gi=0;gi<kGaps.length;gi++){if(ct>=kGaps[gi][0]&&ct<=kGaps[gi][1]){w=gi;break;}}
   if(mAn&&w>=0){mAn.getByteFrequencyData(mData);var sm=0;for(var kk=0;kk<mData.length;kk++)sm+=mData[kk];v=Math.min(1,(sm/mData.length)/55);if(v>kMax[w])kMax[w]=v;}
   kH.push(v);kH.shift();
   kG.clearRect(0,0,560,88);
   for(var j=0;j<kH.length;j++){var h=3+kH[j]*70,x=j*10+3;kG.fillStyle='rgba(255,214,140,'+(.35+.65*kH[j])+')';var y=44-h/2;kG.beginPath();if(kG.roundRect)kG.roundRect(x,y,5,h,2.5);else kG.rect(x,y,5,h);kG.fill();}
   if(w!==kIn){kIn=w;kp.classList.toggle('is-rec',w>=0);if(sc())sc().micState(w>=0?'rec':'');}
  }
  raf=requestAnimationFrame(kDraw);
  function kNext(){if(kWent)return;kWent=true;var mx3=(window.__psMax&&window.__psMax())||0;if(mx3&&partNum>=mx3)rsWrite(0);else if(partNum>rsRead())rsWrite(partNum);advance();}
  function kEnd(){
   musicOn();kSpk.classList.remove('on');kp.classList.remove('is-rec');if(sc()){sc().calm();sc().micState('');}
   try{if(stream)stream.getTracks().forEach(function(t){t.stop();});}catch(e){}
   var hits=0;kMax.forEach(function(x){if(x>.12)hits++;});
   kSt.textContent='';kp.classList.add('scored');
   if(!hits){
    kRes.innerHTML='<div class="pc-fb"><div class="pc-msg">Je ne t\\u2019entends pas<small>I couldn\\u2019t hear you \\u2014 turn the volume up or use headphones, then try again</small></div></div><div class="pc-acts"><button type="button" class="pc-rb pc-redo" aria-label="Try again">'+I.redo+'</button><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
    kRes.querySelector('.pc-redo').onclick=function(){window.__psUI(partNum,blocks,ctx);};
    kRes.querySelector('.pc-next').onclick=kNext;return;
   }
   var r=hits/Math.max(1,kGaps.length),n=r>=.5?3:(r>=.25?2:1),hh='';
   for(var q=0;q<3;q++)hh+='<span'+(q<n?'':' class="off"')+' style="animation-delay:'+(q*.18)+'s">\\u2605</span>';
   kRes.innerHTML='<div class="pc-fb"><div class="pc-stars">'+hh+'</div><div class="pc-msg">'+(n===3?'Bravo !<small>You said it with me \\u2014 super!</small>':(n===2?'Tr\\u00e8s bien !<small>Very good \\u2014 well done!</small>':'Bon effort !<small>Good try \\u2014 you\\u2019ll get it</small>'))+'</div></div><div class="pc-acts"><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
   kRes.querySelector('.pc-next').onclick=kNext;
   if(sc())sc().cheer();
   T(kNext,3200);
  }
  fetch(dn+'.json?v=1').then(function(r){return r.json();}).then(function(j){
   kGaps=j.gaps||[];kMax=kGaps.map(function(){return 0;});
   return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  }).then(function(s2){
   if(dead){s2.getTracks().forEach(function(t){t.stop();});return;}
   stream=s2;
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms2=actx.createMediaStreamSource(s2);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms2.connect(mAn);}catch(e){mAn=null;}
   musicOff();
   media=new Audio();media.preload='auto';media.src=dn+'.mp3?v=1';
   media.addEventListener('playing',function(){kSpk.classList.add('on');var hx=kp.querySelector('.pc-hint');if(hx)hx.remove();if(sc())sc().listen();});
   media.addEventListener('pause',function(){if(!media.ended)kSpk.classList.remove('on');});
   media.addEventListener('ended',kEnd);
   media.addEventListener('error',function(){kSt.textContent='Audio unavailable';musicOn();T(kNext,1500);});
   var kq0=media.play();if(kq0&&kq0.catch)kq0.catch(function(){
    var hh2=document.createElement('div');hh2.className='pc-hint';hh2.textContent='tap to listen';kp.querySelector('.pc-hslot').appendChild(hh2);
    var kick2=function(){document.removeEventListener('pointerdown',kick2,true);if(!dead&&media.paused&&!media.ended){var q9=media.play();if(q9&&q9.catch)q9.catch(function(){});}};
    document.addEventListener('pointerdown',kick2,true);
   });
  }).catch(function(){kSt.textContent='Microphone blocked \\u2014 allow it, then reload';});
  kSpk.onclick=function(){if(media&&media.paused&&!media.ended){var q8=media.play();if(q8&&q8.catch)q8.catch(function(){});}};
  return true;
 }
 `;
s = s.replace(A1, A1 + DEFS).replace(A2, BLOCK + A2);
fs.writeFileSync(f + ".bak", fs.readFileSync(f));
fs.writeFileSync(f, s);
console.log("Drill screens added (backup: " + f + ".bak)");
