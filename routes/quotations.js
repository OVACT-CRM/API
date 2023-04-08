const express = require('express');
const router = express.Router();
const Quotation = require('../models/quotation');

// GET all quotations
router.get('/', async (req, res) => {
  try {
    const quotations = await Quotation.find();
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET all quotations for a client
router.get('/client/:clientID', async (req, res) => {
  try {
    const clientID = req.params.clientID;
    const quotations = await Quotation.find({ client: clientID });
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single quotation
router.get('/:quotationId', async (req, res) => {
  const { quotationId } = req.params;
  try {
    const quotation = await Quotation.findById(quotationId).populate('client');
    if (!quotation) {
      res.status(404).json({ message: 'Quotation not found' });
    } else {
      res.status(200).json(quotation);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// CREATE a quotation
router.post('/', async (req, res) => {
  const quotation = new Quotation({
    client: req.body.client,
    subject: req.body.subject,
    designations: req.body.designations,
    total: req.body.total
  });

  try {
    const newQuotation = await quotation.save();
    res.status(201).json(newQuotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a quotation
router.patch('/:id', getQuotation, async (req, res) => {
  if (req.body.client != null) {
    res.quotation.client = req.body.client;
  }
  if (req.body.designations != null) {
    res.quotation.designations = req.body.designations;
  }
  if (req.body.status != null) {
    res.quotation.status = req.body.status;
    if (req.body.status === 'signed') {
      res.quotation.signedAt = new Date();
    }
  }
  if (req.body.date != null) {
    res.quotation.createdAt = req.body.date;
  }

  try {
    const updatedQuotation = await res.quotation.save();
    res.json(updatedQuotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a quotation
router.delete('/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Middleware to get a single quotation by ID
async function getQuotation(req, res, next) {
  let quotation;
  try {
    quotation = await Quotation.findById(req.params.id);
    if (quotation == null) {
      return res.status(404).json({ message: 'Cannot find quotation' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.quotation = quotation;
  next();
}



// Duplicate a quotation
router.post('/:id/duplicate', async (req, res) => {
  const { id } = req.params;
  try {
    const quotation = await Quotation.findById(id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Create a new quotation object with the same data as the original
    const newQuotation = new Quotation({
      client: quotation.client,
      subject: quotation.subject,
      designations: quotation.designations,
      total: quotation.total
    });

    // Save the new quotation to the database
    const savedQuotation = await newQuotation.save();
    res.status(201).json(savedQuotation);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



module.exports = router;