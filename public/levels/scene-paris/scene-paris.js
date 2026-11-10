/* SayBon - Paris plaza scene. One slow camera, walkers that loop from the far end of the road.
   var s = ParisScene.mount({ mic:false, onMic:fn });  s.listen(); s.yourTurn(); s.micState('rec'); s.cheer(); s.calm(); */
(function(){
var V='?v=5', BASE='/assets/images/scene-paris-';
var LAYOUT={
 d:{w:1672,h:941,bg:'bg.webp',fx:.55,fy:.5,fl:'27%',sun:[.82,.14],hz:410,gy:940,cx:1060,
  occ:[0,548,232,941],
  fixed:[{k:'woman-cafe',x:10,y:338,w:165},{k:'woman-grey',x:182,y:352,w:178},{k:'man-bench',x:1298,y:402,w:370}],
  walkers:[
   {k:'mother-daughter',asp:1.339,w:455,near:1,off:[-520,-330],T:36,z0:16,start:0,bob:1},
   {k:'cyclist',asp:2.609,w:126,near:1.25,off:[170,360],T:28,z0:16,start:.12,bob:2},
   {k:'pigeon-1',asp:1,w:150,near:.62,off:[-140,260],T:44,z0:12,start:.30,face:1},
   {k:'pigeon-2',asp:1.197,w:150,near:.6,off:[-300,-60],T:52,z0:12,start:.5,face:1}
  ]},
 m:{w:941,h:1672,bg:'bg-m.webp',fx:.5,fy:.5,fl:'38%',sun:[.85,.24],hz:790,gy:1560,cx:520,
  occ:[0,912,290,1180],
  fixed:[{k:'woman-cafe',x:-6,y:745,w:136},{k:'woman-grey',x:105,y:760,w:116},{k:'man-bench',x:709,y:793,w:240}],
  walkers:[
   {k:'mother-daughter',asp:1.339,w:560,near:1,off:[-330,-160],T:36,z0:14,start:0,bob:1},
   {k:'cyclist',asp:2.609,w:100,near:1.3,off:[70,210],T:28,z0:14,start:.12,bob:2},
   {k:'pigeon-1',asp:1,w:160,near:.6,off:[-60,200],T:44,z0:10,start:.3,face:1},
   {k:'pigeon-2',asp:1.197,w:160,near:.58,off:[-210,0],T:52,z0:10,start:.5,face:1}
  ]}
};
var DEBUG=/psdebug/.test(location.search);
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function el(t,c,p){var e=document.createElement(t);if(c)e.className=c;if(p)p.appendChild(e);return e;}
function rnd(a,b){return a+Math.random()*(b-a);}

function mount(opts){
 opts=opts||{};
 var portrait=innerHeight>innerWidth*1.1, L, root, stage, cv, ctx, W=innerWidth, H=innerHeight, SC=1, ox=0, oy=0, walkers=[], parts=[], raf=0, phase='idle', dead=false, ringT=0, t0=0, last=0;
 root=el('div','ps-root'); document.body.insertBefore(root,document.body.firstChild);
 function pick(w,i){w.off0=rnd(w.cfg.off[0],w.cfg.off[1]);w.dir=(Math.random()<.5?-1:1);w.t=i===0?w.cfg.start:0;w.wait=0;}
 function build(m){
  L=LAYOUT[m];root.innerHTML='';walkers=[];
  stage=el('div','ps-stage',root);
  var bg=el('div','ps-layer',stage);bg.style.backgroundImage='url('+BASE+L.bg+V+')';
  var fo=el('div','ps-foliage',stage);fo.style.backgroundImage=bg.style.backgroundImage;fo.style.setProperty('--fl',L.fl);
  L.fixed.forEach(function(f){
   var d=el('div','ps-fixed',stage);d.style.left=(f.x/L.w*100)+'%';d.style.top=(f.y/L.h*100)+'%';d.style.width=(f.w/L.w*100)+'%';
   var im=el('img','',d);im.src=BASE+f.k+'.webp'+V;im.alt='';im.draggable=false;
  });
  var oc=el('div','ps-occ',stage);oc.style.backgroundImage=bg.style.backgroundImage;
  var o=L.occ;oc.style.clipPath='inset('+(o[1]/L.h*100)+'% '+(100-o[2]/L.w*100)+'% '+(100-o[3]/L.h*100)+'% '+(o[0]/L.w*100)+'%)';
  oc.style.webkitMaskImage=oc.style.maskImage='linear-gradient(to bottom,transparent '+(o[1]/L.h*100)+'%,#000 '+((o[1]+7)/L.h*100)+'%)';
  L.walkers.forEach(function(c){
   var d=el('div','ps-walker',stage),a=el('div','ps-anim'+(c.bob?' ps-bob'+c.bob:''),d),im=el('img','',a);
   im.src=BASE+c.k+'.webp'+V;im.alt='';im.draggable=false;
   var w={cfg:c,el:d,anim:a,img:im};pick(w,0);w.t=c.start;w.pg=0;walkers.push(w);
  });
  var rays=el('div','ps-rays',stage);rays.style.left=(L.sun[0]*100)+'%';rays.style.top=(L.sun[1]*100)+'%';
  cv=el('canvas','ps-cv',root);ctx=cv.getContext('2d');
  el('div','ps-dim',root);
  if(opts.mic!==false){
   var mic=el('button','ps-mic',root);mic.type='button';mic.setAttribute('aria-label','Record');
   mic.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7"/></svg>';
   mic.addEventListener('click',function(){if(opts.onMic)opts.onMic();});
  }
  layout();
 }
 function layout(){
  W=innerWidth;H=innerHeight;SC=Math.max(W/L.w,H/L.h);var sw=L.w*SC,sh=L.h*SC;
  ox=(W-sw)*L.fx;oy=(H-sh)*L.fy;
  stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=ox+'px';stage.style.top=oy+'px';
  walkers.forEach(function(w){w.el.style.width=(w.cfg.w*SC)+'px';});
  var d=Math.min(devicePixelRatio||1,2);cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
 }
 function place(w,dt){
  var c=w.cfg;
  if(w.wait>0){w.wait-=dt;w.el.style.opacity=0;if(w.wait<=0){pick(w,1);}return;}
  w.t+=dt/c.T;
  if(w.t>=1){w.wait=rnd(1.5,4);w.el.style.opacity=0;return;}
  var t=w.t,z=Math.pow(c.z0,1-t),s=c.near/z;
  var fy=L.hz+(L.gy-L.hz)/z, fx=L.cx+w.off0/z+(c.face?w.dir*(1-t)*120/z:0)+Math.sin(t*9+w.off0)*5/z;
  var hpx=c.w*c.asp*SC;
  w.el.style.transform='translate3d('+((fx-c.w/2)*SC).toFixed(1)+'px,'+(fy*SC-hpx).toFixed(1)+'px,0) scale('+s.toFixed(4)+')';
  w.el.style.opacity=Math.min(1,t/.1,(1-t)/.09).toFixed(3);
  if(c.face){var f=(w.dir<0)?-1:1;w.img.style.transform='scaleX('+f+')';}
 }
 function headPt(){var w=walkers[0],r=w.el.getBoundingClientRect();return [r.left+r.width*.45,r.top+r.height*.1];}
 function ring(){var p=headPt(),r=el('div','ps-ring',root);r.style.left=p[0]+'px';r.style.top=p[1]+'px';root.insertBefore(r,root.querySelector('.ps-dim'));setTimeout(function(){r.remove();},2500);}
 function leaf(){return{t:'l',x:Math.random()*W*1.1,y:-20-Math.random()*H*.3,s:5+Math.random()*5,vy:20+Math.random()*22,ph:Math.random()*6.28,sw:16+Math.random()*26,rot:Math.random()*6.28,vr:(Math.random()-.5)*1.2,c:['#f3c53b','#e7a02c','#c9a43a','#8ea83a'][Math.random()*4|0]};}
 function dust(){return{t:'d',x:Math.random()*W,y:H*(.3+Math.random()*.7),s:1+Math.random()*2.2,vy:-(4+Math.random()*7),ph:Math.random()*6.28,sw:6+Math.random()*10,a:.25+Math.random()*.4};}
 function burst(){var p=headPt();for(var i=0;i<26;i++){var a=Math.random()*6.283,v=70+Math.random()*190;parts.push({t:'s',x:p[0],y:p[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v-90,s:1.5+Math.random()*2.6,life:1.4+Math.random(),max:2.4,c:['#fff1a8','#ffd166','#ffb347','#ffffff'][i%4]});}}
 function tick(ts){
  if(dead)return;raf=requestAnimationFrame(tick);
  if(!t0)t0=ts;var dt=Math.min((ts-last)/1000||0,.05);last=ts;var T=(ts-t0)/1000;
  // one slow camera: always drifting, never stops
  var sc=1.13+.055*Math.sin(T/21), cx=2.6*Math.sin(T/17+1.2), cy=1.1*Math.sin(T/27+.4);
  if(DEBUG){sc=1;cx=0;cy=0;}
  stage.style.transform='translate3d('+cx.toFixed(3)+'%,'+cy.toFixed(3)+'%,0) scale('+sc.toFixed(4)+')';
  if(!DEBUG)walkers.forEach(function(w){place(w,dt);});
  ctx.clearRect(0,0,W,H);
  for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.ph+=dt;
   if(p.t==='l'){p.y+=p.vy*dt;p.x+=Math.sin(p.ph*1.1)*p.sw*dt+6*dt;p.rot+=p.vr*dt;if(p.y>H+20){parts[i]=leaf();continue;}
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.scale(1,.55+Math.abs(Math.sin(p.ph*1.4))*.45);ctx.fillStyle=p.c;ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(0,0,p.s,p.s*.6,0,0,6.283);ctx.fill();ctx.restore();
   }else if(p.t==='d'){p.y+=p.vy*dt;p.x+=Math.sin(p.ph*.8)*p.sw*dt;if(p.y<-10){parts[i]=dust();parts[i].y=H+6;continue;}
    ctx.globalAlpha=p.a*(.6+.4*Math.sin(p.ph*1.5));ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.283);ctx.fill();
   }else{p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.283);ctx.fill();}
  }
  ctx.globalAlpha=1;
  if(phase==='listen'&&ts-ringT>1400){ringT=ts;ring();}
 }
 function setPhase(p){phase=p;root.classList.toggle('ps-turn',p==='turn');}
 build(portrait?'m':'d');
 for(var i=0;i<(portrait?8:12);i++){var p=leaf();p.y=Math.random()*H;parts.push(p);}
 for(var j=0;j<(portrait?14:22);j++)parts.push(dust());
 var pre=new Image();pre.onload=pre.onerror=function(){requestAnimationFrame(function(){root.classList.add('ps-ready');});};pre.src=BASE+L.bg+V;
 var rt;function onResize(){clearTimeout(rt);rt=setTimeout(function(){var pt=innerHeight>innerWidth*1.1;if(pt!==portrait){portrait=pt;build(pt?'m':'d');root.classList.add('ps-ready');}else layout();},150);}
 addEventListener('resize',onResize);
 if(REDUCED){root.classList.add('ps-still');walkers.forEach(function(w){w.el.style.display='none';});}
 else raf=requestAnimationFrame(tick);
 return{
  root:root,
  listen:function(){setPhase('listen');ringT=0;},
  yourTurn:function(){setPhase('turn');root.classList.remove('ps-rec');},
  micState:function(s){root.classList.toggle('ps-rec',s==='rec');},
  cheer:function(){setPhase('idle');burst();ring();},
  calm:function(){setPhase('idle');},
  destroy:function(){dead=true;cancelAnimationFrame(raf);removeEventListener('resize',onResize);root.remove();}
 };
}
window.ParisScene={mount:mount};
})();
