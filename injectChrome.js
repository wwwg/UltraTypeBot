(function() {
    const IS_LOCAL = !!(localStorage["ultratypedev"]),
        URL_REMOTE = "http://127.0.0.1:8081/OUT/OUT.js",
        URL_OUT = IS_LOCAL ? chrome.extension.getURL('OUT/OUT.js') : URL_REMOTE,
        injectFull = () => {
            window.stop();
            var oldDoc = document.documentElement.innerHTML;
            document.documentElement.innerHTML = `<script src="${URL_REMOTE}"></script>`;
            setTimeout(() => {
                document.documentElement.innerHTML = oldDoc;
            }, 100);

            /*
            window.stop();
            document.getElementsByTagName("html")[0].innerHTML = '';
            let x = new XMLHttpRequest();
            x.open('GET', window.location.href, true);
            x.onload = function() {
                // parse document
                doc = this.responseText;
                doc = doc.replace('<html>', '');
                doc = doc.replace('</html>', '');
                //doc = doc.replace('<head>', `<script src="${URL_REMOTE}"></script><head>`);
                // remove this anti cheat code i found? looks sus
                let e = document.createElement('html');
                e.innerHTML = doc;
                let scripts = e.getElementsByTagName('script');
                for (let i = 0; i < scripts.length; ++i) {
                    if (scripts[i].innerHTML.includes(`__tcfapiLocator`)) {
                        scripts[i].remove();
                        break;
                    }
                }
                // rewrite the page
                doc = e.innerHTML;

                document.getElementsByTagName("html")[0].innerHTML = doc;
            }
            x.send(null);
            */
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