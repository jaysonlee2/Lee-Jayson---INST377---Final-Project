const starters = ["oshawott", "tepig", "snivy"];
const pointLimit = 25;

const sliderIds = [
  "speed",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
];

const statLabels = {
  speed: "Speed",
  attack: "Attack",
  defense: "Defense",
  specialAttack: "Special Attack",
  specialDefense: "Special Defense",
};

let pokemonData = [];
let recommendedPokemon = null;
let starterChart = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchAllPokemon();
  setupEventListeners();
  updateSliderValues();
  updatePointsRemaining();
});

function setupEventListeners() {
  sliderIds.forEach((sliderId) => {
    const slider = document.getElementById(sliderId);

    slider.addEventListener("input", () => {
      updatePointLimit(slider);
    });
  });

  document
    .getElementById("recommendBtn")
    .addEventListener("click", calculateRecommendation);
  document.getElementById("saveBtn").addEventListener("click", saveChoice);
  document.getElementById("resetBtn").addEventListener("click", resetSliders);
  document
    .getElementById("loadChoicesBtn")
    .addEventListener("click", loadSavedChoices);
}

async function fetchAllPokemon() {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = `<p>Loading Pokémon data...</p>`;

  try {
    const responses = await Promise.all(
      starters.map((name) => fetch(`/pokemon/${name}`)),
    );

    pokemonData = await Promise.all(
      responses.map((response) => response.json()),
    );

    displayPokemonCards();
    buildChart();
  } catch (error) {
    console.error(error);
    container.innerHTML = `<p>Could not load Pokémon data.</p>`;
  }
}

function displayPokemonCards() {
  const container = document.getElementById("pokemonContainer");
  container.innerHTML = "";

  pokemonData.forEach((pokemon) => {
    const card = document.createElement("div");
    card.classList.add("pokemon-card");

    card.innerHTML = `
      <h3>${capitalize(pokemon.name)}</h3>
      <img src="${pokemon.image}" alt="${pokemon.name}" />

      <p><strong>Type:</strong> ${pokemon.types.join(", ")}</p>
      <p><strong>Speed:</strong> ${pokemon.stats.speed}</p>
      <p><strong>Attack:</strong> ${pokemon.stats.attack}</p>
      <p><strong>Defense:</strong> ${pokemon.stats.defense}</p>
      <p><strong>Special Attack:</strong> ${pokemon.stats.specialAttack}</p>
      <p><strong>Special Defense:</strong> ${pokemon.stats.specialDefense}</p>

      <div class="playstyle">
        <strong>Playstyle:</strong> ${getPlaystyle(pokemon.name)}
      </div>
    `;

    container.appendChild(card);
  });
}

function getPlaystyle(name) {
  const playstyles = {
    oshawott:
      "Balanced starter with solid overall stats. Good for players who want a simple and steady choice.",
    tepig:
      "Strong early-game and offensive starter. Good for beginners who want power.",
    snivy:
      "Fast and strategic starter for players who value speed and smarter play.",
  };

  return playstyles[name] || "Starter Pokémon.";
}

function getWeights() {
  const weights = {};

  sliderIds.forEach((id) => {
    weights[id] = Number(document.getElementById(id).value);
  });

  return weights;
}

function getTotalPoints() {
  const weights = getWeights();

  return sliderIds.reduce((total, id) => total + weights[id], 0);
}

function updatePointLimit(changedSlider) {
  const total = getTotalPoints();

  if (total > pointLimit) {
    const overAmount = total - pointLimit;
    changedSlider.value = Number(changedSlider.value) - overAmount;
  }

  updateSliderValues();
  updatePointsRemaining();
}

function updatePointsRemaining() {
  const remaining = pointLimit - getTotalPoints();

  document.getElementById("pointsRemaining").innerHTML =
    `Points Remaining: <strong>${remaining}</strong>`;
}

