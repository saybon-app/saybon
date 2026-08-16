import { auth, db } from "/js/firebase-init.js";
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import {
  collection, addDoc, doc, setDoc, getDocs, query, where, documentId,
  orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const ROOM_IDS = [
  "general",
  "lesson-a0","lesson-a1","lesson-a2","lesson-b1","lesson-b2","lesson-c1",
  "delf-a1","delf-a2","delf-b1","delf-b2",
  "practice-partners","culture-corner",
  "translation-clients","translation-translators",
  "feedback","support"
];

const roomButtons = document.querySelectorAll(".room-btn");
const toggleBtn = document.getElementById("toggleBtn");
const promoBtn = document.getElementById("promoBtn");
const welcomeWorkspace = document.getElementById("welcomeWorkspace");
const chatWorkspace = document.getElementById("chatWorkspace");
const roomTitle = document.getElementById("roomTitle");
const roomAvatar = document.getElementById("roomAvatar");
const homeBtn = document.getElementById("homeBtn");
const dashboardBtn = document.getElementById("dashboardBtn");
const searchToggle = document.getElementById("searchToggle");
const searchRow = document.getElementById("searchRow");
const sidebarProfileAvatar = document.getElementById("sidebarProfileAvatar");
const sidebarProfileName = document.getElementById("sidebarProfileName");
const sidebarProfileEmail = document.getElementById("sidebarProfileEmail");
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

function formatPreviewTime(ts) {
  if (!ts || !ts.toDate) return "";
  const date = ts.toDate();
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const diffDays = Math.floor((now - date) / 86400000);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + "d ago";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// =========================================================
// AUTH STATE
// =========================================================

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    const name = user.displayName || user.email || "Learner";
    sidebarProfileName.textContent = name;
    sidebarProfileEmail.textContent = user.email || "";
    if (user.photoURL) {
      sidebarProfileAvatar.src = user.photoURL;
    }
  }
});

// =========================================================
// LIVE SIDEBAR CONVERSATION PREVIEWS
// =========================================================

onSnapshot(
  query(collection(db, "chatRooms"), where(documentId(), "in", ROOM_IDS)),
  (snapshot) => {
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const previewEl = document.getElementById("preview-" + docSnap.id);
      const timeEl = document.getElementById("time-" + docSnap.id);
      if (previewEl) {
        const sender = data.lastSenderName ? escapeHtml(data.lastSenderName) + ": " : "";
        previewEl.textContent = sender + escapeHtml(data.lastMessage || "");
      }
      if (timeEl) timeEl.textContent = formatPreviewTime(data.lastMessageAt);
    });
  }
);

// =========================================================
// ROOM SWITCHING
// =========================================================

function openRoom(roomId, roomName) {
  document.querySelectorAll(".conversation-item, .new-chat-btn").forEach(b => b.classList.remove("active"));
  const btn = document.querySelector('.room-btn[data-room-id="' + roomId + '"]');
  if (btn) btn.classList.add("active");

  welcomeWorkspace.classList.add("hidden");
  chatWorkspace.classList.remove("hidden");

  document.querySelector(".chatroom-shell").classList.add("mobile-chat-open");

  roomTitle.innerHTML = roomName;
  if (btn) {
    const srcAvatar = btn.querySelector(".conversation-avatar");
    roomAvatar.innerHTML = srcAvatar ? srcAvatar.innerHTML : "";
  }
  currentRoomId = roomId;

  subscribeToRoom(roomId);
}

function wireRoomButton(btn){
  btn.addEventListener("click", () => {
    openRoom(btn.dataset.roomId, btn.dataset.room);
  });
}

roomButtons.forEach(wireRoomButton);

// =========================================================
// CATEGORY EXPAND/COLLAPSE (Lessons, DELF, Translation Service)
// =========================================================

document.querySelectorAll(".category-header").forEach(header => {
  header.addEventListener("click", () => {
    const cat = header.dataset.category;
    const children = document.querySelector('[data-category-children="' + cat + '"]');
    const isHidden = children.classList.toggle("hidden");
    header.classList.toggle("expanded", !isHidden);
  });
});

// =========================================================
// CREATE NEW ROOM
// =========================================================

const createRoomBtn = document.getElementById("createRoomBtn");
const createRoomModal = document.getElementById("createRoomModal");
const newRoomNameInput = document.getElementById("newRoomName");
const confirmCreateRoomBtn = document.getElementById("confirmCreateRoom");
const cancelCreateRoomBtn = document.getElementById("cancelCreateRoom");
const customRoomsList = document.getElementById("customRoomsList");
const customRoomsLabel = document.getElementById("customRoomsLabel");

