"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Interfaces for type safety
interface TurnUpdatePayload {
  currentTurn: number;
  playerTurn: boolean;
  playerHealth: number;
  opponentHealth: number;
}

interface BattleEndPayload {
  winner: string;
}

let socket: Socket;
const CLIENT_URL =
  process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:5000";

const BattlePage = () => {
  const router = useRouter();
  const [socketConnected, setSocketConnected] = useState(false);
  console.log(socketConnected);

  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();

  const [attacking, setAttacking] = useState(false);
  const [defending, setDefending] = useState(false);
  console.log(attacking, defending);
  const [turn, setTurn] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const [playerOneHealth, setPlayerOneHealth] = useState(100);
  const [playerTwoHealth, setPlayerTwoHealth] = useState(100);
  const [winner, setWinner] = useState<string | null>(null);

  const [battleStatus, setBattleStatus] = useState<
    "waiting" | "active" | "completed"
  >("waiting");
  const [playerHealth, setPlayerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  console.log(playerHealth, opponentHealth);
  setPlayerHealth(100);

  useEffect(() => {
    socket = io(CLIENT_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocketConnected(false);
      setIsLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
      setIsLoading(false);
    });

    socket.emit("setup", { address });

    socket.on("connected", () => {
      setSocketConnected(true);
      setIsLoading(false);
      console.log("Socket connected");
    });

    socket.on("turnUpdate", (data: TurnUpdatePayload) => {
      setTurn(data.currentTurn);
      setIsPlayerTurn(data.playerTurn);
      setPlayerOneHealth(data.playerHealth);
      setPlayerTwoHealth(data.opponentHealth);
    });

    socket.on("battleStart", () => {
      setBattleStatus("active");
      setPlayerOneHealth(100);
      setPlayerTwoHealth(100);
      setTurn(0);

      socket.emit("readyForBattle", { address });
    });

    socket.on("battleEnd", (data: BattleEndPayload) => {
      setBattleStatus("completed");
      console.log(`Battle ended. Winner: ${data.winner}`);
      setPlayerTwoHealth(0);
      setWinner(data.winner);
    });

    socket.on("actionComplete", () => {
      setAttacking(false);
      setDefending(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [address]);

  const handleAttack = () => {
    if (!isPlayerTurn && !isPlayerTurn) return;

    socket?.emit("playerAttack", { address });
    setAttacking(true);
  };

  const handleDefend = () => {
    if (!isPlayerTurn && !isPlayerTurn) return;

    socket.emit("playerDefend", { address });
    setDefending(true);
  };

  const handleRestartBattle = () => {
    if (battleStatus === "completed") {
      socket.emit("restartBattle", { address });
      setBattleStatus("waiting");
      setOpponentHealth(0);
    }
  };

  const handleReturnToMainmenu = () => {
    router.push("/play");
  };

  console.log(isPlayerTurn);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Connecting to battle arena...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold text-center mb-8">Battle Arena</h1>

        <div className="text-center mb-4">
          <p className="text-lg">
            Battle Status: <span className="font-bold">{battleStatus}</span>
          </p>
          <p>Current Turn: {turn}</p>
        </div>

        <div className="flex justify-between items-center mb-8 text-white">
          <Card className="w-1/3 bg-gray-800 border-2 border-blue-500">
            <CardHeader>
              <CardTitle className="text-center">Player1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 mb-4">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Player1"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="text-center">
                <p>Health: {playerOneHealth}/100</p>
                <div className="w-full bg-red-900 rounded-full h-4 mt-2">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${playerOneHealth}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-4xl font-bold">VS</div>

          <Card className="w-1/3 bg-gray-800 border-2 border-red-500">
            <CardHeader>
              <CardTitle className="text-center">Player2</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 mb-4">
                <Image
                  src="/placeholder.svg?height=200&width=200"
                  alt="Player2"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
              <div className="text-center">
                <p>Health: {playerTwoHealth}/100</p>
                <div className="w-full bg-red-900 rounded-full h-4 mt-2">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${playerTwoHealth}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {battleStatus === "active" ? (
          <div className="flex justify-center space-x-4">
            <Button
              onClick={handleAttack}
              disabled={false}
              className={`${
                isPlayerTurn || isPlayerTurn
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-gray-600 cursor-not-allowed"
              } transition-all duration-300`}
            >
              Attack
            </Button>
            <Button
              onClick={handleDefend}
              disabled={false}
              className={`${
                isPlayerTurn || isPlayerTurn
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-gray-600 cursor-not-allowed"
              } transition-all duration-300`}
            >
              Defend
            </Button>
          </div>
        ) : battleStatus === "completed" ? (
          <div className="flex flex-col items-center justify-center gap-y-4">
            <Button
              onClick={handleRestartBattle}
              className="bg-green-500 hover:bg-green-600 transition-all duration-300"
            >
              Restart Battle
            </Button>
            <Button
              onClick={handleReturnToMainmenu}
              className="bg-blue-500 hover:bg-blue-600 transition-all duration-300"
            >
              Return to Mainmenu
            </Button>
          </div>
        ) : (
          <div className="text-center text-xl">
            Waiting for battle to start...
          </div>
        )}

        {battleStatus === "completed" && (
          <div className="text-center mt-4">
            <p className="text-2xl font-bold">
              {playerOneHealth > 0 && `Winner: ${winner}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattlePage;
