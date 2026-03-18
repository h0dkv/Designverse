import { auth } from "./firebase-init.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// ===== TOAST СИСТЕМА =====
function showToast(message, type = "success") {
    const existing = document.querySelector(".dr-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = `dr-toast dr-toast--${type}`;
    toast.innerHTML = `
        <span class="dr-toast__icon">${type === "success" ? "✅" : "❌"}</span>
        <span class="dr-toast__msg">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("dr-toast--show"));

    setTimeout(() => {
        toast.classList.remove("dr-toast--show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ===== LOGIN ФОРМА =====
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            showToast('Успешен вход! Добре дошъл 🙂', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);

        } catch (err) {
            console.error('Грешка при вход:', err);
            let message = 'Грешка при вход. Опитай отново.';

            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                message = 'Грешен имейл или парола.';
            } else if (err.code === 'auth/user-not-found') {
                message = 'Няма такъв потребител.';
            } else if (err.code === 'auth/too-many-requests') {
                message = 'Твърде много опити. Изчакай малко.';
            }

            showToast(message, 'error');
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) console.log('Логнат:', user.email);
});