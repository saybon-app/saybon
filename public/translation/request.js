(() => {
  const fileInput = document.getElementById('fileInput');
  const chooseBtn = document.getElementById('chooseBtn');
  const clearFileBtn = document.getElementById('clearFileBtn');
  const fileNameEl = document.getElementById('fileName');
  const fileBadgeEl = document.querySelector('.fileBadge');
  const dropZone = document.getElementById('dropZone');
  const getQuoteBtn = document.getElementById('getQuoteBtn');
  const inlineMsg = document.getElementById('inlineMsg');

  const quoteCard = document.getElementById('quoteCard');
  const wordCountEl = document.getElementById('wordCount');
  const standardPriceEl = document.getElementById('standardPrice');
  const expressPriceEl = document.getElementById('expressPrice');
  const standardTimeEl = document.getElementById('standardTime');
  const expressTimeEl = document.getElementById('expressTime');

  const standardQuoteBtn = document.getElementById('standardQuoteBtn');
  const expressQuoteBtn = document.getElementById('expressQuoteBtn');

  const ORIGINAL_BTN_TEXT = 'Upload Document To Get Quote';

  let selectedFile = null;
  let dotsTimer = null;

  function setMsg(text) {
    inlineMsg.textContent = text || '';
  }

  function setFileUI(file) {
    if (!file) {
      fileBadgeEl.textContent = 'No file selected';
      fileNameEl.textContent = 'Choose a document to continue';
      selectedFile = null;
      fileInput.value = '';
      return;
    }
    selectedFile = file;
    fileBadgeEl.textContent = 'Selected';
    fileNameEl.textContent = file.name;
  }

  function stopDots() {
    if (dotsTimer) clearInterval(dotsTimer);
    dotsTimer = null;
  }

  function setBtnStateGetting() {
    getQuoteBtn.disabled = true;
    stopDots();
    let dots = 0;
    dotsTimer = setInterval(() => {
      dots = (dots + 1) % 4;
      getQuoteBtn.textContent = 'Getting Quote' + '.'.repeat(dots);
    }, 420);
  }

  function setBtnStateSeeQuote() {
    stopDots();
    getQuoteBtn.textContent = 'See Quote 👇🏽';
  }

  function resetBtn() {
    stopDots();
    getQuoteBtn.disabled = false;
    getQuoteBtn.textContent = ORIGINAL_BTN_TEXT;
  }

  function deliveryFromWords(words, type) {
    const w = Number(words) || 0;
    if (type === 'standard') {
      if (w <= 300) return '1–3 hrs';
      if (w <= 1000) return '3–6 hrs';
      if (w <= 3000) return '6–12 hrs';
      return '12–24 hrs';
    } else {
      if (w <= 300) return '30–60 mins';
      if (w <= 1000) return '1–3 hrs';
      if (w <= 3000) return '3–6 hrs';
      return '6–12 hrs';
    }
  }

  async function fetchQuote(file) {
    const fd = new FormData();
    fd.append('file', file);

    const res = await fetch('https://saybon-backend.onrender.com/api/quote', {
      method: 'POST',
      body: fd
    });

    if (!res.ok) {
      throw new Error('Quote request failed.');
    }

    const data = await res.json();
    // Expected: { wordCount: 15, standard: "0.38", express: "0.75" }
    return data;
  }

  function showQuoteUI({ wordCount, standard, express }) {
    const wc = Number(wordCount) || 0;

    const standardAmt = Number(standard) || 0;
    const expressAmt = Number(express) || 0;

    const stTime = deliveryFromWords(wc, 'standard');
    const exTime = deliveryFromWords(wc, 'express');

    wordCountEl.textContent = String(wc);

    standardPriceEl.textContent = $;
    expressPriceEl.textContent = $;

    standardTimeEl.textContent = stTime;
    expressTimeEl.textContent = exTime;

    quoteCard.hidden = false;
    quoteCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Button state: See Quote 👇🏽 for 5 seconds, then restore
    setBtnStateSeeQuote();
    setTimeout(() => resetBtn(), 5000);

    // Quote cards are the ONLY navigation buttons
    standardQuoteBtn.onclick = () => goPayment('standard', wc, standardAmt, stTime);
    expressQuoteBtn.onclick = () => goPayment('express', wc, expressAmt, exTime);

    setMsg('');
  }

  function goPayment(type, words, amount, delivery) {
    const payload = {
      type,
      words,
      amount,
      delivery,
      currency: 'USD',
      ts: Date.now()
    };

    localStorage.setItem('saybon_paymentData', JSON.stringify(payload));
    window.location.assign('./payment.html');
  }

  async function handleGetQuote() {
    if (!selectedFile) {
      setMsg('Please choose a document to continue.');
      return;
    }

    setMsg('');
    quoteCard.hidden = true;

    setBtnStateGetting();

    try {
      const data = await fetchQuote(selectedFile);
      stopDots();
      // In case backend is slow, keep disabled until quote draws
      showQuoteUI(data);
      getQuoteBtn.disabled = false;
    } catch (e) {
      stopDots();
      resetBtn();
      setMsg('Could not generate quote right now. Please try again.');
    }
  }

  // Choose file triggers hidden input
  chooseBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', () => {
    const file = fileInput.files && fileInput.files[0];
    setFileUI(file || null);
    quoteCard.hidden = true;
    setMsg('');
  });

  clearFileBtn.addEventListener('click', () => {
    setFileUI(null);
    quoteCard.hidden = true;
    setMsg('');
  });

  // Drag-drop
  ['dragenter', 'dragover'].forEach(evt =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('isDrag');
    })
  );

  ['dragleave', 'drop'].forEach(evt =>
    dropZone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('isDrag');
    })
  );

  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      // set to input for consistency
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      setFileUI(file);
      quoteCard.hidden = true;
      setMsg('');
    }
  });

  // Keyboard accessible dropzone
  dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });

  // Main action
  getQuoteBtn.addEventListener('click', handleGetQuote);

  // Ensure clean initial state
  setFileUI(null);
  resetBtn();
  quoteCard.hidden = true;
  setMsg('');
})();
