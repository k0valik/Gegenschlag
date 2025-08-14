/**
 * @file RoundAnalyzer.js
 * @description Analyzes round outcomes to calculate loss bonuses and rewards.
 * This module contains the core logic for CS2's economy progression.
 */

const LOSS_BONUS_PROGRESSION = [1400, 1900, 2400, 2900, 3400];
const ROUND_WIN_BASE_REWARD = 3250;
const ROUND_WIN_OBJECTIVE_REWARD = 250;
const BOMB_PLANT_REWARD = 800; // For T-side players, awarded at end of round

export class RoundAnalyzer {
    constructor() {
        // This class is stateless and contains pure functions.
    }

    /**
     * Calculates the money each team should receive based on the round's outcome.
     * @param {string} winningTeam - The team that won ('CT' or 'T').
     * @param {string} roundEndReason - e.g., 'elimination', 'bomb_defused', 'bomb_exploded', 'time_out'.
     * @param {number} tLossBonus - Current loss bonus level for T side (0-4).
     * @param {number} ctLossBonus - Current loss bonus level for CT side (0-4).
     * @returns {Object} An object containing total rewards for each team.
     */
    calculateRoundRewards(winningTeam, roundEndReason, tLossBonus, ctLossBonus) {
        const rewards = { T: 0, CT: 0 };
        const losingTeam = winningTeam === 'T' ? 'CT' : 'T';

        const losingTeamLossBonus = losingTeam === 'T' ? tLossBonus : ctLossBonus;
        rewards[losingTeam] = LOSS_BONUS_PROGRESSION[losingTeamLossBonus];

        // Determine winner's reward
        let winnerReward = ROUND_WIN_BASE_REWARD;
        if (['bomb_defused', 'bomb_exploded'].includes(roundEndReason)) {
            winnerReward += ROUND_WIN_OBJECTIVE_REWARD;
        }
        rewards[winningTeam] = winnerReward;

        // Handle bomb plant bonus for Terrorists
        // This is awarded to the team if the bomb was planted, regardless of round outcome.
        const bombWasPlanted = roundEndReason === 'bomb_exploded' || roundEndReason === 'bomb_defused';
        if (bombWasPlanted) {
            rewards.T += BOMB_PLANT_REWARD;
        }

        return rewards;
    }

    /**
     * Updates the loss bonus counters for each team.
     * @param {string} winningTeam - The team that won ('CT' or 'T').
     * @param {number} tLossBonus - Current loss bonus level for T side.
     * @param {number} ctLossBonus - Current loss bonus level for CT side.
     * @returns {Object} The new loss bonus levels for each team.
     */
    updateLossBonuses(winningTeam, tLossBonus, ctLossBonus) {
        const newBonuses = { T: tLossBonus, CT: ctLossBonus };
        const losingTeam = winningTeam === 'T' ? 'CT' : 'T';

        // Reset winning team's loss bonus
        newBonuses[winningTeam] = 0;
        // Increment losing team's loss bonus
        newBonuses[losingTeam] = Math.min(newBonuses[losingTeam] + 1, LOSS_BONUS_PROGRESSION.length - 1);

        return newBonuses;
    }
}
