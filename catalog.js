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

    snap.forEach(d => {
      const m = d.data();

      const card = document.createElement("div");
      card.className = "card";

      const img = m.imageURL || m.imageUrl || "images/logo_notext.png";
      const file = m.fileURL || m.fileUrl || "#";
      const title = m.title || "Без заглавие";
      const description = m.description || "";

      card.innerHTML = `
        <img src="${img}" alt="${title}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:0.8rem;" onerror="this.src='images/logo_notext.png'">
        <h3>${title}</h3>
        ${description ? `<p style="color:rgba(255,255,255,0.65);font-size:0.9rem;margin-bottom:0.8rem;">${description}</p>` : ""}
        <a href="${file}" download class="btn" style="margin-bottom:0.5rem;">⬇️ Изтегли</a>
        <button class="fav-btn">❤️ Добави в любими</button>
      `;

      grid.appendChild(card);
    });

  } catch (err) {
    console.error("Грешка при зареждане на модели:", err);
  }
}

loadApprovedModels();