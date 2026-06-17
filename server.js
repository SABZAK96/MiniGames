const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv/config"); // Automatically loads environment variables
const app = express();
const axios = require("axios");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const port = 5000;
//having socket and server on the same port - we create an http server
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
app.use(cors());

// setting up socket for online tictactoe game
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: `http://localhost:${port}`,
  },
});

let waitingRoom = null;
let roomNumber = undefined;
io.on("connection", (socket) => {
  console.log(`Client connected with id ${socket.id}`);

  socket.on("playerSelection", (data) => {
    // store this player's data on their own socket (not a shared/global variable)
    // so it can never leak into another room or a later game
    socket.player = { name: data.name, pokeImage: data.pokemonImage };

    if (data.roomType === "id") {
      if (io.sockets.adapter.rooms.get(data.roomId)) {
        socket.join(data.roomId);
        const room = io.sockets.adapter.rooms.get(data.roomId);
        if (room.size === 2) {
          // room is a Set of the two socket ids currently in this room
          const [firstId, secondId] = room;
          // look up each socket by id and read back the .player we stored above
          io.to(data.roomId).emit("joinRoom", {
            playerOne: io.sockets.sockets.get(firstId).player,
            playerTwo: io.sockets.sockets.get(secondId).player,
          });
        }
      } else {
        socket.emit("errorMessage", "Room ID does not exist!");
      }
    } else if (!waitingRoom) {
      roomNumber = Math.floor((Math.random() + 1) * 1000);
      socket.join(roomNumber);

      io.to(roomNumber).emit("roomID", {
        roomID: roomNumber,
        message: "Waiting for opponent...",
      });

      waitingRoom = roomNumber;
    } else {
      socket.join(roomNumber);
      const room = io.sockets.adapter.rooms.get(roomNumber);
      // same lookup as above: read player data straight off this room's two sockets
      const [firstId, secondId] = room;
      io.to(roomNumber).emit("joinRoom", {
        playerOne: io.sockets.sockets.get(firstId).player,
        playerTwo: io.sockets.sockets.get(secondId).player,
      });
      waitingRoom = null;
    }
  });

  socket.on("disconnect", () => {
    waitingRoom = null;
  });
});

server.listen(port, () => {
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
- A non-null cell contains a string showing whose marker is there:
  - If the string is equal to "AI" that is YOURS.
  - If it's "P1" that is your opponent's marker.
***HOW TO PLAY***
- Pick one cell that is null. NEVER pick an occupied cell.
- Play to win: take a winning move if you have one, otherwise block the user's winning move, otherwise prefer center, then corners.
***RESPONSE FORMAT***
- Respond with ONLY this JSON and nothing else (no markdown, no explanation):
{"row": <0-2>, "col": <0-2>}`;

  if (!board) {
    return res.status(400).json({ error: "No Prompt" });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [{ role: "user", parts: [{ text: JSON.stringify(board) }] }],
      config: {
        systemInstruction: systemRules,
      },
    });
    // converts that string into a real JavaScript object
    const { row, col } = JSON.parse(response.text);
    res.json({ row, col });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to respond" });
  }
});
