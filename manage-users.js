import { auth } from "./firebase-init.js";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const db = getFirestore();
const list = document.getElementById("users-list");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }

  const snap = await getDocs(collection(db, "users"));

  snap.forEach(docSnap => {
    const u = docSnap.data();
    const uid = docSnap.id;

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${u.email}</h3>
      <p>Роля: <strong>${u.role}</strong></p>
      <button class="btn admin">Admin</button>
      <button class="btn mod">Moderator</button>
      <button class="btn danger">Delete</button>
    `;

    card.querySelector(".admin").onclick = () =>
      updateDoc(doc(db, "users", uid), { role: "admin" });

    card.querySelector(".mod").onclick = () =>
      updateDoc(doc(db, "users", uid), { role: "moderator" });

    card.querySelector(".danger").onclick = () =>
      deleteDoc(doc(db, "users", uid));

    list.appendChild(card);
  });
});
