/**
 * @file RateLimiter.js
 * @description Manages API requests to avoid hitting rate limits.
 * Implements a token bucket algorithm to handle requests at a steady pace.
 */

export class RateLimiter {
    constructor(requestsPerSecond, bucketSize) {
        this.requestsPerSecond = requestsPerSecond;
        this.bucketSize = bucketSize;
        this.tokens = bucketSize;
        this.lastRefill = Date.now();
        this.requestQueue = [];
        this.isProcessing = false;
    }

    /**
     * Adds a request to the queue and processes it when a token is available.
     * @param {Function} apiCall - A function that returns a promise (e.g., an API client method).
     * @returns {Promise<any>} A promise that resolves with the result of the API call.
     */
    async request(apiCall) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ apiCall, resolve, reject });
            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    /**
     * Refills the token bucket based on the elapsed time.
     */
    refillTokens() {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastRefill) / 1000;
        const newTokens = elapsedSeconds * this.requestsPerSecond;

        if (newTokens > 0) {
            this.tokens = Math.min(this.bucketSize, this.tokens + newTokens);
            this.lastRefill = now;
        }
    }

    /**
     * Processes the request queue, sending requests when tokens are available.
     */
    async processQueue() {
        this.isProcessing = true;

        while (this.requestQueue.length > 0) {
            this.refillTokens();

            if (this.tokens >= 1) {
                this.tokens--;
                const { apiCall, resolve, reject } = this.requestQueue.shift();

                try {
                    const result = await apiCall();
                    resolve(result);
                } catch (error) {
                    // Implement exponential backoff here if needed
                    console.error('API call failed in rate limiter:', error);
                    reject(error);
                }
            } else {
                // Wait for more tokens to be available
                await new Promise(resolve => setTimeout(resolve, 1000 / this.requestsPerSecond));
            }
        }

        this.isProcessing = false;
    }
}
