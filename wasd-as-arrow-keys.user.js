// ==UserScript==
// @name         WASD as Arrow Keys (with YouTube volume support)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Use W, A, S, D as Arrow Keys — including volume control on YouTube and other video players
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const map = {
        'w': 'ArrowUp',
        'a': 'ArrowLeft',
        's': 'ArrowDown',
        'd': 'ArrowRight'
    };

    function isTypingTarget(el) {
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    }

    window.addEventListener('keydown', e => {
        if (isTypingTarget(e.target)) return;

        const key = e.key.toLowerCase();
        if (!map[key]) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        const newKey = map[key];

        // find active video
        const video = document.querySelector('video');

        if (video) {
            switch (newKey) {
                case 'ArrowUp':
                    // Volume up
                    video.volume = Math.min(video.volume + 0.05, 1);
                    break;
                case 'ArrowDown':
                    // Volume down
                    video.volume = Math.max(video.volume - 0.05, 0);
                    break;
                case 'ArrowLeft':
                    // Seek back 5 seconds
                    video.currentTime = Math.max(video.currentTime - 5, 0);
                    break;
                case 'ArrowRight':
                    // Seek forward 5 seconds
                    video.currentTime = Math.min(video.currentTime + 5, video.duration);
                    break;
            }
        } else {
            // fallback: trigger actual arrow key event for non-video uses (like scrolling, etc.)
            const evt = new KeyboardEvent('keydown', {
                key: newKey,
                code: newKey,
                bubbles: true
            });
            document.dispatchEvent(evt);
        }
    }, true);
})();
