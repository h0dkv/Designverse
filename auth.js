import { auth } from "./firebase-init.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    // --- HEADER / LOGIN ---
    const loginLink = document.getElementById("login-link");
    const userMenu = document.getElementById("user-menu");
    const logoutBtn = document.getElementById("logout-btn");

    // --- DASHBOARD ---
    const dashboard = document.getElementById("user-dashboard");
    const dashboardBtn = document.getElementById("dashboard-btn");
    const dashboardMenu = document.getElementById("dashboard-menu");
    const userNameEl = document.getElementById("user-name");
    const logoutBtn2 = document.getElementById("logout-btn2");

    // 🔐 Следене на логнат потребител
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Header
            if (loginLink) loginLink.style.display = "none";
            if (userMenu) userMenu.style.display = "flex";

            // Dashboard
            if (dashboard) dashboard.classList.remove("hidden");
            if (userNameEl) {
                userNameEl.textContent =
                    user.displayName || user.email.split("@")[0];
            }

        } else {
            if (loginLink) loginLink.style.display = "inline-block";
            if (userMenu) userMenu.style.display = "none";
            if (dashboard) dashboard.classList.add("hidden");
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

    // 🚪 Logout (dashboard)
    if (logoutBtn2) {
        logoutBtn2.addEventListener("click", () => {
            signOut(auth).then(() => {
                window.location.href = "index.html";
            });
        });
    }

    // 📂 Отваряне/затваряне на dashboard менюто
    if (dashboardBtn && dashboardMenu) {
        dashboardBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dashboardMenu.classList.toggle("hidden");
        });

        document.addEventListener("click", (e) => {
            if (!dashboard.contains(e.target)) {
                dashboardMenu.classList.add("hidden");
            }
        });
    }

});
