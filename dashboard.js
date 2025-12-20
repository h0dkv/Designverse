import { auth, db } from "./firebase-init.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { doc, getDoc} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const userNameEl = document.getElementById("user-name");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;

  const snap = await getDoc(doc(db, "users", user.uid));

  if (snap.exists()) {
    userNameEl.textContent = snap.data().username;
  } else {
    userNameEl.textContent = "user";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link");
  const dashboard = document.getElementById("dashboard");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const dashboardMenu = document.getElementById("dashboard-menu");
  const logoutBtn = document.getElementById("logout-btn");
  const greeting = document.getElementById("user-greeting");


  onAuthStateChanged(auth, user => {
    if (user) {
      loginLink.style.display = "none";
      dashboard.style.display = "block";
      greeting.textContent = `Здравей, ${user.email}!`;
    } else {
      loginLink.style.display = "inline-block";
      dashboard.style.display = "none";
    }
  });

  dashboardBtn.addEventListener("click", () => {
    dashboardMenu.classList.toggle("show");
  });

  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });

  document.addEventListener("click", e => {
    if (!dashboard.contains(e.target)) {
      dashboardMenu.classList.remove("show");
    }
  });
});
