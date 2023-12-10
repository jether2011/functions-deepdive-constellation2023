// SPDX-License-Identifier: MIT
// Edson Cavalca - edson@i3focus.com.br
// Jether Rodrigues - jether@i3focus.com.br
// https://docs.alchemy.com/docs/how-to-mint-an-nft-from-code
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract GaiaCarbonNFT is VRFConsumerBaseV2, ConfirmedOwner, ERC721, ERC721URIStorage {
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    // Structs
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus) public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId = 6675;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#configurations
    // Mumbai: 0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;

    // Mumbai coordinator address: 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
    // https://docs.chain.link/vrf/v2/subscription/supported-networks
    address coordinatorAddress = 0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas,
    // so 100,000 is a safe default for this example contract. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 100000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 2;

    //State variables for NFT
    uint256 public tokenCounter;

    // Ultimate nerd reference :)
    // This enum could be any kind of metadata you also want to keep track of on-chain for reference.
    // There is a corresponding EigenValue for each IpfsUri
    enum EigenValue { HESLEEP, HEATTAC, SUPERPOSITION }
    
    // This points to the metadata for each unique piece of art on Ipfs.  
    string[] IpfsUri = [
        "https://chocolate-improved-peacock-407.mypinata.cloud/ipfs/QmQFmmvu3XJqfsmJPtfcZMfx2avbwHohLnWbVfnCZtYWr4"
    ];

    mapping(uint256 => EigenValue) public tokenIdToEigenValue;
    mapping(bytes32 => uint256) public requestIdToTokenId;

    constructor()
        VRFConsumerBaseV2(coordinatorAddress)
        ConfirmedOwner(msg.sender)
        ERC721("GaiaCarbonNFT", "Gaia Sustainability - Carbon Emission Footprint")
        
    {
        COORDINATOR = VRFCoordinatorV2Interface(coordinatorAddress);
        tokenCounter = 0;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

     // Creates a new ERC721 mNFT.
    // It is initialized at the third IpfsUri and EigenValue
    function createCollectible() public {
        uint256 newItemId = tokenCounter;
        string memory initialUri = IpfsUri[0];
        EigenValue initialEigenVal = EigenValue(0);
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, initialUri);
        tokenIdToEigenValue[newItemId] = initialEigenVal;
        tokenCounter = tokenCounter + 1;
    }

    function mintByAddressWithMetadata(
        address to, 
        string memory company,
        string memory description,
        string memory ipfsImage
    ) public {    
        string memory uri = Base64.encode(
            bytes(
                string(
                     abi.encodePacked(
                        '{"name":  "', company, '",'
                        '"description": "', description, '",'
                        '"image": "', ipfsImage, '",'
                        '"attributes": [',
                        ']}'
                    )
                )
            )
        );
        
        // Create token URI
        string memory finalTokenURI = string(
            abi.encodePacked("data:application/json;base64,", uri)
        );

        uint256 tokenId = requestRandomWords();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, finalTokenURI);

        unchecked {
            tokenCounter++;
        }
    }   

    // Assumes the subscription is funded sufficiently.
    function requestRandomWords()
        public
        onlyOwner       
        returns (uint256 requestId) {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });

        requestIds.push(requestId);
        lastRequestId = requestId;
        
        emit RequestSent(requestId, numWords);
        
        return requestId;
    }      

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;

        emit RequestFulfilled(_requestId, _randomWords);
    }
}