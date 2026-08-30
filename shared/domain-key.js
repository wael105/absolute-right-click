(function (global) {
    "use strict";

    function getSiteKey(hostname) {
        return (
            String(hostname || "")
                .trim()
                .toLowerCase()
                .replace(/\.$/, "") || null
        );
    }

    const api = { getSiteKey };
    global.InteractionUnlockerDomain = api;
})(globalThis);
