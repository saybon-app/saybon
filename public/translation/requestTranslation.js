/* SayBon Translation Request - Premium UI controller
   - Calls backend: POST https://saybon-backend.onrender.com/api/quote (multipart: file)
   - Shows Quote card after upload
   - Page is ALWAYS scrollable (desktop + mobile)
*/

const API_BASE = "https://saybon-backend.onrender.com";

const el = (id) => document.getElementById(id);

const drop = el("dropzone");
const fileInput = el("fileInput");
const pickBtn = el("pickBtn");
const uploadBtn = el("uploadBtn");
const fileList = el("fileList");
const errBox = el("errBox");

const quoteWrap = el("quoteWrap");
const quoteWords = el("quoteWords");
const standardPriceEl = el("standardPrice");
const expressPriceEl = el("expressPrice");
const standardDeliveryEl = el("standardDelivery");
const expressDeliveryEl = el("expressDelivery");

const optStandard = el("optStandard");
const optExpress = el("optExpress");

let selectedFile = null;
let lastQuote = null;

function money(n){
  const num = Number(n);
  if (Number.isNaN(num)) return "$0.00";
  return "$" + num.toFixed(2);
}

function bytesToSize(bytes){
  if (!bytes && bytes !== 0) return "";
  const sizes = ["B","KB","MB","GB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < sizes.length - 1){
    val = val / 1024;
    i++;
  }
  return (i === 0 ? val : val.toFixed(1)) + " " + sizes[i];
}

function showError(msg){
  errBox.textContent = msg;
  errBox.style.display = "block";
}

function clearError(){
  errBox.textContent = "";
  errBox.style.display = "none";
}

function setFile(file){
  selectedFile = file || null;
  renderFileList();
  uploadBtn.disabled = !selectedFile;
}

function renderFileList(){
  fileList.innerHTML = "";

  if (!selectedFile){
    const row = document.createElement("div");
    row.className = "fileRow";
    row.innerHTML = `
      <div class="fileMeta">
        <div class="check" style="background:rgba(20,21,26,.06);border-color:rgba(20,21,26,.08);color:rgba(20,21,26,.45)">•</div>
        <div style="min-width:0">
          <div class="fname">No file selected</div>
          <div class="fsize">Choose a document to continue</div>
        </div>
      </div>
      <button class="removeBtn" type="button" aria-label="noop" disabled style="opacity:.35;cursor:not-allowed">×</button>
    `;
    fileList.appendChild(row);
    return;
  }

  const row = document.createElement("div");
  row.className = "fileRow";
  row.innerHTML = `
    <div class="fileMeta">
      <div class="check">✓</div>
      <div style="min-width:0">
        <div class="fname" title="${selectedFile.name}">${selectedFile.name}</div>
        <div class="fsize">${bytesToSize(selectedFile.size)}</div>
      </div>
    </div>
    <button class="removeBtn" type="button" id="removeBtn" aria-label="Remove file">×</button>
  `;
  fileList.appendChild(row);

  const removeBtn = el("removeBtn");
  removeBtn.addEventListener("click", () => {
    setFile(null);
    hideQuote();
  });
}

function deliveryFor(service, words){
  const w = Number(words || 0);

  if (service === "standard"){
    if (w <= 300) return "1–3 hrs";
    if (w <= 1000) return "3–6 hrs";
    if (w <= 3000) return "6–12 hrs";
    return "12–24 hrs";
  }

  if (w <= 300) return "30–60 mins";
  if (w <= 1000) return "1–3 hrs";
  if (w <= 3000) return "3–6 hrs";
  return "6–12 hrs";
}

function showQuote(q){
  lastQuote = q;

  quoteWords.textContent = String(q.wordCount);
  standardPriceEl.textContent = money(q.standard);
  expressPriceEl.textContent = money(q.express);

  standardDeliveryEl.textContent = deliveryFor("standard", q.wordCount);
  expressDeliveryEl.textContent = deliveryFor("express", q.wordCount);

  quoteWrap.style.display = "block";
}

function hideQuote(){
  lastQuote = null;
  quoteWrap.style.display = "none";
}

async function getQuote(){
  clearError();

  if (!selectedFile){
    showError("Please choose a file first.");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading…";

  try{
    const fd = new FormData();
    fd.append("file", selectedFile);

    const res = await fetch(`${API_BASE}/api/quote`, {
      method: "POST",
      body: fd
    });

    if (!res.ok){
      const t = await res.text().catch(()=> "");
      throw new Error(`Failed to get quote (${res.status}). ${t || "Network/server error."}`);
    }

    const data = await res.json();

    const wordCount = Number(data.wordCount ?? data.words ?? 0);

    let standard = data.standard;
    let express = data.express;

    if (data.pricing){
      standard = data.pricing.standard;
      express = data.pricing.express;
    }

    standard = Number(standard ?? 0);
    express = Number(express ?? 0);

    if (!wordCount || wordCount < 1){
      throw new Error("Quote returned 0 words. Please try another file.");
    }

    showQuote({ wordCount, standard, express });

    // bring quote into view smoothly
    quoteWrap.scrollIntoView({ behavior: "smooth", block: "start" });

  }catch(err){
    showError(err.message || "Failed to get quote. Please try again.");
    hideQuote();
  }finally{
    uploadBtn.disabled = !selectedFile;
    uploadBtn.textContent = "Upload Document To Get Quote";
  }
}

function goPay(service){
  if (!lastQuote) return;

  const amount = service === "standard" ? lastQuote.standard : lastQuote.express;
  const delivery = deliveryFor(service, lastQuote.wordCount);

  const url = new URL(window.location.origin + "/translation/payment.html");
  url.searchParams.set("service", service);
  url.searchParams.set("amount", String(amount.toFixed(2)));
  url.searchParams.set("words", String(lastQuote.wordCount));
  url.searchParams.set("delivery", delivery);

  window.location.href = url.toString();
}

pickBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f){
    setFile(f);
    clearError();
  }
});

uploadBtn.addEventListener("click", getQuote);

optStandard.addEventListener("click", () => goPay("standard"));
optExpress.addEventListener("click", () => goPay("express"));

["dragenter","dragover"].forEach(evt => {
  drop.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    drop.classList.add("drag");
  });
});
["dragleave","drop"].forEach(evt => {
  drop.addEventListener(evt, (e) => {
    e.preventDefault();
    e.stopPropagation();
    drop.classList.remove("drag");
  });
});
drop.addEventListener("drop", (e) => {
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f){
    setFile(f);
    clearError();
  }
});

setFile(null);
hideQuote();
