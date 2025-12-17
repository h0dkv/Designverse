import { auth, db } from "./firebase-init.js";
import { addDoc, collection, serverTimestamp } from
"https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

document.getElementById("upload-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;

  await addDoc(collection(db, "pendingModels"), {
    title,
    approved: false,
    createdAt: serverTimestamp(),
    uploader: auth.currentUser.uid
  });

  alert("Моделът е изпратен за одобрение");
});
