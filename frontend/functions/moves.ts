type Stats = {
    hp: number;
    attack: number;
    defense: number;
    speed?: number;
};

type BattleState = {
    attacker: Stats;
    defender: Stats;
};

export const MovesFunctions = {
    // Dragons Faction-Exclusive Moves
    "Fire Blast": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack * 1.5 - state.defender.defense);
        const burnDamage = state.defender.hp * 0.05; // Burn reduces health over 3 turns
        const isBurned = Math.random() < 0.3; // 30% chance to burn
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage - (isBurned ? burnDamage : 0),
            },
        };
    },
    "Wing Shield": (state: BattleState): BattleState => {
        const reflectChance = Math.random() < 0.3; // 30% chance to reflect
        const reflectedDamage = reflectChance
            ? Math.max(0, state.defender.attack * 0.5 - state.attacker.defense)
            : 0;
        return {
            attacker: {
                ...state.attacker,
                hp: state.attacker.hp - reflectedDamage,
            },
            defender: { ...state.defender },
        };
    },
    "Ancient Roar": (state: BattleState): BattleState => {
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                speed: state.defender.speed ? state.defender.speed * 0.8 : state.defender.speed,
                defense: state.defender.defense * 0.8,
            },
        };
    },
    "Sky Strike": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack * 2 - state.defender.defense);
        const isStunned = Math.random() < 0.2; // 20% chance to stun
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
                ...(isStunned ? { stunned: true } : {}),
            },
        };
    },
    "Inferno Surge": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack * 2 - state.defender.defense);
        const recoilDamage = state.attacker.hp * 0.1; // 10% recoil
        return {
            attacker: {
                ...state.attacker,
                hp: state.attacker.hp - recoilDamage,
            },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
            },
        };
    },

    // Tigers Faction-Exclusive Moves
    "Tiger Claw": (state: BattleState): BattleState => {
        const criticalHit = Math.random() < 0.3 ? 2 : 1; // 30% chance to crit
        const damage = Math.max(0, state.attacker.attack * 1.2 * criticalHit - state.defender.defense);
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
            },
        };
    },
    "Shadow Leap": (state: BattleState): BattleState => {
        return {
            attacker: {
                ...state.attacker,
                speed: state.attacker.speed ? state.attacker.speed * 1.3 : state.attacker.speed,
            },
            defender: { ...state.defender },
        };
    },
    "Pounce Strike": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack + (state.defender.speed ?? 0) * 0.5 - state.defender.defense);
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
            },
        };
    },
    "Ferocious Howl": (state: BattleState): BattleState => {
        return {
            attacker: {
                ...state.attacker,
                attack: state.attacker.attack * 1.2,
                speed: state.attacker.speed ? state.attacker.speed * 1.2 : state.attacker.speed,
            },
            defender: { ...state.defender },
        };
    },
    "Lunar Ambush": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack * 2 - state.defender.defense);
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
            },
        };
    },

    // Common Moves
    "Basic Attack": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack - state.defender.defense);
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
            },
        };
    },
    "Defend": (state: BattleState): BattleState => {
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                defense: state.defender.defense * 1.3,
            },
        };
    },
    "Quick Strike": (state: BattleState): BattleState => {
        const damage = Math.max(0, state.attacker.attack * 0.8 - state.defender.defense);
        return {
            attacker: { ...state.attacker },
            defender: {
                ...state.defender,
                hp: state.defender.hp - damage,
            },
        };
    },
    "Charge Up": (state: BattleState): BattleState => {
        return {
            attacker: {
                ...state.attacker,
                attack: state.attacker.attack * 1.5,
            },
            defender: { ...state.defender },
        };
    },
    "Recover": (state: BattleState): BattleState => {
        return {
            attacker: {
                ...state.attacker,
                hp: state.attacker.hp + state.attacker.hp * 0.2,
            },
            defender: { ...state.defender },
        };
    },
};

export const getRandomMoves = (): { moveName: string; movePower: bigint }[] => {
    const moveNames = Object.keys(MovesFunctions);
    const selectedMoves: string[] = [];
    while (selectedMoves.length < 4) {
        const randomMove = moveNames[Math.floor(Math.random() * moveNames.length)];
        if (!selectedMoves.includes(randomMove)) {
            selectedMoves.push(randomMove);
        }
    }
    return selectedMoves.map(moveName => ({
        moveName,
        movePower: BigInt(0),
    }));
};
