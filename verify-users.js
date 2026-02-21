require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/microwork_platform';
const emails = [
    'shashank@gmail.com', 'advaith@gmail.com', 'abhishek@gmail.com', 'varshith@gmail.com',
    'pranav@gmail.com', 'thanmai@gmail.com', 'abhiram@gmail.com', 'manohar@gmail.com',
    'koushik@gmail.com', 'sasank@gmail.com', 'yuvaraj@gmail.com', 'dheeraj@gmail.com', 'abhinay@gmail.com'
];
mongoose.connect(MONGO_URI).then(async () => {
    const users = await mongoose.connection.db.collection('users').find(
        { email: { $in: emails } },
        { projection: { name: 1, email: 1, domains: 1 } }
    ).toArray();
    console.log('Found:', users.length, '/ 13 users\n');
    users.forEach(u => {
        const d = u.domains?.[0];
        console.log(`  ${u.name.padEnd(12)} | ${u.email.padEnd(25)} | Lv${d?.level} | Q:${String(d?.qualityScore).padEnd(5)} | R:${d?.reliabilityScore}% | Done:${d?.completedTasks}`);
    });
    process.exit();
}).catch(e => { console.error(e.message); process.exit(1); });
