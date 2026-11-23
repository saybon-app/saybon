/*SBFB-START score feedback: one clean word, the number kept quiet, and the teacher reacts out loud*/
(function(){
 if(window.__sbfb)return;window.__sbfb=1;
 var st=document.createElement("style");st.textContent=
  ".pc-res.sbr{flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:center;gap:18px}"+
  ".pc-res.sbr .pc-acts{display:contents}"+
  ".pc-res.sbr .pc-redo{order:1;flex:none}.pc-res.sbr .pc-fb{order:2}.pc-res.sbr .pc-next{order:3;flex:none}"+
  ".pc-fb.sb3{flex-direction:column;align-items:center;gap:3px}"+
  ".pc-fb.sb3 .pc-sc{width:auto;height:auto;background:none;border-radius:0;display:block}"+
  ".pc-fb.sb3 .pc-sc::before{display:none}"+
  ".pc-fb.sb3 .pc-sc b{font:600 2.1rem/1 Poppins,Manrope,system-ui,sans-serif;letter-spacing:.01em;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.45)}"+
  ".pc-fb.sb3 .pc-sc small{font-size:.95rem;opacity:.8;margin-left:1px}"+
  ".pc-fb.sb3 .pc-msg{font:500 .72rem/1 Poppins,Manrope,system-ui,sans-serif;font-style:normal;letter-spacing:.16em;text-transform:uppercase;color:#ffe2a0;text-shadow:0 1px 8px rgba(0,0,0,.5);animation:sbfbIn .55s cubic-bezier(.2,.8,.2,1) both}"+
  ".pc-fb.sb3 .pc-msg small{display:none}"+
  ".pc-res:has(.pc-fb.sb3) .pc-chips{display:none}"+
  ".pc{position:relative}.pc:has(.pc-skip){padding-bottom:44px!important}"+
  ".pc .pc-skip{position:absolute!important;right:14px;bottom:12px;left:auto!important;margin:0!important;padding:5px 12px!important;font-size:.58rem!important;min-height:0!important;width:auto!important}"+
  "@keyframes sbfbIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}";
 document.head.appendChild(st);
 var CLIPS={wow:4,good:4,try:4,none:2,k3:4,k2:4,k1:4,kn:2},WORD={wow:"Très bien",good:"Pas mal",try:"Encore une fois"},last={};
 function style(){var l=String(window.__psLevel||"").toLowerCase();if(/^a0/.test(l))return"en";if(/^(a1|a2)/.test(l))return"mix";return"fr"}
 function band(t){t=t.toLowerCase();if(/^bravo/.test(t))return"wow";if(/^tr[eè]s bien/.test(t))return"good";if(/^bon effort/.test(t))return"try";if(/^encore une fois/.test(t))return"try";if(/rien entendu/.test(t))return"none";return""}
 function play(b){
  var n=CLIPS[b],k=1+Math.floor(Math.random()*n);if(n>1&&k===last[b])k=k%n+1;last[b]=k;
  try{var a=new Audio("/audio/feedback/"+(b.charAt(0)==="k"?"kids-"+b:style()+"-"+b)+"-"+k+".mp3");a.volume=1;var p=a.play();if(p&&p.catch)p.catch(function(){})}catch(e){}
 }
 function fix(fb){
  if(!fb||fb.__sb)return;
  var stars=fb.querySelector(".pc-stars");
  if(stars){fb.__sb=1;var on=stars.querySelectorAll("span:not(.off)").length;play(on>=3?"k3":on===2?"k2":"k1");return}
  var m=fb.querySelector(".pc-msg");if(!m)return;
  if(/^je ne t.entends pas/i.test((m.textContent||"").trim())&&/petits/.test(String(window.__psLevel||""))){fb.__sb=1;play("kn");return}
  var first=(m.childNodes[0]&&m.childNodes[0].textContent||"").trim(),b=band(first);if(!b)return;
  fb.__sb=1;
  if(b==="none"){play(b);return}
  fb.classList.add("sb3");var rs=fb.parentNode,ac=rs&&rs.querySelector(".pc-acts");if(rs&&ac&&ac.style.display!=="none")rs.classList.add("sbr");m.childNodes[0].textContent=WORD[b];
  play(b);
 }
 new MutationObserver(function(ms){ms.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType!==1)return;if(n.classList&&n.classList.contains("pc-fb"))fix(n);else if(n.querySelectorAll)n.querySelectorAll(".pc-fb").forEach(fix)})})}).observe(document.documentElement,{childList:true,subtree:true});
})();
/*SBFB-END*/
