const express = require('express');
const router = express.Router();

// Import client model
const Client = require('../models/client');

// GET all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one client
router.get('/:id', getClient, (req, res) => {
  res.json(res.client);
});

// CREATE client
router.post('/', async (req, res) => {
  console.log(req.body);
  const client = new Client({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    vat: req.body.vat,
    siret: req.body.siret,
  });
  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE client
router.patch('/:id', getClient, async (req, res) => {
  if (req.body.name != null) {
    res.client.name = req.body.name;
  }
  if (req.body.email != null) {
    res.client.email = req.body.email;
  }
  if (req.body.phone != null) {
    res.client.phone = req.body.phone;
  }
  if (req.body.address != null) {
    res.client.address = req.body.address;
  }
  if (req.body.vat != null) {
    res.client.vat = req.body.vat;
  }
  if (req.body.siret != null) {
    res.client.siret = req.body.siret;
  }
  try {
    const updatedClient = await res.client.save();
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE client
router.delete('/:id', getClient, async (req, res) => {
  try {
    await res.client.remove();
    res.json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Middleware function to get client by ID
async function getClient(req, res, next) {
  try {
    const client = await Client.findById(req.params.id);
    if (client == null) {
      return res.status(404).json({ message: 'Cannot find client' });
    }
    res.client = client;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = router;