
const {
    body,
    param,
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

const createCommentValidator = [
    param('taskId').isInt({ min: 1 }),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Comment is required'),
    validateRequest
];

const updateCommentValidator = [
    param('id').isInt({ min: 1 }),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('Comment is required'),
    validateRequest
];

const commentIdValidator = [
    param('id').isInt({ min: 1 }),
    validateRequest
];

const taskIdValidator = [
    param('taskId').isInt({ min: 1 }),
    validateRequest
];

module.exports = {
    createCommentValidator,
    updateCommentValidator,
    commentIdValidator,
    taskIdValidator
};
