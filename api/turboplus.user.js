// ==UserScript==
// @name         UltraType Aggresive Turbo Mode
// @version      1
// @description  Instantly wins any NitroType race without fail, extremely quickly. REQUIRES THE ULTRATYPE CHROME EXTENSION
// @author       UltraTypeBot
// @match        https://www.nitrotype.com/race/*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    function start() {
        UltraTypeCore.on('raceStart', () => {
            setTimeout(() => {
                // Send an insanely mutated type packet that instantly wins the race
                UltraTypeCore.sendTypePacket(true, 99999);
            }, 100);
        }).on('raceFinish', () => {
            // Auto refresh the page
            setTimeout(location.reload.bind(window.location), 2);
        });
    }
    setInterval(() => {
        if (unsafeWindow["UltraTypeCore"]) {
            start(); // Call when UltraType is loaded
            clearInterval(this);
            return;
        }
    }, 100);
})();