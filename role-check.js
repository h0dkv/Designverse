import { auth } from "./firebase-init.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const db = getFirestore();

export async function isSuperAdmin() {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "users", user.uid));
  return snap.exists() && snap.data().role === "superAdmin";
}
