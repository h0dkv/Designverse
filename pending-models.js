import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// DOM
const pendingList = document.getElementById("pending-list");
const searchEl = document.getElementById("pm-search");
const refreshBtn = document.getElementById("pm-refresh");

// 🔄 Зареждане на чакащите модели
async function fetchPending(filter = "") {
  if (!pendingList) return;
  pendingList.innerHTML = "<p>Зареждане...</p>";

  try {
    const q = query(
      collection(db, "pendingModels"),
      where("approved", "==", false)
    );

    const snap = await getDocs(q);
    const items = [];

    snap.forEach(d => {
      const data = d.data();
      items.push({ id: d.id, ...data });
    });

    const filtered = items.filter(i =>
      (i.title || "").toLowerCase().includes(filter.toLowerCase())
    );

    render(filtered);
  } catch (err) {
    console.error("Fetch error:", err);
    pendingList.innerHTML = "<p>Грешка при зареждане.</p>";
  }
}

// 🧱 Рендер на картите
function render(items) {
  if (!items.length) {
    pendingList.innerHTML = "<p>Няма модели в очакване.</p>";
    return;
  }

  pendingList.innerHTML = "";

  items.forEach(it => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img
        src="${it.thumbnail || "images/placeholder.png"}"
        alt="${it.title || "Model"}"
        style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
      >

      <h3>${it.title || "Без заглавие"}</h3>
      <p style="color:#555">${it.description || ""}</p>

      <div style="display:flex;gap:8px;margin-top:8px;">
        ${it.fileUrl ? `<a href="${it.fileUrl}" target="_blank" class="btn">Виж файл</a>` : ""}
        <button class="btn" data-id="${it.id}" data-action="approve">Одобри</button>
        <button class="btn danger" data-id="${it.id}" data-action="reject">Отхвърли</button>
      </div>
    `;

    pendingList.appendChild(card);
  });

  // 🟢 Бутони
  pendingList.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      btn.disabled = true;

      try {
        const pendingRef = doc(db, "pendingModels", id);
        const snap = await getDoc(pendingRef);

        if (!snap.exists()) throw new Error("Моделът не съществува");

        const data = snap.data();

        if (action === "approve") {
          // ✅ Преместване в публичната колекция
          await setDoc(doc(db, "models", id), {
            ...data,
            approved: true,
            publishedAt: serverTimestamp()
          });

          // ❌ Махаме от pending
          await deleteDoc(pendingRef);
        }

        if (action === "reject") {
          await deleteDoc(pendingRef);
        }

      } catch (err) {
        console.error("Action error:", err);
        alert("Операцията не успя");
      } finally {
        fetchPending(searchEl ? searchEl.value : "");
      }
    });
  });
}

// 🔐 Проверка за login + admin
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      alert("Нямате администраторски достъп");
      window.location.href = "index.html";
      return;
    }
  } catch (err) {
    console.error("Admin check error:", err);
    return;
  }

  fetchPending();
});

// 🔎 Търсене
if (searchEl) {
  searchEl.addEventListener("input", () =>
    fetchPending(searchEl.value)
  );
}

// 🔁 Обнови
if (refreshBtn) {
  refreshBtn.addEventListener("click", () =>
    fetchPending(searchEl ? searchEl.value : "")
  );
}
