require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// ── Routes ────────────────────────────────────────────────────────────────
const authRoutes = require('./src/routes/auth');
const taskRoutes = require('./src/routes/tasks');

// ── Connect Database ──────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Micro Work Platform API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
        },
    });
});

// ── Route Mounts ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

// ── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅  Server running on port ${PORT}`);
    console.log(`📡  API base: http://localhost:${PORT}/api`);
});

module.exports = app;
