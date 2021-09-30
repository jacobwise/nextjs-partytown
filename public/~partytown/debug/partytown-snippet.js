!function(win, doc) {
    var config = win.partytown || {};
    var forward = config.forward || [];
    var script = doc.createElement("script");
    function createForwardFn(forwardProp) {
        return function() {
            (win._ptf = win._ptf || []).push(forwardProp, arguments);
        };
    }
    forward.map((forwardProp => {
        win[forwardProp[0]] = 1 === forwardProp[1] ? function(forwardProp, arr) {
            (arr = []).push = createForwardFn(forwardProp);
            return arr;
        }(forwardProp) : createForwardFn(forwardProp);
    }));
    script.async = script.defer = !0;
    script.src = (config.lib || "/~partytown/") + (config.debug ? "debug/" : "") + "partytown.js";
    doc.head.appendChild(script);
}(window, document);
