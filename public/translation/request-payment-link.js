/* ===========================
SEND QUOTE TO PAYMENT PAGE
FINAL FIX
=========================== */

function goToPayment(type, words, price, delivery){

  const currency = "USD";

  /* SAVE TO LOCAL STORAGE */
  localStorage.setItem("saybon_words", words);
  localStorage.setItem("saybon_amount", price);
  localStorage.setItem("saybon_delivery", delivery);
  localStorage.setItem("saybon_currency", currency);

  /* ALSO SEND VIA URL (double-safe) */

  const url =
  `/translation/payment.html?words=${words}&amount=${price}&delivery=${encodeURIComponent(delivery)}&currency=${currency}`;

  window.location.href = url;
}
