// ==================================
// CAMPUSLY - CLOUD (Firebase login + saving)
// Load with: <script type="module" src="cloud.js"></script>
// ==================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 👇 PASTE YOUR FIREBASE CONFIG HERE (from Firebase → Project settings → Your apps)
const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let uid = null, prefix = "", pending = null, syncing = false, queue = {}, timer = null;

// ---------- save to cloud whenever the app saves locally ----------
async function flush() {
  clearTimeout(timer);
  if (!uid || !Object.keys(queue).length) return;
  const data = queue;
  queue = {};
  try {
    await setDoc(doc(db, "users", uid), { data }, { merge: true });
  } catch (err) {
    console.error("Cloud save failed:", err);
    queue = { ...data, ...queue };
  }
}

const originalSet = Storage.prototype.setItem;
Storage.prototype.setItem = function (k, v) {
  originalSet.call(this, k, v);
  if (!syncing && uid && k.startsWith(prefix)) {
    queue[k.slice(prefix.length)] = String(v);
    clearTimeout(timer);
    timer = setTimeout(flush, 800);
  }
};

// ---------- login / register ----------
const messages = {
  "auth/email-already-in-use": "Account already exists. Please login.",
  "auth/invalid-credential": "Invalid email or password!",
  "auth/wrong-password": "Invalid email or password!",
  "auth/user-not-found": "Invalid email or password!",
  "auth/weak-password": "Password must have at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email.",
  "auth/network-request-failed": "No internet connection."
};

// capture phase: runs before the old local login code
$("authScreen").addEventListener("submit", async e => {
  e.preventDefault();
  e.stopPropagation();
  const msg = $("authMessage");
  msg.textContent = "";
  const email = $("email").value.trim().toLowerCase();
  const pw = $("password").value;

  try {
    if (isRegistering) {
      const name = $("studentName").value.trim();
      const department = $("department").value.trim();
      const year = $("year").value;
      if (!name || !department || !year) {
        msg.textContent = "Please complete all fields!";
        return;
      }
      pending = { name, department, year };
      await createUserWithEmailAndPassword(auth, email, pw);
    } else {
      await signInWithEmailAndPassword(auth, email, pw);
    }
  } catch (err) {
    msg.textContent = messages[err.code] || "Error: " + err.code;
  }
}, true);

// ---------- logout ----------
$("appShell").addEventListener("click", async e => {
  if (e.target.id !== "logoutBtn") return;
  e.stopPropagation();
  await flush();
  await signOut(auth);
  localStorage.removeItem("campuslyCurrentUser");
  location.reload();
}, true);

// ---------- when a user is signed in ----------
onAuthStateChanged(auth, async u => {
  if (!u) return;
  try {
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    let d = snap.exists() ? snap.data() : null;

    if (!d) {
      d = { ...(pending || { name: "Student", department: "-", year: "-" }), email: u.email, data: {} };
      await setDoc(ref, d);
    }

    uid = u.uid;
    prefix = "campusly_" + u.email + "_";

    syncing = true;
    Object.entries(d.data || {}).forEach(([k, v]) => localStorage.setItem(prefix + k, v));
    syncing = false;

    openDashboard({ name: d.name, department: d.department, year: d.year, email: u.email });
  } catch (err) {
    console.error(err);
    $("authMessage").textContent = "Could not load your data. Check Firebase rules.";
  }
});
