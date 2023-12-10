const { ethers, Wallet } = require("ethers");

const ALCHEMY_WSS_URL = "wss://polygon-mumbai.g.alchemy.com/v2/KJNNaI4fr2-XuW876bcCIJyfLxm9si2m";
const ALCHEMY_RPC_URL = "https://polygon-mumbai.g.alchemy.com/v2/KJNNaI4fr2-XuW876bcCIJyfLxm9si2m";

const CONSUMER_CONTRACT_ADDRESS = "0x0dC1B5cB19095Bb39c6740615A2995eb67226955";
const CONSUMER_ABI_JSON = require("./abi/GaiaCarbonFunctionsConsumer.json");
const NFT_CONTRACT_ADDRESS = "0x83CDA4fee13B2e7F59186013035E00de0eAD8d3A";
const NFT_ABI_JSON = require("./abi/GaiaCarbonNFT.json");

const IPFS_IMAGE_URL = "https://chocolate-improved-peacock-407.mypinata.cloud/ipfs/QmQFmmvu3XJqfsmJPtfcZMfx2avbwHohLnWbVfnCZtYWr4";
const PRIVATE_KEY = "ce2c94c4962f7e11f468bcb45fc6fd688306cc7d9b1e3675a706736a2f989f33";

const provider = new ethers.WebSocketProvider(ALCHEMY_WSS_URL);
const contract = new ethers.Contract(CONSUMER_CONTRACT_ADDRESS, CONSUMER_ABI_JSON, provider);

const providerForNft = new ethers.JsonRpcProvider(ALCHEMY_RPC_URL);
const wallet = new Wallet(PRIVATE_KEY);
const signer = wallet.connect(providerForNft);
const nftContract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_ABI_JSON, signer);

function hexToObject(value) {
    const hex = value.toString();
    let json = "";

    for (let index = 0; index < hex.length; index += 2) {
        json += String.fromCharCode(parseInt(hex.substr(index, 2), 16));
    }

    const formattedJson = json.replace("\u0000", "");

    return JSON.parse(formattedJson);
}

async function mintGaiaCarbonNFT(company, description) {
    try {
        const tx = await nftContract.mintByAddressWithMetadata(
            wallet.address,
            company,
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
        console.log(`GaiaCarbonNFT minted for: ${description}`);
    } catch (e) {
        console.log("Error Caught in Catch Statement: ", e);
    }
}

async function init() {
    console.log(`Start to listening Response events from contract: ${CONSUMER_CONTRACT_ADDRESS}....`);
    console.log(`Owner: ${await contract.owner()}\n`);

    const nft = `[ ${await nftContract.name()} - ${await nftContract.symbol()} ]`;

    contract.on("RequestFulfilled", (requestId) => {
        console.log(`GaiaCarbonFunctionsConsumer - RequestFulfilled event: ${requestId}\n`);
    });

    contract.on("Response", async (requestId, response, err) => {
        const event = {
            requestId: requestId,
            err: err
        };

        try {
            const responseAsObject = hexToObject(response);
            const description = `NFE: ${responseAsObject.nfeId} | Company: ${responseAsObject.company} | TaxIdentifier: ${responseAsObject.taxIdentifier} | CarbonTonFactor: ${responseAsObject.carbonTonFactor} | CarbonFootprint: ${responseAsObject.carbonFootprint} | CarbonSaving: ${responseAsObject.carbonSaving} | CarbonFinalEmission: ${responseAsObject.carbonFinalEmission}`;

            await mintGaiaCarbonNFT(responseAsObject.company, description);

            console.log(responseAsObject);
            console.log(JSON.stringify(event));
        } catch (error) {
            console.log("Error Response event: ", e);
        }
    });

    nftContract.on("RequestFulfilled", (requestId, randomWords) => {
        console.log(`\n${nft} - RequestFulfilled event emmited: ${requestId}`);
    });
};

init();