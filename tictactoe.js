// get full poke objects from the api
const jsConfetti = new JSConfetti();
let pokeObjects = undefined;
async function getPokes() {
  const pokes = await axios.get(
    "https://pokeapi.co/api/v2/pokemon/?limit=1000",
  );
  pokeObjects = pokes.data.results;
  return pokeObjects;
}

let playerOneMarker = undefined;
let playerTwoMarker = undefined;
let p1Name = undefined;
let p2Name = undefined;
let p1Wins = Number(document.getElementById("p1wins").textContent);
let p2Wins = Number(document.getElementById("p2wins").textContent);
let selectedPoke = { name: undefined, image: undefined };
let playerName = undefined;

async function searchPoke() {
  const allPokes = await getPokes();
  // reset values because selectedPokes, search, pokePreview should be used for both players
  selectedPoke = { name: undefined, image: undefined };
  document.getElementById("name").value = "";
  document.getElementById("search").value = "";
  document.getElementById("pokePreview").innerHTML = "";
  document.getElementById("my_modal_4").showModal();

  // add an event listener for instant suggestions
  const input = document.getElementById("search");
  playerName = document.getElementById("name");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const suggestionConatiner = document.getElementById("pokePreview");
    suggestionConatiner.innerHTML = "";
    if (query) {
      const matches = allPokes
        .filter((item) => item.name.trim().toLowerCase().startsWith(query))
        .slice(0, 8);
      if (matches.length !== 0) {
        matches.forEach(async (match) => {
          // find poke image for each match
          const pokeImage = (await axios.get(match.url)).data.sprites.other[
            "official-artwork"
          ].front_default;
          const element = document.createElement("p");
          element.id = `${match.name}`;
          element.classList.add(
            "flex",
            "flex-row",
            "gap-2",
            "items-center",
            "cursor-pointer",
            "p-2",
            "rounded-lg",
          );
          element.innerHTML = `<img id="${match.name}img" src="${pokeImage}" class="rounded-full w-6 h-6">${match.name}`;
          //do HTML string checking using includes method to see if that image already exists
          if (
            !suggestionConatiner.innerHTML.includes(`id="${match.name}img"`)
          ) {
            suggestionConatiner.appendChild(element);
          }

          // store selected poke when clicked, no listener on select here
          document
            .getElementById(`${match.name}`)
            .addEventListener("click", () => {
              // clear all highlights to ensure only one poke highlights at a time
              document
                .querySelectorAll("#pokePreview p")
                .forEach((el) =>
                  el.classList.remove("bg-primary", "rounded-xl", "text-white"),
                );
              document
                .getElementById(`${match.name}`)
                .classList.add("bg-primary", "rounded-xl", "text-white");
              selectedPoke = {
                id: match.name,
                name: match.name,
                image: pokeImage,
              };
            });
        });
      }
    }
  });

  // select listener registered once, outside forEach
  document.getElementById("select").addEventListener(
    "click",
    () => {
      if (!selectedPoke.name) return;

      document.getElementById("pokeName").innerHTML = `${selectedPoke.name}!`;
      document.getElementById("pokePic").src = selectedPoke.image;
      document.getElementById("my_modal_5").showModal();
    },
    { once: true },
  );

  // start game after player confirms their marker
  document.getElementById("my_modal_5").addEventListener(
    "close",
    () => {
      if (!playerOneMarker) {
        p1Name = playerName.value;
        document.getElementById("p1Name").textContent = p1Name;
        playerOneMarker = `<img id="${p1Name}Marker" src="${selectedPoke.image}" class="w-full h-full object-contain">`;

        // call search poke again for the next opponent
        searchPoke();
      } else {
        p2Name = playerName.value;
        document.getElementById("p2Name").textContent = p2Name;
        playerTwoMarker = `<img id="${p2Name}Marker" src="${selectedPoke.image}" class="w-full h-full object-contain">`;

        //start the game after player 2 chooses their marker
        startGame();
      }
    },
    { once: true },
  );
}
searchPoke();

