// SPDX-License-Identifier: MIT

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

pragma solidity ^0.8.27;

contract OrphicGameEngine is ERC721 {
    error OrphicGameEngine__InvalidRarity();

    uint256 public tokenCounter;
    string public monsterURI;
    string public faction;

    mapping(address => uint8) playerFaction;

    enum rarity {
        common,
        rare,
        epic,
        legendary
    }

    struct MonsterAttributes {
        string name;
        uint256 attack;
        uint256 defense;
        uint256 hp;
        string rarity;
    }

    mapping(uint256 => MonsterAttributes) public monsterAttributes;

    event MonsterMinted(address indexed owner, uint256 tokenId, string monsterName);

    constructor() ERC721("Monsters", "MON") {
        tokenCounter = 0;
    }

    function mintMonster(string memory _name, uint256 _attack, uint256 _defense, uint256 _hp, rarity _rarity) public {
        _safeMint(msg.sender, tokenCounter);

        monsterAttributes[tokenCounter] = MonsterAttributes({
            name: _name,
            attack: _attack,
            defense: _defense,
            hp: _hp,
            rarity: _rarityToString(_rarity)
        });

        emit MonsterMinted(msg.sender, tokenCounter, _name);

        tokenCounter++;
    }

    function setPlayerFaction(address _player, uint8 _factionID) public {
        playerFaction[_player] = _factionID;
    }

    function _rarityToString(rarity _rarity) internal pure returns (string memory) {
        if (_rarity == rarity.common) return "common";
        if (_rarity == rarity.rare) return "rare";
        if (_rarity == rarity.epic) return "epic";
        if (_rarity == rarity.legendary) return "legendary";
        revert OrphicGameEngine__InvalidRarity();
    }

    // function _isAuthorized(address player, uint256 tokenID) internal view returns (bool) {
    //     address owner = _ownerOf(tokenID);
    //     return (owner == player || isApprovedForAll(owner, player) || _getApproved(tokenID) == player);
    // }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        string memory imageURI = monsterURI;

        MonsterAttributes memory monster = monsterAttributes[tokenId];

        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            monster.name,
                            '", "description":"An NFT that reflects the mood of the owner, 100% on Chain!", ',
                            '"attributes": [',
                            '{"trait_type": "Attack", "value": "',
                            monster.attack,
                            '"},',
                            '{"trait_type": "Defense", "value": "',
                            _toString(monster.defense),
                            '"},',
                            '{"trait_type": "HP", "value": "',
                            monster.hp,
                            '"},',
                            '{"trait_type": "Rarity", "value": "',
                            monster.rarity,
                            '"}',
                            '], "image":"',
                            imageURI,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function getPlayerFaction(address player) public view returns (uint8) {
        return playerFaction[player];
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }
}
