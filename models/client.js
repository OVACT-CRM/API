const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: false,
  },
  phone: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: true,
  },
  vat: {
    type: String,
    required: false,
  },
  siret: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model('Client', clientSchema);