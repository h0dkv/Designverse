import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

/* ---------------- CONFIRM DIALOG ---------------- */
function showConfirm(message) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay show";
    overlay.innerHTML = `
      <div class="confirm-box">
        <h3>⚠️ Потвърждение</h3>
        <p>${message}</p>
        <div class="confirm-actions">
          <button class="btn-sm danger" id="conf-yes">Да, изтрий</button>
          <button class="btn-sm primary" id="conf-no">Отказ</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector("#conf-yes").onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector("#conf-no").onclick = () => { overlay.remove(); resolve(false); };
  });
}

/* ---------------- FIRESTORE HELPERS ---------------- */
async function getUserFavorites(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return [];
  return snap.data().favorites || [];
}

async function addFavorite(uid, item) {
  await setDoc(doc(db, "users", uid), { favorites: arrayUnion(item) }, { merge: true });
}

async function removeFavorite(uid, item) {
  await updateDoc(doc(db, "users", uid), { favorites: arrayRemove(item) });
}

async function clearFavorites(uid) {
  await updateDoc(doc(db, "users", uid), { favorites: [] });
}

/* ---------------- RENDER ---------------- */
const favListEl = document.getElementById("favorites-list");
const clearBtn = document.getElementById("clearFavorites");

async function renderFavorites(favs, uid) {
  if (!favListEl) return;
  favListEl.innerHTML = "";

  if (!favs || favs.length === 0) {
    favListEl.innerHTML = `
      <div style="text-align:center;padding:3rem;color:rgba(255,255,255,0.5);grid-column:1/-1">
        <div style="font-size:3rem;margin-bottom:1rem">💔</div>
        <p>Нямате добавени любими модели.</p>
        <a href="catalog.html" class="btn" style="margin-top:1rem">Разгледай каталога</a>
      </div>`;
    return;
  }

  favs.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.animationDelay = `${index * 0.07}s`;
    card.innerHTML = `
      <img src="${item.img || 'images/logo_notext.png'}" alt="${item.title}" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:0.8rem;" onerror="this.src='images/logo_notext.png'">
      <h3>${item.title}</h3>
      ${item.file ? `<a href="${item.file}" download class="btn" style="margin-bottom:0.5rem">⬇️ Изтегли</a>` : ""}
      <button class="btn remove-btn" style="background:linear-gradient(135deg,#dc3545,#c82333);">🗑️ Премахни</button>
    `;

    card.querySelector(".remove-btn").addEventListener("click", async () => {
      await removeFavorite(uid, item);
      const newList = await getUserFavorites(uid);
      renderFavorites(newList, uid);
      showToast("Премахнато от любими.", "error");
    });

    favListEl.appendChild(card);
  });
}

/* ---------------- AUTH STATE ---------------- */
onAuthStateChanged(auth, async (user) => {
  if (!favListEl) return;

  if (!user) {
    favListEl.innerHTML = `<p>Трябва да сте <a href="login.html" style="color:var(--accent)">логнати</a>, за да виждате любимите модели.</p>`;
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  const favorites = await getUserFavorites(user.uid);
  renderFavorites(favorites, user.uid);
});

/* ---------------- FAV BUTTON (от каталога) ---------------- */
document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  const user = auth.currentUser;
  if (!user) {
    showToast("Трябва да сте логнати, за да запазвате любими модели!", "error");
    return;
  }

  const card = btn.closest(".card");
  const item = {
    title: card.querySelector("h3")?.textContent || "Без заглавие",
    img: card.querySelector("img")?.src || "",
    file: card.querySelector("a[download]")?.getAttribute("href") || null
  };

  await addFavorite(user.uid, item);
  btn.innerHTML = "💚 В любими";
  showToast(`Добавено в любими: ${item.title}`);
});

/* ---------------- CLEAR ALL ---------------- */
if (clearBtn) {
  clearBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const ok = await showConfirm("Сигурни ли сте, че искате да изтриете всички любими?");
    if (!ok) return;

    await clearFavorites(user.uid);
    renderFavorites([], user.uid);
    showToast("Всички любими са изтрити.", "error");
  });
}