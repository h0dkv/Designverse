
import { auth } from "./firebase-init.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("login-link");
    const userMenu = document.getElementById("user-menu");
    const logoutBtn = document.getElementById("logout-btn");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // ЛОГНАТ → скриваме "Вход", показваме 👤 + Изход
            if (loginLink) loginLink.style.display = "none";
            if (userMenu) userMenu.style.display = "flex";
        } else {
            // НЕ е логнат → обратно
            if (loginLink) loginLink.style.display = "inline-block";
            if (userMenu) userMenu.style.display = "none";
        }
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            signOut(auth)
                .then(() => {
                    alert("Излязохте успешно!");
                    window.location.href = "index.html";
                })
                .catch((err) => {
                    console.error("Грешка при излизане:", err);
                    alert("Възникна грешка при излизане.");
                });
        });
    }
});
