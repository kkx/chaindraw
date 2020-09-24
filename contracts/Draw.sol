pragma solidity ^0.6.6;
import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";

contract Draw is VRFConsumerBase {
    enum requestStatus {started, returned} 
    bytes32 internal keyHash;
    uint256 internal fee;
    uint256 internal seed;

	struct Twitter {
		uint256 numParticipants;
		uint256[] participants;
		bytes32 requestId;
	}

	struct DrawRequest {
		uint256 twitterId;
		requestStatus status;
		uint256 seed;
		uint256 randomNumber;
		uint256 originalRandomNumber;
	}
    
    mapping(uint256 => Twitter) drawTweet; 
    mapping(bytes32 => DrawRequest) drawRequest; 
    address public owner;
    
	 /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Rinkeby
     * Chainlink VRF Coordinator address: 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B
     * LINK token address:                0x01BE23585060835E02B77ef475b0Cc51aA1e0709
     * Key Hash: 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311
     */
    constructor() 
        VRFConsumerBase(
			 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK Token
        ) public
    {
		owner = msg.sender;
        keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
        seed = 0;
    }
    
    /** 
     * Requests randomness from a user-provided seed
     */
    function takeDraw(uint256 twitterId, uint256[] memory participants, uint256 num_participants, uint256 seed) external {
		require(msg.sender == owner, 'should be owner');
	  	require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
	  	require(num_participants > 0, "num_participants should be bigger than 0");
	  	require(num_participants <= 2000, "num_participants should be lesser than 2000");
		require(drawTweet[twitterId].numParticipants == 0, "tweet should not be drawn twice");

		drawTweet[twitterId].numParticipants = num_participants; 
        bytes32 requestId = requestRandomness(keyHash, fee, seed);
		drawTweet[twitterId].requestId = requestId; 
		drawRequest[requestId].twitterId = twitterId;
		drawRequest[requestId].seed = seed;
		for(uint i=0; i<num_participants; i++){
			drawTweet[twitterId].participants.push(participants[i]);
		}
    }


    function getParticipantByPosition(uint256 twitterId, uint256 position) public view returns (uint256) {
		return drawTweet[twitterId].participants[position];
    }

	
	function getRandomNumberByTwitterId(uint256 twitterId) public view returns (uint256 randomness) {
		bytes32 request_id = drawTweet[twitterId].requestId;
		require(drawRequest[request_id].status == requestStatus.returned);
		return drawRequest[request_id].randomNumber;
	}

	function getWinnerByTwitterId(uint256 twitterId) public view returns (uint256 winner) {
		bytes32 requestId = drawTweet[twitterId].requestId;
		require(drawRequest[requestId].status == requestStatus.returned);
		return drawTweet[twitterId].participants[drawRequest[requestId].randomNumber];
	}

	function getRandomRequestInfo(uint256 twitterId) public view returns (requestStatus status, 
			uint256 seed, uint256 randomNumber, uint256 originalRandomNumber
	) {
		bytes32 requestId = drawTweet[twitterId].requestId;
		status = drawRequest[requestId].status;
		seed = drawRequest[requestId].seed;
		randomNumber = drawRequest[requestId].randomNumber;
		originalRandomNumber = drawRequest[requestId].originalRandomNumber;
	}

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override{
        require(msg.sender == vrfCoordinator, "Fulfilment only permitted by Coordinator");
		drawRequest[requestId].originalRandomNumber = randomness; 
		drawRequest[requestId].randomNumber = randomness % drawTweet[drawRequest[requestId].twitterId].numParticipants;
		drawRequest[requestId].status = requestStatus.returned;
    }
}
