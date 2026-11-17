
const { pool } = require('../config/db');

const Dashboard = {
    // ADMIN DASHBOARD
    getAdminDashboard: async () => {
        const [summary] = await pool.execute(`
            SELECT
                (SELECT COUNT(*) FROM users) AS totalUsers,
                (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS activeUsers,
                (SELECT COUNT(*) FROM clients) AS totalClients,
                (SELECT COUNT(*) FROM projects) AS totalProjects,
                (SELECT COUNT(*) FROM tasks) AS totalTasks,
                (SELECT COUNT(*) FROM tasks WHERE status = 'completed') AS completedTasks,
                (SELECT COUNT(*) FROM tasks WHERE status = 'todo') AS pendingTasks,
                (SELECT COUNT(*) FROM tasks WHERE deadline < CURDATE()
                 AND status != 'completed') AS overdueTasks
        `);

        const [projectStats] = await pool.execute(`
            SELECT status, COUNT(*) AS count
            FROM projects
            GROUP BY status
        `);

        const [taskStats] = await pool.execute(`
            SELECT status, COUNT(*) AS count
            FROM tasks
            GROUP BY status
        `);

        const [recentProjects] = await pool.execute(`
            SELECT p.id, p.project_name, p.status, p.progress,
                   c.company_name
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            ORDER BY p.created_at DESC
            LIMIT 5
        `);

        return {
            summary: summary[0],
            projectStats,
            taskStats,
            recentProjects
        };
    },

    // PROJECT MANAGER DASHBOARD
    getManagerDashboard: async (userId) => {
        const [summary] = await pool.execute(`
            SELECT
                COUNT(DISTINCT p.id) AS totalProjects,
                COUNT(DISTINCT t.id) AS totalTasks,
                COUNT(DISTINCT CASE WHEN t.status = 'completed'
                    THEN t.id END) AS completedTasks,
                COUNT(DISTINCT CASE WHEN t.status = 'todo'
                    THEN t.id END) AS pendingTasks,
                COUNT(DISTINCT CASE WHEN t.status != 'completed'
                    AND t.deadline < CURDATE()
                    THEN t.id END) AS overdueTasks
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id
            WHERE p.project_manager_id = ?
        `, [userId]);

        const [projects] = await pool.execute(`
            SELECT p.id, p.project_name, p.status, p.progress,
                   p.start_date, p.deadline, c.company_name
            FROM projects p
            JOIN clients c ON p.client_id = c.id
            WHERE p.project_manager_id = ?
            ORDER BY p.created_at DESC
        `, [userId]);

        const [taskStats] = await pool.execute(`
            SELECT t.status, COUNT(*) AS count
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE p.project_manager_id = ?
            GROUP BY t.status
        `, [userId]);

        return {
            summary: summary[0],
            projects,
            taskStats
        };
    },

    // EMPLOYEE DASHBOARD
    getEmployeeDashboard: async (userId) => {
        const [summary] = await pool.execute(`
            SELECT
                COUNT(*) AS totalTasks,
                SUM(status = 'todo') AS pendingTasks,
                SUM(status = 'in_progress') AS inProgressTasks,
                SUM(status = 'review') AS reviewTasks,
                SUM(status = 'completed') AS completedTasks,
                SUM(deadline < CURDATE()
                    AND status != 'completed') AS overdueTasks
            FROM tasks
            WHERE assigned_to = ?
        `, [userId]);

        const [tasks] = await pool.execute(`
            SELECT t.id, t.title, t.priority, t.status, t.deadline,
                   p.project_name
            FROM tasks t
            JOIN projects p ON t.project_id = p.id
            WHERE t.assigned_to = ?
            ORDER BY
                CASE WHEN t.deadline IS NULL THEN 1 ELSE 0 END,
                t.deadline ASC
            LIMIT 10
        `, [userId]);

        const [projects] = await pool.execute(`
            SELECT p.id, p.project_name, p.status, p.progress,
                   p.deadline
            FROM project_members pm
            JOIN projects p ON pm.project_id = p.id
            WHERE pm.user_id = ?
            ORDER BY p.created_at DESC
        `, [userId]);

        return {
            summary: summary[0],
            tasks,
            projects
        };
    },

    // CLIENT DASHBOARD
    getClientDashboard: async (email) => {
        const [clients] = await pool.execute(
            'SELECT id, company_name FROM clients WHERE email = ?',
            [email]
        );

        if (clients.length === 0) {
            return null;
        }

        const clientId = clients[0].id;

        const [summary] = await pool.execute(`
            SELECT
                COUNT(DISTINCT p.id) AS totalProjects,
                COUNT(DISTINCT t.id) AS totalTasks,
                COUNT(DISTINCT CASE WHEN p.status = 'completed'
                    THEN p.id END) AS completedProjects,
                COUNT(DISTINCT CASE WHEN p.status = 'in_progress'
                    THEN p.id END) AS activeProjects
            FROM projects p
            LEFT JOIN tasks t ON p.id = t.project_id
            WHERE p.client_id = ?
        `, [clientId]);

        const [projects] = await pool.execute(`
            SELECT p.id, p.project_name, p.description,
                   p.status, p.progress, p.start_date, p.deadline
            FROM projects p
            WHERE p.client_id = ?
            ORDER BY p.created_at DESC
        `, [clientId]);

        return {
            client: clients[0],
            summary: summary[0],
            projects
        };
    }
};

module.exports = Dashboard;
