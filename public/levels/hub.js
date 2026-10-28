import { META, esc, whenUser, loadProgress, isPreview } from "./lessons-common.js";
var grid = document.getElementById("lsGrid");
(async function () {
  var done = {};
  var u = await whenUser();
  if (u) done = (await loadProgress()).completed || {};
  var pv = isPreview() ? "&preview=1" : "";
  grid.innerHTML = META.map(function (t) {
    var c = (done[t.id] || []).length;
    var kids = t.audience === "kids";
    return '<a class="ls-tile ' + (kids ? "is-kids" : "") + '" href="track.html?track=' + t.id + pv + '">' +
      '<span class="ls-cefr">' + esc(t.cefr) + '</span><b>' + esc(t.name) + '</b><small>' + esc(t.tone) + '</small>' +
      '<span class="ls-prog"><i style="width:' + (c / 25 * 100) + '%"></i></span><em>' + c + ' / 25</em></a>';
  }).join("");
})();
