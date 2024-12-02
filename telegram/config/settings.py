import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    NETWORK_RPC_URL = os.getenv('NETWORK_RPC_URL')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS')
    PRIVATE_KEY = os.getenv('PRIVATE_KEY')
    
    BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
    
    BATTLE_COOLDOWN = 3600
    MAX_MONSTERS_PER_PLAYER = 10
    
    RARITY_MULTIPLIERS = {
        'common': 1.0,
        'rare': 1.5,
        'epic': 2.0,
        'legendary': 3.0
    }