(function() {
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