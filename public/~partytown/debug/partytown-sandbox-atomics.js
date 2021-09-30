const len = obj => obj.length;

const getConstructorName = obj => obj && obj.constructor && obj.constructor.name || "";

const startsWith = (str, val) => str.startsWith(val);

const isValidMemberName = memberName => !startsWith(memberName, "webkit") && !startsWith(memberName, "toJSON") && (!startsWith(memberName, "on") || (str => str.toLowerCase())(memberName) !== memberName);

const TOP_WIN_ID = 1;

const forwardMsgResolves = new Map;

const mainInstanceIdByInstance = new WeakMap;

const mainInstances = [];

const winCtxs = new Map;

const windows = new WeakSet;

const getAndSetInstanceId = (winCtx, instance, instanceId) => {
    if (instance) {
        "number" != typeof (instanceId = (instance => {
            if (instance) {
                const nodeName = instance.nodeName;
                return "#document" === nodeName ? 4 : "HTML" === nodeName ? 5 : "HEAD" === nodeName ? 6 : "BODY" === nodeName ? 7 : mainInstanceIdByInstance.get(instance);
            }
            return -1;
        })(instance)) && setInstanceId(winCtx, instance, instanceId = (() => Math.round(9999999999 * Math.random() + 7))());
        return instanceId;
    }
    return -1;
};

const setInstanceId = (winCtx, instance, instanceId) => {
    if (instance) {
        mainInstances.push([ instanceId, instance ]);
        mainInstanceIdByInstance.set(instance, instanceId);
        winCtx.$cleanupInc$++;
        if (winCtx.$cleanupInc$ > 99) {
            winCtx.$cleanupInc$ = 0;
            while (1) {
                let disconnectedNodes = mainInstances.filter((i => i[1].nodeType && !i[1].isConnected));
                let i;
                let l;
                if (!(len(disconnectedNodes) > 99)) {
                    break;
                }
                for (i = 0, l = len(mainInstances); i < l; i++) {
                    if (!mainInstances[i][1].isConnected) {
                        mainInstances.slice(i, 1);
                        break;
                    }
                }
            }
        }
    }
};

const serializeForWorker = (winCtx, value, added, type, obj, key) => {
    if (void 0 !== value) {
        added = added || new Set;
        if ("string" === (type = typeof value) || "number" === type || "boolean" === type || null == value) {
            return [ 4, value ];
        }
        if ("function" === type) {
            return [ 2 ];
        }
        if (Array.isArray(value)) {
            if (!added.has(value)) {
                added.add(value);
                return [ 0, value.map((v => serializeForWorker(winCtx, v, added))) ];
            }
            return [ 0, [] ];
        }
        if ("object" === type) {
            if (value.nodeType) {
                return [ 1, {
                    $winId$: winCtx.$winId$,
                    $interfaceType$: value.nodeType,
                    $instanceId$: getAndSetInstanceId(winCtx, value),
                    $nodeName$: value.nodeName
                } ];
            }
            if (value === value.window) {
                return [ 1, {
                    $winId$: winCtx.$winId$,
                    $interfaceType$: 0,
                    $instanceId$: 0
                } ];
            }
            if (isNodeList(getConstructorName(value))) {
                return [ 1, {
                    $winId$: winCtx.$winId$,
                    $interfaceType$: 7,
                    $items$: Array.from(value).map((v => serializeForWorker(winCtx, v, added)[1]))
                } ];
            }
            obj = {};
            if (!added.has(value)) {
                added.add(value);
                for (key in value) {
                    isValidMemberName(key) && (obj[key] = serializeForWorker(winCtx, value[key], added));
                }
            }
            return [ 3, obj ];
        }
    }
};

const isNodeList = cstrName => "HTMLCollection" === cstrName || "NodeList" === cstrName;

const readNextScript = winCtx => {
    const $winId$ = winCtx.$winId$;
    const win = winCtx.$window$;
    const doc = win.document;
    const scriptElm = doc.querySelector('script[type="text/partytown"]:not([data-pt-id]):not([data-pt-error])');
    if (scriptElm) {
        const $instanceId$ = getAndSetInstanceId(winCtx, scriptElm, $winId$);
        const scriptData = {
            $winId$: $winId$,
            $instanceId$: $instanceId$
        };
        scriptElm.dataset.ptId = $winId$ + "." + $instanceId$;
        scriptElm.src ? scriptData.$url$ = scriptElm.src : scriptData.$content$ = scriptElm.innerHTML;
        winCtx.$worker$.postMessage([ 3, scriptData ]);
    } else if (!winCtx.$isInitialized$) {
        winCtx.$isInitialized$ = !0;
        win.frameElement && (win.frameElement._ptId = $winId$);
        ((winCtx, win) => {
            let existingTriggers = win._ptf;
            let forwardTriggers = win._ptf = [];
            let i = 0;
            forwardTriggers.push = ($forward$, $args$) => winCtx.$worker$.postMessage([ 7, {
                $winId$: winCtx.$winId$,
                $instanceId$: 0,
                $forward$: $forward$,
                $args$: serializeForWorker(winCtx, Array.from($args$))
            } ]);
            if (existingTriggers) {
                for (;i < len(existingTriggers); i += 2) {
                    forwardTriggers.push(existingTriggers[i], existingTriggers[i + 1]);
                }
            }
        })(winCtx, win);
        doc.dispatchEvent(new CustomEvent("ptinit"));
        ((winCtx, msg) => {
            {
                let prefix;
                prefix = winCtx.$winId$ === TOP_WIN_ID ? `Main (${winCtx.$winId$}) 🌎` : `Iframe (${winCtx.$winId$}) 👾`;
                console.debug.apply(console, [ `%c${prefix}`, "background: #717171; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;", msg ]);
            }
        })(winCtx, `Startup ${(performance.now() - winCtx.$startTime$).toFixed(1)}ms`);
    }
};

