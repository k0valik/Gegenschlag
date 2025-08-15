/**
 * CS2 Economy Helper - Event Bus
 * High-performance event system for internal component communication
 * 
 * @performance Target: <1ms event processing
 * @author CS2 Strategic Team
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.eventQueue = [];
        this.processing = false;
        this.disposed = false;

        // Performance monitoring
        this.eventCount = 0;
        this.processingTime = 0;
    }

    /**
     * Register event listener
     * @param {string} eventType - Event type to listen for
     * @param {Function} callback - Callback function
     * @param {Object} options - Listener options
     */
    on(eventType, callback, options = {}) {
        if (this.disposed) {
            console.warn('[EventBus] Cannot register listener on disposed event bus');
            return;
        }

        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }

        const listener = {
            callback,
            once: options.once || false,
            priority: options.priority || 0
        };

        this.listeners.get(eventType).add(listener);

        return () => this.off(eventType, callback);
    }

    /**
     * Register one-time event listener
     * @param {string} eventType - Event type to listen for
     * @param {Function} callback - Callback function
     */
    once(eventType, callback) {
        return this.on(eventType, callback, { once: true });
    }

    /**
     * Remove event listener
     * @param {string} eventType - Event type
     * @param {Function} callback - Callback function to remove
     */
    off(eventType, callback) {
        if (!this.listeners.has(eventType)) return;

        const eventListeners = this.listeners.get(eventType);
        for (const listener of eventListeners) {
            if (listener.callback === callback) {
                eventListeners.delete(listener);
                break;
            }
        }

        // Clean up empty event types
        if (eventListeners.size === 0) {
            this.listeners.delete(eventType);
        }
    }

    /**
     * Emit event to all registered listeners
     * @param {string} eventType - Event type to emit
     * @param {any} data - Event data
     * @param {Object} options - Emission options
     * @performance <5ms processing time for typical events
     */
    emit(eventType, data, options = {}) {
        if (this.disposed) return;

        const startTime = performance.now();

        try {
            if (options.async) {
                // Async emission for non-critical events
                this.queueEvent(eventType, data);
            } else {
                // Synchronous emission for critical events
                this.emitSync(eventType, data);
            }
        } catch (error) {
            console.error(`[EventBus] Error emitting event ${eventType}:`, error);
        }

        // Performance tracking
        const processingTime = performance.now() - startTime;
        this.processingTime = (this.processingTime + processingTime) / 2; // Running average
        this.eventCount++;

        if (processingTime > 5) {
            console.warn(`[EventBus] Slow event processing: ${eventType} took ${processingTime}ms`);
        }
    }

    /**
     * Synchronous event emission
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    emitSync(eventType, data) {
        if (!this.listeners.has(eventType)) return;

        const eventListeners = Array.from(this.listeners.get(eventType));

        // Sort by priority (higher priority first)
        eventListeners.sort((a, b) => b.priority - a.priority);

        const toRemove = [];

        for (const listener of eventListeners) {
            try {
                listener.callback(data, eventType);

                if (listener.once) {
                    toRemove.push(listener);
                }
            } catch (error) {
                console.error(`[EventBus] Error in listener for ${eventType}:`, error);
            }
        }

        // Remove one-time listeners
        toRemove.forEach(listener => {
            this.listeners.get(eventType).delete(listener);
        });
    }

    /**
     * Queue event for async processing
     * @param {string} eventType - Event type
     * @param {any} data - Event data
     */
    queueEvent(eventType, data) {
        this.eventQueue.push({ eventType, data, timestamp: Date.now() });

        if (!this.processing) {
            requestAnimationFrame(() => this.processEventQueue());
        }
    }

    /**
     * Process queued events
     * Uses requestAnimationFrame for performance optimization
     */
    processEventQueue() {
        if (this.disposed || this.eventQueue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const startTime = performance.now();
        const maxProcessingTime = 8; // ms - leave time for rendering

        while (this.eventQueue.length > 0 && (performance.now() - startTime) < maxProcessingTime) {
            const event = this.eventQueue.shift();
            this.emitSync(event.eventType, event.data);
        }

        if (this.eventQueue.length > 0) {
            requestAnimationFrame(() => this.processEventQueue());
        } else {
            this.processing = false;
        }
    }

    /**
     * Remove all listeners for a specific event type
     * @param {string} eventType - Event type to clear
     */
    removeAllListeners(eventType) {
        if (eventType) {
            this.listeners.delete(eventType);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getPerformanceStats() {
        return {
            eventCount: this.eventCount,
            avgProcessingTime: this.processingTime,
            queueLength: this.eventQueue.length,
            listenerCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0)
        };
    }

    /**
     * Clear event queue and reset performance counters
     */
    clearQueue() {
        this.eventQueue = [];
        this.processing = false;
        this.eventCount = 0;
        this.processingTime = 0;
    }

    /**
     * Dispose of the event bus
     * Cleans up all listeners and queued events
     */
    dispose() {
        this.disposed = true;
        this.listeners.clear();
        this.eventQueue = [];
        this.processing = false;

        console.log('[EventBus] Disposed successfully');
    }
}

// Export for environments that support it
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventBus;
}