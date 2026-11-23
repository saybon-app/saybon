/* French for Professionals: opens the regular lesson engine with one OR MORE regular lessons joined as a single lesson.
   Page address: /levels/<level>/pro/lessonN.html?c=1,2&ret=/professional/hub.html...  (c = the regular lessons to join) */
(function(){
 var q=new URLSearchParams(location.search),list=(q.get("c")||"").split(",").map(Number).filter(function(n){return n>0});
 try{if(q.get("ret"))sessionStorage.setItem("sbpro_ret",q.get("ret"))}catch(e){}
 var of=window.fetch.bind(window);
 function isDone(r){return /well\s*done/i.test(String(r&&r.partTitle||""))}
 window.fetch=function(u,o){
  var s=typeof u==="string"?u:(u&&u.url)||"";
  var m=s.match(/^(.*)\/api\/levelAssets\?level=([^&]+)&lesson=(\d+)/);
  if(m&&list.length>1){
   return Promise.all(list.map(function(n){return of(m[1]+"/api/levelAssets?level="+m[2]+"&lesson="+n).then(function(r){return r.json()}).catch(function(){return[]})})).then(function(arr){
    var out=[],off=0;
    arr.forEach(function(a,i){
     a=a||[];var last=i===arr.length-1,mx=0,keep=[];
     a.forEach(function(x){var p=Number(x.part)||0;if(!last&&isDone(x))return;keep.push(x);if(p>mx)mx=p});
     /* closing "Well done" part is kept only once, at the very end; parts after it are renumbered */
     var parts=Array.from(new Set(keep.map(function(x){return Number(x.part)||0}))).sort(function(a,b){return a-b});
     keep.forEach(function(x){var c=Object.assign({},x);c.part=off+parts.indexOf(Number(x.part)||0)+1;out.push(c)});
     off+=parts.length;
    });
    return new Response(JSON.stringify(out),{status:200,headers:{"Content-Type":"application/json"}});
   });
  }
  if(list.length>1&&/\/api\/levelProgressComplete/.test(s)&&o&&String(o.method).toUpperCase()==="POST"){
   try{var b=JSON.parse(o.body);return Promise.all(list.map(function(n){var c=Object.assign({},b,{lesson:n});return of(u,Object.assign({},o,{body:JSON.stringify(c)}))})).then(function(r){return r[0]})}catch(e){}
  }
  return of(u,o);
 };
})();
/* the professional picture replaces the regular scene behind the lesson */
(function(){
 var q=new URLSearchParams(location.search),G=q.get("g"),LV=(q.get("lv")||"").toLowerCase();if(!G)return;
 function add(){
  var d=document.createElement("div");d.id="probg";d.style.cssText="position:fixed;inset:0;z-index:1;overflow:hidden;pointer-events:none;background:#10241d";
  var im=document.createElement("img");im.alt="";im.style.cssText="position:absolute;left:-6%;top:-6%;width:112%;height:112%;object-fit:cover;animation:sbProPan 50s ease-in-out infinite";var st=document.createElement("style");st.textContent="@keyframes sbProPan{0%{transform:scale(1.06) translateX(-4%)}40%{transform:scale(1.1) translateX(4%)}75%{transform:scale(1.08) translateX(0)}100%{transform:scale(1.06) translateX(-4%)}} .pc-mic svg circle{fill:currentColor!important} body .pc{background:linear-gradient(160deg,rgba(255,255,255,.26),rgba(255,255,255,.12))!important;-webkit-backdrop-filter:blur(18px) saturate(1.3)!important;backdrop-filter:blur(18px) saturate(1.3)!important}";document.head.appendChild(st);
  var sh=document.createElement("div");sh.style.cssText="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.66),rgba(0,0,0,.44) 35%,rgba(0,0,0,.5) 60%,rgba(0,0,0,.84))";
  d.appendChild(im);d.appendChild(sh);document.body.appendChild(d);
  var tall=innerHeight>innerWidth,list=[],names=tall?["tall","wide"]:["wide","tall"];
  names.forEach(function(n){list.push("/professional/scenario/img/"+G+"-"+LV+"-"+n+".webp")});
  var h=0,key=G+LV;for(var c=0;c<key.length;c++)h=(h*31+key.charCodeAt(c))%7;
  if(tall)list.push("/professional/scenario/img/gen-t"+((h+1)===2?2:1)+".webp");list.push("/professional/scenario/img/gen-"+(h+1)+".webp");
  var i=0;im.onerror=function(){i++;if(i<list.length)im.src=list[i]};im.src=list[0];
 }
 if(document.body)add();else document.addEventListener("DOMContentLoaded",add);
})();
