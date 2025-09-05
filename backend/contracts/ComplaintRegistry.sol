// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title ComplaintRegistry
 * @dev Smart contract for managing environmental complaints and reports
 */
contract ComplaintRegistry is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    
    enum ComplaintStatus {
        Submitted,
        UnderReview,
        Investigating,
        Resolved,
        Rejected,
        Escalated
    }
    
    enum Priority {
        Low,
        Medium,
        High,
        Critical
    }
    
    enum Category {
        AirPollution,
        WaterPollution,
        SoilContamination,
        NoiseViolation,
        WasteManagement,
        ForestDestruction,
        IllegalDumping,
        Other
    }
    
    struct Complaint {
        uint256 id;
        address complainant;
        string title;
        string description;
        Category category;
        Priority priority;
        ComplaintStatus status;
        string location;
        string[] evidenceHashes; // IPFS hashes
        uint256 timestamp;
        uint256 lastUpdated;
        address assignedTo;
        string resolution;
        bool isAnonymous;
        uint256 upvotes;
        uint256 downvotes;
    }
    
    struct Evidence {
        string ipfsHash;
        string description;
        address submitter;
        uint256 timestamp;
        bool isVerified;
    }
    
    struct Update {
        address updater;
        string message;
        ComplaintStatus newStatus;
        uint256 timestamp;
    }
    
    mapping(uint256 => Complaint) public complaints;
    mapping(uint256 => Evidence[]) public complaintEvidence;
    mapping(uint256 => Update[]) public complaintUpdates;
    mapping(address => uint256[]) public userComplaints;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    
    uint256 private _complaintCounter;
    uint256 public totalComplaints;
    uint256 public resolvedComplaints;
    
    event ComplaintSubmitted(
        uint256 indexed complaintId,
        address indexed complainant,
        Category category,
        Priority priority,
        string location
    );
    
    event ComplaintStatusUpdated(
        uint256 indexed complaintId,
        ComplaintStatus oldStatus,
        ComplaintStatus newStatus,
        address updater
    );
    
    event EvidenceAdded(
        uint256 indexed complaintId,
        string ipfsHash,
        address submitter
    );
    
    event ComplaintVoted(
        uint256 indexed complaintId,
        address voter,
        bool isUpvote
    );
    
    event ComplaintResolved(
        uint256 indexed complaintId,
        string resolution,
        address resolver
    );
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _complaintCounter = 1;
    }
    
    /**
     * @dev Submit a new complaint
     */
    function submitComplaint(
        string memory title,
        string memory description,
        Category category,
        Priority priority,
        string memory location,
        string[] memory evidenceHashes,
        bool isAnonymous
    ) public whenNotPaused nonReentrant returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        uint256 complaintId = _complaintCounter++;
        
        complaints[complaintId] = Complaint({
            id: complaintId,
            complainant: isAnonymous ? address(0) : msg.sender,
            title: title,
            description: description,
            category: category,
            priority: priority,
            status: ComplaintStatus.Submitted,
            location: location,
            evidenceHashes: evidenceHashes,
            timestamp: block.timestamp,
            lastUpdated: block.timestamp,
            assignedTo: address(0),
            resolution: "",
            isAnonymous: isAnonymous,
            upvotes: 0,
            downvotes: 0
        });
        
        if (!isAnonymous) {
            userComplaints[msg.sender].push(complaintId);
        }
        
        // Add evidence
        for (uint i = 0; i < evidenceHashes.length; i++) {
            complaintEvidence[complaintId].push(Evidence({
                ipfsHash: evidenceHashes[i],
                description: "",
                submitter: msg.sender,
                timestamp: block.timestamp,
                isVerified: false
            }));
        }
        
        // Add initial update
        complaintUpdates[complaintId].push(Update({
            updater: msg.sender,
            message: "Complaint submitted",
            newStatus: ComplaintStatus.Submitted,
            timestamp: block.timestamp
        }));
        
        totalComplaints++;
        
        emit ComplaintSubmitted(complaintId, msg.sender, category, priority, location);
        
        return complaintId;
    }
    
    /**
     * @dev Update complaint status
     */
    function updateComplaintStatus(
        uint256 complaintId,
        ComplaintStatus newStatus,
        string memory message
    ) public onlyRole(VALIDATOR_ROLE) {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        
        Complaint storage complaint = complaints[complaintId];
        ComplaintStatus oldStatus = complaint.status;
        
        complaint.status = newStatus;
        complaint.lastUpdated = block.timestamp;
        
        if (newStatus == ComplaintStatus.Resolved && oldStatus != ComplaintStatus.Resolved) {
            resolvedComplaints++;
        } else if (oldStatus == ComplaintStatus.Resolved && newStatus != ComplaintStatus.Resolved) {
            resolvedComplaints--;
        }
        
        complaintUpdates[complaintId].push(Update({
            updater: msg.sender,
            message: message,
            newStatus: newStatus,
            timestamp: block.timestamp
        }));
        
        emit ComplaintStatusUpdated(complaintId, oldStatus, newStatus, msg.sender);
    }
    
    /**
     * @dev Add evidence to existing complaint
     */
    function addEvidence(
        uint256 complaintId,
        string memory ipfsHash,
        string memory description
    ) public whenNotPaused {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        complaintEvidence[complaintId].push(Evidence({
            ipfsHash: ipfsHash,
            description: description,
            submitter: msg.sender,
            timestamp: block.timestamp,
            isVerified: false
        }));
        
        emit EvidenceAdded(complaintId, ipfsHash, msg.sender);
    }
    
    /**
     * @dev Vote on a complaint (upvote/downvote)
     */
    function voteOnComplaint(uint256 complaintId, bool isUpvote) 
        public 
        whenNotPaused 
    {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        require(!hasVoted[complaintId][msg.sender], "Already voted on this complaint");
        
        Complaint storage complaint = complaints[complaintId];
        
        if (isUpvote) {
            complaint.upvotes++;
            hasUpvoted[complaintId][msg.sender] = true;
        } else {
            complaint.downvotes++;
        }
        
        hasVoted[complaintId][msg.sender] = true;
        
        emit ComplaintVoted(complaintId, msg.sender, isUpvote);
    }
    
    /**
     * @dev Resolve a complaint
     */
    function resolveComplaint(
        uint256 complaintId,
        string memory resolution
    ) public onlyRole(VALIDATOR_ROLE) {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        require(bytes(resolution).length > 0, "Resolution cannot be empty");
        
        Complaint storage complaint = complaints[complaintId];
        ComplaintStatus oldStatus = complaint.status;
        
        complaint.status = ComplaintStatus.Resolved;
        complaint.resolution = resolution;
        complaint.lastUpdated = block.timestamp;
        
        if (oldStatus != ComplaintStatus.Resolved) {
            resolvedComplaints++;
        }
        
        complaintUpdates[complaintId].push(Update({
            updater: msg.sender,
            message: string(abi.encodePacked("Resolved: ", resolution)),
            newStatus: ComplaintStatus.Resolved,
            timestamp: block.timestamp
        }));
        
        emit ComplaintResolved(complaintId, resolution, msg.sender);
        emit ComplaintStatusUpdated(complaintId, oldStatus, ComplaintStatus.Resolved, msg.sender);
    }
    
    /**
     * @dev Assign complaint to validator
     */
    function assignComplaint(uint256 complaintId, address validator) 
        public 
        onlyRole(MODERATOR_ROLE) 
    {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        require(hasRole(VALIDATOR_ROLE, validator), "Invalid validator");
        
        complaints[complaintId].assignedTo = validator;
        complaints[complaintId].lastUpdated = block.timestamp;
        
        updateComplaintStatus(complaintId, ComplaintStatus.UnderReview, "Assigned to validator");
    }
    
    /**
     * @dev Verify evidence
     */
    function verifyEvidence(uint256 complaintId, uint256 evidenceIndex) 
        public 
        onlyRole(VALIDATOR_ROLE) 
    {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        require(evidenceIndex < complaintEvidence[complaintId].length, "Evidence does not exist");
        
        complaintEvidence[complaintId][evidenceIndex].isVerified = true;
    }
    
    /**
     * @dev Get complaint details
     */
    function getComplaint(uint256 complaintId) 
        public 
        view 
        returns (Complaint memory) 
    {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        return complaints[complaintId];
    }
    
    /**
     * @dev Get complaint evidence
     */
    function getComplaintEvidence(uint256 complaintId) 
        public 
        view 
        returns (Evidence[] memory) 
    {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        return complaintEvidence[complaintId];
    }
    
    /**
     * @dev Get complaint updates
     */
    function getComplaintUpdates(uint256 complaintId) 
        public 
        view 
        returns (Update[] memory) 
    {
        require(complaintId < _complaintCounter, "Complaint does not exist");
        return complaintUpdates[complaintId];
    }
    
    /**
     * @dev Get user complaints
     */
    function getUserComplaints(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userComplaints[user];
    }
    
    /**
     * @dev Get complaints by status
     */
    function getComplaintsByStatus(ComplaintStatus status) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i < _complaintCounter; i++) {
            if (complaints[i].status == status) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < _complaintCounter; i++) {
            if (complaints[i].status == status) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get complaints by category
     */
    function getComplaintsByCategory(Category category) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i < _complaintCounter; i++) {
            if (complaints[i].category == category) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < _complaintCounter; i++) {
            if (complaints[i].category == category) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Get total complaints count
     */
    function getTotalComplaints() public view returns (uint256) {
        return totalComplaints;
    }
    
    /**
     * @dev Get resolution rate
     */
    function getResolutionRate() public view returns (uint256) {
        if (totalComplaints == 0) return 0;
        return (resolvedComplaints * 100) / totalComplaints;
    }
}