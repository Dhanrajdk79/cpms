
const { pool } = require('../config/db');

const Project = {

    // Create project
    create: async (projectData) => {
        const {
            client_id,
            project_name,
            description,
            project_manager_id,
            start_date,
            deadline,
            status,
            progress
        } = projectData;

        const [result] = await pool.execute(
            `INSERT INTO projects
            (
                client_id,
                project_name,
                description,
                project_manager_id,
                start_date,
                deadline,
                status,
                progress
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                client_id,
                project_name,
                description ?? null,
                project_manager_id,
                start_date,
                deadline,
                status ?? 'planning',
                progress ?? 0
            ]
        );

        return result.insertId;
    },

    // Get all projects
    findAll: async () => {
        const [rows] = await pool.execute(
            `SELECT
                p.*,
                c.company_name,
                u.full_name AS project_manager_name
             FROM projects p
             JOIN clients c ON p.client_id = c.id
             JOIN users u ON p.project_manager_id = u.id
             ORDER BY p.created_at DESC`
        );

        return rows;
    },

    // Get project by ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT
                p.*,
                c.company_name,
                u.full_name AS project_manager_name
             FROM projects p
             JOIN clients c ON p.client_id = c.id
             JOIN users u ON p.project_manager_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        return rows[0];
    },

    // Update project
    update: async (id, projectData) => {
        const {
            client_id,
            project_name,
            description,
            project_manager_id,
            start_date,
            deadline,
            status,
            progress
        } = projectData;

        const parameters = [
            client_id,
            project_name,
            description ?? null,
            project_manager_id,
            start_date,
            deadline,
            status ?? 'planning',
            progress ?? 0,
            id
        ];

        if (parameters.some((value) => value === undefined)) {
            throw new Error('Project update contains undefined SQL parameters');
        }

        const [result] = await pool.execute(
            `UPDATE projects
             SET client_id = ?,
                 project_name = ?,
                 description = ?,
                 project_manager_id = ?,
                 start_date = ?,
                 deadline = ?,
                 status = ?,
                 progress = ?
             WHERE id = ?`,
            parameters
        );

        return result.affectedRows;
    },

    // Delete project
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM projects WHERE id = ?',
            [id]
        );

        return result.affectedRows;
    }

};

module.exports = Project;
