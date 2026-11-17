
const Project = require('../models/projectModel');
const { pool } = require('../config/db');

const isAdmin = (req) => req.user.role === 'admin';

// Check project existence and ownership.
const getAccessibleProject = async (projectId, user) => {
    const [rows] = await pool.execute(
        `SELECT id, project_manager_id
         FROM projects
         WHERE id = ?`,
        [projectId]
    );

    const project = rows[0];

    if (!project) return null;

    if (
        user.role === 'project_manager' &&
        Number(project.project_manager_id) !== Number(user.id)
    ) {
        return null;
    }

    return project;
};

// Create project
const createProject = async (req, res) => {
    try {
        const {
            client_id,
            project_name,
            description,
            start_date,
            deadline,
            status,
            progress
        } = req.body;

        const project_manager_id = isAdmin(req)
            ? req.body.project_manager_id
            : req.user.id;

        if (
            !client_id ||
            !project_name ||
            !start_date ||
            !deadline ||
            !project_manager_id
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required project fields'
            });
        }

        const [clients] = await pool.execute(
            'SELECT id FROM clients WHERE id = ?',
            [client_id]
        );

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const [managers] = await pool.execute(
            `SELECT id FROM users
             WHERE id = ?
             AND role = 'project_manager'
             AND is_active = TRUE`,
            [project_manager_id]
        );

        if (managers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Active project manager not found'
            });
        }

        const projectId = await Project.create({
            client_id: Number(client_id),
            project_name: project_name.trim(),
            description: description ?? null,
            project_manager_id: Number(project_manager_id),
            start_date,
            deadline,
            status: status || 'planning',
            progress: progress ?? 0
        });

        return res.status(201).json({
            success: true,
            message: 'Project created successfully',
            projectId
        });

    } catch (error) {
        console.error('Create project error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to create project'
        });
    }
};

// Get all projects
const getAllProjects = async (req, res) => {
    try {
        let projects;

        if (isAdmin(req)) {
            projects = await Project.findAll();
        } else {
            const [rows] = await pool.execute(
                `SELECT
                    p.*,
                    c.company_name,
                    u.full_name AS project_manager_name
                 FROM projects p
                 JOIN clients c ON p.client_id = c.id
                 JOIN users u ON p.project_manager_id = u.id
                 WHERE p.project_manager_id = ?
                 ORDER BY p.created_at DESC`,
                [req.user.id]
            );

            projects = rows;
        }

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {
        console.error('Get projects error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects'
        });
    }
};

// Get project by ID
const getProjectById = async (req, res) => {
    try {
        const projectId = Number(req.params.id);

        const accessible = await getAccessibleProject(
            projectId,
            req.user
        );

        if (!accessible) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const project = await Project.findById(projectId);

        return res.status(200).json({
            success: true,
            project
        });

    } catch (error) {
        console.error('Get project error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve project'
        });
    }
};

// Update project
const updateProject = async (req, res) => {
    try {
        const projectId = Number(req.params.id);

        const accessible = await getAccessibleProject(
            projectId,
            req.user
        );

        if (!accessible) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Fetch complete existing project data.
        const existingProject = await Project.findById(projectId);

        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Merge incoming values with existing values.
        const updatedData = {
            client_id: req.body.client_id ?? existingProject.client_id,
            project_name: req.body.project_name ?? existingProject.project_name,
            description: req.body.description ?? existingProject.description ?? null,
            project_manager_id: isAdmin(req)
                ? (req.body.project_manager_id ?? existingProject.project_manager_id)
                : existingProject.project_manager_id,
            start_date: req.body.start_date ?? existingProject.start_date,
            deadline: req.body.deadline ?? existingProject.deadline,
            status: req.body.status ?? existingProject.status,
            progress: req.body.progress ?? existingProject.progress ?? 0
        };

        if (
            !updatedData.client_id ||
            !updatedData.project_name ||
            !updatedData.start_date ||
            !updatedData.deadline
        ) {
            return res.status(400).json({
                success: false,
                message: 'Invalid project details'
            });
        }

        const [clients] = await pool.execute(
            'SELECT id FROM clients WHERE id = ?',
            [updatedData.client_id]
        );

        if (clients.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        const [managers] = await pool.execute(
            `SELECT id FROM users
             WHERE id = ?
             AND role = 'project_manager'
             AND is_active = TRUE`,
            [updatedData.project_manager_id]
        );

        if (managers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Active project manager not found'
            });
        }

        await Project.update(projectId, updatedData);

        return res.status(200).json({
            success: true,
            message: 'Project updated successfully'
        });

    } catch (error) {
        console.error('Update project error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to update project'
        });
    }
};

// Delete project
const deleteProject = async (req, res) => {
    try {
        const projectId = Number(req.params.id);

        const accessible = await getAccessibleProject(
            projectId,
            req.user
        );

        if (!accessible) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await Project.delete(projectId);

        return res.status(200).json({
            success: true,
            message: 'Project deleted successfully'
        });

    } catch (error) {
        console.error('Delete project error:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
};
