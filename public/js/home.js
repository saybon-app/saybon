const teacher = document.getElementById("teacher");
const audio = document.getElementById("introAudio");
const overlay = document.getElementById("offerOverlay");

const pill1 = document.getElementById("pill1");
const pill2 = document.getElementById("pill2");
const pill3 = document.getElementById("pill3");
const pill4 = document.getElementById("pill4");

const pills = [pill1, pill2, pill3, pill4];

let started = false;
let timers = [];

function clearAllTimers(){
  timers.forEach(t => clearTimeout(t));
  timers = [];
}

function schedule(fn, ms){
  const id = setTimeout(fn, ms);
  timers.push(id);
  return id;
}

function resetPills(){
  pills.forEach(pill => {
    pill.classList.remove("show", "exit");
  });
}

function resetOverlay(){
  overlay.classList.remove("active", "closing");
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.pointerEvents = "none";
}

function finishIntervention(){
  resetPills();
  resetOverlay();

  document.body.classList.remove(
    "intervention-running",
    "intervention-closing"
  );

  started = false;
}

teacher.addEventListener("click", () => {
  if (started) return;
  started = true;

  clearAllTimers();
  resetPills();

  document.body.classList.remove("intervention-closing");
  document.body.classList.add("intervention-running");

  overlay.classList.remove("hidden", "active", "closing");
  overlay.setAttribute("aria-hidden", "false");
  overlay.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });
  });

  audio.currentTime = 0;
  audio.play().catch(() => {});

  schedule(() => {
    pill1.classList.add("show");
  }, 5200);

  schedule(() => {
    pill2.classList.add("show");
  }, 9200);

  schedule(() => {
    pill3.classList.add("show");
  }, 13200);

  schedule(() => {
    pill4.classList.add("show");
  }, 17200);

  schedule(() => {
    pill4.classList.add("exit");
  }, 24800);

  schedule(() => {
    pill3.classList.add("exit");
  }, 25800);

  schedule(() => {
    pill2.classList.add("exit");
  }, 26800);

  schedule(() => {
    pill1.classList.add("exit");
  }, 27800);

  schedule(() => {
    document.body.classList.remove("intervention-running");
    document.body.classList.add("intervention-closing");
    overlay.classList.add("closing");
  }, 28750);

  schedule(() => {
    finishIntervention();
  }, 32000);
});

document.getElementById("startBtn").onclick = (e) => {
  e.stopPropagation();
  sessionStorage.setItem("saybon_next", "/why.html");
  window.location.href = "/loader.html";
};

document.getElementById("loginBtn").onclick = (e) => {
  e.stopPropagation();
  window.location.href = "/auth/login.html";
};

document.getElementById("settingsBtn").onclick = (e) => {
  e.stopPropagation();
  window.location.href = "/admin/passkey/";
};