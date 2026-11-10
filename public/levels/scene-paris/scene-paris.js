/* SayBon - Paris plaza scene. One slow camera, walkers that loop from the far end of the road.
   var s = ParisScene.mount({ mic:false, onMic:fn });  s.listen(); s.yourTurn(); s.micState('rec'); s.cheer(); s.calm(); */
(function(){
var V='?v=9', BASE='/assets/images/scene-paris-';
var LAYOUT={
 d:{w:1672,h:941,bg:'bg.webp',fx:.55,fy:.5,fl:'27%',sun:[.82,.14],hz:410,gy:940,cx:1060,
  occ:[0,548,232,941],
  always:[{k:'pigeon-1',x:1180,y:825,w:78},{k:'pigeon-2',x:1248,y:850,w:66}],
  batches:[
   {fixed:[{k:'woman-cafe',x:10,y:338,w:165},{k:'woman-grey',x:182,y:352,w:178},{k:'man-bench',x:1298,y:402,w:370},{k:'cyclist',x:1135,y:310,w:126,a:'ps-rock'}],
    walkers:[{k:'mother-daughter',asp:1.339,w:455,near:1,zEnd:1.4,off:[-480,-330],T:56,z0:9,bob:1}]},
   {fixed:[{k:'man-cafe',x:-14,y:336,w:240},{k:'woman-beret',x:150,y:362,w:205},{k:'reader',x:1300,y:468,w:360},{k:'scooter',x:1143,y:318,w:112,a:'ps-rock'}],
    walkers:[{k:'father-son',asp:1.179,w:543,near:1,zEnd:1.4,off:[-260,-120],T:56,z0:9,bob:1}]}
  ]},
 m:{w:941,h:1672,bg:'bg-m.webp',fx:.5,fy:.5,fl:'38%',sun:[.85,.24],hz:790,gy:1560,cx:520,fade:.2,
  occ:[0,912,290,1180],
  always:[{k:'pigeon-1',x:598,y:1178,w:84},{k:'pigeon-2',x:676,y:1204,w:70}],
  batches:[
   {fixed:[{k:'woman-cafe',x:-6,y:745,w:136},{k:'woman-grey',x:105,y:760,w:116},{k:'man-bench',x:709,y:793,w:240},{k:'cyclist',x:595,y:690,w:130,a:'ps-rock'}],
    walkers:[{k:'mother-daughter',asp:1.339,w:640,near:1,zEnd:1,off:[-300,-160],T:56,z0:5.5,bob:1}]},
   {fixed:[{k:'man-cafe',x:-30,y:742,w:200},{k:'woman-beret',x:81,y:760,w:183},{k:'reader',x:712,y:811,w:240},{k:'scooter',x:602,y:690,w:124,a:'ps-rock'}],
    walkers:[{k:'father-son',asp:1.179,w:720,near:1,zEnd:1,off:[-230,-90],T:56,z0:5.5,bob:1}]}
  ]}
};
var GAP=2.5,LEAD=1.2;
var DEBUG=/psdebug/.test(location.search);
var REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
function el(t,c,p){var e=document.createElement(t);if(c)e.className=c;if(p)p.appendChild(e);return e;}
function rnd(a,b){return a+Math.random()*(b-a);}

var CAM=[[1.08,0,0],[1.26,0,0],[1.10,0,0],[1.15,4.2,0],[1.18,4.4,4.4],[1.18,4.4,-4.4],[1.15,-4.2,-2],[1.10,-3,2.5]],CSEG=7;
function camAt(T){var n=CAM.length,u=(T/CSEG)%n,i=Math.floor(u),f=u-i,P=function(k){return CAM[(k%n+n)%n];},a=P(i-1),b=P(i),c=P(i+1),d=P(i+2),r=[];
 for(var k=0;k<3;k++){var f2=f*f,f3=f2*f;r[k]=.5*((2*b[k])+(-a[k]+c[k])*f+(2*a[k]-5*b[k]+4*c[k]-d[k])*f2+(-a[k]+3*b[k]-3*c[k]+d[k])*f3);}return r;}
function mount(opts){
 opts=opts||{};
 var camK=1,portrait=innerHeight>innerWidth*1.1, L, root, stage, cv, ctx, W=innerWidth, H=innerHeight, SC=1, ox=0, oy=0, walkers=[], batches=[], cycle=1, parts=[], raf=0, phase='idle', dead=false, ringT=0, t0=0, last=0;
 root=el('div','ps-root'); document.body.insertBefore(root,document.body.firstChild);
 function pick(w,i){w.off0=rnd(w.cfg.off[0],w.cfg.off[1]);w.dir=(Math.random()<.5?-1:1);w.t=i===0?w.cfg.start:0;w.wait=0;}
 function build(m){
  L=LAYOUT[m];root.innerHTML='';walkers=[];batches=[];
  stage=el('div','ps-stage',root);
  var bg=el('div','ps-layer',stage);bg.style.backgroundImage='url('+BASE+L.bg+V+')';
  var fo=el('div','ps-foliage',stage);fo.style.backgroundImage=bg.style.backgroundImage;fo.style.setProperty('--fl',L.fl);
  function addFixed(f,parent){
   var d=el('div','ps-fixed'+(f.a?' '+f.a:''),parent);d.style.left=(f.x/L.w*100)+'%';d.style.top=(f.y/L.h*100)+'%';d.style.width=(f.w/L.w*100)+'%';
   var im=el('img','',d);im.src=BASE+f.k+'.webp'+V;im.alt='';im.draggable=false;
  }
  L.always.forEach(function(f){addFixed(f,stage);});
  batches=[];
  L.batches.forEach(function(bt,bi){
   var g=el('div','ps-bfix',stage);g.style.opacity=0;bt.fixed.forEach(function(f){addFixed(f,g);});
   batches.push({g:g,walkers:[],Tb:bt.walkers[0].T+LEAD+GAP,last:1e9,bi:bi});
  });
  var oc=el('div','ps-occ',stage);oc.style.backgroundImage=bg.style.backgroundImage;
  var o=L.occ;oc.style.clipPath='inset('+(o[1]/L.h*100)+'% '+(100-o[2]/L.w*100)+'% '+(100-o[3]/L.h*100)+'% '+(o[0]/L.w*100)+'%)';
  oc.style.webkitMaskImage=oc.style.maskImage='linear-gradient(to bottom,transparent '+(o[1]/L.h*100)+'%,#000 '+((o[1]+7)/L.h*100)+'%)';
  var acc=0;
  L.batches.forEach(function(bt,bi){
   batches[bi].start=acc;acc+=batches[bi].Tb-GAP;
   bt.walkers.forEach(function(c){
    var d=el('div','ps-walker',stage),a=el('div','ps-anim'+(c.bob?' ps-bob'+c.bob:''),d),im=el('img','',a);
    im.src=BASE+c.k+'.webp'+V;im.alt='';im.draggable=false;
    var w={cfg:c,el:d,anim:a,img:im,op:0,t:0};pick(w,1);batches[bi].walkers.push(w);walkers.push(w);
   });
  });
  cycle=acc;
  var rays=el('div','ps-rays',stage);rays.style.left=(L.sun[0]*100)+'%';rays.style.top=(L.sun[1]*100)+'%';
  if(opts.overlay)el('div','ps-veil',root);
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
  var fyE=portrait?L.fy:Math.max(L.fy,Math.min(.85,.5+(W/H-1.78)*.9));ox=(W-sw)*L.fx;oy=(H-sh)*fyE;
  stage.style.transformOrigin=((W/2-ox)/sw*100).toFixed(1)+'% '+((H*.62-oy)/sh*100).toFixed(1)+'%';camK=portrait?.45:.85;
  stage.style.width=sw+'px';stage.style.height=sh+'px';stage.style.left=ox+'px';stage.style.top=oy+'px';
  walkers.forEach(function(w){w.el.style.width=(w.cfg.w*SC)+'px';w.el.style.transformOrigin='50% 100%';});
  var d=Math.min(devicePixelRatio||1,2);cv.width=W*d;cv.height=H*d;ctx.setTransform(d,0,0,d,0,0);
 }
 function place(w,tw){
  var c=w.cfg;
  var t=tw/c.T;
  if(t<0||t>=1){w.el.style.opacity=0;w.op=0;return;}
  var ze=c.zEnd||1,z=ze*Math.pow(c.z0/ze,1-t),s=c.near/z;
  var fy=L.hz+(L.gy-L.hz)/z, fx=L.cx+w.off0/z+Math.sin(t*9+w.off0)*5/z;
  var hpx=c.w*c.asp*SC;
  w.el.style.transform='translate3d('+((fx-c.w/2)*SC).toFixed(1)+'px,'+(fy*SC-hpx).toFixed(1)+'px,0) scale('+s.toFixed(4)+')';
  var fo=Math.min(1,t/.1,(1-t)/(L.fade||.26));fo=fo*fo*(3-2*fo);w.op=fo;w.el.style.opacity=fo.toFixed(3);
 }
 function sm(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);}
 function runBatches(T){
  batches.forEach(function(b){
   var tb=(((T-b.start)%cycle)+cycle)%cycle;
   if(tb>=b.Tb){b.g.style.opacity=0;b.walkers.forEach(function(w){w.el.style.opacity=0;w.op=0;});b.last=tb;return;}
   if(tb<b.last-1){b.walkers.forEach(function(w){pick(w,1);});}
   b.last=tb;
   b.g.style.opacity=sm(Math.min(tb/GAP,(b.Tb-tb)/GAP)).toFixed(3);
   b.walkers.forEach(function(w){place(w,tb-LEAD);});
  });
 }
 function headPt(){var w=walkers[0];walkers.forEach(function(x){if(x.op>w.op)w=x;});var r=w.el.getBoundingClientRect();return [r.left+r.width*.45,r.top+r.height*.1];}
 function ring(){var p=headPt(),r=el('div','ps-ring',root);r.style.left=p[0]+'px';r.style.top=p[1]+'px';root.insertBefore(r,root.querySelector('.ps-dim'));setTimeout(function(){r.remove();},2500);}
 function leaf(){return{t:'l',x:Math.random()*W*1.1,y:-20-Math.random()*H*.3,s:5+Math.random()*5,vy:20+Math.random()*22,ph:Math.random()*6.28,sw:16+Math.random()*26,rot:Math.random()*6.28,vr:(Math.random()-.5)*1.2,c:['#f3c53b','#e7a02c','#c9a43a','#8ea83a'][Math.random()*4|0]};}
 function dust(){return{t:'d',x:Math.random()*W,y:H*(.3+Math.random()*.7),s:1+Math.random()*2.2,vy:-(4+Math.random()*7),ph:Math.random()*6.28,sw:6+Math.random()*10,a:.25+Math.random()*.4};}
 function burst(){var p=headPt();for(var i=0;i<26;i++){var a=Math.random()*6.283,v=70+Math.random()*190;parts.push({t:'s',x:p[0],y:p[1],vx:Math.cos(a)*v,vy:Math.sin(a)*v-90,s:1.5+Math.random()*2.6,life:1.4+Math.random(),max:2.4,c:['#fff1a8','#ffd166','#ffb347','#ffffff'][i%4]});}}
 function tick(ts){
  if(dead)return;raf=requestAnimationFrame(tick);
  if(!t0)t0=ts;var dt=Math.min((ts-last)/1000||0,.05);last=ts;var T=(ts-t0)/1000;
  // one slow camera: always drifting, never stops
  var cm=camAt(T),sc=1+(cm[0]-1)*camK,cx=cm[1]*camK,cy=cm[2]*camK;
  if(DEBUG){sc=1;cx=0;cy=0;}
  stage.style.transform='translate3d('+cx.toFixed(3)+'%,'+cy.toFixed(3)+'%,0) scale('+sc.toFixed(4)+')';
  if(!DEBUG)runBatches(T);
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
 var dbgB=(location.search.match(/batch=(\d)/)||[0,0])[1]|0;
 var dbgW=parseFloat((location.search.match(/walk=([\d.]+)/)||[0,-1])[1]);
 if(DEBUG||REDUCED){batches.forEach(function(b,i){b.g.style.opacity=(i===dbgB)?1:0;});walkers.forEach(function(w){w.el.style.display='none';});}
 if(DEBUG&&dbgW>=0){var bw=batches[dbgB].walkers[0];bw.el.style.display='';place(bw,dbgW*bw.cfg.T);bw.el.style.opacity=1;}
 if(REDUCED){root.classList.add('ps-still');}
 if(!REDUCED)raf=requestAnimationFrame(tick);
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
