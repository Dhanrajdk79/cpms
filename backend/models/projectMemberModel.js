
const { pool } = require('../config/db');

const ProjectMember = {

    // Assign employee to project
    assign: async (projectId, userId) => {
        const [result] = await pool.execute(
            `INSERT INTO project_members
             (project_id, user_id)
             VALUES (?, ?)`,
            [projectId, userId]
        );

        return result.insertId;
    },

    // Get all members of a project
    findByProjectId: async (projectId) => {
        const [rows] = await pool.execute(
            `SELECT
                pm.id,
                pm.project_id,
                pm.user_id,
                u.full_name,
                u.email,
                pm.assigned_at
             FROM project_members pm
             JOIN users u ON pm.user_id = u.id
             WHERE pm.project_id = ?
             ORDER BY pm.assigned_at DESC`,
            [projectId]
        );

        return rows;
    },

    // Remove employee from project
    remove: async (projectId, userId) => {
        const [result] = await pool.execute(
            `DELETE FROM project_members
             WHERE project_id = ? AND user_id = ?`,
            [projectId, userId]
        );

        return result.affectedRows;
    }

};

module.exports = ProjectMember;
