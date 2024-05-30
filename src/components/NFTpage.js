import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";
import { GetIpfsUrlFromPinata } from "../utils";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");
const [dataFetched, updateDataFetched] = useState(false);

//function to get the individual NFT data
async function getNFTData(tokenId){
    const ethers = require("ethers");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    window.ethereum.enable();
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    let conclave = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);

    //getting the token URI
    let tokenURI = await conclave.tokenURI(tokenId);

    //get the listed token for the token Id
    const listedToken = await conclave.getListedForTokenId(tokenId);
    tokenURI = GetIpfsUrlFromPinata(tokenURI);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    //creating the NFT item to display the Conclave NFT
    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

//function to buy the NFT using executeSale() from the Smart Contract
async function buyNFT(tokenId){
    try{
        const ethers = require("ethers");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        window.ethereum.enable();
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let conclave = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price,"ether");

        updateMessage("Buying the NFT... Please wait upto 5 mins.");

        //executing the sale using the Smart Contract
        let transaction = await conclave.executeSale(tokenId,{
            value:salePrice
        });
        await transaction.wait();

        //success message
        alert("You successfully bought the NFT.");
        updateMessage("");


    }catch(error){
        alert("Upload error : ",error);
    }
}

//getting the data from params and setting values for tokenId
const params = useParams();
const tokenId = params.tokenId;
if(!dataFetched)
    getNFTData(tokenId);
if(typeof data.image == "string")
    data.image = GetIpfsUrlFromPinata(data.image);

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: <span className="">{data.price + " ETH"}</span>
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                    { currAddress != data.owner && currAddress != data.seller ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-emerald-700">You are the owner of this NFT</div>
                    }
                    
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}