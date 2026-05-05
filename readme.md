# Pokémon Card Game

The objective of this assignment is to design and develop a memory card game using CSS and JS.

Game Demo: https://velvety-mousse-38f1cf.netlify.app/

Bootstrapping video (from last year): https://youtu.be/CYWpWit7pkw

# Epics and User Stories

## Epic 1: **Game Mechanics**

Goal: Create a functional card game using Pokémon cards.

User Stories:

- As a player, I want to play a card game utilizing Pokémon cards, so that I can enjoy the game with familiar and exciting Pokémon characters.
- As a player, I want to ensure that each Pokémon can only be assigned to a single card, so that the game follows the rules of memory card games and offers a fair gameplay experience.
- As a player, I want a power-up feature that allows me to see all the cards for a short period of time, so that I can strategically plan my moves.

Constraints:

- Pokémon must be fetched randomly and uniquely assigned.
- Power-up should have a time limit (e.g., 3–5 seconds).
- No duplicate Pokémon allowed in a pair set.
- Ensure to use `axios` not `fetch` to fetch data from the `PokéAPI`.
- Ensure error handling for API failures.
- Ensure that successive API calls are executed in parallel rather than sequentially.

## Epic 2: **Gameplay Controls**

Goal: Implement game controls and difficulty settings.

User Stories:

- As a player, I want the game to have a start button, so that I can initiate a new game session.
- As a player, I want the game to have a reset button, so that I can restart the current game session.
- As a player, I want the number of cards and time limits to adjust based on the chosen difficulty level.
- As a player, I want different difficulty levels, so that I can choose the level of challenge.
- As a player, I want to see a header displaying game info (clicks, pairs left/matched), so that I can track my progress.

Constraints:

- Game must auto-end if the timer runs out.
- Game must track and display state in real time.
- Difficulty levels should alter card count and timer.

## Epic 3: **User Interface & Experience**

Goal: Design a user-friendly and visually appealing interface.

User Stories:

- As a player, I want to be able to select different themes (e.g., dark and light), so that I can customize the visual appearance.
- Game header must include click and pair stats.

Constraints

- Theme toggle must persist across sessions (`localStorage`).
- Interface must be mobile-friendly and responsive.




# Suggested Development Strategy

- Step 1. Setup the files and the imports
- Step 2. Create Six cards. Add two images inside each card; front and back in each card. Have the cards inside a flex box.
- Step 3. Overlap the front and the back of each card so that only the back of the cards are visible.
- Step 4. Add a flip animation to the cards on hover.
- Step 4.1 Add the flip class to rotateY(180deg) to the .card:hover and transition in 1s
- Step 4.2 Make the rotation in 3d by adding perspective: 1000px; to the .card
- Step 5. Check if two cards are the same.
- Step 6a. If two cards are not the same, flip them back
- Step 6b. If two cards are not the same, flip them back with some delay
- Step 7. If two cards are the same, remove them from the game.
- Step 8. Corner case 1. If the user clicks on the same card twice, do nothing.
- Step 9. Corner case 2. If the user clicks on a card that is already matched, do nothing.
- Step 10. Corner case 3. If the user clicks on a card while two cards are already flipped, do nothing.
- Step 11a. Add the winning event. If user clicks on all the cards, display a winning message.
- Step 11b. Add a header showing the number of clicks the user has made, and the number of pairs left, number of pairs matched, and total number of pairs.
- Step 12a. Add a timer to the game.
- Step 12b. Show the time in the header.
- Step 13. Add a _reset_ button to the game.
- Step 14. Add a _start_ button to the game.
- Step 15.a Add a difficulty level to the game. Show the levels controls to the header.
- Step 15.b Add the logic to the difficulty levels.
- Step 16. Add themes
- Step 17. Add power-up logic. May be reveal all cards for short period of time.

# Rubric

Check the rubric on D2L for grading criteria.
