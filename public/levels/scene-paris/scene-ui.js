/* SayBon - lesson UI on the Paris scene: round audio orb, then replay orb + microphone orb, grade under it. */
(function(){
var SVG={
 spk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.6L12.5 19V5L7.6 9.5z" fill="currentColor"/><path d="M16 9a4.2 4.2 0 0 1 0 6M18.6 6.4a8 8 0 0 1 0 11.2"/></svg>',
 mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7"/></svg>',
 stop:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="6.5" width="11" height="11" rx="2.5"/></svg>',
 redo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/></svg>',
 next:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};
var cleanup=null, actx=null;
function sc(){return window.__psScene;}
function esc(t){var d=document.createElement('div');d.textContent=t==null?'':t;return d.innerHTML;}
function orb(cls,icon,label){return '<div class="pu-ow '+cls+'"><div class="pu-rings"><i></i><i></i><i></i></div><button type="button" class="pu-orb" aria-label="'+label+'">'+icon+'</button></div>';}

window.__psUI=function(partNum,blocks,ctx){
 if(blocks.some(function(b){return b.type==='video';}))return false;
 var root=ctx.root,api=ctx.api;
 if(cleanup)cleanup();
 var audioUrl=null,pb=null,auto=false;
 blocks.forEach(function(b){if(!audioUrl&&(b.type==='audio'||b.type==='teacher-audio')&&b.url)audioUrl=b.url;if(!pb&&b.recordPrompt)pb=b;if(b.transitionMode==='auto')auto=true;});
 var expected=pb?(pb.expectedText||''):'';
 root.innerHTML='<div class="pu st-listen">'+
  '<div class="pu-phrase">'+esc(expected)+'</div>'+
  '<div class="pu-row">'+orb('pu-a','','')+orb('pu-m','','')+'</div>'+
  '<div class="pu-status"></div><div class="pu-result"></div></div>';
 var pu=root.querySelector('.pu'),row=pu.querySelector('.pu-row'),status=pu.querySelector('.pu-status'),result=pu.querySelector('.pu-result');
 var aw=pu.querySelector('.pu-a'),mw=pu.querySelector('.pu-m'),ab=aw.querySelector('button'),mb=mw.querySelector('button');
 ab.innerHTML=SVG.spk;ab.setAttribute('aria-label','Play');mb.innerHTML=pb?SVG.mic:SVG.next;mb.setAttribute('aria-label',pb?'Record':'Continue');
 var audio=null,an=null,data=null,raf=0,dead=false,mr=null,stream=null,mAn=null,mData=null,recTimer=0,fake=false,playing=false;
 function S(c){pu.className='pu '+c;}
 function lvl(w,v){w.style.setProperty('--lvl',v.toFixed(3));}
 function loop(){
  if(dead)return;raf=requestAnimationFrame(loop);
  var v=0;
  if(playing){
   if(an){an.getByteFrequencyData(data);var s=0;for(var i=0;i<data.length;i++)s+=data[i];v=Math.min(1,(s/data.length)/70);}
   else{v=.35+.25*Math.sin(Date.now()/160);}
  }
  lvl(aw,v);
  var m=0;if(mAn){mAn.getByteFrequencyData(mData);var q=0;for(var j=0;j<mData.length;j++)q+=mData[j];m=Math.min(1,(q/mData.length)/60);}
  lvl(mw,m);
 }
 raf=requestAnimationFrame(loop);
 function ready(){
  playing=false;aw.classList.remove('is-playing');
  if(sc())sc().calm();
  if(!pb&&auto){setTimeout(function(){if(!dead)window.lsGoNext();},500);return;}
  S('st-ready');status.textContent=pb?'Your turn':'';
 }
 function setupAnalyser(){
  try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
   var src=actx.createMediaElementSource(audio);an=actx.createAnalyser();an.fftSize=128;data=new Uint8Array(an.frequencyBinCount);src.connect(an);an.connect(actx.destination);}catch(e){an=null;}
 }
 function play(){
  if(!audio)return;
  try{audio.currentTime=0;}catch(e){}
  var p=audio.play();
  if(p&&p.catch)p.catch(function(){aw.classList.add('pu-pulse');status.textContent='Tap to listen';});
 }
 function makeAudio(cors){
  audio=new Audio();audio.preload='auto';if(cors)audio.crossOrigin='anonymous';audio.src=audioUrl;
  audio.addEventListener('play',function(){playing=true;aw.classList.add('is-playing');aw.classList.remove('pu-pulse');status.textContent='Listen';if(sc())sc().listen();if(window.pauseAppBgMusicForRecording)window.pauseAppBgMusicForRecording();});
  audio.addEventListener('pause',function(){if(!audio.ended){playing=false;aw.classList.remove('is-playing');}});
  audio.addEventListener('ended',function(){if(window.resumeAppBgMusicAfterRecording)window.resumeAppBgMusicAfterRecording();ready();});
  audio.addEventListener('error',function(){if(cors&&!fake){fake=true;try{audio.pause();}catch(e){}an=null;makeAudio(false);play();}else{ready();}});
  if(cors)setupAnalyser();
 }
 if(audioUrl){makeAudio(true);S('st-listen');aw.classList.add('pu-pulse');play();}
 else{aw.style.display='none';ready();}
 ab.addEventListener('click',function(){if(!audioUrl)return;if(playing){audio.pause();ready();}else{S('st-listen');play();}});
 // ---- recording + grading
 function stopMeter(){mAn=null;}
 function startRec(){
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
   stream=st;var chunks=[];mr=new MediaRecorder(st);
   mr.ondataavailable=function(e){chunks.push(e.data);};
   mr.onstop=function(){clearTimeout(recTimer);stopMeter();st.getTracks().forEach(function(t){t.stop();});if(window.resumeAppBgMusicAfterRecording)window.resumeAppBgMusicAfterRecording();
    if(dead)return;grade(new Blob(chunks,{type:'audio/webm'}));};
   if(window.pauseAppBgMusicForRecording)window.pauseAppBgMusicForRecording();
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();var ms=actx.createMediaStreamSource(st);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms.connect(mAn);}catch(e){mAn=null;}
   mr.start();S('st-rec');mb.innerHTML=SVG.stop;status.textContent='Listening to you';if(sc())sc().micState('rec');
   recTimer=setTimeout(function(){if(mr&&mr.state==='recording')mr.stop();},9000);
  }).catch(function(){status.textContent='Microphone blocked';});
 }
 function grade(blob){
  S('st-score');mb.innerHTML=SVG.mic;if(sc())sc().micState('');status.textContent='Scoring';result.innerHTML='<div class="pu-wait"><i></i><i></i><i></i></div>';
  fetch(api+'/api/assessPronunciation?referenceText='+encodeURIComponent(expected),{method:'POST',body:blob}).then(function(r){return r.json();}).then(function(d){
   if(dead)return;var s=d.finalScore!=null?d.finalScore:(d.score!=null?d.score:(d.AccuracyScore!=null?d.AccuracyScore:d.accuracyScore));s=Math.round(s||0);
   var msg=s>=85?'Bravo !':(s>=70?'Très bien !':'Encore une fois');
   status.textContent='';
   result.innerHTML='<div class="pu-score" style="--p:'+s+'"><b>'+s+'<small>%</small></b></div><div class="pu-msg">'+msg+'</div>'+
    '<div class="pu-acts"><button type="button" class="pu-mini pu-redo" aria-label="Try again">'+SVG.redo+'</button><button type="button" class="pu-mini pu-go" aria-label="Continue">'+SVG.next+'</button></div>';
   result.querySelector('.pu-redo').onclick=function(){result.innerHTML='';S('st-ready');status.textContent='Your turn';};
   result.querySelector('.pu-go').onclick=function(){window.lsGoNext();};
   if(s>=70&&sc())sc().cheer();
  }).catch(function(){if(dead)return;status.textContent='';result.innerHTML='<div class="pu-msg">Could not score. Try again.</div><div class="pu-acts"><button type="button" class="pu-mini pu-redo" aria-label="Try again">'+SVG.redo+'</button></div>';result.querySelector('.pu-redo').onclick=function(){result.innerHTML='';S('st-ready');status.textContent='Your turn';};});
 }
 mb.addEventListener('click',function(){
  if(!pb){window.lsGoNext();return;}
  if(pu.classList.contains('st-score'))return;
  if(mr&&mr.state==='recording'){mr.stop();return;}
  if(audio&&playing)audio.pause();
  startRec();
 });
 cleanup=function(){dead=true;cancelAnimationFrame(raf);clearTimeout(recTimer);try{if(audio)audio.pause();}catch(e){}try{if(mr&&mr.state==='recording')mr.stop();}catch(e){}if(stream)stream.getTracks().forEach(function(t){t.stop();});if(sc()){sc().calm();sc().micState('');}cleanup=null;};
 return true;
};
})();
