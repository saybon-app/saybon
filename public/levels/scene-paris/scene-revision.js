/* SayBon - Revision game (opens every lesson after lesson 1).
   Pick an avatar, walk into a scene, a greeter speaks, the learner answers by voice and is graded.
   One continuous teacher track (/assets/revision/revision.mp3) is played in three segments (airport, park, car park);
   the microphone records while it plays, exactly like the lesson-1 dialogue.
   Use:  SayBonRevision.start({ level:'A0', api:'https://…', onDone:function(summary){…}, onSkip:function(){…} }) */
(function(){
if(window.SayBonRevision)return;
var BASE='/assets/revision/',AUD=BASE+'revision.mp3?v=1',IMG=BASE+'img/',V='?v=1';
var API=(typeof window.API_BASE==='string'&&window.API_BASE)||'https://saybonapp-server.onrender.com';

/* ---------- content ---------- */
function set(pre,list){return list.map(function(k){return {id:pre+k,src:IMG+pre+'-'+k+'.webp'+V};});}
var AIRPORT=set('ap',['saree-f','white-m','black-f','asian-m','latina-f','arab-m','asian-f','navyshirt-m','black-m']);
var PARK=set('pk',['black-f','arab-m','arab-f','mideast-f','mideast-m','asian-m','asian-f','white-f','white-m','black-m','black-m2']);
var CARPARK=set('cp',['blazer-f','vest-m','blouse-f','burgundy-m']);
var SCENES=[
 {id:'airport',title:'À l’aéroport',hint:'Choose your traveller',bg:['bg-airport-d','bg-airport-p'],set:AIRPORT,walking:true,
  S:3.4,E:10.1,titleAt:[4.0,5.6],walk:[3.5,6.3],
  greeters:[{k:'sec',src:'g-security',enter:3.7,say:[[7.3,8.2,'Bonjour !']]}],
  answers:[{w:[8.3,10.0],ref:'Bonjour !',label:'Bonjour',who:'the security officer'}]},
 {id:'park',title:'Au parc',hint:'Choose your walker',bg:['bg-park-d','bg-park-p'],set:PARK,walking:false,
  S:9.9,E:20.45,titleAt:[10.3,11.8],walk:[10.0,12.9],
  greeters:[{k:'dog',src:'g-olddog',flip:true,enter:10.3,exit:16.9,say:[[13.3,14.25,'Bonsoir !']]},
            {k:'post',src:'g-postman',enter:16.6,say:[[17.0,17.8,'Salut !']]}],
  answers:[{w:[14.3,16.9],ref:'Bonsoir !',label:'Bonsoir',who:'the man with the dog'},
           {w:[17.8,20.4],ref:'Salut !',label:'Salut',who:'the postman'}]},
 {id:'carpark',title:'Au parking',hint:'Choose your traveller',bg:['bg-carpark-d','bg-carpark-d'],set:CARPARK,walking:true,
  S:20.3,E:32.1,titleAt:[20.7,22.2],walk:[20.4,23.3],
  greeters:[{k:'car',src:'g-carman',enter:20.6,wide:true,say:[[23.6,24.45,'Au revoir !'],[27.5,28.75,'À bientôt !']]}],
  answers:[{w:[24.5,27.3],ref:'Au revoir !',label:'Au revoir',who:'the man at the car'},
           {w:[28.8,32.0],ref:'À bientôt !',label:'À bientôt',who:'the man at the car'}]}
];

/* ---------- helpers (same scoring as lesson 1) ---------- */
var LEN={'A0':{g:.66,f:38,hi:79,mid:60},'Les Petits':{g:.6,f:42,hi:77,mid:58},'A1':{g:.77,f:28,hi:83,mid:65},'A2':{g:.86,f:17,hi:85,mid:68},'B1':{g:.93,f:5,hi:85,mid:70},'B2':{g:.98,f:0,hi:85,mid:70},'C1':{g:1,f:0,hi:85,mid:70}};
function curve(raw,level){var L=LEN[level]||LEN.A0,heard=raw>=8;if(!heard)return{v:0,heard:false,hi:L.hi,mid:L.mid};var v=Math.round(100*Math.pow(Math.min(100,raw)/100,L.g));v=Math.max(v,L.f);return{v:Math.min(100,v),heard:true,hi:L.hi,mid:L.mid};}
function pickScore(d){var keys=['finalScore','score','AccuracyScore','accuracyScore','pronunciationScore','PronScore','pronScore','overallScore','OverallScore','overall','total'];function num(v){return typeof v==='number'&&isFinite(v)?v:(typeof v==='string'&&v.trim()!==''&&isFinite(+v)?+v:null);}
 function look(o,dep){if(!o||typeof o!=='object'||dep>4)return null;for(var i=0;i<keys.length;i++){var n=num(o[keys[i]]);if(n!==null)return n;}for(var k in o){if(o[k]&&typeof o[k]==='object'){var r=look(o[k],dep+1);if(r!==null)return r;}}return null;}
 return look(d,0);}
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
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function musicOff(){try{if(window.pauseAppBgMusicForRecording)window.pauseAppBgMusicForRecording();}catch(e){}}
function musicOn(){try{if(window.resumeAppBgMusicAfterRecording)window.resumeAppBgMusicAfterRecording();}catch(e){}}

/* ---------- styles ---------- */
var CSS='\
.rv{position:fixed;inset:0;z-index:99990;background:#0b0f18;overflow:hidden;font-family:Poppins,system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;-webkit-user-select:none;user-select:none;opacity:0;transition:opacity .5s}\
.rv.on{opacity:1}\
.rv *{box-sizing:border-box}\
.rv-bg{position:absolute;inset:0;background-size:cover;background-position:center bottom;transition:opacity .6s}\
.rv-bg.dim:after{content:"";position:absolute;inset:0;background:rgba(8,12,24,.46)}\
.rv-ch{position:absolute;bottom:var(--g);height:var(--h);pointer-events:none}\
.rv-ch img{height:100%;width:auto;display:block;filter:drop-shadow(0 10px 14px rgba(0,0,0,.35))}\
.rv-me{left:3vw;transform:translateX(-70vw);opacity:0;--h:var(--hm)}\
.rv-me.in{transform:none;opacity:1;transition:transform 2.8s cubic-bezier(.3,.55,.4,1),opacity .5s}\
.rv-me.bob img{animation:rvbob .52s ease-in-out infinite alternate;transform-origin:50% 100%}\
.rv-gt{right:3vw;transform:translateX(34vw);opacity:0;transition:transform .9s cubic-bezier(.2,.8,.25,1),opacity .6s;--h:var(--hg)}\
.rv-gt.in{transform:none;opacity:1}\
.rv-gt.flip img{transform:scaleX(-1)}\
.rv-gt.wide{--h:var(--hc)}\
.rv-name{position:absolute;left:50%;top:100%;transform:translate(-50%,6px);padding:3px 12px;border-radius:999px;background:rgba(10,16,30,.62);color:#fff;font-size:clamp(11px,1.7vh,15px);font-weight:600;letter-spacing:.02em;white-space:nowrap;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}\
.rv-mic{position:absolute;left:50%;top:-4%;transform:translateX(-50%) scale(.3);opacity:0;width:clamp(40px,6.4vh,58px);height:clamp(40px,6.4vh,58px);border-radius:50%;background:#e5543f;display:flex;align-items:center;justify-content:center;transition:opacity .25s,transform .25s}\
.rv-mic svg{width:55%;height:55%}\
.rv-me.rec .rv-mic{opacity:1;transform:translateX(-50%) scale(1);animation:rvpulse 1.1s ease-out infinite}\
.rv-say{position:absolute;left:50%;bottom:100%;transform:translate(-50%,6px) scale(.8);opacity:0;padding:.5em 1em;border-radius:18px;background:#fff;color:#1a2238;font:700 clamp(18px,3.6vh,32px)/1.1 Georgia,"Playfair Display",serif;white-space:nowrap;transition:opacity .2s,transform .25s;box-shadow:0 8px 24px rgba(0,0,0,.3)}\
.rv-say:after{content:"";position:absolute;left:50%;bottom:-8px;width:16px;height:16px;background:#fff;transform:translateX(-50%) rotate(45deg);border-radius:3px}\
.rv-say.on{opacity:1;transform:translate(-50%,-4px) scale(1)}\
.rv-top{position:absolute;left:0;right:0;top:0;padding:max(14px,env(safe-area-inset-top)) 14px 0;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none}\
.rv-where{font:700 clamp(22px,5vh,44px)/1 Georgia,"Playfair Display",serif;text-shadow:0 3px 18px rgba(0,0,0,.65);opacity:0;transform:translateY(-8px);transition:opacity .5s,transform .5s;padding-top:6vh}\
.rv-where.on{opacity:1;transform:none}\
.rv-prompt{padding:.55em 1.2em;border-radius:999px;background:rgba(10,16,30,.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-size:clamp(12px,2.1vh,17px);font-weight:600;transition:background .3s,opacity .3s;opacity:0}\
.rv-prompt.on{opacity:1}\
.rv-prompt.ans{background:#e5543f;animation:rvglow 1.1s ease-in-out infinite}\
.rv-dots{position:absolute;left:0;right:0;bottom:max(14px,env(safe-area-inset-bottom));display:flex;justify-content:center;gap:9px;pointer-events:none}\
.rv-dots i{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.38)}\
.rv-dots i.cur{background:#ffd68c;box-shadow:0 0 0 4px rgba(255,214,140,.3)}\
.rv-dots i.done{background:#7bd88f}\
.rv-x{position:absolute;right:12px;top:max(12px,env(safe-area-inset-top));z-index:5;border:0;border-radius:999px;padding:8px 14px;background:rgba(10,16,30,.55);color:#fff;font:600 13px Poppins,system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}\
.rv-panel{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:14px;z-index:4}\
.rv-card{width:min(940px,100%);max-height:100%;border-radius:26px;background:rgba(14,20,36,.74);border:1px solid rgba(255,255,255,.16);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);box-shadow:0 24px 60px rgba(0,0,0,.45);padding:clamp(14px,2.6vh,26px);animation:rvup .45s ease both}\
.rv-pick{display:flex;gap:clamp(14px,2.4vw,30px);align-items:stretch;height:min(80vh,600px)}\
.rv-prev{flex:0 0 38%;display:flex;align-items:flex-end;justify-content:center;border-radius:20px;background:radial-gradient(ellipse at 50% 85%,rgba(255,214,140,.38),rgba(255,255,255,.04) 70%);padding:10px;min-height:0}\
.rv-prev img{max-height:100%;max-width:100%;object-fit:contain;filter:drop-shadow(0 12px 16px rgba(0,0,0,.4))}\
.rv-side{flex:1;display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0}\
.rv-h{font:700 clamp(20px,3.4vh,30px)/1.1 Georgia,"Playfair Display",serif}\
.rv-sub{font-size:clamp(11px,1.8vh,14px);opacity:.78;margin-top:4px}\
.rv-grid{flex:1;min-height:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(78px,1fr));gap:9px;overflow:auto;align-content:start;padding:3px}\
.rv-thumb{border:2px solid rgba(255,255,255,.18);border-radius:16px;background:rgba(255,255,255,.07);height:clamp(84px,15vh,118px);padding:5px;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;transition:transform .15s,border-color .15s,background .15s}\
.rv-thumb img{max-height:100%;max-width:100%;object-fit:contain}\
.rv-thumb:hover{transform:translateY(-2px)}\
.rv-thumb.sel{border-color:#ffd68c;background:rgba(255,214,140,.2);box-shadow:0 0 0 3px rgba(255,214,140,.25)}\
.rv-in{width:100%;border:2px solid rgba(255,255,255,.22);border-radius:14px;background:rgba(255,255,255,.1);color:#fff;font:600 16px Poppins,system-ui,sans-serif;padding:12px 14px;outline:none}\
.rv-in::placeholder{color:rgba(255,255,255,.55)}\
.rv-in:focus{border-color:#ffd68c}\
.rv-go{border:0;border-radius:999px;padding:13px 22px;font:700 16px Poppins,system-ui,sans-serif;background:linear-gradient(135deg,#ffd68c,#f2a65a);color:#3a1a00;cursor:pointer;box-shadow:0 8px 22px rgba(242,166,90,.4)}\
.rv-go:disabled{opacity:.5;cursor:default}\
.rv-go.alt{background:rgba(255,255,255,.14);color:#fff;box-shadow:none}\
.rv-res{width:min(520px,100%);text-align:center}\
.rv-sc{width:96px;height:96px;margin:0 auto 6px;border-radius:50%;background:conic-gradient(#ffd68c calc(var(--p)*1%),rgba(255,255,255,.16) 0);display:flex;align-items:center;justify-content:center;position:relative}\
.rv-sc:before{content:"";position:absolute;inset:8px;border-radius:50%;background:#141b30}\
.rv-sc b{position:relative;font:700 30px Georgia,serif}.rv-sc small{font-size:14px;opacity:.8}\
.rv-msg{font:700 clamp(20px,3.2vh,28px)/1.15 Georgia,serif;margin:6px 0}\
.rv-msg small{display:block;font:500 13px Poppins,system-ui,sans-serif;opacity:.8;margin-top:4px}\
.rv-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0}\
.rv-chip{padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.12);font-size:14px;font-weight:600}\
.rv-chip b{margin-left:8px;color:#ffd68c}\
.rv-acts{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:8px}\
.rv-wait{font:600 15px Poppins,system-ui,sans-serif;opacity:.9}\
.rv-hint{position:absolute;left:0;right:0;bottom:16%;text-align:center;z-index:3}\
.rv-hint span{display:inline-block;padding:.7em 1.4em;border-radius:999px;background:#fff;color:#1a2238;font-weight:700;cursor:pointer;animation:rvglow 1.1s ease-in-out infinite}\
@keyframes rvbob{from{transform:translateY(0) rotate(-.6deg)}to{transform:translateY(-1.6vh) rotate(.6deg)}}\
@keyframes rvpulse{0%{box-shadow:0 0 0 0 rgba(229,84,63,.7)}100%{box-shadow:0 0 0 20px rgba(229,84,63,0)}}\
@keyframes rvglow{0%,100%{box-shadow:0 0 0 0 rgba(229,84,63,.0)}50%{box-shadow:0 0 0 8px rgba(229,84,63,.28)}}\
@keyframes rvup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}\
.rv{--g:9vh;--hm:62vh;--hg:62vh;--hc:44vh}\
@media (max-aspect-ratio:1/1){\
 .rv{--g:16vh;--hm:38vh;--hg:38vh;--hc:26vh}\
 .rv-pick{flex-direction:column;height:min(88vh,720px)}\
 .rv-prev{flex:0 0 36%}\
 .rv-grid{grid-template-columns:repeat(4,1fr)}\
 .rv-thumb{height:clamp(64px,10vh,96px)}\
 .rv-card{padding:14px}\
}\
@media (max-height:520px){.rv-pick{flex-direction:row;height:88vh}.rv-prev{flex:0 0 30%}}';

/* ---------- icons ---------- */
var MIC='<svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="3" width="10" height="16" rx="5" fill="#fff" stroke="none"/><path d="M6.6 14v1.2a9.4 9.4 0 0 0 18.8 0V14"/><path d="M16 24.6v3.4M11.2 28.4h9.6"/></svg>';

/* ---------- the game ---------- */
var G=null;
function start(opts){
 if(G)close(true);
 opts=opts||{};
 var st=document.createElement('style');st.id='rv-css';st.textContent=CSS;document.head.appendChild(st);
 var root=document.createElement('div');root.className='rv';
 root.innerHTML='<div class="rv-bg"></div><div class="rv-ch rv-me"><div class="rv-mic">'+MIC+'</div><img alt=""><div class="rv-name"></div></div>'+
  '<div class="rv-top"><div class="rv-where"></div><div class="rv-prompt"></div></div><div class="rv-dots"></div><button type="button" class="rv-x">Skip revision</button><div class="rv-panel"></div>';
 document.body.appendChild(root);
 try{document.documentElement.style.overflow='hidden';}catch(e){}
 G={opts:opts,level:opts.level||(window.__psMeta&&window.__psMeta.level)||'A0',root:root,st:st,idx:0,name:'',av:{},results:[],raf:0,dead:false,media:null,stream:null,rec:null,timers:[],greeters:{}};
 G.bg=root.querySelector('.rv-bg');G.me=root.querySelector('.rv-me');G.meImg=G.me.querySelector('img');G.meName=G.me.querySelector('.rv-name');
 G.where=root.querySelector('.rv-where');G.prompt=root.querySelector('.rv-prompt');G.dots=root.querySelector('.rv-dots');G.panel=root.querySelector('.rv-panel');
 G.dots.innerHTML='<i></i><i></i><i></i><i></i><i></i>';
 root.querySelector('.rv-x').onclick=function(){var cb=opts.onSkip;close();if(cb)cb();};
 requestAnimationFrame(function(){root.classList.add('on');});
 preload();
 showPick(0);
}
function preload(){try{SCENES.forEach(function(s){s.bg.forEach(function(b){var i=new Image();i.src=IMG+b+'.webp'+V;});s.set.forEach(function(a){var i=new Image();i.src=a.src;});s.greeters.forEach(function(g){var i=new Image();i.src=IMG+g.src+'.webp'+V;});});}catch(e){}}
function close(silent){
 if(!G)return;G.dead=true;cancelAnimationFrame(G.raf);G.timers.forEach(clearTimeout);
 try{if(G.media){G.media.pause();G.media.src='';}}catch(e){}
 try{if(G.rec&&G.rec.state==='recording')G.rec.stop();}catch(e){}
 try{if(G.stream)G.stream.getTracks().forEach(function(t){t.stop();});}catch(e){}
 musicOn();
 var r=G.root,s=G.st;G=null;
 try{document.documentElement.style.overflow='';}catch(e){}
 r.classList.remove('on');setTimeout(function(){try{r.remove();s.remove();}catch(e){}},silent?0:450);
}
function T(fn,ms){var t=setTimeout(function(){if(G&&!G.dead)fn();},ms);G.timers.push(t);return t;}
function setBg(sc,dim){
 var d=IMG+sc.bg[0]+'.webp'+V,p=IMG+sc.bg[1]+'.webp'+V;
 G.bg.style.backgroundImage='url('+(window.matchMedia&&window.matchMedia('(max-aspect-ratio:1/1)').matches?p:d)+')';
 G.bg.classList.toggle('dim',!!dim);
}
function clearGreeters(){
 [].slice.call(G.root.querySelectorAll('.rv-gt')).forEach(function(n){n.remove();});G.greeters={};
}

/* ---------- avatar pick ---------- */
function showPick(i){
 var sc=SCENES[i];G.idx=i;
 clearGreeters();G.me.className='rv-ch rv-me';G.where.classList.remove('on');G.prompt.classList.remove('on','ans');
 setBg(sc,true);
 G.dots.querySelectorAll('i').forEach(function(d,k){d.className=k<G.results.filter(Boolean).length?'done':'';});
 var cur=G.av[sc.id]||sc.set[0];
 G.panel.innerHTML='<div class="rv-card"><div class="rv-pick"><div class="rv-prev"><img alt=""></div><div class="rv-side">'+
  '<div><div class="rv-h">'+esc(sc.title)+'</div><div class="rv-sub">'+(i===0?'Revision · pick your avatar, then say hello':'Pick your avatar for this place')+'</div></div>'+
  '<div class="rv-grid"></div>'+
  '<input class="rv-in" type="text" maxlength="14" placeholder="Your name" autocomplete="off" value="'+esc(G.name)+'">'+
  '<button type="button" class="rv-go">'+(i===0?'Start revision':'Go')+'</button></div></div></div>';
 var prev=G.panel.querySelector('.rv-prev img'),grid=G.panel.querySelector('.rv-grid'),inp=G.panel.querySelector('.rv-in'),go=G.panel.querySelector('.rv-go');
 function pick(a){cur=a;prev.src=a.src;[].forEach.call(grid.children,function(b){b.classList.toggle('sel',b.dataset.id===a.id);});}
 sc.set.forEach(function(a){var b=document.createElement('button');b.type='button';b.className='rv-thumb';b.dataset.id=a.id;b.innerHTML='<img alt="" src="'+a.src+'">';b.onclick=function(){pick(a);};grid.appendChild(b);});
 pick(cur);
 function chk(){go.disabled=!inp.value.trim();}
 inp.oninput=chk;chk();
 go.onclick=function(){
  if(!inp.value.trim()){inp.focus();return;}
  G.name=inp.value.trim();G.av[sc.id]=cur;runScene(i);
 };
}

/* ---------- a scene ---------- */
function setupStage(sc){
 var a=G.av[sc.id];
 G.meImg.src=a.src;G.meName.textContent=G.name;
 G.me.className='rv-ch rv-me';
 clearGreeters();
 sc.greeters.forEach(function(g){
  var n=document.createElement('div');n.className='rv-ch rv-gt'+(g.flip?' flip':'')+(g.wide?' wide':'');
  n.innerHTML='<img alt="" src="'+IMG+g.src+'.webp'+V+'"><div class="rv-say"></div>';
  G.root.insertBefore(n,G.root.querySelector('.rv-top'));
  G.greeters[g.k]={el:n,say:n.querySelector('.rv-say'),done:false};
 });
 G.where.textContent=sc.title;G.where.classList.remove('on');
 G.prompt.classList.remove('on','ans');
}
function runScene(i){
 var sc=SCENES[i];G.idx=i;
 G.panel.innerHTML='';
 setBg(sc,false);
 setupStage(sc);
 var mark=G.results.filter(Boolean).length;
 sc.dotBase=SCENES.slice(0,i).reduce(function(t,s){return t+s.answers.length;},0);
 G.dots.querySelectorAll('i').forEach(function(d,k){d.className=k<sc.dotBase?'done':'';});
 G.dChunks=[];G.dT0=0;G.dT1=0;G.playing=false;G.ended=false;G.S0=sc.S;
 var wait=document.createElement('div');wait.className='rv-hint';wait.innerHTML='<span>Getting your microphone ready…</span>';G.root.appendChild(wait);G.wait=wait;
 navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}}).then(function(s){
  if(!G||G.dead){s.getTracks().forEach(function(t){t.stop();});return;}
  G.stream=s;
  var rec=new MediaRecorder(s);G.rec=rec;
  rec.ondataavailable=function(e){if(e.data&&e.data.size)G.dChunks.push(e.data);};
  rec.onstart=function(){G.dT0=performance.now();};
  rec.onstop=function(){
   try{s.getTracks().forEach(function(t){t.stop();});}catch(e){}
   if(!G||G.dead||!G.ended)return;
   score(new Blob(G.dChunks,{type:rec.mimeType||'audio/webm'}),sc);
  };
  musicOff();rec.start();
  playSeg(sc);
 }).catch(function(){
  if(!G||G.dead)return;
  if(G.wait){G.wait.remove();G.wait=null;}
  G.panel.innerHTML='<div class="rv-card rv-res"><div class="rv-msg">Microphone blocked<small>Allow the microphone in your browser, then try again.</small></div><div class="rv-acts"><button type="button" class="rv-go">Try again</button></div></div>';
  G.panel.querySelector('.rv-go').onclick=function(){runScene(i);};
 });
}
function playSeg(sc){
 var m=G.media;
 if(!m){m=G.media=new Audio();m.preload='auto';m.src=AUD;}
 function go(){
  try{m.currentTime=sc.S;}catch(e){}
  var onPlaying=function(){m.removeEventListener('playing',onPlaying);G.playing=true;G.dT1=performance.now();G.S0=m.currentTime||sc.S;if(G.wait){G.wait.remove();G.wait=null;}loop(sc);};
  m.addEventListener('playing',onPlaying);
  var p=m.play();
  if(p&&p.catch)p.catch(function(){
   if(G.wait){G.wait.remove();G.wait=null;}
   var h=document.createElement('div');h.className='rv-hint';h.innerHTML='<span>Tap to begin</span>';G.root.appendChild(h);
   h.onclick=function(){h.remove();var q=m.play();if(q&&q.catch)q.catch(function(){});};
  });
 }
 if(m.readyState>=1)go();else{m.addEventListener('loadedmetadata',function f(){m.removeEventListener('loadedmetadata',f);go();});try{m.load();}catch(e){}}
}
function loop(sc){
 var m=G.media,flags={};
 function frame(){
  if(!G||G.dead)return;
  G.raf=requestAnimationFrame(frame);
  var t=m.currentTime;
  if(t>=sc.walk[0]&&!flags.walk){flags.walk=1;G.me.classList.add('in');if(sc.walking)G.me.classList.add('bob');else G.me.classList.add('bob');}
  if(t>=sc.walk[1]&&!flags.stop){flags.stop=1;G.me.classList.remove('bob');}
  G.where.classList.toggle('on',t>=sc.titleAt[0]&&t<sc.titleAt[1]);
  var saying=false;
  sc.greeters.forEach(function(g){
   var o=G.greeters[g.k];
   if(t>=g.enter&&!o.in){o.in=1;o.el.classList.add('in');}
   if(g.exit&&t>=g.exit&&!o.out){o.out=1;o.el.classList.remove('in');}
   var txt='';(g.say||[]).forEach(function(s){if(t>=s[0]&&t<s[1]){txt=s[2];}});
   if(txt){saying=true;o.say.textContent=txt;o.say.classList.add('on');}else o.say.classList.remove('on');
  });
  var ans=-1;sc.answers.forEach(function(a,k){if(t>=a.w[0]&&t<=a.w[1]+0.2)ans=k;});
  G.me.classList.toggle('rec',ans>=0);
  var cur=ans>=0?sc.answers[ans]:null,nx=null;
  if(!cur){sc.answers.forEach(function(a){if(!nx&&t<a.w[0])nx=a;});}
  if(cur){G.prompt.textContent='Respond to '+cur.who;G.prompt.classList.add('on','ans');}
  else if(nx&&t>=sc.walk[0]){G.prompt.textContent='Listen to '+nx.who;G.prompt.classList.remove('ans');G.prompt.classList.add('on');}
  else G.prompt.classList.remove('on','ans');
  var ds=G.dots.querySelectorAll('i');
  sc.answers.forEach(function(a,k){var d=ds[sc.dotBase+k];if(d)d.className=(t>a.w[1]+0.2)?'done':(k===ans?'cur':'');});
  if(t>=sc.E||m.ended){endSeg(sc);}
 }
 G.raf=requestAnimationFrame(frame);
}
function endSeg(sc){
 if(G.ended)return;G.ended=true;cancelAnimationFrame(G.raf);
 try{G.media.pause();}catch(e){}
 G.me.classList.remove('rec','bob');G.prompt.classList.remove('on','ans');G.where.classList.remove('on');
 [].forEach.call(G.root.querySelectorAll('.rv-say'),function(s){s.classList.remove('on');});
 G.panel.innerHTML='<div class="rv-card rv-res"><div class="rv-wait">Scoring…</div></div>';
 T(function(){try{if(G.rec&&G.rec.state==='recording')G.rec.stop();}catch(e){}},500);
}

