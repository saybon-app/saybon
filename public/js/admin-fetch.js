/* admin-fetch.js: attaches the signed-in admin's Firebase ID token to every call to the SayBon API. */
(function () {
  var API = "https://saybonapp-server.onrender.com/api/";
  var origFetch = window.fetch.bind(window);
  var ready = null;
  var adminUser = null;
  function init() {
    if (ready) return ready;
    ready = Promise.all([
      import("/js/firebase-init.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js")
    ]).then(function (m) {
      var auth = m[0].auth, fa = m[1];
      return new Promise(function (resolve) {
        var first = true;
        fa.onAuthStateChanged(auth, function (u) {
          if (u && !u.isAnonymous) adminUser = u;
          if (first) { first = false; resolve(); }
        });
      });
    }).catch(function (e) { console.error("admin-fetch init failed", e); });
    return ready;
  }
  window.fetch = function (input, initOpts) {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf(API) !== 0) return origFetch(input, initOpts);
    return init().then(function () {
      if (!adminUser) return null;
      return adminUser.getIdToken();
    }).then(function (token) {
      var opts = Object.assign({}, initOpts || {});
      var h = new Headers(opts.headers || (typeof input !== "string" && input.headers) || {});
      if (token && !(h.has("Authorization") && h.get("Authorization").length > 8)) h.set("Authorization", "Bearer " + token);
      opts.headers = h;
      return origFetch(input, opts);
    });
  };
})();
