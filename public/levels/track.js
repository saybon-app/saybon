import { META, esc, whenUser, loadProgress, loadTrackData, isPreview } from "./lessons-common.js";
var q = new URLSearchParams(location.search), id = q.get("track");
var meta = META.filter(function (t) { return t.id === id; })[0];
var pv = isPreview();
document.getElementById("lsBack").onclick = function () { location.href = "index.html" + (pv ? "?preview=1" : ""); };
(async function () {
  var list = document.getElementById("lsList");
  if (!meta) { list.innerHTML = '<p class="ls-note">Track not found.</p>'; return; }
  document.getElementById("trCefr").textContent = meta.cefr;
  document.getElementById("trName").textContent = meta.name;
  document.getElementById("trTone").textContent = meta.tone;
  var data = await loadTrackData(id);
  var u = await whenUser(), prog = u ? await loadProgress() : { completed: {}, scores: {} };
  var done = (prog.completed || {})[id] || [];
  list.innerHTML = meta.titles.map(function (t, i) {
    var n = i + 1, ready = !!(data && data.lessons.filter(function (l) { return l.n === n; })[0]);
    var isDone = done.indexOf(n) >= 0;
    var open = pv || n === 1 || done.indexOf(n - 1) >= 0;
    var cls = "ls-row" + (isDone ? " is-done" : "") + (!ready ? " is-soon" : (!open ? " is-locked" : ""));
    var inner = '<span class="ls-n">' + (isDone ? "✓" : n) + '</span><span class="ls-t"><b>' + esc(t[0]) + "</b><i>" + esc(t[1]) + " · " + esc(t[2]) + "</i></span>" +
      '<span class="ls-st">' + (!ready ? "Soon" : (open ? "" : "🔒")) + "</span>";
    return ready && open ? '<a class="' + cls + '" href="lesson.html?track=' + id + "&n=" + n + (pv ? "&preview=1" : "") + '">' + inner + "</a>" : '<div class="' + cls + '">' + inner + "</div>";
  }).join("");
})();