/* ---------- scoring ---------- */
function score(blob,sc){
 var off=Math.max(0,(G.dT1-G.dT0)/1000),S0=G.S0;
 decode16(blob).then(function(d){
  return Promise.all(sc.answers.map(function(a){
   var s=Math.max(0,Math.floor((a.w[0]-S0+off)*16000)),e=Math.min(d.length,Math.ceil((a.w[1]-S0+off+0.3)*16000));
   if(e-s<1600)return {raw:0};
   var wb=pcmToWav(d.subarray(s,e));
   if(wb.pk<0.012)return {raw:0};
   return fetch(API+'/api/assessPronunciation?referenceText='+encodeURIComponent(a.ref),{method:'POST',body:wb}).then(function(r){return r.json();}).then(function(j){var r=pickScore(j);return {raw:r===null?0:r};}).catch(function(){return {raw:0};});
  }));
 }).then(function(rs){
  if(!G||G.dead)return;
  var vs=rs.map(function(r){return curve(Math.round(r.raw||0),G.level);});
  G.results[sc.idxKey=SCENES.indexOf(sc)]={vs:vs,labels:sc.answers.map(function(a){return a.label;})};
  showResult(sc,vs);
 }).catch(function(){
  if(!G||G.dead)return;
  G.panel.innerHTML='<div class="rv-card rv-res"><div class="rv-msg">Could not score that<small>Check your connection and try again.</small></div><div class="rv-acts"><button type="button" class="rv-go">Try again</button></div></div>';
  G.panel.querySelector('.rv-go').onclick=function(){runScene(SCENES.indexOf(sc));};
 });
}
function showResult(sc,vs){
 var i=SCENES.indexOf(sc),last=i===SCENES.length-1;
 var heard=vs.filter(function(c){return c.heard;}).length,avg=Math.round(vs.reduce(function(t,c){return t+c.v;},0)/vs.length),cu=vs[0];
 var msg=heard===0?'Je n’ai rien entendu<small>I didn’t hear you — headphones help</small>':(avg>=cu.hi?'Bravo !<small>Well done — that’s real French</small>':(avg>=cu.mid?'Très bien !<small>Very good — keep going, or try once more</small>':'Bon effort !<small>Good effort — try again, or move on</small>'));
 var chips=vs.map(function(c,k){return '<span class="rv-chip">'+esc(sc.answers[k].label)+'<b>'+(c.heard?c.v+'%':'—')+'</b></span>';}).join('');
 G.panel.innerHTML='<div class="rv-card rv-res">'+(heard?'<div class="rv-sc" style="--p:'+avg+'"><b>'+avg+'<small>%</small></b></div>':'')+'<div class="rv-msg">'+msg+'</div><div class="rv-chips">'+chips+'</div>'+
  '<div class="rv-acts"><button type="button" class="rv-go alt rv-redo">Try again</button><button type="button" class="rv-go rv-next">'+(last?'Finish':'Next place')+'</button></div></div>';
 G.panel.querySelector('.rv-redo').onclick=function(){G.results[i]=null;runScene(i);};
 G.panel.querySelector('.rv-next').onclick=function(){last?finish():showPick(i+1);};
}
function finish(){
 var all=[],names=[];
 G.results.forEach(function(r,i){if(r)r.vs.forEach(function(c,k){all.push(c.v);names.push({label:r.labels[k],score:c.v,heard:c.heard});});});
 var avg=all.length?Math.round(all.reduce(function(a,b){return a+b;},0)/all.length):0;
 var summary={avg:avg,words:names,name:G.name};
 window.__rvResult=summary;
 var cu=curve(50,G.level);
 var msg=avg>=cu.hi?'Bravo !<small>You greeted everyone like a local</small>':(avg>=cu.mid?'Très bien !<small>Your greetings are coming along</small>':'Bon effort !<small>Keep practising — it gets easier</small>');
 var chips=names.map(function(n){return '<span class="rv-chip">'+esc(n.label)+'<b>'+(n.heard?n.score+'%':'—')+'</b></span>';}).join('');
 clearGreeters();G.me.className='rv-ch rv-me';setBg(SCENES[0],true);
 G.dots.querySelectorAll('i').forEach(function(d){d.className='done';});
 G.panel.innerHTML='<div class="rv-card rv-res"><div class="rv-sc" style="--p:'+avg+'"><b>'+avg+'<small>%</small></b></div><div class="rv-msg">'+msg+'</div><div class="rv-chips">'+chips+'</div><div class="rv-acts"><button type="button" class="rv-go rv-cont">Continue</button></div></div>';
 G.panel.querySelector('.rv-cont').onclick=function(){var cb=G.opts.onDone;close();if(cb)cb(summary);};
}

window.SayBonRevision={start:start,close:function(){close();},scenes:SCENES};
})();