createRoomBtn.addEventListener("click", () => {
  newRoomNameInput.value = "";
  createRoomModal.classList.remove("hidden");
  newRoomNameInput.focus();
});

cancelCreateRoomBtn.addEventListener("click", () => {
  createRoomModal.classList.add("hidden");
});

function slugify(name){
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 30);
}

function buildCustomRoomButton(roomId, name){
  const btn = document.createElement("button");
  btn.className = "room-btn conversation-item";
  btn.dataset.room = name;
  btn.dataset.roomId = roomId;
  btn.innerHTML =
    "<span class='conversation-avatar'><svg viewBox='0 0 24 24' width='22' height='22' fill='none' stroke='currentColor' stroke-width='1.8'><circle cx='12' cy='12' r='10'/><path d='M12 8v8M8 12h8'/></svg></span>" +
    "<span class='conversation-body'>" +
      "<span class='conversation-top-row'><span class='conversation-name'>" + escapeHtml(name) + "</span><span class='conversation-time' id='time-" + roomId + "'></span></span>" +
      "<span class='conversation-preview' id='preview-" + roomId + "'>No messages yet</span>" +
    "</span>";
  wireRoomButton(btn);
  return btn;
}

confirmCreateRoomBtn.addEventListener("click", async () => {

  if (!currentUser) {
    alert("Please sign in to create a room.");
    return;
  }

  const name = newRoomNameInput.value.trim();
  if (!name) return;

  const roomId = "custom-" + slugify(name) + "-" + Date.now().toString(36).slice(-4);

  confirmCreateRoomBtn.disabled = true;

  try{

    await setDoc(doc(db, "chatRooms", roomId), {
      name,
      isCustom: true,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp()
    });

    customRoomsLabel.style.display = "block";
    const btn = buildCustomRoomButton(roomId, name);
    customRoomsList.appendChild(btn);

    createRoomModal.classList.add("hidden");
    openRoom(roomId, name);

  }catch(err){
    alert("Could not create the room. Please try again.");
  }finally{
    confirmCreateRoomBtn.disabled = false;
  }

});

async function loadCustomRooms(){
  try{
    const snap = await getDocs(query(collection(db, "chatRooms"), where("isCustom","==",true)));
    if (snap.empty) return;

    const rooms = [];
    snap.forEach(d => rooms.push({ id: d.id, ...d.data() }));
    rooms.sort((a,b) => {
      const aT = a.createdAt && a.createdAt.seconds ? a.createdAt.seconds : 0;
      const bT = b.createdAt && b.createdAt.seconds ? b.createdAt.seconds : 0;
      return aT - bT;
    });

    customRoomsLabel.style.display = "block";
    rooms.forEach(r => {
      customRoomsList.appendChild(buildCustomRoomButton(r.id, r.name));
    });

  }catch(err){
    console.error("Could not load custom rooms:", err);
  }
}

loadCustomRooms();

// =========================================================
// PROFILE EDIT MODAL (username + photo)
// =========================================================

const storage = getStorage();

const sidebarProfileTrigger = document.getElementById("sidebarProfileTrigger");
const profileModal = document.getElementById("profileModal");
const profilePhotoPreview = document.getElementById("profilePhotoPreview");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const profilePhotoInput = document.getElementById("profilePhotoInput");
const profileNameInput = document.getElementById("profileNameInput");
const cancelProfileEdit = document.getElementById("cancelProfileEdit");
const saveProfileEdit = document.getElementById("saveProfileEdit");

let pendingPhotoFile = null;

sidebarProfileTrigger.addEventListener("click", () => {

  if (!currentUser) {
    alert("Please sign in to edit your profile.");
    return;
  }

  pendingPhotoFile = null;
  profilePhotoPreview.src = sidebarProfileAvatar.src;
  profileNameInput.value = currentUser.displayName || "";
  profileModal.classList.remove("hidden");

});

cancelProfileEdit.addEventListener("click", () => {
  profileModal.classList.add("hidden");
});

changePhotoBtn.addEventListener("click", () => {
  profilePhotoInput.click();
});

profilePhotoInput.addEventListener("change", () => {
  const file = profilePhotoInput.files[0];
  if (!file) return;
  pendingPhotoFile = file;
  profilePhotoPreview.src = URL.createObjectURL(file);
});

