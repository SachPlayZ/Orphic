interface Moveset {
    [key: string]: {
        [move: string]: string;
    };
}

export const MOVESET: Moveset = {
    // Dragons Faction-Exclusive Moves
    "Dragon": {
    "Fire Blast": "Deals high fire-based AoE damage to all enemies. Medium cooldown. Chance to burn opponents, reducing Health over 3 turns.",
    "Wing Shield": "Reduces incoming damage by 50% for 2 turns. Low cooldown. 30% chance to reflect the attack back to the enemy.",
    "Ancient Roar": "Reduces all enemies’ Speed and Defense stats for 2 turns. High cooldown. Increases the user's next attack power.",
    "Sky Strike": "Launches a high-impact attack from the air, dealing massive single-target damage. High cooldown. 20% chance to stun the target for 1 turn.",
    "Inferno Surge": "Unleashes a devastating firestorm, dealing massive AoE damage at the cost of some user Health. Very high cooldown. Damage increases if used consecutively."
    },
    
    // Tigers Faction-Exclusive Moves
    "Tiger": {
    "Tiger Claw": "Delivers a powerful single-target slash with high critical hit chances. Low cooldown. 10% chance to bypass enemy Defense completely.",
    "Shadow Leap": "Instantly evades the next attack while increasing Speed for 2 turns. Medium cooldown. Grants the ability to counterattack.",
    "Pounce Strike": "Deals damage based on the target’s Speed (higher Speed, higher damage). Medium cooldown. 25% chance to slow the opponent.",
    "Ferocious Howl": "Boosts Attack and Speed stats of all allies for 3 turns. High cooldown. Small chance to lower enemy morale, reducing their attack power.",
    "Lunar Ambush": "A stealth-based attack that deals massive damage if the user wasn’t attacked in the previous turn. High cooldown. Grants the user a shield that absorbs 20% of incoming damage for the next turn."
    },
    
    // Common Moves (Both Factions)
    "Basic": {
    "Basic Attack": "Deals small single-target damage with no cooldown.",
    "Defend": "Reduces incoming damage by 30% for 1 turn.",
    "Quick Strike": "A fast, low-damage attack that always goes first in the turn order. Low cooldown.",
    "Charge Up": "Increases the power of the next move by 50%. Medium cooldown.",
    "Recover": "Restores a small percentage of Health. High cooldown."
    }
}