const readImplementationMembers = (impl, members) => {
    let memberName;
    let interfaceType;
    let value;
    let type;
    for (memberName in impl) {
        if (isValidMemberName(memberName)) {
            value = impl[memberName];
            type = typeof value;
            if ("function" === type) {
                members[memberName] = 2;
            } else if ("object" === type) {
                interfaceType = InterfaceWhitelist[getConstructorName(value)];
                interfaceType && (members[memberName] = interfaceType);
            }
        }
    }
    return members;
};

const InterfaceWhitelist = {
    CSSStyleDeclaration: 11,
    DOMStringMap: 5,
    DOMTokenList: 6,
    NamedNodeMap: 4,
    NodeList: 7
};

const onMessageFromWebWorker = (winCtx, msg) => {
    const msgType = msg[0];
    const doc = winCtx.$window$.document;
    if (0 === msgType) {
        const firstScriptId = getAndSetInstanceId(winCtx, doc.querySelector("script"));
        const mainInterfaces = ((win, doc) => {
            const docImpl = doc.implementation.createHTMLDocument();
            const docElement = docImpl.documentElement;
            return [ [ 0, win ], [ 9, docImpl ], [ 6, docElement.classList ], [ 1, docElement ], [ 8, win.history ], [ 7, docElement.childNodes ], [ 10, win.sessionStorage ], [ 3, docImpl.createTextNode("") ] ].map((([interfaceType, impl]) => [ interfaceType, readImplementationMembers(impl, {}) ]));
        })(winCtx.$window$, doc);
        const initWebWorkerData = {
            $winId$: winCtx.$winId$,
            $parentWinId$: winCtx.$parentWinId$,
            $config$: winCtx.$config$ || {},
            $documentCompatMode$: doc.compatMode,
            $documentCookie$: doc.cookie,
            $documentReadyState$: doc.readyState,
            $documentReferrer$: doc.referrer,
            $documentTitle$: doc.title,
            $firstScriptId$: firstScriptId,
            $interfaces$: mainInterfaces,
            $libPath$: new URL(winCtx.$libPath$, winCtx.$url$) + "",
            $url$: winCtx.$url$
        };
        winCtx.$worker$.postMessage([ 1, initWebWorkerData ]);
    } else if (3 === msgType) {
        readNextScript(winCtx);
    } else if (2 === msgType) {
        ((winCtx, doc, instanceId, errorMsg, script) => {
            (script = doc.querySelector('[data-pt-id="' + winCtx.$winId$ + "." + instanceId + '"]')) && (errorMsg ? script.dataset.ptError = errorMsg : script.type += "-init");
            readNextScript(winCtx);
        })(winCtx, doc, msg[1], msg[2]);
    } else if (6 === msgType) {
        const accessRsp = msg[1];
        const forwardMsgResolve = forwardMsgResolves.get(accessRsp.$msgId$);
        if (forwardMsgResolve) {
            forwardMsgResolves.delete(accessRsp.$msgId$);
            forwardMsgResolve(accessRsp);
            readNextScript(winCtx);
        }
    } else {
        8 === msgType && winCtxs.forEach((winCtx => winCtx.$worker$.postMessage(msg)));
    }
};

(async (sandboxWindow, winIds) => {
    const mainWindow = sandboxWindow.parent;
    const $config$ = mainWindow.partytown || {};
    const $libPath$ = $config$.lib || "/~partytown/";
    const registerWindow = win => {
        if (!windows.has(win)) {
            windows.add(win);
            const parentWin = win.parent;
            const winCtx = {
                $winId$: win._ptId = winIds++,
                $parentWinId$: parentWin._ptId,
                $cleanupInc$: 0,
                $config$: $config$,
                $libPath$: $libPath$,
                $url$: win.document.baseURI,
                $window$: win
            };
            winCtxs.set(winCtx.$winId$, winCtx);
            winCtx.$startTime$ = performance.now();
            setInstanceId(winCtx, win, 0);
            setInstanceId(winCtx, win.history, 1);
            setInstanceId(winCtx, win.localStorage, 2);
            setInstanceId(winCtx, win.sessionStorage, 3);
            (winCtx => {
                winCtx.$worker$ = new Worker("./partytown-ww-atomics.js", {
                    name: `Partytown (${winCtx.$winId$}) 🎉`
                });
                winCtx.$worker$.onmessage = ev => onMessageFromWebWorker(winCtx, ev.data);
            })(winCtx);
            win.addEventListener("load", (() => readNextScript(winCtx)));
        }
    };
    mainWindow._ptWin = registerWindow;
    await (async (sandboxWindow, _receiveMessage) => {
        console.log("ATOMICS ⚛️", sandboxWindow.location.href);
        return !0;
    })(sandboxWindow) && registerWindow(mainWindow);
})(window, TOP_WIN_ID);
