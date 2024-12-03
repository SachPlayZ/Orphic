import { Monster, Move, Rarity } from "./types";

const monsterNames = [
  "InfernoDragon", "AbyssalDragon", "CelestialDragon", "NecroDragon", "SpectralDragon",
  "DreadDragon", "EclipseDragon", "StormDragon", "VoidDragon", "BloodDragon",
  "FlameTiger", "AquaTiger", "ThunderTiger", "ShadowTiger", "FrostTiger",
  "VenomTiger", "StoneTiger", "WindTiger", "LightTiger", "DarkTiger"
];
const moveList: Move[] = [
  { name: "Fireball", power: 40, color: "#FF4136" },
  { name: "Waterjet", power: 35, color: "#0074D9" },
  { name: "Thunderbolt", power: 45, color: "#FFDC00" },
  { name: "Shadow Strike", power: 50, color: "#111111" },
  { name: "Ice Shard", power: 30, color: "#7FDBFF" },
  { name: "Poison Sting", power: 25, color: "#B10DC9" },
  { name: "Rock Throw", power: 35, color: "#A05A2C" },
  { name: "Gust", power: 30, color: "#01FF70" },
  { name: "Holy Light", power: 40, color: "#FFFFFF" },
  { name: "Dark Pulse", power: 45, color: "#85144b" },
  { name: "Solar Beam", power: 50, color: "#FF851B" },
  { name: "Tsunami", power: 55, color: "#39CCCC" },
  { name: "Earthquake", power: 60, color: "#3D9970" },
  { name: "Hurricane", power: 55, color: "#B10DC9" },
  { name: "Meteor Strike", power: 70, color: "#FF4136" },
  { name: "Blizzard", power: 50, color: "#7FDBFF" },
  { name: "Tornado", power: 45, color: "#01FF70" },
  { name: "Lunar Beam", power: 60, color: "#DDDDDD" },
  { name: "Starfall", power: 65, color: "#FFDC00" },
  { name: "Void Blast", power: 70, color: "#85144b" }
];

export function generateRandomMonster1(): Monster {
  const rarity = generateRarity();
  const statMultiplier = getRarityMultiplier(rarity);

  const monster: Monster = {
    name: monsterNames[Math.floor(Math.random() * monsterNames.length)],
    // tokenURI: `/dragu.png`,
    rarity,
    attack: Math.floor(Math.floor(Math.random() * 50 + 50) * statMultiplier),
    defense: Math.floor(Math.floor(Math.random() * 50 + 50) * statMultiplier),
    hp: Math.floor(Math.floor(Math.random() * 100 + 100) * statMultiplier),
    moves: generateMoves(),
  };
  const dragonImages = ["/dragu.png", "/dragu2.png", "/dragu3.png"];
  const tigerImages = ["/tigru.png", "/tigru2.png", "/tigru3.png"];
  monster.tokenURI = monster.name.includes("Dragon")
    ? dragonImages[Math.floor(Math.random() * dragonImages.length)]
    : tigerImages[Math.floor(Math.random() * tigerImages.length)];
  return monster;
}
export function generateRandomMonster2(): Monster {
  const rarity = generateRarity();
  const statMultiplier = getRarityMultiplier(rarity);

  const monster: Monster = {
    name: monsterNames[Math.floor(Math.random() * monsterNames.length)],
    // tokenURI: `/dragu.png`,
    rarity,
    attack: Math.floor(Math.floor(Math.random() * 50 + 50) * statMultiplier),
    defense: Math.floor(Math.floor(Math.random() * 50 + 50) * statMultiplier),
    hp: Math.floor(Math.floor(Math.random() * 100 + 100) * statMultiplier),
    moves: generateMoves(),
  };
  const dragonImages = ["/dragu.png", "/dragu2.png", "/dragu3.png"];
  const tigerImages = ["/tigru.png", "/tigru2.png", "/tigru3.png"];
  monster.tokenURI = monster.name.includes("Dragon")
    ? dragonImages[Math.floor(Math.random() * dragonImages.length)]
    : tigerImages[Math.floor(Math.random() * tigerImages.length)];
  return monster;
}

function generateRarity(): Rarity {
  const rand = Math.random();
  if (rand < 0.65) return "common";
  if (rand < 0.85) return "rare";
  if (rand < 0.95) return "epic";
  return "legendary";
}

function getRarityMultiplier(rarity: Rarity): number {
  switch (rarity) {
    case "common": return 1;
    case "rare": return 1.2;
    case "epic": return 1.5;
    case "legendary": return 2;
  }
}

function generateMoves(): Move[] {
  const shuffled = [...moveList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4);
}

export function selectRandomMove(moves: Move[]): Move {
  return moves[Math.floor(Math.random() * moves.length)];
}

export async function generateMonsterNFT(): Promise<Monster> {
  const rarity = generateRarity();
  const statMultiplier = getRarityMultiplier(rarity);
  const name = monsterNames[Math.floor(Math.random() * monsterNames.length)];

  try {
    const creatureType = Math.random() < 0.5 ? "dragon" : "tiger";
    const response = await fetch("/api/getArt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ creatureType, rarity }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate monster image");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    return {
      name,
      tokenURI: imageUrl,
      rarity,
      attack: Math.floor((Math.random() * 50 + 50) * statMultiplier),
      defense: Math.floor((Math.random() * 50 + 50) * statMultiplier),
      hp: Math.floor((Math.random() * 100 + 100) * statMultiplier),
      moves: generateMoves(),
    };
  } catch (error) {
    console.error("Error generating monster NFT:", error);
    throw error;
  }
}

