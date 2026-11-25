(function(){try{
var c=JSON.parse(localStorage.getItem("sb_dash")||"null")||{};
var q=function(s){return document.querySelectorAll(s)};
var lv="";try{lv=sessionStorage.getItem("saybon_level")||localStorage.getItem("sb_level_cache")||""}catch(e){}
q(".js-profile-level").forEach(function(e){e.textContent=lv});
if(c.name)q(".dash-profile-name").forEach(function(e){e.textContent=c.name});
q(".dash-avatar").forEach(function(a){if(c.photo){a.textContent="";var i=document.createElement("img");i.alt="";i.src=c.photo;a.appendChild(i)}else if(c.name){a.textContent=c.name.charAt(0).toUpperCase()}});
var s=+c.streak||0,m=Math.floor(+c.minutes||0),g=+c.goal||10,C=2*Math.PI*42,p=Math.min(m/g,1);
q(".js-streak-num").forEach(function(e){e.textContent=s});
if(s>0)q(".dash-streak-flame").forEach(function(f){f.classList.add("lit")});
q(".js-goal-ring-fill").forEach(function(r){r.style.strokeDasharray=C;r.style.strokeDashoffset=C*(1-p);if(p>=1)r.classList.add("is-done")});
q(".dash-goal-ring-wrap").forEach(function(w){w.classList.toggle("is-done",p>=1)});
q(".js-goal-minutes").forEach(function(e){e.textContent=m});
q(".dash-goal-ring-text small").forEach(function(e){e.textContent="/"+g+" min"});
if(c.cap&&c.cap.length===2)q(".js-goal-caption").forEach(function(cap){cap.classList.add("sb-ticker");cap.textContent="";var d=document.createElement("div");d.className="tk in";var h=document.createElement("span");h.className="tk-h";h.textContent=c.cap[0];var t=document.createElement("span");t.className="tk-s";t.textContent=c.cap[1];d.appendChild(h);d.appendChild(t);cap.appendChild(d)});
}catch(e){}})();
