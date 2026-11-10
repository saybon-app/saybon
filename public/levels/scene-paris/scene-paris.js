/* SayBon · Paris plaza scene (A0 Tout Public). Usage:
   var s = ParisScene.mount({ onMic: function(){...} });
   s.enter(); s.listen(); s.yourTurn(); s.micState('rec'); s.cheer(); s.calm(); */
(function(){
var BASE='/assets/images/scene-paris-';
var LAYOUT={
 d:{w:1672,h:941,bg:'bg.webp',fx:.55,fy:.5,fl:'27%',sun:[.82,.14],face:[.395,.43],
  items:[
   {k:'woman-cafe',x:22,y:352,w:215,z:1,a:'a-lean',fade:1},
   {k:'woman-grey',x:205,y:350,w:150,z:1,a:'a-lean2',fade:1},
   {k:'cyclist',x:1135,y:310,w:126,z:1.2,a:'a-glide',pre:['30%','0','.9',0]},
   {k:'pigeon-3',x:985,y:800,w:96,z:2,a:'a-peck'},
   {k:'pigeon-1',x:1052,y:727,w:76,z:2,a:'a-bob',flip:1},
   {k:'pigeon-2',x:1160,y:738,w:78,z:2,a:'a-peck',flip:1},
   {k:'man-bench',x:1300,y:408,w:372,z:1.6,a:'a-breathe'},
   {k:'mother-daughter',x:495,y:328,w:455,z:2.4,a:'a-walk',id:'md',pre:['-125%','6%','.82',1]}
  ]},
 m:{w:941,h:1672,bg:'bg-m.webp',fx:.5,fy:.5,fl:'38%',sun:[.85,.24],face:[.36,.45],
  items:[
   {k:'woman-cafe',x:5,y:745,w:215,z:1,a:'a-lean',fade:1},
   {k:'woman-grey',x:128,y:762,w:100,z:1,a:'a-lean2',fade:1},
   {k:'cyclist',x:618,y:700,w:92,z:1.2,a:'a-glide',pre:['40%','0','.9',0]},
   {k:'pigeon-1',x:730,y:1193,w:78,z:2,a:'a-bob',flip:1},
   {k:'pigeon-2',x:820,y:1222,w:80,z:2,a:'a-peck',flip:1},
   {k:'man-bench',x:712,y:818,w:240,z:1.6,a:'a-breathe'},
   {k:'mother-daughter',x:135,y:715,w:560,z:2.4,a:'a-walk',id:'md',pre:['-120%','8%','.8',1]}
  ]}
};
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function el(t,c,p){var e=document.createElement(t);if(c)e.className=c;if(p)p.appendChild(e);return e;}

function mount(opts){
 opts=opts||{};
 var portrait=innerHeight>innerWidth*1.1, mode='d', L, root, stage, cv, ctx, W, H, SC=1, ox=0, oy=0, items=[], raf=0, parts=[], ringT=0, phase='idle', dead=false, px=0, py=0, tx=0, ty=0;
 root=el('div','ps-root'); document.body.insertBefore(root,document.body.firstChild);
 function build(m){
  mode=m;L=LAYOUT[m];root.innerHTML='';items=[];
  stage=el('div','ps-stage',root);
  var bg=el('div','ps-layer',stage);bg.style.backgroundImage='url('+BASE+L.bg+')';
  var fo=el('div','ps-foliage',stage);fo.style.backgroundImage=bg.style.backgroundImage;fo.style.setProperty('--fl',L.fl);
  L.items.forEach(function(it){
   var w=el('div','ps-it'+(it.fade?' ps-fade':'')+(it.flip?' ps-flip':''),stage);
   w.style.left=(it.x/L.w*100)+'%';w.style.top=(it.y/L.h*100)+'%';w.style.width=(it.w/L.w*100)+'%';
   var a=el('div','ps-anim '+(it.a||''),w);if(REDUCED)a.className='ps-anim';
   var im=el('img','',a);im.src=BASE+it.k+'.webp';im.alt='';im.draggable=false;
   if(it.pre&&!REDUCED){w.classList.add('ps-pre');w.style.setProperty('--pre-x',it.pre[0]);w.style.setProperty('--pre-y',it.pre[1]);w.style.setProperty('--pre-s',it.pre[2]);w.style.setProperty('--pre-o',it.pre[3]);}
   items.push({w:w,z:it.z,id:it.id,pre:!!it.pre});
  });
  var rays=el('div','ps-rays',stage);rays.style.left=(L.sun[0]*100)+'%';rays.style.top=(L.sun[1]*100)+'%';
  cv=el('canvas','ps-cv',root);ctx=cv.getContext('2d');
  el('div','ps-dim',root);
  var mic=el('button','ps-mic',root);mic.type='button';mic.setAttribute('aria-label','Record');
  mic.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7"/></svg>';
  mic.addEventListener('click',function(){if(opts.onMic)opts.onMic();});
  layout();
 }
 function layout(){
  var vw=innerWidth,vh=innerHeight;W=vw;H=vh;
  SC=Math.max(vw/L.w,vh/L.h);var sw=L.w*SC,sh=L.h*SC;
  ox=(vw-sw)*L.fx;oy=(vh-sh)*L.fy;
  stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=ox+'px';stage.style.top=oy+'px';
  if(cv){var d=Math.min(devicePixelRatio||1,2);cv.width=vw*d;cv.height=vh*d;ctx.setTransform(d,0,0,d,0,0);}
 }
 function stagePt(fx,fy){return [ox+fx*L.w*SC, oy+fy*L.h*SC];}
 function ring(fx,fy){
  var p=stagePt(fx,fy),r=el('div','ps-ring',root);r.style.left=p[0]+'px';r.style.top=p[1]+'px';
  root.insertBefore(r,root.querySelector('.ps-dim'));setTimeout(function(){r.remove();},2500);
 }
 // particles: leaves, dust, sparkles
 function leaf(){return{t:'l',x:Math.random()*W*1.1,y:-20-Math.random()*H*.3,s:5+Math.random()*5,vy:22+Math.random()*26,ph:Math.random()*6.28,sw:18+Math.random()*30,rot:Math.random()*6.28,vr:(Math.random()-.5)*1.6,c:['#f3c53b','#e7a02c','#c9a43a','#8ea83a'][Math.random()*4|0]};}
 function dust(){return{t:'d',x:Math.random()*W,y:H*(.3+Math.random()*.7),s:1+Math.random()*2.2,vy:-(5+Math.random()*9),ph:Math.random()*6.28,sw:6+Math.random()*10,a:.25+Math.random()*.4};}
 for(var i=0;i<(portrait?9:14);i++){var p=leaf();p.y=Math.random()*H;parts.push(p);}
 for(var j=0;j<(portrait?16:26);j++)parts.push(dust());
 var last=0;
 function tick(ts){
  if(dead)return;raf=requestAnimationFrame(tick);
  var dt=Math.min((ts-last)/1000||0,.05);last=ts;if(!ctx)return;
  ctx.clearRect(0,0,W,H);
  px+=(tx-px)*.05;py+=(ty-py)*.05;
  items.forEach(function(it){it.w.style.transform='translate('+(px*it.z*-9).toFixed(1)+'px,'+(py*it.z*-5).toFixed(1)+'px)';});
  for(var i=parts.length-1;i>=0;i--){
   var p=parts[i];p.ph+=dt;
   if(p.t==='l'){p.y+=p.vy*dt;p.x+=Math.sin(p.ph*1.3)*p.sw*dt+8*dt;p.rot+=p.vr*dt;
    if(p.y>H+20){parts[i]=leaf();continue;}
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,.55+Math.abs(Math.sin(p.ph*1.8))*.45);ctx.fillStyle=p.c;ctx.globalAlpha=.85;
    ctx.beginPath();ctx.ellipse(0,0,p.s,p.s*.6,0,0,6.283);ctx.fill();ctx.restore();
   }else if(p.t==='d'){p.y+=p.vy*dt;p.x+=Math.sin(p.ph)*p.sw*dt;
    if(p.y<-10){parts[i]=dust();parts[i].y=H+6;continue;}
    ctx.globalAlpha=p.a*(.6+.4*Math.sin(p.ph*2));ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.283);ctx.fill();
   }else{p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;
    ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.283);ctx.fill();}
  }
  ctx.globalAlpha=1;
  if(phase==='listen'&&ts-ringT>1100){ringT=ts;ring(L.face[0],L.face[1]);}
 }
 function burst(fx,fy){var p=stagePt(fx,fy);for(var i=0;i<26;i++){var a=Math.random()*6.283,v=70+Math.random()*190;parts.push({t:'s',x:p[0],y:p[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v-90,s:1.5+Math.random()*2.6,life:1.1+Math.random(),max:2.1,c:['#fff1a8','#ffd166','#ffb347','#ffffff'][i%4]});}}
 function setPhase(p){phase=p;root.classList.toggle('ps-turn',p==='turn');}
 function md(){return items.filter(function(i){return i.id==='md';})[0];}
 build(portrait?'m':'d');
 // phone layout needs its own empty background; if missing, use the desktop crop
 if(portrait){var t=new Image();t.onerror=function(){if(!dead){build('d');root.classList.add('ps-ready');}};t.src=BASE+LAYOUT.m.bg;}
 root.classList.remove('ps-ready');
 var pre=new Image();pre.onload=pre.onerror=function(){requestAnimationFrame(function(){root.classList.add('ps-ready');});};pre.src=BASE+L.bg;
 addEventListener('resize',onResize);
 var rt;function onResize(){clearTimeout(rt);rt=setTimeout(function(){var pt=innerHeight>innerWidth*1.1;if(pt!==portrait){portrait=pt;build(pt?'m':'d');root.classList.add('ps-ready');}else layout();},150);}
 function onMove(e){var t=e.touches?e.touches[0]:e;tx=(t.clientX/innerWidth-.5)*2;ty=(t.clientY/innerHeight-.5)*2;}
 addEventListener('pointermove',onMove,{passive:true});
 function onTilt(e){if(e.gamma==null)return;tx=Math.max(-1,Math.min(1,e.gamma/25));ty=Math.max(-1,Math.min(1,(e.beta-45)/25));}
 addEventListener('deviceorientation',onTilt);
 if(!REDUCED)raf=requestAnimationFrame(tick);
 return{
  root:root,
  enter:function(){items.forEach(function(it){if(it.pre)setTimeout(function(){it.w.classList.remove('ps-pre');},120);});
    setTimeout(function(){var m=md();if(m){var a=m.w.querySelector('.ps-anim');a.classList.remove('a-walk');a.classList.add('a-breathe');}},5600);},
  listen:function(){setPhase('listen');ringT=0;},
  yourTurn:function(){setPhase('turn');root.classList.remove('ps-rec');},
  micState:function(s){root.classList.toggle('ps-rec',s==='rec');},
  cheer:function(){setPhase('idle');var m=md();if(m){m.w.classList.remove('ps-hop');void m.w.offsetWidth;m.w.classList.add('ps-hop');}burst(L.face[0],L.face[1]);ring(L.face[0],L.face[1]);},
  calm:function(){setPhase('idle');},
  destroy:function(){dead=true;cancelAnimationFrame(raf);removeEventListener('resize',onResize);removeEventListener('pointermove',onMove);removeEventListener('deviceorientation',onTilt);root.remove();}
 };
}
window.ParisScene={mount:mount};
})();
