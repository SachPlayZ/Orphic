// SPDX-License-Identifier: MIT

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

pragma solidity ^0.8.27;

contract OrphicGameEngine is ERC721 {
    error OrphicGameEngine__InvalidRarity();

    uint256 public tokenCounter;

    mapping(address => uint8) public playerFaction;
    mapping(address => uint256[]) public userTokens;
    mapping(address => uint256) public userTokenCount;

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
        string tokenURI;
    }

    mapping(uint256 => MonsterAttributes) public monsterAttributes;

    event MonsterMinted(
        address indexed owner,
        uint256 tokenId,
        string monsterName
    );

    constructor() ERC721("Monsters", "MON") {
        tokenCounter = 0;
    }

    function mintMonster(
        string memory _tokenURI,
        string memory _name,
        uint256 _attack,
        uint256 _defense,
        uint256 _hp,
        rarity _rarity
    ) public {
        _safeMint(msg.sender, tokenCounter);

        monsterAttributes[tokenCounter] = MonsterAttributes({
            name: _name,
            attack: _attack,
            defense: _defense,
            hp: _hp,
            rarity: _rarityToString(_rarity),
            tokenURI: _tokenURI
        });

        userTokens[msg.sender].push(tokenCounter);
        userTokenCount[msg.sender]++;

        emit MonsterMinted(msg.sender, tokenCounter, _name);

        tokenCounter++;
    }

    function setPlayerFaction(address _player, uint8 _factionID) public {
        playerFaction[_player] = _factionID;
    }

    function _rarityToString(
        rarity _rarity
    ) internal pure returns (string memory) {
        if (_rarity == rarity.common) return "common";
        if (_rarity == rarity.rare) return "rare";
        if (_rarity == rarity.epic) return "epic";
        if (_rarity == rarity.legendary) return "legendary";
        revert OrphicGameEngine__InvalidRarity();
    }

    function rarityToString(
        rarity _rarity
    ) public pure returns (string memory) {
        return _rarityToString(_rarity);
    }

    function getMonsterDetails(
        uint256 tokenId
    )
        public
        view
        returns (
            string memory monsterName,
            uint256 attack,
            uint256 defense,
            uint256 hp,
            string memory monsterRarity,
            string memory monsterTokenURI
        )
    {
        MonsterAttributes memory monster = monsterAttributes[tokenId];
        return (
            monster.name,
            monster.attack,
            monster.defense,
            monster.hp,
            monster.rarity,
            monster.tokenURI
        );
    }

    function getUserTokens(
        address user
    ) public view returns (uint256[] memory) {
        return userTokens[user];
    }

    function getUserTokenCount(address user) public view returns (uint256) {
        return userTokenCount[user];
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        return monsterAttributes[tokenId].tokenURI;
    }

    function getAllMonstersFromAUser(
        address user
    ) public view returns (MonsterAttributes[] memory) {
        uint256[] memory tokenIds = userTokens[user];
        uint256 count = tokenIds.length;
        MonsterAttributes[] memory monsters = new MonsterAttributes[](count);

        for (uint256 i = 0; i < count; i++) {
            monsters[i] = monsterAttributes[tokenIds[i]];
        }

        return monsters;
    }

    function getTokenCounter() public view returns (uint256) {
        return tokenCounter;
    }
}
