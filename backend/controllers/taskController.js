
const Task = require('../models/taskModel');
const Notification = require('../models/notificationModel');
const { pool } = require('../config/db');

// Check whether a task belongs to a project managed by this PM.
const canAccessTask = async (task, user) => {
    if (user.role === 'admin') return true;

    if (user.role === 'employee') {
        return Number(task.assigned_to) === Number(user.id);
    }

    if (user.role === 'project_manager') {
        const [rows] = await pool.execute(
            `SELECT id FROM projects
             WHERE id = ? AND project_manager_id = ?`,
            [task.project_id, user.id]
        );

        return rows.length > 0;
    }

    return false;
};

// Recalculate project progress based on completed tasks.
const updateProjectProgress = async (projectId) => {
    const [rows] = await pool.execute(
        `SELECT
            COUNT(*) AS totalTasks,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completedTasks
         FROM tasks
         WHERE project_id = ?`,
        [projectId]
    );

    const total = Number(rows[0].totalTasks);
    const completed = Number(rows[0].completedTasks || 0);

    const progress = total === 0
        ? 0
        : Number(((completed / total) * 100).toFixed(2));

    await pool.execute(
        'UPDATE projects SET progress = ? WHERE id = ?',
        [progress, projectId]
    );

    return progress;
};

// Create notification without failing the main task operation.
const sendNotification = async (data) => {
    try {
        await Notification.create(data);
    } catch (error) {
        console.error('Automatic notification error:', error.message);
    }
};

// Create task
const createTask = async (req, res) => {
    try {
        const {
            project_id,
            assigned_to,
            title,
            description,
            priority,
            status,
            deadline
        } = req.body;

        const [projects] = await pool.execute(
            `SELECT id, project_manager_id
             FROM projects
             WHERE id = ?`,
            [project_id]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const project = projects[0];

        if (
            req.user.role === 'project_manager' &&
            Number(project.project_manager_id) !== Number(req.user.id)
        ) {
            return res.status(403).json({
                success: false,
                message: 'You cannot create tasks for this project'
            });
        }

        const [employees] = await pool.execute(
            `SELECT id FROM users
             WHERE id = ?
             AND role = 'employee'
             AND is_active = TRUE`,
            [assigned_to]
        );

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Active employee not found'
            });
        }

        const [members] = await pool.execute(
            `SELECT id FROM project_members
             WHERE project_id = ? AND user_id = ?`,
            [project_id, assigned_to]
        );

        if (members.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Employee is not assigned to this project'
            });
        }

        const taskId = await Task.create({
            project_id,
            assigned_to,
            created_by: req.user.id,
            title,
            description,
            priority,
            status,
            deadline
        });

        // Update project progress.
        await updateProjectProgress(project_id);

        // Notify the assigned employee.
        await sendNotification({
            user_id: assigned_to,
            title: 'New Task Assigned',
            message: `You have been assigned a new task: ${title}`,
            type: 'task_assigned',
            related_task_id: taskId,
            related_project_id: project_id
        });

        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            taskId
        });

    } catch (error) {
        console.error('Create task error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to create task'
        });
    }
};

