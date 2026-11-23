
/* ==========================================
   EXACT ORB COLOR CONTROL
========================================== */

function applyOrbBackground(level) {
  let color = "#95C2BD"; // default fallback

  if (level === "A0") color = "#DE5969";
  if (level === "A1") color = "#DDA280";
  if (level === "A2") color = "#D6B9A4";
  if (level === "B1") color = "#3A837D";
  if (level === "B2") color = "#95C2BD";

  document.documentElement.style.setProperty("--orb-color", color);
}


