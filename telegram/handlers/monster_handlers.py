import telebot
from services.blockchain_service import BlockchainService
from models.monster import Monster
import random

class MonsterHandlers:
    def __init__(self, bot, blockchain_service):
        self.bot = bot
        self.blockchain_service = blockchain_service
    
    def handle_mint_monster(self, message):
        """
        Handle monster minting request from Telegram
        """
        try:
            # Interactive monster creation process
            sent_msg = self.bot.send_message(
                message.chat.id, 
                "Let's create your monster! What's its name?"
            )
            self.bot.register_next_step_handler(
                sent_msg, 
                self.process_monster_creation
            )
        except Exception as e:
            self.bot.reply_to(message, f"Error: {str(e)}")
    
    def process_monster_creation(self, message):
        """
        Process interactive monster creation steps
        """
        try:
            monster_data = {
                'name': message.text,
                'attack': random.randint(10, 50),
                'defense': random.randint(5, 30),
                'hp': random.randint(50, 100),
                'rarity': random.choice(['common', 'rare', 'epic', 'legendary']),
                'token_uri': 'ipfs://example_uri'  # Generate dynamically
            }
            
            tx_hash = self.blockchain_service.mint_monster(
                message.from_user.id, 
                monster_data
            )
            
            self.bot.reply_to(
                message, 
                f"🐉 Monster {monster_data['name']} minted! \n"
                f"Rarity: {monster_data['rarity']}\n"
                f"Transaction: {tx_hash.hex()}"
            )
        except Exception as e:
            self.bot.reply_to(message, f"Minting failed: {str(e)}")