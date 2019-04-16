require('whatwg-fetch');
// @ts-ignore
const { concat, curry } = require("ramda/es");
// @ts-ignore
const Task = require("../structs/Task");
// @ts-ignore
const Identity = require("../structs/Identity");
// @ts-ignore
const Maybe = require("../structs/Maybe");
// @ts-ignore
const { liftA3 } = require("../fpcore/liftA");
// @ts-ignore
const { addProp } = require("../fpcore/pointfree");

interface FetchOptions {
    method: string;
    headers?: {
        "Content-Type": string;
        "Authorization": string;
        [key: string]: any;
    };
    body?: any;
}

const sendRequest = curry((url, method, token, body) =>
    new Task((reject, result) =>
        fetch(url, {...method, headers: {...token}, ...body})
        .then(async response => {
            console.log('inputs', {...method, headers: {...token}, ...body});
            console.log('response', response);
            const data = await response.json();
            console.log('data', data);
            return response.status === 200 ? result(data) : reject(data);
        })
        .catch(reject)
    )
);

const addMethod = curry((method: string, obj: FetchOptions) =>
    Maybe.of(method).map(addProp(obj, 'method')).fold({})
);

const addAuthHeader = curry((token: string, obj: FetchOptions) =>
    Maybe.of(token).map(concat('Bearer ')).map(addProp(obj, 'Authorization')).map(x => ({ ...x, "Content-Type": "application/json" })).fold({})
);

const addBody = curry((body: string, obj: FetchOptions) =>
    Maybe.of(body).map(JSON.stringify).map(addProp(obj, 'body')).fold({})
);

// @ts-ignore
const callFetch = curry((url: string, method: string, token: string, body: any) =>
    liftA3(
        sendRequest(url),
        addMethod(method),
        addAuthHeader(token),
        addBody(body),
        Identity.of({})
    )
    .fold()
);

// @ts-ignore
module.exports = {
    sendRequest,
    addMethod,
    addAuthHeader,
    addBody,
    callFetch
};