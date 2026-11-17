
const express = require('express');
const router = express.Router();

const {
    register,
    login
} = require('../controllers/authController');

const {
    registerValidation,
    loginValidation
} = require('../validators/authValidator');

// Registration API
router.post('/register', registerValidation, register);

// Login API
router.post('/login', loginValidation, login);

module.exports = router;
