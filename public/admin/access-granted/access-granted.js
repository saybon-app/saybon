(function () {
  const shell = document.getElementById("screenShell");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shell.classList.remove("is-entering");
    });
  });

  setTimeout(() => {
    shell.classList.add("is-leaving");
  }, 1350);

  setTimeout(() => {
    window.location.href = "/features/admin/";
  }, 1850);
})();
