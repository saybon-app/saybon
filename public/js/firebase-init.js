// Kept for every page that imports it. app/auth come from the light core; Firestore is added here.
import { app, auth } from "/js/firebase-core.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export { app, auth };
export const db = getFirestore(app);
