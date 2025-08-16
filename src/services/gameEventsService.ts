import EconomyCalculatorService from './economyCalculatorService';

// This service will be a singleton instance in the background script
class GameEventsService {
    private economyService: EconomyCalculatorService;
    private isPistolRound: boolean = true;
    private roundNumber: number = 0;

    constructor() {
        this.economyService = new EconomyCalculatorService();
    }

    public start(): void {
        overwolf.games.events.onNewEvents.addListener(this.handleEvents.bind(this));
        // We would also need to listen for match_start to initialize players
    }

    private handleEvents(e: overwolf.games.events.NewGameEvents): void {
        for (const event of e.events) {
            console.log("GEP Event:", event.name, event.data);

            if (event.name === 'kill') {
                this.handleKillEvent(event.data);
            }

            if (event.name === 'round_end') {
                this.handleRoundEndEvent(event.data);
            }

            if (event.name === 'match_start') {
                this.roundNumber = 0;
                this.isPistolRound = true;
                // Here we would get the player list and initialize them
                // e.g., this.economyService.initializePlayer(...)
            }
        }
        this.broadcastState(); // Broadcast after processing all events in the batch
    }

    private handleKillEvent(data: any): void {
        try {
            const parsedData = JSON.parse(data);
            const killerId = parsedData.killer_steamid; // Assuming structure
            const weapon = parsedData.weapon;
            if (killerId && weapon) {
                this.economyService.handleKill(killerId, weapon);
            }
        } catch (err) {
            console.error("Failed to parse kill event data:", err);
        }
    }

    private handleRoundEndEvent(data: any): void {
        try {
            const parsedData = JSON.parse(data);
            const winningTeam = parsedData.winner; // Assuming structure 'T' or 'CT'
            if (winningTeam) {
                this.economyService.handleRoundEnd(winningTeam, this.isPistolRound);

                this.roundNumber++;
                // Pistol rounds are round 1 and the first round after halftime (e.g., round 13)
                this.isPistolRound = this.roundNumber === 0 || this.roundNumber === 12;
            }
        } catch (err) {
            console.error("Failed to parse round_end event data:", err);
        }
    }

    public getEconomyService(): EconomyCalculatorService {
        return this.economyService;
    }

    private broadcastState() {
        const tState = this.economyService.getTeamState('T');
        const ctState = this.economyService.getTeamState('CT');

        const payload = {
            T: {
                players: Array.from(tState.players.values()),
                teamLossStreak: tState.teamLossStreak,
            },
            CT: {
                players: Array.from(ctState.players.values()),
                teamLossStreak: ctState.teamLossStreak,
            }
        };

        overwolf.windows.sendMessage('in_game', 'economy_update', payload, () => {});
    }
}

export default GameEventsService;
