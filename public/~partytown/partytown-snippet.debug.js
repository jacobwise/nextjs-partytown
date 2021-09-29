!function() {
    "use strict";
    var win = window;
    var doc = document;
    var config = win.partytown || {};
    var script = doc.createElement("script");
    var target;
    win._ptf = [];
    (config.forward || []).map((forwardConfig => {
        target = win;
        forwardConfig.split(".").map(((forwardProp, index, arr) => {
            target = target[forwardProp] = index < arr.length - 1 ? target[forwardProp] || {} : function() {
                win._ptf.push(forwardConfig, arguments);
            };
        }));
    }));
    script.async = script.defer = !0;
    script.src = "/~partytown/partytown." + (config.debug ? "debug.js" : "js");
    doc.head.appendChild(script);
}();
