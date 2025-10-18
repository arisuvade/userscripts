// ==UserScript==
// @name         YouTube Recommended Min View Filter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Hide low-view videos (<100k) from YouTube homepage, sidebar, and recommendations
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const MIN_VIEWS = 100_000; // adjust this number if you want (e.g. 1_000_000)

  const parseViews = (text) => {
    if (!text) return 0;
    text = text.replace(/[^0-9KMB]/gi, '');
    let num = parseFloat(text);
    if (text.includes('K')) num *= 1_000;
    if (text.includes('M')) num *= 1_000_000;
    if (text.includes('B')) num *= 1_000_000_000;
    return num;
  };

  const hideLowViewVideos = () => {
    const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-compact-video-renderer, ytd-video-renderer');
    videos.forEach(vid => {
      const text = vid.innerText.match(/([\d,.]+[KMB]?) views/);
      if (text && parseViews(text[1]) < MIN_VIEWS) {
        vid.style.display = 'none';
      }
    });
  };

  const observer = new MutationObserver(hideLowViewVideos);
  observer.observe(document.body, { childList: true, subtree: true });
  hideLowViewVideos();
})();
