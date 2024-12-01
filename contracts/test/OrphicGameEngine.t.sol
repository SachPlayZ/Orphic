// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import {Test, console} from "forge-std/Test.sol";
import {OrphicGameEngine} from "../src/OrphicGameEngine.sol";
import {DeployOrphicGameEngine} from "../script/DeployOrphicGameEngine.s.sol";

contract OrphicGameEngineTest is Test {
    OrphicGameEngine public orphicGameEngine;
    address public USER = makeAddr("user");
    address public ANOTHER_USER = makeAddr("anotherUser");

    function setUp() public {
        DeployOrphicGameEngine deployer = new DeployOrphicGameEngine();
        orphicGameEngine = deployer.run();
    }

    function testContractInitialization() public view {
        assertEq(orphicGameEngine.name(), "Monsters");
        assertEq(orphicGameEngine.symbol(), "MON");
        assertEq(orphicGameEngine.getTokenCounter(), 0);
    }

    function testMintMonster() public {
        vm.startPrank(USER);
        
        orphicGameEngine.mintMonster(
            "TestMonster", 
            50, 
            30, 
            100,
            OrphicGameEngine.rarity.common
        );

        assertEq(orphicGameEngine.getTokenCounter(), 1);

        (
            string memory name,
            uint256 attack,
            uint256 defense,
            uint256 hp,
            string memory rarity
        ) = orphicGameEngine.monsterAttributes(0);

        assertEq(name, "TestMonster");
        assertEq(attack, 50);
        assertEq(defense, 30);
        assertEq(hp, 100);
        assertEq(rarity, "common");

        assertEq(orphicGameEngine.ownerOf(0), USER);

        vm.stopPrank();
    }

    function testMintMultipleMonsters() public {
        vm.startPrank(USER);
        
        orphicGameEngine.mintMonster(
            "Monster1", 
            50, 
            30, 
            100, 
            OrphicGameEngine.rarity.common
        );
        orphicGameEngine.mintMonster(
            "Monster2", 
            70, 
            40, 
            120, 
            OrphicGameEngine.rarity.rare
        );

        assertEq(orphicGameEngine.getTokenCounter(), 2);
        vm.stopPrank();
    }

    function testTokenURI() public {
        vm.startPrank(USER);
        
        orphicGameEngine.mintMonster(
            "URITestMonster", 
            50, 
            30, 
            100, 
            OrphicGameEngine.rarity.epic
        );

        string memory tokenURI = orphicGameEngine.tokenURI(0);
        
        assertTrue(bytes(tokenURI).length > 0);
        assertTrue(keccak256(abi.encodePacked(tokenURI)) != keccak256(""));

        vm.stopPrank();
    }

    function testSetAndGetPlayerFaction() public {
        vm.startPrank(USER);
        
        orphicGameEngine.setPlayerFaction(USER, 1);
        
        assertEq(orphicGameEngine.getPlayerFaction(USER), 1);

        vm.stopPrank();
    }

    function testMintWithDifferentRarities() public {
        vm.startPrank(USER);
        
        orphicGameEngine.mintMonster(
            "CommonMonster", 
            30, 
            20, 
            80, 
            OrphicGameEngine.rarity.common
        );
        orphicGameEngine.mintMonster(
            "RareMonster", 
            60, 
            45, 
            110, 
            OrphicGameEngine.rarity.rare
        );
        orphicGameEngine.mintMonster(
            "EpicMonster", 
            80, 
            60, 
            130, 
            OrphicGameEngine.rarity.epic
        );
        orphicGameEngine.mintMonster(
            "LegendaryMonster", 
            90, 
            75, 
            150, 
            OrphicGameEngine.rarity.legendary
        );

        assertEq(orphicGameEngine.getTokenCounter(), 4);
        vm.stopPrank();
    }

    function testCannotMintToZeroAddress() public {
        vm.expectRevert();
        vm.prank(address(0));
        orphicGameEngine.mintMonster(
            "InvalidMonster", 
            50, 
            30, 
            100, 
            OrphicGameEngine.rarity.common
        );
    }
}