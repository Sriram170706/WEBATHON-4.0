/**
 * seed.js — creates sample users and tasks for testing
 * Run with: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/microwork');
    console.log('✅ MongoDB connected');
};

const User = require('./src/models/User');
const Task = require('./src/models/Task');

const seed = async () => {
    await connectDB();

    // Wipe existing test users and tasks
    await User.deleteMany({ email: { $in: ['freelancer@test.com', 'client@test.com'] } });
    await Task.deleteMany({});

    // Pass PLAIN passwords — the User model pre-save hook hashes them once
    const PASSWORD = 'password123';

    // ── Freelancer ────────────────────────────────────────────
    const freelancer = await User.create({
        name: 'Alex (Freelancer)',
        email: 'freelancer@test.com',
        password: PASSWORD,
        role: 'freelancer',
        domains: [
            {
                domainName: 'Web Development',
                qualityScore: 4.2,
                reliabilityScore: 90,
                level: 2,
                completedTasks: 8,
                beginnerBoostExpiresAt: new Date(Date.now() - 1000), // expired
                cancellations: 1,
                onTimeCompletions: 7,
                totalAssigned: 8,
                ratingSum: 33.6,
            },
            {
                domainName: 'UI/UX Design',
                qualityScore: 0,
                reliabilityScore: 100,
                level: 1,
                completedTasks: 0,
                beginnerBoostExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // active
                cancellations: 0,
                onTimeCompletions: 0,
                totalAssigned: 0,
                ratingSum: 0,
            },
        ],
    });

    // ── Client ────────────────────────────────────────────────
    const client = await User.create({
        name: 'Sarah (Client)',
        email: 'client@test.com',
        password: PASSWORD,
        role: 'client',
        domains: [],
    });

    // ── Sample Tasks posted by client ─────────────────────────
    await Task.create([
        {
            title: 'Build a responsive portfolio website',
            description: 'Need a modern, mobile-friendly portfolio site built with React. Should include home, about, projects, and contact sections.',
            segment: 'Individual',
            domain: 'Web Development',
            duration: 5,
            budget: 3500,
            recommendedBudgetRange: { min: 3000, max: 5000 },
            clientId: client._id,
            status: 'Open',
        },
        {
            title: 'Design a SaaS landing page UI',
            description: 'Create high-fidelity Figma designs for a SaaS product landing page. Includes hero, features, pricing, and CTA sections.',
            segment: 'Individual',
            domain: 'UI/UX Design',
            duration: 3,
            budget: 2000,
            recommendedBudgetRange: { min: 1500, max: 3000 },
            clientId: client._id,
            status: 'Open',
        },
        {
            title: 'Enterprise dashboard development',
            description: 'Develop a full admin dashboard with real-time charts, data tables, and role-based access control using React and Node.js.',
            segment: 'Company',
            domain: 'Web Development',
            duration: 14,
            budget: 12000,
            recommendedBudgetRange: { min: 10000, max: 16000 },
            clientId: client._id,
            status: 'Open',
        },
        {
            title: 'Mobile app UI redesign',
            description: 'Redesign the UI of an existing iOS/Android app to improve usability and visual appeal. Deliver Figma files + style guide.',
            segment: 'Individual',
            domain: 'UI/UX Design',
            duration: 7,
            budget: 4500,
            recommendedBudgetRange: { min: 4000, max: 6500 },
            clientId: client._id,
            status: 'Open',
        },
    ]);

    console.log('\n🌱 Seed data created successfully!');
    console.log('──────────────────────────────────────────────');
    console.log('👤  Freelancer  →  freelancer@test.com  /  password123');
    console.log('🏢  Client      →  client@test.com      /  password123');
    console.log('──────────────────────────────────────────────');
    console.log('📋  4 sample tasks created\n');

    await mongoose.disconnect();
    process.exit(0);
};

seed().catch(err => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
