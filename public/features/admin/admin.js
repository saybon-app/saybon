(function () {
  const meta = document.getElementById("adminMeta");
  let active = null;

  try {
    active = JSON.parse(localStorage.getItem("saybon_admin_active_passkey_record") || "null");
  } catch {
    active = null;
  }

  if (meta) {
    if (active) {
      meta.textContent = `Signed in as: ${active.name || "Admin"} • ${active.role || "employee_admin"}`;
    } else {
      meta.textContent = "No admin clearance found.";
    }
  }

  const cards = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach((card) => observer.observe(card));
  } else {
    cards.forEach((card) => card.classList.add("is-visible"));
  }
})();
