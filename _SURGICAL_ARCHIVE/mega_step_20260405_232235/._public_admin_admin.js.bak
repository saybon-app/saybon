const PASSWORD = "s9a6y3b2o8n1"; // 🔒 LOCKED

const status = document.getElementById("status");
const passInput = document.getElementById("adminPassword");
const checkBtn = document.getElementById("checkBtn");
const nameBox = document.getElementById("nameBox");
const adminName = document.getElementById("adminName");
const openAdminBtn = document.getElementById("openAdminBtn");

checkBtn.onclick = () => {
  if (passInput.value === PASSWORD) {
    status.textContent = "ACCESS GRANTED ✔";
    nameBox.classList.remove("hidden");
    passInput.disabled = true;
    checkBtn.disabled = true;
  } else {
    status.textContent = "ACCESS DENIED ❌";
  }
};

openAdminBtn.onclick = () => {
  if (adminName.value.trim()) {
    sessionStorage.setItem("admin_name", adminName.value.trim());
    window.location.href = "/admin/dashboard.html";
  } else {
    alert("Please enter your name.");
  }
};
