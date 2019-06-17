const axios = require("axios");
const Maybe = require("folktale/maybe");
const { compose, concat, curry, toString, prop, replace } = require("ramda");
const { task } = require("folktale/concurrency/task");
const { liftA3m } = require("../fpcore/liftA");
const { addProp, appendProp } = require("../fpcore/pointfree");
const { safeASCIIToBase64 } = require("../fpcore/safeOps");

// sendRequest :: string -> {method: string} -> {token: string} -> {data: {k: v}} -> Task a b
const sendRequest = curry((url, method, token, data) =>
    task(({reject, resolve}) =>
        axios({
            url, ...method, headers: { ...token },  ...data
        })
        .then(compose(resolve, prop("data")))
        .catch(compose(reject, prop("data"), prop("response")))
    )
);

// addMethod :: string -> {j: u} -> {method: string}
const addMethod = curry((method, obj) =>
    Maybe
    .Just(method)
    .map(addProp(obj, "method"))
    .getOrElse({})
);

// addAuthHeader :: string -> {j: u} -> {token: string}
const addAuthHeader = curry((token, obj) =>
    Maybe
    .Just(token)
    .map(toString)
    .map(replace(/\"/g, ""))
    .map(concat("Bearer "))
    .map(addProp(obj, "Authorization"))
    .map(x => ({ ...x, "Content-Type": "application/json" }))
    .getOrElse({})
);

// addOTAHeader :: { appId :: String, appSecret :: String, uname :: String, email :: String } -> {j: u} -> {token: string}
const addOTAHeader = curry(({appId, appSecret, uname, email}, obj) =>
    Maybe
    .Just(`${appId}:${appSecret}`)
    .chain(safeASCIIToBase64)
    .map(addProp(obj, "X-Authorization"))
    .map(appendProp("X-Username", uname))
    .map(appendProp("X-Email", email))
    .map(x => ({ ...x, "Content-Type": "application/json" }))
    .getOrElse({})
);

// addData :: {k: v} -> {j: u} -> {data: {k: v}}
const addData = curry((data, obj) =>
    Maybe
    .Just(data)
    .map(JSON.stringify)
    .map(addProp(obj, "data"))
    .getOrElse({})
);

// callFetch :: string -> string -> {k: v} -> string -> Task a b
const callFetch = curry((method, token, data, url) =>
    liftA3m(
        sendRequest(url),
        addMethod(method),
        addAuthHeader(token),
        addData(data),
        Maybe.Just({})
    )
    .getOrElse(null)
);

// callFetchOTA :: string -> { appId :: String, appSecret :: String, uname :: String, email :: String } -> {k: v} -> string -> Task a b
const callXFetch = curry((method, xheaders, data, url) =>
    liftA3m(
        sendRequest(url),
        addMethod(method),
        addOTAHeader(xheaders),
        addData(data),
        Maybe.Just({})
    )
    .getOrElse(null)
);

module.exports = {
    sendRequest,
    addMethod,
    addAuthHeader,
    addData,
    callFetch,
    callXFetch
};