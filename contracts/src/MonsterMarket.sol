// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MonsterMarket is Ownable, ReentrancyGuard, IERC721Receiver {
    struct MarketItem {
        uint256 itemId;
        address monsterContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool active;
    }

    uint256 private _itemIds;
    uint256 private _activeItems;
    uint256 public listingPrice;

    mapping(uint256 => MarketItem) private _marketItems;
    mapping(address => uint256) private _sellerProceeds;

    event MarketItemListed(
        uint256 indexed itemId, address indexed monsterContract, uint256 indexed tokenId, address seller, uint256 price
    );

    event MarketItemSold(
        uint256 indexed itemId,
        address indexed monsterContract,
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    event MarketItemDelisted(uint256 indexed itemId, address indexed seller);

    event ProceedsWithdrawn(address indexed seller, uint256 amount);

    constructor() Ownable(msg.sender) {
        listingPrice = 0.001 ether;
    }

    function updateListingPrice(uint256 _newListingPrice) external onlyOwner {
        listingPrice = _newListingPrice;
    }

    function listMarketItem(address _monsterContract, uint256 _tokenId, uint256 _price) external payable nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        require(msg.value >= listingPrice, "Insufficient listing fee");

        IERC721 nftContract = IERC721(_monsterContract);
        require(nftContract.ownerOf(_tokenId) == msg.sender, "Must own the token");
        require(
            nftContract.isApprovedForAll(msg.sender, address(this))
                || nftContract.getApproved(_tokenId) == address(this),
            "Contract must be approved"
        );

        _itemIds++;
        uint256 newItemId = _itemIds;

        _marketItems[newItemId] = MarketItem({
            itemId: newItemId,
            monsterContract: _monsterContract,
            tokenId: _tokenId,
            seller: payable(msg.sender),
            owner: payable(address(0)),
            price: _price,
            active: true
        });

        _activeItems++;

        nftContract.safeTransferFrom(msg.sender, address(this), _tokenId);

        emit MarketItemListed(newItemId, _monsterContract, _tokenId, msg.sender, _price);
    }

    function buyMarketItem(address _monsterContract, uint256 _itemId) external payable nonReentrant {
        MarketItem storage item = _marketItems[_itemId];

        require(item.active, "Item not active");
        require(msg.value >= item.price, "Insufficient funds");
        require(_monsterContract == item.monsterContract, "Invalid contract");

        // Calculate proceeds and fees
        uint256 sellerProceeds = item.price;
        uint256 marketFee = (sellerProceeds * 25) / 1000; // 2.5% fee
        uint256 sellerAmount = sellerProceeds - marketFee;

        // Transfer funds to seller
        (bool sellerTransfer,) = item.seller.call{value: sellerAmount}("");
        require(sellerTransfer, "Seller transfer failed");

        (bool feeTransfer,) = owner().call{value: marketFee}("");
        require(feeTransfer, "Fee transfer failed");

        IERC721(item.monsterContract).safeTransferFrom(address(this), msg.sender, item.tokenId);

        item.owner = payable(msg.sender);
        item.active = false;
        _activeItems--;

        emit MarketItemSold(_itemId, _monsterContract, item.tokenId, item.seller, msg.sender, item.price);

        // Refund any excess payment
        if (msg.value > item.price) {
            (bool refundTransfer,) = msg.sender.call{value: msg.value - item.price}("");
            require(refundTransfer, "Refund failed");
        }
    }

    function withdrawProceeds() external nonReentrant {
        uint256 proceeds = _sellerProceeds[msg.sender];
        require(proceeds > 0, "No proceeds to withdraw");

        _sellerProceeds[msg.sender] = 0;
        (bool success,) = msg.sender.call{value: proceeds}("");
        require(success, "Transfer failed");

        emit ProceedsWithdrawn(msg.sender, proceeds);
    }

    function getMarketItem(uint256 _itemId) external view returns (MarketItem memory) {
        return _marketItems[_itemId];
    }

    function fetchActiveMarketItems() external view returns (MarketItem[] memory) {
        MarketItem[] memory items = new MarketItem[](_activeItems);
        uint256 index = 0;

        for (uint256 i = 1; i <= _itemIds; i++) {
            if (_marketItems[i].active) {
                items[index] = _marketItems[i];
                index++;
            }
        }

        return items;
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    receive() external payable {}
    fallback() external payable {}
}
