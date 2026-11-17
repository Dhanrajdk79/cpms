
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
    project_id: '',
    assigned_to: '',
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    deadline: ''
};

const taskStatuses = ['todo', 'in_progress', 'review', 'completed'];

function Tasks() {
    const { user } = useAuth();

    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [commentTask, setCommentTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);

    const canCreate = ['admin', 'project_manager'].includes(user?.role);

    const loadTasks = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/tasks', {
                params: { page: 1, limit: 100 }
            });

            const result = response.data.tasks ||
                response.data.data ||
                response.data;

            setTasks(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load tasks.'
            );
        } finally {
            setLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const response = await api.get('/projects');
            const result = response.data.projects ||
                response.data.data ||
                response.data;

            setProjects(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load projects.'
            );
        }
    };

    useEffect(() => {
        loadTasks();

        if (canCreate) {
            loadProjects();
        }
    }, []);

    const filteredTasks = useMemo(() => {
        const term = search.toLowerCase().trim();

        return tasks.filter((task) => {
            const matchesSearch = [
                task.title,
                task.description,
                task.project_name,
                task.assigned_employee
            ].some((value) =>
                String(value || '').toLowerCase().includes(term)
            );

            const matchesStatus =
                statusFilter === 'all' || task.status === statusFilter;

            const matchesPriority =
                priorityFilter === 'all' || task.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tasks, search, statusFilter, priorityFilter]);

    const handleFormChange = async (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
            ...(name === 'project_id' ? { assigned_to: '' } : {})
        }));

        if (name === 'project_id' && value) {
            setMembers([]);

            try {
                const response = await api.get(`/projects/${value}/members`);
                const result = response.data.members ||
                    response.data.data ||
                    response.data;

                setMembers(Array.isArray(result) ? result : []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Unable to load project members.'
                );
            }
        }
    };

    const openCreateForm = () => {
        setForm(emptyForm);
        setMembers([]);
        setError('');
        setSuccess('');
        setShowForm(true);
    };

    const closeCreateForm = () => {
        setShowForm(false);
        setForm(emptyForm);
        setMembers([]);
    };

    const handleCreateTask = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                project_id: Number(form.project_id),
                assigned_to: Number(form.assigned_to),
                title: form.title.trim(),
                description: form.description.trim(),
                priority: form.priority,
                status: form.status,
                deadline: form.deadline
            };

            await api.post('/tasks', payload);

            setSuccess('Task created and employee notified successfully.');
            closeCreateForm();
            await loadTasks();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to create task.'
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (task, nextStatus) => {
        const previousStatus = task.status;

        setTasks((previous) =>
            previous.map((item) =>
                item.id === task.id
                    ? { ...item, status: nextStatus }
                    : item
            )
        );

        setError('');
        setSuccess('');

        try {
            await api.put(`/tasks/${task.id}`, {
                status: nextStatus
            });

            setSuccess(`Task "${task.title}" updated successfully.`);
            await loadTasks();
        } catch (err) {
            setTasks((previous) =>
                previous.map((item) =>
                    item.id === task.id
                        ? { ...item, status: previousStatus }
                        : item
                )
            );

            setError(
                err.response?.data?.message ||
                'Unable to update task status.'
            );
        }
    };

    const openComments = async (task) => {
        setCommentTask(task);
        setComments([]);
        setCommentText('');
        setCommentLoading(true);
        setError('');

        try {
            const response = await api.get(`/tasks/${task.id}/comments`);
            const result = response.data.comments ||
                response.data.data ||
                response.data;

            setComments(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load comments.'
            );
        } finally {
            setCommentLoading(false);
        }
    };

    const handleAddComment = async (event) => {
        event.preventDefault();

        if (!commentText.trim() || !commentTask) return;

        setSaving(true);
        setError('');

        try {
            await api.post(`/tasks/${commentTask.id}/comments`, {
                comment: commentText.trim()
            });

            setCommentText('');

            const response = await api.get(
                `/tasks/${commentTask.id}/comments`
            );

            const result = response.data.comments ||
                response.data.data ||
                response.data;

            setComments(Array.isArray(result) ? result : []);
            setSuccess('Comment added successfully.');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to add comment.'
            );
        } finally {
            setSaving(false);
        }
    };

    const formatStatus = (status) =>
        String(status || '').replaceAll('_', ' ');

    return (
        <div className="tasks-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">WORK MANAGEMENT</p>
                    <h1>Tasks</h1>
                    <p>Track assignments, priorities and task progress.</p>
                </div>

                {canCreate && (
                    <button
                        className="primary-button"
                        onClick={openCreateForm}
                    >
                        + Create Task
                    </button>
                )}
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && canCreate && (
                <div className="client-form-card">
                    <div className="section-heading">
                        <div>
                            <h2>Create New Task</h2>
                            <p>Assign a task to a member of a project.</p>
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={closeCreateForm}
                        >
                            Close
                        </button>
                    </div>

                    <form className="client-form" onSubmit={handleCreateTask}>
                        <div className="form-field">
                            <label htmlFor="task-project">Project *</label>
                            <select
                                id="task-project"
                                name="project_id"
                                value={form.project_id}
                                onChange={handleFormChange}
                                required
                            >
                                <option value="">Select project</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.project_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="task-employee">Assign Employee *</label>
                            <select
                                id="task-employee"
                                name="assigned_to"
                                value={form.assigned_to}
                                onChange={handleFormChange}
                                required
                                disabled={!form.project_id}
                            >
                                <option value="">Select project member</option>
                                {members.map((member) => (
                                    <option
                                        key={member.user_id || member.id}
                                        value={member.user_id || member.id}
                                    >
                                        {member.full_name ||
                                            member.employee_name ||
                                            member.email ||
                                            `User ${member.user_id || member.id}`}
                                    </option>
                                ))}
                            </select>

                            {form.project_id && members.length === 0 && (
                                <small>
                                    No project members found. Assign an employee
                                    to this project first.
                                </small>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="task-title">Task Title *</label>
                            <input
                                id="task-title"
                                name="title"
                                value={form.title}
                                onChange={handleFormChange}
                                required
                                maxLength={200}
                                placeholder="Enter task title"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="task-priority">Priority *</label>
                            <select
                                id="task-priority"
                                name="priority"
                                value={form.priority}
                                onChange={handleFormChange}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="task-status">Initial Status</label>
                            <select
                                id="task-status"
                                name="status"
                                value={form.status}
                                onChange={handleFormChange}
                            >
                                {taskStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {formatStatus(status)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label htmlFor="task-deadline">Deadline *</label>
                            <input
                                id="task-deadline"
                                name="deadline"
                                type="date"
                                value={form.deadline}
                                onChange={handleFormChange}
                                required
                            />
                        </div>

                        <div className="form-field full-width">
                            <label htmlFor="task-description">Description</label>
                            <textarea
                                id="task-description"
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                rows={3}
                                placeholder="Describe the task..."
                            />
                        </div>

                        <div className="form-actions full-width">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={closeCreateForm}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving}
                            >
                                {saving ? 'Creating...' : 'Create Task'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="client-toolbar">
                <div>
                    <h2>All Tasks</h2>
                    <p>{filteredTasks.length} tasks displayed</p>
                </div>

                <div className="project-filters">
                    <input
                        className="search-input"
                        type="search"
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        {taskStatuses.map((status) => (
                            <option key={status} value={status}>
                                {formatStatus(status)}
                            </option>
                        ))}
                    </select>

                    <select
                        className="filter-select"
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                    >
                        <option value="all">All Priorities</option>
                        {['low', 'medium', 'high', 'critical'].map((priority) => (
                            <option key={priority} value={priority}>
                                {priority}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="client-table-card">
                {loading ? (
                    <div className="loading">Loading tasks...</div>
                ) : filteredTasks.length === 0 ? (
                    <div className="empty-state">No tasks found.</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="tasks-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Project</th>
                                    <th>Assigned To</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Deadline</th>
                                    <th>Comments</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredTasks.map((task) => (
                                    <tr key={task.id}>
                                        <td>
                                            <strong>{task.title}</strong>
                                            <small className="project-description">
                                                {task.description}
                                            </small>
                                        </td>

                                        <td>{task.project_name || '—'}</td>

                                        <td>{task.assigned_employee || '—'}</td>

                                        <td>
                                            <span className={`priority-badge ${task.priority}`}>
                                                {task.priority}
                                            </span>
                                        </td>

                                        <td>
                                            <select
                                                className="task-status-select"
                                                value={task.status}
                                                onChange={(event) =>
                                                    handleStatusChange(task, event.target.value)
                                                }
                                                disabled={
                                                    !['admin', 'project_manager', 'employee']
                                                        .includes(user?.role) ||
                                                    (user?.role === 'employee' &&
                                                        Number(task.assigned_to) !== Number(user.id))
                                                }
                                            >
                                                {taskStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {formatStatus(status)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>{String(task.deadline || '').slice(0, 10) || '—'}</td>

                                        <td>
                                            <button
                                                className="edit-button"
                                                onClick={() => openComments(task)}
                                            >
                                                View / Add
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {commentTask && (
                <div className="modal-backdrop">
                    <section className="comments-modal">
                        <div className="section-heading">
                            <div>
                                <h2>Task Comments</h2>
                                <p>{commentTask.title}</p>
                            </div>

                            <button
                                className="secondary-button"
                                onClick={() => setCommentTask(null)}
                            >
                                Close
                            </button>
                        </div>

                        <div className="comments-list">
                            {commentLoading ? (
                                <div className="loading">Loading comments...</div>
                            ) : comments.length === 0 ? (
                                <div className="empty-state">No comments yet.</div>
                            ) : (
                                comments.map((comment) => (
                                    <article
                                        className="comment-item"
                                        key={comment.id}
                                    >
                                        <strong>
                                            {comment.full_name ||
                                                comment.user_name ||
                                                'User'}
                                        </strong>
                                        <p>{comment.comment}</p>
                                        <small>
                                            {comment.created_at
                                                ? new Date(comment.created_at).toLocaleString()
                                                : ''}
                                        </small>
                                    </article>
                                ))
                            )}
                        </div>

                        <form
                            className="comment-form"
                            onSubmit={handleAddComment}
                        >
                            <textarea
                                rows={3}
                                value={commentText}
                                onChange={(event) => setCommentText(event.target.value)}
                                placeholder="Write a comment..."
                                required
                            />

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={saving || !commentText.trim()}
                            >
                                {saving ? 'Sending...' : 'Add Comment'}
                            </button>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}

export default Tasks;
