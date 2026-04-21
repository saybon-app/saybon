const options = document.querySelectorAll(".why-option");
const optionsGrid = document.getElementById("optionsGrid");

let locked = false;

function getFallClass(index, total, selectedIndex) {
  if (index === selectedIndex) return "";

  if (total === 4) {
    if (index === 0) return "fall-left";
    if (index === 1) return "fall-right";
    if (index === 2) return "fall-left";
    if (index === 3) return "fall-right";
  }

  return index < selectedIndex ? "fall-left" : "fall-right";
}

options.forEach((btn, selectedIndex) => {
  btn.addEventListener("click", () => {
    if (locked) return;
    locked = true;

    optionsGrid.classList.add("is-animating");

    options.forEach((option, index) => {
      if (option === btn) return;

      const fallClass = getFallClass(index, options.length, selectedIndex);
      if (fallClass) {
        option.classList.add(fallClass);
      } else {
        option.classList.add("fall-down");
      }
    });

    setTimeout(() => {
      btn.classList.add("chosen");
    }, 120);

    setTimeout(() => {
      sessionStorage.setItem("saybon_reason", btn.dataset.reason || "");
      sessionStorage.setItem("saybon_next", "/start.html");
      window.location.href = "/loader.html";
    }, 1850);
  });
});
