
const {
    body,
    param,
    query,
    validationResult
} = require('express-validator');

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

const createNotificationValidator = [
    body('user_id').isInt({ min: 1 }),
    body('title')
        .trim()
        .notEmpty()
        .isLength({ max: 150 }),
    body('message')
        .trim()
        .notEmpty(),
    body('type')
        .optional()
        .isIn([
            'task_assigned',
            'task_updated',
            'task_overdue',
            'project_updated',
            'general'
        ]),
    body('related_task_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }),
    body('related_project_id')
        .optional({ nullable: true })
        .isInt({ min: 1 }),
    validateRequest
];

const notificationIdValidator = [
    param('id').isInt({ min: 1 }),
    validateRequest
];

const notificationQueryValidator = [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('is_read').optional().isIn(['true', 'false']),
    validateRequest
];

module.exports = {
    createNotificationValidator,
    notificationIdValidator,
    notificationQueryValidator
};
