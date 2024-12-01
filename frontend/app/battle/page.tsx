"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

let socket: Socket;
const CLIENT_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:5000";

const BattlePage = () => {
  const [socketConnected, setSocketConnected] = useState(false);
  console.log(socketConnected);
  const [attacking, setAttacking] = useState(false);
  const [defending, setDefending] = useState(false);
  const [turn, setTurn] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleStatus, setBattleStatus] = useState<
    "waiting" | "active" | "completed"
  >("waiting");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);

  const { address } = useAccount();

  useEffect(() => {
    // Initialize socket connection
    socket = io(CLIENT_URL);

    // Setup connection and game events
    socket.emit("setup", { address });

    // Connection established
    socket.on("connected", () => {
      setSocketConnected(true);
      console.log("Socket connected");
    });

    // Turn management
    socket.on(
      "turnUpdate",
      (data: { currentTurn: number; playerTurn: boolean }) => {
        setTurn(data.currentTurn);
        setIsPlayerTurn(data.playerTurn);
      }
    );

    // Battle state updates
    socket.on("battleStart", () => {
      setBattleStatus("active");
      setPlayerHealth(100);
      setOpponentHealth(100);
    });

    // Health updates
    socket.on(
      "healthUpdate",
      (data: { playerHealth: number; opponentHealth: number }) => {
        setPlayerHealth(data.playerHealth);
        setOpponentHealth(data.opponentHealth);
      }
    );

    // Battle end
    socket.on("battleEnd", (data: { winner: string }) => {
      setBattleStatus("completed");
      console.log(`Battle ended. Winner: ${data.winner}`);
    });

    // Cleanup socket on component unmount
    return () => {
      socket.disconnect();
    };
  }, [address]);

  // Attack handler
  const handleAttack = () => {
    if (!isPlayerTurn || battleStatus !== "active") return;

    socket.emit("playerAttack", { address });
    setAttacking(true);

    // Reset attack state after a short delay
    setTimeout(() => setAttacking(false), 1000);
  };

  // Defend handler
  const handleDefend = () => {
    if (!isPlayerTurn || battleStatus !== "active") return;

    socket.emit("playerDefend", { address });
    setDefending(true);

    // Reset defend state after a short delay
    setTimeout(() => setDefending(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-700 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Battle Arena</h1>

        {/* Battle Status */}
        <div className="text-center mb-4">
          <p className="text-lg">
            Battle Status: <span className="font-bold">{battleStatus}</span>
          </p>
          <p>Current Turn: {turn}</p>
        </div>

        {/* Battlefield */}
        <div className="flex justify-between items-center mb-8">
          {/* Player Card */}
          <Card className="w-1/3 bg-gray-800 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-center">Your Card</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 mb-4">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Player Card"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="text-center">
                <p>Health: {playerHealth}/100</p>
                <div className="w-full bg-red-900 rounded-full h-4 mt-2">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${playerHealth}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* VS */}
          <div className="text-4xl font-bold">VS</div>

          {/* Opponent Card */}
          <Card className="w-1/3 bg-gray-800 border-2 border-red-500">
            <CardHeader>
              <CardTitle className="text-center">Opponent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 mb-4">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Opponent Card"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="text-center">
                <p>Health: {opponentHealth}/100</p>
                <div className="w-full bg-red-900 rounded-full h-4 mt-2">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${opponentHealth}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={handleAttack}
            disabled={!isPlayerTurn || battleStatus !== "active"}
            className={`${
              isPlayerTurn && battleStatus === "active"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-600 cursor-not-allowed"
            } transition-all duration-300`}
          >
            {attacking ? "Attacking..." : "Attack"}
          </Button>
          <Button
            onClick={handleDefend}
            disabled={!isPlayerTurn || battleStatus !== "active"}
            className={`${
              isPlayerTurn && battleStatus === "active"
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-600 cursor-not-allowed"
            } transition-all duration-300`}
          >
            {defending ? "Defending..." : "Defend"}
          </Button>
        </div>

        {/* Turn Indicator */}
        <div className="text-center mt-4">
          <p className="text-xl font-bold">
            {isPlayerTurn ? "It's your turn!" : "Opponent's turn"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BattlePage;
