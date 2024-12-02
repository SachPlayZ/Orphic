"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWriteContract } from "wagmi";
import abi from "@/abi";

const contractAddress = "0xf5e1F9ded14De19Ae71Bc455E935Eed5A0465463";

const RARITIES = ["common", "rare", "epic", "legendary"];

const GenerateCreature = () => {
  const router = useRouter();
  const { writeContractAsync } = useWriteContract();
  const searchParams = useSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [creatureType, setCreatureType] = useState<string | null>(null);
  const [rarity, setRarity] = useState<string | null>(null);
  const [stats, setStats] = useState({ attack: 0, defense: 0, hp: 0 });
  const [monsterName, setMonsterName] = useState("");

  useEffect(() => {
    const type = searchParams.get("faction");
    if (type) {
      setCreatureType(type);
    }
  }, [searchParams]);

  const generateRandomRarity = () => {
    return 0;
  };

  const generateStats = (rarity: string) => {
    switch (rarity) {
      case "common":
        return {
          attack: Math.floor(Math.random() * (10 - 8) + 8),
          defense: Math.floor(Math.random() * (6 - 4) + 4),
          hp: Math.floor(Math.random() * (110 - 90) + 90),
        };
      case "rare":
        return {
          attack: Math.floor(Math.random() * (15 - 12) + 12),
          defense: Math.floor(Math.random() * (9 - 7) + 7),
          hp: Math.floor(Math.random() * (140 - 120) + 120),
        };
      case "epic":
        return {
          attack: Math.floor(Math.random() * (20 - 17) + 17),
          defense: Math.floor(Math.random() * (13 - 11) + 11),
          hp: Math.floor(Math.random() * (170 - 150) + 150),
        };
      case "legendary":
        return {
          attack: Math.floor(Math.random() * (25 - 23) + 23),
          defense: Math.floor(Math.random() * (16 - 14) + 14),
          hp: Math.floor(Math.random() * (200 - 180) + 180),
        };
      default:
        return { attack: 0, defense: 0, hp: 0 };
    }
  };

  const generateImage = async () => {
    if (!creatureType) return;

    const rarityIndex = generateRandomRarity();
    const rarity = RARITIES[rarityIndex];
    setRarity(rarity);
    setStats(generateStats(rarity));

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
      console.log(imageUrl);
    } catch (error) {
      console.error("Error in image generation:", error);
    }
  };

  // Automatically generate image on load
  useEffect(() => {
    if (creatureType) {
      generateImage();
    }
  }, [creatureType]);

  const handleMint = async () => {
    if (!image) {
      console.error("No image available to mint");
      return;
    }

    console.log("Minting monster:", {
      name: monsterName,
      creatureType,
      rarity,
      stats,
      image,
    });

    try {
      // Fetch the blob data from the image URL
      const response = await fetch(image);
      const blob = await response.blob();

      // Convert the blob into a File object
      const file = new File([blob], `${monsterName}.png`, { type: blob.type });

      // Create FormData and append the file
      const imgData = new FormData();
      imgData.append("file", file);

      // Send the image to your backend
      const uploadResponse = await fetch("/api/files", {
        method: "POST",
        body: imgData,
      });
      console.log(uploadResponse);

      if (!uploadResponse.ok) {
        console.error(
          "Failed to upload the file:",
          await uploadResponse.text()
        );
        return;
      }
      let rarityEnum;
      const ipfs = await uploadResponse.json();
      if (rarity == "common") {
        rarityEnum = 0;
      } else if (rarity == "rare") {
        rarityEnum = 1;
      } else if (rarity == "epic") {
        rarityEnum = 2;
      } else if (rarity == "legendary") {
        rarityEnum = 3;
      } else {
        rarityEnum = 0;
      }

      // Write to the blockchain contract
      await writeContractAsync({
        address: contractAddress,
        abi: abi,
        functionName: "mintMonster",
        args: [
          ipfs, // Image IPFS URL
          monsterName,
          stats.attack,
          stats.defense,
          stats.hp,
          rarityEnum,
        ],
      });

      alert(`Monster "${monsterName}" minted successfully!`);
      router.push("/my-collectibles");
    } catch (error) {
      console.error("Error in handleMint:", error);
      alert("An error occurred while minting the monster.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      {creatureType && rarity && (
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold">
            {creatureType.charAt(0).toUpperCase() + creatureType.slice(1)} -{" "}
            {rarity.toUpperCase()}
          </h2>
          <p>Attack: {stats.attack}</p>
          <p>Defense: {stats.defense}</p>
          <p>HP: {stats.hp}</p>
        </div>
      )}
      {image && (
        <div className="max-w-md mb-4">
          <img
            src={image}
            alt="Generated Creature"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}
      <div className="flex items-center mb-4">
        <input
          type="text"
          className="px-4 py-2 text-black rounded-l"
          placeholder="Enter monster name"
          value={monsterName}
          onChange={(e) => setMonsterName(e.target.value)}
        />
        <button
          className="px-4 py-2 bg-green-500 rounded-r hover:bg-green-600 transition"
          onClick={handleMint}
          disabled={!monsterName}
        >
          Mint
        </button>
      </div>
    </div>
  );
};

export default GenerateCreature;
