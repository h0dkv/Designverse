
import { auth } from "./firebase-init.js";
import {
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const form = document.querySelector('.register-form');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const confirmInput = document.getElementById('confirm-password');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const pass = passInput.value;
        const confirm = confirmInput.value;

        if (pass !== confirm) {
            alert('❌ Паролите не съвпадат!');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            if (username) {
                await updateProfile(user, { displayName: username });
            }

            alert(`🎉 Успешна регистрация! Добре дошъл, ${username || email}!`);
            window.location.href = "login.html";
        } catch (error) {
            console.error(error);
            alert(`⚠️ Грешка: ${error.message}`);
        }
    });
}
