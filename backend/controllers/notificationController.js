
const Notification = require('../models/notificationModel');

// Create notification
const createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type,
            related_task_id, related_project_id } = req.body;

        const notificationId = await Notification.create({
            user_id,
            title,
            message,
            type,
            related_task_id,
            related_project_id
        });

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            notificationId
        });

    } catch (error) {
        console.error('Create notification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
};

// Get logged-in user's notifications
const getNotifications = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            is_read
        } = req.query;

        const currentPage = Number(page);
        const itemsPerPage = Number(limit);
        const offset = (currentPage - 1) * itemsPerPage;

        const readCondition = is_read === undefined
            ? ''
            : `AND is_read = ${is_read === 'true' ? 1 : 0}`;

        const filters = {
            readCondition,
            limit: itemsPerPage,
            offset
        };

        const notifications = await Notification.findByUserId(
            req.user.id,
            filters
        );

        const total = await Notification.countByUserId(
            req.user.id,
            readCondition
        );

        res.status(200).json({
            success: true,
            currentPage,
            limit: itemsPerPage,
            total,
            totalPages: Math.ceil(total / itemsPerPage),
            notifications
        });

    } catch (error) {
        console.error('Get notifications error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notifications'
        });
    }
};

// Mark one notification as read
const markAsRead = async (req, res) => {
    try {
        const updated = await Notification.markAsRead(
            Number(req.params.id),
            req.user.id
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found or already read'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Mark notification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification'
        });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const updated = await Notification.markAllAsRead(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Notifications marked as read',
            updatedCount: updated
        });

    } catch (error) {
        console.error('Mark all notifications error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update notifications'
        });
    }
};

// Delete notification
const deleteNotification = async (req, res) => {
    try {
        const deleted = await Notification.delete(
            Number(req.params.id),
            req.user.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });

    } catch (error) {
        console.error('Delete notification error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
};

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
