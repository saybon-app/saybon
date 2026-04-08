import { adminLogin } from "/features/admin/auth/admin-auth.js";

const adminIcon = document.getElementById("admin-entry");

if (adminIcon) {
  adminIcon.addEventListener("click", () => {
    sessionStorage.setItem("admin_attempt", "true");
    adminLogin();
  });
}
