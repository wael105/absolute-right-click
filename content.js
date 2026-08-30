/* global InteractionUnlockerDomain */
(function () {
    "use strict";
    const siteKey = InteractionUnlockerDomain.getSiteKey(location.hostname);
    let settings = {
        enabled: false,
        selection: false,
        copy: false,
        rightClick: false,
        images: false,
        links: false,
    };

    function active(feature) {
        return settings.enabled && settings[feature];
    }
    function editableTarget(event) {
        const target = event.target;
        return (
            target instanceof Element &&
            (target.isContentEditable ||
                /^(INPUT|TEXTAREA|SELECT)$/i.test(target.tagName))
        );
    }
    function pathHas(event, selector) {
        return event
            .composedPath()
            .some((node) => node instanceof Element && node.matches(selector));
    }
    function mayUnlockContextMenu(event) {
        return (
            active("rightClick") ||
            (active("images") && pathHas(event, "img, picture, video")) ||
            (active("links") && pathHas(event, "a[href]"))
        );
    }
    function mayUnlockDrag(event) {
        return (
            (active("images") && pathHas(event, "img, picture, video")) ||
            (active("links") && pathHas(event, "a[href]"))
        );
    }
    function blockSiteHandler(event) {
        event.stopImmediatePropagation();
    }

    function onSelectStart(event) {
        if (active("selection") && !editableTarget(event))
            blockSiteHandler(event);
    }
    function onCopy(event) {
        if (active("copy") && !editableTarget(event))
            blockSiteHandler(event);
    }
    function onContextMenu(event) {
        if (mayUnlockContextMenu(event))
            blockSiteHandler(event);
    }
    function onDragStart(event) {
        if (mayUnlockDrag(event))
            blockSiteHandler(event);
    }

    // Window capture runs before document/page bubble listeners; document is a fallback.
    for (const target of [window, document]) {
        target.addEventListener("selectstart", onSelectStart, true);
        target.addEventListener("copy", onCopy, true);
        target.addEventListener("contextmenu", onContextMenu, true);
        target.addEventListener("dragstart", onDragStart, true);
    }

    chrome.runtime
        .sendMessage({ type: "initialize-settings", siteKey })
        .then((savedSettings) => (settings = { ...settings, ...savedSettings }))
        .catch(() => {});
})();
