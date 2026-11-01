// One tiny wiggle on the tile emoji, then navigate. Skipped for reduced motion.
(function(){
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.addEventListener("click", function(e){
    var card = e.target.closest && e.target.closest(".dash-card");
    if (!card || card.dataset.go === "1") return;
    e.preventDefault(); e.stopImmediatePropagation();
    card.classList.add("dp-wiggle");
    setTimeout(function(){ card.dataset.go = "1"; card.click(); }, 240);
  }, true);
})();