saveProfileEdit.addEventListener("click", async () => {

  const newName = profileNameInput.value.trim();
  if (!newName) {
    alert("Please enter a name.");
    return;
  }

  saveProfileEdit.disabled = true;
  saveProfileEdit.textContent = "Saving...";

  try {

    let photoURL = currentUser.photoURL || "";

    if (pendingPhotoFile) {
      const fileRef = ref(storage, "chatAvatars/" + currentUser.uid + "/" + Date.now() + "_" + pendingPhotoFile.name);
      await uploadBytesResumable(fileRef, pendingPhotoFile);
      photoURL = await getDownloadURL(fileRef);
    }

    await updateProfile(currentUser, { displayName: newName, photoURL });

    sidebarProfileName.textContent = newName;
    if (photoURL) sidebarProfileAvatar.src = photoURL;

    profileModal.classList.add("hidden");

  } catch (err) {
    console.error("Profile update failed:", err);
    alert("Could not update your profile. Please try again.");
  } finally {
    saveProfileEdit.disabled = false;
    saveProfileEdit.textContent = "Save";
  }

});

promoBtn.addEventListener("click", () => {
  const generalBtn = document.querySelector('.room-btn[data-room-id="general"]');
  openRoom("general", "General");
});

// =========================================================
// TOGGLE / WELCOME
// =========================================================

toggleBtn.addEventListener("click", () => {
  document.querySelectorAll(".conversation-item, .new-chat-btn").forEach(b => b.classList.remove("active"));
  toggleBtn.classList.add("active");

  chatWorkspace.classList.add("hidden");
  welcomeWorkspace.classList.remove("hidden");

  document.querySelector(".chatroom-shell").classList.remove("mobile-chat-open");

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
  currentRoomId = null;
});

// =========================================================
// HOME / DASHBOARD / HEADER ICONS
// =========================================================

homeBtn.addEventListener("click", () => { window.location.href = "/"; });
dashboardBtn.addEventListener("click", () => { window.location.href = "/dashboard/"; });

document.getElementById("mobileBackBtn").addEventListener("click", () => {
  document.querySelector(".chatroom-shell").classList.remove("mobile-chat-open");
});

searchToggle.addEventListener("click", () => {
  searchRow.classList.toggle("hidden");
});

// =========================================================
// MEDIA ATTACHMENTS (preview only)
// =========================================================

mediaBtn.addEventListener("click", () => { mediaInput.click(); });

mediaInput.addEventListener("change", (e) => {
  mediaPreview.innerHTML = "";
  const files = [...e.target.files];
  if (!files.length) return;
  mediaPreview.classList.remove("hidden");
  files.forEach(file => {
    const card = document.createElement("div");
    card.className = "media-card";
    card.innerHTML = escapeHtml(file.name);
    mediaPreview.appendChild(card);
  });
});

// =========================================================
// VOICE NOTE SYSTEM (recording UI only)
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

document.getElementById("sendRecording").addEventListener("click", () => {
  clearInterval(recordingInterval);
  recordingPanel.classList.add("hidden");
  composer.classList.remove("hidden");
});

// =========================================================
// REAL MESSAGE SENDING
// =========================================================

async function sendMessage() {
  const text = composerInput.value.trim();
  if (!text || !currentRoomId || !currentUser) return;

  composerInput.value = "";
  const displayName = currentUser.displayName || currentUser.email || "Learner";

  try {
    await addDoc(collection(db, "chatRooms", currentRoomId, "messages"), {
      uid: currentUser.uid,
      displayName: displayName,
      text: text,
      createdAt: serverTimestamp()
    });

    const preview = text.length > 60 ? text.slice(0, 60) + "…" : text;

    await setDoc(doc(db, "chatRooms", currentRoomId), {
      lastMessage: preview,
      lastMessageAt: serverTimestamp(),
      lastSenderName: displayName
    }, { merge: true });

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

  const q = query(collection(db, "chatRooms", roomId, "messages"), orderBy("createdAt"));

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
      if (!isOwn) inner += "<div class=\"message-avatar\">" + initial + "</div>";
      inner += "<div class=\"message-bubble " + (isOwn ? "outgoing-bubble" : "incoming-bubble") + "\">";
      if (!isOwn) inner += "<div class=\"message-user\">" + name + "</div>";
      inner += "<div>" + text + "</div></div>";

      row.innerHTML = inner;
      messagesContainer.appendChild(row);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}