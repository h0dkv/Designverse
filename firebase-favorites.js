import { auth } from "./firebase-init.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import { db } from "./firebase-init.js";


async function getUserFavorites(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  return snap.data().favorites || [];
}

async function addFavorite(uid, item) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    { favorites: arrayUnion(item) },
    { merge: true }
  );
}

async function removeFavorite(uid, item) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, {
    favorites: arrayRemove(item)
  });
}

async function clearFavorites(uid) {
  const ref = doc(db, "users", uid);

  await updateDoc(ref, { favorites: [] });
}


const favListEl = document.getElementById("favorites-list");
const clearBtn = document.getElementById("clearFavorites");

onAuthStateChanged(auth, async (user) => {
  if (!favListEl) return;

  if (!user) {
    favListEl.innerHTML = "<p>Трябва да сте логнати, за да виждате любимите модели.</p>";
    if (clearBtn) clearBtn.style.display = "none";
    return;
  }

  const uid = user.uid;
  const favorites = await getUserFavorites(uid);

  renderFavorites(favorites, uid);
});

async function renderFavorites(favs, uid) {
  favListEl.innerHTML = "";

  if (!favs || favs.length === 0) {
    favListEl.innerHTML = "<p>Нямате добавени любими модели.</p>";
    return;
  }

  favs.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <h3>${item.title}</h3>
      <a href="${item.file}" download class="btn">Изтегли STL</a>
      <button class="remove-btn">🗑 Премахни</button>
    `;

    card.querySelector(".remove-btn").addEventListener("click", async () => {
      await removeFavorite(uid, item);
      const newList = await getUserFavorites(uid);
      renderFavorites(newList, uid);
    });

    favListEl.appendChild(card);
  });
}


document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".fav-btn");
  if (!btn) return;

  const user = auth.currentUser;
  if (!user) {
    alert("Трябва да сте логнати, за да запазвате любими модели!");
    return;
  }

  const card = btn.closest(".card");
  const item = {
    title: card.querySelector("h3").textContent,
    img: card.querySelector("img").src,
    file: card.querySelector("a[download]")?.getAttribute("href") || null
  };

  await addFavorite(user.uid, item);

  btn.innerHTML = "💚 В любими";

  alert(`Добавено: ${item.title}`);
});

if (clearBtn) {
  clearBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!confirm("Сигурни ли сте, че искате да изтриете всички любими?")) return;

    await clearFavorites(user.uid);

    renderFavorites([], user.uid);
  });
}
