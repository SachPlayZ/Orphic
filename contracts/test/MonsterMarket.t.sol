// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {MonsterMarket} from "../src/MonsterMarket.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Custom NFT Contract for Testing
contract TestMonsterNFT is ERC721 {
    uint256 private _tokenIds;
    address public deployer;

    constructor() ERC721("TestMonster", "TSTMNSTR") {
        deployer = msg.sender;
    }

    function mint(address to) public returns (uint256) {
        _tokenIds++;
        _safeMint(to, _tokenIds);
        return _tokenIds;
    }

    function bulkMint(address to, uint256 count) public {
        for (uint256 i = 0; i < count; i++) {
            mint(to);
        }
    }

    // Allow burning for test scenarios
    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }
}

contract MonsterMarketTest is Test {
    MonsterMarket public monsterMarket;
    TestMonsterNFT public nftContract;

    // Test Accounts
    address public owner;
    address public seller;
    address public buyer;
    address public secondBuyer;

    uint256 public constant INITIAL_BALANCE = 100 ether;

    function setUp() public {
        owner = makeAddr("owner");
        seller = makeAddr("seller");
        buyer = makeAddr("buyer");
        secondBuyer = makeAddr("secondBuyer");

        vm.deal(owner, INITIAL_BALANCE);
        vm.deal(seller, INITIAL_BALANCE);
        vm.deal(buyer, INITIAL_BALANCE);
        vm.deal(secondBuyer, INITIAL_BALANCE);

        vm.prank(owner);
        monsterMarket = new MonsterMarket();

        vm.prank(owner);
        nftContract = new TestMonsterNFT();
    }

    function prepareNFTForListing() internal returns (uint256) {
        vm.prank(seller);
        uint256 tokenId = nftContract.mint(seller);

        vm.prank(seller);
        nftContract.setApprovalForAll(address(monsterMarket), true);

        return tokenId;
    }

    function testSuccessfulItemListing() public {
        uint256 tokenId = prepareNFTForListing();
        uint256 listingPrice = monsterMarket.listingPrice();
        uint256 itemPrice = 1 ether;

        vm.prank(seller);
        monsterMarket.listMarketItem{value: listingPrice}(address(nftContract), tokenId, itemPrice);

        assertEq(nftContract.ownerOf(tokenId), address(monsterMarket));
    }

    function testListingWithInsufficientFee() public {
        uint256 tokenId = prepareNFTForListing();
        uint256 listingPrice = monsterMarket.listingPrice();

        vm.prank(seller);
        vm.expectRevert("Insufficient listing fee");
        monsterMarket.listMarketItem{value: listingPrice - 0.0001 ether}(address(nftContract), tokenId, 1 ether);
    }

    function testBuyMarketItem() public {
        uint256 tokenId = prepareNFTForListing();
        uint256 listingPrice = monsterMarket.listingPrice();
        uint256 itemPrice = 1 ether;

        vm.prank(seller);
        monsterMarket.listMarketItem{value: listingPrice}(address(nftContract), tokenId, itemPrice);

        uint256 sellerInitialBalance = seller.balance;
        uint256 buyerInitialBalance = buyer.balance;

        vm.prank(buyer);
        monsterMarket.buyMarketItem{value: itemPrice}(address(nftContract), 1);

        assertEq(nftContract.ownerOf(tokenId), buyer);

        uint256 marketFee = (itemPrice * 25) / 1000;
        uint256 sellerProceeds = itemPrice - marketFee;

        assertEq(seller.balance, sellerInitialBalance + sellerProceeds);
        assertEq(buyer.balance, buyerInitialBalance - itemPrice);
    }

    function testWithdrawProceeds() public {
        uint256 tokenId = prepareNFTForListing();
        uint256 listingPrice = monsterMarket.listingPrice();
        uint256 itemPrice = 1 ether;

        vm.prank(seller);
        monsterMarket.listMarketItem{value: listingPrice}(address(nftContract), tokenId, itemPrice);

        vm.prank(buyer);
        monsterMarket.buyMarketItem{value: itemPrice}(address(nftContract), 1);

        uint256 sellerInitialBalance = seller.balance;
        vm.prank(seller);
        monsterMarket.withdrawProceeds();

        uint256 marketFee = (itemPrice * 25) / 1000;
        uint256 sellerProceeds = itemPrice - marketFee;
        assertEq(seller.balance, sellerInitialBalance + sellerProceeds);
    }

    function testMultipleItemListingAndPurchase() public {
        uint256[] memory tokenIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            tokenIds[i] = prepareNFTForListing();

            vm.prank(seller);
            monsterMarket.listMarketItem{value: monsterMarket.listingPrice()}(
                address(nftContract), tokenIds[i], (i + 1) * 0.5 ether
            );
        }

        vm.prank(buyer);
        monsterMarket.buyMarketItem{value: 0.5 ether}(address(nftContract), 1);

        vm.prank(secondBuyer);
        monsterMarket.buyMarketItem{value: 1 ether}(address(nftContract), 2);
    }

    function testOwnerUpdateListingPrice() public {
        uint256 newListingPrice = 0.005 ether;

        vm.prank(owner);
        monsterMarket.updateListingPrice(newListingPrice);

        assertEq(monsterMarket.listingPrice(), newListingPrice);
    }

    function testFailNonOwnerUpdateListingPrice() public {
        vm.prank(seller);
        monsterMarket.updateListingPrice(0.005 ether);
    }

    function testFuzzItemListing(uint256 price) public {
        vm.assume(price > 0 && price < 100 ether);

        uint256 tokenId = prepareNFTForListing();
        uint256 listingPrice = monsterMarket.listingPrice();

        vm.prank(seller);
        monsterMarket.listMarketItem{value: listingPrice}(address(nftContract), tokenId, price);
    }
}
