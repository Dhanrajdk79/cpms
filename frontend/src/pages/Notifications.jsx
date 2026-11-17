
import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadNotifications = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/notifications', {
                params: { page: 1, limit: 100 }
            });

            const result = response.data.notifications ||
                response.data.data ||
                response.data;

            setNotifications(Array.isArray(result) ? result : []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to load notifications.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const unreadCount = notifications.filter(
        (item) => !Boolean(item.is_read)
    ).length;

    const filteredNotifications = useMemo(() => {
        if (filter === 'unread') {
            return notifications.filter((item) => !Boolean(item.is_read));
        }

        if (filter === 'read') {
            return notifications.filter((item) => Boolean(item.is_read));
        }

        return notifications;
    }, [notifications, filter]);

    const markAsRead = async (id) => {
        setError('');
        setSuccess('');

        try {
            await api.patch(`/notifications/${id}/read`);

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === id ? { ...item, is_read: 1 } : item
                )
            );

            setSuccess('Notification marked as read.');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to mark notification as read.'
            );
        }
    };

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;

        setError('');
        setSuccess('');

        try {
            await api.patch('/notifications/read-all');

            setNotifications((previous) =>
                previous.map((item) => ({ ...item, is_read: 1 }))
            );

            setSuccess('All notifications marked as read.');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to mark all notifications as read.'
            );
        }
    };

    const deleteNotification = async (id) => {
        const confirmed = window.confirm(
            'Are you sure you want to delete this notification?'
        );

        if (!confirmed) return;

        setError('');
        setSuccess('');

        try {
            await api.delete(`/notifications/${id}`);

            setNotifications((previous) =>
                previous.filter((item) => item.id !== id)
            );

            setSuccess('Notification deleted successfully.');
        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Unable to delete notification.'
            );
        }
    };

    const formatType = (type) =>
        String(type || 'general').replaceAll('_', ' ');

    const formatDate = (date) => {
        if (!date) return '';

        const parsedDate = new Date(date);

        return Number.isNaN(parsedDate.getTime())
            ? ''
            : parsedDate.toLocaleString();
    };

    return (
        <div className="notifications-page">
            <div className="page-heading">
                <div>
                    <p className="eyebrow">WORKSPACE</p>
                    <h1>Notifications</h1>
                    <p>Stay updated on tasks and project activities.</p>
                </div>

                <button
                    className="primary-button"
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                >
                    Mark All as Read
                </button>
            </div>

            <div className="notification-summary">
                <div className="notification-count-card">
                    <span>Total Notifications</span>
                    <strong>{notifications.length}</strong>
                </div>

                <div className="notification-count-card">
                    <span>Unread Notifications</span>
                    <strong>{unreadCount}</strong>
                </div>

                <div className="notification-count-card">
                    <span>Read Notifications</span>
                    <strong>{notifications.length - unreadCount}</strong>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="client-toolbar">
                <div>
                    <h2>Your Notifications</h2>
                    <p>Updates related to your account.</p>
                </div>

                <select
                    className="filter-select"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                </select>
            </div>

            <div className="notification-list">
                {loading ? (
                    <div className="loading">Loading notifications...</div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="empty-state">
                        {filter === 'unread'
                            ? 'You have no unread notifications.'
                            : filter === 'read'
                                ? 'You have no read notifications.'
                                : 'No notifications available yet.'}
                    </div>
                ) : (
                    filteredNotifications.map((item) => (
                        <article
                            className={`notification-card ${
                                !Boolean(item.is_read) ? 'unread' : ''
                            }`}
                            key={item.id}
                        >
                            <div className="notification-icon">
                                {item.type === 'task_assigned'
                                    ? '✓'
                                    : item.type === 'task_updated'
                                        ? '↻'
                                        : item.type === 'task_overdue'
                                            ? '!'
                                            : item.type === 'project_updated'
                                                ? '▤'
                                                : '●'}
                            </div>

                            <div className="notification-content">
                                <div className="notification-heading">
                                    <h3>{item.title}</h3>

                                    {!Boolean(item.is_read) && (
                                        <span className="unread-indicator">
                                            New
                                        </span>
                                    )}
                                </div>

                                <p>{item.message}</p>

                                <div className="notification-meta">
                                    <span>{formatType(item.type)}</span>
                                    <span>{formatDate(item.created_at)}</span>
                                </div>
                            </div>

                            <div className="notification-actions">
                                {!Boolean(item.is_read) && (
                                    <button
                                        className="edit-button"
                                        onClick={() => markAsRead(item.id)}
                                    >
                                        Mark Read
                                    </button>
                                )}

                                <button
                                    className="delete-button"
                                    onClick={() => deleteNotification(item.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notifications;
