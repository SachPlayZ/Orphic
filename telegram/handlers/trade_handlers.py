import telebot
from services.trade_service import TradeService
from services.blockchain_service import BlockchainService

class TradeHandler:
    def __init__(self, bot: telebot.TeleBot, 
                 blockchain_service: BlockchainService):
        self.bot = bot
        self.blockchain_service = blockchain_service
        self.trade_service = TradeService()

    def initiate_trade(self, message):
        """
        Start a trade request process
        """
        sent_msg = self.bot.send_message(
            message.chat.id, 
            "Mention the user you want to trade with @username"
        )
        self.bot.register_next_step_handler(sent_msg, self.select_trade_monsters)

    def select_trade_monsters(self, message):
        """
        Allow players to select their monsters for trade
        """
        trader = message.from_user
        tradee_username = message.text.replace('@', '')
        
        # Fetch monsters for both players
        trader_monsters = self.blockchain_service.get_user_monsters(trader.id)
        tradee_monsters = self.blockchain_service.get_user_monsters(tradee_username)

        # Create inline keyboard for monster selection
        markup = telebot.types.InlineKeyboardMarkup()
        for monster in trader_monsters:
            markup.add(
                telebot.types.InlineKeyboardButton(
                    f"{monster['name']} (Rarity: {monster['rarity']})", 
                    callback_data=f"trade_select_trader_{monster['token_id']}"
                )
            )

        self.bot.send_message(
            message.chat.id, 
            "Select your monster for trade:", 
            reply_markup=markup
        )

    def process_trade_callback(self, call):
        """
        Handle monster selection and trade execution
        """
        if call.data.startswith('trade_select_trader'):
            trader_monster_id = call.data.split('_')[-1]
            # Store in ongoing trades
            self.ongoing_trades[call.from_user.id] = {
                'trader_monster': trader_monster_id
            }
            
            # Prompt tradee monster selection
            # Similar to trader monster selection
            pass

        elif call.data.startswith('trade_select_tradee'):
            tradee_monster_id = call.data.split('_')[-1]

            # Retrieve monsters from ongoing trades
            trader_monster = self.ongoing_trades[call.from_user.id]['trader_monster']
            tradee_monster = tradee_monster_id  # Assume this is retrieved from the ongoing trades

            # Execute the trade
            trade_result = self.trade_service.execute_trade(trader_monster, tradee_monster)

            if trade_result['success']:
                self.bot.send_message(
                    call.message.chat.id,
                    f"✅ Trade Successful!\n"
                    f"You traded {trader_monster['name']} for {tradee_monster['name']}!"
                )
            else:
                self.bot.send_message(
                    call.message.chat.id,
                    f"❌ Trade Failed: {trade_result['reason']}"
                )

            # Clean up ongoing trades
            del self.ongoing_trades[call.from_user.id]