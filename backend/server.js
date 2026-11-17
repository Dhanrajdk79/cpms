
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { testConnection, pool } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const clientRoutes = require('./routes/clientRoutes');
const projectRoutes = require('./routes/projectRoutes');
const projectMemberRoutes = require('./routes/projectMemberRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/profile', profileRoutes);

app.use('/api/clients', clientRoutes);

app.use('/api/projects', projectRoutes);
app.use('/api/projects', projectMemberRoutes);

app.use('/api/tasks', taskRoutes);

app.use('/api', commentRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/api/dashboard', dashboardRoutes);

// Welcome API
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to CPMS API'
    });
});

// Database health-check API
app.get('/api/health', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT DATABASE() AS database_name, NOW() AS server_time'
        );

        res.status(200).json({
            success: true,
            message: 'Backend and MySQL are connected',
            database: rows[0].database_name,
            serverTime: rows[0].server_time
        });

    } catch (error) {
        console.error('Health check failed:', error.message);

        res.status(500).json({
            success: false,
            message: 'Database connection failed'
        });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start Server
const startServer = async () => {
    try {
        await testConnection();

        const PORT = process.env.PORT || 5000;

        app.listen(PORT, () => {
            console.log('----------------------------------');
            console.log('MySQL Database Connected Successfully!');
            console.log(`CPMS Server running on port ${PORT}`);
            console.log('Dashboard API: /api/dashboard');
            console.log('----------------------------------');
        });

    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
};

startServer();
