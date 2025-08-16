import { KILL_REWARDS, LOSS_BONUS_STREAK, MAX_MONEY, PISTOL_ROUND_LOSS_BONUS, ROUND_WIN_REWARDS, STARTING_MONEY, WEAPON_CLASSES } from '../constants/economy';

export interface PlayerState {
    id: string;
    name: string;
    money: number;
    lossStreak: number;
}

export interface TeamState {
    players: Map<string, PlayerState>;
    teamLossStreak: number;
}

class EconomyCalculatorService {
    private TState: TeamState;
    private CTState: TeamState;

    constructor() {
        this.TState = { players: new Map(), teamLossStreak: 0 };
        this.CTState = { players: new Map(), teamLossStreak: 0 };
    }

    public initializePlayer(id: string, name: string, team: 'T' | 'CT') {
        const state = { id, name, money: STARTING_MONEY, lossStreak: 0 };
        if (team === 'T') {
            this.TState.players.set(id, state);
        } else {
            this.CTState.players.set(id, state);
        }
    }

    public handleKill(killerId: string, weapon: keyof typeof WEAPON_CLASSES) {
        const killer = this.getPlayerState(killerId);
        if (!killer) return;

        const weaponClass = WEAPON_CLASSES[weapon] || 'DEFAULT';
        const reward = KILL_REWARDS[weaponClass as keyof typeof KILL_REWARDS];
        killer.money = Math.min(MAX_MONEY, killer.money + reward);
    }

    public handleRoundEnd(winningTeam: 'T' | 'CT', isPistolRound: boolean) {
        const winnerState = winningTeam === 'T' ? this.TState : this.CTState;
        const loserState = winningTeam === 'T' ? this.CTState : this.TState;

        // Update winner's money
        winnerState.teamLossStreak = 0;
        winnerState.players.forEach(player => {
            player.money = Math.min(MAX_MONEY, player.money + ROUND_WIN_REWARDS.BOMB_OBJECTIVE); // Assuming bomb objective for simplicity
            player.lossStreak = 0;
        });

        // Update loser's money
        loserState.teamLossStreak++;
        loserState.players.forEach(player => {
            const lossBonus = isPistolRound
                ? PISTOL_ROUND_LOSS_BONUS
                : LOSS_BONUS_STREAK[Math.min(loserState.teamLossStreak - 1, LOSS_BONUS_STREAK.length - 1)];
            player.money = Math.min(MAX_MONEY, player.money + lossBonus);
            player.lossStreak++;
        });
    }

    public getPlayerState(playerId: string): PlayerState | undefined {
        return this.TState.players.get(playerId) || this.CTState.players.get(playerId);
    }

    public getTeamState(team: 'T' | 'CT'): TeamState {
        return team === 'T' ? this.TState : this.CTState;
    }
}

export default EconomyCalculatorService;
