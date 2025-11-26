
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('catalogSearch');
    const searchBtn = document.getElementById('searchBtn');
    const cards = document.querySelectorAll('main.catalog .card');

    if (!searchInput || !searchBtn || cards.length === 0) return;

    function filterCatalog() {
        const term = searchInput.value.trim().toLowerCase();

        cards.forEach(card => {
            const titleEl = card.querySelector('h3');
            const descEl = card.querySelector('p');

            const titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
            const descText = descEl ? descEl.textContent.toLowerCase() : '';

            const combined = `${titleText} ${descText}`;

            if (!term || combined.includes(term)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Бутон за търсене
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filterCatalog();
    });

    // Live search при писане
    searchInput.addEventListener('input', filterCatalog);

    // Enter стартира търсене
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterCatalog();
        }
    });
});
