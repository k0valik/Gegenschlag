/**
 * CS2 Economy Helper - Constants and Game Data
 * Contains all game-specific constants, economy rules, and configuration
 * 
 * @author CS2 Strategic Team
 */

// Game identification
const CS2_GAME_ID = 21640;

// Economy constants based on CS2 mechanics
const ECONOMY_CONSTANTS = {
    // Starting money
    STARTING_MONEY: {
        PISTOL_ROUND: 800,
        NORMAL_ROUND: 1400
    },

    // Kill rewards by weapon category
    KILL_REWARDS: {
        // Rifles
        'weapon_ak47': 300,
        'weapon_m4a1': 300,
        'weapon_m4a1_silencer': 300,
        'weapon_aug': 300,
        'weapon_sg556': 300,
        'weapon_famas': 300,
        'weapon_galilar': 300,

        // SMGs
        'weapon_mp9': 600,
        'weapon_mac10': 600,
        'weapon_mp7': 600,
        'weapon_ump45': 600,
        'weapon_p90': 300,
        'weapon_bizon': 600,
        'weapon_mp5sd': 600,

        // Shotguns
        'weapon_nova': 900,
        'weapon_xm1014': 900,
        'weapon_mag7': 900,
        'weapon_sawedoff': 900,

        // Snipers
        'weapon_ssg08': 300,
        'weapon_awp': 100,
        'weapon_scar20': 300,
        'weapon_g3sg1': 300,

        // Pistols
        'weapon_glock': 300,
        'weapon_usp_silencer': 300,
        'weapon_p250': 300,
        'weapon_fiveseven': 300,
        'weapon_tec9': 300,
        'weapon_cz75a': 100,
        'weapon_deagle': 300,
        'weapon_revolver': 300,

        // Machine guns
        'weapon_m249': 300,
        'weapon_negev': 300,

        // Knife and grenades
        'weapon_knife': 1500,
        'weapon_hegrenade': 300,
        'weapon_flashbang': 300,
        'weapon_smokegrenade': 300,
        'weapon_incgrenade': 300,
        'weapon_molotov': 300,
        'weapon_decoy': 300
    },

    // Round loss bonuses
    LOSS_BONUS: {
        0: 1400, // First loss
        1: 1900, // Second loss
        2: 2400, // Third loss  
        3: 2900, // Fourth loss
        4: 3400  // Fifth+ consecutive loss (max)
    },

    // Round win bonuses
    WIN_BONUS: {
        ELIMINATION: 3250,
        BOMB_DEFUSED: 3500,
        BOMB_EXPLODED: 3500,
        TIME_EXPIRED: 3250
    },

    // Objective bonuses
    OBJECTIVE_BONUS: {
        BOMB_PLANT: 800,
        BOMB_DEFUSE: 300,
        HOSTAGE_RESCUE: 300
    },

    // Survival bonus
    SURVIVAL_BONUS: 0, // CS2 removed survival bonus

    // Equipment costs (for buy prediction)
    EQUIPMENT_COSTS: {
        // Rifles
        'weapon_ak47': 2700,
        'weapon_m4a1': 3100,
        'weapon_m4a1_silencer': 2900,
        'weapon_aug': 3300,
        'weapon_sg556': 3000,
        'weapon_famas': 2050,
        'weapon_galilar': 1800,

        // SMGs
        'weapon_mp9': 1250,
        'weapon_mac10': 1050,
        'weapon_mp7': 1500,
        'weapon_ump45': 1200,
        'weapon_p90': 2350,
        'weapon_bizon': 1400,
        'weapon_mp5sd': 1500,

        // Shotguns
        'weapon_nova': 1050,
        'weapon_xm1014': 2000,
        'weapon_mag7': 1300,
        'weapon_sawedoff': 1100,

        // Snipers
        'weapon_ssg08': 1700,
        'weapon_awp': 4750,
        'weapon_scar20': 5000,
        'weapon_g3sg1': 5000,

        // Pistols
        'weapon_glock': 200,
        'weapon_usp_silencer': 200,
        'weapon_p250': 300,
        'weapon_fiveseven': 500,
        'weapon_tec9': 500,
        'weapon_cz75a': 500,
        'weapon_deagle': 700,
        'weapon_revolver': 600,

        // Armor and utilities
        'item_kevlar': 650,
        'item_assaultsuit': 1000,
        'item_defuser': 400,
        'weapon_hegrenade': 300,
        'weapon_flashbang': 200,
        'weapon_smokegrenade': 300,
        'weapon_incgrenade': 600,
        'weapon_molotov': 400,
        'weapon_decoy': 50
    },

    // Maximum money
    MAX_MONEY: 16000,

    // Minimum money estimation error margin
    MIN_ESTIMATION_ERROR: 50,

    // Maximum rounds for loss bonus tracking
    MAX_CONSECUTIVE_LOSSES: 4
};

