"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import { Loader2, Zap, Shield, Heart } from "lucide-react";
import Image from "next/image";
import BattleArena from "./BattleArena";
import MoveSelection from "./MoveSelection";
import BattleLog from "./BattleLog";
import BattleStats from "./BattleStats";
import type { Monster, Move, BattleState, Rarity } from "./types";
import {
  generateRandomMonster1,
  generateRandomMonster2,
  selectRandomMove,
  generateMonsterNFT,
} from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { abi } from "@/abi";
import MonsterSelectionModal from "./MonsterSelectionModal";

export interface MonsterNFT {
  name: string;
  tokenURI: string;
  rarity: Rarity;
  attack: number;
  defense: number;
  hp: number;
  moves: Move[];
}

const contractAddress = "0xEB4A7791a92bEaDe73F45CF07261ff8FBB39C6b7";

export default function BattlePage() {
  const { address } = useAccount();
  const [monsters, setMonsters] = useState<MonsterNFT[]>([]);
  const [selectedMonster, setSelectedMonster] = useState<MonsterNFT | null>(
    null
  );
  const [showMonsterModal, setShowMonsterModal] = useState(true);

  const router = useRouter();
  const { data, isLoading: isDataLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllMonstersFromAUser",
    args: [address],
  });

  useEffect(() => {
    if (data) {
      console.log(
        JSON.stringify(data, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );
      const monsterData = data as MonsterNFT[];
      setMonsters(monsterData);
      console.log(monsterData);
    }
  }, [data]);

  const { writeContractAsync } = useWriteContract();
  const [battleState, setBattleState] = useState<BattleState>({
    playerMonster: null,
    opponentMonster: null,
    playerHealth: 100,
    opponentHealth: 100,
    currentTurn: "player",
    battleLog: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedMonster, setMintedMonster] = useState<Monster | null>(null);
  const [mintedImage, setMintedImage] = useState<string | null>(null);

  // useEffect(() => {
  //   if (selectedMonster) {
  //     const opponentMonster = generateRandomMonster2()

  //     setBattleState((prev) => ({
  //       ...prev,
  //       playerMonster: selectedMonster,
  //       opponentMonster,
  //       playerHealth: selectedMonster.hp,
  //       opponentHealth: opponentMonster.hp,
  //     }))

  //     setIsLoading(false)
  //   }
  // }, [selectedMonster])

  const handleMonsterSelection = (monster: MonsterNFT) => {
    setSelectedMonster(monster);
    setShowMonsterModal(false);
    // Removed setIsLoading(false) here
  };

  const handleMoveSelection = (move: Move) => {
    if (battleState.currentTurn !== "player") return;

    const playerDamage = calculateDamage(
      battleState.playerMonster!,
      move,
      battleState.opponentMonster!
    );
    const newOpponentHealth = Math.max(
      0,
      battleState.opponentHealth - playerDamage
    );

    const updatedBattleState: BattleState = {
      ...battleState,
      opponentHealth: newOpponentHealth,
      currentTurn: "opponent",
      battleLog: [
        ...battleState.battleLog,
        `${battleState.playerMonster!.name} used ${
          move.name
        } and dealt ${playerDamage} damage!`,
      ],
    };

    setBattleState(updatedBattleState);

    setTimeout(() => {
      const opponentMove = selectRandomMove(battleState.opponentMonster!.moves);
      const opponentDamage = calculateDamage(
        battleState.opponentMonster!,
        opponentMove,
        battleState.playerMonster!
      );
      const newPlayerHealth = Math.max(
        0,
        Number(battleState.playerHealth) - Number(opponentDamage)
      );

      setBattleState((prev) => ({
        ...prev,
        playerHealth: newPlayerHealth,
        currentTurn: "player",
        battleLog: [
          ...prev.battleLog,
          `${prev.opponentMonster!.name} used ${
            opponentMove.name
          } and dealt ${opponentDamage} damage!`,
        ],
      }));

      if (newPlayerHealth === 0 || newOpponentHealth === 0) {
        const winner = newOpponentHealth === 0 ? "Player" : "Opponent";
        setBattleState((prev) => ({
          ...prev,
          battleLog: [...prev.battleLog, `Battle ended! ${winner} wins!`],
        }));
        setShowVictoryScreen(true);
        if (winner === "Player") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          handleVictory();
        }
      }
    }, 1500);
  };

  const calculateDamage = (
    attacker: Monster,
    move: Move,
    defender: Monster
  ) => {
    const baseDamage = move.power;
    const attackStat = attacker.attack;
    const defenseStat = defender.defense;
    const randomFactor = Math.random() * (1.1 - 0.9) + 0.9;
    return Math.floor(
      Number(baseDamage) *
        (Number(attackStat) / Number(defenseStat)) *
        randomFactor
    );
  };

  const handleVictory = async () => {
    setIsMinting(true);
    try {
      const newMonster = await generateMonsterNFT();
      const mintedNFT = await mintMonsterNFT(newMonster);
      setMintedMonster(mintedNFT);
      setMintedImage(newMonster.tokenURI);
    } catch (error) {
      console.error("Error minting victory NFT:", error);
    } finally {
      setIsMinting(false);
    }
  };

  const mintMonsterNFT = async (monster: Monster) => {
    try {
      const response = await fetch(monster.tokenURI);
      const blob = await response.blob();
      const file = new File([blob], `${monster.name}.png`, { type: blob.type });
      const imgData = new FormData();
      imgData.append("file", file);

      const uploadResponse = await fetch("/api/files", {
        method: "POST",
        body: imgData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the file");
      }

      const ipfs = await uploadResponse.json();

      let rarityEnum;
      switch (monster.rarity) {
        case "common":
          rarityEnum = 0;
          break;
        case "rare":
          rarityEnum = 1;
          break;
        case "epic":
          rarityEnum = 2;
          break;
        case "legendary":
          rarityEnum = 3;
          break;
        default:
          rarityEnum = 0;
      }

      await writeContractAsync({
        address: contractAddress,
        abi: abi,
        functionName: "mintMonster",
        args: [
          ipfs,
          monster.name,
          monster.attack,
          monster.defense,
          monster.hp,
          rarityEnum,
        ],
      });

      return monster;
    } catch (error) {
      console.error("Error in mintMonsterNFT:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (selectedMonster) {
      console.log(selectedMonster);
      console.log("HELLO");
      const playerMonster = generateRandomMonster1(selectedMonster);
      const opponentMonster = generateRandomMonster2();

      setBattleState((prev) => ({
        ...prev,
        playerMonster,
        opponentMonster,
        playerHealth: playerMonster.hp,
        opponentHealth: opponentMonster.hp,
      }));

      setIsLoading(false);
    }
  }, [selectedMonster]); // Add selectedMonster to dependencies

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black">
        <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
        {showMonsterModal && (
          <MonsterSelectionModal
            monsters={monsters}
            onSelectMonster={handleMonsterSelection}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white p-4 overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Monster Battle Arena
        </motion.h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BattleArena
              playerMonster={battleState.playerMonster!}
              opponentMonster={battleState.opponentMonster!}
              playerHealth={battleState.playerHealth}
              opponentHealth={battleState.opponentHealth}
              currentTurn={battleState.currentTurn}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MoveSelection
              moves={battleState.playerMonster!.moves}
              onMoveSelect={handleMoveSelection}
              disabled={battleState.currentTurn !== "player"}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <BattleLog log={battleState.battleLog} />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8"
        >
          <BattleStats
            playerMonster={battleState.playerMonster!}
            opponentMonster={battleState.opponentMonster!}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {showVictoryScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-lg"
            >
              <div className="bg-gray-900 rounded-lg p-8 max-w-md text-center">
                <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  {battleState.playerHealth > 0 ? "Victory!" : "Defeat!"}
                </h2>
                <p className="mb-6">
                  {battleState.playerHealth > 0
                    ? "Congratulations! Your monster emerged victorious!"
                    : "Your monster fought bravely but was defeated. Better luck next time!"}
                </p>
                {mintedMonster && mintedImage && (
                  <div className="mb-6">
                    <p className="text-lg font-semibold mb-2">
                      You've won a new monster!
                    </p>
                    <div className="w-48 h-48 mx-auto mb-4 relative">
                      <Image
                        src={mintedImage || "/placeholder.svg"}
                        alt={mintedMonster.name}
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-xl font-bold">{mintedMonster.name}</p>
                    <p
                      className={`${getRarityColor(
                        mintedMonster.rarity
                      )} text-lg`}
                    >
                      {mintedMonster.rarity.charAt(0).toUpperCase() +
                        mintedMonster.rarity.slice(1)}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="bg-red-800 bg-opacity-50 p-2 rounded-lg">
                        <Zap className="w-6 h-6 mx-auto mb-1" />
                        <p className="font-semibold">Attack</p>
                        <p className="text-xl">{mintedMonster.attack}</p>
                      </div>
                      <div className="bg-blue-800 bg-opacity-50 p-2 rounded-lg">
                        <Shield className="w-6 h-6 mx-auto mb-1" />
                        <p className="font-semibold">Defense</p>
                        <p className="text-xl">{mintedMonster.defense}</p>
                      </div>
                      <div className="bg-green-800 bg-opacity-50 p-2 rounded-lg">
                        <Heart className="w-6 h-6 mx-auto mb-1" />
                        <p className="font-semibold">HP</p>
                        <p className="text-xl">{mintedMonster.hp}</p>
                      </div>
                    </div>
                  </div>
                )}
                {isMinting && (
                  <div className="mb-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Minting your victory NFT...</p>
                  </div>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold
        transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
                >
                  New Battle
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case "common":
      return "text-gray-400";
    case "rare":
      return "text-blue-400";
    case "epic":
      return "text-purple-400";
    case "legendary":
      return "text-yellow-400";
    default:
      return "text-white";
  }
}
