"use client";

import { useState, useEffect, use } from "react";
import MonsterCard from "./CollectibleCard";
import MonsterDialog from "./DialogueBox";
import { Monster } from "./types";
import { useAccount, useReadContract } from "wagmi";
import abi from "@/abi";

const contractAddress = "0xFfa47E4562D7cc6cDB95a7366E04b644e9DEF000";

export default function MonsterCollectiblesPage() {
  const { address } = useAccount();
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const { data, isLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllMonstersFromAUser",
    args: [address],
  });
  useEffect(() => {
    if (data) {
      const monsterData = data as Monster[];
      setMonsters(monsterData);
      console.log(monsterData);
    }
  }, [data]);
  if (isLoading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          My Monster Collectibles
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {monsters.map((monster) => (
            <MonsterCard
              monster={monster}
              onClick={() => setSelectedMonster(monster)}
            />
          ))}
        </div>
      </div>
      {selectedMonster && (
        <MonsterDialog
          monster={selectedMonster}
          isOpen={!!selectedMonster}
          onClose={() => setSelectedMonster(null)}
        />
      )}
    </div>
  );
}
