// get full poke objects from the api

let pokeObjects = undefined;
async function getPokes() {
  const pokes = await axios.get("https://pokeapi.co/api/v2/pokemon/?limit=1000");
  console.log(pokes.data.results);
  pokeObjects = pokes.data.results;
  return pokeObjects;
}

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
        matches.forEach((match) => {
          const element = document.createElement("p");
          element.innerHTML = `${match.name}`;
          suggestionConatiner.appendChild(element);
        });
      }
    }
  });
}
searchPoke();
