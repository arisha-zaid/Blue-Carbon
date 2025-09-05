// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CarbonCredit
 * @dev ERC20 token for carbon credits with additional functionality
 */
contract CarbonCredit is ERC20, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    struct CreditData {
        string projectId;
        string location;
        uint256 issuedDate;
        uint256 expiryDate;
        string methodology;
        string ipfsHash;
        bool isRetired;
        address issuer;
        address verifier;
    }
    
    struct Project {
        string name;
        string description;
        string location;
        uint256 totalCredits;
        uint256 issuedCredits;
        bool isActive;
        address owner;
        string[] documents; // IPFS hashes
    }
    
    mapping(uint256 => CreditData) public credits;
    mapping(string => Project) public projects;
    mapping(address => uint256[]) public userCredits;
    mapping(uint256 => bool) public retiredCredits;
    
    uint256 private _currentCreditId;
    uint256 public totalRetiredCredits;
    
    event CreditIssued(
        uint256 indexed creditId,
        string indexed projectId,
        address indexed recipient,
        uint256 amount,
        string ipfsHash
    );
    
    event CreditRetired(
        uint256 indexed creditId,
        address indexed owner,
        uint256 amount,
        string reason
    );
    
    event ProjectRegistered(
        string indexed projectId,
        address indexed owner,
        string name,
        uint256 totalCredits
    );
    
    event CreditTransferred(
        uint256 indexed creditId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    
    constructor() ERC20("CarbonCredit", "CC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _currentCreditId = 1;
    }
    
    /**
     * @dev Register a new carbon credit project
     */
    function registerProject(
        string memory projectId,
        string memory name,
        string memory description,
        string memory location,
        uint256 totalCredits,
        string[] memory documents
    ) public {
        require(bytes(projects[projectId].name).length == 0, "Project already exists");
        require(totalCredits > 0, "Total credits must be greater than 0");
        
        projects[projectId] = Project({
            name: name,
            description: description,
            location: location,
            totalCredits: totalCredits,
            issuedCredits: 0,
            isActive: true,
            owner: msg.sender,
            documents: documents
        });
        
        emit ProjectRegistered(projectId, msg.sender, name, totalCredits);
    }
    
    /**
     * @dev Issue carbon credits for a verified project
     */
    function issueCredits(
        address to,
        uint256 amount,
        string memory projectId,
        string memory location,
        uint256 expiryDate,
        string memory methodology,
        string memory ipfsHash
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(bytes(projects[projectId].name).length > 0, "Project not found");
        require(projects[projectId].isActive, "Project is not active");
        require(
            projects[projectId].issuedCredits + amount <= projects[projectId].totalCredits,
            "Exceeds project total credits"
        );
        require(expiryDate > block.timestamp, "Expiry date must be in the future");
        
        uint256 creditId = _currentCreditId++;
        
        credits[creditId] = CreditData({
            projectId: projectId,
            location: location,
            issuedDate: block.timestamp,
            expiryDate: expiryDate,
            methodology: methodology,
            ipfsHash: ipfsHash,
            isRetired: false,
            issuer: msg.sender,
            verifier: address(0)
        });
        
        userCredits[to].push(creditId);
        projects[projectId].issuedCredits += amount;
        
        _mint(to, amount * 1e18); // 18 decimals
        
        emit CreditIssued(creditId, projectId, to, amount, ipfsHash);
    }
    
    /**
     * @dev Retire carbon credits (permanently remove from circulation)
     */
    function retireCredits(
        uint256 creditId,
        uint256 amount,
        string memory reason
    ) public nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount * 1e18, "Insufficient balance");
        require(!credits[creditId].isRetired, "Credits already retired");
        require(
            block.timestamp <= credits[creditId].expiryDate,
            "Credits have expired"
        );
        
        credits[creditId].isRetired = true;
        retiredCredits[creditId] = true;
        totalRetiredCredits += amount;
        
        _burn(msg.sender, amount * 1e18);
        
        emit CreditRetired(creditId, msg.sender, amount, reason);
    }
    
    /**
     * @dev Verify credits by authorized verifier
     */
    function verifyCredits(uint256 creditId, address verifier) 
        public 
        onlyRole(VERIFIER_ROLE) 
    {
        require(credits[creditId].issuer != address(0), "Credit does not exist");
        credits[creditId].verifier = verifier;
    }
    
    /**
     * @dev Get project information
     */
    function getProject(string memory projectId) 
        public 
        view 
        returns (Project memory) 
    {
        return projects[projectId];
    }
    
    /**
     * @dev Get credit information
     */
    function getCredit(uint256 creditId) 
        public 
        view 
        returns (CreditData memory) 
    {
        return credits[creditId];
    }
    
    /**
     * @dev Get user's credit IDs
     */
    function getUserCredits(address user) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return userCredits[user];
    }
    
    /**
     * @dev Pause contract functions
     */
    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause contract functions
     */
    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Override transfer to track credit ownership
     */
    function _transfer(address from, address to, uint256 amount) 
        internal 
        override 
        whenNotPaused 
    {
        super._transfer(from, to, amount);
        
        // Update user credits tracking
        // This is a simplified version - in production, you'd need more sophisticated tracking
        emit CreditTransferred(0, from, to, amount);
    }
    
    /**
     * @dev Check if credits are expired
     */
    function isExpired(uint256 creditId) public view returns (bool) {
        return block.timestamp > credits[creditId].expiryDate;
    }
    
    /**
     * @dev Get total supply in credits (not wei)
     */
    function totalCredits() public view returns (uint256) {
        return totalSupply() / 1e18;
    }
    
    /**
     * @dev Get user balance in credits (not wei)
     */
    function creditBalance(address account) public view returns (uint256) {
        return balanceOf(account) / 1e18;
    }
}