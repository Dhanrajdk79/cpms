
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

// Validate project fields
const projectFieldsValidation = [
    body('client_id')
        .isInt({ min: 1 })
        .withMessage('Valid client ID is required'),

    body('project_name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required')
        .isLength({ max: 150 })
        .withMessage('Project name cannot exceed 150 characters'),

    body('description')
        .optional({ values: 'falsy' })
        .trim(),

    body('project_manager_id')
        .isInt({ min: 1 })
        .withMessage('Valid project manager ID is required'),

    body('start_date')
        .isISO8601({ strict: true })
        .withMessage('Enter a valid start date (YYYY-MM-DD)')
        .toDate(),

    body('deadline')
        .isISO8601({ strict: true })
        .withMessage('Enter a valid deadline (YYYY-MM-DD)')
        .toDate()
        .custom((deadline, { req }) => {
            const startDate = new Date(req.body.start_date);

            if (deadline < startDate) {
                throw new Error('Deadline cannot be before start date');
            }

            return true;
        }),

    body('status')
        .optional()
        .isIn(['planning', 'in_progress', 'on_hold', 'completed'])
        .withMessage('Invalid project status'),

    body('progress')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Progress must be between 0 and 100'),

    validateRequest
];

// Validate project ID
const projectIdValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Project ID must be a positive integer'),

    validateRequest
];

module.exports = {
    projectFieldsValidation,
    projectIdValidation
};
