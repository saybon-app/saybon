export function setAdminSession(name = "Admin") {
  sessionStorage.setItem("saybon_admin_authenticated", "true");
  sessionStorage.setItem("saybon_admin_name", name);
}

export function clearAdminSession() {
  sessionStorage.removeItem("saybon_admin_authenticated");
  sessionStorage.removeItem("saybon_admin_name");
}

export function isAdminAuthenticated() {
  return sessionStorage.getItem("saybon_admin_authenticated") === "true";
}

export function getAdminName() {
  return sessionStorage.getItem("saybon_admin_name") || "Admin";
}
