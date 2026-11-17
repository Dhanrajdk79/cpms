
const express = require('express');
const router = express.Router();

const {
    assignMember,
    getProjectMembers,
    removeMember
} = require('../controllers/projectMemberController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const { body, param, validationResult } = require('express-validator');

// Validation middleware
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

// Assign employee to project
router.post(
    '/:projectId/members',
    authenticateToken,
    authorizeRoles('admin', 'project_manager'),
    param('projectId').isInt({ min: 1 }),
    body('user_id').isInt({ min: 1 }),
    validateRequest,
    assignMember
);

// Get project members
router.get(
    '/:projectId/members',
    authenticateToken,
    authorizeRoles('admin', 'project_manager'),
    param('projectId').isInt({ min: 1 }),
    validateRequest,
    getProjectMembers
);

// Remove employee from project
router.delete(
    '/:projectId/members/:userId',
    authenticateToken,
    authorizeRoles('admin', 'project_manager'),
    param('projectId').isInt({ min: 1 }),
    param('userId').isInt({ min: 1 }),
    validateRequest,
    removeMember
);

module.exports = router;
