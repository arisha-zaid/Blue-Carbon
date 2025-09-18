let ipfsCreate;
try {
  const { create } = require("ipfs-http-client");
  ipfsCreate = create;
} catch (error) {
  console.warn("IPFS client not available, using fallback implementation");
  ipfsCreate = null;
}

const logger = require("../utils/logger");
const crypto = require("crypto");

class IPFSService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      if (!ipfsCreate) {
        logger.warn("IPFS client not available, running in fallback mode");
        return;
      }

      // Initialize IPFS client
      const auth =
        process.env.IPFS_PROJECT_ID && process.env.IPFS_PROJECT_SECRET
          ? `Basic ${Buffer.from(
              `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
            ).toString("base64")}`
          : undefined;

      this.client = ipfsCreate({
        url: process.env.IPFS_ENDPOINT || "https://ipfs.infura.io:5001",
        headers: auth ? { authorization: auth } : {},
      });

      // Test connection
      await this.client.version();

      this.isInitialized = true;
      logger.info("IPFS service initialized successfully");
    } catch (error) {
      logger.warn("Failed to initialize IPFS service:", error.message);
      // Continue without IPFS for now
    }
  }

  /**
   * Upload file to IPFS
   * @param {Buffer|string} data - File data
   * @param {Object} options - Upload options
   * @returns {Object} - Upload result with hash
   */
  async uploadFile(data, options = {}) {
    if (!this.isInitialized) {
      // Fallback implementation for testing/development
      logger.warn("IPFS not available, using fallback implementation");
      const hash = this.generateHash(data);
      const size = Buffer.isBuffer(data)
        ? data.length
        : Buffer.from(data).length;
      const { filename, mimeType } = options;

      return {
        hash: `fallback_${hash}`,
        size,
        url: `http://localhost/fallback/${hash}`,
        filename: filename || null,
        mimeType: mimeType || null,
        uploadedAt: new Date(),
        isFallback: true,
      };
    }

    try {
      const { filename, mimeType } = options;

      // Add file to IPFS
      const result = await this.client.add({
        content: data,
        path: filename || `file_${Date.now()}`,
        mode: 0o644,
      });

      const hash = result.cid.toString();
      const size = result.size;

      logger.info(`File uploaded to IPFS: ${hash} (${size} bytes)`);

      return {
        hash,
        size,
        url: `https://ipfs.io/ipfs/${hash}`,
        filename: filename || null,
        mimeType: mimeType || null,
        uploadedAt: new Date(),
      };
    } catch (error) {
      logger.error("Failed to upload file to IPFS:", error);
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS
   * @param {Object} data - JSON data to upload
   * @param {string} filename - Optional filename
   * @returns {Object} - Upload result with hash
   */
  async uploadJSON(data, filename = null) {
    try {
      const jsonString = JSON.stringify(data, null, 2);

      return await this.uploadFile(Buffer.from(jsonString), {
        filename: filename || `data_${Date.now()}.json`,
        mimeType: "application/json",
      });
    } catch (error) {
      logger.error("Failed to upload JSON to IPFS:", error);
      throw error;
    }
  }

  /**
   * Upload multiple files to IPFS
   * @param {Array} files - Array of file objects with data and metadata
   * @returns {Array} - Array of upload results
   */
  async uploadMultipleFiles(files) {
    if (!this.isInitialized) {
      // Fallback implementation for testing/development
      logger.warn(
        "IPFS not available, using fallback implementation for multiple files"
      );
      const results = [];

      for (const file of files) {
        const result = await this.uploadFile(file.data, {
          filename: file.filename,
          mimeType: file.mimeType,
        });
        results.push(result);
      }

      return results;
    }

    try {
      const results = [];

      for (const file of files) {
        const result = await this.uploadFile(file.data, {
          filename: file.filename,
          mimeType: file.mimeType,
        });
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error("Failed to upload multiple files to IPFS:", error);
      throw error;
    }
  }

  /**
   * Retrieve file from IPFS
   * @param {string} hash - IPFS hash
   * @returns {Buffer} - File content
   */
  async getFile(hash) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      const chunks = [];

      for await (const chunk of this.client.cat(hash)) {
        chunks.push(chunk);
      }

      const data = Buffer.concat(chunks);
      logger.info(`Retrieved file from IPFS: ${hash} (${data.length} bytes)`);

      return data;
    } catch (error) {
      logger.error("Failed to retrieve file from IPFS:", error);
      throw error;
    }
  }

  /**
   * Retrieve JSON data from IPFS
   * @param {string} hash - IPFS hash
   * @returns {Object} - Parsed JSON data
   */
  async getJSON(hash) {
    try {
      const data = await this.getFile(hash);
      return JSON.parse(data.toString());
    } catch (error) {
      logger.error("Failed to retrieve JSON from IPFS:", error);
      throw error;
    }
  }

  /**
   * Pin file to prevent garbage collection
   * @param {string} hash - IPFS hash to pin
   * @returns {boolean} - Success status
   */
  async pinFile(hash) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      await this.client.pin.add(hash);
      logger.info(`File pinned to IPFS: ${hash}`);
      return true;
    } catch (error) {
      logger.error("Failed to pin file to IPFS:", error);
      throw error;
    }
  }

  /**
   * Unpin file
   * @param {string} hash - IPFS hash to unpin
   * @returns {boolean} - Success status
   */
  async unpinFile(hash) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      await this.client.pin.rm(hash);
      logger.info(`File unpinned from IPFS: ${hash}`);
      return true;
    } catch (error) {
      logger.error("Failed to unpin file from IPFS:", error);
      throw error;
    }
  }

  /**
   * Get file stats
   * @param {string} hash - IPFS hash
   * @returns {Object} - File statistics
   */
  async getStats(hash) {
    if (!this.isInitialized) {
      throw new Error("IPFS service not initialized");
    }

    try {
      const stats = await this.client.files.stat(`/ipfs/${hash}`);
      return {
        hash,
        size: stats.size,
        type: stats.type,
        blocks: stats.blocks,
        cumulativeSize: stats.cumulativeSize,
      };
    } catch (error) {
      logger.error("Failed to get file stats from IPFS:", error);
      throw error;
    }
  }

  /**
   * Check if file exists in IPFS
   * @param {string} hash - IPFS hash
   * @returns {boolean} - Existence status
   */
  async exists(hash) {
    try {
      await this.getStats(hash);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate file hash before uploading (for verification)
   * @param {Buffer|string} data - File data
   * @returns {string} - SHA256 hash
   */
  generateHash(data) {
    const hash = crypto.createHash("sha256");
    hash.update(data);
    return hash.digest("hex");
  }

  /**
   * Upload file with metadata
   * @param {Buffer|string} data - File data
   * @param {Object} metadata - File metadata
   * @returns {Object} - Upload result with metadata
   */
  async uploadWithMetadata(data, metadata = {}) {
    try {
      // Upload main file
      const fileResult = await this.uploadFile(data, metadata);

      // Create metadata object
      const metadataObj = {
        ...metadata,
        ...fileResult,
        fileHash: this.generateHash(data),
        uploadedBy: metadata.userId || null,
        timestamp: Date.now(),
        version: "1.0",
      };

      // Upload metadata
      const metadataResult = await this.uploadJSON(
        metadataObj,
        `${fileResult.hash}_metadata.json`
      );

      return {
        file: fileResult,
        metadata: {
          ...metadataResult,
          data: metadataObj,
        },
      };
    } catch (error) {
      logger.error("Failed to upload file with metadata:", error);
      throw error;
    }
  }

  /**
   * Create a directory structure in IPFS
   * @param {Object} structure - Directory structure
   * @returns {string} - Directory hash
   */
  async createDirectory(structure) {
    if (!this.isInitialized) {
      // Fallback implementation for testing/development
      logger.warn(
        "IPFS not available, using fallback implementation for directory"
      );
      const hash = this.generateHash(JSON.stringify(structure));
      return `fallback_dir_${hash}`;
    }

    try {
      const files = [];

      for (const [path, content] of Object.entries(structure)) {
        files.push({
          path,
          content: Buffer.isBuffer(content) ? content : Buffer.from(content),
        });
      }

      const results = this.client.addAll(files);
      let directoryHash;

      for await (const result of results) {
        if (result.path === "") {
          directoryHash = result.cid.toString();
        }
      }

      logger.info(`Directory created in IPFS: ${directoryHash}`);

      return directoryHash;
    } catch (error) {
      logger.error("Failed to create directory in IPFS:", error);
      throw error;
    }
  }

  /**
   * Get IPFS node information
   * @returns {Object} - Node information
   */
  async getNodeInfo() {
    if (!this.isInitialized) {
      // Fallback implementation for testing/development
      logger.warn(
        "IPFS not available, using fallback implementation for node info"
      );
      return {
        version: "fallback-1.0.0",
        id: "fallback-node-id",
        isFallback: true,
      };
    }

    try {
      const version = await this.client.version();
      const id = await this.client.id();

      return {
        version: version.version,
        nodeId: id.id,
        publicKey: id.publicKey,
        addresses: id.addresses,
        agentVersion: id.agentVersion,
        protocolVersion: id.protocolVersion,
      };
    } catch (error) {
      logger.error("Failed to get IPFS node info:", error);
      throw error;
    }
  }

  /**
   * Check if IPFS service is available
   * @returns {boolean} - Service availability
   */
  isAvailable() {
    return this.isInitialized && this.client !== null;
  }

  /**
   * Validate IPFS hash format
   * @param {string} hash - Hash to validate
   * @returns {boolean} - Validation result
   */
  isValidHash(hash) {
    // Basic IPFS hash validation (CIDv0 and CIDv1)
    const cidv0Regex = /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/;
    const cidv1Regex = /^[a-z2-7]{59}$/;

    return cidv0Regex.test(hash) || cidv1Regex.test(hash);
  }
}

// Singleton instance
const ipfsService = new IPFSService();

module.exports = ipfsService;
