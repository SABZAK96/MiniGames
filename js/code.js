let pikachuImage = undefined;
let dittoImage = undefined;

function fillCells(selector, imageSrc) {
  document.querySelectorAll(selector).forEach((cell) => {
    let element = document.createElement("img");
    element.classList.add(
      "absolute",
      "inset-0",
      "object-contain",
      "poke",
    );
    element.src = imageSrc;
    cell.appendChild(element);
  });
}

async function getPoke() {
  // have all the results ready first then fill out the cells
  const [pikachuResult, dittoResult] = await Promise.all([
    axios.get("https://pokeapi.co/api/v2/pokemon/pikachu"),
    axios.get("https://pokeapi.co/api/v2/pokemon/ditto"),
  ]);
  const pikachuImage =
    pikachuResult.data.sprites.other["official-artwork"].front_default;
  const dittoImage =
    dittoResult.data.sprites.other["official-artwork"].front_default;
  fillCells(".pikachu", pikachuImage);
  fillCells(".ditto", dittoImage);

  // only the memory-game faces should start rotated away (waiting to be
  // flipped into view) - the tic-tac-toe images should stay plainly visible
  document.querySelectorAll("#pokeContainer .poke").forEach((img) => {
    img.classList.remove("w-13", "h-13", "md:w-17", "md:h-17", "object-contain");
    img.classList.add("absolute", "inset-0", "object-cover", "back");
  });
}

getPoke();
