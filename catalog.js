import {
    getFirestore,
    collection,
    query,
    where,
    getDocs
  } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
  
  const db = getFirestore();
  const grid = document.querySelector(".grid");
  
  const q = query(
    collection(db, "models"),
    where("status", "==", "approved")
  );
  
  const snap = await getDocs(q);
  
  snap.forEach(doc => {
    const m = doc.data();
    const card = document.createElement("div");
    card.className = "card";
  
    card.innerHTML = `
      <img src="${m.imageUrl}">
      <h3>${m.title}</h3>
      <a href="${m.fileUrl}" download class="btn">⬇ STL</a>
      <button class="fav-btn">❤️ Любими</button>
    `;
  
    grid.appendChild(card);
  });
  