const express = require('express');
const path = require('path');
const connectDB = require('./config/dbConns');
const Payment = require('./models/formSchema');
const cors = require('cors');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const allowedOrigin = 'https://transfermoney.onrender.com'; // Replace with your allowed origin
app.use(cors());

// Connect to MongoDB
connectDB();


// Define the directory for serving static files
const publicDir = path.join(__dirname, 'public');
console.log('Public directory:', publicDir);

// Serve static files from the public directory
app.use(express.static(publicDir));

// Define a POST endpoint to create a new payment
app.post('/api/payments', async (req, res) => {
  try {
    // Log the URL parameters
    console.log(req.body);

    // Convert string value "on" to boolean true
    const privacy = req.body.privacy === 'on';

    // Create a new payment instance using request body
    const payment = new Payment({ ...req.body, privacy });

    // Save the payment to the database
    await payment.save();

    res.status(201).send('Payment detail successfully added to database');
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a GET endpoint to retrieve all payments
app.get('/api/payments', async (req, res) => {
  try {
    // Fetch all payments from the database
    const payments = await Payment.find();

    // Send the payments as response
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve form1.html for the root and all other routes
app.get('*', (req, res) => {
  const filePath = path.join(publicDir, 'form1.html');
  console.log('Serving file:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error serving form1.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Define the port number
const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
