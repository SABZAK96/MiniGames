# Pokémon Games

A collection of two Pokémon-themed browser games: a memory card game and a Tic-Tac-Toe game with an AI opponent powered by Google Gemini.

---

## How to Run

**Prerequisites:** Node.js installed.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:5000`

---

## Games

### Pokémon Memory Card Game (`index.html`)

A classic flip-and-match memory game using Pokémon artwork fetched from the PokéAPI.

**Features:**
- Three difficulty levels: Easy (3 pairs), Medium (6 pairs), Hard (12 pairs)
- Pokémon images are fetched randomly and uniquely from the PokéAPI using `axios`
- Flip animation with 3D card effect
- Power-up: reveals all cards for a short time
- Timer that counts down — game ends if time runs out
- Tracks clicks, pairs matched, and pairs remaining in real time
- Dark/light theme toggle that persists via `localStorage`
- Responsive layout

---

### Pokémon TicTacToe (`tictactoe.html`)

A two-player Tic-Tac-Toe game where each player picks a Pokémon as their marker.

**Features:**
- **Local mode** — two players take turns on the same device
- **AI mode** — play against Google Gemini, which picks a random Pokémon as its marker
- Players pick their name and search for any Pokémon as their marker
- Winning cells are highlighted when a player wins
- Confetti celebration on win
- **New Round** — clears the board and keeps scores and player selections
- **New Game** — resets everything and goes back to player selection
- Win counter tracks scores across rounds
- Dark/light theme toggle that persists via `localStorage`

---

### Pokémon Wordle (`pokewordle.html`)

A Wordle-style game where the hidden word is always a Pokémon name.

**Features:**
- Random Pokémon fetched from the PokéAPI — word length matches the Pokémon's name
- 6 attempts to guess the name, with colour-coded feedback per letter (green = correct position, yellow = wrong position, grey = not in name)
- 3 progressive hints: Pokémon type → colour → abilities
- Pokémon silhouette shown as a shadow, revealed on win or loss
- Shake animation on invalid (incomplete) guess submission
- Confetti celebration on win
- Keyboard input + Submit button support
- Dark/light theme toggle that persists via `localStorage`

---

## Tech Stack

- **Frontend:** HTML, Tailwind CSS v4, DaisyUI v5
- **Backend:** Node.js, Express
- **APIs:** PokéAPI (Pokémon data), Google Gemini (`gemini-3.1-flash-lite`) for AI opponent
- **Libraries:** axios, dotenv, js-confetti
