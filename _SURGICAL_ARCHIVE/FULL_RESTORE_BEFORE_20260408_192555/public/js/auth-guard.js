(function () {
  const protectedAdminPages = [
    "/admin/dashboard.html",
    "/admin/panel.html",
    "/admin/jobs.html",
    "/admin/translation-admin.html"
  ];

  const path = window.location.pathname;

  if (protectedAdminPages.includes(path)) {
    const ok = sessionStorage.getItem("saybon_admin_authenticated") === "true";
    if (!ok) {
      window.location.href = "/admin/index.html";
    }
  }
})();
