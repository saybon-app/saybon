(function () {
  const shell = document.getElementById("screenShell");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shell.classList.remove("is-entering");
    });
  });

  setTimeout(() => {
    shell.classList.add("is-leaving");
  }, 950);

  setTimeout(() => {
    window.location.href = "/admin/passkey/";
  }, 1450);
})();
