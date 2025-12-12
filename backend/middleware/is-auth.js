const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }

        const token = authHeader.split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // This will catch expired or invalid tokens
            err.statusCode = 401;
            throw err;
        }

        if (!decodedToken) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }

        // Await the user lookup to ensure it completes before proceeding
        const user = await User.findById(decodedToken.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 401;
            throw error;
        }

        // Attach user information to the request object
        req.userId = decodedToken.userId;
        req.user = user; // Attach the full user object for controllers to use

        // Only call next() after the user has been successfully verified
        next();
    } catch (err) {
        // Pass any error to your centralized error handler in app.js
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};