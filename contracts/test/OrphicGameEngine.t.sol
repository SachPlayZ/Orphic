// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/OrphicGameEngine.sol";

contract OrphicGameEngineTest is Test {
    OrphicGameEngine private engine;

    address private user1 = address(0x1);
    address private user2 = address(0x2);

    function setUp() public {
        engine = new OrphicGameEngine();
    }

    function testMintMonster() public {
        vm.startPrank(user1);

        string memory tokenURI = "https://example.com/monster1.json";
        string memory name = "Fire Dragon";
        uint256 attack = 100;
        uint256 defense = 50;
        uint256 hp = 200;
        OrphicGameEngine.rarity monsterRarity = OrphicGameEngine.rarity.epic;

        engine.mintMonster(tokenURI, name, attack, defense, hp, monsterRarity);

        uint256 tokenId = 0;

        // Check token ownership
        assertEq(engine.ownerOf(tokenId), user1);

        // Check monster attributes
        (
            string memory monsterName,
            uint256 monsterAttack,
            uint256 monsterDefense,
            uint256 monsterHp,
            string memory monsterRarityString,
            string memory monsterTokenURI
        ) = engine.getMonsterDetails(tokenId);

        assertEq(monsterName, name);
        assertEq(monsterAttack, attack);
        assertEq(monsterDefense, defense);
        assertEq(monsterHp, hp);
        assertEq(monsterRarityString, "epic");
        assertEq(monsterTokenURI, tokenURI);

        vm.stopPrank();
    }

    function testGetAllMonstersFromAUser() public {
        vm.startPrank(user1);

        engine.mintMonster(
            "https://example.com/monster1.json",
            "Fire Dragon",
            100,
            50,
            200,
            OrphicGameEngine.rarity.epic
        );

        engine.mintMonster(
            "https://example.com/monster2.json",
            "Water Serpent",
            80,
            60,
            180,
            OrphicGameEngine.rarity.rare
        );

        OrphicGameEngine.MonsterAttributes[] memory monsters = engine
            .getAllMonstersFromAUser(user1);

        assertEq(monsters.length, 2);

        assertEq(monsters[0].name, "Fire Dragon");
        assertEq(monsters[1].name, "Water Serpent");

        vm.stopPrank();
    }

    function testSetAndRetrievePlayerFaction() public {
        uint8 factionId = 2;
        engine.setPlayerFaction(user1, factionId);
        assertEq(engine.playerFaction(user1), factionId);
    }

    function testGetUserTokenCount() public {
        vm.startPrank(user1);

        engine.mintMonster(
            "https://example.com/monster1.json",
            "Fire Dragon",
            100,
            50,
            200,
            OrphicGameEngine.rarity.epic
        );

        engine.mintMonster(
            "https://example.com/monster2.json",
            "Water Serpent",
            80,
            60,
            180,
            OrphicGameEngine.rarity.rare
        );

        assertEq(engine.getUserTokenCount(user1), 2);

        vm.stopPrank();
    }

    function testGetUserTokens() public {
        vm.startPrank(user2);

        engine.mintMonster(
            "https://example.com/monster1.json",
            "Ice Phoenix",
            110,
            70,
            210,
            OrphicGameEngine.rarity.legendary
        );

        uint256[] memory tokens = engine.getUserTokens(user2);

        assertEq(tokens.length, 1);
        assertEq(tokens[0], 0); // Token ID of the minted monster

        vm.stopPrank();
    }

    function testTokenURI() public {
        vm.startPrank(user1);

        string memory tokenURI = "https://example.com/monster1.json";
        engine.mintMonster(
            tokenURI,
            "Fire Dragon",
            100,
            50,
            200,
            OrphicGameEngine.rarity.epic
        );

        uint256 tokenId = 0;
        assertEq(engine.tokenURI(tokenId), tokenURI);

        vm.stopPrank();
    }
}
