export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Monster {
  name: string;
  tokenURI: string;
  rarity: Rarity;
  attack: number;
  defense: number;
  hp: number;
}

