import { auth, db } from "./firebase-init.js";
import {
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const adminEmails = [
    "hristianfortnite@gmail.com",
    "milabtv@gmail.com",
    "noit@oupvolov.com"
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

// Ensure user document exists and has a role; store Google profile fields when available
onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        const role = adminEmails.includes(user.email) ? "admin" : "user";
        const userData = {
            email: user.email,
            role,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null
        };

        if (!snap.exists()) {
            await setDoc(ref, {
                ...userData,
                createdAt: serverTimestamp()
            });
        } else {
            // Merge new profile fields in case they are missing or updated
            await setDoc(ref, userData, { merge: true });
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

    // --- Google Sign-In / Registration ---
    const googleButtons = [
        document.getElementById('google-signin'),
        document.getElementById('google-register')
    ].filter(Boolean);

    const provider = new GoogleAuthProvider();

    googleButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (btn.disabled) return;
            btn.disabled = true;
            try {
                const result = await signInWithPopup(auth, provider);
                // onAuthStateChanged will handle post-login logic
                window.location.href = 'profile.html';
            } catch (err) {
                console.error('Google sign-in failed', err);
                // User closed the popup manually
                if (err && err.code === 'auth/popup-closed-by-user') {
                    alert('Входът беше прекъснат — затворихте прозореца. Опитайте отново.');
                    return;
                }
                // Popup blocked or environment not supporting popups -> fallback to redirect
                if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request' || err.code === 'auth/operation-not-supported-in-this-environment')) {
                    try {
                        await signInWithRedirect(auth, provider);
                        return;
                    } catch (rerr) {
                        console.error('Redirect fallback failed', rerr);
                        alert('Грешка при пренасочване за вход: ' + (rerr.message || rerr.code));
                        return;
                    }
                }
                // Account exists with different credential
                if (err && err.code === 'auth/account-exists-with-different-credential') {
                    alert('Вече имате акаунт с този имейл чрез друг доставчик. Влезте с него.');
                    return;
                }
                alert('Неуспешен вход с Google: ' + (err.message || err.code));
            } finally {
                btn.disabled = false;
            }
        });
    });

});
