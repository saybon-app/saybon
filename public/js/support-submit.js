document.addEventListener("DOMContentLoaded", () => {

  const forms = document.querySelectorAll(".support-form");

  forms.forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // ✅ TRIGGER GLOBAL LOADER
      if (window.showGlobalLoader) {
        window.showGlobalLoader();
      } else {
        document.body.classList.add("loading");
      }

      // ✅ SIMULATED PROCESSING
      setTimeout(() => {
        window.location.href = "/dashboard/index.html";
      }, 1800);
    });
  });

});
