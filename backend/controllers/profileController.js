
const User = require('../models/userModel');

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            user
        });

    } catch (error) {
        console.error('Profile error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve profile'
        });
    }
};

module.exports = { getProfile };
