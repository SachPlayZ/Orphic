"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { Loader2, Sparkles } from 'lucide-react';
import MonsterCard from "./CollectibleCard";
import MonsterDialog from "./DialogueBox";
import { Monster } from "./types";
import abi from "@/abi";

const contractAddress = "0xf5e1F9ded14De19Ae71Bc455E935Eed5A0465463";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white p-4">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
          My Monster Collectibles
        </h1>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
            <p className="text-lg animate-pulse">Summoning your Mons...</p>
          </div>
        ) : monsters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {monsters.map((monster, index) => (
              <MonsterCard
                key={index}
                monster={monster}
                onClick={() => setSelectedMonster(monster)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <p className="text-2xl font-semibold mb-4">No Mons Found</p>
            <p className="text-gray-400">Start your adventure by generating your first Mon!</p>
          </div>
        )}
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
