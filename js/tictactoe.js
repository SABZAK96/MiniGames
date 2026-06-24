// socket connections for online mode
// no URL -> connects to whatever origin served this page, works in both
// local dev and production without needing to hardcode a host
const socket = io();

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

  // start game after player confirms their marker
  // kept inside searchPoke (re-attached every call, with {once:true}) on
  // purpose: local mode's flow is player1 confirms -> modal closes -> this
  // calls searchPoke() again for player2 -> they confirm -> modal closes a
  // second time, and THAT closure is what starts the game. Each round needs
  // its own one-shot listener since the close event means something
  // different depending on which player just confirmed.
  // safe from stacking (unlike the listeners moved out below) because
  // {once:true} removes this listener the moment it fires, BEFORE the
  // searchPoke() call inside it runs and attaches the next one - so there's
  // never a moment where two close-listeners exist on this dialog at once.
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

// everything below is registered exactly ONCE, for the whole session -
// searchPoke() itself runs every time mode-selection restarts (new game,
// rematch after an opponent leaves, etc.), so any listener attached inside
// it would get duplicated on every restart instead of just once. That bug
// is what caused a single "Confirm" click to fire two playerSelection
// emits from the same socket, which the server then mistook for two
// different players matching with each other ("matched with myself").
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
    document.getElementById("name").classList.add("border-1", "border-red-500");
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
    const aiPoke = (await axios.get(aiPokeOptions[randOption].url)).data.sprites
      .other["official-artwork"].front_default;
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

socket.on("opponentLeft", (data) => {
  document.getElementById("my_modal_win").showModal();
  document.getElementById("messageTitle").innerHTML = data;
  document.getElementById("findMatch").classList.remove("hidden");
});
socket.on("roomID", (data) => {
  document.getElementById("roomStatus").classList.remove("hidden");
  document.getElementById("roomStatus").textContent = data.message;
  document.getElementById("roomNumber").classList.remove("hidden");
  document.getElementById("roomNumber").textContent = data.roomID;
  document.getElementById("startGameOnline").disabled = true;
});
socket.on("joinRoom", (data) => {
  if (data.playerOne.pokeImage === document.getElementById("pokePicSelf").src) {
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
async function startGame() {
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
        syncBoard();
        if (checkWin()) return;
        playerPlaying = playerTwoMarker;
        if (selectedMode === "ai" && playerPlaying === playerTwoMarker) {
          // rounds that AI wouldnt go first
          await aiMove();
        } else {
          document.getElementById("currentTurn").innerHTML = p2Name;
        }
      } else if (
        selectedMode === "local" &&
        playerPlaying === playerTwoMarker
      ) {
        document.getElementById("currentTurn").innerHTML = p1Name;
        cell.innerHTML = playerTwoMarker;
        syncBoard();
        if (checkWin()) return;
        playerPlaying = playerOneMarker;
      }

      syncBoard();
      checkWin();
    });
  });

  // "New Round" can alternate who goes first, so a round can start with
  // playerPlaying already set to playerTwoMarker before anyone has clicked -
  // neither branch above runs in that case, since both only fire in
  // response to a click. Kicked the AI off directly here instead.
  if (selectedMode === "ai" && playerPlaying === playerTwoMarker) {
    await aiMove();
  }
}

