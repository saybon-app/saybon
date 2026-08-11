document.addEventListener("DOMContentLoaded", () => {

  const payBtn = document.getElementById("payBtn");
  const form = document.getElementById("donationForm");

  if (!payBtn || !form) return;

  payBtn.addEventListener("click", function () {

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const amount = Number(form.amount.value);
    const currency = form.currency.value;
    const message = form.message.value.trim();

    if (!email || !amount || amount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

    if (currency === "USD") {
      payWithStripe(firstName, lastName, email, amount, message);
    } else {
      payWithPaystack(firstName, lastName, email, amount, currency);
    }

  });

  function payWithPaystack(firstName, lastName, email, amount, currency) {

    const handler = PaystackPop.setup({
      key: "pk_live_adbd997a6cb7382da7c9e3e77c0ca487b93d73ab",

      email: email,
      amount: amount * 100,
      currency: currency,

      ref: "SAYBON_" + Date.now(),

      metadata: {
        custom_fields: [
          {
            display_name: "Donor Name",
            variable_name: "donor_name",
            value: firstName + " " + lastName
          }
        ]
      },

      callback: function (response) {
        sessionStorage.setItem("donorName", firstName || "friend");
        sessionStorage.setItem("donationRef", response.reference);

        window.location.href = "thank-you.html";
      },

      onClose: function () {
        alert("Donation cancelled.");
      }
    });

    handler.openIframe();
  }

  async function payWithStripe(firstName, lastName, email, amount, message) {

    payBtn.disabled = true;
    payBtn.textContent = "Redirecting to payment...";

    try {

      const res = await fetch("https://saybonapp-server.onrender.com/api/createDonationCheckout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, amount, message })
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        alert("Could not start payment. Please try again.");
        payBtn.disabled = false;
        payBtn.textContent = "Continue to Payment";
        return;
      }

      sessionStorage.setItem("donorName", firstName || "friend");
      window.location.href = data.url;

    } catch (err) {
      alert("Could not start payment. Please try again.");
      payBtn.disabled = false;
      payBtn.textContent = "Continue to Payment";
    }

  }

});