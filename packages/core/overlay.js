/**
 * CS2 Economy Helper - Overlay Renderer
 * Receives updates from background window and displays economy panel
 */

class OverlayRenderer {
    constructor() {
        this.economyPanel = document.getElementById('economy-panel');
        this.modules = {
            economy: true,
            bomb_timer: false
        };

        this.registerWindowCommunication();
    }

    /**
     * Register for window messages from background service
     */
    registerWindowCommunication() {
        overwolf.windows.onMessageReceived.addListener((message) => {
            if (!message || !message.content) return;

            const { type, data, module } = message.content;
            switch(type) {
                case 'economy_update':
                    this.renderEconomyPanel(data);
                    break;
                case 'toggle_module':
                    this.toggleModule(module);
                    break;
            }
        });

        // Notify background that overlay is ready
        overwolf.windows.getMainWindow((result) => {
            if (result && result.window) {
                overwolf.windows.sendMessage(result.window.id, { type: 'overlay_ready' }, () => {});
            }
        });
    }

    /**
     * Toggle module visibility
     * @param {string} module - Module name
     */
    toggleModule(module) {
        if (!this.modules.hasOwnProperty(module)) return;
        this.modules[module] = !this.modules[module];
        this.updateVisibility();
    }

    /**
     * Update panel visibility based on module settings
     */
    updateVisibility() {
        this.economyPanel.style.display = this.modules.economy ? 'block' : 'none';
    }

    /**
     * Render economy panel with snapshot data
     * @param {Object} snapshot - Economy snapshot
     */
    renderEconomyPanel(snapshot) {
        if (!this.modules.economy) return;
        if (!snapshot || !snapshot.teams) return;

        const html = [
            `<div class="team-header" style="color: var(--ct-color)">CT Team (Round ${snapshot.round})</div>`,
            this.renderTeamTable(snapshot.teams.CT),
            `<div class="team-header" style="color: var(--t-color)">T Team (Round ${snapshot.round})</div>`,
            this.renderTeamTable(snapshot.teams.T)
        ].join('');

        this.economyPanel.innerHTML = html;
    }

    /**
     * Render table for a team
     * @param {Array} players - Array of player states
     * @returns {string} HTML table string
     */
    renderTeamTable(players) {
        if (!players || players.length === 0) return '<p>No data</p>';

        let rows = players.map(p => {
            const confClass = p.confidence >= UI_CONFIG.CONFIDENCE_THRESHOLDS.HIGH ? 'confidence-high'
                : p.confidence >= UI_CONFIG.CONFIDENCE_THRESHOLDS.MEDIUM ? 'confidence-medium'
                : 'confidence-low';
            return `<tr>
                <td>${p.nickname}</td>
                <td>$${p.minMoney} - $${p.maxMoney}</td>
                <td class="${confClass}">${p.confidence}%</td>
            </tr>`;
        }).join('');

        return `<table>${rows}</table>`;
    }
}

// Initialize overlay
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new OverlayRenderer());
} else {
    new OverlayRenderer();
}
