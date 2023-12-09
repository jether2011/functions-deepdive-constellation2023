// SPDX-License-Identifier: MIT
// Jether Rodrigues - jether@i3focus.com.br
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract GaiaCarbonFunctionsConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // CUSTOM PARAMS - START
    bytes32 donId = 0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000; //fun-polygon-mumbai-1
    address router = 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C; // Router for mumbai
    uint64 subscriptionId = 1079; // SubscriptionID
    uint32 gasLimit = 300000; // Gas Limit
     // NFE Service Request
    string source = 
        "const KG = 1_000;const carbonResponse = await Functions.makeHttpRequest({url: `https://nfe-service-hackathon-e1676ada9c11.herokuapp.com/v1/api/nfes/ncm/44011000/carbon-free-calculation`,method: `GET`,headers: {Accept: `application/json`,'Content-Type': `application/json`,},});if (carbonResponse.error) {throw new Error(JSON.stringify(carbonResponse));};const obj = carbonResponse.data[0];const product = obj.products[0];const carbonFootprint = JSON.parse(JSON.stringify(product.carbon_calculation));const result = {nfeId: obj.nfe_id,company: obj.company_name,taxIdentifier: obj.company_tax_identifier,carbonTonFactor: (carbonFootprint.emission_factor_by_ton_of_wood * KG),carbonFootprint: Math.trunc(carbonFootprint.emission_footprint * KG),carbonSaving: Math.trunc(carbonFootprint.emission_saving * KG),carbonFinalEmission: Math.trunc(carbonFootprint.final_emission_footprint * KG)};return Functions.encodeString(JSON.stringify(result))";
    // CUSTOM PARAMS - END

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    // Structs
    struct CarbonFootprint {
        string nfeId;
        string company;
        string taxIdentifier;
        uint256 carbonTonFactor;
        uint256 carbonFootprint;
        uint256 carbonSaving;
        uint256 carbonFinalEmission;
    }
    CarbonFootprint[] private footprints;
    
    // Errors 
    error UnexpectedRequestID(bytes32 requestId);
    
    // Events
    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event CarbonFootprintAdded(string nfeId, string company, uint256 createdAt);
   
    constructor() FunctionsClient(router) ConfirmedOwner(msg.sender) {}

    function sendRequest() external onlyOwner returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequest(FunctionsRequest.Location.Inline, FunctionsRequest.CodeLanguage.JavaScript, source);
    
        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            gasLimit,
            donId
        );
        
        return s_lastRequestId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }

        s_lastResponse = response;
        s_lastError = err;
        emit Response(requestId, s_lastResponse, s_lastError);
    }
}