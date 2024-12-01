import Image from 'next/image'

type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

interface CollectibleCardProps {
  name: string
  image: string
  rarity: Rarity
  onClick: () => void
}

const rarityColors: Record<Rarity, string> = {
  common: 'border-gray-400',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-400',
}

export default function CollectibleCard({ name, image, rarity, onClick }: CollectibleCardProps) {
    return (
      <div 
        className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105 ${rarityColors[rarity]} border-4 cursor-pointer`}
        onClick={onClick}
      >
        <div className="relative h-48 w-full">
          <Image
            src={image}
            alt={name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2 text-white">{name}</h2>
          <p className="text-sm text-gray-400 capitalize">{rarity}</p>
        </div>
      </div>
    )
  }