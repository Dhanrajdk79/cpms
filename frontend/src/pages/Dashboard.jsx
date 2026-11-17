
import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const response = await api.get('/dashboard');
                setData(response.data.dashboard);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Could not load dashboard data.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!data) {
        return <div className="empty-state">No dashboard data available.</div>;
    }

    const summary = data.summary || {};
    const projectStats = data.projectStats || [];
    const taskStats = data.taskStats || [];
    const recentProjects = data.recentProjects || [];

    const role = user?.role || 'employee';

    const getProjectCount = (status) =>
        Number(projectStats.find((item) => item.status === status)?.count || 0);

    const getTaskCount = (status) =>
        Number(taskStats.find((item) => item.status === status)?.count || 0);

    const stats = [
        ['Total Projects', summary.totalProjects ?? 0, '▤'],
        ['Total Tasks', summary.totalTasks ?? 0, '✓'],
        ['Completed Tasks', summary.completedTasks ?? 0, '✔'],
        ['Pending Tasks', summary.pendingTasks ?? 0, '◷']
    ];

    if (role === 'admin') {
        stats.unshift(
            ['Total Users', summary.totalUsers ?? 0, '♙'],
            ['Total Clients', summary.totalClients ?? 0, '♧']
        );
    }

    return (
        <div className="dashboard">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">OVERVIEW</p>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.full_name || 'User'}!</p>
                </div>

                <span className="role-badge">
                    {role.replace('_', ' ')}
                </span>
            </div>

            <div className="stats-grid">
                {stats.map(([label, value, icon]) => (
                    <article className="stat-card" key={label}>
                        <div className="stat-top">
                            <span>{label}</span>
                            <span className="stat-icon">{icon}</span>
                        </div>

                        <strong>{value}</strong>
                    </article>
                ))}
            </div>

            <div className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h2>Project Overview</h2>
                        <p>Your current workspace summary</p>
                    </div>
                </div>

                <div className="overview-card">
                    <div>
                        <span>Projects in Planning</span>
                        <strong>{getProjectCount('planning')}</strong>
                    </div>

                    <div>
                        <span>Projects In Progress</span>
                        <strong>{getProjectCount('in_progress')}</strong>
                    </div>

                    <div>
                        <span>Completed Projects</span>
                        <strong>{getProjectCount('completed')}</strong>
                    </div>

                    <div>
                        <span>Overdue Tasks</span>
                        <strong>{summary.overdueTasks ?? 0}</strong>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h2>Task Overview</h2>
                        <p>Task status distribution</p>
                    </div>
                </div>

                <div className="overview-card">
                    {['todo', 'in_progress', 'review', 'completed'].map((status) => (
                        <div key={status}>
                            <span>{status.replace('_', ' ')}</span>
                            <strong>{getTaskCount(status)}</strong>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-heading">
                    <div>
                        <h2>Recent Projects</h2>
                        <p>Latest projects in your workspace</p>
                    </div>
                </div>

                {recentProjects.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentProjects.map((project) => (
                                    <tr key={project.id}>
                                        <td>{project.project_name}</td>
                                        <td>{project.company_name || '—'}</td>
                                        <td>
                                            <span className="status-badge">
                                                {project.status}
                                            </span>
                                        </td>
                                        <td>{Number(project.progress || 0)}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        No recent projects available.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
