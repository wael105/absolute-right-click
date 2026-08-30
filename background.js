import { settingsKey, normalizeSettings } from "./shared/settings.js";

async function getSettings(siteKey) {
    try {
        const key = settingsKey(siteKey);
        const stored = await chrome.storage.local.get(key);
        return normalizeSettings(stored[key]);
    } catch {
        return normalizeSettings();
    }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "initialize-settings" || !message.siteKey) {
        return;
    }
    getSettings(message.siteKey).then((settings) => {
        sendResponse(settings);
        if (settings.enabled && settings.selection) {
            chrome.scripting
                .insertCSS({
                    target: {
                        tabId: sender.tab.id,
                        frameIds: [sender.frameId],
                    },
                    files: ["selection.css"],
                    origin: "USER",
                })
                .catch(() => {});
        }
    });
    return true;
});