document.querySelectorAll(".history-card").forEach(card => {
card.addEventListener("click", () => {

document.querySelectorAll(".history-card")
.forEach(c => c.classList.remove("active"));

card.classList.add("active");

});
});

document.querySelectorAll("button").forEach(btn => {

btn.addEventListener("click", () => {

btn.style.transform = "scale(.95)";

setTimeout(() => {
btn.style.transform = "";
},120);

});

});
