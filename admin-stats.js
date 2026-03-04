// admin-stats.js
// Статистики за Admin / Teacher – DesignRealm

import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ===== HTML ELEMENTS =====
const totalUsersEl = document.getElementById("total-users");
const approvedModelsEl = document.getElementById("approved-models");
const pendingModelsEl = document.getElementById("pending-models");
const favoritesEl = document.getElementById("favorites-count");

// ===== AUTH CHECK =====
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));

    if (!userSnap.exists()) {
      alert("Няма потребителски профил.");
      window.location.href = "index.html";
      return;
    }

    const role = userSnap.data().role;

    if (role !== "admin" && role !== "teacher") {
      alert("Нямате достъп до статистиките.");
      window.location.href = "index.html";
      return;
    }

    await loadStatistics();

  } catch (err) {
    console.error("Auth / role error:", err);
  }
});

// ===== LOAD STATISTICS =====
async function loadStatistics() {
  try {
    // ---- USERS ----
    const usersSnap = await getDocs(collection(db, "users"));


    if (totalUsersEl) totalUsersEl.textContent = usersSnap.size;

    // ---- MODELS ----
    const approvedSnap = await getDocs(collection(db, "models"));
    if (approvedModelsEl) approvedModelsEl.textContent = approvedSnap.size;

    const pendingSnap = await getDocs(collection(db, "pendingModels"));
    if (pendingModelsEl) pendingModelsEl.textContent = pendingSnap.size;

    // ---- FAVORITES ----
    const favoritesSnap = await getDocs(collection(db, "favorites"));
    if (favoritesEl) favoritesEl.textContent = favoritesSnap.size;

  } catch (error) {
    console.error("Грешка при статистиките:", error);
  }
}