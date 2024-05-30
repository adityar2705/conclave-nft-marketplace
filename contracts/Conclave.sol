//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract Conclave is ERC721URIStorage{
    address payable owner;

    //keeping track of token ID and no. of NFTs sold
    uint256 private _tokenIds = 0;
    uint256 private _itemsSold;    

    uint256 public listPrice = 0.01 ether;

    constructor() ERC721("Conclave","CNC"){
        owner = payable(msg.sender);
    }

    //struct for the listed token
    struct ListedToken{
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed;
    }

    //mapping token ID to the listed token
    mapping(uint256 => ListedToken) private idToListedToken;

    //update the listing price of Conclave
    function updatePrice(uint256 _listPrice) public payable{
        require(msg.sender == owner,"Only Conclave owners can update the listing price.");
        listPrice = _listPrice;
    }

    //get the listing price of Conclave
    function getListPrice() public view returns(uint256){
        return listPrice;
    }

    //get the latest token added
    function getLatestIdToListedToken() public view returns(ListedToken memory){
        uint256 latestTokenId = _tokenIds;
        return idToListedToken[latestTokenId];
    }

    //get the corresponding token or the token ID
    function getListedForTokenId(uint256 tokenId) public view returns(ListedToken memory){
        return idToListedToken[tokenId];
    }

    //get the current token ID -> latest added
    function getCurrentToken() public view returns(uint256){
        return _tokenIds;
    }

    //creating the token for the first time
    function createToken(string memory tokenURI, uint256 price) public payable returns(uint256){
        require(msg.value == listPrice,"Not enough Ether for the Conclave listing price.");
        require(price > 0,"Price must be positive.");

        //minting the NFT
        _tokenIds += 1;
        uint256 currentTokenId = _tokenIds;
        _safeMint(msg.sender,currentTokenId);
        _setTokenURI(currentTokenId,tokenURI);

        createListedToken(currentTokenId, price);
        return currentTokenId;
    }

    //create the listed token on the smart contract
    function createListedToken(uint256 tokenId, uint256 price) private{
        idToListedToken[tokenId] = ListedToken(
            tokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true
        );

        //transfer ownership from seller to Conclave to approve minting the NFT
        _transfer(msg.sender, address(this), tokenId);
    }

    //get all the listed NFTs on Conclave
    function getAllNFTs() public view returns(ListedToken[] memory){
        uint256 countNFTs = _tokenIds;
        ListedToken[] memory tokens = new ListedToken[](countNFTs);

        uint256 currentIndex = 0;

        //looping and adding the listed tokens to the array
        for(uint i = 0; i<countNFTs; i++){
            uint256 currToken = i+1;
            ListedToken storage currentItem = idToListedToken[currToken];
            tokens[currentIndex] = currentItem;
            currentIndex += 1; 
        }

        return tokens;
    }

    //get all the NFTs owned by a specific user
    function getMyNFTs() public view returns(ListedToken[] memory){
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        //get the number of listed tokens owner by the user
        for(uint256 i = 0; i < totalItemCount; i++){
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender){
                itemCount += 1;
            }
        }

        //creating an array to store all the user NFTs
        ListedToken[] memory items = new ListedToken[](itemCount);
        for(uint256 i  = 0; i < totalItemCount; i++){
            if(idToListedToken[i+1].owner == msg.sender || idToListedToken[i+1].seller == msg.sender){
                uint currToken = i+1;
                ListedToken storage currentItem = idToListedToken[currToken];
                items[currentIndex] = currentItem;
                currentIndex += 1; 
            }
        }

        return items;
    }

    //buying the NFT
    function executeSale(uint256 tokenId) public payable{
        uint256 price = idToListedToken[tokenId].price;
        require(msg.value == price, "Please send the required Ether to purchase the NFT.");
       
        address seller = idToListedToken[tokenId].seller;
        
        idToListedToken[tokenId].currentlyListed = true;
        idToListedToken[tokenId].seller = payable(msg.sender);
        _itemsSold += 1;

        //smart contract had ownership of the token, it transfers it to the address executing the sale
        _transfer(address(this),msg.sender,tokenId);

        //approve the contract to be able to make future NFT sales, if the new seller who bought the NFT wants to sell it
        approve(address(this),tokenId);

        //sending the required ETH to the respective addresses
        payable(owner).transfer(listPrice);
        payable(seller).transfer(msg.value);


    }



}