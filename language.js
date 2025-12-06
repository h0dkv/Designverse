async function loadLanguage(lang) {
    const res = await fetch(`lang-${lang}.json`);
    const translations = await res.json();
  
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[key]) {
        el.textContent = translations[key];
      }
    });
  
    localStorage.setItem("lang", lang);
  }
  
  document.getElementById("lang-btn").addEventListener("click", () => {
    const current = localStorage.getItem("lang") || "bg";
    const newLang = current === "bg" ? "en" : "bg";
    loadLanguage(newLang);
  
    document.getElementById("lang-btn").textContent =
      newLang === "bg" ? "EN" : "BG";
  });
  
  // Зареждане при вход в сайта
  const saved = localStorage.getItem("lang") || "bg";
  loadLanguage(saved);
  