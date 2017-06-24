(function() {
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
    window.addEventListener('message', function(evt) {
        if (evt.data.from && evt.data.state && evt.data.from === "UltraType") {
            var state = evt.data.state;
            console.log('I got a window message', state);
            sendBanInfo(state);
        }
    }, false);

    window.stop();
    var inject = new XMLHttpRequest();
    var URL_OUT = chrome.extension.getURL('OUT/OUT.js');
    inject.open("GET", "https://www.nitrotype.com/race", true);
    inject.onreadystatechange = function() {
        if (inject.readyState == 4) {
            document.open();
            document.write("<script src='" + URL_OUT + "'></script>" + this.responseText);
            document.close();
        }
    }
    inject.send();
})();