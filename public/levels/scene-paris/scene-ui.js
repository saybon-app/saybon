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
var LEN={'A0':{g:.66,f:38,hi:79,mid:60},'Les Petits':{g:.6,f:42,hi:77,mid:58},'A1':{g:.77,f:28,hi:83,mid:65},'A2':{g:.86,f:17,hi:85,mid:68},'B1':{g:.93,f:5,hi:85,mid:70},'B2':{g:.98,f:0,hi:85,mid:70},'C1':{g:1,f:0,hi:85,mid:70}};
function curve(raw){var m=window.__psMeta||{},L=LEN[m.level]||LEN.A1,heard=raw>=8;if(!heard)return{v:0,heard:false,hi:L.hi,mid:L.mid};var v=Math.round(100*Math.pow(Math.min(100,raw)/100,L.g));v=Math.max(v,L.f);return{v:Math.min(100,v),heard:true,hi:L.hi,mid:L.mid};}
function pickScore(d){var keys=['finalScore','score','AccuracyScore','accuracyScore','pronunciationScore','PronScore','pronScore','overallScore','OverallScore','overall','total'];function num(v){return typeof v==='number'&&isFinite(v)?v:(typeof v==='string'&&v.trim()!==''&&isFinite(+v)?+v:null);}
 function look(o,dep){if(!o||typeof o!=='object'||dep>4)return null;for(var i=0;i<keys.length;i++){var n=num(o[keys[i]]);if(n!==null)return n;}for(var k in o){if(o[k]&&typeof o[k]==='object'){var r=look(o[k],dep+1);if(r!==null)return r;}}return null;}
 return look(d,0);}
