'use client'

import { useState } from "react"
import MonsterCard from "./MonsterCard"
import MonsterDialog from "./MonsterDialog"
import { Monster } from "./types"
import { dummyMonsters } from "./dummyData";

export default function MarketplacePage() {
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const monsters = dummyMonsters;

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">
          Monster Marketplace
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {monsters.map((monster) => (
            <MonsterCard
              key={monster.id}
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
  )
}

