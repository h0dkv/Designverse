import { auth } from "./firebase-init.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const db = getFirestore();

export async function getUserRole() {
  const user = auth.currentUser;
  if (!user) return null;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return null;
  return snap.data().role || null;
}

export async function isStudent() {
  const r = await getUserRole();
  return r === "student";
}

export async function isTeacher() {
  const r = await getUserRole();
  return r === "teacher";
}

export async function isAdmin() {
  const r = await getUserRole();
  return r === "admin" || r === "superAdmin";
}

export async function isSuperAdmin() {
  const r = await getUserRole();
  return r === "superAdmin";
}
