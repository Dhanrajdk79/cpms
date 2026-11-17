
const { body, param, validationResult } = require('express-validator');

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

// Validate client creation
const createClientValidation = [
    body('company_name')
        .trim()
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 150 })
        .withMessage('Company name cannot exceed 150 characters'),

    body('contact_person')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Contact person cannot exceed 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail(),

    body('phone')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone cannot exceed 20 characters'),

    body('address')
        .optional({ values: 'falsy' })
        .trim(),

    validateRequest
];

// Validate client update
const updateClientValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid client ID'),

    body('company_name')
        .trim()
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 150 })
        .withMessage('Company name cannot exceed 150 characters'),

    body('contact_person')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Contact person cannot exceed 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Enter a valid email')
        .normalizeEmail(),

    body('phone')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone cannot exceed 20 characters'),

    body('address')
        .optional({ values: 'falsy' })
        .trim(),

    validateRequest
];

// Validate client ID
const clientIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Client ID must be a positive integer'),

    validateRequest
];

module.exports = {
    createClientValidation,
    updateClientValidation,
    clientIdValidation
};
