//firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCg0GBR4UCAqpufILMQUk3BXwpynSovJPU",
    authDomain: "design-realm.firebaseapp.com",
    projectId: "design-realm",
    storageBucket: "design-realm.firebasestorage.app",
    messagingSenderId: "984727653146",
    appId: "1:984727653146:web:4d1fa4202d9c8c25f4faa3",
    measurementId: "G-QSB16GEM6Y"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

