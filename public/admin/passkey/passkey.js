(async function () {
  const input = document.getElementById("passkeyInput");
  const status = document.getElementById("status");
  let clearanceRecords = [];
  let handled = false;
  let denyTimer = null;

  async function loadClearances() {
    const res = await fetch("/data/admin-clearances.json", { cache: "no-store" });
    const records = await res.json();
    clearanceRecords = Array.isArray(records) ? records.filter(r => r && r.enabled === true) : [];
  }

  function grant(matched) {
    if (handled) return;
    handled = true;
    localStorage.setItem("saybon_admin_clearance", JSON.stringify(matched));
    window.location.href = "/admin/access-granted/";
  }

  function deny() {
    if (handled) return;
    handled = true;
    window.location.href = "/admin/access-denied/";
  }

  function resetDenyTimer() {
    if (denyTimer) {
      clearTimeout(denyTimer);
      denyTimer = null;
    }
  }

  function validateNow() {
    if (handled) return;

    const key = String(input.value || "").trim();
    const matched = clearanceRecords.find(r => String(r.passkey).trim() === key);

    if (matched) {
      grant(matched);
      return;
    }

    const hasPrefixMatch = clearanceRecords.some(r => String(r.passkey).startsWith(key));
    if (!hasPrefixMatch && key.length > 0) {
      deny();
    }
  }

  try {
    await loadClearances();
  } catch (err) {
    console.error(err);
    status.textContent = "Could not load clearance data.";
    return;
  }

  input.addEventListener("input", () => {
    if (handled) return;
    resetDenyTimer();
    const key = String(input.value || "").trim();

    if (!key) return;

    const matched = clearanceRecords.find(r => String(r.passkey).trim() === key);
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
      resetDenyTimer();
      validateNow();
    }
  });

  input.addEventListener("blur", () => {
    resetDenyTimer();
    validateNow();
  });
})();
