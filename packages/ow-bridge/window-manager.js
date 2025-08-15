/**
 * CS2 Economy Helper - Window Manager
 * Manages window creation, messaging, and visibility
 */

class WindowManager {
    constructor() {
        this.windows = new Map();
    }

    /**
     * Initialize windows declared in manifest
     */
    async initialize() {
        await this.obtainWindow('overlay');
        await this.obtainWindow('desktop');
    }

    /**
     * Obtain declared window by name
     * @param {string} name - Window name
     * @returns {Promise<Object>} Window info
     */
    obtainWindow(name) {
        return new Promise((resolve, reject) => {
            overwolf.windows.obtainDeclaredWindow(name, result => {
                if (result.success) {
                    this.windows.set(name, result.window);
                    resolve(result.window);
                } else {
                    console.error('[WindowManager] Failed to obtain window', name, result);
                    reject(result);
                }
            });
        });
    }

    /**
     * Restore and show overlay window
     */
    async showOverlay() {
        const overlay = await this.obtainWindow('overlay');
        overwolf.windows.restore(overlay.id, () => {});
    }

    /**
     * Hide overlay window
     */
    async hideOverlay() {
        const overlay = this.windows.get('overlay');
        if (overlay) {
            overwolf.windows.minimize(overlay.id, () => {});
        }
    }

    /**
     * Send message to target window
     * @param {string} target - Window name
     * @param {Object} message - Message object
     */
    sendMessage(target, message) {
        const windowInfo = this.windows.get(target);
        if (!windowInfo) {
            console.warn('[WindowManager] No such window:', target);
            return;
        }
        overwolf.windows.sendMessage(windowInfo.id, message, () => {});
    }

    /**
     * Show a desktop window (e.g., error message)
     * @param {Object} props - Properties of the message
     */
    async showDesktopWindow(props) {
        const desktop = await this.obtainWindow('desktop');
        overwolf.windows.restore(desktop.id, () => {
            overwolf.windows.sendMessage(desktop.id, props, () => {});
        });
    }

    /**
     * Dispose window manager
     */
    dispose() {
        this.windows.clear();
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WindowManager;
}