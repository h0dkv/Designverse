import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("profile-email").textContent = user.email;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    document.getElementById("profile-role").textContent = snap.data().role;
  } else {
    document.getElementById("profile-role").textContent = "user";
  }
});

const snap = await getDoc(doc(db, "users", user.uid));
const role = snap.data().role;

document.getElementById("profile-role").textContent = role;
