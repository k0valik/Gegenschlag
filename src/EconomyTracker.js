/**
 * @file EconomyTracker.js
 * @description Manages the real-time economic state of both teams in a CS2 match.
 * It tracks player money, team economy, and equipment value.
 */

import { WEAPON_DATA } from './WeaponValues.js';
import { RoundAnalyzer } from './RoundAnalyzer.js';

class Player {
    constructor(name, steamId) {
        this.name = name;
        this.steamId = steamId;
        this.money = 800; // Starting money
        this.equipment = [];
        this.kills = 0;
    }
}

export class EconomyTracker {
    constructor() {
        this.roundAnalyzer = new RoundAnalyzer();
        this.reset();
    }

    /**
     * Resets the tracker to its initial state for a new match.
     */
    reset() {
        this.teams = {
            'T': { players: new Map(), lossBonus: 0 },
            'CT': { players: new Map(), lossBonus: 0 }
        };
        this.roundNumber = 0;
    }

    /**
     * Initializes player states at the beginning of a match.
     * @param {Array<Object>} roster - A list of player objects, e.g., [{name: 'Player1', steamId: '...', team: 'CT'}]
     */
    initializePlayers(roster) {
        this.reset();
        roster.forEach(p => {
            const player = new Player(p.name, p.steamId);
            this.teams[p.team].players.set(p.steamId, player);
        });
    }

    /**
     * Handles the end of a round, updating money and loss bonuses.
     * @param {string} winningTeam - The team that won ('CT' or 'T').
     * @param {string} roundEndReason - e.g., 'elimination', 'bomb_defused'.
     */
    handleRoundEnd(winningTeam, roundEndReason) {
        this.roundNumber++;
        const rewards = this.roundAnalyzer.calculateRoundRewards(
            winningTeam,
            roundEndReason,
            this.teams['T'].lossBonus,
            this.teams['CT'].lossBonus
        );

        // Add rewards to each player's money
        for (const [team, teamData] of Object.entries(this.teams)) {
            const teamReward = rewards[team] / teamData.players.size;
            teamData.players.forEach(player => {
                player.money += teamReward;
            });
        }

        const newBonuses = this.roundAnalyzer.updateLossBonuses(
            winningTeam,
            this.teams['T'].lossBonus,
            this.teams['CT'].lossBonus
        );
        this.teams['T'].lossBonus = newBonuses.T;
        this.teams['CT'].lossBonus = newBonuses.CT;
    }

    /**
     * Tracks a kill event and updates the killer's money.
     * @param {string} killerSteamId - The Steam ID of the player who got the kill.
     * @param {string} weapon - The weapon used for the kill.
     */
    trackKill(killerSteamId, weapon) {
        const reward = WEAPON_DATA[weapon]?.kill_reward || 300;

        for (const teamData of Object.values(this.teams)) {
            if (teamData.players.has(killerSteamId)) {
                const killer = teamData.players.get(killerSteamId);
                killer.money += reward;
                killer.kills++;
                break;
            }
        }
    }

    /**
     * Gets the current economic state of a specific team.
     * @param {string} team - The team to get the state for ('CT' or 'T').
     * @returns {Object} The economic state of the team.
     */
    getTeamState(team) {
        const teamData = this.teams[team];
        const totalMoney = Array.from(teamData.players.values()).reduce((sum, p) => sum + p.money, 0);
        return {
            totalMoney: totalMoney,
            lossBonus: teamData.lossBonus,
            players: Array.from(teamData.players.values())
        };
    }
}
