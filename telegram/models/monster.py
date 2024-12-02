from dataclasses import dataclass

@dataclass
class Monster:
    token_id: int
    name: str
    attack: int
    defense: int
    hp: int
    rarity: str
    owner: str
    token_uri: str

    @classmethod
    def from_contract_data(cls, contract_data):
        """
        Create Monster instance from contract return data
        """
        return cls(
            token_id=contract_data[0],
            name=contract_data[1],
            attack=contract_data[2],
            defense=contract_data[3],
            hp=contract_data[4],
            rarity=contract_data[5],
            token_uri=contract_data[6],
            owner=None  # Set separately
        )