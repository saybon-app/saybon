document.getElementById("feedbackForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = this.name.value.trim();

  const displayName = name ? name : "friend";

  // Replace entire card content
  this.parentElement.innerHTML = `
    <div style="text-align:center; padding:20px 10px;">

      <h2 style="
        font-size:26px;
        color:#1fbf75;
        margin-bottom:18px;
        font-weight:800;
      ">
        Thank you, ${displayName}
      </h2>

      <p style="
        font-size:16px;
        color:#5a6f86;
        line-height:1.7;
        margin-bottom:14px;
      ">
        Your feedback has been received.
      </p>

      <p style="
        font-size:15px;
        color:#6f8f86;
        margin-bottom:28px;
      ">
        It truly helps us improve SayBon for you and for every learner.
      </p>

      <button
        onclick="goDashboard()"
        style="
          padding:12px 28px;
          border-radius:999px;
          border:2px solid #1fbf75;
          background:white;
          color:#1fbf75;
          font-weight:700;
          cursor:pointer;
          transition:0.2s ease;
        "
        onmouseover="this.style.background='#1fbf75'; this.style.color='white'"
        onmouseout="this.style.background='white'; this.style.color='#1fbf75'"
      >
        Back to dashboard
      </button>

    </div>
  `;
});

function goDashboard() {
  window.location.href = "/dashboard/index.html";
}
