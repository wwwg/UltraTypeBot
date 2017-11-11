(function() {
    window.stop();
    document.documentElement.innerHTML = null;

    const IS_LOCAL = false,
        URL_REMOTE = "https://rawgit.com/ultratype/UltraTypeBot/master/OUT/OUT.js",
        URL_OUT = IS_LOCAL ? chrome.extension.getURL('OUT/OUT.js') : URL_REMOTE,
        SCRIPT_OUT = "<script src='" + URL_OUT + "'></script>\n";
    let loader = new XMLHttpRequest();
    loader.open("GET", location.href, true);
    loader.onreadystatechange = function() {
        if (loader.readyState == 4) {
            const doc = `${SCRIPT_OUT}${this.responseText}`;
            document.open();
            document.write(doc);
            document.close();
        }
    }
    loader.send();
})();