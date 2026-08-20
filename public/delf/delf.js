(function(){
  var content = document.getElementById("dfContent");
  var seeFullBtn = document.getElementById("dfSeeFullBtn");
  var heroBtn = document.getElementById("dfToggleBtn");
  var chevron = document.getElementById("dfChevron");

  function toggle(){
    var isOpen = content.classList.toggle("df-open");
    seeFullBtn.classList.toggle("df-flipped", isOpen);
    seeFullBtn.querySelector("span").textContent = isOpen ? "Show Less" : "See Full";
    if(isOpen){
      setTimeout(function(){
        content.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }

  seeFullBtn.addEventListener("click", toggle);
  heroBtn.addEventListener("click", toggle);
})();