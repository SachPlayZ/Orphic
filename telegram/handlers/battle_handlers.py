import telebot
from services.battle_service import BattleService
from services.blockchain_service import BlockchainService

class BattleHandler:
    def __init__(self, bot: telebot.TeleBot, 
                 blockchain_service: BlockchainService):
        self.bot = bot
        self.blockchain_service = blockchain_service
        self.battle_service = BattleService()
        self.ongoing_battles = {}

    def initiate_battle(self, message):
        """
        Start a battle request process
        """
        sent_msg = self.bot.send_message(
            message.chat.id, 
            "Mention the user you want to battle with @username"
        )
        self.bot.register_next_step_handler(sent_msg, self.select_monsters)

    def select_monsters(self, message):
        """
        Allow players to select their monsters for battle
        """
        challenger = message.from_user
        opponent_username = message.text.replace('@', '')
        
        # Fetch monsters for both players
        challenger_monsters = self.blockchain_service.get_user_monsters(challenger.id)
        opponent_monsters = self.blockchain_service.get_user_monsters(opponent_username)

        # Create inline keyboard for monster selection
        markup = telebot.types.InlineKeyboardMarkup()
        for monster in challenger_monsters:
            markup.add(
                telebot.types.InlineKeyboardButton(
                    f"{monster['name']} (Rarity: {monster['rarity']})", 
                    callback_data=f"battle_select_challenger_{monster['token_id']}"
                )
            )

        self.bot.send_message(
            message.chat.id, 
            "Select your monster for battle:", 
            reply_markup=markup
        )

    def process_battle_callback(self, call):
        """
        Handle monster selection and battle execution
        """
        if call.data.startswith('battle_select_challenger'):
            challenger_monster_id = call.data.split('_')[-1]
            # Store in ongoing battles
            self.ongoing_battles[call.from_user.id] = {
                'challenger_monster': challenger_monster_id
            }
            
            # Prompt opponent monster selection
            # Similar to challenger monster selection
            pass

        elif call.data.startswith('battle_select_opponent'):
            opponent_monster_id = call.data.split('_')[-1] # Retrieve monsters from ongoing battles
            challenger_monster = self.ongoing_battles[call.from_user.id]['challenger_monster']
            opponent_monster = opponent_monster_id  # Assume this is retrieved from the ongoing battles

            # Execute the battle
            battle_result = self.battle_service.execute_battle(challenger_monster, opponent_monster)

            # Send battle results to both players
            self.bot.send_message(
                call.message.chat.id,
                f"🏆 Battle Result:\n"
                f"{battle_result['winner']['name']} wins against {battle_result['loser']['name']}!\n"
                f"Battle Log:\n" + "\n".join(battle_result['battle_log'])
            )

            # Clean up ongoing battles
            del self.ongoing_battles[call.from_user.id]