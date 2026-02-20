const Task = require('../models/Task');
const PricingService = require('./PricingService');

/**
 * TaskService
 * Handles task creation, listing, and application logic.
 */

/**
 * Create a new task (client only).
 * Computes recommendedBudgetRange via PricingService.
 */
const createTask = async (clientId, taskData) => {
    const { title, description, segment, domain, duration, budget, difficulty = 1 } = taskData;

    // Compute recommended budget range
    const recommendedBudgetRange = await PricingService.computeBudgetRange({
        domain,
        duration,
        difficulty,
        clientBudget: budget,
    });

    const task = new Task({
        title,
        description,
        segment,
        domain,
        duration,
        budget,
        difficulty,
        recommendedBudgetRange,
        clientId,
    });

    await task.save();
    return task;
};

/**
 * Get all open tasks available for a freelancer.
 * Optionally filters by domain.
 */
const getAvailableTasks = async ({ domain } = {}) => {
    const query = { status: 'Open' };
    if (domain) query.domain = new RegExp(`^${domain}$`, 'i');
    return Task.find(query).populate('clientId', 'name email').sort({ createdAt: -1 });
};

/**
 * Get tasks created by a specific client.
 */
const getClientTasks = async (clientId) => {
    return Task.find({ clientId }).sort({ createdAt: -1 });
};

/**
 * Apply to a task.
 * Enforces:
 *   - Task must be Open
 *   - No duplicate applications
 *   - Company Zone: level >= 3, qualityScore >= 4, reliabilityScore >= 85
 */
const applyToTask = async (taskId, freelancer, availabilityStatus = 'available') => {
    const task = await Task.findById(taskId);
    if (!task) {
        const err = new Error('Task not found');
        err.statusCode = 404;
        throw err;
    }

    if (task.status !== 'Open') {
        const err = new Error('This task is no longer accepting applications');
        err.statusCode = 400;
        throw err;
    }

    // Duplicate application check
    const alreadyApplied = task.applicants.some(
        (a) => a.freelancerId.toString() === freelancer._id.toString()
    );
    if (alreadyApplied) {
        const err = new Error('You have already applied to this task');
        err.statusCode = 409;
        throw err;
    }

    // Company Zone validation
    if (task.segment === 'Company') {
        const domainProfile = freelancer.getDomain(task.domain);
        if (!domainProfile) {
            const err = new Error(`You are not registered in the domain: ${task.domain}`);
            err.statusCode = 403;
            throw err;
        }
        if (
            domainProfile.level < 3 ||
            domainProfile.qualityScore < 4 ||
            domainProfile.reliabilityScore < 85
        ) {
            const err = new Error(
                'Company Zone requires Level >= 3, Quality Score >= 4, and Reliability >= 85% in this domain'
            );
            err.statusCode = 403;
            throw err;
        }
    }

    // Freelancer must be registered in the task domain (for Individual too)
    const domainProfile = freelancer.getDomain(task.domain);
    if (!domainProfile) {
        const err = new Error(`You are not registered in the domain: ${task.domain}`);
        err.statusCode = 403;
        throw err;
    }

    task.applicants.push({
        freelancerId: freelancer._id,
        availabilityStatus,
    });

    await task.save();
    return task;
};

/**
 * Client selects a freelancer for a task.
 */
const selectFreelancer = async (taskId, clientId, freelancerId) => {
    const task = await Task.findById(taskId);
    if (!task) {
        const err = new Error('Task not found');
        err.statusCode = 404;
        throw err;
    }
    if (task.clientId.toString() !== clientId.toString()) {
        const err = new Error('Unauthorized');
        err.statusCode = 403;
        throw err;
    }
    if (task.status !== 'Open') {
        const err = new Error('Task is already in progress or completed');
        err.statusCode = 400;
        throw err;
    }

    const applied = task.applicants.some(
        (a) => a.freelancerId.toString() === freelancerId.toString()
    );
    if (!applied) {
        const err = new Error('This freelancer has not applied for the task');
        err.statusCode = 400;
        throw err;
    }

    task.selectedFreelancerId = freelancerId;
    task.status = 'InProgress';
    await task.save();

    // Increment totalAssigned on the freelancer's domain
    const User = require('../models/User');
    const freelancer = await User.findById(freelancerId);
    if (freelancer) {
        const domainProfile = freelancer.getDomain(task.domain);
        if (domainProfile) {
            domainProfile.totalAssigned += 1;
            await freelancer.save();
        }
    }

    return task;
};

/**
 * Freelancer marks task as completed.
 * Determines whether it was on-time.
 */
const completeTask = async (taskId, freelancerId) => {
    const task = await Task.findById(taskId);
    if (!task) {
        const err = new Error('Task not found');
        err.statusCode = 404;
        throw err;
    }
    if (task.selectedFreelancerId.toString() !== freelancerId.toString()) {
        const err = new Error('Unauthorized – you are not the selected freelancer');
        err.statusCode = 403;
        throw err;
    }
    if (task.status !== 'InProgress') {
        const err = new Error('Task is not in progress');
        err.statusCode = 400;
        throw err;
    }

    const now = new Date();
    task.completedOnTime = now <= task.deadline;
    task.status = 'Completed';
    await task.save();

    return task;
};

module.exports = { createTask, getAvailableTasks, getClientTasks, applyToTask, selectFreelancer, completeTask };
