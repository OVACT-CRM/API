const mongoose = require('mongoose');

const url = 'mongodb+srv://agencezogma:EKCqSU3VQvMYMJBM@zogcrm.ngyj4q6.mongodb.net/test';

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', () => {
  console.log('MongoDB connected successfully');
});

// agencezogma
// EKCqSU3VQvMYMJBM