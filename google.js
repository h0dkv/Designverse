// 🔥 Firebase конфигурация (ЗАМЕНИ с твоите данни)
const firebaseConfig = {
  apiKey: "AIzaSyCg0GBR4UCAqpufILMQUk3BXwpynSovJPU",
  authDomain: "design-realm.firebaseapp.com",
  projectId: "design-realm",
  appId: "1:984727653146:web:4d1fa4202d9c8c25f4faa3"
};

// 🔹 Инициализация на Firebase
firebase.initializeApp(firebaseConfig);

// 🔹 Firebase Auth
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// 🔐 Вход с Google
function loginWithGoogle() {
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;

      console.log("Логнат потребител:", user);

      // Пример: показване на име
      document.getElementById("userName").textContent =
        "Здравей, " + user.displayName;

      // Пример: показване на снимка
      document.getElementById("userAvatar").src = user.photoURL;

      // Скриваме бутона за вход
      document.getElementById("loginBtn").style.display = "none";
      document.getElementById("logoutBtn").style.display = "inline-block";
    })
    .catch((error) => {
      console.error("Грешка при вход:", error.message);
      alert("Грешка при вход с Google");
    });
}

// 🚪 Изход
function logout() {
  auth.signOut().then(() => {
    console.log("Излязъл потребител");

    document.getElementById("userName").textContent = "";
    document.getElementById("userAvatar").src = "";
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
  });
}

// 👀 Проверка дали потребителят е логнат
auth.onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("userName").textContent =
      "Здравей, " + user.displayName;
    document.getElementById("userAvatar").src = user.photoURL;
    document.getElementById("loginBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";
  } else {
    document.getElementById("loginBtn").style.display = "inline-block";
    document.getElementById("logoutBtn").style.display = "none";
  }
});
