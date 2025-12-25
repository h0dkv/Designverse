import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
    collection,
    getDocs,
    query,
    where,
    doc,
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const pendingList = document.getElementById("pending-list");
const searchEl = document.getElementById("pm-search");
const refreshBtn = document.getElementById("pm-refresh");

async function fetchPending(filter = "") {
    pendingList.innerHTML = "<p>Зареждане...</p>";
    try {
        const q = query(collection(db, "pendingModels"), where("approved", "==", false));
        const snap = await getDocs(q);
        const items = [];
        snap.forEach(d => items.push({ id: d.id, ...d.data() }));
        render(items.filter(i => i.title.toLowerCase().includes(filter.toLowerCase())));
    } catch (err) {
        console.error(err);
        pendingList.innerHTML = "<p>Грешка при зареждане.</p>";
    }
}

function render(items) {
    if (!pendingList) return;
    if (!items.length) {
        pendingList.innerHTML = '<p>Няма модели в очакване.</p>';
        return;
    }

    pendingList.innerHTML = "";
    items.forEach(it => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
      <img src="${it.thumbnail || 'images/placeholder.png'}" alt="${it.title}" style="width:100%;height:160px;object-fit:cover;border-radius:8px;margin-bottom:8px;">
      <h3>${it.title}</h3>
      <p style="color:#555;">${it.description || ''}</p>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <a href="${it.fileUrl || '#'}" target="_blank" class="btn">Виж файл</a>
        <button class="btn" data-id="${it.id}" data-action="approve">Одобри</button>
        <button class="btn danger" data-id="${it.id}" data-action="reject">Отхвърли</button>
      </div>
    `;

        pendingList.appendChild(card);
    });

    pendingList.querySelectorAll("button[data-action]").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            btn.disabled = true;
            try {
                const ref = doc(db, "pendingModels", id);
                if (action === "approve") {
                    await updateDoc(ref, { approved: true, approvedAt: new Date() });
                    btn.textContent = "Одобрено";
                } else {
                    await deleteDoc(ref);
                    btn.textContent = "Изтрито";
                }
            } catch (err) {
                console.error(err);
                alert('Операцията не успя');
            } finally {
                fetchPending(searchEl ? searchEl.value : "");
            }
        });
    });
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // check role in users collection
    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        if (!userSnap.exists() || userSnap.data().role !== "admin") {
            alert("Нямате админ достъп");
            window.location.href = "index.html";
            return;
        }
    } catch (err) {
        console.error("Role check failed:", err);
        // allow loading but be cautious
    }

    fetchPending();
});

if (searchEl) {
    searchEl.addEventListener('input', () => fetchPending(searchEl.value));
}
if (refreshBtn) refreshBtn.addEventListener('click', () => fetchPending(searchEl ? searchEl.value : ''));
