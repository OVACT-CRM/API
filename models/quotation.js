const mongoose = require('mongoose');

// Define designation schema
const designationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  quantity: { type: Number, required: true },
  discount: { type: Number, required: false },
  price: { type: Number, required: true },
});

// Define quotation schema
const quotationSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  designations: [designationSchema],
  subject: {type: String, required: true },
  total: { type: Number, required: false },
  status: { type: String, enum: ['draft', 'sent', 'signed'], default: 'draft' },
  signedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Define pre-save hook to calculate the total of the quotation
quotationSchema.pre('save', function (next) {
  this.total = this.designations.reduce((total, d) => total + (d.price * d.quantity * (1 - (d.discount / 100))), 0);
  next();
});

// Define quotation model
const Quotation = mongoose.model('Quotation', quotationSchema);

// Export quotation model
module.exports = Quotation;