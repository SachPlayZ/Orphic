from web3 import Web3
import json
from config.settings import Config

class BlockchainError(Exception):
    pass


class BlockchainService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(Config.NETWORK_RPC_URL))
        
        with open('config/contract_abi.json', 'r') as abi_file:
            contract_abi = json.load(abi_file)
        
        self.contract = self.w3.eth.contract(
            address=Config.CONTRACT_ADDRESS, 
            abi=contract_abi
        )
    
    def mint_monster(self, player_address, monster_data):
        """
        Mint a new monster NFT for a player
        
        :param player_address: Wallet address of the player
        :param monster_data: Dictionary containing monster attributes
        :return: Transaction hash
        """
        try:
            tx = self.contract.functions.mintMonster(
                monster_data['token_uri'],
                monster_data['name'],
                monster_data['attack'],
                monster_data['defense'],
                monster_data['hp'],
                monster_data['rarity']
            ).build_transaction({
                'from': player_address,
                'nonce': self.w3.eth.get_transaction_count(player_address),
                'gas': 200000,
                'gasPrice': self.w3.eth.gas_price
            })
            
            signed_tx = self.w3.eth.account.sign_transaction(tx, Config.PRIVATE_KEY)
            return self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        except Exception as e:
            raise BlockchainError(f"Monster minting failed: {str(e)}")