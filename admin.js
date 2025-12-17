import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists() || snap.data().role !== "admin") {
    alert("Нямате админ достъп");
    window.location.href = "index.html";
  }
});

import { db } from "./firebase-init.js";
import { collection, getDocs, updateDoc, doc } from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const list = document.getElementById("pending-models");

const snap = await getDocs(collection(db, "pendingModels"));
snap.forEach(d => {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <h3>${d.data().title}</h3>
    <button class="btn">Одобри</button>
  `;

  div.querySelector("button").onclick = async () => {
    await updateDoc(doc(db, "pendingModels", d.id), { approved: true });
    alert("Одобрено");
  };

  list.appendChild(div);
});
