// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
 * @title ProjectRegistry
 * @dev Registry for environmental and carbon projects with NFT certificates
 */
contract ProjectRegistry is ERC721, AccessControl, ReentrancyGuard {
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant CERTIFIER_ROLE = keccak256("CERTIFIER_ROLE");
    
    enum ProjectType {
        Reforestation,
        RenewableEnergy,
        WasteManagement,
        CarbonCapture,
        BiodiversityConservation,
        SustainableAgriculture,
        CleanWater,
        Other
    }
    
    enum ProjectStatus {
        Proposed,
        UnderReview,
        Approved,
        Active,
        Completed,
        Verified,
        Rejected,
        Suspended
    }
    
    struct Project {
        uint256 id;
        string name;
        string description;
        ProjectType projectType;
        ProjectStatus status;
        address owner;
        string location;
        uint256 startDate;
        uint256 endDate;
        uint256 estimatedCO2Reduction; // in tons
        uint256 actualCO2Reduction;
        uint256 funding;
        uint256 fundingGoal;
        string[] documents; // IPFS hashes
        address[] validators;
        bool isVerified;
        string certificateHash;
        uint256 lastUpdated;
    }
    
    struct Milestone {
        uint256 projectId;
        string title;
        string description;
        uint256 targetDate;
        uint256 completedDate;
        bool isCompleted;
        string evidenceHash;
        address verifier;
    }
    
    struct Funding {
        uint256 projectId;
        address funder;
        uint256 amount;
        uint256 timestamp;
        string message;
    }
    
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone[]) public projectMilestones;
    mapping(uint256 => Funding[]) public projectFunding;
    mapping(address => uint256[]) public ownerProjects;
    mapping(uint256 => mapping(address => bool)) public projectValidators;
    
    uint256 private _projectCounter;
    uint256 private _certificateCounter;
    uint256 public totalProjects;
    uint256 public verifiedProjects;
    uint256 public totalFunding;
    
    event ProjectRegistered(
        uint256 indexed projectId,
        address indexed owner,
        string name,
        ProjectType projectType
    );
    
    event ProjectStatusUpdated(
        uint256 indexed projectId,
        ProjectStatus oldStatus,
        ProjectStatus newStatus,
        address updater
    );
    
    event ProjectFunded(
        uint256 indexed projectId,
        address indexed funder,
        uint256 amount
    );
    
    event MilestoneAdded(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        string title
    );
    
    event MilestoneCompleted(
        uint256 indexed projectId,
        uint256 milestoneIndex,
        address verifier
    );
    
    event ProjectVerified(
        uint256 indexed projectId,
        address validator,
        string certificateHash
    );
    
    event CertificateIssued(
        uint256 indexed projectId,
        uint256 indexed tokenId,
        address recipient
    );
    
    constructor() ERC721("EnvironmentalProjectCertificate", "EPC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VALIDATOR_ROLE, msg.sender);
        _grantRole(CERTIFIER_ROLE, msg.sender);
        _projectCounter = 1;
        _certificateCounter = 1;
    }
    
    /**
     * @dev Register a new environmental project
     */
    function registerProject(
        string memory name,
        string memory description,
        ProjectType projectType,
        string memory location,
        uint256 endDate,
        uint256 estimatedCO2Reduction,
        uint256 fundingGoal,
        string[] memory documents
    ) public nonReentrant returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(endDate > block.timestamp, "End date must be in the future");
        require(estimatedCO2Reduction > 0, "CO2 reduction must be greater than 0");
        
        uint256 projectId = _projectCounter++;
        
        projects[projectId] = Project({
            id: projectId,
            name: name,
            description: description,
            projectType: projectType,
            status: ProjectStatus.Proposed,
            owner: msg.sender,
            location: location,
            startDate: 0,
            endDate: endDate,
            estimatedCO2Reduction: estimatedCO2Reduction,
            actualCO2Reduction: 0,
            funding: 0,
            fundingGoal: fundingGoal,
            documents: documents,
            validators: new address[](0),
            isVerified: false,
            certificateHash: "",
            lastUpdated: block.timestamp
        });
        
        ownerProjects[msg.sender].push(projectId);
        totalProjects++;
        
        emit ProjectRegistered(projectId, msg.sender, name, projectType);
        
        return projectId;
    }
    
    /**
     * @dev Update project status
     */
    function updateProjectStatus(
        uint256 projectId,
        ProjectStatus newStatus
    ) public onlyRole(VALIDATOR_ROLE) {
        require(projectId < _projectCounter, "Project does not exist");
        
        Project storage project = projects[projectId];
        ProjectStatus oldStatus = project.status;
        
        project.status = newStatus;
        project.lastUpdated = block.timestamp;
        
        if (newStatus == ProjectStatus.Active && project.startDate == 0) {
            project.startDate = block.timestamp;
        }
        
        if (newStatus == ProjectStatus.Verified && !project.isVerified) {
            project.isVerified = true;
            verifiedProjects++;
        }
        
        emit ProjectStatusUpdated(projectId, oldStatus, newStatus, msg.sender);
    }
    
    /**
     * @dev Fund a project
     */
    function fundProject(uint256 projectId, string memory message) 
        public 
        payable 
        nonReentrant 
    {
        require(projectId < _projectCounter, "Project does not exist");
        require(msg.value > 0, "Funding amount must be greater than 0");
        
        Project storage project = projects[projectId];
        require(
            project.status == ProjectStatus.Approved || 
            project.status == ProjectStatus.Active,
            "Project not available for funding"
        );
        require(
            project.funding + msg.value <= project.fundingGoal,
            "Funding exceeds goal"
        );
        
        project.funding += msg.value;
        totalFunding += msg.value;
        
        projectFunding[projectId].push(Funding({
            projectId: projectId,
            funder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            message: message
        }));
        
        // Transfer funds to project owner
        payable(project.owner).transfer(msg.value);
        
        emit ProjectFunded(projectId, msg.sender, msg.value);
    }
    
    /**
     * @dev Add milestone to project
     */
    function addMilestone(
        uint256 projectId,
        string memory title,
        string memory description,
        uint256 targetDate
    ) public {
        require(projectId < _projectCounter, "Project does not exist");
        require(
            msg.sender == projects[projectId].owner ||
            hasRole(VALIDATOR_ROLE, msg.sender),
            "Not authorized"
        );
        
        projectMilestones[projectId].push(Milestone({
            projectId: projectId,
            title: title,
            description: description,
            targetDate: targetDate,
            completedDate: 0,
            isCompleted: false,
            evidenceHash: "",
            verifier: address(0)
        }));
        
        uint256 milestoneIndex = projectMilestones[projectId].length - 1;
        emit MilestoneAdded(projectId, milestoneIndex, title);
    }
    
    /**
     * @dev Complete milestone
     */
    function completeMilestone(
        uint256 projectId,
        uint256 milestoneIndex,
        string memory evidenceHash
    ) public onlyRole(VALIDATOR_ROLE) {
        require(projectId < _projectCounter, "Project does not exist");
        require(
            milestoneIndex < projectMilestones[projectId].length,
            "Milestone does not exist"
        );
        
        Milestone storage milestone = projectMilestones[projectId][milestoneIndex];
        require(!milestone.isCompleted, "Milestone already completed");
        
        milestone.isCompleted = true;
        milestone.completedDate = block.timestamp;
        milestone.evidenceHash = evidenceHash;
        milestone.verifier = msg.sender;
        
        emit MilestoneCompleted(projectId, milestoneIndex, msg.sender);
    }
    
    /**
     * @dev Verify project and update CO2 reduction
     */
    function verifyProject(
        uint256 projectId,
        uint256 actualCO2Reduction,
        string memory certificateHash
    ) public onlyRole(VALIDATOR_ROLE) {
        require(projectId < _projectCounter, "Project does not exist");
        
        Project storage project = projects[projectId];
        require(project.status == ProjectStatus.Completed, "Project not completed");
        
        project.actualCO2Reduction = actualCO2Reduction;
        project.certificateHash = certificateHash;
        project.validators.push(msg.sender);
        
        projectValidators[projectId][msg.sender] = true;
        
        updateProjectStatus(projectId, ProjectStatus.Verified);
        
        emit ProjectVerified(projectId, msg.sender, certificateHash);
    }
    
    /**
     * @dev Issue certificate NFT for verified project
     */
    function issueCertificate(uint256 projectId, address recipient) 
        public 
        onlyRole(CERTIFIER_ROLE) 
        returns (uint256) 
    {
        require(projectId < _projectCounter, "Project does not exist");
        require(projects[projectId].isVerified, "Project not verified");
        require(recipient != address(0), "Invalid recipient");
        
        uint256 tokenId = _certificateCounter++;
        _safeMint(recipient, tokenId);
        
        emit CertificateIssued(projectId, tokenId, recipient);
        
        return tokenId;
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 projectId) 
        public 
        view 
        returns (Project memory) 
    {
        require(projectId < _projectCounter, "Project does not exist");
        return projects[projectId];
    }
    
    /**
     * @dev Get project milestones
     */
    function getProjectMilestones(uint256 projectId) 
        public 
        view 
        returns (Milestone[] memory) 
    {
        require(projectId < _projectCounter, "Project does not exist");
        return projectMilestones[projectId];
    }
    
    /**
     * @dev Get project funding history
     */
    function getProjectFunding(uint256 projectId) 
        public 
        view 
        returns (Funding[] memory) 
    {
        require(projectId < _projectCounter, "Project does not exist");
        return projectFunding[projectId];
    }
    
    /**
     * @dev Get projects by owner
     */
    function getOwnerProjects(address owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return ownerProjects[owner];
    }
    
    /**
     * @dev Get projects by status
     */
    function getProjectsByStatus(ProjectStatus status) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i < _projectCounter; i++) {
            if (projects[i].status == status) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < _projectCounter; i++) {
            if (projects[i].status == status) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Get projects by type
     */
    function getProjectsByType(ProjectType projectType) 
        public 
        view 
        returns (uint256[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 1; i < _projectCounter; i++) {
            if (projects[i].projectType == projectType) {
                count++;
            }
        }
        
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 1; i < _projectCounter; i++) {
            if (projects[i].projectType == projectType) {
                result[index] = i;
                index++;
            }
        }
        
        return result;
    }
    
    /**
     * @dev Check if address is validator for project
     */
    function isProjectValidator(uint256 projectId, address validator) 
        public 
        view 
        returns (bool) 
    {
        return projectValidators[projectId][validator];
    }
    
    /**
     * @dev Get project funding percentage
     */
    function getFundingPercentage(uint256 projectId) 
        public 
        view 
        returns (uint256) 
    {
        require(projectId < _projectCounter, "Project does not exist");
        Project memory project = projects[projectId];
        if (project.fundingGoal == 0) return 0;
        return (project.funding * 100) / project.fundingGoal;
    }
    
    /**
     * @dev Get total CO2 reduction from all verified projects
     */
    function getTotalCO2Reduction() public view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 1; i < _projectCounter; i++) {
            if (projects[i].isVerified) {
                total += projects[i].actualCO2Reduction;
            }
        }
        return total;
    }
}