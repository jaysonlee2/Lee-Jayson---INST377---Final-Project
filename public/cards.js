const tcgPokemon = ["oshawott", "tepig", "snivy"];

document.addEventListener("DOMContentLoaded", () => {
  loadTcgCards();
});

async function loadTcgCards() {
  const container = document.getElementById("tcgCardContainer");

  container.innerHTML = "";

  try {
    for (const name of tcgPokemon) {
      const response = await fetch(
        `https://api.tcgdex.net/v2/en/cards?name=${name}`,
      );

      const cards = await response.json();

      cards.forEach((card) => {
        if (!card.image) return;

        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");

        slide.innerHTML = `
          <div class="tcg-card">
            <img src="${card.image}/high.webp" alt="${card.name}">
            <h3>${card.name}</h3>
          </div>
        `;

        container.appendChild(slide);
      });
    }

    new Swiper(".starterCardSwiper", {
      slidesPerView: 2,
      spaceBetween: 20,
      loop: true,

      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      breakpoints: {
        600: {
          slidesPerView: 2,
        },

        900: {
          slidesPerView: 4,
        },

        1200: {
          slidesPerView: 5,
        },
      },
    });
  } catch (error) {
    console.error(error);

    container.innerHTML = `
      <p>Could not load TCG cards.</p>
    `;
  }
}
