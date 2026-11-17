
const { body, validationResult } = require('express-validator');

// Handle validation errors
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
};

// Registration validation
const registerValidation = [
    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ max: 100 })
        .withMessage('Full name cannot exceed 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail(),

    body('password')
        .isString()
        .isLength({ min: 8 })
        .withMessage('Password must contain at least 8 characters'),

    body('phone')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters'),

    body('role')
        .optional()
        .isIn(['employee', 'client'])
        .withMessage('Invalid registration role'),

    validateRequest
];

// Login validation
const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    validateRequest
];

module.exports = {
    registerValidation,
    loginValidation
};
