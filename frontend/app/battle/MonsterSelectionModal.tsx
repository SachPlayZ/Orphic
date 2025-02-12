import { motion } from "framer-motion"
import Image from "next/image"
import type { MonsterNFT } from "./page"
import { Zap, Shield, Heart } from "lucide-react"

interface MonsterSelectionModalProps {
  monsters: MonsterNFT[]
  onSelectMonster: (monster: MonsterNFT) => void
}

export default function MonsterSelectionModal({ monsters, onSelectMonster }: MonsterSelectionModalProps) {
  return (
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
        <div className="bg-gray-900 rounded-lg p-8 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Select Your Monster
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {monsters.map((monster) => (
              <div
                key={monster.name}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                onClick={() => onSelectMonster(monster)}
              >
                <div className="w-32 h-32 mx-auto mb-2 relative">
                  <Image
                    src={monster.tokenURI || "/placeholder.svg"}
                    alt={monster.name}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-bold mb-1">{monster.name}</h3>
                <p className={`text-sm ${getRarityColor(monster.rarity)}`}>
                  {monster.rarity.charAt(0).toUpperCase() + monster.rarity.slice(1)}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-red-800 bg-opacity-50 p-1 rounded-lg">
                    <Zap className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-xs">{monster.attack}</p>
                  </div>
                  <div className="bg-blue-800 bg-opacity-50 p-1 rounded-lg">
                    <Shield className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-xs">{monster.defense}</p>
                  </div>
                  <div className="bg-green-800 bg-opacity-50 p-1 rounded-lg">
                    <Heart className="w-4 h-4 mx-auto mb-1" />
                    <p className="text-xs">{monster.hp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case "common":
      return "text-gray-400"
    case "rare":
      return "text-blue-400"
    case "epic":
      return "text-purple-400"
    case "legendary":
      return "text-yellow-400"
    default:
      return "text-white"
  }
}

