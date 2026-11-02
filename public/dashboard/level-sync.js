import { auth } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
const API = "https://saybonapp-server.onrender.com";
const show = (lv) => document.querySelectorAll(".js-profile-level").forEach((el) => { el.textContent = lv; });
function local() { try { return sessionStorage.getItem("saybon_level"); } catch (e) { return null; } }
async function call(user, method, body, tries) {
  for (let i = 0; i < tries; i++) {
    try {
      const t = await user.getIdToken();
      const r = await fetch(API + "/api/level", { method, headers: Object.assign({ Authorization: "Bearer " + t }, body ? { "Content-Type": "application/json" } : {}), body: body ? JSON.stringify(body) : undefined });
      if (r.ok) return await r.json();
    } catch (e) { }
    await new Promise((r) => setTimeout(r, 4000));
  }
  return null;
}
onAuthStateChanged(auth, async (user) => {
  if (!user || (user.isAnonymous && !user.email)) return;
  const lv = local();
  if (lv && /^[A-C][0-2]$/i.test(lv)) {
    show(lv.toUpperCase());
    call(user, "POST", { level: lv }, 5);          // save it to the account
    return;
  }
  const d = await call(user, "GET", null, 6);      // nothing in this browser: ask the account
  if (d && d.level) {
    try { sessionStorage.setItem("saybon_level", d.level); localStorage.removeItem("saybon_start_scratch"); } catch (e) { }
    show(d.level);
    return;
  }
  // No level anywhere (a new learner, or "Start from scratch"): the starting level is A0
  if (d) {
    try { sessionStorage.setItem("saybon_level", "A0"); localStorage.removeItem("saybon_start_scratch"); } catch (e) { }
    show("A0");
    call(user, "POST", { level: "A0" }, 5);
  }
});
