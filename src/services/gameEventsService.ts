import EconomyCalculatorService from './economyCalculatorService';
import GSIService from './gsiService';

class GameEventsService {
    private economyService: EconomyCalculatorService;
    private gsiService: GSIService;

    private roundNumber: number = 0;
    private isPistolRound: boolean = true;
    private awaitingRoundEndConfirmation: boolean = false;
    private lastWinningTeam: 'T' | 'CT' | null = null;
    private lastBombPlanted: boolean = false;

    constructor() {
        this.economyService = new EconomyCalculatorService();
        this.gsiService = GSIService.getInstance();
    }

    public start(): void {
        overwolf.games.events.onNewEvents.addListener(this.handleGepEvent.bind(this));

        // Start the GSI service and pass a callback to handle confirmed round ends
        this.gsiService.start(this.handleGsiUpdate.bind(this));
    }

    private handleGsiUpdate(gsiData: any): void {
        const roundPhase = gsiData?.round?.phase;

        // When GSI confirms the round is over, and we are waiting for it
        if (this.awaitingRoundEndConfirmation && roundPhase === 'over' && this.lastWinningTeam) {
            console.log("GSI confirmed round end. Calculating economy.");

            this.economyService.handleRoundEnd(this.lastWinningTeam, this.lastBombPlanted, this.isPistolRound);

            // Reset flags
            this.awaitingRoundEndConfirmation = false;
            this.lastWinningTeam = null;
            this.lastBombPlanted = false;

            // Update round counters
            this.roundNumber++;
            this.isPistolRound = this.roundNumber === 0 || this.roundNumber === 12;

            // Broadcast the new state to the UI
            this.broadcastState();
        }
    }

    private handleGepEvent(e: overwolf.games.events.NewGameEvents): void {
        for (const event of e.events) {
            console.log("GEP Event:", event.name, event.data);

            if (event.name === 'kill') {
                this.handleKillEvent(event.data);
            }

            if (event.name === 'round_end') {
                this.handleRoundEndEvent(event.data);
            }

            // Bomb plant status can be derived from GEP or GSI
            if (event.name === 'bomb_planted') {
                this.lastBombPlanted = true;
            }

            if (event.name === 'match_start') {
                this.roundNumber = 0;
                this.isPistolRound = true;
                // Initialize players here
            }
        }
    }

    private handleKillEvent(data: any): void {
        try {
            const parsedData = JSON.parse(data);
            const killerId = parsedData.killer_steamid;
            const victimId = parsedData.victim_steamid;
            const weapon = parsedData.weapon;
            if (killerId && victimId && weapon) {
                this.economyService.handleKill(killerId, victimId, weapon);
            }
        } catch (err) {
            console.error("Failed to parse kill event data:", err);
        }
    }

    private handleRoundEndEvent(data: any): void {
        try {
            const parsedData = JSON.parse(data);
            this.lastWinningTeam = parsedData.winner;
            this.awaitingRoundEndConfirmation = true;
            console.log(`GEP reported round end. Winner: ${this.lastWinningTeam}. Awaiting GSI confirmation.`);
        } catch (err) {
            console.error("Failed to parse round_end event data:", err);
        }
    }

    private broadcastState() {
        // This would be implemented to send data to the UI
        console.log("Broadcasting state to UI...");
    }
}

export default GameEventsService;
