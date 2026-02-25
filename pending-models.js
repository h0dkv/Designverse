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
      console.log("Pending model data:", data); // Добавено за debugging
      items.push({ id: d.id, ...data });
    });

    console.log("Total pending models fetched:", items.length); // Добавено

    const filtered = items.filter(i =>
      (i.title || "").toLowerCase().includes(filter.toLowerCase())
    );

    console.log("Filtered models:", filtered.length); // Добавено

    render(filtered);
  } catch (err) {
    console.error("Fetch error:", err);
    pendingList.innerHTML = "<p>Грешка при зареждане: " + err.message + "</p>";
  }
}

// 🧱 Рендер на картите
function render(items) {
  console.log("Rendering items:", items); // Добавено

  if (!items.length) {
    pendingList.innerHTML = "<p>Няма модели в очакване.</p>";
    return;
  }

  pendingList.innerHTML = "";

  items.forEach((it, index) => {
    console.log("Rendering item:", index, it); // Добавено

    const card = document.createElement("div");
    card.className = "card";

    const thumbnail = it.thumbnail || "images/placeholder.png";
    const title = it.title || "Без заглавие";
    const description = it.description || "Няма описание";
    const fileUrl = it.fileUrl;

    card.innerHTML = `
      <img
        src="${thumbnail}"
        alt="${title}"
        style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px;"
        onerror="this.src='images/placeholder.png'"
      >

      <h3>${title}</h3>
      <p style="color:#555">${description}</p>

      <div style="display:flex;gap:8px;margin-top:8px;">
        ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn">Виж файл</a>` : "<span style='color:gray;'>Няма файл</span>"}
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
      console.log("Button clicked:", action, id); // Добавено
      btn.disabled = true;
      btn.textContent = "Обработка...";

      try {
        const pendingRef = doc(db, "pendingModels", id);
        const snap = await getDoc(pendingRef);

        if (!snap.exists()) throw new Error("Моделът не съществува");

        const data = snap.data();
        console.log("Model data for action:", data); // Добавено

        if (action === "approve") {
          // ✅ Преместване в публичната колекция
          await setDoc(doc(db, "models", id), {
            ...data,
            approved: true,
            publishedAt: serverTimestamp()
          });

          // ❌ Махаме от pending
          await deleteDoc(pendingRef);
          console.log("Model approved and moved to models"); // Добавено
        }

        if (action === "reject") {
          await deleteDoc(pendingRef);
          console.log("Model rejected and deleted"); // Добавено
        }

      } catch (err) {
        console.error("Action error:", err);
        alert("Операцията не успя: " + err.message);
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
