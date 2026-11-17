
const express = require('express');
const router = express.Router();

const {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const {
    projectFieldsValidation,
    projectIdValidation
} = require('../validators/projectValidator');

// Admin and Project Manager permissions
const canManageProjects = [
    authenticateToken,
    authorizeRoles('admin', 'project_manager')
];

// Create project
router.post(
    '/',
    canManageProjects,
    projectFieldsValidation,
    createProject
);

// Get all projects
router.get('/', canManageProjects, getAllProjects);

// Get project by ID
router.get(
    '/:id',
    canManageProjects,
    projectIdValidation,
    getProjectById
);

// Update project
router.put(
    '/:id',
    canManageProjects,
    projectIdValidation,
    projectFieldsValidation,
    updateProject
);

// Delete project
router.delete(
    '/:id',
    canManageProjects,
    projectIdValidation,
    deleteProject
);

module.exports = router;
