const logger = require('./logger');

// Feature flag: enable Redis queues only if explicitly enabled
const QUEUES_ENABLED = process.env.QUEUES_ENABLED === 'true';

// Check if Redis is configured
let isRedisConfigured = (process.env.REDIS_URL || process.env.REDIS_HOST) && QUEUES_ENABLED;

let Queue, blockchainQueue, emailQueue, ipfsQueue, analyticsQueue;

if (isRedisConfigured) {
  try {
    Queue = require('bull');
    
    // Redis client configuration
    const redisConfig = {
      redis: {
        port: process.env.REDIS_PORT || 6379,
        host: process.env.REDIS_HOST || "localhost",
        username: process.env.REDIS_USERNAME || "default",
        password: process.env.REDIS_PASSWORD || undefined,
        db: 0,
      },
    };

    // Create job queues
    blockchainQueue = new Queue('blockchain operations', redisConfig);
    emailQueue = new Queue('email notifications', redisConfig);
    ipfsQueue = new Queue('ipfs operations', redisConfig);
    analyticsQueue = new Queue('analytics processing', redisConfig);
    
    logger.info('Job queues initialized with Redis');
    
    // Set up queue processors and event handlers
    setupQueueProcessors();
    setupEventHandlers();
    
  } catch (error) {
    logger.warn('Failed to initialize Redis queues, running without job queue:', error.message);
    isRedisConfigured = false;
  }
} else {
  logger.warn('Redis not configured, job queue features disabled');
}

function setupQueueProcessors() {
  if (!blockchainQueue) return;
  
  // Blockchain operations processor
  blockchainQueue.process('sync_complaint', 5, async (job) => {
    const { complaintId, complaintData } = job.data;
    
    try {
      const blockchainService = require('../services/blockchainService');
      
      if (!blockchainService.isConnected()) {
        throw new Error('Blockchain service not available');
      }
      
      // Submit complaint to blockchain
      const result = await blockchainService.submitComplaint(complaintData);
      
      // Update database with blockchain data
      const Complaint = require('../models/Complaint');
      await Complaint.findByIdAndUpdate(complaintId, {
        'blockchainData.complaintId': result.complaintId,
        'blockchainData.txHash': result.txHash,
        'blockchainData.blockNumber': result.blockNumber,
        'blockchainData.isOnChain': true,
        'blockchainData.lastSyncedAt': new Date()
      });
      
      logger.info('Blockchain sync_complaint completed', {
        complaintId: result.complaintId,
        dbId: complaintId,
        txHash: result.txHash
      });
      
      return result;
      
    } catch (error) {
      logger.error('Blockchain sync_complaint failed:', error, { complaintId });
      throw error;
    }
  });

  blockchainQueue.process('sync_project', 3, async (job) => {
    const { projectId, projectData } = job.data;
    
    try {
      const blockchainService = require('../services/blockchainService');
      
      if (!blockchainService.isConnected()) {
        throw new Error('Blockchain service not available');
      }
      
      // Register project on blockchain
      const result = await blockchainService.registerProject(projectData);
      
      // Update database with blockchain data
      const Project = require('../models/Project');
      await Project.findByIdAndUpdate(projectId, {
        'blockchain.projectId': result.projectId,
        'blockchain.txHash': result.txHash,
        'blockchain.blockNumber': result.blockNumber,
        'blockchain.isOnChain': true,
        'blockchain.lastSyncedAt': new Date()
      });
      
      logger.info('Blockchain sync_project completed', {
        projectId: result.projectId,
        dbId: projectId,
        txHash: result.txHash
      });
      
      return result;
      
    } catch (error) {
      logger.error('Blockchain sync_project failed:', error, { projectId });
      throw error;
    }
  });

  // Email notifications processor
  if (emailQueue) {
    emailQueue.process('send_notification', 10, async (job) => {
      const { to, subject, template, data } = job.data;
      
      try {
        const emailService = require('./emailService');
        
        const result = await emailService.sendEmail({
          to,
          subject,
          template,
          data
        });
        
        logger.info(`Email notification sent to ${to}: ${subject}`);
        
        return result;
        
      } catch (error) {
        logger.error('Failed to send email notification:', error, { to, subject });
        throw error;
      }
    });
  }

  // IPFS operations processor
  if (ipfsQueue) {
    ipfsQueue.process('upload_file', 10, async (job) => {
      const { data, metadata } = job.data;
      
      try {
        const ipfsService = require('../services/ipfsService');
        
        const result = await ipfsService.uploadFile(Buffer.from(data, 'base64'), metadata);
        
        logger.info('IPFS upload completed', { hash: result.hash, size: result.size });
        
        return result;
        
      } catch (error) {
        logger.error('IPFS upload failed:', error, { metadata });
        throw error;
      }
    });
  }

  // Analytics processor
  if (analyticsQueue) {
    analyticsQueue.process('update_statistics', 1, async (job) => {
      const { type } = job.data;
      
      try {
        let stats;
        
        switch (type) {
          case 'complaints':
            const Complaint = require('../models/Complaint');
            stats = await Complaint.getStatistics();
            break;
            
          case 'projects':
            const Project = require('../models/Project');
            stats = await Project.getStatistics();
            break;
            
          default:
            throw new Error(`Unknown statistics type: ${type}`);
        }
        
        logger.info(`Statistics updated for ${type}:`, stats);
        
        return stats;
        
      } catch (error) {
        logger.error('Failed to update statistics:', error, { type });
        throw error;
      }
    });
  }
}

