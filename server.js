const express = require("express");
import { GoogleGenAI } from "@google/genai";
import "dotenv/config"; // Automatically loads environment variables
const app = express();
const axios = require("axios");
const ai = new GoogleGenAI();
port = 5000;
app.listen(port, () => {
  console.log("server's up!");
});

app.use(express.json());
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

app.post("/api/generate", async (req, res) => {
  const { board } = req.body;

  const systemRules = `You are playing tic-tac-toe against a user.
***BOARD FORMAT***
- Each turn you receive the full board as a 3x3 JSON array.
- null = empty cell.
- A non-null cell contains an HTML <img> string showing whose marker is there:
  - If the string contains id="aiMarker", that cell is YOURS.
  - Any other <img> string is the USER's marker.
***HOW TO PLAY***
- Pick one cell that is null. Never pick an occupied cell.
- Play to win: take a winning move if you have one, otherwise block the user's winning move, otherwise prefer center, then corners.
***RESPONSE FORMAT***
- Respond with ONLY this JSON and nothing else (no markdown, no explanation):
{"row": <0-2>, "col": <0-2>}`;

  if (!board) {
    return res.status(400).json({ error: "No Prompt" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: board,
      config: {
        systemInstruction: systemRules,
      },
    });

    // Send the text response back to the client
    res.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to respond" });
  }
});
