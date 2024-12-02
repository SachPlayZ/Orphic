import Image from 'next/image'
import { Monster } from "./types"

interface MonsterCardProps {
  monster: Monster
  onClick: () => void
}

export default function MonsterCard({ monster, onClick }: MonsterCardProps) {
  return (
    <div
      className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition"
      onClick={onClick}
    >
      <div className="relative w-full h-48 mb-4">
        <Image
          src={monster.image}
          alt={monster.name}
          layout="fill"
          objectFit="cover"
          className="rounded-lg"
        />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">{monster.name}</h2>
      <p className="text-gray-300">Rarity: {monster.rarity}</p>
      <p className="text-gray-300">HP: {monster.hp}</p>
      <p className="text-gray-300">Price: {monster.price} coins</p>
    </div>
  )
}

