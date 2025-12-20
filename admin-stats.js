// admin-stats.js
// Статистики за Admin / Teacher – DesignRealm

import { auth, db } from "./firebase-init.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ===== HTML ЕЛЕМЕНТИ =====
const totalUsersEl = document.getElementById("total-users");
const studentsEl = document.getElementById("students-count");
const teachersEl = document.getElementById("teachers-count");
const modelsEl = document.getElementById("models-count");
const favoritesEl = document.getElementById("favorites-count");

// ===== AUTH CHECK =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Не е логнат
    window.location.href = "login.html";
    return;
  }

  try {
    // Взимаме данните за текущия потребител
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      alert("Потребителят няма профил в системата.");
      window.location.href = "index.html";
      return;
    }

    const role = userSnap.data().role;

    // Само admin или teacher имат достъп
    if (role !== "admin" && role !== "teacher") {
      alert("Нямате достъп до Admin Statistics.");
      window.location.href = "index.html";
      return;
    }

    // Зареждаме статистиките
    loadStatistics();

  } catch (error) {
    console.error("Грешка при проверка на ролята:", error);
  }
});

// ===== LOAD STATISTICS =====
async function loadStatistics() {
  try {
    // ---- USERS ----
    const usersSnap = await getDocs(collection(db, "users"));

    let students = 0;
    let teachers = 0;

    usersSnap.forEach((doc) => {
      const data = doc.data();
      if (data.role === "student") students++;
      if (data.role === "teacher") teachers++;
    });

    if (totalUsersEl) totalUsersEl.textContent = usersSnap.size;
    if (studentsEl) studentsEl.textContent = students;
    if (teachersEl) teachersEl.textContent = teachers;

    // ---- MODELS ----
    const modelsSnap = await getDocs(collection(db, "models"));
    if (modelsEl) modelsEl.textContent = modelsSnap.size;

    // ---- FAVORITES ----
    const favoritesSnap = await getDocs(collection(db, "favorites"));
    if (favoritesEl) favoritesEl.textContent = favoritesSnap.size;

  } catch (error) {
    console.error("Грешка при зареждане на статистиките:", error);
  }
}
