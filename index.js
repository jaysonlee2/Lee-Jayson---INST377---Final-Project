const express = require("express");
const bodyParser = require("body-parser");
const supabaseClient = require("@supabase/supabase-js");
const dotenv = require("dotenv");

const app = express();
const port = 3000;

dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

// Home page
app.get("/", (req, res) => {
  res.sendFile("public/index.html", { root: __dirname });
});

// 1. External API endpoint: gets Pokemon data from PokéAPI
app.get("/pokemon/:name", async (req, res) => {
  const pokemonName = req.params.name.toLowerCase();

  try {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`,
    );

    if (!response.ok) {
      res.status(404).json({ message: "Pokemon not found" });
      return;
    }

    const pokemon = await response.json();

    const stats = {};
    pokemon.stats.forEach((item) => {
      stats[item.stat.name] = item.base_stat;
    });

    const cleanedPokemon = {
      name: pokemon.name,
      image:
        pokemon.sprites.other["official-artwork"].front_default ||
        pokemon.sprites.front_default,
      types: pokemon.types.map((type) => type.type.name),
      stats: {
        speed: stats.speed,
        attack: stats.attack,
        defense: stats.defense,
        specialAttack: stats["special-attack"],
        specialDefense: stats["special-defense"],
      },
    };

    res.json(cleanedPokemon);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting Pokemon data" });
  }
});

// 2. Database GET endpoint: gets saved starter choices
app.get("/choices", async (req, res) => {
  const { data, error } = await supabase.from("starter_choices").select();

  if (error) {
    console.log(error);
    res.status(500).json(error);
  } else {
    res.json(data);
  }
});

// 3. Database POST endpoint: saves a starter choice
app.post("/choice", async (req, res) => {
  const {
    starter,
    speed_weight,
    attack_weight,
    defense_weight,
    special_attack_weight,
    special_defense_weight,
  } = req.body;

  const { data, error } = await supabase
    .from("starter_choices")
    .insert({
      starter: starter,
      speed_weight: speed_weight,
      attack_weight: attack_weight,
      defense_weight: defense_weight,
      special_attack_weight: special_attack_weight,
      special_defense_weight: special_defense_weight,
    })
    .select();

  if (error) {
    console.log(error);
    res.status(500).json(error);
  } else {
    res.json(data);
  }
});

module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`App is available on port: ${port}`);
  });
}