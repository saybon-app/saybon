import { whenUser, loadProgress, status, esc, CUR } from "./tk-common.js";

var main = document.getElementById("jyMain");
var params = new URLSearchParams(location.search);
var unlockAll = params.get("preview") === "1";

(async function () {
  var user = await whenUser();
  if (!user) { main.innerHTML = '<p class="jy-loading">Please sign in to play.</p>'; return; }
  var scores = await loadProgress();
  var html = "";
  var firstOpen = null;

  CUR.levels.forEach(function (lv) {
    var gradSt = status(lv, lv.graduation, scores, unlockAll);
    var levelDone = gradSt.done;
    var firstSt = status(lv, lv.games[0], scores, unlockAll);
    var doneCount = lv.games.filter(function (g) { return status(lv, g, scores, unlockAll).done; }).length;
    html += '<section class="jy-level' + (firstSt.unlocked ? "" : " is-locked") + '" id="lv-' + lv.id + '">' +
      '<div class="jy-level-head"><span class="jy-cefr">' + esc(lv.cefr) + '</span><div><h2>' + esc(lv.place) +
      '</h2><p>' + esc(lv.placeEn) + ' · ' + esc(lv.tagline) + '</p></div><span class="jy-count">' +
      (levelDone ? "✓" : doneCount + "/" + lv.games.length) + '</span></div>' +
      '<div class="jy-scene">' + esc(lv.sceneImage.icon) + ' <small>' + esc(lv.sceneImage.description) + '</small></div>' +
      '<div class="jy-games">';
    lv.games.concat([lv.graduation]).forEach(function (g) {
      var st = status(lv, g, scores, unlockAll);
      if (st.unlocked && !st.done && !firstOpen) firstOpen = g.id;
      var tag = st.unlocked ? "a" : "div";
      var href = st.unlocked ? ' href="play.html?game=' + g.id + (unlockAll ? "&preview=1" : "") + '"' : "";
      html += "<" + tag + ' class="jy-game' + (g.isGraduation ? " is-grad" : "") + (st.done ? " is-done" : "") +
        (st.unlocked ? "" : " is-locked") + '" id="g-' + g.id + '"' + href + ">" +
        '<span class="jy-num">' + (g.isGraduation ? "🎓" : g.index) + "</span>" +
        '<span class="jy-gt"><b>' + esc(g.title) + "</b><i>" + esc(g.titleEn) + " · " + esc(g.kindLabel[1]) + "</i></span>" +
        '<span class="jy-stars">' + (st.unlocked ? (st.done ? "★".repeat(st.stars) + "☆".repeat(3 - st.stars) : (st.avg ? st.avg + "%" : "")) : "🔒") + "</span></" + tag + ">";
    });
    html += "</div>" +
      '<p class="jy-grad-note">🎓 <b>' + esc(lv.graduation.title) + '</b> - ' + esc(lv.graduationMeans) + '</p></section>';
  });

  main.innerHTML = html;
  if (firstOpen) {
    var el = document.getElementById("g-" + firstOpen);
    if (el) { el.classList.add("is-next"); el.scrollIntoView({ block: "center" }); }
  }
})();
