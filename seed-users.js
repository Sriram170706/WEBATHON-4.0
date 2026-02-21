/**
 * seed-users.js
 * Creates 10 experienced + 3 beginner freelancers in the Video Editing domain.
 * Run: node seed-users.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/microwork_platform';

// ── 10 Experienced users (completedTasks ≥ 5, varied levels + scores) ──────
const experienced = [
    { name: 'Shashank', email: 'shashank@gmail.com', level: 4, quality: 4.8, reliability: 97, completed: 28, ratingSum: 134.4 },
    { name: 'Advaith', email: 'advaith@gmail.com', level: 4, quality: 4.5, reliability: 94, completed: 22, ratingSum: 99.0 },
    { name: 'Abhishek', email: 'abhishek@gmail.com', level: 3, quality: 4.2, reliability: 90, completed: 15, ratingSum: 63.0 },
    { name: 'Varshith', email: 'varshith@gmail.com', level: 3, quality: 3.9, reliability: 88, completed: 14, ratingSum: 54.6 },
    { name: 'Pranav', email: 'pranav@gmail.com', level: 3, quality: 3.6, reliability: 85, completed: 12, ratingSum: 43.2 },
    { name: 'Thanmai', email: 'thanmai@gmail.com', level: 2, quality: 3.3, reliability: 82, completed: 8, ratingSum: 26.4 },
    { name: 'Abhiram', email: 'abhiram@gmail.com', level: 2, quality: 3.0, reliability: 78, completed: 7, ratingSum: 21.0 },
    { name: 'Manohar', email: 'manohar@gmail.com', level: 2, quality: 2.7, reliability: 75, completed: 6, ratingSum: 16.2 },
    { name: 'Koushik', email: 'koushik@gmail.com', level: 2, quality: 2.4, reliability: 72, completed: 5, ratingSum: 12.0 },
    { name: 'Sasank', email: 'sasank@gmail.com', level: 2, quality: 2.1, reliability: 70, completed: 5, ratingSum: 10.5 },
];

// ── 3 Beginners (completedTasks < 3, Beginner Boost still active) ────────────
const beginners = [
    { name: 'Yuvaraj', email: 'yuvaraj@gmail.com', level: 1, quality: 4.0, reliability: 100, completed: 2, ratingSum: 8.0 },
    { name: 'Dheeraj', email: 'dheeraj@gmail.com', level: 1, quality: 3.5, reliability: 95, completed: 1, ratingSum: 3.5 },
    { name: 'Abhinay', email: 'abhinay@gmail.com', level: 1, quality: 3.0, reliability: 90, completed: 0, ratingSum: 0.0 },
];

async function buildDomain(u, isExperienced) {
    const now = new Date();
    return {
        domainName: 'Video Editing',
        qualityScore: u.quality,
        reliabilityScore: u.reliability,
        level: u.level,
        completedTasks: u.completed,
        beginnerBoostExpiresAt: isExperienced
            ? new Date(now - 1000)                                          // already expired for experienced
            : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),          // still active for beginners
        cancellations: 0,
        onTimeCompletions: Math.round(u.completed * 0.9),
        totalAssigned: u.completed,
        ratingSum: u.ratingSum,
    };
}

async function upsertUser(userData, isExperienced) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
        console.log(`  ↩  Skipping ${userData.email} (already exists)`);
        return;
    }

    const password = await bcrypt.hash('password123', 12);
    const domain = await buildDomain(userData, isExperienced);

    await User.create({
        name: userData.name,
        email: userData.email,
        password,
        role: 'freelancer',
        domains: [domain],
    });

    console.log(`  ✓  Created ${userData.email}  (Lv${userData.level}, Quality ${userData.quality}, Reliability ${userData.reliability}%)`);
}

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB\n');

    console.log('── Creating 10 experienced freelancers ──');
    for (const u of experienced) await upsertUser(u, true);

    console.log('\n── Creating 3 beginner freelancers ──');
    for (const u of beginners) await upsertUser(u, false);

    console.log('\n✅  Done! All users seeded successfully.');
    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
