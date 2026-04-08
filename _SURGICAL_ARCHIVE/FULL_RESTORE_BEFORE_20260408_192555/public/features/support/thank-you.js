const name = sessionStorage.getItem("donorName");

const title = document.getElementById("thankYouTitle");

if (name && name.trim() !== "") {
  title.textContent = `Thank you, ${name}`;
} else {
  title.textContent = "Thank you, friend";
}

function goDashboard() {
  window.location.href = "/dashboard/index.html";
}
