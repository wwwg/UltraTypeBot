(function() {
	console.log('UltraType background page');
	const USE_LOCAL_DATA_SERVER = false;
    const DATA_ENDPOINT = null;
    const DATA_ENDPOINT_LOCAL = null;
    var debug = console.log;
    function sendBanInfo(state) {
        /*
        if (typeof state !== "string") {
            debug("WARN: not sending invalid bot state.");
            return;
        }
        var xhr = new XMLHttpRequest();
        if (USE_LOCAL_DATA_SERVER) {
            xhr.open("POST", DATA_ENDPOINT_LOCAL, true);
        } else {
            xhr.open("POST", DATA_ENDPOINT, true);
        }
        xhr.send(state);
        xhr.onload = function() {
            debug("Ban info sent successfully");
        }
        xhr.onerror = function(e) {
            debug("Ban info could not be sent", e);
        }
        */
        console.warn('Ban information transmission has been disabled. State:', state);
    }
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    	if (sender.tab) {
    		sendBanInfo(request);
    	}
  	});
})();