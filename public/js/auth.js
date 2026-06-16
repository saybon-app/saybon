const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "saybon-3e3c2.firebaseapp.com",
  projectId: "saybon-3e3c2",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loginBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    auth
      .signInWithPopup(provider)
      .then(() => {
        // ✅ correct path from auth → dashboard
        window.location.href = "../dashboard/index.html";
      })
      .catch((error) => {
        alert("Login failed. Please try again.");
        console.error(error);
      });
  });
});
