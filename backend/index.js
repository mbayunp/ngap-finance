const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parsing application/json

// Routes
const salesRoutes = require('./routes/salesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cashbookRoutes = require('./routes/cashbookRoutes');
const reportRoutes = require('./routes/reportRoutes');

// API Endpoints
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cashbook', cashbookRoutes);
app.use('/api/reports', reportRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Ngap Finance API' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
