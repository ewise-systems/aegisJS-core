const { curry, chain, pipe } = require("ramda");
const { rejected } = require("folktale/concurrency/task");
const { getUrl } = require("./getUrl");
const { callFetch, callXFetch } = require("./callFetch");
const { either } = require("../fpcore/pointfree");

// requestToAegis :: string -> JWT string -> JSON string -> URLPath string -> Task a b
const requestToAegis = curry((method, jwt, body, path) =>
    pipe(
        getUrl(path),
        either(
            rejected,
            chain(callFetch(method, jwt, body))
        )
    )
);

// requestToAegisOTA :: string -> { appId :: String, appSecret :: String, uname :: String, email :: String } -> JSON string -> URLPath string -> Task a b
const requestToAegisOTA = curry((method, xheaders, body, path) =>
    callXFetch(method, xheaders, body, path)
);

// requestToAegisWithToken :: { method :: string, jwt :: JWT string, body :: JSON string, path :: URLPath string } -> Task a b
const requestToAegisWithToken = (method, jwt, body, path, url) =>
    requestToAegis(method, jwt, body, path)(jwt || url);

// requestToAegisServerWithToken :: { method :: string, jwt :: JWT string, body :: JSON string, path :: URLPath string } -> Task a b
const requestToAegisServerWithToken = (method, jwt, body, url) =>
    callFetch(method, jwt, body, url);

module.exports = {
    requestToAegis,
    requestToAegisOTA,
    requestToAegisWithToken,
    requestToAegisServerWithToken
};