import telebot
from config.settings import Config
from services.blockchain_service import BlockchainService
from handlers.battle_handlers import BattleHandler
from handlers.trade_handlers import TradeHandler

def main():
    # Initialize the bot and services
    bot = telebot.TeleBot(Config.BOT_TOKEN)
    blockchain_service = BlockchainService()
    
    # Initialize handlers
    battle_handler = BattleHandler(bot, blockchain_service)
    trade_handler = TradeHandler(bot, blockchain_service)

    # Register command handlers
    @bot.message_handler(commands=['start'])
    def send_welcome(message):
        bot.reply_to(message, "Welcome to Orphic Monster Game! 🐉\n"
                              "/mint - Mint a new monster\n"
                              "/mymonsters - View your monsters\n"
                              "/battle - Challenge a friend\n"
                              "/trade - Trade monsters")

    @bot.message_handler(commands=['battle'])
    def handle_battle(message):
        battle_handler.initiate_battle(message)

    @bot.message_handler(commands=['trade'])
    def handle_trade(message):
        trade_handler.initiate_trade(message)

    # Start polling for messages
    print("Orphic Monster Game Bot is running...")
    bot.polling(none_stop=True)

if __name__ == '__main__':
    main()