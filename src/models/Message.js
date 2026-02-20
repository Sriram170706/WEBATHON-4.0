const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, enum: ['client', 'freelancer'], required: true },
        text: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