// Get all tasks with search, filters and pagination
const getAllTasks = async (req, res) => {
    try {
        const {
            search,
            status,
            priority,
            project_id,
            assigned_to,
            page = 1,
            limit = 10,
            sortBy = 'created_at',
            order = 'DESC'
        } = req.query;

        const conditions = [];
        const params = [];

        if (req.user.role === 'employee') {
            conditions.push('t.assigned_to = ?');
            params.push(req.user.id);

        } else if (req.user.role === 'project_manager') {
            conditions.push(
                `t.project_id IN (
                    SELECT p.id
                    FROM projects p
                    WHERE p.project_manager_id = ?
                )`
            );
            params.push(req.user.id);
        }

        if (project_id) {
            conditions.push('t.project_id = ?');
            params.push(project_id);
        }

        if (assigned_to) {
            if (
                req.user.role === 'employee' &&
                Number(assigned_to) !== Number(req.user.id)
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot view another employee tasks'
                });
            }

            conditions.push('t.assigned_to = ?');
            params.push(assigned_to);
        }

        if (status) {
            conditions.push('t.status = ?');
            params.push(status);
        }

        if (priority) {
            conditions.push('t.priority = ?');
            params.push(priority);
        }

        if (search) {
            conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        const where = conditions.length
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        const currentPage = Math.max(1, Number(page) || 1);

        const itemsPerPage = Math.min(
            100,
            Math.max(1, Number(limit) || 10)
        );

        const offset = (currentPage - 1) * itemsPerPage;

        const allowedSortFields = [
            'created_at',
            'deadline',
            'priority',
            'status',
            'title'
        ];

        const safeSortBy = allowedSortFields.includes(sortBy)
            ? sortBy
            : 'created_at';

        const safeOrder = String(order).toUpperCase() === 'ASC'
            ? 'ASC'
            : 'DESC';

        const filters = {
            where,
            params,
            limit: itemsPerPage,
            offset,
            sortBy: safeSortBy,
            order: safeOrder
        };

        const tasks = await Task.findAll(filters);
        const totalTasks = await Task.count(where, params);

        return res.status(200).json({
            success: true,
            currentPage,
            limit: itemsPerPage,
            totalTasks,
            totalPages: Math.ceil(totalTasks / itemsPerPage),
            tasks
        });

    } catch (error) {
        console.error('Get tasks error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve tasks'
        });
    }
};

// Get task by ID
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(Number(req.params.id));

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const allowed = await canAccessTask(task, req.user);

        if (!allowed) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        return res.status(200).json({
            success: true,
            task
        });

    } catch (error) {
        console.error('Get task error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve task'
        });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const allowed = await canAccessTask(task, req.user);

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: 'You cannot update this task'
            });
        }

        const updateData = req.body;

        // Employees can only update their own task status.
        if (req.user.role === 'employee') {
            if (
                Object.keys(updateData).length !== 1 ||
                !Object.prototype.hasOwnProperty.call(updateData, 'status')
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Employees can only update task status'
                });
            }

        } else if (
            Object.prototype.hasOwnProperty.call(updateData, 'assigned_to')
        ) {
            const [employees] = await pool.execute(
                `SELECT id FROM users
                 WHERE id = ?
                 AND role = 'employee'
                 AND is_active = TRUE`,
                [updateData.assigned_to]
            );

            if (employees.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Active employee not found'
                });
            }

            const [members] = await pool.execute(
                `SELECT id FROM project_members
                 WHERE project_id = ? AND user_id = ?`,
                [task.project_id, updateData.assigned_to]
            );

            if (members.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee is not assigned to this project'
                });
            }
        }

        await Task.update(taskId, updateData);

        // Recalculate progress after task status changes.
        await updateProjectProgress(task.project_id);

        // Employee updates: notify the Project Manager.
        if (req.user.role === 'employee') {
            const [projects] = await pool.execute(
                `SELECT project_manager_id, project_name
                 FROM projects
                 WHERE id = ?`,
                [task.project_id]
            );

            if (projects.length > 0) {
                const managerId = Number(projects[0].project_manager_id);

                if (managerId !== Number(req.user.id)) {
                    await sendNotification({
                        user_id: managerId,
                        title: 'Task Status Updated',
                        message: `${req.user.full_name} updated "${task.title}" to ${updateData.status}`,
                        type: 'task_updated',
                        related_task_id: taskId,
                        related_project_id: task.project_id
                    });
                }
            }

        } else {
            // Admin/PM updates: notify the assigned employee.
            if (Number(task.assigned_to) !== Number(req.user.id)) {
                await sendNotification({
                    user_id: task.assigned_to,
                    title: 'Task Updated',
                    message: `Your task "${task.title}" has been updated`,
                    type: 'task_updated',
                    related_task_id: taskId,
                    related_project_id: task.project_id
                });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Task updated successfully'
        });

    } catch (error) {
        console.error('Update task error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to update task'
        });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const taskId = Number(req.params.id);
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const allowed = await canAccessTask(task, req.user);

        if (
            !allowed ||
            !['admin', 'project_manager'].includes(req.user.role)
        ) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete this task'
            });
        }

        await Task.delete(taskId);

        // Recalculate project progress after deletion.
        await updateProjectProgress(task.project_id);

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask
};
