// ================================
// SAYBON GLOBAL LOADER - MASTER ROUTER
// ================================

const quips = ["Hold on... our hamsters are learning French... et toi?", "Stirring the brain soup... tres delicieux", "Loading genius mode... doucement hein", "Downloading confidence... oui oui", "Waking up the pixels... bonjour pixels", "Bribing the server with croissants... ca marche", "Connecting the dots... comme par magie", "Sharpening your brain... tres pointu", "Teaching the screen manners... sil te plait", "Loading vibes... tres chic", "Convincing the app you are brilliant... facile", "Calibrating your future fluency... presque parfait", "Charging creativity... allez allez", "Untangling digital spaghetti... mamma mia... pardon", "Giving the app a pep talk... tu peux le faire", "Buffering brilliance... cest serieux", "Rolling out the red carpet... bienvenue", "Polishing pixels and pronunciations... tres propre", "Tuning your experience... comme une guitare", "Almost there... respire... inspire... expire... parfait"];

// rotate quips
let index = Number(sessionStorage.getItem("saybon_quip_index")) || 0;
const loaderText = document.getElementById("loaderText");
if (loaderText) {
  loaderText.textContent = quips[index];
}
index = (index + 1) % quips.length;
sessionStorage.setItem("saybon_quip_index", index);

// CENTRALIZED ROUTING
const next = sessionStorage.getItem("saybon_next");

if (next) {
  setTimeout(() => {
    // IMPORTANT:
    // keep saybon_prev alive for the destination page
    // so that destination page can repair history and skip loader on Back.
    sessionStorage.removeItem("saybon_next");

    // remove loader from history
    window.location.replace(next);
  }, 700);
}


