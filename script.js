import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

let countdownInterval = null;

function initCountdown() {
  const countdown = document.getElementById('countdown');
  if (!countdown) return; // ако няма брояч на страницата, нищо не правим

  const now = new Date();
  const nextYear = now.getFullYear() + 1;
  const targetDate = new Date(nextYear, 0, 1, 0, 0, 0).getTime();

  function updateCountdown() {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      countdown.innerHTML = '🎉 Честита Нова Година!';
      if (countdownInterval) clearInterval(countdownInterval);
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.innerHTML =
      `<span><strong>${days}</strong> дни</span>` +
      `<span><strong>${hours}</strong> ч.</span>` +
      `<span><strong>${minutes}</strong> мин.</span>` +
      `<span><strong>${seconds}</strong> сек.</span>`;
  }

  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    initCountdown();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();

  // ----- Мобилно меню -----
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav') || document.querySelector('nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('show');
      menuBtn.textContent = nav.classList.contains('show') ? '✖' : '☰';
    });

    const links = nav.querySelectorAll ? nav.querySelectorAll('a') : [];
    links.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
        menuBtn.textContent = '☰';
      });
    });
  }

  // ----- Празничен (New Year) режим -----
  let snowInterval = null;

  function stopSnow() {
    if (snowInterval) {
      clearInterval(snowInterval);
      snowInterval = null;
    }
    document.querySelectorAll('.snowflake').forEach(s => s.remove());
  }

  function startSnow() {
    stopSnow();
    snowInterval = setInterval(() => {
      const snowflake = document.createElement('div');
      snowflake.textContent = '❄';
      snowflake.className = 'snowflake';
      snowflake.style.left = Math.random() * 100 + 'vw';
      snowflake.style.animationDuration = 5 + Math.random() * 5 + 's';
      document.body.appendChild(snowflake);
      setTimeout(() => snowflake.remove(), 11000);
    }, 200);
  }

  const btnTheme = document.getElementById('theme-toggle');
  const audio = document.getElementById('christmas-audio');
  let isChristmas = false;

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      isChristmas = !isChristmas;
      document.body.classList.toggle('christmas', isChristmas);
      btnTheme.textContent = isChristmas ? '☀️ Нормален режим' : '🎉 Новогодишен режим';

      if (isChristmas) {
        startSnow();
        if (audio) audio.play().catch(() => { });
      } else {
        stopSnow();
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      }
      localStorage.setItem('theme', isChristmas ? 'christmas' : 'normal');
    });
  }

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'christmas') {
    document.body.classList.add('christmas');
    if (btnTheme) btnTheme.textContent = '☀️ Нормален режим';
    startSnow();
    if (audio) audio.play().catch(() => { });
    isChristmas = true;
  }

  // ----- Търсачка по заглавие на картите -----
  const search = document.getElementById('search');
  if (search) {
    search.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.card').forEach(card => {
        const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
        card.style.display = title.includes(term) ? '' : 'none';
      });
    });
  }

  // ----- Анимация на търсачката (input-wrapper) -----
  const inputWrapper = document.querySelector('.input-wrapper');
  const searchField = document.querySelector('.search-field');
  const searchButton = document.querySelector('.search-button');

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
        inputWrapper.style.setProperty('--spin-duration', `${currentDuration}ms`);
        animationFrame = requestAnimationFrame(smoothTransition);
      } else {
        currentDuration = targetDuration;
        inputWrapper.style.setProperty('--spin-duration', `${currentDuration}ms`);
        animationFrame = null;
      }
    }

    searchField.addEventListener('input', () => {
      if (!isTyping && !isSearching) {
        isTyping = true;
        targetDuration = 60000;
        if (!animationFrame) smoothTransition();
      }
    });

    searchField.addEventListener('focus', () => {
      if (!isTyping && !searchField.value) {
        targetDuration = 4000;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        currentDuration = 4000;
        inputWrapper.style.setProperty('--spin-duration', `${currentDuration}ms`);
      }
    });

    searchField.addEventListener('blur', () => {
      if (!isSearching) {
        isTyping = false;
        targetDuration = 4000;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = null;
        smoothTransition();
      }
    });

    searchButton.addEventListener('click', () => {
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

  // ----- Auth: показване на "Вход" / "Потребител" -----
  const auth = getAuth();

  const loginLink = document.getElementById("login-link");
  const userMenu = document.getElementById("user-menu");
  const logoutBtn = document.getElementById("logout-btn");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (loginLink) loginLink.style.display = "none";
      if (userMenu) userMenu.style.display = "flex";
    } else {
      if (loginLink) loginLink.style.display = "inline-block";
      if (userMenu) userMenu.style.display = "none";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        alert("Излязохте успешно!");
        window.location.href = "index.html";
      });
    });
  }
});

if (role === "admin") {
  adminPanel.classList.remove("hidden");
} else {
  adminPanel.classList.add("hidden");
}
