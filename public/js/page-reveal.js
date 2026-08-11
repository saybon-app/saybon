/* =========================================================
   SAYBON GLOBAL PAGE REVEAL
   Pairs with /css/page-reveal.css. Waits for the page to be
   fully loaded (images included) then fades body in smoothly.
   No-ops safely if body doesn't have the pr-preload class.
========================================================= */

function runPageReveal() {
  if (!document.body.classList.contains("pr-preload")) return;

  const reveal = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("pr-in");
      });
    });
  };

  if (document.readyState === "complete") {
    reveal();
  } else {
    window.addEventListener("load", reveal, { once: true });
  }
}

runPageReveal();