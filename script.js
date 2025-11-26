
// script.js - обединена и почистена версия
// Всички селектори и логика са защитени с проверки за наличност на DOM елементи
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload();
});


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
    nav.querySelectorAll?.('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('show');
        if (menuBtn) menuBtn.textContent = '☰';
      });
    });
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
        audio?.play();
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
    audio?.play();
    isChristmas = true;
  }

  // ===== Сняг (ефект) =====
  let snowInterval = null;
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
  function stopSnow() {
    if (snowInterval) {
      clearInterval(snowInterval);
      snowInterval = null;
    }
    document.querySelectorAll('.snowflake').forEach(s => s.remove());
  }

  // ===== Формат и помощни utilities за favorites (унифицирани) =====
  function loadFavoritesRaw() {
    const raw = JSON.parse(localStorage.getItem('favorites') || '[]');
    // Поддържаме и стари версии: ако е масив от низове, превръщаме в обекти
    return raw.map(item => {
      if (typeof item === 'string') return { title: item, img: '', file: null };
      if (item && typeof item === 'object') return item;
      return { title: String(item), img: '', file: null };
    });
  }
  function saveFavorites(favs) {
    localStorage.setItem('favorites', JSON.stringify(favs));
  }
  function isFavorite(favs, title) {
    return favs.some(f => f.title === title);
  }

  // ===== Добавяне в любими от каталог (бутони .fav-btn) =====
  document.querySelectorAll('.card').forEach(card => {
    const favBtn = card.querySelector('.fav-btn');
    if (!favBtn) return;

    favBtn.addEventListener('click', () => {
      const title = card.querySelector('h3')?.textContent?.trim() || 'Untitled';
      const img = card.querySelector('img')?.src || '';
      const file = card.querySelector('a[download]')?.getAttribute('href') || null;

      let favorites = loadFavoritesRaw();
      if (!isFavorite(favorites, title)) {
        favorites.push({ title, img, file });
        saveFavorites(favorites);
        // визуална обратна връзка
        favBtn.classList.add('added');
        favBtn.innerHTML = '💚 В любими';
        setTimeout(() => {
          favBtn.classList.remove('added');
          favBtn.innerHTML = '❤️ Добави в любими';
        }, 1600);
        alert(`✅ "${title}" е добавен в Любими!`);
      } else {
        alert(`💡 "${title}" вече е в Любими.`);
      }
    });
  });

  // ===== Страница Favorites: зареждане карти, премахване, изчистване =====
  if (window.location.pathname.includes('favorites.html') || document.getElementById('favorites-list')) {
    const listEl = document.getElementById('favorites-list');
    const clearBtn = document.getElementById('clearFavorites');

    function renderFavoritesList() {
      if (!listEl) return;
      const favorites = loadFavoritesRaw();
      listEl.innerHTML = '';
      if (favorites.length === 0) {
        listEl.innerHTML = '<p>Нямате добавени любими модели.</p>';
        return;
      }

      favorites.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          ${item.img ? `<img src="${item.img}" alt="${item.title}">` : ''}
          <h3>${item.title}</h3>
          ${item.file ? `<a href="${item.file}" download class="btn">Изтегли STL</a>` : ''}
          <button class="remove-btn">🗑 Премахни</button>
        `;

        const removeBtn = card.querySelector('.remove-btn');
        removeBtn?.addEventListener('click', () => {
          removeFavorite(item.title);
          card.remove();
          // Ако няма повече карти, покажи съобщение
          if (listEl.querySelectorAll('.card').length === 0) {
            listEl.innerHTML = '<p>Нямате добавени любими модели.</p>';
          }
        });

        listEl.appendChild(card);
      });
    }

    function removeFavorite(title) {
      let favorites = loadFavoritesRaw();
      favorites = favorites.filter(f => f.title !== title);
      saveFavorites(favorites);
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!confirm('Сигурни ли сте, че искате да изтриете всички любими?')) return;
        saveFavorites([]);
        renderFavoritesList();
      });
    }

    // първоначално рендиране
    renderFavoritesList();
  }

  // ===== Search (каталог) - филтриране на .card по h3 =====
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

  // ===== Countdown (ако съществува) =====
  const countdown = document.getElementById("countdown");
  if (countdown) {
    const targetDate = new Date("December 25, 2025 00:00:00").getTime();

    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        countdown.innerHTML = "🎄 Весела Коледа! 🎁";
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdown.innerHTML = `
      <span><strong>${days}</strong> дни</span>
      <span><strong>${hours}</strong> ч.</span>
      <span><strong>${minutes}</strong> мин.</span>
      <span><strong>${seconds}</strong> сек.</span>
    `;
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  // ===== Neon Search-bar animation handling (за .input-wrapper) =====
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

  // ===== Други: demo login form handler (за да не прави submit) =====
  const loginForm = document.querySelector('.login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      alert('🎉 Добре дошъл обратно в DesignRealm!');
    });
  }
});
