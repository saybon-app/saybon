/* Dashboard navigation helpers. The numbers/name/level shown on first paint are now applied by the
   tiny inline script in index.html (reads the saved copy), so nothing here can reset them to 0. */
function goLevels(){ window.location.href="/levels/"; }
function goTalkletics(){ window.location.href="/talkletics/"; }
function goMusic(){ window.location.href="/music/"; }
function goDelf(){ window.location.href="/delf/"; }
function goTranslation(){ window.location.href="/translation/"; }
function goChat(){ window.location.href="/chat/"; }
function goFeedback(){ window.location.href="/feedback/"; }
function goSupport(){ window.location.href="/support/"; }
function goHome(){ if(window.stopAppBgMusic){ window.stopAppBgMusic(); } window.location.href="/"; }
function goLibrary(){ window.location.href="/library/"; }
