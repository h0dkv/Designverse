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

document.querySelectorAll('.fav-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const model = e.target.closest('.card').querySelector('h3').textContent;
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.includes(model)) favorites.push(model);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`✅ "${model}" е добавен в Любими!`);
  });
});

function updateCountdown() {
  const christmas = new Date('December 25, 2025');
  const now = new Date();
  const diff = christmas - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById('countdown').textContent = 
    `🎄 Остават ${days} дни до Коледа!`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

const randomBtn = document.getElementById('randomModel');
if (randomBtn) {
  randomBtn.addEventListener('click', () => {
    const cards = document.querySelectorAll('.card');
    const random = Math.floor(Math.random() * cards.length);
    cards[random].scrollIntoView({ behavior: 'smooth', block: 'center' });
    cards[random].style.boxShadow = '0 0 20px gold';
    setTimeout(() => (cards[random].style.boxShadow = ''), 1500);
  });
}
