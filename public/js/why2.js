(function(){
  var cards=[].slice.call(document.querySelectorAll(".w2-card")),busy=false;
  var home=document.getElementById("whyHomeBtn");
  if(home)home.addEventListener("click",function(){try{if(window.stopAppBgMusic)window.stopAppBgMusic();}catch(e){}location.href="/";});
  cards.forEach(function(c){
    c.addEventListener("click",function(){
      if(busy)return;busy=true;
      try{sessionStorage.setItem("saybon_reason",c.getAttribute("data-reason")||"");}catch(e){}
      c.classList.add("picked");
      cards.forEach(function(o){if(o!==c)o.classList.add("dim");});
      setTimeout(function(){document.body.classList.add("leaving");},450);
      setTimeout(function(){location.href="/start.html";},800);
    });
  });
})();
