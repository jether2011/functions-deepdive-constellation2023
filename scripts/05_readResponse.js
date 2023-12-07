const { decodeResult, ReturnType } = require("@chainlink/functions-toolkit");
const { Contract } = require("ethers");

const { signer } = require("../connection.js");
const { abi } = require("../contracts/abi/FunctionsConsumer.json");

const consumerAddress = "0x360af0fc607725663d39aa6d20351d82a969a61d";
const readResponse = async () => {
  const functionsConsumer = new Contract(consumerAddress, abi, signer);

  const responseBytes = await functionsConsumer.s_lastResponse()
  console.log("\nResponse Bytes : ", responseBytes)

  const decodedResponse = decodeResult(responseBytes, ReturnType.string)
  
  console.log("\nDecoded response from NFE Service:");
  console.log(decodedResponse);
};

readResponse().catch(err => {
  console.log("Error reading response: ", err);
});
