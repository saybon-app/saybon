/* First visit to Music: Eryn explains the "language bath" once, then the page carries on. Played only until it has actually started. */
(function(){
  var KEY="sb_music_intro_seen",U="/assets/audio/music/intro-eryn.mp3";
  try{if(localStorage.getItem(KEY))return}catch(e){}
  fetch(U,{method:"HEAD"}).then(function(r){
    var ct=(r.headers.get("content-type")||"").toLowerCase();
    if(!(r.ok&&ct.indexOf("audio")===0))return;
    var a=new Audio(U);a.preload="auto";
    a.addEventListener("playing",function(){try{localStorage.setItem(KEY,"1")}catch(e){}});
    var p=a.play();
    if(p&&p.catch)p.catch(function(){
      /* the browser wants a tap first: play on the first tap, and ignore it if the learner already started a song */
      var go=function(){document.removeEventListener("pointerdown",go,true);a.play().catch(function(){})};
      document.addEventListener("pointerdown",go,true);
    });
  }).catch(function(){});
})();
