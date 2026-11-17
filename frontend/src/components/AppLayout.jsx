
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = {
    admin: [
        ['Dashboard', '/dashboard', 'D'],
        ['Clients', '/clients', 'C'],
        ['Projects', '/projects', 'P'],
        ['Tasks', '/tasks', 'T'],
        ['Notifications', '/notifications', 'N']
    ],
    project_manager: [
        ['Dashboard', '/dashboard', 'D'],
        ['Clients', '/clients', 'C'],
        ['Projects', '/projects', 'P'],
        ['Tasks', '/tasks', 'T'],
        ['Notifications', '/notifications', 'N']
    ],
    employee: [
        ['Dashboard', '/dashboard', 'D'],
        ['Tasks', '/tasks', 'T'],
        ['Notifications', '/notifications', 'N']
    ],
    client: [
        ['Dashboard', '/dashboard', 'D'],
        ['Projects', '/projects', 'P'],
        ['Tasks', '/tasks', 'T'],
        ['Notifications', '/notifications', 'N']
    ]
};

function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const role = user?.role || 'employee';
    const menu = menus[role] || menus.employee;

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-mark small">C</div>
                    <div>
                        <strong>CPMS</strong>
                        <span>Management Portal</span>
                    </div>
                </div>

                <div className="menu-label">WORKSPACE</div>

                <nav className="sidebar-nav">
                    {menu.map(([label, path, icon]) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={({ isActive }) =>
                                isActive ? 'nav-link active' : 'nav-link'
                            }
                        >
                            <span>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="user-avatar">
                        {(user?.full_name || 'U').charAt(0).toUpperCase()}
                    </div>

                    <div className="user-details">
                        <strong>{user?.full_name || 'User'}</strong>
                        <span>{role.replace('_', ' ')}</span>
                    </div>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        Exit
                    </button>
                </div>
            </aside>

            <main className="main-area">
                <header className="topbar">
                    <div>
                        <strong>Workspace</strong>
                        <span> / CPMS</span>
                    </div>

                    <div className="topbar-user">
                        {user?.email}
                    </div>
                </header>

                <section className="page-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default AppLayout;
