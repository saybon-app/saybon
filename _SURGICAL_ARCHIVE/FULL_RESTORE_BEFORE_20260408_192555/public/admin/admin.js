const status = document.getElementById("status");
const passInput = document.getElementById("adminPassword");
const checkBtn = document.getElementById("checkBtn");
const nameBox = document.getElementById("nameBox");
const adminName = document.getElementById("adminName");
const openAdminBtn = document.getElementById("openAdminBtn");

let verified = false;

checkBtn.onclick = async () => {
  const code = passInput.value.trim();

  if (!code) {
    status.textContent = "ENTER ACCESS CODE";
    return;
  }

  try {
    const response = await fetch("/api/admin/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code })
    });

    const data = await response.json();

    if (data.success) {
      verified = true;
      status.textContent = "ACCESS GRANTED ✔";
      nameBox.classList.remove("hidden");
      passInput.disabled = true;
      checkBtn.disabled = true;
    } else {
      verified = false;
      status.textContent = "ACCESS DENIED ❌";
    }
  } catch (err) {
    console.error(err);
    status.textContent = "ACCESS ERROR ❌";
  }
};

openAdminBtn.onclick = () => {
  if (!verified) {
    status.textContent = "VERIFY ACCESS FIRST";
    return;
  }

  const name = adminName.value.trim() || "Admin";

  sessionStorage.setItem("saybon_admin_authenticated", "true");
  sessionStorage.setItem("saybon_admin_name", name);

  window.location.href = "/admin/dashboard.html";
};
