
const { pool } = require('../config/db');

const Client = {

    // Create client
    create: async (clientData) => {
        const {
            company_name,
            contact_person,
            email,
            phone,
            address
        } = clientData;

        const [result] = await pool.execute(
            `INSERT INTO clients
             (company_name, contact_person, email, phone, address)
             VALUES (?, ?, ?, ?, ?)`,
            [
                company_name,
                contact_person || null,
                email,
                phone || null,
                address || null
            ]
        );

        return result.insertId;
    },

    // Get all clients
    findAll: async () => {
        const [rows] = await pool.execute(
            `SELECT * FROM clients
             ORDER BY created_at DESC`
        );

        return rows;
    },
findByEmail: async (email) => {
    const [rows] = await pool.execute(
        'SELECT * FROM clients WHERE email = ?',
        [email]
    );

    return rows[0];
},
    // Get client by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM clients WHERE id = ?',
            [id]
        );

        return rows[0];
    },

    // Update client
    update: async (id, clientData) => {
        const {
            company_name,
            contact_person,
            email,
            phone,
            address
        } = clientData;

        const [result] = await pool.execute(
            `UPDATE clients
             SET company_name = ?,
                 contact_person = ?,
                 email = ?,
                 phone = ?,
                 address = ?
             WHERE id = ?`,
            [
                company_name,
                contact_person || null,
                email,
                phone || null,
                address || null,
                id
            ]
        );

        return result.affectedRows;
    },

    // Delete client
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM clients WHERE id = ?',
            [id]
        );

        return result.affectedRows;
    }

};

module.exports = Client;
