(async function () {
  const input = document.getElementById("passkeyInput");
  const button = document.getElementById("unlockBtn");
  const status = document.getElementById("status");

  async function validate() {
    const key = (input.value || "").trim();

    if (!key) {
      status.textContent = "Enter a valid passkey.";
      return;
    }

    status.textContent = "Checking clearance...";

    try {
      const res = await fetch("/data/admin-clearances.json", { cache: "no-store" });
      const records = await res.json();

      const matched = Array.isArray(records)
        ? records.find(r => r.enabled === true && String(r.passkey).trim() === key)
        : null;

      if (!matched) {
        status.textContent = "Access denied.";
        return;
      }

      localStorage.setItem("saybon_admin_clearance", JSON.stringify(matched));
      window.location.href = "/admin/access-granted/";
    } catch (err) {
      console.error(err);
      status.textContent = "Could not verify clearance.";
    }
  }

  button.addEventListener("click", validate);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") validate();
  });
})();
