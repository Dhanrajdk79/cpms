
const express = require('express');
const router = express.Router();

const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const {
    createTaskValidator,
    updateTaskValidator,
    taskIdValidator,
    taskQueryValidator
} = require('../validators/taskValidator');

// Create task
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin', 'project_manager'),
    createTaskValidator,
    createTask
);

// Get all tasks
router.get(
    '/',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    taskQueryValidator,
    getAllTasks
);

// Get task by ID
router.get(
    '/:id',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    taskIdValidator,
    getTaskById
);

// Update task
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin', 'project_manager', 'employee'),
    updateTaskValidator,
    updateTask
);

// Delete task
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin', 'project_manager'),
    taskIdValidator,
    deleteTask
);

module.exports = router;
