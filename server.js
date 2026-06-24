const express = require("express");
const { GoogleGenAI } = require("@google/genai");
require("dotenv/config"); // Automatically loads environment variables
const app = express();
const axios = require("axios");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const port = process.env.PORT || 5000;
//having socket and server on the same port - we create an http server
const http = require("http");
const server = http.createServer(app);
const cors = require("cors");
app.use(cors());

// setting up socket for online tictactoe game
const { Server } = require("socket.io");
const io = new Server(server);

let waitingRoom = null;
let roomNumber = undefined;
// who goes first, by name. Set once for round 1 by "start game" (a genuine
// race between both clients' "Let's Go" clicks), then flipped exactly once
// per rematch by "request decision" (no race there - only the accepting
// player emits it). "get first move" just reads this value, never writes it.
const firstPlayerByRoom = {};

// socket.rooms always contains this socket's own default room (named after
// its id) plus whatever room it joined - filter the default one out to get
// the actual game room, instead of relying on a shared roomNumber variable
// (which isn't necessarily this socket's room)
const getRoomId = (socket) => [...socket.rooms].find((id) => id !== socket.id);

function setPlayer(socket, data) {
  // store this player's data on their own socket (not a shared/global
  // variable) so it can never leak into another room or a later game
  socket.player = {
    name: data.name,
    pokeName: data.pokeName,
    pokeImage: data.pokemonImage,
  };
  socket.emit("playerSelected", socket.player);
}

function isPokeTaken(roomId, pokeName) {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room || room.size !== 1) return false;
  const [otherId] = room;
  const otherPlayer = io.sockets.sockets.get(otherId).player;
  return otherPlayer?.pokeName === pokeName;
}

function emitJoinRoomIfFull(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (room && room.size === 2) {
    // room is a Set of the two socket ids currently in this room
    const [firstId, secondId] = room;
    // look up each socket by id and read back the .player we stored above
    io.to(roomId).emit("joinRoom", {
      playerOne: io.sockets.sockets.get(firstId).player,
      playerTwo: io.sockets.sockets.get(secondId).player,
    });
  }
}

