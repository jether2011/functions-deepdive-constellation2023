const { ethers } = require("ethers");

const ALCHEMY_WSS_URL = "wss://polygon-mumbai.g.alchemy.com/v2/KJNNaI4fr2-XuW876bcCIJyfLxm9si2m";
const CONSUMER_CONTRACT_ADDRESS = "0x0dC1B5cB19095Bb39c6740615A2995eb67226955";
const CONSUMER_ABI_JSON = require("./abi/GaiaCarbonFunctionsConsumer.json");
const NFT_CONTRACT_ADDRESS = "";
const NFT_ABI_JSON = "";

const provider = new ethers.WebSocketProvider(ALCHEMY_WSS_URL);
const contract = new ethers.Contract(CONSUMER_CONTRACT_ADDRESS, CONSUMER_ABI_JSON, provider);

function hexToObject(value) {
    const hex = value.toString();
    let json = "";
    
    for (let index = 0; index < hex.length; index += 2) {
        json += String.fromCharCode(parseInt(hex.substr(index, 2), 16));
    }

    const formattedJson = json.replace("\u0000", "");

    return JSON.parse(formattedJson);
}

async function init() {
    console.log(`Start to listening Response events from contract: ${CONSUMER_CONTRACT_ADDRESS}....`);
    console.log(`Owner: ${await contract.owner()}\n`);

    contract.on("RequestFulfilled", (requestId) => {
        console.log(`Request to fulfilled: ${requestId}\n`);
    });

    contract.on("Response", (requestId, response, err) => {
        const event = {
            requestId: requestId,
            err: err
        };

        const responseAsObject = hexToObject(response);

        console.log(responseAsObject);
        console.log(JSON.stringify(event));
    });
};

init();