
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCg0GBR4UCAqpufILMQUk3BXwpynSovJPU",
    authDomain: "design-realm.firebaseapp.com",
    projectId: "design-realm",
    storageBucket: "design-realm.firebasestorage.app",
    messagingSenderId: "984727653146",
    appId: "1:984727653146:web:4d1fa4202d9c8c25f4faa3",
    measurementId: "G-QSB16GEM6Y"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
