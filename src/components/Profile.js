import Navbar from "./Navbar";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import NFTTile from "./NFTTile";

export default function Profile () {
    const [data, updateData] = useState([]);
    const [address, updateAddress] = useState("0x");
    const [totalPrice, updateTotalPrice] = useState("0");
    const [dataFetched, updateFetched] = useState(false);

    //function to get the individual NFT data
    async function getNFTData(tokenId){
        const ethers = require("ethers");
        let sumPrice = 0;
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        //connecting and getting address from Metamask
        const signer = provider.getSigner();
        window.ethereum.enable();
        const addr = await signer.getAddress();

       //get the deployed contract instance
        const conclave = new ethers.Contract(MarketplaceJSON.address,MarketplaceJSON.abi,signer);
        let transaction = await conclave.getMyNFTs();

        //gets data from the NFTs and creates object to display information
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
            sumPrice += Number(price);
            return item;
        }));

        //updating all the necessary data
        updateData(items);
        updateFetched(true);
        updateAddress(addr);
        updateTotalPrice(sumPrice.toPrecision(3));
    }

    //getting tokenId from params if data is not fetched
    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched){
        getNFTData(tokenId);
    }
    
    return (
        <div className="profileClass" style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="profileClass">
            <div className="flex text-center flex-col mt-11 md:text-2xl text-white">
                <div className="mb-5">
                    <h2 className="font-bold">Wallet Address</h2>  
                    {address}
                </div>
            </div>
            <div className="flex flex-row text-center justify-center mt-10 md:text-2xl text-white">
                    <div>
                        <h2 className="font-bold">No. of NFTs</h2>
                        {data.length}
                    </div>
                    <div className="ml-20">
                        <h2 className="font-bold">Total Value</h2>
                        {totalPrice} ETH
                    </div>
            </div>
            <div className="flex flex-col text-center items-center mt-11 text-white">
                <h2 className="font-bold">Your NFTs</h2>
                <div className="flex justify-center flex-wrap max-w-screen-xl">
                    {data.map((value, index) => {
                    return <NFTTile data={value} key={index}></NFTTile>;
                    })}
                </div>
                <div className="mt-10 text-xl">
                    {data.length == 0 ? "Oops, No NFT data to display (Are you logged in?)":""}
                </div>
            </div>
            </div>
        </div>
    )
};