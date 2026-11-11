/* SayBon - Lesson 1 on the Paris scene: one frosted glass card.
   Intro: a calm teacher button (microphone icon) pulses while the intro plays, then the card's content slides out left.
   Practice: teacher phrase + speaker, microphone, live wave, replay + submit, grade, next. Skip is always available. */
(function(){
var I={
 rec:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="2.8" width="15" height="26.4" rx="4.6"/><path d="M12.4 7.4h7.2M12.4 10.2h7.2M12.4 13h7.2"/><circle cx="16" cy="21.4" r="3.9" fill="#e5543f" stroke="none"/></svg>',
 spk:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.2h4.6l6.9-5.6a.9.9 0 0 1 1.5.7v17.4a.9.9 0 0 1-1.5.7l-6.9-5.6H5a1.2 1.2 0 0 1-1.2-1.2v-5.2A1.2 1.2 0 0 1 5 12.2z" fill="currentColor"/><path d="M21.6 11.4a6.4 6.4 0 0 1 0 9.2"/><path d="M25.2 7.6a11.4 11.4 0 0 1 0 16.8"/></svg>',
 mic:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="10.5" y="2.5" width="11" height="17" rx="5.5" fill="currentColor" stroke="none"/><path d="M11.6 7.2h8.8M11 10.4h10M11 13.6h10M11.6 16.6h8.8" stroke="rgba(40,14,0,.55)" stroke-width="1.15"/><path d="M6.6 14v1.2a9.4 9.4 0 0 0 18.8 0V14"/><path d="M16 24.6v3.4M11.2 28.4h9.6"/></svg>',
 stop:'<svg viewBox="0 0 32 32" fill="currentColor"><rect x="9" y="9" width="14" height="14" rx="3.2"/></svg>',
 play:'<svg viewBox="0 0 32 32" fill="currentColor"><path d="M11 8.2v15.6a1.2 1.2 0 0 0 1.8 1l12.6-7.8a1.2 1.2 0 0 0 0-2L12.8 7.2a1.2 1.2 0 0 0-1.8 1z"/></svg>',
 ok:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.8l6.2 6.2L25 10.6"/></svg>',
 redo:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M26 16a10 10 0 1 1-3.4-7.5"/><path d="M26 6v6h-6"/></svg>',
 next:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16h18M18 9l7 7-7 7"/></svg>'
};
var cleanup=null,card=null;
(function(){try{if(!document.getElementById('pc-fonts')){var l=document.createElement('link');l.id='pc-fonts';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Poppins:wght@500;600&display=swap';document.head.appendChild(l);}}catch(e){}})();
function sc(){return window.__psScene;}
function esc(t){var d=document.createElement('div');d.textContent=t==null?'':t;return d.innerHTML;}
function musicOff(){try{if(window.pauseAppBgMusicForRecording)window.pauseAppBgMusicForRecording();}catch(e){}}
function musicOn(){try{if(window.resumeAppBgMusicAfterRecording)window.resumeAppBgMusicAfterRecording();}catch(e){}}
function esc(x){return String(x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function hLv(){var m=window.__psMeta||{};return esc(m.level||'A0')+' &middot; Lesson '+esc(m.lesson||1);}
function hTt(){var m=window.__psMeta||{};if(m.title)return esc(m.title);var a=(window.__psTitle&&window.__psTitle())||'';return esc(a||('Le\u00e7on '+(m.lesson||1)));}
/* Scoring gets stricter as levels go up. Beginners get a merciful curve. */
var LEN={'A0':{g:.78,f:30,hi:80,mid:62},'Les Petits':{g:.72,f:35,hi:78,mid:60},'A1':{g:.86,f:20,hi:84,mid:67},'A2':{g:.93,f:10,hi:85,mid:70},'B1':{g:.97,f:0,hi:85,mid:70},'B2':{g:1,f:0,hi:85,mid:70},'C1':{g:1,f:0,hi:85,mid:70}};
function curve(raw){var m=window.__psMeta||{},L=LEN[m.level]||LEN.A1,heard=raw>=8;if(!heard)return{v:0,heard:false,hi:L.hi,mid:L.mid};var v=Math.round(100*Math.pow(Math.min(100,raw)/100,L.g));v=Math.max(v,L.f);return{v:Math.min(100,v),heard:true,hi:L.hi,mid:L.mid};}
function pickScore(d){var keys=['finalScore','score','AccuracyScore','accuracyScore','pronunciationScore','PronScore','pronScore','overallScore','OverallScore','overall','total'];function num(v){return typeof v==='number'&&isFinite(v)?v:(typeof v==='string'&&v.trim()!==''&&isFinite(+v)?+v:null);}
 function look(o,dep){if(!o||typeof o!=='object'||dep>4)return null;for(var i=0;i<keys.length;i++){var n=num(o[keys[i]]);if(n!==null)return n;}for(var k in o){if(o[k]&&typeof o[k]==='object'){var r=look(o[k],dep+1);if(r!==null)return r;}}return null;}
 return look(d,0);}
function toWav(blob){
 return blob.arrayBuffer().then(function(ab){
  var AC=window.AudioContext||window.webkitAudioContext,ac=new AC();
  return new Promise(function(res,rej){ac.decodeAudioData(ab,res,rej);}).then(function(buf){
   try{ac.close();}catch(e){}
   var len=Math.max(1,Math.ceil(buf.duration*16000)),oc=new OfflineAudioContext(1,len,16000),src=oc.createBufferSource();
   src.buffer=buf;src.connect(oc.destination);src.start();return oc.startRendering();
  });
 }).then(function(out){
  var d=out.getChannelData(0),n=d.length,pk=0,i;
  for(i=0;i<n;i++){var a=Math.abs(d[i]);if(a>pk)pk=a;}
  var gain=(pk>0.005&&pk<0.7)?0.85/pk:1;
  var bf=new ArrayBuffer(44+n*2),v=new DataView(bf);
  function w(o,t){for(var k=0;k<t.length;k++)v.setUint8(o+k,t.charCodeAt(k));}
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i]*gain));v.setInt16(44+i*2,x<0?x*0x8000:x*0x7FFF,true);}
  return new Blob([bf],{type:'audio/wav'});
 });
}
var PN=[],FR=['un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix'];
function phraseLabel(part){var i=PN.indexOf(part);if(i<0){PN.push(part);i=PN.length-1;}return 'Phrase '+(FR[i]||(i+1));}
function ensureCard(root){
 if(card&&root.contains(card))return card;
 root.innerHTML='<div class="pc"><div class="pc-h"><div class="pc-lv">'+hLv()+'</div><h2 class="pc-t">'+hTt()+'</h2><i class="pc-ln"></i></div><div class="pc-b"></div><button type="button" class="pc-skip" aria-label="Skip"><span>Skip</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l6 6-6 6M13 6l6 6-6 6"/></svg></button></div>';
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
 if(pb)window.__psSkipIntro=0;
 if(!pb&&window.__psSkipIntro){T(function(){window.lsGoNext();},200);return true;}
 if(!pb){
  var url=video||audioUrl,_m=window.__psMeta||{},ovr=false;if(_m.level==='A0'&&_m.lesson===1&&!window.__psIntroUsed){window.__psIntroUsed=1;ovr=true;url='/assets/audio/A0_TP_L1_intro.mp3?v=1';video=null;}
  var p=swap(c,'<button type="button" class="pc-teach" aria-label="Teacher">'+I.mic+'</button><div class="pc-st"></div>');
  var btn=p.querySelector('.pc-teach'),st=p.querySelector('.pc-st');
  function more(){btn.classList.remove('on');T(function(){window.lsGoNext();},400);}
  if(!url){var hasTxt=blocks.some(function(b){return b.type==='text'&&(b.text||b.content||b.html);});try{console.warn('ps: intro part without media',JSON.stringify(blocks).slice(0,400));}catch(e){}if(!hasTxt){T(function(){window.lsGoNext();},350);return true;}btn.classList.add('on');btn.onclick=function(){window.lsGoNext();};return true;}
  media=video?document.createElement('video'):new Audio();mediaKind=video?'video':'audio';
  if(video){media.setAttribute('playsinline','');media.style.display='none';p.appendChild(media);}
  media.preload='auto';media.muted=false;media.volume=1;media.src=url;
  media.addEventListener('play',function(){var h=p.querySelector('.pc-hint');if(h)h.remove();btn.classList.add('on');if(sc())sc().listen();musicOff();});
  media.addEventListener('pause',function(){if(!media.ended)btn.classList.remove('on');});
  media.addEventListener('ended',function(){if(ovr)window.__psSkipIntro=1;btn.classList.remove('on');if(sc())sc().calm();musicOn();more();});
  media.addEventListener('error',function(){try{console.warn('intro audio error',media.src,media.error&&media.error.code);}catch(e){}musicOn();if(ovr)window.__psSkipIntro=1;if(sc())sc().calm();more();});
  var pp=media.play();
  if(pp&&pp.catch)pp.catch(function(){
   var hint=document.createElement('div');hint.className='pc-hint';hint.textContent='tap to listen';p.appendChild(hint);
   var kick=function(){document.removeEventListener('pointerdown',kick,true);document.removeEventListener('keydown',kick,true);if(!dead&&media.paused&&!media.ended){var q=media.play();if(q&&q.catch)q.catch(function(){});}};
   document.addEventListener('pointerdown',kick,true);document.addEventListener('keydown',kick,true);
  });
  btn.onclick=function(){if(media.paused){try{if(media.ended)media.currentTime=0;}catch(e){}var q=media.play();if(q&&q.catch)q.catch(function(){});}else media.pause();};
  return true;
 }

 /* ---------- PRACTICE ---------- */
 var expected=pb.expectedText||'';
 var _pm=window.__psMeta||{};phraseLabel(partNum);if(_pm.level==='A0'&&_pm.lesson===1&&PN.indexOf(partNum)===0)audioUrl='/assets/audio/A0_TP_L1_phrase1.mp3?v=1';
 var p=swap(c,
  '<div class="pc-top"><div class="pc-hn">'+phraseLabel(partNum)+'</div><div class="pc-hi">Listen attentively, and repeat when prompted.</div></div>'+
  '<div class="pc-mid">'+
   '<div class="pc-s1"><button type="button" class="pc-teach pc-spk" aria-label="Listen">'+I.mic+'</button><div class="pc-hslot"></div></div>'+
   '<div class="pc-s2"><div class="pc-row">'+
    '<div class="pc-cell"><button type="button" class="pc-mic" aria-label="Record">'+I.rec+'</button><span class="pc-miclbl">Record</span></div>'+
    '<div class="pc-cell pc-repcell"><button type="button" class="pc-rb pc-rep" aria-label="Replay recording" disabled>'+I.play+'</button><span>Replay</span></div>'+
   '</div><canvas class="pc-wv" width="560" height="88"></canvas></div>'+
  '</div>'+
  '<div class="pc-bot"><div class="pc-st"></div><div class="pc-res"></div></div>');
 p.classList.add('pc-pr',audioUrl?'ph-listen':'ph-rec');
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
 function ready(){tplay=false;p.classList.remove('ph-listen');p.classList.add('ph-rec');if(!scoring)mic.disabled=false;spk.classList.remove('on');if(sc())sc().calm();st.textContent='';mic.classList.add('hint');}
 if(audioUrl){
  media=new Audio();media.preload='auto';media.src=audioUrl;
  media.addEventListener('play',function(){tplay=true;spk.classList.add('on');mic.classList.remove('hint');st.textContent='';var _h=p.querySelector('.pc-hint');if(_h)_h.remove();if(sc())sc().listen();musicOff();});
  media.addEventListener('pause',function(){if(!media.ended){tplay=false;spk.classList.remove('on');}});
  media.addEventListener('ended',function(){musicOn();ready();});
  media.addEventListener('error',function(){musicOn();ready();});
  var q=media.play();if(q&&q.catch)q.catch(function(){
   var hh=document.createElement('div');hh.className='pc-hint';hh.textContent='tap to listen';p.querySelector('.pc-hslot').appendChild(hh);
   var kick=function(){document.removeEventListener('pointerdown',kick,true);if(!dead&&media.paused&&!media.ended){var q4=media.play();if(q4&&q4.catch)q4.catch(function(){});}};
   document.addEventListener('pointerdown',kick,true);
  });
 }else{spk.disabled=true;ready();}
 spk.onclick=function(){
  if(!media)return;
  if(recorder&&recorder.state==='recording')return;
  if(tplay){media.pause();}else{try{media.currentTime=0;}catch(e){}var q2=media.play();if(q2&&q2.catch)q2.catch(function(){});}
 };
 function startRec(){
  if(media&&tplay)media.pause();
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(s){
   if(dead){s.getTracks().forEach(function(t){t.stop();});return;}
   stream=s;var chunks=[];recorder=new MediaRecorder(s);
   recorder.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
   recorder.onstop=function(){
    mAn=null;musicOn();s.getTracks().forEach(function(t){t.stop();});
    mic.classList.remove('rec');mic.innerHTML=I.rec;lbl.textContent='Record again';if(sc())sc().micState('');
    if(dead)return;
    blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});
    if(recUrl)try{URL.revokeObjectURL(recUrl);}catch(e){}
    recUrl=URL.createObjectURL(blob);recAudio=new Audio(recUrl);
    recAudio.addEventListener('ended',function(){rep.classList.remove('on');});
    rep.disabled=false;p.classList.add('has-rec');p.classList.remove('is-rec');st.textContent='Replay it, or submit';
    res.innerHTML='<button type="button" class="pc-go pc-sub">Submit '+I.ok+'</button>';
    res.querySelector('.pc-sub').onclick=submit;
   };
   musicOff();
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms=actx.createMediaStreamSource(s);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms.connect(mAn);}catch(e){mAn=null;}
   p.classList.remove('scored','has-rec');p.classList.add('is-rec');recorder.start();mic.classList.remove('hint');mic.classList.add('rec');mic.innerHTML=I.stop;lbl.textContent='Stop';st.textContent='Recording...';res.innerHTML='';rep.disabled=true;
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
 function retry(){p.classList.remove('scored');res.innerHTML='';blob=null;rep.disabled=true;p.classList.remove('has-rec','is-rec');lbl.textContent='Record';st.textContent='';mic.classList.add('hint');}
 function submit(){
  if(!blob||scoring)return;
  scoring=true;mic.disabled=true;if(recAudio)recAudio.pause();
  st.textContent='Scoring...';res.innerHTML='<div class="pc-wait"><i></i><i></i><i></i></div>';
  toWav(blob).catch(function(){return new Blob([blob],{type:'audio/webm'});}).then(function(body){window.__psSent=body.type+' '+body.size;return fetch(api+'/api/assessPronunciation?referenceText='+encodeURIComponent(expected),{method:'POST',body:body});}).then(function(r){return r.json();}).then(function(d){
   if(dead)return;scoring=false;mic.disabled=false;
   var rawS=pickScore(d),dbg='';try{dbg=(window.__psSent||'')+' '+JSON.stringify(d).slice(0,130);}catch(e){}
   var noScore=(rawS===null),s=Math.round(rawS||0);
   var cv2=curve(s),hi=cv2.hi,mid=cv2.mid,heard=cv2.heard&&!noScore;s=cv2.v;
   var msg=noScore?'Couldn\u2019t score that<small>Something went wrong \u2014 try again</small>':!heard?'Je n\u2019ai rien entendu<small>I didn\u2019t hear you \u2014 try again</small>':(s>=hi?'Bravo !<small>Well done</small>':(s>=mid?'Tr\u00e8s bien !<small>Very good</small>':'Encore une fois<small>Try again</small>'));
   st.textContent='';p.classList.add('scored');
   res.innerHTML='<div class="pc-fb">'+(heard?'<div class="pc-sc" style="--p:'+s+'"><b>'+s+'<small>%</small></b></div>':'')+'<div class="pc-msg">'+msg+'</div></div>'+(heard?'':'<div class="pc-dbg">'+esc(dbg)+'</div>')+
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
