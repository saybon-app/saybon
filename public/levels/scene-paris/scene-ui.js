/* SayBon - Lesson 1 on the Paris scene: one frosted glass card.
   Intro: a calm teacher button (microphone icon) pulses while the intro plays, then the card's content slides out left.
   Practice: teacher phrase + speaker, microphone, live wave, replay + submit, grade, next. Skip is always available. */
(function(){
var I={
 spk:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.2h4.6l6.9-5.6a.9.9 0 0 1 1.5.7v17.4a.9.9 0 0 1-1.5.7l-6.9-5.6H5a1.2 1.2 0 0 1-1.2-1.2v-5.2A1.2 1.2 0 0 1 5 12.2z" fill="currentColor"/><path d="M21.6 11.4a6.4 6.4 0 0 1 0 9.2"/><path d="M25.2 7.6a11.4 11.4 0 0 1 0 16.8"/></svg>',
 mic:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="11.5" y="3.5" width="9" height="16" rx="4.5" fill="currentColor"/><path d="M6.8 15.2a9.2 9.2 0 0 0 18.4 0"/><path d="M16 24.4v4M11.6 28.4h8.8"/></svg>',
 stop:'<svg viewBox="0 0 32 32" fill="currentColor"><rect x="9" y="9" width="14" height="14" rx="3.2"/></svg>',
 play:'<svg viewBox="0 0 32 32" fill="currentColor"><path d="M11 8.2v15.6a1.2 1.2 0 0 0 1.8 1l12.6-7.8a1.2 1.2 0 0 0 0-2L12.8 7.2a1.2 1.2 0 0 0-1.8 1z"/></svg>',
 ok:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.8l6.2 6.2L25 10.6"/></svg>',
 redo:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M26 16a10 10 0 1 1-3.4-7.5"/><path d="M26 6v6h-6"/></svg>',
 next:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16h18M18 9l7 7-7 7"/></svg>'
};
var cleanup=null,card=null;
function sc(){return window.__psScene;}
function esc(t){var d=document.createElement('div');d.textContent=t==null?'':t;return d.innerHTML;}
function musicOff(){try{if(window.pauseAppBgMusicForRecording)window.pauseAppBgMusicForRecording();}catch(e){}}
function musicOn(){try{if(window.resumeAppBgMusicAfterRecording)window.resumeAppBgMusicAfterRecording();}catch(e){}}
function ensureCard(root){
 if(card&&root.contains(card))return card;
 root.innerHTML='<div class="pc"><div class="pc-h"><div class="pc-lv">A0 &middot; Lesson 1</div><h2 class="pc-t">Les salutations</h2><i class="pc-ln"></i></div><div class="pc-b"></div><button type="button" class="pc-skip">Skip</button></div>';
 card=root.firstChild;
 card.querySelector('.pc-skip').addEventListener('click',function(){window.lsGoNext();});
 return card;
}
function swap(c,html){
 var b=c.querySelector('.pc-b'),old=[].slice.call(b.children);
 var p=document.createElement('div');p.className='pc-pn '+(old.length?'in':'first');p.innerHTML=html;b.appendChild(p);
 old.forEach(function(o){o.classList.add('out');setTimeout(function(){if(o.parentNode)o.remove();},900);});
 void p.offsetWidth;p.classList.remove('in','first');
 return p;
}
window.__psUI=function(partNum,blocks,ctx){
 var root=ctx.root,api=ctx.api;
 if(cleanup)cleanup();
 var dead=false,timers=[],extra=[];
 function T(f,ms){var t=setTimeout(function(){if(!dead)f();},ms);timers.push(t);return t;}
 var video=null,audioUrl=null,pb=null,auto=false;
 blocks.forEach(function(b){
  if(!video&&b.type==='video'&&b.url)video=b.url;
  if(!audioUrl&&(b.type==='audio'||b.type==='teacher-audio')&&b.url)audioUrl=b.url;
  if(!pb&&b.recordPrompt)pb=b;
  if(b.transitionMode==='auto')auto=true;
 });
 var c=ensureCard(root);
 var media=null,mediaKind=null,recorder=null,stream=null,recUrl=null,recAudio=null,raf=0,mAn=null,mData=null,actx=null;
 cleanup=function(){
  dead=true;cancelAnimationFrame(raf);timers.forEach(clearTimeout);
  try{if(media)media.pause();}catch(e){}try{if(recAudio)recAudio.pause();}catch(e){}
  try{if(recorder&&recorder.state==='recording')recorder.stop();}catch(e){}
  if(stream)stream.getTracks().forEach(function(t){t.stop();});
  if(recUrl)try{URL.revokeObjectURL(recUrl);}catch(e){}
  try{if(actx&&actx.state!=='closed')actx.close();}catch(e){}
  if(sc()){sc().calm();sc().micState('');}
  cleanup=null;
 };

 /* ---------- INTRO / LISTEN-ONLY ---------- */
 if(!pb){
  var url=video||audioUrl;
  var p=swap(c,'<button type="button" class="pc-teach" aria-label="Teacher">'+I.mic+'</button><div class="pc-st">'+(url?'Listen':'')+'</div><div class="pc-res"></div>');
  var btn=p.querySelector('.pc-teach'),st=p.querySelector('.pc-st'),res=p.querySelector('.pc-res');
  function more(){
   st.textContent='';btn.classList.remove('on');
   res.innerHTML='<button type="button" class="pc-go">Continue '+I.next+'</button>';
   res.querySelector('.pc-go').onclick=function(){window.lsGoNext();};
  }
  if(!url){btn.innerHTML=I.next;btn.onclick=function(){window.lsGoNext();};st.textContent='Continue';return true;}
  media=video?document.createElement('video'):new Audio();mediaKind=video?'video':'audio';
  if(video){media.setAttribute('playsinline','');media.style.display='none';p.appendChild(media);}
  media.preload='auto';media.src=url;
  media.addEventListener('play',function(){btn.classList.add('on');st.textContent='Listen';if(sc())sc().listen();musicOff();});
  media.addEventListener('pause',function(){if(!media.ended)btn.classList.remove('on');});
  media.addEventListener('ended',function(){btn.classList.remove('on');if(sc())sc().calm();musicOn();if(video||auto){T(function(){window.lsGoNext();},450);}else more();});
  media.addEventListener('error',function(){musicOn();if(sc())sc().calm();more();});
  var pp=media.play();
  if(pp&&pp.catch)pp.catch(function(){st.textContent='Tap to listen';});
  btn.onclick=function(){if(media.paused){try{if(media.ended)media.currentTime=0;}catch(e){}var q=media.play();if(q&&q.catch)q.catch(function(){});}else media.pause();};
  return true;
 }

 /* ---------- PRACTICE ---------- */
 var expected=pb.expectedText||'';
 var p=swap(c,
  '<div class="pc-ph">'+esc(expected)+'</div>'+
  '<div class="pc-row">'+
   '<div class="pc-cell"><button type="button" class="pc-rb pc-spk" aria-label="Listen">'+I.spk+'</button><span>Teacher</span></div>'+
   '<div class="pc-cell"><button type="button" class="pc-mic" aria-label="Record">'+I.mic+'</button><span class="pc-miclbl">Record</span></div>'+
   '<div class="pc-cell"><button type="button" class="pc-rb pc-rep" aria-label="Replay recording" disabled>'+I.play+'</button><span>Replay</span></div>'+
  '</div>'+
  '<canvas class="pc-wv" width="560" height="88"></canvas>'+
  '<div class="pc-st"></div><div class="pc-res"></div>');
 var spk=p.querySelector('.pc-spk'),mic=p.querySelector('.pc-mic'),rep=p.querySelector('.pc-rep'),lbl=p.querySelector('.pc-miclbl'),st=p.querySelector('.pc-st'),res=p.querySelector('.pc-res'),cv=p.querySelector('.pc-wv'),g=cv.getContext('2d');
 var hist=[],blob=null,scoring=false,tplay=false;
 for(var i=0;i<56;i++)hist.push(0);
 function draw(){
  if(dead)return;raf=requestAnimationFrame(draw);
  var v=0;
  if(mAn){mAn.getByteFrequencyData(mData);var s=0;for(var k=0;k<mData.length;k++)s+=mData[k];v=Math.min(1,(s/mData.length)/55);}
  hist.push(v);hist.shift();
  g.clearRect(0,0,560,88);
  for(var j=0;j<hist.length;j++){
   var h=3+hist[j]*70,x=j*10+3;
   g.fillStyle=mAn?'rgba(255,214,140,'+(.35+.65*hist[j])+')':'rgba(255,255,255,.28)';
   var y=44-h/2;g.beginPath();if(g.roundRect)g.roundRect(x,y,5,h,2.5);else g.rect(x,y,5,h);g.fill();
  }
 }
 raf=requestAnimationFrame(draw);
 function ready(){tplay=false;spk.classList.remove('on');if(sc())sc().calm();st.textContent='Your turn';mic.classList.add('hint');}
 if(audioUrl){
  media=new Audio();media.preload='auto';media.src=audioUrl;
  media.addEventListener('play',function(){tplay=true;spk.classList.add('on');mic.classList.remove('hint');st.textContent='Listen';if(sc())sc().listen();musicOff();});
  media.addEventListener('pause',function(){if(!media.ended){tplay=false;spk.classList.remove('on');}});
  media.addEventListener('ended',function(){musicOn();ready();});
  media.addEventListener('error',function(){musicOn();ready();});
  var q=media.play();if(q&&q.catch)q.catch(function(){st.textContent='Tap the speaker to listen';});
 }else{spk.disabled=true;ready();}
 spk.onclick=function(){
  if(!media)return;
  if(recorder&&recorder.state==='recording')return;
  if(tplay){media.pause();ready();}else{try{media.currentTime=0;}catch(e){}var q2=media.play();if(q2&&q2.catch)q2.catch(function(){});}
 };
 function startRec(){
  if(media&&tplay)media.pause();
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
   if(dead){s.getTracks().forEach(function(t){t.stop();});return;}
   stream=s;var chunks=[];recorder=new MediaRecorder(s);
   recorder.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
   recorder.onstop=function(){
    mAn=null;musicOn();s.getTracks().forEach(function(t){t.stop();});
    mic.classList.remove('rec');mic.innerHTML=I.mic;lbl.textContent='Record again';if(sc())sc().micState('');
    if(dead)return;
    blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
    if(recUrl)try{URL.revokeObjectURL(recUrl);}catch(e){}
    recUrl=URL.createObjectURL(blob);recAudio=new Audio(recUrl);
    recAudio.addEventListener('ended',function(){rep.classList.remove('on');});
    rep.disabled=false;st.textContent='Replay it, or submit';
    res.innerHTML='<button type="button" class="pc-go pc-sub">Submit '+I.ok+'</button>';
    res.querySelector('.pc-sub').onclick=submit;
   };
   musicOff();
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms=actx.createMediaStreamSource(s);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms.connect(mAn);}catch(e){mAn=null;}
   recorder.start();mic.classList.remove('hint');mic.classList.add('rec');mic.innerHTML=I.stop;lbl.textContent='Stop';st.textContent='Recording...';res.innerHTML='';rep.disabled=true;
   if(sc())sc().micState('rec');
   T(function(){if(recorder&&recorder.state==='recording')recorder.stop();},9000);
  }).catch(function(){st.textContent='Microphone blocked';});
 }
 mic.onclick=function(){
  if(scoring)return;
  if(recorder&&recorder.state==='recording'){recorder.stop();return;}
  startRec();
 };
 rep.onclick=function(){
  if(!recAudio)return;
  if(media&&tplay)media.pause();
  try{recAudio.currentTime=0;}catch(e){}
  rep.classList.add('on');var q3=recAudio.play();if(q3&&q3.catch)q3.catch(function(){});
 };
 function retry(){res.innerHTML='';blob=null;rep.disabled=true;lbl.textContent='Record';st.textContent='Your turn';mic.classList.add('hint');}
 function submit(){
  if(!blob||scoring)return;
  scoring=true;mic.disabled=true;if(recAudio)recAudio.pause();
  st.textContent='Scoring...';res.innerHTML='<div class="pc-wait"><i></i><i></i><i></i></div>';
  fetch(api+'/api/assessPronunciation?referenceText='+encodeURIComponent(expected),{method:'POST',body:new Blob([blob],{type:'audio/webm'})}).then(function(r){return r.json();}).then(function(d){
   if(dead)return;scoring=false;mic.disabled=false;
   var s=d.finalScore!=null?d.finalScore:(d.score!=null?d.score:(d.AccuracyScore!=null?d.AccuracyScore:d.accuracyScore));s=Math.round(s||0);
   var msg=s>=85?'Bravo !':(s>=70?'Très bien !':'Encore une fois');
   st.textContent='';
   res.innerHTML='<div class="pc-fb"><div class="pc-sc" style="--p:'+s+'"><b>'+s+'<small>%</small></b></div><div class="pc-msg">'+msg+'</div></div>'+
    '<div class="pc-acts"><button type="button" class="pc-rb pc-redo" aria-label="Try again">'+I.redo+'</button><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
   res.querySelector('.pc-redo').onclick=retry;
   res.querySelector('.pc-next').onclick=function(){window.lsGoNext();};
   if(s>=70&&sc())sc().cheer();
  }).catch(function(){
   if(dead)return;scoring=false;mic.disabled=false;st.textContent='';
   res.innerHTML='<div class="pc-msg">Could not score. Try again.</div><div class="pc-acts"><button type="button" class="pc-go pc-sub">Submit '+I.ok+'</button></div>';
   res.querySelector('.pc-sub').onclick=submit;
  });
 }
 return true;
};
})();
