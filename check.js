import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  if (snap.data().role === "admin") {
    document.getElementById("admin-link").style.display = "inline-block";
  }
});
