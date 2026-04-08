const toggleBtn = document.getElementById("toggleBtn");
const introMore = document.getElementById("introMore");

let open = false;

toggleBtn.addEventListener("click", () => {
  open = !open;

  if (open) {
    introMore.classList.add("open");
    toggleBtn.textContent = "Read less ↑";
  } else {
    introMore.classList.remove("open");
    toggleBtn.textContent = "Read more →";
  }
});
