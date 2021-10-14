// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RickNFT is ERC721Enumerable, Ownable { 
    using Strings for uint256;    

    uint256 public price = 0.0 ether;     
    uint256 public maxSupply = 10000; 
    uint256 public publicSupply = 9000;
    uint256 public publicMinted;
    uint256 public maxGiftAmount = 1000; 
    uint256 public giftedAmount;

    string public baseURI;       
    string public baseExtension;
    string private _contractURI; 
     
    bool public revealed = false;
    bool public publicSale = false;
    bool public onlyWhitelist = false;

    mapping(address => bool) public isWhitelisted;
    
    event traitChoosed (uint tokenId, uint traitId);
    
    constructor() ERC721("Rick's cool NFT", "NFT") {} 

    function addToWhitelist(address[] calldata _addresses) external onlyOwner {
        for(uint256 i = 0; i < _addresses.length; i++) {
            address entry = _addresses[i];
            require(entry != address(0), "Address not valid.");
            require(!isWhitelisted[entry], "Address already whitelisted.");

            isWhitelisted[entry] = true;
        }   
    }

    function removeFromWhiteList(address[] calldata _addresses) external onlyOwner {
        for(uint256 i = 0; i < _addresses.length; i++) {
            address entry = _addresses[i];
            require(entry != address(0), "Address not valid.");
            
            isWhitelisted[entry] = false;
        }
    }

    function buy(uint256 _amount, uint256 _trait) external payable {
        require(publicSale, "Sale is not live.");
        require(publicMinted + _amount <= publicSupply, "Exceeds max supply.");
        require(price * _amount <= msg.value, "Not enough ETH to buy.");
        
        for(uint256 i = 0; i < _amount; i++) {
            publicMinted++;
            uint tokenId = totalSupply() + 1;
            _safeMint(msg.sender, tokenId);
            
            emit traitChoosed(tokenId, _trait);
        }
    }  

    function whiteListBuy(uint256 _amount, uint256 _trait) external payable {
        require(onlyWhitelist, "Sale is not live.");
        require(isWhitelisted[msg.sender], "Not in the whitelist.");
        require(publicMinted + _amount <= publicSupply, "Exceeds max supply."); 
        require(price * _amount <= msg.value, "Not enough ETH to buy.");
        
        for (uint256 i = 0; i < _amount; i++) {
            publicMinted++;
            uint tokenId = totalSupply() + 1;
            _safeMint(msg.sender, tokenId);
            emit traitChoosed(tokenId, _trait);
        }
    }

    function giftNFTs(address[] calldata receivers, uint256 _trait) external onlyOwner {   
        require(giftedAmount + receivers.length <= maxGiftAmount, "Max gift limit reached.");
        
        for (uint256 i = 0; i < receivers.length; i++) {           
            giftedAmount++;
            uint tokenId = totalSupply() + 1;
            _safeMint(receivers[i], tokenId);
            emit traitChoosed(tokenId, _trait);
        }
    }

    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance); 
    }

    function toggleSaleStatus (bool _onlyWhitelist, bool _publicSale) public onlyOwner{
        onlyWhitelist = _onlyWhitelist;
        publicSale = _publicSale;
    }

    function toggleReveal (bool status, string memory _newURI,string memory _newExtension) public onlyOwner{
        revealed = status;
        baseURI = _newURI; 
        baseExtension = _newExtension;
    }

    function setContractURI(string calldata URI) external onlyOwner {
        _contractURI = URI;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId), "Cannot query non-existent token");

        if(!revealed) {
            return baseURI;
        }
        
        return string(abi.encodePacked(baseURI, tokenId.toString(),baseExtension));
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
}