(function(){
  var BASE="/assets/talkletics/map/";
  var mapEl=document.getElementById("tkmMap");
  var PER_PAGE=10;

  function unlockedCount(){
    var q=new URLSearchParams(location.search).get("unlocked");
    if(q&&/^\d+$/.test(q))return Math.min(50,Math.max(1,+q));
    try{var v=parseInt(localStorage.getItem("tkMapUnlocked"),10);if(v>0)return Math.min(50,v);}catch(e){}
    return 1;
  }

  function render(L,places){
    var dev=window.matchMedia("(max-width:768px)").matches?"mobile":"desktop";
    var c=L[dev],un=unlockedCount();
    var pages=Math.min(Math.ceil(50/PER_PAGE),1+Math.floor(un/PER_PAGE));
    var vis=Math.min(50,pages*PER_PAGE);
    var bwN=c.btnW*c.w,ymax=0;
    for(var i=0;i<vis;i++)ymax=Math.max(ymax,c.points[i].yb);
    var n=Math.max(0,Math.ceil((ymax+bwN*0.62+50-c.bottom)/c.tile));
    mapEl.innerHTML="";
    function bg(name){var im=new Image();im.className="bg";im.alt="";im.draggable=false;im.src=BASE+"bg/"+dev+"-"+name+".webp";mapEl.appendChild(im);}
    bg("top");for(var t=0;t<n;t++)bg("tile");bg("bottom");
    var scale=mapEl.clientWidth/c.w,bwPx=c.btnW*mapEl.clientWidth;
    mapEl.style.setProperty("--bw",bwPx+"px");
    var last=null;
    for(var k=0;k<vis;k++){
      var p=places[k],pt=c.points[k],open=k<un;
      var b=document.createElement("button");
      b.className="tkm-node "+(open?"tkm-node-unlocked":"tkm-node-locked");
      b.style.left=(pt.x*100)+"%";b.style.bottom=(pt.yb*scale)+"px";b.style.width=(c.btnW*100)+"%";
      b.setAttribute("aria-label",(k+1)+" "+p.name+(open?"":" (locked)"));
      if(!open)b.tabIndex=-1;
      var im=new Image();im.className="tkm-node-img";im.alt=p.name;im.src=BASE+"places/"+p.img;
      var bd=new Image();bd.className="tkm-node-badge";bd.alt="";bd.src=BASE+"badges/"+p.badge;
      b.appendChild(im);b.appendChild(bd);
      if(!open){var lk=document.createElement("span");lk.className="tkm-lock";lk.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';b.appendChild(lk);}
      else{last=b;(function(page){b.addEventListener("click",function(){location.href=page;});})(p.slug+".html");}
      mapEl.appendChild(b);
      (function(el,d){setTimeout(function(){el.classList.add("tkm-node-visible");},d);})(b,k*60);
    }
    if(!render.done&&last){render.done=1;setTimeout(function(){var r=last.getBoundingClientRect();window.scrollTo(0,Math.max(0,window.scrollY+r.top-window.innerHeight*0.55));},120);}
  }

  Promise.all([fetch(BASE+"layout.json").then(function(r){return r.json();}),fetch(BASE+"places.json").then(function(r){return r.json();})])
    .then(function(a){
      var L=a[0],P=a[1];render(L,P);
      var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){render(L,P);},150);});
    }).catch(function(e){console.error(e);mapEl.innerHTML="<p style='text-align:center;color:#fff;font-weight:700;padding:80px 20px;'>Could not load the map. Please try again.</p>";});
})();
