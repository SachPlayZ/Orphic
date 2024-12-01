'use client';

import { useState } from "react";
import CollectibleCard from "./CollectibleCard";
import DialogBox from "./DialogueBox";

type Rarity = "common" | "rare" | "epic" | "legendary";

interface CollectibleCardProps {
  id: number;
  name: string;
  hp: string;
  image: string;
  rarity: Rarity;
}

const collectibles: CollectibleCardProps[] = [
  { id: 1, name: "Cosmic Sword", image: "/placeholder.svg?height=300&width=300", rarity: "legendary", hp: "A sword forged from the heart of a dying star. Its blade glows with cosmic energy." },
  { id: 2, name: "Mystic Amulet", image: "/placeholder.svg?height=300&width=300", rarity: "epic", hp: "An ancient amulet that pulses with arcane power. It's said to enhance the wearer's magical abilities." },
  { id: 3, name: "Steel Shield", image: "/placeholder.svg?height=300&width=300", rarity: "rare", hp: "A sturdy shield made of the finest steel. It has deflected countless blows in battle." },
  { id: 4, name: "Wooden Bow", image: "/placeholder.svg?height=300&width=300", rarity: "common", hp: "A simple yet effective wooden bow. Perfect for beginners and seasoned archers alike." },
  { id: 5, name: "Dragon Scale", image: "/placeholder.svg?height=300&width=300", rarity: "epic", hp: "A single scale from an ancient dragon. It shimmers with an otherworldly iridescence." },
  { id: 6, name: "Phoenix Feather", image: "/placeholder.svg?height=300&width=300", rarity: "legendary", hp: "A feather that burns with eternal flame. It's said to grant the power of rebirth." },
  { id: 7, name: "Iron Helmet", image: "/placeholder.svg?height=300&width=300", rarity: "common", hp: "A basic iron helmet that provides decent protection. It's seen its fair share of battles." },
  { id: 8, name: "Magic Wand", image: "/placeholder.svg?height=300&width=300", rarity: "rare", hp: "A wand that channels magical energy. It sparkles with latent power." },
];

export default function CollectiblesPage() {
  const [selectedCollectible, setSelectedCollectible] = useState<CollectibleCardProps | null>(null);

  return (
    <div className="bg-black min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">My Collectibles</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {collectibles.map((collectible) => (
            <CollectibleCard
              key={collectible.id}
              {...collectible}
              onClick={() => setSelectedCollectible(collectible)}
            />
          ))}
        </div>
      </div>
      {selectedCollectible && (
        <DialogBox
          collectible={selectedCollectible}
          isOpen={!!selectedCollectible}
          onClose={() => setSelectedCollectible(null)}
        />
      )}
    </div>
  );
}
