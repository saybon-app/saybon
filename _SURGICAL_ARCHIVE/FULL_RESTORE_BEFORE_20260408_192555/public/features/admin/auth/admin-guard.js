import { isAdminAuthenticated } from "./admin-auth.js";

if (!isAdminAuthenticated()) {
  window.location.href = "/admin/index.html";
}
