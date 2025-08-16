import { KILL_REWARDS, LOSS_BONUS_STREAK, MAX_MONEY, PISTOL_ROUND_LOSS_BONUS, ROUND_WIN_REWARDS, STARTING_MONEY, WEAPON_CLASSES } from '../constants/economy';

export interface PlayerState {
    id: string;
    name: string;
    money: number;
    lossStreak: number;
    isAlive: boolean;
}

export interface TeamState {
    players: Map<string, PlayerState>;
    teamLossStreak: number;
}

const BOMB_PLANT_BONUS = 300;

class EconomyCalculatorService {
    private TState: TeamState;
    private CTState: TeamState;

    constructor() {
        this.TState = { players: new Map(), teamLossStreak: 0 };
        this.CTState = { players: new Map(), teamLossStreak: 0 };
    }

    public initializePlayer(id: string, name: string, team: 'T' | 'CT') {
        const state: PlayerState = { id, name, money: STARTING_MONEY, lossStreak: 0, isAlive: true };
        const teamState = team === 'T' ? this.TState : this.CTState;
        teamState.players.set(id, state);
    }

    public handleKill(killerId: string, victimId: string, weapon: keyof typeof WEAPON_CLASSES) {
        const killer = this.getPlayerState(killerId);
        const victim = this.getPlayerState(victimId);

        if (victim) {
            victim.isAlive = false;
        }

        if (killer) {
            const weaponClass = WEAPON_CLASSES[weapon] || 'DEFAULT';
            const reward = KILL_REWARDS[weaponClass as keyof typeof KILL_REWARDS];
            killer.money = Math.min(MAX_MONEY, killer.money + reward);
        }
    }

    public handleRoundEnd(winningTeam: 'T' | 'CT', bombPlanted: boolean, isPistolRound: boolean) {
        const winnerState = winningTeam === 'T' ? this.TState : this.CTState;
        const loserState = winningTeam === 'T' ? this.CTState : this.TState;

        // Update winner's money
        winnerState.teamLossStreak = 0;
        winnerState.players.forEach(player => {
            if (player.isAlive) {
                // Survivors keep their money + get win reward
                player.money = Math.min(MAX_MONEY, player.money + ROUND_WIN_REWARDS.BOMB_OBJECTIVE);
            } else {
                // Dead players reset to win reward
                player.money = ROUND_WIN_REWARDS.BOMB_OBJECTIVE;
            }
            player.lossStreak = 0;
        });

        // Update loser's money
        loserState.teamLossStreak++;
        loserState.players.forEach(player => {
            const lossBonus = isPistolRound
                ? PISTOL_ROUND_LOSS_BONUS
                : LOSS_BONUS_STREAK[Math.min(loserState.teamLossStreak - 1, LOSS_BONUS_STREAK.length - 1)];

            if (player.isAlive) {
                // Survivors keep their money + get loss bonus
                player.money = Math.min(MAX_MONEY, player.money + lossBonus);
            } else {
                // Dead players reset to loss bonus
                player.money = lossBonus;
            }
            player.lossStreak++;
        });

        // Add bomb plant bonus for T-side if planted, regardless of outcome
        if (bombPlanted) {
            this.TState.players.forEach(player => {
                player.money = Math.min(MAX_MONEY, player.money + BOMB_PLANT_BONUS);
            });
        }

        // Reset all players to alive for the next round
        this.resetPlayerAliveStatus();
    }

    private resetPlayerAliveStatus() {
        this.TState.players.forEach(p => p.isAlive = true);
        this.CTState.players.forEach(p => p.isAlive = true);
    }

    public getPlayerState(playerId: string): PlayerState | undefined {
        return this.TState.players.get(playerId) || this.CTState.players.get(playerId);
    }
}

export default EconomyCalculatorService;
