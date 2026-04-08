const options = document.querySelectorAll(".why-option");
const affirmationBox = document.getElementById("affirmationBox");

const tags = {
  travel:
    "Better get your passport ready then… on y va ✈️🌍",

  career:
    "Ambition looks good on you… allez travailler 💼✨",

  school:
    "Brain glow activated… très studieux 📚✨",

  personal:
    "Whatever your reasons may be, we’ve got you covered. 💫"
};

options.forEach(btn => {
  btn.addEventListener("click", () => {

    // 1) Fade out all other options
    options.forEach(o => {
      if (o !== btn) o.classList.add("fade-out");
    });

    // 2) Center selected option
    btn.classList.add("selected");

    // 3) Show affirmation tag (different style + emojis)
    const key = btn.dataset.reason;
    affirmationBox.textContent = tags[key];
    affirmationBox.classList.remove("hidden");

    // 4) After 3 seconds → loader → start.html
    setTimeout(() => {
      sessionStorage.setItem("saybon_next", "/start.html");
      window.location.href = "/loader.html";
    }, 3000);
  });
});