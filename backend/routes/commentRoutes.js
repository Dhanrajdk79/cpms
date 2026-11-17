
const express = require('express');
const router = express.Router();

const {
    addComment,
    getComments,
    updateComment,
    deleteComment
} = require('../controllers/commentController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const {
    createCommentValidator,
    updateCommentValidator,
    commentIdValidator,
    taskIdValidator
} = require('../validators/commentValidator');

router.post(
    '/tasks/:taskId/comments',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    createCommentValidator,
    addComment
);

router.get(
    '/tasks/:taskId/comments',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    taskIdValidator,
    getComments
);

router.put(
    '/comments/:id',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    updateCommentValidator,
    updateComment
);

router.delete(
    '/comments/:id',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    commentIdValidator,
    deleteComment
);

module.exports = router;
