document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");
  const toggle = document.querySelector(".nav-toggle");

  if (toggle && navbar) {
    toggle.addEventListener("click", () => {
      const isOpen = navbar.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    navbar.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navbar.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Projects page filter chips (client-side, no data fetching)
  const chips = document.querySelectorAll(".filter-chip");
  const cards = document.querySelectorAll("[data-category]");
  if (chips.length && cards.length) {
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.setAttribute("aria-pressed", "false"));
        chip.setAttribute("aria-pressed", "true");
        const category = chip.dataset.filter;
        cards.forEach((card) => {
          const match = category === "all" || card.dataset.category === category;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }
});
