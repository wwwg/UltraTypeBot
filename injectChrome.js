(function() {
    const IS_LOCAL = !!(localStorage["ultratypedev"]),
        URL_REMOTE = "https://rawgit.com/ultratype/UltraTypeBot/master/OUT/OUT.js",
        URL_OUT = IS_LOCAL ? chrome.extension.getURL('OUT/OUT.js') : URL_REMOTE,
        injectFull = () => {
            window.stop();
            let x = new XMLHttpRequest();
            x.open('GET', window.location.href, true);
            x.onload = function() {
                const doc = `<script src="${URL_OUT}"></script>\n${this.responseText}`;
                document.open();
                document.write(doc);
                document.close();
            }
            x.send(null);
        },
        injectAppend = () => {
            let scr = document.createElement('script');
            scr.src = URL_OUT;
            if (document.head) {
                document.head.appendChild(scr);
            } else {
                // Retry after about 100 ms
                setTimeout(injectAppend, 100);
            }
        };
    if (window.location.href.includes('nitrotype.com/race')) {
        // Use full injection method on the main page
        injectFull();
        return;
    }  else {
        // Slower append injection method is used
        injectAppend();
    }
})();