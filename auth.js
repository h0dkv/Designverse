import { auth, db } from "./firebase-init.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const adminEmails = [
    "hristianfortnite@gmail.com",
    "milabtv@gmail.com"
];

onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const role = snap.data().role;

    if (role === "admin") {
        document.body.classList.add("admin");
    }
});

// Ensure user document exists and has a role
onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
            const role = adminEmails.includes(user.email) ? "admin" : "user";
            await setDoc(ref, {
                email: user.email,
                role,
                createdAt: serverTimestamp()
            });
        }
    } catch (err) {
        console.error("Failed to ensure user doc:", err);
    }
});
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists() && snap.data().role === "admin") {
        document.getElementById("admin-link").style.display = "inline-block";
    }
})
document.addEventListener("DOMContentLoaded", () => {
    // --- HEADER / LOGIN ---
    const loginLink = document.getElementById("login-link");
    const userMenu = document.getElementById("user-menu");
    const logoutBtn = document.getElementById("logout-btn");

    // 🔐 Follow auth state for header visibility
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (loginLink) loginLink.style.display = "none";
            if (userMenu) userMenu.style.display = "flex";
            const userNameEl = document.getElementById("user-name");
            if (userNameEl) userNameEl.textContent = user.displayName || user.email.split("@")[0];
        } else {
            if (loginLink) loginLink.style.display = "inline-block";
            if (userMenu) userMenu.style.display = "none";
        }
    });

    // 🚪 Logout (header)
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = "index.html";
            });
        });
    }

});
