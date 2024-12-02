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

// Improved type definitions

const players = {};
const games = {};

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // Emit setup confirmation
  socket.emit("connected");

  // Start a battle when two players are ready
  socket.on("setup", ({ address }) => {
    // More robust player registration
    players[address] = { 
      address, 
      socketId: socket.id, 
      health: 100, 
      ready: true 
    };
    
    socket.join(address);
    checkForBattle();
  });

  // Player ready for battle
  socket.on("readyForBattle", ({ address }) => {
    const game = findGameByAddress(address);
    if (game) {
      // Send turn update
      io.to(address).emit("turnUpdate", {
        currentTurn: game.turn,
        playerTurn: game.currentTurn,
        playerHealth: address === game.players.player1.address 
          ? game.players.player1.health 
          : game.players.player2.health,
        opponentHealth: address === game.players.player1.address 
          ? game.players.player2.health 
          : game.players.player1.health
      });
    }
  });

  // Handle player attack
  socket.on("playerAttack", ({ address }) => {
    const game = findGameByAddress(address);
    if (!game) return;
    if (game.currentTurn !== address) {
      socket.emit("error", { message: "Not your turn!" });
      return;
    }
  
    // Determine attacker and defender
    const isPlayer1 = game.players.player1.address === address;
    const opponent = isPlayer1 
      ? game.players.player2 
      : game.players.player1;
    
    const damage = Math.floor(Math.random() * 20) + 10;
    opponent.health = Math.max(0, opponent.health - damage);
  
    // Check if the game has ended after the attack
    if (opponent.health <= 0) {
      io.to(game.id).emit("battleEnd", { winner: address });
      delete games[game.id];
      return;
    }
  
    // Transition to the next turn
    transitionTurn(game);
  });
  
  // Handle player defend
  socket.on("playerDefend", ({ address }) => {
    const game = findGameByAddress(address);
    if (!game || game.currentTurn !== address) return;

    // Determine defending player
    const isPlayer1 = game.players.player1.address === address;
    const self = isPlayer1 
      ? game.players.player1 
      : game.players.player2;

    const healAmount = Math.min(10, 100 - self.health);
    self.health = Math.min(100, self.health + healAmount);
    
    // Transition turn
    transitionTurn(game);
  });

  // Restart battle
  socket.on("restartBattle", ({ address }) => {
    const existingGame = findGameByAddress(address);
    if (existingGame) {
      delete games[existingGame.id];
    }

    // Reset player readiness
    if (players[address]) {
      players[address].ready = true;
    }

    checkForBattle();
  });

  // Handle player disconnect
  socket.on("disconnect", () => {
    const playerAddress = Object.keys(players).find(
      key => players[key].socketId === socket.id
    );

    if (playerAddress) {
      console.log("User disconnected", playerAddress);
      delete players[playerAddress];
      endBattle(playerAddress);
    }
  });
});

// Check for battle-ready players and start a game
function checkForBattle() {
  const readyPlayers = Object.values(players).filter(
    (player) => player.ready
  );

  if (readyPlayers.length >= 2) {
    const [player1, player2] = readyPlayers.slice(0, 2);
    const gameID = `${player1.address}_${player2.address}`;

    // Mark players as not ready
    player1.ready = false;
    player2.ready = false;

    // Create game with structured players
    games[gameID] = {
      id: gameID,
      players: {
        player1: { address: player1.address, health: 100 },
        player2: { address: player2.address, health: 100 }
      },
      currentTurn: player1.address,
      turn: 1,
    };

    // Join game room
    io.in(player1.address).socketsJoin(gameID);
    io.in(player2.address).socketsJoin(gameID);

    // Notify players of battle start
    io.to(gameID).emit("battleStart", {
      player1Address: player1.address,
      player2Address: player2.address
    });

    // Send initial turn updates
    io.to(player1.address).emit("turnUpdate", {
      currentTurn: 1,
      playerTurn: player1.address,
      playerHealth: 100,
      opponentHealth: 100
    });
    io.to(player2.address).emit("turnUpdate", {
      currentTurn: 1,
      playerTurn: player1.address,
      playerHealth: 100,
      opponentHealth: 100
    });
  }
}

// Centralized function to handle turn transitions
function transitionTurn(game) {
  // Switch current turn between players
  game.currentTurn = game.currentTurn === game.players.player1.address 
    ? game.players.player2.address 
    : game.players.player1.address;
  game.turn++;
  
  // Emit turn updates to all players in the game
  io.to(game.id).emit("turnUpdate", {
    currentTurn: game.turn,
    playerTurn: game.currentTurn,
    playerHealth: game.players.player1.health,
    opponentHealth: game.players.player2.health
  });
}

// Find game by player address
function findGameByAddress(address) {
  return Object.values(games).find((game) => 
    game.players.player1.address === address || 
    game.players.player2.address === address
  );
}

// End a battle if a player disconnects
function endBattle(address) {
  const game = Object.values(games).find((game) => 
    game.players.player1.address === address || 
    game.players.player2.address === address
  );

  if (game) {
    io.to(game.id).emit("battleEnd", { winner: "Opponent disconnected" });
    delete games[game.id];
  }
}

export { app, io, server };