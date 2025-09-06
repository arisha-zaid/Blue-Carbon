const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Models
const mongoose = require('mongoose');
const User = require('../models/User');
const CommunityProfile = require('../models/CommunityProfile');
const Project = require('../models/Project');
const Complaint = require('../models/Complaint');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const MarketplaceListing = require('../models/MarketplaceListing');
const Policy = require('../models/Policy');
const RefreshToken = require('../models/RefreshToken');
const UserSession = require('../models/UserSession');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const FileAsset = require('../models/FileAsset');
const VerificationWorkflow = require('../models/VerificationWorkflow');
const ProjectComment = require('../models/ProjectComment');
const Watchlist = require('../models/Watchlist');
const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Dispute = require('../models/Dispute');
const LedgerEntry = require('../models/LedgerEntry');
const KYCRecord = require('../models/KYCRecord');
const UserConsent = require('../models/UserConsent');
const ApiKey = require('../models/ApiKey');
const WebhookEndpoint = require('../models/WebhookEndpoint');
const WebhookEvent = require('../models/WebhookEvent');
const SystemSetting = require('../models/SystemSetting');

router.get('/db-overview', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const collections = [
      ['users', User],
      ['communityProfiles', CommunityProfile],
      ['projects', Project],
      ['complaints', Complaint],
      ['transactions', Transaction],
      ['wallets', Wallet],
      ['marketplaceListings', MarketplaceListing],
      ['policies', Policy],
      ['refreshTokens', RefreshToken],
      ['userSessions', UserSession],
      ['notifications', Notification],
      ['auditLogs', AuditLog],
      ['fileAssets', FileAsset],
      ['verificationWorkflows', VerificationWorkflow],
      ['projectComments', ProjectComment],
      ['watchlists', Watchlist],
      ['orders', Order],
      ['invoices', Invoice],
      ['disputes', Dispute],
      ['ledgerEntries', LedgerEntry],
      ['kycRecords', KYCRecord],
      ['userConsents', UserConsent],
      ['apiKeys', ApiKey],
      ['webhookEndpoints', WebhookEndpoint],
      ['webhookEvents', WebhookEvent],
      ['systemSettings', SystemSetting],
    ];

    const counts = {};
    for (const [name, Model] of collections) {
      try { counts[name] = await Model.countDocuments(); } catch { counts[name] = 0; }
    }

    // Basic storage stats (MongoDB collection names)
    const rawCollections = await mongoose.connection.db.listCollections().toArray();

    res.json({ success: true, data: { counts, collections: rawCollections.map(c => c.name) } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to get DB overview', error: e.message });
  }
});

module.exports = router;