function calculateRecommendation() {
  const weights = getWeights();
  const experienceLevel = document.getElementById("experienceLevel").value;
  const battleStyle = document.getElementById("battleStyle").value;
  const starterGoal = document.getElementById("starterGoal").value;

  let highestScore = -1;
  let bestPokemon = null;
  let bestReasons = [];

  pokemonData.forEach((pokemon) => {
    const baseScore = calculateBaseScore(pokemon, weights);
    const bonusResult = calculateBonusScore(
      pokemon,
      experienceLevel,
      battleStyle,
      starterGoal,
    );

    const finalScore = baseScore + bonusResult.bonus;

    if (finalScore > highestScore) {
      highestScore = finalScore;
      bestPokemon = pokemon;
      bestReasons = bonusResult.reasons;
    }
  });

  recommendedPokemon = bestPokemon;

  if (bestPokemon) {
    displayRecommendation(bestPokemon, bestReasons, weights);
  }
}

function calculateBaseScore(pokemon, weights) {
  return (
    pokemon.stats.speed * weights.speed +
    pokemon.stats.attack * weights.attack +
    pokemon.stats.defense * weights.defense +
    pokemon.stats.specialAttack * weights.specialAttack +
    pokemon.stats.specialDefense * weights.specialDefense
  );
}

function calculateBonusScore(
  pokemon,
  experienceLevel,
  battleStyle,
  starterGoal,
) {
  let bonus = 0;
  const reasons = [];

  const name = pokemon.name;

  if (experienceLevel === "beginner" && name === "tepig") {
    bonus += 100;
    reasons.push("Tepig is strong early-game and beginner-friendly");
  }

  if (experienceLevel === "intermediate" && name === "oshawott") {
    bonus += 80;
    reasons.push("Oshawott is balanced and flexible for intermediate players");
  }

  if (experienceLevel === "veteran" && name === "snivy") {
    bonus += 100;
    reasons.push("Snivy rewards strategic and experienced players");
  }

  if (battleStyle === "balanced" && name === "oshawott") {
    bonus += 140;
    reasons.push("you chose balanced gameplay");
  }

  if (battleStyle === "fast" && name === "snivy") {
    bonus += 140;
    reasons.push("you prefer fast and strategic gameplay");
  }

  if (battleStyle === "offensive" && name === "tepig") {
    bonus += 140;
    reasons.push("you prefer strong offensive attacks");
  }

  if (
    battleStyle === "defensive" &&
    (name === "snivy" || name === "oshawott")
  ) {
    bonus += 90;
    reasons.push("you value defensive play");
  }

  if (starterGoal === "easy" && name === "tepig") {
    bonus += 100;
    reasons.push("you want an easy starter with strong early-game power");
  }

  if (starterGoal === "lateGame" && name === "snivy") {
    bonus += 100;
    reasons.push("you care about late-game potential");
  }

  if (starterGoal === "power" && name === "tepig") {
    bonus += 100;
    reasons.push("you care about raw power");
  }

  if (starterGoal === "design") {
    bonus += 20;
    reasons.push("design and personality were part of your choice");
  }

  return {
    bonus,
    reasons,
  };
}

