import random
from typing import Dict, List, Any
from config.settings import Config

class BattleService:
    MOVESET = {
        "Dragon": {
            "Fire Blast": "Deals high fire-based AoE damage to all enemies.",
            "Wing Shield": "Reduces incoming damage by 50% for 2 turns.",
            "Ancient Roar": "Reduces all enemies' Speed and Defense stats.",
            "Sky Strike": "Launches a high-impact attack from the air.",
            "Inferno Surge": "Unleashes a devastating firestorm."
        },
        "Tiger": {
            "Tiger Claw": "Delivers a powerful single-target slash.",
            "Shadow Leap": "Instantly evades the next attack.",
            "Pounce Strike": "Deals damage based on the target's Speed.",
            "Ferocious Howl": "Boosts Attack and Speed stats.",
            "Lunar Ambush": "Stealth-based attack with massive damage."
        },
        "Basic": {
            "Basic Attack": "Deals small single-target damage.",
            "Defend": "Reduces incoming damage.",
            "Quick Strike": "Fast, low-damage attack.",
            "Charge Up": "Increases the power of the next move.",
            "Recover": "Restores a small percentage of Health."
        }
    }

    @staticmethod
    def calculate_move_damage(attacker: Dict[str, Any], 
                               defender: Dict[str, Any], 
                               move: str) -> Dict[str, Any]:
        """
        Calculate damage and effects for a specific move
        """
        base_damage = attacker['attack'] - defender['defense']
        
        # Move-specific calculations
        if move == "Fire Blast":
            damage = base_damage * 1.5
            burn_chance = 0.3
            return {
                'damage': damage,
                'burn': random.random() < burn_chance
            }
        
        elif move == "Tiger Claw":
            crit_chance = 0.3
            damage = base_damage * (2 if random.random() < crit_chance else 1)
            return {'damage': damage}
        
        # Default basic attack
        return {'damage': max(0, base_damage)}

    @staticmethod
    def execute_battle(monster1: Dict[str, Any], 
                       monster2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a turn-based battle between two monsters
        """
        battle_log = []
        current_monster1_hp = monster1['hp']
        current_monster2_hp = monster2['hp']

        while current_monster1_hp > 0 and current_monster2_hp > 0:
            # Monster 1's turn
            move1 = random.choice(list(BattleService.MOVESET[monster1['type']].keys()))
            damage1 = BattleService.calculate_move_damage(
                {'attack': monster1['attack'], 'defense': monster2['defense']},
                {'defense': monster2['defense']},
                move1
            )
            current_monster2_hp -= damage1['damage']
            
            battle_log.append(f"{monster1['name']} used {move1}, dealing {damage1['damage']} damage!")

            if current_monster2_hp <= 0:
                break

            # Monster 2's turn
            move2 = random.choice(list(BattleService.MOVESET[monster2['type']].keys()))
            damage2 = BattleService.calculate_move_damage(
                {'attack': monster2['attack'], 'defense': monster1['defense']},
                {'defense': monster1['defense']},
                move2
            )
            current_monster1_hp -= damage2['damage']
            
            battle_log.append(f"{monster2['name']} used {move2}, dealing {damage2['damage']} damage!")

        winner = monster1 if current_monster1_hp > 0 else monster2
        loser = monster2 if current_monster1_hp > 0 else monster1

        return {
            'winner': winner,
            'loser': loser,
            'battle_log': battle_log
        }

class TradeService:
    @staticmethod
    def validate_trade(monster1: Dict[str, Any], 
                       monster2: Dict[str, Any]) -> bool:
        """
        Validate if a trade is possible between two monsters
        """
        # Example trade rules
        rarity_order = ['common', 'rare', 'epic', 'legendary']
        
        # Ensure monsters are of similar rarity or within one tier
        monster1_rarity_index = rarity_order.index(monster1['rarity'])
        monster2_rarity_index = rarity_order.index(monster2['rarity'])
        
        return abs(monster1_rarity_index - monster2_rarity_index) <= 1

    @staticmethod
    def execute_trade(monster1: Dict[str, Any], 
                      monster2: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a trade between two monsters
        """
        if not TradeService.validate_trade(monster1, monster2):
            return {
                'success': False,
                'reason': 'Trade not allowed due to rarity mismatch'
            }
        
        # Simulate trade (in real implementation, use blockchain transfer)
        return {
            'success': True,
            'traded_monsters': [monster1, monster2]
        }