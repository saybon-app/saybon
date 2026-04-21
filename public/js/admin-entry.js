(() => {
  const settingsBtn = document.getElementById("settingsBtn");
  if (!settingsBtn) return;

  settingsBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    window.location.href = "/admin/unlock.html";
  }, true);
})();

