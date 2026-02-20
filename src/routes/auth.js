const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');

/**
 * POST /api/auth/register
 * Body: { name, email, phone?, password, role, domains[] }
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role, domains } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'name, email, password, and role are required' });
        }

        const validRoles = ['freelancer', 'client', 'both'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, message: `role must be one of: ${validRoles.join(', ')}` });
        }

        const { user, token } = await AuthService.register({
            name, email, phone, password, role,
            domains: Array.isArray(domains) ? domains : [],
        });

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'email and password are required' });
        }

        const { user, token } = await AuthService.login(email, password);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

module.exports = router;
