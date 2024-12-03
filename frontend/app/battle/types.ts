export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Monster {
  name: string;
  tokenURI: string;
  rarity: Rarity;
  attack: number;
  defense: number;
  hp: number;
  moves: Move[];
}

export interface Move {
  name: string;
  power: number;
  color: string;
}

export interface BattleState {
  playerMonster: Monster | null;
  opponentMonster: Monster | null;
  playerHealth: number;
  opponentHealth: number;
  currentTurn: "player" | "opponent";
  battleLog: string[];
}

