export const SETTINGS_PREFIX = "site:";
export const FEATURES = ["selection", "copy", "rightClick", "images", "links"];

export const DEFAULT_SITE_SETTINGS = Object.freeze({
    enabled: false,
    selection: false,
    copy: false,
    rightClick: false,
    images: false,
    links: false,
});

export function settingsKey(siteKey) {
    return `${SETTINGS_PREFIX}${siteKey}`;
}

export function normalizeSettings(value) {
    return { ...DEFAULT_SITE_SETTINGS, ...(value || {}) };
}

export function allFeaturesEnabled(settings) {
    return FEATURES.every((feature) => settings[feature]);
}
