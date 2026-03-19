(function () {
  emailjs.init("o6xZVMPNkI1Ch3geb");
})();

function showToast(message, type) {
  const existing = document.querySelector(".dr-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = `dr-toast dr-toast--${type}`;
  toast.innerHTML = `<span class="dr-toast__icon">${type === "success" ? "✅" : "❌"}</span><span class="dr-toast__msg">${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("dr-toast--show"));
  setTimeout(() => { toast.classList.remove("dr-toast--show"); setTimeout(() => toast.remove(), 400); }, 3500);
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("contact-submit");

  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Изпращане...";

    emailjs.sendForm("service_designrealm", "template_vfw9947", form)
      .then(() => {
        showToast("Съобщението беше изпратено успешно!", "success");
        form.reset();
      }, (error) => {
        console.error("EmailJS error:", error);
        showToast("Грешка при изпращането. Опитай отново.", "error");
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Изпрати";
      });
  });
});