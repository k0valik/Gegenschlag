/**
 * @file DataManager.js
 * @description Manages all application data, including fetching from APIs and caching.
 * It acts as the single source of truth for player and match data.
 */

import { CacheSystem } from './CacheSystem.js';
import { SteamAPIClient } from './SteamAPIClient.js';
import { FaceitClient } from './FaceitClient.js';
import { LeetifyClient } from './LeetifyClient.js';
import { PerplexityClient } from './PerplexityClient.js';
import { RateLimiter } from './RateLimiter.js';

// WARNING: Storing API keys in client-side code is insecure.
// In a real application, these should be handled by a secure backend server.
const API_KEYS = {
    STEAM: 'YOUR_STEAM_API_KEY',
    FACEIT: 'YOUR_FACEIT_API_KEY',
    LEETIFY: 'YOUR_LEETIFY_API_KEY',
    PERPLEXITY: 'YOUR_PERPLEXITY_API_KEY'
};

export class DataManager {
    constructor() {
        this.cache = new CacheSystem(24 * 60 * 60 * 1000); // 24-hour TTL
        this.rateLimiter = new RateLimiter(5, 10); // 5 req/sec, bucket size 10

        // Initialize API clients
        this.steamClient = new SteamAPIClient(API_KEYS.STEAM);
        this.faceitClient = new FaceitClient(API_KEYS.FACEIT);
        this.leetifyClient = new LeetifyClient(API_KEYS.LEETIFY);
        this.perplexityClient = new PerplexityClient(API_KEYS.PERPLEXITY);
    }

    /**
     * Retrieves comprehensive data for a player, using cache if available.
     * @param {string} steamId64 - The 64-bit Steam ID of the player.
     * @returns {Promise<Object>} A promise that resolves with the aggregated player data.
     */
    async getPlayerData(steamId64) {
        const cachedData = this.cache.get(steamId64);
        if (cachedData) {
            return cachedData;
        }

        // If not in cache, fetch from all APIs concurrently
        const [steamSummary, steamBans, faceitStats] = await Promise.all([
            this.rateLimiter.request(() => this.steamClient.getPlayerSummaries([steamId64])),
            this.rateLimiter.request(() => this.steamClient.getPlayerBans([steamId64])),
            this.rateLimiter.request(() => this.faceitClient.getPlayerStats(/* faceitId */)),
            // Add Leetify and Perplexity calls here
        ]);

        const aggregatedData = this.aggregateData(steamSummary, steamBans, faceitStats);

        // Store the fresh data in the cache
        this.cache.set(steamId64, aggregatedData);

        return aggregatedData;
    }

    /**
     * Combines data from multiple API sources into a single object.
     * @param {...Object} sources - Data objects from various APIs.
     * @returns {Object} A single, aggregated data object for a player.
     */
    aggregateData(...sources) {
        // Simple merge for now, can be more sophisticated
        return Object.assign({}, ...sources);
    }
}
