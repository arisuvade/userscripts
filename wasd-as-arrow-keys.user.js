// ==UserScript==
// @name         WASD as Arrow Keys (with YouTube volume support, Reddit-safe)
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Use W, A, S, D as Arrow Keys — including volume control on YouTube and other video players, but disabled on Reddit
// @match        *://*/*
// @exclude      *://www.reddit.com/*
// @exclude      *://old.reddit.com/*
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

        const video = document.querySelector('video');

        if (video) {
            switch (newKey) {
                case 'ArrowUp':
                    video.volume = Math.min(video.volume + 0.05, 1);
                    break;
                case 'ArrowDown':
                    video.volume = Math.max(video.volume - 0.05, 0);
                    break;
                case 'ArrowLeft':
                    video.currentTime = Math.max(video.currentTime - 5, 0);
                    break;
                case 'ArrowRight':
                    video.currentTime = Math.min(video.currentTime + 5, video.duration);
                    break;
            }
        } else {
            const evt = new KeyboardEvent('keydown', {
                key: newKey,
                code: newKey,
                bubbles: true
            });
            document.dispatchEvent(evt);
        }
    }, true);
})();
