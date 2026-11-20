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
function kids(){return (window.__psMeta||{}).level==='Les Petits';}
/* Les Petits: teacher recordings that exist (lesson-part). Parts not listed here just open the microphone. */
var KAUD={'1-3':1,'1-4':1,'1-5':1};var KDR={'1-2':'bonjour','1-3':'salut','1-4':'aurevoir','1-5':'skip','1-6':'dialogue','1-7':'skip','1-8':'skip','1-9':'skip','1-10':'skip','1-11':'skip','2-2':'cava','2-3':'cavabien','2-4':'ettoi','2-5':'dialogue','3-2':'comment','3-3':'mappelle','3-4':'enchante','3-5':'dialogue','4-2':'silteplait','4-3':'merci','4-4':'derien','4-5':'dialogue','5-2':'oui','5-3':'non','5-4':'unde','5-5':'dialogue','6-2':'rouge','6-3':'bleu','6-4':'jaune','6-5':'dialogue','7-2':'chat','7-3':'chien','7-4':'oiseau','7-5':'dialogue','8-2':'maman','8-3':'papa','8-4':'bebe','8-5':'dialogue','9-2':'pomme','9-3':'gateau','9-4':'eau','9-5':'dialogue','10-2':'quatre','10-3':'cinq','10-4':'sixde','10-5':'dialogue','11-2':'nez','11-3':'bouche','11-4':'mains','11-5':'dialogue','12-2':'content','12-3':'triste','12-4':'jesuis','12-5':'dialogue'},UDR={},UINTRO={},KDT={upper:'Lesson 1',bonjour:'Bonjour',salut:'Salut',aurevoir:'Au revoir',dialogue:'Conversation',cava:"Ça va ?",cavabien:"Ça va bien",ettoi:"Et toi ?",comment:"Comment tu t'appelles ?",mappelle:"Je m'appelle",enchante:"Enchanté !",silteplait:"S'il te plaît",merci:"Merci",derien:"De rien",oui:"Oui",non:"Non",unde:"Un, deux, trois",rouge:"Rouge",bleu:"Bleu",jaune:"Jaune",chat:"Le chat",chien:"Le chien",oiseau:"L'oiseau",maman:"Maman",papa:"Papa",bebe:"Le bébé",pomme:"La pomme",gateau:"Le gâteau",eau:"De l'eau",quatre:"Quatre",cinq:"Cinq",sixde:"Un, deux, trois, quatre, cinq",nez:"Le nez",bouche:"La bouche",mains:"Les mains",content:"Content",triste:"Triste",jesuis:"Je suis content"};var /*lp2-6*/KINTRO={'1-1':1,'1-2':1,'2-1':1,'3-1':1,'4-1':1,'5-1':1,'6-1':1,'7-1':1,'8-1':1,'9-1':1,'10-1':1,'11-1':1,'12-1':1};var KINTRO={'1-1':1,'1-2':1};
(function(){try{if(!document.getElementById('pc-kids')){var k=document.createElement('style');k.id='pc-kids';k.textContent='.pc-stars{display:flex;justify-content:center;gap:.28em;font-size:2.7rem;line-height:1;color:#ffd24a;text-shadow:0 0 16px rgba(255,210,74,.65)}.pc-stars span{display:inline-block;transform:scale(0);animation:pcStar .55s cubic-bezier(.3,1.6,.5,1) forwards}.pc-stars span.off{color:rgba(255,255,255,.28);text-shadow:none}@keyframes pcStar{to{transform:scale(1)}}.pc-yt{font-weight:600;letter-spacing:.04em}';document.head.appendChild(k);}}catch(e){}})();
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
function T0(f,ms){return setTimeout(f,ms);}
var UCFG={"A1-1":{"intro":"L1_a1_intro","n":6,"dlg":"L1_a1_dlg","fin":"Lesson 1","dd":[["Je m'appelle Lucas.","Je m'appelle Lucas."],["J'ai vingt-cinq ans. Et toi ?","J'ai vingt-cinq ans.…"],["J'habite à Lyon.","J'habite à Lyon."],["Je suis étudiant. Et toi ?","Je suis étudiant.…"]],"steps":[{"a":"L1_a1_s1","t":"Je m'appelle Lucas."},{"a":"L1_a1_s2","t":"J'ai vingt-cinq ans. Et toi ?"},{"a":"L1_a1_s3","t":"J'habite à Lyon."},{"a":"L1_a1_s4","t":"Je suis étudiant. Et toi ?"},{"a":"L1_a1_q1","t":"J'ai vingt-cinq ans. Et toi ?"},{"a":"L1_a1_q2","t":"Je suis étudiant. Et toi ?"}]},"A2-1":{"intro":"L1_a2_intro","n":6,"dlg":"L1_a2_dlg","fin":"Lesson 1","dd":[["Samedi, je suis allé au marché.","Samedi, je suis…"],["J'ai acheté des fruits. Et toi, tu es sorti ?","J'ai acheté des…"],["Dimanche, je suis rentré à la maison.","Dimanche, je suis…"],["Oui, elle est arrivée hier, et nous sommes partis ensemble.","Oui, elle est…"]],"steps":[{"a":"L1_a2_s1","t":"Samedi, je suis allé au marché."},{"a":"L1_a2_s2","t":"J'ai acheté des fruits. Et toi, tu es sorti ?"},{"a":"L1_a2_s3","t":"Dimanche, je suis rentré à la maison."},{"a":"L1_a2_s4","t":"Oui, elle est arrivée hier, et nous sommes partis ensemble."},{"a":"L1_a2_q1","t":"J'ai acheté des fruits. Et toi, tu es sorti ?"},{"a":"L1_a2_q2","t":"Oui, elle est arrivée hier, et nous sommes partis ensemble."}]},"B1-1":{"intro":"L1_b1_intro","n":6,"dlg":"L1_b1_dlg","fin":"Lesson 1","dd":[["D'abord, je me suis levé tard.","D'abord, je me…"],["Ensuite, j'ai préparé le déjeuner.","Ensuite, j'ai préparé…"],["Puis mes amis sont arrivés.","Puis mes amis…"],["Enfin, nous sommes sortis ensemble. Et toi ?","Enfin, nous sommes…"]],"steps":[{"a":"L1_b1_s1","t":"D'abord, je me suis levé tard."},{"a":"L1_b1_s2","t":"Ensuite, j'ai préparé le déjeuner."},{"a":"L1_b1_s3","t":"Puis mes amis sont arrivés."},{"a":"L1_b1_s4","t":"Enfin, nous sommes sortis ensemble. Et toi ?"},{"a":"L1_b1_q1","t":"Ensuite, j'ai préparé le déjeuner."},{"a":"L1_b1_q2","t":"Enfin, nous sommes sortis ensemble. Et toi ?"}]},"B2-1":{"intro":"L1_b2_intro","n":6,"dlg":"L1_b2_dlg","fin":"Lesson 1","dd":[["Selon moi, le télétravail est une bonne chose.","Selon moi, le…"],["D'une part, il fait gagner du temps.","D'une part, il…"],["D'autre part, il favorise l'autonomie.","D'autre part, il…"],["En conclusion, il faut l'encourager. Et vous ?","En conclusion, il…"]],"steps":[{"a":"L1_b2_s1","t":"Selon moi, le télétravail est une bonne chose."},{"a":"L1_b2_s2","t":"D'une part, il fait gagner du temps."},{"a":"L1_b2_s3","t":"D'autre part, il favorise l'autonomie."},{"a":"L1_b2_s4","t":"En conclusion, il faut l'encourager. Et vous ?"},{"a":"L1_b2_q1","t":"D'une part, il fait gagner du temps."},{"a":"L1_b2_q2","t":"En conclusion, il faut l'encourager. Et vous ?"}]},"C1-1":{"intro":"L1_c1_intro","n":6,"dlg":"L1_c1_dlg","fin":"Lesson 1","dd":[["Le livre dont je vous ai parlé m'a profondément marqué.","Le livre dont…"],["Le livre, que j'ai enfin terminé, m'a profondément marqué.","Le livre, que…"],["Le film dont tout le monde parle, que j'ai vu hier, m'a ému.","Le film dont…"],["Sans hésiter. Et vous, qu'est-ce qui vous a marqué ?","Sans hésiter. Et…"]],"steps":[{"a":"L1_c1_s1","t":"Le livre dont je vous ai parlé m'a profondément marqué."},{"a":"L1_c1_s2","t":"Le livre, que j'ai enfin terminé, m'a profondément marqué."},{"a":"L1_c1_s3","t":"Le film dont tout le monde parle, que j'ai vu hier, m'a ému."},{"a":"L1_c1_s4","t":"Sans hésiter. Et vous, qu'est-ce qui vous a marqué ?"},{"a":"L1_c1_q1","t":"Le livre, que j'ai enfin terminé, m'a profondément marqué."},{"a":"L1_c1_q2","t":"Sans hésiter. Et vous, qu'est-ce qui vous a marqué ?"}]},"C2-1":{"intro":"L1_c2_intro","n":6,"dlg":"L1_c2_dlg","fin":"Lesson 1","dd":[["Je me permets de nuancer votre propos.","Je me permets…"],["Il me serait agréable de pouvoir vous rencontrer.","Il me serait…"],["Permettez-moi de vous faire remarquer que ce rapport manque de rigueur.","Permettez-moi de vous…"],["Je ne partage pas tout à fait votre point de vue.","Je ne partage…"]],"steps":[{"a":"L1_c2_s1","t":"Je me permets de nuancer votre propos."},{"a":"L1_c2_s2","t":"Il me serait agréable de pouvoir vous rencontrer."},{"a":"L1_c2_s3","t":"Permettez-moi de vous faire remarquer que ce rapport manque de rigueur."},{"a":"L1_c2_s4","t":"Je ne partage pas tout à fait votre point de vue."},{"a":"L1_c2_q1","t":"Il me serait agréable de pouvoir vous rencontrer."},{"a":"L1_c2_q2","t":"Je ne partage pas tout à fait votre point de vue."}]},"A1-2":{"intro":"L2_a1_intro","n":6,"dlg":"L2_a1_dlg","fin":"Lesson 2","dd":[["Oui, j'attends mon ami Paul.","Oui, j'attends mon…"],["Il est grand, et il a les cheveux noirs.","Il est grand,…"],["Oui, il a des lunettes. Il est très sympa.","Oui, il a…"],["Moi, je suis petit, et j'ai les yeux verts.","Moi, je suis…"]],"steps":[{"a":"L2_a1_s1","t":"Oui, j'attends mon ami Paul."},{"a":"L2_a1_s2","t":"Il est grand, et il a les cheveux noirs."},{"a":"L2_a1_s3","t":"Oui, il a des lunettes. Il est très sympa."},{"a":"L2_a1_s4","t":"Moi, je suis petit, et j'ai les yeux verts."},{"a":"L2_a1_q1","t":"Il est grand, et il a les cheveux noirs."},{"a":"L2_a1_q2","t":"Moi, je suis petit, et j'ai les yeux verts."}]},"A2-2":{"intro":"L2_a2_intro","n":6,"dlg":"L2_a2_dlg","fin":"Lesson 2","dd":[["Quand j'étais petit, j'habitais à la campagne.","Quand j'étais petit,…"],["Nous jouions dans le jardin.","Nous jouions dans…"],["Oui, il faisait toujours beau.","Oui, il faisait…"],["Ma grand-mère cuisinait tous les jours. Et toi ?","Ma grand-mère cuisinait…"]],"steps":[{"a":"L2_a2_s1","t":"Quand j'étais petit, j'habitais à la campagne."},{"a":"L2_a2_s2","t":"Nous jouions dans le jardin."},{"a":"L2_a2_s3","t":"Oui, il faisait toujours beau."},{"a":"L2_a2_s4","t":"Ma grand-mère cuisinait tous les jours. Et toi ?"},{"a":"L2_a2_q1","t":"Nous jouions dans le jardin."},{"a":"L2_a2_q2","t":"Ma grand-mère cuisinait tous les jours. Et toi ?"}]},"B1-2":{"intro":"L2_b1_intro","n":6,"dlg":"L2_b1_dlg","fin":"Lesson 2","dd":[["Il pleuvait quand je suis sorti.","Il pleuvait quand…"],["Je lisais quand le téléphone a sonné.","Je lisais quand…"],["Elle dormait quand je suis arrivé.","Elle dormait quand…"],["Non, j'étais fatigué, alors je suis rentré.","Non, j'étais fatigué,…"]],"steps":[{"a":"L2_b1_s1","t":"Il pleuvait quand je suis sorti."},{"a":"L2_b1_s2","t":"Je lisais quand le téléphone a sonné."},{"a":"L2_b1_s3","t":"Elle dormait quand je suis arrivé."},{"a":"L2_b1_s4","t":"Non, j'étais fatigué, alors je suis rentré."},{"a":"L2_b1_q1","t":"Je lisais quand le téléphone a sonné."},{"a":"L2_b1_q2","t":"Non, j'étais fatigué, alors je suis rentré."}]},"B2-2":{"intro":"L2_b2_intro","n":6,"dlg":"L2_b2_dlg","fin":"Lesson 2","dd":[["Il faut que nous finissions ce travail.","Il faut que…"],["Il faut que je parte à six heures.","Il faut que…"],["Il est important que tu comprennes les chiffres.","Il est important…"],["Je veux que tu viennes tôt. D'accord ?","Je veux que…"]],"steps":[{"a":"L2_b2_s1","t":"Il faut que nous finissions ce travail."},{"a":"L2_b2_s2","t":"Il faut que je parte à six heures."},{"a":"L2_b2_s3","t":"Il est important que tu comprennes les chiffres."},{"a":"L2_b2_s4","t":"Je veux que tu viennes tôt. D'accord ?"},{"a":"L2_b2_q1","t":"Il faut que je parte à six heures."},{"a":"L2_b2_q2","t":"Je veux que tu viennes tôt. D'accord ?"}]},"C1-2":{"intro":"L2_c1_intro","n":6,"dlg":"L2_c1_dlg","fin":"Lesson 2","dd":[["Quoi que vous disiez, je resterai calme.","Quoi que vous…"],["Bien que le retard soit regrettable, nous allons le résoudre.","Bien que le…"],["Pourvu que tout se passe bien, vous serez livré demain.","Pourvu que tout…"],["Je doute qu'il ait compris notre proposition. Qu'en pensez-vous ?","Je doute qu'il…"]],"steps":[{"a":"L2_c1_s1","t":"Quoi que vous disiez, je resterai calme."},{"a":"L2_c1_s2","t":"Bien que le retard soit regrettable, nous allons le résoudre."},{"a":"L2_c1_s3","t":"Pourvu que tout se passe bien, vous serez livré demain."},{"a":"L2_c1_s4","t":"Je doute qu'il ait compris notre proposition. Qu'en pensez-vous ?"},{"a":"L2_c1_q1","t":"Bien que le retard soit regrettable, nous allons le résoudre."},{"a":"L2_c1_q2","t":"Je doute qu'il ait compris notre proposition. Qu'en pensez-vous ?"}]},"C2-2":{"intro":"L2_c2_intro","n":6,"dlg":"L2_c2_dlg","fin":"Lesson 2","dd":[["Si j'avais su, je serais venu.","Si j'avais su,…"],["Il aurait pu le dire plus tôt.","Il aurait pu…"],["Je crains qu'il ne soit déjà trop tard.","Je crains qu'il…"],["Quand bien même il le saurait, il se tairait.","Quand bien même…"]],"steps":[{"a":"L2_c2_s1","t":"Si j'avais su, je serais venu."},{"a":"L2_c2_s2","t":"Il aurait pu le dire plus tôt."},{"a":"L2_c2_s3","t":"Je crains qu'il ne soit déjà trop tard."},{"a":"L2_c2_s4","t":"Quand bien même il le saurait, il se tairait."},{"a":"L2_c2_q1","t":"Il aurait pu le dire plus tôt."},{"a":"L2_c2_q2","t":"Quand bien même il le saurait, il se tairait."}]},"A1-3":{"intro":"L3_a1_intro","n":6,"dlg":"L3_a1_dlg","fin":"Lesson 3","dd":[["Oui, j'habite ici. Entre !","Oui, j'habite ici.…"],["Il y a deux chambres.","Il y a…"],["La cuisine est grande.","La cuisine est…"],["Mon salon est très lumineux. Tu veux un café ?","Mon salon est…"]],"steps":[{"a":"L3_a1_s1","t":"Oui, j'habite ici. Entre !"},{"a":"L3_a1_s2","t":"Il y a deux chambres."},{"a":"L3_a1_s3","t":"La cuisine est grande."},{"a":"L3_a1_s4","t":"Mon salon est très lumineux. Tu veux un café ?"},{"a":"L3_a1_q1","t":"Il y a deux chambres."},{"a":"L3_a1_q2","t":"Mon salon est très lumineux. Tu veux un café ?"}]},"A2-3":{"intro":"L3_a2_intro","n":6,"dlg":"L3_a2_dlg","fin":"Lesson 3","dd":[["Hier, je suis allé au parc.","Hier, je suis…"],["Oui, il faisait beau, alors j'ai marché.","Oui, il faisait…"],["Soudain, j'ai vu mon ami.","Soudain, j'ai vu…"],["Oui, nous avons parlé pendant une heure.","Oui, nous avons…"]],"steps":[{"a":"L3_a2_s1","t":"Hier, je suis allé au parc."},{"a":"L3_a2_s2","t":"Oui, il faisait beau, alors j'ai marché."},{"a":"L3_a2_s3","t":"Soudain, j'ai vu mon ami."},{"a":"L3_a2_s4","t":"Oui, nous avons parlé pendant une heure."},{"a":"L3_a2_q1","t":"Oui, il faisait beau, alors j'ai marché."},{"a":"L3_a2_q2","t":"Oui, nous avons parlé pendant une heure."}]},"B1-3":{"intro":"L3_b1_intro","n":6,"dlg":"L3_b1_dlg","fin":"Lesson 3","dd":[["À mon avis, c'est une très bonne idée.","À mon avis,…"],["Je pense que le sport est important.","Je pense que…"],["Il me semble que c'est trop cher.","Il me semble…"],["Je ne suis pas d'accord avec cette idée. Et toi ?","Je ne suis…"]],"steps":[{"a":"L3_b1_s1","t":"À mon avis, c'est une très bonne idée."},{"a":"L3_b1_s2","t":"Je pense que le sport est important."},{"a":"L3_b1_s3","t":"Il me semble que c'est trop cher."},{"a":"L3_b1_s4","t":"Je ne suis pas d'accord avec cette idée. Et toi ?"},{"a":"L3_b1_q1","t":"Je pense que le sport est important."},{"a":"L3_b1_q2","t":"Je ne suis pas d'accord avec cette idée. Et toi ?"}]},"B2-3":{"intro":"L3_b2_intro","n":6,"dlg":"L3_b2_dlg","fin":"Lesson 3","dd":[["Il est dommage qu'il pleuve aujourd'hui.","Il est dommage…"],["Je suis content que vous soyez là.","Je suis content…"],["Je souhaite que tout se passe bien.","Je souhaite que…"],["Je regrette qu'il ne puisse pas venir. Et vous ?","Je regrette qu'il…"]],"steps":[{"a":"L3_b2_s1","t":"Il est dommage qu'il pleuve aujourd'hui."},{"a":"L3_b2_s2","t":"Je suis content que vous soyez là."},{"a":"L3_b2_s3","t":"Je souhaite que tout se passe bien."},{"a":"L3_b2_s4","t":"Je regrette qu'il ne puisse pas venir. Et vous ?"},{"a":"L3_b2_q1","t":"Je suis content que vous soyez là."},{"a":"L3_b2_q2","t":"Je regrette qu'il ne puisse pas venir. Et vous ?"}]},"C1-3":{"intro":"L3_c1_intro","n":6,"dlg":"L3_c1_dlg","fin":"Lesson 3","dd":[["Il ouvrit la porte et entra.","Il ouvrit la…"],["Elle comprit aussitôt son erreur.","Elle comprit aussitôt…"],["Ils partirent à l'aube, sans un mot.","Ils partirent à…"],["Il fallut attendre longtemps. Et toi, tu aimes ce style ?","Il fallut attendre…"]],"steps":[{"a":"L3_c1_s1","t":"Il ouvrit la porte et entra."},{"a":"L3_c1_s2","t":"Elle comprit aussitôt son erreur."},{"a":"L3_c1_s3","t":"Ils partirent à l'aube, sans un mot."},{"a":"L3_c1_s4","t":"Il fallut attendre longtemps. Et toi, tu aimes ce style ?"},{"a":"L3_c1_q1","t":"Elle comprit aussitôt son erreur."},{"a":"L3_c1_q2","t":"Il fallut attendre longtemps. Et toi, tu aimes ce style ?"}]},"C2-3":{"intro":"L3_c2_intro","n":6,"dlg":"L3_c2_dlg","fin":"Lesson 3","dd":[["Veuillez agréer mes salutations distinguées.","Veuillez agréer mes…"],["Je vous serais reconnaissant de bien vouloir me répondre.","Je vous serais…"],["Soyons francs : ce projet manque d'ambition.","Soyons francs :…"],["Avec tout le respect que je vous dois, je ne suis pas de votre avis.","Avec tout le…"]],"steps":[{"a":"L3_c2_s1","t":"Veuillez agréer mes salutations distinguées."},{"a":"L3_c2_s2","t":"Je vous serais reconnaissant de bien vouloir me répondre."},{"a":"L3_c2_s3","t":"Soyons francs : ce projet manque d'ambition."},{"a":"L3_c2_s4","t":"Avec tout le respect que je vous dois, je ne suis pas de votre avis."},{"a":"L3_c2_q1","t":"Je vous serais reconnaissant de bien vouloir me répondre."},{"a":"L3_c2_q2","t":"Avec tout le respect que je vous dois, je ne suis pas de votre avis."}]},"A1-4":{"intro":"L4_a1_intro","n":6,"dlg":"L4_a1_dlg","fin":"Lesson 4","dd":[["J'ai deux frères et une sœur.","J'ai deux frères…"],["Mon père s'appelle Paul.","Mon père s'appelle…"],["Oui, ma meilleure amie est très drôle.","Oui, ma meilleure…"],["Oui, nous sommes une grande famille. Et toi ?","Oui, nous sommes…"]],"steps":[{"a":"L4_a1_s1","t":"J'ai deux frères et une sœur."},{"a":"L4_a1_s2","t":"Mon père s'appelle Paul."},{"a":"L4_a1_s3","t":"Oui, ma meilleure amie est très drôle."},{"a":"L4_a1_s4","t":"Oui, nous sommes une grande famille. Et toi ?"},{"a":"L4_a1_q1","t":"Mon père s'appelle Paul."},{"a":"L4_a1_q2","t":"Oui, nous sommes une grande famille. Et toi ?"}]},"A2-4":{"intro":"L4_a2_intro","n":6,"dlg":"L4_a2_dlg","fin":"Lesson 4","dd":[["Je me lève à sept heures.","Je me lève…"],["Ma sœur se brosse les dents, puis elle part.","Ma sœur se…"],["Nous nous couchons tard le week-end.","Nous nous couchons…"],["Oui, nous nous retrouvons chaque samedi. Et toi ?","Oui, nous nous…"]],"steps":[{"a":"L4_a2_s1","t":"Je me lève à sept heures."},{"a":"L4_a2_s2","t":"Ma sœur se brosse les dents, puis elle part."},{"a":"L4_a2_s3","t":"Nous nous couchons tard le week-end."},{"a":"L4_a2_s4","t":"Oui, nous nous retrouvons chaque samedi. Et toi ?"},{"a":"L4_a2_q1","t":"Ma sœur se brosse les dents, puis elle part."},{"a":"L4_a2_q2","t":"Oui, nous nous retrouvons chaque samedi. Et toi ?"}]},"B1-4":{"intro":"L4_b1_intro","n":6,"dlg":"L4_b1_dlg","fin":"Lesson 4","dd":[["Je suis tout à fait d'accord avec vous.","Je suis tout…"],["Je ne suis pas convaincu par cet argument.","Je ne suis…"],["Vous avez raison sur ce point.","Vous avez raison…"],["Je vois les choses autrement. Qu'en pensez-vous ?","Je vois les…"]],"steps":[{"a":"L4_b1_s1","t":"Je suis tout à fait d'accord avec vous."},{"a":"L4_b1_s2","t":"Je ne suis pas convaincu par cet argument."},{"a":"L4_b1_s3","t":"Vous avez raison sur ce point."},{"a":"L4_b1_s4","t":"Je vois les choses autrement. Qu'en pensez-vous ?"},{"a":"L4_b1_q1","t":"Je ne suis pas convaincu par cet argument."},{"a":"L4_b1_q2","t":"Je vois les choses autrement. Qu'en pensez-vous ?"}]},"B2-4":{"intro":"L4_b2_intro","n":6,"dlg":"L4_b2_dlg","fin":"Lesson 4","dd":[["Je suis sûr qu'il viendra.","Je suis sûr…"],["Je doute qu'elle vienne.","Je doute qu'elle…"],["Il est certain qu'elle a raison.","Il est certain…"],["Il se peut que ce soit vrai. Et vous ?","Il se peut…"]],"steps":[{"a":"L4_b2_s1","t":"Je suis sûr qu'il viendra."},{"a":"L4_b2_s2","t":"Je doute qu'elle vienne."},{"a":"L4_b2_s3","t":"Il est certain qu'elle a raison."},{"a":"L4_b2_s4","t":"Il se peut que ce soit vrai. Et vous ?"},{"a":"L4_b2_q1","t":"Je doute qu'elle vienne."},{"a":"L4_b2_q2","t":"Il se peut que ce soit vrai. Et vous ?"}]},"C1-4":{"intro":"L4_c1_intro","n":6,"dlg":"L4_c1_dlg","fin":"Lesson 4","dd":[["Cela dit, il faut reconnaître ses qualités.","Cela dit, il…"],["Dans une certaine mesure, je suis d'accord.","Dans une certaine…"],["Il serait injuste de généraliser.","Il serait injuste…"],["Ce n'est pas tout à fait faux, mais c'est incomplet. Qu'en dites-vous ?","Ce n'est pas…"]],"steps":[{"a":"L4_c1_s1","t":"Cela dit, il faut reconnaître ses qualités."},{"a":"L4_c1_s2","t":"Dans une certaine mesure, je suis d'accord."},{"a":"L4_c1_s3","t":"Il serait injuste de généraliser."},{"a":"L4_c1_s4","t":"Ce n'est pas tout à fait faux, mais c'est incomplet. Qu'en dites-vous ?"},{"a":"L4_c1_q1","t":"Dans une certaine mesure, je suis d'accord."},{"a":"L4_c1_q2","t":"Ce n'est pas tout à fait faux, mais c'est incomplet. Qu'en dites-vous ?"}]},"C2-4":{"intro":"L4_c2_intro","n":6,"dlg":"L4_c2_dlg","fin":"Lesson 4","dd":[["Le narrateur adopte un ton ironique.","Le narrateur adopte…"],["L'auteur y dénonce l'hypocrisie sociale.","L'auteur y dénonce…"],["Cette métaphore éclaire le sens du passage.","Cette métaphore éclaire…"],["Le dénouement bouleverse notre lecture du récit. Et toi ?","Le dénouement bouleverse…"]],"steps":[{"a":"L4_c2_s1","t":"Le narrateur adopte un ton ironique."},{"a":"L4_c2_s2","t":"L'auteur y dénonce l'hypocrisie sociale."},{"a":"L4_c2_s3","t":"Cette métaphore éclaire le sens du passage."},{"a":"L4_c2_s4","t":"Le dénouement bouleverse notre lecture du récit. Et toi ?"},{"a":"L4_c2_q1","t":"L'auteur y dénonce l'hypocrisie sociale."},{"a":"L4_c2_q2","t":"Le dénouement bouleverse notre lecture du récit. Et toi ?"}]},"A1-5":{"intro":"L5_a1_intro","n":6,"dlg":"L5_a1_dlg","fin":"Lesson 5","dd":[["Qu'est-ce que vous avez comme boissons ?","Qu'est-ce que vous…"],["Je voudrais un café, s'il vous plaît.","Je voudrais un…"],["Oui, un croissant, s'il vous plaît.","Oui, un croissant,…"],["Oui. L'addition, s'il vous plaît.","Oui. L'addition, s'il…"]],"steps":[{"a":"L5_a1_s1","t":"Qu'est-ce que vous avez comme boissons ?"},{"a":"L5_a1_s2","t":"Je voudrais un café, s'il vous plaît."},{"a":"L5_a1_s3","t":"Oui, un croissant, s'il vous plaît."},{"a":"L5_a1_s4","t":"Oui. L'addition, s'il vous plaît."},{"a":"L5_a1_q1","t":"Je voudrais un café, s'il vous plaît."},{"a":"L5_a1_q2","t":"Oui. L'addition, s'il vous plaît."}]},"A2-5":{"intro":"L5_a2_intro","n":6,"dlg":"L5_a2_dlg","fin":"Lesson 5","dd":[["Je vais organiser une fête samedi.","Je vais organiser…"],["Bien sûr ! Tu vas venir avec nous ?","Bien sûr !…"],["On se retrouve à huit heures.","On se retrouve…"],["Moi, je vais apporter un gâteau. Et toi ?","Moi, je vais…"]],"steps":[{"a":"L5_a2_s1","t":"Je vais organiser une fête samedi."},{"a":"L5_a2_s2","t":"Bien sûr ! Tu vas venir avec nous ?"},{"a":"L5_a2_s3","t":"On se retrouve à huit heures."},{"a":"L5_a2_s4","t":"Moi, je vais apporter un gâteau. Et toi ?"},{"a":"L5_a2_q1","t":"Bien sûr ! Tu vas venir avec nous ?"},{"a":"L5_a2_q2","t":"Moi, je vais apporter un gâteau. Et toi ?"}]},"B1-5":{"intro":"L5_b1_intro","n":6,"dlg":"L5_b1_dlg","fin":"Lesson 5","dd":[["À ta place, je partirais plus tôt.","À ta place,…"],["Tu devrais en parler à ton chef.","Tu devrais en…"],["Je te conseille de prendre un rendez-vous.","Je te conseille…"],["Pourquoi ne pas essayer autre chose ?","Pourquoi ne pas…"]],"steps":[{"a":"L5_b1_s1","t":"À ta place, je partirais plus tôt."},{"a":"L5_b1_s2","t":"Tu devrais en parler à ton chef."},{"a":"L5_b1_s3","t":"Je te conseille de prendre un rendez-vous."},{"a":"L5_b1_s4","t":"Pourquoi ne pas essayer autre chose ?"},{"a":"L5_b1_q1","t":"Tu devrais en parler à ton chef."},{"a":"L5_b1_q2","t":"Pourquoi ne pas essayer autre chose ?"}]},"B2-5":{"intro":"L5_b2_intro","n":6,"dlg":"L5_b2_dlg","fin":"Lesson 5","dd":[["Si j'avais plus de temps, je voyagerais davantage.","Si j'avais plus…"],["Si j'étais à ta place, j'accepterais.","Si j'étais à…"],["Sans cet imprévu, nous aurions fini hier.","Sans cet imprévu,…"],["J'aurais aimé t'aider davantage. Et toi ?","J'aurais aimé t'aider…"]],"steps":[{"a":"L5_b2_s1","t":"Si j'avais plus de temps, je voyagerais davantage."},{"a":"L5_b2_s2","t":"Si j'étais à ta place, j'accepterais."},{"a":"L5_b2_s3","t":"Sans cet imprévu, nous aurions fini hier."},{"a":"L5_b2_s4","t":"J'aurais aimé t'aider davantage. Et toi ?"},{"a":"L5_b2_q1","t":"Si j'étais à ta place, j'accepterais."},{"a":"L5_b2_q2","t":"J'aurais aimé t'aider davantage. Et toi ?"}]},"C1-5":{"intro":"L5_c1_intro","n":6,"dlg":"L5_c1_dlg","fin":"Lesson 5","dd":[["En résumé, nous retenons trois points.","En résumé, nous…"],["Pour faire court, le projet avance bien.","Pour faire court,…"],["Autrement dit, il faut décider avant vendredi.","Autrement dit, il…"],["Ce qu'il faut retenir, c'est que le budget reste inchangé.","Ce qu'il faut…"]],"steps":[{"a":"L5_c1_s1","t":"En résumé, nous retenons trois points."},{"a":"L5_c1_s2","t":"Pour faire court, le projet avance bien."},{"a":"L5_c1_s3","t":"Autrement dit, il faut décider avant vendredi."},{"a":"L5_c1_s4","t":"Ce qu'il faut retenir, c'est que le budget reste inchangé."},{"a":"L5_c1_q1","t":"Pour faire court, le projet avance bien."},{"a":"L5_c1_q2","t":"Ce qu'il faut retenir, c'est que le budget reste inchangé."}]},"C2-5":{"intro":"L5_c2_intro","n":6,"dlg":"L5_c2_dlg","fin":"Lesson 5","dd":[["Auriez-vous l'amabilité de me transmettre ce document ?","Auriez-vous l'amabilité de…"],["Tu peux m'envoyer ça quand tu as une minute ?","Tu peux m'envoyer…"],["Envoie-moi ça dès que possible.","Envoie-moi ça dès…"],["Il va sans dire que je reste à votre disposition.","Il va sans…"]],"steps":[{"a":"L5_c2_s1","t":"Auriez-vous l'amabilité de me transmettre ce document ?"},{"a":"L5_c2_s2","t":"Tu peux m'envoyer ça quand tu as une minute ?"},{"a":"L5_c2_s3","t":"Envoie-moi ça dès que possible."},{"a":"L5_c2_s4","t":"Il va sans dire que je reste à votre disposition."},{"a":"L5_c2_q1","t":"Tu peux m'envoyer ça quand tu as une minute ?"},{"a":"L5_c2_q2","t":"Il va sans dire que je reste à votre disposition."}]},"A1-7":{"intro":"L7_a1_intro","n":6,"dlg":"L7_a1_dlg","fin":"Lesson 7","dd":[["Je voudrais des pommes, s'il vous plaît.","Je voudrais des…"],["Un kilo, s'il vous plaît.","Un kilo, s'il…"],["C'est combien, les oranges ?","C'est combien, les…"],["D'accord, j'en prends un kilo. Voilà dix euros.","D'accord, j'en prends…"]],"steps":[{"a":"L7_a1_s1","t":"Je voudrais des pommes, s'il vous plaît."},{"a":"L7_a1_s2","t":"Un kilo, s'il vous plaît."},{"a":"L7_a1_s3","t":"C'est combien, les oranges ?"},{"a":"L7_a1_s4","t":"D'accord, j'en prends un kilo. Voilà dix euros."},{"a":"L7_a1_q1","t":"Un kilo, s'il vous plaît."},{"a":"L7_a1_q2","t":"D'accord, j'en prends un kilo. Voilà dix euros."}]},"A1-8":{"intro":"L8_a1_intro","n":6,"dlg":"L8_a1_dlg","fin":"Lesson 8","dd":[["Excusez-moi, où est la gare, s'il vous plaît ?","Excusez-moi, où est…"],["C'est loin d'ici ?","C'est loin d'ici…"],["Merci beaucoup. C'est à droite ?","Merci beaucoup. C'est…"],["Très bien, merci. Bonne journée !","Très bien, merci.…"]],"steps":[{"a":"L8_a1_s1","t":"Excusez-moi, où est la gare, s'il vous plaît ?"},{"a":"L8_a1_s2","t":"C'est loin d'ici ?"},{"a":"L8_a1_s3","t":"Merci beaucoup. C'est à droite ?"},{"a":"L8_a1_s4","t":"Très bien, merci. Bonne journée !"},{"a":"L8_a1_q1","t":"C'est loin d'ici ?"},{"a":"L8_a1_q2","t":"Très bien, merci. Bonne journée !"}]},"A1-9":{"intro":"L9_a1_intro","n":6,"dlg":"L9_a1_dlg","fin":"Lesson 9","dd":[["Bonjour. Je voudrais un rendez-vous, s'il vous plaît.","Bonjour. Je voudrais…"],["Jeudi, si possible.","Jeudi, si possible."],["À dix heures, s'il vous plaît.","À dix heures,…"],["C'est au nom de Lucas. Merci !","C'est au nom…"]],"steps":[{"a":"L9_a1_s1","t":"Bonjour. Je voudrais un rendez-vous, s'il vous plaît."},{"a":"L9_a1_s2","t":"Jeudi, si possible."},{"a":"L9_a1_s3","t":"À dix heures, s'il vous plaît."},{"a":"L9_a1_s4","t":"C'est au nom de Lucas. Merci !"},{"a":"L9_a1_q1","t":"Jeudi, si possible."},{"a":"L9_a1_q2","t":"C'est au nom de Lucas. Merci !"}]},"A1-10":{"intro":"L10_a1_intro","n":6,"dlg":"L10_a1_dlg","fin":"Lesson 10","dd":[["J'aime la musique et le sport.","J'aime la musique…"],["Oui, je joue de la guitare.","Oui, je joue…"],["Le week-end, je fais du vélo.","Le week-end, je…"],["Moi aussi, j'aime beaucoup le cinéma.","Moi aussi, j'aime…"]],"steps":[{"a":"L10_a1_s1","t":"J'aime la musique et le sport."},{"a":"L10_a1_s2","t":"Oui, je joue de la guitare."},{"a":"L10_a1_s3","t":"Le week-end, je fais du vélo."},{"a":"L10_a1_s4","t":"Moi aussi, j'aime beaucoup le cinéma."},{"a":"L10_a1_q1","t":"Oui, je joue de la guitare."},{"a":"L10_a1_q2","t":"Moi aussi, j'aime beaucoup le cinéma."}]},"A1-11":{"intro":"L11_a1_intro","n":6,"dlg":"L11_a1_dlg","fin":"Lesson 11","dd":[["Non, je ne vais pas bien.","Non, je ne…"],["J'ai mal à la tête.","J'ai mal à…"],["Depuis hier.","Depuis hier."],["Non, mais je suis très fatigué.","Non, mais je…"]],"steps":[{"a":"L11_a1_s1","t":"Non, je ne vais pas bien."},{"a":"L11_a1_s2","t":"J'ai mal à la tête."},{"a":"L11_a1_s3","t":"Depuis hier."},{"a":"L11_a1_s4","t":"Non, mais je suis très fatigué."},{"a":"L11_a1_q1","t":"J'ai mal à la tête."},{"a":"L11_a1_q2","t":"Non, mais je suis très fatigué."}]},"A2-7":{"intro":"L7_a2_intro","n":6,"dlg":"L7_a2_dlg","fin":"Lesson 7","dd":[["Je voudrais un billet pour Paris, s'il vous plaît.","Je voudrais un…"],["Un aller-retour, pour demain matin.","Un aller-retour, pour…"],["Il part de quel quai ?","Il part de…"],["Merci. Je peux payer par carte ?","Merci. Je peux…"]],"steps":[{"a":"L7_a2_s1","t":"Je voudrais un billet pour Paris, s'il vous plaît."},{"a":"L7_a2_s2","t":"Un aller-retour, pour demain matin."},{"a":"L7_a2_s3","t":"Il part de quel quai ?"},{"a":"L7_a2_s4","t":"Merci. Je peux payer par carte ?"},{"a":"L7_a2_q1","t":"Un aller-retour, pour demain matin."},{"a":"L7_a2_q2","t":"Merci. Je peux payer par carte ?"}]},"A2-8":{"intro":"L8_a2_intro","n":6,"dlg":"L8_a2_dlg","fin":"Lesson 8","dd":[["Oui, je cherche une veste noire.","Oui, je cherche…"],["Je fais du quarante. Je peux l'essayer ?","Je fais du…"],["Elle est un peu grande. Vous avez la taille en dessous ?","Elle est un…"],["Je la prends. Elle coûte combien ?","Je la prends.…"]],"steps":[{"a":"L8_a2_s1","t":"Oui, je cherche une veste noire."},{"a":"L8_a2_s2","t":"Je fais du quarante. Je peux l'essayer ?"},{"a":"L8_a2_s3","t":"Elle est un peu grande. Vous avez la taille en dessous ?"},{"a":"L8_a2_s4","t":"Je la prends. Elle coûte combien ?"},{"a":"L8_a2_q1","t":"Je fais du quarante. Je peux l'essayer ?"},{"a":"L8_a2_q2","t":"Je la prends. Elle coûte combien ?"}]},"A2-9":{"intro":"L9_a2_intro","n":6,"dlg":"L9_a2_dlg","fin":"Lesson 9","dd":[["Depuis trois jours, j'ai mal à la gorge.","Depuis trois jours,…"],["Oui, hier soir, j'avais trente-neuf de fièvre.","Oui, hier soir,…"],["J'ai pris du paracétamol, mais ça ne passe pas.","J'ai pris du…"],["Merci. Je dois rester au lit ?","Merci. Je dois…"]],"steps":[{"a":"L9_a2_s1","t":"Depuis trois jours, j'ai mal à la gorge."},{"a":"L9_a2_s2","t":"Oui, hier soir, j'avais trente-neuf de fièvre."},{"a":"L9_a2_s3","t":"J'ai pris du paracétamol, mais ça ne passe pas."},{"a":"L9_a2_s4","t":"Merci. Je dois rester au lit ?"},{"a":"L9_a2_q1","t":"Oui, hier soir, j'avais trente-neuf de fièvre."},{"a":"L9_a2_q2","t":"Merci. Je dois rester au lit ?"}]},"A2-10":{"intro":"L10_a2_intro","n":6,"dlg":"L10_a2_dlg","fin":"Lesson 10","dd":[["Oui, je vais partir en Espagne.","Oui, je vais…"],["Je vais prendre l'avion avec ma sœur.","Je vais prendre…"],["Nous allons rester deux semaines.","Nous allons rester…"],["Nous allons visiter Madrid et aller à la plage.","Nous allons visiter…"]],"steps":[{"a":"L10_a2_s1","t":"Oui, je vais partir en Espagne."},{"a":"L10_a2_s2","t":"Je vais prendre l'avion avec ma sœur."},{"a":"L10_a2_s3","t":"Nous allons rester deux semaines."},{"a":"L10_a2_s4","t":"Nous allons visiter Madrid et aller à la plage."},{"a":"L10_a2_q1","t":"Je vais prendre l'avion avec ma sœur."},{"a":"L10_a2_q2","t":"Nous allons visiter Madrid et aller à la plage."}]},"A2-11":{"intro":"L11_a2_intro","n":6,"dlg":"L11_a2_dlg","fin":"Lesson 11","dd":[["Je travaille dans une banque.","Je travaille dans…"],["Ça fait cinq ans que je travaille là.","Ça fait cinq…"],["Oui, j'aime mon équipe, mais je finis tard.","Oui, j'aime mon…"],["Avant, j'étais professeur dans une école.","Avant, j'étais professeur…"]],"steps":[{"a":"L11_a2_s1","t":"Je travaille dans une banque."},{"a":"L11_a2_s2","t":"Ça fait cinq ans que je travaille là."},{"a":"L11_a2_s3","t":"Oui, j'aime mon équipe, mais je finis tard."},{"a":"L11_a2_s4","t":"Avant, j'étais professeur dans une école."},{"a":"L11_a2_q1","t":"Ça fait cinq ans que je travaille là."},{"a":"L11_a2_q2","t":"Avant, j'étais professeur dans une école."}]},"B1-7":{"intro":"L7_b1_intro","n":6,"dlg":"L7_b1_dlg","fin":"Lesson 7","dd":[["Excusez-moi, il y a un problème avec ma chambre.","Excusez-moi, il y…"],["Elle n'est pas propre, et il fait très froid.","Elle n'est pas…"],["Pourriez-vous nous changer de chambre, s'il vous plaît ?","Pourriez-vous nous changer…"],["Je comprends, mais j'espère que ce sera rapide. Merci.","Je comprends, mais…"]],"steps":[{"a":"L7_b1_s1","t":"Excusez-moi, il y a un problème avec ma chambre."},{"a":"L7_b1_s2","t":"Elle n'est pas propre, et il fait très froid."},{"a":"L7_b1_s3","t":"Pourriez-vous nous changer de chambre, s'il vous plaît ?"},{"a":"L7_b1_s4","t":"Je comprends, mais j'espère que ce sera rapide. Merci."},{"a":"L7_b1_q1","t":"Elle n'est pas propre, et il fait très froid."},{"a":"L7_b1_q2","t":"Je comprends, mais j'espère que ce sera rapide. Merci."}]},"B1-8":{"intro":"L8_b1_intro","n":6,"dlg":"L8_b1_dlg","fin":"Lesson 8","dd":[["Je m'appelle Léa, et j'ai trois ans d'expérience en marketing.","Je m'appelle Léa,…"],["Parce que votre entreprise est innovante, et que j'aime les défis.","Parce que votre…"],["Je suis organisée, et je travaille bien en équipe.","Je suis organisée,…"],["Parfois, je suis trop perfectionniste, mais j'apprends à déléguer.","Parfois, je suis…"]],"steps":[{"a":"L8_b1_s1","t":"Je m'appelle Léa, et j'ai trois ans d'expérience en marketing."},{"a":"L8_b1_s2","t":"Parce que votre entreprise est innovante, et que j'aime les défis."},{"a":"L8_b1_s3","t":"Je suis organisée, et je travaille bien en équipe."},{"a":"L8_b1_s4","t":"Parfois, je suis trop perfectionniste, mais j'apprends à déléguer."},{"a":"L8_b1_q1","t":"Parce que votre entreprise est innovante, et que j'aime les défis."},{"a":"L8_b1_q2","t":"Parfois, je suis trop perfectionniste, mais j'apprends à déléguer."}]},"B1-9":{"intro":"L9_b1_intro","n":6,"dlg":"L9_b1_dlg","fin":"Lesson 9","dd":[["C'était magnifique : nous avons visité Marrakech.","C'était magnifique :…"],["Nous y sommes restés une semaine, et il faisait très chaud.","Nous y sommes…"],["Ce qui m'a le plus plu, c'est le marché et la cuisine.","Ce qui m'a…"],["Oui, j'y retournerais volontiers. Et toi, tu as voyagé cet été ?","Oui, j'y retournerais…"]],"steps":[{"a":"L9_b1_s1","t":"C'était magnifique : nous avons visité Marrakech."},{"a":"L9_b1_s2","t":"Nous y sommes restés une semaine, et il faisait très chaud."},{"a":"L9_b1_s3","t":"Ce qui m'a le plus plu, c'est le marché et la cuisine."},{"a":"L9_b1_s4","t":"Oui, j'y retournerais volontiers. Et toi, tu as voyagé cet été ?"},{"a":"L9_b1_q1","t":"Nous y sommes restés une semaine, et il faisait très chaud."},{"a":"L9_b1_q2","t":"Oui, j'y retournerais volontiers. Et toi, tu as voyagé cet été ?"}]},"B1-10":{"intro":"L10_b1_intro","n":6,"dlg":"L10_b1_dlg","fin":"Lesson 10","dd":[["D'abord, tu fais fondre le chocolat avec le beurre.","D'abord, tu fais…"],["Ensuite, tu ajoutes les œufs et le sucre.","Ensuite, tu ajoutes…"],["Puis tu mélanges bien, sans faire de grumeaux.","Puis tu mélanges…"],["Tu le laisses cuire vingt minutes, et c'est prêt !","Tu le laisses…"]],"steps":[{"a":"L10_b1_s1","t":"D'abord, tu fais fondre le chocolat avec le beurre."},{"a":"L10_b1_s2","t":"Ensuite, tu ajoutes les œufs et le sucre."},{"a":"L10_b1_s3","t":"Puis tu mélanges bien, sans faire de grumeaux."},{"a":"L10_b1_s4","t":"Tu le laisses cuire vingt minutes, et c'est prêt !"},{"a":"L10_b1_q1","t":"Ensuite, tu ajoutes les œufs et le sucre."},{"a":"L10_b1_q2","t":"Tu le laisses cuire vingt minutes, et c'est prêt !"}]},"B1-11":{"intro":"L11_b1_intro","n":6,"dlg":"L11_b1_dlg","fin":"Lesson 11","dd":[["Dans cinq ans, j'habiterai à l'étranger.","Dans cinq ans,…"],["Je travaillerai dans l'éducation, je l'espère.","Je travaillerai dans…"],["Si j'avais plus d'argent, j'ouvrirais une école.","Si j'avais plus…"],["J'aimerais vivre au bord de la mer. Et toi ?","J'aimerais vivre au…"]],"steps":[{"a":"L11_b1_s1","t":"Dans cinq ans, j'habiterai à l'étranger."},{"a":"L11_b1_s2","t":"Je travaillerai dans l'éducation, je l'espère."},{"a":"L11_b1_s3","t":"Si j'avais plus d'argent, j'ouvrirais une école."},{"a":"L11_b1_s4","t":"J'aimerais vivre au bord de la mer. Et toi ?"},{"a":"L11_b1_q1","t":"Je travaillerai dans l'éducation, je l'espère."},{"a":"L11_b1_q2","t":"J'aimerais vivre au bord de la mer. Et toi ?"}]},"B2-7":{"intro":"L7_b2_intro","n":6,"dlg":"L7_b2_dlg","fin":"Lesson 7","dd":[["Je vous remercie, mais cela dépasse notre budget.","Je vous remercie,…"],["Nous pourrions accepter huit mille euros, à condition de payer en deux fois.","Nous pourrions accepter…"],["En contrepartie, nous nous engageons à signer pour deux ans.","En contrepartie, nous…"],["Alors, je suggère que nous nous retrouvions à neuf mille euros. Qu'en pensez-vous ?","Alors, je suggère…"]],"steps":[{"a":"L7_b2_s1","t":"Je vous remercie, mais cela dépasse notre budget."},{"a":"L7_b2_s2","t":"Nous pourrions accepter huit mille euros, à condition de payer en deux fois."},{"a":"L7_b2_s3","t":"En contrepartie, nous nous engageons à signer pour deux ans."},{"a":"L7_b2_s4","t":"Alors, je suggère que nous nous retrouvions à neuf mille euros. Qu'en pensez-vous ?"},{"a":"L7_b2_q1","t":"Nous pourrions accepter huit mille euros, à condition de payer en deux fois."},{"a":"L7_b2_q2","t":"Alors, je suggère que nous nous retrouvions à neuf mille euros. Qu'en pensez-vous ?"}]},"B2-8":{"intro":"L8_b2_intro","n":6,"dlg":"L8_b2_dlg","fin":"Lesson 8","dd":[["À mon sens, il faudrait au moins les limiter.","À mon sens,…"],["Parce que la pollution met en danger la santé des habitants.","Parce que la…"],["Certes, mais les villes piétonnes attirent aussi plus de clients.","Certes, mais les…"],["Il suffirait de développer les transports en commun. Qu'en pensez-vous ?","Il suffirait de…"]],"steps":[{"a":"L8_b2_s1","t":"À mon sens, il faudrait au moins les limiter."},{"a":"L8_b2_s2","t":"Parce que la pollution met en danger la santé des habitants."},{"a":"L8_b2_s3","t":"Certes, mais les villes piétonnes attirent aussi plus de clients."},{"a":"L8_b2_s4","t":"Il suffirait de développer les transports en commun. Qu'en pensez-vous ?"},{"a":"L8_b2_q1","t":"Parce que la pollution met en danger la santé des habitants."},{"a":"L8_b2_q2","t":"Il suffirait de développer les transports en commun. Qu'en pensez-vous ?"}]},"B2-9":{"intro":"L9_b2_intro","n":6,"dlg":"L9_b2_dlg","fin":"Lesson 9","dd":[["Il a dit qu'il était mécontent du retard.","Il a dit…"],["Il a demandé si nous pouvions livrer demain.","Il a demandé…"],["Il m'a expliqué qu'il ne paierait pas plus.","Il m'a expliqué…"],["Il m'a dit qu'il hésitait encore. Que dois-je répondre ?","Il m'a dit…"]],"steps":[{"a":"L9_b2_s1","t":"Il a dit qu'il était mécontent du retard."},{"a":"L9_b2_s2","t":"Il a demandé si nous pouvions livrer demain."},{"a":"L9_b2_s3","t":"Il m'a expliqué qu'il ne paierait pas plus."},{"a":"L9_b2_s4","t":"Il m'a dit qu'il hésitait encore. Que dois-je répondre ?"},{"a":"L9_b2_q1","t":"Il a demandé si nous pouvions livrer demain."},{"a":"L9_b2_q2","t":"Il m'a dit qu'il hésitait encore. Que dois-je répondre ?"}]},"B2-10":{"intro":"L10_b2_intro","n":6,"dlg":"L10_b2_dlg","fin":"Lesson 10","dd":[["À cause d'un problème technique, nous avons perdu une semaine.","À cause d'un…"],["Par conséquent, le client a reporté la livraison.","Par conséquent, le…"],["Comme le serveur est tombé en panne, tout s'est arrêté.","Comme le serveur…"],["Grâce à l'équipe, nous avons rattrapé le temps perdu. Et vous ?","Grâce à l'équipe,…"]],"steps":[{"a":"L10_b2_s1","t":"À cause d'un problème technique, nous avons perdu une semaine."},{"a":"L10_b2_s2","t":"Par conséquent, le client a reporté la livraison."},{"a":"L10_b2_s3","t":"Comme le serveur est tombé en panne, tout s'est arrêté."},{"a":"L10_b2_s4","t":"Grâce à l'équipe, nous avons rattrapé le temps perdu. Et vous ?"},{"a":"L10_b2_q1","t":"Par conséquent, le client a reporté la livraison."},{"a":"L10_b2_q2","t":"Grâce à l'équipe, nous avons rattrapé le temps perdu. Et vous ?"}]},"B2-11":{"intro":"L11_b2_intro","n":6,"dlg":"L11_b2_dlg","fin":"Lesson 11","dd":[["Notre projet consiste à créer une application d'apprentissage du français.","Notre projet consiste…"],["Elle s'adresse aux adultes qui veulent parler avec confiance.","Elle s'adresse aux…"],["Son principal atout est qu'on s'entraîne à parler dès la première leçon.","Son principal atout…"],["Nous prévoyons un lancement dans six mois. Avez-vous des questions ?","Nous prévoyons un…"]],"steps":[{"a":"L11_b2_s1","t":"Notre projet consiste à créer une application d'apprentissage du français."},{"a":"L11_b2_s2","t":"Elle s'adresse aux adultes qui veulent parler avec confiance."},{"a":"L11_b2_s3","t":"Son principal atout est qu'on s'entraîne à parler dès la première leçon."},{"a":"L11_b2_s4","t":"Nous prévoyons un lancement dans six mois. Avez-vous des questions ?"},{"a":"L11_b2_q1","t":"Elle s'adresse aux adultes qui veulent parler avec confiance."},{"a":"L11_b2_q2","t":"Nous prévoyons un lancement dans six mois. Avez-vous des questions ?"}]},"C1-7":{"intro":"L7_c1_intro","n":6,"dlg":"L7_c1_dlg","fin":"Lesson 7","dd":[["Je comprends votre inquiétude, mais permettez-moi de n'être pas tout à fait de cet avis.","Je comprends votre…"],["Sur le fait que les premiers résultats sont plutôt encourageants.","Sur le fait…"],["Sans doute, mais il serait prématuré de conclure à l'échec.","Sans doute, mais…"],["Je suggérerais de nous accorder trois mois supplémentaires. Qu'en pensez-vous ?","Je suggérerais de…"]],"steps":[{"a":"L7_c1_s1","t":"Je comprends votre inquiétude, mais permettez-moi de n'être pas tout à fait de cet avis."},{"a":"L7_c1_s2","t":"Sur le fait que les premiers résultats sont plutôt encourageants."},{"a":"L7_c1_s3","t":"Sans doute, mais il serait prématuré de conclure à l'échec."},{"a":"L7_c1_s4","t":"Je suggérerais de nous accorder trois mois supplémentaires. Qu'en pensez-vous ?"},{"a":"L7_c1_q1","t":"Sur le fait que les premiers résultats sont plutôt encourageants."},{"a":"L7_c1_q2","t":"Je suggérerais de nous accorder trois mois supplémentaires. Qu'en pensez-vous ?"}]},"C1-8":{"intro":"L8_c1_intro","n":6,"dlg":"L8_c1_dlg","fin":"Lesson 8","dd":[["Parce que nous répondons à un besoin que personne n'a encore comblé.","Parce que nous…"],["Les chiffres parlent d'eux-mêmes : nos ventes ont doublé en un an.","Les chiffres parlent…"],["Je ne le nie pas, mais c'est précisément ce qui rend l'opportunité unique.","Je ne le…"],["Vous gagneriez une part d'un marché en pleine expansion. Souhaitez-vous en discuter ?","Vous gagneriez une…"]],"steps":[{"a":"L8_c1_s1","t":"Parce que nous répondons à un besoin que personne n'a encore comblé."},{"a":"L8_c1_s2","t":"Les chiffres parlent d'eux-mêmes : nos ventes ont doublé en un an."},{"a":"L8_c1_s3","t":"Je ne le nie pas, mais c'est précisément ce qui rend l'opportunité unique."},{"a":"L8_c1_s4","t":"Vous gagneriez une part d'un marché en pleine expansion. Souhaitez-vous en discuter ?"},{"a":"L8_c1_q1","t":"Les chiffres parlent d'eux-mêmes : nos ventes ont doublé en un an."},{"a":"L8_c1_q2","t":"Vous gagneriez une part d'un marché en pleine expansion. Souhaitez-vous en discuter ?"}]},"C1-9":{"intro":"L9_c1_intro","n":6,"dlg":"L9_c1_dlg","fin":"Lesson 9","dd":[["Il s'agit d'un contrat dont les clauses n'ont jamais été respectées.","Il s'agit d'un…"],["L'entreprise avec laquelle nous avions signé, et dont le directeur a démissionné.","L'entreprise avec laquelle…"],["Ce que j'attends, c'est que vous évaluiez nos chances de recours.","Ce que j'attends,…"],["Oui, les courriels auxquels je me réfère sont dans ce dossier. Cela suffira-t-il ?","Oui, les courriels…"]],"steps":[{"a":"L9_c1_s1","t":"Il s'agit d'un contrat dont les clauses n'ont jamais été respectées."},{"a":"L9_c1_s2","t":"L'entreprise avec laquelle nous avions signé, et dont le directeur a démissionné."},{"a":"L9_c1_s3","t":"Ce que j'attends, c'est que vous évaluiez nos chances de recours."},{"a":"L9_c1_s4","t":"Oui, les courriels auxquels je me réfère sont dans ce dossier. Cela suffira-t-il ?"},{"a":"L9_c1_q1","t":"L'entreprise avec laquelle nous avions signé, et dont le directeur a démissionné."},{"a":"L9_c1_q2","t":"Oui, les courriels auxquels je me réfère sont dans ce dossier. Cela suffira-t-il ?"}]},"C1-10":{"intro":"L10_c1_intro","n":6,"dlg":"L10_c1_dlg","fin":"Lesson 10","dd":[["Passionnante, comme toujours : trois heures pour décider de la couleur d'un logo.","Passionnante, comme toujours…"],["Disons que nous n'avons pas reculé, ce qui est déjà un exploit.","Disons que nous…"],["Il avait surtout l'air de ne pas avoir écouté un mot.","Il avait surtout…"],["À peine : je dirais plutôt réaliste. Et toi, tu en as pensé quoi ?","À peine :…"]],"steps":[{"a":"L10_c1_s1","t":"Passionnante, comme toujours : trois heures pour décider de la couleur d'un logo."},{"a":"L10_c1_s2","t":"Disons que nous n'avons pas reculé, ce qui est déjà un exploit."},{"a":"L10_c1_s3","t":"Il avait surtout l'air de ne pas avoir écouté un mot."},{"a":"L10_c1_s4","t":"À peine : je dirais plutôt réaliste. Et toi, tu en as pensé quoi ?"},{"a":"L10_c1_q1","t":"Disons que nous n'avons pas reculé, ce qui est déjà un exploit."},{"a":"L10_c1_q2","t":"À peine : je dirais plutôt réaliste. Et toi, tu en as pensé quoi ?"}]},"C1-11":{"intro":"L11_c1_intro","n":6,"dlg":"L11_c1_dlg","fin":"Lesson 11","dd":[["Parce que le moment était venu de répondre à une attente légitime.","Parce que le…"],["Je ne partage pas cette analyse, et je suis prêt à en débattre.","Je ne partage…"],["Nous allons consolider ce qui fonctionne avant de nous étendre.","Nous allons consolider…"],["Nous en tirerions les leçons, comme nous l'avons toujours fait. Une autre question ?","Nous en tirerions…"]],"steps":[{"a":"L11_c1_s1","t":"Parce que le moment était venu de répondre à une attente légitime."},{"a":"L11_c1_s2","t":"Je ne partage pas cette analyse, et je suis prêt à en débattre."},{"a":"L11_c1_s3","t":"Nous allons consolider ce qui fonctionne avant de nous étendre."},{"a":"L11_c1_s4","t":"Nous en tirerions les leçons, comme nous l'avons toujours fait. Une autre question ?"},{"a":"L11_c1_q1","t":"Je ne partage pas cette analyse, et je suis prêt à en débattre."},{"a":"L11_c1_q2","t":"Nous en tirerions les leçons, comme nous l'avons toujours fait. Une autre question ?"}]},"C2-7":{"intro":"L7_c2_intro","n":6,"dlg":"L7_c2_dlg","fin":"Lesson 7","dd":[["Je me permets de solliciter un moment de votre attention.","Je me permets…"],["Il s'agirait, si cela ne vous importunait pas, d'un congé exceptionnel.","Il s'agirait, si…"],["Des circonstances familiales, que je préférerais ne pas détailler.","Des circonstances familiales,…"],["Si cela vous convenait, à compter de lundi. Je vous en serais infiniment reconnaissant.","Si cela vous…"]],"steps":[{"a":"L7_c2_s1","t":"Je me permets de solliciter un moment de votre attention."},{"a":"L7_c2_s2","t":"Il s'agirait, si cela ne vous importunait pas, d'un congé exceptionnel."},{"a":"L7_c2_s3","t":"Des circonstances familiales, que je préférerais ne pas détailler."},{"a":"L7_c2_s4","t":"Si cela vous convenait, à compter de lundi. Je vous en serais infiniment reconnaissant."},{"a":"L7_c2_q1","t":"Il s'agirait, si cela ne vous importunait pas, d'un congé exceptionnel."},{"a":"L7_c2_q2","t":"Si cela vous convenait, à compter de lundi. Je vous en serais infiniment reconnaissant."}]},"C2-8":{"intro":"L8_c2_intro","n":6,"dlg":"L8_c2_dlg","fin":"Lesson 8","dd":[["C'est avec une joie profonde que je prends la parole ce soir.","C'est avec une…"],["Que l'amour, à l'instar du bon vin, se bonifie avec le temps.","Que l'amour, à…"],["Puissent-ils connaître autant de bonheur qu'ils en donnent autour d'eux.","Puissent-ils connaître autant…"],["À Claire et à Julien, et à tous les lendemains qui chantent !","À Claire et…"]],"steps":[{"a":"L8_c2_s1","t":"C'est avec une joie profonde que je prends la parole ce soir."},{"a":"L8_c2_s2","t":"Que l'amour, à l'instar du bon vin, se bonifie avec le temps."},{"a":"L8_c2_s3","t":"Puissent-ils connaître autant de bonheur qu'ils en donnent autour d'eux."},{"a":"L8_c2_s4","t":"À Claire et à Julien, et à tous les lendemains qui chantent !"},{"a":"L8_c2_q1","t":"Que l'amour, à l'instar du bon vin, se bonifie avec le temps."},{"a":"L8_c2_q2","t":"À Claire et à Julien, et à tous les lendemains qui chantent !"}]},"C2-9":{"intro":"L9_c2_intro","n":6,"dlg":"L9_c2_dlg","fin":"Lesson 9","dd":[["Ne m'en parle pas, j'ai eu un trac fou, j'avais les jambes en coton.","Ne m'en parle…"],["Finalement oui : tout est bien qui finit bien.","Finalement oui :…"],["Pas encore, mais je ne vends pas la peau de l'ours avant de l'avoir tué.","Pas encore, mais…"],["Oui, qui vivra verra. En attendant, je t'offre un café.","Oui, qui vivra…"]],"steps":[{"a":"L9_c2_s1","t":"Ne m'en parle pas, j'ai eu un trac fou, j'avais les jambes en coton."},{"a":"L9_c2_s2","t":"Finalement oui : tout est bien qui finit bien."},{"a":"L9_c2_s3","t":"Pas encore, mais je ne vends pas la peau de l'ours avant de l'avoir tué."},{"a":"L9_c2_s4","t":"Oui, qui vivra verra. En attendant, je t'offre un café."},{"a":"L9_c2_q1","t":"Finalement oui : tout est bien qui finit bien."},{"a":"L9_c2_q2","t":"Oui, qui vivra verra. En attendant, je t'offre un café."}]},"C2-10":{"intro":"L10_c2_intro","n":6,"dlg":"L10_c2_dlg","fin":"Lesson 10","dd":[["Permettez-moi de ne pas vous suivre sur ce terrain.","Permettez-moi de ne…"],["Pesant, peut-être, mais c'est précisément ce poids qui fait sa singularité.","Pesant, peut-être, mais…"],["Je dirais plutôt qu'ils se dérobent, ce qui est une forme de profondeur.","Je dirais plutôt…"],["Disons que je lis avec lenteur, et que l'on finit par entendre ce que l'on croyait absent.","Disons que je…"]],"steps":[{"a":"L10_c2_s1","t":"Permettez-moi de ne pas vous suivre sur ce terrain."},{"a":"L10_c2_s2","t":"Pesant, peut-être, mais c'est précisément ce poids qui fait sa singularité."},{"a":"L10_c2_s3","t":"Je dirais plutôt qu'ils se dérobent, ce qui est une forme de profondeur."},{"a":"L10_c2_s4","t":"Disons que je lis avec lenteur, et que l'on finit par entendre ce que l'on croyait absent."},{"a":"L10_c2_q1","t":"Pesant, peut-être, mais c'est précisément ce poids qui fait sa singularité."},{"a":"L10_c2_q2","t":"Disons que je lis avec lenteur, et que l'on finit par entendre ce que l'on croyait absent."}]},"C2-11":{"intro":"L11_c2_intro","n":6,"dlg":"L11_c2_dlg","fin":"Lesson 11","dd":[["Grand-mère, mon train a eu du retard, mais ne t'inquiète pas.","Grand-mère, mon train…"],["Monsieur le directeur, un retard ferroviaire m'a empêché d'arriver à l'heure.","Monsieur le directeur,…"],["Mec, mon train est resté bloqué, j'ai cru que j'allais devenir fou.","Mec, mon train…"],["Précisément : la situation est identique, c'est le registre qui s'adapte à l'interlocuteur.","Précisément : la…"]],"steps":[{"a":"L11_c2_s1","t":"Grand-mère, mon train a eu du retard, mais ne t'inquiète pas."},{"a":"L11_c2_s2","t":"Monsieur le directeur, un retard ferroviaire m'a empêché d'arriver à l'heure."},{"a":"L11_c2_s3","t":"Mec, mon train est resté bloqué, j'ai cru que j'allais devenir fou."},{"a":"L11_c2_s4","t":"Précisément : la situation est identique, c'est le registre qui s'adapte à l'interlocuteur."},{"a":"L11_c2_q1","t":"Monsieur le directeur, un retard ferroviaire m'a empêché d'arriver à l'heure."},{"a":"L11_c2_q2","t":"Précisément : la situation est identique, c'est le registre qui s'adapte à l'interlocuteur."}]}};
function U(){var m=window.__psMeta||{};var c=UCFG[(m.level||'')+'-'+m.lesson];if(c&&!c._ld){c._ld=1;try{fetch('/assets/audio/lessons/'+c.dlg+'.json?v=3').then(function(r){return r.json();}).then(function(j){c.gaps=j.gaps;}).catch(function(){c._ld=0;});}catch(e){c._ld=0;}}return c||null;}
var L1P=[['Bonjour !'],['Bonsoir !'],['Salut !'],['Au revoir !'],['\u00c0 bient\u00f4t !']];
var L1D=[['Bonjour !','Bonjour'],['Salut !','Salut'],['Bonsoir !','Bonsoir'],['Au revoir !','Au revoir'],['\u00c0 bient\u00f4t !','\u00c0 bient\u00f4t']];
/* where the learner answers inside A0_TP_L1_dialogue.mp3 (seconds) */
var L1W=[[31.9,33.6],[34.95,37.0],[38.9,40.95],[42.9,44.95],[47.0,49.3]];
/* lesson 2 dialogue: one answer window inside A0_TP_L2_dialogue.mp3 */
var L2W=[[20.7,25.9]];
var L2D=[["Je m'appelle. Et toi, comment t'appelles-tu ?",'Je m\u2019appelle\u2026']];
var L3W=[[2.96,5.86],[6.44,8.90],[12.74,14.96],[19.00,20.68],[21.14,23.58]];
var L3D=[['Bonjour.','Bonjour\u2026'],['\u00c7a va bien.','\u00c7a va bien\u2026'],["Je m'appelle.",'Je m\u2019appelle\u2026'],['Au revoir.','Au revoir\u2026'],['\u00c0 bient\u00f4t.','\u00c0 bient\u00f4t\u2026']];
var L3P=["Comment \u00e7a va ?","\u00c7a va. \u00c7a va bien. \u00c7a va tr\u00e8s bien."];
function DW(){if(U())return U().gaps||[];return lessonNo()===3?L3W:lessonNo()===2?L2W:L1W;}
function DD(){if(U())return U().dd;return lessonNo()===3?L3D:lessonNo()===2?L2D:L1D;}
function dlgUrl(){if(U())return '/assets/audio/lessons/'+U().dlg+'.mp3?v=3';return lessonNo()===3?'/assets/audio/A0_TP_L3_dialogue.mp3?v=1':lessonNo()===2?'/assets/audio/A0_TP_L2_dialogue.mp3?v=':'/assets/audio/A0_TP_L1_dialogue.mp3?v=';}
function dlgIdx(){if(U())return U().steps.length;return lessonNo()===3?3:lessonNo()===2?L2P.length:5;}
function l1Key(){return 'psL1:'+(window.lsCurrentUid||'anon')+':'+(U()?((window.__psMeta||{}).level||'')+'-':'')+((window.__psMeta||{}).lesson||'');}
function l1Read(){try{return +localStorage.getItem(l1Key())||0;}catch(e){return 0;}}
function l1Write(n){try{if(n>0)localStorage.setItem(l1Key(),String(n));else localStorage.removeItem(l1Key());}catch(e){}}
function lessonNo(){return (window.__psMeta||{}).lesson;}
function isL1(){if(U())return true;var m=window.__psMeta||{};return m.level==='A0'&&(m.lesson===1||m.lesson===2||m.lesson===3);}
/* lesson 2: Je m'appelle (intro + four phrases; the dialogue step is added when its audio exists) */
var L2P=["Je m'appelle.","Je m'appelle.","Comment t'appelles-tu ? Je m'appelle.","Comment t'appelles-tu ? Je m'appelle. Et toi, comment t'appelles-tu ?"];
function introUrl(){if(U())return '/assets/audio/lessons/'+U().intro+'.mp3?v=3';return lessonNo()===3?'/assets/audio/A0_TP_L3_intro.mp3?v=1':lessonNo()===2?'/assets/audio/A0_TP_L2_intro.mp3?v=':'/assets/audio/A0_TP_L1_intro.mp3?v=';}
function lastStep(){if(U())return U().steps.length+1;return lessonNo()===3?4:lessonNo()===2?L2P.length+1:6;}
function advance(){if(window.__psAdv)window.__psAdv();else window.lsGoNext();}
function l1Show(i,ctx){
 L1.on=true;
 if(i>=lastStep()){l1Finish(ctx);return;}
 if(U()){var uc=U();if(i>=uc.steps.length&&!uc.gaps){T0(function(){l1Show(i,ctx);},250);return;}window.__psUI(9000+i,[i<uc.steps.length?{type:'text',recordPrompt:true,expectedText:'',_l1:i}:{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}],ctx);return;}
 if(lessonNo()===3&&i===2){window.__psListen={url:'/assets/audio/A0_TP_L3_dialogue_intro.mp3?v=1',next:3};window.__psSkipIntro=0;window.__psUI(9000+i,[{type:'text',text:' '}],ctx);return;}
 var b=lessonNo()===3?(i<2?[{type:'text',recordPrompt:true,expectedText:L3P[i],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}]):lessonNo()===2?(i<L2P.length?[{type:'text',recordPrompt:true,expectedText:L2P[i],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:i,_dlgAll:true}]):i<5?[{type:'text',recordPrompt:true,expectedText:L1P[i][0],_l1:i}]:[{type:'text',recordPrompt:true,expectedText:'',_l1:5,_dlgAll:true}];
 window.__psUI(9000+i,b,ctx);
}
function l1Finish(ctx){
 if(cleanup)cleanup();
 l1Write(0);rsWrite(0);
 try{var uid=window.lsCurrentUid,LV=window.__psLevel||'a0-tout-public';if(uid)fetch(ctx.api+'/api/levelProgressComplete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({uid:uid,level:LV,lesson:lessonNo()||1})}).catch(function(){});}catch(e){}
 var c=ensureCard(ctx.root);c.classList.add('fin');
 var p=swap(c,'<div class="pc-top"><div class="pc-hn">Lesson complete</div></div><div class="pc-mid"><div class="pc-fin">Bravo !<small>'+(U()?'You finished '+U().fin:(lessonNo()===3?'You finished Comment \u00e7a va ?':lessonNo()===2?'You finished Je m\u2019appelle':'You finished Les salutations'))+' \u2014 well done</small></div></div><div class="pc-bot"><button type="button" class="pc-go pc-back">Back to lessons</button><button type="button" class="pc-redo-l" style="display:block;width:100%;max-width:300px;margin:10px auto 0;padding:14px 20px;border-radius:999px;font:600 1rem Poppins,system-ui,sans-serif;cursor:pointer;border:1.5px solid rgba(255,214,140,.7);background:transparent;color:#ffd68c;">Redo lesson</button></div>');
 p.classList.add('pc-pr');
 window.__psAdv=function(){location.href='./';};
 p.querySelector('.pc-back').onclick=function(){location.href='./';};var rl=p.querySelector('.pc-redo-l');if(rl)rl.onclick=function(){rsWrite(0);l1Write(0);window.__psIntroUsed=1;l1Show(0,ctx);};
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
 var root=ctx.root,api=ctx.api;if(U()&&partNum<9000){blocks=[{type:'text',text:' '}];}
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

 
 /* ---------- LES PETITS DRILL: one long teacher track, mic open from the start, wave only moves in the child's turns ---------- */
 var UK=!kids()?(UDR[((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-'+partNum]||null):null,UQ=(!kids()&&!UK&&partNum>2&&UDR[((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-'+'2'])?'skip':null;
 var DK=kids()?KDR[lessonNo()+'-'+partNum]:(UK?'upper':UQ);
 if(DK==='skip'){T(function(){window.lsGoNext();},30);return true;}
 if(DK){
  var dn=UK?'/assets/audio/lessons/'+UK:'/assets/audio/lp/lesson'+lessonNo()+'_drill_'+DK;
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
    kRes.innerHTML='<div class="pc-fb"><div class="pc-msg">Je ne t\u2019entends pas<small>I couldn\u2019t hear you \u2014 turn the volume up or use headphones, then try again</small></div></div><div class="pc-acts"><button type="button" class="pc-rb pc-redo" aria-label="Try again">'+I.redo+'</button><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
    kRes.querySelector('.pc-redo').onclick=function(){window.__psUI(partNum,blocks,ctx);};
    kRes.querySelector('.pc-next').onclick=kNext;return;
   }
   var r=hits/Math.max(1,kGaps.length),n=r>=.5?3:(r>=.25?2:1),hh='';
   for(var q=0;q<3;q++)hh+='<span'+(q<n?'':' class="off"')+' style="animation-delay:'+(q*.18)+'s">\u2605</span>';
   kRes.innerHTML='<div class="pc-fb"><div class="pc-stars">'+hh+'</div><div class="pc-msg">'+(n===3?'Bravo !<small>You said it with me \u2014 super!</small>':(n===2?'Tr\u00e8s bien !<small>Very good \u2014 well done!</small>':'Bon effort !<small>Good try \u2014 you\u2019ll get it</small>'))+'</div></div><div class="pc-acts"><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
   kRes.querySelector('.pc-next').onclick=kNext;
   if(sc())sc().cheer();
   T(kNext,1400);
  }
  fetch(dn+'.json?v=5').then(function(r){return r.json();}).then(function(j){
   kGaps=j.gaps||[];kMax=kGaps.map(function(){return 0;});
   return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
  }).then(function(s2){
   if(dead){s2.getTracks().forEach(function(t){t.stop();});return;}
   stream=s2;
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms2=actx.createMediaStreamSource(s2);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms2.connect(mAn);}catch(e){mAn=null;}
   musicOff();
   media=new Audio();media.preload='auto';media.src=dn+'.mp3?v=5';
   media.addEventListener('playing',function(){kSpk.classList.add('on');var hx=kp.querySelector('.pc-hint');if(hx)hx.remove();if(sc())sc().listen();});
   media.addEventListener('pause',function(){if(!media.ended)kSpk.classList.remove('on');});
   media.addEventListener('ended',kEnd);
   media.addEventListener('error',function(){kSt.textContent='Audio unavailable';musicOn();T(kNext,1500);});
   var kq0=media.play();if(kq0&&kq0.catch)kq0.catch(function(){
    var hh2=document.createElement('div');hh2.className='pc-hint';hh2.textContent='tap to listen';kp.querySelector('.pc-hslot').appendChild(hh2);
    var kick2=function(){document.removeEventListener('pointerdown',kick2,true);if(!dead&&media.paused&&!media.ended){var q9=media.play();if(q9&&q9.catch)q9.catch(function(){});}};
    document.addEventListener('pointerdown',kick2,true);
   });
  }).catch(function(){kSt.textContent='Microphone blocked \u2014 allow it, then reload';});
  kSpk.onclick=function(){if(media&&media.paused&&!media.ended){var q8=media.play();if(q8&&q8.catch)q8.catch(function(){});}};
  return true;
 }
 /* ---------- INTRO / LISTEN-ONLY ---------- */
 if(pb)window.__psSkipIntro=0;
 if(!pb&&window.__psSkipIntro){T(function(){window.lsGoNext();},200);return true;}
 if(!pb){
  var url=video||audioUrl,_m=window.__psMeta||{},ovr=false;if(!url&&!kids()&&UINTRO[((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-'+partNum])url='/assets/audio/lessons/'+UINTRO[((window.__psMeta||{}).level||'')+'-'+lessonNo()+'-'+partNum]+'.mp3?v=1';if(!url&&kids()&&KINTRO[lessonNo()+'-'+partNum])url='/assets/audio/lp/lesson'+lessonNo()+'_part'+partNum+'.mp3?v=';if(!url&&kids()&&KINTRO[lessonNo()+'-'+partNum])url='/assets/audio/lp/lesson'+lessonNo()+'_part'+partNum+'.mp3?v=';if(isL1()&&!window.__psIntroUsed){window.__psIntroUsed=1;ovr=true;url=introUrl();video=null;}
  var lis=window.__psListen||null;if(lis){window.__psListen=null;url=lis.url;video=null;window.__psAdv=function(){l1Show(lis.next,ctx);};}
  if(ovr)window.__psAdv=function(){l1Show(U()?Math.min(l1Read(),lastStep()-1):0,ctx);};
  var p=swap(c,'<button type="button" class="pc-teach" aria-label="Teacher">'+I.mic+'</button><div class="pc-st"></div>');
  var btn=p.querySelector('.pc-teach'),st=p.querySelector('.pc-st');
  function more(){btn.classList.remove('on');T(function(){if(lis)l1Show(lis.next,ctx);else if(ovr)l1Show(U()?Math.min(l1Read(),lastStep()-1):0,ctx);else window.lsGoNext();},30);}
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
   '<div class="pc-top"><div class="pc-hn">'+(U()?'Phrase '+FR[U().steps.length]:(lessonNo()===3?'Phrase trois':lessonNo()===2?'Phrase cinq':'Phrase six'))+'</div><div class="pc-hi">Listen carefully.</div><div class="pc-hp">Headphones work best</div>'+(RS.welcome?'<div class="pc-wb">Welcome back — continuing from where you stopped</div>':'')+'</div>'+
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
 var expected=pb.expectedText||'';if(pb._l1!==undefined&&!pb._dlgAll&&U()){expected=U().steps[pb._l1].t||'';}
 var L1i=(pb._l1!==undefined)?pb._l1:-1,dlgK=(pb._dlg!==undefined)?pb._dlg:-1;
 var lbl0=L1i>=0?('Phrase '+FR[L1i]):phraseLabel(partNum);
 var KID=kids();
 if(KID&&L1i<0&&KAUD[lessonNo()+'-'+partNum])audioUrl='/assets/audio/lp/lesson'+lessonNo()+'_part'+partNum+'.mp3?v=';
 if(L1i>=0){audioUrl=(U()&&dlgK<0)?('/assets/audio/lessons/'+U().steps[L1i].a+'.mp3?v=3'):dlgK>=0?('/assets/audio/A0_TP_L1_dlg_'+L1D[dlgK][1]+'.mp3?v='):('/assets/audio/A0_TP_L'+lessonNo()+'_phrase'+(L1i+1)+'.mp3?v=');var stepI=dlgK>=0?5+dlgK:L1i;window.__psAdv=function(){l1Show(stepI+1,ctx);};}
 var p=swap(c,
  '<div class="pc-top"><div class="pc-hn">'+lbl0+'</div><div class="pc-hi">'+(dlgK>=0?'Listen to the teacher, then answer.':(kids()?'Listen, then say it!':'Listen attentively, and repeat when prompted.'))+'</div>'+(dlgK>=0?'<div class="pc-pg">'+(dlgK+1)+' / 5</div>':'')+(RS.welcome?'<div class="pc-wb">Welcome back \u2014 continuing from where you stopped</div>':'')+'</div>'+
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
 var hist=[],blob=null,scoring=false,tplay=false,spoke=false,lastLoud=0,recT0=0,autoGo=false,tries=0,went=false;
 for(var i=0;i<56;i++)hist.push(0);
 function draw(){
  if(dead)return;raf=requestAnimationFrame(draw);
  var v=0;
  if(mAn){mAn.getByteFrequencyData(mData);var s=0;for(var k=0;k<mData.length;k++)s+=mData[k];v=Math.min(1,(s/mData.length)/55);}
  hist.push(v);hist.shift();
  if(KID&&recorder&&recorder.state==='recording'){var nw=performance.now();if(v>.12){spoke=true;lastLoud=nw;}else if(spoke&&nw-lastLoud>1100){recorder.stop();}else if(!spoke&&nw-recT0>5500){recorder.stop();}}
  g.clearRect(0,0,560,88);
  for(var j=0;j<hist.length;j++){
   var h=3+hist[j]*70,x=j*10+3;
   g.fillStyle=mAn?'rgba(255,214,140,'+(.35+.65*hist[j])+')':'rgba(255,255,255,.28)';
   var y=44-h/2;g.beginPath();if(g.roundRect)g.roundRect(x,y,5,h,2.5);else g.rect(x,y,5,h);g.fill();
  }
 }
 raf=requestAnimationFrame(draw);
 function ready(){tplay=false;if(tl)tl.classList.remove('on');p.classList.remove('ph-listen');p.classList.add('ph-rec');if(!scoring)mic.disabled=false;spk.classList.remove('on');if(sc())sc().calm();st.textContent='';mic.classList.add('hint');if(KID&&!autoGo&&!blob&&!scoring){autoGo=true;st.innerHTML='<span class="pc-yt">Your turn!</span>';T(function(){autoGo=false;if(!recorder||recorder.state!=='recording')startRec();},650);}}
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
    if(dlgK>=0||KID){p.classList.remove('is-rec');st.textContent='';submit();return;}
    rep.disabled=false;p.classList.add('has-rec');p.classList.remove('is-rec');st.textContent='Replay it, or submit';
    res.innerHTML='<button type="button" class="pc-go pc-sub">Submit '+I.ok+'</button>';
    res.querySelector('.pc-sub').onclick=submit;
   };
   musicOff();
   try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();var ms=actx.createMediaStreamSource(s);mAn=actx.createAnalyser();mAn.fftSize=64;mData=new Uint8Array(mAn.frequencyBinCount);ms.connect(mAn);}catch(e){mAn=null;}
   p.classList.remove('scored','has-rec');p.classList.add('is-rec');spoke=false;lastLoud=0;recT0=performance.now();recorder.start();mic.classList.remove('hint');mic.classList.add('rec');mic.innerHTML=I.stop;lbl.textContent='Stop';st.textContent='Recording...';res.innerHTML='';rep.disabled=true;
   if(sc())sc().micState('rec');
   T(function(){if(recorder&&recorder.state==='recording')recorder.stop();},KID?8000:(U()?25000:(lessonNo()>=2?14000:9000)));
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
 function kidsNext(){
  if(went)return;went=true;
  var mx2=(window.__psMax&&window.__psMax())||0;if(mx2&&partNum>=mx2)rsWrite(0);else if(partNum>rsRead())rsWrite(partNum);
  advance();
 }
 /* Very forgiving marking for children: any real try earns stars. Only a silent try is asked again (twice at most). */
 function kidsResult(d){
  var quiet=!!(d&&d.quiet),raw=quiet?0:pickScoreL(d||{}),heard=!quiet&&(raw===null||raw>=3);
  p.classList.add('scored');st.textContent='';
  if(!heard){
   tries++;
   if(tries<2){
    res.innerHTML='<div class="pc-fb"><div class="pc-msg">Encore une fois !<small>Say it a little louder \u2014 I\u2019m listening</small></div></div>';
    blob=null;autoGo=true;T(function(){autoGo=false;p.classList.remove('scored');res.innerHTML='';st.innerHTML='<span class="pc-yt">Your turn!</span>';startRec();},1900);
    return;
   }
   res.innerHTML='<div class="pc-fb"><div class="pc-stars"><span>\u2605</span><span class="off">\u2605</span><span class="off">\u2605</span></div><div class="pc-msg">Bon effort !<small>Let\u2019s keep going \u2014 you\u2019ll get it</small></div></div>';
   T(kidsNext,2600);return;
  }
  var n=(raw===null||raw>=20)?3:2,h='';
  for(var q=0;q<3;q++)h+='<span'+(q<n?'':' class="off"')+' style="animation-delay:'+(q*.18)+'s">\u2605</span>';
  res.innerHTML='<div class="pc-fb"><div class="pc-stars">'+h+'</div><div class="pc-msg">'+(n===3?'Bravo !<small>Super \u2014 you said it!</small>':'Tr\u00e8s bien !<small>Very good \u2014 well done!</small>')+'</div></div><div class="pc-acts"><button type="button" class="pc-go pc-next">Next '+I.next+'</button></div>';
  res.querySelector('.pc-next').onclick=kidsNext;
  if(sc())sc().cheer();
  T(kidsNext,2800);
 }
 function submit(){
  if(!blob||scoring)return;
  scoring=true;mic.disabled=true;if(recAudio)recAudio.pause();
  st.textContent='Scoring...';res.innerHTML='<div class="pc-wait"><i></i><i></i><i></i></div>';
  toWav(blob).catch(function(){return new Blob([blob],{type:'audio/webm'});}).then(function(body){window.__psSent=body.type+' '+body.size+' pk='+(body.pk!==undefined?body.pk.toFixed(3):'?');if(body.pk!==undefined&&body.pk<0.012)return {quiet:true};return fetch(api+'/api/assessPronunciation?referenceText='+encodeURIComponent(expected),{method:'POST',body:body}).then(function(r){return r.json();});}).then(function(d){
   if(dead)return;scoring=false;mic.disabled=false;
   if(KID){kidsResult(d);return;}
   var quiet=!!d.quiet,rawS=quiet?0:pickScore(d),dbg='';try{dbg=(window.__psSent||'')+' '+JSON.stringify(d).slice(0,130);}catch(e){}
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
   if(KID){kidsResult({});return;}
   res.innerHTML='<div class="pc-msg">Could not score. Try again.</div><div class="pc-acts"><button type="button" class="pc-go pc-sub">Submit '+I.ok+'</button></div>';
   res.querySelector('.pc-sub').onclick=submit;
  });
 }
 return true;
};
})();

/*FRUI*/(function(){try{var lv=String(((window.__psMeta||{}).level)||'').toUpperCase();if(!/^(B1|B2|C1|C2)$/.test(lv))return;
var X=[[/^Record again$/,'Réenregistrer'],[/^Recording\.\.\.$/,'Enregistrement…'],[/^Record$/,'Enregistrer'],[/^Stop$/,'Arrêter'],[/^Scoring\.\.\.$/,'Évaluation…'],[/^Try again$/,'Réessayer'],[/^Replay recording$/,"Réécouter mon enregistrement"],[/^Replay$/,'Réécouter'],[/^Hear the teacher again$/,'Réécouter la professeure'],[/^Teacher$/,'Professeure'],[/^Listen$/,'Écoutez'],[/^Next\b/,'Suivant'],[/^Submit\b/,'Envoyer'],[/^Your turn!$/,'À vous !'],[/^Lesson complete$/,'Leçon terminée'],[/^Well done[.!]*$/,'Bien joué !'],[/^Redo lesson$/,'Refaire la leçon'],[/^Back to lessons$/i,'Retour aux leçons'],[/^You finished /,'Vous avez terminé '],[/^Headphones work best$/,'Un casque est recommandé'],[/^Audio unavailable$/,'Audio indisponible'],[/^Microphone blocked$/,'Micro bloqué'],[/^Could not score( that)?\. Try again\.$/,"Évaluation impossible. Réessayez."],[/^Listen, then say it with me!$/,'Écoutez, puis dites-le avec moi !'],[/^Listen, then say it!$/,'Écoutez, puis dites-le !'],[/^Listen carefully\.$/,'Écoutez bien.'],[/^Listen to the teacher, then answer\.$/,'Écoutez la professeure, puis répondez.'],[/^Listen attentively, and repeat when prompted\.$/,'Écoutez bien, et répétez quand on vous le demande.'],[/^Conversation$/,'Conversation']];
function fx(s){var t=s.trim();if(!t)return s;for(var i=0;i<X.length;i++){if(X[i][0].test(t))return s.replace(t,t.replace(X[i][0],X[i][1]))}return s}
function walk(n){if(n.nodeType===3){var v=fx(n.nodeValue);if(v!==n.nodeValue)n.nodeValue=v;return}if(n.nodeType!==1||/^(SCRIPT|STYLE)$/.test(n.tagName))return;['title','aria-label','placeholder'].forEach(function(a){var x=n.getAttribute&&n.getAttribute(a);if(x){var y=fx(x);if(y!==x)n.setAttribute(a,y)}});for(var c=n.firstChild;c;c=c.nextSibling)walk(c)}
var busy=0;var mo=new MutationObserver(function(){if(busy)return;busy=1;try{walk(document.body)}finally{busy=0}});
function go(){walk(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true})}
if(document.body)go();else document.addEventListener('DOMContentLoaded',go)}catch(e){}})();