// Performance configuration
const PERFORMANCE_CONFIG = {
    // Update frequencies (ms)
    ECONOMY_UPDATE_INTERVAL: 100,
    UI_UPDATE_INTERVAL: 50,

    // Memory management
    MAX_ROUND_HISTORY: 30,
    MAX_EVENT_HISTORY: 100,

    // Processing timeouts
    EVENT_PROCESSING_TIMEOUT: 10,
    CALCULATION_TIMEOUT: 5,

    // UI performance
    ANIMATION_DURATION: 200,
    DEBOUNCE_DELAY: 100
};

// UI Configuration
const UI_CONFIG = {
    // Default positions (percentage of screen)
    DEFAULT_POSITIONS: {
        ECONOMY_PANEL: { top: 10, left: 80 },
        BOMB_TIMER: { top: 50, left: 50 },
        CROSSHAIR: { top: 50, left: 50 }
    },

    // Color scheme
    COLORS: {
        CT_TEAM: '#4A90E2',
        T_TEAM: '#F5A623',
        CONFIDENCE_HIGH: '#7ED321',
        CONFIDENCE_MEDIUM: '#F5A623',
        CONFIDENCE_LOW: '#D0021B',
        BACKGROUND: 'rgba(0, 0, 0, 0.8)',
        TEXT_PRIMARY: '#FFFFFF',
        TEXT_SECONDARY: '#CCCCCC'
    },

    // Confidence thresholds
    CONFIDENCE_THRESHOLDS: {
        HIGH: 80,
        MEDIUM: 60,
        LOW: 40
    }
};

// Module configuration
const MODULE_CONFIG = {
    ECONOMY: {
        enabled: true,
        position: UI_CONFIG.DEFAULT_POSITIONS.ECONOMY_PANEL,
        opacity: 0.9,
        autoHide: false
    },

    BOMB_TIMER: {
        enabled: false,
        position: UI_CONFIG.DEFAULT_POSITIONS.BOMB_TIMER,
        opacity: 1.0,
        autoHide: true,
        alertTimes: [10, 5, 3] // Alert at these seconds remaining
    },

    CROSSHAIR: {
        enabled: false,
        size: 4,
        color: '#00FF00',
        opacity: 0.8,
        quickScopeDecay: 750 // ms
    }
};

// Event types for internal communication
const EVENT_TYPES = {
    // Game events
    GAME_LAUNCHED: 'game:launched',
    GAME_CLOSED: 'game:closed',
    MATCH_START: 'game:match_start',
    MATCH_END: 'game:match_end',
    ROUND_START: 'game:round_start',
    ROUND_END: 'game:round_end',
    KILL_FEED: 'game:kill_feed',
    BOMB_PLANTED: 'game:bomb_planted',
    BOMB_DEFUSED: 'game:bomb_defused',
    BOMB_EXPLODED: 'game:bomb_exploded',

    // Economy events
    ECONOMY_UPDATE: 'economy:update',
    ECONOMY_RESET: 'economy:reset',

    // UI events
    MODULE_TOGGLE: 'ui:module_toggle',
    SETTINGS_UPDATE: 'ui:settings_update',

    // Window events
    WINDOW_READY: 'window:ready',
    WINDOW_CLOSED: 'window:closed'
};

// Error codes
const ERROR_CODES = {
    INITIALIZATION_FAILED: 'INIT_FAILED',
    GEP_CONNECTION_FAILED: 'GEP_FAILED',
    WINDOW_CREATION_FAILED: 'WINDOW_FAILED',
    ECONOMY_CALCULATION_ERROR: 'ECONOMY_ERROR'
};

// Team mappings
const TEAMS = {
    CT: 'CT',
    T: 'T',
    SPEC: 'SPEC'
};

// Game phases
const GAME_PHASES = {
    WARMUP: 'warmup',
    LIVE: 'live',
    GAMEOVER: 'gameover',
    INTERMISSION: 'intermission'
};

// Round phases
const ROUND_PHASES = {
    FREEZETIME: 'freezetime',
    LIVE: 'live',
    OVER: 'over'
};

// Export all constants (for environments that support it)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CS2_GAME_ID,
        ECONOMY_CONSTANTS,
        PERFORMANCE_CONFIG,
        UI_CONFIG,
        MODULE_CONFIG,
        EVENT_TYPES,
        ERROR_CODES,
        TEAMS,
        GAME_PHASES,
        ROUND_PHASES
    };
}
