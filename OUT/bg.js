(function() {
	console.log('UltraType background page');
	const USE_LOCAL_DATA_SERVER = false;
    const DATA_ENDPOINT = "http://204.44.91.137:8283/baninfo";
    const DATA_ENDPOINT_LOCAL = "http://127.0.0.1:8283/baninfo";
    var debug = console.log;
    function sendBanInfo(state) {
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
    }
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    	if (sender.tab) {
    		console.log(request);
    		sendBanInfo(request);
    	}
  	});
})();