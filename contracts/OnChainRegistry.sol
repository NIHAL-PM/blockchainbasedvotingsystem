// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OnChainRegistry {
    address public owner;

    // --- State Variables ---
    mapping(address => bool) public pollingOfficers;

    struct Voter {
        bytes32 voterIdHash;
        string name; // For demo purposes
        uint256 constituencyId; // Fixed from uint26
        bool isRegistered;
        bool hasVoted;
    }

    mapping(bytes32 => Voter) public voterRegistry;
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts;
    string[5] public constituencies = ["Bengaluru South", "Bengaluru North", "Bengaluru Central", "Jayanagar", "Koramangala"];

    // --- Events ---
    event OfficerAuthorized(address indexed officer);
    event VoterRegistered(bytes32 indexed voterIdHash, uint256 constituencyId);
    event VoteCast(bytes32 indexed voterIdHash, uint256 constituencyId, uint256 candidateId);

    // --- Modifiers ---
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyOfficer() {
        require(pollingOfficers[msg.sender], "Only authorized polling officers can perform this action");
        _;
    }

    // --- Functions ---
    constructor() {
        owner = msg.sender;
        pollingOfficers[msg.sender] = true; 
    }

    function authorizeOfficer(address _officer) external onlyOwner {
        pollingOfficers[_officer] = true;
        emit OfficerAuthorized(_officer);
    }

    function registerVoter(string memory _voterId, string memory _name, uint256 _constituencyId) external onlyOfficer {
        require(_constituencyId < 5, "Invalid constituency");
        bytes32 voterIdHash = keccak256(abi.encodePacked(_voterId));

        require(!voterRegistry[voterIdHash].isRegistered, "Voter is already registered");

        voterRegistry[voterIdHash] = Voter({
            voterIdHash: voterIdHash,
            name: _name,
            constituencyId: _constituencyId,
            isRegistered: true,
            hasVoted: false
        });

        emit VoterRegistered(voterIdHash, _constituencyId);
    }

    function castVote(string memory _voterId, uint256 _candidateId) external onlyOfficer {
        bytes32 voterIdHash = keccak256(abi.encodePacked(_voterId));
        Voter storage voter = voterRegistry[voterIdHash];

        require(voter.isRegistered, "Voter is not registered");
        require(!voter.hasVoted, "This voter has already cast their vote");
        require(_candidateId < 2, "Invalid candidate ID"); // Added for validation

        voter.hasVoted = true;
        voteCounts[voter.constituencyId][_candidateId]++;

        emit VoteCast(voterIdHash, voter.constituencyId, _candidateId);
    }
}
