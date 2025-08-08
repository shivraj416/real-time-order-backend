const express = require('express');
const cors = require('cors');
require('dotenv').config();

const ordersRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

// Root route for Render health check or basic info
app.get('/', (req, res) => {
  res.json({
    status: '✅ Real-Time Order Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/orders', ordersRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
