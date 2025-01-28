const express = require('express');
const router = express.Router();
const { checkEssay, checkOpenAIConnection } = require('../controllers/essayController');

router.get('/health', checkOpenAIConnection);
router.post('/check', checkEssay);

module.exports = router;