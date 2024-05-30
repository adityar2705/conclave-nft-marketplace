import Navbar from "./Navbar";
import NFTTile from "./NFTTile";
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function Marketplace() {
const sampleData = [
    {
        "name": "NFT#1",
        "description": "Alchemy's First NFT",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757CB4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
        "name": "NFT#2",
        "description": "Alchemy's Second NFT",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmdhoL9K8my2vi3fej97foiqGmJ389SMs55oC5EdkrxF2M",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
    {
        "name": "NFT#3",
        "description": "Alchemy's Third NFT",
        "website":"http://axieinfinity.io",
        "image":"https://gateway.pinata.cloud/ipfs/QmTsRJX7r5gyubjkdmzFrKQhHv74p5wT9LdeF1m3RTqrE5",
        "price":"0.03ETH",
        "currentlySelling":"True",
        "address":"0xe81Bf5A757C4f7F82a2F23b1e59bE45c33c5b13",
    },
];

//useState for our data
const [data, updateData] = useState(sampleData);
const [ dataFetched,updateFetched ] = useState(false);

//function to get all the NFTs
async function getAllNFTs(){
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    window.ethereum.enable();
    const signer = provider.getSigner();

    //get the deployed contract instance
    const conclave = new ethers.Contract(MarketplaceJSON.address,MarketplaceJSON.abi,signer);
    let transaction = await conclave.getAllNFTs();

    //fetch all the details of the NFTs and display
    const items = await Promise.all(transaction.map(async i => {
        const tokenURI = await conclave.tokenURI(i.tokenId);
        let meta = await axios.get(tokenURI);
        meta = meta.data;

        //creating the NFT item to return to the frontend
        let price = ethers.utils.formatUnits(i.price.toString(),"ether");
        let item = {
            price:price,
            tokenId:i.tokenId.toNumber(),
            seller:i.seller,
            owner:i.owner,
            image:meta.image,
            name:meta.name,
            description:meta.description
        };
        return item;
    }));

    //update 
    updateFetched(true);
    updateData(items);
}

//fetch NFTs if not fetched
if(!dataFetched){
    getAllNFTs();
}

return (
    <div>
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-20">
            <div className="md:text-xl font-bold text-white">
                Top NFTs
            </div>
            <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
                {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                })}
            </div>
        </div>            
    </div>
);

}