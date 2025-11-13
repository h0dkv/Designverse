// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD9VSwW66iz3ik4zT6TgsHqcbPWfjbIIhk",
  authDomain: "designverse-volov.firebaseapp.com",
  projectId: "designverse-volov",
  storageBucket: "designverse-volov.firebasestorage.app",
  messagingSenderId: "389183836506",
  appId: "1:389183836506:web:298471c27c27763abce363"
};

// Инициализация
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged  };
