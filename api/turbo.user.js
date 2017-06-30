// ==UserScript==
// @name         UltraType Turbo Mode
// @version      1
// @description  Instantly wins any NitroType race without fail
// @author       You
// @match        https://www.nitrotype.com/race
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

// TO USE THIS SAMPLE SCRIPT, PASTE IT IN THE TAMPERMONKEY ADD SCRIPT BOX.

function start() {
	// Stop UltraType from running, but allow the API to still be used
    UltraTypeCore.stopFromRunning();
    UltraTypeCore.on('raceStart', () => { // Detect when the race has started
    	console.log('Race has started, activating turbo mode!');
    	UltraTypeCore.turbo(); // Activate turbo mode
    }).on('raceFinish', () => { // Detect when the race has finished
    	// Auto refresh the page
    	console.log('Race has finished, reloading!');
    	location.reload();
    });
}
(function() {
    'use strict';
    // Loop until UltraType has preloaded, then fire the start() function
    setInterval(() => {
        if (unsafeWindow["UltraTypeCore"]) {
            start();
            clearInterval(this);
        }
    }, 100);
})();