// ================================
// SAYBON GLOBAL LOADER — MASTER ROUTER
// ================================

const quips = [
  "Hold on… our hamsters are learning French 🐹… et toi ?",
  "Stirring the brain soup… très délicieux 🧠🥣",
  "Loading genius mode… doucement hein 😏",
  "Downloading confidence… oui oui ✨",
  "Waking up the pixels… bonjour pixels 👋",
  "Bribing the server with croissants… ça marche 🥐",
  "Connecting the dots… comme par magie 🪄",
  "Sharpening your brain… très pointu 🧠✏️",
  "Teaching the screen manners… s’il te plaît 😌",
  "Loading vibes… très chic 💅",
  "Convincing the app you’re brilliant… facile 😎",
  "Calibrating your future fluency… presque parfait 🎯",
  "Charging creativity… allez allez ⚡",
  "Untangling digital spaghetti… mamma mia… pardon 😅",
  "Giving the app a pep talk… tu peux le faire 💪",
  "Buffering brilliance… c’est sérieux 🧠✨",
  "Rolling out the red carpet… bienvenue 🌟",
  "Polishing pixels and pronunciations… très propre 🧼",
  "Tuning your experience… comme une guitare 🎸",
  "Almost there… respire… inspire… expire… parfait 😮‍💨"
];

// rotate quips
let index = Number(sessionStorage.getItem("saybon_quip_index")) || 0;
document.getElementById("loaderText").textContent = quips[index];
index = (index + 1) % quips.length;
sessionStorage.setItem("saybon_quip_index", index);

// CENTRALIZED ROUTING
const next = sessionStorage.getItem("saybon_next");

if (next) {
  setTimeout(() => {
    sessionStorage.removeItem("saybon_next");
    window.location.href = next;
  }, 2200);
}
