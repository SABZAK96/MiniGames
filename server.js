const express = require("express");
const app = express();
const axios = require("axios");
port = 5000;
app.listen(port, () => {
  console.log("server's up!");
});

// app.get("/count", async (req, res) => {
//   try {
//     const result = await axios.get("https://pokeapi.co/api/v2/pokemon");
//     const pokeMax = result.data.count;
//     res.json(pokeMax);
//   } catch (error) {
//     res.json({ message: error });
//   }
// });

// app.use(express.json());
app.use(express.static(__dirname));
app.get("/easy", async (req, res) => {
  try {
    //easy mode should give us 3 unique pokes, we use set
    const pokeIDs = new Set();
    let number = 0;
    while (pokeIDs.size < 3) {
      //generate random numbers between 1 and length of the poke response
      // axios parses json automatically (unlike fetch) and store the usable result in data property
      number = Math.floor(Math.random() * 1000) + 1;
      pokeIDs.add(number);
    }
    const pokeIds = [...pokeIDs];
    const PokeData = await Promise.all(
      pokeIds.map(async (number) => {
        const poke = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${number}`,
        );
        return poke.data;
      }),
    );
    const imgs = PokeData.map((data) => {
      return data.sprites.other["official-artwork"].front_default;
    });
    res.json(imgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/medium", async (req, res) => {
  try {
    //medium mode should give us 6 unique pokes, we use set
    const pokeIDs = new Set();
    let number = 0;
    while (pokeIDs.size < 6) {
      //generate random numbers between 1 and length of the poke response
      // axios parses json automatically (unlike fetch) and store the usable result in data property
      number = Math.floor(Math.random() * 1000) + 1;
      pokeIDs.add(number);
    }
    const pokeIds = [...pokeIDs];
    const PokeData = await Promise.all(
      pokeIds.map(async (number) => {
        const poke = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${number}`,
        );
        return poke.data;
      }),
    );
    const imgs = PokeData.map((data) => {
      return data.sprites.other["official-artwork"].front_default;
    });
    res.json(imgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/hard", async (req, res) => {
  try {
    //hard mode should give us 12 unique pokes, we use set
    const pokeIDs = new Set();
    let number = 0;
    while (pokeIDs.size < 12) {
      //generate random numbers between 1 and length of the poke response
      // axios parses json automatically (unlike fetch) and store the usable result in data property
      number = Math.floor(Math.random() * 1000) + 1;
      pokeIDs.add(number);
    }
    const pokeIds = [...pokeIDs];
    const PokeData = await Promise.all(
      pokeIds.map(async (number) => {
        const poke = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${number}`,
        );
        return poke.data;
      }),
    );
    const imgs = PokeData.map((data) => {
      return data.sprites.other["official-artwork"].front_default;
    });
    res.json(imgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
