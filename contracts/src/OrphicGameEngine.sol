// SPDX-License-Identifier: MIT

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

pragma solidity ^0.8.27;

contract OrphicGameEngine is ERC721 {
    error OrphicGameEngine__InvalidRarity();
    error OrphicGameEngine__NotOwner();
    error OrphicGameEngine__AlreadyListed();
    error OrphicGameEngine__NotListed();
    error OrphicGameEngine__PriceNotMet();

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

    struct MarketItem {
        uint256 tokenId;
        address seller;
        uint256 price;
    }

    mapping(uint256 => MonsterAttributes) public monsterAttributes;
    mapping(uint256 => MarketItem) public marketItems;

    event MonsterMinted(
        address indexed owner,
        uint256 tokenId,
        string monsterName
    );
    event MarketItemCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event MarketItemSold(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 price
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

    // New functions for NFT marketplace

    function getMarketItems() public view returns (MarketItem[] memory) {
        uint256 count = tokenCounter;
        MarketItem[] memory items = new MarketItem[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < count; i++) {
            if (marketItems[i].price > 0) {
                items[index] = marketItems[i];
                index++;
            }
        }

        // Resize the array to the actual number of items listed
        MarketItem[] memory listedItems = new MarketItem[](index);
        for (uint256 j = 0; j < index; j++) {
            listedItems[j] = items[j];
        }

        return listedItems;
    }

    function sellOnMarket(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the token");
        require(price > 0, "Price must be greater than zero");
        require(marketItems[tokenId].price == 0, "Item already listed");

        marketItems[tokenId] = MarketItem({
            tokenId: tokenId,
            seller: msg.sender,
            price: price
        });

        emit MarketItemCreated(tokenId, msg.sender, price);
    }

    function buyFromMarket(uint256 tokenId) public payable {
        MarketItem memory item = marketItems[tokenId];
        require(item.price > 0, "Item not listed for sale");
        require(msg.value >= item.price, "Insufficient funds sent");

        address seller = item.seller;

        // Transfer the token to the buyer
        _transfer(seller, msg.sender, tokenId);

        // Transfer the funds to the seller
        payable(seller).transfer(item.price);

        // Remove the item from the market
        delete marketItems[tokenId];

        emit MarketItemSold(tokenId, msg.sender, item.price);
    }
}
