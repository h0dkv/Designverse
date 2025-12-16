import { auth, db } from "./firebase-init.js";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const usersList = document.getElementById("users-list");

// 🔒 Проверка дали е админ
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snap = await getDocs(collection(db, "users"));
  let isAdmin = false;

  snap.forEach(d => {
    if (d.id === user.uid && d.data().role === "admin") {
      isAdmin = true;
    }
  });

  if (!isAdmin) {
    alert("Нямате достъп до тази страница!");
    window.location.href = "index.html";
    return;
  }

  loadUsers();
});

// 📦 Зареждане на всички потребители
async function loadUsers() {
  usersList.innerHTML = "";

  const snap = await getDocs(collection(db, "users"));

  snap.forEach(docSnap => {
    const user = docSnap.data();

    const div = document.createElement("div");
    div.className = "user-card";

    div.innerHTML = `
      <p><strong>${user.email}</strong></p>
      <p>Роля: <span>${user.role}</span></p>
      <button class="toggle-role">
        ${user.role === "admin" ? "⬇️ Премахни админ" : "⬆️ Направи админ"}
      </button>
    `;

    div.querySelector(".toggle-role").addEventListener("click", async () => {
      const newRole = user.role === "admin" ? "user" : "admin";

      await updateDoc(doc(db, "users", docSnap.id), {
        role: newRole
      });

      loadUsers(); // презареждаме
    });

    usersList.appendChild(div);
  });
}