/* lesson 2 and 3: words the learner adds (their own name) must not count against them - score only the reference words */
function pickScoreL(d){
 if((lessonNo()===2||lessonNo()===3)&&d&&d.wordFeedback&&d.wordFeedback.length){
  var w=d.wordFeedback.filter(function(x){return x&&x.errorType!=='Insertion';});
  if(w.length){var t=0;w.forEach(function(x){t+=(typeof x.accuracyScore==='number'&&x.errorType!=='Omission')?x.accuracyScore:0;});return t/w.length;}
 }
 return pickScore(d);
}
function decode16(blob){
 return blob.arrayBuffer().then(function(ab){
  var AC=window.AudioContext||window.webkitAudioContext,ac=new AC();
  return new Promise(function(res,rej){ac.decodeAudioData(ab,res,rej);}).then(function(buf){
   try{ac.close();}catch(e){}
   var len=Math.max(1,Math.ceil(buf.duration*16000)),oc=new OfflineAudioContext(1,len,16000),src=oc.createBufferSource();
   src.buffer=buf;src.connect(oc.destination);src.start();return oc.startRendering();
  });
 }).then(function(out){return out.getChannelData(0);});
}
function pcmToWav(d){
  var n=d.length,pk=0,i;
  for(i=0;i<n;i++){var a=Math.abs(d[i]);if(a>pk)pk=a;}
  var gain=(pk>0.005&&pk<0.7)?0.85/pk:1;
  var bf=new ArrayBuffer(44+n*2),v=new DataView(bf);
  function w(o,t){for(var k=0;k<t.length;k++)v.setUint8(o+k,t.charCodeAt(k));}
  w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
  for(i=0;i<n;i++){var x=Math.max(-1,Math.min(1,d[i]*gain));v.setInt16(44+i*2,x<0?x*0x8000:x*0x7FFF,true);}
  var wb=new Blob([bf],{type:'audio/wav'});wb.pk=pk;return wb;
}
function toWav(blob){return decode16(blob).then(pcmToWav);}
/* ---- resume: remember the learner's place (per account, lesson and level) ---- */
var RS={resolved:false,skipTo:0,welcome:false,pending:false};
function rsKey(){var m=window.__psMeta||{};return 'psResume:'+(window.lsCurrentUid||'anon')+':'+(m.level||'')+':'+(m.lesson||'');}
function rsRead(){try{var v=JSON.parse(localStorage.getItem(rsKey())||'null');return v&&v.done|0;}catch(e){return 0;}}
function rsWrite(n){try{if(n>0)localStorage.setItem(rsKey(),JSON.stringify({done:n,t:Date.now()}));else localStorage.removeItem(rsKey());}catch(e){}}
function whenUid(cb){var n=0;(function w(){if(window.lsCurrentUid||n++>12)cb();else setTimeout(w,150);})();}
var PN=[],FR=['un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix'];
function phraseLabel(part){var i=PN.indexOf(part);if(i<0){PN.push(part);i=PN.length-1;}return 'Phrase '+(FR[i]||(i+1));}
var L1={on:false};
var L1P=[['Bonjour !'],['Bonsoir !'],['Salut !'],['Au revoir !'],['\u00c0 bient\u00f4t !']];
var L1D=[['Bonjour !','Bonjour'],['Salut !','Salut'],['Bonsoir !','Bonsoir'],['Au revoir !','Au revoir'],['\u00c0 bient\u00f4t !','\u00c0 bient\u00f4t']];
/* where the learner answers inside A0_TP_L1_dialogue.mp3 (seconds) */
var L1W=[[31.9,33.6],[34.95,37.0],[38.9,40.95],[42.9,44.95],[47.0,49.3]];
/* lesson 2 dialogue: one answer window inside A0_TP_L2_dialogue.mp3 */
var L3W=[[2.96,5.86],[6.44,8.90],[12.74,14.96],[19.00,20.68],[21.14,23.58]];
var L3D=[['Bonjour.','Bonjour\u2026'],['\u00c7a va bien.','\u00c7a va bien\u2026'],["Je m'appelle.",'Je m\u2019appelle\u2026'],['Au revoir.','Au revoir\u2026'],['\u00c0 bient\u00f4t.','\u00c0 bient\u00f4t\u2026']];
var L2W=[[20.7,25.9]];
var L2D=[["Je m'appelle. Et toi, comment t'appelles-tu ?",'Je m\u2019appelle\u2026']];
function DW(){return lessonNo()===3?L3W:lessonNo()===2?L2W:L1W;}
function DD(){return lessonNo()===3?L3D:lessonNo()===2?L2D:L1D;}
function dlgUrl(){return lessonNo()===3?'/assets/audio/A0_TP_L3_dialogue.mp3?v=1':lessonNo()===2?'/assets/audio/A0_TP_L2_dialogue.mp3?v=1':'/assets/audio/A0_TP_L1_dialogue.mp3?v=2';}
function dlgIdx(){return lessonNo()===3?3:lessonNo()===2?L2P.length:5;}
function l1Key(){return 'psL1:'+(window.lsCurrentUid||'anon')+':'+((window.__psMeta||{}).lesson||'');}
function l1Read(){try{return +localStorage.getItem(l1Key())||0;}catch(e){return 0;}}
function l1Write(n){try{if(n>0)localStorage.setItem(l1Key(),String(n));else localStorage.removeItem(l1Key());}catch(e){}}
function lessonNo(){return (window.__psMeta||{}).lesson;}
function isL1(){var m=window.__psMeta||{};return m.level==='A0'&&(m.lesson===1||m.lesson===2||m.lesson===3);}
/* lesson 2: Je m'appelle (intro + four phrases; the dialogue step is added when its audio exists) */
var L2P=["Je m'appelle.","Je m'appelle.","Comment t'appelles-tu ? Je m'appelle.","Comment t'appelles-tu ? Je m'appelle. Et toi, comment t'appelles-tu ?"];
var L3P=["Comment \u00e7a va ?","\u00c7a va. \u00c7a va bien. \u00c7a va tr\u00e8s bien."];
function introUrl(){return lessonNo()===3?'/assets/audio/A0_TP_L3_intro.mp3?v=1':lessonNo()===2?'/assets/audio/A0_TP_L2_intro.mp3?v=1':'/assets/audio/A0_TP_L1_intro.mp3?v=1';}
function lastStep(){return lessonNo()===3?4:lessonNo()===2?L2P.length+1:6;}
function advance(){if(window.__psAdv)window.__psAdv();else window.lsGoNext();}
function l1Show(i,ctx){
 L1.on=true;
 if(i>=lastStep()){l1Finish(ctx);return;}
 if(lessonNo()===3&&i===2){window.__psListen={url:'/assets/audio/A0_TP_L3_dialogue_intro.mp3?v=1',next:3};window.__psSkipIntro=0;window.__psUI(9000+i,[{type:'text',text:' '}],ctx);return;}
 var b=lessonNo()===3?(i<2?[{type:'text',recordPrompt:true,expectedText:L3P[i],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}]):lessonNo()===2?(i<L2P.length?[{type:'text',recordPrompt:true,expectedText:L2P[i],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}]):i<5?[{type:'text',recordPrompt:true,expectedText:L1P[i][0],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:5,_dlgAll:true}];
 window.__psUI(9000+i,b,ctx);
}
function l1Finish(ctx){
 if(cleanup)cleanup();
 l1Write(0);
 try{var uid=window.lsCurrentUid,LV=window.__psLevel||'a0-tout-public';if(uid)fetch(ctx.api+'/api/levelProgressComplete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid,level:LV,lesson:lessonNo()||1})}).catch(function(){});}catch(e){}
 var c=ensureCard(ctx.root);c.classList.add('fin');
 var p=swap(c,'<div class="pc-top"><div class="pc-hn">Lesson complete</div></div><div class="pc-mid"><div class="pc-fin">Bravo !<small>'+(lessonNo()===3?'You finished Comment \u00e7a va ?':lessonNo()===2?'You finished Je m\u2019appelle':'You finished Les salutations')+' \u2014 well done</small></div></div><div class="pc-bot"><button type="button" class="pc-go pc-back">Back to lessons</button></div>');
 p.classList.add('pc-pr');
 window.__psAdv=function(){location.href='./';};
 p.querySelector('.pc-back').onclick=function(){location.href='./';};
 if(sc())sc().cheer();
}
function ensureCard(root){
 if(card&&root.contains(card))return card;
 root.innerHTML='<div class="pc"><div class="pc-h"><div class="pc-lv">'+hLv()+'</div><h2 class="pc-t">'+hTt()+'</h2><i class="pc-ln"></i></div><div class="pc-b"></div><button type="button" class="pc-skip" aria-label="Skip"><span>Skip</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l6 6-6 6M13 6l6 6-6 6"/></svg></button></div>';
 card=root.firstChild;
 card.querySelector('.pc-skip').addEventListener('click',function(){advance();});
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
 window.__psAdv=null;
 var dead=false,timers=[],extra=[];
 function T(f,ms){var t=setTimeout(function(){if(!dead)f();},ms);timers.push(t);return t;}
 var video=null,audioUrl=null,pb=null,auto=false;
 blocks.forEach(function(b){
  if(!video&&b.type==='video'&&b.url)video=b.url;
  if(!audioUrl&&(b.type==='audio'||b.type==='teacher-audio')&&b.url)audioUrl=b.url;
  if(!pb&&b.recordPrompt)pb=b;
  if(b.transitionMode==='auto')auto=true;
 });
 if(!RS.resolved){RS.resolved=true;RS.pending=true;whenUid(function(){
  if(isL1()){var n1=l1Read();RS.pending=false;if(n1>0&&n1<lastStep()){RS.welcome=true;l1Show(n1,ctx);}else window.__psUI(partNum,blocks,ctx);return;}
  var d=rsRead(),mx=(window.__psMax&&window.__psMax())||0;
  if(d>0&&mx&&d>=mx){rsWrite(0);d=0;}
  if(d>0)RS.skipTo=d+1;
  RS.pending=false;window.__psUI(partNum,blocks,ctx);
 });return true;}
 if(RS.pending)return true;
 if(RS.skipTo&&partNum<RS.skipTo){if(pb)phraseLabel(partNum);else window.__psIntroUsed=1;T(function(){window.lsGoNext();},30);return true;}
 if(RS.skipTo&&partNum>=RS.skipTo){RS.skipTo=0;RS.welcome=true;}
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
  var url=video||audioUrl,_m=window.__psMeta||{},ovr=false;if(isL1()&&!window.__psIntroUsed){window.__psIntroUsed=1;ovr=true;url=introUrl();video=null;}
  var lis=window.__psListen||null;if(lis){window.__psListen=null;url=lis.url;video=null;window.__psAdv=function(){l1Show(lis.next,ctx);};}
  if(ovr)window.__psAdv=function(){l1Show(0,ctx);};
  var p=swap(c,'<button type="button" class="pc-teach" aria-label="Teacher">'+I.mic+'</button><div class="pc-st"></div>');
  var btn=p.querySelector('.pc-teach'),st=p.querySelector('.pc-st');
  function more(){btn.classList.remove('on');T(function(){if(lis)l1Show(lis.next,ctx);else if(ovr)l1Show(0,ctx);else window.lsGoNext();},400);}
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

 /* ---------- DIALOGUE (one continuous track, mic open throughout) ---------- */
 if(pb&&pb._dlgAll){
  window.__psAdv=function(){l1Finish(ctx);};
  var dp=swap(c,
   '<div class="pc-top"><div class="pc-hn">'+(lessonNo()===3?'Phrase trois':lessonNo()===2?'Phrase cinq':'Phrase six')+'</div><div class="pc-hi">Listen carefully.</div><div class="pc-hp">Headphones work best</div>'+(RS.welcome?'<div class="pc-wb">Welcome back — continuing from where you stopped</div>':'')+'</div>'+
   '<div class="pc-mid"><div class="pc-s1 pc-dl"><button type="button" class="pc-teach pc-spk" aria-label="Listen">'+I.mic+'</button><div class="pc-hslot"></div>'+
    '<div class="pc-dots">'+DW().map(function(){return '<i></i>';}).join('')+'</div><canvas class="pc-wv" width="560" height="88"></canvas></div></div>'+
   '<div class="pc-bot"><div class="pc-st"></div><div class="pc-res"></div></div>');
  dp.classList.add('pc-pr');
  if(RS.welcome){RS.welcome=false;T(function(){var w=dp.querySelector('.pc-wb');if(w)w.classList.add('gone');},5200);}
  var dSpk=dp.querySelector('.pc-spk'),dSt=dp.querySelector('.pc-st'),dRes=dp.querySelector('.pc-res'),dCv=dp.querySelector('.pc-wv'),dG=dCv.getContext('2d'),dDots=[].slice.call(dp.querySelectorAll('.pc-dots i'));
  var dHist=[],dT0=0,dT1=0,dChunks=[],dIn=-1,dOk=false,dPlayed=false;
  for(var hi0=0;hi0<56;hi0++)dHist.push(0);
  function dDraw(){
   if(dead)return;raf=requestAnimationFrame(dDraw);
   var v=0;
   if(mAn){mAn.getByteFrequencyData(mData);var sm=0;for(var k=0;k<mData.length;k++)sm+=mData[k];v=Math.min(1,(sm/mData.length)/55);}
   dHist.push(v);dHist.shift();
   dG.clearRect(0,0,560,88);
   for(var j=0;j<dHist.length;j++){var h=3+dHist[j]*70,x=j*10+3;dG.fillStyle='rgba(255,214,140,'+(.35+.65*dHist[j])+')';var y=44-h/2;dG.beginPath();if(dG.roundRect)dG.roundRect(x,y,5,h,2.5);else dG.rect(x,y,5,h);dG.fill();}
   if(media&&dPlayed&&!media.paused){
    var ct=media.currentTime,w=-1;
    for(var q=0;q<DW().length;q++){if(ct>=DW()[q][0]&&ct<=DW()[q][1]+0.3){w=q;break;}}
    for(var d=0;d<dDots.length;d++){dDots[d].className=(ct>DW()[d][1]+0.3)?'done':(d===w?'cur':'');}
    if(w!==dIn){dIn=w;dp.classList.toggle('is-rec',w>=0);if(sc())sc().micState(w>=0?'rec':'');}
   }
  }
  raf=requestAnimationFrame(dDraw);
  function dBegin(){
   navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(s){
    if(dead){s.getTracks().forEach(function(t){t.stop();});return;}
    stream=s;recorder=new MediaRecorder(s);
    recorder.ondataavailable=function(e){if(e.data&&e.data.size)dChunks.push(e.data);};
    recorder.onstart=function(){dT0=performance.now();};
    recorder.onstop=function(){
     mAn=null;musicOn();s.getTracks().forEach(function(t){t.stop();});
     if(dead||!dOk)return;
     dScore(new Blob(dChunks,{type:recorder.mimeType||'audio/webm'}));
    };
    try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms=actx.createMediaStreamSource(s);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms.connect(mAn);}catch(e){mAn=null;}
    musicOff();recorder.start();
    media=new Audio();media.preload='auto';media.src=dlgUrl();
    media.addEventListener('playing',function(){if(!dPlayed){dPlayed=true;dT1=performance.now();}dSpk.classList.add('on');var h=dp.querySelector('.pc-hint');if(h)h.remove();if(sc())sc().listen();});
    media.addEventListener('pause',function(){if(!media.ended)dSpk.classList.remove('on');});
    media.addEventListener('ended',function(){dSpk.classList.remove('on');dp.classList.remove('is-rec');dDots.forEach(function(x){x.className='done';});if(sc()){sc().calm();sc().micState('');}dOk=true;dSt.textContent='Scoring...';T(function(){if(recorder&&recorder.state==='recording')recorder.stop();},700);});
    media.addEventListener('error',function(){dSt.textContent='Audio unavailable';try{if(recorder&&recorder.state==='recording')recorder.stop();}catch(e){}});
    var q0=media.play();if(q0&&q0.catch)q0.catch(function(){
     var hh=document.createElement('div');hh.className='pc-hint';hh.textContent='tap to listen';dp.querySelector('.pc-hslot').appendChild(hh);
     var kick=function(){document.removeEventListener('pointerdown',kick,true);if(!dead&&media.paused&&!media.ended){var q4=media.play();if(q4&&q4.catch)q4.catch(function(){});}};
     document.addEventListener('pointerdown',kick,true);
    });
   }).catch(function(){dSt.textContent='Microphone blocked — allow it and try again';});
  }
  dSpk.onclick=function(){if(media&&media.paused&&!media.ended){var q5=media.play();if(q5&&q5.catch)q5.catch(function(){});}};
  function dScore(blob){
   dp.classList.add('scoring');
   var off=Math.max(0,(dT1-dT0)/1000);
   decode16(blob).then(function(d){
    return Promise.all(DW().map(function(w,i){
     var a=Math.max(0,Math.floor((w[0]+off)*16000)),b=Math.min(d.length,Math.ceil((w[1]+off+0.3)*16000));
     if(b-a<1600)return {raw:0,quiet:true};
     var wb=pcmToWav(d.subarray(a,b));
     if(wb.pk<0.012)return {raw:0,quiet:true};
     return fetch(api+'/api/assessPronunciation?referenceText='+encodeURIComponent(DD()[i][0]),{method:'POST',body:wb}).then(function(r){return r.json();}).then(function(j){var r=pickScoreL(j);return {raw:r===null?0:r,quiet:false};}).catch(function(){return {raw:0,quiet:false,err:true};});
    }));
   }).then(function(rs){
    if(dead)return;
    var vs=rs.map(function(r){return curve(Math.round(r.raw||0));}),heard=vs.filter(function(c){return c.heard;}).length,avg=Math.round(vs.reduce(function(t,c){return t+c.v;},0)/vs.length),cu=vs[0];
    var msg=heard===0?'Je n’ai rien entendu<small>I didn’t hear you — try again, headphones help</small>':(avg>=cu.hi?'Bravo !<small>Well done — that’s a real conversation</small>':(avg>=cu.mid?'Très bien !<small>Very good — keep going, or try once more</small>':'Bon effort !<small>Good effort — try again, or move on</small>'));
    var chips=vs.map(function(c,i){return '<span class="pc-chip">'+esc(DD()[i][1])+'<b>'+(c.heard?c.v+'%':'—')+'</b></span>';}).join('');
    dSt.textContent='';dp.classList.remove('scoring');dp.classList.add('dscored');
    dRes.innerHTML='<div class="pc-fb">'+(heard?'<div class="pc-sc" style="--p:'+avg+'"><b>'+avg+'<small>%</small></b></div>':'')+'<div class="pc-msg">'+msg+'</div></div><div class="pc-chips">'+chips+'</div>'+
     '<div class="pc-acts"><button type="button" class="pc-rb pc-tl" aria-label="Hear the teacher again">'+I.mic+'</button><button type="button" class="pc-rb pc-redo" aria-label="Try again">'+I.redo+'</button><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
    var dTl=dRes.querySelector('.pc-tl');
    dTl.onclick=function(){
     if(recAudio&&!recAudio.paused){recAudio.pause();dTl.classList.remove('on');return;}
     recAudio=new Audio(dlgUrl());
     recAudio.addEventListener('ended',function(){dTl.classList.remove('on');});
     dTl.classList.add('on');var q7=recAudio.play();if(q7&&q7.catch)q7.catch(function(){dTl.classList.remove('on');});
    };
    dRes.querySelector('.pc-redo').onclick=function(){l1Show(dlgIdx(),ctx);};
    dRes.querySelector('.pc-next').onclick=function(){l1Finish(ctx);};
    if(avg>=70&&sc())sc().cheer();
   }).catch(function(){
    if(dead)return;dSt.textContent='';dp.classList.remove('scoring');
    dRes.innerHTML='<div class="pc-msg">Could not score that. Try again.</div><div class="pc-acts"><button type="button" class="pc-go pc-next">Try again</button></div>';
    dRes.querySelector('.pc-next').onclick=function(){l1Show(dlgIdx(),ctx);};
   });
  }
  dBegin();
  return true;
 }
 /* ---------- PRACTICE ---------- */
 var expected=pb.expectedText||'';
 var L1i=(pb._l1!==undefined)?pb._l1:-1,dlgK=(pb._dlg!==undefined)?pb._dlg:-1;
 var lbl0=L1i>=0?('Phrase '+FR[L1i]):phraseLabel(partNum);
 if(L1i>=0){audioUrl=dlgK>=0?('/assets/audio/A0_TP_L1_dlg_'+L1D[dlgK][1]+'.mp3?v=1'):('/assets/audio/A0_TP_L'+lessonNo()+'_phrase'+(L1i+1)+'.mp3?v=1');var stepI=dlgK>=0?5+dlgK:L1i;window.__psAdv=function(){l1Show(stepI+1,ctx);};}
 var p=swap(c,
  '<div class="pc-top"><div class="pc-hn">'+lbl0+'</div><div class="pc-hi">'+(dlgK>=0?'Listen to the teacher, then answer.':'Listen attentively, and repeat when prompted.')+'</div>'+(dlgK>=0?'<div class="pc-pg">'+(dlgK+1)+' / 5</div>':'')+(RS.welcome?'<div class="pc-wb">Welcome back \u2014 continuing from where you stopped</div>':'')+'</div>'+
  '<div class="pc-mid">'+
   '<div class="pc-s1"><button type="button" class="pc-teach pc-spk" aria-label="Listen">'+I.mic+'</button><div class="pc-hslot"></div></div>'+
   '<div class="pc-s2"><div class="pc-row">'+(audioUrl?'<div class="pc-cell"><button type="button" class="pc-rb pc-tl" aria-label="Hear the teacher again">'+I.mic+'</button><span>Teacher</span></div>':'')+
    '<div class="pc-cell"><button type="button" class="pc-mic" aria-label="Record">'+I.rec+'</button><span class="pc-miclbl">Record</span></div>'+
    '<div class="pc-cell pc-repcell"><button type="button" class="pc-rb pc-rep" aria-label="Replay recording" disabled>'+I.play+'</button><span>Replay</span></div>'+
   '</div><canvas class="pc-wv" width="560" height="88"></canvas></div>'+
  '</div>'+
  '<div class="pc-bot"><div class="pc-st"></div><div class="pc-res"></div></div>');
 p.classList.add('pc-pr',audioUrl?'ph-listen':'ph-rec');
 if(RS.welcome){RS.welcome=false;T(function(){var w=p.querySelector('.pc-wb');if(w)w.classList.add('gone');},5200);}
 var tl=p.querySelector('.pc-tl'),spk=p.querySelector('.pc-spk'),mic=p.querySelector('.pc-mic'),rep=p.querySelector('.pc-rep'),lbl=p.querySelector('.pc-miclbl'),st=p.querySelector('.pc-st'),res=p.querySelector('.pc-res'),cv=p.querySelector('.pc-wv'),g=cv.getContext('2d');
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
 function ready(){tplay=false;if(tl)tl.classList.remove('on');p.classList.remove('ph-listen');p.classList.add('ph-rec');if(!scoring)mic.disabled=false;spk.classList.remove('on');if(sc())sc().calm();st.textContent='';mic.classList.add('hint');}
 if(audioUrl){
  media=new Audio();media.preload='auto';media.src=audioUrl;
  media.addEventListener('play',function(){tplay=true;spk.classList.add('on');if(tl)tl.classList.add('on');mic.classList.remove('hint');st.textContent='';var _h=p.querySelector('.pc-hint');if(_h)_h.remove();if(sc())sc().listen();musicOff();});
  media.addEventListener('pause',function(){if(!media.ended){tplay=false;spk.classList.remove('on');if(tl)tl.classList.remove('on');}});
  media.addEventListener('ended',function(){musicOn();ready();});
  media.addEventListener('error',function(){musicOn();ready();});
  var q=media.play();if(q&&q.catch)q.catch(function(){
   var hh=document.createElement('div');hh.className='pc-hint';hh.textContent='tap to listen';p.querySelector('.pc-hslot').appendChild(hh);
   var kick=function(){document.removeEventListener('pointerdown',kick,true);if(!dead&&media.paused&&!media.ended){var q4=media.play();if(q4&&q4.catch)q4.catch(function(){});}};
   document.addEventListener('pointerdown',kick,true);
  });
 }else{spk.disabled=true;ready();}
 if(tl)tl.onclick=function(){
  if(!media||(recorder&&recorder.state==='recording'))return;
  if(recAudio)recAudio.pause();rep.classList.remove('on');
  if(tplay){media.pause();}else{try{media.currentTime=0;}catch(e){}var q6=media.play();if(q6&&q6.catch)q6.catch(function(){});}
 };
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
    if(dlgK>=0){p.classList.remove('is-rec');st.textContent='';submit();return;}
    rep.disabled=false;p.classList.add('has-rec');p.classList.remove('is-rec');st.textContent='Replay it, or submit';
    res.innerHTML='<button type="button" class="pc-go pc-sub">Submit '+I.ok+'</button>';
    res.querySelector('.pc-sub').onclick=submit;
   };
   musicOff();
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms=actx.createMediaStreamSource(s);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms.connect(mAn);}catch(e){mAn=null;}
   p.classList.remove('scored','has-rec');p.classList.add('is-rec');recorder.start();mic.classList.remove('hint');mic.classList.add('rec');mic.innerHTML=I.stop;lbl.textContent='Stop';st.textContent='Recording...';res.innerHTML='';rep.disabled=true;
   if(sc())sc().micState('rec');
   T(function(){if(recorder&&recorder.state==='recording')recorder.stop();},lessonNo()>=2?14000:9000);
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
  toWav(blob).catch(function(){return new Blob([blob],{type:'audio/webm'});}).then(function(body){window.__psSent=body.type+' '+body.size+' pk='+(body.pk!==undefined?body.pk.toFixed(3):'?');if(body.pk!==undefined&&body.pk<0.012)return {quiet:true};return fetch(api+'/api/assessPronunciation?referenceText='+encodeURIComponent(expected),{method:'POST',body:body}).then(function(r){return r.json();});}).then(function(d){
   if(dead)return;scoring=false;mic.disabled=false;
   var quiet=!!d.quiet,rawS=quiet?0:pickScoreL(d),dbg='';try{dbg=(window.__psSent||'')+' '+JSON.stringify(d).slice(0,130);}catch(e){}
   var noScore=(rawS===null&&!quiet),s=Math.round(rawS||0);
   var cv2=curve(s),hi=cv2.hi,mid=cv2.mid,heard=cv2.heard&&!noScore&&!quiet;s=cv2.v;
   var msg=quiet?'Je t\u2019entends mal<small>Your microphone is very quiet \u2014 check it and try again</small>':noScore?'Couldn\u2019t score that<small>Something went wrong \u2014 try again</small>':!heard?'Je n\u2019ai rien entendu<small>I didn\u2019t hear you \u2014 give it another go</small>':(s>=hi?'Bravo !<small>Well done \u2014 on to the next, or go again</small>':(s>=mid?'Tr\u00e8s bien !<small>Very good \u2014 keep going, or try once more</small>':'Bon effort !<small>Good effort \u2014 try again, or move on</small>'));
   st.textContent='';p.classList.add('scored');
   res.innerHTML='<div class="pc-fb">'+(heard?'<div class="pc-sc" style="--p:'+s+'"><b>'+s+'<small>%</small></b></div>':'')+'<div class="pc-msg">'+msg+'</div></div>'+((heard||!/[?&]psdebug/.test(location.search))?'':'<div class="pc-dbg">'+esc(dbg)+'</div>')+
    '<div class="pc-acts"><button type="button" class="pc-rb pc-redo" aria-label="Try again">'+I.redo+'</button><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
   res.querySelector('.pc-redo').onclick=retry;
   res.querySelector('.pc-next').onclick=function(){if(L1i>=0){if(dlgK<0)l1Write(L1i+1);}else{var mx2=(window.__psMax&&window.__psMax())||0;if(mx2&&partNum>=mx2)rsWrite(0);else if(partNum>rsRead())rsWrite(partNum);}advance();};
   if(dlgK>=0){var ac=res.querySelector('.pc-acts');if(ac)ac.style.display='none';T(advance,2600);}
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
