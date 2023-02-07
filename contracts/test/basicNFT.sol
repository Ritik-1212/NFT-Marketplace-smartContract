//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error basicNFT__URI_query_of_nonexistent_token();

contract basicNFT is ERC721 {
    uint256 private s_tokenCounter;

    string public constant s_TokenURI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    event DogMinted(uint256 indexed tokenId);

    constructor() ERC721("", "") {
        s_tokenCounter = 0;
    }

    function mintNFT() public {
        _safeMint(s_tokenCounter, msg.sender);
        emit DogMinted(s_tokenCounter);
        s_tokenCounter += 1;
    }

    function tokenURI(
        uint256 tokenId 
    ) public view override returns (string memory) {
        if(!_exists(tokenId)){
            revert basicNFT__URI_query_of_nonexistent_token()
        }
        return s_TokenURI;
    }

    function getTokenCounter() public pure returns (uint256) {
        return s_tokenCounter;
    }
}
