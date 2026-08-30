import {
    SETTINGS_PREFIX,
    FEATURES,
    normalizeSettings,
    allFeaturesEnabled,
} from "../shared/settings.js";

const $ = (selector) => document.querySelector(selector);
const controls = $("#controls");
const unavailable = $("#unavailable");
const siteName = $("#site-name");
const enabled = $("#enabled");
const featureSet = $("#features");
const enableAll = $("#enable-all");
const reload = $("#reload");
const manageSites = $("#manage-sites");
const status = $("#status");
let tab;
let siteKey;
let settings;
let pendingSave = Promise.resolve();

function showStatus(message) {
    status.textContent = message;
}
function render() {
    enabled.checked = settings.enabled;
    featureSet.disabled = !settings.enabled;
    document.querySelectorAll("[data-feature]").forEach((input) => {
        input.checked = settings[input.dataset.feature];
    });
    enableAll.disabled = settings.enabled && allFeaturesEnabled(settings);
}
function persist() {
    reload.hidden = false;
    const savedSettings = { ...settings };
    pendingSave = pendingSave.then(async () => {
        await chrome.storage.local.set({
            [`${SETTINGS_PREFIX}${siteKey}`]: savedSettings,
        });
        showStatus("Saved. Reload the page to apply changes.");
        render();
    });
    return pendingSave;
}
async function init() {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    let url;
    try {
        url = new URL(tab.url);
    } catch {
        // Invalid URL
    }
    if (!url || !/^https?:$/.test(url.protocol)) {
        siteName.textContent = tab.url || "Unavailable page";
        unavailable.hidden = false;
        return;
    }
    siteKey = globalThis.InteractionUnlockerDomain.getSiteKey(url.hostname);
    siteName.textContent = siteKey;

    const stored = await chrome.storage.local.get(
        `${SETTINGS_PREFIX}${siteKey}`,
    );
    settings = normalizeSettings(stored[`${SETTINGS_PREFIX}${siteKey}`]);
    controls.hidden = false;
    render();
}
enabled.addEventListener("change", () => {
    settings.enabled = enabled.checked;
    persist();
});
document.querySelectorAll("[data-feature]").forEach((input) =>
    input.addEventListener("change", () => {
        settings[input.dataset.feature] = input.checked;
        persist();
    }),
);
enableAll.addEventListener("click", () => {
    settings = {
        ...settings,
        enabled: true,
        ...Object.fromEntries(FEATURES.map((feature) => [feature, true])),
    };
    persist();
});
reload.addEventListener("click", async () => {
    if (!tab?.id) return;
    await pendingSave;
    await chrome.tabs.reload(tab.id);
    window.close();
});
manageSites.addEventListener("click", () => chrome.runtime.openOptionsPage());
init().catch(() => {
    siteName.textContent = "Unable to read this page";
    unavailable.hidden = false;
});
