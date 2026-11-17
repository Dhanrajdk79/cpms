
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Notifications from './pages/Notifications';
import Tasks from './pages/Tasks';
import './App.css';

function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <div className="loading">Checking session...</div>;

    return user ? <AppLayout /> : <Navigate to="/login" replace />;
}

function Placeholder({ title }) {
    return (
        <div className="page-heading">
            <div>
                <p className="eyebrow">CPMS WORKSPACE</p>
                <h1>{title}</h1>
                <p>This module will be connected to the backend next.</p>
            </div>
        </div>
    );
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/notifications" element={<Notifications />} />           </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
