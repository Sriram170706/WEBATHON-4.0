const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * AuthService
 * Handles user registration and login logic.
 */

/**
 * Initialize domain objects from an array of domain name strings.
 */
const initializeDomains = (domainNames) => {
    return domainNames.map((name) => ({
        domainName: name.trim(),
        qualityScore: 0,
        reliabilityScore: 100,
        level: 1,
        completedTasks: 0,
        beginnerBoostExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        cancellations: 0,
        onTimeCompletions: 0,
        totalAssigned: 0,
        ratingSum: 0,
    }));
};

/**
 * Register a new user.
 * @param {Object} userData - { name, email, phone, password, role, domains[] }
 * @returns {Object} { user, token }
 */
const register = async (userData) => {
    const { name, email, phone, password, role, domains = [] } = userData;

    // Validate domains array has at least one entry when role is freelancer/both
    if ((role === 'freelancer' || role === 'both') && domains.length === 0) {
        const err = new Error('Freelancers must select at least one domain');
        err.statusCode = 400;
        throw err;
    }

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
        const err = new Error('Email already registered');
        err.statusCode = 409;
        throw err;
    }

    const user = new User({
        name,
        email,
        phone,
        password,
        role,
        domains: initializeDomains(domains),
    });

    await user.save();

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token,
    };
};

/**
 * Login a user with email + password.
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, token }
 */
const login = async (email, password) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        throw err;
    }

    const token = generateToken(user._id);

    return {
        user: sanitizeUser(user),
        token,
    };
};

/**
 * Generate a signed JWT.
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

/**
 * Return a user object without sensitive fields.
 */
const sanitizeUser = (user) => {
    const obj = user.toObject();
    delete obj.password;
    return obj;
};

module.exports = { register, login, initializeDomains };
