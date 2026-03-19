import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection, getDocs, query, where,
  doc, getDoc, updateDoc, deleteDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const pendingList = document.getElementById("pending-list");
const searchEl = document.getElementById("pm-search");
const refreshBtn = document.getElementById("pm-refresh");

/* ---------------- TOAST ---------------- */
function showToast(message, type = "success") {
  const existing = document.querySelector(".dr-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `dr-toast dr-toast--${type}`;
  toast.innerHTML = `<span class="dr-toast__icon">${type === "success" ? "✅" : "❌"}</span><span class="dr-toast__msg">${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("dr-toast--show"));
  setTimeout(() => { toast.classList.remove("dr-toast--show"); setTimeout(() => toast.remove(), 400); }, 3500);
}

/* ---------------- FETCH ---------------- */
async function fetchPending(filter = "") {
  if (!pendingList) return;
  pendingList.innerHTML = "<p>Зареждане...</p>";

  try {
    const q = query(collection(db, "models"), where("status", "==", "pending"));
    const snap = await getDocs(q);

    let items = [];
    snap.forEach(d => items.push({ id: d.id, ...d.data() }));

    if (filter) {
      items = items.filter(i => (i.title || "").toLowerCase().includes(filter.toLowerCase()));
    }

    render(items);
  } catch (err) {
    console.error("Fetch error:", err);
    pendingList.innerHTML = "<p>Грешка при зареждане: " + err.message + "</p>";
  }
}

/* ---------------- RENDER ---------------- */
function render(items) {
  if (!items.length) {
    pendingList.innerHTML = `
      <div style="text-align:center;padding:3rem;color:rgba(255,255,255,0.5);grid-column:1/-1">
        <div style="font-size:3rem;margin-bottom:1rem">✅</div>
        <p>Няма модели в очакване.</p>
      </div>`;
    return;
  }

  pendingList.innerHTML = "";

  items.forEach((it, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${index * 0.07}s`;

    const title = it.title || "Без заглавие";
    const description = it.description || "Няма описание";
    const fileUrl = it.fileURL;
    const uploaderEmail = it.uploaderEmail || "Неизвестен";
    const fileName = it.fileName || "";

    card.innerHTML = `
      <div style="font-size:3rem;text-align:center;padding:1rem 0">📦</div>
      <h3>${title}</h3>
      <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;margin-bottom:0.5rem">${description}</p>
      <p style="color:rgba(255,255,255,0.45);font-size:0.8rem;margin-bottom:1rem">
        📧 ${uploaderEmail}<br>
        📁 ${fileName}
      </p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${fileUrl ? `<a href="${fileUrl}" target="_blank" class="btn" style="font-size:0.85rem;padding:0.5rem 1rem;">⬇️ Файл</a>` : "<span style='color:rgba(255,255,255,0.4);font-size:0.85rem'>Няма файл</span>"}
        <button class="btn" style="font-size:0.85rem;padding:0.5rem 1rem;background:linear-gradient(135deg,#28a745,#20c997)" data-id="${it.id}" data-action="approve">✅ Одобри</button>
        <button class="btn" style="font-size:0.85rem;padding:0.5rem 1rem;background:linear-gradient(135deg,#dc3545,#c82333)" data-id="${it.id}" data-action="reject">❌ Отхвърли</button>
      </div>
    `;

    pendingList.appendChild(card);
  });

  pendingList.querySelectorAll("button[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      btn.disabled = true;
      btn.textContent = "Обработка...";

      try {
        const modelRef = doc(db, "models", id);
        const snap = await getDoc(modelRef);
        if (!snap.exists()) throw new Error("Моделът не съществува");

        if (action === "approve") {
          await updateDoc(modelRef, {
            status: "approved",
            publishedAt: serverTimestamp()
          });
          showToast("Моделът е одобрен успешно! ✅");
        } else if (action === "reject") {
          await deleteDoc(modelRef);
          showToast("Моделът е отхвърлен и изтрит.", "error");
        }

      } catch (err) {
        console.error("Action error:", err);
        showToast("Операцията не успя: " + err.message, "error");
      } finally {
        fetchPending(searchEl ? searchEl.value : "");
      }
    });
  });
}

/* ---------------- AUTH CHECK ---------------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) { window.location.href = "login.html"; return; }

  try {
    const userSnap = await getDoc(doc(db, "users", user.uid));
    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      showToast("Нямате администраторски достъп.", "error");
      setTimeout(() => { window.location.href = "index.html"; }, 2000);
      return;
    }
  } catch (err) {
    console.error("Admin check error:", err);
    return;
  }

  fetchPending();
});

if (searchEl) searchEl.addEventListener("input", () => fetchPending(searchEl.value));
if (refreshBtn) refreshBtn.addEventListener("click", () => fetchPending(searchEl ? searchEl.value : ""));