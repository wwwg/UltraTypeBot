(function() {
    window.stop();

    var IS_LOCAL = false;
    var URL_OUT;
    var inject = new XMLHttpRequest();
    if (IS_LOCAL) {
        URL_OUT = chrome.extension.getURL('OUT/OUT.js');
    } else {
        URL_OUT = "https://rawgit.com/ultratype/UltraTypeBot/master/OUT/OUT.js";
    }
    inject.open("GET", "https://www.nitrotype.com/race", true);
    inject.onreadystatechange = function() {
        if (inject.readyState == 4) {
            document.open();
            document.write("<script src='" + URL_OUT + "'></script>" + this.responseText);
            document.close();
            window.addEventListener('message', function(evt) {
                if (evt.data.from && evt.data.state && evt.data.from === "UltraType") {
                    var state = evt.data.state;
                    chrome.runtime.sendMessage(state, function(){});
                }
            }, false);
        }
    }
    inject.send();
})();