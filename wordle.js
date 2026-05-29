const jsConfetti = new JSConfetti();

let poke = undefined;
let pokeName = undefined;
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
  console.log(pokeName);
  let indexRow = 0;
  guessRows.forEach((row) => {
    row.innerHTML = "";
    let indexCol = 0;
    pokeName.split("").forEach((letter) => {
      const element = document.createElement("div");
      element.classList.add(
        "cell",
        "w-14",
        "h-14",
        "border-2",
        "border-base-300",
        "rounded-lg",
        "flex",
        "items-center",
        "justify-center",
        "text-2xl",
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
  document.getElementById("pokeSilhouette").src = pokeImage;
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
document.addEventListener("keydown", (e) => {
  // if the game is finished exit the loop after each keypress
  if (gameOver) return;
  if (e.key === "Enter") {
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
            remainingTarget = remainingTarget.filter(
              (u) => u !== answer[index],
            );

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
          document.getElementById("pokeSilhouette").removeAttribute("style");
          jsConfetti.addConfetti();

          jsConfetti.addConfetti({
            emojis: ["🌈", "🎉", "💥", "✨", "🎊"],
          });
          document.getElementById("messageTitle").innerHTML = "You Won!";
          document.getElementById("message").innerHTML =
            "You Guessed it Right! 🎉";

          // set time out shows the modal after current loop is finished
          setTimeout(
            () => document.getElementById("my_modal_2").showModal(),
            0,
          );
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
        document.getElementById("pokeSilhouette").removeAttribute("style");
        document.getElementById("messageTitle").innerHTML = "You Lost!";
        document.getElementById("message").innerHTML = "Maybe next time?";

        // set time out shows the modal after current loop is finished
        setTimeout(() => document.getElementById("my_modal_2").showModal(), 0);
      }
    }
  } else if (e.key === "Backspace") {
    if (currentCol > 0) {
      currentCol--;
      document.querySelector(
        `[data-col="${currentCol}"][data-row="${currentRow}"]`,
      ).textContent = "";
      answer.pop();
    }
  } else if (e.key.length === 1) {
    document.querySelector(
      `[data-col="${currentCol}"][data-row="${currentRow}"]`,
    ).textContent = e.key;
    answer.push(e.key);
    if (currentCol < pokeName.length) {
      currentCol++;
    }
  }
});
