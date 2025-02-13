// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AgeXGameEngine.sol";

contract GamingNFTMarketplaceTest is Test {
    GamingNFTMarketplace marketplace;

    // Test addresses
    address seller = address(1);
    address buyer = address(2);
    address other = address(3);

    // Common test variables
    string constant IPFS_HASH = "QmTest123";

    function setUp() public {
        marketplace = new GamingNFTMarketplace();
    }

    /*//////////////////////////////////////////////////////////////
                              Mint Monster
    //////////////////////////////////////////////////////////////*/

    function testMintMonsterSuccess() public {
        vm.prank(seller);
        GamingNFTMarketplace.Move[]
            memory moves = new GamingNFTMarketplace.Move[](1);
        moves[0] = GamingNFTMarketplace.Move("Punch", 10);

        marketplace.mintMonster(
            "Dragon",
            100,
            50,
            200,
            moves,
            GamingNFTMarketplace.Rarity.LEGENDARY,
            IPFS_HASH
        );

        // Get monster and its moves using the new MonsterWithMoves struct
        GamingNFTMarketplace.MonsterWithMoves[]
            memory userMonsters = marketplace.getUserMonsters(seller);
        GamingNFTMarketplace.Monster memory monster = userMonsters[0].monster;
        GamingNFTMarketplace.Move[] memory monsterMoves = userMonsters[0].moves;

        // Verify all monster properties including new fields
        assertEq(monster.name, "Dragon");
        assertEq(monster.attack, 100);
        assertEq(monster.defense, 50);
        assertEq(monster.hp, 200);
        assertEq(monster.moveCount, 1);
        assertEq(
            uint256(monster.rarity),
            uint256(GamingNFTMarketplace.Rarity.LEGENDARY)
        );
        assertEq(monster.ipfsHash, IPFS_HASH);
        assertTrue(monster.isMonster);
        assertFalse(monster.isDeleted);

        // Verify moves
        assertEq(monsterMoves.length, 1);
        assertEq(monsterMoves[0].moveName, "Punch");
        assertEq(monsterMoves[0].movePower, 10);
    }

    function testMintMonsterAllRarities() public {
        vm.startPrank(seller);
        GamingNFTMarketplace.Move[]
            memory moves = new GamingNFTMarketplace.Move[](1);
        moves[0] = GamingNFTMarketplace.Move("Basic", 5);

        // Test minting with each rarity level
        uint256[] memory tokenIds = new uint256[](5);
        tokenIds[0] = marketplace.mintMonster(
            "Common",
            50,
            25,
            100,
            moves,
            GamingNFTMarketplace.Rarity.COMMON,
            IPFS_HASH
        );
        tokenIds[1] = marketplace.mintMonster(
            "Uncommon",
            60,
            30,
            120,
            moves,
            GamingNFTMarketplace.Rarity.UNCOMMON,
            IPFS_HASH
        );
        tokenIds[2] = marketplace.mintMonster(
            "Rare",
            70,
            35,
            140,
            moves,
            GamingNFTMarketplace.Rarity.RARE,
            IPFS_HASH
        );
        tokenIds[3] = marketplace.mintMonster(
            "Epic",
            80,
            40,
            160,
            moves,
            GamingNFTMarketplace.Rarity.EPIC,
            IPFS_HASH
        );
        tokenIds[4] = marketplace.mintMonster(
            "Legendary",
            90,
            45,
            180,
            moves,
            GamingNFTMarketplace.Rarity.LEGENDARY,
            IPFS_HASH
        );
        vm.stopPrank();

        // Verify each monster's rarity
        GamingNFTMarketplace.MonsterWithMoves[] memory monsters = marketplace
            .getUserMonsters(seller);
        for (uint i = 0; i < 5; i++) {
            assertEq(uint256(monsters[i].monster.rarity), i);
        }
    }

    /*//////////////////////////////////////////////////////////////
                              Mint Item
    //////////////////////////////////////////////////////////////*/

    function testMintItemSuccess() public {
        vm.prank(seller);
        marketplace.mintItem(
            GamingNFTMarketplace.ItemType.ATTACK,
            20,
            GamingNFTMarketplace.Rarity.RARE,
            IPFS_HASH
        );

        GamingNFTMarketplace.Item[] memory items = marketplace.getUserItems(
            seller
        );
        GamingNFTMarketplace.Item memory item = items[0];

        assertEq(
            uint256(item.itemType),
            uint256(GamingNFTMarketplace.ItemType.ATTACK)
        );
        assertEq(item.boostAmount, 20);
        assertEq(
            uint256(item.rarity),
            uint256(GamingNFTMarketplace.Rarity.RARE)
        );
        assertEq(item.ipfsHash, IPFS_HASH);
        assertTrue(item.isItem);
        assertFalse(item.isDeleted);
    }

    function testMintItemAllRaritiesAndTypes() public {
        vm.startPrank(seller);

        // Test all combinations of ItemType and Rarity
        for (uint256 typeInt = 0; typeInt < 3; typeInt++) {
            for (uint256 rarityInt = 0; rarityInt < 5; rarityInt++) {
                GamingNFTMarketplace.ItemType itemType = GamingNFTMarketplace
                    .ItemType(typeInt);
                GamingNFTMarketplace.Rarity rarity = GamingNFTMarketplace
                    .Rarity(rarityInt);

                marketplace.mintItem(
                    itemType,
                    10 + rarityInt * 10, // Increasing boost amount with rarity
                    rarity,
                    IPFS_HASH
                );

                GamingNFTMarketplace.Item[] memory items = marketplace
                    .getUserItems(seller);
                GamingNFTMarketplace.Item memory item = items[items.length - 1];

                assertEq(uint256(item.itemType), typeInt);
                assertEq(uint256(item.rarity), rarityInt);
                assertEq(item.ipfsHash, IPFS_HASH);
            }
        }
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                         Marketplace Integration
    //////////////////////////////////////////////////////////////*/

    function testListAndBuyMonsterWithRarity() public {
        // Mint a legendary monster
        vm.startPrank(seller);
        GamingNFTMarketplace.Move[]
            memory moves = new GamingNFTMarketplace.Move[](1);
        moves[0] = GamingNFTMarketplace.Move("Ultimate", 100);

        uint256 tokenId = marketplace.mintMonster(
            "Mythical",
            200,
            100,
            500,
            moves,
            GamingNFTMarketplace.Rarity.LEGENDARY,
            IPFS_HASH
        );

        // List the monster
        marketplace.setApprovalForAll(address(marketplace), true);
        marketplace.listNFTForSale(tokenId, 2 ether);
        vm.stopPrank();

        // Buy the monster
        vm.deal(buyer, 2 ether);
        vm.prank(buyer);
        marketplace.buyNFT{value: 2 ether}(tokenId);

        // Verify the monster's properties after purchase
        GamingNFTMarketplace.MonsterWithMoves[]
            memory buyerMonsters = marketplace.getUserMonsters(buyer);
        GamingNFTMarketplace.Monster memory monster = buyerMonsters[0].monster;

        assertEq(
            uint256(monster.rarity),
            uint256(GamingNFTMarketplace.Rarity.LEGENDARY)
        );
        assertEq(monster.ipfsHash, IPFS_HASH);
    }

    function testGetUserMonstersWithMoves() public {
        vm.startPrank(seller);

        // Mint multiple monsters with different movesets
        GamingNFTMarketplace.Move[]
            memory moves1 = new GamingNFTMarketplace.Move[](2);
        moves1[0] = GamingNFTMarketplace.Move("Move1", 10);
        moves1[1] = GamingNFTMarketplace.Move("Move2", 20);

        GamingNFTMarketplace.Move[]
            memory moves2 = new GamingNFTMarketplace.Move[](1);
        moves2[0] = GamingNFTMarketplace.Move("Move3", 30);

        marketplace.mintMonster(
            "Monster1",
            100,
            50,
            200,
            moves1,
            GamingNFTMarketplace.Rarity.EPIC,
            IPFS_HASH
        );
        marketplace.mintMonster(
            "Monster2",
            150,
            75,
            300,
            moves2,
            GamingNFTMarketplace.Rarity.LEGENDARY,
            IPFS_HASH
        );

        vm.stopPrank();

        // Get all monsters with their moves
        GamingNFTMarketplace.MonsterWithMoves[]
            memory monstersWithMoves = marketplace.getUserMonsters(seller);

        // Verify first monster
        assertEq(monstersWithMoves[0].moves.length, 2);
        assertEq(monstersWithMoves[0].moves[0].moveName, "Move1");
        assertEq(monstersWithMoves[0].moves[1].moveName, "Move2");

        // Verify second monster
        assertEq(monstersWithMoves[1].moves.length, 1);
        assertEq(monstersWithMoves[1].moves[0].moveName, "Move3");
    }

    /*//////////////////////////////////////////////////////////////
                         Additional Edge Cases
    //////////////////////////////////////////////////////////////*/

    function testMintMonsterEmptyIPFS() public {
        vm.startPrank(seller);
        GamingNFTMarketplace.Move[]
            memory moves = new GamingNFTMarketplace.Move[](1);
        moves[0] = GamingNFTMarketplace.Move("Test", 10);

        // Should succeed even with empty IPFS hash
        marketplace.mintMonster(
            "Test",
            100,
            50,
            200,
            moves,
            GamingNFTMarketplace.Rarity.COMMON,
            ""
        );

        GamingNFTMarketplace.MonsterWithMoves[] memory monsters = marketplace
            .getUserMonsters(seller);
        assertEq(monsters[0].monster.ipfsHash, "");
        vm.stopPrank();
    }

    function testMintItemEmptyIPFS() public {
        vm.startPrank(seller);

        // Should succeed with empty IPFS hash
        marketplace.mintItem(
            GamingNFTMarketplace.ItemType.ATTACK,
            20,
            GamingNFTMarketplace.Rarity.COMMON,
            ""
        );

        GamingNFTMarketplace.Item[] memory items = marketplace.getUserItems(
            seller
        );
        assertEq(items[0].ipfsHash, "");
        vm.stopPrank();
    }
}
