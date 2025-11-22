// 🎄 Навигация (мобилно меню)
const menuBtn = document.getElementById('menu-toggle');
const nav = document.querySelector('nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('show');
  });
}

// 🎅 Смяна на тема (Коледен / Нормален режим)
const btn = document.getElementById('theme-toggle');
const audio = document.getElementById('christmas-audio');
let isChristmas = false;

if (btn) {
  btn.addEventListener('click', () => {
    isChristmas = !isChristmas;
    document.body.classList.toggle('christmas', isChristmas);
    btn.textContent = isChristmas ? '☀️ Нормален режим' : '🎄 Коледен режим';

    if (isChristmas) {
      startSnow();
      audio.play();
    } else {
      stopSnow();
      audio.pause();
      audio.currentTime = 0;
    }

    // Запазваме състоянието
    localStorage.setItem('theme', isChristmas ? 'christmas' : 'normal');
  });
}

// ❄️ Сняг
let snowInterval;

function startSnow() {
  stopSnow();
  snowInterval = setInterval(() => {
    const snowflake = document.createElement('div');
    snowflake.textContent = '❄';
    snowflake.classList.add('snowflake');
    snowflake.style.left = Math.random() * 100 + 'vw';
    snowflake.style.animationDuration = 5 + Math.random() * 5 + 's';
    document.body.appendChild(snowflake);
    setTimeout(() => snowflake.remove(), 10000);
  }, 200);
}

function stopSnow() {
  clearInterval(snowInterval);
  document.querySelectorAll('.snowflake').forEach(s => s.remove());
}

// 🌟 При зареждане на страницата — проверка за запазена тема
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'christmas') {
    document.body.classList.add('christmas');
    if (btn) btn.textContent = '☀️ Нормален режим';
    startSnow();
    if (audio) audio.play();
    isChristmas = true;
  }
});

// 🎁 Примерно останалите функции
const loginForm = document.querySelector('.login-form');
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('🎉 Добре дошъл обратно в DesignVerse!');
  });
}

const search = document.getElementById('search');
if (search) {
  search.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(term) ? '' : 'none';
    });
  });
}


// 🎅 Countdown до Коледа 2025
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


// 💖 Добавяне в любими
document.querySelectorAll('.fav-btn').forEach(btn => {
  btn.addEventListener('click', () => {

    const card = btn.closest('.card');

    const item = {
      title: card.querySelector('h3').textContent,
      img: card.querySelector('img').src,
      file: card.querySelector('a[download]')?.getAttribute('href') || null
    };

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (!favorites.some(f => f.title === item.title)) {
      favorites.push(item);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert(`Добавено: ${item.title}`);
    } else {
      alert(`"${item.title}" вече е в Любими.`);
    }
  });
});



// 🎯 Responsive меню (работещо навсякъде)
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => {
    nav.classList.toggle("show");
    menuBtn.textContent = nav.classList.contains("show") ? "✖" : "☰";
  });

  // Затваряне на менюто при натискане на линк
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("show");
      menuBtn.textContent = "☰";
    });
  });
}

// ⭐ Зареждане на любими модели (красиви карти)
if (window.location.pathname.includes("favorites.html")) {
  const list = document.getElementById("favorites-list");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (favorites.length === 0) {
    list.innerHTML = "<p>Нямате добавени любими модели.</p>";
  } else {
    favorites.forEach(item => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
                <img src="${item.img}" alt="${item.title}">
                <h3>${item.title}</h3>
                <a href="${item.file}" download class="btn">Изтегли STL</a>
                <button class="remove-btn">🗑 Премахни</button>
            `;

      // Премахване от любими
      card.querySelector(".remove-btn").addEventListener("click", () => {
        removeFavorite(item.title);
        card.remove();
        if (document.querySelectorAll(".card").length === 0) {
          list.innerHTML = "<p>Нямате добавени любими модели.</p>";
        }
      });

      list.appendChild(card);
    });
  }
}

// ❌ Функция за премахване
function removeFavorite(title) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(f => f.title !== title);
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

const inputWrapper = document.querySelector('.input-wrapper');
const searchField = document.querySelector('.search-field');
const searchButton = document.querySelector('.search-button');
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
    if (!animationFrame) {
      smoothTransition();
    }
  }
});

searchField.addEventListener('focus', () => {
  if (!isTyping && !searchField.value) {
    targetDuration = 4000;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    currentDuration = 4000;
    inputWrapper.style.setProperty('--spin-duration', `${currentDuration}ms`);
  }
});

searchField.addEventListener('blur', () => {
  if (!isSearching) {
    isTyping = false;
    targetDuration = 4000;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    smoothTransition();
  }
});

searchButton.addEventListener('click', () => {
  isSearching = true;

  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  targetDuration = 2500;
  smoothTransition();

  setTimeout(() => {
    isSearching = false;
    isTyping = false;
    targetDuration = 4000;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    smoothTransition();
  }, 1500);
});
