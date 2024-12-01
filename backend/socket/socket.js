import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const corsOpts = {
  origin: "*", // Replace "*" with frontend URL in production
  methods: ["GET", "POST"],
};

const server = http.createServer(app);
const io = new Server(server, { cors: corsOpts });

const players = {}; // Map of userID to socket ID
const games = {};   // Map of game ID to game state

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  const userID = socket.handshake.query.userID;
  if (userID !== "undefined") {
    players[userID] = socket.id;
  }

  // Emit setup confirmation
  socket.emit("connected");

  // Start a battle when two players are ready
  socket.on("setup", ({ address }) => {
    players[socket.id] = { address, health: 100, ready: true };
    checkForBattle();
  });

  // Handle player attack
  socket.on("playerAttack", ({ address }) => {
    const game = findGameByAddress(address);
    if (!game || game.currentTurn !== address) return;

    const opponent = getOpponent(game, address);
    game.players[opponent].health -= Math.floor(Math.random() * 20) + 10; // Random damage
    checkBattleStatus(game);

    game.currentTurn = opponent; // Switch turn
    io.to(game.id).emit("turnUpdate", {
      currentTurn: game.turn,
      playerTurn: game.currentTurn === address,
    });
    io.to(game.id).emit("healthUpdate", {
      playerHealth: game.players[address].health,
      opponentHealth: game.players[opponent].health,
    });
  });

  // Handle player defend
  socket.on("playerDefend", ({ address }) => {
    const game = findGameByAddress(address);
    if (!game || game.currentTurn !== address) return;

    const self = game.players[address];
    self.health += Math.min(10, 100 - self.health); // Heal a small amount
    game.currentTurn = getOpponent(game, address); // Switch turn

    io.to(game.id).emit("turnUpdate", {
      currentTurn: game.turn,
      playerTurn: game.currentTurn === address,
    });
    io.to(game.id).emit("healthUpdate", {
      playerHealth: self.health,
      opponentHealth: game.players[getOpponent(game, address)].health,
    });
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete players[socket.id];
    endBattle(socket.id);
  });
});

// Check for battle-ready players and start a game
function checkForBattle() {
  const readyPlayers = Object.entries(players).filter(
    ([, player]) => player.ready
  );

  if (readyPlayers.length >= 2) {
    const [player1, player2] = readyPlayers.slice(0, 2);
    const gameID = `${player1[0]}_${player2[0]}`;

    games[gameID] = {
      id: gameID,
      players: {
        [player1[0]]: { health: 100 },
        [player2[0]]: { health: 100 },
      },
      currentTurn: player1[0],
      turn: 1,
    };

    // Notify players of battle start
    io.to(player1[0]).to(player2[0]).emit("battleStart");

    io.to(player1[0]).emit("turnUpdate", {
      currentTurn: 1,
      playerTurn: true,
    });
    io.to(player2[0]).emit("turnUpdate", {
      currentTurn: 1,
      playerTurn: false,
    });
  }
}

// Find game by player address
function findGameByAddress(address) {
  return Object.values(games).find((game) =>
    Object.keys(game.players).includes(address)
  );
}

// Get the opponent's address
function getOpponent(game, address) {
  return Object.keys(game.players).find((key) => key !== address);
}

// Check the status of the battle and emit updates
function checkBattleStatus(game) {
  const [player1, player2] = Object.keys(game.players);
  const player1Health = game.players[player1].health;
  const player2Health = game.players[player2].health;

  if (player1Health <= 0 || player2Health <= 0) {
    const winner = player1Health > player2Health ? player1 : player2;

    io.to(game.id).emit("battleEnd", { winner });
    delete games[game.id];
  }
}

// End a battle if a player disconnects
function endBattle(socketID) {
  const game = Object.values(games).find((game) =>
    Object.keys(game.players).includes(socketID)
  );

  if (game) {
    io.to(game.id).emit("battleEnd", { winner: "Opponent disconnected" });
    delete games[game.id];
  }
}

export { app, io, server};
