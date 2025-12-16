import { auth, db } from "./firebase-init.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "login.html";
});

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  await addDoc(collection(db, "models"), {
    title: title.value,
    fileUrl: fileUrl.value,
    imageUrl: imageUrl.value,
    uploadedBy: auth.currentUser.uid,
    status: "pending",
    createdAt: serverTimestamp()
  });

  alert("📨 Моделът е изпратен за одобрение!");
  e.target.reset();
});
