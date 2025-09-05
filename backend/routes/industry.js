const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const { authenticateJWT } = require('../middleware/auth');

// Get all transactions for the logged-in user
router.get('/transactions', authenticateJWT, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get wallet balance for the logged-in user
router.get('/wallet', authenticateJWT, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    res.json({ balance: wallet.balance, lastUpdated: wallet.lastUpdated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

module.exports = router;
