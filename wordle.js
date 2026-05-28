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
}
init();

// the game logic
let currentRow = 0;
let currentCol = 0;
let answer = [];
let pokeSplit = [];
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    let index = 0;
if(currentRow < 6){
        while (index < pokeName.length) {
      if (
        pokeSplit.includes(answer[index]) &&
        pokeSplit[index] === answer[index]
      ) {
        document
          .querySelector(`[data-col="${index}"][data-row="${currentRow}"]`)
          .classList.add("bg-success");
        index++;
      } else if (
        pokeSplit.includes(answer[index]) &&
        pokeSplit[index] !== answer[index]
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
    currentCol = 0;
    answer = [];
    currentRow++;
}
else {
    window.alert("no more tries!")
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
