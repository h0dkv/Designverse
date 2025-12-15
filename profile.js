import { auth, db } from "./firebase-init.js";
import { doc, getDoc } from "firebase/firestore";

const emailEl = document.getElementById("email");
const roleEl = document.getElementById("role");
const adminLink = document.getElementById("adminLink");

const user = auth.currentUser;

const snap = await getDoc(doc(db, "users", user.uid));

emailEl.textContent = user.email;
roleEl.textContent = snap.data().role;

if (snap.data().role === "admin") {
  adminLink.style.display = "inline-block";
}
