const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  const Conclave = await hre.ethers.getContractFactory("Conclave");
  const conclave = await Conclave.deploy();

  await conclave.deployed();

  const data = {
    address: conclave.address,
    abi: JSON.parse(conclave.interface.format('json'))
  }

  //this is the ABI of the deployed smart contrcat : JSON.parse(conclave.interface.format('json'));

  //print the contract address
  console.log("Conclave NFT Marketplace Contract deployed to : ",conclave.address);

  //This writes the ABI and address to the mktplace.json
  fs.writeFileSync('./src/Marketplace.json', JSON.stringify(data))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
