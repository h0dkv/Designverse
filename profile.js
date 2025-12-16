import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const emailEl = document.getElementById("email");
const roleEl = document.getElementById("role");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  emailEl.textContent = user.email;

  const snap = await getDoc(doc(db, "users", user.uid));
  roleEl.textContent = snap.data().role;
});
  