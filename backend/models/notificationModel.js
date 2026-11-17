
const { pool } = require('../config/db');

const Notification = {
    create: async (data) => {
        const [result] = await pool.execute(
            `INSERT INTO notifications
             (user_id, title, message, type, related_task_id, related_project_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.user_id,
                data.title,
                data.message,
                data.type || 'general',
                data.related_task_id || null,
                data.related_project_id || null
            ]
        );

        return result.insertId;
    },

    findByUserId: async (userId, filters) => {
        const [rows] = await pool.execute(
            `SELECT * FROM notifications
             WHERE user_id = ?
             ${filters.readCondition}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, filters.limit, filters.offset]
        );

        return rows;
    },

    countByUserId: async (userId, readCondition) => {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS total
             FROM notifications
             WHERE user_id = ? ${readCondition}`,
            [userId]
        );

        return rows[0].total;
    },

    markAsRead: async (id, userId) => {
        const [result] = await pool.execute(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        return result.affectedRows;
    },

    markAllAsRead: async (userId) => {
        const [result] = await pool.execute(
            `UPDATE notifications
             SET is_read = TRUE
             WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );

        return result.affectedRows;
    },

    delete: async (id, userId) => {
        const [result] = await pool.execute(
            `DELETE FROM notifications
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        return result.affectedRows;
    }
};

module.exports = Notification;
