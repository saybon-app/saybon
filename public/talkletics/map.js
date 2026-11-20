(function(){
  var BASE="/assets/talkletics/map/";
  var mapEl=document.getElementById("tkmMap");
  try{history.scrollRestoration="manual";}catch(e){}
  var L=null,P=null,state=null;

  function unlockedCount(){
    var q=new URLSearchParams(location.search).get("unlocked");
    if(q&&/^\d+$/.test(q))return Math.min(50,Math.max(1,+q));
    try{var v=parseInt(localStorage.getItem("tkMapUnlocked"),10);if(v>0)return Math.min(50,v);}catch(e){}
    return 1;
  }
  function dev(){return window.matchMedia("(max-width:768px)").matches?"mobile":"desktop";}

  // Lay all 50 places along the road. Open places are big (fill the road), locked ones small;
  // each place takes the room it needs, so everything after an open place shifts to make space.
  function layout(c,un){
    var res=[],tile=0,cursor=c.s0,i=0,k;
    function pathOf(t){return t===0?c.start:c.cont;}
    function lenOf(t){return t===0?c.startLen:c.contLen;}
    function pt(t,s){ // s = arc length from the bottom of tile t
      var a=pathOf(t),l=lenOf(t),f=Math.min(a.length-1,Math.max(0,s/l*(a.length-1))),i0=Math.floor(f),t1=f-i0,p0=a[i0],p1=a[Math.min(a.length-1,i0+1)];
      return [p0[0]+(p1[0]-p0[0])*t1,p0[1]+(p1[1]-p0[1])*t1];
    }
    for(k=0;k<50;k++){
      var w=(k<un?c.big:c.small)*c.w,half=w*0.54;
      if(cursor+2*half>lenOf(tile)-c.tail){tile++;cursor=c.cstart;}
      var center=cursor+half,p=pt(tile,center);
      res.push({x:p[0]/c.w,yb:tile*c.h+(c.h-p[1]),tile:tile,w:w});
      cursor=center+half+c.small*c.w*0.3;
    }
    return res;
  }
  function visibleTiles(pts,un,c){
    var t=pts[un-1].tile,vt=t+1;
    if(un<pts.length&&pts[un].tile>t)vt=t+2;
    return vt;
  }
  // positions are percentages of the road stack itself, so they never depend on measured pixel sizes
  function style(b,pt,c,vt){
    b.style.left=(pt.x*100)+"%";b.style.bottom=(pt.yb/(vt*c.h)*100)+"%";b.style.width=(pt.w/c.w*100)+"%";
  }
  function build(b,p,open){
    b.className="tkm-node "+(open?"tkm-node-unlocked":"tkm-node-locked");
    b.setAttribute("aria-label",p.name+(open?"":" (locked)"));
    b.tabIndex=open?0:-1;
    var lk=b.querySelector(".tkm-lock");
    if(!open&&!lk){lk=document.createElement("span");lk.className="tkm-lock";lk.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';b.appendChild(lk);}
    if(open&&lk)lk.remove();
    b.onclick=open?function(){location.href=p.slug+".html";}:null;
  }

  function render(animate){
    var d=dev(),c=L[d],un=unlockedCount(),pts=layout(c,un),vt=Math.min(visibleTiles(pts,un,c),99);
    mapEl.innerHTML="";
    var stack=document.createElement("div");stack.className="tkm-stack";mapEl.appendChild(stack);
    for(var i=vt-1;i>=0;i--){var im=new Image();im.className="bg";im.alt="";im.draggable=false;im.src=BASE+"bg/"+d+"-"+(i===0?"start":"cont")+".webp";stack.appendChild(im);}
    var nodes=[];
    for(var k=0;k<50;k++){
      if(pts[k].tile>=vt)break;
      var p=P[k],b=document.createElement("button");
      var img=new Image();img.className="tkm-node-img";img.alt=p.name;img.src=BASE+"places/"+p.img;
      var bd=new Image();bd.className="tkm-node-badge";bd.alt="";bd.src=BASE+"badges/"+p.badge;
      b.appendChild(img);b.appendChild(bd);
      build(b,p,k<un);style(b,pts[k],c,vt);
      stack.appendChild(b);nodes.push(b);
    }
    state={d:d,un:un,vt:vt,nodes:nodes,c:c};
    var bgs=[].slice.call(mapEl.querySelectorAll("img.bg")),left=bgs.length;
    function ready(){
      if(--left>0)return;
      window.scrollTo(0,document.documentElement.scrollHeight);
      nodes.forEach(function(n,i){
        if(animate===false){n.classList.add("tkm-node-visible");return;}
        setTimeout(function(){n.classList.add("tkm-node-visible");},500+i*320);
      });
    }
    bgs.forEach(function(g){if(g.complete)ready();else{g.onload=g.onerror=ready;}});
  }

  // When a place unlocks: it grows and everything after it makes room, smoothly, in place.
  function refresh(){
    var un=unlockedCount();
    if(!state||un===state.un)return;
    var c=state.c,pts=layout(c,un),vt=visibleTiles(pts,un,c);
    if(vt!==state.vt||dev()!==state.d){render(false);return;}
    state.nodes.forEach(function(b,k){build(b,P[k],k<un);style(b,pts[k],c,vt);});
    state.un=un;
  }
  window.tkMapSetUnlocked=function(n){try{localStorage.setItem("tkMapUnlocked",String(n));}catch(e){}refresh();};
  window.addEventListener("storage",function(e){if(e.key==="tkMapUnlocked")refresh();});

  Promise.all([fetch(BASE+"layout.json?v=9").then(function(r){return r.json();}),fetch(BASE+"places.json?v=9").then(function(r){return r.json();})])
    .then(function(a){
      L=a[0];P=a[1];
      var pre=new Image();pre.onload=pre.onerror=function(){render();};pre.src=BASE+"bg/"+dev()+"-start.webp";
      var rt,lw=window.innerWidth;window.addEventListener("resize",function(){if(window.innerWidth===lw)return;lw=window.innerWidth;clearTimeout(rt);rt=setTimeout(function(){render(false);},200);});
    }).catch(function(e){console.error(e);mapEl.innerHTML="<p style='text-align:center;color:#fff;font-weight:700;padding:80px 20px;'>Could not load the map. Please try again.</p>";});
})();
