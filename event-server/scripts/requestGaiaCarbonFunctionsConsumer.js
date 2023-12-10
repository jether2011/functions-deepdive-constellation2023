require("@chainlink/env-enc").config();
const { ethers, Wallet } = require("ethers");

const ALCHEMY_RPC_URL = process.env.ALCHEMY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONSUMER_CONTRACT_ADDRESS = "0x0dC1B5cB19095Bb39c6740615A2995eb67226955";
const CONSUMER_ABI_JSON = require("../abi/GaiaCarbonFunctionsConsumer.json");

const provider = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
const wallet = new Wallet(PRIVATE_KEY);
const signer = wallet.connect(provider);
const consumerContract = new ethers.Contract(CONSUMER_CONTRACT_ADDRESS, CONSUMER_ABI_JSON, signer);

async function sendRequestForFunctionsConsumer() {
    try {
        const tx = await consumerContract.sendRequest();
        
        const txResult = {
            hash: tx.hash,
            to: tx.to,
            from: tx.from,
            gas: tx.gasLimit
        };
        console.log(txResult);
    } catch (e) {
        console.log("Error functions consumer sendResquest: ", e);
    }
}

sendRequestForFunctionsConsumer();