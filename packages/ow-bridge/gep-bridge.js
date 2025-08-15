/**
 * CS2 Economy Helper - GEP Bridge
 * Overwolf Game Events Provider integration for Counter-Strike 2
 * 
 * @performance Target: <10ms per event processing
 */

class GEPBridge {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.initialized = false;

        // Keep track of required features
        this.requiredFeatures = ['live_data', 'match_info', 'kill_feed'];
    }

    /**
     * Initialize GEP connection and listeners
     */
    async initialize() {
        if (this.initialized) return;

        console.log('[GEPBridge] Setting required features:', this.requiredFeatures);

        overwolf.games.events.setRequiredFeatures(this.requiredFeatures, (result) => {
            if (result.success === false) {
                console.error('[GEPBridge] Failed to set required features:', result.error);
                return;
            }

            console.log('[GEPBridge] Required features set successfully');

            // Register listeners
            overwolf.games.events.onInfoUpdates2.addListener(this.handleInfoUpdates.bind(this));
            overwolf.games.events.onNewEvents.addListener(this.handleNewEvents.bind(this));

            this.initialized = true;
        });
    }

    /**
     * Handle info updates (live_data and match_info)
     * @param {Object} info - Info updates object
     */
    handleInfoUpdates(info) {
        if (!info || !info.info) return;

        if (info.feature === 'match_info') {
            // Emit roster updates
            const rosterKeys = Object.keys(info.info.match_info).filter(key => key.startsWith('roster_'));
            if (rosterKeys.length > 0) {
                const rosterData = {};
                for (const key of rosterKeys) {
                    rosterData[key] = info.info.match_info[key];
                }
                this.eventBus.emit('game:roster_update', rosterData, { async: true });
            }
        }

        if (info.feature === 'live_data') {
            if (info.info.live_data.round_phase === 'freezetime') {
                this.eventBus.emit('game:round_start', info.info.live_data);
            }
        }
    }

    /**
     * Handle new events (kills, round end, etc.)
     * @param {Object} events - New events object
     */
    handleNewEvents(events) {
        if (!events || !events.events) return;

        for (const event of events.events) {
            switch(event.name) {
                case 'match_start':
                    this.eventBus.emit('game:match_start', events);
                    break;
                case 'match_end':
                    this.eventBus.emit('game:match_end', events);
                    break;
                case 'kill_feed':
                    this.eventBus.emit('game:kill_feed', event.data);
                    break;
                case 'round_end':
                    this.eventBus.emit('game:round_end', event.data);
                    break;
                case 'round_start':
                    this.eventBus.emit('game:round_start', event.data);
                    break;
                default:
                    // Ignore other events for now
                    break;
            }
        }
    }

    /**
     * Dispose bridge
     */
    dispose() {
        overwolf.games.events.onInfoUpdates2.removeListener(this.handleInfoUpdates.bind(this));
        overwolf.games.events.onNewEvents.removeListener(this.handleNewEvents.bind(this));
        this.initialized = false;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GEPBridge;
}