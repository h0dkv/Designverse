import { auth } from "./firebase-init.js";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const db = getFirestore();

document.getElementById("uploadBtn").onclick = async () => {
  const title = document.getElementById("title").value;

  await addDoc(collection(db, "models"), {
    title,
    status: "pending",
    uploadedBy: auth.currentUser.uid,
    createdAt: serverTimestamp()
  });

  alert("Моделът чака одобрение!");
};
