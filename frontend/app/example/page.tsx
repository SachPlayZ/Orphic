"use client"
import React, { useState } from "react";

const GenerateCreature = () => {
  const [image, setImage] = useState<string | null>(null);

  const generateImage = async (creatureType: string, rarity: string) => {
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
  };

  return (
    <div>
      <button onClick={() => generateImage("dragon", "epic")}>
        Generate Legendary Dragon
      </button>
      {image && <img src={image} alt="Generated Creature" />}
    </div>
  );
};

export default GenerateCreature;
