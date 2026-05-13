# Developer Manual - By: Jayson Lee

## Project Overview

Unova Starter Finder is a Node.js web application that helps users choose between Oshawott, Tepig, and Snivy from Pokémon Black and White. The app uses PokéAPI for Pokémon data, TCGdex API for Pokémon trading card images, Supabase for saving starter choices, and a frontend built with HTML, CSS, JavaScript, Chart.js, and Swiper.js.

---

# How to Install the Application

## 1. Clone the GitHub Repository

```bash
git clone https://github.com/jaysonlee2/Lee-Jayson---INST377---Final-Project.git
```

---

## 2. Move into the Project Folder

```bash
cd Lee-Jayson---INST377---Final-Project
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Create Environment Variables

Create a `.env` file in the root directory and add:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_publishable_key
```

---

## 5. Run the Application

```bash
npm start
```

The application should now run at:

```text
http://localhost:3000
```

The frontend files are served from the `public` folder.

---

# Running the Application on a Server

The application uses Node.js and Express.js.

To start the local development server:

```bash
npm start
```

The Express server handles:

- API requests
- Supabase communication
- Static frontend files

---

# Running Tests

Manual testing was completed by:

- Testing all navigation buttons
- Testing API fetch requests
- Testing Supabase save/load functionality
- Testing Chart.js rendering
- Testing Swiper.js carousel functionality
- Testing responsive layout changes
- Testing recommendation calculations

---

# Server API Endpoints

## GET Endpoints

### GET `/pokemon`

Fetches Pokémon starter data from PokéAPI.

Returns:

- Pokémon name
- Stats
- Types
- Images

Used by:

- Starter comparison cards
- Recommendation system
- Stat chart

---

### GET `/choices`

Retrieves saved starter recommendations from Supabase.

Returns:

- Starter selected
- Stat weights
- Date and time saved

Used by:

- Load Saved Choices button

---

## POST Endpoints

### POST `/choice`

Saves a user’s starter recommendation to Supabase.

### Request Body Example

```json
{
  "starter": "Snivy",
  "speed_weight": 8,
  "attack_weight": 5,
  "defense_weight": 7,
  "special_attack_weight": 6,
  "special_defense_weight": 4
}
```

Stores:

- Starter choice
- Slider weights
- Save timestamp

---

# Technologies Used

## Frontend

- HTML
- CSS
- JavaScript

## Backend

- Node.js
- Express.js

## APIs

- PokéAPI
- TCGdex API

## Database

- Supabase

## JavaScript Libraries

- Chart.js
- Swiper.js

---

# Known Bugs

- Some older saved choices may display "No date saved" if they were created before the timestamp feature was added.
- Trading card images may occasionally load slowly depending on the TCGdex API response speed.
- Mobile responsiveness could still be improved on smaller screens.
- Some animations may appear differently across browsers.

---

# Future Development Roadmap

Possible future improvements include:

- Add user authentication
- Add more Pokémon generations
- Add Pokémon evolution recommendations
- Improve animations and transitions

---

# Project Structure

```text
project-root/
│
├── docs/
│   └── README.md
│
├── public/
│   ├── index.html
│   ├── about.html
│   ├── help.html
│   ├── style.css
│   ├── script.js
│   ├── tcg.js
│   ├── bg.jpeg
│   ├── oshawottFPI.jpeg
│   ├── tepigFPI.jpeg
│   └── snivyFPI.jpeg
│
├── server.js
├── package.json
├── package-lock.json
├── .env
```
