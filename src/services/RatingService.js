const User = require('../models/User');

/**
 * RatingService
 * Handles domain-specific performance updates after task completion.
 * All updates are scoped to the domain of the completed task.
 */

/**
 * Apply a client rating to a freelancer's domain profile.
 *
 * @param {string} freelancerId
 * @param {string} domain       - domain name of the completed task
 * @param {number} rating       - 1–5 star rating from client
 * @param {boolean} onTime      - whether the task was completed on time
 * @returns {Object} updated domain profile
 */
const applyRating = async (freelancerId, domain, rating, onTime) => {
    const user = await User.findById(freelancerId);
    if (!user) {
        const err = new Error('Freelancer not found');
        err.statusCode = 404;
        throw err;
    }

    const domainProfile = user.getDomain(domain);
    if (!domainProfile) {
        const err = new Error(`Freelancer is not registered in domain: ${domain}`);
        err.statusCode = 400;
        throw err;
    }

    // ── 1. Update completedTasks & rating sum ──────────────────────────────
    domainProfile.completedTasks += 1;
    domainProfile.ratingSum += rating;

    // ── 2. Quality Score = average of all ratings ─────────────────────────
    domainProfile.qualityScore =
        Math.round((domainProfile.ratingSum / domainProfile.completedTasks) * 100) / 100;

    // ── 3. onTimeCompletions counter ──────────────────────────────────────
    if (onTime) {
        domainProfile.onTimeCompletions += 1;
    }

    // ── 4. Reliability Score = (onTime / totalAssigned) × 100 ────────────
    // totalAssigned is incremented when freelancer is selected (in TaskService)
    const assignedCount = domainProfile.totalAssigned || domainProfile.completedTasks;
    domainProfile.reliabilityScore =
        Math.round((domainProfile.onTimeCompletions / assignedCount) * 100 * 100) / 100;

    // ── 5. Level progression ──────────────────────────────────────────────
    domainProfile.level = calculateLevel(domainProfile);

    await user.save();

    return domainProfile;
};

/**
 * Determine level based on completed tasks, quality, and reliability.
 * Level 1 → Level 2: completedTasks >= 5
 * Level 2 → Level 3: completedTasks >= 15 AND quality >= 4 AND reliability >= 85
 * Level 3 → Level 4: completedTasks >= 30 AND quality >= 4.5 AND reliability >= 90
 */
const calculateLevel = (domainProfile) => {
    const { completedTasks, qualityScore, reliabilityScore } = domainProfile;

    if (
        completedTasks >= 30 &&
        qualityScore >= 4.5 &&
        reliabilityScore >= 90
    ) {
        return 4;
    }
    if (
        completedTasks >= 15 &&
        qualityScore >= 4 &&
        reliabilityScore >= 85
    ) {
        return 3;
    }
    if (completedTasks >= 5) {
        return 2;
    }
    return 1;
};

module.exports = { applyRating, calculateLevel };
