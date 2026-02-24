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

// DOM Elements
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

// Drag and Drop Functionality
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

function handleFileSelect(file) {
  // Validate file type
  const allowedTypes = ['.stl', '.zip'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedTypes.includes(fileExtension)) {
    alert("Моля, изберете STL или ZIP файл.");
    return;
  }

  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    alert("Файлът е твърде голям. Максимален размер: 50MB.");
    return;
  }

  // Display file info
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  fileInfo.style.display = "block";

  // Enable upload button if title is also filled
  checkFormValidity();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

titleInput.addEventListener("input", checkFormValidity);

function checkFormValidity() {
  const title = titleInput.value.trim();
  const hasFile = fileInput.files.length > 0;
  uploadBtn.disabled = !(title && hasFile);
}

// Upload Functionality
uploadBtn.onclick = async () => {
  if (!auth.currentUser) {
    alert("Трябва да сте логнати!");
    return;
  }

  const title = titleInput.value.trim();
  const file = fileInput.files[0];

  if (!title || !file) return;

  // Disable button and show progress
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Качване...";
  progressContainer.style.display = "block";

  try {
    // Upload file to Firebase Storage
    const storageRef = ref(storage, `models/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Качване... ${Math.round(progress)}%`;
      },
      (error) => {
        console.error("Upload error:", error);
        alert("Грешка при качване: " + error.message);
        resetForm();
      },
      async () => {
        // Upload completed successfully
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

        // Save to Firestore
        await addDoc(collection(db, "models"), {
          title,
          fileURL: downloadURL,
          fileName: file.name,
          fileSize: file.size,
          status: "pending",
          uploadedBy: auth.currentUser.uid,
          createdAt: serverTimestamp()
        });

        alert("Моделът е качен успешно и чака одобрение!");
        resetForm();
      }
    );
  } catch (error) {
    console.error("Error:", error);
    alert("Възникна грешка: " + error.message);
    resetForm();
  }
};

function resetForm() {
  titleInput.value = "";
  fileInput.value = "";
  fileInfo.style.display = "none";
  progressContainer.style.display = "none";
  progressFill.style.width = "0%";
  uploadBtn.disabled = true;
  uploadBtn.textContent = "⬆ Качи модел";
}

