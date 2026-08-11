document.getElementById("feedbackForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const name = this.name.value.trim();
  const email = this.email.value.trim();
  const type = this.type.value;
  const message = this.message.value.trim();

  if (!email || !message) {
    alert("Please fill in your email and message.");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {

    const res = await fetch("https://saybonapp-server.onrender.com/api/submitFeedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, type, message })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      alert("Could not send feedback. Please try again.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Send feedback";
      return;
    }

    sessionStorage.setItem("feedbackName", name || "friend");
    window.location.href = "success.html";

  } catch (err) {
    alert("Could not send feedback. Please try again.");
    submitBtn.disabled = false;
    submitBtn.textContent = "Send feedback";
  }

});