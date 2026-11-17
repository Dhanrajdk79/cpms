
const Comment = require('../models/commentModel');
const { pool } = require('../config/db');

const canAccessTask = async (taskId, user) => {
    const [rows] = await pool.execute(
        `SELECT t.id, t.assigned_to, p.project_manager_id
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE t.id = ?`,
        [taskId]
    );

    if (!rows.length) return null;

    const task = rows[0];

    if (
        user.role === 'admin' ||
        task.assigned_to === user.id ||
        task.project_manager_id === user.id
    ) {
        return task;
    }

    return false;
};

// Add comment
const addComment = async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        const access = await canAccessTask(taskId, req.user);

        if (!access) {
            return res.status(access === null ? 404 : 403).json({
                success: false,
                message: access === null ? 'Task not found' : 'Access denied'
            });
        }

        const commentId = await Comment.create(
            taskId,
            req.user.id,
            req.body.comment.trim()
        );

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            commentId
        });

    } catch (error) {
        console.error('Add comment error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment'
        });
    }
};

// Get task comments
const getComments = async (req, res) => {
    try {
        const taskId = Number(req.params.taskId);
        const access = await canAccessTask(taskId, req.user);

        if (!access) {
            return res.status(access === null ? 404 : 403).json({
                success: false,
                message: access === null ? 'Task not found' : 'Access denied'
            });
        }

        const comments = await Comment.findByTaskId(taskId);

        res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });

    } catch (error) {
        console.error('Get comments error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve comments'
        });
    }
};

// Update own comment
const updateComment = async (req, res) => {
    try {
        const commentId = Number(req.params.id);
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (
            comment.user_id !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own comments'
            });
        }

        await Comment.update(commentId, req.body.comment.trim());

        res.status(200).json({
            success: true,
            message: 'Comment updated successfully'
        });

    } catch (error) {
        console.error('Update comment error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update comment'
        });
    }
};

// Delete own comment or admin delete
const deleteComment = async (req, res) => {
    try {
        const commentId = Number(req.params.id);
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (
            comment.user_id !== req.user.id &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own comments'
            });
        }

        await Comment.delete(commentId);

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Delete comment error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment'
        });
    }
};

module.exports = {
    addComment,
    getComments,
    updateComment,
    deleteComment
};
