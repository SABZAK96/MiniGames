// get full poke objects from the api

let pokeObjects = undefined;
async function getPokes() {
  const pokes = await axios.get(
    "https://pokeapi.co/api/v2/pokemon/?limit=1000",
  );
  console.log(pokes.data.results);
  pokeObjects = pokes.data.results;
  return pokeObjects;
}

let playerMarker = undefined;
let selectedPoke = { name: undefined, image: undefined };

async function searchPoke() {
  const allPokes = await getPokes();
  document.getElementById("my_modal_4").showModal();

  // add an event listener for instant suggestions
  const input = document.getElementById("search");

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    const suggestionConatiner = document.getElementById("pokePreview");
    suggestionConatiner.innerHTML = "";
    if (query) {
      const matches = allPokes.filter((item) =>
        item.name.trim().toLowerCase().includes(query),
      );
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
          suggestionConatiner.appendChild(element);

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
              selectedPoke = { name: match.name, image: pokeImage };
            });
        });
      }
    }
  });

  // select listener registered once, outside forEach
  document.getElementById("select").addEventListener("click", () => {
    if (!selectedPoke.name) return;

    document.getElementById("pokeName").innerHTML = `${selectedPoke.name}!`;
    document.getElementById("pokePic").src = selectedPoke.image;
    document.getElementById("my_modal_5").showModal();
  });

  // start game after player confirms their marker
  document.getElementById("my_modal_5").addEventListener("close", () => {
    playerMarker = `<img src="${selectedPoke.image}" class="w-full h-full object-contain">`;
    startGame();
  });
}
searchPoke();

//let the game begins!
function startGame() {
  const allCells = document.querySelectorAll("[data-row][data-col]");
  allCells.forEach((cell) => {
    cell.addEventListener("click", () => {
      // to avoid overwriting a cell if it has a players marker on it
      if (cell.innerHTML !== "") return;
      cell.innerHTML = playerMarker;
    });
  });
}
