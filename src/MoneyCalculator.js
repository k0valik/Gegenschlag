/**
 * @file MoneyCalculator.js
 * @description Engine for estimating the total money pool of a team.
 * This class works with the EconomyTracker to provide high-level estimates.
 */

export class MoneyCalculator {
    constructor(economyTracker) {
        this.economyTracker = economyTracker;
    }

    /**
     * Estimates the total current money for a given team.
     * @param {string} team - The team to calculate money for ('CT' or 'T').
     * @returns {number} The estimated total money for the team.
     */
    estimateTeamMoney(team) {
        const teamData = this.economyTracker.getTeamEconomy(team);
        if (!teamData || !teamData.players) {
            return 0;
        }

        // This is a simplified estimation. A more complex model would track individual player money.
        return teamData.players.reduce((total, player) => total + player.money, 0);
    }

    /**
     * Calculates the value of a team's current equipment.
     * @param {string} team - The team to calculate equipment value for ('CT' or 'T').
     * @returns {number} The total value of the team's equipment.
     */
    calculateEquipmentValue(team) {
        const teamData = this.economyTracker.getTeamEconomy(team);
        if (!teamData || !teamData.players) {
            return 0;
        }

        return teamData.players.reduce((total, player) => {
            // This assumes player objects have an 'equipment' array
            const playerEquipmentValue = player.equipment.reduce((playerTotal, item) => {
                return playerTotal + (WEAPON_DATA[item]?.cost || 0);
            }, 0);
            return total + playerEquipmentValue;
        }, 0);
    }
}
