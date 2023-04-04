// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // import the cors package

// Set up Express server
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// Connect to MongoDB database using db.js
require('./db');


// Define routes for clients, quotations, and invoices
app.use('/clients', require('./routes/clients'));
app.use('/quotations', require('./routes/quotations'));
app.use('/invoices', require('./routes/invoices'));


// Start server
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log('Server started on port '+port);
});


