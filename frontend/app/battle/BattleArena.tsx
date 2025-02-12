import Image from "next/image";
import { Monster } from "./types";
import { motion } from "framer-motion";
import { Zap } from 'lucide-react';

interface BattleArenaProps {
  playerMonster: Monster;
  opponentMonster: Monster;
  playerHealth: number;
  opponentHealth: number;
  currentTurn: "player" | "opponent";
}

export default function BattleArena({
  playerMonster,
  opponentMonster,
  playerHealth,
  opponentHealth,
  currentTurn,
}: BattleArenaProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <MonsterDisplay monster={opponentMonster} health={opponentHealth} isOpponent />
        <MonsterDisplay monster={playerMonster} health={playerHealth} />
      </div>
      <div className="relative h-64 bg-gradient-to-b from-purple-700 to-blue-900 rounded-lg overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
          animate={{
            x: currentTurn === "opponent" ? [0, -10, 10, -10, 10, 0] : 0,
            rotate: currentTurn === "opponent" ? [0, -5, 5, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={opponentMonster.tokenURI}
            alt={opponentMonster.name}
            width={100}
            height={100}
            className="filter drop-shadow-lg"
          />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2"
          animate={{
            x: currentTurn === "player" ? [0, 10, -10, 10, -10, 0] : 0,
            rotate: currentTurn === "player" ? [0, 5, -5, 5, -5, 0] : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={playerMonster.tokenURI}
            alt={playerMonster.name}
            width={100}
            height={100}
            className="filter drop-shadow-lg"
          />
        </motion.div>
        {currentTurn === "player" && (
          <motion.div
            className="absolute bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Zap className="w-12 h-12 text-yellow-400" />
          </motion.div>
        )}
        {currentTurn === "opponent" && (
          <motion.div
            className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Zap className="w-12 h-12 text-yellow-400" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface MonsterDisplayProps {
  monster: Monster;
  health: number;
  isOpponent?: boolean;
}

function MonsterDisplay({ monster, health, isOpponent = false }: MonsterDisplayProps) {
  const healthPercentage = (Number(health) / Number(monster.hp)) * 100;
  const healthBarColor = healthPercentage > 50 ? "bg-green-500" : healthPercentage > 25 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className={`flex ${isOpponent ? "flex-row-reverse" : "flex-row"} items-center gap-2`}>
      <div className="text-center">
        <p className="font-bold">{monster.name}</p>
        <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${healthBarColor}`}
            initial={{ width: "100%" }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
        <p className="text-sm">{Number(health)}/{Number(monster.hp)} HP</p>
      </div>
      <Image
        src={monster.tokenURI}
        alt={monster.name}
        width={50}
        height={50}
        className="rounded-full border-2 border-white"
      />
    </div>
  );
}

