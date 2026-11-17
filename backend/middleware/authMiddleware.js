
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check Authorization header
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token is required.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Fetch current user
        const user = await User.findById(decoded.id);

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive user account.'
            });
        }

        // Attach user details to request
        req.user = user;

        next();

    } catch (error) {
        if (
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        console.error('Authentication error:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

// Check user role
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource.'
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
