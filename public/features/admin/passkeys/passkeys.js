(function () {
  const STORAGE_KEY = "saybon_admin_generated_passkeys";
  const ACTIVE_RECORD_KEY = "saybon_admin_active_passkey_record";

  const accessMeta = document.getElementById("accessMeta");
  const nameInput = document.getElementById("nameInput");
  const employeeIdInput = document.getElementById("employeeIdInput");
  const roleInput = document.getElementById("roleInput");
  const passkeyInput = document.getElementById("passkeyInput");
  const generateBtn = document.getElementById("generateBtn");
  const saveBtn = document.getElementById("saveBtn");
  const listWrap = document.getElementById("listWrap");

  function getActiveRecord() {
    try {
      return JSON.parse(localStorage.getItem(ACTIVE_RECORD_KEY) || "null");
    } catch {
      return null;
    }
  }

  function getItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function setItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function randomBlock(len) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let out = "";
    for (let i = 0; i < len; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  }

  function makePasskey() {
    return "SB-" + randomBlock(4) + "-" + randomBlock(4);
  }

  function render() {
    const items = getItems();

    if (!items.length) {
      listWrap.innerHTML = '<div class="passkey-item"><p>No employee admin passkeys created yet.</p></div>';
      return;
    }

    listWrap.innerHTML = items.map((item) => `
      <div class="passkey-item">
        <div class="top">
          <div>
            <h3>${item.name}</h3>
            <p><strong>ID:</strong> ${item.employeeId || "-"}</p>
            <p><strong>Role:</strong> ${item.role}</p>
            <p><strong>Passkey:</strong> ${item.passkey}</p>
          </div>
          <div class="badge ${item.enabled ? "" : "off"}">${item.enabled ? "ENABLED" : "DISABLED"}</div>
        </div>

        <div class="item-actions">
          <button class="toggle-btn" data-id="${item.id}">
            ${item.enabled ? "Disable" : "Enable"}
          </button>
          <button class="delete-btn" data-delete="${item.id}">
            Delete
          </button>
        </div>
      </div>
    `).join("");

    listWrap.querySelectorAll("[data-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const items = getItems().map(item => item.id === id ? { ...item, enabled: !item.enabled } : item);
        setItems(items);
        render();
      });
    });

    listWrap.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delete");
        const items = getItems().filter(item => item.id !== id);
        setItems(items);
        render();
      });
    });
  }

  const active = getActiveRecord();
  if (!active || active.role !== "master_admin") {
    accessMeta.textContent = "Master admin clearance required.";
    document.querySelector(".manager-grid").innerHTML = '<div class="panel"><h2>Access blocked</h2><p>Only the master passkey can generate employee admin passkeys.</p></div>';
    return;
  }

  accessMeta.textContent = `Master admin active: ${active.name}`;

  generateBtn.addEventListener("click", () => {
    passkeyInput.value = makePasskey();
  });

  saveBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const employeeId = employeeIdInput.value.trim();
    const role = roleInput.value;
    const passkey = passkeyInput.value.trim();

    if (!name || !passkey) {
      alert("Enter employee name and passkey.");
      return;
    }

    const items = getItems();
    items.unshift({
      id: "pk_" + Date.now(),
      name,
      employeeId,
      role,
      passkey,
      enabled: true
    });

    setItems(items);

    nameInput.value = "";
    employeeIdInput.value = "";
    passkeyInput.value = "";
    roleInput.value = "employee_admin";

    render();
  });

  render();
})();