async function aiMove() {
  locked = true;
  syncBoard();
  if (checkWin()) return;
  document.getElementById("currentTurn").innerHTML = "AI thinking...";
  await AiPlay();
  syncBoard();
  if (checkWin()) return;
  document.getElementById("currentTurn").innerHTML = p1Name;
}

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
  const response = await fetch("/api/generate", {
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

// round 1 only emits "start game" (the server races both clients' calls to
// decide who goes first); every round after that emits "get first move"
// instead, since by then the server already decided via the rematch
// accept/decision flow and this is just a read
let firstRound = true;
function startGameOnline() {
  let p1 = { name: p1Name, marker: playerOneMarker };
  let p2 = { name: p2Name, marker: playerTwoMarker };
  if (firstRound) {
    socket.emit("start game", { p1, p2 });
    firstRound = false;
  } else {
    socket.emit("get first move", { p1, p2 });
  }
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
}
socket.on("first move", (data) => {
  playerPlaying = { marker: data.marker, name: data.name };
  document.getElementById("currentTurn").innerHTML = playerPlaying.name;
});
// registered once at load - startGameOnline() runs again on every rematch
// round, so an "announce move" listener attached inside it would stack: by
// round N there'd be N copies all reacting to the same move, each re-running
// checkWin() and re-incrementing the win count / re-firing confetti
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

function resetToNewRound() {
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
}
function resetToModeSelect() {
  playerPlaying = undefined;
  resetToNewRound();
  playerOneMarker = undefined;
  playerTwoMarker = undefined;
  p1Name = undefined;
  p2Name = undefined;
  firstRound = true;
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

  // clear the leftover highlight from whichever mode/room was picked last
  // round - selectedMode/selectedRoom are reset above, but nothing else
  // un-highlights the cards, so they'd still *look* selected otherwise
  selectedRoom = undefined;
  document
    .querySelectorAll(".mode")
    .forEach((mode) => mode.classList.remove("bg-primary", "text-white"));
  document.getElementById("onlineRooms").classList.add("hidden");
  document
    .getElementById("joinRandom")
    .classList.remove("bg-primary", "text-white");
  document
    .getElementById("joinID")
    .classList.remove("bg-primary", "text-white");
  document.getElementById("roomID").classList.add("hidden");

  // OpponentName/pokePicOpponent are only ever set inside the "joinRoom"
  // handler - nothing else clears them, so without this they'd keep
  // showing the previous match's opponent until (or unless) a genuinely
  // new "joinRoom" event arrives, making a fresh wait screen look like an
  // instant rematch with whoever just left
  document.getElementById("OpponentName").textContent = "";
  document.getElementById("pokePicOpponent").src = "./images/qm1.png";

  searchPoke();
}

// listener for new game
// add a new listener for new game - should reset everything and go back to poke selection
document.getElementById("newGame").addEventListener("click", resetToModeSelect);

// add a new listener for new game
document.getElementById("newRound").addEventListener("click", () => {
  if (selectedMode === "local" || selectedMode === "ai") {
    resetToNewRound();
    playerPlaying =
      firstPlayer === playerOneMarker ? playerTwoMarker : playerOneMarker;
    firstPlayer =
      firstPlayer === playerOneMarker ? playerTwoMarker : playerOneMarker;

    startGame();
  } else {
    // reset is deferred until the rematch is actually accepted (see
    // "accept" and "request result" below) - resetting here would clear
    // this player's board even if the opponent ends up rejecting
    socket.emit("request a rematch", { name: p1Name, marker: playerOneMarker });
  }
});

// registered once at load - the recipient of a rematch request never
// clicks "newRound" themselves, so these can't live inside that handler
socket.on("rematch request", (data) => {
  document.getElementById("my_modal_rematch").showModal();
  document.getElementById("requester").innerHTML =
    data + " wants to do another round with you! What are you going to do?";
});
socket.on("wait for response", (data) => {
  document.getElementById("my_modal_waiting").showModal();
  document.getElementById("waitMessage").innerHTML = data;
});
let accept = null;
document.getElementById("accept").addEventListener("click", () => {
  accept = true;
  socket.emit("request decision", accept);
  accept = null;
  document.getElementById("my_modal_rematch").close();
  resetToNewRound();
  startGameOnline();
});
document.getElementById("reject").addEventListener("click", () => {
  accept = false;
  socket.emit("request decision", accept);
  accept = null;
  document.getElementById("my_modal_rematch").close();
});

socket.on("request result", (data) => {
  if (data === true) {
    document.getElementById("waitMessage").innerHTML =
      "Your request has been accepted!";
    setTimeout(() => {
      document.getElementById("my_modal_waiting").close();
    }, 2000);
    resetToNewRound();
    startGameOnline();
  } else {
    document.getElementById("waitMessage").innerHTML =
      "Your request has been rejected!";
    setTimeout(() => {
      document.getElementById("my_modal_waiting").close();
    }, 2000);
  }
});

// registered once - "opponentLeft" can fire multiple times per session
// (rematch after rematch), so these must not be re-added on every occurrence
document.getElementById("findMatch").addEventListener("click", () => {
  document.getElementById("my_modal_win").close();
  resetToModeSelect();
});
document.getElementById("my_modal_win").addEventListener("close", () => {
  document.getElementById("findMatch").classList.add("hidden");
});
