
const { pool } = require('../config/db');

const Task = {
    create: async (data) => {
        const [result] = await pool.execute(
            `INSERT INTO tasks
             (project_id, assigned_to, created_by, title, description, priority, status, deadline)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.project_id,
                data.assigned_to,
                data.created_by,
                data.title,
                data.description || null,
                data.priority || 'medium',
                data.status || 'todo',
                data.deadline || null
            ]
        );

        return result.insertId;
    },

    findAll: async (filters) => {
        const {
            where,
            params,
            limit,
            offset,
            sortBy,
            order
        } = filters;

        const [rows] = await pool.execute(
            `SELECT t.*,
                    u.full_name AS assigned_employee,
                    creator.full_name AS created_by_name,
                    p.project_name
             FROM tasks t
             JOIN users u ON t.assigned_to = u.id
             JOIN users creator ON t.created_by = creator.id
             JOIN projects p ON t.project_id = p.id
             ${where}
             ORDER BY t.${sortBy} ${order}
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return rows;
    },

    count: async (where, params) => {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS total FROM tasks t ${where}`,
            params
        );

        return rows[0].total;
    },

    findById: async (id) => {
        const [rows] = await pool.execute(
            `SELECT t.*,
                    u.full_name AS assigned_employee,
                    creator.full_name AS created_by_name,
                    p.project_name
             FROM tasks t
             JOIN users u ON t.assigned_to = u.id
             JOIN users creator ON t.created_by = creator.id
             JOIN projects p ON t.project_id = p.id
             WHERE t.id = ?`,
            [id]
        );

        return rows[0] || null;
    },

    update: async (id, data) => {
        const allowedFields = [
            'title',
            'description',
            'priority',
            'status',
            'deadline',
            'assigned_to'
        ];

        const fields = Object.keys(data).filter(
            field => allowedFields.includes(field)
        );

        if (fields.length === 0) return 0;

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = fields.map(field => data[field]);

        const [result] = await pool.execute(
            `UPDATE tasks SET ${setClause} WHERE id = ?`,
            [...values, id]
        );

        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM tasks WHERE id = ?',
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = Task;
