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

const jsConfetti = new JSConfetti();

let poke = undefined;
let pokeName = undefined;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

// fetch a random poke from the api
async function getRandomPokemon() {
  // generate a random int number between 1 to 1000
  const number = Math.floor(Math.random() * 1000) + 1;
  const pokeName = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${number}`,
  );
  poke = pokeName.data;
}

// generate the fields based on the poke names
function displayFields() {
  //display other rows accordingly
  const guessRows = document.querySelectorAll(".guess");
  pokeName = poke.name;
  // console.log(pokeName);
  let indexRow = 0;
  guessRows.forEach((row) => {
    row.innerHTML = "";
    let indexCol = 0;
    pokeName.split("").forEach((letter) => {
      const element = document.createElement("div");
      element.classList.add(
        "cell",
        "flex-1",
        "min-w-0",
        "min-h-0",
        "max-w-14",
        "aspect-square",
        "border-2",
        "border-base-300",
        "rounded-lg",
        "flex",
        "items-center",
        "justify-center",
        "text-sm",
        "sm:text-xl",
        "leading-none",
        "font-bold",
        "uppercase",
      );
      element.setAttribute("data-col", indexCol);
      element.setAttribute("data-row", indexRow);
      indexCol++;
      row.appendChild(element);
    });
    indexRow++;
  });
}
//display poke image
function pokeImage() {
  const pokeImage = poke.sprites.other["official-artwork"].front_default;
  const silhouette = document.getElementById("pokeSilhouette");
  silhouette.src = pokeImage;
  silhouette.classList.add("silhouette");
}

// hint generator
let hintsRevealed = 0;
async function revealHints() {
  const hintContainer = document.getElementById("hintsList");
  const noHintMessage = document.getElementById("noHintsMsg");

  if (hintsRevealed === 0) {
    let pokeTypes = [];
    const element = document.createElement("p");
    element.classList.add("italic", "text-xs");
    const type = poke.types.forEach((type) => {
      pokeTypes.push(type.type.name);
    });
    noHintMessage.classList.add("hidden");
    element.innerHTML = `<strong>Poke Types:</strong> ${pokeTypes}`;
    hintContainer.appendChild(element);
    hintsRevealed++;
    return;
  }

  if (hintsRevealed === 1) {
    const species = await axios.get(poke.species.url);
    const color = species.data.color.name;
    const element = document.createElement("p");
    element.classList.add("italic", "text-xs");
    element.innerHTML += `<strong>Poke Color:</strong> ${color}`;
    hintContainer.appendChild(element);
    hintsRevealed++;
    return;
  }
  if (hintsRevealed === 2) {
    const abilities = poke.abilities.map((u) => u.ability.name); // returns an array containing name of abilities
    const element = document.createElement("p");
    element.classList.add("italic", "text-xs");
    element.innerHTML += `<strong>Poke Abilities:</strong> ${abilities}`;
    hintContainer.appendChild(element);
    hintsRevealed++;
    return;
  }
  if (hintsRevealed === 3) {
    const element = document.createElement("p");
    element.classList.add("italic", "text-xs");
    element.innerHTML += `<strong>You've used up all your hints!</strong>`;
    hintContainer.appendChild(element);
    hintsRevealed++;
    return;
  }
  if (hintsRevealed === 4) return;
}

async function init() {
  await getRandomPokemon();
  displayFields();
  pokeImage();
  pokeSplit = pokeName.split("");
  remainingTarget = [...pokeSplit];
}
init();

// the game logic
let currentRow = 0;
let currentCol = 0;
let answer = [];
let pokeSplit = [];
let remainingTarget = [];
let gameOver = false;

