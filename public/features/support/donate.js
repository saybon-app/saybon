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

    if (!email || !amount || amount <= 0) {
      alert("Please enter a valid donation amount.");
      return;
    }

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
            value: `${firstName} ${lastName}`
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

    // ✅ MUST be inside click
    handler.openIframe();
  });

});
