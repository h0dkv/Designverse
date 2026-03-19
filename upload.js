import { auth, db } from "./firebase-init.js";
import {
  addDoc,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

/* ---------------- CLOUDINARY ---------------- */
const CLOUD_NAME = "djyxlskkh";
const UPLOAD_PRESET = "DesignRealm";

/* ---------------- TOAST ---------------- */
function showToast(message, type = "success") {
  const existing = document.querySelector(".dr-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `dr-toast dr-toast--${type}`;
  toast.innerHTML = `
    <span class="dr-toast__icon">${type === "success" ? "✅" : "❌"}</span>
    <span class="dr-toast__msg">${message}</span>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("dr-toast--show"));
  setTimeout(() => {
    toast.classList.remove("dr-toast--show");
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ---------------- DOM ---------------- */
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
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
let currentUser = null;

/* ---------------- AUTH CHECK ---------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    showToast("Моля първо влезте в профила си.", "error");
    setTimeout(() => { window.location.href = "login.html"; }, 2000);
    return;
  }
  currentUser = user;
});

/* ---------------- DRAG & DROP ---------------- */
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
});

/* ---------------- FILE VALIDATION ---------------- */
function handleFileSelect(file) {
  if (!file) return;
  const ext = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
  if (![".stl", ".zip"].includes(ext)) {
    showToast("Позволени са само STL или ZIP файлове.", "error");
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    showToast("Файлът е над 50MB.", "error");
    return;
  }
  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  fileInfo.style.display = "block";
  checkForm();
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + ["Bytes", "KB", "MB", "GB"][i];
}

/* ---------------- FORM CHECK ---------------- */
titleInput.addEventListener("input", checkForm);
function checkForm() {
  uploadBtn.disabled = !(titleInput.value.trim() && selectedFile);
}

/* ---------------- UPLOAD ---------------- */
uploadBtn.onclick = async () => {
  if (!currentUser) {
    showToast("Моля първо влезте в профила си.", "error");
    return;
  }

  const title = titleInput.value.trim();
  const description = descInput ? descInput.value.trim() : "";

  if (!title || !selectedFile) {
    showToast("Липсва име или файл.", "error");
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Качване...";
  progressContainer.style.display = "block";

  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("upload_preset", UPLOAD_PRESET);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`);

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progressFill.style.width = percent + "%";
      progressText.textContent = "Качване... " + percent + "%";
    }
  });

  xhr.addEventListener("load", async () => {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      try {
        await addDoc(collection(db, "models"), {
          title,
          description,
          fileURL: result.secure_url,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          status: "pending",
          uploadedBy: currentUser.uid,
          uploaderEmail: currentUser.email,
          createdAt: serverTimestamp()
        });
        progressFill.style.width = "100%";
        progressText.textContent = "Качено успешно! ✅";
        showToast("Моделът е качен успешно! 🎉", "success");
        setTimeout(() => resetForm(), 2000);
      } catch (err) {
        console.error("Firestore error:", err);
        showToast("Файлът е качен, но грешка при записа.", "error");
        resetForm();
      }
    } else {
      console.error("Cloudinary error:", xhr.responseText);
      showToast("Грешка при качване. Провери Upload Preset.", "error");
      resetForm();
    }
  });

  xhr.addEventListener("error", () => {
    showToast("Мрежова грешка при качването.", "error");
    resetForm();
  });

  xhr.send(formData);
};

/* ---------------- RESET ---------------- */
function resetForm() {
  titleInput.value = "";
  if (descInput) descInput.value = "";
  fileInput.value = "";
  selectedFile = null;
  fileInfo.style.display = "none";
  progressContainer.style.display = "none";
  progressFill.style.width = "0%";
  uploadBtn.disabled = true;
  uploadBtn.textContent = "⬆ Качи модел";
}