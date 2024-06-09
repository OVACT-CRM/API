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



// GET all invoices for a client
router.get('/client/:clientID', async (req, res) => {
  try {
    const clientID = req.params.clientID;
    const invoices = await Invoice.find({ client: clientID });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");

    const invoiceCountForMonth = await Invoice.countDocuments({
      createdAt: {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1)
      }
    });

    const invoiceId = `Z${year}${month}${String(invoiceCountForMonth + 1).padStart(2, "0")}`;

    const invoice = new Invoice({
      invoiceId,
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

    // Parse the new date
    const newDate = new Date(date);
    const newDateYear = newDate.getFullYear();
    const newDateMonth = String(newDate.getMonth() + 1).padStart(2, "0");

    // Count documents in the new month and year
    const invoiceCountForMonth = await Invoice.countDocuments({
      createdAt: {
        $gte: new Date(newDateYear, newDateMonth - 1, 1),
        $lt: new Date(newDateYear, newDateMonth, 1)
      }
    });

    // Generate the new invoiceId
    const invoiceId = `Z${newDateYear}${newDateMonth}${String(invoiceCountForMonth + 1).padStart(2, "0")}`;

    // Update the invoice fields
    invoice.createdAt = newDate;
    invoice.invoiceId = invoiceId;

    // Save the updated invoice
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




// Delete an invoice
router.delete('/:id', getInvoice, async (req, res) => {
  try {
    await res.invoice.remove();
    res.json({ message: 'Invoice Deleted Successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});





module.exports = router;