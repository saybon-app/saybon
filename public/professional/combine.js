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
