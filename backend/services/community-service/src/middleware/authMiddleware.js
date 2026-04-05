/**
 * authMiddleware.js — Community Service
 *
 * Verifies the JWT issued by auth-service using the shared JWT_ACCESS_SECRET.
 * After verification: req.user = { userId, email, role }
 * Every controller reads identity from req.user.userId — NEVER from req.body.
 */
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token missing or malformed'
            });
        }

        const token = authHeader.split(' ')[1];

        // Uses the SAME secret as auth-service
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        // Attach decoded payload: { userId, email, role }
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * authorize(...roles) — restricts a route to specific roles.
 * MUST be used AFTER protect.
 * Example: router.get('/admin', protect, authorize('admin'), handler)
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied: role '${req.user?.role}' is not permitted`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
