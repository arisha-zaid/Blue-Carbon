const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Define which logs to display based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaString}`;
  })
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: 'debug', // Always show all logs in console
    format: format
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for blockchain operations
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/blockchain.log'),
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.printf((info) => {
        // Only log blockchain-related messages
        if (info.message && (
          info.message.includes('blockchain') ||
          info.message.includes('contract') ||
          info.message.includes('transaction') ||
          info.message.includes('IPFS') ||
          info.message.includes('ethereum')
        )) {
          return JSON.stringify(info);
        }
        return '';
      })
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 3
  })
];

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  
  // Handle unhandled rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ],
  
  exitOnError: false
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(message, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        body: req.body
      });
    } else {
      logger.http(message, {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      });
    }
  });
  
  next();
};

// Blockchain-specific logging methods
logger.blockchain = {
  transaction: (txHash, operation, details = {}) => {
    logger.info(`Blockchain transaction: ${operation}`, {
      txHash,
      operation,
      ...details,
      category: 'blockchain'
    });
  },
  
  contract: (contractName, method, params = {}) => {
    logger.info(`Contract interaction: ${contractName}.${method}`, {
      contract: contractName,
      method,
      params,
      category: 'blockchain'
    });
  },
  
  error: (operation, error, context = {}) => {
    logger.error(`Blockchain error: ${operation}`, {
      operation,
      error: error.message,
      stack: error.stack,
      ...context,
      category: 'blockchain'
    });
  },
  
  gas: (operation, gasUsed, gasPrice) => {
    logger.info(`Gas usage: ${operation}`, {
      operation,
      gasUsed,
      gasPrice,
      cost: gasUsed * gasPrice,
      category: 'blockchain'
    });
  }
};

// IPFS-specific logging methods
logger.ipfs = {
  upload: (hash, size, filename) => {
    logger.info(`IPFS upload: ${filename || 'file'}`, {
      hash,
      size,
      filename,
      category: 'ipfs'
    });
  },
  
  download: (hash, size) => {
    logger.info(`IPFS download: ${hash}`, {
      hash,
      size,
      category: 'ipfs'
    });
  },
  
  pin: (hash, operation) => {
    logger.info(`IPFS ${operation}: ${hash}`, {
      hash,
      operation,
      category: 'ipfs'
    });
  },
  
  error: (operation, error, context = {}) => {
    logger.error(`IPFS error: ${operation}`, {
      operation,
      error: error.message,
      ...context,
      category: 'ipfs'
    });
  }
};

// API-specific logging methods
logger.api = {
  request: (method, url, userId, params = {}) => {
    logger.info(`API request: ${method} ${url}`, {
      method,
      url,
      userId,
      params,
      category: 'api'
    });
  },
  
  response: (method, url, status, duration, userId) => {
    logger.info(`API response: ${method} ${url} - ${status}`, {
      method,
      url,
      status,
      duration,
      userId,
      category: 'api'
    });
  },
  
  error: (method, url, error, userId, context = {}) => {
    logger.error(`API error: ${method} ${url}`, {
      method,
      url,
      error: error.message,
      userId,
      ...context,
      category: 'api'
    });
  }
};

// Security logging methods
logger.security = {
  login: (userId, success, ip, userAgent) => {
    const message = success ? 'Login successful' : 'Login failed';
    const level = success ? 'info' : 'warn';
    
    logger.log(level, message, {
      userId,
      success,
      ip,
      userAgent,
      category: 'security'
    });
  },
  
  rateLimited: (ip, endpoint, attempts) => {
    logger.warn('Rate limit exceeded', {
      ip,
      endpoint,
      attempts,
      category: 'security'
    });
  },
  
  unauthorized: (userId, action, resource) => {
    logger.warn('Unauthorized access attempt', {
      userId,
      action,
      resource,
      category: 'security'
    });
  },
  
  suspicious: (description, context = {}) => {
    logger.warn(`Suspicious activity: ${description}`, {
      description,
      ...context,
      category: 'security'
    });
  }
};

// Performance logging methods
logger.performance = {
  slow: (operation, duration, threshold = 1000) => {
    if (duration > threshold) {
      logger.warn(`Slow operation: ${operation}`, {
        operation,
        duration,
        threshold,
        category: 'performance'
      });
    }
  },
  
  database: (query, duration, collection) => {
    logger.debug(`Database query: ${collection}`, {
      query,
      duration,
      collection,
      category: 'performance'
    });
  }
};

module.exports = logger;