io.on("connection", (socket) => {
  console.log(`Client connected with id ${socket.id}`);
  socket.on("playerSelection", (data) => {
    if (data.roomType === "id") {
      // check size BEFORE joining, so a rejected socket never becomes a
      // member of the room in the first place (no leave/cleanup needed)
      const existingRoom = io.sockets.adapter.rooms.get(data.roomId);
      if (existingRoom && existingRoom.size >= 2) {
        socket.emit("errorMessage", "Room is full!");
        return;
      }
      // existingRoom, if present here, is the other player already waiting
      // in this room - check before this socket commits to the same pick
      if (
        existingRoom &&
        existingRoom.size === 1 &&
        isPokeTaken(data.roomId, data.pokeName)
      ) {
        socket.emit(
          "errorMessage",
          "That pokemon is already taken - pick another!",
        );
        return;
      }

      setPlayer(socket, data);

      // with this way we can created a room with specific id as well - along with joining an exiting one
      socket.join(data.roomId);
      emitJoinRoomIfFull(data.roomId);
    } else if (!waitingRoom) {
      setPlayer(socket, data);

      roomNumber = Math.floor((Math.random() + 1) * 1000);
      socket.join(roomNumber);

      io.to(roomNumber).emit("roomID", {
        roomID: roomNumber,
        message: "Waiting for opponent...",
      });

      waitingRoom = roomNumber;
    } else {
      // the socket already waiting in waitingRoom - check its pick before
      // this socket commits to the same one
      if (isPokeTaken(waitingRoom, data.pokeName)) {
        socket.emit(
          "errorMessage",
          "That pokemon is already taken - pick another!",
        );
        return;
      }

      setPlayer(socket, data);
      socket.join(roomNumber);
      // don't assume waitingRoom meant "exactly one other real player is
      // here" - verify it, same as the id-room branch does. Without this,
      // any stale/duplicate membership in this room would get silently
      // paired instead of caught.
      emitJoinRoomIfFull(roomNumber);
      waitingRoom = null;
    }
  });
  socket.on("request a rematch", (data) => {
    const roomId = getRoomId(socket);
    const room = io.sockets.adapter.rooms.get(roomId);
    const [first, second] = room;
    const firstSocket = io.sockets.sockets.get(first);
    const secondSocket = io.sockets.sockets.get(second);
    if (data.name === firstSocket.player.name) {
      const targetSocket = secondSocket;
      targetSocket.emit("rematch request", data.name);
      socket.emit("wait for response", "Waiting for opponent response...");
    } else {
      const targetSocket = firstSocket;
      targetSocket.emit("rematch request", data.name);
      socket.emit("wait for response", "Waiting for opponent response...");
    }
  });

  socket.on("request decision", (data) => {
    const roomId = getRoomId(socket);
    if (data === true) {
      // a rematch was just accepted - this only ever fires once per round
      // (onl
      // pting player emits it), so the alternation can't
      // race the way deciding round 1 does. Flip to whichever of the
      // room's two names isn't the one stored from last round.
      const room = io.sockets.adapter.rooms.get(roomId);
      const [firstId, secondId] = room;
      const firstName = io.sockets.sockets.get(firstId).player.name;
      const secondName = io.sockets.sockets.get(secondId).player.name;
      firstPlayerByRoom[roomId] =
        firstPlayerByRoom[roomId] === firstName ? secondName : firstName;
    }
    socket.to(roomId).emit("request result", data);
  });

  // round 1 only - each client emits this exactly once, ever, when they
  // close their own "Let's Go" modal. Whoever's call the server sees first
  // decides who goes first and broadcasts it to the room - both clients'
  // "first move" listeners are already registered by this point (module
  // scope, attached at page load), so the second call needs no reply.
  socket.on("start game", (data) => {
    const roomId = getRoomId(socket);
    if (firstPlayerByRoom[roomId] === undefined) {
      firstPlayerByRoom[roomId] = data.p1.name;
      io.to(roomId).emit("first move", data.p1);
    }
  });

  // round 2+ - both clients call this at the start of every rematch round.
  // The alternation already happened above in "request decision", so this
  // is a plain read: no deciding, safe to call any number of times.
  socket.on("get first move", (data) => {
    const roomId = getRoomId(socket);
    const firstMoverName = firstPlayerByRoom[roomId];
    const firstMover = data.p1.name === firstMoverName ? data.p1 : data.p2;
    socket.emit("first move", firstMover);
  });

  socket.on("move", (data) => {
    const roomId = getRoomId(socket);
    // data.playerPlaying, data.p1 and data.p2 are separate objects built
    // independently on the client, so === would compare them by identity
    // (always false) - compare by name instead, since that's a primitive value
    const currentPlayer =
      data.playerPlaying.name === data.p1.name ? data.p2 : data.p1;
    io.to(roomId).emit("announce move", {
      row: data.r,
      col: data.c,
      marker: data.playerPlaying.marker,
      currentPlayer: currentPlayer,
    });
  });
  socket.on("disconnecting", () => {
    // "disconnecting" fires before socket.io automatically removes this
    // socket from its rooms, so socket.rooms still has the real room id here
    // (by the time "disconnect" fires below, that cleanup already happened)
    const roomId = getRoomId(socket);
    if (roomId) {
      const room = io.sockets.adapter.rooms.get(roomId);
      // this socket itself is still counted here, so > 1 means someone
      // else is genuinely still in the room
      if (room && room.size > 1) {
        io.to(roomId).emit(
          "opponentLeft",
          "Your Opponent has left the room, Please try joining another room!",
        );
        // the match is over - make every other socket actually leave too,
        // otherwise they stay a permanent member of this room for the rest
        // of their connection (nothing else ever calls .leave()). A future
        // random room number landing on this same id would then silently
        // "pair" a brand-new player with this stale leftover member.
        // note: join() and leave() are independent - rematching just ADDS
        // a new room on top of this one, it doesn't replace it. without
        // this cleanup, the surviving player would end up a member of
        // every room from every match they've ever played in this session.
        room.forEach((memberId) => {
          // skip the disconnecting socket itself - socket.io removes it
          // from this room automatically right after this handler returns. this will also remove other person in the room
          if (memberId !== socket.id) {
            io.sockets.sockets.get(memberId)?.leave(roomId);
          }
        });
      }
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
