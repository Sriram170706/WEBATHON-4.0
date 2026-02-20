const Task = require('../models/Task');

/**
 * PricingService
 * Rule-based fair pricing AI.
 * Computes a recommended budget range for a new task based on:
 *   - Domain historical averages
 *   - Duration multiplier
 *   - Difficulty factor
 */

// Difficulty multiplier map (1=Easy, 2=Medium, 3=Hard)
const DIFFICULTY_MULTIPLIER = { 1: 1.0, 2: 1.4, 3: 2.0 };

// Base rate per day (fallback if no historical data)
const BASE_RATE_PER_DAY = 500; // ₹500/day base

/**
 * Compute recommended budget range.
 * @param {Object} params
 * @param {string} params.domain
 * @param {number} params.duration  - in days
 * @param {number} params.difficulty - 1|2|3
 * @returns {{ min: number, max: number }}
 */
const computeBudgetRange = async ({ domain, duration, difficulty, clientBudget }) => {
    // Get domain avg from historical completed tasks
    const historicalData = await Task.aggregate([
        {
            $match: {
                domain: new RegExp(`^${domain}$`, 'i'),
                status: 'Completed',
                budget: { $gt: 0 },
            },
        },
        {
            $group: {
                _id: null,
                avgBudget: { $avg: '$budget' },
                count: { $sum: 1 },
            },
        },
    ]);

    const domainAvg =
        historicalData.length > 0 ? historicalData[0].avgBudget : BASE_RATE_PER_DAY * duration;

    const difficultyMultiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1.0;

    // Base calculation
    const basePricing = domainAvg * difficultyMultiplier;

    // Duration modifier: longer tasks get slight discount per day (economies of scale)
    const durationBonus = duration > 7 ? 0.9 : 1.0;
    const adjusted = basePricing * durationBonus;

    // Min/max range (±20%)
    const min = Math.round(adjusted * 0.8);
    const max = Math.round(adjusted * 1.2);

    return { min, max };
};

module.exports = { computeBudgetRange };
