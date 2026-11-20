(function(){
  var BASE="/assets/talkletics/map/";
  var mapEl=document.getElementById("tkmMap");
  try{history.scrollRestoration="manual";}catch(e){}

  function unlockedCount(){
    var q=new URLSearchParams(location.search).get("unlocked");
    if(q&&/^\d+$/.test(q))return Math.min(50,Math.max(1,+q));
    try{var v=parseInt(localStorage.getItem("tkMapUnlocked"),10);if(v>0)return Math.min(50,v);}catch(e){}
    return 1;
  }

  function render(L,places){
    var dev=window.matchMedia("(max-width:768px)").matches?"mobile":"desktop";
    var c=L[dev],un=unlockedCount(),pts=c.points;
    // tiles shown: the tile holding the latest unlocked button; the next tile appears once that tile's last button is unlocked
    var t=pts[un-1].tile,vt=t+1;
    if(un<pts.length&&pts[un].tile>t)vt=t+2;
    vt=Math.min(vt,c.tiles.length);
    mapEl.innerHTML="";
    // DOM order: top of page first; tile 0 (START) is the bottom one
    for(var i=vt-1;i>=0;i--){var im=new Image();im.className="bg";im.alt="";im.draggable=false;im.src=BASE+"bg/"+dev+"-"+(i===0?"start":"cont")+".webp";mapEl.appendChild(im);}
    var scale=mapEl.clientWidth/c.w;
    mapEl.style.setProperty("--bw",(c.btnW*mapEl.clientWidth)+"px");
    var nodes=[];
    for(var k=0;k<pts.length;k++){
      if(pts[k].tile>=vt)break;
      var p=places[k],pt=pts[k],open=k<un;
      var b=document.createElement("button");
      b.className="tkm-node "+(open?"tkm-node-unlocked":"tkm-node-locked");
      b.style.left=(pt.x*100)+"%";b.style.bottom=(pt.yb*scale)+"px";b.style.width=(c.btnW*100)+"%";
      b.setAttribute("aria-label",(k+1)+" "+p.name+(open?"":" (locked)"));
      if(!open)b.tabIndex=-1;
      var im2=new Image();im2.className="tkm-node-img";im2.alt=p.name;im2.src=BASE+"places/"+p.img;
      var bd=new Image();bd.className="tkm-node-badge";bd.alt="";bd.src=BASE+"badges/"+p.badge;
      b.appendChild(im2);b.appendChild(bd);
      if(!open){var lk=document.createElement("span");lk.className="tkm-lock";lk.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';b.appendChild(lk);}
      else{(function(page){b.addEventListener("click",function(){location.href=page;});})(p.slug+".html");}
      mapEl.appendChild(b);nodes.push(b);
    }
    // open on START: jump to the very bottom, then the buttons appear one after the other from the bottom up
    var bgs=[].slice.call(mapEl.querySelectorAll("img.bg")),left=bgs.length;
    function ready(){if(--left>0)return;window.scrollTo(0,document.documentElement.scrollHeight);nodes.forEach(function(n,i){setTimeout(function(){n.classList.add("tkm-node-visible");},500+i*320);});}
    bgs.forEach(function(g){if(g.complete)ready();else{g.onload=g.onerror=ready;}});
  }

  Promise.all([fetch(BASE+"layout.json").then(function(r){return r.json();}),fetch(BASE+"places.json").then(function(r){return r.json();})])
    .then(function(a){
      var L=a[0],P=a[1],dev0=window.matchMedia("(max-width:768px)").matches;
      var imgs=[].slice.call(document.images),go=function(){render(L,P);};
      // wait for the road images so the page height is right before scrolling to the bottom
      var pre=new Image();pre.onload=pre.onerror=go;pre.src=BASE+"bg/"+(dev0?"mobile":"desktop")+"-start.webp";
      var rt,lw=window.innerWidth;window.addEventListener("resize",function(){if(window.innerWidth===lw)return;lw=window.innerWidth;clearTimeout(rt);rt=setTimeout(go,200);});
    }).catch(function(e){console.error(e);mapEl.innerHTML="<p style='text-align:center;color:#fff;font-weight:700;padding:80px 20px;'>Could not load the map. Please try again.</p>";});
})();
