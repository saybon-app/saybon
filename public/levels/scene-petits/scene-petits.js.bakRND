/* SayBon - Les Petits scene. Drop-in for ParisScene: PetitsScene.mount({lesson}) returns {cheer, calm, listen, micState, destroy}.
   One of nine paintings per lesson (rotating). The picture travels slowly and smoothly (zoom + pan + gentle sway), with a far blurred
   layer moving the other way for depth, sweeping light, soft rays, glints that twinkle on the bright spots of the painting, and
   drifting particles that suit each scene (pollen, petals, snow, leaves, dust). */
(function(){
var BASE="/levels/scene-petits/img/p";
/* Order across lessons, scenery first: beach, waterfall hike, lakeside village, winter rink, blossom park, then park, playground, and the two libraries last. */
var SEQ=[3,5,8,4,7,2,9,1,6];
var FX={1:"dust",2:"pollen",3:"sparkle",4:"snow",5:"leaf",6:"dust",7:"petal",8:"petal",9:"pollen"};
var RM=false;try{RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
function rnd(a,b){return a+Math.random()*(b-a);}
function ease(t){return t*t*t*(t*(t*6-15)+10);}
function mount(o){
 o=o||{};
 var lesson=Math.max(1,parseInt(o.lesson,10)||1);
 var idx=SEQ[(lesson-1)%SEQ.length];
 var url=BASE+idx+".webp?v=1";
 var old=document.getElementById("pt-scene");if(old)old.remove();
 var root=document.createElement("div");root.id="pt-scene";root.className="pt-scene";
 root.innerHTML='<div class="pt-far"></div><div class="pt-pan"><img class="pt-img" alt="" draggable="false"><div class="pt-glints"></div></div><div class="pt-light"></div><div class="pt-rays"></div><canvas class="pt-fx"></canvas><div class="pt-flash"></div><div class="pt-vig"></div><div class="pt-scrim"></div>';
 document.body.insertBefore(root,document.body.firstChild);document.body.classList.add("pt-on");
 var far=root.querySelector(".pt-far"),pan=root.querySelector(".pt-pan"),img=root.querySelector(".pt-img"),gl=root.querySelector(".pt-glints"),cv=root.querySelector(".pt-fx"),cx=cv.getContext("2d");
 far.style.backgroundImage="url("+url+")";
 var vw=0,vh=0,pw=0,ph=0,iw=1774,ih=887,dpr=Math.min(window.devicePixelRatio||1,1.5);
 /* camera: zoom s and offset in px; "focus" adds a small push-in while the teacher speaks */
 var cam={x:0,y:0,s:1.18},from={x:0,y:0,s:1.18},to={x:0,y:0,s:1.3},t0=0,dur=12000,focus=0,focusT=0,alive=true,raf=0,tStart=performance.now();
 function size(){
  vw=window.innerWidth;vh=window.innerHeight;
  var c=Math.max(vw/iw,vh/ih);pw=iw*c;ph=ih*c;
  pan.style.width=pw+"px";pan.style.height=ph+"px";pan.style.marginLeft=(-pw/2)+"px";pan.style.marginTop=(-ph/2)+"px";
  cv.width=Math.round(vw*dpr);cv.height=Math.round(vh*dpr);
 }
 function bounds(s){return {x:Math.max(0,(pw*s-vw)/2),y:Math.max(0,(ph*s-vh)/2)};}
 function pick(){
  from={x:cam.x,y:cam.y,s:cam.s};
  var s=rnd(1.16,1.52);while(Math.abs(s-from.s)<.12)s=rnd(1.16,1.52);
  var b=bounds(s),k=.88;
  var x=rnd(-b.x,b.x)*k,y=rnd(-b.y,b.y)*k;
  /* keep real travel: avoid picking a spot too close to where we already are */
  var tries=0;while(tries++<6&&Math.hypot(x-from.x,(y-from.y)*1.4)<Math.min(vw,vh)*.35){x=rnd(-b.x,b.x)*k;y=rnd(-b.y,b.y)*k;}
  to={x:x,y:y,s:s};t0=performance.now();dur=rnd(11000,17000);
 }
 function apply(now){
  var t=Math.min(1,(now-t0)/dur);if(t>=1)pick();
  var e=ease(Math.min(1,(now-t0)/dur));
  cam.x=from.x+(to.x-from.x)*e;cam.y=from.y+(to.y-from.y)*e;cam.s=from.s+(to.s-from.s)*e;
  focus+=(focusT-focus)*.04;
  var tt=(now-tStart)/1000,sway=Math.sin(tt*.42)*.0035,swx=Math.sin(tt*.33)*vw*.006,swy=Math.cos(tt*.27)*vh*.005;
  var s=cam.s*(1+focus*.07);
  var b=bounds(s),x=Math.max(-b.x,Math.min(b.x,cam.x+swx)),y=Math.max(-b.y,Math.min(b.y,cam.y+swy));
  pan.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) rotate("+(sway*57.3*.5).toFixed(3)+"deg) scale("+s.toFixed(4)+")";
  far.style.transform="translate3d("+(-x*.35).toFixed(1)+"px,"+(-y*.35).toFixed(1)+"px,0) scale("+(1.25+(s-1)*.2).toFixed(3)+")";
 }
 /* glints: found on the brightest spots of the painting, so they sit on water, snow, lamps, windows */
 function makeGlints(){
  try{
   var c=document.createElement("canvas"),W=96,H=48;c.width=W;c.height=H;var g=c.getContext("2d");g.drawImage(img,0,0,W,H);
   var d=g.getImageData(0,0,W,H).data,cells=[];
   for(var y=0;y<H;y++)for(var x=0;x<W;x++){var i=(y*W+x)*4,l=(d[i]*.3+d[i+1]*.59+d[i+2]*.11)/255;if(l>.82)cells.push([x,y]);}
   var n=Math.min(30,cells.length);
   for(var k=0;k<n;k++){var p=cells.splice(Math.floor(Math.random()*cells.length),1)[0],s=document.createElement("span");s.className="pt-gl";
    s.style.left=((p[0]+Math.random())/W*100)+"%";s.style.top=((p[1]+Math.random())/H*100)+"%";
    s.style.setProperty("--g",rnd(12,26).toFixed(0)+"px");s.style.setProperty("--d",rnd(3,6.5).toFixed(1)+"s");s.style.setProperty("--l","-"+rnd(0,6).toFixed(1)+"s");gl.appendChild(s);}
  }catch(e){}
 }
 /* particles */
 var kind=FX[idx]||"dust",P=[],conf=[];
 function mk(initial){
  var p={x:rnd(0,vw),y:initial?rnd(0,vh):-20,r:0,vx:0,vy:0,ph:rnd(0,6.28),sw:rnd(.4,1.1),a:rnd(.35,.9),rot:rnd(0,6.28),vr:rnd(-1,1)};
  var u=vh/800;
  if(kind==="snow"){p.r=rnd(1.5,4.5)*u;p.vy=rnd(22,60)*u;p.vx=rnd(-10,10)*u;}
  else if(kind==="petal"){p.r=rnd(3,6.5)*u;p.vy=rnd(16,38)*u;p.vx=rnd(10,34)*u;p.col=Math.random()<.7?"255,182,205":"255,236,240";}
  else if(kind==="leaf"){p.r=rnd(3,6)*u;p.vy=rnd(14,34)*u;p.vx=rnd(-18,16)*u;p.col=Math.random()<.55?"172,214,96":"238,196,86";}
  else if(kind==="sparkle"){p.r=rnd(1,2.6)*u;p.vy=-rnd(6,20)*u;p.vx=rnd(4,16)*u;p.y=initial?rnd(vh*.35,vh):vh+10;}
  else{p.r=rnd(1.2,3.4)*u;p.vy=-rnd(5,16)*u;p.vx=rnd(-5,9)*u;p.y=initial?rnd(0,vh):vh+10;p.col=kind==="pollen"?"255,236,150":"255,244,214";}
  return p;
 }
 function fxStep(dt,now){
  cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,vw,vh);
  var dim=1-focus*.35;
  for(var i=0;i<P.length;i++){var p=P[i];
   p.ph+=dt*p.sw;p.x+=(p.vx+Math.sin(p.ph)*14*(vh/800))*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt*1.6;
   if(p.y>vh+30||p.y<-40||p.x>vw+40||p.x<-40){P[i]=mk(false);if(p.vy<0)P[i].y=vh+10;continue;}
   var a=p.a*dim;
   if(kind==="snow"||kind==="dust"||kind==="pollen"||kind==="sparkle"){
    var col=kind==="snow"?"255,255,255":(p.col||"255,244,214"),g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3.2);
    var tw=kind==="sparkle"?(.5+.5*Math.sin(now/260+p.ph*3)):1;
    g.addColorStop(0,"rgba("+col+","+(a*tw)+")");g.addColorStop(.35,"rgba("+col+","+(a*.4*tw)+")");g.addColorStop(1,"rgba("+col+",0)");
    cx.fillStyle=g;cx.beginPath();cx.arc(p.x,p.y,p.r*3.2,0,6.283);cx.fill();
   }else{
    cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.scale(1,.55+.45*Math.abs(Math.sin(p.ph*1.3)));
    cx.fillStyle="rgba("+p.col+","+(a*.9)+")";cx.beginPath();cx.ellipse(0,0,p.r*1.5,p.r,0,0,6.283);cx.fill();cx.restore();
   }
  }
  for(var j=conf.length-1;j>=0;j--){var c=conf[j];c.life-=dt;if(c.life<=0){conf.splice(j,1);continue;}
   c.vy+=260*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.rot+=c.vr*dt;
   cx.save();cx.globalAlpha=Math.min(1,c.life*1.4);cx.translate(c.x,c.y);cx.rotate(c.rot);cx.fillStyle=c.col;cx.fillRect(-c.w/2,-c.h/2,c.w,c.h);cx.restore();}
 }
 var last=performance.now();
 function loop(now){
  if(!alive)return;raf=requestAnimationFrame(loop);
  if(document.hidden){last=now;return;}
  var dt=Math.min(.05,(now-last)/1000);last=now;
  apply(now);fxStep(dt,now);
 }
 function ready(){root.classList.add("pt-in");document.body.classList.add("ps-ready");}
 function start(){
  size();makeGlints();
  var n=kind==="snow"?70:(kind==="petal"?34:30);for(var i=0;i<n;i++)P.push(mk(true));
  if(RM){pan.style.transform="translate3d(0,0,0) scale(1.12)";ready();return;}
  pick();from={x:0,y:0,s:1.16};cam.s=1.16;t0=performance.now();last=t0;raf=requestAnimationFrame(loop);
  requestAnimationFrame(ready);
 }
 var started=false,cur=0,swapT=0,swapping=false;
 function swapNext(){
  if(!alive||swapping||!started||RM)return;swapping=true;cur++;
  var nu=BASE+SEQ[((lesson-1)+cur)%SEQ.length]+".webp?v=1";
  var pre=new Image();
  pre.onload=function(){
   pan.style.transition=far.style.transition="opacity .9s ease";pan.style.opacity=far.style.opacity="0";
   setTimeout(function(){
    if(!alive)return;
    img.onload=function(){iw=img.naturalWidth||iw;ih=img.naturalHeight||ih;size();gl.innerHTML="";try{makeGlints();}catch(e){}pan.style.opacity=far.style.opacity="1";swapping=false;};
    far.style.backgroundImage="url("+nu+")";img.src=nu;
   },950);
  };
  pre.onerror=function(){swapping=false;};
  pre.src=nu;
 }
 swapT=setInterval(swapNext,38000);
 img.onload=function(){iw=img.naturalWidth||iw;ih=img.naturalHeight||ih;started=true;start();};
 img.onerror=function(){ready();};
 img.src=url;
 window.addEventListener("resize",size);
 var colors=["#ffd93d","#ff6ec7","#6ee7ff","#9dff8a","#ffffff","#ff9a5c"];
 var api={
  root:root,
  yourTurn:function(){focusT=.25;root.classList.remove("pt-rec");},
  cheer:function(){
   root.classList.remove("pt-cheer");void root.offsetWidth;root.classList.add("pt-cheer");
   if(RM)return;
   for(var i=0;i<46;i++)conf.push({x:vw*rnd(.2,.8),y:vh*rnd(.18,.34),vx:rnd(-220,220),vy:rnd(-320,-80),w:rnd(5,10),h:rnd(3,6),rot:rnd(0,6.28),vr:rnd(-9,9),life:rnd(1.2,2.2),col:colors[i%colors.length]});
  },
  calm:function(){focusT=0;root.classList.remove("pt-rec");},
  listen:function(){focusT=1;},
  micState:function(s){root.classList.toggle("pt-rec",s==="rec");focusT=s==="rec"?.5:focusT;},
  next:swapNext,destroy:function(){alive=false;clearInterval(swapT);cancelAnimationFrame(raf);window.removeEventListener("resize",size);root.remove();document.body.classList.remove("pt-on");document.body.classList.remove("ps-ready");}
 };
 return api;
}
window.PetitsScene={mount:mount,order:SEQ};
})();