function submitGuess() {
  // if the game is finished exit the loop after each keypress
  if (gameOver) return;
  let index = 0;
  if (currentRow < 6) {
    if (answer.length === pokeSplit.length) {
      while (index < pokeName.length) {
        if (
          pokeSplit.includes(answer[index]) &&
          pokeSplit[index] === answer[index]
        ) {
          document
            .querySelector(`[data-col="${index}"][data-row="${currentRow}"]`)
            .classList.add("bg-success");
          remainingTarget = remainingTarget.filter((u) => u !== answer[index]);

          index++;
        } else if (
          pokeSplit.includes(answer[index]) &&
          pokeSplit[index] !== answer[index] &&
          remainingTarget.includes(answer[index])
        ) {
          document
            .querySelector(`[data-col="${index}"][data-row="${currentRow}"]`)
            .classList.add("bg-warning");

          index++;
        } else {
          document
            .querySelector(`[data-col="${index}"][data-row="${currentRow}"]`)
            .classList.add("bg-base-300");
          index++;
        }
      }

      //win condition
      if (remainingTarget.length === 0) {
        gameOver = true;
        document.getElementById("pokeSilhouette").classList.remove("silhouette");
        document.getElementById("pokeReveal").src =
          poke.sprites.other["official-artwork"].front_default;
        jsConfetti.addConfetti();

        jsConfetti.addConfetti({
          emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
        });
        document.getElementById("messageTitle").innerHTML = "You Won!";
        document.getElementById("message").innerHTML =
          `It was <strong>${capitalize(pokeName)}</strong>! 🎉`;

        // set time out shows the modal after current loop is finished
        setTimeout(() => document.getElementById("my_modal_2").showModal(), 0);
      } else {
        currentCol = 0;
        answer = [];
        currentRow++;
      }
    } else {
      document
        .querySelector(`[data-row="${currentRow}"]`)
        .classList.add("shakeDiv");

      // remove the class from the div after the animation is finished for the next tries
      setTimeout(
        () =>
          document
            .querySelector(`[data-row="${currentRow}"]`)
            .classList.remove("shakeDiv"),
        500,
      );
    }
    //lose condition
    if (currentRow === 6 && remainingTarget.length !== 0) {
      gameOver = true;
      document.getElementById("pokeSilhouette").classList.remove("silhouette");
      document.getElementById("pokeReveal").src =
        poke.sprites.other["official-artwork"].front_default;
      document.getElementById("messageTitle").innerHTML = "You Lost!";
      document.getElementById("message").innerHTML =
        `The Pokémon was <strong>${capitalize(pokeName)}</strong>. Maybe next time?`;

      // set time out shows the modal after current loop is finished
      setTimeout(() => document.getElementById("my_modal_2").showModal(), 0);
    }
  }
  // clicking the submit button moves focus there - bring it back so typing
  // the next guess doesn't require tapping the grid again first
  document.getElementById("guessInput").focus();
}

// real text input instead of a bare keydown listener, so mobile's on-screen
// keyboard has something to actually attach to (see guessInput in the HTML)
const guessInput = document.getElementById("guessInput");

// auto-focus on load/new round for desktop (typing works immediately, same
// as before), and re-focus on tap for mobile (some mobile browsers refuse
// to open the keyboard without a user gesture, and focus can get lost
// after submitting a guess or tapping elsewhere on the page)
guessInput.focus();
document.getElementById("grid").addEventListener("touchend", () => {
  guessInput.focus();
});

// letters + backspace: driven by the "input" event (reliable on every
// platform, since it fires off the actual text-content change) rather than
// keydown, which some mobile keyboards skip entirely for backspace when
// going through predictive-text/IME composition
guessInput.addEventListener("input", (e) => {
  if (gameOver) return;
  if (e.inputType === "deleteContentBackward") {
    if (currentCol > 0) {
      currentCol--;
      document.querySelector(
        `[data-col="${currentCol}"][data-row="${currentRow}"]`,
      ).textContent = "";
      answer.pop();
    }
    // e.data is the actual character got inserted
  } else if (e.inputType === "insertText" && e.data) {
    document.querySelector(
      `[data-col="${currentCol}"][data-row="${currentRow}"]`,
    ).textContent = e.data;
    answer.push(e.data);
    if (currentCol < pokeName.length) {
      currentCol++;
    }
  }
  // keep the input empty - it's just a relay for keyboard events, the
  // actual guess lives in the grid cells/answer array
  guessInput.value = "";
});

// Enter doesn't change the input's text content, so it never fires
// "input" at all - keydown is the only event that sees it
guessInput.addEventListener("keydown", (e) => {
  if (gameOver) return;
  if (e.key === "Enter") {
    submitGuess();
  }
});

async function resetToDefault() {
  //clearing the hints container
  document.getElementById("hintsList").innerHTML =
    '<p id="noHintsMsg" class="text-base-content/50 italic text-xs">No hints revealed yet</p>';
  hintsRevealed = 0;
  currentRow = 0;
  currentCol = 0;
  answer = [];
  pokeSplit = [];
  remainingTarget = [];

  // gameOver stays true (it already is, from the finished game) until the
  // new pokemon has finished loading, so keydown/submitGuess can't read
  // pokeName while it's still being fetched
  await init();
  gameOver = false;
  document.getElementById("guessInput").focus();
}

document.getElementById("retryGame").addEventListener("click", resetToDefault);

document.getElementById("closeResult").addEventListener("click", () => {
  document.getElementById("my_modal_2").close();
});

document.getElementById("submitGuess").addEventListener("click", submitGuess);

// reveal hints
document.getElementById("revealHint").addEventListener("click", revealHints);
