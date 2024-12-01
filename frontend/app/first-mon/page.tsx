"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const RARITIES = ["common", "rare", "epic", "legendary"];

const GenerateCreature = () => {
  const searchParams = useSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [creatureType, setCreatureType] = useState<string | null>(null);

  useEffect(() => {
    // Get creature type from query parameter
    const type = searchParams.get("faction");
    if (type) {
      setCreatureType(type);
    }
  }, [searchParams]);

  const generateRandomRarity = () => {
    return Math.floor(Math.random() * 4);
  };

  const generateImage = async () => {
    if (!creatureType) return;

    const rarityIndex = generateRandomRarity();
    const rarity = RARITIES[rarityIndex];

    try {
      const response = await fetch("/api/getArt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ creatureType, rarity }),
      });

      if (!response.ok) {
        console.error("Error generating image:", await response.json());
        return;
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setImage(imageUrl);
    } catch (error) {
      console.error("Error in image generation:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      {creatureType && (
        <button
          className="mb-4 px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
          onClick={generateImage}
        >
          Generate{" "}
          {creatureType.charAt(0).toUpperCase() + creatureType.slice(1)}
        </button>
      )}
      {image && (
        <div className="max-w-md">
          <img
            src={image}
            alt="Generated Creature"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default GenerateCreature;
