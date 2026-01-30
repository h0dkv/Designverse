import { auth, db } from "./firebase-init.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

createUserWithEmailAndPassword(auth, email, password)
  .then(async (cred) => {
    await setDoc(doc(db, "users", cred.user.uid), {
      email: cred.user.email,
      role: document.querySelector('input[name="role"]:checked').value,
      createdAt: serverTimestamp()
    });
  });

  document.getElementById("register-btn").addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
  
    if (!username) {
      alert("Моля въведи потребителско име");
      return;
    }
  
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
  
      // 🔥 записваме username-а
      await setDoc(doc(db, "users", cred.user.uid), {
        username: username,
        role: "student",
        createdAt: new Date()
      });
  
      window.location.href = "index.html";
    } catch (err) {
      alert(err.message);
    }
  });

  
const form = document.querySelector(".register-form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();


        if (!email || !password || !confirmPassword) {
            alert("Моля, попълнете всички полета!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Паролите не съвпадат!");
            return;
        }

        // Минимум 8 символа
        if (password.length < 8) {
            alert("Паролата трябва да бъде минимум 8 символа!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Регистрация успешна:", userCredential.user);
            alert("Успешна регистрация!");

            // Пренасочване към login
            window.location.href = "login.html";

        } catch (error) {
            console.error("Грешка при регистрация:", error.message);

            // По-красиви съобщения
            if (error.code === "auth/email-already-in-use") {
                alert("Този имейл вече е регистриран!");
            } else if (error.code === "auth/invalid-email") {
                alert("Невалиден имейл!");
            } else {
                alert("Възникна грешка: " + error.message);
            }
        }
    });
}
