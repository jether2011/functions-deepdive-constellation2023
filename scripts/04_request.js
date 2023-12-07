const { Contract } = require("ethers");
const { Location } = require("@chainlink/functions-toolkit");
const fs = require("fs");
const path = require("path");
require("@chainlink/env-enc").config();

const { signer } = require("../connection.js");
const { abi } = require("../contracts/abi/FunctionsConsumer.json");

const consumerAddress = "0x91f48b4463612d23ee54777cfc4d94d824b69d7e";
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

  console.log("\n Sending the Request....");
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
  const requestId = txReceipt.events[2].args.id;
  console.log(
    `\nRequest made.  Request Id is ${requestId}. TxHash is ${requestTx.hash}`,
  );
};

sendRequest().catch((err) => {
  console.log("\nError making the Functions Request : ", err);
});
