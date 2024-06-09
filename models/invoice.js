const mongoose = require('mongoose');

// Define invoice schema
const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  quotations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true }],
  total: { type: Number, required: true },
  totalPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid', 'partially paid', 'paid'], default: 'unpaid' },
  createdAt: { type: Date, default: Date.now },
  step: { type: Number, required: true },
  nbinvoices: { type: Number, required: true },
});

// Define invoice model
const Invoice = mongoose.model('Invoice', invoiceSchema);

// Export invoice model
module.exports = Invoice;