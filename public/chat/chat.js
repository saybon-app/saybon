import { auth, db } from "/js/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const roomButtons = document.querySelectorAll(".room-btn");
const toggleBtn = document.getElementById("toggleBtn");
const welcomeWorkspace = document.getElementById("welcomeWorkspace");
const chatWorkspace = document.getElementById("chatWorkspace");
const roomTitle = document.getElementById("roomTitle");
const homeBtn = document.getElementById("homeBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const avatarCamera = document.getElementById("avatarCamera");
const userEmailEl = document.getElementById("userEmail");
const mediaBtn = document.getElementById("mediaBtn");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const voiceBtn = document.getElementById("voiceBtn");
const composer = document.getElementById("composer");
const composerInput = document.getElementById("composerInput");
const sendBtn = document.getElementById("sendBtn");
const messagesContainer = document.getElementById("messagesContainer");
const recordingPanel = document.getElementById("recordingPanel");
const cancelRecording = document.getElementById("cancelRecording");
const recordingTimer = document.getElementById("recordingTimer");

let recordingSeconds = 0;
let recordingInterval;
let currentUser = null;
let currentRoomId = null;
let unsubscribeMessages = null;

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// =========================================================
// AUTH STATE - populates real signed-in user details
// =========================================================

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    userEmailEl.textContent = user.email || "";
    if (user.photoURL) {
      avatarPreview.src = user.photoURL;
    }
  }
});

// =========================================================
// ROOM SWITCHING
// =========================================================

roomButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    document
      .querySelectorAll(".sidebar-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");

    welcomeWorkspace.classList.add("hidden");
    chatWorkspace.classList.remove("hidden");

    roomTitle.innerHTML = btn.dataset.room;
    currentRoomId = btn.dataset.roomId;

    subscribeToRoom(currentRoomId);

  });

});

// =========================================================
// TOGGLE BUTTON
// =========================================================

toggleBtn.addEventListener("click", () => {

  document
    .querySelectorAll(".sidebar-btn")
    .forEach(b => b.classList.remove("active"));

  toggleBtn.classList.add("active");

  chatWorkspace.classList.add("hidden");
  welcomeWorkspace.classList.remove("hidden");

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
  currentRoomId = null;

});

// =========================================================
// HOME / DASHBOARD
// =========================================================

homeBtn.addEventListener("click", () => {
  window.location.href = "/";
});

dashboardBtn.addEventListener("click", () => {
  window.location.href = "/dashboard/";
});

// =========================================================
// AVATAR UPLOAD (local preview only - not saved anywhere yet)
// =========================================================

avatarCamera.addEventListener("click", () => {
  avatarInput.click();
});

avatarInput.addEventListener("change", (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    avatarPreview.src = event.target.result;
  };

  reader.readAsDataURL(file);

});

// =========================================================
// MEDIA ATTACHMENTS (preview only - not sent yet)
// =========================================================

mediaBtn.addEventListener("click", () => {
  mediaInput.click();
});

mediaInput.addEventListener("change", (e) => {

  mediaPreview.innerHTML = "";

  const files = [...e.target.files];

  if (!files.length) {
    return;
  }

  mediaPreview.classList.remove("hidden");

  files.forEach(file => {

    const card = document.createElement("div");
    card.className = "media-card";
    card.innerHTML = escapeHtml(file.name);
    mediaPreview.appendChild(card);

  });

});

// =========================================================
// VOICE NOTE SYSTEM (recording UI only - not sent yet)
// =========================================================

voiceBtn.addEventListener("click", () => {

  composer.classList.add("hidden");
  recordingPanel.classList.remove("hidden");

  recordingSeconds = 0;
  recordingTimer.innerHTML = "0:00";

  recordingInterval = setInterval(() => {

    recordingSeconds++;

    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;

    recordingTimer.innerHTML = mins + ":" + secs.toString().padStart(2, "0");

  }, 1000);

});

cancelRecording.addEventListener("click", () => {

  clearInterval(recordingInterval);

  recordingPanel.classList.add("hidden");
  composer.classList.remove("hidden");

});

document
  .getElementById("sendRecording")
  .addEventListener("click", () => {

    clearInterval(recordingInterval);

    recordingPanel.classList.add("hidden");
    composer.classList.remove("hidden");

  });

// =========================================================
// REAL MESSAGE SENDING
// =========================================================

async function sendMessage() {

  const text = composerInput.value.trim();

  if (!text || !currentRoomId || !currentUser) {
    return;
  }

  composerInput.value = "";

  try {

    await addDoc(collection(db, "chatRooms", currentRoomId, "messages"), {
      uid: currentUser.uid,
      displayName: currentUser.displayName || currentUser.email || "Learner",
      text: text,
      createdAt: serverTimestamp()
    });

  } catch (err) {

    console.error("Send failed:", err);
    alert("Could not send message. Please try again.");

  }

}

sendBtn.addEventListener("click", sendMessage);

composerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// =========================================================
// REAL-TIME MESSAGE LISTENER
// =========================================================

function subscribeToRoom(roomId) {

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  messagesContainer.innerHTML = "";

  const q = query(
    collection(db, "chatRooms", roomId, "messages"),
    orderBy("createdAt")
  );

  unsubscribeMessages = onSnapshot(q, (snapshot) => {

    messagesContainer.innerHTML = "";

    snapshot.forEach(docSnap => {

      const msg = docSnap.data();
      const isOwn = currentUser && msg.uid === currentUser.uid;

      const row = document.createElement("div");
      row.className = "message-row" + (isOwn ? " outgoing" : "");

      const name = escapeHtml(msg.displayName || "Learner");
      const initial = escapeHtml((msg.displayName || "?").charAt(0).toUpperCase());
      const text = escapeHtml(msg.text || "");

      let inner = "";
      if (!isOwn) {
        inner += "<div class=\"message-avatar\">" + initial + "</div>";
      }
      inner += "<div class=\"message-bubble " + (isOwn ? "outgoing-bubble" : "incoming-bubble") + "\">";
      if (!isOwn) {
        inner += "<div class=\"message-user\">" + name + "</div>";
      }
      inner += "<div>" + text + "</div>";
      inner += "</div>";

      row.innerHTML = inner;

      messagesContainer.appendChild(row);

    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;

  });

}