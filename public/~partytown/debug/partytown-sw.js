const resolves = new Map;

const swMessageError = (accessReq, err) => ({
    $winId$: accessReq.$winId$,
    $msgId$: accessReq.$msgId$,
    $tasks$: [],
    $errors$: [ err ]
});

const httpRequestFromWebWorker = (self, req) => new Promise((async resolve => {
    const accessReq = await req.clone().json();
    const responseData = await ((self, accessReq) => new Promise((async resolve => {
        const client = [ ...await self.clients.matchAll() ].sort(((a, b) => a.url > b.url ? -1 : a.url < b.url ? 1 : 0))[0];
        if (client) {
            const msgResolve = [ resolve, setTimeout((() => {
                resolves.delete(accessReq.$msgId$);
                resolve(swMessageError(accessReq, "Timeout"));
            }), 12e4) ];
            resolves.set(accessReq.$msgId$, msgResolve);
            client.postMessage(accessReq);
        } else {
            resolve(swMessageError(accessReq, "No Party"));
        }
    })))(self, accessReq);
    resolve(response(JSON.stringify(responseData), "application/json"));
}));

const response = (body, contentType) => new Response(body, {
    headers: {
        "content-type": contentType || "text/html",
        "Cache-Control": "no-store"
    }
});

const swSelf = self;

swSelf.oninstall = () => swSelf.skipWaiting();

swSelf.onactivate = () => swSelf.clients.claim();

swSelf.onmessage = ev => {
    const accessRsp = ev.data;
    const r = resolves.get(accessRsp.$msgId$);
    if (r) {
        resolves.delete(accessRsp.$msgId$);
        clearTimeout(r[1]);
        r[0](accessRsp);
    }
};

swSelf.onfetch = ev => ((self, ev) => {
    const req = ev.request;
    const pathname = new URL(req.url).pathname;
    pathname.endsWith("debug/partytown-sandbox-sw.html") ? ev.respondWith(response('<!DOCTYPE html><html><head><meta charset="utf-8"><script src="./partytown-sandbox-sw.js"><\/script></head></html>')) : pathname.endsWith("proxytown") && ev.respondWith(httpRequestFromWebWorker(self, req));
})(swSelf, ev);
