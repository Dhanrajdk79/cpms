
const Dashboard = require('../models/dashboardModel');

const getDashboard = async (req, res) => {
    try {
        let dashboard;

        switch (req.user.role) {
            case 'admin':
                dashboard = await Dashboard.getAdminDashboard();
                break;

            case 'project_manager':
                dashboard = await Dashboard.getManagerDashboard(req.user.id);
                break;

            case 'employee':
                dashboard = await Dashboard.getEmployeeDashboard(req.user.id);
                break;

            case 'client':
                dashboard = await Dashboard.getClientDashboard(req.user.email);

                if (!dashboard) {
                    return res.status(404).json({
                        success: false,
                        message: 'No client account is linked to this email'
                    });
                }
                break;

            default:
                return res.status(403).json({
                    success: false,
                    message: 'Dashboard access denied'
                });
        }

        res.status(200).json({
            success: true,
            role: req.user.role,
            dashboard
        });

    } catch (error) {
        console.error('Dashboard error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard'
        });
    }
};

module.exports = { getDashboard };
