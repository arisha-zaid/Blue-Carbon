const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.isInitialized = false;
    
    this.init();
  }
  
  async init() {
    try {
      // Check if required environment variables are set
      if (!process.env.INFURA_PROJECT_ID || process.env.INFURA_PROJECT_ID === 'your_infura_project_id') {
        logger.warn('INFURA_PROJECT_ID not configured, blockchain features disabled');
        this.isInitialized = false;
        return; // Exit early without error
      }
      
      // Initialize provider
      const network = process.env.ETHEREUM_NETWORK || 'sepolia';
      const infuraUrl = `https://${network}.infura.io/v3/${process.env.INFURA_PROJECT_ID}`;
      
      this.provider = new ethers.JsonRpcProvider(infuraUrl);
      
      // Initialize wallet
      if (process.env.PRIVATE_KEY && !process.env.PRIVATE_KEY.includes('your_private_key') && process.env.PRIVATE_KEY.length >= 64) {
        // Remove 0x prefix if present and validate
        const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? 
          process.env.PRIVATE_KEY.slice(2) : process.env.PRIVATE_KEY;
        
        if (privateKey.length === 64) {
          this.wallet = new ethers.Wallet(privateKey, this.provider);
        } else {
          logger.warn('Invalid private key length, blockchain features disabled');
        }
      } else {
        logger.warn('Private key not configured, blockchain features disabled');
      }
      
      // Load and initialize contracts
      await this.loadContracts();
      
      this.isInitialized = true;
      logger.info('Blockchain service initialized successfully');
    } catch (error) {
      logger.warn('Blockchain service initialization issue:', error.message);
      // Don't throw error, just log it and continue
      logger.warn('Blockchain service will run in limited mode');
    }
  }
  
  async loadContracts() {
    try {
      // Load contract ABIs and addresses
      const contractsPath = path.join(__dirname, '../contracts/compiled');
      
      // Load Carbon Credit Contract
      if (process.env.CARBON_CREDIT_ADDRESS) {
        const carbonCreditABI = JSON.parse(
          fs.readFileSync(path.join(contractsPath, 'CarbonCredit.json'), 'utf8')
        );
        this.contracts.carbonCredit = new ethers.Contract(
          process.env.CARBON_CREDIT_ADDRESS,
          carbonCreditABI.abi,
          this.wallet
        );
      }
      
      // Load Complaint Registry Contract
      if (process.env.COMPLAINT_REGISTRY_ADDRESS) {
        const complaintRegistryABI = JSON.parse(
          fs.readFileSync(path.join(contractsPath, 'ComplaintRegistry.json'), 'utf8')
        );
        this.contracts.complaintRegistry = new ethers.Contract(
          process.env.COMPLAINT_REGISTRY_ADDRESS,
          complaintRegistryABI.abi,
          this.wallet
        );
      }
      
      // Load Project Registry Contract
      if (process.env.PROJECT_REGISTRY_ADDRESS) {
        const projectRegistryABI = JSON.parse(
          fs.readFileSync(path.join(contractsPath, 'ProjectRegistry.json'), 'utf8')
        );
        this.contracts.projectRegistry = new ethers.Contract(
          process.env.PROJECT_REGISTRY_ADDRESS,
          projectRegistryABI.abi,
          this.wallet
        );
      }
      
      logger.info('Smart contracts loaded successfully');
    } catch (error) {
      logger.warn('Failed to load contracts:', error.message);
    }
  }
  
  // Carbon Credit Methods
  async issueCredits(params) {
    try {
      if (!this.contracts.carbonCredit) {
        throw new Error('Carbon Credit contract not available');
      }
      
      const {
        to,
        amount,
        projectId,
        location,
        expiryDate,
        methodology,
        ipfsHash
      } = params;
      
      const tx = await this.contracts.carbonCredit.issueCredits(
        to,
        amount,
        projectId,
        location,
        Math.floor(new Date(expiryDate).getTime() / 1000),
        methodology,
        ipfsHash,
        {
          gasPrice: ethers.parseUnits(process.env.GAS_PRICE || '20', 'gwei'),
          gasLimit: parseInt(process.env.GAS_LIMIT) || 500000
        }
      );
      
      const receipt = await tx.wait();
      logger.info(`Carbon credits issued: ${tx.hash}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to issue carbon credits:', error);
      throw error;
    }
  }
  
  async retireCredits(creditId, amount, reason) {
    try {
      if (!this.contracts.carbonCredit) {
        throw new Error('Carbon Credit contract not available');
      }
      
      const tx = await this.contracts.carbonCredit.retireCredits(
        creditId,
        amount,
        reason,
        {
          gasPrice: ethers.parseUnits(process.env.GAS_PRICE || '20', 'gwei'),
          gasLimit: parseInt(process.env.GAS_LIMIT) || 300000
        }
      );
      
      const receipt = await tx.wait();
      logger.info(`Carbon credits retired: ${tx.hash}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to retire carbon credits:', error);
      throw error;
    }
  }
  
  async getCreditBalance(address) {
    try {
      if (!this.contracts.carbonCredit) {
        throw new Error('Carbon Credit contract not available');
      }
      
      const balance = await this.contracts.carbonCredit.creditBalance(address);
      return balance.toString();
    } catch (error) {
      logger.error('Failed to get credit balance:', error);
      throw error;
    }
  }
  
  async getCreditDetails(creditId) {
    try {
      if (!this.contracts.carbonCredit) {
        throw new Error('Carbon Credit contract not available');
      }
      
      const credit = await this.contracts.carbonCredit.getCredit(creditId);
      return {
        projectId: credit.projectId,
        location: credit.location,
        issuedDate: new Date(Number(credit.issuedDate) * 1000),
        expiryDate: new Date(Number(credit.expiryDate) * 1000),
        methodology: credit.methodology,
        ipfsHash: credit.ipfsHash,
        isRetired: credit.isRetired,
        issuer: credit.issuer,
        verifier: credit.verifier
      };
    } catch (error) {
      logger.error('Failed to get credit details:', error);
      throw error;
    }
  }
  
  // Complaint Methods
  async submitComplaint(params) {
    try {
      if (!this.contracts.complaintRegistry) {
        throw new Error('Complaint Registry contract not available');
      }
      
      const {
        title,
        description,
        category,
        priority,
        location,
        evidenceHashes,
        isAnonymous
      } = params;
      
      const tx = await this.contracts.complaintRegistry.submitComplaint(
        title,
        description,
        category,
        priority,
        location,
        evidenceHashes,
        isAnonymous,
        {
          gasPrice: ethers.parseUnits(process.env.GAS_PRICE || '20', 'gwei'),
          gasLimit: parseInt(process.env.GAS_LIMIT) || 500000
        }
      );
      
      const receipt = await tx.wait();
      
      // Extract complaint ID from events
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = this.contracts.complaintRegistry.interface.parseLog(log);
          return parsedLog.name === 'ComplaintSubmitted';
        } catch (e) {
          return false;
        }
      });
      
      const complaintId = event ? 
        this.contracts.complaintRegistry.interface.parseLog(event).args.complaintId :
        null;
      
      logger.info(`Complaint submitted: ${tx.hash}, ID: ${complaintId}`);
      
      return {
        success: true,
        complaintId: complaintId ? complaintId.toString() : null,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to submit complaint:', error);
      throw error;
    }
  }
  
  async updateComplaintStatus(complaintId, status, message) {
    try {
      if (!this.contracts.complaintRegistry) {
        throw new Error('Complaint Registry contract not available');
      }
      
      const tx = await this.contracts.complaintRegistry.updateComplaintStatus(
        complaintId,
        status,
        message,
        {
          gasPrice: ethers.parseUnits(process.env.GAS_PRICE || '20', 'gwei'),
          gasLimit: parseInt(process.env.GAS_LIMIT) || 300000
        }
      );
      
      const receipt = await tx.wait();
      logger.info(`Complaint status updated: ${tx.hash}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to update complaint status:', error);
      throw error;
    }
  }
  
  async getComplaint(complaintId) {
    try {
      if (!this.contracts.complaintRegistry) {
        throw new Error('Complaint Registry contract not available');
      }
      
      const complaint = await this.contracts.complaintRegistry.getComplaint(complaintId);
      return {
        id: complaint.id.toString(),
        complainant: complaint.complainant,
        title: complaint.title,
        description: complaint.description,
        category: Number(complaint.category),
        priority: Number(complaint.priority),
        status: Number(complaint.status),
        location: complaint.location,
        evidenceHashes: complaint.evidenceHashes,
        timestamp: new Date(Number(complaint.timestamp) * 1000),
        lastUpdated: new Date(Number(complaint.lastUpdated) * 1000),
        assignedTo: complaint.assignedTo,
        resolution: complaint.resolution,
        isAnonymous: complaint.isAnonymous,
        upvotes: complaint.upvotes.toString(),
        downvotes: complaint.downvotes.toString()
      };
    } catch (error) {
      logger.error('Failed to get complaint:', error);
      throw error;
    }
  }
  
  // Project Methods
  async registerProject(params) {
    try {
      if (!this.contracts.projectRegistry) {
        throw new Error('Project Registry contract not available');
      }
      
      const {
        name,
        description,
        projectType,
        location,
        endDate,
        estimatedCO2Reduction,
        fundingGoal,
        documents
      } = params;
      
      const tx = await this.contracts.projectRegistry.registerProject(
        name,
        description,
        projectType,
        location,
        Math.floor(new Date(endDate).getTime() / 1000),
        estimatedCO2Reduction,
        ethers.parseEther(fundingGoal.toString()),
        documents,
        {
          gasPrice: ethers.parseUnits(process.env.GAS_PRICE || '20', 'gwei'),
          gasLimit: parseInt(process.env.GAS_LIMIT) || 600000
        }
      );
      
      const receipt = await tx.wait();
      
      // Extract project ID from events
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = this.contracts.projectRegistry.interface.parseLog(log);
          return parsedLog.name === 'ProjectRegistered';
        } catch (e) {
          return false;
        }
      });
      
      const projectId = event ? 
        this.contracts.projectRegistry.interface.parseLog(event).args.projectId :
        null;
      
      logger.info(`Project registered: ${tx.hash}, ID: ${projectId}`);
      
      return {
        success: true,
        projectId: projectId ? projectId.toString() : null,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to register project:', error);
      throw error;
    }
  }
  
  async fundProject(projectId, amount, message) {
    try {
      if (!this.contracts.projectRegistry) {
        throw new Error('Project Registry contract not available');
      }
      
      const tx = await this.contracts.projectRegistry.fundProject(
        projectId,
        message,
        {
          value: ethers.parseEther(amount.toString()),
          gasPrice: ethers.parseUnits(process.env.GAS_PRICE || '20', 'gwei'),
          gasLimit: parseInt(process.env.GAS_LIMIT) || 300000
        }
      );
      
      const receipt = await tx.wait();
      logger.info(`Project funded: ${tx.hash}`);
      
      return {
        success: true,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Failed to fund project:', error);
      throw error;
    }
  }
  
  async getProject(projectId) {
    try {
      if (!this.contracts.projectRegistry) {
        throw new Error('Project Registry contract not available');
      }
      
      const project = await this.contracts.projectRegistry.getProject(projectId);
      return {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        projectType: Number(project.projectType),
        status: Number(project.status),
        owner: project.owner,
        location: project.location,
        startDate: project.startDate > 0 ? new Date(Number(project.startDate) * 1000) : null,
        endDate: new Date(Number(project.endDate) * 1000),
        estimatedCO2Reduction: project.estimatedCO2Reduction.toString(),
        actualCO2Reduction: project.actualCO2Reduction.toString(),
        funding: ethers.formatEther(project.funding),
        fundingGoal: ethers.formatEther(project.fundingGoal),
        documents: project.documents,
        validators: project.validators,
        isVerified: project.isVerified,
        certificateHash: project.certificateHash,
        lastUpdated: new Date(Number(project.lastUpdated) * 1000)
      };
    } catch (error) {
      logger.error('Failed to get project:', error);
      throw error;
    }
  }
  
  // Utility Methods
  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Failed to get transaction receipt:', error);
      throw error;
    }
  }
  
  async getCurrentGasPrice() {
    try {
      const gasPrice = await this.provider.getGasPrice();
      return ethers.formatUnits(gasPrice, 'gwei');
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      throw error;
    }
  }
  
  async estimateGas(contractMethod, params) {
    try {
      const estimate = await contractMethod.estimateGas(...params);
      return estimate.toString();
    } catch (error) {
      logger.error('Failed to estimate gas:', error);
      throw error;
    }
  }
  
  isConnected() {
    return this.isInitialized && this.provider && this.wallet;
  }
  
  getWalletAddress() {
    return this.wallet ? this.wallet.address : null;
  }
  
  async getBalance(address = null) {
    try {
      const addr = address || this.wallet.address;
      const balance = await this.provider.getBalance(addr);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get balance:', error);
      throw error;
    }
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;