// socket connections for online mode
const socket = io("http://localhost:5000");

// toggle daiseyUI theme component and add it to localstorage
const theme = document.querySelector(".theme-controller");
const element = document.getElementById("page");

// get preferences from local storage, if there's nothing there, use light
const savePreference = localStorage.getItem("themePreference") || "light";
element.setAttribute("data-theme", savePreference);

// save visual toggle upon reload as well
if (savePreference === "dark") {
  theme.checked = true;
} else {
  theme.checked = false;
}

// change the preference on toggle
theme.addEventListener("change", () => {
  if (theme.checked) {
    const newPreference = "dark";
    element.setAttribute("data-theme", newPreference);
    localStorage.setItem("themePreference", newPreference);
  } else {
    const newPreference = "light";
    element.setAttribute("data-theme", newPreference);
    localStorage.setItem("themePreference", newPreference);
  }
});

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
let pokeTaken = undefined;
let p1Wins = Number(document.getElementById("p1wins").textContent);
let p2Wins = Number(document.getElementById("p2wins").textContent);
let selectedPoke = { name: undefined, image: undefined };
let playerName = undefined;
let selectedMode = undefined;
let selectedRoom = undefined;

async function searchPoke() {
  await getPokes();
  // reset values because selectedPokes, search, pokePreview should be used for both players
  selectedPoke = { name: undefined, image: undefined };
  document.getElementById("name").value = "";
  document.getElementById("search").value = "";
  document.getElementById("pokePreview").innerHTML = "";
  document.getElementById("my_modal_4").showModal();
  playerName = document.getElementById("name");
  const modes = document.querySelectorAll(".mode");
  modes.forEach((mode) => {
    mode.addEventListener("click", () => {
      modes.forEach((mode) => {
        mode.classList.contains("bg-primary", "text-white") &&
          mode.classList.remove("bg-primary", "text-white");
      });
      mode.classList.add("bg-primary", "text-white");
      if (mode.id === "online") {
        document.getElementById("onlineRooms").classList.remove("hidden");
      } else {
        document.getElementById("onlineRooms").classList.add("hidden");
      }

      selectedMode = mode.id;
      console.log(selectedMode);
    });
  });
  // handling rooms for online play
  document.getElementById("joinRandom").addEventListener("click", () => {
    document
      .getElementById("joinRandom")
      .classList.add("bg-primary", "text-white");
    document
      .getElementById("joinID")
      .classList.remove("bg-primary", "text-white");
    document.getElementById("roomID").classList.add("hidden");
    selectedRoom = "random";
  });

  document.getElementById("joinID").addEventListener("click", () => {
    document.getElementById("joinID").classList.add("bg-primary", "text-white");
    document
      .getElementById("joinRandom")
      .classList.remove("bg-primary", "text-white");
    document.getElementById("roomID").classList.remove("hidden");
    selectedRoom = "id";
  });

  // select listener registered once, outside forEach
  document.getElementById("select").addEventListener("click", async () => {
    if (!selectedMode) {
      document.getElementById("chooseMode").classList.add("text-red-500");
      return;
    }
    if (!selectedPoke.name) {
      document
        .getElementById("search")
        .classList.add("border-1", "border-red-500");
      return;
    }
    if (!playerName.value.trim()) {
      document
        .getElementById("name")
        .classList.add("border-1", "border-red-500");
      return;
    }

    document.getElementById("pokeName").innerHTML = `${selectedPoke.name}!`;
    document.getElementById("pokePic").src = selectedPoke.image;
    document.getElementById("my_modal_4").close();
    // using && for short circuiting cause turnary needs an else block
    document.getElementById("name").classList.contains("border-red-500") &&
      document.getElementById("name").classList.remove("border-red-500");
    document.getElementById("search").classList.contains("border-red-500") &&
      document.getElementById("search").classList.remove("border-red-500");
    document.getElementById("chooseMode").classList.contains("text-red-500") &&
      document.getElementById("chooseMode").classList.remove("text-red-500");
    if (selectedMode === "local") {
      document.getElementById("my_modal_5").showModal();
      document.getElementById("modeBox").classList.add("hidden");
    }
    if (selectedMode === "ai") {
      p1Name = playerName.value;
      document.getElementById("p1Name").textContent = p1Name;
      pokeTaken = selectedPoke.name;
      document.getElementById("my_modal_ai").showModal();
      document.getElementById("pokeNameAi").textContent = pokeTaken + "!";
      document.getElementById("pokePicAi").src = selectedPoke.image;
      p2Name = "AI";
      document.getElementById("p2Name").textContent = p2Name;
      playerOneMarker = `<img id="${p1Name}Marker" src="${selectedPoke.image}" class="w-full h-full object-contain">`;
      const aiPokeOptions = pokeObjects.filter(
        (poke) => poke.name !== selectedPoke.name,
      );
      const randOption = Math.floor(Math.random() * 200 + 1);
      const aiPoke = (await axios.get(aiPokeOptions[randOption].url)).data
        .sprites.other["official-artwork"].front_default;
      playerTwoMarker = `<img id="${p2Name}Marker" src="${aiPoke}" class="w-full h-full object-contain">`;
      document.getElementById("my_modal_ai").addEventListener(
        "close",
        () => {
          firstPlayer = playerOneMarker;
          playerPlaying = playerOneMarker;
          startGame();
        },
        { once: true },
      );
    }
    if (selectedMode === "online") {
      const playerInfo = {
        name: playerName.value,
        pokeName: selectedPoke.name,
        pokemonImage: selectedPoke.image,
        roomType: selectedRoom,
        roomId:
          selectedRoom === "id"
            ? Number(document.getElementById("roomID").value)
            : null,
      };
      document.getElementById("onlineError").classList.add("hidden");
      socket.emit("playerSelection", playerInfo);

      socket.once("playerSelected", (data) => {
        document.getElementById("my_modal_6").showModal();
        document.getElementById("pokeNameSelf").innerHTML = data.pokeName;
        document.getElementById("pokePicSelf").src = data.pokeImage;
      });
    }
  });
  socket.on("errorMessage", (message) => {
    // rejected before joining a room, so my_modal_6 was never opened -
    // reopen the picker and show why instead of leaving the player stuck
    document.getElementById("onlineError").textContent = message;
    document.getElementById("onlineError").classList.remove("hidden");
    document.getElementById("my_modal_4").showModal();
  });
  socket.on("roomID", (data) => {
    document.getElementById("roomStatus").classList.remove("hidden");
    document.getElementById("roomStatus").textContent = data.message;
    document.getElementById("roomNumber").classList.remove("hidden");
    document.getElementById("roomNumber").textContent = data.roomID;
    document.getElementById("startGameOnline").disabled = true;
  });
  socket.on("joinRoom", (data) => {
    if (
      data.playerOne.pokeImage === document.getElementById("pokePicSelf").src
    ) {
      p1Name = data.playerOne.name;
      p2Name = data.playerTwo.name;
      playerOneMarker = `<img id="${p1Name}Marker" src="${data.playerOne.pokeImage}" class="w-full h-full object-contain">`;
      document.getElementById("OpponentName").textContent = data.playerTwo.name;
      document.getElementById("pokePicOpponent").src = data.playerTwo.pokeImage;
      playerTwoMarker = `<img id="${p2Name}Marker" src="${data.playerTwo.pokeImage}" class="w-full h-full object-contain">`;
    } else {
      p1Name = data.playerTwo.name;
      p2Name = data.playerOne.name;
      playerTwoMarker = `<img id="${p2Name}Marker" src="${data.playerOne.pokeImage}" class="w-full h-full object-contain">`;
      document.getElementById("OpponentName").textContent =
        data.playerOne.name + "!";
      document.getElementById("pokePicOpponent").src = data.playerOne.pokeImage;
      playerOneMarker = `<img id="${p1Name}Marker" src="${data.playerTwo.pokeImage}" class="w-full h-full object-contain">`;
    }

    document.getElementById("roomStatus").classList.add("hidden");
    document.getElementById("startGameOnline").disabled = false;
  });

  // showing the names after closing the modal in online mode
  document.getElementById("my_modal_6").addEventListener("close", () => {
    if (p1Name && p2Name) {
      document.getElementById("p1Name").textContent = p1Name;
      document.getElementById("p2Name").textContent = p2Name;
      startGameOnline();
    }
  });

  // start game after player confirms their marker
  document.getElementById("my_modal_5").addEventListener(
    "close",
    () => {
      if (!playerOneMarker) {
        p1Name = playerName.value;
        document.getElementById("p1Name").textContent = p1Name;
        pokeTaken = selectedPoke.name;
        playerOneMarker = `<img id="${p1Name}Marker" src="${selectedPoke.image}" class="w-full h-full object-contain">`;

        // call search poke again for the next opponent
        searchPoke();
      } else {
        p2Name = playerName.value;
        document.getElementById("p2Name").textContent = p2Name;
        playerTwoMarker = `<img id="${p2Name}Marker" src="${selectedPoke.image}" class="w-full h-full object-contain">`;

        //start the game after player 2 chooses their marker
        firstPlayer = playerOneMarker;
        playerPlaying = playerOneMarker;
        startGame();
      }
    },
    { once: true },
  );
}

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  const suggestionConatiner = document.getElementById("pokePreview");
  suggestionConatiner.innerHTML = "";
  if (query && pokeObjects) {
    const matches = pokeObjects
      .filter(
        (item) =>
          item.name !== pokeTaken && // not display the taken name to player 2
          item.name.trim().toLowerCase().startsWith(query),
      )
      .slice(0, 8);
    if (matches.length !== 0) {
      matches.forEach(async (match) => {
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
        if (!suggestionConatiner.innerHTML.includes(`id="${match.name}img"`)) {
          suggestionConatiner.appendChild(element);
        }
        document
          .getElementById(`${match.name}`)
          .addEventListener("click", () => {
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
let locked = false;
let firstPlayer = undefined;
function startGame() {
  document.getElementById("currentTurn").innerHTML =
    firstPlayer === playerOneMarker ? p1Name : p2Name;

  const allCells = document.querySelectorAll("[data-row][data-col]");
  allCells.forEach((cell) => {
    cell.innerHTML = "";
    cell.addEventListener("click", async () => {
      if (locked) return;
      // the following line should be moved to top so that the second player can't overwrite
      // the first player marker
      if (winner) return;
      if (draw) return;
      if (cell.innerHTML !== "") return;
      if (!playerPlaying || playerPlaying === playerOneMarker) {
        cell.innerHTML = playerOneMarker;
        playerPlaying = playerTwoMarker;
        if (selectedMode === "ai") {
          locked = true;
          syncBoard();
          if (checkWin()) return;
          document.getElementById("currentTurn").innerHTML = "AI thinking...";
          await AiPlay();
          document.getElementById("currentTurn").innerHTML = p1Name;
        } else {
          document.getElementById("currentTurn").innerHTML = p2Name;
        }
      } else if (playerPlaying === playerTwoMarker) {
        document.getElementById("currentTurn").innerHTML = p1Name;
        cell.innerHTML = playerTwoMarker;
        playerPlaying = playerOneMarker;
      }

      syncBoard();
      checkWin();
    });
  });
}

// add a new listener for new game
document.getElementById("newRound").addEventListener("click", () => {
  board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  winner = false;
  draw = false;
  locked = false;
  document.querySelectorAll("[data-row][data-col]").forEach((cell) => {
    const cellColored =
      cell.classList.contains("bg-green-100") &&
      cell.classList.remove("bg-green-100");
  });
  if (selectedMode === "local" || selectedMode === "ai") {
    playerPlaying =
      firstPlayer === playerOneMarker ? playerTwoMarker : playerOneMarker;
    firstPlayer =
      firstPlayer === playerOneMarker ? playerTwoMarker : playerOneMarker;

    startGame();
  } else {
    startGameOnline();
  }
});

// listener for new game
// add a new listener for new game - should reset everything and go back to poke selection
document.getElementById("newGame").addEventListener("click", () => {
  playerPlaying = undefined;
  board = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  winner = false;
  draw = false;
  locked = false;
  document.querySelectorAll("[data-row][data-col]").forEach((cell) => {
    const cellColored =
      cell.classList.contains("bg-green-100") &&
      cell.classList.remove("bg-green-100");
  });
  playerOneMarker = undefined;
  playerTwoMarker = undefined;
  p1Name = undefined;
  p2Name = undefined;
  pokeTaken = undefined;
  selectedMode = undefined;
  p1Wins = 0;
  p2Wins = 0;
  document.getElementById("p1wins").textContent = 0;
  document.getElementById("p2wins").textContent = 0;
  document.getElementById("p1Name").textContent = "";
  document.getElementById("p2Name").textContent = "";
  document.getElementById("currentTurn").innerHTML = "";
  document.getElementById("modeBox").classList.remove("hidden");
  searchPoke();
});

function celebrate(name) {
  document.getElementById("my_modal_win").showModal();
  setTimeout(() => {
    jsConfetti.addConfetti({
      emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
      confettiNumber: 50,
    });
  }, 300);
  document.getElementById("messageTitle").innerHTML = `${name} Won! 🎉`;
}

async function AiPlay() {
  // send the simplified board to gemini since its still overwrites the cells
  const simplifiedBoard = board.map((row) =>
    row.map((cell) => {
      if (cell === null) return null;
      if (cell.includes('id="AIMarker"')) return "AI";
      return "P1";
    }),
  );
  const response = await fetch("http://localhost:5000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board: simplifiedBoard }),
  });
  if (!response.ok) {
    throw new Error("Server error");
  }

  const { row, col } = await response.json();
  const aiCell = document.querySelector(
    `[data-row="${row}"][data-col="${col}"]`,
  );
  aiCell.innerHTML = playerTwoMarker;
  playerPlaying = playerOneMarker;
  locked = false;
}

function syncBoard() {
  document.querySelectorAll("[data-row][data-col]").forEach((cell) => {
    const r = cell.dataset.row;
    const c = cell.dataset.col;
    board[r][c] = cell.innerHTML || null;
  });
}
function checkWin() {
  board.forEach((row) => {
    if (winner) return;
    // check matching rows
    const isRowEqual = new Set(row).size === 1 && row[0] != null;

    if (isRowEqual) {
      // extract index of matched row
      const matchedRowIndex = board.indexOf(row);
      const allMatchedCells = document.querySelectorAll(
        `[data-row="${matchedRowIndex}"]`,
      );
      allMatchedCells.forEach((cell) => {
        cell.classList.add("bg-green-100");
      });
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
  if (winner) return true;
  // check matching columns - extracting first elements of rows using map
  const FirstColumn = board.map((row) => row[0]);
  const isFirstColumnEqual =
    new Set(FirstColumn).size === 1 && FirstColumn[0] != null;
  if (isFirstColumnEqual) {
    const FirstColumnCells = document.querySelectorAll('[data-col="0"]');
    FirstColumnCells.forEach((cell) => {
      cell.classList.add("bg-green-100");
    });
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
    const thirdColumnCells = document.querySelectorAll('[data-col="2"]');
    thirdColumnCells.forEach((cell) => {
      cell.classList.add("bg-green-100");
    });
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
    const secondColumnCells = document.querySelectorAll('[data-col="1"]');
    secondColumnCells.forEach((cell) => {
      cell.classList.add("bg-green-100");
    });
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
    document
      .querySelector("[data-row='0'][data-col='0']")
      .classList.add("bg-green-100");
    document
      .querySelector("[data-row='1'][data-col='1']")
      .classList.add("bg-green-100");
    document
      .querySelector("[data-row='2'][data-col='2']")
      .classList.add("bg-green-100");
    if (board[0][0].includes(`id="${p1Name}Marker"`)) {
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
  if (
    board[0][2] === board[1][1] &&
    board[0][2] === board[2][0] &&
    board[0][2] != null
  ) {
    document
      .querySelector("[data-row='0'][data-col='2']")
      .classList.add("bg-green-100");
    document
      .querySelector("[data-row='1'][data-col='1']")
      .classList.add("bg-green-100");
    document
      .querySelector("[data-row='2'][data-col='0']")
      .classList.add("bg-green-100");
    if (board[0][2].includes(`id="${p1Name}Marker"`)) {
      winner = true;
      celebrate(p1Name);
      p1Wins++;
      document.getElementById("p1wins").textContent = p1Wins;
    } else {
      winner = true;
      celebrate(p2Name);
      p2Wins++;
      document.getElementById("p2wins").textContent = p2Wins;
    }
  }

  if (winner) return true;

  const boardFull = board.every((row) => row.every((cell) => cell !== null));
  if (boardFull) {
    document.getElementById("my_modal_win").showModal();
    document.getElementById("messageTitle").innerHTML = "Draw!";
    draw = true;
    return true;
  }

  return false;
}
function startGameOnline() {
  let p1 = { name: p1Name, marker: playerOneMarker };
  let p2 = { name: p2Name, marker: playerTwoMarker };
  socket.emit("start game", { p1, p2 });
  socket.on("first move", (data) => {
    playerPlaying = { marker: data.marker, name: data.name };
    document.getElementById("currentTurn").innerHTML = playerPlaying.name;
  });

  const allCells = document.querySelectorAll("[data-row][data-col]");
  allCells.forEach((cell) => {
    cell.innerHTML = "";
    cell.addEventListener("click", async () => {
      if (locked) return; // lock the board until the announce move arrives
      if (winner) return;
      if (draw) return;
      if (cell.innerHTML !== "") return;
      // p1Name is always "myself" (set in joinRoom); playerPlaying.name is the
      // shared "whose turn is it" value broadcast by the server - if they don't
      // match, it's not my turn yet (or "first move" hasn't arrived yet)
      //(data.playerOne.pokeImage === document.getElementById("pokePicSelf").src). It's a "who am I" value
      if (!playerPlaying || playerPlaying.name !== p1Name) return;

      let r = cell.dataset.row;
      let c = cell.dataset.col;
      cell.innerHTML = playerPlaying.marker;
      locked = true;
      socket.emit("move", { r, c, playerPlaying, p1, p2 });
      syncBoard();
      checkWin();
    });
  });
  socket.on("announce move", (data) => {
    document.querySelector(
      `[data-row="${data.row}"][data-col="${data.col}"]`,
    ).innerHTML = data.marker;
    playerPlaying = data.currentPlayer;
    document.getElementById("currentTurn").innerHTML = data.currentPlayer.name;
    syncBoard();
    checkWin();
    locked = false;
  });
}
