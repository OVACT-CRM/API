const express = require('express');
const router = express.Router();
const Invoice = require('../models/invoice');
const Quotation = require('../models/quotation');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('client').populate('quotations');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific invoice by ID
router.get('/:id', getInvoice, (req, res) => {
  res.json(res.invoice);
});

// Create a new invoice
router.post('/', async (req, res) => {
  const { client, quotations, total, step, nbinvoices } = req.body;

  try {
    const selectedQuotations = await Quotation.find({ _id: { $in: quotations } });
    if (!selectedQuotations.length) {
      return res.status(400).json({ message: 'No quotations selected' });
    }

    //const total = selectedQuotations.reduce((sum, quotation) => sum + quotation.total, 0);

    const invoice = new Invoice({
      client,
      quotations,
      total,
      step,
      nbinvoices
    });

    await invoice.save();

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: `Error creating invoice: ${error.message}` });
  }
});



// Update an invoice
router.patch('/:id', getInvoice, async (req, res) => {
  const { client, quotations, total, step, nbinvoices } = req.body;

  try {
    const selectedQuotations = await Quotation.find({ _id: { $in: quotations } });
    if (!selectedQuotations.length) {
      return res.status(400).json({ message: 'No quotations selected' });
    }

    const invoice = res.invoice;

    invoice.client = client;
    invoice.quotations = quotations;
    invoice.total = total;
    invoice.step = step;
    invoice.nbinvoices = nbinvoices;

    await invoice.save();

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: `Error updating invoice: ${error.message}` });
  }
});


// Update invoice date
router.patch('/:id/date', getInvoice, async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: 'Invalid date' });
  }

  try {
    const invoice = res.invoice;
    invoice.createdAt = date;
    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: `Error updating invoice date: ${error.message}` });
  }
});

// Update invoice satuts
router.patch('/:id/status', getInvoice, async (req, res) => {
  const { status } = req.body;

  if (!status || (status !== 'unpaid' && status !== 'partially paid' && status !== 'paid')) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const invoice = res.invoice;
    invoice.status = status;

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: `Error updating invoice status: ${error.message}` });
  }
});



// Partially pay an invoice
router.patch('/:id/partially-paid', getInvoice, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount' });
  }

  try {
    const invoice = res.invoice;
    const newTotalPaid = invoice.totalPaid + amount;

    if (newTotalPaid >= invoice.total) {
      invoice.totalPaid = invoice.total;
      invoice.status = 'paid';
    } else {
      invoice.totalPaid = newTotalPaid;
      invoice.status = 'partially paid';
    }

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: `Error partially paying invoice: ${error.message}` });
  }
});

// Helper function to get a specific invoice by ID and attach it to the request object
async function getInvoice(req, res, next) {
  const id = req.params.id;

  try {
    const invoice = await Invoice.findById(id).populate('client').populate('quotations');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.invoice = invoice;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = router;