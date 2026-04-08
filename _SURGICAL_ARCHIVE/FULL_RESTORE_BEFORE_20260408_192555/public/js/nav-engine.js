(() => {
  "use strict";

  const FADE_MS = 420;
  const EXCLUDE_PROTOCOLS = ["mailto:", "tel:", "javascript:"];
  const EXCLUDE_EXTENSIONS = [
    ".pdf",".doc",".docx",".xls",".xlsx",".zip",".rar",".7z",".mp3",".mp4",".wav",".png",".jpg",".jpeg",".webp"
  ];

  function shouldIgnore(anchor) {
    if (!anchor) return true;
    if (anchor.target === "_blank") return true;
    if (anchor.hasAttribute("download")) return true;

    const href = anchor.getAttribute("href");
    if (!href || href.trim() === "" || href.startsWith("#")) return true;

    if (EXCLUDE_PROTOCOLS.some(p => href.startsWith(p))) return true;
    if (EXCLUDE_EXTENSIONS.some(ext => href.toLowerCase().includes(ext))) return true;

    const url = new URL(anchor.href, window.location.origin);

    if (url.origin !== window.location.origin) return true;
    if (url.pathname === window.location.pathname && url.search === window.location.search) return true;

    return false;
  }

  function enterPage() {
    document.body.classList.add("page-enter");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("page-enter-active");
        document.body.classList.remove("page-enter");
      });
    });

    setTimeout(() => {
      document.body.classList.remove("page-enter-active");
    }, FADE_MS + 80);
  }

  function exitTo(url) {
    document.body.classList.add("page-exit");
    setTimeout(() => {
      window.location.href = url;
    }, FADE_MS);
  }

  document.addEventListener("DOMContentLoaded", () => {
    enterPage();

    document.addEventListener("click", (e) => {
      const anchor = e.target.closest("a");
      if (!anchor || shouldIgnore(anchor)) return;

      e.preventDefault();
      exitTo(anchor.href);
    });

    document.querySelectorAll("[data-nav]").forEach(el => {
      el.addEventListener("click", (e) => {
        const url = el.getAttribute("data-nav");
        if (!url) return;
        e.preventDefault();
        exitTo(url);
      });
    });
  });

  window.addEventListener("pageshow", () => {
    document.body.classList.remove("page-exit");
    enterPage();
  });
})();