function setupEventHandlers() {
  if (blockchainQueue) {
    blockchainQueue.on('completed', (job, result) => {
      logger.info(`Blockchain job ${job.id} completed`);
    });

    blockchainQueue.on('failed', (job, err) => {
      logger.error(`Blockchain job ${job.id} failed:`, err);
    });
  }

  if (emailQueue) {
    emailQueue.on('completed', (job, result) => {
      logger.info(`Email job ${job.id} completed`);
    });

    emailQueue.on('failed', (job, err) => {
      logger.error(`Email job ${job.id} failed:`, err);
    });
  }

  if (ipfsQueue) {
    ipfsQueue.on('completed', (job, result) => {
      logger.info(`IPFS job ${job.id} completed`);
    });

    ipfsQueue.on('failed', (job, err) => {
      logger.error(`IPFS job ${job.id} failed:`, err);
    });
  }

  if (analyticsQueue) {
    analyticsQueue.on('completed', (job, result) => {
      logger.info(`Analytics job ${job.id} completed`);
    });

    analyticsQueue.on('failed', (job, err) => {
      logger.error(`Analytics job ${job.id} failed:`, err);
    });
  }
}

// Queue management functions
const addJob = async (queueName, jobType, data, options = {}) => {
  if (!isRedisConfigured) {
    logger.warn(`Job queue not available, skipping job: ${queueName}/${jobType}`);
    return null;
  }
  
  const queues = {
    blockchain: blockchainQueue,
    email: emailQueue,
    ipfs: ipfsQueue,
    analytics: analyticsQueue
  };
  
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Unknown queue: ${queueName}`);
  }
  
  const defaultOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 10,
    removeOnFail: 5
  };
  
  const job = await queue.add(jobType, data, { ...defaultOptions, ...options });
  
  logger.info(`Added job ${job.id} to ${queueName} queue (${jobType})`);
  
  return job;
};

const getQueueStats = async (queueName) => {
  if (!isRedisConfigured) {
    return { error: 'Redis not configured' };
  }
  
  const queues = {
    blockchain: blockchainQueue,
    email: emailQueue,
    ipfs: ipfsQueue,
    analytics: analyticsQueue
  };
  
  const queue = queues[queueName];
  if (!queue) {
    throw new Error(`Unknown queue: ${queueName}`);
  }
  
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed()
  ]);
  
  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length
  };
};

const getAllQueueStats = async () => {
  if (!isRedisConfigured) {
    return { error: 'Redis not configured' };
  }
  
  const stats = {};
  
  for (const queueName of ['blockchain', 'email', 'ipfs', 'analytics']) {
    try {
      stats[queueName] = await getQueueStats(queueName);
    } catch (error) {
      stats[queueName] = { error: error.message };
    }
  }
  
  return stats;
};

// Export functions
module.exports = {
  addJob,
  getQueueStats,
  getAllQueueStats,
  isRedisConfigured,
  queues: {
    blockchain: blockchainQueue,
    email: emailQueue,
    ipfs: ipfsQueue,
    analytics: analyticsQueue
  }
};