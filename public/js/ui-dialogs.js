(function(){
  if(window.sbAlert) return;

  var style = document.createElement("style");
  style.textContent = [
    "#sbDialogOverlay{position:fixed;inset:0;background:rgba(8,10,14,.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .2s ease;}",
    "#sbDialogOverlay.sb-open{opacity:1;pointer-events:auto;}",
    "#sbDialogBox{background:linear-gradient(165deg,#1b1f28,#141821);border:1px solid rgba(212,175,106,.25);border-radius:20px;padding:26px 24px;max-width:360px;width:100%;box-shadow:0 24px 60px rgba(0,0,0,.5);transform:translateY(12px) scale(.97);transition:transform .2s ease;font-family:'Manrope',-apple-system,sans-serif;}",
    "#sbDialogOverlay.sb-open #sbDialogBox{transform:translateY(0) scale(1);}",
    "#sbDialogMessage{color:#f6f1e4;font-size:.95rem;line-height:1.55;margin-bottom:20px;white-space:pre-line;}",
    "#sbDialogInput{width:100%;background:rgba(0,0,0,.25);border:1px solid rgba(212,175,106,.3);border-radius:10px;padding:11px 14px;color:#f6f1e4;font-size:.9rem;font-family:inherit;margin-bottom:20px;}",
    "#sbDialogBtnRow{display:flex;gap:10px;}",
    ".sb-dialog-btn{flex:1;border:none;border-radius:12px;padding:12px;font-weight:700;font-size:.88rem;cursor:pointer;font-family:inherit;}",
    ".sb-dialog-btn-primary{background:linear-gradient(180deg,#e8c98a,#d4af6a);color:#1c1408;}",
    ".sb-dialog-btn-secondary{background:rgba(255,255,255,.08);color:#f6f1e4;border:1px solid rgba(255,255,255,.15);}"
  ].join("");
  document.head.appendChild(style);

  var overlay = document.createElement("div");
  overlay.id = "sbDialogOverlay";
  overlay.innerHTML =
    '<div id="sbDialogBox">' +
    '<div id="sbDialogMessage"></div>' +
    '<input id="sbDialogInput" style="display:none;">' +
    '<div id="sbDialogBtnRow"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  var msgEl = document.getElementById("sbDialogMessage");
  var inputEl = document.getElementById("sbDialogInput");
  var btnRow = document.getElementById("sbDialogBtnRow");

  function open(){ overlay.classList.add("sb-open"); }
  function close(){ overlay.classList.remove("sb-open"); }

  window.sbAlert = function(message){
    return new Promise(function(resolve){
      msgEl.textContent = message;
      inputEl.style.display = "none";
      btnRow.innerHTML = "";
      var okBtn = document.createElement("button");
      okBtn.className = "sb-dialog-btn sb-dialog-btn-primary";
      okBtn.textContent = "OK";
      okBtn.onclick = function(){ close(); resolve(); };
      btnRow.appendChild(okBtn);
      open();
    });
  };

  window.sbConfirm = function(message){
    return new Promise(function(resolve){
      msgEl.textContent = message;
      inputEl.style.display = "none";
      btnRow.innerHTML = "";
      var cancelBtn = document.createElement("button");
      cancelBtn.className = "sb-dialog-btn sb-dialog-btn-secondary";
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = function(){ close(); resolve(false); };
      var okBtn = document.createElement("button");
      okBtn.className = "sb-dialog-btn sb-dialog-btn-primary";
      okBtn.textContent = "Confirm";
      okBtn.onclick = function(){ close(); resolve(true); };
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(okBtn);
      open();
    });
  };

  window.sbPrompt = function(message, defaultValue){
    return new Promise(function(resolve){
      msgEl.textContent = message;
      inputEl.style.display = "block";
      inputEl.value = defaultValue || "";
      btnRow.innerHTML = "";
      var cancelBtn = document.createElement("button");
      cancelBtn.className = "sb-dialog-btn sb-dialog-btn-secondary";
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = function(){ close(); resolve(null); };
      var okBtn = document.createElement("button");
      okBtn.className = "sb-dialog-btn sb-dialog-btn-primary";
      okBtn.textContent = "Save";
      okBtn.onclick = function(){ close(); resolve(inputEl.value); };
      btnRow.appendChild(cancelBtn);
      btnRow.appendChild(okBtn);
      open();
      setTimeout(function(){ inputEl.focus(); }, 50);
    });
  };
})();