//let the game begins!
let playerPlaying = undefined;
let board = [
  [null, null, null],
  [null, null, null],
  [null, null, null],
];
let winner = false;
let draw = false;
function startGame() {
  document.getElementById("currentTurn").innerHTML = p1Name;

  const allCells = document.querySelectorAll("[data-row][data-col]");
  allCells.forEach((cell) => {
    cell.innerHTML = "";
    cell.addEventListener("click", () => {
      // the following line should be moved to top so that the second player can't overwrite
      // the first player marker
      if (winner) return;
      if (draw) return;
      if (cell.innerHTML !== "") return;
      if (!playerPlaying || playerPlaying === playerOneMarker) {
        document.getElementById("currentTurn").innerHTML = p2Name;
        cell.innerHTML = playerOneMarker;
        playerPlaying = playerTwoMarker;
      } else if (playerPlaying === playerTwoMarker) {
        document.getElementById("currentTurn").innerHTML = p1Name;
        cell.innerHTML = playerTwoMarker;
        playerPlaying = playerOneMarker;
      }

      // winning detection- diagonal, row, columns, soonest placement should be announced as the winner
      document.querySelectorAll("[data-row][data-col]").forEach((cell) => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        board[r][c] = cell.innerHTML || null;
      });

      // win conditions
      board.forEach((row) => {
        // check matching rows
        const isRowEqual = new Set(row).size === 1 && row[0] != null;

        if (isRowEqual) {
          // the contents of board are strings and need to be parsed
          if (row[0].includes(`id="${p1Name}Marker"`)) {
            winner = true;
            p1Wins++;
            celebrate(p1Name);

            // change the html
            document.getElementById("p1wins").textContent = p1Wins;
          } else {
            winner = true;
            celebrate(p2Name);
            p2Wins++;
            document.getElementById("p2wins").textContent = p2Wins;
          }
        }
      });
      // check matching columns - extracting first elements of rows using map
      const FirstColumn = board.map((row) => row[0]);
      const isFirstColumnEqual =
        new Set(FirstColumn).size === 1 && FirstColumn[0] != null;
      if (isFirstColumnEqual) {
        if (FirstColumn[0].includes(`id="${p1Name}Marker"`)) {
          winner = true;
          celebrate(p1Name);
          p1Wins++;
          // change the html
          document.getElementById("p1wins").textContent = p1Wins;
        } else {
          winner = true;
          celebrate(p2Name);
          p2Wins++;
          document.getElementById("p2wins").textContent = p2Wins;
        }
      }

      // check matching columns - extracting third elements of rows using map
      const thirdColumn = board.map((row) => row[2]);
      const isThirdColumnEqual =
        new Set(thirdColumn).size === 1 && thirdColumn[0] != null;
      if (isThirdColumnEqual) {
        if (thirdColumn[0].includes(`id="${p1Name}Marker"`)) {
          winner = true;
          celebrate(p1Name);
          p1Wins++;
          // change the html
          document.getElementById("p1wins").textContent = p1Wins;
        } else {
          winner = true;
          celebrate(p2Name);
          p2Wins++;
          document.getElementById("p2wins").textContent = p2Wins;
        }
      }

      // check matching columns - extracting second elements of rows using map
      const secondColumn = board.map((row) => row[1]);
      const isSecondColumnEqual =
        new Set(secondColumn).size === 1 && secondColumn[0] != null;
      if (isSecondColumnEqual) {
        if (secondColumn[0].includes(`id="${p1Name}Marker"`)) {
          winner = true;
          celebrate(p1Name);
          p1Wins++;
          // change the html
          document.getElementById("p1wins").textContent = p1Wins;
        } else {
          winner = true;
          celebrate(p2Name);
          p2Wins++;
          document.getElementById("p2wins").textContent = p2Wins;
        }
      }

      // check diagonal condition
      if (
        board[0][0] === board[1][1] &&
        board[1][1] === board[2][2] &&
        board[0][0] != null
      ) {
        if (board[0][0].includes(`id="${p1Name}Marker"`)) {
          winner = true;
          celebrate(p1Name);
          p1Wins++;
          // change the html
          document.getElementById("p1wins").textContent = p1Wins;
        } else {
          winner = true;
          celebrate(p2Name);
          document.getElementById("my_modal_win").showModal();

          p2Wins++;
          document.getElementById("p2wins").textContent = p2Wins;
        }
      }
      if (
        board[0][2] === board[1][1] &&
        board[0][2] === board[2][0] &&
        board[0][2] != null
      ) {
        if (board[0][2].includes(`id="${p1Name}Marker"`)) {
          winner = true;
          celebrate(p1Name);
          p1Wins++;
          // change the html
          document.getElementById("p1wins").textContent = p1Wins;
        } else {
          winner = true;
          celebrate(p2Name);
          p2Wins++;
          document.getElementById("p2wins").textContent = p2Wins;
        }
      }
      // check draw
      //.every() is an array method that returns true if
      //all elements pass the condition, and false the moment any one fails
      const boardFull = board.every((row) =>
        row.every((cell) => cell !== null),
      );
      if (boardFull && !winner) {
        document.getElementById("my_modal_win").showModal();
        document.getElementById("messageTitle").innerHTML = "Draw!";
        draw = true;
      }
    });
  });
}

// add a new listener for new game
document.getElementById("newGame").addEventListener("click", () => {
  playerPlaying = undefined;
  board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  winner = false;
  draw = false;
  startGame();
});

function celebrate(name) {
  jsConfetti.addConfetti({
    emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
  });
  document.getElementById("my_modal_win").showModal();
  document.getElementById("messageTitle").innerHTML = `${name} Won! 🎉`;
}
