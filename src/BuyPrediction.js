/**
 * @file BuyPrediction.js
 * @description Predicts enemy buy patterns (eco, force, full buy) based on their estimated economy.
 */

export class BuyPrediction {
    constructor() {
        // Thresholds for buy types, can be tuned
        this.FULL_BUY_THRESHOLD = 4000;
        this.FORCE_BUY_THRESHOLD = 2000;
    }

    /**
     * Predicts the most likely buy type for a given team.
     * @param {number} teamMoney - The estimated total money of the team.
     * @param {number} numPlayers - The number of players on the team.
     * @returns {string} The predicted buy type: 'Full Buy', 'Force Buy', or 'Eco'.
     */
    predictBuyType(teamMoney, numPlayers = 5) {
        const averageMoneyPerPlayer = teamMoney / numPlayers;

        if (averageMoneyPerPlayer >= this.FULL_BUY_THRESHOLD) {
            return 'Full Buy';
        } else if (averageMoneyPerPlayer >= this.FORCE_BUY_THRESHOLD) {
            return 'Force Buy';
        } else {
            return 'Eco';
        }
    }

    /**
     * Provides a more detailed prediction of what a team might buy.
     * @param {number} teamMoney - The estimated total money of the team.
     * @returns {Object} A detailed breakdown of a potential buy.
     */
    getDetailedPrediction(teamMoney) {
        const buyType = this.predictBuyType(teamMoney);
        let prediction = {
            buyType: buyType,
            primary_weapon_suggestion: 'None',
            utility_suggestion: 'None'
        };

        switch (buyType) {
            case 'Full Buy':
                prediction.primary_weapon_suggestion = 'AK-47 / M4A4';
                prediction.utility_suggestion = 'Full utility (smokes, flashes, etc.)';
                break;
            case 'Force Buy':
                prediction.primary_weapon_suggestion = 'SMG (e.g., MAC-10, MP9) or Deagle';
                prediction.utility_suggestion = 'Limited utility';
                break;
            case 'Eco':
                prediction.primary_weapon_suggestion = 'Pistol upgrade (e.g., P250)';
                prediction.utility_suggestion = 'No utility';
                break;
        }

        return prediction;
    }
}
