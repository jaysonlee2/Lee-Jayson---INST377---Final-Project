const starters = ["oshawott", "tepig", "snivy"];

const pointLimit = 25;

let pokemonData = [];
let recommendedPokemon = null;
let starterChart = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchAllPokemon();

  const sliders = [
    "speed",
    "attack",
    "defense",
    "specialAttack",
    "specialDefense",
  ];

  sliders.forEach((sliderId) => {
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

  updateSliderValues();
  updatePointsRemaining();
});

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
  if (name === "oshawott") {
    return "Balanced starter with solid overall stats. Good for players who want a simple and steady choice.";
  }

  if (name === "tepig") {
    return "Strong early-game and offensive starter. Good for beginners who want power.";
  }

  if (name === "snivy") {
    return "Fast and strategic starter for players who value speed and smarter play.";
  }

  return "Starter Pokémon.";
}

function getWeights() {
  return {
    speed: Number(document.getElementById("speed").value),
    attack: Number(document.getElementById("attack").value),
    defense: Number(document.getElementById("defense").value),
    specialAttack: Number(document.getElementById("specialAttack").value),
    specialDefense: Number(document.getElementById("specialDefense").value),
  };
}

function getTotalPoints() {
  const weights = getWeights();

  return (
    weights.speed +
    weights.attack +
    weights.defense +
    weights.specialAttack +
    weights.specialDefense
  );
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
  const total = getTotalPoints();
  const remaining = pointLimit - total;

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
    let score =
      pokemon.stats.speed * weights.speed +
      pokemon.stats.attack * weights.attack +
      pokemon.stats.defense * weights.defense +
      pokemon.stats.specialAttack * weights.specialAttack +
      pokemon.stats.specialDefense * weights.specialDefense;

    let reasons = [];

    // Experience level bonuses
    if (experienceLevel === "beginner" && pokemon.name === "tepig") {
      score += 100;
      reasons.push("Tepig is strong early-game and beginner-friendly");
    }

    if (experienceLevel === "intermediate" && pokemon.name === "oshawott") {
      score += 80;
      reasons.push(
        "Oshawott is balanced and flexible for intermediate players",
      );
    }

    if (experienceLevel === "veteran" && pokemon.name === "snivy") {
      score += 100;
      reasons.push("Snivy rewards strategic and experienced players");
    }

    // Battle style bonuses
    if (battleStyle === "balanced" && pokemon.name === "oshawott") {
      score += 140;
      reasons.push("you chose balanced gameplay");
    }

    if (battleStyle === "fast" && pokemon.name === "snivy") {
      score += 140;
      reasons.push("you prefer fast and strategic gameplay");
    }

    if (battleStyle === "offensive" && pokemon.name === "tepig") {
      score += 140;
      reasons.push("you prefer strong offensive attacks");
    }

    if (
      battleStyle === "defensive" &&
      (pokemon.name === "snivy" || pokemon.name === "oshawott")
    ) {
      score += 90;
      reasons.push("you value defensive play");
    }

    // Starter goal bonuses
    if (starterGoal === "easy" && pokemon.name === "tepig") {
      score += 100;
      reasons.push("you want an easy starter with strong early-game power");
    }

    if (starterGoal === "lateGame" && pokemon.name === "snivy") {
      score += 100;
      reasons.push("you care about late-game potential");
    }

    if (starterGoal === "power" && pokemon.name === "tepig") {
      score += 100;
      reasons.push("you care about raw power");
    }

    if (starterGoal === "design") {
      score += 20;
      reasons.push("design and personality were part of your choice");
    }

    if (score > highestScore) {
      highestScore = score;
      bestPokemon = pokemon;
      bestReasons = reasons;
    }
  });

  recommendedPokemon = bestPokemon;

  if (bestPokemon) {
    const topStat = getStrongestPreference(weights);

    let reasonSentence = "";

    if (bestReasons.length > 0) {
      reasonSentence = bestReasons.join(", ");
    } else {
      reasonSentence =
        "it had the best overall score based on your stat sliders";
    }

    document.getElementById("recommendationText").textContent =
      `${capitalize(bestPokemon.name)} is your best starter match because ${reasonSentence}. Based on your sliders, ${topStat} also mattered most to you. Overall, ${capitalize(bestPokemon.name)} best matches your preferred playstyle and starter goals.`;
  }
}

function getStrongestPreference(weights) {
  let strongest = "speed";
  let highestValue = weights.speed;

  Object.keys(weights).forEach((key) => {
    if (weights[key] > highestValue) {
      strongest = key;
      highestValue = weights[key];
    }
  });

  const labels = {
    speed: "Speed",
    attack: "Attack",
    defense: "Defense",
    specialAttack: "Special Attack",
    specialDefense: "Special Defense",
  };

  return labels[strongest];
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
    loadSavedChoices();
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

    choices.forEach((choice) => {
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

      savedChoicesDiv.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    savedChoicesDiv.innerHTML = `<p>Could not load saved choices.</p>`;
  }
}

function updateSliderValues() {
  document.getElementById("speedValue").textContent =
    document.getElementById("speed").value;

  document.getElementById("attackValue").textContent =
    document.getElementById("attack").value;

  document.getElementById("defenseValue").textContent =
    document.getElementById("defense").value;

  document.getElementById("specialAttackValue").textContent =
    document.getElementById("specialAttack").value;

  document.getElementById("specialDefenseValue").textContent =
    document.getElementById("specialDefense").value;
}

function resetSliders() {
  document.getElementById("speed").value = 5;
  document.getElementById("attack").value = 5;
  document.getElementById("defense").value = 5;
  document.getElementById("specialAttack").value = 5;
  document.getElementById("specialDefense").value = 5;

  document.getElementById("experienceLevel").value = "beginner";
  document.getElementById("battleStyle").value = "balanced";
  document.getElementById("starterGoal").value = "easy";

  updateSliderValues();
  updatePointsRemaining();

  recommendedPokemon = null;

  document.getElementById("recommendationText").textContent =
    "Click the button to get your recommendation.";
}

function buildChart() {
  const chartCanvas = document.getElementById("starterChart");

  if (!chartCanvas) {
    return;
  }

  const labels = ["Speed", "Attack", "Defense", "Sp. Attack", "Sp. Defense"];

  const datasets = pokemonData.map((pokemon) => {
    return {
      label: capitalize(pokemon.name),
      data: [
        pokemon.stats.speed,
        pokemon.stats.attack,
        pokemon.stats.defense,
        pokemon.stats.specialAttack,
        pokemon.stats.specialDefense,
      ],
    };
  });

  if (starterChart) {
    starterChart.destroy();
  }

  starterChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: datasets,
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
