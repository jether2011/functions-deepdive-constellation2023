const { Contract } = require("ethers");
const { Location } = require("@chainlink/functions-toolkit");
const fs = require("fs");
const path = require("path");
require("@chainlink/env-enc").config();

const { signer } = require("../connection.js");
const { abi } = require("../contracts/abi/FunctionsConsumer.json");

const consumerAddress = "0x360af0fc607725663d39aa6d20351d82a969a61d";
const subscriptionId = "1079";
// const encryptedSecretsRef = "0xa266736c6f744964006776657273696f6e1a65540efa";

const sendRequest = async () => {
  if (!consumerAddress || !subscriptionId) {
    throw Error("Missing required environment variables.");
  }
  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const source = fs
    .readFileSync(path.resolve(__dirname, "../source.js"))
    .toString();

  const prompt = "Describe what a blockchain is in 15 words or less";
  const args = [prompt];
  const callbackGasLimit = 300_000;
  //const callbackGasLimit = 3_900_000_000;

  console.log("\n Sending the Request....\n");
  const requestTx = await functionsConsumer.sendRequest(
    source,
    Location.DONHosted,
    // encryptedSecretsRef,
    args,
    [], // bytesArgs can be empty
    subscriptionId,
    callbackGasLimit,
  );

  const txReceipt = await requestTx.wait(1);

  console.log(
    `
    \nRequest made.  
    \nBlockHash: ${txReceipt.blockHash},
    \nBlockNumber: ${txReceipt.blockNumber},
    \nGasPrice: ${txReceipt.gasPrice},
    \nCumulativeGasUsed: ${txReceipt.cumulativeGasUsed},
    \nFrom: ${txReceipt.from},
    \nTo: ${txReceipt.to}
    `
  );
};

sendRequest().catch((err) => {
  console.log("\nError making the Functions Request : ", err);
});
