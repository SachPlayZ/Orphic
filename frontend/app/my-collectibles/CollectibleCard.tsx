import Image from "next/image";
import { Monster, Rarity } from "./types";

interface MonsterCardProps {
  monster: Monster;
  onClick: () => void;
}

const rarityColors: Record<Rarity, string> = {
  common: "border-gray-400",
  rare: "border-blue-500",
  epic: "border-purple-500",
  legendary: "border-yellow-400",
};

export default function MonsterCard({ monster, onClick }: MonsterCardProps) {
  console.log(monster.tokenURI);
  return (
    <div
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 ease-in-out transform hover:scale-105 ${
        rarityColors[monster.rarity]
      } border-4 cursor-pointer`}
      onClick={onClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={monster.tokenURI}
          alt={monster.name}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2 text-white">
          {monster.name}
        </h2>
        <p className="text-sm text-gray-400 capitalize">{monster.rarity}</p>
      </div>
    </div>
  );
}
