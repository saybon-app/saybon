// ============================
// DASHBOARD ROUTING — CLEAN & SAFE
// ============================

// ---------- ROUTE FUNCTIONS ----------

function goLevels() {
  window.location.href = "../levels/index.html";
}

function goTalkletics() {
  window.location.href = "../games/index.html";
}

function goMusic() {
  window.location.href = "../music/index.html";
}

function goDelf() {
  window.location.href = "../delf/index.html";
}

function goTranslation() {
  window.location.href = "../translation/index.html";
}

function goChat() {
  window.location.href = "../chat/index.html";
}

function goFeedback() {
  window.location.href = "../features/feedback/index.html";
}

function goSupport() {
  window.location.href = "../support/index.html";
}

function goHome() {
  window.location.href = "../index.html";
}


// ============================
// ICON INTERACTION SYSTEM
// ============================

// Map icon keys to route functions
const routeMap = {
  levels: goLevels,
  games: goTalkletics,
  music: goMusic,
  delf: goDelf,
  translation: goTranslation,
  chat: goChat
};

let lastTapped = null;

document.querySelectorAll(".icon-item").forEach(icon => {

  const key = icon.dataset.key; // IMPORTANT: must match HTML

  icon.addEventListener("click", function () {

    // DESKTOP: navigate instantly
    if (window.innerWidth > 768) {
      routeMap[key]();
      return;
    }

    // MOBILE: double tap logic
    if (lastTapped === this) {
      routeMap[key]();
    } else {
      // Hide all labels
      document.querySelectorAll(".label").forEach(l => {
        l.style.opacity = 0;
      });

      // Show this label
      this.querySelector(".label").style.opacity = 1;

      lastTapped = this;
    }

  });

});
