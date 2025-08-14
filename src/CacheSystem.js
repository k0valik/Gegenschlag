/**
 * @file CacheSystem.js
 * @description Implements a simple LRU (Least Recently Used) cache with TTL (Time to Live).
 * This is used for caching API responses to reduce redundant requests and improve performance.
 */

export class CacheSystem {
    constructor(defaultTtl) {
        this.cache = new Map();
        this.defaultTtl = defaultTtl; // Default time-to-live in milliseconds
    }

    /**
     * Stores a value in the cache.
     * @param {string} key - The key to store the value under.
     * @param {any} value - The value to store.
     * @param {number} [ttl] - Optional TTL for this specific entry, in milliseconds.
     */
    set(key, value, ttl = this.defaultTtl) {
        const expires = Date.now() + ttl;
        this.cache.set(key, { value, expires });
    }

    /**
     * Retrieves a value from the cache.
     * @param {string} key - The key of the value to retrieve.
     * @returns {any|null} The cached value, or null if it doesn't exist or has expired.
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if the entry has expired
        if (Date.now() > entry.expires) {
            this.cache.delete(key); // Clean up expired entry
            return null;
        }

        // LRU logic: move accessed element to the end of the map
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    /**
     * Deletes a value from the cache.
     * @param {string} key - The key of the value to delete.
     */
    delete(key) {
        this.cache.delete(key);
    }

    /**
     * Clears the entire cache.
     */
    clear() {
        this.cache.clear();
    }
}
