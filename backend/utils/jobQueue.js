const Queue = require('bull');
const redis = require('redis');
const logger = require('./logger');

// Redis client configuration

const redisConfig = {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || "localhost",
    username: process.env.REDIS_USERNAME || "default",   // 👈 added this line
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
  },
};


// Create job queues
const blockchainQueue = new Queue('blockchain operations', redisConfig);
const emailQueue = new Queue('email notifications', redisConfig);
const ipfsQueue = new Queue('ipfs operations', redisConfig);
const analyticsQueue = new Queue('analytics processing', redisConfig);

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
    
    logger.blockchain.transaction(result.txHash, 'sync_complaint', {
      complaintId: result.complaintId,
      dbId: complaintId,
      gasUsed: result.gasUsed
    });
    
    return result;
    
  } catch (error) {
    logger.blockchain.error('sync_complaint', error, { complaintId });
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
    
    logger.blockchain.transaction(result.txHash, 'sync_project', {
      projectId: result.projectId,
      dbId: projectId,
      gasUsed: result.gasUsed
    });
    
    return result;
    
  } catch (error) {
    logger.blockchain.error('sync_project', error, { projectId });
    throw error;
  }
});

blockchainQueue.process('issue_credits', 2, async (job) => {
  const { creditData } = job.data;
  
  try {
    const blockchainService = require('../services/blockchainService');
    
    if (!blockchainService.isConnected()) {
      throw new Error('Blockchain service not available');
    }
    
    const result = await blockchainService.issueCredits(creditData);
    
    logger.blockchain.transaction(result.txHash, 'issue_credits', {
      to: creditData.to,
      amount: creditData.amount,
      projectId: creditData.projectId,
      gasUsed: result.gasUsed
    });
    
    return result;
    
  } catch (error) {
    logger.blockchain.error('issue_credits', error, { creditData });
    throw error;
  }
});

// Email notifications processor
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

emailQueue.process('send_bulk_notification', 2, async (job) => {
  const { recipients, subject, template, data } = job.data;
  
  try {
    const emailService = require('./emailService');
    
    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await emailService.sendEmail({
          to: recipient.email,
          subject,
          template,
          data: { ...data, ...recipient.data }
        });
        results.push({ email: recipient.email, success: true, result });
      } catch (error) {
        results.push({ email: recipient.email, success: false, error: error.message });
        logger.warn(`Failed to send email to ${recipient.email}:`, error.message);
      }
    }
    
    logger.info(`Bulk email completed: ${results.filter(r => r.success).length}/${results.length} sent`);
    
    return results;
    
  } catch (error) {
    logger.error('Failed to send bulk email notification:', error);
    throw error;
  }
});

// IPFS operations processor
ipfsQueue.process('upload_file', 10, async (job) => {
  const { data, metadata } = job.data;
  
  try {
    const ipfsService = require('../services/ipfsService');
    
    const result = await ipfsService.uploadFile(Buffer.from(data, 'base64'), metadata);
    
    logger.ipfs.upload(result.hash, result.size, metadata.filename);
    
    return result;
    
  } catch (error) {
    logger.ipfs.error('upload_file', error, { metadata });
    throw error;
  }
});

ipfsQueue.process('pin_file', 5, async (job) => {
  const { hash } = job.data;
  
  try {
    const ipfsService = require('../services/ipfsService');
    
    const result = await ipfsService.pinFile(hash);
    
    logger.ipfs.pin(hash, 'pin');
    
    return result;
    
  } catch (error) {
    logger.ipfs.error('pin_file', error, { hash });
    throw error;
  }
});

// Analytics processor
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
    
    // Cache statistics (you could use Redis here)
    logger.info(`Statistics updated for ${type}:`, stats);
    
    return stats;
    
  } catch (error) {
    logger.error('Failed to update statistics:', error, { type });
    throw error;
  }
});

// Event handlers
blockchainQueue.on('completed', (job, result) => {
  logger.info(`Blockchain job ${job.id} completed:`, result);
});

blockchainQueue.on('failed', (job, err) => {
  logger.error(`Blockchain job ${job.id} failed:`, err);
});

emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

ipfsQueue.on('completed', (job, result) => {
  logger.info(`IPFS job ${job.id} completed:`, result.hash);
});

ipfsQueue.on('failed', (job, err) => {
  logger.error(`IPFS job ${job.id} failed:`, err);
});

analyticsQueue.on('completed', (job, result) => {
  logger.info(`Analytics job ${job.id} completed`);
});

analyticsQueue.on('failed', (job, err) => {
  logger.error(`Analytics job ${job.id} failed:`, err);
});

// Queue management functions
const addJob = async (queueName, jobType, data, options = {}) => {
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

const clearQueue = async (queueName, state = 'completed') => {
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
  
  await queue.clean(0, state);
  logger.info(`Cleared ${state} jobs from ${queueName} queue`);
};

// Periodic statistics update
const schedulePeriodicJobs = () => {
  // Update complaint statistics every hour
  const complaintStatsJob = {
    repeat: { cron: '0 * * * *' }, // Every hour
    removeOnComplete: 1,
    removeOnFail: 1
  };
  
  analyticsQueue.add('update_statistics', { type: 'complaints' }, complaintStatsJob);
  
  // Update project statistics every 6 hours
  const projectStatsJob = {
    repeat: { cron: '0 */6 * * *' }, // Every 6 hours
    removeOnComplete: 1,
    removeOnFail: 1
  };
  
  analyticsQueue.add('update_statistics', { type: 'projects' }, projectStatsJob);
  
  logger.info('Scheduled periodic analytics jobs');
};

// Initialize periodic jobs
setTimeout(() => {
  schedulePeriodicJobs();
}, 5000); // Wait 5 seconds after startup

module.exports = {
  blockchainQueue,
  emailQueue,
  ipfsQueue,
  analyticsQueue,
  addJob,
  getQueueStats,
  getAllQueueStats,
  clearQueue
};