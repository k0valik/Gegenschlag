export const MAX_MONEY = 16000;
export const STARTING_MONEY = 800;

export const KILL_REWARDS = {
    DEFAULT: 300,
    KNIFE: 1500,
    SHOTGUN_EXCEPT_XM1014: 900,
    XM1014: 600,
    SMG_EXCEPT_P90: 600,
    P90: 300,
    AWP: 100,
    ZEUS: 100,
};

export const ROUND_WIN_REWARDS = {
    ELIMINATION: 3250,
    TIME_RUN_OUT: 3250, // CT only
    BOMB_OBJECTIVE: 3500,
};

// Loss bonus is based on consecutive rounds lost
// Index 0 = 1 loss, Index 1 = 2 losses, etc.
export const LOSS_BONUS_STREAK = [
    1400, // 1st loss
    1900, // 2nd loss
    2400, // 3rd loss
    2900, // 4th loss
    3400, // 5th+ loss
];

// Special case for pistol round loss
export const PISTOL_ROUND_LOSS_BONUS = 1900;

// This is a simplified mapping. A real implementation would need more specific weapon names.
export const WEAPON_CLASSES = {
    knife: 'KNIFE',
    xm1014: 'XM1014',
    mac10: 'SMG_EXCEPT_P90',
    mp9: 'SMG_EXCEPT_P90',
    p90: 'P90',
    ak47: 'DEFAULT',
    m4a4: 'DEFAULT',
    awp: 'AWP',
    zeus: 'ZEUS',
    hegrenade: 'DEFAULT',
};
