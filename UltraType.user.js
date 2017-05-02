// ==UserScript==
// @name         UltraType NitroType bot
// @version      2.1.0
// @downloadURL  https://rawgit.com/ultratype/UltraTypeBot/master/UltraType.user.js
// @updateURL    https://rawgit.com/ultratype/UltraTypeBot/master/UltraType.user.js
// @description  A fast, easy to use bot for NitroType.com
// @author       UltraType
// @match        https://www.nitrotype.com/race/*
// @match        https://www.nitrotype.com/race
// @match        http://www.nitrotype.com/race
// @match        http://www.nitrotype.com/race/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function() {
	"use strict";
	var OUT = "https://rawgit.com/ultratype/UltraTypeBot/master/OUT/OUT.js";
	var OUT_SCRIPT = "<script src='" + OUT + "'></script>\n";

	// Completely halt the loading of the window, to prevent the page from being loaded more than once
	window.stop();
	document.documentElement.innerHTML = null;

	// Request for the current document
	GM_xmlhttpRequest({
		method: "GET",
		url: window.location.href,
		onload: function(e) {
			// Write a modified page to the document
			var doc = e.responseText;
			document.open();
			document.write(OUT_SCRIPT + doc);
			document.close();
			// The extension script will now be loaded onto the document
		}
	})
})();