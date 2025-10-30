const menuBtn = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

menuBtn.addEventListener('click', () => {
  nav.classList.toggle('show');
});
