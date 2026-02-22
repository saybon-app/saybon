/* SayBon request page logic (quote + redirect to payment.html) */

const BACKEND_BASE = "https://saybon-backend.onrender.com";

const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileTrayInner = document.getElementById("fileTrayInner");
const uploadBtn = document.getElementById("uploadBtn");

const quoteCard = document.getElementById("quoteCard");
const quoteMeta = document.getElementById("quoteMeta");
const standardPriceEl = document.getElementById("standardPrice");
const expressPriceEl = document.getElementById("expressPrice");
const standardBtn = document.getElementById("standardBtn");
const expressBtn = document.getElementById("expressBtn");
const quoteError = document.getElementById("quoteError");

let selectedFile = null;
let lastQuote = null;

function money(v){
  const n = Number(v || 0);
  return "$" + n.toFixed(2);
}

function humanSize(bytes){
  if (!bytes && bytes !== 0) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return Math.round(kb) + " KB";
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + " MB";
  const gb = mb / 1024;
  return gb.toFixed(2) + " GB";
}

function renderEmpty(){
  fileTrayInner.innerHTML = `
    <div class="fileEmpty">
      <div class="dot"></div>
      <div>
        <div class="fileEmptyTitle">No file selected</div>
        <div class="fileEmptySub">Choose a document to continue</div>
      </div>
    </div>
  `;
  uploadBtn.disabled = true;
}

function renderFile(file){
  fileTrayInner.innerHTML = `
    <div class="fileRow">
      <div>
        <div class="fileName">${escapeHtml(file.name)}</div>
        <div class="fileSize">${humanSize(file.size)}</div>
      </div>
      <button class="fileX" id="clearFileBtn" aria-label="Remove file">×</button>
    </div>
  `;

  const clearBtn = document.getElementById("clearFileBtn");
  clearBtn.addEventListener("click", () => {
    selectedFile = null;
    fileInput.value = "";
    lastQuote = null;
    quoteCard.classList.add("hidden");
    quoteError.classList.add("hidden");
    renderEmpty();
  });

  uploadBtn.disabled = false;
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setFile(file){
  if (!file) return;
  selectedFile = file;
  renderFile(file);
}

fileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) setFile(f);
});

/* Drag & Drop */
["dragenter","dragover"].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add("dragOver");
  });
});
["dragleave","drop"].forEach(evt => {
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove("dragOver");
  });
});
dropZone.addEventListener("drop", (e) => {
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) setFile(f);
});
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") fileInput.click();
});

uploadBtn.addEventListener("click", async () => {
  quoteError.classList.add("hidden");
  quoteError.textContent = "";

  if (!selectedFile){
    renderEmpty();
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Generating Quote...";

  try{
    const fd = new FormData();
    fd.append("file", selectedFile);

    const res = await fetch(`${BACKEND_BASE}/api/quote`, {
      method: "POST",
      body: fd
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data || data.success === false){
      throw new Error(data && data.message ? data.message : "Failed to get quote. Confirm backend is reachable.");
    }

    lastQuote = data;
    const wc = Number(data.wordCount || 0);

    quoteMeta.textContent = `Words: ${wc}`;
    standardPriceEl.textContent = money(data.standard);
    expressPriceEl.textContent = money(data.express);

    quoteCard.classList.remove("hidden");

    // Scroll quote into view nicely (page is scrollable generally)
    setTimeout(() => {
      quoteCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);

  }catch(err){
    quoteError.textContent = err.message || "Failed to get quote.";
    quoteError.classList.remove("hidden");
  }finally{
    uploadBtn.disabled = !selectedFile;
    uploadBtn.textContent = "Upload Document To Get Quote";
  }
});

function goPay(amount){
  // keep current behavior: payment.html reads ?amount=
  const a = Number(amount || 0).toFixed(2);
  window.location.href = `./payment.html?amount=${encodeURIComponent(a)}`;
}

standardBtn.addEventListener("click", () => {
  if (!lastQuote) return;
  goPay(lastQuote.standard);
});
expressBtn.addEventListener("click", () => {
  if (!lastQuote) return;
  goPay(lastQuote.express);
});

/* Init */
renderEmpty();
