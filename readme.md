# Pokémon Games

A collection of three Pokémon-themed browser games: a memory card game, a Tic-Tac-Toe game with an AI opponent powered by Google Gemini, and a Wordle-style guessing game.

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

4. Open your browser and go to `http://localhost:5000` — this loads `index.html`, the homepage with a card linking to each game.

---

## Games

### Homepage (`index.html`)

The landing page — a card per game, each with a looping CSS-animation
preview that demonstrates how that game actually plays, before you even
click in.

**Features:**
- TicTacToe card: pieces pop into place on the board one at a time, on a loop
- Memory game card: cards flip in sequence to preview the matching gameplay
- Wordle card: letters pop in and color in (green/yellow/gray) to preview a sample guess, finishing with the correct answer revealed
- All animations are pure CSS `@keyframes`, synced to a shared timeline so each card's reveal/color/fade-out stays in step
- Each card is a clickable link straight into that game
- Responsive layout — cards stack on small/medium screens, sit side-by-side on large screens

| Desktop | Mobile |
|---|---|
| ![Homepage - desktop](images/screenshots/home-desktop.png) | ![Homepage - mobile](images/screenshots/home-mobile.png) |

---

### Pokémon Memory Card Game (`memory.html`)

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

| Desktop | Mobile |
|---|---|
| ![Memory game - desktop](images/screenshots/memory-desktop.png) | ![Memory game - mobile](images/screenshots/memory-mobile.png) |

---

### Pokémon TicTacToe (`tictactoe.html`)

A two-player Tic-Tac-Toe game where each player picks a Pokémon as their marker.

**Features:**
- **Local mode** — two players take turns on the same device
- **AI mode** — play against Google Gemini, which picks a random Pokémon as its marker
- **Online mode** — real-time multiplayer via Socket.IO; join a random opponent or a specific room by ID, with duplicate-marker prevention and disconnect handling
- Rematch flow for online mode — request, accept, or decline another round with your opponent, with turn order alternating fairly each round
- Players pick their name and search for any Pokémon as their marker
- Winning cells are highlighted when a player wins
- Confetti celebration on win
- **New Round** — clears the board and keeps scores and player selections
- **New Game** — resets everything and goes back to player selection
- Win counter tracks scores across rounds
- Dark/light theme toggle that persists via `localStorage`

| Desktop | Mobile |
|---|---|
| ![TicTacToe - desktop](images/screenshots/tictactoe-desktop.png) | ![TicTacToe - mobile](images/screenshots/tictactoe-mobile.png) |

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

| Desktop | Mobile |
|---|---|
| ![Wordle - desktop](images/screenshots/wordle-desktop.png) | ![Wordle - mobile](images/screenshots/wordle-mobile.png) |

---

## Tech Stack

- **Frontend:** HTML, Tailwind CSS v4, DaisyUI v5, CSS `@keyframes` animations
- **Backend:** Node.js, Express, Socket.IO (real-time online TicTacToe)
- **APIs:** PokéAPI (Pokémon data), Google Gemini (`gemini-3.1-flash-lite`) for AI opponent
- **Libraries:** axios, dotenv, js-confetti, cors, `@google/genai`
