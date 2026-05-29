// ===== THEME MANAGER =====
// Управление на тьмна/светла тема и персонализирани цветни схеми

class ThemeManager {
    constructor() {
        this.STORAGE_KEY = 'designverse_theme';
        this.COLOR_KEY = 'designverse_accent_color';
        this.FIRESTORE_KEY = 'userPreferences';

        // Предложени цветни схеми
        this.colorSchemes = {
            purple: {
                name: 'Лилаво',
                hex: '#a86683',
                rgb: '168, 102, 131'
            },
            blue: {
                name: 'Синьо',
                hex: '#4A90E2',
                rgb: '74, 144, 226'
            },
            emerald: {
                name: 'Изумруд',
                hex: '#1ABC9C',
                rgb: '26, 188, 156'
            },
            coral: {
                name: 'Корал',
                hex: '#FF6B6B',
                rgb: '255, 107, 107'
            },
            amber: {
                name: 'Амбър',
                hex: '#FFB347',
                rgb: '255, 179, 71'
            },
            rose: {
                name: 'Роза',
                hex: '#E75480',
                rgb: '231, 84, 128'
            }
        };

        this.init();
    }

    // Инициализирай теми при зареждане
    async init() {
        await this.loadUserPreferences();
        this.applyTheme();
        this.applyAccentColor();
        this.observeSystemPreference();
    }

    // Изчакай за текущия потребител и зареди його предпочитания
    async loadUserPreferences() {
        try {
            const { auth } = await import('./firebase-init.js');
            const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js');

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    try {
                        const { db } = await import('./firebase-init.js');
                        const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js');

                        const snap = await getDoc(doc(db, 'users', user.uid));
                        if (snap.exists() && snap.data()[this.FIRESTORE_KEY]) {
                            const prefs = snap.data()[this.FIRESTORE_KEY];
                            if (prefs.theme) localStorage.setItem(this.STORAGE_KEY, prefs.theme);
                            if (prefs.accentColor) localStorage.setItem(this.COLOR_KEY, prefs.accentColor);

                            this.applyTheme();
                            this.applyAccentColor();
                        }
                    } catch (err) {
                        console.error('Failed to load user preferences:', err);
                    }
                }
            });
        } catch (err) {
            console.error('Firebase not available:', err);
        }
    }

    // Получи текущо съхранена тема
    getCurrentTheme() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) return stored;

        // Проверка дали ОС е в тъмен режим
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    // Получи текущ акцентен цвят
    getCurrentAccentColor() {
        return localStorage.getItem(this.COLOR_KEY) || 'purple';
    }

    // Применяй тема
    applyTheme() {
        const theme = this.getCurrentTheme();
        document.documentElement.setAttribute('data-theme', theme);

        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }

        this.updateThemeButton();
    }

    // Применяй акцентен цвят
    applyAccentColor() {
        const colorKey = this.getCurrentAccentColor();
        const color = this.colorSchemes[colorKey] || this.colorSchemes.purple;

        document.documentElement.style.setProperty('--accent', color.hex);
        document.documentElement.style.setProperty('--primary', color.hex);
        document.documentElement.style.setProperty('--accent-rgb', color.rgb);

        this.updateColorButtons();
    }

    // Превключи между тьмна/светла
    async toggleTheme() {
        const current = this.getCurrentTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';

        localStorage.setItem(this.STORAGE_KEY, newTheme);
        await this.saveToFirestore();
        this.applyTheme();

        // Emit event
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        return newTheme;
    }

    // Смени акцентния цвят
    async setAccentColor(colorKey) {
        if (!this.colorSchemes[colorKey]) {
            console.error(`Color scheme "${colorKey}" not found`);
            return false;
        }

        localStorage.setItem(this.COLOR_KEY, colorKey);
        await this.saveToFirestore();
        this.applyAccentColor();

        // Emit event
        window.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: colorKey } }));
        return true;
    }

    // Запази предпочитанията в Firestore
    async saveToFirestore() {
        try {
            const { auth } = await import('./firebase-init.js');
            const user = auth.currentUser;
            if (!user) return;

            const { db } = await import('./firebase-init.js');
            const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js');

            await setDoc(
                doc(db, 'users', user.uid),
                {
                    [this.FIRESTORE_KEY]: {
                        theme: this.getCurrentTheme(),
                        accentColor: this.getCurrentAccentColor()
                    }
                },
                { merge: true }
            );
        } catch (err) {
            console.error('Failed to save preferences:', err);
        }
    }

    // Вземи всички налични цветни схеми
    getColorSchemes() {
        return this.colorSchemes;
    }

    // Наблюдавай системните предпочитания
    observeSystemPreference() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.applyTheme();
            }
        });
    }

    // Обнови бутона на тема (ако съществува)
    updateThemeButton() {
        const btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;

        const theme = this.getCurrentTheme();
        btn.textContent = theme === 'dark' ? '☀️' : '🌙';
        btn.title = theme === 'dark' ? 'Светла тема' : 'Тьмна тема';
    }

    // Обнови цветни бутони (ако съществуват)
    updateColorButtons() {
        const buttons = document.querySelectorAll('.color-option');
        const currentColor = this.getCurrentAccentColor();

        buttons.forEach(btn => {
            if (btn.dataset.color === currentColor) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// Инициализирай при зареждане на документа
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

export default ThemeManager;
