
const { body, param, query, validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    next();
};

const createTaskValidator = [
    body('project_id')
        .isInt({ min: 1 })
        .withMessage('Valid project ID is required'),

    body('assigned_to')
        .isInt({ min: 1 })
        .withMessage('Valid employee ID is required'),

    body('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),

    body('description')
        .optional({ nullable: true })
        .isString(),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority'),

    body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'review', 'completed'])
        .withMessage('Invalid task status'),

    body('deadline')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601()
        .withMessage('Deadline must be a valid date'),

    validateRequest
];

const updateTaskValidator = [
    param('id').isInt({ min: 1 }),

    body('title')
        .optional()
        .trim()
        .notEmpty()
        .isLength({ max: 200 }),

    body('description')
        .optional({ nullable: true })
        .isString(),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical']),

    body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'review', 'completed']),

    body('deadline')
        .optional({ nullable: true, checkFalsy: true })
        .isISO8601(),

    body('assigned_to')
        .optional()
        .isInt({ min: 1 }),

    body().custom(value => {
        if (!value || Object.keys(value).length === 0) {
            throw new Error('At least one field is required for update');
        }
        return true;
    }),

    validateRequest
];

const taskIdValidator = [
    param('id').isInt({ min: 1 }),
    validateRequest
];

const taskQueryValidator = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status')
        .optional()
        .isIn(['todo', 'in_progress', 'review', 'completed']),
    query('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical']),
    query('project_id').optional().isInt({ min: 1 }),
    query('assigned_to').optional().isInt({ min: 1 }),
    query('sortBy')
        .optional()
        .isIn(['created_at', 'deadline', 'priority', 'status', 'title']),
    query('order').optional().isIn(['ASC', 'DESC']),
    validateRequest
];

module.exports = {
    createTaskValidator,
    updateTaskValidator,
    taskIdValidator,
    taskQueryValidator
};
