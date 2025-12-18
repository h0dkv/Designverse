import {
    getFirestore,
    collection,
    getDocs,
    query,
    where
  } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
  
  const db = getFirestore();
  
  async function count(col, q = null) {
    const snap = q ? await getDocs(q) : await getDocs(collection(db, col));
    return snap.size;
  }
  
  document.getElementById("usersCount").textContent =
    await count("users");
  
  document.getElementById("modelsCount").textContent =
    await count("models");
  
  document.getElementById("pendingCount").textContent =
    await count("models", query(
      collection(db, "models"),
      where("status", "==", "pending")
    ));
  