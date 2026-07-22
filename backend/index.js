const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json()); // Parsing application/json

// Routes
const salesRoutes = require('./routes/salesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const cashbookRoutes = require('./routes/cashbookRoutes');
const reportRoutes = require('./routes/reportRoutes');
const productRoutes = require('./routes/productRoutes');
const channelRoutes = require('./routes/channelRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const coaRoutes = require('./routes/coaRoutes');

// API Endpoints
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cashbook', cashbookRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/products', productRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/coa', coaRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Ngap Finance API' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
