const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  number: { type: String, required: true, unique: true },
  pdfUrl: String,
  totals: {
    subtotal: Number,
    tax: Number,
    total: Number
  },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);