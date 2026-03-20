import { db } from "./firebase-init.js";
import {
  collection, query, where, getDocs, orderBy
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const grid = document.querySelector(".grid");

async function loadApprovedModels() {
  try {
    const q = query(
      collection(db, "models"),
      where("status", "==", "approved"),
      orderBy("publishedAt", "desc")
    );

    const snap = await getDocs(q);
    if (snap.empty) return;

    snap.forEach((d, index) => {
      const m = d.data();
      const img = m.imageURL || m.imageUrl || "images/logo_notext.png";
      const file = m.fileURL || m.fileUrl || "#";
      const title = m.title || "Без заглавие";
      const description = m.description || "";

      const card = document.createElement("div");
      card.className = "catalog-card";
      card.style.animationDelay = `${index * 0.06}s`;

      card.innerHTML = `
        <a href="model-view.html?id=${d.id}">
          <img src="${img}" alt="${title}" onerror="this.src='images/logo_notext.png'">
          <div class="catalog-card-body">
            <h3>${title}</h3>
            ${description ? `<p>${description}</p>` : ""}
          </div>
        </a>
        <div class="catalog-card-actions">
          <a href="${file}" download class="btn catalog-btn-dl">⬇️ Изтегли</a>
          <button class="fav-btn catalog-btn-fav">❤️</button>
        </div>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Грешка при зареждане на модели:", err);
  }
}

loadApprovedModels();