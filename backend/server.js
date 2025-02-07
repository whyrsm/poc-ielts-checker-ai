const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use('/api/essay', require('./routes/essayRoutes'));
app.use('/api/speaking', require('./routes/speakingRoutes'));

// Basic API health check
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'success',
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});