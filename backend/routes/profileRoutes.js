
const express = require('express');
const router = express.Router();

const { getProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protected profile endpoint
router.get('/', authenticateToken, getProfile);

module.exports = router;
