document.getElementById("angelForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // trigger global loader
  if (window.showGlobalLoader) {
    window.showGlobalLoader();
  }

  // redirect to support page
  setTimeout(() => {
    window.location.href = "/features/support/index.html";
  }, 1800);
});
