
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
    client_id: '',
    project_name: '',
    description: '',
    project_manager_id: '',
    start_date: '',
    deadline: '',
    status: 'planning'
};

function Projects() {
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isAdmin = user?.role === 'admin';

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const [projectResponse, clientResponse] = await Promise.all([
                api.get('/projects'),
                api.get('/clients')
            ]);

            const projectData =
                projectResponse.data.projects ||
                projectResponse.data.data ||
                projectResponse.data;

            const clientData =
                clientResponse.data.clients ||
                clientResponse.data.data ||
                clientResponse.data;

            setProjects(Array.isArray(projectData) ? projectData : []);
            setClients(Array.isArray(clientData) ? clientData : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load projects.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredProjects = useMemo(() => {
        const term = search.toLowerCase().trim();

        return projects.filter((project) => {
            const matchesSearch = [
                project.project_name,
                project.company_name,
                project.description
            ].some((value) =>
                String(value || '').toLowerCase().includes(term)
            );

            const matchesStatus =
                statusFilter === 'all' ||
                project.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [projects, search, statusFilter]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openAddForm = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const openEditForm = (project) => {
        setEditingId(project.id);

        setForm({
            client_id: String(project.client_id || ''),
            project_name: project.project_name || '',
            description: project.description || '',
            project_manager_id: String(project.project_manager_id || ''),
            start_date: String(project.start_date || '').slice(0, 10),
            deadline: String(project.deadline || '').slice(0, 10),
            status: project.status || 'planning'
        });

        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                client_id: Number(form.client_id),
                project_name: form.project_name.trim(),
                description: form.description.trim(),
                start_date: form.start_date,
                deadline: form.deadline,
                status: form.status
            };

            // Only Admin can choose the project manager.
            if (isAdmin) {
                payload.project_manager_id = Number(form.project_manager_id);
            }

            if (editingId) {
                await api.put(`/projects/${editingId}`, payload);
                setSuccess('Project updated successfully.');
            } else {
                await api.post('/projects', payload);
                setSuccess('Project created successfully.');
            }

            closeForm();
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to save project. Check the form details.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (project) => {
        const confirmed = window.confirm(
            `Delete project "${project.project_name}"? Its related tasks and project members may also be deleted.`
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            await api.delete(`/projects/${project.id}`);
            setSuccess('Project deleted successfully.');
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete project.'
            );
        }
    };

    const formatStatus = (status) =>
        String(status || '').replaceAll('_', ' ');

    return (
        <div className="projects-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">MANAGEMENT</p>
                    <h1>Projects</h1>
                    <p>Manage projects, deadlines and progress.</p>
                </div>

                <button className="primary-button" onClick={openAddForm}>
                    + Add Project
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <div className="client-form-card">
                    <div className="section-heading">
                        <div>
                            <h2>{editingId ? 'Edit Project' : 'Create Project'}</h2>
                            <p>Enter project information and schedule.</p>
                        </div>

                        <button
                            className="secondary-button"
                            type="button"
                            onClick={closeForm}
                        >
                            Close
                        </button>
                    </div>

                    <form className="client-form" onSubmit={handleSubmit}>
                        <div className="form-field">
                            <label htmlFor="project_name">Project Name *</label>
                            <input
                                id="project_name"
                                name="project_name"
                                value={form.project_name}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                placeholder="Enter project name"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="client_id">Client *</label>
                            <select
                                id="client_id"
                                name="client_id"
                                value={form.client_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select client</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.company_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isAdmin && (
                            <div className="form-field">
                                <label htmlFor="project_manager_id">
                                    Project Manager User ID *
                                </label>
                                <input
                                    id="project_manager_id"
                                    name="project_manager_id"
                                    type="number"
                                    min="1"
                                    value={form.project_manager_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter an existing manager user ID"
                                />
                                <small>
                                    Enter the ID of an active project manager.
                                </small>
                            </div>
                        )}

                        <div className="form-field">
                            <label htmlFor="status">Project Status</label>
                            <select
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="planning">Planning</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="start_date">Start Date *</label>
                            <input
                                id="start_date"
                                name="start_date"
                                type="date"
                                value={form.start_date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="deadline">Deadline *</label>
                            <input
                                id="deadline"
                                name="deadline"
                                type="date"
                                value={form.deadline}
                                onChange={handleChange}
                                min={form.start_date || undefined}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Describe the project..."
                            />
                        </div>

                        <div className="form-actions full-width">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={closeForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingId
                                        ? 'Update Project'
                                        : 'Create Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="client-toolbar">
                <div>
                    <h2>All Projects</h2>
                    <p>{projects.length} project records</p>
                </div>

                <div className="project-filters">
                    <input
                        className="search-input"
                        type="search"
                        placeholder="Search projects..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="planning">Planning</option>
                        <option value="in_progress">In Progress</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            <div className="client-table-card">
                {loading ? (
                    <div className="loading">Loading projects...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="empty-state">
                        No projects found.
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Project</th>
                                    <th>Client</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Start Date</th>
                                    <th>Deadline</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredProjects.map((project) => {
                                    const progress = Math.min(
                                        100,
                                        Math.max(0, Number(project.progress || 0))
                                    );

                                    return (
                                        <tr key={project.id}>
                                            <td>
                                                <strong>{project.project_name}</strong>
                                                <small className="project-description">
                                                    {project.description}
                                                </small>
                                            </td>

                                            <td>{project.company_name || '—'}</td>

                                            <td>
                                                <span className={`project-status ${project.status}`}>
                                                    {formatStatus(project.status)}
                                                </span>
                                            </td>

                                            <td>
                                                <div className="progress-cell">
                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span>{progress}%</span>
                                                </div>
                                            </td>

                                            <td>{String(project.start_date || '').slice(0, 10) || '—'}</td>
                                            <td>{String(project.deadline || '').slice(0, 10) || '—'}</td>

                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="edit-button"
                                                        onClick={() => openEditForm(project)}
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDelete(project)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Projects;
