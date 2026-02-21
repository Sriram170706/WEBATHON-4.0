const express = require('express');
const router = express.Router();
const { protect, requireFreelancer, requireClient } = require('../middleware/auth');
const TaskService = require('../services/TaskService');
const MatchingService = require('../services/MatchingService');
const RatingService = require('../services/RatingService');
const Task = require('../models/Task');

// ─────────────────────────────────────────────
// FREELANCER ROUTES
// ─────────────────────────────────────────────

/**
 * GET /api/tasks/dashboard
 * Freelancer dashboard: their domains summary + active tasks they're selected for.
 */
router.get('/dashboard', protect, requireFreelancer, async (req, res) => {
    try {
        const user = req.user;

        // Active tasks this freelancer is working on
        const activeTasks = await Task.find({
            selectedFreelancerId: user._id,
            status: { $in: ['InProgress', 'Completed'] },
        }).select('title domain status deadline budget segment createdAt');

        return res.status(200).json({
            success: true,
            freelancer: {
                name: user.name,
                email: user.email,
                role: user.role,
            },
            domains: user.domains,
            activeTasks,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/tasks/my-domains
 * Returns the authenticated freelancer's domain profiles.
 */
router.get('/my-domains', protect, requireFreelancer, async (req, res) => {
    try {
        const domains = req.user.domains.map((d) => ({
            domainName: d.domainName,
            level: d.level,
            qualityScore: d.qualityScore,
            reliabilityScore: d.reliabilityScore,
            completedTasks: d.completedTasks,
            isBeginnerBoostActive: new Date() < d.beginnerBoostExpiresAt,
            beginnerBoostExpiresAt: d.beginnerBoostExpiresAt,
            isBeginner: d.completedTasks < 3,
        }));

        return res.status(200).json({ success: true, domains });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/tasks/available-tasks
 * Lists all Open tasks.
 * Optional query: ?domain=WebDev&segment=Individual
 */
router.get('/available-tasks', protect, requireFreelancer, async (req, res) => {
    try {
        const { domain, segment } = req.query;
        const query = { status: 'Open' };
        if (domain) query.domain = new RegExp(`^${domain}$`, 'i');
        if (segment) query.segment = segment;

        const tasks = await Task.find(query)
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/tasks/task-detail/:id
 * Returns a single task. Accessible by the assigned freelancer, client,
 * or any applicant. Uses a direct $or query — no populate-based access check.
 */
router.get('/task-detail/:id', protect, async (req, res) => {
    try {
        const uid = req.user._id;

        // First check access via direct query
        const access = await Task.exists({
            _id: req.params.id,
            $or: [
                { clientId: uid },
                { selectedFreelancerId: uid },
                { 'applicants.freelancerId': uid },
            ],
        });

        if (!access) {
            // Also let the task owner (client) always see it
            const task403 = await Task.findById(req.params.id);
            if (!task403) return res.status(404).json({ success: false, message: 'Task not found' });
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const task = await Task.findById(req.params.id)
            .populate('clientId', 'name email')
            .populate('selectedFreelancerId', 'name email');

        return res.status(200).json({ success: true, task });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// CLIENT ROUTES
// ─────────────────────────────────────────────

/**
 * POST /api/tasks/create-task
 * Body: { title, description, segment, domain, duration, budget, difficulty? }
 */
router.post('/create-task', protect, requireClient, async (req, res) => {
    try {
        const task = await TaskService.createTask(req.user._id, req.body);
        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task,
            pricingAdvice: {
                yourBudget: task.budget,
                recommendedRange: task.recommendedBudgetRange,
                note:
                    task.budget < task.recommendedBudgetRange.min
                        ? '⚠️ Your budget is below the recommended range – you may receive fewer applicants.'
                        : task.budget > task.recommendedBudgetRange.max
                            ? '✅ Your budget is above market rate – high applicant interest expected.'
                            : '✅ Your budget is within the recommended range.',
            },
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/tasks/my-tasks
 * Client's posted tasks.
 */
router.get('/my-tasks', protect, requireClient, async (req, res) => {
    try {
        const tasks = await TaskService.getClientTasks(req.user._id);
        return res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * GET /api/tasks/task/:id/applicants
 * Returns Top 10 filtered applicants (7 experienced + 3 rookie) for a task.
 */
router.get('/task/:id/applicants', protect, requireClient, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        if (task.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const top10 = await MatchingService.getTop10Applicants(task.applicants, task.domain);

        return res.status(200).json({
            success: true,
            taskId: task._id,
            domain: task.domain,
            totalApplicants: task.applicants.length,
            returnedCount: top10.length,
            applicants: top10,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// TASK ACTION ROUTES
// ─────────────────────────────────────────────

/**
 * POST /api/tasks/apply/:taskId
 * Body: { availabilityStatus? }  ("available" | "busy")
 */
router.post('/apply/:taskId', protect, requireFreelancer, async (req, res) => {
    try {
        const { availabilityStatus = 'available' } = req.body;
        const task = await TaskService.applyToTask(req.params.taskId, req.user, availabilityStatus);
        return res.status(200).json({
            success: true,
            message: 'Application submitted successfully',
            taskId: task._id,
            totalApplicants: task.applicants.length,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/tasks/select/:taskId/:freelancerId
 * Client selects a freelancer. Task moves to InProgress.
 */
router.post('/select/:taskId/:freelancerId', protect, requireClient, async (req, res) => {
    try {
        const task = await TaskService.selectFreelancer(
            req.params.taskId,
            req.user._id,
            req.params.freelancerId
        );
        return res.status(200).json({
            success: true,
            message: 'Freelancer selected – task is now InProgress',
            task,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/tasks/complete/:taskId
 * Selected freelancer marks the task as complete.
 * Body (optional): { submissionNote, submissionUrl }
 */
router.post('/complete/:taskId', protect, requireFreelancer, async (req, res) => {
    try {
        const { submissionNote, submissionUrl } = req.body || {};

        // Save submission fields before marking complete
        if (submissionNote || submissionUrl) {
            await Task.findByIdAndUpdate(req.params.taskId, {
                submissionNote: submissionNote || null,
                submissionUrl: submissionUrl || null,
                submittedAt: new Date(),
            });
        }

        const task = await TaskService.completeTask(req.params.taskId, req.user._id);
        return res.status(200).json({
            success: true,
            message: `Task marked as Completed (on time: ${task.completedOnTime})`,
            task,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

/**
 * POST /api/tasks/rate/:taskId
 * Client rates the completed task (1–5). Triggers domain score updates.
 * Body: { rating }
 */
router.post('/rate/:taskId', protect, requireClient, async (req, res) => {
    try {
        const { rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
        }

        const task = await Task.findById(req.params.taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }
        if (task.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'Task is not yet completed' });
        }
        if (task.rating !== null) {
            return res.status(409).json({ success: false, message: 'Task has already been rated' });
        }

        // Save rating on task
        task.rating = rating;
        await task.save();

        // Apply domain-scoped performance update
        const updatedDomain = await RatingService.applyRating(
            task.selectedFreelancerId,
            task.domain,
            rating,
            task.completedOnTime
        );

        return res.status(200).json({
            success: true,
            message: 'Rating submitted and freelancer domain profile updated',
            rating,
            updatedDomainProfile: updatedDomain,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// MESSAGING ROUTES
// ─────────────────────────────────────────────
const Message = require('../models/Message');

/**
 * GET /api/tasks/:id/messages
 * Returns all messages for a specific task.
 */
router.get('/:id/messages', protect, async (req, res) => {
    try {
        console.log('[GET messages] taskId:', req.params.id, 'user:', req.user._id);
        const messages = await Message.find({ taskId: req.params.id }).sort({ createdAt: 1 });
        console.log('[GET messages] found:', messages.length, 'messages');
        return res.status(200).json({ success: true, messages });
    } catch (err) {
        console.error('[GET messages] error:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
})

/**
 * POST /api/tasks/:id/messages
 * Send a message on a task thread.
 * Access: task's clientId or selectedFreelancerId.
 */
router.post('/:id/messages', protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) {
            return res.status(400).json({ success: false, message: 'Message text is required' });
        }

        const uid = req.user._id;
        const task = await Task.findById(req.params.id).select('clientId selectedFreelancerId applicants');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        const uidStr = uid.toString();
        const isClient = task.clientId?.toString() === uidStr;
        const isFreelancer = task.selectedFreelancerId?.toString() === uidStr;
        const isApplicant = task.applicants?.some(a => a.freelancerId?.toString() === uidStr);
        if (!isClient && !isFreelancer && !isApplicant) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const msg = await Message.create({
            taskId: req.params.id,
            senderId: uid,
            senderName: req.user.name,
            senderRole: isClient ? 'client' : 'freelancer',
            text: text.trim(),
        });

        return res.status(201).json({ success: true, message: msg });
    } catch (err) {
        console.error('[POST messages]', err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
