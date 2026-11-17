
const express = require('express');
const router = express.Router();

const {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');

const {
    authenticateToken,
    authorizeRoles
} = require('../middleware/authMiddleware');

const {
    createNotificationValidator,
    notificationIdValidator,
    notificationQueryValidator
} = require('../validators/notificationValidator');

// Create notification - admin and project manager only
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin', 'project_manager'),
    createNotificationValidator,
    createNotification
);

// Get own notifications
router.get(
    '/',
    authenticateToken,
    notificationQueryValidator,
    getNotifications
);

// Mark all as read - keep this before /:id
router.patch(
    '/read-all',
    authenticateToken,
    markAllAsRead
);

// Mark one as read
router.patch(
    '/:id/read',
    authenticateToken,
    notificationIdValidator,
    markAsRead
);

// Delete own notification
router.delete(
    '/:id',
    authenticateToken,
    notificationIdValidator,
    deleteNotification
);

module.exports = router;
