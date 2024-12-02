import Image from "next/image";
import { Sparkles, Zap, Shield, Heart } from 'lucide-react';
import { Monster, Rarity } from "./types";

interface MonsterCardProps {
  monster: Monster;
  onClick: () => void;
}

const rarityColors: Record<Rarity, string> = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 to-yellow-600",
};

export default function MonsterCard({ monster, onClick }: MonsterCardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer group`}
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={monster.tokenURI}
          alt={monster.name}
          layout="fill"
          objectFit="cover"
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${rarityColors[monster.rarity]} opacity-0 group-hover:opacity-75 transition-opacity duration-300`} />
        <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-600 transition-all duration-300">
          {monster.name}
        </h2>
        <p className="text-sm text-gray-400 capitalize mb-2">{monster.rarity}</p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-1 text-red-400" />
            <span>{monster.attack.toString()}</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-1 text-blue-400" />
            <span>{monster.defense.toString()}</span>
          </div>
          <div className="flex items-center">
            <Heart className="w-4 h-4 mr-1 text-green-400" />
            <span>{monster.hp.toString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

