/* SayBon Music core - listening history, taste profile, recommendations, automatic playlists, shared sidebar.
   Loaded by /music/index.html, watch.html and playlists.html. Works signed-in (history also saved on the server)
   and degrades to this-device-only if the server is unreachable. */
(function(){
var API="https://saybonapp-server.onrender.com";
var S={uid:null,hist:[],liked:{},all:null,allP:null};
var GENRES=["Afro","Latin","Soul","Pop","Jazz","Country","Reggae","Classical","Gospel"];

function lsGet(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function ssGet(k,d){try{var v=JSON.parse(sessionStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
function ssSet(k,v){try{sessionStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function hkey(){return "sbm_hist_"+(S.uid||"guest");}
function post(path,body){return fetch(API+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(function(r){return r.json().catch(function(){return {};});});}

/* ---------- videos ---------- */
function getAll(){
  if(S.all)return Promise.resolve(S.all);
  if(S.allP)return S.allP;
  S.allP=fetch(API+"/api/musicVideos").then(function(r){return r.json();}).then(function(a){S.all=Array.isArray(a)?a:[];return S.all;}).catch(function(){S.allP=null;return [];});
  return S.allP;
}
function byId(all){var m={};all.forEach(function(v){m[v.id]=v;});return m;}

/* ---------- user + history ---------- */
function setUser(uid){
  S.uid=uid||null;
  S.hist=lsGet(hkey(),[]);
  if(!uid)return Promise.resolve();
  var a=fetch(API+"/api/musicHistory?userId="+encodeURIComponent(uid)).then(function(r){return r.json();}).then(function(rows){
    if(!Array.isArray(rows))return;
    var seen={};S.hist.forEach(function(e){seen[e.videoId+"|"+e.at]=e;});
    rows.forEach(function(e){var k=e.videoId+"|"+e.at;if(seen[k]){seen[k].pct=Math.max(seen[k].pct||0,e.pct||0);}else{S.hist.push(e);seen[k]=e;}});
    S.hist.sort(function(x,y){return x.at-y.at;});
    S.hist=S.hist.slice(-400);lsSet(hkey(),S.hist);
  }).catch(function(){});
  var b=fetch(API+"/api/musicLiked?userId="+encodeURIComponent(uid)).then(function(r){return r.json();}).then(function(ids){
    S.liked={};if(Array.isArray(ids))ids.forEach(function(i){S.liked[i]=1;});
  }).catch(function(){});
  return Promise.all([a,b]);
}
function setLiked(id,on){if(on)S.liked[id]=1;else delete S.liked[id];}
var cur=null;
function track(v,pct){
  if(!v||!v.id)return;
  if(!pct){cur={videoId:v.id,genre:v.genre||"",artist:v.artist||"",at:Date.now(),pct:0};S.hist.push(cur);}
  else if(cur&&cur.videoId===v.id){cur.pct=Math.max(cur.pct,pct);}
  else return;
  S.hist=S.hist.slice(-400);lsSet(hkey(),S.hist);
  if(S.uid)post("/api/musicHistoryAdd",{userId:S.uid,videoId:cur.videoId,genre:cur.genre,artist:cur.artist,at:cur.at,pct:cur.pct}).catch(function(){});
}

/* ---------- taste profile ---------- */
function decay(at){return Math.pow(.5,(Date.now()-at)/(14*864e5));}
function profile(all){
  var G={},A={},plays={},last={},lk={};
  S.hist.forEach(function(e){
    var w=decay(e.at)*(e.pct>=80?1.6:(e.pct>0?1:.7));
    if(e.genre)G[e.genre]=(G[e.genre]||0)+w;
    if(e.artist)A[e.artist]=(A[e.artist]||0)+w;
    plays[e.videoId]=(plays[e.videoId]||0)+1;
    last[e.videoId]=Math.max(last[e.videoId]||0,e.at);
  });
  (all||[]).forEach(function(v){if(S.liked[v.id]){if(v.genre)G[v.genre]=(G[v.genre]||0)+2;if(v.artist)A[v.artist]=(A[v.artist]||0)+2;}});
  function norm(o){var m=0,k;for(k in o)m=Math.max(m,o[k]);if(m)for(k in o)o[k]/=m;return o;}
  return {G:norm(G),A:norm(A),plays:plays,last:last,hasHistory:S.hist.length>0};
}
function popNorm(v,max){return max?Math.log(1+(v.views||0))/Math.log(1+max):0;}
function maxViews(all){var m=0;all.forEach(function(v){m=Math.max(m,v.views||0);});return m;}
function score(v,P,mv){
  var s=4*(P.G[v.genre]||0)+3*(P.A[v.artist]||0)+(S.liked[v.id]?1.2:0)+.6*popNorm(v,mv);
  var n=P.plays[v.id]||0;
  s+=n?-.35*Math.min(n,3):.7;
  if(P.last[v.id]&&Date.now()-P.last[v.id]<36e5)s-=3;
  return s;
}
function words(t){return String(t||"").toLowerCase().replace(/[^a-z0-9À-ſ ]/g," ").split(/\s+/).filter(function(w){return w.length>3;});}
function similar(curV,all,n){
  var P=profile(all),mv=maxViews(all),cw=words(curV.title);
  return all.filter(function(v){return v.id!==curV.id;}).map(function(v){
    var sim=(v.artist&&v.artist===curV.artist?3:0)+(v.genre===curV.genre?2:0);
    var vw=words(v.title),ov=0;cw.forEach(function(w){if(vw.indexOf(w)>-1)ov++;});
    sim+=Math.min(ov,2)*.75;
    return {v:v,s:sim+.5*score(v,P,mv)};
  }).sort(function(a,b){return b.s-a.s;}).slice(0,n||12).map(function(x){return x.v;});
}
function ts(v){var c=v.createdAt;if(!c)return 0;if(c._seconds)return c._seconds*1000;var d=new Date(c).getTime();return isNaN(d)?0:d;}

/* ---------- automatic playlists ---------- */
function recentUnique(all){
  var m=byId(all),seen={},out=[];
  for(var i=S.hist.length-1;i>=0;i--){var id=S.hist[i].videoId;if(!seen[id]&&m[id]){seen[id]=1;out.push(m[id]);}}
  return out;
}
function autoPlaylists(all){
  var P=profile(all),mv=maxViews(all),m=byId(all),out=[],now=Date.now();
  function add(id,title,sub,videos){if(videos&&videos.length)out.push({id:id,title:title,sub:sub,videos:videos});}
  if(P.hasHistory){
    var ranked=all.slice().sort(function(a,b){return score(b,P,mv)-score(a,P,mv);});
    add("foryou","Made for you","Picked from what you play and like",ranked.slice(0,20));
    add("recent","Recently played","Pick up where you left off",recentUnique(all).slice(0,20));
    var most=Object.keys(P.plays).filter(function(i){return m[i];}).sort(function(a,b){return P.plays[b]-P.plays[a];}).slice(0,20).map(function(i){return m[i];});
    if(most.length&&P.plays[most[0].id]>1)add("most","Your most played","The ones you keep coming back to",most);
    var tg=Object.keys(P.G).sort(function(a,b){return P.G[b]-P.G[a];})[0];
    if(tg)add("genre","Your "+tg+" mix","Because "+tg+" is what you play most",all.filter(function(v){return v.genre===tg;}).sort(function(a,b){return score(b,P,mv)-score(a,P,mv);}).slice(0,25));
    var ta=Object.keys(P.A).sort(function(a,b){return P.A[b]-P.A[a];})[0];
    if(ta){var av=all.filter(function(v){return v.artist===ta;});if(av.length>1)add("artist","More from "+ta,"You have been listening to "+ta,av.sort(function(a,b){return score(b,P,mv)-score(a,P,mv);}));}
    var re=all.filter(function(v){return (S.liked[v.id]||P.plays[v.id])&&(!P.last[v.id]||now-P.last[v.id]>14*864e5);}).sort(function(a,b){return (P.last[a.id]||0)-(P.last[b.id]||0);}).slice(0,20);
    add("rediscover","Rediscover","Songs you have not played in a while",re);
  }
  var liked=all.filter(function(v){return S.liked[v.id];});
  add("liked","Liked videos","Everything you have liked",liked);
  add("popular","Popular right now","Most played on SayBon Music",all.slice().sort(function(a,b){return (b.views||0)-(a.views||0);}).slice(0,20));
  add("fresh","Fresh uploads","The newest additions",all.slice().sort(function(a,b){return ts(b)-ts(a);}).slice(0,20));
  return out;
}

/* ---------- play queue ---------- */
function setQueue(ids,title){ssSet("sbm_queue",{ids:ids,title:title||"Queue"});}
function getQueue(){return ssGet("sbm_queue",null);}
function clearQueue(){try{sessionStorage.removeItem("sbm_queue");}catch(e){}}
function playList(videos,title){
  if(!videos||!videos.length)return;
  setQueue(videos.map(function(v){return v.id;}),title);
  location.href="/music/watch.html?v="+encodeURIComponent(videos[0].id)+"&q=1";
}

/* ---------- shared sidebar ---------- */
var IC={
 home:"<path d='m3 12 9-9 9 9M5 10v10h14V10'/>",
 foryou:"<path d='M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z'/>",
 history:"<circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/>",
 liked:"<path d='M20.8 4.6c-1.8-1.8-4.6-1.8-6.4 0L12 7l-2.4-2.4c-1.8-1.8-4.6-1.8-6.4 0-1.8 1.8-1.8 4.6 0 6.4L12 20l8.8-8.8c1.8-1.8 1.8-4.7 0-6.4z'/>",
 pl:"<path d='M21 15V6M18.5 18a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM12.5 20.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM9.5 6.5v14M21 6l-11.5.5'/>",
 g:"<path d='M9 18V5l12-2v13'/><circle cx='6' cy='18' r='3'/><circle cx='18' cy='16' r='3'/>"
};
function sbItem(id,ic,label,go,active){
  var d=document.createElement("div");d.className="sb-item"+(active?" active":"");if(id)d.id=id;
  d.innerHTML="<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'>"+IC[ic]+"</svg>"+esc(label);
  d.onclick=go;return d;
}
function buildSidebar(opts){
  var sb=document.getElementById("sidebar");if(!sb)return;
  opts=opts||{};var p=location.pathname,q=new URLSearchParams(location.search);
  var onIndex=/\/music\/(index\.html)?$/.test(p),onPl=/playlists\.html$/.test(p);
  var view=q.get("view"),genre=q.get("genre");
  sb.innerHTML="";
  function nav(url,fn){return function(){if(onIndex&&fn){fn();var o=document.getElementById("sidebarOverlay");sb.classList.remove("open");if(o)o.classList.remove("open");}else location.href=url;};}
  sb.appendChild(sbItem("sb-home","home","Home",nav("/music/index.html",function(){window.selectGenre("All");}),onIndex&&!view&&!genre));
  sb.appendChild(sbItem("sb-foryou","foryou","Made for you",nav("/music/index.html?view=foryou",function(){window.sbmView("foryou");}),onIndex&&view==="foryou"));
  sb.appendChild(sbItem("sb-history","history","History",nav("/music/index.html?view=history",function(){window.sbmView("history");}),onIndex&&view==="history"));
  sb.appendChild(sbItem("sb-liked","liked","Liked videos",nav("/music/index.html?view=liked",function(){window.sbmView("liked");}),onIndex&&view==="liked"));
  sb.appendChild(sbItem("sb-pl","pl","My Playlists",function(){location.href="/music/playlists.html";},onPl));
  var dv=document.createElement("div");dv.className="sb-divider";sb.appendChild(dv);
  var lb=document.createElement("div");lb.className="sb-section-label";lb.textContent="Genres";sb.appendChild(lb);
  GENRES.forEach(function(g){
    sb.appendChild(sbItem("sb-genre-"+g,"g",g,nav("/music/index.html?genre="+encodeURIComponent(g),function(){window.selectGenre(g);}),onIndex&&genre===g));
  });
}
function whenDom(fn){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn);else fn();}
whenDom(function(){buildSidebar();});

function ago(at){
  var m=Math.round((Date.now()-at)/6e4);if(m<1)return "just now";if(m<60)return m+" min ago";
  var h=Math.round(m/60);if(h<24)return h+" h ago";var d=Math.round(h/24);return d+(d===1?" day ago":" days ago");
}

window.SBM={API:API,GENRES:GENRES,esc:esc,getAll:getAll,byId:byId,setUser:setUser,setLiked:setLiked,track:track,
  profile:profile,score:score,similar:similar,autoPlaylists:autoPlaylists,recentUnique:recentUnique,
  setQueue:setQueue,getQueue:getQueue,clearQueue:clearQueue,playList:playList,buildSidebar:buildSidebar,
  history:function(){return S.hist.slice();},isLiked:function(id){return !!S.liked[id];},ago:ago,post:post,maxViews:maxViews,uid:function(){return S.uid;}};
})();