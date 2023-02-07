//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

//imports from openzeppelin
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

//errors
error NFTMarketPLace__ItemPriceInavlid();
error NFTMarketPLace__nftNotApproved();
error NFTMarketPLace__itemAlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketPLace__notOwner();
error NFTMarketPLace__itemNotListed(address nftAddress, uint256 tokenId);
error NFTMarketPLace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NFTMarketPLace__newPriceNotValid();
error NFTMarketPLace__notEnoughProceedsToWithdraw();
error NFTMarketPLace__withdrawalFailed();

contract NFTMarketPLace is ReentrancyGuard {
    struct Listing {
        address seller;
        uint256 price;
    }

    //mappings
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    //events
    event listingNFT(
        address indexed nftAddress,
        address indexed owner,
        uint256 price,
        uint256 indexed tokenId
    );

    event boughtNFT(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event itemRemoved(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed owner
    );

    constructor() {}

    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];

        if (listing.price > 0) {
            revert NFTMarketPLace__itemAlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    //modifiers
    modifier onlyOwner(
        address nftAddress,
        address owner,
        uint256 tokenId
    ) {
        IERC721 nft = IERC721(nftAddress);

        if (owner != nft.ownerOf(tokenId)) {
            revert NFTMarketPLace__notOwner();
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];

        if (listing.price <= 0) {
            revert NFTMarketPLace__itemNotListed(nftAddress, tokenId);
        }
        _;
    }

    //NFTMarketPLace main functions
    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        onlyOwner(nftAddress, msg.sender, tokenId)
    {
        if (price <= 0) {
            revert NFTMarketPLace__ItemPriceInavlid();
        }

        IERC721 nft = IERC721(nftAddress);

        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarketPLace__nftNotApproved();
        }

        s_listings[nftAddress][tokenId] = Listing(msg.sender, price);

        emit listingNFT(nftAddress, msg.sender, price, tokenId);
    }

    function buyItems(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) nonReentrant {
        Listing memory listedItem = s_listings[nftAddress][tokenId];

        if (msg.value < listedItem.price) {
            revert NFTMarketPLace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );
        }

        s_proceeds[listedItem.seller] =
            s_proceeds[listedItem.seller] +
            msg.value;

        delete (s_listings[nftAddress][tokenId]);

        IERC721 nft = IERC721(nftAddress);

        nft.safeTransferFrom(listedItem.seller, msg.sender, tokenId);

        emit boughtNFT(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        onlyOwner(nftAddress, msg.sender, tokenId)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);

        emit itemRemoved(nftAddress, tokenId, msg.sender);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        onlyOwner(nftAddress, msg.sender, tokenId)
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        if (newPrice <= 0) {
            revert NFTMarketPLace__newPriceNotValid();
        }

        s_listings[nftAddress][tokenId].price = newPrice;

        emit listingNFT(nftAddress, msg.sender, newPrice, tokenId);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];

        if (proceeds <= 0) {
            revert NFTMarketPLace__notEnoughProceedsToWithdraw();
        }

        s_proceeds[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: proceeds}("");

        if (!success) {
            revert NFTMarketPLace__withdrawalFailed();
        }
    }

    //NFTMarketPLace getter functions
    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
