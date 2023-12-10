require("@chainlink/env-enc").config();
const { ethers, Wallet } = require("ethers");

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const NFT_CONTRACT_ADDRESS = "0x83CDA4fee13B2e7F59186013035E00de0eAD8d3A";
const NFT_ABI_JSON = require("../abi/GaiaCarbonNFT.json");
const IPFS_IMAGE_URL = "https://chocolate-improved-peacock-407.mypinata.cloud/ipfs/QmQFmmvu3XJqfsmJPtfcZMfx2avbwHohLnWbVfnCZtYWr4";

const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
const wallet = new Wallet(PRIVATE_KEY);
const signer = wallet.connect(provider);
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI_JSON, signer);

async function mintNFT() {
    const description = "NFE: 58adf7db-03e4-4dc9-8e3f-2eac7a92e4a6 | Company: i3focus | TaxIdentifier: 70.588.144/0001-96 | CarbonTonFactor: 1400 | CarbonFootprint: 3980 | CarbonSaving: 5970 | CarbonFinalEmission: 5572";
    console.log(description);

    try {
        const tx = await nftContract.mintByAddressWithMetadata(
            wallet.address, 
            "I3focus - Soluções Digitais", 
            description,
            IPFS_IMAGE_URL
        );
        
        const txResult = {
            hash: tx.hash,
            to: tx.to,
            from: tx.from,
            gas: tx.gasLimit
        };
        console.log(txResult);
    } catch (e) {
        console.log("Error Caught in Catch Statement: ", e);
    }
}

mintNFT();