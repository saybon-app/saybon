const name = sessionStorage.getItem("donorName");

const title = document.getElementById("thankYouTitle");

if (name && name.trim() !== "") {
  title.textContent = "Thank you, " + name;
} else {
  title.textContent = "Thank you, friend";
}

// Verify and log the real payment - Stripe via session_id in URL,
// Paystack via the reference already stored during checkout.
(function verifyDonationPayment(){
  const API_BASE = "https://saybonapp-server.onrender.com";
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");
  const paystackRef = sessionStorage.getItem("donationRef");

  if(sessionId){
    fetch(API_BASE + "/api/verifyDonationSession?session_id=" + encodeURIComponent(sessionId))
      .catch(function(err){ console.error("Stripe donation verification failed:", err); });
  } else if(paystackRef){
    fetch(API_BASE + "/api/verifyPaystackDonation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: paystackRef })
    }).catch(function(err){ console.error("Paystack donation verification failed:", err); });
  }
})();

function goDashboard() {
  window.location.href = "/dashboard/";
}