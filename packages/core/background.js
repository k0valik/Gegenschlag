/**
 * CS2 Economy Helper - Background Service
 * Main controller that manages app lifecycle, game events, and window coordination
 * 
 * @performance Target: <2% CPU usage, <50MB memory
 * @author CS2 Strategic Team
 */

class BackgroundService {
    constructor() {
        this.isInitialized = false;
        this.gameRunning = false;
        this.currentMatch = null;

        // Initialize core components
        this.eventBus = new EventBus();
        this.economyEngine = new EconomyEngine(this.eventBus);
        this.gepBridge = new GEPBridge(this.eventBus);
        this.windowManager = new WindowManager();

        this.bindEvents();
    }

    /**
     * Initialize the background service
     * Called when Overwolf client is ready
     * @performance <3s startup time
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            console.log('[Background] Initializing CS2 Economy Helper...');

            // Initialize Overwolf APIs
            await this.initializeOverwolfAPIs();

            // Setup game event listeners
            await this.gepBridge.initialize();

            // Initialize window management
            await this.windowManager.initialize();

            this.isInitialized = true;
            console.log('[Background] Initialization complete');

            // Check if game is already running
            this.checkGameStatus();

        } catch (error) {
            console.error('[Background] Initialization failed:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Initialize Overwolf API components
     */
    async initializeOverwolfAPIs() {
        return new Promise((resolve, reject) => {
            // Register for game launch events
            overwolf.games.onGameLaunched.addListener((event) => {
                this.handleGameLaunched(event);
            });

            // Register for game info updates
            overwolf.games.onGameInfoUpdated.addListener((event) => {
                this.handleGameInfoUpdated(event);
            });

            // Register for hotkeys
            this.registerHotkeys();

            resolve();
        });
    }

    /**
     * Register application hotkeys
     */
    registerHotkeys() {
        overwolf.settings.hotkeys.onPressed.addListener((event) => {
            switch(event.name) {
                case 'toggle_economy':
                    this.toggleEconomyPanel();
                    break;
                case 'toggle_bomb_timer':
                    this.toggleBombTimer();
                    break;
                default:
                    console.log('[Background] Unknown hotkey:', event.name);
            }
        });
    }

    /**
     * Bind internal event listeners
     */
    bindEvents() {
        // Game event processing
        this.eventBus.on('game:match_start', (data) => {
            this.handleMatchStart(data);
        });

        this.eventBus.on('game:match_end', (data) => {
            this.handleMatchEnd(data);
        });

        this.eventBus.on('game:kill_feed', (data) => {
            this.economyEngine.processKillFeedEvent(data);
        });

        this.eventBus.on('game:round_end', (data) => {
            this.economyEngine.processRoundEndEvent(data);
        });

        // Economy updates
        this.eventBus.on('economy:update', (snapshot) => {
            this.broadcastEconomyUpdate(snapshot);
        });

        // Window events
        this.eventBus.on('window:overlay_ready', () => {
            this.onOverlayReady();
        });
    }

    /**
     * Handle game launch event
     * @param {Object} event - Overwolf game launch event
     */
    handleGameLaunched(event) {
        if (event.gameId === CS2_GAME_ID) {
            console.log('[Background] CS2 launched');
            this.gameRunning = true;
            this.windowManager.showOverlay();
        }
    }

    /**
     * Handle game info updates
     * @param {Object} event - Game info update event
     */
    handleGameInfoUpdated(event) {
        if (event.gameInfo && event.gameInfo.isRunning && event.gameInfo.id === CS2_GAME_ID) {
            if (!this.gameRunning) {
                this.gameRunning = true;
                this.windowManager.showOverlay();
            }
        } else if (this.gameRunning) {
            this.gameRunning = false;
            this.windowManager.hideOverlay();
            this.economyEngine.reset();
        }
    }

    /**
     * Check current game status on startup
     */
    checkGameStatus() {
        overwolf.games.getRunningGameInfo((result) => {
            if (result.success && result.gameInfo && result.gameInfo.id === CS2_GAME_ID) {
                this.gameRunning = true;
                console.log('[Background] CS2 already running');
                setTimeout(() => {
                    this.windowManager.showOverlay();
                }, 1000);
            }
        });
    }

    /**
     * Handle match start
     * @param {Object} data - Match start data
     */
    handleMatchStart(data) {
        console.log('[Background] Match started');
        this.currentMatch = {
            id: data.pseudo_match_id || Date.now().toString(),
            startTime: Date.now(),
            mode: data.mode_name,
            map: data.map_name
        };

        this.economyEngine.startNewMatch(this.currentMatch);
    }

    /**
     * Handle match end
     * @param {Object} data - Match end data
     */
    handleMatchEnd(data) {
        console.log('[Background] Match ended');
        if (this.currentMatch) {
            this.currentMatch.endTime = Date.now();
            this.currentMatch.outcome = data.match_outcome;
        }

        this.economyEngine.endMatch();
    }

    /**
     * Toggle economy panel visibility
     */
    toggleEconomyPanel() {
        this.windowManager.sendMessage('overlay', {
            type: 'toggle_module',
            module: 'economy'
        });
    }

    /**
     * Toggle bomb timer visibility
     */
    toggleBombTimer() {
        this.windowManager.sendMessage('overlay', {
            type: 'toggle_module',
            module: 'bomb_timer'
        });
    }

    /**
     * Broadcast economy update to overlay
     * @param {Object} snapshot - Economy snapshot
     * @performance <10ms processing time
     */
    broadcastEconomyUpdate(snapshot) {
        this.windowManager.sendMessage('overlay', {
            type: 'economy_update',
            data: snapshot
        });
    }

    /**
     * Called when overlay window is ready
     */
    onOverlayReady() {
        console.log('[Background] Overlay ready');
        // Send initial state
        const currentState = this.economyEngine.getCurrentState();
        if (currentState) {
            this.broadcastEconomyUpdate(currentState);
        }
    }

    /**
     * Handle initialization errors gracefully
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        console.error('[Background] Critical error:', error);

        // Show user-friendly error notification
        this.windowManager.showDesktopWindow({
            type: 'error',
            message: 'Failed to initialize CS2 Economy Helper. Please restart Overwolf.'
        });
    }

    /**
     * Cleanup resources on app close
     */
    dispose() {
        console.log('[Background] Disposing resources...');

        if (this.economyEngine) {
            this.economyEngine.dispose();
        }

        if (this.gepBridge) {
            this.gepBridge.dispose();
        }

        if (this.windowManager) {
            this.windowManager.dispose();
        }

        this.eventBus.removeAllListeners();
    }
}

// Singleton instance
let backgroundService = null;

/**
 * Initialize background service when Overwolf is ready
 */
function initializeApp() {
    if (!backgroundService) {
        backgroundService = new BackgroundService();
        backgroundService.initialize();
    }
}

// Window close handler
window.addEventListener('beforeunload', () => {
    if (backgroundService) {
        backgroundService.dispose();
    }
});

// Start the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('[Background] Unhandled error:', event.error);
});