(() => {
  const noData = document.getElementById('noData');
  const payBody = document.getElementById('payBody');

  const pWords = document.getElementById('pWords');
  const pDelivery = document.getElementById('pDelivery');
  const pCurrency = document.getElementById('pCurrency');
  const pAmount = document.getElementById('pAmount');

  const stripeBtn = document.getElementById('stripeBtn');
  const paystackBtn = document.getElementById('paystackBtn');
  const payMsg = document.getElementById('payMsg');

  function setMsg(t){ payMsg.textContent = t || ''; }

  function readData(){
    try{
      const raw = localStorage.getItem('saybon_paymentData');
      if(!raw) return null;
      const data = JSON.parse(raw);
      if(!data || typeof data.amount !== 'number') return null;
      return data;
    }catch{
      return null;
    }
  }

  function formatMoney(amount, currency){
    if(currency === 'GHS') return GHS ;
    return USD ;
  }

  // Simple FX placeholder. If you want real FX, we can pull from backend later.
  function convert(amountUSD, currency){
    if(currency === 'GHS'){
      const fx = 13.0; // placeholder rate
      return amountUSD * fx;
    }
    return amountUSD;
  }

  const data = readData();
  if(!data){
    noData.hidden = false;
    payBody.hidden = true;
    return;
  }

  noData.hidden = true;
  payBody.hidden = false;

  pWords.textContent = String(data.words ?? '—');
  pDelivery.textContent = String(data.delivery ?? '—');

  pCurrency.value = data.currency || 'USD';

  function refreshAmount(){
    const c = pCurrency.value;
    const baseUSD = Number(data.amount) || 0;
    const amt = convert(baseUSD, c);
    pAmount.textContent = formatMoney(amt, c);
    data.currency = c;
    localStorage.setItem('saybon_paymentData', JSON.stringify(data));
  }

  refreshAmount();

  pCurrency.addEventListener('change', refreshAmount);

  function lockButtons(lock){
    stripeBtn.disabled = lock;
    paystackBtn.disabled = lock;
  }

  // NOTE:
  // These buttons call your backend endpoints.
  // If your backend isn’t ready yet, they’ll show a clean message (no popup).
  async function startStripe(){
    setMsg('');
    lockButtons(true);
    setMsg('Starting Stripe…');

    try{
      const res = await fetch('https://saybon-backend.onrender.com/api/pay/stripe/create-checkout', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          amountUSD: data.amount,
          currency: data.currency,
          words: data.words,
          delivery: data.delivery,
          type: data.type
        })
      });

      if(!res.ok) throw new Error('Stripe init failed');
      const out = await res.json();

      // expected: { url: "https://checkout.stripe.com/..." }
      if(out && out.url){
        window.location.assign(out.url);
        return;
      }

      throw new Error('No Stripe URL returned');
    }catch(e){
      setMsg('Stripe is not connected yet. Connect backend Stripe endpoint next.');
      lockButtons(false);
    }
  }

  async function startPaystack(){
    setMsg('');
    lockButtons(true);
    setMsg('Starting Paystack…');

    try{
      const res = await fetch('https://saybon-backend.onrender.com/api/pay/paystack/initialize', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          amountUSD: data.amount,
          currency: data.currency,
          words: data.words,
          delivery: data.delivery,
          type: data.type
        })
      });

      if(!res.ok) throw new Error('Paystack init failed');
      const out = await res.json();

      // expected: { authorization_url: "https://checkout.paystack.com/..." }
      if(out && out.authorization_url){
        window.location.assign(out.authorization_url);
        return;
      }

      throw new Error('No Paystack URL returned');
    }catch(e){
      setMsg('Paystack is not connected yet. Connect backend Paystack endpoint next.');
      lockButtons(false);
    }
  }

  stripeBtn.addEventListener('click', startStripe);
  paystackBtn.addEventListener('click', startPaystack);

  setMsg('');
})();
