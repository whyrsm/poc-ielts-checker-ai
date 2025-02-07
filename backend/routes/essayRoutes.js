const express = require('express');
const router = express.Router();
const { checkEssay, checkOpenAIConnection } = require('../controllers/essayController');

// Basic API health check
router.get('/ping', (req, res) => {
    res.json({ 
        status: 'success',
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

router.get('/health', checkOpenAIConnection);
router.post('/check', checkEssay);

module.exports = router;