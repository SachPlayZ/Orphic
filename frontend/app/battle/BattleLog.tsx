import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BattleLogProps {
  log: string[];
}

export default function BattleLog({ log }: BattleLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Battle Log
      </h2>
      <div className="h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        <AnimatePresence>
          {log.map((entry, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-2 text-sm"
            >
              {entry}
            </motion.p>
          ))}
        </AnimatePresence>
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

