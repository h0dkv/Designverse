import { db } from "./firebase-init.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

const q = query(
  collection(db, "models"),
  where("status", "==", "pending")
);

const snap = await getDocs(q);

snap.forEach(d => {
  const model = d.data();
  const div = document.createElement("div");

  div.innerHTML = `
    <h3>${model.title}</h3>
    <button>Одобри</button>
  `;

  div.querySelector("button").onclick = async () => {
    await updateDoc(doc(db, "models", d.id), {
      status: "approved"
    });
    div.remove();
  };

  document.getElementById("pending-models").appendChild(div);
});
