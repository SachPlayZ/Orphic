import Image from 'next/image'
import { Monster } from "./types"

interface MonsterDialogProps {
  monster: Monster
  isOpen: boolean
  onClose: () => void
}

export default function MonsterDialog({ monster, isOpen, onClose }: MonsterDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="relative w-full h-64 mb-4">
          <Image
            src={monster.image}
            alt={monster.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">{monster.name}</h2>
        <p className="text-gray-300 mb-2">Rarity: {monster.rarity}</p>
        <p className="text-gray-300 mb-2">HP: {monster.hp}</p>
        <p className="text-gray-300 mb-4">Price: {monster.price} coins</p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  )
}

