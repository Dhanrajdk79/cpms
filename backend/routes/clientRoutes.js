
const express = require('express');
const router = express.Router();

const {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient
} = require('../controllers/clientController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const {
    createClientValidation,
    updateClientValidation,
    clientIdValidation
} = require('../validators/clientValidator');

// Admin and Project Manager permissions
const canManageClients = [
    authenticateToken,
    authorizeRoles('admin', 'project_manager')
];

// Create client
router.post(
    '/',
    canManageClients,
    createClientValidation,
    createClient
);

// Get all clients
router.get('/', canManageClients, getAllClients);

// Get client by ID
router.get(
    '/:id',
    canManageClients,
    clientIdValidation,
    getClientById
);

// Update client
router.put(
    '/:id',
    canManageClients,
    updateClientValidation,
    updateClient
);

// Delete client
router.delete(
    '/:id',
    canManageClients,
    clientIdValidation,
    deleteClient
);

module.exports = router;
