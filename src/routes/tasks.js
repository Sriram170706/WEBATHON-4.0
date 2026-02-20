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
 */
router.post('/complete/:taskId', protect, requireFreelancer, async (req, res) => {
    try {
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

module.exports = router;
