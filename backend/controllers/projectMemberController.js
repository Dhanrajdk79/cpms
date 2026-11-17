
const ProjectMember = require('../models/projectMemberModel');
const { pool } = require('../config/db');

// Check project existence and Project Manager ownership.
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

// Assign employee to project
const assignMember = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.body.user_id);

        const project = await getAccessibleProject(projectId, req.user);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const [users] = await pool.execute(
            `SELECT id FROM users
             WHERE id = ?
             AND role = 'employee'
             AND is_active = TRUE`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Active employee not found'
            });
        }

        const assignmentId = await ProjectMember.assign(
            projectId,
            userId
        );

        return res.status(201).json({
            success: true,
            message: 'Employee assigned to project successfully',
            assignmentId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'Employee is already assigned to this project'
            });
        }

        console.error('Assign member error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to assign employee'
        });
    }
};

// Get all project members
const getProjectMembers = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);

        const project = await getAccessibleProject(projectId, req.user);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const members = await ProjectMember.findByProjectId(projectId);

        return res.status(200).json({
            success: true,
            count: members.length,
            members
        });
    } catch (error) {
        console.error('Get project members error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve project members'
        });
    }
};

// Remove employee from project
const removeMember = async (req, res) => {
    try {
        const projectId = Number(req.params.projectId);
        const userId = Number(req.params.userId);

        const project = await getAccessibleProject(projectId, req.user);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const removed = await ProjectMember.remove(
            projectId,
            userId
        );

        if (removed === 0) {
            return res.status(404).json({
                success: false,
                message: 'Project assignment not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Employee removed from project successfully'
        });
    } catch (error) {
        console.error('Remove member error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to remove employee'
        });
    }
};

module.exports = {
    assignMember,
    getProjectMembers,
    removeMember
};
