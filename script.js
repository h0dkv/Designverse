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
let isChristmas = false;

if (btn) {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('christmas');
    isChristmas = !isChristmas;
    btn.textContent = isChristmas ? '☀️ Нормален режим' : '🎄 Коледен режим';

    if (isChristmas) startSnow();
    else stopSnow();

    // Запазваме състоянието
    localStorage.setItem('theme', isChristmas ? 'christmas' : 'normal');
  });
}

// ❄️ Сняг
let snowInterval;

function startSnow() {
  stopSnow(); // спиране, ако вече има сняг
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
    isChristmas = true;
  }
});
