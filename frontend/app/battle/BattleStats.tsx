import { Monster } from "./types";
import { motion } from "framer-motion";

interface BattleStatsProps {
  playerMonster: Monster;
  opponentMonster: Monster;
  roundCount?: number;
}

export default function BattleStats({ playerMonster, opponentMonster, roundCount }: BattleStatsProps) {
  if (!roundCount) {
    roundCount = 1;
  }
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Battle Stats
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Round" value={Number(roundCount)} />
        <StatCard title="Player Attack" value={Number(playerMonster.attack)} />
        <StatCard title="Opponent Attack" value={Number(opponentMonster.attack)} />
        <StatCard title="Player Defense" value={Number(playerMonster.defense)} />
        <StatCard title="Opponent Defense" value={Number(opponentMonster.defense)} />
        <StatCard title="Player Rarity" value={playerMonster.rarity.charAt(0).toUpperCase() + playerMonster.rarity.slice(1)} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <motion.div
      className="bg-gray-700 rounded-lg p-3 text-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        {value}
      </p>
    </motion.div>
  );
}

