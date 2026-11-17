
const Client = require('../models/clientModel');

// Create client
const createClient = async (req, res) => {
    try {
        const {
            company_name,
            contact_person,
            email,
            phone,
            address
        } = req.body;

        // Check duplicate email
        const existingClient = await Client.findByEmail(email);

        if (existingClient) {
            return res.status(409).json({
                success: false,
                message: 'Client email already exists'
            });
        }

        const clientId = await Client.create({
            company_name,
            contact_person,
            email,
            phone,
            address
        });

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            clientId
        });

    } catch (error) {
        console.error('Create client error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to create client'
        });
    }
};

// Get all clients
const getAllClients = async (req, res) => {
    try {
        const clients = await Client.findAll();

        res.status(200).json({
            success: true,
            count: clients.length,
            clients
        });

    } catch (error) {
        console.error('Get clients error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve clients'
        });
    }
};

// Get client by ID
const getClientById = async (req, res) => {
    try {
        const clientId = Number(req.params.id);

        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            client
        });

    } catch (error) {
        console.error('Get client error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve client'
        });
    }
};

// Update client
const updateClient = async (req, res) => {
    try {
        const clientId = Number(req.params.id);

        const existingClient = await Client.findById(clientId);

        if (!existingClient) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const emailOwner = await Client.findByEmail(req.body.email);

        if (emailOwner && emailOwner.id !== clientId) {
            return res.status(409).json({
                success: false,
                message: 'Email already belongs to another client'
            });
        }

        await Client.update(clientId, req.body);

        res.status(200).json({
            success: true,
            message: 'Client updated successfully'
        });

    } catch (error) {
        console.error('Update client error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to update client'
        });
    }
};

// Delete client
const deleteClient = async (req, res) => {
    try {
        const clientId = Number(req.params.id);

        const existingClient = await Client.findById(clientId);

        if (!existingClient) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        await Client.delete(clientId);

        res.status(200).json({
            success: true,
            message: 'Client deleted successfully'
        });

    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                success: false,
                message: 'Cannot delete client because projects are linked to it'
            });
        }

        console.error('Delete client error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to delete client'
        });
    }
};

module.exports = {
    createClient,
    getAllClients,
    getClientById,
    updateClient,
    deleteClient
};
