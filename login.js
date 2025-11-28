
import { auth } from "./firebase-init.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const cred = await signInWithEmailAndPassword(auth, email, password);
            console.log('Успешен вход:', cred.user);

            alert('Успешен вход! 🙂');

            window.location.href = 'index.html';

        } catch (err) {
            console.error('Грешка при вход:', err);
            let message = 'Грешка при вход.';

            if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
                message = 'Грешен имейл или парола.';
            } else if (err.code === 'auth/user-not-found') {
                message = 'Няма такъв потребител.';
            }

            alert(message);
        }
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log('В момента е логнат:', user.email);
    } else {
        console.log('Няма логнат потребител');
    }
});
