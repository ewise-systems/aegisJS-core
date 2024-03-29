const { curry, chain, pipe } = require("ramda");
const { getUrl } = require("./getUrl");
const { callFetch, callXFetch } = require("./callFetch");

// requestToAegis :: string -> JWT string -> JSON string -> URLPath string -> Task a b
const requestToAegis = curry((method, jwt, body, timeout, path) =>
    pipe(
        getUrl(path),
        chain(callFetch(method, jwt, body, timeout))
    )
);

// requestToAegisOTA :: string -> { appId :: String, appSecret :: String, uname :: String, email :: String } -> JSON string -> URLPath string -> Task a b
const requestToAegisOTA = curry((method, xheaders, body, timeout, path) =>
    callXFetch(method, xheaders, body, timeout, path)
);

// requestToAegisWithToken :: { method :: string, jwt :: JWT string, body :: JSON string, path :: URLPath string } -> Task a b
const requestToAegisWithToken = (method, jwt, body, timeout, path, url) =>
    requestToAegis(method, jwt, body, timeout, path)(jwt || url);

// requestToAegisServerWithToken :: { method :: string, jwt :: JWT string, body :: JSON string, path :: URLPath string } -> Task a b
const requestToAegisServerWithToken = (method, jwt, body, timeout, url) =>
    callFetch(method, jwt, body, timeout, url);

module.exports = {
    requestToAegis,
    requestToAegisOTA,
    requestToAegisWithToken,
    requestToAegisServerWithToken
};