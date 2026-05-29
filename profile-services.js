// ===== SERVICE ORDERS MANAGER =====
// Управление на модална форма за поръчки на услуги

class ServiceOrdersManager {
    constructor() {
        this.modal = document.getElementById('orderModal');
        this.form = document.getElementById('orderForm');
        this.orderButtons = document.querySelectorAll('.order-btn');

        this.init();
    }

    init() {
        // Слушатели на бутоните
        this.orderButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.openModal(e));
        });

        // Слушатель на форма
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Затваряне на модал при клик на фон
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // ESC за затваряне
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    // Отвори модал
    openModal(e) {
        e.preventDefault();
        const btn = e.currentTarget;
        const service = btn.dataset.service;

        document.getElementById('serviceType').value = service;
        this.modal.classList.add('active');

        // Фокус на първо поле
        setTimeout(() => {
            document.getElementById('orderName').focus();
        }, 100);
    }

    // Затвори модал
    closeModal() {
        this.modal.classList.remove('active');
        this.form.reset();
    }

    // Обработи подаване на форма
    async handleSubmit(e) {
        e.preventDefault();

        const submitBtn = this.form.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Изпращане...';

        try {
            const formData = new FormData(this.form);

            // Събери данни
            const orderData = {
                service: document.getElementById('serviceType').value,
                name: document.getElementById('orderName').value,
                email: document.getElementById('orderEmail').value,
                phone: document.getElementById('orderPhone').value,
                material: document.getElementById('orderMaterial').value,
                description: document.getElementById('orderDescription').value,
                timestamp: new Date().toISOString()
            };

            // Проверка за файл
            const fileInput = document.getElementById('orderFile');
            if (fileInput.files.length > 0) {
                // TODO: Качване на файл в Firebase Storage
                orderData.hasFile = true;
                orderData.fileName = fileInput.files[0].name;
            }

            // Изпрати към сървър или съхрани в Firestore
            await this.submitOrder(orderData);

            // Успех
            this.showNotification('Поръчката е изпратена успешно! Скоро ще ви контактуваме.', 'success');
            this.closeModal();

        } catch (error) {
            console.error('Order submission error:', error);
            this.showNotification('Грешка при изпращане на поръчката. Опитайте отново.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Изпрати поръчка';
        }
    }

    // Изпрати поръчката
    async submitOrder(orderData) {
        // Временно: логирай поръчката
        console.log('Order submitted:', orderData);

        // TODO: Интеграция с Firestore
        // const { db } = await import('./firebase-init.js');
        // const { collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js');
        // 
        // await addDoc(collection(db, 'orders'), {
        //   ...orderData,
        //   createdAt: serverTimestamp()
        // });

        // За сега имитирай успех
        return new Promise(resolve => setTimeout(resolve, 500));
    }

    // Покажи известие
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `dr-toast dr-toast--${type}`;
        notification.innerHTML = `
      <span class="dr-toast__icon">${type === 'success' ? '✅' : '❌'}</span>
      <span class="dr-toast__msg">${message}</span>
    `;
        document.body.appendChild(notification);

        requestAnimationFrame(() => notification.classList.add('dr-toast--show'));

        setTimeout(() => {
            notification.classList.remove('dr-toast--show');
            setTimeout(() => notification.remove(), 400);
        }, 4000);
    }
}

// Инициализирай при готовност на документа
document.addEventListener('DOMContentLoaded', () => {
    new ServiceOrdersManager();
});

export default ServiceOrdersManager;
