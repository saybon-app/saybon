const cards = document.querySelectorAll(".why-card");
const affirmationBox = document.getElementById("affirmationBox");
const homeBtn = document.getElementById("homeBtn");

const affirmations = {
  personal: "Beautiful choice 💙 French can become something deeply personal — a new hobby, a creative outlet, and a way to enjoy learning for yourself.",
  school: "Great choice 📘 French can support your classes, exams, and academic goals step by step.",
  travel: "Love that ✈️ French can open doors to travel, culture, and meaningful connections across different places.",
  career: "Excellent choice 🚀 French can strengthen your profile and create new career opportunities over time."
};

function pressStart(el){
  if(!el) return;
  el.classList.add("is-pressed");
}
function pressEnd(el){
  if(!el) return;
  el.classList.remove("is-pressed");
}

function attachPressFeedback(el){
  if(!el) return;
  el.addEventListener("pointerdown", () => pressStart(el));
  el.addEventListener("pointerup", () => pressEnd(el));
  el.addEventListener("pointerleave", () => pressEnd(el));
  el.addEventListener("pointercancel", () => pressEnd(el));
}
attachPressFeedback(homeBtn);
cards.forEach(attachPressFeedback);

homeBtn?.addEventListener("click", () => {
  window.location.href = "/index.html";
});

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const reason = card.dataset.reason || "personal";

    cards.forEach((other) => {
      if (other !== card) other.classList.add("fade-out");
    });

    if (affirmationBox) {
      affirmationBox.textContent = affirmations[reason] || "";
      affirmationBox.classList.remove("hidden");
      affirmationBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    sessionStorage.setItem("saybon_reason", reason);
    sessionStorage.setItem("saybon_prev", window.location.pathname);
    sessionStorage.setItem("saybon_next", "/journey.html");

    setTimeout(() => {
      window.location.href = "/loader.html";
    }, 1800);
  });
});
