// ================================
// SAYBON GLOBAL LOADER - MASTER ROUTER
// ================================

const quips = ["Hold on... our hamsters are learning French... et toi? " + String.fromCodePoint(0x1F439), "Stirring the brain soup... tres delicieux " + String.fromCodePoint(0x1F9E0) + String.fromCodePoint(0x1F963), "Loading genius mode... doucement hein " + String.fromCodePoint(0x1F60F), "Downloading confidence... oui oui " + String.fromCodePoint(0x2728), "Waking up the pixels... bonjour pixels " + String.fromCodePoint(0x1F44B), "Bribing the server with croissants... ca marche " + String.fromCodePoint(0x1F950), "Connecting the dots... comme par magie " + String.fromCodePoint(0x1FA84), "Sharpening your brain... tres pointu " + String.fromCodePoint(0x1F9E0) + String.fromCodePoint(0x270F) + String.fromCodePoint(0xFE0F), "Teaching the screen manners... sil te plait " + String.fromCodePoint(0x1F60C), "Loading vibes... tres chic " + String.fromCodePoint(0x1F485), "Convincing the app you are brilliant... facile " + String.fromCodePoint(0x1F60E), "Calibrating your future fluency... presque parfait " + String.fromCodePoint(0x1F3AF), "Charging creativity... allez allez " + String.fromCodePoint(0x26A1), "Untangling digital spaghetti... mamma mia... pardon " + String.fromCodePoint(0x1F605), "Giving the app a pep talk... tu peux le faire " + String.fromCodePoint(0x1F4AA), "Buffering brilliance... cest serieux " + String.fromCodePoint(0x1F9E0) + String.fromCodePoint(0x2728), "Rolling out the red carpet... bienvenue " + String.fromCodePoint(0x1F31F), "Polishing pixels and pronunciations... tres propre " + String.fromCodePoint(0x1F9FC), "Tuning your experience... comme une guitare " + String.fromCodePoint(0x1F3B8), "Almost there... respire... inspire... expire... parfait " + String.fromCodePoint(0x1F62E) + String.fromCodePoint(0x200D) + String.fromCodePoint(0x1F4A8)];

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
  }, 350);
}




