import { Move } from "./types";
import { motion } from "framer-motion";

interface MoveSelectionProps {
  moves: Move[];
  onMoveSelect: (move: Move) => void;
  disabled: boolean;
}

export default function MoveSelection({ moves, onMoveSelect, disabled }: MoveSelectionProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Select Your Move
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {moves?.map((move) => (
          <motion.button
            key={move.name}
            onClick={() => onMoveSelect(move)}
            disabled={disabled}
            className={`p-4 rounded-lg text-white font-semibold transition-all duration-300 ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105"
            }`}
            style={{
              background: `linear-gradient(135deg, ${move.color} 0%, ${move.color}88 100%)`,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-center">
              <span>{move.name}</span>
              <span className="text-sm opacity-75">Power: {move.power}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

