// ===================== Коледен брояч – ГЛОБАЛНО =====================
let countdownInterval = null;

function initCountdown() {
  const countdown = document.getElementById('countdown');
  if (!countdown) return; // ако няма брояч на страницата, нищо не правим

  const targetDate = new Date('December 25, 2025 00:00:00').getTime();

  function updateCountdown() {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      countdown.innerHTML = '🎄 Весела Коледа! 🎁';
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

  // чистим стар интервал и стартираме наново
  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

// броячът тръгва при първо зареждане
document.addEventListener('DOMContentLoaded', initCountdown);

// и при връщане от back/forward cache
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    initCountdown();
  }
});

// ===================== Основен код =====================
document.addEventListener('DOMContentLoaded', () => {
  // ===== Навигация (мобилно меню) =====
  const menuBtn = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav') || document.querySelector('nav');

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', () => {
      nav.classList.toggle('show');
      menuBtn.textContent = nav.classList.contains('show') ? '✖' : '☰';
    });

    // Затваряне на менюто при кликане на линк (mobile)
    const links = nav.querySelectorAll ? nav.querySelectorAll('a') : [];
    links.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
        menuBtn.textContent = '☰';
      });
    });
  }

  // ===== Сняг (ефект) – ПЪРВО дефинираме променливата и функциите =====
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

  // ===== Тема (Коледен / Нормален) =====
  const btnTheme = document.getElementById('theme-toggle');
  const audio = document.getElementById('christmas-audio');
  let isChristmas = false;

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      isChristmas = !isChristmas;
      document.body.classList.toggle('christmas', isChristmas);
      btnTheme.textContent = isChristmas ? '☀️ Нормален режим' : '🎄 Коледен режим';

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

  // Старо състояние на тема при презареждане
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'christmas') {
    document.body.classList.add('christmas');
    if (btnTheme) btnTheme.textContent = '☀️ Нормален режим';
    startSnow();
    if (audio) audio.play().catch(() => { });
    isChristmas = true;
  }

  // ===================== FAVORITES – минимален и стабилен вариант =====================
  const LS_KEY_FAV = 'favorites';

  function getFavorites() {
    try {
      const raw = localStorage.getItem(LS_KEY_FAV);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error('Грешка при парсване на favorites:', e);
      localStorage.removeItem(LS_KEY_FAV);
      return [];
    }
  }

  function setFavorites(arr) {
    localStorage.setItem(LS_KEY_FAV, JSON.stringify(arr));
  }

  function isFav(arr, title) {
    return arr.some(f => f.title === title);
  }

  function addFavoriteFromCard(card, btn) {
    const title = card.querySelector('h3')?.textContent?.trim() || 'Untitled';
    const img = card.querySelector('img')?.src || '';
    const file = card.querySelector('a[download]')?.getAttribute('href') || null;

    let favs = getFavorites();
    if (!isFav(favs, title)) {
      favs.push({ title, img, file });
      setFavorites(favs);

      if (btn) {
        btn.classList.add('added');
        btn.innerHTML = '💚 В любими';
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = '❤️ Добави в любими';
        }, 1600);
      }

      alert(`✅ "${title}" е добавен в Любими!`);
      console.log('Favorites now:', favs);
    } else {
      alert(`💡 "${title}" вече е в Любими.`);
    }
  }

  // Делегирано събитие – работи за всички .fav-btn навсякъде
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const card = btn.closest('.card');
    if (!card) return;

    console.log('Клик по fav-btn за карта:', card);
    addFavoriteFromCard(card, btn);
  });

  // ===== Favorites страница (favorites.html) =====
  const favListEl = document.getElementById('favorites-list');
  const favClearBtn = document.getElementById('clearFavorites');

  function renderFavorites() {
    if (!favListEl) return;
    const favs = getFavorites();
    favListEl.innerHTML = '';

    if (favs.length === 0) {
      favListEl.innerHTML = '<p>Нямате добавени любими модели.</p>';
      return;
    }

    favs.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        ${item.img ? `<img src="${item.img}" alt="${item.title}">` : ''}
        <h3>${item.title}</h3>
        ${item.file ? `<a href="${item.file}" download class="btn">Изтегли STL</a>` : ''}
        <button class="remove-btn">🗑 Премахни</button>
      `;

      const rmBtn = card.querySelector('.remove-fav-btn');
      rmBtn.addEventListener('click', () => {
        let favsNow = getFavorites();
        favsNow = favsNow.filter(f => f.title !== item.title);
        setFavorites(favsNow);
        renderFavorites();
      });

      favListEl.appendChild(card);
    });
  }

  if (favListEl) {
    renderFavorites();
  }

  if (favClearBtn && favListEl) {
    favClearBtn.addEventListener('click', () => {
      if (!confirm('Сигурни ли сте, че искате да изтриете всички любими?')) return;
      setFavorites([]);
      renderFavorites();
    });
  }

  // ===================== Search (каталог) =====================
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

  // ===================== Neon Search-bar animation =====================
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

  // ===================== Demo login (да не праща форма) =====================
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('🎉 Добре дошъл обратно в DesignRealm!');
    });
  }
});
