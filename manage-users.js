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

  // Only admins should manage users
  const myself = await getDoc(doc(db, "users", user.uid));
  if (!myself.exists() || (myself.data().role !== "admin" && myself.data().role !== "superAdmin")) {
    alert("Нямате достъп до тази страница.");
    location.href = "index.html";
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
      <p>Роля: <strong class="user-role">${u.role}</strong></p>
      <div style="display:flex;gap:.5rem;margin-top:.5rem">
        <button class="btn student">Student</button>
        <button class="btn teacher">Teacher</button>
        <button class="btn admin">Admin</button>
        <button class="btn mod">Moderator</button>
        <button class="btn danger">Delete</button>
      </div>
    `;

    const setRole = (r) => updateDoc(doc(db, "users", uid), { role: r }).then(() => {
      card.querySelector('.user-role').textContent = r;
    });

    card.querySelector(".student").onclick = () => setRole("student");
    card.querySelector(".teacher").onclick = () => setRole("teacher");
    card.querySelector(".admin").onclick = () => setRole("admin");
    card.querySelector(".mod").onclick = () => setRole("moderator");

    card.querySelector(".danger").onclick = () =>
      deleteDoc(doc(db, "users", uid)).then(() => card.remove());

    list.appendChild(card);
  });
});
