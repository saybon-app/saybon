document.getElementById("ndaForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Redirect to business plan after NDA acceptance
  window.location.href = "business-plan.html";
});
