"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWriteContract } from "wagmi";
import { abi, contractAddress } from "@/abi";
import { Loader2, Sparkles, Zap, Shield, Heart } from "lucide-react";
import confetti from "canvas-confetti";
import { getRandomMoves } from "@/functions/moves";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [moveset, setMoveset] = useState<
    { moveName: string; movePower: bigint }[]
  >([]);

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
    const moves = getRandomMoves();
    console.log("Moves:\n", moves);
    setMoveset(moves);
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
    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

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

    setIsMinting(true);

    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], `${monsterName}.png`, { type: blob.type });
      const imgData = new FormData();
      imgData.append("file", file);

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
      console.log("Minting monster:", {
        name: monsterName,
        creatureType,
        rarityEnum,
        stats,
        image,
        moveset,
      });
      const tx = await writeContractAsync(
        {
          address: contractAddress,
          abi: abi,
          functionName: "mintMonster",
          args: [
            monsterName,
            stats.attack,
            stats.defense,
            stats.hp,
            [
              {
                moveName: "Basic Attack",
                movePower: stats.attack,
              },
              {
                moveName: "Basic Attack 2",
                movePower: stats.attack + 10,
              },
              {
                moveName: "Basic Attack 3",
                movePower: stats.attack + 20,
              },
            ],
            rarityEnum,
            ipfs,
          ],
        },
        {
          onError(error) {
            console.error("Error minting monster:");
            console.log(error);
          },
        }
      );
      console.log("Transaction hash:", tx);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      alert(`Monster "${monsterName}" minted successfully!`);
      router.push("/my-collectibles");
    } catch (error) {
      console.error("Error in handleMint:", error);
      alert("An error occurred while minting the monster.");
    } finally {
      setIsMinting(false);
    }
  };

  const rarityColor = {
    common: "text-gray-400",
    rare: "text-blue-400",
    epic: "text-purple-400",
    legendary: "text-yellow-400",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white p-4">
      {showWelcome && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-1 rounded-lg">
            <div className="bg-gray-900 rounded-lg p-8 max-w-md text-center">
              <h1 className="text-4xl font-bold mb-4 animate-pulse">
                Welcome, Trainer!
              </h1>
              <p className="mb-6">
                Are you ready to receive your first Mon? An exciting adventure
                awaits!
              </p>
              <button
                onClick={() => setShowWelcome(false)}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold 
                           transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
              >
                Let&apos;s Begin!
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
          Discover Your Mon
        </h2>
        {creatureType && rarity && (
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold mb-4">
              <span
                className={`${rarityColor[rarity as keyof typeof rarityColor]}`}
              >
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </span>{" "}
              {creatureType.charAt(0).toUpperCase() + creatureType.slice(1)}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-red-800 bg-opacity-50 p-3 rounded-lg transform transition-all duration-300 hover:scale-105">
                <Zap className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Attack</p>
                <p className="text-2xl">{stats.attack}</p>
              </div>
              <div className="bg-blue-800 bg-opacity-50 p-3 rounded-lg transform transition-all duration-300 hover:scale-105">
                <Shield className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">Defense</p>
                <p className="text-2xl">{stats.defense}</p>
              </div>
              <div className="bg-green-800 bg-opacity-50 p-3 rounded-lg transform transition-all duration-300 hover:scale-105">
                <Heart className="w-6 h-6 mx-auto mb-2" />
                <p className="font-semibold">HP</p>
                <p className="text-2xl">{stats.hp}</p>
              </div>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <Loader2 className="w-16 h-16 animate-spin text-purple-500 mb-4" />
            <p className="text-lg animate-pulse">Summoning your Mon...</p>
          </div>
        ) : (
          image && (
            <div className="mb-6 relative group">
              <img
                src={image}
                alt="Generated Creature"
                className="w-full h-auto rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
          )
        )}
        <div className="flex items-center mb-4">
          <input
            type="text"
            className="w-full px-4 py-2 text-white bg-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
            placeholder="Name your Mon"
            value={monsterName}
            onChange={(e) => setMonsterName(e.target.value)}
          />
          <button
            className={`px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-r-lg font-semibold 
                        transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600
                        ${
                          (!monsterName || isMinting) &&
                          "opacity-50 cursor-not-allowed"
                        }`}
            onClick={handleMint}
            disabled={!monsterName || isMinting}
          >
            {isMinting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mint"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateCreature;
