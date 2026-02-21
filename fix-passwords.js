/**
 * fix-passwords.js
 * Resets the passwords of the 13 seeded users by writing a single
 * correct bcrypt hash directly to MongoDB — bypassing the Mongoose
 * pre-save hook so it does NOT double-hash.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/microwork_platform';

const EMAILS = [
    'shashank@gmail.com', 'advaith@gmail.com', 'abhishek@gmail.com',
    'varshith@gmail.com', 'pranav@gmail.com', 'thanmai@gmail.com',
    'abhiram@gmail.com', 'manohar@gmail.com', 'koushik@gmail.com',
    'sasank@gmail.com', 'yuvaraj@gmail.com', 'dheeraj@gmail.com',
    'abhinay@gmail.com',
];

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('✅  Connected to MongoDB\n');

    // Hash once — this goes straight into the DB, no middleware runs
    const hashed = await bcrypt.hash('password123', 12);

    const result = await mongoose.connection.db
        .collection('users')
        .updateMany(
            { email: { $in: EMAILS } },
            { $set: { password: hashed } }
        );

    console.log(`✅  Updated ${result.modifiedCount} / ${EMAILS.length} users`);
    console.log('   All passwords reset to: password123');

    await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
