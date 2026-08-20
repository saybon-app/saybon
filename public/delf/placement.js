(function(){
  var content = document.getElementById("dfContent");
  var heroBtn = document.getElementById("dfToggleBtn");

  function toggle(){
    var isOpen = content.classList.toggle("df-open");
    heroBtn.textContent = isOpen ? "Show Less" : "Learn Everything About This Service";
    if(isOpen){
      setTimeout(function(){
        content.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }

  heroBtn.addEventListener("click", toggle);
})();
