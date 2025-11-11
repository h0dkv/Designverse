
(function() {
  emailjs.init("o6xZVMPNkI1Ch3geb"); // 
})();

document.addEventListener("DOMContentLoaded", function() {
  const form = document.querySelector(".contact-form");

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    emailjs.sendForm("service_designsverse", "template_vfw9947", this)
      .then(() => {
        alert("✅ Съобщението беше изпратено успешно!");
        form.reset();
      }, (error) => {
        alert("❌ Възникна грешка при изпращането. Опитай отново.");
        console.error("EmailJS error:", error);
      });
  });
});
