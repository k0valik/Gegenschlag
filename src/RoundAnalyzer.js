/**
 * @file RoundAnalyzer.js
 * @description Analyzes round outcomes to calculate loss bonuses and rewards.
 * This module contains the core logic for CS2's economy progression.
 */

const LOSS_BONUS_PROGRESSION = [1400, 1900, 2400, 2900, 3400];
const ROUND_WIN_REWARD = 3250;
const BOMB_PLANT_REWARD = 800; // For T-side
const BOMB_DEFUSE_REWARD = 300; // For defusing CT

export class RoundAnalyzer {
    constructor() {
        // State can be managed here if needed, or by EconomyTracker
    }

    /**
     * Calculates the money each team should receive based on the round's outcome.
     * @param {string} winningTeam - The team that won ('CT' or 'T').
     * @param {number} tLossBonus - Current loss bonus level for T side.
     * @param {number} ctLossBonus - Current loss bonus level for CT side.
     * @param {boolean} bombPlanted - Whether the bomb was planted.
     * @returns {Object} An object containing rewards for each team.
     */
    calculateRoundRewards(winningTeam, tLossBonus, ctLossBonus, bombPlanted) {
        const rewards = { T: 0, CT: 0 };
        const losingTeam = winningTeam === 'T' ? 'CT' : 'T';

        // Assign win/loss rewards
        rewards[winningTeam] = ROUND_WIN_REWARD;
        const losingTeamLossBonus = losingTeam === 'T' ? tLossBonus : ctLossBonus;
        rewards[losingTeam] = LOSS_BONUS_PROGRESSION[losingTeamLossBonus];

        // Handle bomb plant bonus
        if (bombPlanted && winningTeam === 'CT') {
            // T-side still gets bonus even if they lose the round after planting
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
