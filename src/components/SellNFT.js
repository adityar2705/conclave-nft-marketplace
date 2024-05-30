import Navbar from "./Navbar";
import { useState } from "react";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import Marketplace from '../Marketplace.json';
import { useLocation } from "react-router";

export default function SellNFT () {
    const [formParams, updateFormParams] = useState({ name: '', description: '', price: ''});
    const [fileURL, setFileURL] = useState(null);
    const ethers = require("ethers");
    const [message, updateMessage] = useState('');

    //function to handle the file upload to Pinata from frontend
    async function OnChangeFile(e){
        var file = e.target.files[0];
        try {
            const response = await uploadFileToIPFS(file);
            if(response.success === true){
                console.log("Conclave image successfully uploaded to Pinata: ",response.pinataURL);
                setFileURL(response.pinataURL);
            }
            
        }catch(error){
            console.log("Error during Conclave file upload: ",error);
        }
    }

    //uploading the metadata to IPFS
    async function uploadMetadataToIPFS(){
        const { name, description, price } = formParams;
        if(!name || !description || !price || !fileURL){
            return;
        }

        //creating the JSON for the NFT
        const nftJson = {
            name, description, price, image:fileURL
        };

        try {
            let response = await uploadJSONToIPFS(nftJson);
            if(response.success === true){
                console.log("Success uploading metadat to Pinata: ");
                return response.pinataURL;
            }
        }catch(error){
            console.log("Error uploading metadata to Pinata: ", error);
        }
    }

    //function for when the NFT is listed
    async function listNFT(e){
        e.preventDefault();
        try{
            //using Metamask to connect to the Ethereum wallet
            const {ethereum} = window;
            const metadataURL = await uploadMetadataToIPFS();
            const provider = new ethers.providers.Web3Provider(ethereum);
            window.ethereum.enable();
            const signer = provider.getSigner();

            updateMessage("Uploading... May take upto 5 mins");

            //using the contract functionality to create the token
            let conclave = new ethers.Contract(Marketplace.address, Marketplace.abi, signer);
            const price = ethers.utils.parseEther(formParams.price,"ether");
            console.log("STEP 1");

            //getting and using the NFT listing price
            let listPrice = await conclave.getListPrice();
            listPrice = listPrice.toString();
            console.log("STEP 2");

            //creating the token for the first time
            let transaction = await conclave.createToken(metadataURL,price,{
                value:listPrice
            });
            console.log("STEP 3");
            await transaction.wait();
            alert("Success uploading NFT.");
            updateMessage("");
            updateFormParams({
                name:'',
                description:'',
                price:''
            });


        }catch(error){
            alert("Error uploading NFT: ",error);
        }
    }

    return (
        <div className="">
        <Navbar></Navbar>
        <div className="flex flex-col place-items-center mt-10" id="nftForm">
            <form className="bg-white shadow-md rounded px-8 pt-4 pb-8 mb-4">
            <h3 className="text-center font-bold text-purple-500 mb-8">Upload your NFT to the marketplace</h3>
                <div className="mb-4">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="name">NFT Name</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="name" type="text" placeholder="Axie#4563" onChange={e => updateFormParams({...formParams, name: e.target.value})} value={formParams.name}></input>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="description">NFT Description</label>
                    <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" cols="40" rows="5" id="description" type="text" placeholder="Axie Infinity Collection" value={formParams.description} onChange={e => updateFormParams({...formParams, description: e.target.value})}></textarea>
                </div>
                <div className="mb-6">
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="price">Price (in ETH)</label>
                    <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="number" placeholder="Min 0.01 ETH" step="0.01" value={formParams.price} onChange={e => updateFormParams({...formParams, price: e.target.value})}></input>
                </div>
                <div>
                    <label className="block text-purple-500 text-sm font-bold mb-2" htmlFor="image">Upload Image (&lt;500 KB)</label>
                    <input type={"file"} onChange={OnChangeFile}></input>
                </div>
                <br></br>
                <div className="text-red-500 text-center">{message}</div>
                <button onClick={listNFT} className="font-bold mt-10 w-full bg-purple-500 text-white rounded p-2 shadow-lg" id="list-button">
                    List NFT
                </button>
            </form>
        </div>
        </div>
    )
}