import { auth, storage } from "./firebase-init.js";
import {
  getFirestore,
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const db = getFirestore();

/* ---------------- DOM ---------------- */

const titleInput = document.getElementById("title");
const fileInput = document.getElementById("file");
const dropZone = document.getElementById("drop-zone");
const fileInfo = document.getElementById("file-info");
const fileName = document.getElementById("file-name");
const fileSize = document.getElementById("file-size");
const uploadBtn = document.getElementById("uploadBtn");
const progressContainer = document.getElementById("progress-container");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

let selectedFile = null;

/* ---------------- DRAG & DROP ---------------- */

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect(files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

/* ---------------- FILE VALIDATION ---------------- */

function handleFileSelect(file) {

  if (!file) return;

  const allowed = [".stl", ".zip"];
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

  if (!allowed.includes(ext)) {
    alert("Позволени са само STL или ZIP файлове.");
    return;
  }

  const maxSize = 50 * 1024 * 1024;

  if (file.size > maxSize) {
    alert("Файлът е над 50MB.");
    return;
  }

  selectedFile = file;

  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  fileInfo.style.display = "block";

  checkForm();
}

function formatFileSize(bytes) {

  const sizes = ["Bytes", "KB", "MB", "GB"];

  if (bytes === 0) return "0 Bytes";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

/* ---------------- FORM CHECK ---------------- */

titleInput.addEventListener("input", checkForm);

function checkForm() {

  const title = titleInput.value.trim();

  if (title && selectedFile) {
    uploadBtn.disabled = false;
  } else {
    uploadBtn.disabled = true;
  }
}

/* ---------------- UPLOAD ---------------- */

uploadBtn.onclick = async () => {

  const user = auth.currentUser;

  if (!user) {
    alert("Моля първо влезте в профила си.");
    return;
  }

  const title = titleInput.value.trim();
  const file = selectedFile;

  if (!title || !file) {
    alert("Липсва име или файл.");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Качване...";
  progressContainer.style.display = "block";

  try {

    const path = `models/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);

    const task = uploadBytesResumable(storageRef, file);

    task.on("state_changed",

      (snapshot) => {

        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        progressFill.style.width = progress + "%";
        progressText.textContent =
          "Качване... " + Math.round(progress) + "%";

      },

      (error) => {

        console.error(error);

        alert("Грешка при качване.");

        resetForm();

      },

      async () => {

        const url = await getDownloadURL(task.snapshot.ref);

        await addDoc(collection(db, "models"), {

          title: title,
          fileURL: url,
          fileName: file.name,
          fileSize: file.size,

          status: "pending",

          uploadedBy: user.uid,

          createdAt: serverTimestamp()

        });

        alert("Моделът е качен успешно!");

        resetForm();

      }

    );

  } catch (e) {

    console.error(e);

    alert("Възникна грешка.");

    resetForm();

  }

};

/* ---------------- RESET ---------------- */

function resetForm() {

  titleInput.value = "";
  fileInput.value = "";

  selectedFile = null;

  fileInfo.style.display = "none";

  progressContainer.style.display = "none";
  progressFill.style.width = "0%";

  uploadBtn.disabled = true;
  uploadBtn.textContent = "⬆ Качи модел";

}