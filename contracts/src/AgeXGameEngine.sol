// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GamingNFTMarketplace
 * @dev A comprehensive gaming NFT marketplace that handles both Monsters and Items
 * Monsters have stats, moves, rarity, and IPFS images, while Items provide stat boosts
 * Includes a full marketplace functionality for trading NFTs
 */
contract GamingNFTMarketplace is ERC721, ReentrancyGuard, Ownable {
    // --- State Variables ---
    uint256 private _nextMonsterId = 1;
    uint256 private _nextItemId = 1;

    // --- Enums ---
    enum ItemType {
        ATTACK,
        DEFENSE,
        HP
    }

    enum Rarity {
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY
    }

    // --- Structs ---
    struct Move {
        string moveName;
        uint256 movePower;
    }

    struct Monster {
        string name;
        uint256 attack;
        uint256 defense;
        uint256 hp;
        uint256 moveCount;
        Rarity rarity;
        string ipfsHash;
        bool isMonster;
        bool isDeleted;
    }

    struct Item {
        ItemType itemType;
        uint256 boostAmount;
        Rarity rarity;
        string ipfsHash;
        bool isItem;
        bool isDeleted;
    }

    struct MarketItem {
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price;
        bool isListed;
        bool isMonster;
    }

    // Extended struct for monster data with moves
    struct MonsterWithMoves {
        Monster monster;
        Move[] moves;
    }

    // --- Mappings ---
    mapping(uint256 => Monster) public monsters;
    mapping(uint256 => mapping(uint256 => Move)) public monsterMoves;
    mapping(uint256 => Item) public items;
    mapping(uint256 => MarketItem) public marketItems;
    mapping(address => uint8) public playerFaction;

    // Add faction constants
    uint8 public constant FACTION_ONE = 1;
    uint8 public constant FACTION_TWO = 2;

    // --- Events ---
    event MonsterMinted(
        uint256 indexed tokenId,
        string name,
        Rarity rarity,
        address owner
    );
    event ItemMinted(
        uint256 indexed tokenId,
        ItemType itemType,
        Rarity rarity,
        uint256 boostAmount
    );
    event MarketItemListed(
        uint256 indexed tokenId,
        address seller,
        uint256 price
    );
    event MarketItemSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    event FactionSet(address indexed player, uint8 factionId);

    // --- Custom Errors ---
    error InvalidPrice();
    error NotOwner();
    error NotListed();
    error PriceMismatch();
    error InsufficientFunds();
    error TransferFailed();
    error TokenDoesNotExist();
    error InvalidMovesetLength();
    error InvalidMovePower();
    error InvalidBoostAmount();
    error InvalidAddress();
    error MarketplaceNotApproved();
    error TokenAlreadyListed();
    error NoTokensOwned();
    error InvalidFactionId();

    // --- Constructor ---
    constructor() ERC721("GameNFT", "GNFT") Ownable(msg.sender) {}

    // --- Monster Management Functions ---

    function burn(uint256 tokenId) internal {
        if (monsters[tokenId].isMonster) {
            monsters[tokenId].isDeleted = true;
        } else if (items[tokenId].isItem) {
            items[tokenId].isDeleted = true;
        }
        _burn(tokenId);
    }

    /**
     * @dev Mints a new Monster NFT with specified stats, moves, rarity, and IPFS hash
     */
    function mintMonster(
        string memory name,
        uint256 attack,
        uint256 defense,
        uint256 hp,
        Move[] memory moveset,
        Rarity rarity,
        string memory ipfsHash
    ) external returns (uint256) {
        if (moveset.length == 0 || moveset.length > 4)
            revert InvalidMovesetLength();

        for (uint i = 0; i < moveset.length; i++) {
            if (moveset[i].movePower == 0) revert InvalidMovePower();
        }

        uint256 newMonsterId = _nextMonsterId;
        _nextMonsterId++;

        _safeMint(msg.sender, newMonsterId);

        monsters[newMonsterId] = Monster({
            name: name,
            attack: attack,
            defense: defense,
            hp: hp,
            moveCount: moveset.length,
            rarity: rarity,
            ipfsHash: ipfsHash,
            isMonster: true,
            isDeleted: false
        });

        for (uint256 i = 0; i < moveset.length; i++) {
            monsterMoves[newMonsterId][i] = Move({
                moveName: moveset[i].moveName,
                movePower: moveset[i].movePower
            });
        }

        emit MonsterMinted(newMonsterId, name, rarity, msg.sender);
        return newMonsterId;
    }

    /**
     * @dev Mints a new Item NFT with specified boost, rarity, and IPFS hash
     */
    function mintItem(
        ItemType itemType,
        uint256 boostAmount,
        Rarity rarity,
        string memory ipfsHash
    ) external returns (uint256) {
        if (boostAmount == 0) revert InvalidBoostAmount();

        uint256 newItemId = _nextItemId;
        _nextItemId++;

        _safeMint(msg.sender, newItemId);

        items[newItemId] = Item({
            itemType: itemType,
            boostAmount: boostAmount,
            rarity: rarity,
            ipfsHash: ipfsHash,
            isItem: true,
            isDeleted: false
        });

        emit ItemMinted(newItemId, itemType, rarity, boostAmount);
        return newItemId;
    }

    // --- Marketplace Functions ---

    /**
     * @dev Lists an NFT for sale in the marketplace
     */
    function listNFTForSale(uint256 tokenId, uint256 price) external {
        if (price <= 0) revert InvalidPrice();
        if (ownerOf(tokenId) != msg.sender) revert NotOwner();
        if (marketItems[tokenId].isListed) revert TokenAlreadyListed();
        if (!isApprovedForAll(msg.sender, address(this)))
            revert MarketplaceNotApproved();

        marketItems[tokenId] = MarketItem({
            tokenId: tokenId,
            seller: msg.sender,
            owner: address(this),
            price: price,
            isListed: true,
            isMonster: monsters[tokenId].isMonster
        });

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemListed(tokenId, msg.sender, price);
    }

    /**
     * @dev Allows a user to purchase a listed NFT
     */
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        MarketItem storage item = marketItems[tokenId];
        if (!item.isListed) revert NotListed();
        if (msg.value != item.price) revert PriceMismatch();

        item.isListed = false;
        _transfer(address(this), msg.sender, tokenId);

        (bool sent, ) = payable(item.seller).call{value: msg.value}("");
        if (!sent) revert TransferFailed();

        emit MarketItemSold(tokenId, item.seller, msg.sender, item.price);
    }

    // --- Getter Functions ---

    /**
     * @dev Retrieves all monsters with their movesets owned by a specific address
     */
    function getUserMonsters(
        address user
    ) external view returns (MonsterWithMoves[] memory) {
        if (user == address(0)) revert InvalidAddress();

        uint256 monsterCount = 0;
        for (uint256 i = 1; i < _nextMonsterId; i++) {
            if (
                ownerOf(i) == user &&
                monsters[i].isMonster &&
                !monsters[i].isDeleted
            ) {
                monsterCount++;
            }
        }

        if (monsterCount == 0) revert NoTokensOwned();

        MonsterWithMoves[] memory userMonsters = new MonsterWithMoves[](
            monsterCount
        );
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < _nextMonsterId; i++) {
            if (
                ownerOf(i) == user &&
                monsters[i].isMonster &&
                !monsters[i].isDeleted
            ) {
                Move[] memory moves = new Move[](monsters[i].moveCount);
                for (uint256 j = 0; j < monsters[i].moveCount; j++) {
                    moves[j] = monsterMoves[i][j];
                }

                userMonsters[currentIndex] = MonsterWithMoves({
                    monster: monsters[i],
                    moves: moves
                });
                currentIndex++;
            }
        }

        return userMonsters;
    }

    /**
     * @dev Retrieves all items owned by a specific address
     */
    function getUserItems(address user) external view returns (Item[] memory) {
        if (user == address(0)) revert InvalidAddress();

        uint256 itemCount = 0;
        for (uint256 i = 1; i < _nextItemId; i++) {
            if (ownerOf(i) == user && items[i].isItem && !items[i].isDeleted) {
                itemCount++;
            }
        }

        if (itemCount == 0) revert NoTokensOwned();

        Item[] memory userItems = new Item[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i < _nextItemId; i++) {
            if (ownerOf(i) == user && items[i].isItem && !items[i].isDeleted) {
                userItems[currentIndex] = items[i];
                currentIndex++;
            }
        }

        return userItems;
    }

    /**
     * @dev Gets the complete moveset for a monster
     */
    function getMonsterMoveset(
        uint256 tokenId
    ) external view returns (Move[] memory) {
        if (!monsters[tokenId].isMonster || monsters[tokenId].isDeleted)
            revert TokenDoesNotExist();

        uint256 moveCount = monsters[tokenId].moveCount;
        Move[] memory moves = new Move[](moveCount);

        for (uint256 i = 0; i < moveCount; i++) {
            moves[i] = monsterMoves[tokenId][i];
        }

        return moves;
    }

    /**
     * @dev Gets a specific move from a monster's moveset
     */
    function getMonsterMove(
        uint256 tokenId,
        uint256 moveIndex
    ) external view returns (Move memory) {
        if (!monsters[tokenId].isMonster || monsters[tokenId].isDeleted)
            revert TokenDoesNotExist();
        if (moveIndex >= monsters[tokenId].moveCount)
            revert InvalidMovesetLength();

        return monsterMoves[tokenId][moveIndex];
    }

    /**
     * @dev Gets the boost type and amount for an item
     */
    function getItemBoost(
        uint256 tokenId
    ) external view returns (ItemType, uint256) {
        if (!items[tokenId].isItem || items[tokenId].isDeleted)
            revert TokenDoesNotExist();
        Item memory item = items[tokenId];
        return (item.itemType, item.boostAmount);
    }

    // --- Counter Getters ---

    function getTotalMonsters() external view returns (uint256) {
        return _nextMonsterId - 1;
    }

    function getTotalItems() external view returns (uint256) {
        return _nextItemId - 1;
    }

    function getMarketItem(
        uint256 tokenId
    ) external view returns (MarketItem memory) {
        return marketItems[tokenId];
    }

    /**
     * @dev Sets or updates a player's faction
     * @param factionId The ID of the faction (1 or 2)
     */
    function setPlayerFaction(uint8 factionId) external {
        if (factionId != FACTION_ONE && factionId != FACTION_TWO)
            revert InvalidFactionId();
        playerFaction[msg.sender] = factionId;
        emit FactionSet(msg.sender, factionId);
    }

    /**
     * @dev Admin function to set faction for a specific player
     * @param player The address of the player
     * @param factionId The ID of the faction (1 or 2)
     */
    function setPlayerFactionByAdmin(
        address player,
        uint8 factionId
    ) external onlyOwner {
        if (factionId != FACTION_ONE && factionId != FACTION_TWO)
            revert InvalidFactionId();
        if (player == address(0)) revert InvalidAddress();
        playerFaction[player] = factionId;
        emit FactionSet(player, factionId);
    }

    /**
     * @dev Gets a player's faction
     * @param player The address of the player
     * @return The faction ID of the player (0 if not set)
     */
    function getPlayerFaction(address player) external view returns (uint8) {
        return playerFaction[player];
    }
}
