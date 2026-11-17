
const { pool } = require('../config/db');

const Comment = {
    create: async (taskId, userId, comment) => {
        const [result] = await pool.execute(
            `INSERT INTO task_comments (task_id, user_id, comment)
             VALUES (?, ?, ?)`,
            [taskId, userId, comment]
        );

        return result.insertId;
    },

    findByTaskId: async (taskId) => {
        const [rows] = await pool.execute(
            `SELECT c.id, c.task_id, c.user_id, c.comment,
                    c.created_at, c.updated_at, u.full_name
             FROM task_comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.task_id = ?
             ORDER BY c.created_at ASC`,
            [taskId]
        );

        return rows;
    },

    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM task_comments WHERE id = ?',
            [id]
        );

        return rows[0] || null;
    },

    update: async (id, comment) => {
        const [result] = await pool.execute(
            'UPDATE task_comments SET comment = ? WHERE id = ?',
            [comment, id]
        );

        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM task_comments WHERE id = ?',
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = Comment;