function displayRecommendation(bestPokemon, bestReasons, weights) {
  const topStat = getStrongestPreference(weights);

  const reasonSentence =
    bestReasons.length > 0
      ? bestReasons.join(", ")
      : "it had the best overall score based on your stat sliders";

  document.getElementById("recommendationText").textContent =
    `${capitalize(bestPokemon.name)} is your best starter match because ${reasonSentence}. Based on your sliders, ${topStat} also mattered most to you. Overall, ${capitalize(bestPokemon.name)} best matches your preferred playstyle and starter goals.`;

  const recommendedImage = document.getElementById("recommendedPokemonImage");

  const pokemonImages = {
    oshawott:
      "https://drive.google.com/uc?export=view&id=10gsr9Ku5zf5hogIipnxJK8Q6zvrWDlpx",
    tepig:
      "https://drive.google.com/uc?export=view&id=1BYhfOsuYqYzshKDP7ELO463ULlRsooeS",
    snivy:
      "https://drive.google.com/uc?export=view&id=1TXkRmXbvCFAY4TboicEd38Dju7BTRWhI",
  };

  recommendedImage.src = pokemonImages[bestPokemon.name];
  recommendedImage.style.display = "block";

  function getStrongestPreference(weights) {
    let strongest = "speed";
    let highestValue = weights.speed;

    Object.keys(weights).forEach((key) => {
      if (weights[key] > highestValue) {
        strongest = key;
        highestValue = weights[key];
      }
    });

    return statLabels[strongest];
  }

  async function saveChoice() {
    if (!recommendedPokemon) {
      alert("Get a recommendation first.");
      return;
    }

    const weights = getWeights();

    const choiceData = {
      starter: capitalize(recommendedPokemon.name),
      speed_weight: weights.speed,
      attack_weight: weights.attack,
      defense_weight: weights.defense,
      special_attack_weight: weights.specialAttack,
      special_defense_weight: weights.specialDefense,
    };

    try {
      const response = await fetch("/choice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(choiceData),
      });

      if (!response.ok) {
        throw new Error("Failed to save.");
      }

      alert("Choice saved!");
    } catch (error) {
      console.error(error);
      alert("Could not save choice.");
    }
  }

  async function loadSavedChoices() {
    const savedChoicesDiv = document.getElementById("savedChoices");
    savedChoicesDiv.innerHTML = `<p>Loading saved choices...</p>`;

    try {
      const response = await fetch("/choices");
      const choices = await response.json();

      savedChoicesDiv.innerHTML = "";

      if (choices.length === 0) {
        savedChoicesDiv.innerHTML = `<p>No saved choices yet.</p>`;
        return;
      }

      choices.slice(0, 5).forEach((choice) => {
        savedChoicesDiv.appendChild(createSavedChoiceCard(choice));
      });
    } catch (error) {
      console.error(error);
      savedChoicesDiv.innerHTML = `<p>Could not load saved choices.</p>`;
    }
  }

  function createSavedChoiceCard(choice) {
    const div = document.createElement("div");
    div.classList.add("saved-choice");

    div.innerHTML = `
    <p><strong>Starter:</strong> ${choice.starter}</p>
    <p><strong>Speed Weight:</strong> ${choice.speed_weight}</p>
    <p><strong>Attack Weight:</strong> ${choice.attack_weight}</p>
    <p><strong>Defense Weight:</strong> ${choice.defense_weight}</p>
    <p><strong>Special Attack Weight:</strong> ${choice.special_attack_weight}</p>
    <p><strong>Special Defense Weight:</strong> ${choice.special_defense_weight}</p>
  `;

    return div;
  }

  function updateSliderValues() {
    sliderIds.forEach((id) => {
      document.getElementById(`${id}Value`).textContent =
        document.getElementById(id).value;
    });
  }

  function resetSliders() {
    sliderIds.forEach((id) => {
      document.getElementById(id).value = 5;
    });

    document.getElementById("experienceLevel").value = "beginner";
    document.getElementById("battleStyle").value = "balanced";
    document.getElementById("starterGoal").value = "easy";

    updateSliderValues();
    updatePointsRemaining();

    recommendedPokemon = null;

    document.getElementById("recommendationText").textContent =
      "Click the button to get your recommendation.";

    document.getElementById("savedChoices").innerHTML = "";
  }

  function buildChart() {
    const chartCanvas = document.getElementById("starterChart");

    if (!chartCanvas) {
      return;
    }

    const labels = ["Speed", "Attack", "Defense", "Sp. Attack", "Sp. Defense"];

    const datasets = pokemonData.map((pokemon) => ({
      label: capitalize(pokemon.name),
      data: [
        pokemon.stats.speed,
        pokemon.stats.attack,
        pokemon.stats.defense,
        pokemon.stats.specialAttack,
        pokemon.stats.specialDefense,
      ],
    }));

    if (starterChart) {
      starterChart.destroy();
    }

    starterChart = new Chart(chartCanvas, {
      type: "bar",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Starter Pokémon Stat Comparison",
          },
        },
      },
    });
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
}
