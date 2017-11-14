(function() {
    window.stop();
    document.documentElement.innerHTML = null;

    const IS_LOCAL = true,
        URL_REMOTE = "https://rawgit.com/ultratype/UltraTypeBot/master/OUT/OUT.js",
        URL_OUT = IS_LOCAL ? chrome.extension.getURL('OUT/OUT.js') : URL_REMOTE;
    let scr = document.createElement('script');
    scr.src = URL_OUT;
    document.head.appendChild(scr);
})();