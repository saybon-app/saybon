/*SBFB-START score feedback: one clean word, the number kept quiet, and the teacher reacts out loud*/
(function(){
 if(window.__sbfb)return;window.__sbfb=1;
 var st=document.createElement("style");st.textContent=
  ".pc-fb.sb3{flex-direction:column-reverse;align-items:center;gap:6px}"+
  ".pc-fb.sb3 .pc-sc{width:auto;height:auto;background:none;border-radius:0;display:block}"+
  ".pc-fb.sb3 .pc-sc::before{display:none}"+
  ".pc-fb.sb3 .pc-sc b{font:500 .92rem/1 Manrope,system-ui,sans-serif;letter-spacing:.08em;color:rgba(255,255,255,.72)}"+
  ".pc-fb.sb3 .pc-sc small{font-size:.92rem;opacity:1;margin-left:1px}"+
  ".pc-fb.sb3 .pc-msg{font:700 1.9rem/1.1 Manrope,system-ui,sans-serif;font-style:normal;letter-spacing:.005em;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.45);animation:sbfbIn .55s cubic-bezier(.2,.8,.2,1) both}"+
  ".pc-fb.sb3 .pc-msg small{display:none}"+
  ".pc-fb.sb3 ~ .pc-chips,.pc-res:has(.pc-fb.sb3) .pc-chips{display:none}"+
  "@keyframes sbfbIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}";
 document.head.appendChild(st);
 var CLIPS={wow:4,good:4,try:4,none:2},WORD={wow:"Très bien",good:"Pas mal",try:"Encore une fois"},last={};
 function style(){var l=String(window.__psLevel||"").toLowerCase();if(/^a0/.test(l))return"en";if(/^(a1|a2)/.test(l))return"mix";return"fr"}
 function band(t){t=t.toLowerCase();if(/^bravo/.test(t))return"wow";if(/^tr[eè]s bien/.test(t))return"good";if(/^bon effort/.test(t))return"try";if(/^encore une fois/.test(t))return"try";if(/rien entendu/.test(t))return"none";return""}
 function play(b){
  var n=CLIPS[b],k=1+Math.floor(Math.random()*n);if(n>1&&k===last[b])k=k%n+1;last[b]=k;
  try{var a=new Audio("/audio/feedback/"+style()+"-"+b+"-"+k+".mp3");a.volume=1;var p=a.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
 }
 function fix(fb){
  if(!fb||fb.__sb||fb.querySelector(".pc-stars"))return;
  var m=fb.querySelector(".pc-msg");if(!m)return;
  var first=(m.childNodes[0]&&m.childNodes[0].textContent||"").trim(),b=band(first);if(!b)return;
  fb.__sb=1;
  if(b==="none"){play(b);return}
  fb.classList.add("sb3");m.childNodes[0].textContent=WORD[b];
  play(b);
 }
 new MutationObserver(function(ms){ms.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.classList&&n.classList.contains("pc-fb"))fix(n);else if(n.querySelectorAll)n.querySelectorAll(".pc-fb").forEach(fix)})})}).observe(document.documentElement,{childList:true,subtree:true});
})();
/*SBFB-END*/
