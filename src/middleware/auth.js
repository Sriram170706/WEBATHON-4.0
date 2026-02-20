const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect – Verifies JWT and attaches the user to req.user.
 * Usage: router.get('/route', protect, handler)
 */
const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authenticated – no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};

/**
 * requireRole – Restricts access to specific roles.
 * @param {...string} roles - Allowed roles: 'freelancer', 'client', 'both'
 * Usage: router.post('/create-task', protect, requireRole('client', 'both'), handler)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }
        next();
    };
};

/**
 * requireFreelancer – shorthand guard: allows 'freelancer' and 'both'
 */
const requireFreelancer = requireRole('freelancer', 'both');

/**
 * requireClient – shorthand guard: allows 'client' and 'both'
 */
const requireClient = requireRole('client', 'both');

module.exports = { protect, requireRole, requireFreelancer, requireClient };
