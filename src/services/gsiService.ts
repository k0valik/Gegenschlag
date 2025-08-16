/**
 * NOTE on Game State Integration (GSI)
 * (Comments from previous version are omitted for brevity)
 */

type GSIStatus = 'disconnected' | 'connecting' | 'connected';
type GsiUpdateCallback = (gsiData: any) => void;

class GSIService {
    private static instance: GSIService;
    private interval: number | null = null;
    private port: number = 3000;
    private status: GSIStatus = 'disconnected';
    private lastData: any = null;
    private updateCallback: GsiUpdateCallback | null = null;

    private constructor() {}

    public static getInstance(): GSIService {
        if (!GSIService.instance) {
            GSIService.instance = new GSIService();
        }
        return GSIService.instance;
    }

    public start(callback?: GsiUpdateCallback): void {
        if (this.interval) {
            console.log("GSI service is already running.");
            return;
        }
        if (callback) {
            this.updateCallback = callback;
        }
        this.status = 'connecting';
        console.log(`GSI service starting. Polling http://localhost:${this.port}/gsi every 1 second.`);
        // Polling more frequently to get timely round phase updates
        this.interval = window.setInterval(() => this.fetchGSI(), 1000);
    }

    public stop(): void {
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = null;
            this.status = 'disconnected';
            this.updateCallback = null;
            console.log("GSI service stopped.");
        }
    }

    private async fetchGSI(): Promise<void> {
        try {
            const response = await fetch(`http://localhost:${this.port}/gsi`);
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            const gsiData = await response.json();
            this.lastData = gsiData;

            if (this.status !== 'connected') {
                this.status = 'connected';
                console.log("GSI service connected successfully.");
            }

            // If a callback is registered, call it with the new data
            if (this.updateCallback) {
                this.updateCallback(gsiData);
            }

        } catch (error) {
            if (this.status !== 'disconnected') {
                this.status = 'disconnected';
                console.warn("GSI service disconnected. Is the companion server running?");
            }
        }
    }
}

export default GSIService;
