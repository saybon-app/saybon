import { auth } from "/js/firebase-init.js";
var API = "https://saybonapp-server.onrender.com";
var nativeFetch = window.fetch.bind(window);
function ready() {
  var p = auth.authStateReady ? auth.authStateReady() : Promise.resolve();
  return Promise.race([p, new Promise(function (r) { setTimeout(r, 3000); })]);
}
window.fetch = async function (input, init) {
  try {
    var url = typeof input === "string" ? input : (input && input.url) || "";
    if (url.indexOf(API + "/api/music") === 0) {
      await ready();
      var u = auth.currentUser;
      if (u) {
        var t = await u.getIdToken();
        init = Object.assign({}, init);
        var h = new Headers(init.headers || (typeof input !== "string" && input && input.headers) || {});
        if (!h.has("Authorization")) h.set("Authorization", "Bearer " + t);
        init.headers = h;
      }
    }
  } catch (e) {}
  return nativeFetch(input, init);
};