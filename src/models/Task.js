const mongoose = require('mongoose');

// Embedded application sub-document
const ApplicationSchema = new mongoose.Schema({
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    appliedAt: {
        type: Date,
        default: Date.now,
    },
    availabilityStatus: {
        type: String,
        enum: ['available', 'busy'],
        default: 'available',
    },
}, { _id: false });

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true,
        },
        segment: {
            type: String,
            enum: ['Individual', 'Company'],
            required: [true, 'Segment (Individual/Company) is required'],
        },
        domain: {
            type: String,
            required: [true, 'Domain is required'],
            trim: true,
        },
        /**
         * Duration in days
         */
        duration: {
            type: Number,
            required: [true, 'Duration is required'],
            min: 1,
        },
        /**
         * Budget the client is offering
         */
        budget: {
            type: Number,
            required: [true, 'Budget is required'],
            min: 0,
        },
        /**
         * Difficulty level used in pricing AI
         * 1 = Easy, 2 = Medium, 3 = Hard
         */
        difficulty: {
            type: Number,
            enum: [1, 2, 3],
            default: 1,
        },
        /**
         * Computed by PricingService and stored at creation time
         */
        recommendedBudgetRange: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        /**
         * Embedded applications (raw list; Top-10 filtering is done at query time)
         */
        applicants: {
            type: [ApplicationSchema],
            default: [],
        },
        selectedFreelancerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        status: {
            type: String,
            enum: ['Open', 'InProgress', 'Completed'],
            default: 'Open',
        },
        /**
         * Deadline = createdAt + duration days  (set on save)
         */
        deadline: {
            type: Date,
        },
        /**
         * Rating given by client on completion (1–5)
         */
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        /**
         * True once the freelancer marks completion
         */
        completedOnTime: {
            type: Boolean,
            default: null,
        },
        /**
         * Freelancer's submission note (what they did / deliverables)
         */
        submissionNote: {
            type: String,
            default: null,
        },
        /**
         * Optional URL the freelancer shares (GitHub, Drive, deployed link, etc.)
         */
        submissionUrl: {
            type: String,
            default: null,
        },
        /**
         * When the freelancer submitted their work
         */
        submittedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Auto-set deadline from duration
TaskSchema.pre('save', function (next) {
    if (this.isNew) {
        this.deadline = new Date(Date.now() + this.duration * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('Task', TaskSchema);
