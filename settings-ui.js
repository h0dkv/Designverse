// ===== SETTINGS UI MANAGER =====
// Управление на UI контролите за тема и цветни схеми

class SettingsUIManager {
    constructor() {
        this.initThemeOptions();
        this.initColorPicker();
        this.initThemeToggle();
    }

    // Инициализирай theme option бутоните
    initThemeOptions() {
        const themeButtons = document.querySelectorAll('.theme-option-btn');
        if (themeButtons.length === 0) return;

        themeButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const theme = btn.dataset.theme;
                await window.themeManager.setAccentColor('purple'); // Temp

                // Промени темата
                localStorage.setItem('designverse_theme', theme);
                window.themeManager.applyTheme();

                // Обнови активния бутон
                this.updateThemeButtons();

                // Запази в Firestore
                await window.themeManager.saveToFirestore();
            });
        });

        this.updateThemeButtons();
    }

    // Обнови активния theme бутон
    updateThemeButtons() {
        const currentTheme = window.themeManager.getCurrentTheme();
        const buttons = document.querySelectorAll('.theme-option-btn');

        buttons.forEach(btn => {
            if (btn.dataset.theme === currentTheme) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Инициализирай color picker
    initColorPicker() {
        const group = document.getElementById('colorPickerGroup');
        if (!group) return;

        const colorSchemes = window.themeManager.getColorSchemes();

        Object.entries(colorSchemes).forEach(([key, color]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'color-option';
            btn.dataset.color = key;
            btn.title = color.name;
            btn.textContent = color.name;
            btn.style.background = color.hex;

            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                await window.themeManager.setAccentColor(key);
                this.updateColorButtons();
            });

            group.appendChild(btn);
        });

        this.updateColorButtons();
    }

    // Обнови активния color бутон
    updateColorButtons() {
        const currentColor = window.themeManager.getCurrentAccentColor();
        const buttons = document.querySelectorAll('.color-option');

        buttons.forEach(btn => {
            if (btn.dataset.color === currentColor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Инициализирай глобалния theme toggle бутон
    initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;

        toggleBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await window.themeManager.toggleTheme();
        });

        // Слушай за промени
        window.addEventListener('themeChanged', () => {
            window.themeManager.updateThemeButton();
        });
    }
}

// Инициализирай при готовност
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.themeManager) {
            new SettingsUIManager();
        }
    });
} else {
    if (window.themeManager) {
        new SettingsUIManager();
    }
}

export default SettingsUIManager;
