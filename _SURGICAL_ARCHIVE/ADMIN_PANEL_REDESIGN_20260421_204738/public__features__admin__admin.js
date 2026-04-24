(function () {
  const meta = document.getElementById("adminMeta");
  let active = null;

  try {
    active = JSON.parse(localStorage.getItem("saybon_admin_active_passkey_record") || "null");
  } catch {
    active = null;
  }

  if (!active) {
    if (meta) meta.textContent = "No admin clearance found.";
    return;
  }

  if (meta) {
    meta.textContent = `Signed in as: ${active.name || "Admin"} • ${active.role || "employee_admin"}`;
  }
})();
