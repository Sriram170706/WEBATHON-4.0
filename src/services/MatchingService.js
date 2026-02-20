const User = require('../models/User');

/**
 * MatchingService
 * Implements:
 *   - 70-30 Rookie Pool Split (per domain)
 *   - Smart Applicant Limiter (Top 10: 7 experienced + 3 rookie)
 *   - Beginner boost weight
 *   - FinalScore calculation
 */

const TOP_EXPERIENCED = 7;
const TOP_ROOKIE = 3;

/**
 * Given a list of applicant sub-docs and a domain name,
 * return up to 10 ranked applicants (7 experienced + 3 rookie).
 *
 * @param {Array}  applicants   - task.applicants array
 * @param {string} domain       - task domain
 * @returns {Array} sorted, trimmed list of enriched applicant objects
 */
const getTop10Applicants = async (applicants, domain) => {
    if (!applicants || applicants.length === 0) return [];

    // Fetch full user records for all applicants
    const freelancerIds = applicants.map((a) => a.freelancerId);
    const users = await User.find({ _id: { $in: freelancerIds } });

    // Build a map for quick lookup
    const userMap = {};
    users.forEach((u) => {
        userMap[u._id.toString()] = u;
    });

    // Enrich each applicant with their domain profile and compute FinalScore
    const enriched = applicants.map((app) => {
        const user = userMap[app.freelancerId.toString()];
        if (!user) return null;

        const domainProfile = user.getDomain(domain);
        if (!domainProfile) return null; // Not registered in this domain

        const finalScore = computeFinalScore(domainProfile, app.availabilityStatus);

        return {
            freelancerId: user._id,
            name: user.name,
            email: user.email,
            domainProfile,
            availabilityStatus: app.availabilityStatus,
            appliedAt: app.appliedAt,
            finalScore,
            isRookie: domainProfile.level === 1,
            isBeginner: domainProfile.completedTasks < 3,
        };
    }).filter(Boolean);

    // Split into experienced (level >= 2) and rookie (level == 1) pools
    const experiencedPool = enriched.filter((a) => !a.isRookie);
    const rookiePool = enriched.filter((a) => a.isRookie);

    // Sort each pool by FinalScore descending
    experiencedPool.sort((a, b) => b.finalScore - a.finalScore);
    rookiePool.sort((a, b) => b.finalScore - a.finalScore);

    // Apply 70-30 logic even when pool sizes are small
    const topExperienced = experiencedPool.slice(0, TOP_EXPERIENCED);
    const topRookie = rookiePool.slice(0, TOP_ROOKIE);

    // Merge and return
    const top10 = [...topExperienced, ...topRookie];

    return top10;
};

/**
 * Compute the final ranking score for an applicant.
 *
 * FinalScore = (0.4 × qualityScore_normalized)
 *            + (0.3 × reliabilityScore_normalized)
 *            + (0.2 × skillMatchScore)
 *            + (0.1 × availabilityScore)
 *
 * qualityScore   is 0–5  → normalize to 0–100
 * reliabilityScore is already 0–100
 * skillMatchScore: beginner boost adds +10 if boost active, else 0
 * availabilityScore: 100 if available, 50 if busy
 */
const computeFinalScore = (domainProfile, availabilityStatus) => {
    const qualityNorm = (domainProfile.qualityScore / 5) * 100;
    const reliabilityNorm = domainProfile.reliabilityScore;

    // Skill match score: higher level = higher implicit skill match
    // Level1=40, Level2=60, Level3=80, Level4=100
    const levelSkillMap = { 1: 40, 2: 60, 3: 80, 4: 100 };
    let skillMatchScore = levelSkillMap[domainProfile.level] || 40;

    // Beginner boost: if boost is still active, add +15 to skill match
    const now = new Date();
    if (domainProfile.beginnerBoostExpiresAt > now) {
        skillMatchScore = Math.min(100, skillMatchScore + 15);
    }

    const availabilityScore = availabilityStatus === 'available' ? 100 : 50;

    const finalScore =
        0.4 * qualityNorm +
        0.3 * reliabilityNorm +
        0.2 * skillMatchScore +
        0.1 * availabilityScore;

    return Math.round(finalScore * 100) / 100;
};

module.exports = { getTop10Applicants, computeFinalScore };
