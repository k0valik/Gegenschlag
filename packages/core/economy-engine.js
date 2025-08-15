/**
 * CS2 Economy Helper - Economy Engine
 * Advanced economy tracking system with confidence scoring and team synchronization
 * 
 * @performance Target: <5ms per event processing, 95%+ accuracy
 * @author CS2 Strategic Team
 */

class EconomyEngine {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.isActive = false;
        this.currentMatch = null;
        this.currentRound = 0;

        // Player tracking
        this.players = new Map(); // steamId -> PlayerEconomyState
        this.teams = {
            [TEAMS.CT]: new Set(),
            [TEAMS.T]: new Set()
        };

        // Round history for calculations
        this.roundHistory = [];
        this.killEvents = [];

        // Performance monitoring
        this.calculationTimes = [];

        this.bindEvents();
    }

    /**
     * Bind to relevant game events
     */
    bindEvents() {
        this.eventBus.on('game:roster_update', (data) => {
            this.updateRoster(data);
        });

        this.eventBus.on('game:round_start', (data) => {
            this.processRoundStart(data);
        });
    }

    /**
     * Start tracking for a new match
     * @param {Object} matchInfo - Match information
     */
    startNewMatch(matchInfo) {
        console.log('[Economy] Starting new match:', matchInfo);

        this.currentMatch = matchInfo;
        this.currentRound = 0;
        this.players.clear();
        this.teams[TEAMS.CT].clear();
        this.teams[TEAMS.T].clear();
        this.roundHistory = [];
        this.killEvents = [];
        this.isActive = true;

        this.eventBus.emit(EVENT_TYPES.ECONOMY_RESET);
    }

    /**
     * Update player roster information
     * @param {Object} rosterData - Roster update data
     */
    updateRoster(rosterData) {
        if (!this.isActive) return;

        for (const [key, playerData] of Object.entries(rosterData)) {
            if (!key.startsWith('roster_')) continue;

            const player = JSON.parse(playerData);
            const steamId = player.steamid;
            const team = player.team;

            if (!steamId || !team) continue;

            // Initialize player if not exists
            if (!this.players.has(steamId)) {
                this.players.set(steamId, this.createPlayerState(steamId, player));
            }

            // Update team assignments
            this.updateTeamAssignments(steamId, team);

            // Update player info
            const playerState = this.players.get(steamId);
            playerState.nickname = player.nickname;
            playerState.isLocal = player.is_local === 'true';

            // Update known money if available
            if (player.money !== undefined && player.is_local === 'true') {
                this.updatePlayerMoney(steamId, parseInt(player.money), 100);
            }
        }
    }

    /**
     * Create initial player economy state
     * @param {string} steamId - Player Steam ID
     * @param {Object} playerInfo - Player information
     * @returns {Object} Player economy state
     */
    createPlayerState(steamId, playerInfo) {
        const isFirstRound = this.currentRound <= 1;
        const startingMoney = isFirstRound ? 
            ECONOMY_CONSTANTS.STARTING_MONEY.PISTOL_ROUND : 
            ECONOMY_CONSTANTS.STARTING_MONEY.NORMAL_ROUND;

        return {
            steamId,
            nickname: playerInfo.nickname || 'Unknown',
            team: playerInfo.team,
            isLocal: playerInfo.is_local === 'true',

            // Money estimation
            minMoney: startingMoney,
            maxMoney: startingMoney,
            medianEstimate: startingMoney,
            confidence: isFirstRound ? 100 : 60,

            // Tracking data
            lastSeenWeapons: [],
            lastSeenArmor: false,
            lastSeenUtilities: [],

            // Round statistics
            roundKills: 0,
            roundDeaths: 0,
            survivalBonus: false,
            objectiveBonuses: 0,

            // History
            moneyHistory: [{ round: this.currentRound, money: startingMoney, confidence: isFirstRound ? 100 : 60 }],

            // Loss tracking
            consecutiveLosses: 0,
            lastRoundResult: null
        };
    }

    /**
     * Update team assignments for a player
     * @param {string} steamId - Player Steam ID
     * @param {string} team - Team designation
     */
    updateTeamAssignments(steamId, team) {
        // Remove from all teams first
        this.teams[TEAMS.CT].delete(steamId);
        this.teams[TEAMS.T].delete(steamId);

        // Add to correct team
        if (team === TEAMS.CT || team === TEAMS.T) {
            this.teams[team].add(steamId);
        }
    }

    /**
     * Process round start event
     * @param {Object} data - Round start data
     */
    processRoundStart(data) {
        if (!this.isActive) return;

        this.currentRound++;
        console.log(`[Economy] Round ${this.currentRound} started`);

        // Reset round-specific data
        for (const [steamId, player] of this.players) {
            player.roundKills = 0;
            player.roundDeaths = 0;
            player.survivalBonus = false;
            player.objectiveBonuses = 0;
        }

        this.killEvents = [];

        // Apply freeze time weapon tracking if needed
        this.trackFreezetimeEquipment();
    }

    /**
     * Process kill feed event
     * @param {Object} killData - Kill event data
     * @performance <5ms processing time
     */
    processKillFeedEvent(killData) {
        if (!this.isActive) return;

        const startTime = performance.now();

        try {
            const event = JSON.parse(killData);
            this.killEvents.push(event);

            // Process attacker rewards
            if (event.attacker && !event.suicide) {
                this.processKillReward(event);
            }

            // Process death penalty (none in CS2 but track for statistics)
            if (event.victim) {
                this.processPlayerDeath(event.victim);
            }

            // Emit update
            this.emitEconomyUpdate();

        } catch (error) {
            console.error('[Economy] Error processing kill feed:', error);
        }

        // Performance tracking
        const processingTime = performance.now() - startTime;
        this.calculationTimes.push(processingTime);

        if (processingTime > PERFORMANCE_CONFIG.EVENT_PROCESSING_TIMEOUT) {
            console.warn(`[Economy] Slow kill feed processing: ${processingTime}ms`);
        }
    }

    /**
     * Process kill reward for attacker
     * @param {Object} event - Kill event
     */
    processKillReward(event) {
        const attackerPlayer = this.findPlayerByName(event.attacker);
        if (!attackerPlayer) return;

        const weapon = event.weapon;
        const reward = ECONOMY_CONSTANTS.KILL_REWARDS[weapon] || 300;

        // Update money estimation
        attackerPlayer.minMoney += reward;
        attackerPlayer.maxMoney += reward;
        attackerPlayer.medianEstimate += reward;
        attackerPlayer.roundKills++;

        // Cap at maximum money
        attackerPlayer.minMoney = Math.min(attackerPlayer.minMoney, ECONOMY_CONSTANTS.MAX_MONEY);
        attackerPlayer.maxMoney = Math.min(attackerPlayer.maxMoney, ECONOMY_CONSTANTS.MAX_MONEY);
        attackerPlayer.medianEstimate = Math.min(attackerPlayer.medianEstimate, ECONOMY_CONSTANTS.MAX_MONEY);

        console.log(`[Economy] ${event.attacker} earned $${reward} for kill with ${weapon}`);
    }

    /**
     * Process player death
     * @param {string} victimName - Name of player who died
     */
    processPlayerDeath(victimName) {
        const victimPlayer = this.findPlayerByName(victimName);
        if (!victimPlayer) return;

        victimPlayer.roundDeaths++;
        victimPlayer.survivalBonus = false; // Won't get survival bonus

        // Reduce equipment value confidence (they might drop weapons)
        if (victimPlayer.confidence > 50) {
            victimPlayer.confidence = Math.max(50, victimPlayer.confidence - 10);
        }
    }

    /**
     * Process round end event
     * @param {Object} roundData - Round end data
     */
    processRoundEndEvent(roundData) {
        if (!this.isActive) return;

        console.log('[Economy] Processing round end:', roundData);

        try {
            const roundResult = JSON.parse(roundData);
            this.processRoundEconomics(roundResult);

            // Store round history
            this.roundHistory.push({
                round: this.currentRound,
                winner: roundResult.win_team,
                events: [...this.killEvents],
                timestamp: Date.now()
            });

            // Limit history size for memory management
            if (this.roundHistory.length > PERFORMANCE_CONFIG.MAX_ROUND_HISTORY) {
                this.roundHistory.shift();
            }

            this.emitEconomyUpdate();

        } catch (error) {
            console.error('[Economy] Error processing round end:', error);
        }
    }

    /**
     * Process round economics for all players
     * @param {Object} roundResult - Round result data
     */
    processRoundEconomics(roundResult) {
        const winningTeam = roundResult.win_team;

        for (const [steamId, player] of this.players) {
            const isWinner = player.team === winningTeam;

            if (isWinner) {
                this.applyWinBonus(player, roundResult);
                player.consecutiveLosses = 0;
            } else {
                this.applyLossBonus(player);
                player.consecutiveLosses = Math.min(player.consecutiveLosses + 1, ECONOMY_CONSTANTS.MAX_CONSECUTIVE_LOSSES);
            }

            // Apply survival bonus (none in CS2, but track for future)
            if (player.survivalBonus) {
                this.applySurvivalBonus(player);
            }

            // Update money history
            player.moneyHistory.push({
                round: this.currentRound,
                money: player.medianEstimate,
                confidence: player.confidence
            });

            player.lastRoundResult = isWinner ? 'win' : 'loss';
        }
    }

    /**
     * Apply win bonus to player
     * @param {Object} player - Player state
     * @param {Object} roundResult - Round result details
     */
    applyWinBonus(player, roundResult) {
        let bonus = ECONOMY_CONSTANTS.WIN_BONUS.ELIMINATION; // Default

        // Determine win type bonus
        if (roundResult.reason === 'bomb_defused') {
            bonus = ECONOMY_CONSTANTS.WIN_BONUS.BOMB_DEFUSED;
        } else if (roundResult.reason === 'bomb_exploded') {
            bonus = ECONOMY_CONSTANTS.WIN_BONUS.BOMB_EXPLODED;
        } else if (roundResult.reason === 'time_expired') {
            bonus = ECONOMY_CONSTANTS.WIN_BONUS.TIME_EXPIRED;
        }

        // Apply bonus
        player.minMoney += bonus;
        player.maxMoney += bonus;
        player.medianEstimate += bonus;

        // Add objective bonuses
        player.minMoney += player.objectiveBonuses;
        player.maxMoney += player.objectiveBonuses;
        player.medianEstimate += player.objectiveBonuses;

        // Cap at maximum
        player.minMoney = Math.min(player.minMoney, ECONOMY_CONSTANTS.MAX_MONEY);
        player.maxMoney = Math.min(player.maxMoney, ECONOMY_CONSTANTS.MAX_MONEY);
        player.medianEstimate = Math.min(player.medianEstimate, ECONOMY_CONSTANTS.MAX_MONEY);

        console.log(`[Economy] ${player.nickname} win bonus: $${bonus} + $${player.objectiveBonuses} objectives`);
    }

    /**
     * Apply loss bonus to player
     * @param {Object} player - Player state
     */
    applyLossBonus(player) {
        const lossBonus = ECONOMY_CONSTANTS.LOSS_BONUS[player.consecutiveLosses] || ECONOMY_CONSTANTS.LOSS_BONUS[4];

        player.minMoney += lossBonus;
        player.maxMoney += lossBonus;
        player.medianEstimate += lossBonus;

        // Cap at maximum
        player.minMoney = Math.min(player.minMoney, ECONOMY_CONSTANTS.MAX_MONEY);
        player.maxMoney = Math.min(player.maxMoney, ECONOMY_CONSTANTS.MAX_MONEY);
        player.medianEstimate = Math.min(player.medianEstimate, ECONOMY_CONSTANTS.MAX_MONEY);

        console.log(`[Economy] ${player.nickname} loss bonus (${player.consecutiveLosses + 1} losses): $${lossBonus}`);
    }

    /**
     * Apply survival bonus (CS2 doesn't have this, but kept for compatibility)
     * @param {Object} player - Player state
     */
    applySurvivalBonus(player) {
        // CS2 removed survival bonus, but method kept for potential future use
        const bonus = ECONOMY_CONSTANTS.SURVIVAL_BONUS;
        if (bonus > 0) {
            player.minMoney += bonus;
            player.maxMoney += bonus;
            player.medianEstimate += bonus;
        }
    }

    /**
     * Track equipment during freezetime for better estimates
     */
    trackFreezetimeEquipment() {
        // This would integrate with weapon detection from GEP
        // For now, we'll track what we can see from game state updates
    }

    /**
     * Update player money with direct observation
     * @param {string} steamId - Player Steam ID
     * @param {number} money - Observed money amount
     * @param {number} confidence - Confidence level (0-100)
     */
    updatePlayerMoney(steamId, money, confidence) {
        const player = this.players.get(steamId);
        if (!player) return;

        player.minMoney = money;
        player.maxMoney = money;
        player.medianEstimate = money;
        player.confidence = confidence;

        console.log(`[Economy] Direct money update: ${player.nickname} = $${money} (${confidence}% confidence)`);
    }

    /**
     * Find player by in-game name
     * @param {string} name - Player name
     * @returns {Object|null} Player state or null
     */
    findPlayerByName(name) {
        for (const [steamId, player] of this.players) {
            if (player.nickname === name) {
                return player;
            }
        }
        return null;
    }

    /**
     * Generate current economy snapshot
     * @returns {Object} Economy snapshot
     */
    generateSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            round: this.currentRound,
            matchId: this.currentMatch?.id,
            teams: {}
        };

        // Group players by team
        for (const team of [TEAMS.CT, TEAMS.T]) {
            snapshot.teams[team] = Array.from(this.teams[team])
                .map(steamId => this.players.get(steamId))
                .filter(player => player)
                .map(player => ({
                    steamId: player.steamId,
                    nickname: player.nickname,
                    isLocal: player.isLocal,
                    minMoney: Math.round(player.minMoney / 50) * 50, // Round to $50
                    maxMoney: Math.round(player.maxMoney / 50) * 50,
                    medianEstimate: Math.round(player.medianEstimate / 50) * 50,
                    confidence: Math.round(player.confidence),
                    consecutiveLosses: player.consecutiveLosses,
                    roundKills: player.roundKills,
                    roundDeaths: player.roundDeaths
                }));
        }

        return snapshot;
    }

    /**
     * Get current economy state
     * @returns {Object|null} Current state or null if inactive
     */
    getCurrentState() {
        if (!this.isActive) return null;
        return this.generateSnapshot();
    }

    /**
     * Emit economy update to listeners
     */
    emitEconomyUpdate() {
        const snapshot = this.generateSnapshot();
        this.eventBus.emit(EVENT_TYPES.ECONOMY_UPDATE, snapshot, { async: true });
    }

    /**
     * End current match
     */
    endMatch() {
        console.log('[Economy] Match ended');
        this.isActive = false;
        this.currentMatch = null;
        this.eventBus.emit(EVENT_TYPES.ECONOMY_RESET);
    }

    /**
     * Reset all economy data
     */
    reset() {
        console.log('[Economy] Resetting all data');
        this.isActive = false;
        this.currentMatch = null;
        this.currentRound = 0;
        this.players.clear();
        this.teams[TEAMS.CT].clear();
        this.teams[TEAMS.T].clear();
        this.roundHistory = [];
        this.killEvents = [];
        this.calculationTimes = [];

        this.eventBus.emit(EVENT_TYPES.ECONOMY_RESET);
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance metrics
     */
    getPerformanceStats() {
        const avgCalculationTime = this.calculationTimes.length > 0 
            ? this.calculationTimes.reduce((a, b) => a + b, 0) / this.calculationTimes.length 
            : 0;

        return {
            avgCalculationTime,
            totalCalculations: this.calculationTimes.length,
            playersTracked: this.players.size,
            roundsTracked: this.roundHistory.length,
            memoryEstimate: this.estimateMemoryUsage()
        };
    }

    /**
     * Estimate memory usage
     * @returns {number} Estimated memory usage in bytes
     */
    estimateMemoryUsage() {
        const playerSize = 500; // Estimated bytes per player
        const roundSize = 200; // Estimated bytes per round history entry

        return (this.players.size * playerSize) + (this.roundHistory.length * roundSize);
    }

    /**
     * Dispose of the economy engine
     */
    dispose() {
        console.log('[Economy] Disposing economy engine');
        this.reset();
        this.eventBus = null;
    }
}

// Export for environments that support it
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EconomyEngine;
}