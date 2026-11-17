
const { pool } = require('../config/db');

const User = {

    // Find user using email
    findByEmail: async (email) => {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        return rows[0];
    },

    // Find user using ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT id, full_name, email, phone, role, 
                    profile_image, is_active, created_at
             FROM users
             WHERE id = ?`,
            [id]
        );

        return rows[0];
    },

    // Create new user
    create: async (userData) => {
        const {
            full_name,
            email,
            password,
            phone,
            role
        } = userData;

        const [result] = await pool.execute(
            `INSERT INTO users
             (full_name, email, password, phone, role)
             VALUES (?, ?, ?, ?, ?)`,
            [full_name, email, password, phone || null, role || 'employee']
        );

        return result.insertId;
    }

};

module.exports = User;
