(function () {
  const input = document.getElementById("passkeyInput");
  const status = document.getElementById("status");

  const MASTER_PASSKEY = "0110041181";
  const STORAGE_KEY = "saybon_admin_generated_passkeys";
  const ROLE_KEY = "saybon_admin_role";
  const ACTIVE_PASSKEY_KEY = "saybon_admin_active_passkey";
  const ACTIVE_PASSKEY_RECORD_KEY = "saybon_admin_active_passkey_record";

  let handled = false;
  let denyTimer = null;

  function getGeneratedPasskeys() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveActiveSession(role, record) {
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(ACTIVE_PASSKEY_KEY, record.passkey || "");
    localStorage.setItem(ACTIVE_PASSKEY_RECORD_KEY, JSON.stringify(record));
  }

  function grant(record) {
    if (handled) return;
    handled = true;
    saveActiveSession(record.role || "employee_admin", record);
    window.location.href = "/admin/access-granted/";
  }

  function deny() {
    if (handled) return;
    handled = true;
    window.location.href = "/admin/access-denied/";
  }

  function resetTimer() {
    if (denyTimer) {
      clearTimeout(denyTimer);
      denyTimer = null;
    }
  }

  function buildAllowedRecords() {
    const generated = getGeneratedPasskeys()
      .filter(item => item && item.enabled === true)
      .map(item => ({
        name: item.name || "Employee",
        passkey: String(item.passkey || "").trim(),
        role: item.role || "employee_admin",
        employeeId: item.employeeId || ""
      }));

    return [
      {
        name: "Master Admin",
        passkey: MASTER_PASSKEY,
        role: "master_admin",
        employeeId: "MASTER"
      },
      ...generated
    ];
  }

  function validateNow() {
    if (handled) return;

    const key = String(input.value || "").trim();
    if (!key) return;

    const records = buildAllowedRecords();
    const matched = records.find(r => String(r.passkey).trim() === key);

    if (matched) {
      grant(matched);
      return;
    }

    const hasPrefixMatch = records.some(r => String(r.passkey).startsWith(key));
    if (!hasPrefixMatch) {
      deny();
    }
  }

  input.addEventListener("input", () => {
    if (handled) return;
    resetTimer();

    const key = String(input.value || "").trim();
    if (!key) return;

    const records = buildAllowedRecords();
    const matched = records.find(r => String(r.passkey).trim() === key);

    if (matched) {
      grant(matched);
      return;
    }

    denyTimer = setTimeout(() => {
      validateNow();
    }, 700);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      resetTimer();
      validateNow();
    }
  });

  input.addEventListener("blur", () => {
    resetTimer();
    validateNow();
  });

  if (status) {
    status.textContent = "";
  }
})();
