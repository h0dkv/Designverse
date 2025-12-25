document.addEventListener("DOMContentLoaded", () => {

    // ===================== Мобилно меню =====================
    const menuBtn = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav") || document.querySelector("nav");

    if (menuBtn && nav) {
        menuBtn.addEventListener("click", () => {
            nav.classList.toggle("show");
            menuBtn.textContent = nav.classList.contains("show") ? "✖" : "☰";
        });

        const links = nav.querySelectorAll ? nav.querySelectorAll("a") : [];
        links.forEach((link) => {
            link.addEventListener("click", () => {
                nav.classList.remove("show");
                menuBtn.textContent = "☰";
            });
        });
    }

    // theme toggle removed (button and countdown were deleted)

    // ===================== Обикновена търсачка (#search) =====================
    const search = document.getElementById("search");
    if (search) {
        search.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll(".card").forEach((card) => {
                const title =
                    card.querySelector("h3")?.textContent?.toLowerCase() || "";
                card.style.display = title.includes(term) ? "" : "none";
            });
        });
    }

    // ===================== Въртяща се търсачка (input-wrapper) =====================
    const inputWrapper = document.querySelector(".input-wrapper");
    const searchField = document.querySelector(".search-field");
    const searchButton = document.querySelector(".search-button");

    if (inputWrapper && searchField && searchButton) {
        let currentDuration = 4000;
        let targetDuration = 4000;
        let animationFrame = null;
        let isTyping = false;
        let isSearching = false;

        function smoothTransition() {
            const diff = targetDuration - currentDuration;
            if (Math.abs(diff) > 10) {
                currentDuration += diff * 0.015;
                inputWrapper.style.setProperty(
                    "--spin-duration",
                    `${currentDuration}ms`
                );
                animationFrame = requestAnimationFrame(smoothTransition);
            } else {
                currentDuration = targetDuration;
                inputWrapper.style.setProperty(
                    "--spin-duration",
                    `${currentDuration}ms`
                );
                animationFrame = null;
            }
        }

        searchField.addEventListener("input", () => {
            if (!isTyping && !isSearching) {
                isTyping = true;
                targetDuration = 60000;
                if (!animationFrame) smoothTransition();
            }
        });

        searchField.addEventListener("focus", () => {
            if (!isTyping && !searchField.value) {
                targetDuration = 4000;
                if (animationFrame) cancelAnimationFrame(animationFrame);
                animationFrame = null;
                currentDuration = 4000;
                inputWrapper.style.setProperty(
                    "--spin-duration",
                    `${currentDuration}ms`
                );
            }
        });

        searchField.addEventListener("blur", () => {
            if (!isSearching) {
                isTyping = false;
                targetDuration = 4000;
                if (animationFrame) cancelAnimationFrame(animationFrame);
                animationFrame = null;
                smoothTransition();
            }
        });

        searchButton.addEventListener("click", () => {
            isSearching = true;
            if (animationFrame) cancelAnimationFrame(animationFrame);
            animationFrame = null;
            targetDuration = 2500;
            smoothTransition();

            setTimeout(() => {
                isSearching = false;
                isTyping = false;
                targetDuration = 4000;
                if (animationFrame) cancelAnimationFrame(animationFrame);
                animationFrame = null;
                smoothTransition();
            }, 1500);
        });
    }
});
