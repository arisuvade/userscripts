// ==UserScript==
// @name         Disable Number Keys When Video Present
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Disable number keys (0-9) when a visible video element exists on the page, but allow typing in inputs/textarea/contentEditable.
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function isTypingTarget(target) {
        if (!target) return false;
        const tn = target.tagName || "";
        if (tn === 'INPUT' || tn === 'TEXTAREA') return true;
        // some inputs have role=textbox but not tagName; fallback to checking editable
        if (target.isContentEditable) return true;
        return false;
    }

    // Returns true if at least one "visible" video element is present in the viewport or rendered on page
    function hasVisibleVideo() {
        const vids = document.querySelectorAll('video');
        if (!vids || vids.length === 0) return false;

        for (const v of vids) {
            try {
                // ignore videos that are removed/hidden
                const rect = v.getBoundingClientRect();
                const visibleRect = rect.width > 2 && rect.height > 2;
                const notHidden = getComputedStyle(v).display !== 'none' && getComputedStyle(v).visibility !== 'hidden' && v.offsetParent !== null;
                if (visibleRect && notHidden) return true;
            } catch (e) {
                // ignore cross-origin or detached ones
            }
        }
        return false;
    }

    // Fast path: cache last check for a tiny bit to avoid heavy calls on every keydown
    let lastCheck = 0;
    let lastHasVideo = false;
    const CACHE_MS = 250;

    window.addEventListener('keydown', function(e) {
        // allow modifier combos (Ctrl/Cmd/Alt) to function normally
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        // If target is typing field, allow it
        if (isTypingTarget(e.target)) return;

        const now = performance.now();
        if (now - lastCheck > CACHE_MS) {
            lastHasVideo = hasVisibleVideo();
            lastCheck = now;
        }

        if (!lastHasVideo) return; // no visible video -> do nothing

        // If it's a number key (0-9) from main row or numpad, block it
        // e.key will be '0'..'9' for main row, numpad keys may be '0'..'9' too
        if (/^[0-9]$/.test(e.key)) {
            e.stopImmediatePropagation();
            e.preventDefault();
            // optional: provide a tiny visual feedback? commented out
            // console.debug('Number key blocked because a video is present:', e.key);
        }
    }, true);

    // Also observe DOM changes so newly injected videos are recognised quickly
    const observer = new MutationObserver(() => {
        // invalidate cache so next keydown re-checks
        lastCheck = 0;
    });
    observer.observe(document.documentElement || document, { childList: true, subtree: true });

})();
