!function(win, doc, nav, libPath, sandbox, scripts, timeout) {
    function ready(msgType) {
        if (!sandbox) {
            (sandbox = doc.createElement("iframe")).dataset.partytown = "sandbox";
            sandbox.setAttribute("style", "display:block;width:0;height:0;border:0;visibility:hidden");
            sandbox.setAttribute("aria-hidden", "true");
            sandbox.src = libPath + "partytown-sandbox-" + msgType + ".html?" + Date.now();
            doc.body.appendChild(sandbox);
        }
    }
    function fallback(i, script) {
        console.warn("Partytown script fallback");
        clearTimeout(timeout);
        sandbox = 1;
        for (i = 0; i < scripts.length; i++) {
            (script = doc.createElement("script")).innerHTML = scripts[i].innerHTML;
            doc.body.appendChild(script);
        }
    }
    libPath = (win.partytown || {}).lib || "/~partytown/";
    libPath += "debug/";
    scripts = doc.querySelectorAll('script[type="text/partytown"]');
    if (location !== parent.location) {
        parent._ptWin(win);
    } else if (scripts.length) {
        timeout = setTimeout(fallback, 6e4);
        doc.addEventListener("ptinit", (function() {
            clearTimeout(timeout);
        }));
        win.crossOriginIsolated ? ready("atomics") : "serviceWorker" in nav ? nav.serviceWorker.register(libPath + "partytown-sw.js", {
            scope: libPath
        }).then((function(swRegistration) {
            swRegistration.active ? ready("sw") : swRegistration.installing ? swRegistration.installing.addEventListener("statechange", (function(ev) {
                "activated" === ev.target.state && ready("sw");
            })) : console.warn(swRegistration);
        }), (function(e) {
            console.error(e);
        })) : fallback();
    }
}(window, document, navigator);
