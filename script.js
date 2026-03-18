import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const auth = getAuth();

  /* =========================
     MOBILE MENU
  ========================= */
  const menuBtn = document.getElementById("menu-toggle");
  let nav =
    document.querySelector("header > nav#nav") ||
    document.getElementById("nav") ||
    document.querySelector("nav");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("show", "active");
    if (menuBtn) menuBtn.textContent = "☰";
  }

  function openNav() {
    if (!nav) return;
    nav.classList.add("show", "active");
    if (menuBtn) menuBtn.textContent = "✖";
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", (event) => {
      event.stopPropagation();

      if (nav.classList.contains("show") || nav.classList.contains("active")) {
        closeNav();
      } else {
        openNav();
      }
    });

    const links = nav.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        closeNav();
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target) && event.target !== menuBtn) {
        closeNav();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1024) {
        nav.classList.remove("show", "active");
        if (menuBtn) menuBtn.textContent = "☰";
      }
    });
  }

  /* =========================
     CARD SEARCH (optional)
     Работи само ако има input с id="search"
  ========================= */
  const search = document.getElementById("search");

  if (search) {
    search.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();

      document.querySelectorAll(".card").forEach((card) => {
        const title = card.querySelector("h3")?.textContent?.toLowerCase() || "";
        card.style.display = title.includes(term) ? "" : "none";
      });
    });
  }

  /* =========================
     SEARCH BAR ANIMATION
     Работи за .input-wrapper / .search-field / .search-button
  ========================= */
  const inputWrapper = document.querySelector(".input-wrapper");
  const searchField = document.querySelector(".search-field");
  const searchButton = document.querySelector(".search-button");

  if (inputWrapper && searchField && searchButton) {
    let currentDuration = 4000;
    let targetDuration = 4000;
    let animationFrame = null;
    let isTyping = false;
    let isSearching = false;

    function smoothTransition() {
      const diff = targetDuration - currentDuration;

      if (Math.abs(diff) > 10) {
        currentDuration += diff * 0.015;
        inputWrapper.style.setProperty("--spin-duration", `${currentDuration}ms`);
        animationFrame = requestAnimationFrame(smoothTransition);
      } else {
        currentDuration = targetDuration;
        inputWrapper.style.setProperty("--spin-duration", `${currentDuration}ms`);
        animationFrame = null;
      }
    }

    searchField.addEventListener("input", () => {
      if (!isTyping && !isSearching) {
        isTyping = true;
        targetDuration = 60000;
        if (!animationFrame) smoothTransition();
      }
    });

    searchField.addEventListener("focus", () => {
      if (!isTyping && !searchField.value) {
        targetDuration = 4000;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        currentDuration = 4000;
        inputWrapper.style.setProperty("--spin-duration", `${currentDuration}ms`);
      }
    });

    searchField.addEventListener("blur", () => {
      if (!isSearching) {
        isTyping = false;
        targetDuration = 4000;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        smoothTransition();
      }
    });

    searchButton.addEventListener("click", () => {
      isSearching = true;

      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = null;

      targetDuration = 2500;
      smoothTransition();

      setTimeout(() => {
        isSearching = false;
        isTyping = false;
        targetDuration = 4000;

        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;

        smoothTransition();
      }, 1500);
    });
  }

  /* =========================
     DASHBOARD / AUTH UI
  ========================= */
  const loginLink = document.getElementById("login-link");
  const dashboard = document.getElementById("dashboard");
  const dashboardBtn = document.getElementById("dashboard-btn");
  const dashboardMenu = document.getElementById("dashboard-menu");
  const logoutBtn = document.getElementById("logout-btn");
  const userGreeting = document.getElementById("user-greeting");
  const adminLink = document.getElementById("admin-link");

  function closeDashboardMenu() {
    if (dashboardMenu) {
      dashboardMenu.classList.remove("show");
    }
  }

  if (dashboardBtn && dashboardMenu && dashboard) {
    dashboardBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dashboardMenu.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!dashboard.contains(e.target)) {
        closeDashboardMenu();
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (loginLink) loginLink.style.display = "none";
      if (dashboard) dashboard.style.display = "inline-block";

      const displayName =
        user.displayName ||
        user.email?.split("@")[0] ||
        "Потребител";

      if (userGreeting) {
        userGreeting.textContent = `Здравей, ${displayName}!`;
      }

      const role = localStorage.getItem("userRole") || "user";

      if (adminLink) {
        adminLink.style.display = role === "admin" ? "inline-block" : "none";
      }
    } else {
      if (loginLink) loginLink.style.display = "inline-block";
      if (dashboard) dashboard.style.display = "none";
      if (adminLink) adminLink.style.display = "none";

      closeDashboardMenu();
    }
  });

  /* =========================
     LOGOUT
  ========================= */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        alert("Излязохте успешно!");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Logout error:", error);
        alert("Грешка при изход.");
      }
    });
  }

  /* =========================
     ADMIN PANEL VISIBILITY
     Ако имаш елемент с id="admin-panel"
  ========================= */
  const adminPanel = document.getElementById("admin-panel");
  const role = localStorage.getItem("userRole") || "user";

  if (adminPanel) {
    if (role === "admin") {
      adminPanel.classList.remove("hidden");
    } else {
      adminPanel.classList.add("hidden");
    }
  }
});