import { auth, db } from "./firebase-init.js";
import { addDoc, collection } from "firebase/firestore";

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();

  await addDoc(collection(db, "models"), {
    title: uploadForm[0].value,
    uploadedBy: auth.currentUser.uid,
    status: "pending",
    createdAt: new Date()
  });

  alert("Моделът чака одобрение от админ");
});
