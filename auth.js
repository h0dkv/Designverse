import { auth } from "./firebase-init.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("login-link");
    const userMenu = document.getElementById("user-menu");
    const logoutBtn = document.getElementById("logout-btn");

    // Следим дали има логнат потребител
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

    // Изход
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

import { auth } from "./firebase-init.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    const dashboard = document.getElementById("user-dashboard");
    const dashboardBtn = document.getElementById("dashboard-btn");
    const dashboardMenu = document.getElementById("dashboard-menu");
    const userNameEl = document.getElementById("user-name");
    const logoutBtn2 = document.getElementById("logout-btn2");

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Показваме Dashboard
            dashboard.classList.remove("hidden");

            // Ако user има име – взимаме го, иначе показваме email
            userNameEl.textContent = user.displayName || user.email.split("@")[0];

        } else {
            dashboard.classList.add("hidden");
        }
    });

    // Отваряне/затваряне на менюто
    dashboardBtn.addEventListener("click", () => {
        dashboardMenu.classList.toggle("hidden");
    });

    // Клик извън меню → затваря
    document.addEventListener("click", (e) => {
        if (!dashboard.contains(e.target)) {
            dashboardMenu.classList.add("hidden");
        }
    });

    // Изход
    logoutBtn2.addEventListener("click", () => {
        signOut(auth).then(() => {
            window.location.href = "index.html";
        });
    });

});
