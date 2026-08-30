import {
    SETTINGS_PREFIX,
    FEATURES,
    normalizeSettings,
} from "../shared/settings.js";

const sitesElement = document.querySelector("#sites");
const statusElement = document.querySelector("#status");
const expandedSites = new Set();

const FEATURE_LABELS = {
    selection: "Text selection",
    copy: "Copy text",
    rightClick: "Right-click menu",
    images: "Images",
    links: "Links",
};

function setStatus(message) {
    statusElement.textContent = message;
}

async function getSites() {
    const stored = await chrome.storage.local.get(null);
    return Object.entries(stored)
        .filter(([key]) => key.startsWith(SETTINGS_PREFIX))
        .map(([key, value]) => ({
            key,
            hostname: key.slice(SETTINGS_PREFIX.length),
            settings: normalizeSettings(value),
        }))
        .sort((left, right) => left.hostname.localeCompare(right.hostname));
}

function button(text, className, onClick, disabled = false) {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = text;
    element.className = className;
    element.disabled = disabled;
    element.addEventListener("click", onClick);
    return element;
}

async function removeFeature(site, feature) {
    const settings = { ...site.settings, [feature]: false };
    await chrome.storage.local.set({ [site.key]: settings });
    setStatus(`${FEATURE_LABELS[feature]} removed for ${site.hostname}. Reload the page to apply changes.`);
    render();
}

async function removeSite(site) {
    await chrome.storage.local.remove(site.key);
    expandedSites.delete(site.key);
    setStatus(`All permissions removed for ${site.hostname}.`);
    render();
}

function createPermission(site, feature) {
    const item = document.createElement("li");
    item.className = "permission";

    const name = document.createElement("span");
    name.className = "permission-name";
    name.textContent = FEATURE_LABELS[feature];

    const permissionStatus = document.createElement("span");
    permissionStatus.className = "permission-status";
    permissionStatus.textContent = site.settings[feature] ? "Allowed" : "Removed";

    item.append(name, permissionStatus);
    item.append(button("Remove", "remove", () => removeFeature(site, feature), !site.settings[feature]));
    return item;
}

function createSite(site) {
    const article = document.createElement("article");
    article.className = "site";
    const isExpanded = expandedSites.has(site.key);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "site-toggle";
    toggle.setAttribute("aria-expanded", String(isExpanded));

    const hostname = document.createElement("span");
    hostname.className = "hostname";
    hostname.textContent = site.hostname;
    const siteStatus = document.createElement("span");
    siteStatus.className = "site-status";
    siteStatus.textContent = site.settings.enabled ? "Enabled" : "Disabled";
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = isExpanded ? "⌃" : "⌄";
    toggle.append(hostname, siteStatus, chevron);
    toggle.addEventListener("click", () => {
        if (expandedSites.has(site.key)) expandedSites.delete(site.key);
        else expandedSites.add(site.key);
        render();
    });
    article.append(toggle);

    if (isExpanded) {
        const panel = document.createElement("div");
        panel.className = "site-panel";
        const permissions = document.createElement("ul");
        permissions.className = "permissions";
        FEATURES.forEach((feature) => permissions.append(createPermission(site, feature)));
        panel.append(permissions);
        panel.append(button("Remove all permissions for this site", "remove-all", () => removeSite(site)));
        article.append(panel);
    }
    return article;
}

async function render() {
    const sites = await getSites();
    sitesElement.replaceChildren();
    if (!sites.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "No saved sites yet.";
        sitesElement.append(empty);
        return;
    }
    sites.forEach((site) => sitesElement.append(createSite(site)));
}

render().catch(() => setStatus("Unable to load saved sites."));
