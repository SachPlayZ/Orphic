// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/OrphicGameEngine.sol";

contract OrphicGameEngineTest is Test {
    OrphicGameEngine gameEngine;

    address player1 = address(0x1);
    address player2 = address(0x2);

    function setUp() public {
        gameEngine = new OrphicGameEngine();
    }

    function testMintMonster() public {
        string memory tokenURI = "https://example.com/monster1";
        string memory name = "Fire Dragon";
        uint256 attack = 100;
        uint256 defense = 80;
        uint256 hp = 120;
        OrphicGameEngine.rarity monsterRarity = OrphicGameEngine.rarity.epic;

        vm.startPrank(player1);
        gameEngine.mintMonster(
            tokenURI,
            name,
            attack,
            defense,
            hp,
            monsterRarity
        );
        vm.stopPrank();

        assertEq(gameEngine.getTokenCounter(), 1);
        (
            string memory monsterName,
            uint256 monsterAttack,
            uint256 monsterDefense,
            uint256 monsterHp,
            string memory monsterRarityString,
            string memory monsterTokenURI
        ) = gameEngine.getMonsterDetails(0);

        assertEq(monsterName, name);
        assertEq(monsterAttack, attack);
        assertEq(monsterDefense, defense);
        assertEq(monsterHp, hp);
        assertEq(monsterRarityString, "epic");
        assertEq(monsterTokenURI, tokenURI);
    }

    function testSetPlayerFaction() public {
        uint8 factionID = 1;

        vm.startPrank(player1);
        gameEngine.setPlayerFaction(player1, factionID);
        vm.stopPrank();

        assertEq(gameEngine.playerFaction(player1), factionID);
    }

    function testSellOnMarket() public {
        string memory tokenURI = "https://example.com/monster1";
        string memory name = "Fire Dragon";
        uint256 attack = 100;
        uint256 defense = 80;
        uint256 hp = 120;
        OrphicGameEngine.rarity monsterRarity = OrphicGameEngine.rarity.epic;

        vm.startPrank(player1);
        gameEngine.mintMonster(
            tokenURI,
            name,
            attack,
            defense,
            hp,
            monsterRarity
        );
        gameEngine.sellOnMarket(0, 1 ether);
        vm.stopPrank();

        (uint256 id, address seller, uint256 price) = gameEngine.marketItems(0);
        assertEq(price, 1 ether);
        assertEq(seller, player1);
    }

    function testBuyFromMarket() public {
        string memory tokenURI = "https://example.com/monster1";
        string memory name = "Fire Dragon";
        uint256 attack = 100;
        uint256 defense = 80;
        uint256 hp = 120;
        OrphicGameEngine.rarity monsterRarity = OrphicGameEngine.rarity.epic;

        vm.startPrank(player1);
        gameEngine.mintMonster(
            tokenURI,
            name,
            attack,
            defense,
            hp,
            monsterRarity
        );
        gameEngine.sellOnMarket(0, 1 ether);
        vm.stopPrank();

        vm.startPrank(player2);
        vm.deal(player2, 2 ether); // Send ether to player2
        gameEngine.buyFromMarket(0);
        vm.stopPrank();

        assertEq(gameEngine.ownerOf(0), player2);
        (, , uint256 price) = gameEngine.marketItems(0);
        assertEq(price, 0); // Item should no longer be listed
    }

    function testCannotBuyUnlistedItem() public {
        vm.startPrank(player2);
        vm.expectRevert("Item not listed for sale");
        gameEngine.buyFromMarket(0);
        vm.stopPrank();
    }

    function testCannotSellAlreadyListedItem() public {
        string memory tokenURI = "https://example.com/monster1";
        string memory name = "Fire Dragon";
        uint256 attack = 100;
        uint256 defense = 80;
        uint256 hp = 120;
        OrphicGameEngine.rarity monsterRarity = OrphicGameEngine.rarity.epic;

        vm.startPrank(player1);
        gameEngine.mintMonster(
            tokenURI,
            name,
            attack,
            defense,
            hp,
            monsterRarity
        );
        gameEngine.sellOnMarket(0, 1 ether);

        vm.expectRevert("Item already listed");
        gameEngine.sellOnMarket(0, 2 ether); // Attempt to sell the same item again
        vm.stopPrank();
    }
}
