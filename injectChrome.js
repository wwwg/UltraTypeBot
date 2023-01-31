(function() {
    const IS_LOCAL = !!(localStorage["ultratypedev"]),
        URL_REMOTE = "http://127.0.0.1:8081/OUT/OUT.js",
        URL_OUT = IS_LOCAL ? chrome.extension.getURL('OUT/OUT.js') : URL_REMOTE,
        injectFull = () => {
            let x = new XMLHttpRequest();
            x.open('GET', window.location.href, true);
            x.onload = function() {
                setTimeout(() => {
                    document.write(`<script src="${URL_REMOTE}"></script>`+this.responseText);
                }, 500);
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
    console.log('ultratypebot:PREINIT: determening injection method');
    if (window.location.href.includes('nitrotype.com/race')) {
        // Use full injection method on the main page
        console.log('ultratypebot:PREINIT: full!');
        injectFull();
        return;
    }  else {
        // Slower append injection method is used
        console.log('ultratypebot:PREINIT: appending');
        injectAppend();
    }
})();